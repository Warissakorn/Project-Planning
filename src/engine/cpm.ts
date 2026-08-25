/**
 * Critical Path Method over the schedulable LEAF tasks only (parents get their
 * span from children via rollup.ts). Works in integer day offsets relative to
 * an anchor so it is fully decoupled from calendar/date-fns — golden tests stay
 * trivial. Callers convert offsets ↔ ISO dates around `anchorIso`.
 *
 * Throws on cycles (the UI blocks them at edit time via validation.ts).
 */

import type { DependencyType, ID } from '../model/types'

export interface CpmTask {
  id: ID
  duration: number
  /** Fixed start offset (from a user-entered date), may be negative. */
  pinnedStart?: number
}

export interface CpmEdge {
  fromNodeId: ID
  toNodeId: ID
  type: DependencyType
  lagDays: number
}

export interface CpmResult {
  es: number
  ef: number
  ls: number
  lf: number
  slack: number
  critical: boolean
}

/** Forward-pass start candidates contributed by one incoming edge (u = pred, dS = succ duration). */
function forwardCandidate(edge: CpmEdge, esU: number, efU: number, durS: number): number {
  switch (edge.type) {
    case 'FS':
      return efU + edge.lagDays
    case 'SS':
      return esU + edge.lagDays
    case 'FF':
      return efU + edge.lagDays - durS
    case 'SF':
      return esU + edge.lagDays - durS
  }
}

/** Backward-pass finish candidates contributed by one outgoing edge (v = succ, dP = pred duration). */
function backwardCandidate(edge: CpmEdge, lsV: number, lfV: number, durP: number): number {
  switch (edge.type) {
    case 'FS':
      return lsV - edge.lagDays
    case 'SS':
      return lsV - edge.lagDays + durP
    case 'FF':
      return lfV - edge.lagDays
    case 'SF':
      return lfV - edge.lagDays + durP
  }
}

export function computeCpmOffsets(tasks: CpmTask[], edges: CpmEdge[]): Map<ID, CpmResult> {
  const ids = tasks.map((t) => t.id)
  const taskById = new Map(tasks.map((t) => [t.id, t]))
  const duration = new Map<ID, number>(tasks.map((t) => [t.id, Math.max(0, t.duration)]))

  // Adjacency + indegree for Kahn's topological sort.
  const outEdges = new Map<ID, CpmEdge[]>()
  const inEdges = new Map<ID, CpmEdge[]>()
  const indegree = new Map<ID, number>(ids.map((id) => [id, 0]))
  for (const e of edges) {
    if (!duration.has(e.fromNodeId) || !duration.has(e.toNodeId)) continue // ignore stale edges
    push(outEdges, e.fromNodeId, e)
    push(inEdges, e.toNodeId, e)
    indegree.set(e.toNodeId, (indegree.get(e.toNodeId) ?? 0) + 1)
  }

  const queue: ID[] = ids.filter((id) => (indegree.get(id) ?? 0) === 0)
  const order: ID[] = []
  while (queue.length > 0) {
    const u = queue.shift()!
    order.push(u)
    for (const e of outEdges.get(u) ?? []) {
      const left = (indegree.get(e.toNodeId) ?? 0) - 1
      indegree.set(e.toNodeId, left)
      if (left === 0) queue.push(e.toNodeId)
    }
  }
  if (order.length !== ids.length) throw new Error('CPM: dependency graph contains a cycle')

  // --- Forward pass --------------------------------------------------------
  const es = new Map<ID, number>()
  const ef = new Map<ID, number>()
  for (const u of order) {
    const d = duration.get(u)!
    let start = 0
    const pinned = taskById.get(u)?.pinnedStart
    for (const e of inEdges.get(u) ?? []) {
      const cand = forwardCandidate(e, es.get(e.fromNodeId)!, ef.get(e.fromNodeId)!, d)
      if (cand > start) start = cand
    }
    if (pinned !== undefined && pinned > start) start = pinned
    es.set(u, start)
    ef.set(u, start + d)
  }
  const projectEnd = Math.max(0, ...ef.values())

  // --- Backward pass -------------------------------------------------------
  const ls = new Map<ID, number>()
  const lf = new Map<ID, number>()
  for (let i = order.length - 1; i >= 0; i--) {
    const u = order[i]
    const d = duration.get(u)!
    let finish = projectEnd
    for (const e of outEdges.get(u) ?? []) {
      const cand = backwardCandidate(e, ls.get(e.toNodeId)!, lf.get(e.toNodeId)!, d)
      if (cand < finish) finish = cand
    }
    lf.set(u, finish)
    ls.set(u, finish - d)
  }

  // --- Results -------------------------------------------------------------
  const result = new Map<ID, CpmResult>()
  for (const id of ids) {
    const s = es.get(id)!
    const f = ef.get(id)!
    const sl = ls.get(id)! - s
    result.set(id, { es: s, ef: f, ls: ls.get(id)!, lf: lf.get(id)!, slack: sl, critical: sl <= 0 })
  }
  return result
}

function push<K, V>(map: Map<K, V[]>, key: K, value: V): void {
  const list = map.get(key)
  if (list) list.push(value)
  else map.set(key, [value])
}
