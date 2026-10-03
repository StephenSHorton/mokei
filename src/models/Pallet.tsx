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
    <group scale={1.18}>
      <RoundedBox args={[1.28, 0.14, 1.02]} radius={0.03} smoothness={2} position={[0, 0.07, 0]} castShadow receiveShadow>
        <Matte color="#a9844f" />
      </RoundedBox>
      {Array.from({ length: stacks }, (_, index) => (
        <RoundedBox
          key={index}
          args={[1.14, 0.48, 0.9]}
          radius={0.06}
          smoothness={2}
          position={[0, 0.36 + index * 0.5, 0]}
          castShadow
          receiveShadow
        >
          <Matte color={index % 2 === 0 ? box : wrap === 'blue' ? '#3b82f6' : '#d2b27a'} />
        </RoundedBox>
      ))}
    </group>
  )
}
