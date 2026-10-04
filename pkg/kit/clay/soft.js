import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { RoundedBox } from '@react-three/drei';
import { useMemo } from 'react';
import { LatheGeometry, Vector2 } from 'three';
import { Matte } from './Matte';
/**
 * Shared scale for toy-edge rounding and bevels.
 * 1 keeps the generous post-polish radii; 0 is a hard box.
 * 0.8 sits halfway between the 0.6 crisp pass and the original soft look.
 */
export const SOFT_EDGE_SCALE = 0.8;
export function scaleSoft(value) {
    return value * SOFT_EDGE_SCALE;
}
/** Rounded box with toy-like soft corners. Radius is clamped so it never collapses. */
export function SoftBox({ size, color, position, rotation, r, smooth = 4, cast = true, receive = true, emissive, }) {
    const min = Math.min(size[0], size[1], size[2]);
    const radius = Math.max(0.004, Math.min(scaleSoft(r ?? min * 0.24), min / 2 - 0.002));
    return (_jsx(RoundedBox, { args: size, radius: radius, smoothness: smooth, position: position, rotation: rotation, castShadow: cast, receiveShadow: receive, children: _jsx(Matte, { color: color, emissive: emissive }) }));
}
/** Lathe profile for a cylinder whose top and bottom rims are filleted. */
export function useRoundCylinder(radius, height, fillet, segments = 28) {
    return useMemo(() => {
        const f = Math.min(fillet, radius * 0.95, height / 2 - 0.001);
        const pts = [new Vector2(0, -height / 2)];
        const steps = 6;
        for (let i = 0; i <= steps; i += 1) {
            const a = -Math.PI / 2 + (i / steps) * (Math.PI / 2);
            pts.push(new Vector2(radius - f + Math.cos(a) * f, -height / 2 + f + Math.sin(a) * f));
        }
        for (let i = 0; i <= steps; i += 1) {
            const a = (i / steps) * (Math.PI / 2);
            pts.push(new Vector2(radius - f + Math.cos(a) * f, height / 2 - f + Math.sin(a) * f));
        }
        pts.push(new Vector2(0, height / 2));
        return new LatheGeometry(pts, segments);
    }, [radius, height, fillet, segments]);
}
export function RoundCyl({ radius, height, fillet, color, position, rotation, cast = true, segments, }) {
    const geo = useRoundCylinder(radius, height, scaleSoft(fillet ?? Math.min(radius, height) * 0.35), segments);
    return (_jsx("mesh", { geometry: geo, position: position, rotation: rotation, castShadow: cast, receiveShadow: true, children: _jsx(Matte, { color: color }) }));
}
/** Chunky toy wheel: rounded tire plus a lighter hub, axis along X. */
export function Wheel({ position, radius = 0.36, width = 0.3, tire = '#1f2533', hub = '#cbd5e1', }) {
    const side = position[0] >= 0 ? 1 : -1;
    return (_jsxs("group", { position: position, rotation: [0, 0, Math.PI / 2], children: [_jsx(RoundCyl, { radius: radius, height: width, fillet: width * 0.42, color: tire }), _jsx(RoundCyl, { radius: radius * 0.46, height: 0.05, fillet: 0.02, color: hub, position: [0, (-side * width) / 2, 0], cast: false })] }));
}
//# sourceMappingURL=soft.js.map