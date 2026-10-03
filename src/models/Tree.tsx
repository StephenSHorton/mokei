import { useLook } from '../look'
import { RoundCyl } from './soft'

/** Lollipop tree: soft ellipsoid canopy on a slim rounded trunk. */
export function Tree({ scale = 1, bush = false }: { scale?: number; bush?: boolean }) {
  const tree = useLook((s) => s.tree)
  if (bush) {
    return (
      <mesh position={[0, 0, 0]} scale={[scale * 0.9, scale * 0.62, scale * 0.9]} castShadow receiveShadow>
        <sphereGeometry args={[0.7, 28, 18, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshLambertMaterial color={tree} />
      </mesh>
    )
  }
  return (
    <group scale={scale}>
      <RoundCyl radius={0.1} height={1.3} fillet={0.05} color="#9a8a7a" position={[0, 0.65, 0]} segments={14} />
      <mesh position={[0, 1.95, 0]} scale={[1, 1.22, 1]} castShadow receiveShadow>
        <sphereGeometry args={[0.78, 32, 22]} />
        <meshLambertMaterial color={tree} />
      </mesh>
    </group>
  )
}
