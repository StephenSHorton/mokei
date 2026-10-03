import { RoundedBox } from '@react-three/drei'
import { useMemo } from 'react'
import { LatheGeometry, Vector2 } from 'three'
import { Matte } from './Matte'

type Vec3 = [number, number, number]

type SoftBoxProps = {
  size: Vec3
  color: string
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
  position,
  rotation,
  r,
  smooth = 4,
  cast = true,
  receive = true,
  emissive,
}: SoftBoxProps) {
  const min = Math.min(size[0], size[1], size[2])
  const radius = Math.max(0.004, Math.min(r ?? min * 0.24, min / 2 - 0.002))
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
      <Matte color={color} emissive={emissive} />
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

type RoundCylProps = {
  radius: number
  height: number
  fillet?: number
  color: string
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
  position,
  rotation,
  cast = true,
  segments,
}: RoundCylProps) {
  const geo = useRoundCylinder(radius, height, fillet ?? Math.min(radius, height) * 0.35, segments)
  return (
    <mesh geometry={geo} position={position} rotation={rotation} castShadow={cast} receiveShadow>
      <Matte color={color} />
    </mesh>
  )
}

/** Chunky toy wheel: rounded tire plus a lighter hub, axis along X. */
export function Wheel({
  position,
  radius = 0.36,
  width = 0.3,
  tire = '#1f2533',
  hub = '#cbd5e1',
}: {
  position: Vec3
  radius?: number
  width?: number
  tire?: string
  hub?: string
}) {
  const side = position[0] >= 0 ? 1 : -1
  return (
    <group position={position} rotation={[0, 0, Math.PI / 2]}>
      <RoundCyl radius={radius} height={width} fillet={width * 0.42} color={tire} />
      <RoundCyl
        radius={radius * 0.46}
        height={0.05}
        fillet={0.02}
        color={hub}
        position={[0, (-side * width) / 2, 0]}
        cast={false}
      />
    </group>
  )
}
