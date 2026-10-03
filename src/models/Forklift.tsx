import { RoundedBox } from '@react-three/drei'
import { useLook } from '../look'
import { Matte } from './Matte'

export function Forklift() {
  const yellow = useLook((s) => s.yellow)
  const tire = useLook((s) => s.tire)
  const wall = useLook((s) => s.wall)

  return (
    <group>
      <RoundedBox args={[1.12, 0.58, 1.42]} radius={0.1} smoothness={3} position={[0, 0.54, -0.08]} castShadow receiveShadow>
        <Matte color={yellow} />
      </RoundedBox>
      <RoundedBox args={[0.86, 0.42, 0.62]} radius={0.08} smoothness={3} position={[0, 1.02, -0.28]} castShadow>
        <Matte color={yellow} />
      </RoundedBox>
      <RoundedBox args={[0.34, 0.16, 0.28]} radius={0.04} smoothness={2} position={[0, 1.18, -0.08]}>
        <Matte color={tire} />
      </RoundedBox>
      <RoundedBox args={[0.16, 1.55, 0.2]} radius={0.04} smoothness={2} position={[-0.22, 1.15, 0.72]} castShadow>
        <Matte color={tire} />
      </RoundedBox>
      <RoundedBox args={[0.16, 1.55, 0.2]} radius={0.04} smoothness={2} position={[0.22, 1.15, 0.72]} castShadow>
        <Matte color={tire} />
      </RoundedBox>
      <RoundedBox args={[0.08, 0.07, 0.95]} radius={0.02} smoothness={2} position={[-0.22, 0.28, 1.28]} castShadow>
        <Matte color="#94a3b8" />
      </RoundedBox>
      <RoundedBox args={[0.08, 0.07, 0.95]} radius={0.02} smoothness={2} position={[0.22, 0.28, 1.28]} castShadow>
        <Matte color="#94a3b8" />
      </RoundedBox>
      <RoundedBox args={[0.94, 0.06, 0.08]} radius={0.02} smoothness={2} position={[0, 1.92, 0.18]} castShadow>
        <Matte color={tire} />
      </RoundedBox>
      <RoundedBox args={[0.06, 0.72, 0.06]} radius={0.02} smoothness={2} position={[-0.44, 1.55, -0.12]} castShadow>
        <Matte color={tire} />
      </RoundedBox>
      <RoundedBox args={[0.06, 0.72, 0.06]} radius={0.02} smoothness={2} position={[0.44, 1.55, -0.12]} castShadow>
        <Matte color={tire} />
      </RoundedBox>
      <RoundedBox args={[0.72, 0.28, 0.08]} radius={0.02} smoothness={2} position={[0, 1.28, -0.58]}>
        <Matte color={wall} />
      </RoundedBox>
      <Wheel x={-0.48} z={0.42} />
      <Wheel x={0.48} z={0.42} />
      <Wheel x={-0.48} z={-0.52} r={0.26} />
      <Wheel x={0.48} z={-0.52} r={0.26} />
    </group>
  )
}

function Wheel({ x, z, r = 0.22 }: { x: number; z: number; r?: number }) {
  const tire = useLook((s) => s.tire)
  return (
    <mesh position={[x, r, z]} rotation={[0, 0, Math.PI / 2]} castShadow>
      <cylinderGeometry args={[r, r, 0.2, 14]} />
      <Matte color={tire} />
    </mesh>
  )
}
