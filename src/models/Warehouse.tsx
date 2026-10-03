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
      <RoundedBox args={[32.2, 5.4, 14.2]} radius={0.16} smoothness={3} position={[0, 2.7, 0]} castShadow receiveShadow>
        <Matte color={wall} />
      </RoundedBox>
      <RoundedBox args={[33.1, 0.42, 15.1]} radius={0.08} smoothness={3} position={[0, 5.55, 0]} castShadow receiveShadow>
        <Matte color={roof} />
      </RoundedBox>
      <RoundedBox args={[32.8, 0.28, 14.8]} radius={0.04} smoothness={2} position={[0, 5.28, 0]} castShadow>
        <Matte color={accent} />
      </RoundedBox>
      <RoundedBox args={[32.4, 0.18, 1.1]} radius={0.04} smoothness={2} position={[0, 0.09, 7.2]} receiveShadow>
        <Matte color="#e2e8f0" />
      </RoundedBox>
      <RoundedBox args={[33, 0.12, 4.6]} radius={0.02} smoothness={2} position={[0, 0.04, 8.6]} receiveShadow>
        <Matte color={ground} />
      </RoundedBox>

      {DOOR_XS.map((x) => (
        <group key={x} position={[x, 0, 7.05]}>
          <RoundedBox args={[2.7, 3.15, 0.22]} radius={0.05} smoothness={2} position={[0, 1.62, 0]} castShadow>
            <Matte color={accent} />
          </RoundedBox>
          <RoundedBox args={[2.28, 2.78, 0.7]} radius={0.04} smoothness={2} position={[0, 1.5, -0.18]}>
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
