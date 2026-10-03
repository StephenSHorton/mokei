import { Canvas } from '@react-three/fiber'
import { useEffect, useState } from 'react'
import { NoToneMapping, PCFShadowMap, SRGBColorSpace } from 'three'
import { LevaLook } from './look/LevaLook'
import { useLook } from './look'
import { World } from './scene/World'
import { useYard } from './sim/yard'
import { Hud } from './ui/Hud'

export default function App() {
  const ground = useLook((s) => s.ground)
  const select = useYard((s) => s.select)
  const [showLook, setShowLook] = useState(() => location.search.includes('look'))

  useEffect(() => {
    // The tuning panel stays out of the composition; press L to toggle it.
    const onKey = (event: KeyboardEvent) => {
      if (event.target instanceof HTMLInputElement) return
      if (event.key === 'l' || event.key === 'L') setShowLook((v) => !v)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  return (
    <div className="relative h-full w-full overflow-hidden" style={{ background: ground }}>
      <Canvas
        flat
        shadows={{ type: PCFShadowMap }}
        dpr={[1, 2]}
        gl={{
          antialias: true,
          toneMapping: NoToneMapping,
          outputColorSpace: SRGBColorSpace,
          powerPreference: 'high-performance',
        }}
        onPointerMissed={() => select(null)}
      >
        <color attach="background" args={[ground]} />
        <World />
      </Canvas>
      <Hud />
      <LevaLook hidden={!showLook} />
    </div>
  )
}
