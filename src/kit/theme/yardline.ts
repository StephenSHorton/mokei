import type { ThemeDefinition } from './types'

/** First Mokei theme: glass HUD on the lavender warehouse-yard clay field. */
export const yardlineTheme = {
  id: 'yardline',
  name: 'Yardline',
  description: 'Glass panels, SF/Inter type, and the existing clay-diorama blues.',
  dataTheme: 'yardline',
} as const satisfies ThemeDefinition
