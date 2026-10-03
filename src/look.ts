import { create } from 'zustand'

export type LookState = {
  aoIntensity: number
  aoRadius: number
  sunAzimuth: number
  sunElevation: number
  sunIntensity: number
  shadowSoftness: number
  skyColor: string
  groundBounce: string
  skyIntensity: number
  sunColor: string
  cameraZoom: number
  cameraAzimuth: number
  cameraElevation: number
  panX: number
  panZ: number
  ground: string
  wall: string
  roof: string
  accent: string
  yellow: string
  cardboard: string
  tree: string
  tire: string
  aoColor: string
  setLook: (patch: Partial<LookState>) => void
  zoomBy: (delta: number) => void
  resetView: () => void
}

export const lookDefaults = {
  aoIntensity: 6.2,
  aoRadius: 28,
  sunAzimuth: 218,
  sunElevation: 34,
  sunIntensity: 0.92,
  shadowSoftness: 18,
  skyColor: '#c9d9eb',
  groundBounce: '#dce3eb',
  skyIntensity: 0.58,
  sunColor: '#f4f7fb',
  cameraZoom: 28,
  cameraAzimuth: 45,
  cameraElevation: 35,
  panX: 0,
  panZ: 0,
  ground: '#f1f5f9',
  wall: '#ffffff',
  roof: '#1d4ed8',
  accent: '#1d4ed8',
  yellow: '#eab308',
  cardboard: '#c9a36b',
  tree: '#34d399',
  tire: '#1e293b',
  aoColor: '#4b5b70',
} satisfies Omit<LookState, 'setLook' | 'zoomBy' | 'resetView'>

export const useLook = create<LookState>((set, get) => ({
  ...lookDefaults,
  setLook: (patch) => set(patch),
  zoomBy: (delta) =>
    set({ cameraZoom: clampZoom(get().cameraZoom + delta) }),
  resetView: () =>
    set({
      cameraZoom: lookDefaults.cameraZoom,
      cameraAzimuth: lookDefaults.cameraAzimuth,
      cameraElevation: lookDefaults.cameraElevation,
      panX: 0,
      panZ: 0,
    }),
}))

function clampZoom(value: number) {
  return Math.max(12, Math.min(52, value))
}
