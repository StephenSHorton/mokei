import { World } from '../../scene/World'
import type { SceneDefinition } from './types'

/**
 * First Mokei scene: the warehouse / logistics yard.
 * Implementation stays in src/scene + src/models + src/sim so the playground
 * is unchanged. This file only registers it.
 */
export const yardlineScene = {
  id: 'yardline',
  name: 'Yardline',
  description: 'Clay-diorama warehouse yard with docks, forklifts, and trucks.',
  themeId: 'yardline',
  World,
} as const satisfies SceneDefinition
