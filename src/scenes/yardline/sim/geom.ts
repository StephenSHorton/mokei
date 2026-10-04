export type OBB = {
  x: number
  z: number
  heading: number
  halfW: number
  halfL: number
}

export type AABB = { minX: number; maxX: number; minZ: number; maxZ: number }

export const TRUCK_HALF_W = 1.28
export const TRUCK_HALF_L = 3.72
export const FORK_HALF_W = 0.82
export const FORK_HALF_L = 1.55

export const STATIC_BOXES: AABB[] = [
  { minX: -16.6, maxX: 16.6, minZ: -18.2, maxZ: -3.35 },
  { minX: -17.2, maxX: 9.2, minZ: -33.0, maxZ: -20.2 },
  { minX: -24.8, maxX: -17.6, minZ: -14.4, maxZ: -6.6 },
  { minX: -25.6, maxX: -20.0, minZ: 1.4, maxZ: 5.4 },
  { minX: 19.4, maxX: 22.6, minZ: -4.6, maxZ: 0.2 },
  { minX: 21.0, maxX: 24.4, minZ: -13.6, maxZ: -8.6 },
  { minX: -27.2, maxX: -20.8, minZ: 15.8, maxZ: 20.2 },
  { minX: -8.4, maxX: -5.0, minZ: 13.8, maxZ: 16.0 },
  { minX: 10.2, maxX: 13.8, minZ: 13.2, maxZ: 15.6 },
  { minX: -2.4, maxX: 0.2, minZ: 14.4, maxZ: 16.4 },
  { minX: 15.6, maxX: 18.2, minZ: 0.6, maxZ: 4.4 },
  { minX: 25.2, maxX: 28.0, minZ: 8.8, maxZ: 16.8 },
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
    if (Math.abs(x - bay) <= 2.45 && z >= 0.15 && z <= 13.6) return true
  }
  if (z >= 9.6 && z <= 13.0 && x >= -28.2 && x <= 22.8) return true
  if (z >= 14.8 && z <= 17.6 && x >= -17.4 && x <= 22.8) return true
  if (x >= -17.6 && x <= -13.2 && z >= 9.6 && z <= 17.6) return true
  if (x >= 16.4 && x <= 22.8 && z >= 9.6 && z <= 17.6) return true
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

export function overlapOBB(a: OBB, b: OBB, pad = 0) {
  const aa = { ...a, halfW: a.halfW + pad, halfL: a.halfL + pad }
  const bb = { ...b, halfW: b.halfW + pad, halfL: b.halfL + pad }
  const pa = corners(aa)
  const pb = corners(bb)
  const axes: [number, number][] = [
    [Math.cos(aa.heading), -Math.sin(aa.heading)],
    [Math.sin(aa.heading), Math.cos(aa.heading)],
    [Math.cos(bb.heading), -Math.sin(bb.heading)],
    [Math.sin(bb.heading), Math.cos(bb.heading)],
  ]
  for (const [ax, az] of axes) {
    const [minA, maxA] = project(pa, ax, az)
    const [minB, maxB] = project(pb, ax, az)
    if (maxA < minB || maxB < minA) return false
  }
  return true
}

export function overlapAabbObb(box: AABB, body: OBB, pad = 0.12) {
  const grown: AABB = {
    minX: box.minX - pad,
    maxX: box.maxX + pad,
    minZ: box.minZ - pad,
    maxZ: box.maxZ + pad,
  }
  for (const [x, z] of corners(body)) {
    if (inAabb(x, z, grown)) return true
  }
  return inAabb(body.x, body.z, grown)
}

export function vehicleBox(kind: 'truck' | 'forklift', x: number, z: number, heading: number): OBB {
  return kind === 'truck'
    ? { x, z, heading, halfW: TRUCK_HALF_W, halfL: TRUCK_HALF_L }
    : { x, z, heading, halfW: FORK_HALF_W, halfL: FORK_HALF_L }
}

export function cellKey(x: number, z: number) {
  return `${Math.round(x / 2.4)}:${Math.round(z / 2.4)}`
}
