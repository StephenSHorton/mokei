import { useLook } from '../look'
import { Matte } from './Matte'

export function Tree({ scale = 1 }: { scale?: number }) {
  const tree = useLook((s) => s.tree)
  return (
    <group scale={scale}>
      <mesh position={[0, 0.38, 0]} castShadow>
        <cylinderGeometry args={[0.11, 0.16, 0.76, 10]} />
        <Matte color="#e2e8f0" />
      </mesh>
      <mesh position={[0, 1.15, 0]} castShadow receiveShadow>
        <sphereGeometry args={[0.62, 16, 12]} />
        <Matte color={tree} />
      </mesh>
      <mesh position={[0.22, 1.42, -0.1]} castShadow>
        <sphereGeometry args={[0.36, 14, 10]} />
        <Matte color={tree} />
      </mesh>
    </group>
  )
}
