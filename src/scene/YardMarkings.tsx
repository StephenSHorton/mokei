import { RoundedBox } from '@react-three/drei'
import { useLook } from '../look'
import { DOCKS } from '../sim/yard'
import { Matte } from '../models/Matte'

export function YardMarkings() {
  const yellow = useLook((s) => s.yellow)

  return (
    <group>
      <Stripe x={0} z={5.8} w={0.22} d={18} color={yellow} />
      <Stripe x={-16.8} z={6} w={0.18} d={16} color={yellow} />
      <Stripe x={16.8} z={6} w={0.18} d={16} color={yellow} />
      <Stripe x={0} z={16.8} w={34} d={0.18} color={yellow} />

      {DOCKS.map((dock) => (
        <group key={dock.id} position={[dock.x, 0, 2.15]}>
          <Stripe x={-1.45} z={0} w={0.16} d={8.4} color={yellow} />
          <Stripe x={1.45} z={0} w={0.16} d={8.4} color={yellow} />
        </group>
      ))}

      <DashedBay x={-10.5} z={2.3} />
      <DashedBay x={-3.5} z={2.3} />
      <DashedBay x={3.5} z={2.3} />
      <DashedBay x={10.5} z={2.3} />
      <DashedBay x={18.4} z={12.6} w={3.6} d={6.4} />
      <DashedBay x={-18.5} z={12.8} w={3.6} d={6.4} />
    </group>
  )
}

function Stripe({
  x,
  z,
  w,
  d,
  color,
}: {
  x: number
  z: number
  w: number
  d: number
  color: string
}) {
  return (
    <RoundedBox args={[w, 0.03, d]} radius={0.01} smoothness={1} position={[x, 0.016, z]} receiveShadow>
      <Matte color={color} />
    </RoundedBox>
  )
}

function DashedBay({
  x,
  z,
  w = 3.1,
  d = 7.2,
}: {
  x: number
  z: number
  w?: number
  d?: number
}) {
  const yellow = useLook((s) => s.yellow)
  const segments: { px: number; pz: number; sx: number; sz: number }[] = []
  const dash = 0.55
  const gap = 0.32
  const halfW = w / 2
  const halfD = d / 2

  for (let t = -halfW; t < halfW; t += dash + gap) {
    const len = Math.min(dash, halfW - t)
    segments.push({ px: t + len / 2, pz: -halfD, sx: len, sz: 0.08 })
    segments.push({ px: t + len / 2, pz: halfD, sx: len, sz: 0.08 })
  }
  for (let t = -halfD; t < halfD; t += dash + gap) {
    const len = Math.min(dash, halfD - t)
    segments.push({ px: -halfW, pz: t + len / 2, sx: 0.08, sz: len })
    segments.push({ px: halfW, pz: t + len / 2, sx: 0.08, sz: len })
  }

  return (
    <group position={[x, 0, z]}>
      {segments.map((seg, index) => (
        <mesh key={index} position={[seg.px, 0.018, seg.pz]} receiveShadow>
          <boxGeometry args={[seg.sx, 0.025, seg.sz]} />
          <Matte color={yellow} />
        </mesh>
      ))}
    </group>
  )
}
