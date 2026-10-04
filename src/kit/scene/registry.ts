import { blankScene } from '../../scenes/blank'
import { yardlineScene } from '../../scenes/yardline'
import type { SceneDefinition } from './types'

const scenes = {
  [yardlineScene.id]: yardlineScene,
  [blankScene.id]: blankScene,
} as const satisfies Record<string, SceneDefinition>

export type SceneId = keyof typeof scenes

export function listScenes(): SceneDefinition[] {
  return Object.values(scenes)
}

export function getScene(id: SceneId | string): SceneDefinition {
  const scene = scenes[id as SceneId]
  if (!scene) {
    throw new Error(`Unknown Mokei scene: ${id}. Known: ${Object.keys(scenes).join(', ')}`)
  }
  return scene
}

export const DEFAULT_SCENE_ID: SceneId = yardlineScene.id
