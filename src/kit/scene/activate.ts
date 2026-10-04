import { applyLook, lookDefaults } from '../clay'
import { applyTheme } from '../theme'
import { getScene } from './registry'
import type { SceneDefinition } from './types'

export function sceneIdFromSearch(search = typeof location !== 'undefined' ? location.search : ''): string {
  const raw = new URLSearchParams(search).get('scene')
  return raw && raw.trim() ? raw.trim() : 'yardline'
}

export function resolveScene(id?: string): SceneDefinition {
  return getScene(id ?? sceneIdFromSearch())
}

/** Apply the scene's theme, clay palette, and camera defaults. */
export function activateScene(scene: SceneDefinition | string) {
  const resolved = typeof scene === 'string' ? getScene(scene) : scene
  applyTheme(resolved.themeId)
  applyLook({
    ...lookDefaults,
    ...resolved.look,
    ...(resolved.camera
      ? {
          cameraZoom: resolved.camera.zoom,
          cameraAzimuth: resolved.camera.azimuth,
          cameraElevation: resolved.camera.elevation,
        }
      : {}),
    panX: 0,
    panZ: 0,
  })
  return resolved
}
