import { type ReactNode } from 'react';
/**
 * Render quality for `SceneCanvas` / `World`.
 * Default is `high`. Pass `auto` to pick from devicePixelRatio + GPU hints.
 */
export type SceneQuality = 'high' | 'medium' | 'low' | 'auto';
export type ResolvedQuality = 'high' | 'medium' | 'low';
export declare const DEFAULT_QUALITY: SceneQuality;
export type QualitySettings = {
    dpr: [number, number] | number;
    antialias: true;
    shadowMapSize: number;
    shadowBias: number;
    shadowNormalBias: number;
    shadowFrustum: number;
    shadowNear: number;
    shadowFar: number;
    shadowBlurSamples: number;
    /** Composer MSAA samples. 0 when the path is FXAA-only. */
    multisampling: number;
    aa: 'smaa' | 'fxaa';
    aoQuality: 'high' | 'medium' | 'performance';
    aoHalfRes: boolean;
};
export declare function qualitySettings(quality: ResolvedQuality): QualitySettings;
/**
 * Resolve `auto` from devicePixelRatio, a coarse GPU string, and a mobile UA.
 * Explicit `high` / `medium` / `low` pass through.
 */
export declare function resolveQuality(quality?: SceneQuality): ResolvedQuality;
export declare function useResolvedQuality(): ResolvedQuality;
export declare function QualityProvider({ quality, children, }: {
    quality?: SceneQuality | ResolvedQuality;
    children: ReactNode;
}): import("react").JSX.Element;
//# sourceMappingURL=quality.d.ts.map