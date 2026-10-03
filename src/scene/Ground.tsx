import { useRef } from 'react'
import { useLook } from '../look'
import { SoftBox } from '../models/soft'
import { useYard } from '../sim/yard'

export function Ground() {
  const ground = useLook((s) => s.ground)
  const road = useLook((s) => s.road)
  const grass = useLook((s) => s.grass)
  const setLook = useLook((s) => s.setLook)
  const select = useYard((s) => s.select)
  const drag = useRef<{ active: boolean; x: number; y: number; panX: number; panZ: number } | null>(null)

  return (
    <group>
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        receiveShadow
        onPointerDown={(event) => {
          if (event.button !== 0) return
          drag.current = {
            active: false,
            x: event.clientX,
            y: event.clientY,
            panX: useLook.getState().panX,
            panZ: useLook.getState().panZ,
          }
          event.stopPropagation()
        }}
        onPointerMove={(event) => {
          const state = drag.current
          if (!state) return
          const dx = event.clientX - state.x
          const dy = event.clientY - state.y
          if (!state.active && Math.hypot(dx, dy) < 5) return
          state.active = true
          event.stopPropagation()
          const az = (useLook.getState().cameraAzimuth * Math.PI) / 180
          const scale = 1.25 / useLook.getState().cameraZoom
          setLook({
            panX: state.panX - Math.cos(az) * dx * scale - Math.sin(az) * dy * scale * 1.6,
            panZ: state.panZ + Math.sin(az) * dx * scale - Math.cos(az) * dy * scale * 1.6,
          })
        }}
        onPointerUp={() => {
          if (drag.current && !drag.current.active) select(null)
          drag.current = null
        }}
        onPointerLeave={() => {
          drag.current = null
        }}
      >
        <planeGeometry args={[400, 400]} />
        <meshLambertMaterial color={ground} />
      </mesh>

      {/* outer road band with curbs and lane dashes */}
      <Road z={24.2} width={7.4} color={road} />
      <RoadX x={33.5} width={7} color={road} />
      {/* grass pads */}
      <SoftBox size={[9, 0.06, 5]} r={0.03} color={grass} position={[22.5, 0.03, -11]} cast={false} />
      <SoftBox size={[6, 0.06, 4]} r={0.03} color={grass} position={[-24, 0.03, 18]} cast={false} />
      <SoftBox size={[7, 0.06, 4.4]} r={0.03} color={grass} position={[14, 0.03, -24]} cast={false} />
      <SoftBox size={[8, 0.06, 4]} r={0.03} color="#dff7ea" position={[-21, 0.03, -2.4]} cast={false} />
    </group>
  )
}

function Road({ z, width, color }: { z: number; width: number; color: string }) {
  const dashes = []
  for (let x = -70; x < 70; x += 5) dashes.push(x)
  return (
    <group position={[0, 0, z]}>
      <SoftBox size={[200, 0.05, width]} r={0.02} color={color} position={[0, 0.025, 0]} cast={false} />
      <SoftBox size={[200, 0.16, 0.5]} r={0.07} color="#f5f7fc" position={[0, 0.08, -width / 2 - 0.2]} cast={false} />
      <SoftBox size={[200, 0.16, 0.5]} r={0.07} color="#f5f7fc" position={[0, 0.08, width / 2 + 0.2]} cast={false} />
      {dashes.map((x) => (
        <SoftBox key={x} size={[2.2, 0.03, 0.22]} r={0.01} smooth={2} color="#f3f6fd" position={[x, 0.06, 0]} cast={false} />
      ))}
    </group>
  )
}

function RoadX({ x, width, color }: { x: number; width: number; color: string }) {
  const dashes = []
  for (let z = -60; z < 20; z += 5) dashes.push(z)
  return (
    <group position={[x, 0, 0]}>
      <SoftBox size={[width, 0.05, 120]} r={0.02} color={color} position={[0, 0.024, -40]} cast={false} />
      <SoftBox size={[0.5, 0.16, 120]} r={0.07} color="#f5f7fc" position={[-width / 2 - 0.2, 0.08, -40]} cast={false} />
      {dashes.map((z) => (
        <SoftBox key={z} size={[0.22, 0.03, 2.2]} r={0.01} smooth={2} color="#f3f6fd" position={[0, 0.06, z]} cast={false} />
      ))}
    </group>
  )
}
