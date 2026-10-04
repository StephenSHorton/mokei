import { useMemo } from 'react'
import { DoubleSide } from 'three'
import { fenceTexture } from './textures'
import { RoundCyl, SoftBox } from '../../../kit/clay'

/** Light chain-link fence run between two points along X or Z. */
export function FenceRun({
  from,
  to,
  height = 1.5,
}: {
  from: [number, number]
  to: [number, number]
  height?: number
}) {
  const dx = to[0] - from[0]
  const dz = to[1] - from[1]
  const len = Math.hypot(dx, dz)
  const angle = Math.atan2(dx, dz)
  const tex = useMemo(() => fenceTexture(len / 1.2), [len])
  const posts = Math.max(2, Math.round(len / 2.6) + 1)
  return (
    <group position={[from[0], 0, from[1]]} rotation={[0, angle, 0]}>
      <mesh position={[0, height / 2 + 0.1, len / 2]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[len, height]} />
        <meshLambertMaterial map={tex} transparent side={DoubleSide} depthWrite={false} color="#dbe3f0" />
      </mesh>
      <SoftBox size={[0.07, 0.07, len]} r={0.03} color="#cfd8e6" position={[0, height + 0.1, len / 2]} />
      <SoftBox size={[0.07, 0.07, len]} r={0.03} color="#cfd8e6" position={[0, 0.16, len / 2]} />
      {Array.from({ length: posts }, (_, i) => (
        <RoundCyl key={i} radius={0.055} height={height + 0.2} fillet={0.04} color="#e2e8f0" position={[0, (height + 0.2) / 2, (i / (posts - 1)) * len]} segments={10} />
      ))}
    </group>
  )
}
