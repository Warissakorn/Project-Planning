import { describe, expect, it } from 'vitest'
import type { TreeNode } from '../model/types'
import {
  addChild,
  indent,
  insertSibling,
  isDescendantOrSelf,
  moveNode,
  outdent,
  removeSubtree,
  subtreeIds,
  updateNode,
  type Nodes,
} from './treeOps'

const n = (id: string): TreeNode => ({
  id,
  structureId: 's1',
  parentId: null,
  childIds: [],
  name: id,
})

/** root -> [A, B]; A -> [A1, A2] */
function makeTree(): { nodes: Nodes; ids: Record<string, string> } {
  const nodes: Nodes = {}
  const root = n('root')
  const A = n('A')
  const B = n('B')
  const A1 = n('A1')
  const A2 = n('A2')
  for (const x of [root, A, B, A1, A2]) nodes[x.id] = x
  addChild(nodes, 'root', A)
  addChild(nodes, 'root', B)
  addChild(nodes, 'A', A1)
  addChild(nodes, 'A', A2)
  return { nodes, ids: { root: 'root', A: 'A', B: 'B', A1: 'A1', A2: 'A2' } }
}

describe('treeOps', () => {
  it('addChild links parent and registers the node', () => {
    const { nodes } = makeTree()
    const C = n('C')
    addChild(nodes, 'root', C)
    expect(nodes.root.childIds).toEqual(['A', 'B', 'C'])
    expect(C.parentId).toBe('root')
  })

  it('insertSibling places the node right after the target', () => {
    const { nodes } = makeTree()
    const A3 = n('A3')
    insertSibling(nodes, 'A1', A3)
    expect(nodes.A.childIds).toEqual(['A1', 'A3', 'A2'])
  })

  it('removeSubtree deletes descendants and unlinks from the parent', () => {
    const { nodes } = makeTree()
    const removed = removeSubtree(nodes, 'A')
    expect(removed.sort()).toEqual(['A', 'A1', 'A2'])
    expect(nodes.A).toBeUndefined()
    expect(nodes.A1).toBeUndefined()
    expect(nodes.root.childIds).toEqual(['B'])
  })

  it('subtreeIds is depth-first inclusive', () => {
    const { nodes } = makeTree()
    expect(subtreeIds(nodes, 'A')).toEqual(['A', 'A1', 'A2'])
  })

  it('isDescendantOrSelf covers self and deep descendants', () => {
    const { nodes } = makeTree()
    expect(isDescendantOrSelf(nodes, 'A', 'A')).toBe(true)
    expect(isDescendantOrSelf(nodes, 'A', 'A2')).toBe(true)
    expect(isDescendantOrSelf(nodes, 'root', 'A2')).toBe(true)
    expect(isDescendantOrSelf(nodes, 'B', 'A2')).toBe(false)
  })

  describe('moveNode', () => {
    it('reorders within the same parent using pre-removal slots', () => {
      const { nodes } = makeTree()
      // Slots in [A, B]: 0 = before A, 1 = between, 2 = after B.
      // Dropping A back "between A and B" (slot 1) is a no-op:
      expect(moveNode(nodes, 'A', 'root', 1)).toBe(true)
      expect(nodes.root.childIds).toEqual(['A', 'B'])
      // After B (slot 2) compensates to post-removal index 1:
      expect(moveNode(nodes, 'A', 'root', 2)).toBe(true)
      expect(nodes.root.childIds).toEqual(['B', 'A'])
    })

    it('nests a node under another parent at an index', () => {
      const { nodes } = makeTree()
      expect(moveNode(nodes, 'B', 'A', 0)).toBe(true)
      expect(nodes.root.childIds).toEqual(['A'])
      expect(nodes.A.childIds).toEqual(['B', 'A1', 'A2'])
      expect(nodes.B.parentId).toBe('A')
    })

    it('refuses dropping into its own subtree', () => {
      const { nodes } = makeTree()
      expect(moveNode(nodes, 'A', 'A1', 0)).toBe(false)
      expect(moveNode(nodes, 'A', 'A', 0)).toBe(false)
      expect(nodes.root.childIds).toEqual(['A', 'B'])
    })

    it('refuses moving a structure root', () => {
      const { nodes } = makeTree()
      expect(moveNode(nodes, 'root', 'A', 0)).toBe(false)
    })
  })

  describe('indent / outdent', () => {
    it('indent makes the previous sibling the parent', () => {
      const { nodes } = makeTree()
      expect(indent(nodes, 'B')).toBe(true)
      expect(nodes.root.childIds).toEqual(['A'])
      expect(nodes.A.childIds).toEqual(['A1', 'A2', 'B'])
    })

    it('first child cannot indent', () => {
      const { nodes } = makeTree()
      expect(indent(nodes, 'A')).toBe(false)
    })

    it('outdent makes the node the next sibling of its former parent', () => {
      const { nodes } = makeTree()
      expect(outdent(nodes, 'A2')).toBe(true)
      expect(nodes.A.childIds).toEqual(['A1'])
      expect(nodes.root.childIds).toEqual(['A', 'A2', 'B'])
    })

    it('top-level rows cannot outdent', () => {
      const { nodes } = makeTree()
      expect(outdent(nodes, 'B')).toBe(false)
    })
  })

  it('updateNode patch-merges fields', () => {
    const { nodes } = makeTree()
    updateNode(nodes, 'A1', { name: 'Design', durationDays: 3 })
    expect(nodes.A1.name).toBe('Design')
    expect(nodes.A1.durationDays).toBe(3)
    expect(nodes.A1.childIds).toEqual([])
  })
})
