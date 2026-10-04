import { applyLook, lookDefaults } from '../clay';
import { applyTheme } from '../theme';
import { DEFAULT_SCENE_ID, getScene, listScenes, peekScene } from './registry';
export function sceneIdFromSearch(search = typeof location !== 'undefined' ? location.search : '') {
    const raw = new URLSearchParams(search).get('scene');
    return raw && raw.trim() ? raw.trim() : DEFAULT_SCENE_ID;
}
/**
 * Resolve a scene id. Unknown ids fall back to the default (or the first
 * registered scene) and warn. Returns `undefined` only when nothing is registered.
 */
export function resolveScene(id) {
    const wanted = id ?? sceneIdFromSearch();
    const found = peekScene(wanted);
    if (found)
        return found;
    const fallback = peekScene(DEFAULT_SCENE_ID) ?? listScenes()[0];
    if (fallback) {
        console.warn(`[mokei] unknown scene "${wanted}", using "${fallback.id}"`);
        return fallback;
    }
    getScene(wanted);
    return undefined;
}
/** Apply the scene's theme, clay palette, and camera defaults. */
export function activateScene(scene) {
    const resolved = typeof scene === 'string' ? peekScene(scene) ?? resolveScene(scene) : scene;
    if (!resolved) {
        console.warn(`[mokei] cannot activate scene: ${typeof scene === 'string' ? scene : '(missing definition)'}`);
        return undefined;
    }
    applyTheme(resolved.themeId);
    applyLook({
        ...lookDefaults,
        ...resolved.look,
        ...(resolved.camera
            ? {
                cameraZoom: resolved.camera.zoom,
                cameraAzimuth: resolved.camera.azimuth,
                cameraElevation: resolved.camera.elevation,
            }
            : {}),
        panX: 0,
        panZ: 0,
    });
    return resolved;
}
//# sourceMappingURL=activate.js.map