import { resetRuntime, runtime, tick, useYard } from './yard'

export type CaptureCam = 'home' | 'side' | 'top'

const DEFAULT_FREEZE_AT = 8
const DEFAULT_CLOCK = '09:41'

export function freezeAt(): number | null {
  if (typeof location === 'undefined') return null
  const params = new URLSearchParams(location.search)
  if (!params.has('freeze')) return null
  const raw = params.get('freeze')
  if (raw === '' || raw === '1' || raw === 'true') return DEFAULT_FREEZE_AT
  const n = Number(raw)
  return Number.isFinite(n) ? Math.max(0, n) : DEFAULT_FREEZE_AT
}

export function freezeClockLabel(): string | null {
  if (typeof location === 'undefined') return null
  const params = new URLSearchParams(location.search)
  if (!params.has('freeze')) return null
  return params.get('clock') || DEFAULT_CLOCK
}

export function captureCam(): CaptureCam {
  if (typeof location === 'undefined') return 'home'
  const cam = new URLSearchParams(location.search).get('cam')
  if (cam === 'side' || cam === 'top') return cam
  return 'home'
}

export function seekSim(target: number) {
  const step = 1 / 60
  while (runtime.clock < target) {
    tick(Math.min(step, target - runtime.clock))
  }
}

export function applyFreeze() {
  const at = freezeAt()
  if (at == null) return false
  seekSim(at)
  useYard.getState().publish()
  return true
}

function applySelectFromUrl() {
  if (typeof location === 'undefined') return
  const params = new URLSearchParams(location.search)
  const id = params.get('select')
  if (id) {
    useYard.getState().select(id)
    return
  }
  const cam = captureCam()
  if (cam === 'side') useYard.getState().select('fl-10')
  if (cam === 'top') useYard.getState().select('trk-18')
}

if (typeof location !== 'undefined') {
  applyFreeze()
  applySelectFromUrl()
  if (location.search.includes('capture')) {
    ;(window as unknown as { __yardSeek?: (t: number) => void }).__yardSeek = (t: number) => {
      resetRuntime()
      seekSim(t)
      useYard.getState().publish()
    }
  }
}
