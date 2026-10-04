import { applyMaterials, assertMaterialPalette, type MaterialPalette } from './materials'
import { getTheme } from './registry'

export type { DetailRamp, MaterialPalette, MaterialRole } from './materials'

/** A swappable UI token set. CSS lives under `mokei/themes/<id>.css`. */
export type ThemeDefinition = {
  id: string
  name: string
  description: string
  /** Value written to `document.documentElement.dataset.theme`. */
  dataTheme: string
  /** At most three accents. `base` must be white or near-white. */
  materials: MaterialPalette
}

export function applyTheme(theme: ThemeDefinition | string) {
  const resolved = typeof theme === 'string' ? getTheme(theme) : theme
  const id = resolved ? resolved.dataTheme : typeof theme === 'string' ? theme : theme.dataTheme
  if (typeof document !== 'undefined') {
    document.documentElement.dataset.theme = id
  }
  if (resolved?.materials) {
    assertMaterialPalette(resolved.materials, resolved.id)
    applyMaterials(resolved.materials)
  }
}
