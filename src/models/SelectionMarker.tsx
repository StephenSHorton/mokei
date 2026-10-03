import { Line } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import type { Group } from 'three'
import { useLook } from '../look'

export function SelectionMarker({ radius = 1.55 }: { radius?: number }) {
  const accent = useLook((s) => s.accent)
  const group = useRef<Group>(null)
  const ring = useMemo(() => ringPoints(radius, 56), [radius])

  useFrame(({ clock }) => {
    if (!group.current) return
    const pulse = 1 + Math.sin(clock.elapsedTime * 2.6) * 0.045
    group.current.scale.setScalar(pulse)
  })

  return (
    <group ref={group} position={[0, 0.03, 0]}>
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[radius * 0.72, 32]} />
        <meshStandardMaterial
          color={accent}
          transparent
          opacity={0.12}
          roughness={1}
          metalness={0}
          depthWrite={false}
        />
      </mesh>
      <Line points={ring} color={accent} dashed dashSize={0.18} gapSize={0.12} lineWidth={1.6} />
      <Corner x={-radius * 0.82} z={-radius * 0.82} color={accent} />
      <Corner x={radius * 0.82} z={-radius * 0.82} color={accent} rot={-Math.PI / 2} />
      <Corner x={radius * 0.82} z={radius * 0.82} color={accent} rot={Math.PI} />
      <Corner x={-radius * 0.82} z={radius * 0.82} color={accent} rot={Math.PI / 2} />
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
    <group position={[x, 0.02, z]} rotation={[0, rot, 0]}>
      <mesh>
        <boxGeometry args={[0.42, 0.035, 0.07]} />
        <meshStandardMaterial color={color} roughness={1} metalness={0} />
      </mesh>
      <mesh position={[0.175, 0, 0.175]}>
        <boxGeometry args={[0.07, 0.035, 0.42]} />
        <meshStandardMaterial color={color} roughness={1} metalness={0} />
      </mesh>
    </group>
  )
}

function ringPoints(radius: number, segments: number) {
  const pts: [number, number, number][] = []
  for (let i = 0; i <= segments; i += 1) {
    const a = (i / segments) * Math.PI * 2
    pts.push([Math.cos(a) * radius, 0.04, Math.sin(a) * radius])
  }
  return pts
}
