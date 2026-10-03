import { RoundedBox } from '@react-three/drei'
import { Matte } from './Matte'

export function Fence() {
  const posts: [number, number][] = []
  for (let x = -26; x <= 26; x += 2.4) posts.push([x, -19.2])
  for (let z = -19.2; z <= -8; z += 2.4) {
    posts.push([-26, z])
    posts.push([26, z])
  }

  return (
    <group>
      {posts.map(([x, z]) => (
        <RoundedBox key={`${x}:${z}`} args={[0.12, 1.15, 0.12]} radius={0.03} smoothness={2} position={[x, 0.58, z]} castShadow>
          <Matte color="#cbd5e1" />
        </RoundedBox>
      ))}
      <RoundedBox args={[52.2, 0.07, 0.07]} radius={0.02} smoothness={2} position={[0, 0.95, -19.2]}>
        <Matte color="#94a3b8" />
      </RoundedBox>
      <RoundedBox args={[52.2, 0.07, 0.07]} radius={0.02} smoothness={2} position={[0, 0.42, -19.2]}>
        <Matte color="#94a3b8" />
      </RoundedBox>
    </group>
  )
}
