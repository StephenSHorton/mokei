import { create } from 'zustand'

/**
 * Semantic clay roles. A theme may have at most three accents (typed).
 * Prefer these on SoftBox / RoundCyl / Matte / Wheel. Use `unsafeColor`
 * only for one-off leftovers that are not a defining accent.
 */
export type MaterialRole =
  | 'base'
  | 'accent1'
  | 'accent2'
  | 'accent3'
  | 'detail.dark'
  | 'detail.mid'
  | 'detail.light'
  | 'ground'

export type DetailRamp = {
  dark: string
  mid: string
  light: string
}

export type MaterialPalette = {
  /** White or near-white. Primary material on most surfaces. */
  base: string
  accent1: string
  accent2?: string
  accent3?: string
  detail: DetailRamp
  /** Muted ground / rock / pad. Not an accent. */
  ground: string
}

const FALLBACK_PALETTE: MaterialPalette = {
  base: '#f7f9fd',
  accent1: '#2563eb',
  accent2: '#f2c14e',
  accent3: '#2f63e6',
  detail: { dark: '#1f2533', mid: '#2a3247', light: '#cbd5e1' },
  ground: '#e9eef8',
}

function mixHex(a: string, b: string, t: number) {
  const pa = parseHex(a)
  const pb = parseHex(b)
  if (!pa || !pb) return a
  const m = (i: number) => Math.round(pa[i] + (pb[i] - pa[i]) * t)
  return `#${[m(0), m(1), m(2)].map((n) => n.toString(16).padStart(2, '0')).join('')}`
}

function parseHex(hex: string): [number, number, number] | null {
  const raw = hex.trim().replace('#', '')
  const full = raw.length === 3 ? raw.split('').map((c) => c + c).join('') : raw
  if (full.length !== 6) return null
  const n = Number.parseInt(full, 16)
  if (Number.isNaN(n)) return null
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255]
}

export function luminance(hex: string): number {
  const rgb = parseHex(hex)
  if (!rgb) return 0
  const [r, g, b] = rgb.map((c) => c / 255)
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

export function isNearWhite(hex: string): boolean {
  return luminance(hex) >= 0.85
}

/** Mid/light steps mixed from a near-black toward the theme base. */
export function deriveDetailRamp(dark: string, base = '#f7f5f0'): DetailRamp {
  return {
    dark,
    mid: mixHex(dark, base, 0.35),
    light: mixHex(dark, base, 0.72),
  }
}

export function listAccents(palette: MaterialPalette): string[] {
  return [palette.accent1, palette.accent2, palette.accent3].filter((c): c is string => Boolean(c))
}

export function assertMaterialPalette(palette: MaterialPalette, themeId: string) {
  const accents = listAccents(palette)
  if (accents.length > 3) {
    console.warn(`[mokei] theme "${themeId}" declares ${accents.length} accents; the rule is at most 3.`)
  }
  if (!isNearWhite(palette.base)) {
    console.warn(
      `[mokei] theme "${themeId}" base ${palette.base} is not white/near-white (luminance ${luminance(palette.base).toFixed(2)}). White is the primary material.`,
    )
  }
}

function readRole(palette: MaterialPalette, role: MaterialRole): string {
  switch (role) {
    case 'base':
      return palette.base
    case 'accent1':
      return palette.accent1
    case 'accent2':
      return palette.accent2 ?? palette.accent1
    case 'accent3':
      return palette.accent3 ?? palette.accent1
    case 'detail.dark':
      return palette.detail.dark
    case 'detail.mid':
      return palette.detail.mid
    case 'detail.light':
      return palette.detail.light
    case 'ground':
      return palette.ground
    default:
      return palette.base
  }
}

type MaterialsState = MaterialPalette & {
  setPalette: (palette: MaterialPalette) => void
}

export const useMaterials = create<MaterialsState>((set) => ({
  ...FALLBACK_PALETTE,
  setPalette: (palette) => set(palette),
}))

export function resolveMaterial(role: MaterialRole, palette?: MaterialPalette): string {
  return readRole(palette ?? useMaterials.getState(), role)
}

export function useMaterialColor(role: MaterialRole): string {
  return useMaterials((s) => readRole(s, role))
}

const CSS_VARS: Record<MaterialRole, string> = {
  base: '--mokei-base',
  accent1: '--mokei-accent-1',
  accent2: '--mokei-accent-2',
  accent3: '--mokei-accent-3',
  'detail.dark': '--mokei-detail-dark',
  'detail.mid': '--mokei-detail-mid',
  'detail.light': '--mokei-detail-light',
  ground: '--mokei-ground',
}

export function applyMaterials(palette: MaterialPalette) {
  useMaterials.getState().setPalette(palette)
  if (typeof document === 'undefined') return
  const root = document.documentElement
  for (const role of Object.keys(CSS_VARS) as MaterialRole[]) {
    root.style.setProperty(CSS_VARS[role], resolveMaterial(role, palette))
  }
}

export type ClayColorProps = {
  material?: MaterialRole
  /** One-off hex. Discouraged — see docs/PRINCIPLES.md. */
  unsafeColor?: string
  /** @deprecated Prefer `material` or `unsafeColor`. */
  color?: string
}

let warnedMissing = false

function pickColor(props: ClayColorProps, palette: MaterialPalette, fallback: MaterialRole): string {
  if (props.unsafeColor) return props.unsafeColor
  if (props.color) return props.color
  if (props.material) return readRole(palette, props.material)
  return readRole(palette, fallback)
}

export function resolveClayColor(props: ClayColorProps, fallback: MaterialRole = 'base'): string {
  if (!props.unsafeColor && !props.color && !props.material && !warnedMissing) {
    warnedMissing = true
    console.warn('[mokei] clay primitive missing material= or unsafeColor; falling back to base.')
  }
  return pickColor(props, useMaterials.getState(), fallback)
}

/** Subscribe to the active palette so primitives recolor when the theme changes. */
export function useClayColor(props: ClayColorProps, fallback: MaterialRole = 'base'): string {
  return useMaterials((s) => pickColor(props, s, fallback))
}
