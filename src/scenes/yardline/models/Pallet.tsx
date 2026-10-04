import { useLook } from '../../../kit/clay'
import { SoftBox } from '../../../kit/clay'

type PalletProps = {
  stacks?: number
  wrap?: 'tan' | 'blue' | 'white'
  seed?: number
}

const BOX = 0.56
const GAP = 0.035

/** Wooden pallet loaded with a 2x2 grid of soft cardboard boxes per layer. */
export function Pallet({ stacks = 2, wrap = 'tan', seed = 0 }: PalletProps) {
  const cardboard = useLook((s) => s.cardboard)
  const accent = useLook((s) => s.accent)
  const wood = wrap === 'blue' ? '#2a59d6' : '#c79560'
  const shades =
    wrap === 'blue'
      ? [accent, '#3b74f0', '#2f66e6']
      : wrap === 'white'
        ? ['#f1f5f9', '#e8edf5', '#f8fafc']
        : [cardboard, '#e6bb86', '#d9a873']

  const boxes: { x: number; y: number; z: number; c: string }[] = []
  for (let level = 0; level < stacks; level += 1) {
    for (let i = 0; i < 4; i += 1) {
      const x = (i % 2 === 0 ? -1 : 1) * (BOX / 2 + GAP / 2)
      const z = (i < 2 ? -1 : 1) * (BOX / 2 + GAP / 2)
      boxes.push({
        x,
        y: 0.3 + BOX / 2 + level * (BOX + GAP * 0.6),
        z,
        c: shades[(i + level + seed) % shades.length],
      })
    }
  }

  return (
    <group scale={1.14}>
      {/* deck + runners */}
      <SoftBox size={[1.3, 0.1, 1.3]} r={0.04} color={wood} position={[0, 0.25, 0]} />
      {[-0.5, 0, 0.5].map((x) => (
        <SoftBox key={x} size={[0.26, 0.2, 1.24]} r={0.06} color={wood} position={[x, 0.1, 0]} />
      ))}
      {boxes.map((b, index) => (
        <group key={index} position={[b.x, b.y, b.z]}>
          <SoftBox size={[BOX, BOX, BOX]} r={0.07} color={b.c} />
          {wrap === 'tan' ? (
            <SoftBox size={[BOX * 0.22, 0.012, BOX * 1.006]} r={0.004} smooth={1} color="#f1d3a8" position={[0, BOX / 2 - 0.004, 0]} cast={false} />
          ) : null}
        </group>
      ))}
    </group>
  )
}
