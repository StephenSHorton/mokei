import { useLook } from './look'
import { qualitySettings, useResolvedQuality } from './quality'

const PI = Math.PI

export function Lights() {
  const look = useLook()
  const settings = qualitySettings(useResolvedQuality())
  const az = (look.sunAzimuth * PI) / 180
  const el = (look.sunElevation * PI) / 180
  const dist = 60
  const x = dist * Math.cos(el) * Math.sin(az)
  const y = dist * Math.sin(el)
  const z = dist * Math.cos(el) * Math.cos(az)
  const extent = settings.shadowFrustum
  const map = settings.shadowMapSize

  return (
    <>
      {/* soft cool sky dome does most of the work */}
      <hemisphereLight args={[look.skyColor, look.groundBounce, look.skyIntensity * PI]} />
      {/* gentle sun for direction and soft shadows */}
      <directionalLight
        color={look.sunColor}
        intensity={look.sunIntensity * PI}
        position={[x, y, z]}
        castShadow
        shadow-mapSize={[map, map]}
        shadow-radius={look.shadowSoftness}
        shadow-blurSamples={settings.shadowBlurSamples}
        shadow-bias={settings.shadowBias}
        shadow-normalBias={settings.shadowNormalBias}
        shadow-camera-near={settings.shadowNear}
        shadow-camera-far={settings.shadowFar}
        shadow-camera-left={-extent}
        shadow-camera-right={extent}
        shadow-camera-top={extent}
        shadow-camera-bottom={-extent}
      />
      {/* faint fill from the camera side so shaded faces stay readable */}
      <directionalLight color="#eef2ff" intensity={0.12 * PI} position={[30, 20, 40]} />
    </>
  )
}
