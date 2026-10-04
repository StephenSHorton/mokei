import { Canvas } from '@react-three/fiber'
import { SoftBox } from 'mokei/clay'
import type { SceneEvent } from 'mokei/scene'
import { applyTheme } from 'mokei/theme'
import { quarryTheme } from 'mokei/theme/quarry'

applyTheme(quarryTheme)

const ping: SceneEvent = { type: 'reset' }

export function App() {
  return (
    <div className="h-screen bg-background text-foreground">
      <p className="p-4 font-medium text-primary">
        clay-only consumer {ping.type}
      </p>
      <div className="h-[480px]">
        <Canvas>
          <ambientLight intensity={0.8} />
          <SoftBox size={[1.2, 0.6, 0.9]} material="accent1" />
        </Canvas>
      </div>
    </div>
  )
}
