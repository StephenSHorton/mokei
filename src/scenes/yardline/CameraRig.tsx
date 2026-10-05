import { OrthographicCamera } from '@react-three/drei'
import { useFrame, useThree } from '@react-three/fiber'
import { useEffect, useRef } from 'react'
import { Vector3 } from 'three'
import type { OrthographicCamera as OrthographicCameraImpl } from 'three'
import { damp, dampAngle } from '../../lib/math'
import { useLook } from '../../kit/clay'
import { WAREHOUSE_ID, runtime, useYard } from './sim/yard'
import { captureCam } from './sim/freeze'

const HOME_TARGET = { x: -1.5, z: -5.5 }

const CAPTURE_FRAMING = {
  side: { azimuth: 92, elevation: 12, zoom: 118, follow: 'fl-10' as const },
  top: { azimuth: 0, elevation: 84, zoom: 34, follow: 'trk-18' as const },
}

export function CameraRig() {
  const camera = useThree((s) => s.camera)
  const gl = useThree((s) => s.gl)
  const size = useThree((s) => s.size)
  const look = useLook()
  const selectedId = useYard((s) => s.selectedId)
  const target = useRef(new Vector3(HOME_TARGET.x, 0, HOME_TARGET.z))
  const az = useRef((look.cameraAzimuth * Math.PI) / 180)
  const zoomBy = useLook((s) => s.zoomBy)
  const setLook = useLook((s) => s.setLook)

  useEffect(() => {
    const shot = captureCam()
    const framing = shot === 'home' ? null : CAPTURE_FRAMING[shot]
    if (!framing) return
    setLook({
      cameraAzimuth: framing.azimuth,
      cameraElevation: framing.elevation,
      cameraZoom: framing.zoom,
      zoomMax: 160,
    })
  }, [setLook])

  useEffect(() => {
    const element = gl.domElement
    const onWheel = (event: WheelEvent) => {
      event.preventDefault()
      zoomBy(event.deltaY > 0 ? -1.6 : 1.6)
    }
    element.addEventListener('wheel', onWheel, { passive: false })
    return () => element.removeEventListener('wheel', onWheel)
  }, [gl, zoomBy])

  useFrame((_, dt) => {
    const shot = captureCam()
    const framing = shot === 'home' ? null : CAPTURE_FRAMING[shot]
    const follow = framing ? runtime.units[framing.follow] : null
    const unit = follow ?? (selectedId && selectedId !== WAREHOUSE_ID ? runtime.units[selectedId] : null)
    const mix = framing ? 1 : 0.2
    const goalX = (unit ? HOME_TARGET.x * (1 - mix) + unit.x * mix : HOME_TARGET.x) + look.panX
    const goalZ = (unit ? HOME_TARGET.z * (1 - mix) + unit.z * mix : HOME_TARGET.z) + look.panZ
    if (framing && unit) {
      const along = shot === 'side' ? 1.55 : 0
      target.current.x = unit.x + Math.sin(unit.heading) * along
      target.current.z = unit.z + Math.cos(unit.heading) * along
      az.current = (framing.azimuth * Math.PI) / 180
    } else {
      target.current.x = damp(target.current.x, goalX, 2.4, dt)
      target.current.z = damp(target.current.z, goalZ, 2.4, dt)
      az.current = dampAngle(az.current, (look.cameraAzimuth * Math.PI) / 180, 5, dt)
    }

    const el = ((framing?.elevation ?? look.cameraElevation) * Math.PI) / 180
    const dist = 80
    const cam = camera as OrthographicCameraImpl
    cam.position.set(
      target.current.x + dist * Math.cos(el) * Math.sin(az.current),
      dist * Math.sin(el),
      target.current.z + dist * Math.cos(el) * Math.cos(az.current),
    )
    cam.lookAt(target.current)
    const zoom = framing?.zoom ?? look.cameraZoom
    const goalZoom = zoom * (size.width / look.zoomReferenceWidth)
    cam.zoom = framing ? goalZoom : damp(cam.zoom || goalZoom, goalZoom, 7, dt)
    cam.near = -200
    cam.far = 400
    cam.updateProjectionMatrix()
    if (framing && typeof window !== 'undefined') {
      ;(window as unknown as { __yardCam?: unknown }).__yardCam = {
        shot,
        y: cam.position.y,
        zoom: cam.zoom,
        target: [target.current.x, target.current.z],
      }
    }
  })

  return <OrthographicCamera makeDefault near={-200} far={400} />
}
