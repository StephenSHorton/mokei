import { useFrame } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import type { Group, Texture } from 'three'
import { softShadowTexture } from '../models/textures'
import { UNIT_IDS, runtime } from '../sim/yard'

/** Soft contact blobs under moving units so they always feel grounded. */
export function ContactBlobs() {
  const tex = useMemo(() => softShadowTexture(0.32), [])
  return (
    <group>
      {UNIT_IDS.map((id) => (
        <UnitBlob key={id} id={id} map={tex} />
      ))}
    </group>
  )
}

function UnitBlob({ id, map }: { id: string; map: Texture }) {
  const group = useRef<Group>(null)
  const unit = runtime.units[id]
  const truck = unit.kind === 'truck'

  useFrame(() => {
    const live = runtime.units[id]
    if (!group.current || !live) return
    group.current.position.set(live.x, 0.035, live.z)
    group.current.rotation.y = live.heading
  })

  return (
    <group ref={group} position={[unit.x, 0.035, unit.z]} rotation={[0, unit.heading, 0]}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, truck ? 0 : 0.1]}>
        <planeGeometry args={truck ? [3.6, 7.6] : [2.3, 3.2]} />
        <meshBasicMaterial map={map} transparent depthWrite={false} />
      </mesh>
    </group>
  )
}
