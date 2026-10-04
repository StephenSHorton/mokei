import { create } from 'zustand';
const FALLBACK_PALETTE = {
    base: '#f7f9fd',
    accent1: '#2563eb',
    accent2: '#f2c14e',
    accent3: '#2f63e6',
    detail: { dark: '#1f2533', mid: '#2a3247', light: '#cbd5e1' },
    ground: '#e9eef8',
};
function mixHex(a, b, t) {
    const pa = parseHex(a);
    const pb = parseHex(b);
    if (!pa || !pb)
        return a;
    const m = (i) => Math.round(pa[i] + (pb[i] - pa[i]) * t);
    return `#${[m(0), m(1), m(2)].map((n) => n.toString(16).padStart(2, '0')).join('')}`;
}
function parseHex(hex) {
    const raw = hex.trim().replace('#', '');
    const full = raw.length === 3 ? raw.split('').map((c) => c + c).join('') : raw;
    if (full.length !== 6)
        return null;
    const n = Number.parseInt(full, 16);
    if (Number.isNaN(n))
        return null;
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}
export function luminance(hex) {
    const rgb = parseHex(hex);
    if (!rgb)
        return 0;
    const [r, g, b] = rgb.map((c) => c / 255);
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}
export function isNearWhite(hex) {
    return luminance(hex) >= 0.85;
}
/** Mid/light steps mixed from a near-black toward the theme base. */
export function deriveDetailRamp(dark, base = '#f7f5f0') {
    return {
        dark,
        mid: mixHex(dark, base, 0.35),
        light: mixHex(dark, base, 0.72),
    };
}
export function listAccents(palette) {
    return [palette.accent1, palette.accent2, palette.accent3].filter((c) => Boolean(c));
}
export function assertMaterialPalette(palette, themeId) {
    const accents = listAccents(palette);
    if (accents.length > 3) {
        console.warn(`[mokei] theme "${themeId}" declares ${accents.length} accents; the rule is at most 3.`);
    }
    if (!isNearWhite(palette.base)) {
        console.warn(`[mokei] theme "${themeId}" base ${palette.base} is not white/near-white (luminance ${luminance(palette.base).toFixed(2)}). White is the primary material.`);
    }
}
function readRole(palette, role) {
    switch (role) {
        case 'base':
            return palette.base;
        case 'accent1':
            return palette.accent1;
        case 'accent2':
            return palette.accent2 ?? palette.accent1;
        case 'accent3':
            return palette.accent3 ?? palette.accent1;
        case 'detail.dark':
            return palette.detail.dark;
        case 'detail.mid':
            return palette.detail.mid;
        case 'detail.light':
            return palette.detail.light;
        case 'ground':
            return palette.ground;
        default:
            return palette.base;
    }
}
export const useMaterials = create((set) => ({
    ...FALLBACK_PALETTE,
    themeId: 'yardline',
    whiteFills: false,
    setPalette: (palette, extras) => set({
        ...palette,
        ...(extras?.themeId != null ? { themeId: extras.themeId } : {}),
        ...(extras?.whiteFills != null ? { whiteFills: extras.whiteFills } : {}),
    }),
}));
export function resolveMaterial(role, palette) {
    return readRole(palette ?? useMaterials.getState(), role);
}
export function useMaterialColor(role) {
    return useMaterials((s) => readRole(s, role));
}
/** True when the active theme forbids full-surface accents (quarry). */
export function useWhiteFills() {
    return useMaterials((s) => s.whiteFills);
}
/**
 * Role for a large clay fill (roof, cab, cart body, annex). Under a
 * white-fills theme this is always `base`; Yardline keeps the authored role.
 */
export function useFillRole(authored) {
    return useMaterials((s) => (s.whiteFills ? 'base' : authored));
}
/** Leftover hex on Yardline; a role swatch when white-fills is on. */
export function useThemedHex(yardlineHex, quarryRole) {
    return useMaterials((s) => (s.whiteFills ? readRole(s, quarryRole) : yardlineHex));
}
const CSS_VARS = {
    base: '--mokei-base',
    accent1: '--mokei-accent-1',
    accent2: '--mokei-accent-2',
    accent3: '--mokei-accent-3',
    'detail.dark': '--mokei-detail-dark',
    'detail.mid': '--mokei-detail-mid',
    'detail.light': '--mokei-detail-light',
    ground: '--mokei-ground',
};
export function applyMaterials(palette, extras) {
    useMaterials.getState().setPalette(palette, extras);
    if (typeof document === 'undefined')
        return;
    const root = document.documentElement;
    for (const role of Object.keys(CSS_VARS)) {
        root.style.setProperty(CSS_VARS[role], resolveMaterial(role, palette));
    }
}
let warnedMissing = false;
function pickColor(props, palette, fallback) {
    if (props.unsafeColor)
        return props.unsafeColor;
    if (props.color)
        return props.color;
    if (props.material)
        return readRole(palette, props.material);
    return readRole(palette, fallback);
}
export function resolveClayColor(props, fallback = 'base') {
    if (!props.unsafeColor && !props.color && !props.material && !warnedMissing) {
        warnedMissing = true;
        console.warn('[mokei] clay primitive missing material= or unsafeColor; falling back to base.');
    }
    return pickColor(props, useMaterials.getState(), fallback);
}
/** Subscribe to the active palette so primitives recolor when the theme changes. */
export function useClayColor(props, fallback = 'base') {
    return useMaterials((s) => pickColor(props, s, fallback));
}
//# sourceMappingURL=materials.js.map