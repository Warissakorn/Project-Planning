import { useMemo } from 'react'
import type { ID, Project, Structure, StructureTypeConfig } from '../model/types'
import { getStructureTypeOrFallback } from '../model/structureTypes'
import { flattenStructure, type FlatRow } from '../engine/numbering'
import { collectRollups, type RollupInfo } from '../engine/rollup'
import { useAppStore } from './store'

/** The active project (or null on the project-list screen). */
export function useActiveProject(): Project | null {
  return useAppStore((s) => (s.activeProjectId ? (s.projects[s.activeProjectId] ?? null) : null))
}

/** Active structure tab; falls back to the project's first structure. */
export function useActiveStructure(): Structure | null {
  const structureId = useAppStore((s) => s.activeStructureId)
  const project = useAppStore((s) =>
    s.activeProjectId ? (s.projects[s.activeProjectId] ?? null) : null,
  )
  if (!project) return null
  return project.structures.find((s) => s.id === structureId) ?? project.structures[0] ?? null
}

export interface StructureData {
  project: Project | null
  structure: Structure | null
  typeConfig: StructureTypeConfig | null
  /** Visible rows with outline codes (respects collapse state). */
  rows: FlatRow[]
  rollups: Map<ID, RollupInfo>
}

/**
 * One-stop memoized view model for the workspace's tree/gantt panes.
 * Memo granularity is the project object reference — every mutation produces a
 * new reference, which is exactly when we want to recompute.
 */
export function useStructureData(): StructureData {
  const project = useActiveProject()
  const activeStructureId = useAppStore((s) => s.activeStructureId)

  const structure = useMemo(() => {
    if (!project) return null
    return project.structures.find((s) => s.id === activeStructureId) ?? project.structures[0] ?? null
  }, [project, activeStructureId])

  const rows = useMemo(
    () =>
      project && structure
        ? flattenStructure(project.nodes, structure.rootId, structure.collapsedIds)
        : [],
    [project, structure],
  )

  const rollups = useMemo(
    () =>
      project && structure ? collectRollups(project.nodes, structure.rootId) : new Map<ID, RollupInfo>(),
    [project, structure],
  )

  const typeConfig = structure ? getStructureTypeOrFallback(structure.typeId) : null

  return { project, structure, typeConfig, rows, rollups }
}
