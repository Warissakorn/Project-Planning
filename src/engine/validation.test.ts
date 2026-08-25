import { describe, expect, it } from 'vitest'
import type { Dependency, Project, TreeNode } from '../model/types'
import { addChild, type Nodes } from './treeOps'
import { createsCycle, schedulableLeafIds, validateDependency } from './validation'

const n = (id: string, structureId = 's1'): TreeNode => ({
  id,
  structureId,
  parentId: null,
  childIds: [],
  name: id,
})

const dep = (
  id: string,
  fromNodeId: string,
  toNodeId: string,
): Dependency => ({ id, fromNodeId, toNodeId, type: 'FS', lagDays: 0 })

/**
 * WBS 's1': root -> [A, B, P -> [P1]]  (A, B, P1 are schedulable leaves)
 * OBS-ish 's9' exists to exercise cross-structure rejection.
 */
function makeProject(): {
  project: Pick<Project, 'nodes' | 'dependencies' | 'structures'>
} {
  const nodes: Nodes = {}
  const add = (node: TreeNode, parent?: string) => {
    nodes[node.id] = node
    if (parent) addChild(nodes, parent, node)
  }
  add(n('root'))
  for (const id of ['A', 'B']) add(n(id), 'root')
  add(n('P'), 'root')
  add(n('P1'), 'P')
  add(n('rootX', 's9'))
  add(n('X1', 's9'), 'rootX')

  return {
    project: {
      nodes,
      dependencies: [] as Dependency[],
      structures: [
        { id: 's1', typeId: 'wbs', name: 'WBS', rootId: 'root', collapsedIds: [] },
        { id: 's9', typeId: 'obs', name: 'OBS', rootId: 'rootX', collapsedIds: [] },
      ],
    },
  }
}

describe('createsCycle', () => {
  const edges = [dep('d1', 'A', 'B'), dep('d2', 'B', 'C')]

  it('detects direct and indirect back-edges', () => {
    expect(createsCycle(edges, 'B', 'A')).toBe(true) // direct
    expect(createsCycle(edges, 'C', 'A')).toBe(true) // indirect
    expect(createsCycle(edges, 'A', 'C')).toBe(false) // forward is fine
  })

  it('allows diamond shapes (no false positive)', () => {
    const diamond = [dep('d1', 'A', 'B'), dep('d2', 'B', 'D'), dep('d3', 'A', 'C')]
    expect(createsCycle(diamond, 'C', 'D')).toBe(false)
  })
})

describe('validateDependency', () => {
  it('accepts a valid leaf-to-leaf edge', () => {
    expect(validateDependency(makeProject().project, 'A', 'B')).toBeNull()
  })

  it('rejects self-dependency', () => {
    expect(validateDependency(makeProject().project, 'A', 'A')).toBe('self')
  })

  it('rejects parents (non-leaf) as endpoints', () => {
    const p = makeProject().project
    expect(validateDependency(p, 'root', 'A')).toBe('notLeaf')
    expect(validateDependency(p, 'A', 'P')).toBe('notLeaf')
  })

  it('rejects cross-structure edges', () => {
    expect(validateDependency(makeProject().project, 'A', 'X1')).toBe('crossStructure')
  })

  it('rejects duplicates of the same pair', () => {
    const p = makeProject().project
    p.dependencies.push(dep('d1', 'A', 'B'))
    expect(validateDependency(p, 'A', 'B')).toBe('duplicate')
  })

  it('rejects an edge that would close an indirect cycle; reverse direction passes', () => {
    const p = makeProject().project
    p.dependencies.push(dep('d1', 'A', 'B'), dep('d2', 'B', 'P1'))
    expect(validateDependency(p, 'P1', 'A')).toBe('cycle')
    expect(validateDependency(p, 'A', 'P1')).toBeNull()
  })

  it('schedulableLeafIds only returns leaves of scheduling structures', () => {
    const p = makeProject().project
    expect(schedulableLeafIds(p.nodes, p.structures).sort()).toEqual(['A', 'B', 'P1'])
  })
})
