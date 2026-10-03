import { useLook } from '../look'
import { Matte } from './Matte'

export function Tree({ scale = 1 }: { scale?: number }) {
  const tree = useLook((s) => s.tree)
  return (
    <group scale={scale * 1.15}>
      <mesh position={[0, 0.42, 0]} castShadow>
        <cylinderGeometry args={[0.13, 0.18, 0.84, 10]} />
        <Matte color="#e2e8f0" />
      </mesh>
      <mesh position={[0, 1.28, 0]} castShadow receiveShadow>
        <sphereGeometry args={[0.72, 16, 12]} />
        <Matte color={tree} />
      </mesh>
      <mesh position={[0.24, 1.58, -0.12]} castShadow>
        <sphereGeometry args={[0.4, 14, 10]} />
        <Matte color={tree} />
      </mesh>
    </group>
  )
}
