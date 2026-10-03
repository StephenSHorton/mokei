import { useFrame } from '@react-three/fiber'
import { useRef } from 'react'
import type { Group } from 'three'
import { useLook } from '../look'

export function SelectionMarker({ radius = 1.55 }: { radius?: number }) {
  const accent = useLook((s) => s.accent)
  const group = useRef<Group>(null)

  useFrame(({ clock }) => {
    if (!group.current) return
    const pulse = 1 + Math.sin(clock.elapsedTime * 2.6) * 0.05
    group.current.scale.setScalar(pulse)
  })

  return (
    <group ref={group} position={[0, 0.07, 0]}>
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[radius * 0.78, 36]} />
        <meshBasicMaterial color={accent} transparent opacity={0.16} depthWrite={false} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[radius * 0.78, radius * 1.16, 56]} />
        <meshBasicMaterial color={accent} transparent opacity={0.95} depthWrite={false} />
      </mesh>
      <Corner x={-radius * 0.86} z={-radius * 0.86} color={accent} />
      <Corner x={radius * 0.86} z={-radius * 0.86} color={accent} rot={-Math.PI / 2} />
      <Corner x={radius * 0.86} z={radius * 0.86} color={accent} rot={Math.PI} />
      <Corner x={-radius * 0.86} z={radius * 0.86} color={accent} rot={Math.PI / 2} />
    </group>
  )
}

function Corner({
  x,
  z,
  color,
  rot = 0,
}: {
  x: number
  z: number
  color: string
  rot?: number
}) {
  return (
    <group position={[x, 0.025, z]} rotation={[0, rot, 0]}>
      <mesh>
        <boxGeometry args={[0.55, 0.05, 0.1]} />
        <meshBasicMaterial color={color} />
      </mesh>
      <mesh position={[0.225, 0, 0.225]}>
        <boxGeometry args={[0.1, 0.05, 0.55]} />
        <meshBasicMaterial color={color} />
      </mesh>
    </group>
  )
}
