import type { ThemeDefinition } from './types';
export type ThemeId = string;
export declare const DEFAULT_THEME_ID = "yardline";
export declare function registerTheme(def: ThemeDefinition): ThemeDefinition;
/** Returns the theme, or `undefined` if nothing is registered under `id`. */
export declare function getTheme(id: string): ThemeDefinition | undefined;
export declare function listThemes(): ThemeDefinition[];
//# sourceMappingURL=registry.d.ts.map