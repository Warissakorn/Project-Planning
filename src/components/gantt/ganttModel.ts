/**
 * Adapter from project state to renderable Gantt geometry. Pure — unit-testable.
 *
 * CPM runs on the structure's DATED leaves; their bar positions come from the
 * forward pass (pinned starts respected). Branch rows get span bars straight
 * from the rollup. The whole chart lives in integer day offsets around an
 * anchor = earliest pinned start (or today when nothing is dated yet).
 */

import type { DependencyType, ID, Project, Structure } from '../../model/types'
import { computeCpmOffsets, type CpmResult } from '../../engine/cpm'
import { flattenStructure } from '../../engine/numbering'
import { collectRollups } from '../../engine/rollup'
import { diffDaysIso, todayIso } from '../../lib/date'

export interface GanttBar {
  id: ID
  code: string
  name: string
  depth: number
  hasChildren: boolean
  isMilestone: boolean
  /** false → the row renders with an empty lane (no dates anywhere below). */
  hasDates: boolean
  /** Day offsets relative to the model anchor; end is inclusive. */
  startOffset?: number
  endOffset?: number
  progress?: number
  /** CPM flags — meaningful for network leaves only. */
  critical: boolean
  slack?: number
}

export interface GanttEdge {
  depId: ID
  fromId: ID
  toId: ID
  type: DependencyType
}

export interface GanttModel {
  anchorIso: string
  totalDays: number
  /** Parallel to the flattened rows (incl. root) so lanes align with labels. */
  bars: GanttBar[]
  edges: GanttEdge[]
}

const RIGHT_PAD_DAYS = 14

/** A leaf joins the CPM network only when it has enough data to place on the calendar. */
const isDatedLeaf = (n: {
  startDate?: string
  durationDays?: number
  isMilestone?: boolean
}): boolean => !!n.startDate && (n.isMilestone === true || n.durationDays !== undefined)

export function buildGanttModel(project: Project, structure: Structure): GanttModel {
  const nodes = project.nodes
  const rows = flattenStructure(nodes, structure.rootId, structure.collapsedIds, true)
  const rollups = collectRollups(nodes, structure.rootId)

  // --- Anchor: earliest pinned start in the network, else today --------------
  let earliest: string | null = null
  for (const row of rows) {
    if (!row.hasChildren && isDatedLeaf(row.node)) {
      const s = row.node.startDate!
      if (!earliest || s < earliest) earliest = s
    }
  }
  const anchorIso = earliest ?? todayIso()

  // --- CPM over dated leaves ---------------------------------------------------
  const cpmTasks = rows
    .filter((r) => !r.hasChildren && isDatedLeaf(r.node))
    .map((r) => ({
      id: r.id,
      duration: r.node.isMilestone ? 0 : (r.node.durationDays ?? 1),
      pinnedStart: diffDaysIso(r.node.startDate!, anchorIso),
    }))
  const cpmEdges = project.dependencies.map((d) => ({
    fromNodeId: d.fromNodeId,
    toNodeId: d.toNodeId,
    type: d.type,
    lagDays: d.lagDays,
  }))

  // Edit-time validation blocks cycles; still never let the UI crash on stale data.
  let cpm: Map<ID, CpmResult> | null = null
  try {
    cpm = cpmTasks.length > 0 ? computeCpmOffsets(cpmTasks, cpmEdges) : null
  } catch {
    cpm = null
  }

  // --- Bars ---------------------------------------------------------------------
  const bars: GanttBar[] = rows.map((row) => {
    const base: GanttBar = {
      id: row.id,
      code: row.code,
      name: row.node.name,
      depth: row.depth,
      hasChildren: row.hasChildren,
      isMilestone: row.node.isMilestone ?? false,
      hasDates: false,
      critical: false,
    }
    const ru = rollups.get(row.id)

    if (!row.hasChildren && cpm?.has(row.id)) {
      const r = cpm.get(row.id)!
      const dur = base.isMilestone ? 0 : (nodes[row.id].durationDays ?? 1)
      base.hasDates = true
      base.startOffset = r.es
      // Milestones are zero-length; normal bars cover their inclusive day span.
      base.endOffset = base.isMilestone ? r.es : r.es + Math.max(dur - 1, 0)
      base.progress = ru?.progress
      base.critical = r.critical
      base.slack = r.slack
      return base
    }

    // Branch span (or undated leaf that somehow carries a rollup span).
    if (ru?.startDate && ru.endDate) {
      base.hasDates = true
      base.startOffset = diffDaysIso(ru.startDate, anchorIso)
      base.endOffset = diffDaysIso(ru.endDate, anchorIso)
      base.progress = ru.progress
    }
    return base
  })

  // --- Edges limited to what is actually drawn ------------------------------------
  const dated = new Set(bars.filter((b) => b.hasDates).map((b) => b.id))
  const edges: GanttEdge[] = project.dependencies
    .filter((d) => dated.has(d.fromNodeId) && dated.has(d.toNodeId))
    .map((d) => ({ depId: d.id, fromId: d.fromNodeId, toId: d.toNodeId, type: d.type }))

  // --- Grid extent ------------------------------------------------------------------
  const maxEnd = bars.reduce((m, b) => Math.max(m, b.endOffset ?? 0), 0)
  const totalDays = Math.max(maxEnd + RIGHT_PAD_DAYS + 1, 31)

  return { anchorIso, totalDays, bars, edges }
}
