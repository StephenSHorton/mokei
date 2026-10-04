import { OrthographicCamera } from '@react-three/drei'
import { useFrame, useThree } from '@react-three/fiber'
import { useEffect, useRef } from 'react'
import { Vector3 } from 'three'
import type { OrthographicCamera as OrthographicCameraImpl } from 'three'
import { damp, dampAngle } from '../../lib/math'
import { useLook } from './look'

/** Shared ortho rig. Scenes that follow a unit (Yardline) wrap or replace this. */
export function ClayCameraRig({ home = { x: 0, z: 0 } }: { home?: { x: number; z: number } }) {
  const camera = useThree((s) => s.camera)
  const gl = useThree((s) => s.gl)
  const size = useThree((s) => s.size)
  const look = useLook()
  const target = useRef(new Vector3(home.x, 0, home.z))
  const az = useRef((look.cameraAzimuth * Math.PI) / 180)
  const zoomBy = useLook((s) => s.zoomBy)

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
    target.current.x = damp(target.current.x, home.x + look.panX, 2.4, dt)
    target.current.z = damp(target.current.z, home.z + look.panZ, 2.4, dt)
    az.current = dampAngle(az.current, (look.cameraAzimuth * Math.PI) / 180, 5, dt)

    const el = (look.cameraElevation * Math.PI) / 180
    const dist = 80
    const cam = camera as OrthographicCameraImpl
    cam.position.set(
      target.current.x + dist * Math.cos(el) * Math.sin(az.current),
      dist * Math.sin(el),
      target.current.z + dist * Math.cos(el) * Math.cos(az.current),
    )
    cam.lookAt(target.current)
    const goalZoom = look.cameraZoom * (size.width / look.zoomReferenceWidth)
    cam.zoom = damp(cam.zoom || goalZoom, goalZoom, 7, dt)
    cam.near = -200
    cam.far = 400
    cam.updateProjectionMatrix()
  })

  return <OrthographicCamera makeDefault position={[40, 36, 40]} zoom={look.cameraZoom} near={-200} far={400} />
}
