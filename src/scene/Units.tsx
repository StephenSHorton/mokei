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
  const radius = unit.kind === 'truck' ? 2.6 : 1.75

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
      {selected ? <SelectionMarker radius={radius} /> : null}
    </group>
  )
}

function LabelTracker({ selectedId }: { selectedId: string | null }) {
  const camera = useThree((s) => s.camera)
  const size = useThree((s) => s.size)
  const scratch = useMemo(() => new Vector3(), [])

  useFrame(() => {
    if (!selectedId || selectedId === 'wh-northpoint') {
      writeLabel(0, 0, '', false)
      return
    }
    const unit = runtime.units[selectedId]
    if (!unit) {
      writeLabel(0, 0, '', false)
      return
    }
    scratch.set(unit.x, unit.kind === 'truck' ? 3.4 : 2.6, unit.z)
    scratch.project(camera)
    const x = (scratch.x * 0.5 + 0.5) * size.width
    const y = (-scratch.y * 0.5 + 0.5) * size.height
    writeLabel(x, y, `${unit.code} · ${unit.title}`, scratch.z < 1)
  })

  return null
}

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
      <Pallet stacks={pallet.stacks} wrap={pallet.wrap} />
      {pallet.pin ? (
        <group ref={pin}>
          <MapPin />
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

  return <Line points={points} color={color} dashed dashSize={0.42} gapSize={0.28} lineWidth={1.35} />
}
