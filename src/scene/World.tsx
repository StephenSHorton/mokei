import { ContactShadows } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { useRef } from 'react'
import { Tree } from '../models/Tree'
import { Fence } from '../models/Fence'
import { Warehouse } from '../models/Warehouse'
import { tick, useYard } from '../sim/yard'
import { CameraRig } from './CameraRig'
import { Ground } from './Ground'
import { Lights } from './Lights'
import { PostFX } from './PostFX'
import { Units } from './Units'
import { YardMarkings } from './YardMarkings'

export function World() {
  const publish = useYard((s) => s.publish)
  const hudAcc = useRef(0)

  useFrame((_, dt) => {
    tick(Math.min(dt, 0.05))
    hudAcc.current += dt
    if (hudAcc.current > 0.14) {
      hudAcc.current = 0
      publish()
    }
  })

  return (
    <>
      <CameraRig />
      <Lights />
      <Ground />
      <YardMarkings />
      <Warehouse />
      <Fence />
      <Units />
      <Trees />
      <ContactShadows
        position={[0, 0.012, 0]}
        opacity={0.2}
        scale={70}
        blur={2.4}
        far={6}
        color="#475569"
        resolution={512}
        frames={1}
      />
      <PostFX />
    </>
  )
}

function Trees() {
  const spots: [number, number, number][] = [
    [-22.5, 17.4, 1.05],
    [-18.8, 18.6, 0.88],
    [21.5, 18.2, 1],
    [24.8, 9.4, 0.92],
    [23.2, 16.4, 0.78],
    [-24.6, 6.5, 0.85],
  ]
  return (
    <group>
      {spots.map(([x, z, scale]) => (
        <group key={`${x}:${z}`} position={[x, 0, z]}>
          <Tree scale={scale} />
        </group>
      ))}
    </group>
  )
}
