import { create } from 'zustand'
import { damp, dampAngle, easeInOutCubic, length2, lerp } from '../lib/math'

export type UnitKind = 'forklift' | 'truck' | 'warehouse'

export type Unit = {
  id: string
  kind: Exclude<UnitKind, 'warehouse'>
  code: string
  title: string
  task: string
  x: number
  z: number
  heading: number
  speed: number
  battery: number
  movesToday: number
  accent: 'blue' | 'teal' | 'yellow'
  carryingId: string | null
  pathId: string
}

export type Pallet = {
  id: string
  code: string
  x: number
  z: number
  heading: number
  spawnX: number
  spawnZ: number
  stacks: number
  wrap: 'tan' | 'blue'
  pin: boolean
  carriedBy: string | null
  hiddenUntil: number
}

export type PathNode = {
  x: number
  z: number
  duration: number
  wait?: number
  reverse?: boolean
  action?: 'pickup' | 'dropoff'
  task?: string
}

type YardState = {
  selectedId: string | null
  clock: number
  units: Record<string, Unit>
  stockOnHand: number
  onTime: number
  select: (id: string | null) => void
  publish: () => void
}

export const DOCKS = [
  { id: 'bay-1', x: -10.5, z: 0.7, label: 'Bay 1' },
  { id: 'bay-2', x: -3.5, z: 0.7, label: 'Bay 2' },
  { id: 'bay-3', x: 3.5, z: 0.7, label: 'Bay 3' },
  { id: 'bay-4', x: 10.5, z: 0.7, label: 'Bay 4' },
] as const

export const WAREHOUSE_ID = 'wh-northpoint'

const PATHS: Record<string, PathNode[]> = {
  'fl-10': [
    { x: 0.8, z: 7.2, duration: 0, wait: 0.4, task: 'Idle in yard' },
    { x: -12.2, z: 8.4, duration: 5.2, wait: 0.7, action: 'pickup', task: 'Collect staged pallet' },
    { x: -10.4, z: 1.6, duration: 4.6, wait: 0.6, action: 'dropoff', task: 'Stage at Bay 1' },
    { x: 2.1, z: 12.1, duration: 6.4, wait: 0.7, action: 'pickup', task: 'Collect inbound pallet' },
    { x: 3.6, z: 1.8, duration: 5.0, wait: 0.55, action: 'dropoff', task: 'Feed Bay 3' },
    { x: 8.4, z: 9.2, duration: 4.2, wait: 0.3, task: 'Reposition' },
    { x: 0.8, z: 7.2, duration: 4.8, wait: 0.2, task: 'Return to yard' },
  ],
  'fl-04': [
    { x: -16.4, z: 3.2, duration: 0, wait: 0.5, task: 'Hold at west stack' },
    { x: -16.0, z: 4.1, duration: 2.2, wait: 0.6, action: 'pickup', task: 'Lift west pallet' },
    { x: -8.2, z: 10.2, duration: 5.4, wait: 0.55, action: 'dropoff', task: 'Build pick face' },
    { x: 13.8, z: 6.2, duration: 7.2, wait: 0.6, action: 'pickup', task: 'Collect east pallet' },
    { x: -3.4, z: 1.7, duration: 6.6, wait: 0.55, action: 'dropoff', task: 'Stage at Bay 2' },
    { x: -16.4, z: 3.2, duration: 5.8, wait: 0.4, task: 'Return west' },
  ],
  'trk-18': [
    { x: -27, z: 13.4, duration: 0, wait: 0.2, task: 'Inbound to yard' },
    { x: 3.5, z: 13.4, duration: 7.5, wait: 0.15, task: 'Cross the apron' },
    { x: 3.5, z: 6.4, duration: 3.6, wait: 0.35, task: 'Align on Bay 3' },
    { x: 3.5, z: 0.7, duration: 4.2, wait: 7.2, reverse: true, task: 'Unloading at Bay 3' },
    { x: 3.5, z: 7.6, duration: 3.8, wait: 0.2, task: 'Pull clear' },
    { x: 24.5, z: 7.6, duration: 6.2, wait: 0.1, task: 'Outbound' },
    { x: 24.5, z: 16.6, duration: 2.8, wait: 0.1, task: 'Loop north' },
    { x: -27, z: 16.6, duration: 8.4, wait: 0.1, task: 'Loop west' },
    { x: -27, z: 13.4, duration: 2.2, wait: 0.2, task: 'Re-enter' },
  ],
  'trk-12': [
    { x: -10.5, z: 0.7, duration: 0, wait: 9.0, reverse: true, task: 'Unloading at Bay 1' },
    { x: -10.5, z: 8.2, duration: 4.0, wait: 0.25, task: 'Pull clear' },
    { x: -23.5, z: 8.2, duration: 4.4, wait: 0.1, task: 'West gate' },
    { x: -23.5, z: 16.2, duration: 2.6, wait: 0.1, task: 'Loop north' },
    { x: 17.8, z: 16.2, duration: 7.8, wait: 0.1, task: 'Circle yard' },
    { x: 17.8, z: 8.4, duration: 2.8, wait: 0.15, task: 'Turn in' },
    { x: -10.5, z: 8.4, duration: 6.6, wait: 0.4, task: 'Align on Bay 1' },
    { x: -10.5, z: 0.7, duration: 4.2, wait: 0.2, reverse: true, task: 'Back into Bay 1' },
  ],
  'trk-22': [
    { x: 18.4, z: 12.6, duration: 0, wait: 3.5, task: 'Hold on apron' },
    { x: 10.5, z: 12.6, duration: 3.2, wait: 0.2, task: 'Approach Bay 4' },
    { x: 10.5, z: 6.2, duration: 3.0, wait: 0.35, task: 'Align on Bay 4' },
    { x: 10.5, z: 0.7, duration: 4.0, wait: 6.5, reverse: true, task: 'Loading at Bay 4' },
    { x: 10.5, z: 9.4, duration: 3.6, wait: 0.2, task: 'Pull clear' },
    { x: 18.4, z: 9.4, duration: 2.8, wait: 0.15, task: 'Return to hold' },
    { x: 18.4, z: 12.6, duration: 2.0, wait: 0.2, task: 'Hold on apron' },
  ],
}

type CompiledSeg = {
  from: PathNode
  to: PathNode
  start: number
  arrive: number
  end: number
  reverse: boolean
}

type CompiledPath = {
  segs: CompiledSeg[]
  cycle: number
}

const compiled = Object.fromEntries(
  Object.entries(PATHS).map(([id, nodes]) => [id, compilePath(nodes)]),
) as Record<string, CompiledPath>

const fired = new Set<string>()

function compilePath(nodes: PathNode[]): CompiledPath {
  const segs: CompiledSeg[] = []
  let t = 0
  for (let i = 0; i < nodes.length; i += 1) {
    const from = nodes[i]
    const to = nodes[(i + 1) % nodes.length]
    const duration = to.duration
    const wait = to.wait ?? 0
    const start = t
    const arrive = t + duration
    const end = arrive + wait
    segs.push({
      from,
      to,
      start,
      arrive,
      end,
      reverse: Boolean(to.reverse),
    })
    t = end
  }
  return { segs, cycle: t }
}

function initialUnits(): Record<string, Unit> {
  return {
    'fl-10': {
      id: 'fl-10',
      kind: 'forklift',
      code: 'FL-10',
      title: 'Unloading truck',
      task: 'Unloading TRK-18',
      x: 0.8,
      z: 7.2,
      heading: -0.6,
      speed: 0,
      battery: 83,
      movesToday: 39,
      accent: 'yellow',
      carryingId: null,
      pathId: 'fl-10',
    },
    'fl-04': {
      id: 'fl-04',
      kind: 'forklift',
      code: 'FL-04',
      title: 'Yard runner',
      task: 'Build pick face',
      x: -16.4,
      z: 3.2,
      heading: 0.4,
      speed: 0,
      battery: 71,
      movesToday: 22,
      accent: 'yellow',
      carryingId: null,
      pathId: 'fl-04',
    },
    'trk-18': {
      id: 'trk-18',
      kind: 'truck',
      code: 'TRK-18',
      title: 'Northpoint inbound',
      task: 'Inbound to yard',
      x: -27,
      z: 13.4,
      heading: Math.PI / 2,
      speed: 0,
      battery: 100,
      movesToday: 6,
      accent: 'blue',
      carryingId: null,
      pathId: 'trk-18',
    },
    'trk-12': {
      id: 'trk-12',
      kind: 'truck',
      code: 'TRK-12',
      title: 'Bay 1 docked',
      task: 'Unloading at Bay 1',
      x: -10.5,
      z: 0.7,
      heading: 0,
      speed: 0,
      battery: 100,
      movesToday: 4,
      accent: 'teal',
      carryingId: null,
      pathId: 'trk-12',
    },
    'trk-22': {
      id: 'trk-22',
      kind: 'truck',
      code: 'TRK-22',
      title: 'Apron hold',
      task: 'Hold on apron',
      x: 18.4,
      z: 12.6,
      heading: -0.4,
      speed: 0,
      battery: 100,
      movesToday: 5,
      accent: 'blue',
      carryingId: null,
      pathId: 'trk-22',
    },
    'trk-07': {
      id: 'trk-07',
      kind: 'truck',
      code: 'TRK-07',
      title: 'Bay 2 docked',
      task: 'Unloading at Bay 2',
      x: -3.5,
      z: 0.7,
      heading: 0,
      speed: 0,
      battery: 100,
      movesToday: 3,
      accent: 'teal',
      carryingId: null,
      pathId: '',
    },
  }
}

function makePallet(
  id: string,
  code: string,
  x: number,
  z: number,
  stacks: number,
  wrap: Pallet['wrap'],
  pin: boolean,
): Pallet {
  return {
    id,
    code,
    x,
    z,
    heading: 0.08,
    spawnX: x,
    spawnZ: z,
    stacks,
    wrap,
    pin,
    carriedBy: null,
    hiddenUntil: 0,
  }
}

function initialPallets(): Record<string, Pallet> {
  return {
    p1: makePallet('p1', 'PAL-1026', -12.2, 8.4, 3, 'tan', true),
    p2: makePallet('p2', 'PAL-1044', 2.1, 12.1, 2, 'blue', true),
    p3: makePallet('p3', 'PAL-1088', -16.0, 4.1, 2, 'tan', false),
    p4: makePallet('p4', 'PAL-1102', 13.8, 6.2, 3, 'tan', false),
    p5: makePallet('p5', 'PAL-1118', 8.4, 9.2, 2, 'tan', false),
    p6: makePallet('p6', 'PAL-1130', -8.2, 10.2, 3, 'blue', false),
    p7: makePallet('p7', 'PAL-1144', 6.6, 14.4, 2, 'tan', false),
    p8: makePallet('p8', 'PAL-1160', -20.4, 8.8, 2, 'tan', false),
  }
}

export const runtime = {
  clock: 0,
  units: initialUnits(),
  pallets: initialPallets(),
}

export const UNIT_IDS = Object.keys(runtime.units)
export const PALLET_IDS = Object.keys(runtime.pallets)

export function tick(dt: number) {
  runtime.clock += dt
  const clock = runtime.clock
  const { units, pallets } = runtime

  for (const pallet of Object.values(pallets)) {
    if (pallet.hiddenUntil && clock >= pallet.hiddenUntil && !pallet.carriedBy) {
      pallet.hiddenUntil = 0
      pallet.x = pallet.spawnX
      pallet.z = pallet.spawnZ
    }
  }

  for (const unit of Object.values(units)) {
    const path = compiled[unit.pathId]
    if (!path) continue

    const local = clock % path.cycle
    const cycleIndex = Math.floor(clock / path.cycle)
    const seg = path.segs.find((item) => local >= item.start && local < item.end) ?? path.segs[0]
    const traveling = local < seg.arrive
    const progress = traveling
      ? easeInOutCubic((local - seg.start) / Math.max(0.0001, seg.arrive - seg.start))
      : 1
    const nextX = lerp(seg.from.x, seg.to.x, progress)
    const nextZ = lerp(seg.from.z, seg.to.z, progress)
    const dist = length2(nextX - unit.x, nextZ - unit.z)
    const instSpeed = dt > 0 ? (dist / dt) * 3.6 : 0

    const moveHeading = Math.atan2(seg.to.x - seg.from.x, seg.to.z - seg.from.z)
    const desired = seg.reverse ? moveHeading + Math.PI : moveHeading
    const heading = traveling ? dampAngle(unit.heading, desired, 6.2, dt) : unit.heading

    const arrived = !traveling && local < seg.arrive + Math.min(0.2, (seg.to.wait ?? 0.2))
    const fireKey = `${unit.id}:${cycleIndex}:${seg.start}:${seg.to.action ?? 'hold'}`
    if (arrived && seg.to.action && !fired.has(fireKey)) {
      fired.add(fireKey)
      unit.movesToday += 1
      if (seg.to.action === 'pickup') {
        const target = nearestFreePallet(pallets, nextX, nextZ, clock)
        if (target) {
          target.carriedBy = unit.id
          unit.carryingId = target.id
        }
      }
      if (seg.to.action === 'dropoff' && unit.carryingId) {
        const held = pallets[unit.carryingId]
        if (held) {
          held.carriedBy = null
          held.x = nextX + Math.sin(heading) * 1.15
          held.z = nextZ + Math.cos(heading) * 1.15
          held.heading = heading
          if (held.z < 3.4) {
            held.hiddenUntil = clock + 7
            held.x = held.spawnX
            held.z = held.spawnZ
          }
        }
        unit.carryingId = null
      }
    }

    if (unit.carryingId) {
      const held = pallets[unit.carryingId]
      if (held) {
        held.x = nextX + Math.sin(heading) * 1.05
        held.z = nextZ + Math.cos(heading) * 1.05
        held.heading = heading
      }
    }

    unit.x = nextX
    unit.z = nextZ
    unit.heading = heading
    unit.speed = damp(unit.speed, instSpeed, 8, dt)
    unit.task = seg.to.task ?? unit.task
    unit.title = titleFromTask(unit, seg.to.task ?? unit.task)
    unit.battery =
      unit.kind === 'forklift'
        ? clampBattery(68 + 18 * Math.sin(clock * 0.07 + unit.movesToday))
        : 100
  }
}

export const useYard = create<YardState>((set) => ({
  selectedId: 'fl-10',
  clock: 0,
  units: snapshotUnits(),
  stockOnHand: 610,
  onTime: 96.2,
  select: (id) => set({ selectedId: id }),
  publish: () => {
    const clock = runtime.clock
    set({
      clock,
      units: snapshotUnits(),
      stockOnHand: 610 + Math.round(8 * Math.sin(clock * 0.05) + clock * 0.12),
      onTime: 96.2 + 0.25 * Math.sin(clock * 0.04),
    })
  },
}))

function snapshotUnits() {
  const copy: Record<string, Unit> = {}
  for (const [id, unit] of Object.entries(runtime.units)) {
    copy[id] = { ...unit }
  }
  return copy
}

function nearestFreePallet(
  pallets: Record<string, Pallet>,
  x: number,
  z: number,
  clock: number,
) {
  let best: Pallet | null = null
  let bestDist = 4.2
  for (const pallet of Object.values(pallets)) {
    if (pallet.carriedBy) continue
    if (pallet.hiddenUntil > clock) continue
    const dist = length2(pallet.x - x, pallet.z - z)
    if (dist < bestDist) {
      best = pallet
      bestDist = dist
    }
  }
  return best
}

function titleFromTask(unit: Unit, task: string) {
  if (unit.kind === 'forklift') {
    if (task.toLowerCase().includes('collect')) return 'Collecting pallet'
    if (task.toLowerCase().includes('stage') || task.toLowerCase().includes('feed')) {
      return 'Unloading truck'
    }
    if (task.toLowerCase().includes('idle') || task.toLowerCase().includes('return')) {
      return 'Repositioning'
    }
  }
  return task
}

function clampBattery(value: number) {
  return Math.max(54, Math.min(96, value))
}

export function sampleRemainingPath(unit: Unit, clock: number): [number, number, number][] {
  const path = compiled[unit.pathId]
  if (!path) return []
  const local = clock % path.cycle
  const points: [number, number, number][] = [[unit.x, 0.04, unit.z]]
  for (const seg of path.segs) {
    if (seg.end <= local) continue
    if (seg.arrive > local) {
      const steps = 7
      const startT = local > seg.start ? (local - seg.start) / Math.max(0.0001, seg.arrive - seg.start) : 0
      for (let i = 1; i <= steps; i += 1) {
        const t = startT + ((1 - startT) * i) / steps
        points.push([
          lerp(seg.from.x, seg.to.x, t),
          0.04,
          lerp(seg.from.z, seg.to.z, t),
        ])
      }
    }
    points.push([seg.to.x, 0.04, seg.to.z])
  }
  return points.slice(0, 36)
}

export function trucksOnSite(units: Record<string, Unit>) {
  return Object.values(units).filter((unit) => unit.kind === 'truck' && unit.x > -24 && unit.x < 24).length
}

export function selectedRecord(state: YardState) {
  if (!state.selectedId) return null
  if (state.selectedId === WAREHOUSE_ID) {
    return {
      kind: 'warehouse' as const,
      id: WAREHOUSE_ID,
      code: 'WH-01',
      title: 'Northpoint Cross-Dock',
      task: 'Operational',
    }
  }
  return state.units[state.selectedId] ?? null
}
