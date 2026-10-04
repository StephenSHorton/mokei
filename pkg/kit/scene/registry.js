const scenes = new Map();
export const DEFAULT_SCENE_ID = 'yardline';
export function registerScene(def) {
    scenes.set(def.id, def);
    return def;
}
/** Returns the scene, or `undefined` if nothing is registered under `id`. */
export function getScene(id) {
    const scene = scenes.get(id);
    if (!scene) {
        const known = [...scenes.keys()].join(', ') || '(none)';
        console.warn(`[mokei] unknown scene "${id}". Known: ${known}. Import mokei/scene/<id> or call registerScene.`);
    }
    return scene;
}
export function peekScene(id) {
    return scenes.get(id);
}
export function listScenes() {
    return [...scenes.values()];
}
//# sourceMappingURL=registry.js.map