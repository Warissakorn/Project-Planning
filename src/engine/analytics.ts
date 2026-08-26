/**
 * Cross-structure analytics: the cost S-curve (CBS × WBS schedule) and
 * resource loading (OBS × WBS schedule). Pure functions over a Project —
 * no store, no React — memoized per [project, granularity] by callers.
 *
 * Attribution semantics (mirrored in docs/user-guide):
 * - Only leaves inside scheduling-capable structures participate; their span
 *   comes from `leafInfo`, so a milestone's zero-length span deposits its full
 *   cost on the start day and a missing duration means a 1-day span.
 * - A leaf's cost spreads EVENLY across its inclusive span. The grand total
 *   counts every task once; a leaf charged to N categories attributes its
 *   FULL cost to each of those series, so series totals may exceed it.
 * - Links whose source is a BRANCH node expand to every descendant leaf,
 *   each keeping its own dates/cost. Deduped per (leafId, target) so a leaf
 *   linked directly AND via an ancestor is counted once.
 * - Resource rows roll UP the OBS chain: a unit's cells include everything
 *   assigned to its descendants, mirroring the tree's roll-up philosophy.
 *
 * `todayIso()` is the only clock touch — everything else stays deterministic.
 */

import type { ID, LinkKind, Project, TreeNode } from '../model/types'
import { getStructureTypeOrFallback } from '../model/structureTypes'
import { schedulableLeafIds } from './validation'
import { subtreeIds, type Nodes } from './treeOps'
import { flattenStructure, type FlatRow } from './numbering'
import { leafInfo, type RollupInfo } from './rollup'
import {
  addDaysIso,
  addMonthsIso,
  diffDaysIso,
  endOfMonthIso,
  startOfMonthIso,
  startOfWeekIso,
  todayIso,
} from '../lib/date'

export type ReportGranularity = 'week' | 'month'

export interface ReportBucket {
  /** Inclusive bounds, clamped to the report range. */
  startIso: string
  endIso: string
}

/** Series key of the pseudo-bucket for cost no charge link claims. */
export const UNASSIGNED_KEY = '__unassigned'

// ---------------------------------------------------------------------------
// Shared bucket primitive — Monday-start weeks or calendar months
// ---------------------------------------------------------------------------

/**
 * Cut [anchor .. max(end, today)] into buckets so the today marker can never
 * float outside the axis. Empty/invalid ranges collapse to one empty bucket.
 */
export function makeBuckets(
  anchorIso: string,
  endRawIso: string,
  g: ReportGranularity,
): ReportBucket[] {
  const today = todayIso()
  const end = endRawIso > today ? endRawIso : today
  const anchor = anchorIso || today
  if (anchor > end) return [{ startIso: anchor, endIso: anchor }]

  const buckets: ReportBucket[] = []
  if (g === 'month') {
    let cursor = startOfMonthIso(anchor)
    while (cursor <= end) {
      const monthEnd = endOfMonthIso(cursor)
      buckets.push({
        startIso: cursor < anchor ? anchor : cursor,
        endIso: monthEnd > end ? end : monthEnd,
      })
      cursor = addMonthsIso(cursor, 1)
    }
  } else {
    // 7-day steps from the Monday on-or-before the anchor keep weeks aligned
    // across month edges.
    let cursor = startOfWeekIso(anchor)
    while (cursor <= end) {
      const weekEnd = addDaysIso(cursor, 6)
      buckets.push({
        startIso: cursor < anchor ? anchor : cursor,
        endIso: weekEnd > end ? end : weekEnd,
      })
      cursor = addDaysIso(cursor, 7)
    }
  }
  return buckets.length > 0 ? buckets : [{ startIso: anchor, endIso: end }]
}

/** Overlap length in inclusive days between task span and bucket; 0 when disjoint. */
function overlapDays(taskStart: string, taskEnd: string, bucket: ReportBucket): number {
  const s = taskStart > bucket.startIso ? taskStart : bucket.startIso
  const e = taskEnd < bucket.endIso ? taskEnd : bucket.endIso
  const d = diffDaysIso(e, s)
  return d < 0 ? 0 : d + 1
}

// ---------------------------------------------------------------------------
// Leaf universe & link expansion
// ---------------------------------------------------------------------------

interface LeafSpan {
  id: ID
  name: string
  info: RollupInfo
  cost: number | undefined
}

interface LeafUniverse {
  /** Dated schedulable leaves — the only curve/loading participants. */
  leaves: LeafSpan[]
  /**
   * Undated leaves worth warning about: carrying cost or referenced by any
   * cross-structure link. Plain undated WBS stubs stay silent.
   */
  undated: LeafSpan[]
  anchorIso: string
  endIso: string
}

const spanLenOf = (leaf: LeafSpan): number =>
  diffDaysIso(leaf.info.endDate!, leaf.info.startDate!) + 1

function buildUniverse(project: Project): LeafUniverse {
  const { nodes, structures } = project
  const ids = schedulableLeafIds(nodes, structures)

  const leaves: LeafSpan[] = []
  const undatedAll: LeafSpan[] = []
  let anchor: string | undefined
  let end: string | undefined

  for (const id of ids) {
    const node = nodes[id]
    const info = leafInfo(node)
    const span: LeafSpan = { id, name: node.name, info, cost: node.cost }
    if (!info.startDate || !info.endDate) {
      undatedAll.push(span)
      continue
    }
    leaves.push(span)
    if (!anchor || info.startDate < anchor) anchor = info.startDate
    if (!end || info.endDate > end) end = info.endDate
  }

  const referencedByLinks = new Set<ID>()
  for (const l of project.links) {
    for (const srcId of expandLinkSource(nodes, l.fromNodeId)) referencedByLinks.add(srcId)
  }
  const undated = undatedAll.filter((s) => s.cost !== undefined || referencedByLinks.has(s.id))

  return {
    leaves,
    undated,
    anchorIso: anchor ?? todayIso(),
    endIso: end ?? todayIso(),
  }
}

/**
 * Expand a link source to its contributing leaves: itself when already a
 * leaf, otherwise every leaf in its subtree (branch links).
 */
function expandLinkSource(nodes: Nodes, sourceId: ID): ID[] {
  const node = nodes[sourceId]
  if (!node) return []
  if (node.childIds.length === 0) return [sourceId]
  return subtreeIds(nodes, sourceId).filter((id) => nodes[id]?.childIds.length === 0)
}

/**
 * Map leafId → distinct target ids of one link kind. Branch sources expand;
 * direct + ancestor links onto the same target dedupe via the Set.
 */
function targetsByLeaf(project: Project, kind: LinkKind): Map<ID, Set<ID>> {
  const map = new Map<ID, Set<ID>>()
  for (const l of project.links) {
    if (l.kind !== kind) continue
    for (const leafId of expandLinkSource(project.nodes, l.fromNodeId)) {
      if (!project.nodes[leafId]) continue
      const set = map.get(leafId) ?? new Set<ID>()
      set.add(l.toNodeId)
      map.set(leafId, set)
    }
  }
  return map
}

/** Even-spread accrual of one leaf's cost across buckets. */
function accrue(
  leaf: LeafSpan,
  buckets: ReportBucket[],
  sink: number[],
  factor = 1,
): void {
  if (leaf.cost === undefined) return
  const len = spanLenOf(leaf)
  if (len <= 0) return
  for (let i = 0; i < buckets.length; i++) {
    const days = overlapDays(leaf.info.startDate!, leaf.info.endDate!, buckets[i])
    if (days > 0) sink[i] += ((leaf.cost * factor) * days) / len
  }
}

const prefixSum = (perBucket: number[]): number[] => {
  const out: number[] = []
  let run = 0
  for (const v of perBucket) {
    run += v
    out.push(run)
  }
  return out
}

// ---------------------------------------------------------------------------
// Cost S-curve
// ---------------------------------------------------------------------------

export interface CostCurveSeries {
  /** CBS category node id, or '__unassigned'. */
  key: string
  /** Category name, qualified with its structure name when several CBS exist. */
  name: string
  total: number
  /** Cumulative cost at each bucket end — parallel to `buckets`. */
  cumulative: number[]
}

export interface CostCurve {
  anchorIso: string
  buckets: ReportBucket[]
  cumulativeTotal: number[]
  /** Sum of dated tasks' costs — each task counted exactly once. */
  grandTotal: number
  /** CBS structures in registry order, outline order within; unassigned last. */
  series: CostCurveSeries[]
  stats: {
    datedTaskCount: number
    undatedTaskCount: number
    undatedCost: number
    /** Tasks charged to more than one category (full cost lands in each). */
    multiChargedTaskCount: number
  }
}

/** Charge-targetable (CBS) structures with their flattened categories. */
function cbsCategories(project: Project): Array<{ structureName: string; qualified: boolean; rows: FlatRow[] }> {
  const cbs = project.structures.filter((s) =>
    getStructureTypeOrFallback(s.typeId).capabilities.linkableTo.includes('charges'),
  )
  return cbs.map((s) => ({
    structureName: s.name,
    qualified: cbs.length > 1,
    rows: flattenStructure(project.nodes, s.rootId),
  }))
}

export function buildCostCurve(project: Project, g: ReportGranularity): CostCurve {
  const universe = buildUniverse(project)
  const buckets = makeBuckets(universe.anchorIso, universe.endIso, g)

  // Total curve: each dated task counted exactly once.
  const totalPerBucket = buckets.map(() => 0)
  const grandTotal = universe.leaves.reduce((sum, leaf) => sum + (leaf.cost ?? 0), 0)
  for (const leaf of universe.leaves) accrue(leaf, buckets, totalPerBucket)
  const cumulativeTotal = prefixSum(totalPerBucket)

  // Per-category attribution: FULL cost lands in every charged series.
  const charges = targetsByLeaf(project, 'charges')
  const multiChargedTaskCount = [...charges.values()].filter((s) => s.size > 1).length

  const series: CostCurveSeries[] = []
  for (const cat of cbsCategories(project)) {
    for (const row of cat.rows) {
      if (!universe.leaves.some((l) => charges.get(l.id)?.has(row.id))) continue
      const perBucket = buckets.map(() => 0)
      let total = 0
      for (const leaf of universe.leaves) {
        if (!charges.get(leaf.id)?.has(row.id)) continue
        total += leaf.cost ?? 0
        accrue(leaf, buckets, perBucket)
      }
      series.push({
        key: row.id,
        name: cat.qualified ? `${cat.structureName} · ${row.node.name}` : row.node.name,
        total,
        cumulative: prefixSum(perBucket),
      })
    }
  }

  // Unassigned series exists iff positive cost escapes every charge link.
  const unassignedPerBucket = buckets.map(() => 0)
  let unassignedTotal = 0
  for (const leaf of universe.leaves) {
    if (leaf.cost === undefined || (charges.get(leaf.id)?.size ?? 0) > 0) continue
    unassignedTotal += leaf.cost
    accrue(leaf, buckets, unassignedPerBucket)
  }
  if (unassignedTotal > 0) {
    series.push({
      key: UNASSIGNED_KEY,
      name: UNASSIGNED_KEY,
      total: unassignedTotal,
      cumulative: prefixSum(unassignedPerBucket),
    })
  }

  return {
    anchorIso: universe.anchorIso,
    buckets,
    cumulativeTotal,
    grandTotal,
    series,
    stats: {
      datedTaskCount: universe.leaves.length,
      undatedTaskCount: universe.undated.length,
      undatedCost: universe.undated.reduce((s, l) => s + (l.cost ?? 0), 0),
      multiChargedTaskCount,
    },
  }
}

// ---------------------------------------------------------------------------
// Resource loading
// ---------------------------------------------------------------------------

export interface ResourceRow {
  orgNodeId: ID
  code: string
  name: string
  depth: number
  /** Inclusive task-days per bucket. */
  cells: number[]
  /** ≤3 heaviest "task (Nd)" strings per bucket for tooltips. */
  cellTasks: string[][]
}

export interface ResourceLoading {
  anchorIso: string
  buckets: ReportBucket[]
  /** Every OBS unit flattened; synthetic roots excluded; idle units included. */
  rows: ResourceRow[]
  /** Task-days of dated leaves no assigns link touches. */
  unassignedDays: number[]
  stats: { loadedOrgCount: number }
}

export function buildResourceLoading(project: Project, g: ReportGranularity): ResourceLoading {
  const universe = buildUniverse(project)
  const buckets = makeBuckets(universe.anchorIso, universe.endIso, g)

  const assigns = targetsByLeaf(project, 'assigns')
  const obsStructures = project.structures.filter((s) =>
    getStructureTypeOrFallback(s.typeId).capabilities.linkableTo.includes('assigns'),
  )

  // Assignments accumulate into the org unit AND its ancestors (roots skipped).
  const cellsByOrg = new Map<ID, number[]>()
  const tasksByOrg = new Map<ID, Map<number, Array<{ name: string; days: number }>>>()

  const record = (orgId: ID, index: number, days: number, taskName: string) => {
    if (!project.nodes[orgId] || project.nodes[orgId].parentId === null) return
    let cells = cellsByOrg.get(orgId)
    if (!cells) {
      cells = buckets.map(() => 0)
      cellsByOrg.set(orgId, cells)
    }
    cells[index] += days
    let tasks = tasksByOrg.get(orgId)
    if (!tasks) {
      tasks = new Map()
      tasksByOrg.set(orgId, tasks)
    }
    const list = tasks.get(index) ?? []
    list.push({ name: taskName, days })
    tasks.set(index, list)
  }

  for (const leaf of universe.leaves) {
    const targets = assigns.get(leaf.id)
    if (!targets || targets.size === 0) continue
    for (let i = 0; i < buckets.length; i++) {
      const days = overlapDays(leaf.info.startDate!, leaf.info.endDate!, buckets[i])
      if (days <= 0) continue
      for (const orgId of targets) {
        for (const anc of ancestorChain(project.nodes, orgId)) record(anc, i, days, leaf.name)
      }
    }
  }

  const rows: ResourceRow[] = []
  for (const s of obsStructures) {
    for (const r of flattenStructure(project.nodes, s.rootId)) {
      const cells = buckets.map((_, i) => cellsByOrg.get(r.id)?.[i] ?? 0)
      const cellTasks = buckets.map((_, i) => {
        const list = tasksByOrg.get(r.id)?.get(i) ?? []
        return list
          .sort((a, b) => b.days - a.days)
          .slice(0, 3)
          .map((t) => `${t.name} (${t.days}d)`)
      })
      rows.push({
        orgNodeId: r.id,
        code: r.code,
        name: obsStructures.length > 1 ? `${s.name} · ${r.node.name}` : r.node.name,
        depth: r.depth,
        cells,
        cellTasks,
      })
    }
  }

  const unassignedDays = buckets.map(() => 0)
  for (const leaf of universe.leaves) {
    if ((assigns.get(leaf.id)?.size ?? 0) > 0) continue
    for (let i = 0; i < buckets.length; i++) {
      unassignedDays[i] += overlapDays(leaf.info.startDate!, leaf.info.endDate!, buckets[i])
    }
  }

  return {
    anchorIso: universe.anchorIso,
    buckets,
    rows,
    unassignedDays,
    stats: { loadedOrgCount: rows.filter((r) => r.cells.some((c) => c > 0)).length },
  }
}

/** Chain from the synthetic root down to `orgId` (inclusive). */
function ancestorChain(nodes: Nodes, orgId: ID): ID[] {
  const chain: ID[] = []
  let cur: TreeNode | undefined = nodes[orgId]
  while (cur) {
    chain.unshift(cur.id)
    cur = cur.parentId ? nodes[cur.parentId] : undefined
  }
  return chain
}
