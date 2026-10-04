import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import { useLook } from './look';
const PI = Math.PI;
export function Lights() {
    const look = useLook();
    const az = (look.sunAzimuth * PI) / 180;
    const el = (look.sunElevation * PI) / 180;
    const dist = 60;
    const x = dist * Math.cos(el) * Math.sin(az);
    const y = dist * Math.sin(el);
    const z = dist * Math.cos(el) * Math.cos(az);
    return (_jsxs(_Fragment, { children: [_jsx("hemisphereLight", { args: [look.skyColor, look.groundBounce, look.skyIntensity * PI] }), _jsx("directionalLight", { color: look.sunColor, intensity: look.sunIntensity * PI, position: [x, y, z], castShadow: true, "shadow-mapSize": [2048, 2048], "shadow-radius": look.shadowSoftness, "shadow-blurSamples": 16, "shadow-bias": -0.0004, "shadow-normalBias": 0.03, "shadow-camera-near": 1, "shadow-camera-far": 140, "shadow-camera-left": -42, "shadow-camera-right": 42, "shadow-camera-top": 42, "shadow-camera-bottom": -42 }), _jsx("directionalLight", { color: "#eef2ff", intensity: 0.12 * PI, position: [30, 20, 40] })] }));
}
//# sourceMappingURL=Lights.js.map