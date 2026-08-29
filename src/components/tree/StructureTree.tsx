import { useEffect, useMemo, useRef, useState } from 'react'
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
// A fixed default, not `minmax(96px, 1fr)`: a flexible track only ever
// rendered at its 96px floor anyway (name's 38fr outweighs it in the
// browser's flex-distribution and starves it first), while ColGrip assumed
// an unset column started at 140px — so the very first drag on any column
// jumped by the gap between those two numbers before the mouse had moved at
// all. A literal 140px removes the mismatch and matches what ColGrip expects.
const ATTR_COL = '140px'
const NAME_KEY = '__name'

/** Drag handle on a column header's right edge; double-click resets the width. */
export function ColGrip({
  width,
  min,
  max,
  title,
  onResize,
  onReset,
}: {
  width: number
  min: number
  max: number
  title: string
  onResize: (w: number) => void
  onReset: () => void
}) {
  const drag = useRef<{ startX: number; startW: number } | null>(null)
  return (
    <span
      role="separator"
      aria-orientation="vertical"
      title={title}
      className="absolute inset-y-0 right-0 z-20 w-1.5 cursor-col-resize touch-none hover:bg-indigo-400/50"
      onPointerDown={(e) => {
        e.preventDefault()
        e.stopPropagation()
        // Measure the column's actual rendered box instead of trusting the
        // `width` prop: for an unset column that prop is a caller's guess
        // (e.g. the tree's 140px default), which can disagree with what the
        // browser actually laid out — CSS grid may render it narrower still
        // (see ATTR_COL above). Starting from a wrong width makes the column
        // jump the moment you touch the grip, before you've dragged at all.
        const parent = (e.currentTarget as HTMLElement).parentElement
        const liveWidth = parent?.getBoundingClientRect().width ?? width
        drag.current = { startX: e.clientX, startW: liveWidth }
        ;(e.target as HTMLElement).setPointerCapture(e.pointerId)
      }}
      onPointerMove={(e) => {
        if (!drag.current) return
        onResize(Math.min(max, Math.max(min, drag.current.startW + e.clientX - drag.current.startX)))
      }}
      onPointerUp={(e) => {
        drag.current = null
        ;(e.target as HTMLElement).releasePointerCapture(e.pointerId)
      }}
      onDoubleClick={(e) => {
        e.stopPropagation()
        onReset()
      }}
    />
  )
}

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
  const selectNode = useAppStore.getState().selectNode
  const selectedNodeId = useAppStore((s) => s.selectedNodeId)

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }))

  const [dragId, setDragId] = useState<ID | null>(null)
  const [dropHint, setDropHint] = useState<DropHint | null>(null)
  const listRef = useRef<HTMLDivElement>(null)

  // Column widths: persisted per column key; a stored width pins the column
  // (name keeps flexing above its stored minimum), unset columns share the rest.
  const columnWidths = useAppStore((s) => s.columnWidths)
  const setColumnWidth = useAppStore.getState().setColumnWidth
  const nameWidth = columnWidths[NAME_KEY]

  const gridTemplate = useMemo(
    () => [
      nameWidth ? `minmax(${Math.max(nameWidth, 220)}px, 38fr)` : NAME_COL,
      ...(typeConfig?.columns ?? []).map((c) => {
        const w = columnWidths[c.key]
        return w ? `${Math.max(w, 72)}px` : ATTR_COL
      }),
    ].join(' '),
    [typeConfig, columnWidths, nameWidth],
  )

  // Keep the selected row in view (also fires right after expand reveals it).
  useEffect(() => {
    if (!selectedNodeId) return
    listRef.current
      ?.querySelector(`[data-node-id="${selectedNodeId}"]`)
      ?.scrollIntoView({ block: 'nearest' })
  }, [selectedNodeId, rows])

  // Keyboard navigation: ↑/↓ move the selection, ← collapses or goes to the
  // parent, → expands or steps into the first child, Home/End jump.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!rows.length) return
      if (e.ctrlKey || e.metaKey || e.altKey) return
      const el = document.activeElement as HTMLElement | null
      if (
        el &&
        (el.tagName === 'INPUT' ||
          el.tagName === 'TEXTAREA' ||
          el.tagName === 'SELECT' ||
          el.isContentEditable)
      ) {
        return
      }
      if (document.querySelector('[role="dialog"]')) return

      const idx = rows.findIndex((r) => r.id === selectedNodeId)

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault()
          selectNode(rows[Math.min(idx + 1, rows.length - 1)].id)
          break
        case 'ArrowUp':
          e.preventDefault()
          selectNode(rows[Math.max(idx - 1, 0)].id)
          break
        case 'Home':
          e.preventDefault()
          selectNode(rows[0].id)
          break
        case 'End':
          e.preventDefault()
          selectNode(rows[rows.length - 1].id)
          break
        case 'ArrowRight': {
          e.preventDefault()
          if (idx < 0) {
            selectNode(rows[0].id)
            break
          }
          const row = rows[idx]
          if (row.hasChildren && collapsedSet.has(row.id)) {
            toggleCollapse(row.id) // expand, revealing children below
          } else if (
            row.hasChildren &&
            idx + 1 < rows.length &&
            rows[idx + 1].depth > row.depth
          ) {
            selectNode(rows[idx + 1].id) // step into first visible child
          }
          break
        }
        case 'ArrowLeft': {
          e.preventDefault()
          if (idx < 0) {
            selectNode(rows[0].id)
            break
          }
          const row = rows[idx]
          if (row.hasChildren && !collapsedSet.has(row.id)) {
            toggleCollapse(row.id) // collapse
          } else if (row.node.parentId && row.node.parentId !== structure?.rootId) {
            selectNode(row.node.parentId)
          }
          break
        }
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [rows, selectedNodeId, collapsedIds, structure, selectNode, toggleCollapse])

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
      <div ref={listRef} className="min-h-0 flex-1 overflow-auto">
        {/* header */}
        <div
          className="sticky top-0 z-10 grid select-none items-center border-b border-slate-200 bg-slate-50 px-2 text-xs font-semibold uppercase tracking-wide text-slate-400"
          style={{ gridTemplateColumns: gridTemplate, height: 30 }}
        >
          <div className="relative min-w-0">
            <span className="block truncate pl-[68px] pr-1.5">{t('nameLabel')}</span>
            <ColGrip
              width={nameWidth ?? 400}
              min={220}
              max={800}
              title={t('colResizeHint')}
              onResize={(w) => setColumnWidth(NAME_KEY, w)}
              onReset={() => setColumnWidth(NAME_KEY, null)}
            />
          </div>
          {typeConfig.columns.map((col) => (
            <div key={col.key} className="relative min-w-0">
              <span className="block truncate px-1.5">{bl(col.label, lang)}</span>
              <ColGrip
                width={columnWidths[col.key] ?? 140}
                min={72}
                max={480}
                title={t('colResizeHint')}
                onResize={(w) => setColumnWidth(col.key, w)}
                onReset={() => setColumnWidth(col.key, null)}
              />
            </div>
          ))}
        </div>

        {rows.length === 0 ? (
          <EmptyState
            icon={<ListTree size={40} />}
            title={t('emptyTree')}
            action={
              <Button variant="primary" size="sm" onClick={() => addChildNode(structure.rootId)}>
                <Plus size={15} />
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
