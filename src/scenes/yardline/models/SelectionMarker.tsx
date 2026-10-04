import { useFrame } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import type { Group } from 'three'
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js'
import { useLook } from '../../../kit/clay'

/**
 * 3D corner brackets around the selected unit, like the frames: soft blue
 * L-shapes on the floor and at the top, joined by short vertical ticks.
 */
export function SelectionMarker({ size = [2.2, 2.9, 3.0] }: { size?: [number, number, number] }) {
  const accent = useLook((s) => s.accent)
  const group = useRef<Group>(null)
  const [w, h, d] = size
  const t = 0.075
  const arm = Math.min(w, d) * 0.3
  const tick = h * 0.24
  const geoX = useMemo(() => new RoundedBoxGeometry(arm, t, t, 2, t * 0.45), [arm])
  const geoZ = useMemo(() => new RoundedBoxGeometry(t, t, arm, 2, t * 0.45), [arm])
  const geoY = useMemo(() => new RoundedBoxGeometry(t, tick, t, 2, t * 0.45), [tick])

  useFrame(({ clock }) => {
    if (!group.current) return
    const s = 1 + Math.sin(clock.elapsedTime * 2.4) * 0.025
    group.current.scale.set(s, 1, s)
  })

  const corners: [number, number][] = [
    [-1, -1],
    [1, -1],
    [1, 1],
    [-1, 1],
  ]

  return (
    <group ref={group}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.03, 0]}>
        <planeGeometry args={[w, d]} />
        <meshBasicMaterial color={accent} transparent opacity={0.07} depthWrite={false} />
      </mesh>
      {corners.map(([sx, sz]) =>
        [0.05, h].map((y) => (
          <group key={`${sx}:${sz}:${y}`} position={[(sx * w) / 2, y, (sz * d) / 2]}>
            <mesh geometry={geoX} position={[(-sx * arm) / 2, 0, 0]}>
              <meshBasicMaterial color={accent} transparent opacity={0.78} depthWrite={false} />
            </mesh>
            <mesh geometry={geoZ} position={[0, 0, (-sz * arm) / 2]}>
              <meshBasicMaterial color={accent} transparent opacity={0.78} depthWrite={false} />
            </mesh>
            <mesh geometry={geoY} position={[0, y < 1 ? tick / 2 : -tick / 2, 0]}>
              <meshBasicMaterial color={accent} transparent opacity={0.78} depthWrite={false} />
            </mesh>
          </group>
        )),
      )}
    </group>
  )
}
