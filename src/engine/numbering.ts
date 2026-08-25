/**
 * Outline-code numbering (1, 1.1, 1.1.2 …) and flattening for rendering.
 * Codes are computed on the fly — moving a node can never corrupt them.
 */

import type { ID, TreeNode } from '../model/types'
import type { Nodes } from './treeOps'

export interface FlatRow {
  id: ID
  node: TreeNode
  /** 0 for top-level rows (children of the synthetic root). */
  depth: number
  /** Outline code; empty string for the synthetic root row itself. */
  code: string
  hasChildren: boolean
}

/** Index (0-based) of `id` among its siblings, or -1 for roots. */
export function siblingIndex(nodes: Nodes, id: ID): number {
  const node = nodes[id]
  if (!node?.parentId) return -1
  return nodes[node.parentId].childIds.indexOf(id)
}

/**
 * Flatten the tree under `rootId` depth-first.
 *
 * @param includeRoot emit the synthetic root as the first row (code '')
 * @param collapsedIds subtrees under these ids are hidden (the row itself stays)
 */
export function flattenStructure(
  nodes: Nodes,
  rootId: ID,
  collapsedIds: Iterable<ID> = [],
  includeRoot = false,
): FlatRow[] {
  const collapsed = new Set(collapsedIds)
  const rows: FlatRow[] = []

  const walk = (id: ID, depth: number, code: string) => {
    const node = nodes[id]
    if (!node) return
    if (includeRoot || code !== '') {
      rows.push({ id, node, depth, code, hasChildren: node.childIds.length > 0 })
    }
    if (collapsed.has(id)) return
    node.childIds.forEach((childId, i) => {
      walk(childId, depth + 1, code === '' ? String(i + 1) : `${code}.${i + 1}`)
    })
  }

  walk(rootId, -1, '')
  return rows
}

/**
 * Outline code of a single node computed by walking UP its ancestor chain —
 * handy for inspector lists and CSV export where the full flatten is overkill.
 * Returns '' for the structure root.
 */
export function outlineCodeOf(nodes: Nodes, id: ID): string {
  const parts: number[] = []
  let cur: TreeNode | undefined = nodes[id]
  while (cur?.parentId) {
    const parent: TreeNode | undefined = nodes[cur.parentId]
    if (!parent) break
    parts.unshift(parent.childIds.indexOf(cur.id) + 1)
    cur = parent
  }
  return parts.join('.')
}
