/**
 * Semantic clay roles. A theme may have at most three accents (typed).
 * Prefer these on SoftBox / RoundCyl / Matte / Wheel. Use `unsafeColor`
 * only for one-off leftovers that are not a defining accent.
 */
export type MaterialRole = 'base' | 'accent1' | 'accent2' | 'accent3' | 'detail.dark' | 'detail.mid' | 'detail.light' | 'ground';
export type DetailRamp = {
    dark: string;
    mid: string;
    light: string;
};
export type MaterialPalette = {
    /** White or near-white. Primary material on most surfaces. */
    base: string;
    accent1: string;
    accent2?: string;
    accent3?: string;
    detail: DetailRamp;
    /** Muted ground / rock / pad. Not an accent. */
    ground: string;
};
export declare function luminance(hex: string): number;
export declare function isNearWhite(hex: string): boolean;
/** Mid/light steps mixed from a near-black toward the theme base. */
export declare function deriveDetailRamp(dark: string, base?: string): DetailRamp;
export declare function listAccents(palette: MaterialPalette): string[];
export declare function assertMaterialPalette(palette: MaterialPalette, themeId: string): void;
export type MaterialsExtras = {
    themeId?: string;
    /**
     * Large scene fills stay on `base`. Accents only land on trim, edges,
     * doors, signals, and stripes. Yardline leaves this off.
     */
    whiteFills?: boolean;
};
type MaterialsState = MaterialPalette & Required<MaterialsExtras> & {
    setPalette: (palette: MaterialPalette, extras?: MaterialsExtras) => void;
};
export declare const useMaterials: import("zustand").UseBoundStore<import("zustand").StoreApi<MaterialsState>>;
export declare function resolveMaterial(role: MaterialRole, palette?: MaterialPalette): string;
export declare function useMaterialColor(role: MaterialRole): string;
/** True when the active theme forbids full-surface accents (quarry). */
export declare function useWhiteFills(): boolean;
/**
 * Role for a large clay fill (roof, cab, cart body, annex). Under a
 * white-fills theme this is always `base`; Yardline keeps the authored role.
 */
export declare function useFillRole(authored: MaterialRole): MaterialRole;
/** Leftover hex on Yardline; a role swatch when white-fills is on. */
export declare function useThemedHex(yardlineHex: string, quarryRole: MaterialRole): string;
export declare function applyMaterials(palette: MaterialPalette, extras?: MaterialsExtras): void;
export type ClayColorProps = {
    material?: MaterialRole;
    /** One-off hex. Discouraged — see docs/PRINCIPLES.md. */
    unsafeColor?: string;
    /** @deprecated Prefer `material` or `unsafeColor`. */
    color?: string;
};
export declare function resolveClayColor(props: ClayColorProps, fallback?: MaterialRole): string;
/** Subscribe to the active palette so primitives recolor when the theme changes. */
export declare function useClayColor(props: ClayColorProps, fallback?: MaterialRole): string;
export {};
//# sourceMappingURL=materials.d.ts.map