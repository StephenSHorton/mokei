import { create } from 'zustand'
import type { SceneEvent } from '../../kit/scene/types'

type BlankState = {
  label: string
  shift: number
  selected: string | null
  dispatch: (event: SceneEvent) => void
}

export const useBlank = create<BlankState>((set) => ({
  label: 'Idle pad',
  shift: 0,
  selected: null,
  dispatch: (event) => {
    if (event.type === 'task-started') {
      set({ label: event.label ?? 'Working', shift: 1.4, selected: event.id ?? 'block-a' })
      return
    }
    if (event.type === 'task-progress') {
      set({ shift: 0.4 + event.progress * 2 })
      return
    }
    if (event.type === 'select') {
      set({ selected: event.id })
      return
    }
    if (event.type === 'task-finished' || event.type === 'reset') {
      set({ label: 'Idle pad', shift: 0, selected: null })
    }
  },
}))
