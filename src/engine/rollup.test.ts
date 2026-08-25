import { describe, expect, it } from 'vitest'
import type { TreeNode } from '../model/types'
import { addChild, type Nodes } from './treeOps'
import { collectRollups, leafInfo } from './rollup'

const n = (id: string, extra: Partial<TreeNode> = {}): TreeNode => ({
  id,
  structureId: 's1',
  parentId: null,
  childIds: [],
  name: id,
  ...extra,
})

describe('leafInfo', () => {
  it('computes an inclusive end date', () => {
    const info = leafInfo(n('t', { startDate: '2026-01-01', durationDays: 3 }))
    expect(info.endDate).toBe('2026-01-03')
    expect(info.durationDays).toBe(3)
  })

  it('a milestone has zero duration and ends where it starts', () => {
    const info = leafInfo(n('m', { startDate: '2026-01-05', isMilestone: true }))
    expect(info.durationDays).toBe(0)
    expect(info.endDate).toBe('2026-01-05')
  })

  it('derives status from progress when unset', () => {
    expect(leafInfo(n('a', { progress: 0 })).status).toBe('todo')
    expect(leafInfo(n('b', { progress: 40 })).status).toBe('in_progress')
    expect(leafInfo(n('c', { progress: 100 })).status).toBe('done')
  })

  it('respects an explicit status over the derived one', () => {
    expect(leafInfo(n('x', { progress: 50, status: 'done' })).status).toBe('done')
  })
})

describe('collectRollups', () => {
  function build(): Nodes {
    const nodes: Nodes = {}
    const add = (node: TreeNode, parent?: string) => {
      nodes[node.id] = node
      if (parent) addChild(nodes, parent, node)
    }
    // root
    // ├── A (span of children)
    // │   ├── A1 start 01-01 dur 2 prog 100 cost 100
    // │   └── A2 start 01-05 dur 3 prog 20  cost 300
    // └── B leaf: start 01-10 dur 1 prog 0 cost 50
    const root = n('root')
    const A = n('A')
    const B = n('B', { startDate: '2026-01-10', durationDays: 1, progress: 0, cost: 50 })
    const A1 = n('A1', { startDate: '2026-01-01', durationDays: 2, progress: 100, cost: 100 })
    const A2 = n('A2', { startDate: '2026-01-05', durationDays: 3, progress: 20, cost: 300 })
    add(root)
    add(A, 'root')
    add(B, 'root')
    add(A1, 'A')
    add(A2, 'A')
    return nodes
  }

  it('parents span min(start) to max(end)', () => {
    const rollups = collectRollups(build(), 'root')
    const a = rollups.get('A')!
    expect(a.startDate).toBe('2026-01-01')
    expect(a.endDate).toBe('2026-01-07') // inclusive end of A2
    expect(a.durationDays).toBe(7)
  })

  it('progress is weighted by child duration', () => {
    const rollups = collectRollups(build(), 'root')
    // A1: 100 × 2 + A2: 20 × 3 = 260 / 5 = 52
    expect(rollups.get('A')!.progress).toBe(52)
  })

  it('falls back to simple mean when a child has no schedule at all', () => {
    const nodes = build()
    // Undated child: leafInfo yields progress but no duration → weights unusable.
    delete nodes.A2.startDate
    delete nodes.A2.durationDays
    const rollups = collectRollups(nodes, 'A')
    expect(rollups.get('A')!.progress).toBe(60)
  })

  it('costs sum across the subtree', () => {
    const rollups = collectRollups(build(), 'root')
    expect(rollups.get('A')!.cost).toBe(400)
    expect(rollups.get('root')!.cost).toBe(450)
  })

  it('derives parent status from rolled-up progress', () => {
    const rollups = collectRollups(build(), 'root')
    expect(rollups.get('A')!.status).toBe('in_progress')
  })
})
