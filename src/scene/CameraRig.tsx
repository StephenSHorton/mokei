import { OrthographicCamera } from '@react-three/drei'
import { useFrame, useThree } from '@react-three/fiber'
import { useEffect, useRef } from 'react'
import { Vector3 } from 'three'
import type { OrthographicCamera as OrthographicCameraImpl } from 'three'
import { damp } from '../lib/math'
import { useLook } from '../look'
import { runtime, useYard } from '../sim/yard'

export function CameraRig() {
  const camera = useThree((s) => s.camera)
  const gl = useThree((s) => s.gl)
  const look = useLook()
  const selectedId = useYard((s) => s.selectedId)
  const target = useRef(new Vector3(0, 0, 3.2))
  const zoomBy = useLook((s) => s.zoomBy)

  useEffect(() => {
    const element = gl.domElement
    const onWheel = (event: WheelEvent) => {
      event.preventDefault()
      zoomBy(event.deltaY > 0 ? -1.4 : 1.4)
    }
    element.addEventListener('wheel', onWheel, { passive: false })
    return () => element.removeEventListener('wheel', onWheel)
  }, [gl, zoomBy])

  useFrame((_, dt) => {
    const unit = selectedId && selectedId !== 'wh-northpoint' ? runtime.units[selectedId] : null
    const goalX = (unit?.x ?? 1.2) + look.panX
    const goalZ = (unit?.z ?? 4.5) + look.panZ
    target.current.x = damp(target.current.x, goalX, 3.1, dt)
    target.current.z = damp(target.current.z, goalZ, 3.1, dt)

    const az = (look.cameraAzimuth * Math.PI) / 180
    const el = (look.cameraElevation * Math.PI) / 180
    const dist = 62
    const cam = camera as OrthographicCameraImpl
    cam.position.set(
      target.current.x + dist * Math.cos(el) * Math.sin(az),
      target.current.y + dist * Math.sin(el),
      target.current.z + dist * Math.cos(el) * Math.cos(az),
    )
    cam.lookAt(target.current)
    cam.zoom = damp(cam.zoom || look.cameraZoom, look.cameraZoom, 7, dt)
    cam.near = -120
    cam.far = 240
    cam.updateProjectionMatrix()
  })

  return (
    <OrthographicCamera
      makeDefault
      position={[40, 36, 40]}
      zoom={look.cameraZoom}
      near={-120}
      far={240}
    />
  )
}
