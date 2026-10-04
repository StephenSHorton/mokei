import { length2 } from '../../../lib/math.ts'

export type PathAction = 'pickup' | 'dropoff' | 'dock' | 'undock'

export type Waypoint = {
  x: number
  z: number
  reverse?: boolean
  wait?: number
  action?: PathAction
  task?: string
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

function pushPoint(out: { x: number; z: number; reverse: boolean }[], x: number, z: number, reverse: boolean) {
  const last = out[out.length - 1]
  if (last && Math.hypot(last.x - x, last.z - z) < 0.04) return
  out.push({ x, z, reverse })
}

function filletWaypoints(nodes: Waypoint[], radius: number) {
  const raw = nodes.map((n) => ({
    x: n.x,
    z: n.z,
    reverse: Boolean(n.reverse),
    sharp: Boolean(n.action) || Boolean(n.reverse),
  }))
  if (raw.length < 3) return raw
  const out: { x: number; z: number; reverse: boolean }[] = []
  pushPoint(out, raw[0].x, raw[0].z, raw[0].reverse)
  for (let i = 1; i < raw.length - 1; i += 1) {
    const a = raw[i - 1]
    const b = raw[i]
    const c = raw[i + 1]
    const inLen = length2(b.x - a.x, b.z - a.z)
    const outLen = length2(c.x - b.x, c.z - b.z)
    if (inLen < 0.2 || outLen < 0.2) {
      pushPoint(out, b.x, b.z, b.reverse)
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
      pushPoint(out, b.x, b.z, b.reverse)
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
    const steps = Math.max(4, Math.round((r * Math.abs(sweep)) / 0.38))
    pushPoint(out, t1x, t1z, b.reverse)
    for (let s = 1; s < steps; s += 1) {
      const ang = start + (sweep * s) / steps
      pushPoint(out, cx + Math.sin(ang) * r, cz + Math.cos(ang) * r, b.reverse)
    }
    pushPoint(out, t2x, t2z, b.reverse)
  }
  const last = raw[raw.length - 1]
  pushPoint(out, last.x, last.z, last.reverse)
  return out
}

function headingOf(dx: number, dz: number, reverse: boolean) {
  const move = Math.atan2(dx, dz)
  return reverse ? move + Math.PI : move
}

export function compileRoute(nodes: Waypoint[], radius: number): CompiledRoute {
  const densified = filletWaypoints(nodes, radius)
  const samples: PathSample[] = []
  let s = 0
  for (let i = 0; i < densified.length; i += 1) {
    const p = densified[i]
    if (i > 0) {
      const prev = densified[i - 1]
      const span = length2(p.x - prev.x, p.z - prev.z)
      const steps = Math.max(1, Math.round(span / 0.45))
      for (let k = 1; k <= steps; k += 1) {
        const t = k / steps
        const x = prev.x + (p.x - prev.x) * t
        const z = prev.z + (p.z - prev.z) * t
        s += span / steps
        samples.push({
          x,
          z,
          heading: headingOf(p.x - prev.x, p.z - prev.z, p.reverse),
          reverse: p.reverse,
          s,
        })
      }
    } else {
      const nxt = densified[Math.min(1, densified.length - 1)]
      samples.push({
        x: p.x,
        z: p.z,
        heading: headingOf(nxt.x - p.x, nxt.z - p.z, nxt.reverse),
        reverse: nxt.reverse,
        s: 0,
      })
    }
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
      if (d < 0.85) {
        best = samples[i]
        cursor = i
        break
      }
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
    heading: headingOf(b.x - a.x, b.z - a.z, t > 0.5 ? b.reverse : a.reverse),
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

export const ROUTES: Record<string, Waypoint[]> = {
  'fl-10': [
    { x: 0.8, z: 8.2, wait: 0.25, task: 'Idle in yard' },
    { x: -14.2, z: 8.2, wait: 0.15, action: 'pickup', task: 'Collect staged pallet' },
    { x: -14.2, z: 6.4, wait: 0.05, task: 'Clear aisle' },
    { x: -7.4, z: 6.4, wait: 0.12, action: 'dropoff', task: 'Stage at Bay 1' },
    { x: -7.4, z: 8.2, wait: 0.05, task: 'Return to aisle' },
    { x: 0.2, z: 8.2, wait: 0.05, task: 'Cross yard' },
    { x: 0.2, z: 6.6, wait: 0.15, action: 'pickup', task: 'Collect inbound pallet' },
    { x: 0.2, z: 8.2, wait: 0.05, task: 'Back to aisle' },
    { x: 7.0, z: 8.2, wait: 0.05, task: 'Eastbound' },
    { x: 7.0, z: 6.4, wait: 0.12, action: 'dropoff', task: 'Feed Bay 3' },
    { x: 7.0, z: 8.2, wait: 0.05, task: 'Reposition' },
    { x: 0.8, z: 8.2, wait: 0.2, task: 'Return to yard' },
  ],
  'fl-04': [
    { x: -16.4, z: 5.6, wait: 0.35, task: 'Hold at west stack' },
    { x: -16.0, z: 4.1, wait: 0.15, action: 'pickup', task: 'Lift west pallet' },
    { x: -16.4, z: 5.8, wait: 0.05, task: 'Join south aisle' },
    { x: -5.6, z: 5.8, wait: 0.12, action: 'dropoff', task: 'Build pick face' },
    { x: 7.0, z: 5.8, wait: 0.05, task: 'East run' },
    { x: 13.8, z: 6.2, wait: 0.15, action: 'pickup', task: 'Collect east pallet' },
    { x: 7.0, z: 5.8, wait: 0.05, task: 'Return aisle' },
    { x: 0.0, z: 5.8, wait: 0.12, action: 'dropoff', task: 'Stage at Bay 2' },
    { x: -16.4, z: 5.8, wait: 0.05, task: 'Westbound' },
    { x: -16.4, z: 5.6, wait: 0.25, task: 'Return west' },
  ],
  'trk-18': [
    { x: -14.0, z: 11.2, wait: 0.15, task: 'Inbound to yard' },
    { x: 3.5, z: 11.2, wait: 0.45, action: 'dock', task: 'Align on Bay 3' },
    { x: 3.5, z: 0.75, wait: 6.4, reverse: true, action: 'dock', task: 'Unloading at Bay 3' },
    { x: 3.5, z: 11.2, wait: 0.15, action: 'undock', task: 'Pull clear' },
    { x: 19.6, z: 11.2, wait: 0.08, task: 'Outbound' },
    { x: 19.6, z: 16.2, wait: 0.08, task: 'Loop north' },
    { x: -15.4, z: 16.2, wait: 0.08, task: 'Loop west' },
    { x: -15.4, z: 11.2, wait: 0.08, task: 'Re-enter' },
    { x: -14.0, z: 11.2, wait: 0.12, task: 'Queue inbound' },
  ],
  'trk-12': [
    { x: -10.5, z: 0.75, wait: 8.6, action: 'dock', task: 'Unloading at Bay 1' },
    { x: -10.5, z: 11.2, wait: 0.18, action: 'undock', task: 'Pull clear' },
    { x: 19.6, z: 11.2, wait: 0.08, task: 'Eastbound' },
    { x: 19.6, z: 16.2, wait: 0.08, task: 'Loop north' },
    { x: -15.4, z: 16.2, wait: 0.08, task: 'Circle yard' },
    { x: -15.4, z: 11.2, wait: 0.1, task: 'Turn in' },
    { x: -10.5, z: 11.2, wait: 0.4, action: 'dock', task: 'Align on Bay 1' },
    { x: -10.5, z: 0.75, wait: 0.2, reverse: true, action: 'dock', task: 'Back into Bay 1' },
  ],
  'trk-22': [
    { x: -23.6, z: 11.2, wait: 1.05, task: 'Hold inbound' },
    { x: 10.5, z: 11.2, wait: 0.45, action: 'dock', task: 'Align on Bay 4' },
    { x: 10.5, z: 0.75, wait: 5.8, reverse: true, action: 'dock', task: 'Loading at Bay 4' },
    { x: 10.5, z: 11.2, wait: 0.15, action: 'undock', task: 'Pull clear' },
    { x: 19.6, z: 11.2, wait: 0.12, task: 'Hold on apron' },
    { x: 19.6, z: 16.2, wait: 0.08, task: 'Loop north' },
    { x: -15.4, z: 16.2, wait: 0.08, task: 'Loop west' },
    { x: -15.4, z: 11.2, wait: 0.12, task: 'Re-enter' },
    { x: -23.6, z: 11.2, wait: 0.35, task: 'Hold inbound' },
  ],
}
