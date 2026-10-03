import { RoundedBox } from '@react-three/drei'
import { useLook } from '../look'
import { Matte } from './Matte'

type TruckProps = {
  accent?: 'blue' | 'teal'
}

export function Truck({ accent = 'blue' }: TruckProps) {
  const roof = useLook((s) => s.roof)
  const tire = useLook((s) => s.tire)
  const wall = useLook((s) => s.wall)
  const stripe = accent === 'teal' ? '#0f766e' : roof

  return (
    <group scale={1.06}>
      <RoundedBox args={[2.15, 1.42, 1.85]} radius={0.12} smoothness={3} position={[0, 1.12, 2.15]} castShadow receiveShadow>
        <Matte color={wall} />
      </RoundedBox>
      <RoundedBox args={[2.05, 0.72, 0.08]} radius={0.03} smoothness={2} position={[0, 1.42, 3.05]}>
        <Matte color="#0f172a" />
      </RoundedBox>
      <RoundedBox args={[2.28, 2.05, 4.35]} radius={0.12} smoothness={3} position={[0, 1.55, -0.55]} castShadow receiveShadow>
        <Matte color={wall} />
      </RoundedBox>
      <RoundedBox args={[2.32, 0.22, 4.4]} radius={0.04} smoothness={2} position={[0, 2.62, -0.55]} castShadow>
        <Matte color={stripe} />
      </RoundedBox>
      <RoundedBox args={[2.34, 0.34, 4.2]} radius={0.04} smoothness={2} position={[0, 0.42, -0.5]} receiveShadow>
        <Matte color={stripe} />
      </RoundedBox>
      <RoundedBox args={[2.05, 0.08, 1.55]} radius={0.02} smoothness={2} position={[0, 1.55, 3.08]}>
        <Matte color="#94a3b8" />
      </RoundedBox>
      <Wheel x={-0.92} z={1.85} />
      <Wheel x={0.92} z={1.85} />
      <Wheel x={-0.92} z={-1.55} />
      <Wheel x={0.92} z={-1.55} />
      <Wheel x={-0.92} z={-2.35} />
      <Wheel x={0.92} z={-2.35} />
      <RoundedBox args={[0.18, 0.32, 0.22]} radius={0.03} smoothness={2} position={[-1.18, 1.55, 2.85]} castShadow>
        <Matte color={tire} />
      </RoundedBox>
      <RoundedBox args={[0.18, 0.32, 0.22]} radius={0.03} smoothness={2} position={[1.18, 1.55, 2.85]} castShadow>
        <Matte color={tire} />
      </RoundedBox>
    </group>
  )
}

function Wheel({ x, z }: { x: number; z: number }) {
  const tire = useLook((s) => s.tire)
  return (
    <mesh position={[x, 0.38, z]} rotation={[0, 0, Math.PI / 2]} castShadow>
      <cylinderGeometry args={[0.38, 0.38, 0.28, 16]} />
      <Matte color={tire} />
    </mesh>
  )
}
