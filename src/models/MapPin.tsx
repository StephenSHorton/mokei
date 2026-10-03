import { useLook } from '../look'
import { Matte } from './Matte'

export function MapPin() {
  const accent = useLook((s) => s.accent)
  const wall = useLook((s) => s.wall)
  return (
    <group position={[0, 2.15, 0]}>
      <mesh castShadow>
        <sphereGeometry args={[0.28, 16, 12]} />
        <Matte color={accent} />
      </mesh>
      <mesh position={[0, -0.38, 0]} rotation={[Math.PI, 0, 0]} castShadow>
        <coneGeometry args={[0.2, 0.55, 12]} />
        <Matte color={accent} />
      </mesh>
      <mesh position={[0, 0.02, 0.16]}>
        <circleGeometry args={[0.12, 16]} />
        <Matte color={wall} />
      </mesh>
    </group>
  )
}
