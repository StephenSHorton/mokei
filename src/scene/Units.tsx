import { Line } from '@react-three/drei'
import { useFrame, useThree } from '@react-three/fiber'
import { useMemo, useRef, useState } from 'react'
import { Vector3 } from 'three'
import type { Group } from 'three'
import { writeLabel } from '../ui/labelBridge'
import { useLook } from '../look'
import { Forklift } from '../models/Forklift'
import { MapPin } from '../models/MapPin'
import { Pallet } from '../models/Pallet'
import { SelectionMarker } from '../models/SelectionMarker'
import { Truck } from '../models/Truck'
import {
  PALLET_IDS,
  UNIT_IDS,
  runtime,
  sampleRemainingPath,
  useYard,
} from '../sim/yard'

export function Units() {
  const selectedId = useYard((s) => s.selectedId)
  const select = useYard((s) => s.select)
  const accent = useLook((s) => s.accent)

  return (
    <group>
      <LabelTracker selectedId={selectedId} />
      {UNIT_IDS.map((id) => (
        <UnitMesh
          key={id}
          id={id}
          selected={selectedId === id}
          onSelect={() => select(id)}
        />
      ))}
      {PALLET_IDS.map((id) => (
        <PalletActor key={id} id={id} />
      ))}
      <RouteLine selectedId={selectedId} color={accent} />
    </group>
  )
}

function UnitMesh({
  id,
  selected,
  onSelect,
}: {
  id: string
  selected: boolean
  onSelect: () => void
}) {
  const group = useRef<Group>(null)
  const unit = runtime.units[id]
  const box: [number, number, number] = unit.kind === 'truck' ? [3.1, 3.4, 7.4] : [2.1, 3.0, 3.6]

  useFrame(() => {
    const live = runtime.units[id]
    if (!group.current || !live) return
    group.current.position.set(live.x, 0, live.z)
    group.current.rotation.y = live.heading
  })

  return (
    <group
      ref={group}
      position={[unit.x, 0, unit.z]}
      rotation={[0, unit.heading, 0]}
      onPointerDown={(event) => event.stopPropagation()}
      onClick={(event) => {
        event.stopPropagation()
        onSelect()
      }}
    >
      {unit.kind === 'truck' ? (
        <Truck accent={unit.accent === 'teal' ? 'teal' : 'blue'} />
      ) : (
        <Forklift />
      )}
      {selected ? (
        <group position={[0, 0, unit.kind === 'truck' ? 0.2 : 0.55]}>
          <SelectionMarker size={box} />
        </group>
      ) : null}
    </group>
  )
}

function LabelTracker({ selectedId }: { selectedId: string | null }) {
  const camera = useThree((s) => s.camera)
  const size = useThree((s) => s.size)
  const scratch = useMemo(() => new Vector3(), [])

  useFrame(() => {
    const unit = selectedId ? runtime.units[selectedId] : null
    if (!unit) {
      writeLabel('unit', 0, 0, '', false)
    } else {
      scratch.set(unit.x, unit.kind === 'truck' ? 4.3 : 3.55, unit.z)
      scratch.project(camera)
      const x = (scratch.x * 0.5 + 0.5) * size.width
      const y = (-scratch.y * 0.5 + 0.5) * size.height
      writeLabel('unit', x, y - 6, `<b>${unit.code}</b><span>${unit.title}</span>`, scratch.z < 1)
    }

    const pallet = runtime.pallets[FOCUS_PALLET]
    if (!pallet || pallet.carriedBy || pallet.hiddenUntil > runtime.clock) {
      writeLabel('pallet', 0, 0, '', false)
      return
    }
    scratch.set(pallet.x, (0.3 + pallet.stacks * 0.58) * 1.14 + 0.35, pallet.z)
    scratch.project(camera)
    const x = (scratch.x * 0.5 + 0.5) * size.width
    const y = (-scratch.y * 0.5 + 0.5) * size.height
    writeLabel('pallet', x, y - 4, `<b>${pallet.code}</b><span>${FOCUS_PALLET_TITLE}</span>`, true)
  })

  return null
}

const FOCUS_PALLET = 'p6'
const FOCUS_PALLET_TITLE = 'Safety Helmet'

function PalletActor({ id }: { id: string }) {
  const group = useRef<Group>(null)
  const pin = useRef<Group>(null)
  const pallet = runtime.pallets[id]

  useFrame(() => {
    const live = runtime.pallets[id]
    if (!group.current || !live) return
    const hidden = live.hiddenUntil > runtime.clock && !live.carriedBy
    group.current.visible = !hidden
    group.current.position.set(live.x, live.carriedBy ? 0.42 : 0, live.z)
    group.current.rotation.y = live.heading
    if (pin.current) pin.current.visible = !live.carriedBy
  })

  return (
    <group ref={group} position={[pallet.x, 0, pallet.z]} rotation={[0, pallet.heading, 0]}>
      <Pallet stacks={pallet.stacks} wrap={pallet.wrap} seed={pallet.code.length + pallet.stacks} />
      {pallet.pin ? (
        <group ref={pin}>
          <MapPin height={(0.3 + pallet.stacks * 0.58) * 1.14 + 0.28} />
        </group>
      ) : null}
    </group>
  )
}

function RouteLine({ selectedId, color }: { selectedId: string | null; color: string }) {
  const [points, setPoints] = useState<[number, number, number][]>([
    [0, 0.04, 0],
    [0.1, 0.04, 0.1],
  ])
  const acc = useRef(0)
  const fallback = useMemo<[number, number, number][]>(() => [[0, 0.04, 0], [0.1, 0.04, 0.1]], [])

  useFrame((_, dt) => {
    acc.current += dt
    if (acc.current < 0.16) return
    acc.current = 0
    if (!selectedId || selectedId === 'wh-northpoint') {
      setPoints(fallback)
      return
    }
    const unit = runtime.units[selectedId]
    if (!unit) {
      setPoints(fallback)
      return
    }
    const next = sampleRemainingPath(unit, runtime.clock)
    if (next.length > 1) setPoints(next)
  })

  if (!selectedId || selectedId === 'wh-northpoint' || points.length < 2) return null

  return <Line points={points} color={color} dashed dashSize={0.5} gapSize={0.32} lineWidth={2.2} transparent opacity={0.85} />
}
