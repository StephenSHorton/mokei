import { RoundedBox } from '@react-three/drei'
import { Matte } from './Matte'

export function Fence() {
  const posts: { key: string; x: number; z: number }[] = []
  for (let x = -26; x <= 26; x += 2.4) posts.push({ key: `n-${x}`, x, z: -19.2 })
  for (let z = -16.8; z <= -8; z += 2.4) {
    posts.push({ key: `w-${z}`, x: -26, z })
    posts.push({ key: `e-${z}`, x: 26, z })
  }

  return (
    <group>
      {posts.map((post) => (
        <RoundedBox key={post.key} args={[0.12, 1.15, 0.12]} radius={0.03} smoothness={2} position={[post.x, 0.58, post.z]} castShadow>
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
