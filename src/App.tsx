import { Canvas } from '@react-three/fiber'
import { NoToneMapping, SRGBColorSpace } from 'three'
import { LevaLook } from './look/LevaLook'
import { useLook } from './look'
import { World } from './scene/World'
import { useYard } from './sim/yard'
import { Hud } from './ui/Hud'

export default function App() {
  const ground = useLook((s) => s.ground)
  const select = useYard((s) => s.select)

  return (
    <div className="relative h-full w-full overflow-hidden" style={{ background: ground }}>
      <Canvas
        flat
        shadows
        dpr={[1, 1.5]}
        gl={{
          antialias: true,
          toneMapping: NoToneMapping,
          outputColorSpace: SRGBColorSpace,
          powerPreference: 'high-performance',
        }}
        onPointerMissed={() => select(null)}
        onCreated={({ gl }) => {
          gl.setClearColor(ground, 1)
        }}
      >
        <color attach="background" args={[ground]} />
        <World />
      </Canvas>
      <Hud />
      <LevaLook />
    </div>
  )
}
