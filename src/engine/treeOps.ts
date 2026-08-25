/**
 * Tree surgery ops over the normalized `Record<ID, TreeNode>` storage.
 *
 * IMPORTANT: these functions MUTATE `nodes` in place — they are designed to be
 * called inside an immer draft in the store. They remain deterministic and
 * unit-testable: pass a plain object tree, assert the mutated result.
 */

import type { ID, TreeNode } from '../model/types'

export type Nodes = Record<ID, TreeNode>

// ---------------------------------------------------------------------------
// Queries
// ---------------------------------------------------------------------------

export const getNode = (nodes: Nodes, id: ID): TreeNode | undefined => nodes[id]

export const isLeaf = (nodes: Nodes, id: ID): boolean => nodes[id]?.childIds.length === 0

export const isStructureRoot = (node: TreeNode | undefined): boolean =>
  !!node && node.parentId === null

/** True if `maybeDescendantId` lies inside the subtree rooted at `ancestorId` (inclusive). */
export function isDescendantOrSelf(nodes: Nodes, ancestorId: ID, maybeDescendantId: ID): boolean {
  let cur: TreeNode | undefined = nodes[maybeDescendantId]
  while (cur) {
    if (cur.id === ancestorId) return true
    cur = cur.parentId ? nodes[cur.parentId] : undefined
  }
  return false
}

/** Chain of ids from the structure root down to `id` (inclusive). */
export function ancestorPath(nodes: Nodes, id: ID): ID[] {
  const path: ID[] = []
  let cur: TreeNode | undefined = nodes[id]
  while (cur) {
    path.unshift(cur.id)
    cur = cur.parentId ? nodes[cur.parentId] : undefined
  }
  return path
}

/** Depth below the synthetic structure root: top-level rows are 0. */
export function rowDepth(nodes: Nodes, id: ID): number {
  return Math.max(0, ancestorPath(nodes, id).length - 2)
}

/** All ids in the subtree rooted at `id`, depth-first, inclusive of `id`. */
export function subtreeIds(nodes: Nodes, id: ID): ID[] {
  const out: ID[] = []
  const visit = (nid: ID) => {
    const node = nodes[nid]
    if (!node) return
    out.push(nid)
    for (const c of node.childIds) visit(c)
  }
  visit(id)
  return out
}

// ---------------------------------------------------------------------------
// Mutations
// ---------------------------------------------------------------------------

/** Append `child` under `parentId` (last position). Registers the child in `nodes`. */
export function addChild(nodes: Nodes, parentId: ID, child: TreeNode): void {
  const parent = nodes[parentId]
  if (!parent) throw new Error(`addChild: missing parent ${parentId}`)
  child.parentId = parentId
  child.structureId = parent.structureId
  parent.childIds.push(child.id)
  nodes[child.id] = child
}

/** Insert `node` right after `siblingId`. */
export function insertSibling(nodes: Nodes, siblingId: ID, node: TreeNode): void {
  const sibling = nodes[siblingId]
  if (!sibling?.parentId) throw new Error(`insertSibling: bad sibling ${siblingId}`)
  const parent = nodes[sibling.parentId]
  node.parentId = parent.id
  node.structureId = parent.structureId
  parent.childIds.splice(parent.childIds.indexOf(siblingId) + 1, 0, node.id)
  nodes[node.id] = node
}

/** Patch-merge fields onto one node. */
export function updateNode(
  nodes: Nodes,
  id: ID,
  patch: Partial<Omit<TreeNode, 'id' | 'childIds' | 'parentId' | 'structureId'>>,
): void {
  const node = nodes[id]
  if (!node) throw new Error(`updateNode: missing ${id}`)
  Object.assign(node, patch)
}

/**
 * Remove the whole subtree rooted at `id` (must NOT be a structure root —
 * deleting structures goes through the store instead).
 * @returns removed ids (including `id`), so callers can prune deps/links.
 */
export function removeSubtree(nodes: Nodes, id: ID): ID[] {
  const node = nodes[id]
  if (!node) return []
  if (isStructureRoot(node)) throw new Error('removeSubtree: cannot remove a structure root')
  const parent = nodes[node.parentId!]
  parent.childIds = parent.childIds.filter((c) => c !== id)
  const removed = subtreeIds(nodes, id)
  for (const rid of removed) delete nodes[rid]
  return removed
}

/**
 * Move `dragId` to become child at `newIndex` of `newParentId`.
 * Refuses: moving a structure root, dropping into the moved subtree.
 * Same-parent moves compensate the index for the removal. Returns success.
 */
export function moveNode(nodes: Nodes, dragId: ID, newParentId: ID, newIndex: number): boolean {
  const dragged = nodes[dragId]
  const newParent = nodes[newParentId]
  if (!dragged || !newParent) return false
  if (dragged.parentId === null) return false // structure root is fixed
  if (isDescendantOrSelf(nodes, dragId, newParentId)) return false

  const oldParentId = dragged.parentId
  const oldIndex = nodes[oldParentId].childIds.indexOf(dragId)

  let index = newIndex
  if (oldParentId === newParentId && index > oldIndex) index -= 1

  nodes[oldParentId].childIds.splice(oldIndex, 1)
  const list = nodes[newParentId].childIds
  index = Math.max(0, Math.min(index, list.length))
  list.splice(index, 0, dragId)
  dragged.parentId = newParentId
  return true
}

/**
 * Keyboard-style indent: the previous sibling becomes the new parent
 * (`id` is appended after that sibling's existing children).
 */
export function indent(nodes: Nodes, id: ID): boolean {
  const node = nodes[id]
  if (!node?.parentId) return false
  const parent = nodes[node.parentId]
  const idx = parent.childIds.indexOf(id)
  if (idx === 0) return false // nothing above to indent under
  const newParent = nodes[parent.childIds[idx - 1]]
  parent.childIds.splice(idx, 1)
  newParent.childIds.push(id)
  node.parentId = newParent.id
  return true
}

/**
 * Keyboard-style outdent: `id` becomes the immediate next sibling of its
 * former parent. Refuses at top level (parent already has no parent).
 */
export function outdent(nodes: Nodes, id: ID): boolean {
  const node = nodes[id]
  if (!node?.parentId) return false
  const parent = nodes[node.parentId]
  if (parent.parentId === null) return false
  const grandparent = nodes[parent.parentId]
  const gpIdx = grandparent.childIds.indexOf(parent.id)
  parent.childIds = parent.childIds.filter((c) => c !== id)
  grandparent.childIds.splice(gpIdx + 1, 0, id)
  node.parentId = grandparent.id
  return true
}

/** Detach `id` from its parent WITHOUT deleting it (used by cross-tree grafting). */
export function detach(nodes: Nodes, id: ID): void {
  const node = nodes[id]
  if (!node?.parentId) return
  const parent = nodes[node.parentId]
  parent.childIds = parent.childIds.filter((c) => c !== id)
  node.parentId = null
}
