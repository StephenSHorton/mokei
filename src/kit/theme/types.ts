/** A swappable UI token set. CSS lives in tokens.css under `[data-theme='…']`. */
export type ThemeDefinition = {
  id: string
  name: string
  description: string
  /** Value written to `document.documentElement.dataset.theme`. */
  dataTheme: string
}

export function applyTheme(theme: ThemeDefinition | string) {
  const id = typeof theme === 'string' ? theme : theme.dataTheme
  document.documentElement.dataset.theme = id
}
