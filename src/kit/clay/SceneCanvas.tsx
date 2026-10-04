import { Canvas, useThree, type CanvasProps } from '@react-three/fiber'
import { useLayoutEffect, type ReactNode } from 'react'
import { NoToneMapping, PCFShadowMap, PCFSoftShadowMap, SRGBColorSpace } from 'three'
import {
  DEFAULT_QUALITY,
  QualityProvider,
  qualitySettings,
  resolveQuality,
  useResolvedQuality,
  type SceneQuality,
} from './quality'

export type SceneCanvasProps = Omit<CanvasProps, 'children'> & {
  quality?: SceneQuality
  children?: ReactNode
}

/**
 * Host canvas with library AA / DPR / soft-shadow defaults.
 *
 * Three r186 removed the distinct PCFSoft kernel (WebGL remaps
 * `PCFSoftShadowMap` to `PCFShadowMap` and warns). We still request
 * `PCFSoftShadowMap` on the Canvas so the intent is visible, then pin
 * `PCFShadowMap` so the remap does not re-warn every frame.
 */
export function SceneCanvas({
  quality = DEFAULT_QUALITY,
  children,
  dpr,
  gl,
  shadows,
  flat = true,
  ...rest
}: SceneCanvasProps) {
  const resolved = resolveQuality(quality)
  const settings = qualitySettings(resolved)
  return (
    <Canvas
      {...rest}
      flat={flat}
      shadows={shadows ?? { type: PCFSoftShadowMap }}
      dpr={dpr ?? settings.dpr}
      gl={{
        antialias: true,
        toneMapping: NoToneMapping,
        outputColorSpace: SRGBColorSpace,
        powerPreference: resolved === 'low' ? 'default' : 'high-performance',
        ...gl,
      }}
    >
      <QualityProvider quality={resolved}>
        <ApplyCanvasQuality />
        {children}
      </QualityProvider>
    </Canvas>
  )
}

/**
 * Applies DPR + PCF shadow type from the quality context. Worlds mount this
 * so a host that still uses a raw `<Canvas>` (Rock today) still gets the
 * library defaults — except `antialias`, which is a context-creation flag
 * and must be set on `SceneCanvas`.
 */
export function ApplyCanvasQuality() {
  const resolved = useResolvedQuality()
  const settings = qualitySettings(resolved)
  const gl = useThree((state) => state.gl)
  const setDpr = useThree((state) => state.setDpr)

  useLayoutEffect(() => {
    gl.shadowMap.enabled = true
    gl.shadowMap.type = PCFShadowMap
    setDpr(settings.dpr)
  }, [gl, setDpr, settings.dpr])

  return null
}
