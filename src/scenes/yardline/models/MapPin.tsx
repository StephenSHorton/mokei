import { useMemo } from 'react'
import { LatheGeometry, Vector2 } from 'three'
import { useLook } from '../../../kit/clay'

/** Soft 3D map pin: teardrop body with a white dot facing the camera. */
export function MapPin({ height = 2.45 }: { height?: number }) {
  const accent = useLook((s) => s.accent)
  const az = useLook((s) => s.cameraAzimuth)
  const geo = useMemo(() => {
    const pts: Vector2[] = []
    const r = 0.46
    // tip at y=0, round head centred at y = 1.0
    pts.push(new Vector2(0, 0))
    for (let i = 1; i <= 10; i += 1) {
      const t = i / 10
      pts.push(new Vector2(r * 0.86 * Math.sin((t * Math.PI) / 2) ** 1.4, t * 0.82))
    }
    for (let i = 0; i <= 18; i += 1) {
      const a = -0.55 + (i / 18) * (Math.PI / 2 + 0.55)
      pts.push(new Vector2(Math.cos(a) * r, 1.06 + Math.sin(a) * r))
    }
    pts.push(new Vector2(0, 1.06 + r))
    return new LatheGeometry(pts, 32)
  }, [])

  return (
    <group position={[0, height, 0]} rotation={[0, (az * Math.PI) / 180, 0]}>
      <mesh geometry={geo} castShadow>
        <meshLambertMaterial color={accent} />
      </mesh>
      <mesh position={[0, 1.06, 0.4]} scale={[1, 1, 0.5]}>
        <sphereGeometry args={[0.19, 20, 14]} />
        <meshLambertMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={0.35} />
      </mesh>
    </group>
  )
}
