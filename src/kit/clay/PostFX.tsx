import { EffectComposer, N8AO, SMAA } from '@react-three/postprocessing'
import { useLook } from './look'

export function PostFX() {
  const aoIntensity = useLook((s) => s.aoIntensity)
  const aoRadius = useLook((s) => s.aoRadius)
  const aoColor = useLook((s) => s.aoColor)

  return (
    <EffectComposer multisampling={0} enableNormalPass={false}>
      <N8AO
        aoRadius={aoRadius}
        intensity={aoIntensity}
        distanceFalloff={1.2}
        quality="high"
        halfRes={false}
        color={aoColor}
      />
      <SMAA />
    </EffectComposer>
  )
}
