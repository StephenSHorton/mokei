import type { ComponentType } from 'react'
import type { LookPatch } from '../clay'

/**
 * Camera framing written into the shared look store when a scene activates.
 * Zoom is defined for a 1728px-wide window, same as the Yardline playground.
 */
export type SceneCameraDefaults = {
  zoom: number
  azimuth: number
  elevation: number
  target?: { x: number; z: number }
}

/**
 * Host-app events a scene may honor. Yardline maps these onto forklifts and
 * trucks; a quarry scene would map them onto drills, carts, and conveyors.
 */
export type SceneEvent =
  | { type: 'task-started'; id?: string; label?: string }
  | { type: 'task-progress'; id?: string; progress: number }
  | { type: 'task-finished'; id?: string }
  | { type: 'select'; id: string | null }
  | { type: 'reset' }

export type SceneDispatch = (event: SceneEvent) => void

/**
 * A swappable 3D world. Register one per diorama. The playground picks the
 * scene from `?scene=` (default `yardline`); consumers call `getScene(id)`.
 */
export type SceneDefinition = {
  id: string
  name: string
  description: string
  themeId: string
  World: ComponentType
  Hud?: ComponentType
  camera?: SceneCameraDefaults
  look?: LookPatch
  dispatch?: SceneDispatch
}
