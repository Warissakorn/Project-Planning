/**
 * Guard rules applied BEFORE any dependency/link mutation reaches the store.
 * The CPM engine additionally asserts acyclicity defensively, but users should
 * never be able to create a cycle through the UI.
 */

import type { Dependency, ID, Project, Structure } from '../model/types'
import { getStructureTypeOrFallback } from '../model/structureTypes'
import { isLeaf, type Nodes } from './treeOps'

export type DepError = 'missing' | 'self' | 'duplicate' | 'notLeaf' | 'crossStructure' | 'cycle'

/** i18n copy key for each dependency error (see lib/i18n.ts). */
export const DEP_ERROR_KEY: Record<DepError, string> = {
  missing: 'depNotLeafError',
  self: 'depSelfError',
  duplicate: 'depDuplicateError',
  notLeaf: 'depNotLeafError',
  crossStructure: 'depCrossStructureError',
  cycle: 'depCycleError',
}

/** Structure ids whose type has scheduling capability. */
export function schedulingStructureIds(structures: Structure[]): Set<ID> {
  return new Set(
    structures.filter((s) => getStructureTypeOrFallback(s.typeId).capabilities.scheduling).map((s) => s.id),
  )
}

/** Whether the project has ANY schedulable structure — gates the reports view. */
export function hasSchedulingStructure(structures: Structure[]): boolean {
  return schedulingStructureIds(structures).size > 0
}

/** Leaf nodes inside scheduling-capable structures — the only CPM participants. */
export function schedulableLeafIds(nodes: Nodes, structures: Structure[]): ID[] {
  const sched = schedulingStructureIds(structures)
  return Object.values(nodes)
    .filter((n) => sched.has(n.structureId) && isLeaf(nodes, n.id))
    .map((n) => n.id)
}

/** Would adding edge from→to close a cycle? Pure graph question on existing edges. */
export function createsCycle(
  dependencies: Pick<Dependency, 'fromNodeId' | 'toNodeId'>[],
  from: ID,
  to: ID,
): boolean {
  // A cycle appears iff `to` can already reach `from` through successor edges.
  const adj = new Map<ID, ID[]>()
  for (const d of dependencies) {
    const list = adj.get(d.fromNodeId) ?? []
    list.push(d.toNodeId)
    adj.set(d.fromNodeId, list)
  }
  const stack = [to]
  const seen = new Set<ID>()
  while (stack.length > 0) {
    const cur = stack.pop()!
    if (cur === from) return true
    if (seen.has(cur)) continue
    seen.add(cur)
    for (const nxt of adj.get(cur) ?? []) stack.push(nxt)
  }
  return false
}

export function validateDependency(
  project: Pick<Project, 'nodes' | 'dependencies' | 'structures'>,
  fromId: ID,
  toId: ID,
): DepError | null {
  const { nodes, dependencies, structures } = project
  const from = nodes[fromId]
  const to = nodes[toId]
  if (!from || !to) return 'missing'
  if (fromId === toId) return 'self'
  if (from.structureId !== to.structureId) return 'crossStructure'

  const sched = schedulingStructureIds(structures)
  const okNode = (n: typeof from) => sched.has(n.structureId) && isLeaf(nodes, n.id)
  if (!okNode(from) || !okNode(to)) return 'notLeaf'

  if (
    dependencies.some((d) => d.fromNodeId === fromId && d.toNodeId === toId)
  ) {
    return 'duplicate'
  }

  if (createsCycle(dependencies, fromId, toId)) return 'cycle'
  return null
}

/** All dependencies touching `nodeId`, tagged with direction. */
export function dependenciesOf(
  dependencies: Dependency[],
  nodeId: ID,
): Array<{ dep: Dependency; direction: 'predecessor' | 'successor' }> {
  const out: Array<{ dep: Dependency; direction: 'predecessor' | 'successor' }> = []
  for (const dep of dependencies) {
    if (dep.fromNodeId === nodeId) out.push({ dep, direction: 'successor' })
    else if (dep.toNodeId === nodeId) out.push({ dep, direction: 'predecessor' })
  }
  return out
}

/**
 * Remove dependencies & links that reference removed nodes.
 * Mutates the passed arrays (call inside immer).
 */
export function pruneReferences(project: Project, removedIds: Iterable<ID>): void {
  const gone = new Set(removedIds)
  project.dependencies = project.dependencies.filter(
    (d) => !gone.has(d.fromNodeId) && !gone.has(d.toNodeId),
  )
  project.links = project.links.filter((l) => !gone.has(l.fromNodeId) && !gone.has(l.toNodeId))
}
