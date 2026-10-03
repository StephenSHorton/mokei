import { useFrame } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import type { Group } from 'three'
import { useLook } from '../look'
import { Pallet } from './Pallet'
import { RoundCyl, SoftBox } from './soft'
import { containerText, ribTexture } from './textures'
import { Truck } from './Truck'

/** Blue pallet rack with soft uprights and cardboard on each shelf. */
export function Rack({ bays = 2, levels = 3 }: { bays?: number; levels?: number }) {
  const accent = useLook((s) => s.accent)
  const bayW = 1.7
  const depth = 1.5
  const levelH = 1.25
  const total = bays * bayW
  const height = levels * levelH + 0.2
  return (
    <group>
      {Array.from({ length: bays + 1 }, (_, i) => {
        const x = -total / 2 + i * bayW
        return (
          <group key={i}>
            <SoftBox size={[0.13, height, 0.13]} r={0.05} color={accent} position={[x, height / 2, -depth / 2]} />
            <SoftBox size={[0.13, height, 0.13]} r={0.05} color={accent} position={[x, height / 2, depth / 2]} />
          </group>
        )
      })}
      {Array.from({ length: levels }, (_, l) => {
        const y = 0.18 + l * levelH
        return (
          <group key={l}>
            <SoftBox size={[total + 0.1, 0.12, 0.12]} r={0.05} color="#1e4fd6" position={[0, y, -depth / 2]} />
            <SoftBox size={[total + 0.1, 0.12, 0.12]} r={0.05} color="#1e4fd6" position={[0, y, depth / 2]} />
            {Array.from({ length: bays }, (_, b) => (
              <group key={b} position={[-total / 2 + bayW * (b + 0.5), y + 0.02, 0]} scale={0.78}>
                <Pallet stacks={(l + b) % 3 === 2 ? 1 : 2} seed={l + b} />
              </group>
            ))}
          </group>
        )
      })}
    </group>
  )
}

/** Shipping container with corrugated sides and lettering. */
export function Container({ color = '#2bb3b1', text = 'MAERSK LINE' }: { color?: string; text?: string }) {
  const ribs = useMemo(() => ribTexture(color, 'rgba(0,40,50,0.22)', 6.2 / 0.3, `ctr-${color}`), [color])
  const label = useMemo(() => containerText(text), [text])
  const w = 2.5
  const h = 2.6
  const d = 6.2
  return (
    <group>
      <SoftBox size={[w, h, d]} r={0.14} color={color} position={[0, h / 2, 0]} />
      {[1, -1].map((s) => (
        <group key={s} position={[(s * w) / 2 + s * 0.006, h / 2, 0]} rotation={[0, (s * Math.PI) / 2, 0]}>
          <mesh receiveShadow>
            <planeGeometry args={[d - 0.3, h - 0.3]} />
            <meshLambertMaterial map={ribs} />
          </mesh>
          <mesh position={[0, 0.1, 0.004]}>
            <planeGeometry args={[4, 1]} />
            <meshLambertMaterial map={label} transparent depthWrite={false} />
          </mesh>
        </group>
      ))}
      <SoftBox size={[w + 0.06, 0.14, d + 0.06]} r={0.06} color="#1f8f8d" position={[0, h - 0.04, 0]} />
    </group>
  )
}

/** Forklift charger: white soft cabinet with a mint status strip. */
export function Charger() {
  return (
    <group>
      <SoftBox size={[1.0, 1.5, 0.75]} r={0.18} color="#f4f7fb" position={[0, 0.75, 0]} />
      <SoftBox size={[0.5, 0.08, 0.04]} r={0.02} color="#22c55e" position={[0, 1.15, 0.38]} cast={false} emissive="#16a34a" />
      <RoundCyl radius={0.06} height={0.5} fillet={0.03} color="#334155" position={[0.36, 0.7, 0.4]} />
    </group>
  )
}

/** A decorative truck driving along the outer road. */
export function RoadTraffic({ z, speed, offset, accent }: { z: number; speed: number; offset: number; accent: 'blue' | 'teal' }) {
  const group = useRef<Group>(null)
  useFrame(({ clock }) => {
    if (!group.current) return
    const span = 120
    const x = ((clock.elapsedTime * speed + offset) % span) - span / 2
    group.current.position.set(speed > 0 ? x : -x, 0, z)
  })
  return (
    <group ref={group} rotation={[0, speed > 0 ? Math.PI / 2 : -Math.PI / 2, 0]}>
      <Truck accent={accent} />
    </group>
  )
}

/** Wrapped white bundle on a pallet (stretch-wrapped goods). */
export function WrappedPallet() {
  return (
    <group>
      <Pallet stacks={1} wrap="white" />
      <SoftBox size={[1.32, 0.5, 1.32]} r={0.16} color="#f8fafc" position={[0, 1.27, 0]} />
    </group>
  )
}
