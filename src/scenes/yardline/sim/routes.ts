import { length2, lerpAngle } from '../../../lib/math.ts'
import { APRON_Z, DOCK_ARC_R, DOCK_Z, LOOP_Z } from './geom.ts'

export type PathAction = 'pickup' | 'dropoff' | 'dock' | 'undock'

export type Waypoint = {
  x: number
  z: number
  reverse?: boolean
  wait?: number
  action?: PathAction
  task?: string
  arc?: boolean
}

export type PathSample = {
  x: number
  z: number
  heading: number
  reverse: boolean
  s: number
}

export type PathEvent = {
  s: number
  wait: number
  action?: PathAction
  task: string
  reverse: boolean
}

export type CompiledRoute = {
  samples: PathSample[]
  events: PathEvent[]
  length: number
}

function wrapAngle(a: number) {
  let x = a
  while (x > Math.PI) x -= Math.PI * 2
  while (x < -Math.PI) x += Math.PI * 2
  return x
}

function pushPoint(out: { x: number; z: number; reverse: boolean; arc?: boolean }[], x: number, z: number, reverse: boolean, arc = false) {
  const last = out[out.length - 1]
  if (last && Math.hypot(last.x - x, last.z - z) < 0.04) return
  out.push({ x, z, reverse, arc })
}

function filletWaypoints(nodes: Waypoint[], radius: number) {
  const raw = nodes.map((n) => ({
    x: n.x,
    z: n.z,
    reverse: Boolean(n.reverse),
    sharp: Boolean(n.action) || Boolean(n.reverse) || Boolean(n.arc),
    arc: Boolean(n.arc),
  }))
  if (raw.length < 3) return raw
  const out: { x: number; z: number; reverse: boolean; arc?: boolean }[] = []
  pushPoint(out, raw[0].x, raw[0].z, raw[0].reverse, raw[0].arc)
  for (let i = 1; i < raw.length - 1; i += 1) {
    const a = raw[i - 1]
    const b = raw[i]
    const c = raw[i + 1]
    const inLen = length2(b.x - a.x, b.z - a.z)
    const outLen = length2(c.x - b.x, c.z - b.z)
    if (b.arc || a.arc || inLen < 0.2 || outLen < 0.2) {
      pushPoint(out, b.x, b.z, b.reverse, b.arc)
      continue
    }
    const ix = (b.x - a.x) / inLen
    const iz = (b.z - a.z) / inLen
    const ox = (c.x - b.x) / outLen
    const oz = (c.z - b.z) / outLen
    const cross = ix * oz - iz * ox
    const dot = Math.max(-1, Math.min(1, ix * ox + iz * oz))
    const turn = Math.acos(dot)
    const reverseChange = a.reverse !== b.reverse || b.reverse !== c.reverse
    if (b.sharp || reverseChange || Math.abs(cross) < 0.02 || turn < 0.18 || turn > 2.4) {
      pushPoint(out, b.x, b.z, b.reverse, b.arc)
      continue
    }
    const half = turn / 2
    const dist = Math.min(radius / Math.tan(half), inLen * 0.45, outLen * 0.45)
    const r = dist * Math.tan(half)
    const t1x = b.x - ix * dist
    const t1z = b.z - iz * dist
    const t2x = b.x + ox * dist
    const t2z = b.z + oz * dist
    const sign = cross > 0 ? 1 : -1
    const cx = t1x - iz * r * sign
    const cz = t1z + ix * r * sign
    const start = Math.atan2(t1x - cx, t1z - cz)
    const sweep = turn * -sign
    const steps = Math.max(6, Math.round((r * Math.abs(sweep)) / 0.28))
    pushPoint(out, t1x, t1z, b.reverse)
    for (let s = 1; s < steps; s += 1) {
      const ang = start + (sweep * s) / steps
      pushPoint(out, cx + Math.sin(ang) * r, cz + Math.cos(ang) * r, b.reverse)
    }
    pushPoint(out, t2x, t2z, b.reverse)
  }
  const last = raw[raw.length - 1]
  pushPoint(out, last.x, last.z, last.reverse, last.arc)
  return out
}

function headingOf(dx: number, dz: number, reverse: boolean) {
  const move = Math.atan2(dx, dz)
  return wrapAngle(reverse ? move + Math.PI : move)
}

function appendStraight(
  samples: PathSample[],
  from: { x: number; z: number },
  to: { x: number; z: number },
  reverse: boolean,
  s: number,
) {
  const span = length2(to.x - from.x, to.z - from.z)
  const heading = headingOf(to.x - from.x, to.z - from.z, reverse)
  const steps = Math.max(1, Math.round(span / 0.28))
  for (let k = 1; k <= steps; k += 1) {
    const t = k / steps
    s += span / steps
    samples.push({
      x: from.x + (to.x - from.x) * t,
      z: from.z + (to.z - from.z) * t,
      heading,
      reverse,
      s,
    })
  }
  return s
}

function appendQuarterArc(
  samples: PathSample[],
  from: { x: number; z: number },
  to: { x: number; z: number },
  reverse: boolean,
  s: number,
) {
  const cx = Math.abs(from.x - to.x) > 0.05 && Math.abs(from.z - to.z) > 0.05 ? from.x : to.x
  const cz = cx === from.x ? to.z : from.z
  const r = length2(from.x - cx, from.z - cz)
  let a0 = Math.atan2(from.x - cx, from.z - cz)
  let a1 = Math.atan2(to.x - cx, to.z - cz)
  let sweep = wrapAngle(a1 - a0)
  if (Math.abs(sweep) < 0.05) return s
  const steps = Math.max(10, Math.round((r * Math.abs(sweep)) / 0.22))
  for (let k = 1; k <= steps; k += 1) {
    const t = k / steps
    const ang = a0 + sweep * t
    const x = cx + Math.sin(ang) * r
    const z = cz + Math.cos(ang) * r
    const prev = samples[samples.length - 1]
    const ds = length2(x - prev.x, z - prev.z)
    s += ds
    samples.push({
      x,
      z,
      heading: headingOf(x - prev.x, z - prev.z, reverse),
      reverse,
      s,
    })
  }
  return s
}

export function compileRoute(nodes: Waypoint[], radius: number): CompiledRoute {
  const densified = filletWaypoints(nodes, radius)
  const samples: PathSample[] = []
  let s = 0
  if (densified.length) {
    const nxt = densified[Math.min(1, densified.length - 1)]
    samples.push({
      x: densified[0].x,
      z: densified[0].z,
      heading: headingOf(nxt.x - densified[0].x, nxt.z - densified[0].z, densified[0].reverse || nxt.reverse),
      reverse: densified[0].reverse,
      s: 0,
    })
  }
  for (let i = 1; i < densified.length; i += 1) {
    const prev = densified[i - 1]
    const p = densified[i]
    if (p.arc) s = appendQuarterArc(samples, prev, p, p.reverse, s)
    else s = appendStraight(samples, prev, p, p.reverse, s)
  }
  const events: PathEvent[] = []
  let cursor = 0
  for (const node of nodes) {
    let best = samples[cursor] ?? samples[0]
    let bestD = Infinity
    for (let i = cursor; i < samples.length; i += 1) {
      const d = length2(samples[i].x - node.x, samples[i].z - node.z)
      if (d < bestD) {
        best = samples[i]
        bestD = d
        cursor = i
      }
      if (d < 0.06) break
    }
    events.push({
      s: best.s,
      wait: node.wait ?? 0,
      action: node.action,
      task: node.task ?? '',
      reverse: Boolean(node.reverse),
    })
  }
  return { samples, events, length: s }
}

export function sampleAt(route: CompiledRoute, s: number): PathSample {
  const clamped = Math.max(0, Math.min(s, route.length))
  const pts = route.samples
  if (pts.length === 1) return pts[0]
  let i = 0
  while (i < pts.length - 2 && pts[i + 1].s < clamped) i += 1
  const a = pts[i]
  const b = pts[Math.min(i + 1, pts.length - 1)]
  const span = Math.max(0.0001, b.s - a.s)
  const t = (clamped - a.s) / span
  return {
    x: a.x + (b.x - a.x) * t,
    z: a.z + (b.z - a.z) * t,
    heading: lerpAngle(a.heading, b.heading, t),
    reverse: t > 0.5 ? b.reverse : a.reverse,
    s: clamped,
  }
}

export function remainingPoints(route: CompiledRoute, s: number): [number, number, number][] {
  const start = sampleAt(route, s)
  const pts: [number, number, number][] = [[start.x, 0.07, start.z]]
  for (const sample of route.samples) {
    if (sample.s <= s + 0.2) continue
    pts.push([sample.x, 0.07, sample.z])
    if (pts.length >= 36) break
  }
  return pts
}

function reverseDock(bayX: number, label: string, dwell: number): Waypoint[] {
  const r = DOCK_ARC_R
  return [
    { x: bayX + r, z: APRON_Z, wait: 0.16, action: 'dock', task: `Align on ${label}` },
    { x: bayX, z: APRON_Z - r, wait: 0.04, reverse: true, arc: true, task: `Reverse swing ${label}` },
    { x: bayX, z: DOCK_Z, wait: dwell, reverse: true, action: 'dock', task: label.startsWith('Bay 4') ? `Loading at ${label}` : `Unloading at ${label}` },
  ]
}

function pullOut(bayX: number): Waypoint[] {
  const r = DOCK_ARC_R
  return [
    { x: bayX, z: APRON_Z - r, wait: 0.1, action: 'undock', task: 'Pull clear' },
    { x: bayX + r, z: APRON_Z, wait: 0.08, arc: true, task: 'Swing onto apron' },
  ]
}

export const ROUTES: Record<string, Waypoint[]> = {
  'fl-10': [
    { x: 0.8, z: 8.2, wait: 0.1, task: 'Idle in yard' },
    { x: 0.2, z: 6.6, wait: 0.08, action: 'pickup', task: 'Collect inbound pallet' },
    { x: 0.2, z: 8.2, wait: 0.04, reverse: true, task: 'Back to aisle' },
    { x: -8.4, z: 8.2, wait: 0.04, task: 'Shift west of the bays' },
    { x: -8.4, z: 7.4, wait: 0.08, action: 'dropoff', task: 'Stage between Bay 1 and 2' },
    { x: -8.4, z: 8.2, wait: 24, reverse: true, task: 'Hold clear of the apron' },
    { x: 0.8, z: 8.2, wait: 0.2, task: 'Hold center' },
    { x: -14.2, z: 8.2, wait: 0.08, action: 'pickup', task: 'Collect staged pallet' },
    { x: -14.2, z: 8.6, wait: 0.04, reverse: true, task: 'Clear aisle' },
    { x: -8.4, z: 8.2, wait: 0.04, task: 'West transfer' },
    { x: -8.4, z: 7.4, wait: 0.08, action: 'dropoff', task: 'Stage between Bay 1 and 2' },
    { x: -8.4, z: 8.2, wait: 0.04, reverse: true, task: 'Return to aisle' },
    { x: 0.8, z: 8.2, wait: 0.16, task: 'Return to yard' },
  ],
  'fl-04': [
    { x: -16.4, z: 5.6, wait: 0.14, task: 'Hold at west stack' },
    { x: -16.0, z: 4.1, wait: 0.08, action: 'pickup', task: 'Lift west pallet' },
    { x: -16.4, z: 5.5, wait: 0.04, reverse: true, task: 'Join west aisle' },
    { x: -15.0, z: 5.5, wait: 0.04, task: 'Face the pick face' },
    { x: -15.0, z: 4.4, wait: 0.08, action: 'dropoff', task: 'Build west pick face' },
    { x: -15.0, z: 5.5, wait: 0.04, reverse: true, task: 'Clear pick face' },
    { x: -16.4, z: 5.6, wait: 0.18, task: 'Return west' },
  ],
  'trk-18': [
    { x: -14.0, z: APRON_Z, wait: 0.1, task: 'Inbound to yard' },
    ...reverseDock(3.5, 'Bay 3', 14.5),
    ...pullOut(3.5),
    { x: 19.6, z: APRON_Z, wait: 0.08, task: 'Outbound' },
    { x: 19.6, z: LOOP_Z, wait: 0.08, task: 'Loop north' },
    { x: -15.4, z: LOOP_Z, wait: 0.08, task: 'Loop west' },
    { x: -15.4, z: APRON_Z, wait: 0.08, task: 'Re-enter' },
    { x: -14.0, z: APRON_Z, wait: 0.1, task: 'Queue inbound' },
  ],
  'trk-12': [
    { x: -10.5, z: DOCK_Z, wait: 46, action: 'dock', task: 'Unloading at Bay 1' },
    ...pullOut(-10.5),
    { x: 19.6, z: APRON_Z, wait: 0.08, task: 'Eastbound' },
    { x: 19.6, z: LOOP_Z, wait: 0.08, task: 'Loop north' },
    { x: -15.4, z: LOOP_Z, wait: 0.08, task: 'Circle yard' },
    { x: -15.4, z: APRON_Z, wait: 0.1, task: 'Turn in' },
    ...reverseDock(-10.5, 'Bay 1', 0.2),
  ],
  'trk-22': [
    { x: -23.6, z: APRON_Z, wait: 32, task: 'Hold inbound' },
    ...reverseDock(10.5, 'Bay 4', 7.2),
    ...pullOut(10.5),
    { x: 19.6, z: APRON_Z, wait: 0.12, task: 'Hold on apron' },
    { x: 19.6, z: LOOP_Z, wait: 0.08, task: 'Loop north' },
    { x: -15.4, z: LOOP_Z, wait: 0.08, task: 'Loop west' },
    { x: -15.4, z: APRON_Z, wait: 0.12, task: 'Re-enter' },
    { x: -23.6, z: APRON_Z, wait: 0.35, task: 'Hold inbound' },
  ],
}
