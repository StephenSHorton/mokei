import { RoundedBox } from '@react-three/drei'
import { useMemo } from 'react'
import { LatheGeometry, Vector2 } from 'three'
import { useClayColor, type ClayColorProps, type MaterialRole } from '../theme/materials'
import { Matte } from './Matte'

type Vec3 = [number, number, number]

/**
 * Shared scale for toy-edge rounding and bevels.
 * 1 keeps the generous post-polish radii; 0 is a hard box.
 * 0.8 sits halfway between the 0.6 crisp pass and the original soft look.
 */
export const SOFT_EDGE_SCALE = 0.8

export function scaleSoft(value: number) {
  return value * SOFT_EDGE_SCALE
}

type SoftBoxProps = ClayColorProps & {
  size: Vec3
  position?: Vec3
  rotation?: Vec3
  /** Corner radius in world units. Defaults to a generous share of the smallest side. */
  r?: number
  smooth?: number
  cast?: boolean
  receive?: boolean
  emissive?: string
}

/** Rounded box with toy-like soft corners. Radius is clamped so it never collapses. */
export function SoftBox({
  size,
  color,
  material,
  unsafeColor,
  position,
  rotation,
  r,
  smooth = 4,
  cast = true,
  receive = true,
  emissive,
}: SoftBoxProps) {
  const min = Math.min(size[0], size[1], size[2])
  const radius = Math.max(0.004, Math.min(scaleSoft(r ?? min * 0.24), min / 2 - 0.002))
  return (
    <RoundedBox
      args={size}
      radius={radius}
      smoothness={smooth}
      position={position}
      rotation={rotation}
      castShadow={cast}
      receiveShadow={receive}
    >
      <Matte color={color} material={material} unsafeColor={unsafeColor} emissive={emissive} />
    </RoundedBox>
  )
}

/** Lathe profile for a cylinder whose top and bottom rims are filleted. */
export function useRoundCylinder(radius: number, height: number, fillet: number, segments = 28) {
  return useMemo(() => {
    const f = Math.min(fillet, radius * 0.95, height / 2 - 0.001)
    const pts: Vector2[] = [new Vector2(0, -height / 2)]
    const steps = 6
    for (let i = 0; i <= steps; i += 1) {
      const a = -Math.PI / 2 + (i / steps) * (Math.PI / 2)
      pts.push(new Vector2(radius - f + Math.cos(a) * f, -height / 2 + f + Math.sin(a) * f))
    }
    for (let i = 0; i <= steps; i += 1) {
      const a = (i / steps) * (Math.PI / 2)
      pts.push(new Vector2(radius - f + Math.cos(a) * f, height / 2 - f + Math.sin(a) * f))
    }
    pts.push(new Vector2(0, height / 2))
    return new LatheGeometry(pts, segments)
  }, [radius, height, fillet, segments])
}

type RoundCylProps = ClayColorProps & {
  radius: number
  height: number
  fillet?: number
  position?: Vec3
  rotation?: Vec3
  cast?: boolean
  segments?: number
}

export function RoundCyl({
  radius,
  height,
  fillet,
  color,
  material,
  unsafeColor,
  position,
  rotation,
  cast = true,
  segments,
}: RoundCylProps) {
  const geo = useRoundCylinder(radius, height, scaleSoft(fillet ?? Math.min(radius, height) * 0.35), segments)
  return (
    <mesh geometry={geo} position={position} rotation={rotation} castShadow={cast} receiveShadow>
      <Matte color={color} material={material} unsafeColor={unsafeColor} />
    </mesh>
  )
}

/** Chunky toy wheel: rounded tire plus a lighter hub, axis along X. */
export function Wheel({
  position,
  radius = 0.36,
  width = 0.3,
  tire = 'detail.dark',
  hub = 'detail.light',
  unsafeTire,
  unsafeHub,
}: {
  position: Vec3
  radius?: number
  width?: number
  tire?: MaterialRole
  hub?: MaterialRole
  unsafeTire?: string
  unsafeHub?: string
}) {
  const side = position[0] >= 0 ? 1 : -1
  return (
    <group position={position} rotation={[0, 0, Math.PI / 2]}>
      <RoundCyl radius={radius} height={width} fillet={width * 0.42} material={tire} unsafeColor={unsafeTire} />
      <RoundCyl
        radius={radius * 0.46}
        height={0.05}
        fillet={0.02}
        material={hub}
        unsafeColor={unsafeHub}
        position={[0, (-side * width) / 2, 0]}
        cast={false}
      />
    </group>
  )
}

/** Gallery cart: white body, accent trim, slate bumper, signal lamp, dark wheels. */
export function RoleCart({ position = [0, 0, 0] }: { position?: Vec3 }) {
  const lamp = useClayColor({ material: 'accent2' })
  return (
    <group position={position}>
      <SoftBox size={[1.9, 0.58, 1.15]} r={0.16} material="base" position={[0, 0.46, 0]} />
      <SoftBox size={[1.96, 0.1, 1.2]} r={0.05} material="accent1" position={[0, 0.22, 0]} />
      <SoftBox size={[0.18, 0.36, 1.18]} r={0.06} material="accent3" position={[0.96, 0.44, 0]} />
      <SoftBox size={[0.16, 0.16, 0.16]} r={0.05} material="accent2" position={[-0.72, 0.84, 0]} emissive={lamp} />
      <Wheel position={[-0.62, 0.22, 0.52]} radius={0.22} width={0.2} />
      <Wheel position={[0.55, 0.22, 0.52]} radius={0.22} width={0.2} />
      <Wheel position={[-0.62, 0.22, -0.52]} radius={0.22} width={0.2} />
      <Wheel position={[0.55, 0.22, -0.52]} radius={0.22} width={0.2} />
    </group>
  )
}
