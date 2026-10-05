import { cargoInForkEnvelope, CARRY_LIFT, lerpPose, MAX_HEADING_STEP, MAX_POS_STEP, STOPPED_SPEED, TRUCK_R_MIN, truckOnRoad, unitOnSurface, vehicleBoxes } from '../src/scenes/yardline/sim/geom.ts'
import { crateCensus, overlapViolations, palletVisible, resetRuntime, runtime, sweptOverlap, tick } from '../src/scenes/yardline/sim/yard.ts'

/*
  Why the previous checker missed forklift clips
  ---------------------------------------------
  1. Fork OBB was a single 0.82×1.55 box on the chassis. Visual tines reach
     ~2.42 m forward, so a forklift could drive forks through a cab / trailer
     (Bay 2 at ~0:09, TRK-18 reverse at ~0:05) without overlapOBB firing.
  2. Pallet stacks were not in the static set, so a load or decorative stack
     was invisible to poseHits / sweptOverlap.
  3. Dock-cell reservation only claimed the full bay when the truck was already
     moving or past z=3.6. A slow reverse-arc left the bay mouth open, and
     forklifts were not required to yield to a reversing truck.
  4. The published clip crossfaded 1 s freeze stills (minterpolate=blend). A
     forklift at t ghosted onto a truck at t+1 — that is not a sim overlap.

  This run uses the same body+fork OBBs as the runtime, classifies every
  forklift-vs-truck, forklift-vs-forklift, and forklift-vs-static/stack hit,
  and asserts each visible pallet's world position is continuous so a load
  cannot teleport onto a roof or vanish without an explicit site change.
*/

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
const MAX_PALLET_JUMP = 0.32
const TRUCK_OMEGA_EPS = 0.12
const prev = Object.fromEntries(
  Object.values(runtime.units).map((u) => [u.id, { x: u.x, z: u.z, heading: u.heading, v: u.v }]),
)
const prevPallet = Object.fromEntries(
  Object.values(runtime.pallets).map((p) => [p.id, { x: p.x, z: p.z, y: p.y, site: p.site }]),
)

let classified = { flTruck: 0, flFl: 0, flStatic: 0 }

for (let i = 0; i < seconds / dt; i += 1) {
  tick(dt)
  const hits = overlapViolations()
  if (hits.length) {
    console.error(`t=${runtime.clock.toFixed(2)} ${hits.join('; ')}`)
    process.exit(1)
  }
  for (const hit of hits) {
    if (hit.includes('forklift') && hit.includes('truck')) classified.flTruck += 1
    if (hit.includes('overlaps forklift')) classified.flFl += 1
    if (hit.includes('hits static')) classified.flStatic += 1
  }
  for (const unit of Object.values(runtime.units)) {
    const before = prev[unit.id]
    const jump = Math.hypot(unit.x - before.x, unit.z - before.z)
    const turn = wrapDelta(before.heading, unit.heading)
    if (jump > MAX_JUMP) {
      console.error(`t=${runtime.clock.toFixed(2)} ${unit.id} jumped ${jump.toFixed(3)}m`)
      process.exit(1)
    }
    if (unit.kind === 'truck') {
      const omega = turn / dt
      const vRef = Math.max(before.v, unit.v)
      const limit = vRef / TRUCK_R_MIN + TRUCK_OMEGA_EPS
      if (omega > limit) {
        console.error(
          `t=${runtime.clock.toFixed(2)} ${unit.id} bicycle |dH/dt|=${omega.toFixed(3)} > |v|/${TRUCK_R_MIN.toFixed(2)}+eps=${limit.toFixed(3)} v=${vRef.toFixed(3)}`,
        )
        process.exit(1)
      }
      if (vRef < STOPPED_SPEED && turn > 1e-4) {
        console.error(`t=${runtime.clock.toFixed(2)} ${unit.id} turned ${turn.toFixed(4)}rad while stopped v=${vRef.toFixed(3)}`)
        process.exit(1)
      }
    } else if (turn > MAX_HEADING) {
      console.error(`t=${runtime.clock.toFixed(2)} ${unit.id} heading snap ${turn.toFixed(3)}rad`)
      process.exit(1)
    }
    if (unit.kind === 'forklift' && unit.v < STOPPED_SPEED && unit.insert > 0.12 && turn > 0.002) {
      console.error(`t=${runtime.clock.toFixed(2)} ${unit.id} turned in a pallet insert=${unit.insert.toFixed(3)}`)
      process.exit(1)
    }
    if (sweptOverlap(before, unit)) {
      console.error(`t=${runtime.clock.toFixed(2)} ${unit.id} swept overlap`)
      process.exit(1)
    }
    prev[unit.id] = { x: unit.x, z: unit.z, heading: unit.heading, v: unit.v }
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
      if (unit.phase === 'drive' && unit.lift > CARRY_LIFT + 0.08) {
        console.error(`t=${runtime.clock.toFixed(2)} ${unit.id} carry height too high lift=${unit.lift.toFixed(3)}`)
        process.exit(1)
      }
    }
    if (unit.kind === 'truck' && vehicleBoxes('truck', unit.x, unit.z, unit.heading).length !== 2) {
      console.error(`${unit.id} is missing cab/trailer boxes`)
      process.exit(1)
    }
    if (unit.kind === 'forklift' && vehicleBoxes('forklift', unit.x, unit.z, unit.heading).length !== 2) {
      console.error(`${unit.id} is missing body/fork boxes`)
      process.exit(1)
    }
  }
  for (const pallet of Object.values(runtime.pallets)) {
    const before = prevPallet[pallet.id]
    const siteChanged = before.site !== pallet.site
    if (palletVisible(pallet) && palletVisible({ ...pallet, site: before.site }) && !siteChanged) {
      const jump = Math.hypot(pallet.x - before.x, pallet.z - before.z, pallet.y - before.y)
      if (jump > MAX_PALLET_JUMP) {
        console.error(
          `t=${runtime.clock.toFixed(2)} ${pallet.id} pallet jump ${jump.toFixed(3)}m site=${pallet.site}`,
        )
        process.exit(1)
      }
    }
    if (before.site === 'forklift' && pallet.site !== 'forklift' && pallet.site !== 'truck' && pallet.site !== 'warehouse' && pallet.site !== 'yard') {
      console.error(`t=${runtime.clock.toFixed(2)} ${pallet.id} left forks without a set-down (${pallet.site})`)
      process.exit(1)
    }
    prevPallet[pallet.id] = { x: pallet.x, z: pallet.z, y: pallet.y, site: pallet.site }
  }
  const now = crateCensus()
  if (now.total !== start.total || now.stacks !== start.stacks) {
    console.error(`crate conservation broke at t=${runtime.clock.toFixed(2)}`, now)
    process.exit(1)
  }
}

if (classified.flTruck || classified.flFl || classified.flStatic) {
  console.error('classified overlap counts should stay at zero', classified)
  process.exit(1)
}

resetRuntime()
let liftSeen = false
for (let i = 0; i < 16 / dt; i += 1) {
  tick(dt)
  for (const unit of Object.values(runtime.units)) {
    if (unit.kind !== 'forklift' || !unit.carryingId || unit.phase !== 'lift') continue
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
const inboundH = runtime.units['trk-18']?.heading ?? 0
const inboundZ = runtime.units['trk-18']?.z ?? 11.2
for (let i = 0; i < 40 / dt; i += 1) {
  tick(dt)
  const truck = runtime.units['trk-18']
  if (truck.reverse && truck.v > 0.2 && truck.z < inboundZ - 0.4 && truck.z > 4) {
    if (wrapDelta(inboundH, truck.heading) > 0.55) sawArc = true
  }
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

console.log(
  `yard sim ok  ${seconds}s  pallets=${start.total} stacks=${start.stacks}  lift=${liftSeen}  reverseDock=${reverseDock}  fl-vs-truck=0 fl-vs-fl=0 fl-vs-static=0`,
)
