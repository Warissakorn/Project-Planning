import type { ID, Project } from '../model/types'

/**
 * Undo/redo via immutable snapshots of the ACTIVE project only. Because immer
 * preserves structural sharing, a "snapshot" is just the previous project
 * object reference — pushing history costs O(1).
 *
 * The mutate-helper in store.ts pushes automatically whenever a mutation
 * actually changed the project object (reference inequality), so no-op
 * actions never pollute the stack. Stacks are NOT persisted.
 */

export const HISTORY_LIMIT = 50

export interface HistorySnapshot {
  projectId: ID
  project: Project
}

/** Undo/redo actions live on TreeSlice; these fields hold the stacks (not persisted). */
export interface HistoryFields {
  historyPast: HistorySnapshot[]
  historyFuture: HistorySnapshot[]
}

/** Last snapshot index belonging to `projectId`, or -1. */
export function lastSnapshotFor(snaps: HistorySnapshot[], projectId: ID): number {
  for (let i = snaps.length - 1; i >= 0; i--) {
    if (snaps[i].projectId === projectId) return i
  }
  return -1
}
