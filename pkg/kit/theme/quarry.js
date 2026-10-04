import { deriveDetailRamp } from './materials';
import { registerTheme } from './registry';
/** Rock-locked quarry palette. Orange and teal are gone. */
export const QUARRY_BASE = '#F7F5F0';
export const QUARRY_ACCENT_1 = '#2B59E8';
export const QUARRY_ACCENT_2 = '#F2B705';
export const QUARRY_ACCENT_3 = '#3B4552';
export const QUARRY_DETAIL_DARK = '#1C1F24';
export const QUARRY_SANDSTONE = '#E6D5B8';
export const quarryMaterials = {
    base: QUARRY_BASE,
    accent1: QUARRY_ACCENT_1,
    accent2: QUARRY_ACCENT_2,
    accent3: QUARRY_ACCENT_3,
    detail: deriveDetailRamp(QUARRY_DETAIL_DARK, QUARRY_BASE),
    ground: QUARRY_SANDSTONE,
};
export const quarryTheme = {
    id: 'quarry',
    name: 'Quarry',
    description: 'Warm white, azurite, signal yellow (warning only), slate trim. Sandstone is ground, not a UI fill.',
    dataTheme: 'quarry',
    materials: quarryMaterials,
};
registerTheme(quarryTheme);
//# sourceMappingURL=quarry.js.map