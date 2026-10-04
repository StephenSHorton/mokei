import type { SceneDefinition } from './types'

const scenes = new Map<string, SceneDefinition>()

export type SceneId = string

export const DEFAULT_SCENE_ID = 'yardline'

export function registerScene(def: SceneDefinition): SceneDefinition {
  scenes.set(def.id, def)
  return def
}

/** Returns the scene, or `undefined` if nothing is registered under `id`. */
export function getScene(id: string): SceneDefinition | undefined {
  const scene = scenes.get(id)
  if (!scene) {
    const known = [...scenes.keys()].join(', ') || '(none)'
    console.warn(`[mokei] unknown scene "${id}". Known: ${known}. Import mokei/scene/<id> or call registerScene.`)
  }
  return scene
}

export function peekScene(id: string): SceneDefinition | undefined {
  return scenes.get(id)
}

export function listScenes(): SceneDefinition[] {
  return [...scenes.values()]
}
