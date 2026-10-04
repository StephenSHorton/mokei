const themes = new Map();
let defaultThemeId;
/** Host-configurable. Unset means “first registered theme”. */
export function setDefaultThemeId(id) {
    defaultThemeId = id;
}
export function getDefaultThemeId() {
    return defaultThemeId ?? [...themes.keys()][0];
}
export function registerTheme(def) {
    themes.set(def.id, def);
    return def;
}
/** Returns the theme, or `undefined` if nothing is registered under `id`. */
export function getTheme(id) {
    const theme = themes.get(id);
    if (!theme) {
        const known = [...themes.keys()].join(', ') || '(none)';
        console.warn(`[mokei] unknown theme "${id}". Known: ${known}. Call registerTheme or import mokei/theme/<id>.`);
    }
    return theme;
}
export function listThemes() {
    return [...themes.values()];
}
//# sourceMappingURL=registry.js.map