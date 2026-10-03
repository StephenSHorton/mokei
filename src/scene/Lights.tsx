import { SoftShadows } from '@react-three/drei'
import { useLook } from '../look'

export function Lights() {
  const look = useLook()
  const az = (look.sunAzimuth * Math.PI) / 180
  const el = (look.sunElevation * Math.PI) / 180
  const dist = 48
  const x = dist * Math.cos(el) * Math.sin(az)
  const y = dist * Math.sin(el)
  const z = dist * Math.cos(el) * Math.cos(az)

  return (
    <>
      <SoftShadows size={look.shadowSoftness} samples={12} focus={0.35} />
      <hemisphereLight
        args={[look.skyColor, look.groundBounce, look.skyIntensity]}
      />
      <ambientLight intensity={0.18} color={look.skyColor} />
      <directionalLight
        color={look.sunColor}
        intensity={look.sunIntensity}
        position={[x, y, z]}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-bias={-0.00025}
        shadow-normalBias={0.04}
        shadow-camera-near={8}
        shadow-camera-far={90}
        shadow-camera-left={-36}
        shadow-camera-right={36}
        shadow-camera-top={36}
        shadow-camera-bottom={-36}
      />
    </>
  )
}
