import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'
import type { HistoryFields } from './history'
import { createProjectsSlice, type ProjectsSlice } from './slices/projectsSlice'
import { createTreeSlice, type TreeSlice } from './slices/treeSlice'
import { createUiSlice, type UiSlice } from './slices/uiSlice'

/**
 * Single global store. Everything under `projects` persists to localStorage;
 * undo stacks are excluded via `partialize`.
 */
export interface AppState extends ProjectsSlice, TreeSlice, UiSlice, HistoryFields {}

export const STORE_KEY = 'breakdown-planner:v1'

export const useAppStore = create<AppState>()(
  persist(
    immer((...a) => ({
      ...createProjectsSlice(...a),
      ...createTreeSlice(...a),
      ...createUiSlice(...a),
      historyPast: [],
      historyFuture: [],
    })),
    {
      name: STORE_KEY,
      version: 1,
      partialize: (s) => ({
        projects: s.projects,
        projectOrder: s.projectOrder,
        lang: s.lang,
        activeProjectId: s.activeProjectId,
        activeStructureId: s.activeStructureId,
        selectedNodeId: s.selectedNodeId,
        viewMode: s.viewMode,
        columnWidths: s.columnWidths,
      }),
      // Breaking schema changes bump `version` and migrate here; exported JSON
      // files run through the same chain (see lib/jsonFile.ts).
    },
  ),
)

/** Rough size of persisted state in bytes (for the StatusBar storage gauge). */
export function storageUsageBytes(): number {
  try {
    return (localStorage.getItem(STORE_KEY) ?? '').length
  } catch {
    return 0
  }
}
