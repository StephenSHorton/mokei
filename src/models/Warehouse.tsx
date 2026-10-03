import { RoundedBox } from '@react-three/drei'
import { useLook } from '../look'
import { WAREHOUSE_ID, useYard } from '../sim/yard'
import { Matte } from './Matte'

const DOOR_XS = [-10.5, -3.5, 3.5, 10.5]

export function Warehouse() {
  const wall = useLook((s) => s.wall)
  const roof = useLook((s) => s.roof)
  const accent = useLook((s) => s.accent)
  const tire = useLook((s) => s.tire)
  const ground = useLook((s) => s.ground)
  const selected = useYard((s) => s.selectedId === WAREHOUSE_ID)
  const select = useYard((s) => s.select)

  return (
    <group
      position={[0, 0, -11]}
      onPointerDown={(event) => event.stopPropagation()}
      onClick={(event) => {
        event.stopPropagation()
        select(WAREHOUSE_ID)
      }}
    >
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.011, 0.4]} receiveShadow>
        <planeGeometry args={[36, 18]} />
        <meshStandardMaterial color="#d7dee7" roughness={1} metalness={0} />
      </mesh>
      <RoundedBox args={[32.2, 5.4, 14.2]} radius={0.16} smoothness={3} position={[0, 2.7, 0]} castShadow receiveShadow>
        <Matte color={wall} />
      </RoundedBox>
      <RoundedBox args={[33.2, 0.5, 15.2]} radius={0.08} smoothness={3} position={[0, 5.58, 0]} castShadow receiveShadow>
        <Matte color={roof} />
      </RoundedBox>
      <RoundedBox args={[32.9, 0.32, 14.9]} radius={0.04} smoothness={2} position={[0, 5.28, 0]} castShadow>
        <Matte color={accent} />
      </RoundedBox>
      <RoundedBox args={[32.6, 0.22, 1.4]} radius={0.04} smoothness={2} position={[0, 0.11, 7.25]} receiveShadow>
        <Matte color="#c5d0dc" />
      </RoundedBox>
      <RoundedBox args={[33, 0.12, 5.2]} radius={0.02} smoothness={2} position={[0, 0.04, 8.8]} receiveShadow>
        <Matte color={ground} />
      </RoundedBox>

      {DOOR_XS.map((x) => (
        <group key={x} position={[x, 0, 7.05]}>
          <RoundedBox args={[2.95, 3.35, 0.28]} radius={0.05} smoothness={2} position={[0, 1.7, 0]} castShadow>
            <Matte color={accent} />
          </RoundedBox>
          <RoundedBox args={[2.35, 2.9, 0.85]} radius={0.04} smoothness={2} position={[0, 1.52, -0.2]}>
            <Matte color={selected ? '#0f172a' : tire} />
          </RoundedBox>
          <RoundedBox args={[2.7, 0.16, 0.9]} radius={0.03} smoothness={2} position={[0, 0.1, 0.28]} receiveShadow>
            <Matte color="#cbd5e1" />
          </RoundedBox>
        </group>
      ))}

      {[-11, -4, 3, 10].map((x) => (
        <RoundedBox key={`win-${x}`} args={[3.1, 1.15, 0.12]} radius={0.04} smoothness={2} position={[x, 3.55, -7.08]}>
          <Matte color="#93c5fd" />
        </RoundedBox>
      ))}

      <RoundedBox args={[2.4, 0.55, 1.6]} radius={0.08} smoothness={2} position={[-9.4, 5.95, -2.2]} castShadow>
        <Matte color="#cbd5e1" />
      </RoundedBox>
      <RoundedBox args={[1.6, 0.4, 1.1]} radius={0.08} smoothness={2} position={[8.6, 5.88, 1.4]} castShadow>
        <Matte color="#dbe3ec" />
      </RoundedBox>
    </group>
  )
}
