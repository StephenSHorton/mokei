import type { SceneDefinition } from '../../kit/scene/types'
import { World } from './World'
import { useBlank } from './state'

export { World } from './World'
export { useBlank } from './state'

export const blankLook = {
  ground: '#efe4d2',
  road: '#d4b896',
  grass: '#d7e3b8',
  wall: '#f6efe4',
  roof: '#c2410c',
  accent: '#c2410c',
  yellow: '#e2a334',
  cardboard: '#c4a07a',
  tree: '#7dae6a',
  tire: '#2a241f',
  aoColor: '#4a3728',
  skyColor: '#f3ead8',
  groundBounce: '#e4d4bc',
  cameraZoom: 34,
  cameraAzimuth: 32,
  cameraElevation: 40,
}

export const blankScene = {
  id: 'blank',
  name: 'Blank diorama',
  description: 'Starter clay pad that reuses shared primitives. Swap this for a quarry.',
  themeId: 'blank',
  World,
  camera: {
    zoom: blankLook.cameraZoom,
    azimuth: blankLook.cameraAzimuth,
    elevation: blankLook.cameraElevation,
    target: { x: 0, z: 0.4 },
  },
  look: blankLook,
  dispatch: (event) => useBlank.getState().dispatch(event),
} satisfies SceneDefinition
