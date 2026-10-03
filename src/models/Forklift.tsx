import { useLook } from '../look'
import { RoundCyl, SoftBox, Wheel } from './soft'

/** Chunky toy forklift: blue chassis, yellow body, black mast and cage. Forks face +Z. */
export function Forklift() {
  const yellow = useLook((s) => s.yellow)
  const accent = useLook((s) => s.accent)
  const tire = useLook((s) => s.tire)
  const black = '#232838'

  return (
    <group scale={1.22}>
      {/* chassis */}
      <SoftBox size={[1.22, 0.46, 1.62]} r={0.16} color={accent} position={[0, 0.44, -0.02]} />
      {/* yellow body + rounded counterweight */}
      <SoftBox size={[1.16, 0.62, 0.86]} r={0.22} color={yellow} position={[0, 0.94, -0.36]} />
      <SoftBox size={[1.2, 0.78, 0.46]} r={0.22} color={yellow} position={[0, 0.9, -0.7]} />
      <SoftBox size={[1.06, 0.26, 0.5]} r={0.11} color={yellow} position={[0, 0.78, 0.4]} />
      {/* seat + driver */}
      <SoftBox size={[0.5, 0.36, 0.14]} r={0.06} color={black} position={[0, 1.28, -0.38]} />
      <RoundCyl radius={0.17} height={0.42} fillet={0.12} color="#f97316" position={[0, 1.33, -0.14]} />
      <mesh position={[0, 1.68, -0.14]} castShadow>
        <sphereGeometry args={[0.15, 20, 14]} />
        <meshLambertMaterial color="#f2c19b" />
      </mesh>
      <mesh position={[0, 1.76, -0.14]} scale={[1, 0.62, 1]} castShadow>
        <sphereGeometry args={[0.165, 20, 14]} />
        <meshLambertMaterial color={yellow} />
      </mesh>
      {/* overhead guard: four posts and a slatted roof */}
      {[
        [-0.48, -0.64],
        [0.48, -0.64],
        [-0.48, 0.3],
        [0.48, 0.3],
      ].map(([x, z]) => (
        <SoftBox key={`${x}:${z}`} size={[0.08, 1.12, 0.08]} r={0.035} color={black} position={[x, 1.62, z]} />
      ))}
      <SoftBox size={[1.08, 0.08, 1.06]} r={0.035} color={black} position={[0, 2.2, -0.17]} />
      {[-0.32, -0.08, 0.16].map((z) => (
        <SoftBox key={z} size={[1.0, 0.06, 0.1]} r={0.025} color="#363c4f" position={[0, 2.26, z]} cast={false} />
      ))}
      {/* mast */}
      <SoftBox size={[0.13, 2.0, 0.16]} r={0.05} color={black} position={[-0.3, 1.18, 0.74]} />
      <SoftBox size={[0.13, 2.0, 0.16]} r={0.05} color={black} position={[0.3, 1.18, 0.74]} />
      <SoftBox size={[0.74, 0.1, 0.12]} r={0.04} color={black} position={[0, 2.14, 0.74]} />
      <SoftBox size={[0.74, 0.1, 0.12]} r={0.04} color={black} position={[0, 1.28, 0.74]} />
      <SoftBox size={[0.8, 0.42, 0.1]} r={0.04} color="#2c3242" position={[0, 0.56, 0.86]} />
      {/* forks */}
      <SoftBox size={[0.12, 0.07, 1.12]} r={0.03} color="#3b4256" position={[-0.24, 0.24, 1.42]} />
      <SoftBox size={[0.12, 0.07, 1.12]} r={0.03} color="#3b4256" position={[0.24, 0.24, 1.42]} />
      {/* lamp */}
      <SoftBox size={[0.12, 0.08, 0.12]} r={0.04} color="#fb923c" position={[0, 2.3, -0.56]} cast={false} />
      <Wheel position={[-0.6, 0.3, 0.42]} radius={0.3} width={0.26} tire={tire} />
      <Wheel position={[0.6, 0.3, 0.42]} radius={0.3} width={0.26} tire={tire} />
      <Wheel position={[-0.6, 0.27, -0.56]} radius={0.27} width={0.26} tire={tire} />
      <Wheel position={[0.6, 0.27, -0.56]} radius={0.27} width={0.26} tire={tire} />
    </group>
  )
}
