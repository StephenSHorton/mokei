import { useFrame } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import { CanvasTexture, type Group, type Mesh } from 'three'
import { UNIT_IDS, runtime } from '../sim/yard'

export function ContactBlobs() {
  const tex = useMemo(() => makeSoftShadow(0.4), [])
  const building = useMemo(() => makeSoftShadow(0.32), [])

  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.016, -10.4]}>
        <planeGeometry args={[40, 20]} />
        <meshBasicMaterial map={building} transparent depthWrite={false} />
      </mesh>
      {UNIT_IDS.map((id) => (
        <UnitBlob key={id} id={id} map={tex} />
      ))}
    </group>
  )
}

function UnitBlob({ id, map }: { id: string; map: CanvasTexture }) {
  const group = useRef<Group>(null)
  const mesh = useRef<Mesh>(null)
  const unit = runtime.units[id]
  const truck = unit.kind === 'truck'

  useFrame(() => {
    const live = runtime.units[id]
    if (!group.current || !live) return
    group.current.position.set(live.x, 0.02, live.z)
    group.current.rotation.y = live.heading
  })

  return (
    <group ref={group} position={[unit.x, 0.02, unit.z]} rotation={[0, unit.heading, 0]}>
      <mesh ref={mesh} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, truck ? -0.35 : 0]}>
        <planeGeometry args={truck ? [3.4, 6.4] : [2.2, 2.8]} />
        <meshBasicMaterial map={map} transparent depthWrite={false} />
      </mesh>
    </group>
  )
}

function makeSoftShadow(strength: number) {
  const size = 256
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d')
  if (!ctx) return new CanvasTexture(canvas)
  const gradient = ctx.createRadialGradient(size / 2, size / 2, size * 0.08, size / 2, size / 2, size * 0.48)
  gradient.addColorStop(0, `rgba(71, 85, 105, ${strength})`)
  gradient.addColorStop(0.55, `rgba(71, 85, 105, ${strength * 0.35})`)
  gradient.addColorStop(1, 'rgba(71, 85, 105, 0)')
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, size, size)
  const texture = new CanvasTexture(canvas)
  texture.needsUpdate = true
  return texture
}
