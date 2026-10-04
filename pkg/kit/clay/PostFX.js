import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { EffectComposer, N8AO, SMAA } from '@react-three/postprocessing';
import { useLook } from './look';
export function PostFX() {
    const aoIntensity = useLook((s) => s.aoIntensity);
    const aoRadius = useLook((s) => s.aoRadius);
    const aoColor = useLook((s) => s.aoColor);
    return (_jsxs(EffectComposer, { multisampling: 0, enableNormalPass: false, children: [_jsx(N8AO, { aoRadius: aoRadius, intensity: aoIntensity, distanceFalloff: 1.2, quality: "high", halfRes: false, color: aoColor }), _jsx(SMAA, {})] }));
}
//# sourceMappingURL=PostFX.js.map