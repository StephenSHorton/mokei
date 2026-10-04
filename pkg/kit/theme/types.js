export function applyTheme(theme) {
    const id = typeof theme === 'string' ? theme : theme.dataTheme;
    document.documentElement.dataset.theme = id;
}
//# sourceMappingURL=types.js.map