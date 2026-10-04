import type { ComponentType } from 'react'
import type { LookPatch } from '../clay/look'

/**
 * Camera framing written into the shared look store when a scene activates.
 * Zoom is defined for `zoomReferenceWidth` (default 1728px, the Yardline frames)
 * and scales with the window. Clamp is per scene.
 */
export type SceneCameraDefaults = {
  zoom: number
  azimuth: number
  elevation: number
  target?: { x: number; z: number }
  zoomMin?: number
  zoomMax?: number
  zoomReferenceWidth?: number
}

/**
 * Host-app events a scene may honor.
 *
 * Yardline maps the original task/select/reset set onto forklifts and trucks.
 * Rock's quarry maps the station / gate / crate / subagent set onto drills,
 * carts, and docks — names match Rock's compat layer so that host can drop
 * its shims.
 */
export type SceneEvent =
  | { type: 'task-started'; id?: string; label?: string }
  | { type: 'task-progress'; id?: string; progress: number }
  | { type: 'task-finished'; id?: string }
  | { type: 'select'; id: string | null }
  | { type: 'reset' }
  | { type: 'tool-station'; id?: string; station?: string; label?: string }
  | { type: 'permission-gate'; id?: string; allowed?: boolean; label?: string }
  | { type: 'crate'; id?: string; count?: number; label?: string }
  | { type: 'output'; id?: string; label?: string }
  | { type: 'subagent-spawn'; id?: string; label?: string }
  | { type: 'subagent-finish'; id?: string }

export type SceneDispatch = (event: SceneEvent) => void

/**
 * A swappable 3D world. Register one per diorama with `registerScene`.
 * The playground imports `mokei/scene/yardline` (and blank) so those
 * worlds self-register. Hosts that only want clay never load them.
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
