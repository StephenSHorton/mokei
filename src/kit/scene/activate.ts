import { applyLook, lookDefaults, setViewHome } from '../clay/look'
import { applyTheme } from '../theme'
import { getDefaultSceneId, getScene, listScenes, peekScene } from './registry'
import type { SceneDefinition } from './types'

export function sceneIdFromSearch(search = typeof location !== 'undefined' ? location.search : ''): string {
  const raw = new URLSearchParams(search).get('scene')
  return raw && raw.trim() ? raw.trim() : getDefaultSceneId() ?? ''
}

/**
 * Resolve a scene id. Unknown ids fall back to the default (or the first
 * registered scene) and warn. Returns `undefined` only when nothing is registered.
 */
export function resolveScene(id?: string): SceneDefinition | undefined {
  const wanted = id ?? sceneIdFromSearch()
  const found = wanted ? peekScene(wanted) : undefined
  if (found) return found
  const fallbackId = getDefaultSceneId()
  const fallback = (fallbackId ? peekScene(fallbackId) : undefined) ?? listScenes()[0]
  if (fallback) {
    if (wanted) console.warn(`[mokei] unknown scene "${wanted}", using "${fallback.id}"`)
    return fallback
  }
  if (wanted) getScene(wanted)
  return undefined
}

/** Apply the scene's theme, clay palette, and camera defaults. */
export function activateScene(scene: SceneDefinition | string): SceneDefinition | undefined {
  const resolved = typeof scene === 'string' ? peekScene(scene) ?? resolveScene(scene) : scene
  if (!resolved) {
    console.warn(`[mokei] cannot activate scene: ${typeof scene === 'string' ? scene : '(missing definition)'}`)
    return undefined
  }
  applyTheme(resolved.themeId)
  const cameraZoom = resolved.camera?.zoom ?? resolved.look?.cameraZoom ?? lookDefaults.cameraZoom
  const cameraAzimuth = resolved.camera?.azimuth ?? resolved.look?.cameraAzimuth ?? lookDefaults.cameraAzimuth
  const cameraElevation = resolved.camera?.elevation ?? resolved.look?.cameraElevation ?? lookDefaults.cameraElevation
  applyLook({
    ...lookDefaults,
    ...resolved.look,
    cameraZoom,
    cameraAzimuth,
    cameraElevation,
    zoomMin: resolved.camera?.zoomMin ?? resolved.look?.zoomMin ?? lookDefaults.zoomMin,
    zoomMax: resolved.camera?.zoomMax ?? resolved.look?.zoomMax ?? lookDefaults.zoomMax,
    zoomReferenceWidth:
      resolved.camera?.zoomReferenceWidth ?? resolved.look?.zoomReferenceWidth ?? lookDefaults.zoomReferenceWidth,
    panX: 0,
    panZ: 0,
  })
  setViewHome({ cameraZoom, cameraAzimuth, cameraElevation })
  return resolved
}
