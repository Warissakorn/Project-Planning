import { useNavigate } from 'react-router-dom'
import { ArrowLeft, FileJson, FileSpreadsheet, Redo2, Undo2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useAppStore } from '../../state/store'
import { useActiveStructure } from '../../state/selectors'
import { useT } from '../../lib/i18n'
import { projectToCsv, projectToJson } from '../../lib/exporters'
import { downloadFile, safeFilename } from '../../lib/jsonFile'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import { DropdownMenu, MenuItem } from '../ui/DropdownMenu'
import { LangToggle } from './LangToggle'

/**
 * Workspace header: back navigation, inline-editable project name,
 * undo/redo, export menu, language switch.
 */
export function AppHeader() {
  const t = useT()
  const navigate = useNavigate()
  const project = useAppStore((s) =>
    s.activeProjectId ? (s.projects[s.activeProjectId] ?? null) : null,
  )
  const structure = useActiveStructure()
  const canUndo = useAppStore((s) => s.historyPast.length > 0)
  const canRedo = useAppStore((s) => s.historyFuture.length > 0)
  const undo = useAppStore((s) => s.undo)
  const redo = useAppStore((s) => s.redo)
  const renameProject = useAppStore((s) => s.renameProject)

  const [editingName, setEditingName] = useState(false)
  const [nameDraft, setNameDraft] = useState('')

  // Reset the inline editor whenever we land on a different project.
  useEffect(() => {
    setEditingName(false)
  }, [project?.id])

  if (!project) return null

  const base = safeFilename(project.name)
  const exportJson = () =>
    downloadFile(`${base}.json`, 'application/json', projectToJson(project))
  const exportCsv = () => {
    if (!structure) return
    downloadFile(
      `${base} - ${safeFilename(structure.name)}.csv`,
      'text/csv;charset=utf-8',
      projectToCsv(project, structure),
    )
  }

  return (
    <header className="flex h-12 shrink-0 items-center gap-2 border-b border-slate-200 bg-white px-3">
      <Button size="sm" onClick={() => navigate('/')} title={t('backToProjects')}>
        <ArrowLeft size={16} />
      </Button>

      {editingName ? (
        <Input
          autoFocus
          className="max-w-xs"
          value={nameDraft}
          onChange={(e) => setNameDraft(e.target.value)}
          onBlur={() => {
            if (nameDraft.trim()) renameProject(project.id, nameDraft)
            setEditingName(false)
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') (e.target as HTMLInputElement).blur()
            if (e.key === 'Escape') setEditingName(false)
          }}
        />
      ) : (
        <button
          type="button"
          className="truncate rounded px-1.5 py-1 text-sm font-semibold text-slate-800 hover:bg-slate-100"
          title={t('rename')}
          onClick={() => {
            setNameDraft(project.name)
            setEditingName(true)
          }}
        >
          {project.name}
        </button>
      )}

      <div className="ml-auto flex items-center gap-1">
        <Button size="sm" disabled={!canUndo} onClick={undo} title={`${t('undo')} (Ctrl+Z)`}>
          <Undo2 size={15} />
        </Button>
        <Button size="sm" disabled={!canRedo} onClick={redo} title={`${t('redo')} (Ctrl+Y)`}>
          <Redo2 size={15} />
        </Button>
        <DropdownMenu
          className="mx-0.5"
          triggerClassName="inline-flex h-7 items-center justify-center gap-1 rounded-md border border-slate-300 bg-white px-2 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-50"
          button={t('exportMenu')}
        >
          {(close) => (
            <>
              <MenuItem
                icon={<FileJson size={15} />}
                label={t('exportJson')}
                onClick={() => {
                  close()
                  exportJson()
                }}
              />
              <MenuItem
                icon={<FileSpreadsheet size={15} />}
                label={t('exportCsv')}
                onClick={() => {
                  close()
                  exportCsv()
                }}
              />
            </>
          )}
        </DropdownMenu>
        <div className="mx-1 h-5 w-px bg-slate-200" />
        <LangToggle />
      </div>
    </header>
  )
}
