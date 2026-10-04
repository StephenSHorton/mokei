import type { SceneDefinition } from './types';
export declare function sceneIdFromSearch(search?: string): string;
/**
 * Resolve a scene id. Unknown ids fall back to the default (or the first
 * registered scene) and warn. Returns `undefined` only when nothing is registered.
 */
export declare function resolveScene(id?: string): SceneDefinition | undefined;
/** Apply the scene's theme, clay palette, and camera defaults. */
export declare function activateScene(scene: SceneDefinition | string): SceneDefinition | undefined;
//# sourceMappingURL=activate.d.ts.map