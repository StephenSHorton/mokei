import { deriveDetailRamp } from './materials'
import { registerTheme } from './registry'
import type { ThemeDefinition } from './types'

/** Starter theme for the blank diorama — warm near-white clay, ochre accents. */
export const blankTheme = {
  id: 'blank',
  name: 'Blank diorama',
  description: 'Warm white clay and ochre accents for the blank starter pad.',
  dataTheme: 'blank',
  materials: {
    base: '#f6efe4',
    accent1: '#c2410c',
    accent2: '#e2a334',
    detail: deriveDetailRamp('#2a241f', '#f6efe4'),
    ground: '#efe4d2',
  },
} satisfies ThemeDefinition

registerTheme(blankTheme)
