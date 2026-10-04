import type { ThemeDefinition } from './types';
export type ThemeId = string;
/** Host-configurable. Unset means “first registered theme”. */
export declare function setDefaultThemeId(id: string): void;
export declare function getDefaultThemeId(): string | undefined;
export declare function registerTheme(def: ThemeDefinition): ThemeDefinition;
/** Returns the theme, or `undefined` if nothing is registered under `id`. */
export declare function getTheme(id: string): ThemeDefinition | undefined;
export declare function listThemes(): ThemeDefinition[];
//# sourceMappingURL=registry.d.ts.map