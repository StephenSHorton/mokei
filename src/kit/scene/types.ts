import type { ComponentType } from 'react'

/**
 * A swappable 3D world. The theme is referenced by id so a scene can share
 * glass tokens (Yardline) or bring its own (a future quarry).
 */
export type SceneDefinition = {
  id: string
  name: string
  description: string
  themeId: string
  World: ComponentType
}
