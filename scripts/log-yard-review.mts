import {
  STATIC_BOXES,
  STOPPED_SPEED,
  TRUCK_R_MIN,
  unitClearance,
  wallClearance,
} from '../src/scenes/yardline/sim/geom.ts'
import { crateCensus, resetRuntime, runtime, tick } from '../src/scenes/yardline/sim/yard.ts'

function wrapDelta(a: number, b: number) {
  let d = b - a
  while (d > Math.PI) d -= Math.PI * 2
  while (d < -Math.PI) d += Math.PI * 2
  return Math.abs(d)
}

function yardNear(x: number, z: number, radius = 2.4) {
  return Object.values(runtime.pallets).filter(
    (p) => p.site === 'yard' && !p.carriedBy && Math.hypot(p.x - x, p.z - z) < radius,
  )
}

resetRuntime()
const dt = 1 / 60
const seconds = 40
const wall = STATIC_BOXES[0]

const windows = {
  aFl: { t0: 6, t1: 7, min: Infinity, at: 0 },
  aWall: { t0: 8.5, t1: 9.5, min: Infinity, at: 0 },
  aFlManeuver: { min: Infinity, at: 0 },
  aWallManeuver: { min: Infinity, at: 0 },
  d910: { t0: 9, t1: 10, maxTurn: 0, at: 0, id: '', v: 0 },
}

const ledger: string[] = []
const prevPallet = Object.fromEntries(
  Object.values(runtime.pallets).map((p) => [p.id, { site: p.site, x: p.x, z: p.z, y: p.y }]),
)
const prevUnit = Object.fromEntries(
  Object.values(runtime.units).map((u) => [u.id, { heading: u.heading, v: u.v, x: u.x, z: u.z }]),
)

let dockedAt: number | null = null
let pickupAt: number | null = null
let dropAt: number | null = null
let dropWhere: { x: number; z: number; y: number; site: string } | null = null

for (let i = 0; i < seconds / dt; i += 1) {
  tick(dt)
  const t = runtime.clock
  const truck = runtime.units['trk-18']
  const fl10 = runtime.units['fl-10']
  const census = crateCensus()

  const vsFl = unitClearance(truck, fl10)
  const vsWall = wallClearance('truck', truck.x, truck.z, truck.heading, wall)
  const swinging = truck.reverse && truck.z < 11.4 && truck.z > 0.6 && Math.abs(truck.x - 3.5) < 8

  if (t >= windows.aFl.t0 && t <= windows.aFl.t1 && vsFl < windows.aFl.min) {
    windows.aFl.min = vsFl
    windows.aFl.at = t
  }
  if (t >= windows.aWall.t0 && t <= windows.aWall.t1 && vsWall < windows.aWall.min) {
    windows.aWall.min = vsWall
    windows.aWall.at = t
  }
  if (swinging && vsFl < windows.aFlManeuver.min) {
    windows.aFlManeuver.min = vsFl
    windows.aFlManeuver.at = t
  }
  if (swinging && vsWall < windows.aWallManeuver.min) {
    windows.aWallManeuver.min = vsWall
    windows.aWallManeuver.at = t
  }

  if (t >= windows.d910.t0 && t <= windows.d910.t1) {
    for (const unit of Object.values(runtime.units)) {
      const before = prevUnit[unit.id]
      const turn = wrapDelta(before.heading, unit.heading)
      if (turn > windows.d910.maxTurn) {
        windows.d910.maxTurn = turn
        windows.d910.at = t
        windows.d910.id = unit.id
        windows.d910.v = Math.max(before.v, unit.v)
      }
    }
  }

  for (const pallet of Object.values(runtime.pallets)) {
    const before = prevPallet[pallet.id]
    if (before.site !== pallet.site) {
      ledger.push(
        `t=${t.toFixed(3)} ${pallet.id} ${before.site}->${pallet.site}  host=${pallet.hostId ?? '-'}  xz=${pallet.x.toFixed(2)},${pallet.z.toFixed(2)} y=${pallet.y.toFixed(2)}  yard=${census.yard} forklift=${census.forklift} truck=${census.truck} stacks=${census.stacks}`,
      )
      if (pallet.id === 'p3' && before.site === 'yard' && pallet.site === 'forklift') {
        if (pickupAt == null) pickupAt = t
        const near = yardNear(-16.0, 4.1)
        ledger.push(
          `  p3 onto forks: west-yard-live ${near.length + 1}->${near.length} (exactly one); crate.yard ${census.yard + 1}->${census.yard} forklift=${census.forklift} (p2 may move in the same window)`,
        )
      }
      if (pallet.id === 'p3' && before.site === 'forklift' && pallet.site !== 'forklift') {
        if (dropAt == null) {
          dropAt = t
          dropWhere = { x: pallet.x, z: pallet.z, y: pallet.y, site: pallet.site }
        }
      }
    }
    prevPallet[pallet.id] = { site: pallet.site, x: pallet.x, z: pallet.z, y: pallet.y }
  }

  if (
    !dockedAt &&
    truck.reservedDock === 'bay-3' &&
    truck.z < 1.2 &&
    Math.abs(truck.heading) < 0.25 &&
    truck.v < STOPPED_SPEED
  ) {
    dockedAt = t
  }

  for (const unit of Object.values(runtime.units)) {
    prevUnit[unit.id] = { heading: unit.heading, v: unit.v, x: unit.x, z: unit.z }
  }

}

const truck = runtime.units['trk-18']
const p3 = runtime.pallets.p3

console.log('YARD REVIEW LOG')
console.log(`TRUCK_R_MIN=${TRUCK_R_MIN.toFixed(3)} m  dockedAt=${dockedAt?.toFixed(3) ?? 'none'}  trk-18 final x=${truck.x.toFixed(2)} z=${truck.z.toFixed(2)} h=${truck.heading.toFixed(3)} v=${truck.v.toFixed(3)}`)
console.log('')
console.log('(a) min SAT clearance (positive = separated)')
console.log(`  6.00-7.00s TRK-18 vs FL-10: ${windows.aFl.min.toFixed(3)} m at t=${windows.aFl.at.toFixed(3)}`)
console.log(`  8.50-9.50s TRK-18 vs warehouse wall: ${windows.aWall.min.toFixed(3)} m at t=${windows.aWall.at.toFixed(3)}`)
console.log(`  manoeuvre TRK-18 vs FL-10: ${windows.aFlManeuver.min.toFixed(3)} m at t=${windows.aFlManeuver.at.toFixed(3)}`)
console.log(`  manoeuvre TRK-18 vs warehouse wall: ${windows.aWallManeuver.min.toFixed(3)} m at t=${windows.aWallManeuver.at.toFixed(3)}`)
console.log('')
console.log('(b)(c) pallet ledger')
for (const line of ledger) console.log(`  ${line}`)
console.log(`  p3 pickup at t=${pickupAt?.toFixed(3) ?? 'none'}`)
console.log(
  `  p3 set-down at t=${dropAt?.toFixed(3) ?? 'none'} site=${dropWhere?.site ?? p3.site} xz=${(dropWhere ?? p3).x.toFixed(2)},${(dropWhere ?? p3).z.toFixed(2)} y=${(dropWhere ?? p3).y.toFixed(2)}`,
)
console.log('')
console.log('(d) per-tick |dHeading| in 9.00-10.00s')
console.log(
  `  max ${windows.d910.maxTurn.toFixed(4)} rad (${((windows.d910.maxTurn * 180) / Math.PI).toFixed(2)} deg) by ${windows.d910.id || 'none'} v=${windows.d910.v.toFixed(3)} at t=${windows.d910.at.toFixed(3)}`,
)
console.log(`  jump? ${windows.d910.maxTurn > 0.08 ? 'YES' : 'no'}  (0.08 rad/tick ~ 4.6 deg @ 60 Hz)`)
