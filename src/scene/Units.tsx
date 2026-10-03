import { Html, Line } from '@react-three/drei'
import { useLook } from '../look'
import { Forklift } from '../models/Forklift'
import { MapPin } from '../models/MapPin'
import { Pallet } from '../models/Pallet'
import { SelectionMarker } from '../models/SelectionMarker'
import { Truck } from '../models/Truck'
import { sampleRemainingPath, useYard, type Unit } from '../sim/yard'

export function Units() {
  const units = useYard((s) => s.units)
  const pallets = useYard((s) => s.pallets)
  const selectedId = useYard((s) => s.selectedId)
  const clock = useYard((s) => s.clock)
  const select = useYard((s) => s.select)
  const selected = selectedId ? units[selectedId] : null
  const path = selected ? sampleRemainingPath(selected, clock) : []
  const accent = useLook((s) => s.accent)

  return (
    <group>
      {Object.values(units).map((unit) => (
        <UnitMesh
          key={unit.id}
          unit={unit}
          selected={selectedId === unit.id}
          onSelect={() => select(unit.id)}
        />
      ))}
      {Object.values(pallets).map((pallet) => {
        if (pallet.hiddenUntil > clock && !pallet.carriedBy) return null
        return (
          <group key={pallet.id} position={[pallet.x, pallet.carriedBy ? 0.42 : 0, pallet.z]} rotation={[0, pallet.heading, 0]}>
            <Pallet stacks={pallet.stacks} wrap={pallet.wrap} />
            {pallet.pin && !pallet.carriedBy ? <MapPin /> : null}
          </group>
        )
      })}
      {path.length > 1 ? (
        <Line points={path} color={accent} dashed dashSize={0.42} gapSize={0.28} lineWidth={1.35} />
      ) : null}
    </group>
  )
}

function UnitMesh({
  unit,
  selected,
  onSelect,
}: {
  unit: Unit
  selected: boolean
  onSelect: () => void
}) {
  const radius = unit.kind === 'truck' ? 2.35 : 1.45
  return (
    <group
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
      {selected ? (
        <Html position={[0, unit.kind === 'truck' ? 3.15 : 2.35, 0]} center zIndexRange={[20, 0]}>
          <div className="pointer-events-none whitespace-nowrap rounded-full bg-white/92 px-3 py-1 text-[12px] font-medium text-slate-700 shadow-[0_8px_20px_rgba(15,23,42,0.08)] ring-1 ring-white">
            <span className="mr-1.5 inline-block h-1.5 w-1.5 rounded-full bg-blue-600 align-middle" />
            {unit.code} · {unit.title}
          </div>
        </Html>
      ) : null}
    </group>
  )
}
