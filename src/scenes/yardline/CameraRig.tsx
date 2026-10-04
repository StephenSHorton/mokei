import { OrthographicCamera } from '@react-three/drei'
import { useFrame, useThree } from '@react-three/fiber'
import { useEffect, useRef } from 'react'
import { Vector3 } from 'three'
import type { OrthographicCamera as OrthographicCameraImpl } from 'three'
import { damp, dampAngle } from '../../lib/math'
import { useLook } from '../../kit/clay'
import { WAREHOUSE_ID, runtime, useYard } from './sim/yard'

const HOME_TARGET = { x: -1.5, z: -5.5 }

export function CameraRig() {
  const camera = useThree((s) => s.camera)
  const gl = useThree((s) => s.gl)
  const size = useThree((s) => s.size)
  const look = useLook()
  const selectedId = useYard((s) => s.selectedId)
  const target = useRef(new Vector3(HOME_TARGET.x, 0, HOME_TARGET.z))
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
    const unit = selectedId && selectedId !== WAREHOUSE_ID ? runtime.units[selectedId] : null
    // Ease gently toward the selection but keep the yard framed.
    const goalX = (unit ? HOME_TARGET.x * 0.8 + unit.x * 0.2 : HOME_TARGET.x) + look.panX
    const goalZ = (unit ? HOME_TARGET.z * 0.8 + unit.z * 0.2 : HOME_TARGET.z) + look.panZ
    target.current.x = damp(target.current.x, goalX, 2.4, dt)
    target.current.z = damp(target.current.z, goalZ, 2.4, dt)
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
    // Zoom is defined for a 1728px-wide viewport (the reference frames) and
    // scales with the window so the framing holds at any size.
    const goalZoom = look.cameraZoom * (size.width / look.zoomReferenceWidth)
    cam.zoom = damp(cam.zoom || goalZoom, goalZoom, 7, dt)
    cam.near = -200
    cam.far = 400
    cam.updateProjectionMatrix()
  })

  return <OrthographicCamera makeDefault position={[40, 36, 40]} zoom={look.cameraZoom} near={-200} far={400} />
}
