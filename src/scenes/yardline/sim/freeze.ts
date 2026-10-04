import { runtime, tick, useYard } from './yard'

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
  const id = new URLSearchParams(location.search).get('select')
  if (id) useYard.getState().select(id)
}

if (typeof location !== 'undefined') {
  applyFreeze()
  applySelectFromUrl()
}
