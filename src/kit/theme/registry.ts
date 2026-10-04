import type { ThemeDefinition } from './types'
import { yardlineTheme } from './yardline'

const themes = {
  [yardlineTheme.id]: yardlineTheme,
} as const satisfies Record<string, ThemeDefinition>

export type ThemeId = keyof typeof themes

export function listThemes(): ThemeDefinition[] {
  return Object.values(themes)
}

export function getTheme(id: ThemeId | string): ThemeDefinition {
  const theme = themes[id as ThemeId]
  if (!theme) {
    throw new Error(`Unknown Mokei theme: ${id}. Known: ${Object.keys(themes).join(', ')}`)
  }
  return theme
}

export const DEFAULT_THEME_ID: ThemeId = yardlineTheme.id
