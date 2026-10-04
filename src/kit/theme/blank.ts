import type { ThemeDefinition } from './types'

/** Starter theme for the blank diorama — warmer stone clay, same glass language. */
export const blankTheme = {
  id: 'blank',
  name: 'Blank diorama',
  description: 'Sandstone clay and ochre accents. A quarry theme would replace this file.',
  dataTheme: 'blank',
} as const satisfies ThemeDefinition
