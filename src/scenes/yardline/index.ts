import { lookDefaults } from '../../kit/clay'
import type { SceneDefinition, SceneEvent } from '../../kit/scene/types'
import { Hud } from './hud/Hud'
import { World } from './World'
import { useYard } from './sim/yard'

export { World } from './World'
export { Hud } from './hud/Hud'
export { useYard } from './sim/yard'

export function dispatchYardEvent(event: SceneEvent) {
  const yard = useYard.getState()
  switch (event.type) {
    case 'select':
      yard.select(event.id)
      return
    case 'task-started': {
      const id = event.id && yard.units[event.id] ? event.id : 'fl-10'
      yard.select(id)
      return
    }
    case 'task-progress':
      return
    case 'task-finished':
    case 'reset':
      yard.select(null)
      return
    default:
      return
  }
}

export const yardlineScene = {
  id: 'yardline',
  name: 'Yardline',
  description: 'Clay-diorama warehouse yard with docks, forklifts, and trucks.',
  themeId: 'yardline',
  World,
  Hud,
  camera: {
    zoom: lookDefaults.cameraZoom,
    azimuth: lookDefaults.cameraAzimuth,
    elevation: lookDefaults.cameraElevation,
    target: { x: -1.5, z: -5.5 },
    zoomMin: lookDefaults.zoomMin,
    zoomMax: lookDefaults.zoomMax,
    zoomReferenceWidth: lookDefaults.zoomReferenceWidth,
  },
  look: lookDefaults,
  dispatch: dispatchYardEvent,
} satisfies SceneDefinition
