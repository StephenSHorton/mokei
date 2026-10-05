export type OBB = {
  x: number
  z: number
  heading: number
  halfW: number
  halfL: number
}

export type AABB = { minX: number; maxX: number; minZ: number; maxZ: number }

export const TRUCK_HALF_W = 1.25
export const TRUCK_HALF_L = 3.2
export const FORK_HALF_W = 0.92
export const FORK_HALF_L = 1.85
export const FORK_SCALE = 1.22
export const CARRY_LIFT = 0
export const PICK_LIFT = 0.36
export const PALLET_DECK_Y = 0.25 * 1.14
export const PALLET_HALF = 0.78

export const APRON_Z = 11.2
export const DOCK_Z = 0.75
export const TRUCK_WHEELBASE = 4.6
export const TRUCK_MAX_STEER = (35 * Math.PI) / 180
export const TRUCK_R_MIN = TRUCK_WHEELBASE / Math.tan(TRUCK_MAX_STEER)
export const TRUCK_STEER_RATE = 0.72
export const FORK_WHEELBASE = 1.35
export const FORK_MAX_STEER = (55 * Math.PI) / 180
export const FORK_R_MIN = FORK_WHEELBASE / Math.tan(FORK_MAX_STEER)
export const FORK_STEER_RATE = 1.6
export const STOPPED_SPEED = 0.05
/** Path radius must stay above TRUCK_R_MIN (~6.57 m) so a box truck can track it. */
export const DOCK_ARC_R = TRUCK_R_MIN + 0.24
export const LOOP_Z = 18.6
export const LOOP_EAST_X = 21.0
export const LOOP_WEST_X = -15.4
export const MAX_HEADING_STEP = 0.12
export const MAX_POS_STEP = 0.2

export const STATIC_BOXES: AABB[] = [
  { minX: -16.6, maxX: 16.6, minZ: -18.2, maxZ: -3.35 },
  { minX: -17.2, maxX: 9.2, minZ: -33.0, maxZ: -20.2 },
  { minX: -24.8, maxX: -17.6, minZ: -14.4, maxZ: -6.6 },
  { minX: -25.6, maxX: -20.0, minZ: 1.4, maxZ: 5.4 },
  { minX: 19.4, maxX: 22.6, minZ: -4.6, maxZ: 0.2 },
  { minX: 21.0, maxX: 24.4, minZ: -13.6, maxZ: -8.6 },
  { minX: -27.2, maxX: -20.8, minZ: 15.8, maxZ: 20.2 },
  { minX: -8.0, maxX: -5.4, minZ: 14.0, maxZ: 15.6 },
  { minX: 10.8, maxX: 13.2, minZ: 13.8, maxZ: 15.2 },
  { minX: -2.0, maxX: 0.0, minZ: 14.6, maxZ: 16.0 },
  { minX: 15.6, maxX: 18.2, minZ: 0.6, maxZ: 4.4 },
  { minX: 25.2, maxX: 28.0, minZ: 8.8, maxZ: 16.8 },
]

/** Decorative yard stacks that are not live Pallet actors. */
export const STACK_BOXES: AABB[] = [
  { minX: -8.18, maxX: -6.62, minZ: 13.82, maxZ: 15.38 },
  { minX: -6.78, maxX: -5.22, minZ: 14.12, maxZ: 15.68 },
  { minX: 10.42, maxX: 11.98, minZ: 13.62, maxZ: 15.18 },
  { minX: 11.82, maxX: 13.38, minZ: 13.22, maxZ: 14.78 },
  { minX: -21.58, maxX: -20.02, minZ: 3.82, maxZ: 5.38 },
  { minX: 16.02, maxX: 17.58, minZ: 2.42, maxZ: 3.98 },
  { minX: 16.12, maxX: 17.68, minZ: 0.82, maxZ: 2.38 },
  { minX: -1.98, maxX: -0.42, minZ: 14.42, maxZ: 15.98 },
]

const GRASS: AABB[] = [
  { minX: 18.0, maxX: 27.0, minZ: -13.5, maxZ: -8.5 },
  { minX: -27.0, maxX: -21.0, minZ: 16.0, maxZ: 20.0 },
  { minX: 10.5, maxX: 17.5, minZ: -26.2, maxZ: -21.8 },
  { minX: -25.0, maxX: -17.0, minZ: -4.4, maxZ: -0.4 },
]

const BAY_XS = [-10.5, -3.5, 3.5, 10.5]

function inAabb(x: number, z: number, box: AABB) {
  return x >= box.minX && x <= box.maxX && z >= box.minZ && z <= box.maxZ
}

export function pointInStatic(x: number, z: number) {
  for (const box of STATIC_BOXES) {
    if (inAabb(x, z, box)) return true
  }
  return false
}

export function truckOnRoad(x: number, z: number) {
  for (const bay of BAY_XS) {
    if (Math.abs(x - bay) <= 7.4 && z >= -0.4 && z <= 13.8) return true
  }
  if (z >= 9.2 && z <= 13.6 && x >= -28.2 && x <= 24.2) return true
  if (z >= 16.0 && z <= 20.2 && x >= -18.4 && x <= 24.2) return true
  if (x >= -18.4 && x <= -12.4 && z >= 9.2 && z <= 20.2) return true
  if (x >= 12.0 && x <= 24.2 && z >= 9.2 && z <= 20.2) return true
  return false
}

export function forkliftOnLot(x: number, z: number) {
  if (z < 0.2 || z > 16.6 || x < -22.4 || x > 21.2) return false
  if (pointInStatic(x, z)) return false
  for (const box of GRASS) {
    if (inAabb(x, z, box)) return false
  }
  return true
}

export function unitOnSurface(kind: 'truck' | 'forklift', x: number, z: number) {
  return kind === 'truck' ? truckOnRoad(x, z) : forkliftOnLot(x, z)
}

function corners(box: OBB): [number, number][] {
  const c = Math.cos(box.heading)
  const s = Math.sin(box.heading)
  const pts: [number, number][] = [
    [-box.halfW, -box.halfL],
    [box.halfW, -box.halfL],
    [box.halfW, box.halfL],
    [-box.halfW, box.halfL],
  ]
  return pts.map(([lx, lz]) => [box.x + lx * c + lz * s, box.z - lx * s + lz * c])
}

function project(pts: [number, number][], ax: number, az: number) {
  let min = Infinity
  let max = -Infinity
  for (const [x, z] of pts) {
    const d = x * ax + z * az
    if (d < min) min = d
    if (d > max) max = d
  }
  return [min, max] as const
}

export function satClearance(a: OBB, b: OBB) {
  const pa = corners(a)
  const pb = corners(b)
  const axes: [number, number][] = [
    [Math.cos(a.heading), -Math.sin(a.heading)],
    [Math.sin(a.heading), Math.cos(a.heading)],
    [Math.cos(b.heading), -Math.sin(b.heading)],
    [Math.sin(b.heading), Math.cos(b.heading)],
  ]
  let separated = false
  let maxSep = -Infinity
  let minPen = Infinity
  for (const [ax, az] of axes) {
    const [minA, maxA] = project(pa, ax, az)
    const [minB, maxB] = project(pb, ax, az)
    const gap = Math.max(minB - maxA, minA - maxB)
    if (gap > 0) {
      separated = true
      if (gap > maxSep) maxSep = gap
    } else if (-gap < minPen) {
      minPen = -gap
    }
  }
  return separated ? maxSep : -minPen
}

export function overlapOBB(a: OBB, b: OBB, pad = 0) {
  const aa = { ...a, halfW: a.halfW + pad, halfL: a.halfL + pad }
  const bb = { ...b, halfW: b.halfW + pad, halfL: b.halfL + pad }
  return satClearance(aa, bb) <= 0
}

export function unitClearance(
  a: { kind: 'truck' | 'forklift'; x: number; z: number; heading: number },
  b: { kind: 'truck' | 'forklift'; x: number; z: number; heading: number },
) {
  let min = Infinity
  for (const boxA of vehicleBoxes(a.kind, a.x, a.z, a.heading)) {
    for (const boxB of vehicleBoxes(b.kind, b.x, b.z, b.heading)) {
      const gap = satClearance(boxA, boxB)
      if (gap < min) min = gap
    }
  }
  return min
}

export function wallClearance(
  kind: 'truck' | 'forklift',
  x: number,
  z: number,
  heading: number,
  wall: AABB,
) {
  const asObb: OBB = {
    x: (wall.minX + wall.maxX) / 2,
    z: (wall.minZ + wall.maxZ) / 2,
    heading: 0,
    halfW: (wall.maxX - wall.minX) / 2,
    halfL: (wall.maxZ - wall.minZ) / 2,
  }
  let min = Infinity
  for (const box of vehicleBoxes(kind, x, z, heading)) {
    const gap = satClearance(asObb, box)
    if (gap < min) min = gap
  }
  return min
}

export function overlapAabbObb(box: AABB, body: OBB, pad = 0.12) {
  const asObb: OBB = {
    x: (box.minX + box.maxX) / 2,
    z: (box.minZ + box.maxZ) / 2,
    heading: 0,
    halfW: (box.maxX - box.minX) / 2 + pad,
    halfL: (box.maxZ - box.minZ) / 2 + pad,
  }
  return overlapOBB(asObb, body, 0)
}

function offsetAlongHeading(x: number, z: number, heading: number, along: number) {
  return { x: x + Math.sin(heading) * along, z: z + Math.cos(heading) * along }
}

export function vehicleBoxes(kind: 'truck' | 'forklift', x: number, z: number, heading: number): OBB[] {
  if (kind === 'forklift') {
    const body = offsetAlongHeading(x, z, heading, -0.12)
    const forks = offsetAlongHeading(x, z, heading, 1.62)
    return [
      { x: body.x, z: body.z, heading, halfW: FORK_HALF_W, halfL: 1.18 },
      { x: forks.x, z: forks.z, heading, halfW: 0.72, halfL: 0.92 },
    ]
  }
  const cab = offsetAlongHeading(x, z, heading, 2.32)
  const trailer = offsetAlongHeading(x, z, heading, -0.62)
  return [
    { x: cab.x, z: cab.z, heading, halfW: 1.12, halfL: 0.86 },
    { x: trailer.x, z: trailer.z, heading, halfW: 1.25, halfL: 2.22 },
  ]
}

export function vehicleBox(kind: 'truck' | 'forklift', x: number, z: number, heading: number): OBB {
  if (kind === 'truck') return { x, z, heading, halfW: TRUCK_HALF_W, halfL: TRUCK_HALF_L }
  const mid = offsetAlongHeading(x, z, heading, 0.62)
  return { x: mid.x, z: mid.z, heading, halfW: FORK_HALF_W, halfL: FORK_HALF_L }
}

export function palletStackBox(x: number, z: number): AABB {
  return { minX: x - PALLET_HALF, maxX: x + PALLET_HALF, minZ: z - PALLET_HALF, maxZ: z + PALLET_HALF }
}

export function lerpPose(a: { x: number; z: number; heading: number }, b: { x: number; z: number; heading: number }, t: number) {
  let dh = b.heading - a.heading
  while (dh > Math.PI) dh -= Math.PI * 2
  while (dh < -Math.PI) dh += Math.PI * 2
  return { x: a.x + (b.x - a.x) * t, z: a.z + (b.z - a.z) * t, heading: a.heading + dh * t }
}

export function forkWorldPose(unit: { x: number; z: number; heading: number; lift: number; insert: number }) {
  const forkY = 0.24 + unit.lift * 1.08
  const forkZ = 1.42 + unit.insert * 0.28
  const localZ = forkZ - 0.04
  return {
    x: unit.x + Math.sin(unit.heading) * localZ * FORK_SCALE,
    z: unit.z + Math.cos(unit.heading) * localZ * FORK_SCALE,
    y: forkY * FORK_SCALE,
  }
}

export function cargoInForkEnvelope(
  unit: { x: number; z: number; heading: number; lift: number; insert: number },
  cargo: { x: number; z: number; y: number },
) {
  const dx = cargo.x - unit.x
  const dz = cargo.z - unit.z
  const c = Math.cos(unit.heading)
  const s = Math.sin(unit.heading)
  const localX = dx * c - dz * s
  const localZ = dx * s + dz * c
  const fork = forkWorldPose(unit)
  return (
    Math.abs(localX) < 0.62 &&
    localZ > 0.85 &&
    localZ < 2.55 &&
    cargo.y > 0.12 &&
    cargo.y < 1.15 &&
    Math.abs(cargo.y - fork.y) < 0.16
  )
}

export function cellKey(x: number, z: number) {
  return `${Math.round(x / 2.4)}:${Math.round(z / 2.4)}`
}
