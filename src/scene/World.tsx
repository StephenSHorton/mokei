import { useFrame } from '@react-three/fiber'
import { useRef } from 'react'
import { FenceRun } from '../models/Fence'
import { Pallet } from '../models/Pallet'
import { Charger, Container, Rack, RoadTraffic, WrappedPallet } from '../models/Props'
import { Tree } from '../models/Tree'
import { Warehouse } from '../models/Warehouse'
import { freezeAt } from '../sim/freeze'
import { tick, useYard } from '../sim/yard'
import { CameraRig } from './CameraRig'
import { ContactBlobs } from './ContactBlobs'
import { Ground } from './Ground'
import { Lights } from './Lights'
import { PostFX } from './PostFX'
import { Units } from './Units'
import { YardMarkings } from './YardMarkings'

const NO_AO = typeof location !== 'undefined' && location.search.includes('noao')

const FROZEN = typeof location !== 'undefined' && freezeAt() != null

export function World() {
  const publish = useYard((s) => s.publish)
  const hudAcc = useRef(0)

  useFrame((_, dt) => {
    if (FROZEN) return
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
      <ContactBlobs />
      <Units />
      <Dressing />
      <Trees />
      <RoadTraffic z={22.6} speed={3.2} offset={10} accent="teal" />
      <RoadTraffic z={25.8} speed={-2.6} offset={70} accent="blue" />
      {NO_AO ? null : <PostFX />}
    </>
  )
}

function Dressing() {
  const stacks: [number, number, number, 'tan' | 'blue'][] = [
    [-7.4, 14.6, 2, 'tan'],
    [-6.0, 14.9, 3, 'tan'],
    [11.2, 14.4, 2, 'tan'],
    [12.6, 14.0, 3, 'blue'],
    [-20.8, 4.6, 2, 'tan'],
    [16.8, 3.2, 2, 'blue'],
    [16.9, 1.6, 2, 'blue'],
  ]
  return (
    <group>
      {stacks.map(([x, z, n, wrap], index) => (
        <group key={index} position={[x, 0, z]} rotation={[0, index * 0.12 - 0.2, 0]}>
          <Pallet stacks={n} wrap={wrap} seed={index} />
        </group>
      ))}
      <group position={[-1.2, 0, 15.2]} rotation={[0, 0.1, 0]}>
        <WrappedPallet />
      </group>
      <group position={[20.8, 0, -2.4]} rotation={[0, Math.PI / 2, 0]}>
        <Rack bays={3} levels={3} />
      </group>
      <group position={[-23.6, 0, 3.2]} rotation={[0, 0.02, 0]}>
        <Container />
      </group>
      {[-23.4, -21.6, -19.8].map((x) => (
        <group key={x} position={[x, 0, -3.6]}>
          <Charger />
        </group>
      ))}
      <FenceRun from={[-30, 19.9]} to={[-6, 19.9]} />
      <FenceRun from={[6, 19.9]} to={[29, 19.9]} />
      <FenceRun from={[29, 19.9]} to={[29, -20]} />
      <FenceRun from={[-30, -36]} to={[29, -36]} />
      <FenceRun from={[29, -20]} to={[29, -36]} />
    </group>
  )
}

function Trees() {
  const spots: [number, number, number, boolean?][] = [
    [-22.5, 17.6, 1.0],
    [-25.2, 18.8, 0.85],
    [-23.6, 16.7, 0.7, true],
    [21.5, -9.8, 1.05],
    [24.2, -12.0, 0.92],
    [22.8, -11.6, 0.8, true],
    [-20.5, -21.5, 0.95],
    [-23.5, -22.8, 0.82],
    [-19.0, -23.2, 0.7, true],
    [12.5, -22.5, 0.9],
    [15.5, -24.2, 1.0],
    [13.6, -25.6, 0.7, true],
    [11.5, -30.5, 0.95],
    [-21.5, -30.2, 1.0],
    [26.5, 4.4, 0.86],
    [26.8, 10.8, 0.95],
    [26.5, 15.5, 0.8, true],
    [-28.2, 8.4, 0.9],
  ]
  return (
    <group>
      {spots.map(([x, z, scale, bush]) => (
        <group key={`${x}:${z}`} position={[x, 0, z]}>
          <Tree scale={scale} bush={bush} />
        </group>
      ))}
    </group>
  )
}
