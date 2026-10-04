import { type MaterialPalette } from './materials';
export type { DetailRamp, MaterialPalette, MaterialRole } from './materials';
/** A swappable UI token set. CSS lives under `mokei/themes/<id>.css`. */
export type ThemeDefinition = {
    id: string;
    name: string;
    description: string;
    /** Value written to `document.documentElement.dataset.theme`. */
    dataTheme: string;
    /** At most three accents. `base` must be white or near-white. */
    materials: MaterialPalette;
};
export declare function applyTheme(theme: ThemeDefinition | string): void;
//# sourceMappingURL=types.d.ts.map