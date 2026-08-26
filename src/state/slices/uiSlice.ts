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

  /** Persisted column widths (px) keyed by column key; '__name' = tree name column, '__ganttLeft' = Gantt name pane. */
  columnWidths: Record<string, number>
  /** `w === null` resets a width back to its flexible default. */
  setColumnWidth: (key: string, w: number | null) => void
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

  columnWidths: {},
  setColumnWidth: (key, w) => {
    set((d) => {
      if (w === null) delete d.columnWidths[key]
      else d.columnWidths[key] = w
    })
  },
})
