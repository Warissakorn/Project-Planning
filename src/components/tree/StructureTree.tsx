import { useMemo, useState } from 'react'
import {
  DndContext,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragOverEvent,
  type DragStartEvent,
} from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import type { ID } from '../../model/types'
import { isDescendantOrSelf, type Nodes } from '../../engine/treeOps'
import { siblingIndex } from '../../engine/numbering'
import { bl } from '../../lib/i18n'
import { useAppStore } from '../../state/store'
import { useStructureData } from '../../state/selectors'
import { useT } from '../../lib/i18n'
import { Button } from '../ui/Button'
import { EmptyState } from '../ui/Misc'
import { ListTree, Plus } from 'lucide-react'
import { TreeNodeRow, type DropHint } from './TreeNodeRow'

const NAME_COL = 'minmax(260px, 38fr)'
const ATTR_COL = 'minmax(84px, 1fr)'

/**
 * The main grid: header + sortable flattened rows. dnd-kit owns pointer
 * tracking; drop semantics (before / after / inside) are computed here and
 * executed by the store's moveNodeTo → engine/treeOps.moveNode.
 */
export function StructureTree() {
  const t = useT()
  const lang = useAppStore((s) => s.lang)
  const { project, structure, typeConfig, rows, rollups } = useStructureData()
  const collapsedIds = useAppStore(
    (s) =>
      s.projects[s.activeProjectId ?? '']?.structures.find((x) => x.id === s.activeStructureId)
        ?.collapsedIds ?? [],
  )
  const addChildNode = useAppStore.getState().addChildNode
  const toggleCollapse = useAppStore.getState().toggleCollapse
  const moveNodeTo = useAppStore.getState().moveNodeTo

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }))

  const [dragId, setDragId] = useState<ID | null>(null)
  const [dropHint, setDropHint] = useState<DropHint | null>(null)

  const gridTemplate = useMemo(
    () => [NAME_COL, ...(typeConfig?.columns ?? []).map(() => ATTR_COL)].join(' '),
    [typeConfig],
  )

  if (!project || !structure || !typeConfig) return null
  const nodes: Nodes = project.nodes

  /** Guard: target row may not receive the drag (own subtree). */
  const droppable = (targetId: ID): boolean =>
    !!dragId && dragId !== targetId && !isDescendantOrSelf(nodes, dragId, targetId)

  const modeFor = (activeTop: number, activeH: number, rect: DOMRect): DropHint['mode'] => {
    const rel = (activeTop + activeH / 2 - rect.top) / rect.height
    if (rel < 0.3) return 'before'
    if (rel > 0.7) return 'after'
    return 'inside'
  }

  const onDragStart = (e: DragStartEvent) => setDragId(String(e.active.id))

  const onDragOver = (e: DragOverEvent) => {
    const { active, over } = e
    if (!over || !droppable(String(over.id))) {
      setDropHint(null)
      return
    }
    const translated = active.rect.current.translated
    const overRect = over.rect
    if (!translated) {
      setDropHint(null)
      return
    }
    setDropHint({
      id: String(over.id),
      mode: modeFor(translated.top, translated.height, overRect as DOMRect),
    })
  }

  const onDragEnd = (_e: DragEndEvent) => {
    if (dragId && dropHint && droppable(dropHint.id)) {
      const target = nodes[dropHint.id]
      let parentId: ID
      let index: number
      if (dropHint.mode === 'inside') {
        parentId = target.id
        index = target.childIds.length
      } else {
        parentId = target.parentId!
        index = siblingIndex(nodes, target.id) + (dropHint.mode === 'after' ? 1 : 0)
      }
      moveNodeTo(dragId, parentId, index)
    }
    setDragId(null)
    setDropHint(null)
  }

  const collapsedSet = new Set(collapsedIds)

  return (
    <DndContext sensors={sensors} onDragStart={onDragStart} onDragOver={onDragOver} onDragEnd={onDragEnd}>
      <div className="min-h-0 flex-1 overflow-auto">
        {/* header */}
        <div
          className="sticky top-0 z-10 grid items-center border-b border-slate-200 bg-slate-50 px-2 text-[11px] font-semibold uppercase tracking-wide text-slate-400"
          style={{ gridTemplateColumns: gridTemplate, height: 30 }}
        >
          <span className="pl-[68px]">{t('nameLabel')}</span>
          {typeConfig.columns.map((col) => (
            <span key={col.key} className="truncate px-1">
              {bl(col.label, lang)}
            </span>
          ))}
        </div>

        {rows.length === 0 ? (
          <EmptyState
            icon={<ListTree size={40} />}
            title={t('emptyTree')}
            action={
              <Button variant="primary" size="sm" onClick={() => addChildNode(structure.rootId)}>
                <Plus size={14} />
                {t('addChild')}
              </Button>
            }
          />
        ) : (
          <SortableContext items={rows.map((r) => r.id)} strategy={verticalListSortingStrategy}>
            {rows.map((row) => (
              <TreeNodeRow
                key={row.id}
                row={row}
                columns={typeConfig.columns}
                nodes={nodes}
                rollups={rollups}
                collapsedSet={collapsedSet}
                dropHint={dropHint?.id === row.id ? dropHint : null}
                gridTemplate={gridTemplate}
                onToggle={toggleCollapse}
              />
            ))}
          </SortableContext>
        )}
      </div>
    </DndContext>
  )
}
