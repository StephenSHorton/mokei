import { jsx as _jsx } from "react/jsx-runtime";
import { createContext, useContext } from 'react';
export const DEFAULT_QUALITY = 'high';
const HIGH = {
    dpr: [1, 2],
    antialias: true,
    shadowMapSize: 2048,
    shadowBias: -0.00028,
    shadowNormalBias: 0.022,
    shadowFrustum: 42,
    shadowNear: 1,
    shadowFar: 140,
    shadowBlurSamples: 16,
    multisampling: 4,
    aa: 'smaa',
    aoQuality: 'high',
    aoHalfRes: false,
};
const MEDIUM = {
    dpr: [1, 1.5],
    antialias: true,
    shadowMapSize: 1024,
    shadowBias: -0.0004,
    shadowNormalBias: 0.03,
    shadowFrustum: 42,
    shadowNear: 1,
    shadowFar: 140,
    shadowBlurSamples: 12,
    multisampling: 2,
    aa: 'smaa',
    aoQuality: 'medium',
    aoHalfRes: false,
};
const LOW = {
    dpr: 1,
    antialias: true,
    shadowMapSize: 1024,
    shadowBias: -0.00055,
    shadowNormalBias: 0.04,
    shadowFrustum: 42,
    shadowNear: 1,
    shadowFar: 140,
    shadowBlurSamples: 8,
    multisampling: 0,
    aa: 'fxaa',
    aoQuality: 'performance',
    aoHalfRes: true,
};
export function qualitySettings(quality) {
    if (quality === 'low')
        return LOW;
    if (quality === 'medium')
        return MEDIUM;
    return HIGH;
}
function readGpuRenderer() {
    if (typeof document === 'undefined')
        return '';
    try {
        const canvas = document.createElement('canvas');
        const gl = canvas.getContext('webgl2') ?? canvas.getContext('webgl');
        if (!gl)
            return '';
        const ext = gl.getExtension('WEBGL_debug_renderer_info');
        if (!ext)
            return '';
        return String(gl.getParameter(ext.UNMASKED_RENDERER_WEBGL) ?? '');
    }
    catch {
        return '';
    }
}
/**
 * Resolve `auto` from devicePixelRatio, a coarse GPU string, and a mobile UA.
 * Explicit `high` / `medium` / `low` pass through.
 */
export function resolveQuality(quality = DEFAULT_QUALITY) {
    if (quality !== 'auto')
        return quality;
    if (typeof window === 'undefined')
        return 'high';
    const dpr = window.devicePixelRatio || 1;
    const cores = navigator.hardwareConcurrency || 4;
    const gpu = readGpuRenderer();
    const weak = /swiftshader|llvmpipe|softpipe|microsoft basic render|intel.+(uhd|hd graphics)|mali|adreno\s*[1-5]/i.test(gpu);
    const mobile = /mobi|android|iphone|ipad/i.test(navigator.userAgent);
    if (mobile || weak || cores <= 4)
        return 'low';
    if (dpr < 1.5)
        return 'medium';
    return 'high';
}
const QualityContext = createContext('high');
export function useResolvedQuality() {
    return useContext(QualityContext);
}
export function QualityProvider({ quality, children, }) {
    const parent = useContext(QualityContext);
    const resolved = quality != null ? resolveQuality(quality) : parent;
    return _jsx(QualityContext.Provider, { value: resolved, children: children });
}
//# sourceMappingURL=quality.js.map