import { cargoInForkEnvelope, lerpPose, MAX_HEADING_STEP, MAX_POS_STEP, truckOnRoad, unitOnSurface, vehicleBoxes } from '../src/scenes/yardline/sim/geom.ts'
import { crateCensus, overlapViolations, resetRuntime, runtime, sweptOverlap, tick } from '../src/scenes/yardline/sim/yard.ts'

function wrapDelta(a: number, b: number) {
  let d = b - a
  while (d > Math.PI) d -= Math.PI * 2
  while (d < -Math.PI) d += Math.PI * 2
  return Math.abs(d)
}

resetRuntime()
const start = crateCensus()
if (start.total !== 10) {
  console.error(`expected 10 pallets, got ${start.total}`)
  process.exit(1)
}

const dt = 1 / 60
const seconds = 90
const MAX_HEADING = MAX_HEADING_STEP + 0.05
const MAX_JUMP = MAX_POS_STEP + 0.02
const prev = Object.fromEntries(
  Object.values(runtime.units).map((u) => [u.id, { x: u.x, z: u.z, heading: u.heading }]),
)

for (let i = 0; i < seconds / dt; i += 1) {
  tick(dt)
  const hits = overlapViolations()
  if (hits.length) {
    console.error(`t=${runtime.clock.toFixed(2)} ${hits.join('; ')}`)
    process.exit(1)
  }
  for (const unit of Object.values(runtime.units)) {
    const before = prev[unit.id]
    const jump = Math.hypot(unit.x - before.x, unit.z - before.z)
    const turn = wrapDelta(before.heading, unit.heading)
    if (jump > MAX_JUMP) {
      console.error(`t=${runtime.clock.toFixed(2)} ${unit.id} jumped ${jump.toFixed(3)}m`)
      process.exit(1)
    }
    if (turn > MAX_HEADING) {
      console.error(`t=${runtime.clock.toFixed(2)} ${unit.id} heading snap ${turn.toFixed(3)}rad`)
      process.exit(1)
    }
    if (sweptOverlap(before, unit)) {
      console.error(`t=${runtime.clock.toFixed(2)} ${unit.id} swept overlap`)
      process.exit(1)
    }
    prev[unit.id] = { x: unit.x, z: unit.z, heading: unit.heading }
    if (unit.kind === 'truck' && !truckOnRoad(unit.x, unit.z)) {
      console.error(`t=${runtime.clock.toFixed(2)} ${unit.id} left the road at ${unit.x.toFixed(2)},${unit.z.toFixed(2)}`)
      process.exit(1)
    }
    if (unit.kind === 'forklift' && !unitOnSurface('forklift', unit.x, unit.z)) {
      console.error(`t=${runtime.clock.toFixed(2)} ${unit.id} left the lot at ${unit.x.toFixed(2)},${unit.z.toFixed(2)}`)
      process.exit(1)
    }
    if (unit.kind === 'forklift' && unit.carryingId) {
      const pallet = runtime.pallets[unit.carryingId]
      if (!pallet || !cargoInForkEnvelope(unit, pallet)) {
        console.error(
          `t=${runtime.clock.toFixed(2)} ${unit.id} cargo outside fork envelope`,
          pallet ? { x: pallet.x, z: pallet.z, y: pallet.y, lift: unit.lift } : null,
        )
        process.exit(1)
      }
    }
    if (unit.kind === 'truck' && vehicleBoxes('truck', unit.x, unit.z, unit.heading).length !== 2) {
      console.error(`${unit.id} is missing cab/trailer boxes`)
      process.exit(1)
    }
  }
  const now = crateCensus()
  if (now.total !== start.total || now.stacks !== start.stacks) {
    console.error(`crate conservation broke at t=${runtime.clock.toFixed(2)}`, now)
    process.exit(1)
  }
}

resetRuntime()
let liftSeen = false
for (let i = 0; i < 16 / dt; i += 1) {
  tick(dt)
  for (const unit of Object.values(runtime.units)) {
    if (unit.kind !== 'forklift' || !unit.carryingId || unit.lift <= 0.2) continue
    const pallet = runtime.pallets[unit.carryingId]
    if (pallet && pallet.site === 'forklift' && cargoInForkEnvelope(unit, pallet)) {
      liftSeen = true
      break
    }
  }
  if (liftSeen) break
}
if (!liftSeen) {
  console.error('no forklift lifted a pallet onto the forks within 16s')
  process.exit(1)
}

resetRuntime()
let reverseDock = false
let sawArc = false
let lastH = runtime.units['trk-18']?.heading ?? 0
const inboundZ = runtime.units['trk-18']?.z ?? 11.2
for (let i = 0; i < 24 / dt; i += 1) {
  tick(dt)
  const truck = runtime.units['trk-18']
  const turn = wrapDelta(lastH, truck.heading)
  if (turn > 0.015 && truck.v > 0.4 && truck.z < inboundZ - 0.4 && truck.z > 6) sawArc = true
  lastH = truck.heading
  if (truck.reservedDock === 'bay-3' && truck.z < 1.2 && Math.abs(truck.heading) < 0.25 && sawArc) {
    reverseDock = true
    break
  }
}
if (!reverseDock) {
  const truck = runtime.units['trk-18']
  console.error(
    `trk-18 did not reverse-arc into Bay 3  x=${truck.x.toFixed(2)} z=${truck.z.toFixed(2)} h=${truck.heading.toFixed(2)} dock=${truck.reservedDock} arc=${sawArc}`,
  )
  process.exit(1)
}

void lerpPose

console.log(`yard sim ok  ${seconds}s  pallets=${start.total} stacks=${start.stacks}  lift=${liftSeen}  reverseDock=${reverseDock}`)
