import type { StateCreator } from 'zustand'
import { createNode, createStructure } from '../../model/defaults'
import { getStructureTypeOrFallback } from '../../model/structureTypes'
import type {
  Dependency,
  DependencyType,
  ID,
  LinkKind,
  Project,
  TaskStatus,
  TreeNode,
  ViewMode,
} from '../../model/types'
import { newId } from '../../lib/id'
import {
  addChild,
  indent,
  insertSibling,
  moveNode,
  outdent,
  removeSubtree,
  subtreeIds,
  updateNode,
} from '../../engine/treeOps'
import { pruneReferences, validateDependency, type DepError } from '../../engine/validation'
import { HISTORY_LIMIT, lastSnapshotFor, type HistorySnapshot } from '../history'
import type { AppState } from '../store'

/**
 * Every structural mutation flows through `runMutation`, which snapshots the
 * previous project object onto the undo stack ONLY when the mutation actually
 * changed it (reference inequality after the immer produce). Collapse /
 * selection UI state intentionally bypasses history.
 */
type SetFn = (fn: (draft: AppState) => void) => void

function runMutation(
  set: SetFn,
  get: () => AppState,
  mutator: (project: Project, draft: AppState) => void,
): boolean {
  const pid = get().activeProjectId
  if (!pid) return false
  const prev = get().projects[pid]

  set((d) => {
    const project = d.projects[pid]
    if (project) mutator(project, d)
  })

  const next = get().projects[pid]
  if (next === prev) return false

  set((d) => {
    const project = d.projects[pid]
    if (!project) return
    project.updatedAt = Date.now()
    d.historyPast.push({ projectId: pid, project: prev })
    if (d.historyPast.length > HISTORY_LIMIT) d.historyPast.shift()
    d.historyFuture = []
  })
  return true
}

export interface TreeSlice {
  // workspace pointers
  setActiveProject: (id: ID | null) => void
  setActiveStructure: (id: ID) => void
  selectNode: (id: ID | null) => void
  setMode: (mode: ViewMode) => void
  toggleCollapse: (nodeId: ID) => void
  collapseAll: (structureId: ID) => void
  expandAll: (structureId: ID) => void

  // tree editing
  addChildNode: (parentId: ID) => ID | null
  addSiblingNode: (siblingId: ID) => ID | null
  renameNode: (id: ID, name: string) => void
  updateNodeFields: (id: ID, patch: Partial<TreeNode>) => void
  setNodeStatus: (id: ID, status: TaskStatus) => void
  setNodeAttr: (id: ID, key: string, value: string | number | boolean | null) => void
  deleteNodes: (ids: ID[]) => void
  moveNodeTo: (dragId: ID, parentId: ID, index: number) => boolean
  indentAction: (id: ID) => boolean
  outdentAction: (id: ID) => boolean

  // structures
  addStructureOfType: (typeId: string) => void
  renameStructure: (structureId: ID, name: string) => void
  deleteStructureById: (structureId: ID) => void

  // dependencies
  addDependencyAction: (
    fromId: ID,
    toId: ID,
    type: DependencyType,
    lagDays: number,
  ) => DepError | null
  updateDependencyAction: (depId: ID, patch: Partial<Pick<Dependency, 'type' | 'lagDays'>>) => void
  removeDependencyAction: (depId: ID) => void

  // cross-links
  addLinkAction: (kind: LinkKind, fromId: ID, toId: ID) => boolean
  removeLinkAction: (linkId: ID) => void

  // history passthroughs used by keyboard shortcuts
  undo: () => void
  redo: () => void
}

export const createTreeSlice: StateCreator<AppState, [['zustand/immer', never]], [], TreeSlice> = (
  set,
  get,
) => ({
  setActiveProject: (id) => {
    set((d) => {
      d.activeProjectId = id
      d.historyPast = []
      d.historyFuture = []
      d.selectedNodeId = null
      const p = id ? d.projects[id] : null
      d.activeStructureId =
        (id && p?.structures.find((s) => s.id === d.activeStructureId)?.id) ??
        p?.structures[0]?.id ??
        null
      d.viewMode = 'tree'
    })
  },

  setActiveStructure: (id) => {
    set((d) => {
      d.activeStructureId = id
      d.selectedNodeId = null
      d.viewMode = 'tree'
    })
  },

  selectNode: (id) => {
    set((d) => {
      d.selectedNodeId = id
    })
  },

  setMode: (mode) => {
    set((d) => {
      d.viewMode = mode
    })
  },

  toggleCollapse: (nodeId) => {
    set((d) => {
      const s = d.projects[d.activeProjectId ?? '']?.structures.find(
        (x) => x.id === d.activeStructureId,
      )
      if (!s) return
      if (s.collapsedIds.includes(nodeId)) s.collapsedIds = s.collapsedIds.filter((c) => c !== nodeId)
      else s.collapsedIds.push(nodeId)
    })
  },

  collapseAll: (structureId) => {
    set((d) => {
      const project = d.projects[d.activeProjectId ?? '']
      const s = project?.structures.find((x) => x.id === structureId)
      if (!project || !s) return
      s.collapsedIds = subtreeIds(project.nodes, s.rootId).filter((id) => id !== s.rootId)
    })
  },

  expandAll: (structureId) => {
    set((d) => {
      const s = d.projects[d.activeProjectId ?? '']?.structures.find((x) => x.id === structureId)
      if (!s) return
      s.collapsedIds = []
    })
  },

  // ------------------------------------------------------------------ editing

  addChildNode: (parentId) => {
    const pid = get().activeProjectId
    const project = pid ? get().projects[pid] : null
    const parent = project?.nodes[parentId]
    if (!parent) return null
    let created: ID | null = null
    runMutation(set, get, (p, d) => {
      const node = createNode(parent.structureId, '')
      addChild(p.nodes, parentId, node)
      created = node.id
      // ensure the parent is expanded so the new child is visible
      const s = p.structures.find((x) => x.id === parent.structureId)
      if (s) s.collapsedIds = s.collapsedIds.filter((c) => c !== parentId)
      d.selectedNodeId = node.id
    })
    return created
  },

  addSiblingNode: (siblingId) => {
    const pid = get().activeProjectId
    const project = pid ? get().projects[pid] : null
    const sibling = project?.nodes[siblingId]
    if (!sibling) return null
    // On a structure root there is no sibling slot — add a child instead.
    if (sibling.parentId === null) return get().addChildNode(siblingId)

    let created: ID | null = null
    runMutation(set, get, (p, d) => {
      const node = createNode(sibling.structureId, '')
      insertSibling(p.nodes, siblingId, node)
      created = node.id
      d.selectedNodeId = node.id
    })
    return created
  },

  renameNode: (id, name) => {
    runMutation(set, get, (p) => {
      if (p.nodes[id]) updateNode(p.nodes, id, { name })
    })
  },

  updateNodeFields: (id, patch) => {
    runMutation(set, get, (p) => {
      if (p.nodes[id]) updateNode(p.nodes, id, patch)
    })
  },

  setNodeStatus: (id, status) => {
    runMutation(set, get, (p) => {
      if (p.nodes[id]) updateNode(p.nodes, id, { status })
    })
  },

  setNodeAttr: (id, key, value) => {
    runMutation(set, get, (p) => {
      const node = p.nodes[id]
      if (!node) return
      if (!node.attrs) node.attrs = {}
      if (value === null || value === '') delete node.attrs[key]
      else node.attrs[key] = value
    })
  },

  deleteNodes: (ids) => {
    runMutation(set, get, (p, d) => {
      let removedAll: ID[] = []
      for (const id of ids) {
        const node = p.nodes[id]
        if (!node || node.parentId === null) continue
        removedAll = removedAll.concat(removeSubtree(p.nodes, id))
      }
      if (removedAll.length === 0) return
      pruneReferences(p, removedAll)
      const gone = new Set(removedAll)
      for (const s of p.structures) s.collapsedIds = s.collapsedIds.filter((c) => !gone.has(c))
      if (d.selectedNodeId && gone.has(d.selectedNodeId)) {
        // Walk up to the nearest surviving ancestor.
        let cur: TreeNode | undefined = p.nodes[d.selectedNodeId]
        while (cur && gone.has(cur.id)) cur = cur.parentId ? p.nodes[cur.parentId] : undefined
        d.selectedNodeId = cur ? cur.id : null
      }
    })
  },

  moveNodeTo: (dragId, parentId, index) => {
    let ok = false
    runMutation(set, get, (p) => {
      ok = moveNode(p.nodes, dragId, parentId, index)
    })
    return ok
  },

  indentAction: (id) => {
    let ok = false
    runMutation(set, get, (p) => {
      ok = indent(p.nodes, id)
    })
    return ok
  },

  outdentAction: (id) => {
    let ok = false
    runMutation(set, get, (p) => {
      ok = outdent(p.nodes, id)
    })
    return ok
  },

  // --------------------------------------------------------------- structures

  addStructureOfType: (typeId) => {
    const pid = get().activeProjectId
    if (!pid) return
    runMutation(set, get, (p, d) => {
      const existing = p.structures.filter((s) => s.typeId === typeId).length
      const base = typeId.toUpperCase()
      const name = existing === 0 ? base : `${base} ${existing + 1}`
      const { structure, nodes } = createStructure(typeId, name)
      p.structures.push(structure)
      Object.assign(p.nodes, nodes)
      d.activeStructureId = structure.id
      d.selectedNodeId = null
      d.viewMode = 'tree'
    })
  },

  renameStructure: (structureId, name) => {
    runMutation(set, get, (p) => {
      const s = p.structures.find((x) => x.id === structureId)
      if (s) s.name = name.trim()
    })
  },

  deleteStructureById: (structureId) => {
    runMutation(set, get, (p, d) => {
      const s = p.structures.find((x) => x.id === structureId)
      if (!s || p.structures.length <= 1) return // keep at least one tab
      const removed = subtreeIds(p.nodes, s.rootId)
      for (const id of removed) delete p.nodes[id]
      pruneReferences(p, removed)
      p.structures = p.structures.filter((x) => x.id !== structureId)
      if (d.activeStructureId === structureId) {
        d.activeStructureId = p.structures[0]?.id ?? null
        d.viewMode = 'tree'
      }
    })
  },

  // -------------------------------------------------------------- dependencies

  addDependencyAction: (fromId, toId, type, lagDays) => {
    const pid = get().activeProjectId
    const project = pid ? get().projects[pid] : null
    if (!project) return 'missing'
    const error = validateDependency(project, fromId, toId)
    if (error) return error
    runMutation(set, get, (p) => {
      p.dependencies.push({
        id: newId(),
        fromNodeId: fromId,
        toNodeId: toId,
        type,
        lagDays: Math.trunc(lagDays) || 0,
      })
    })
    return null
  },

  updateDependencyAction: (depId, patch) => {
    runMutation(set, get, (p) => {
      p.dependencies = p.dependencies.map((dep) =>
        dep.id === depId
          ? { ...dep, ...patch, lagDays: Math.trunc(patch.lagDays ?? dep.lagDays) || 0 }
          : dep,
      )
    })
  },

  removeDependencyAction: (depId) => {
    runMutation(set, get, (p) => {
      p.dependencies = p.dependencies.filter((dep) => dep.id !== depId)
    })
  },

  // -------------------------------------------------------------------- links

  addLinkAction: (kind, fromId, toId) => {
    const pid = get().activeProjectId
    const project = pid ? get().projects[pid] : null
    if (!project) return false
    const from = project.nodes[fromId]
    const to = project.nodes[toId]
    if (!from || !to || from.id === to.id) return false
    const fromType = getStructureTypeOrFallback(
      project.structures.find((s) => s.id === from.structureId)?.typeId ?? '',
    )
    const toType = getStructureTypeOrFallback(
      project.structures.find((s) => s.id === to.structureId)?.typeId ?? '',
    )
    if (!fromType.capabilities.linkableFrom.includes(kind)) return false
    if (!toType.capabilities.linkableTo.includes(kind)) return false
    if (
      project.links.some((l) => l.kind === kind && l.fromNodeId === fromId && l.toNodeId === toId)
    ) {
      return false
    }
    runMutation(set, get, (p) => {
      p.links.push({ id: newId(), kind, fromNodeId: fromId, toNodeId: toId })
    })
    return true
  },

  removeLinkAction: (linkId) => {
    runMutation(set, get, (p) => {
      p.links = p.links.filter((l) => l.id !== linkId)
    })
  },

  // ------------------------------------------------------------------ history

  undo: () => {
    set((d) => {
      const pid = d.activeProjectId
      if (!pid) return
      const i = lastSnapshotFor(d.historyPast, pid)
      if (i < 0) return
      const snap: HistorySnapshot = d.historyPast[i]
      const current = d.projects[pid]
      if (current) d.historyFuture.push({ projectId: pid, project: current })
      d.projects[pid] = snap.project
      d.historyPast.splice(i, 1)
      // Drop selections pointing at nodes that no longer exist.
      if (d.selectedNodeId && !d.projects[pid].nodes[d.selectedNodeId]) d.selectedNodeId = null
    })
  },

  redo: () => {
    set((d) => {
      const pid = d.activeProjectId
      if (!pid) return
      const i = lastSnapshotFor(d.historyFuture, pid)
      if (i < 0) return
      const snap = d.historyFuture[i]
      const current = d.projects[pid]
      if (current) d.historyPast.push({ projectId: pid, project: current })
      d.projects[pid] = snap.project
      d.historyFuture.splice(i, 1)
      if (d.selectedNodeId && !d.projects[pid].nodes[d.selectedNodeId]) d.selectedNodeId = null
    })
  },
})

/** Convenience for components that just want the active project (or null). */
export function activeProjectOf(state: Pick<AppState, 'projects' | 'activeProjectId'>): Project | null {
  return state.activeProjectId ? (state.projects[state.activeProjectId] ?? null) : null
}
