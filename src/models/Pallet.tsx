import { RoundedBox } from '@react-three/drei'
import { useLook } from '../look'
import { Matte } from './Matte'

type PalletProps = {
  stacks?: number
  wrap?: 'tan' | 'blue'
}

export function Pallet({ stacks = 2, wrap = 'tan' }: PalletProps) {
  const cardboard = useLook((s) => s.cardboard)
  const accent = useLook((s) => s.accent)
  const box = wrap === 'blue' ? accent : cardboard

  return (
    <group>
      <RoundedBox args={[1.15, 0.12, 0.92]} radius={0.03} smoothness={2} position={[0, 0.06, 0]} castShadow receiveShadow>
        <Matte color="#b08950" />
      </RoundedBox>
      {Array.from({ length: stacks }, (_, index) => (
        <RoundedBox
          key={index}
          args={[1.02, 0.42, 0.8]}
          radius={0.05}
          smoothness={2}
          position={[0, 0.3 + index * 0.44, 0]}
          castShadow
          receiveShadow
        >
          <Matte color={box} />
        </RoundedBox>
      ))}
    </group>
  )
}
