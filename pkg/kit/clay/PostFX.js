import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { EffectComposer, FXAA, N8AO, SMAA } from '@react-three/postprocessing';
import { useThree } from '@react-three/fiber';
import { useLook } from './look';
import { qualitySettings, useResolvedQuality } from './quality';
export function PostFX() {
    const aoIntensity = useLook((s) => s.aoIntensity);
    const aoRadius = useLook((s) => s.aoRadius);
    const aoColor = useLook((s) => s.aoColor);
    const settings = qualitySettings(useResolvedQuality());
    const gl = useThree((state) => state.gl);
    const msaaSupported = gl.capabilities.isWebGL2 === true;
    const samples = msaaSupported ? settings.multisampling : 0;
    const useFxaa = settings.aa === 'fxaa' || !msaaSupported;
    return (_jsxs(EffectComposer, { multisampling: samples, enableNormalPass: false, children: [_jsx(N8AO, { aoRadius: aoRadius, intensity: aoIntensity, distanceFalloff: 1.2, quality: settings.aoQuality, halfRes: settings.aoHalfRes, color: aoColor }), useFxaa ? _jsx(FXAA, {}) : _jsx(SMAA, {})] }));
}
//# sourceMappingURL=PostFX.js.map