import { newId } from '../lib/id'
import type { ID, Project, Structure, TreeNode } from './types'

/** Create a bare node (no parent wiring — treeOps handles placement). */
export function createNode(structureId: ID, name: string): TreeNode {
  return {
    id: newId(),
    structureId,
    parentId: null,
    childIds: [],
    name,
  }
}

/**
 * A structure instance = its metadata + a synthetic root node.
 * Returns both pieces so the caller can merge `nodes` into the project record.
 */
export function createStructure(typeId: string, name?: string): {
  structure: Structure
  nodes: Record<ID, TreeNode>
} {
  const structureId = newId()
  const rootId = newId()
  const root = createNode(structureId, '')
  root.id = rootId

  const structure: Structure = {
    id: structureId,
    typeId,
    name: name ?? typeId.toUpperCase(),
    rootId,
    collapsedIds: [],
  }
  return { structure, nodes: { [rootId]: root } }
}

export function newProject(name: string): Project {
  const wbs = createStructure('wbs', 'WBS')
  // Root node of the default WBS mirrors the project name.
  wbs.nodes[wbs.structure.rootId].name = name

  return {
    id: newId(),
    name,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    structures: [wbs.structure],
    nodes: wbs.nodes,
    dependencies: [],
    links: [],
  }
}

/** Deep-clone a project under fresh ids (used by "duplicate project"). */
export function cloneProject(source: Project, newName: string): Project {
  const idMap = new Map<ID, ID>()
  for (const nodeId of Object.keys(source.nodes)) idMap.set(nodeId, newId())
  for (const s of source.structures) idMap.set(s.id, newId())
  for (const d of source.dependencies) idMap.set(d.id, newId())
  for (const l of source.links) idMap.set(l.id, newId())

  const nodes: Record<ID, TreeNode> = {}
  for (const [oldId, node] of Object.entries(source.nodes)) {
    const mapped = { ...node, id: idMap.get(oldId)! }
    if (mapped.parentId) mapped.parentId = idMap.get(mapped.parentId)!
    mapped.childIds = mapped.childIds.map((c) => idMap.get(c)!)
    mapped.structureId = idMap.get(mapped.structureId)!
    nodes[mapped.id] = mapped
  }

  return {
    ...source,
    id: newId(),
    name: newName,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    structures: source.structures.map((s) => ({
      ...s,
      id: idMap.get(s.id)!,
      rootId: idMap.get(s.rootId)!,
      collapsedIds: s.collapsedIds.map((c) => idMap.get(c)!),
    })),
    nodes,
    dependencies: source.dependencies.map((d) => ({
      ...d,
      id: idMap.get(d.id)!,
      fromNodeId: idMap.get(d.fromNodeId)!,
      toNodeId: idMap.get(d.toNodeId)!,
    })),
    links: source.links.map((l) => ({
      ...l,
      id: idMap.get(l.id)!,
      fromNodeId: idMap.get(l.fromNodeId)!,
      toNodeId: idMap.get(l.toNodeId)!,
    })),
  }
}
