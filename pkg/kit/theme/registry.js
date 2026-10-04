import { blankTheme } from './blank';
import { quarryTheme } from './quarry';
import { yardlineTheme } from './yardline';
const themes = new Map();
export const DEFAULT_THEME_ID = 'yardline';
export function registerTheme(def) {
    themes.set(def.id, def);
    return def;
}
registerTheme(yardlineTheme);
registerTheme(blankTheme);
registerTheme(quarryTheme);
/** Returns the theme, or `undefined` if nothing is registered under `id`. */
export function getTheme(id) {
    const theme = themes.get(id);
    if (!theme) {
        const known = [...themes.keys()].join(', ') || '(none)';
        console.warn(`[mokei] unknown theme "${id}". Known: ${known}. Call registerTheme or use applyTheme(id) to set data-theme anyway.`);
    }
    return theme;
}
export function listThemes() {
    return [...themes.values()];
}
//# sourceMappingURL=registry.js.map