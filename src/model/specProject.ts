/**
 * Declarative project builder: a spec tree (NodeSpec) + dependency list is
 * turned into a full Project whose WBS leaves are scheduled through the real
 * CPM forward pass, so dependency dates line up exactly with what the Gantt
 * draws. Statuses/progress derive automatically from each task's dates vs
 * today.
 *
 * Used by both the built-in sample projects (samples.ts) and the template
 * library (templates/) — templates omit `id`/`startIso` so each instantiation
 * gets a fresh nanoid and starts "today".
 */

import { computeCpmOffsets } from '../engine/cpm'
import { addDaysIso, endIso, todayIso } from '../lib/date'
import type {
  DependencyType,
  ID,
  LinkKind,
  Project,
  TreeNode,
} from './types'
import { createNode, createStructure, newProject } from './defaults'

// --- Spec types ---------------------------------------------------------------

export interface LeafSpec {
  key: string
  name: string
  /** Duration in days; milestones ignore it. Omitted → plain undated node. */
  duration?: number
  milestone?: boolean
  cost?: number
  attrs?: Record<string, string | number | boolean | null>
  notes?: string
}
export type NodeSpec = LeafSpec & { children?: NodeSpec[] }

export interface DepSpec {
  from: string
  to: string
  type?: DependencyType
  lag?: number
}

export interface LinkSpec {
  kind: LinkKind
  from: string
  to: string
}

export interface ExtraStructureSpec {
  typeId: 'obs' | 'cbs' | 'rbs' | 'pbs'
  name: string
  nodes: NodeSpec[]
}

export interface ProjectSpec {
  /** Fixed id (samples); omit to keep the generated nanoid (templates). */
  id?: string
  name: string
  /** ISO date the whole network starts from. Omit → today (templates). */
  startIso?: string
  wbs: NodeSpec[]
  deps?: DepSpec[]
  extraStructures?: ExtraStructureSpec[]
  links?: LinkSpec[]
}

// --- Builder ------------------------------------------------------------------

/** key→id map for one structure's built subtree. */
type KeyMap = Record<string, ID>

function buildSubtree(
  structureId: ID,
  parentId: ID,
  specs: NodeSpec[],
  projectNodes: Record<ID, TreeNode>,
): KeyMap {
  const keys: KeyMap = {}
  for (const spec of specs) {
    const node = createNode(structureId, spec.name)
    if (spec.cost !== undefined) node.cost = spec.cost
    if (spec.notes !== undefined) node.notes = spec.notes
    if (spec.attrs) node.attrs = spec.attrs
    if (spec.milestone) node.isMilestone = true

    node.parentId = parentId
    projectNodes[node.id] = node
    projectNodes[parentId].childIds.push(node.id)
    keys[spec.key] = node.id

    if (spec.children?.length) {
      Object.assign(keys, buildSubtree(structureId, node.id, spec.children, projectNodes))
    }
  }
  return keys
}

/** Leaves in DFS order with their depth in the tree. */
function leafSpecs(specs: NodeSpec[]): { spec: LeafSpec; depth: number }[] {
  const out: { spec: LeafSpec; depth: number }[] = []
  const walk = (list: NodeSpec[], depth: number) => {
    for (const s of list) {
      if (s.children?.length) walk(s.children, depth + 1)
      else out.push({ spec: s, depth })
    }
  }
  walk(specs, 0)
  return out
}

/**
 * Fill every WBS leaf's startDate/durationDays from a CPM pass over its dep
 * network, then stamp status/progress by comparing dates to today:
 * finished → done/100%, spanning today → in_progress/50%, future → todo.
 */
function scheduleWbs(
  project: Project,
  specs: NodeSpec[],
  keys: KeyMap,
  deps: DepSpec[],
  startIso: string,
): void {
  const leaves = leafSpecs(specs)
  const tasks = leaves.map(({ spec }) => ({
    id: spec.key,
    duration: spec.milestone ? 0 : Math.max(1, spec.duration ?? 1),
  }))
  const edges = deps.map((d) => ({
    fromNodeId: d.from,
    toNodeId: d.to,
    type: d.type ?? ('FS' as DependencyType),
    lagDays: d.lag ?? 0,
  }))

  const cpm = computeCpmOffsets(tasks, edges)

  const today = todayIso()
  for (const { spec } of leaves) {
    const node = project.nodes[keys[spec.key]]
    const r = cpm.get(spec.key)
    // No incoming edge → es is 0, so standalone tasks start at the project date.
    node.startDate = addDaysIso(startIso, r?.es ?? 0)
    node.durationDays = spec.milestone ? 0 : Math.max(0, spec.duration ?? 0)

    if (node.isMilestone || node.durationDays === undefined || node.durationDays === null)
      continue
    const end = endIso(node.startDate, node.durationDays)
    if (end < today) {
      node.status = 'done'
      node.progress = 100
    } else if (node.startDate <= today && end >= today) {
      node.status = 'in_progress'
      node.progress = 50
    } else {
      node.status = 'todo'
    }
  }
}

export function buildSample(spec: ProjectSpec): Project {
  const project = newProject(spec.name)
  if (spec.id !== undefined) project.id = spec.id

  const wbsKeys = buildSubtree(
    project.structures[0].id,
    project.structures[0].rootId,
    spec.wbs,
    project.nodes,
  )
  scheduleWbs(project, spec.wbs, wbsKeys, spec.deps ?? [], spec.startIso ?? todayIso())

  const structureKeys: Record<string, KeyMap> = {}
  for (const extra of spec.extraStructures ?? []) {
    const created = createStructure(extra.typeId, extra.name)
    project.structures.push(created.structure)
    Object.assign(project.nodes, created.nodes)
    // Name the synthetic root so Gantt rows read nicely when included.
    created.nodes[created.structure.rootId].name = extra.name
    structureKeys[extra.typeId] = buildSubtree(
      created.structure.id,
      created.structure.rootId,
      extra.nodes,
      project.nodes,
    )
  }

  project.dependencies = (spec.deps ?? []).map((d, i) => {
    const fromNodeId = wbsKeys[d.from]
    const toNodeId = wbsKeys[d.to]
    if (!fromNodeId || !toNodeId) throw new Error(`bad dep spec: ${d.from}->${d.to}`)
    return {
      id: `dep-${i}`,
      fromNodeId,
      toNodeId,
      type: d.type ?? 'FS',
      lagDays: d.lag ?? 0,
    }
  })

  project.links = (spec.links ?? []).map((l, i) => {
    // Links always go WBS → target structure node.
    const fromId = wbsKeys[l.from]
    const toMap = Object.values(structureKeys).find((map) => map[l.to])
    const toId = toMap?.[l.to] ?? null
    if (!fromId || !toId) throw new Error(`bad link spec: ${l.kind} ${l.from}->${l.to}`)
    return { id: `link-${i}`, kind: l.kind, fromNodeId: fromId, toNodeId: toId }
  })

  return project
}
