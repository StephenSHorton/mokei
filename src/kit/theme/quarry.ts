import type { ThemeDefinition } from './types'

/** Sandstone / slate / hard-hat orange / teal. The quarry World lives in the host app. */
export const quarryTheme = {
  id: 'quarry',
  name: 'Quarry',
  description: 'Sandstone, slate, hard-hat orange, and a little teal. Register a host scene to use it.',
  dataTheme: 'quarry',
} as const satisfies ThemeDefinition
