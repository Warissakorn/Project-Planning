import { useState } from 'react'
import {
  BarChart3,
  ChevronsDownUp,
  ChevronsUpDown,
  IndentDecrease,
  IndentIncrease,
  Plus,
  Table2,
  Trash2,
} from 'lucide-react'
import { useAppStore } from '../../state/store'
import { useStructureData } from '../../state/selectors'
import { useT } from '../../lib/i18n'
import { cx } from '../../lib/cx'
import { Button } from '../ui/Button'
import { ConfirmDialog } from '../ui/Misc'

/** Action strip above the tree: add/indent/outdent/collapse + view toggle. */
export function TreeToolbar() {
  const t = useT()
  const { structure, typeConfig } = useStructureData()
  const selectedNodeId = useAppStore((s) => s.selectedNodeId)
  const viewMode = useAppStore((s) => s.viewMode)
  const {
    addChildNode,
    addSiblingNode,
    indentAction,
    outdentAction,
    collapseAll,
    expandAll,
    deleteNodes,
    selectNode,
    setMode,
  } = useAppStore.getState()

  const [confirmDelete, setConfirmDelete] = useState(false)
  if (!structure || !typeConfig) return null

  const canScheduling = typeConfig.capabilities.scheduling
  // With no selection, "add" targets the structure root (= a top-level row).
  const target = selectedNodeId ?? structure.rootId
  const hasSelection = !!selectedNodeId && selectedNodeId !== structure.rootId

  return (
    <div className="flex h-10 shrink-0 items-center gap-0.5 border-b border-slate-200 bg-white px-2">
      <Button size="sm" variant="outline" onClick={() => addChildNode(target)} title={t('addChild')}>
        <Plus size={14} />
        <span className="hidden sm:inline">{t('addChild')}</span>
      </Button>
      <Button
        size="sm"
        disabled={!hasSelection}
        onClick={() => selectedNodeId && addSiblingNode(selectedNodeId)}
        title={t('addSibling')}
      >
        <span className="hidden sm:inline">{t('addSibling')}</span>
      </Button>
      <div className="mx-1 h-5 w-px bg-slate-200" />
      <Button size="sm" disabled={!hasSelection} onClick={() => selectedNodeId && indentAction(selectedNodeId)} title={t('indent')}>
        <IndentIncrease size={14} />
      </Button>
      <Button size="sm" disabled={!hasSelection} onClick={() => selectedNodeId && outdentAction(selectedNodeId)} title={t('outdent')}>
        <IndentDecrease size={14} />
      </Button>
      <div className="mx-1 h-5 w-px bg-slate-200" />
      <Button size="sm" onClick={() => collapseAll(structure.id)} title={t('collapseAll')}>
        <ChevronsDownUp size={14} />
      </Button>
      <Button size="sm" onClick={() => expandAll(structure.id)} title={t('expandAll')}>
        <ChevronsUpDown size={14} />
      </Button>

      <div className="ml-auto flex items-center gap-1">
        {hasSelection ? (
          <Button size="sm" onClick={() => setConfirmDelete(true)} title={t('delete')} className="hover:bg-red-50 hover:text-red-600">
            <Trash2 size={14} />
          </Button>
        ) : null}

        {canScheduling ? (
          <div className="flex items-center rounded-md border border-slate-300 p-0.5">
            {(['tree', 'gantt'] as const).map((mode) => (
              <button
                key={mode}
                type="button"
                onClick={() => setMode(mode)}
                title={mode === 'tree' ? t('treeView') : t('ganttView')}
                className={cx(
                  'inline-flex h-6 items-center gap-1 rounded px-2 text-xs font-medium',
                  viewMode === mode ? 'bg-indigo-600 text-white' : 'text-slate-500 hover:bg-slate-100',
                )}
              >
                {mode === 'tree' ? <Table2 size={13} /> : <BarChart3 size={13} />}
              </button>
            ))}
          </div>
        ) : null}
      </div>

      <ConfirmDialog
        open={confirmDelete}
        title={t('confirmDeleteTitle')}
        confirmLabel={t('delete')}
        cancelLabel={t('cancel')}
        onCancel={() => setConfirmDelete(false)}
        onConfirm={() => {
          if (selectedNodeId) deleteNodes([selectedNodeId])
          setConfirmDelete(false)
          selectNode(null)
        }}
      />
    </div>
  )
}
