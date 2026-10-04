import { useLook } from './look'

const PI = Math.PI

export function Lights() {
  const look = useLook()
  const az = (look.sunAzimuth * PI) / 180
  const el = (look.sunElevation * PI) / 180
  const dist = 60
  const x = dist * Math.cos(el) * Math.sin(az)
  const y = dist * Math.sin(el)
  const z = dist * Math.cos(el) * Math.cos(az)

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
        shadow-mapSize={[2048, 2048]}
        shadow-radius={look.shadowSoftness}
        shadow-blurSamples={16}
        shadow-bias={-0.0004}
        shadow-normalBias={0.03}
        shadow-camera-near={1}
        shadow-camera-far={140}
        shadow-camera-left={-42}
        shadow-camera-right={42}
        shadow-camera-top={42}
        shadow-camera-bottom={-42}
      />
      {/* faint fill from the camera side so shaded faces stay readable */}
      <directionalLight color="#eef2ff" intensity={0.12 * PI} position={[30, 20, 40]} />
    </>
  )
}
