import { applyMaterials, assertMaterialPalette } from './materials';
import { getTheme } from './registry';
export function applyTheme(theme) {
    const resolved = typeof theme === 'string' ? getTheme(theme) : theme;
    const id = resolved ? resolved.dataTheme : typeof theme === 'string' ? theme : theme.dataTheme;
    if (typeof document !== 'undefined') {
        document.documentElement.dataset.theme = id;
    }
    if (resolved?.materials) {
        assertMaterialPalette(resolved.materials, resolved.id);
        applyMaterials(resolved.materials);
    }
}
//# sourceMappingURL=types.js.map