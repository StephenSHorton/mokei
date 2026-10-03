import { useRef } from 'react'
import { useLook } from '../look'
import { Matte } from '../models/Matte'
import { useYard } from '../sim/yard'

export function Ground() {
  const ground = useLook((s) => s.ground)
  const setLook = useLook((s) => s.setLook)
  const select = useYard((s) => s.select)
  const drag = useRef<{
    active: boolean
    x: number
    y: number
    panX: number
    panZ: number
  } | null>(null)

  return (
    <mesh
      rotation={[-Math.PI / 2, 0, 0]}
      position={[0, 0, 0]}
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
        const rightX = Math.cos(az)
        const rightZ = -Math.sin(az)
        const fwdX = Math.sin(az)
        const fwdZ = Math.cos(az)
        const scale = 0.045
        setLook({
          panX: state.panX - rightX * dx * scale + fwdX * dy * scale,
          panZ: state.panZ - rightZ * dx * scale + fwdZ * dy * scale,
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
      <planeGeometry args={[90, 80]} />
      <Matte color={ground} />
    </mesh>
  )
}
