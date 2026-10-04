import { SoftBox } from '../../kit/clay'
import type { MaterialRole } from '../../kit/theme'

/** Thin safety-yellow bay outlines and dashed lane lines painted on the lot. */
export function YardMarkings() {
  return (
    <group>
      {[-10.5, -3.5, 3.5, 10.5].map((x) => (
        <Bay key={x} x={x} z={2.0} w={3.3} d={8.6} material="accent2" open />
      ))}
      <Bay x={18.4} z={12.4} w={3.8} d={7.4} material="accent2" />
      <Bay x={-18.6} z={12.6} w={3.8} d={7.4} material="accent2" />
      <Bay x={-21} z={-2.4} w={8} d={4} unsafeColor="#86d3a6" />
      <Dashed from={[-26, 7.2]} to={[26, 7.2]} material="accent2" />
      <Dashed from={[-26, 18.9]} to={[28, 18.9]} material="accent2" />
      <Dashed from={[15.4, -3]} to={[15.4, 19]} material="accent2" />
    </group>
  )
}

function Bay({
  x,
  z,
  w,
  d,
  material,
  unsafeColor,
  open = false,
}: {
  x: number
  z: number
  w: number
  d: number
  material?: MaterialRole
  unsafeColor?: string
  open?: boolean
}) {
  const t = 0.1
  return (
    <group position={[x, 0.02, z]}>
      <SoftBox size={[t, 0.02, d]} r={0.008} smooth={1} material={material} unsafeColor={unsafeColor} position={[-w / 2, 0, 0]} cast={false} />
      <SoftBox size={[t, 0.02, d]} r={0.008} smooth={1} material={material} unsafeColor={unsafeColor} position={[w / 2, 0, 0]} cast={false} />
      <SoftBox size={[w + t, 0.02, t]} r={0.008} smooth={1} material={material} unsafeColor={unsafeColor} position={[0, 0, d / 2]} cast={false} />
      {open ? null : <SoftBox size={[w + t, 0.02, t]} r={0.008} smooth={1} material={material} unsafeColor={unsafeColor} position={[0, 0, -d / 2]} cast={false} />}
    </group>
  )
}

function Dashed({ from, to, material }: { from: [number, number]; to: [number, number]; material: MaterialRole }) {
  const dx = to[0] - from[0]
  const dz = to[1] - from[1]
  const len = Math.hypot(dx, dz)
  const n = Math.floor(len / 1.1)
  const items = []
  for (let i = 0; i < n; i += 1) {
    const t = (i + 0.5) / n
    items.push(
      <SoftBox
        key={i}
        size={Math.abs(dx) > Math.abs(dz) ? [0.55, 0.02, 0.1] : [0.1, 0.02, 0.55]}
        r={0.008}
        smooth={1}
        material={material}
        position={[from[0] + dx * t, 0.02, from[1] + dz * t]}
        cast={false}
      />,
    )
  }
  return <group>{items}</group>
}
