import type { StateCreator } from 'zustand'
import type { ID, Lang, ViewMode } from '../../model/types'
import type { AppState } from '../store'

export interface UiSlice {
  /** Persisted preference. */
  lang: Lang
  setLang: (lang: Lang) => void

  /** Persisted workspace pointers. */
  activeProjectId: ID | null
  activeStructureId: ID | null
  selectedNodeId: ID | null
  viewMode: ViewMode

  setViewMode: (mode: ViewMode) => void
}

export const createUiSlice: StateCreator<AppState, [['zustand/immer', never]], [], UiSlice> = (
  set,
) => ({
  lang: 'th',
  setLang: (lang) => {
    set((d) => {
      d.lang = lang
    })
  },

  activeProjectId: null,
  activeStructureId: null,
  selectedNodeId: null,
  viewMode: 'tree',

  setViewMode: (mode) => {
    set((d) => {
      d.viewMode = mode
    })
  },
})
