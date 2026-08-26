import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import type { ChangeEvent } from 'react'
import {
  CircleHelp,
  Copy,
  FileUp,
  FolderKanban,
  LayoutTemplate,
  Lightbulb,
  Pencil,
  Plus,
  Trash2,
} from 'lucide-react'
import { SAMPLE_PROJECTS } from '../model/samples'
import type { TemplateEntry } from '../model/templates'
import type { ID } from '../model/types'
import { useAppStore, storageUsageBytes } from '../state/store'
import { translate, useT } from '../lib/i18n'
import { importErrorMessage, parseImportedProject } from '../lib/jsonFile'
import { Button } from '../components/ui/Button'
import { Field, Input } from '../components/ui/Input'
import { Modal } from '../components/ui/Modal'
import { ConfirmDialog, EmptyState } from '../components/ui/Misc'
import { UserGuideOverlay } from '../components/help/UserGuideOverlay'
import { TemplatePickerModal } from '../components/projects/TemplatePickerModal'
import { LangToggle } from '../components/layout/LangToggle'

const fmtKB = (bytes: number) => `${Math.max(1, Math.round(bytes / 1024))} KB`

/** Landing screen: saved projects as cards + create / rename / duplicate / delete. */
export function ProjectListPage() {
  const t = useT()
  const lang = useAppStore((s) => s.lang)
  const navigate = useNavigate()
  const projects = useAppStore((s) => s.projects)
  const order = useAppStore((s) => s.projectOrder)
  const {
    createProject,
    renameProject,
    duplicateProjectById,
    deleteProject,
    addImportedProject,
  } = useAppStore.getState()

  const [newName, setNewName] = useState('')
  const [renamingId, setRenamingId] = useState<ID | null>(null)
  const [renameDraft, setRenameDraft] = useState('')
  const [deletingId, setDeletingId] = useState<ID | null>(null)
  const [importErrorKey, setImportErrorKey] =
    useState<'invalid-json' | 'invalid-format' | 'newer-version' | null>(null)
  const [helpOpen, setHelpOpen] = useState(false)
  const [templatePickerOpen, setTemplatePickerOpen] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const create = () => {
    const id = createProject(newName)
    setNewName('')
    navigate(`/project/${id}`)
  }

  // Read the picked backup file; on success jump straight into the workspace.
  const onImportFile = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = '' // allow re-picking the same file after a fix
    if (!file) return
    try {
      const project = parseImportedProject(await file.text())
      const id = addImportedProject(project)
      navigate(`/project/${id}`)
    } catch (err) {
      setImportErrorKey(importErrorMessage(err))
    }
  }

  const bytes = storageUsageBytes()
  const deleting = deletingId ? projects[deletingId] : null
  const errorCopy: Record<string, string> = {
    'invalid-json': t('importErrInvalidJson'),
    'invalid-format': t('importErrInvalidFormat'),
    'newer-version': t('importErrNewerVersion'),
  }

  // Samples use fixed ids, so re-clicking never duplicates them.
  const allSamplesLoaded = SAMPLE_PROJECTS.every((s) => !!projects[s.id])
  const loadSamples = () => {
    for (const sample of SAMPLE_PROJECTS) {
      if (!projects[sample.id]) addImportedProject(sample.build(lang))
    }
  }

  // Templates carry no fixed id — each pick creates a brand-new project.
  const createFromTemplate = (entry: TemplateEntry) => {
    const id = addImportedProject(entry.build(lang))
    navigate(`/project/${id}`)
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-5xl p-6">
        <header className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-slate-800">{t('appName')}</h1>
          <div className="flex items-center gap-1.5">
            <Button variant="ghost" size="sm" onClick={() => setHelpOpen(true)} title={t('helpTitle')}>
              <CircleHelp size={16} />
            </Button>
            <LangToggle />
          </div>
        </header>

        {/* --- new project / import ----------------------------------------- */}
        <div className="mt-6 rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
          <div className="flex gap-2">
            <Input
              value={newName}
              placeholder={t('projectNamePlaceholder')}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') create()
              }}
            />
            <Button variant="primary" onClick={create} className="shrink-0">
              <Plus size={15} />
              {t('newProject')}
            </Button>
            <Button
              variant="outline"
              onClick={() => setTemplatePickerOpen(true)}
              title={t('createFromTemplate')}
              className="shrink-0"
            >
              <LayoutTemplate size={15} />
              {t('createFromTemplate')}
            </Button>
            <Button
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              title={t('importJson')}
              className="shrink-0"
            >
              <FileUp size={15} />
              {t('importJson')}
            </Button>
            <Button
              variant="ghost"
              disabled={allSamplesLoaded}
              onClick={loadSamples}
              title={t('loadSamples')}
              className="shrink-0"
            >
              <Lightbulb size={15} />
              {t('loadSamples')}
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json,application/json"
              className="hidden"
              onChange={onImportFile}
            />
          </div>
          {importErrorKey ? (
            <p className="mt-2 rounded-lg bg-red-50 px-3 py-1.5 text-xs text-red-600">
              {errorCopy[importErrorKey]}
            </p>
          ) : null}
        </div>

        {/* --- cards -------------------------------------------------------- */}
        {order.length === 0 ? (
          <EmptyState
            icon={<FolderKanban size={44} />}
            title={t('noProjects')}
          />
        ) : (
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {order.map((id) => {
              const p = projects[id]
              if (!p) return null
              const taskCount = Object.values(p.nodes).filter((n) => n.parentId !== null).length
              return (
                <div
                  key={id}
                  role="button"
                  tabIndex={0}
                  onClick={() => navigate(`/project/${id}`)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') navigate(`/project/${id}`)
                  }}
                  className="group cursor-pointer rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md"
                >
                  <div className="flex items-start justify-between gap-2">
                    <h2 className="min-w-0 flex-1 truncate font-semibold text-slate-800">
                      {p.name}
                    </h2>
                    {/* Touch has no hover: keep the actions dimmed-but-visible below sm. */}
                    <div className="flex shrink-0 gap-0.5 opacity-100 transition-opacity sm:opacity-0 sm:group-hover:opacity-100 sm:focus-within:opacity-100">
                      <button
                        type="button"
                        aria-label={t('rename')}
                        title={t('rename')}
                        onClick={(e) => {
                          e.stopPropagation()
                          setRenamingId(id)
                          setRenameDraft(p.name)
                        }}
                        className="flex h-7 w-7 items-center justify-center rounded text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                      >
                        <Pencil size={15} />
                      </button>
                      <button
                        type="button"
                        aria-label={t('duplicate')}
                        title={t('duplicate')}
                        onClick={(e) => {
                          e.stopPropagation()
                          duplicateProjectById(id)
                        }}
                        className="flex h-7 w-7 items-center justify-center rounded text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                      >
                        <Copy size={15} />
                      </button>
                      <button
                        type="button"
                        aria-label={t('delete')}
                        title={t('delete')}
                        onClick={(e) => {
                          e.stopPropagation()
                          setDeletingId(id)
                        }}
                        className="flex h-7 w-7 items-center justify-center rounded text-slate-400 hover:bg-red-50 hover:text-red-500"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                  <p className="mt-2 text-xs text-slate-500">
                    {translate(lang, 'structuresCount', { n: p.structures.length })}
                    {' · '}
                    {translate(lang, 'tasksCount', { n: taskCount })}
                  </p>
                  <p className="mt-0.5 text-xs text-slate-400">
                    {t('updatedLabel')}{' '}
                    {new Date(p.updatedAt).toLocaleDateString(lang === 'th' ? 'th-TH' : 'en-US')}
                  </p>
                </div>
              )
            })}
          </div>
        )}

        <p className={`mt-8 text-center text-xs ${bytes > 4_000_000 ? 'text-red-500' : 'text-slate-400'}`}>
          {bytes > 4_000_000 ? `${t('storageWarning')} — ` : ''}
          {translate(lang, 'storageUsage', { size: fmtKB(bytes) })}
        </p>
      </div>

      {/* --- rename modal ---------------------------------------------------- */}
      <Modal
        open={renamingId !== null}
        title={t('rename')}
        onClose={() => setRenamingId(null)}
        width="max-w-sm"
      >
        <Field label={t('projectNameLabel')}>
          <Input
            autoFocus
            value={renameDraft}
            onChange={(e) => setRenameDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && renamingId && renameDraft.trim()) {
                renameProject(renamingId, renameDraft)
                setRenamingId(null)
              }
            }}
          />
        </Field>
        <div className="mt-4 flex justify-end gap-2">
          <Button variant="outline" onClick={() => setRenamingId(null)}>
            {t('cancel')}
          </Button>
          <Button
            variant="primary"
            disabled={!renameDraft.trim()}
            onClick={() => {
              if (renamingId) renameProject(renamingId, renameDraft)
              setRenamingId(null)
            }}
          >
            {t('save')}
          </Button>
        </div>
      </Modal>

      {/* --- delete confirm ---------------------------------------------------- */}
      <ConfirmDialog
        open={deletingId !== null}
        title={t('confirmDeleteTitle')}
        message={
          deleting ? translate(lang, 'confirmDeleteText', { name: deleting.name }) : undefined
        }
        confirmLabel={t('delete')}
        cancelLabel={t('cancel')}
        onCancel={() => setDeletingId(null)}
        onConfirm={() => {
          if (deletingId) deleteProject(deletingId)
          setDeletingId(null)
        }}
      />

      <UserGuideOverlay open={helpOpen} onClose={() => setHelpOpen(false)} />

      {/* --- template picker ------------------------------------------------ */}
      <TemplatePickerModal
        open={templatePickerOpen}
        onClose={() => setTemplatePickerOpen(false)}
        onPick={createFromTemplate}
      />
    </div>
  )
}
