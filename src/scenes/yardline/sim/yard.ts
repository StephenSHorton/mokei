import { create } from 'zustand'
import { clamp, damp, length2 } from '../../../lib/math.ts'
import {
  CARRY_LIFT,
  DOCK_ARC_R,
  DOCK_Z,
  FORK_MAX_STEER,
  FORK_STEER_RATE,
  FORK_WHEELBASE,
  MAX_HEADING_STEP,
  PICK_LIFT,
  STATIC_BOXES,
  STOPPED_SPEED,
  TRUCK_MAX_STEER,
  TRUCK_STEER_RATE,
  TRUCK_WHEELBASE,
  cargoInForkEnvelope,
  cellKey,
  forkWorldPose,
  lerpPose,
  overlapAabbObb,
  overlapOBB,
  palletStackBox,
  truckOnRoad,
  unitOnSurface,
  vehicleBoxes,
  type AABB,
} from './geom.ts'
import {
  ROUTES,
  compileRoute,
  remainingPoints,
  sampleAt,
  type CompiledRoute,
  type PathEvent,
} from './routes.ts'

export type UnitKind = 'forklift' | 'truck' | 'warehouse'
export type CargoSite = 'yard' | 'forklift' | 'truck' | 'warehouse'

export type UnitPhase = 'drive' | 'align' | 'insert' | 'lift' | 'lower' | 'set' | 'backoff' | 'wait' | 'settle'

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
  lift: number
  insert: number
  cargo: number
  s: number
  v: number
  phase: UnitPhase
  phaseT: number
  reservedDock: string | null
  reverse: boolean
  lastDroppedId: string | null
  steer: number
}

export type Pallet = {
  id: string
  code: string
  x: number
  z: number
  y: number
  heading: number
  spawnX: number
  spawnZ: number
  stacks: number
  wrap: 'tan' | 'blue'
  pin: boolean
  carriedBy: string | null
  site: CargoSite
  hostId: string | null
}

type YardState = {
  selectedId: string | null
  clock: number
  units: Record<string, Unit>
  stockOnHand: number
  onTime: number
  warehouseReceives: number
  select: (id: string | null) => void
  publish: () => void
}

export const DOCKS = [
  { id: 'bay-1', x: -10.5, z: DOCK_Z, label: 'Bay 1' },
  { id: 'bay-2', x: -3.5, z: DOCK_Z, label: 'Bay 2' },
  { id: 'bay-3', x: 3.5, z: DOCK_Z, label: 'Bay 3' },
  { id: 'bay-4', x: 10.5, z: DOCK_Z, label: 'Bay 4' },
] as const

export const WAREHOUSE_ID = 'wh-northpoint'
export const WAREHOUSE_BASE_STOCK = 610
export const TRUCK_CAPACITY = 6

const compiled: Record<string, CompiledRoute> = {
  'fl-10': compileRoute(ROUTES['fl-10'], 1.35),
  'fl-04': compileRoute(ROUTES['fl-04'], 1.35),
  'trk-18': compileRoute(ROUTES['trk-18'], DOCK_ARC_R),
  'trk-12': compileRoute(ROUTES['trk-12'], DOCK_ARC_R),
  'trk-22': compileRoute(ROUTES['trk-22'], DOCK_ARC_R),
}

function makeUnit(partial: Omit<Unit, 'lift' | 'insert' | 's' | 'v' | 'phase' | 'phaseT' | 'reservedDock' | 'cargo' | 'reverse' | 'lastDroppedId' | 'steer'> & Partial<Pick<Unit, 'cargo' | 'reservedDock' | 'reverse'>>): Unit {
  return {
    lift: 0,
    insert: 0,
    s: 0,
    v: 0,
    phase: 'drive',
    phaseT: 0,
    reservedDock: null,
    cargo: 0,
    reverse: false,
    lastDroppedId: null,
    steer: 0,
    ...partial,
  }
}

function initialUnits(): Record<string, Unit> {
  return {
    'fl-10': makeUnit({
      id: 'fl-10',
      kind: 'forklift',
      code: 'FL-10',
      title: 'Unloading truck',
      task: 'Idle in yard',
      x: 0.8,
      z: 8.2,
      heading: -Math.PI / 2,
      speed: 0,
      battery: 83,
      movesToday: 39,
      accent: 'yellow',
      carryingId: null,
      pathId: 'fl-10',
    }),
    'fl-04': makeUnit({
      id: 'fl-04',
      kind: 'forklift',
      code: 'FL-04',
      title: 'Yard runner',
      task: 'Hold at west stack',
      x: -16.4,
      z: 5.6,
      heading: 0.15,
      speed: 0,
      battery: 71,
      movesToday: 22,
      accent: 'yellow',
      carryingId: null,
      pathId: 'fl-04',
    }),
    'trk-18': makeUnit({
      id: 'trk-18',
      kind: 'truck',
      code: 'TRK-18',
      title: 'Northpoint inbound',
      task: 'Inbound to yard',
      x: -14.0,
      z: 11.2,
      heading: Math.PI / 2,
      speed: 0,
      battery: 100,
      movesToday: 6,
      accent: 'blue',
      carryingId: null,
      pathId: 'trk-18',
      cargo: 1,
    }),
    'trk-12': makeUnit({
      id: 'trk-12',
      kind: 'truck',
      code: 'TRK-12',
      title: 'Bay 1 docked',
      task: 'Unloading at Bay 1',
      x: -10.5,
      z: DOCK_Z,
      heading: 0,
      speed: 0,
      battery: 100,
      movesToday: 4,
      accent: 'teal',
      carryingId: null,
      pathId: 'trk-12',
      cargo: 2,
      reservedDock: 'bay-1',
    }),
    'trk-22': makeUnit({
      id: 'trk-22',
      kind: 'truck',
      code: 'TRK-22',
      title: 'Apron hold',
      task: 'Hold inbound',
      x: -23.6,
      z: 11.2,
      heading: Math.PI / 2,
      speed: 0,
      battery: 100,
      movesToday: 5,
      accent: 'blue',
      carryingId: null,
      pathId: 'trk-22',
      cargo: 0,
    }),
    'trk-07': makeUnit({
      id: 'trk-07',
      kind: 'truck',
      code: 'TRK-07',
      title: 'Bay 2 docked',
      task: 'Unloading at Bay 2',
      x: -3.5,
      z: DOCK_Z,
      heading: 0,
      speed: 0,
      battery: 100,
      movesToday: 3,
      accent: 'blue',
      carryingId: null,
      pathId: '',
      cargo: 1,
      reservedDock: 'bay-2',
    }),
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
  site: CargoSite = 'yard',
  hostId: string | null = null,
): Pallet {
  return {
    id,
    code,
    x,
    z,
    y: 0,
    heading: 0.08,
    spawnX: x,
    spawnZ: z,
    stacks,
    wrap,
    pin,
    carriedBy: null,
    site,
    hostId,
  }
}

function initialPallets(): Record<string, Pallet> {
  return {
    p1: makePallet('p1', 'PAL-1026', -14.2, 8.2, 3, 'tan', true),
    p2: makePallet('p2', 'PAL-1044', 0.2, 6.6, 2, 'blue', true),
    p3: makePallet('p3', 'PAL-1088', -16.0, 4.1, 2, 'tan', false),
    p4: makePallet('p4', 'PAL-1102', 16.4, 6.8, 3, 'tan', false),
    p5: makePallet('p5', 'PAL-1118', 8.8, 4.6, 2, 'tan', false),
    p6: makePallet('p6', 'PAL-1130', -6.2, 4.6, 3, 'blue', false),
    p7: makePallet('p7', 'PAL-1144', 6.6, 14.4, 2, 'tan', false, 'truck', 'trk-18'),
    p8: makePallet('p8', 'PAL-1160', -20.4, 8.8, 2, 'tan', false, 'truck', 'trk-12'),
    p9: makePallet('p9', 'PAL-1172', -10.5, 0.75, 2, 'tan', false, 'truck', 'trk-12'),
    p10: makePallet('p10', 'PAL-1180', -3.5, 0.75, 2, 'blue', false, 'truck', 'trk-07'),
  }
}

export type Runtime = {
  clock: number
  units: Record<string, Unit>
  pallets: Record<string, Pallet>
  eventIndex: Record<string, number>
  warehouseReceives: number
  docks: Record<string, string | null>
}

function emptyDocks(): Record<string, string | null> {
  return { 'bay-1': 'trk-12', 'bay-2': 'trk-07', 'bay-3': null, 'bay-4': null }
}

function seedUnitsFromRoutes(units: Record<string, Unit>) {
  for (const unit of Object.values(units)) {
    const route = compiled[unit.pathId]
    if (!route) continue
    const pose = sampleAt(route, 0)
    unit.x = pose.x
    unit.z = pose.z
    unit.heading = pose.heading
    unit.reverse = pose.reverse
  }
  return units
}

export function createRuntime(): Runtime {
  return {
    clock: 0,
    units: seedUnitsFromRoutes(initialUnits()),
    pallets: initialPallets(),
    eventIndex: { 'fl-10': 0, 'fl-04': 0, 'trk-18': 0, 'trk-12': 0, 'trk-22': 0 },
    warehouseReceives: 0,
    docks: emptyDocks(),
  }
}

export const runtime: Runtime = createRuntime()

export const UNIT_IDS = Object.keys(runtime.units)
export const PALLET_IDS = Object.keys(runtime.pallets)

export function resetRuntime() {
  const next = createRuntime()
  runtime.clock = 0
  runtime.units = next.units
  runtime.pallets = next.pallets
  runtime.eventIndex = next.eventIndex
  runtime.warehouseReceives = 0
  runtime.docks = emptyDocks()
}

function wrapAngle(a: number) {
  let x = a
  while (x > Math.PI) x -= Math.PI * 2
  while (x < -Math.PI) x += Math.PI * 2
  return x
}

function forksInPallet(unit: Unit) {
  if (unit.kind !== 'forklift') return false
  if (unit.insert > 0.12) return true
  return unit.phase === 'insert' || unit.phase === 'lift' || unit.phase === 'lower' || unit.phase === 'set'
}

function applySteer(unit: Unit, desiredHeading: number, dt: number) {
  const truck = unit.kind === 'truck'
  const maxSteer = truck ? TRUCK_MAX_STEER : FORK_MAX_STEER
  const steerRate = truck ? TRUCK_STEER_RATE : FORK_STEER_RATE
  const wheelbase = truck ? TRUCK_WHEELBASE : FORK_WHEELBASE
  const err = wrapAngle(desiredHeading - unit.heading)
  const stopped = unit.v < STOPPED_SPEED
  if (stopped && (truck || forksInPallet(unit))) return
  const desiredSteer = clamp(err * 1.15, -maxSteer, maxSteer)
  unit.steer = clamp(
    unit.steer + clamp(desiredSteer - unit.steer, -steerRate * dt, steerRate * dt),
    -maxSteer,
    maxSteer,
  )
  if (stopped) {
    unit.heading = wrapAngle(unit.heading + clamp(err, -MAX_HEADING_STEP, MAX_HEADING_STEP))
    return
  }
  unit.heading = wrapAngle(unit.heading + (unit.v / wheelbase) * Math.tan(unit.steer) * dt)
}

function nextEvent(route: CompiledRoute, index: number): PathEvent | null {
  return route.events[index] ?? null
}

function dockNear(x: number, z: number) {
  return DOCKS.find((d) => Math.abs(d.x - x) < 2.2 && z < 6.2) ?? null
}

function attachPallet(unit: Unit, pallet: Pallet) {
  const pose = forkWorldPose(unit)
  pallet.x = pose.x
  pallet.z = pose.z
  pallet.y = pose.y
  pallet.heading = unit.heading
}

function slidePalletOntoForks(unit: Unit) {
  const target = nearestLoad(unit)
  if (!target) return
  const dest = forkWorldPose(unit)
  const t = clamp(unit.insert, 0, 1)
  target.x = target.spawnX + (dest.x - target.spawnX) * t
  target.z = target.spawnZ + (dest.z - target.spawnZ) * t
  target.y = dest.y * t
  target.heading = 0.08 + (unit.heading - 0.08) * t
}

function claimDock(unit: Unit, dockId: string) {
  const held = runtime.docks[dockId]
  if (held && held !== unit.id) return false
  runtime.docks[dockId] = unit.id
  unit.reservedDock = dockId
  return true
}

function releaseDock(unit: Unit) {
  if (unit.reservedDock && runtime.docks[unit.reservedDock] === unit.id) {
    runtime.docks[unit.reservedDock] = null
  }
  unit.reservedDock = null
}

function beginAction(unit: Unit, event: PathEvent) {
  unit.task = event.task || unit.task
  unit.title = titleFromTask(unit, unit.task)
  if (unit.kind === 'forklift' && event.action === 'pickup') {
    unit.phase = 'align'
    unit.phaseT = 0.28
    unit.v = 0
    return
  }
  if (unit.kind === 'forklift' && event.action === 'dropoff') {
    unit.phase = 'lower'
    unit.phaseT = 0.55
    unit.v = 0
    return
  }
  if (event.action === 'dock') {
    const dock =
      DOCKS.find((d) => event.task.includes(d.label)) ??
      dockNear(unit.x, unit.z) ??
      DOCKS.find((d) => Math.abs(d.x - unit.x) < 3.2)
    if (dock) claimDock(unit, dock.id)
  }
  if (event.action === 'undock') releaseDock(unit)
  if (event.wait > 0) {
    unit.phase = 'wait'
    unit.phaseT = event.wait
    unit.v = 0
  }
}

function finishPickup(unit: Unit) {
  const target = nearestLoad(unit)
  if (!target) return
  if (target.site === 'truck' && target.hostId) {
    const truck = runtime.units[target.hostId]
    if (truck) truck.cargo = Math.max(0, truck.cargo - 1)
  }
  target.site = 'forklift'
  target.hostId = unit.id
  target.carriedBy = unit.id
  unit.carryingId = target.id
  unit.movesToday += 1
}

function finishDropoff(unit: Unit) {
  if (!unit.carryingId) return
  const held = runtime.pallets[unit.carryingId]
  if (!held) {
    unit.carryingId = null
    return
  }
  const pose = forkWorldPose(unit)
  const dock = dockNear(unit.x, unit.z)
  const truck = dock ? Object.values(runtime.units).find((u) => u.reservedDock === dock.id && u.kind === 'truck') : null
  held.carriedBy = null
  held.x = pose.x
  held.z = pose.z
  held.y = 0
  held.heading = unit.heading
  if (truck && /load/i.test(truck.task) && !/unload/i.test(truck.task) && truck.cargo < TRUCK_CAPACITY) {
    held.site = 'truck'
    held.hostId = truck.id
    truck.cargo += 1
  } else if (dock) {
    held.site = 'warehouse'
    held.hostId = WAREHOUSE_ID
    runtime.warehouseReceives += 1
  } else {
    held.site = 'yard'
    held.hostId = null
    held.spawnX = held.x
    held.spawnZ = held.z
  }
  unit.carryingId = null
  unit.lastDroppedId = held.id
  unit.movesToday += 1
}

function nearestLoad(unit: Unit): Pallet | null {
  let best: Pallet | null = null
  let bestD = 3.6
  for (const pallet of Object.values(runtime.pallets)) {
    if (pallet.carriedBy) continue
    if (pallet.site === 'warehouse') continue
    if (pallet.site === 'forklift') continue
    let x = pallet.x
    let z = pallet.z
    if (pallet.site === 'truck' && pallet.hostId) {
      const truck = runtime.units[pallet.hostId]
      if (!truck) continue
      x = truck.x - Math.sin(truck.heading) * 2.6
      z = truck.z - Math.cos(truck.heading) * 2.6
    }
    const d = length2(x - unit.x, z - unit.z)
    if (d < bestD) {
      best = pallet
      bestD = d
    }
  }
  return best
}

function stepPhase(unit: Unit, dt: number) {
  unit.phaseT = Math.max(0, unit.phaseT - dt)
  if (unit.phase === 'align') {
    unit.v = 0
    if (unit.phaseT <= 0) {
      unit.phase = 'insert'
      unit.phaseT = 0.5
    }
    return
  }
  if (unit.phase === 'insert') {
    unit.insert = damp(unit.insert, 1, 10, dt)
    unit.lift = damp(unit.lift, CARRY_LIFT, 8, dt)
    slidePalletOntoForks(unit)
    if (unit.phaseT <= 0) {
      finishPickup(unit)
      unit.phase = 'lift'
      unit.phaseT = 0.7
    }
    return
  }
  if (unit.phase === 'lift') {
    unit.lift = damp(unit.lift, PICK_LIFT, 6, dt)
    unit.insert = damp(unit.insert, 0.15, 6, dt)
    if (unit.phaseT <= 0) {
      unit.phase = 'settle'
      unit.phaseT = 0.48
    }
    return
  }
  if (unit.phase === 'settle') {
    unit.v = 0
    unit.lift = damp(unit.lift, CARRY_LIFT, 10, dt)
    unit.insert = damp(unit.insert, 0, 8, dt)
    if (unit.phaseT <= 0) {
      unit.phase = 'drive'
      unit.lift = CARRY_LIFT
      unit.phaseT = 0
    }
    return
  }
  if (unit.phase === 'lower') {
    unit.lift = damp(unit.lift, CARRY_LIFT, 6, dt)
    if (unit.phaseT <= 0) {
      unit.phase = 'set'
      unit.phaseT = 0.18
    }
    return
  }
  if (unit.phase === 'set') {
    if (unit.phaseT <= 0) {
      finishDropoff(unit)
      unit.phase = 'backoff'
      unit.phaseT = 0.42
    }
    return
  }
  if (unit.phase === 'backoff') {
    unit.insert = damp(unit.insert, 0, 8, dt)
    unit.lift = damp(unit.lift, 0, 8, dt)
    unit.s = Math.max(0, unit.s - 1.15 * dt)
    if (unit.phaseT <= 0) {
      unit.phase = 'drive'
      unit.insert = 0
    }
    return
  }
  if (unit.phase === 'wait' && unit.phaseT <= 0) {
    unit.phase = 'drive'
  }
}

function upcomingCurvature(route: CompiledRoute, s: number) {
  const a = sampleAt(route, s)
  const b = sampleAt(route, Math.min(route.length, s + 2.4))
  return Math.abs(wrapAngle(b.heading - a.heading))
}

function ignoredPalletIds(unitId: string) {
  const skip = new Set<string>()
  const unit = runtime.units[unitId]
  if (!unit) return skip
  if (unit.carryingId) skip.add(unit.carryingId)
  if (unit.lastDroppedId) {
    const dropped = runtime.pallets[unit.lastDroppedId]
    if (!dropped || Math.hypot(dropped.x - unit.x, dropped.z - unit.z) > 3.6) unit.lastDroppedId = null
    else skip.add(unit.lastDroppedId)
  }
  const route = compiled[unit.pathId]
  const ev = route ? nextEvent(route, runtime.eventIndex[unit.id] ?? 0) : null
  const acting =
    unit.phase === 'align' ||
    unit.phase === 'insert' ||
    unit.phase === 'lift' ||
    unit.phase === 'settle' ||
    unit.phase === 'lower' ||
    unit.phase === 'set' ||
    unit.phase === 'backoff'
  if (unit.kind === 'forklift' && (acting || ev?.action === 'pickup' || ev?.action === 'dropoff')) {
    for (const pallet of Object.values(runtime.pallets)) {
      if (pallet.site !== 'yard' || pallet.carriedBy) continue
      if (Math.hypot(pallet.x - unit.x, pallet.z - unit.z) < 2.8) skip.add(pallet.id)
    }
    if (route && ev && (ev.action === 'pickup' || ev.action === 'dropoff')) {
      const pose = sampleAt(route, ev.s)
      for (const pallet of Object.values(runtime.pallets)) {
        if (pallet.site !== 'yard' || pallet.carriedBy) continue
        if (Math.hypot(pallet.x - pose.x, pallet.z - pose.z) < 2.2) skip.add(pallet.id)
      }
    }
  }
  return skip
}

function stackBoxesFor(unitId: string): AABB[] {
  const skip = ignoredPalletIds(unitId)
  const boxes: AABB[] = []
  for (const pallet of Object.values(runtime.pallets)) {
    if (pallet.site !== 'yard' || pallet.carriedBy) continue
    if (skip.has(pallet.id)) continue
    boxes.push(palletStackBox(pallet.x, pallet.z))
  }
  return boxes
}

function poseHits(kind: Unit['kind'], x: number, z: number, heading: number, ignoreId: string, pad = 0.12) {
  const boxes = vehicleBoxes(kind, x, z, heading)
  for (const other of Object.values(runtime.units)) {
    if (other.id === ignoreId) continue
    for (const mine of boxes) {
      for (const theirs of vehicleBoxes(other.kind, other.x, other.z, other.heading)) {
        if (overlapOBB(mine, theirs, pad)) return true
      }
    }
  }
  for (const wall of STATIC_BOXES) {
    for (const mine of boxes) {
      if (overlapAabbObb(wall, mine, 0)) return true
    }
  }
  for (const stack of stackBoxesFor(ignoreId)) {
    for (const mine of boxes) {
      if (overlapAabbObb(stack, mine, 0)) return true
    }
  }
  return false
}

function truckIsReversing(unit: Unit) {
  if (unit.kind !== 'truck') return false
  if (unit.reverse && (unit.v > 0.04 || unit.reservedDock)) return true
  return Boolean(unit.reservedDock && unit.z > 2.2 && unit.v > 0.04)
}

function reversingYield(unit: Unit, x: number, z: number, heading: number) {
  if (unit.kind !== 'forklift') return false
  const boxes = vehicleBoxes('forklift', x, z, heading)
  for (const other of Object.values(runtime.units)) {
    if (!truckIsReversing(other)) continue
    for (const theirs of vehicleBoxes('truck', other.x, other.z, other.heading)) {
      for (const mine of boxes) {
        if (overlapOBB(mine, theirs, 0.18)) return true
      }
    }
    if (!other.reservedDock) continue
    const dock = DOCKS.find((d) => d.id === other.reservedDock)
    if (dock && Math.abs(x - dock.x) < 2.2 && z < 12.2 && z > -0.2) return true
  }
  return false
}

function blockedByOthers(unit: Unit, x: number, z: number, heading: number, claims: Map<string, string>) {
  if (poseHits(unit.kind, x, z, heading, unit.id, 0.1)) return true
  if (reversingYield(unit, x, z, heading)) return true
  const keys = [cellKey(x, z), cellKey(x + Math.sin(heading) * 2.2, z + Math.cos(heading) * 2.2)]
  for (const key of keys) {
    const owner = claims.get(key)
    if (owner && owner !== unit.id) return true
  }
  return false
}

function truckOnPath(unit: Unit, route: CompiledRoute, s: number, dist = 7.6) {
  if (unit.kind !== 'truck') return false
  const steps = 5
  for (let i = 1; i <= steps; i += 1) {
    const p = sampleAt(route, Math.min(route.length, s + (dist * i) / steps))
    for (const other of Object.values(runtime.units)) {
      if (other.id === unit.id || other.kind !== 'truck') continue
      if (Math.hypot(other.x - p.x, other.z - p.z) < 5.4) return true
    }
  }
  return false
}

function claimCells(unit: Unit, claims: Map<string, string>) {
  const keys = [
    cellKey(unit.x, unit.z),
    cellKey(unit.x + Math.sin(unit.heading) * 2.2, unit.z + Math.cos(unit.heading) * 2.2),
  ]
  for (const key of keys) {
    if (!claims.has(key)) claims.set(key, unit.id)
  }
  if (unit.kind === 'truck' && unit.reservedDock) {
    const dock = DOCKS.find((d) => d.id === unit.reservedDock)
    if (dock) {
      const reversing = truckIsReversing(unit)
      const maxZ = reversing || unit.v > 0.2 || unit.z > 3.6 ? 11.4 : 5.2
      for (let z = 0.4; z <= maxZ; z += 2.2) {
        const key = cellKey(dock.x, z)
        if (!claims.has(key)) claims.set(key, unit.id)
      }
    }
  }
}

function dockBlocked(unit: Unit, event: PathEvent | null) {
  if (!event || event.action !== 'dock') return false
  const dock = DOCKS.find((d) => Math.abs(d.x - sampleAt(compiled[unit.pathId], event.s).x) < 1.2)
  if (!dock) return false
  const held = runtime.docks[dock.id]
  return Boolean(held && held !== unit.id)
}

function moveRank(unit: Unit) {
  if (unit.kind === 'truck' && truckIsReversing(unit)) return 0
  if (unit.kind === 'truck') return 1
  return 2
}

export function tick(dt: number) {
  const step = Math.min(dt, 0.05)
  runtime.clock += step
  const claims = new Map<string, string>()
  const order = Object.values(runtime.units).sort((a, b) => moveRank(a) - moveRank(b) || a.id.localeCompare(b.id))
  for (const unit of order) claimCells(unit, claims)

  for (const unit of order) {
    const route = compiled[unit.pathId]
    if (!route) {
      unit.speed = 0
      unit.v = 0
      continue
    }

    if (unit.phase !== 'drive') {
      stepPhase(unit, step)
    }

    const evIndex = runtime.eventIndex[unit.id] ?? 0
    let event = nextEvent(route, evIndex)
    if (event && unit.s >= event.s && unit.phase === 'drive') {
      runtime.eventIndex[unit.id] = evIndex + 1
      beginAction(unit, event)
      event = nextEvent(route, runtime.eventIndex[unit.id] ?? 0)
    }

    if (unit.s >= route.length - 0.05 && unit.phase === 'drive') {
      unit.s = 0
      runtime.eventIndex[unit.id] = 0
    }

    const pose = sampleAt(route, unit.s)
    unit.reverse = pose.reverse
    const vmax = unit.kind === 'truck' ? 6.4 : 3.6
    const accel = unit.kind === 'truck' ? 2.6 : 3.4
    const curve = upcomingCurvature(route, unit.s)
    const corner = clamp(1 - curve * 0.85, 0.18, 1)
    const remain = route.length - unit.s
    const stop = event ? Math.max(0, event.s - unit.s) : remain
    const decelLimit = Math.sqrt(Math.max(0.05, 2 * 3.2 * Math.max(stop, 0.2)))
    let target = Math.min(vmax * corner, decelLimit)
    if (unit.phase !== 'drive') target = 0
    if (dockBlocked(unit, event)) target = 0

    const lookAhead = curve > 0.45
      ? 0.5
      : unit.kind === 'truck'
        ? Math.max(2.6, unit.v * 0.55)
        : Math.max(0.55, unit.v * 0.4)
    const look = sampleAt(route, Math.min(route.length, unit.s + lookAhead))
    if (unit.v > 0.25 && blockedByOthers(unit, look.x, look.z, look.heading, claims)) target = 0
    const following = truckOnPath(unit, route, unit.s)
    if (following) target = 0

    if (unit.phase === 'drive') {
      const steerLook = sampleAt(route, Math.min(route.length, unit.s + (unit.kind === 'truck' ? 1.6 : 0.55)))
      applySteer(unit, steerLook.heading, step)
      const inch = sampleAt(route, Math.min(route.length, unit.s + 0.16))
      const inchClear = !blockedByOthers(unit, inch.x, inch.z, inch.heading, claims)
      let speed = 0
      if (inchClear) {
        if (target > 0) speed = Math.max(unit.v, 0.45)
        else if (!following && unit.v < 0.2) speed = 0.4
        else speed = unit.v
      }
      const nextS = Math.min(route.length, unit.s + speed * step)
      const next = sampleAt(route, nextS)
      if (speed > 0 && !blockedByOthers(unit, next.x, next.z, next.heading, claims)) {
        const a = target > unit.v ? accel : 4.6
        if (target > unit.v) unit.v = Math.min(Math.max(target, speed), unit.v + a * step)
        else unit.v = Math.max(target, unit.v - a * step)
        unit.s = nextS
        unit.x = next.x
        unit.z = next.z
      } else {
        unit.v = 0
      }
    } else {
      unit.v = Math.max(0, unit.v - 4.6 * step)
      unit.x = pose.x
      unit.z = pose.z
      applySteer(unit, pose.heading, step)
    }

    if (unit.kind === 'forklift' && unit.phase === 'drive') {
      unit.lift = damp(unit.lift, unit.carryingId ? CARRY_LIFT : 0, 5, step)
      unit.insert = damp(unit.insert, 0, 5, step)
    }

    if (unit.carryingId) {
      const held = runtime.pallets[unit.carryingId]
      if (held) attachPallet(unit, held)
    }

    unit.speed = unit.v * 3.6
    if (unit.kind === 'forklift') {
      unit.battery = clamp(68 + 18 * Math.sin(runtime.clock * 0.07 + unit.movesToday), 54, 96)
    }
    unit.title = titleFromTask(unit, unit.task)
  }

  syncHiddenPallets()
}

function syncHiddenPallets() {
  for (const pallet of Object.values(runtime.pallets)) {
    if (pallet.site === 'truck' && pallet.hostId && !pallet.carriedBy) {
      const truck = runtime.units[pallet.hostId]
      if (!truck) continue
      pallet.x = truck.x
      pallet.z = truck.z
      pallet.y = 0
    }
  }
}

export function crateCensus() {
  const counts = { yard: 0, forklift: 0, truck: 0, warehouse: 0, total: 0, stacks: 0 }
  for (const pallet of Object.values(runtime.pallets)) {
    counts[pallet.site] += 1
    counts.total += 1
    counts.stacks += pallet.stacks
  }
  return counts
}

export function stockFromSim() {
  return WAREHOUSE_BASE_STOCK + runtime.warehouseReceives
}

export function overlapViolations() {
  const hits: string[] = []
  const list = Object.values(runtime.units)
  for (let i = 0; i < list.length; i += 1) {
    const a = list[i]
    const boxesA = vehicleBoxes(a.kind, a.x, a.z, a.heading)
    for (let j = i + 1; j < list.length; j += 1) {
      const b = list[j]
      let hit = false
      for (const boxA of boxesA) {
        for (const boxB of vehicleBoxes(b.kind, b.x, b.z, b.heading)) {
          if (overlapOBB(boxA, boxB, 0.02)) hit = true
        }
      }
      if (!hit) continue
      if (a.kind === 'forklift' && b.kind === 'truck') hits.push(`forklift ${a.id} overlaps truck ${b.id}`)
      else if (a.kind === 'truck' && b.kind === 'forklift') hits.push(`forklift ${b.id} overlaps truck ${a.id}`)
      else if (a.kind === 'forklift' && b.kind === 'forklift') hits.push(`forklift ${a.id} overlaps forklift ${b.id}`)
      else hits.push(`${a.id} overlaps ${b.id}`)
    }
    for (const wall of STATIC_BOXES) {
      for (const boxA of boxesA) {
        if (overlapAabbObb(wall, boxA, 0)) {
          hits.push(a.kind === 'forklift' ? `forklift ${a.id} hits static` : `${a.id} hits static`)
        }
      }
    }
    for (const stack of stackBoxesFor(a.id)) {
      for (const boxA of boxesA) {
        if (overlapAabbObb(stack, boxA, 0)) {
          hits.push(a.kind === 'forklift' ? `forklift ${a.id} hits static` : `${a.id} hits static`)
        }
      }
    }
    if (!unitOnSurface(a.kind, a.x, a.z) && a.kind === 'truck' && !truckOnRoad(a.x, a.z)) {
      hits.push(`${a.id} off road`)
    }
    if (a.kind === 'forklift' && !unitOnSurface(a.kind, a.x, a.z)) {
      hits.push(`${a.id} off lot`)
    }
  }
  return hits
}

export function palletVisible(pallet: Pallet) {
  return pallet.site === 'yard' || pallet.site === 'forklift'
}

export function sweptOverlap(prev: { x: number; z: number; heading: number }, unit: Unit) {
  for (const t of [0, 0.5, 1]) {
    const pose = lerpPose(prev, unit, t)
    if (poseHits(unit.kind, pose.x, pose.z, pose.heading, unit.id, 0.02)) return true
  }
  return false
}

export { cargoInForkEnvelope }

export const useYard = create<YardState>((set) => ({
  selectedId: 'fl-10',
  clock: 0,
  units: snapshotUnits(),
  stockOnHand: WAREHOUSE_BASE_STOCK,
  onTime: 96.2,
  warehouseReceives: 0,
  select: (id) => set({ selectedId: id }),
  publish: () => {
    set({
      clock: runtime.clock,
      units: snapshotUnits(),
      stockOnHand: stockFromSim(),
      onTime: 96.2 + 0.25 * Math.sin(runtime.clock * 0.07),
      warehouseReceives: runtime.warehouseReceives,
    })
  },
}))

function snapshotUnits() {
  const copy: Record<string, Unit> = {}
  for (const [id, unit] of Object.entries(runtime.units)) copy[id] = { ...unit }
  return copy
}

function titleFromTask(unit: Unit, task: string) {
  if (unit.kind === 'forklift') {
    if (unit.phase === 'lift' || unit.phase === 'insert' || unit.phase === 'settle') return 'Lifting pallet'
    if (task.toLowerCase().includes('collect') || task.toLowerCase().includes('lift')) return 'Collecting pallet'
    if (task.toLowerCase().includes('stage') || task.toLowerCase().includes('feed')) return 'Unloading truck'
    if (task.toLowerCase().includes('idle') || task.toLowerCase().includes('return')) return 'Repositioning'
  }
  return task
}

export function sampleRemainingPath(unit: Unit, _clock: number): [number, number, number][] {
  const route = compiled[unit.pathId]
  if (!route) return []
  return remainingPoints(route, unit.s)
}

export function trucksOnSite(units: Record<string, Unit>) {
  return Object.values(units).filter((unit) => unit.kind === 'truck' && unit.x > -24 && unit.x < 24).length
}

export function dockedCount(units: Record<string, Unit>) {
  return Object.values(units).filter((unit) => unit.kind === 'truck' && unit.reservedDock && unit.z < 2.4).length
}

export function arrivingCount(units: Record<string, Unit>) {
  return Object.values(units).filter((unit) => unit.kind === 'truck' && !unit.reservedDock && unit.x > -24).length
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

export function dockOpen(bayX: number) {
  return Object.values(runtime.units).some(
    (unit) => unit.kind === 'truck' && unit.reservedDock && Math.abs(unit.x - bayX) < 2 && unit.z < 8,
  )
}
