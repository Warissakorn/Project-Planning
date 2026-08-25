import { describe, expect, it } from 'vitest'
import type { TreeNode } from '../model/types'
import { addChild, moveNode, type Nodes } from './treeOps'
import { flattenStructure } from './numbering'

const n = (id: string): TreeNode => ({
  id,
  structureId: 's1',
  parentId: null,
  childIds: [],
  name: id,
})

/** root -> [A -> [A1], B] */
function makeTree(): Nodes {
  const nodes: Nodes = {}
  const root = n('root')
  const A = n('A')
  const A1 = n('A1')
  const B = n('B')
  for (const x of [root, A, A1, B]) nodes[x.id] = x
  addChild(nodes, 'root', A)
  addChild(nodes, 'A', A1)
  addChild(nodes, 'root', B)
  return nodes
}

describe('flattenStructure / outline codes', () => {
  it('numbers a three-level tree as 1 / 1.1 / 2', () => {
    const rows = flattenStructure(makeTree(), 'root')
    expect(rows.map((r) => [r.code, r.depth])).toEqual([
      ['1', 0],
      ['1.1', 1],
      ['2', 0],
    ])
  })

  it('renumbers after reordering siblings (codes are derived, not stored)', () => {
    const nodes = makeTree()
    moveNode(nodes, 'B', 'root', 0) // root -> [B, A -> [A1]]
    const rows = flattenStructure(nodes, 'root')
    expect(rows.map((r) => r.code)).toEqual(['1', '2', '2.1'])
    expect(rows[0].id).toBe('B')
    expect(rows.find((r) => r.id === 'A1')!.code).toBe('2.1')
  })

  it('collapsed ids hide their subtree but keep the row itself', () => {
    const rows = flattenStructure(makeTree(), 'root', ['A'])
    expect(rows.map((r) => r.code)).toEqual(['1', '2'])
  })

  it('can include the synthetic root row', () => {
    const rows = flattenStructure(makeTree(), 'root', [], true)
    expect(rows[0]).toMatchObject({ id: 'root', code: '', depth: -1 })
  })
})
