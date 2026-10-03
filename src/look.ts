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
  aoIntensity: 2.6,
  aoRadius: 1.7,
  sunAzimuth: 218,
  sunElevation: 46,
  sunIntensity: 1.05,
  shadowSoftness: 14,
  skyColor: '#d5e3f2',
  groundBounce: '#e8eef4',
  skyIntensity: 0.92,
  sunColor: '#f4f7fb',
  cameraZoom: 24,
  cameraAzimuth: 45,
  cameraElevation: 35,
  panX: 0,
  panZ: 0,
  ground: '#f1f5f9',
  wall: '#ffffff',
  roof: '#1d4ed8',
  accent: '#1d4ed8',
  yellow: '#f4c430',
  cardboard: '#c9a36b',
  tree: '#34d399',
  tire: '#1e293b',
  aoColor: '#64748b',
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
