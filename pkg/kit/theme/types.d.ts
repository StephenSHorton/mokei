/** A swappable UI token set. CSS lives in tokens.css under `[data-theme='…']`. */
export type ThemeDefinition = {
    id: string;
    name: string;
    description: string;
    /** Value written to `document.documentElement.dataset.theme`. */
    dataTheme: string;
};
export declare function applyTheme(theme: ThemeDefinition | string): void;
//# sourceMappingURL=types.d.ts.map