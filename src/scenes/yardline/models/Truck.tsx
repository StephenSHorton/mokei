import { useMemo } from 'react'
import { brandDecal } from './textures'
import { SoftBox, Wheel } from '../../../kit/clay'

type TruckProps = {
  accent?: 'blue' | 'teal'
}

/** Box truck. Cab faces +Z. Toy proportions: short tall cab, fat trailer, big wheels. */
export function Truck({ accent = 'blue' }: TruckProps) {
  const teal = accent === 'teal'
  const decal = useMemo(() => brandDecal(accent), [accent])
  const glass = '#1b2236'

  return (
    <group scale={1.06}>
      {/* cab */}
      {teal ? (
        <SoftBox size={[2.12, 1.86, 1.6]} r={0.34} unsafeColor="#f8fafc" position={[0, 1.36, 2.3]} />
      ) : (
        <SoftBox size={[2.12, 1.86, 1.6]} r={0.34} material="accent3" position={[0, 1.36, 2.3]} />
      )}
      <SoftBox size={[2.16, 0.5, 1.7]} r={0.2} unsafeColor={teal ? '#e2e8f0' : '#1f45bf'} position={[0, 0.6, 2.32]} />
      {/* windshield + side windows */}
      <SoftBox size={[1.78, 0.68, 0.1]} r={0.045} color={glass} position={[0, 1.78, 3.08]} cast={false} />
      <SoftBox size={[2.15, 0.56, 0.62]} r={0.05} color={glass} position={[0, 1.8, 2.5]} cast={false} />
      {/* grille + bumper + lights */}
      <SoftBox size={[1.2, 0.42, 0.08]} r={0.035} color="#2a3247" position={[0, 0.98, 3.1]} cast={false} />
      <SoftBox size={[2.12, 0.28, 0.26]} r={0.11} color="#3a4256" position={[0, 0.48, 3.12]} />
      <SoftBox size={[0.32, 0.16, 0.06]} r={0.05} color="#f8fafc" position={[-0.82, 0.98, 3.12]} cast={false} />
      <SoftBox size={[0.32, 0.16, 0.06]} r={0.05} color="#f8fafc" position={[0.82, 0.98, 3.12]} cast={false} />
      {/* mirrors */}
      <SoftBox size={[0.12, 0.4, 0.14]} r={0.05} color="#2a3247" position={[-1.16, 1.66, 2.86]} />
      <SoftBox size={[0.12, 0.4, 0.14]} r={0.05} color="#2a3247" position={[1.16, 1.66, 2.86]} />
      {/* chassis between cab and box */}
      <SoftBox size={[1.7, 0.36, 5.6]} r={0.14} color="#2a3247" position={[0, 0.56, 0.1]} />
      {/* box trailer */}
      <SoftBox size={[2.36, 2.36, 4.3]} r={0.2} material="base" position={[0, 1.96, -0.56]} />
      {teal ? (
        <SoftBox size={[2.4, 0.34, 4.18]} r={0.15} unsafeColor="#14b8a6" position={[0, 0.92, -0.56]} />
      ) : (
        <SoftBox size={[2.4, 0.34, 4.18]} r={0.15} material="accent3" position={[0, 0.92, -0.56]} />
      )}
      <SoftBox size={[2.2, 2.1, 0.08]} r={0.035} color="#e8edf6" position={[0, 1.98, -2.72]} cast={false} />
      {/* side decals */}
      <mesh position={[1.192, 2.08, -0.5]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[3.4, 0.85]} />
        <meshLambertMaterial map={decal} transparent depthWrite={false} />
      </mesh>
      <mesh position={[-1.192, 2.08, -0.62]} rotation={[0, -Math.PI / 2, 0]}>
        <planeGeometry args={[3.4, 0.85]} />
        <meshLambertMaterial map={decal} transparent depthWrite={false} />
      </mesh>
      <Wheel position={[-0.98, 0.44, 2.18]} radius={0.44} width={0.36} />
      <Wheel position={[0.98, 0.44, 2.18]} radius={0.44} width={0.36} />
      <Wheel position={[-0.98, 0.44, -1.36]} radius={0.44} width={0.36} />
      <Wheel position={[0.98, 0.44, -1.36]} radius={0.44} width={0.36} />
      <Wheel position={[-0.98, 0.44, -2.3]} radius={0.44} width={0.36} />
      <Wheel position={[0.98, 0.44, -2.3]} radius={0.44} width={0.36} />
    </group>
  )
}
