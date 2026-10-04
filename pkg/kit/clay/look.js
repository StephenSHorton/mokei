import { create } from 'zustand';
// Light intensities are in "albedo units": 1 means a white surface facing the
// light renders white. Lights.tsx multiplies by PI for three's physical lights.
export const lookDefaults = {
    aoIntensity: 3.2,
    aoRadius: 2.2,
    sunAzimuth: -38,
    sunElevation: 52,
    sunIntensity: 0.28,
    shadowSoftness: 7,
    shadowOpacity: 1,
    skyColor: '#e9efff',
    groundBounce: '#d3dbef',
    skyIntensity: 0.78,
    sunColor: '#fffaf2',
    cameraZoom: 27,
    cameraAzimuth: 36,
    cameraElevation: 37,
    panX: 0,
    panZ: 0,
    ground: '#e9eef8',
    road: '#c4d0f2',
    grass: '#dcf4e6',
    wall: '#f7f9fd',
    roof: '#2f63e6',
    accent: '#2563eb',
    yellow: '#f2c14e',
    cardboard: '#e0b17a',
    tree: '#72d39c',
    tire: '#1f2533',
    aoColor: '#25335a',
};
export function applyLook(patch) {
    useLook.getState().setLook(patch);
}
export const useLook = create((set, get) => ({
    ...lookDefaults,
    setLook: (patch) => set(patch),
    zoomBy: (delta) => set({ cameraZoom: clampZoom(get().cameraZoom + delta) }),
    rotateBy: (deg) => set({ cameraAzimuth: get().cameraAzimuth + deg }),
    resetView: () => set({
        cameraZoom: lookDefaults.cameraZoom,
        cameraAzimuth: lookDefaults.cameraAzimuth,
        cameraElevation: lookDefaults.cameraElevation,
        panX: 0,
        panZ: 0,
    }),
}));
function clampZoom(value) {
    return Math.max(12, Math.min(60, value));
}
//# sourceMappingURL=look.js.map