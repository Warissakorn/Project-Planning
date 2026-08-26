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
  TrendingUp,
} from 'lucide-react'
import { useAppStore } from '../../state/store'
import { useStructureData } from '../../state/selectors'
import { hasSchedulingStructure } from '../../engine/validation'
import { useT, type CopyKey } from '../../lib/i18n'
import { cx } from '../../lib/cx'
import { Button } from '../ui/Button'
import { ConfirmDialog } from '../ui/Misc'

const VIEW_SEGMENTS = [
  { mode: 'tree', icon: Table2, titleKey: 'treeView' },
  { mode: 'gantt', icon: BarChart3, titleKey: 'ganttView' },
  { mode: 'reports', icon: TrendingUp, titleKey: 'reportsView' },
] as const

/** Action strip above the tree: add/indent/outdent/collapse + view toggle. */
export function TreeToolbar() {
  const t = useT()
  const { project, structure, typeConfig } = useStructureData()
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
  // The view switch is visible whenever the PROJECT can schedule (reports work
  // from any tab); only the gantt segment is gated on the active structure.
  const canReport = !!project && hasSchedulingStructure(project.structures)
  // With no selection, "add" targets the structure root (= a top-level row).
  const target = selectedNodeId ?? structure.rootId
  const hasSelection = !!selectedNodeId && selectedNodeId !== structure.rootId

  return (
    <div className="flex h-10 shrink-0 items-center gap-0.5 border-b border-slate-200 bg-white px-2">
      <Button size="sm" variant="outline" onClick={() => addChildNode(target)} title={t('addChild')}>
        <Plus size={15} />
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
        <IndentIncrease size={15} />
      </Button>
      <Button size="sm" disabled={!hasSelection} onClick={() => selectedNodeId && outdentAction(selectedNodeId)} title={t('outdent')}>
        <IndentDecrease size={15} />
      </Button>
      <div className="mx-1 h-5 w-px bg-slate-200" />
      <Button size="sm" onClick={() => collapseAll(structure.id)} title={t('collapseAll')}>
        <ChevronsDownUp size={15} />
      </Button>
      <Button size="sm" onClick={() => expandAll(structure.id)} title={t('expandAll')}>
        <ChevronsUpDown size={15} />
      </Button>

      <div className="ml-auto flex items-center gap-1">
        {hasSelection ? (
          <Button size="sm" onClick={() => setConfirmDelete(true)} title={t('delete')} className="hover:bg-red-50 hover:text-red-600">
            <Trash2 size={15} />
          </Button>
        ) : null}

        {canReport ? (
          <div className="flex items-center rounded-md border border-slate-300 p-0.5">
            {VIEW_SEGMENTS.map(({ mode, icon: Icon, titleKey }) => {
              const ganttBlocked = mode === 'gantt' && !canScheduling
              return (
                <button
                  key={mode}
                  type="button"
                  disabled={ganttBlocked}
                  onClick={() => setMode(mode)}
                  title={ganttBlocked ? t('ganttUnavailableHere') : t(titleKey as CopyKey)}
                  className={cx(
                    'inline-flex h-7 items-center gap-1 rounded px-2 text-xs font-medium',
                    viewMode === mode ? 'bg-indigo-600 text-white' : 'text-slate-500 hover:bg-slate-100',
                    ganttBlocked && 'cursor-not-allowed opacity-40 hover:bg-transparent',
                  )}
                >
                  <Icon size={14} />
                </button>
              )
            })}
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
