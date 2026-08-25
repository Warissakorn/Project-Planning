/**
 * Roll-up aggregation: leaf values are the source of truth, parents derive.
 * One post-order pass over a structure produces a Map of derived values.
 * Nothing here is stored in state — components recompute via memoized selectors.
 */

import type { ID, TaskStatus, TreeNode } from '../model/types'
import { endIso, diffDaysIso } from '../lib/date'
import type { Nodes } from './treeOps'

export interface RollupInfo {
  /** Derived span start (min child start) or the leaf's own start. */
  startDate?: string
  /** Inclusive derived span end (max child ends) or the leaf's own end. */
  endDate?: string
  /** Calendar-day span length for parents; leaf duration (milestones = 0). */
  durationDays?: number
  /** Weighted average progress for parents; manual value for leaves. */
  progress?: number
  status?: TaskStatus
  cost?: number
}

const EMPTY: RollupInfo = {}

export function leafInfo(node: TreeNode): RollupInfo {
  const info: RollupInfo = {}
  // Duration stands alone so entering "5 days" before picking a date still shows.
  if (node.isMilestone) info.durationDays = 0
  else if (node.durationDays !== undefined) info.durationDays = node.durationDays
  if (node.startDate) {
    info.startDate = node.startDate
    info.endDate = endIso(node.startDate, info.durationDays ?? 1)
  }
  if (node.progress !== undefined) info.progress = clampPercent(node.progress)
  if (node.cost !== undefined) info.cost = node.cost
  if (info.progress !== undefined) {
    info.status =
      node.status ?? (info.progress >= 100 ? 'done' : info.progress > 0 ? 'in_progress' : 'todo')
  } else if (node.status) {
    info.status = node.status
  }
  return info
}

export const clampPercent = (n: number): number => Math.max(0, Math.min(100, n))

/**
 * Post-order roll-up over one structure's subtree.
 * Parents with no dated/valued children at all yield {} (render as blank).
 */
export function collectRollups(nodes: Nodes, structureRootId: ID): Map<ID, RollupInfo> {
  const map = new Map<ID, RollupInfo>()

  const visit = (id: ID): RollupInfo => {
    const node = nodes[id]
    if (!node) return EMPTY

    if (node.childIds.length === 0) {
      const info = leafInfo(node)
      map.set(id, info)
      return info
    }

    const childInfos = node.childIds.map(visit).filter((c) => Object.keys(c).length > 0)

    if (childInfos.length === 0) {
      // Branch with no scheduled/valued leaves anywhere below → nothing to show.
      const bare: RollupInfo = {}
      if (node.cost !== undefined) bare.cost = node.cost
      map.set(id, bare)
      return bare
    }

    const info: RollupInfo = {}

    // --- Span from children --------------------------------------------
    const starts = childInfos.map((c) => c.startDate).filter((s): s is string => !!s)
    const ends = childInfos.map((c) => c.endDate).filter((e): e is string => !!e)
    if (starts.length > 0 && ends.length > 0) {
      info.startDate = starts.reduce((a, b) => (a < b ? a : b))
      info.endDate = ends.reduce((a, b) => (a > b ? a : b))
      info.durationDays = diffDaysIso(info.endDate, info.startDate) + 1
    }

    // --- Progress: weighted by child duration, fallback to simple mean --
    const progresses = childInfos.map((c) => c.progress).filter((p): p is number => p !== undefined)
    if (progresses.length > 0) {
      const allWeighted =
        childInfos.filter((c) => c.progress !== undefined).every((c) => c.durationDays !== undefined)
      if (allWeighted) {
        let sum = 0
        let weight = 0
        for (const c of childInfos) {
          if (c.progress === undefined) continue
          sum += c.progress * (c.durationDays ?? 0)
          weight += c.durationDays ?? 0
        }
        info.progress = weight > 0 ? Math.round((sum / weight) * 10) / 10 : 0
      } else {
        info.progress =
          Math.round((progresses.reduce((a, b) => a + b, 0) / progresses.length) * 10) / 10
      }
      info.status = info.progress >= 100 ? 'done' : info.progress > 0 ? 'in_progress' : 'todo'
    }

    // --- Cost -----------------------------------------------------------
    const costs = childInfos.map((c) => c.cost).filter((c): c is number => c !== undefined)
    if (costs.length > 0 || node.cost !== undefined) {
      info.cost = costs.reduce((a, b) => a + b, 0) + (node.cost ?? 0)
    }

    map.set(id, info)
    return info
  }

  visit(structureRootId)
  return map
}

/** Effective display values for any node: manual leaf fields or derived roll-up. */
export function effectiveValues(
  nodes: Nodes,
  id: ID,
  rollups: Map<ID, RollupInfo>,
): { values: RollupInfo; isDerived: boolean } {
  const rollup = rollups.get(id) ?? EMPTY
  const node = nodes[id]
  if (!node) return { values: EMPTY, isDerived: false }
  if (node.childIds.length === 0) return { values: leafInfo(node), isDerived: false }
  return { values: rollup, isDerived: true }
}
