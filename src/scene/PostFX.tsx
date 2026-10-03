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
        distanceFalloff={0.7}
        quality="medium"
        halfRes
        screenSpaceRadius
        color={aoColor}
      />
      <SMAA />
    </EffectComposer>
  )
}
