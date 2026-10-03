import { useLook } from '../look'
import { Matte } from './Matte'

export function MapPin() {
  const accent = useLook((s) => s.accent)
  const wall = useLook((s) => s.wall)
  return (
    <group position={[0, 2.55, 0]} scale={1.35}>
      <mesh castShadow>
        <sphereGeometry args={[0.32, 16, 12]} />
        <Matte color={accent} />
      </mesh>
      <mesh position={[0, -0.42, 0]} rotation={[Math.PI, 0, 0]} castShadow>
        <coneGeometry args={[0.22, 0.62, 12]} />
        <Matte color={accent} />
      </mesh>
      <mesh position={[0, 0.04, 0.18]}>
        <circleGeometry args={[0.14, 16]} />
        <Matte color={wall} />
      </mesh>
    </group>
  )
}
