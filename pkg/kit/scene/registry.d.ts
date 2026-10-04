import type { SceneDefinition } from './types';
export type SceneId = string;
export declare const DEFAULT_SCENE_ID = "yardline";
export declare function registerScene(def: SceneDefinition): SceneDefinition;
/** Returns the scene, or `undefined` if nothing is registered under `id`. */
export declare function getScene(id: string): SceneDefinition | undefined;
export declare function peekScene(id: string): SceneDefinition | undefined;
export declare function listScenes(): SceneDefinition[];
//# sourceMappingURL=registry.d.ts.map