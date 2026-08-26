import { useState } from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { ChevronRight, Diamond, GripVertical } from 'lucide-react'
import type { ColumnDef, ID } from '../../model/types'
import type { FlatRow } from '../../engine/numbering'
import { effectiveValues, type RollupInfo } from '../../engine/rollup'
import type { Nodes } from '../../engine/treeOps'
import { useAppStore } from '../../state/store'
import { translate, useT } from '../../lib/i18n'
import { cx } from '../../lib/cx'
import { Input } from '../ui/Input'
import { EditableCell } from './EditableCell'

export const ROW_H = 32

const statusLabels = (lang: 'th' | 'en'): Record<string, string> => ({
  todo: translate(lang, 'status_todo'),
  in_progress: translate(lang, 'status_in_progress'),
  done: translate(lang, 'status_done'),
})

export interface DropHint {
  id: ID
  mode: 'before' | 'after' | 'inside'
}

/** One grid row: caret + code + name + per-type editable columns. */
export function TreeNodeRow({
  row,
  columns,
  nodes,
  rollups,
  collapsedSet,
  dropHint,
  gridTemplate,
  onToggle,
}: {
  row: FlatRow
  columns: ColumnDef[]
  nodes: Nodes
  rollups: Map<ID, RollupInfo>
  collapsedSet: Set<ID>
  dropHint: DropHint | null
  gridTemplate: string
  onToggle: (id: ID) => void
}) {
  const t = useT()
  const lang = useAppStore((s) => s.lang)
  const selected = useAppStore((s) => s.selectedNodeId === row.id)
  const selectNode = useAppStore.getState().selectNode
  const renameNode = useAppStore.getState().renameNode
  const updateNodeFields = useAppStore.getState().updateNodeFields
  const setNodeAttr = useAppStore.getState().setNodeAttr

  const { attributes, listeners, setNodeRef, setActivatorNodeRef, transform, isDragging } =
    useSortable({ id: row.id })

  const node = row.node
  const isBranch = row.hasChildren
  const eff = effectiveValues(nodes, row.id, rollups)
  const collapsed = collapsedSet.has(row.id)

  const [editingName, setEditingName] = useState(false)
  const [nameDraft, setNameDraft] = useState('')

  const commitField = (col: ColumnDef, v: number | string) => {
    if (col.stored === 'core') {
      // Core scheduling fields are first-class TreeNode keys.
      updateNodeFields(row.id, { [col.key]: v } as Partial<typeof node>)
    } else {
      setNodeAttr(row.id, col.key, typeof v === 'number' ? v : String(v))
    }
  }

  return (
    <div
      ref={setNodeRef}
      data-node-id={row.id}
      style={{
        gridTemplateColumns: gridTemplate,
        transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
        height: ROW_H,
      }}
      onClick={() => selectNode(row.id)}
      onDoubleClick={() => {
        if (!editingName) {
          setNameDraft(node.name)
          setEditingName(true)
        }
      }}
      className={cx(
        'relative grid items-stretch border-b border-slate-100 text-sm',
        selected ? 'bg-indigo-50/70' : 'hover:bg-slate-50',
        isDragging && 'z-20 opacity-40 shadow-lg',
        dropHint?.mode === 'inside' && 'bg-indigo-50 outline outline-2 -outline-offset-2 outline-indigo-500',
      )}
    >
      {dropHint?.mode === 'before' ? (
        <div className="absolute inset-x-0 top-0 z-10 h-0.5 bg-indigo-500" />
      ) : null}
      {dropHint?.mode === 'after' ? (
        <div className="absolute inset-x-0 bottom-0 z-10 h-0.5 bg-indigo-500" />
      ) : null}

      {/* --- Name cell -------------------------------------------------- */}
      <div className="flex min-w-0 items-center gap-1 pr-2" style={{ paddingLeft: row.depth * 16 + 4 }}>
        <button
          type="button"
          aria-label="expand/collapse"
          onClick={(e) => {
            e.stopPropagation()
            if (row.hasChildren) onToggle(row.id)
          }}
          className={cx('flex size-6 shrink-0 items-center justify-center rounded', row.hasChildren ? 'text-slate-400 hover:bg-slate-200 hover:text-slate-600' : 'invisible')}
        >
          <ChevronRight size={15} className={cx('transition-transform', !collapsed && 'rotate-90')} />
        </button>

        <span
          {...attributes}
          {...listeners}
          ref={setActivatorNodeRef}
          onClick={(e) => e.stopPropagation()}
          title="drag"
          className="flex h-full w-5 cursor-grab touch-none items-center justify-center text-slate-300 hover:text-slate-500 active:cursor-grabbing"
        >
          <GripVertical size={14} />
        </span>

        {row.code ? (
          <span className="shrink-0 font-mono text-[11px] tabular-nums text-slate-400">{row.code}</span>
        ) : null}
        {node.isMilestone ? <Diamond size={11} className="shrink-0 fill-amber-400 text-amber-500" /> : null}

        {editingName ? (
          <Input
            autoFocus
            className="h-7 px-1 py-0 text-[13px]"
            value={nameDraft}
            onClick={(e) => e.stopPropagation()}
            onChange={(e) => setNameDraft(e.target.value)}
            onBlur={() => {
              if (nameDraft.trim()) renameNode(row.id, nameDraft)
              setEditingName(false)
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') (e.target as HTMLInputElement).blur()
              if (e.key === 'Escape') setEditingName(false)
              e.stopPropagation()
            }}
          />
        ) : (
          <span className={cx('truncate text-[13px]', node.name === '' && 'italic text-slate-300')}>
            {node.name === '' ? t('untitled') : node.name}
          </span>
        )}
      </div>

      {/* --- Attribute columns ------------------------------------------ */}
      {columns.map((col) => {
        const coreDerived = col.stored === 'core' && isBranch
        let value: string | number | boolean | null | undefined
        if (col.stored === 'core') value = (eff.values as Record<string, unknown>)[col.key] as never
        else value = node.attrs?.[col.key]

        if (col.key === 'status' && col.stored === 'core') {
          return (
            <div key={col.key} className="flex items-center overflow-hidden px-1">
              <EditableCell
                kind="select"
                value={eff.values.status}
                options={col.options}
                optionLabels={statusLabels(lang)}
                derived={isBranch}
                onCommit={(v) => commitField(col, v)}
              />
            </div>
          )
        }

        return (
          <div
            key={col.key}
            className={cx(
              'flex items-center overflow-hidden px-1',
              (col.kind === 'number' || col.kind === 'currency' || col.kind === 'percent') && 'justify-end',
            )}
          >
            <EditableCell
              kind={col.kind}
              value={value}
              options={col.options}
              derived={coreDerived}
              align={col.kind === 'text' || col.kind === 'date' ? 'left' : 'right'}
              onCommit={coreDerived ? undefined : (v) => commitField(col, v)}
            />
          </div>
        )
      })}

    </div>
  )
}
