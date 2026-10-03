import { RoundedBox } from '@react-three/drei'
import { useLook } from '../look'
import { Matte } from './Matte'

export function Forklift() {
  const yellow = useLook((s) => s.yellow)
  const tire = useLook((s) => s.tire)
  const wall = useLook((s) => s.wall)

  return (
    <group scale={1.28}>
      <RoundedBox args={[1.28, 0.64, 1.58]} radius={0.12} smoothness={3} position={[0, 0.62, -0.06]} castShadow receiveShadow>
        <Matte color={yellow} />
      </RoundedBox>
      <RoundedBox args={[1.02, 0.48, 0.72]} radius={0.1} smoothness={3} position={[0, 1.14, -0.28]} castShadow>
        <Matte color={yellow} />
      </RoundedBox>
      <RoundedBox args={[0.4, 0.18, 0.32]} radius={0.04} smoothness={2} position={[0, 1.32, -0.06]}>
        <Matte color={tire} />
      </RoundedBox>
      <RoundedBox args={[0.2, 1.72, 0.24]} radius={0.04} smoothness={2} position={[-0.26, 1.28, 0.82]} castShadow>
        <Matte color={tire} />
      </RoundedBox>
      <RoundedBox args={[0.2, 1.72, 0.24]} radius={0.04} smoothness={2} position={[0.26, 1.28, 0.82]} castShadow>
        <Matte color={tire} />
      </RoundedBox>
      <RoundedBox args={[0.1, 0.08, 1.15]} radius={0.02} smoothness={2} position={[-0.26, 0.32, 1.42]} castShadow>
        <Matte color="#94a3b8" />
      </RoundedBox>
      <RoundedBox args={[0.1, 0.08, 1.15]} radius={0.02} smoothness={2} position={[0.26, 0.32, 1.42]} castShadow>
        <Matte color="#94a3b8" />
      </RoundedBox>
      <RoundedBox args={[1.08, 0.08, 0.1]} radius={0.02} smoothness={2} position={[0, 2.12, 0.22]} castShadow>
        <Matte color={tire} />
      </RoundedBox>
      <RoundedBox args={[0.08, 0.82, 0.08]} radius={0.02} smoothness={2} position={[-0.5, 1.7, -0.1]} castShadow>
        <Matte color={tire} />
      </RoundedBox>
      <RoundedBox args={[0.08, 0.82, 0.08]} radius={0.02} smoothness={2} position={[0.5, 1.7, -0.1]} castShadow>
        <Matte color={tire} />
      </RoundedBox>
      <RoundedBox args={[0.82, 0.32, 0.1]} radius={0.02} smoothness={2} position={[0, 1.42, -0.62]}>
        <Matte color={wall} />
      </RoundedBox>
      <Wheel x={-0.54} z={0.48} />
      <Wheel x={0.54} z={0.48} />
      <Wheel x={-0.54} z={-0.56} r={0.3} />
      <Wheel x={0.54} z={-0.56} r={0.3} />
    </group>
  )
}

function Wheel({ x, z, r = 0.26 }: { x: number; z: number; r?: number }) {
  const tire = useLook((s) => s.tire)
  return (
    <mesh position={[x, r, z]} rotation={[0, 0, Math.PI / 2]} castShadow>
      <cylinderGeometry args={[r, r, 0.24, 14]} />
      <Matte color={tire} />
    </mesh>
  )
}
