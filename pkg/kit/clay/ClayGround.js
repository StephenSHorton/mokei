import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useRef } from 'react';
import { useLook } from './look';
/** Pan-able clay plane. Scene-specific roads and pads sit on top. */
export function ClayGround({ onMiss }) {
    const ground = useLook((s) => s.ground);
    const setLook = useLook((s) => s.setLook);
    const drag = useRef(null);
    return (_jsxs("mesh", { rotation: [-Math.PI / 2, 0, 0], receiveShadow: true, onPointerDown: (event) => {
            if (event.button !== 0)
                return;
            drag.current = {
                active: false,
                x: event.clientX,
                y: event.clientY,
                panX: useLook.getState().panX,
                panZ: useLook.getState().panZ,
            };
            event.stopPropagation();
        }, onPointerMove: (event) => {
            const state = drag.current;
            if (!state)
                return;
            const dx = event.clientX - state.x;
            const dy = event.clientY - state.y;
            if (!state.active && Math.hypot(dx, dy) < 5)
                return;
            state.active = true;
            event.stopPropagation();
            const az = (useLook.getState().cameraAzimuth * Math.PI) / 180;
            const scale = 1.25 / useLook.getState().cameraZoom;
            setLook({
                panX: state.panX - Math.cos(az) * dx * scale - Math.sin(az) * dy * scale * 1.6,
                panZ: state.panZ + Math.sin(az) * dx * scale - Math.cos(az) * dy * scale * 1.6,
            });
        }, onPointerUp: () => {
            if (drag.current && !drag.current.active)
                onMiss?.();
            drag.current = null;
        }, onPointerLeave: () => {
            drag.current = null;
        }, children: [_jsx("planeGeometry", { args: [400, 400] }), _jsx("meshLambertMaterial", { color: ground })] }));
}
//# sourceMappingURL=ClayGround.js.map