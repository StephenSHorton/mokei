import { ContactShadows } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { useRef } from 'react'
import { Tree } from '../models/Tree'
import { Fence } from '../models/Fence'
import { Pallet } from '../models/Pallet'
import { Warehouse } from '../models/Warehouse'
import { tick, useYard } from '../sim/yard'
import { ContactBlobs } from './ContactBlobs'
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
      <ContactBlobs />
      <Units />
      <Trees />
      <Dressing />
      <ContactShadows
        position={[0, 0.012, 0]}
        opacity={0.32}
        scale={70}
        blur={2.1}
        far={8}
        color="#334155"
        resolution={1024}
        frames={90}
      />
      <PostFX />
    </>
  )
}

function Dressing() {
  const stacks: [number, number, number, 'tan' | 'blue'][] = [
    [-7.4, 14.6, 2, 'tan'],
    [-6.1, 14.8, 3, 'tan'],
    [11.2, 14.2, 2, 'tan'],
    [12.5, 13.6, 3, 'blue'],
    [-21.2, 11.4, 2, 'tan'],
    [15.6, 4.8, 2, 'tan'],
  ]
  return (
    <group>
      {stacks.map(([x, z, stacks, wrap], index) => (
        <group key={index} position={[x, 0, z]} rotation={[0, index * 0.15, 0]}>
          <Pallet stacks={stacks} wrap={wrap} />
        </group>
      ))}
    </group>
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
    [19.6, 19.4, 0.7],
    [-14.8, 18.8, 0.74],
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
