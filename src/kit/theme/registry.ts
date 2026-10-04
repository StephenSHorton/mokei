import type { ThemeDefinition } from './types'

const themes = new Map<string, ThemeDefinition>()

export type ThemeId = string

let defaultThemeId: string | undefined

/** Host-configurable. Unset means “first registered theme”. */
export function setDefaultThemeId(id: string) {
  defaultThemeId = id
}

export function getDefaultThemeId(): string | undefined {
  return defaultThemeId ?? [...themes.keys()][0]
}

export function registerTheme(def: ThemeDefinition): ThemeDefinition {
  themes.set(def.id, def)
  return def
}

/** Returns the theme, or `undefined` if nothing is registered under `id`. */
export function getTheme(id: string): ThemeDefinition | undefined {
  const theme = themes.get(id)
  if (!theme) {
    const known = [...themes.keys()].join(', ') || '(none)'
    console.warn(`[mokei] unknown theme "${id}". Known: ${known}. Call registerTheme or import mokei/theme/<id>.`)
  }
  return theme
}

export function listThemes(): ThemeDefinition[] {
  return [...themes.values()]
}
