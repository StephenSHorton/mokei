import { truckOnRoad, unitOnSurface } from '../src/scenes/yardline/sim/geom.ts'
import { crateCensus, overlapViolations, resetRuntime, runtime, tick } from '../src/scenes/yardline/sim/yard.ts'

resetRuntime()
const start = crateCensus()
if (start.total !== 10) {
  console.error(`expected 10 pallets, got ${start.total}`)
  process.exit(1)
}

const dt = 1 / 60
const seconds = 90
for (let i = 0; i < seconds / dt; i += 1) {
  tick(dt)
  const hits = overlapViolations()
  if (hits.length) {
    console.error(`t=${runtime.clock.toFixed(2)} ${hits.join('; ')}`)
    process.exit(1)
  }
  for (const unit of Object.values(runtime.units)) {
    if (unit.kind === 'truck' && !truckOnRoad(unit.x, unit.z)) {
      console.error(`t=${runtime.clock.toFixed(2)} ${unit.id} left the road at ${unit.x.toFixed(2)},${unit.z.toFixed(2)}`)
      process.exit(1)
    }
    if (unit.kind === 'forklift' && !unitOnSurface('forklift', unit.x, unit.z)) {
      console.error(`t=${runtime.clock.toFixed(2)} ${unit.id} left the lot at ${unit.x.toFixed(2)},${unit.z.toFixed(2)}`)
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
    if (unit.kind !== 'forklift' || !unit.carryingId || unit.lift <= 0.35) continue
    const pallet = runtime.pallets[unit.carryingId]
    if (pallet && pallet.site === 'forklift' && pallet.y > 0.3) {
      liftSeen = true
      break
    }
  }
  if (liftSeen) break
}
if (!liftSeen) {
  console.error('no forklift lifted a pallet within 16s')
  process.exit(1)
}

resetRuntime()
let reverseDock = false
const inboundZ = runtime.units['trk-18']?.z ?? 11.2
const inboundX = runtime.units['trk-18']?.x ?? -14
for (let i = 0; i < 20 / dt; i += 1) {
  tick(dt)
  const truck = runtime.units['trk-18']
  if (
    truck &&
    truck.reservedDock === 'bay-3' &&
    truck.z < inboundZ - 4 &&
    Math.abs(truck.heading) < 0.35 &&
    truck.z < 6
  ) {
    reverseDock = true
    break
  }
}
if (!reverseDock) {
  const truck = runtime.units['trk-18']
  console.error(
    `trk-18 did not reverse into Bay 3 within 20s  x=${truck.x.toFixed(2)} z=${truck.z.toFixed(2)} h=${truck.heading.toFixed(2)} dock=${truck.reservedDock} start=${inboundX},${inboundZ}`,
  )
  process.exit(1)
}

console.log(`yard sim ok  ${seconds}s  pallets=${start.total} stacks=${start.stacks}  lift=${liftSeen}  reverseDock=${reverseDock}`)
