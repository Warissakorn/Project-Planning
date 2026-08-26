import { useState } from 'react'
import { Plus, X } from 'lucide-react'
import { STRUCTURE_TYPE_PRESETS } from '../../model/structureTypes'
import { useAppStore } from '../../state/store'
import { useStructureData } from '../../state/selectors'
import { bl, translate, useT } from '../../lib/i18n'
import { cx } from '../../lib/cx'
import { ConfirmDialog } from '../ui/Misc'
import { Input } from '../ui/Input'
import { dotFor } from './typeColors'

/** Tabs across the workspace: one per breakdown structure instance. */
export function StructureTabs() {
  const t = useT()
  const lang = useAppStore((s) => s.lang)
  const { project, structure } = useStructureData()
  const setActiveStructure = useAppStore((s) => s.setActiveStructure)
  const addStructureOfType = useAppStore((s) => s.addStructureOfType)
  const renameStructure = useAppStore((s) => s.renameStructure)
  const deleteStructureById = useAppStore((s) => s.deleteStructureById)

  const [menuOpen, setMenuOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [draft, setDraft] = useState('')
  const [confirmDelete, setConfirmDelete] = useState(false)

  if (!project || !structure) return null

  return (
    <div className="relative flex shrink-0 items-end border-b border-slate-200 bg-white px-2 pt-1">
      <div role="tablist" className="flex items-end gap-0.5 overflow-x-auto">
        {project.structures.map((s) => {
          const active = s.id === structure.id
          return (
            <div
              key={s.id}
              role="tab"
              aria-selected={active}
              onClick={() => setActiveStructure(s.id)}
              onDoubleClick={() => {
                setEditingId(s.id)
                setDraft(s.name)
              }}
              className={cx(
                'group flex cursor-pointer select-none items-center gap-1.5 whitespace-nowrap rounded-t-md px-3 py-2 text-sm',
                active
                  ? 'bg-slate-100 font-semibold text-slate-800'
                  : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700',
              )}
            >
              <span className={cx('size-2 shrink-0 rounded-full', dotFor(s.typeId))} />
              {editingId === s.id ? (
                <Input
                  autoFocus
                  className="h-7 w-32 px-1 py-0 text-sm"
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  onBlur={() => {
                    if (draft.trim()) renameStructure(s.id, draft)
                    setEditingId(null)
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') (e.target as HTMLInputElement).blur()
                    if (e.key === 'Escape') setEditingId(null)
                  }}
                  onClick={(e) => e.stopPropagation()}
                />
              ) : (
                <span>{s.name}</span>
              )}
              {active && project.structures.length > 1 ? (
                <button
                  type="button"
                  aria-label={t('delete')}
                  className="ml-0.5 flex h-6 w-6 items-center justify-center rounded text-slate-400 hover:bg-red-50 hover:text-red-600"
                  onClick={(e) => {
                    e.stopPropagation()
                    setConfirmDelete(true)
                  }}
                >
                  <X size={14} />
                </button>
              ) : null}
            </div>
          )
        })}
      </div>

      <div className="relative pb-1.5 pl-2">
        <button
          type="button"
          onClick={() => setMenuOpen((v) => !v)}
          className="inline-flex h-8 items-center gap-1.5 rounded-md px-2.5 text-[13px] font-medium text-slate-500 hover:bg-slate-100 hover:text-slate-700"
        >
          <Plus size={15} />
          {t('addStructure')}
        </button>
        {menuOpen ? (
          <>
            <div className="fixed inset-0 z-30" onClick={() => setMenuOpen(false)} />
            <div className="absolute left-2 top-full z-40 mt-1 w-60 overflow-hidden rounded-lg border border-slate-200 bg-white py-1 shadow-lg">
              {STRUCTURE_TYPE_PRESETS.map((preset) => (
                <button
                  key={preset.id}
                  type="button"
                  className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-slate-700 hover:bg-indigo-50"
                  onClick={() => {
                    addStructureOfType(preset.id)
                    setMenuOpen(false)
                  }}
                >
                  <span className={cx('size-2 shrink-0 rounded-full', dotFor(preset.id))} />
                  <span className="flex-1">{bl(preset.label, lang)}</span>
                  <span className="text-xs text-slate-400">{translate(lang, 'add')}</span>
                </button>
              ))}
            </div>
          </>
        ) : null}
      </div>

      <ConfirmDialog
        open={confirmDelete}
        title={t('confirmDeleteTitle')}
        message={t('deleteStructureConfirm')}
        confirmLabel={t('delete')}
        cancelLabel={t('cancel')}
        onCancel={() => setConfirmDelete(false)}
        onConfirm={() => {
          deleteStructureById(structure.id)
          setConfirmDelete(false)
        }}
      />
    </div>
  )
}
