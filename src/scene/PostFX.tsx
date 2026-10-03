import { EffectComposer, N8AO, SMAA } from '@react-three/postprocessing'
import { useLook } from '../look'

export function PostFX() {
  const aoIntensity = useLook((s) => s.aoIntensity)
  const aoRadius = useLook((s) => s.aoRadius)
  const aoColor = useLook((s) => s.aoColor)

  return (
    <EffectComposer multisampling={0} enableNormalPass>
      <N8AO
        aoRadius={aoRadius}
        intensity={aoIntensity}
        distanceFalloff={1.05}
        quality="medium"
        halfRes
        color={aoColor}
      />
      <SMAA />
    </EffectComposer>
  )
}
