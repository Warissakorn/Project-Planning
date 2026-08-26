/**
 * Core data model. Storage is NORMALIZED: a flat `Record<ID, TreeNode>` per
 * project where each node owns an ordered `childIds[]` (order lives there).
 *
 * Derived values (outline codes, parent roll-ups, CPM times) are NEVER stored
 * — they are computed by pure functions in `src/engine/`.
 */

export type ID = string

export type Lang = 'th' | 'en'

export interface Bilingual {
  th: string
  en: string
}

// ---------------------------------------------------------------------------
// Structures & their type registry
// ---------------------------------------------------------------------------

/** Open-ended: builtin ids ('wbs'|'obs'|...) plus any future custom type. */
export type StructureTypeId = string

export type LinkKind = 'assigns' | 'charges' | 'delivers' | 'mitigates'

export interface StructureTypeCapabilities {
  /** Has dates / duration / status / progress scheduling fields (WBS). */
  scheduling: boolean
  /** Has cost fields that may roll up (WBS sources, CBS targets). */
  costing: boolean
  /** May appear as a node in Dependency edges (WBS only). */
  dependencySource: boolean
  /** This structure's nodes may create links OF these kinds pointing outward. */
  linkableFrom: LinkKind[]
  /** This structure's nodes may be the TARGET of links of these kinds. */
  linkableTo: LinkKind[]
  maxDepth?: number
}

export type ColumnKind = 'text' | 'number' | 'currency' | 'percent' | 'date' | 'select'

export type AggregateMode = 'sum' | 'avgWeightedByDuration' | 'none'

export interface ColumnDef {
  key: string
  label: Bilingual
  kind: ColumnKind
  options?: string[]
  /** 'core' = first-class TreeNode field, 'attrs' = TreeNode.attrs[key]. */
  stored: 'core' | 'attrs'
  aggregate: AggregateMode
}

export interface StructureTypeConfig {
  id: StructureTypeId
  label: Bilingual
  capabilities: StructureTypeCapabilities
  columns: ColumnDef[]
}

// ---------------------------------------------------------------------------
// Project & nodes
// ---------------------------------------------------------------------------

export type TaskStatus = 'todo' | 'in_progress' | 'done'

export interface TreeNode {
  id: ID
  structureId: ID
  parentId: ID | null
  /** Ordered children — sibling ORDER lives here. */
  childIds: ID[]
  name: string
  notes?: string

  // --- Scheduling fields (meaningful when the structure type has
  // --- `capabilities.scheduling`). Leaves are the inputs; parents derive.
  /** ISO date `yyyy-MM-dd`. */
  startDate?: string
  durationDays?: number
  status?: TaskStatus
  /** 0..100, manual on leaves; parents derive a weighted average. */
  progress?: number
  /** Milestone: duration is treated as 0 and rendered as a diamond. */
  isMilestone?: boolean
  cost?: number

  /** Type-specific extras, driven by the type's ColumnDefs (`stored: 'attrs'`). */
  attrs?: Record<string, string | number | boolean | null>
}

export interface Structure {
  id: ID
  typeId: StructureTypeId
  name: string
  /** Synthetic root of the tree; its children are the top-level rows. */
  rootId: ID
  /** Persisted UI state: collapsed subtree ids. */
  collapsedIds: ID[]
}

export type DependencyType = 'FS' | 'SS' | 'FF' | 'SF'

export interface Dependency {
  id: ID
  /** Predecessor node. */
  fromNodeId: ID
  /** Successor node. */
  toNodeId: ID
  type: DependencyType
  /** In days; may be negative. */
  lagDays: number
}

export interface Link {
  id: ID
  kind: LinkKind
  /** Source node (e.g. WBS work package). */
  fromNodeId: ID
  /** Target node (e.g. OBS org unit or CBS category). */
  toNodeId: ID
  note?: string
}

export interface Project {
  id: ID
  name: string
  createdAt: number
  updatedAt: number
  structures: Structure[]
  /** All nodes of ALL structures in this project. */
  nodes: Record<ID, TreeNode>
  dependencies: Dependency[]
  links: Link[]
}

// ---------------------------------------------------------------------------
// Views
// ---------------------------------------------------------------------------

export type ViewMode = 'tree' | 'gantt' | 'reports'
