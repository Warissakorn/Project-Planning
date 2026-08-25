import { useState } from 'react'
import {
  ArrowDown,
  ArrowUp,
  CalendarClock,
  Link2,
  MousePointerClick,
  Plus,
  Trash2,
} from 'lucide-react'
import type { DependencyType, ID, Project, TaskStatus } from '../../model/types'
import { getStructureTypeOrFallback } from '../../model/structureTypes'
import { collectRollups, leafInfo, type RollupInfo } from '../../engine/rollup'
import { dependenciesOf, DEP_ERROR_KEY, schedulableLeafIds } from '../../engine/validation'
import { formatDate } from '../../lib/date'
import { translate, useT, type CopyKey } from '../../lib/i18n'
import { useAppStore } from '../../state/store'
import { Button } from '../ui/Button'
import { Field, Input, Select, Textarea } from '../ui/Input'
import { EmptyState, StatusBadge } from '../ui/Misc'
import { LinkPanel, nodeLabel } from '../links/LinkPanel'
import { ItemPickerModal } from '../links/ItemPickerModal'

const DEP_TYPES: DependencyType[] = ['FS', 'SS', 'FF', 'SF']

/** Local-state text field committing on blur/Enter — avoids per-keystroke undo entries. */
function CommitField({
  value,
  onCommit,
  ...rest
}: {
  value: string
  onCommit: (v: string) => void
} & Omit<React.InputHTMLAttributes<HTMLInputElement>, 'value' | 'onChange' | 'defaultValue'>) {
  const [draft, setDraft] = useState(value)
  return (
    <Input
      {...rest}
      value={draft}
      onChange={(e) => setDraft(e.target.value)}
      onBlur={() => onCommit(draft)}
      onKeyDown={(e) => {
        if (e.key === 'Enter') (e.target as HTMLInputElement).blur()
      }}
    />
  )
}

function derivedOf(project: Project, nodeId: ID): RollupInfo {
  // Roll up just this subtree; cheap at planning scale and always fresh.
  return collectRollups(project.nodes, nodeId).get(nodeId) ?? {}
}

const STATUS_KEY: Record<TaskStatus, CopyKey> = {
  todo: 'status_todo',
  in_progress: 'status_in_progress',
  done: 'status_done',
}

/** Right-hand details panel for the selected node. */
export function NodeInspector() {
  const t = useT()
  const lang = useAppStore((s) => s.lang)
  const project = useAppStore((s) =>
    s.activeProjectId ? (s.projects[s.activeProjectId] ?? null) : null,
  )
  const selectedNodeId = useAppStore((s) => s.selectedNodeId)

  const {
    renameNode,
    updateNodeFields,
    setNodeAttr,
    addDependencyAction,
    updateDependencyAction,
    removeDependencyAction,
  } = useAppStore.getState()

  const [depError, setDepError] = useState<string | null>(null)
  const [depPickerOpen, setDepPickerOpen] = useState(false)

  if (!project || !selectedNodeId) {
    return (
      <aside className="hidden w-72 shrink-0 border-l border-slate-200 bg-white lg:block">
        <EmptyState icon={<MousePointerClick size={36} />} title={t('details')} />
      </aside>
    )
  }
  const node = project.nodes[selectedNodeId]
  if (!node) return null

  const structure = project.structures.find((s) => s.id === node.structureId)
  const cfg = getStructureTypeOrFallback(structure?.typeId ?? '')
  const isLeafRow = node.childIds.length === 0
  const values = isLeafRow ? leafInfo(node) : derivedOf(project, node.id)

  const deps = dependenciesOf(project.dependencies, node.id)

  const depCandidates = () =>
    schedulableLeafIds(project.nodes, project.structures)
      .filter((id) => id !== node.id && project.nodes[id]?.structureId === node.structureId)
      .map((id) => ({ id, label: nodeLabel(project, id) }))

  const addDep = (predecessorId: string) => {
    const err = addDependencyAction(predecessorId, node.id, 'FS', 0)
    setDepError(err ? translate(lang, DEP_ERROR_KEY[err] as CopyKey) : null)
  }

  const attrColumns = cfg.columns.filter((c) => c.stored === 'attrs')

  return (
    <aside className="w-80 shrink-0 overflow-y-auto border-l border-slate-200 bg-white">
      <div className="space-y-4 p-3">
        {/* --- Identity --------------------------------------------------- */}
        <section className="space-y-2">
          <h3 className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-slate-400">
            <CalendarClock size={12} />
            {t('details')}
          </h3>
          <Field label={t('nameLabel')}>
            <CommitField
              key={`name-${node.id}`}
              value={node.name}
              onCommit={(v) => v.trim() && renameNode(node.id, v)}
            />
          </Field>
          <Field label={t('notes')}>
            <Textarea
              rows={2}
              value={node.notes ?? ''}
              onChange={(e) => updateNodeFields(node.id, { notes: e.target.value })}
            />
          </Field>
        </section>

        {/* --- Scheduling -------------------------------------------------- */}
        {cfg.capabilities.scheduling ? (
          <section className="space-y-2 rounded-lg border border-slate-200 p-2">
            {isLeafRow ? (
              <>
                <div className="grid grid-cols-2 gap-2">
                  <Field label={t('startDateField')}>
                    <Input
                      type="date"
                      value={node.startDate ?? ''}
                      onChange={(e) =>
                        updateNodeFields(node.id, { startDate: e.target.value || undefined })
                      }
                    />
                  </Field>
                  <Field label={t('durationField')}>
                    <Input
                      type="number"
                      min={0}
                      disabled={node.isMilestone}
                      value={node.durationDays ?? ''}
                      onChange={(e) => {
                        const n = parseInt(e.target.value, 10)
                        updateNodeFields(node.id, {
                          durationDays: Number.isNaN(n) ? undefined : Math.max(0, n),
                        })
                      }}
                    />
                  </Field>
                </div>
                <label className="flex items-center gap-2 text-xs text-slate-600">
                  <input
                    type="checkbox"
                    className="accent-indigo-600"
                    checked={node.isMilestone ?? false}
                    onChange={(e) => updateNodeFields(node.id, { isMilestone: e.target.checked })}
                  />
                  {t('milestoneField')}
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <Field label={t('progressField')}>
                    <Input
                      type="number"
                      min={0}
                      max={100}
                      value={node.progress ?? ''}
                      onChange={(e) => {
                        const n = parseFloat(e.target.value)
                        updateNodeFields(node.id, {
                          progress: Number.isNaN(n) ? undefined : Math.max(0, Math.min(100, n)),
                        })
                      }}
                    />
                  </Field>
                  <Field label={t('statusField')}>
                    <Select
                      value={node.status ?? ''}
                      onChange={(e) =>
                        updateNodeFields(node.id, {
                          status: (e.target.value || undefined) as TaskStatus | undefined,
                        })
                      }
                    >
                      <option value=""></option>
                      <option value="todo">{t('status_todo')}</option>
                      <option value="in_progress">{t('status_in_progress')}</option>
                      <option value="done">{t('status_done')}</option>
                    </Select>
                  </Field>
                </div>
              </>
            ) : (
              <div className="grid grid-cols-2 gap-x-2 gap-y-1.5 text-xs">
                <span className="col-span-2 text-[11px] italic text-slate-400">{t('derivedHint')}</span>
                <Derived label={t('startDateField')} v={formatDate(values.startDate, lang)} />
                <Derived label={t('durationField')} v={values.durationDays?.toLocaleString()} />
                <Derived
                  label={t('progressField')}
                  v={values.progress !== undefined ? `${values.progress}%` : undefined}
                  badge={values.status ? <StatusBadge status={values.status} label={t(STATUS_KEY[values.status])} /> : undefined}
                />
                <Derived label={t('costField')} v={values.cost?.toLocaleString()} />
              </div>
            )}
          </section>
        ) : null}

        {/* --- Cost (leaf of a costing structure) --------------------------- */}
        {cfg.capabilities.costing && isLeafRow ? (
          <Field label={t('costField')}>
            <Input
              type="number"
              min={0}
              step="any"
              value={node.cost ?? ''}
              onChange={(e) => {
                const n = parseFloat(e.target.value)
                updateNodeFields(node.id, { cost: Number.isNaN(n) ? undefined : n })
              }}
            />
          </Field>
        ) : null}

        {/* --- Type-specific attrs ------------------------------------------ */}
        {attrColumns.length > 0 ? (
          <section className="space-y-2">
            {attrColumns.map((col) => (
              <Field key={col.key} label={col.label[lang]}>
                {col.kind === 'select' ? (
                  <Select
                    value={String(node.attrs?.[col.key] ?? '')}
                    onChange={(e) => setNodeAttr(node.id, col.key, e.target.value)}
                  >
                    <option value=""></option>
                    {(col.options ?? []).map((o) => (
                      <option key={o} value={o}>
                        {o}
                      </option>
                    ))}
                  </Select>
                ) : (
                  <Input
                    type={
                      col.kind === 'date'
                        ? 'date'
                        : col.kind === 'text'
                          ? 'text'
                          : 'number'
                    }
                    step="any"
                    value={String(node.attrs?.[col.key] ?? '')}
                    onChange={(e) => {
                      const raw = e.target.value
                      const numeric = col.kind !== 'text' && col.kind !== 'date' && raw !== ''
                      setNodeAttr(node.id, col.key, numeric ? Number(raw) : raw)
                    }}
                  />
                )}
              </Field>
            ))}
          </section>
        ) : null}

        {/* --- Dependencies --------------------------------------------------- */}
        {cfg.capabilities.scheduling && isLeafRow ? (
          <section className="rounded-lg border border-slate-200 p-2">
            <div className="mb-1 flex items-center justify-between">
              <span className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-600">
                <Link2 size={13} className="text-indigo-500" />
                {t('dependencies')}
              </span>
              <Button size="sm" onClick={() => setDepPickerOpen(true)}>
                <Plus size={13} />
                {t('add')}
              </Button>
            </div>

            {deps.length === 0 ? (
              <p className="px-0.5 py-1 text-[11px] text-slate-400">{t('noDependencies')}</p>
            ) : (
              <ul className="space-y-1">
                {deps.map(({ dep, direction }) => {
                  const otherId = direction === 'predecessor' ? dep.fromNodeId : dep.toNodeId
                  return (
                    <li key={dep.id} className="rounded-md bg-slate-50 p-1.5">
                      <div className="flex items-center gap-1">
                        {direction === 'predecessor' ? (
                          <ArrowUp size={12} className="shrink-0 rotate-45 text-emerald-500" />
                        ) : (
                          <ArrowDown size={12} className="shrink-0 -rotate-45 text-orange-400" />
                        )}
                        <span
                          className="min-w-0 flex-1 truncate text-[12px] text-slate-700"
                          title={nodeLabel(project, otherId)}
                        >
                          {nodeLabel(project, otherId)}
                        </span>
                        <button
                          type="button"
                          aria-label={t('delete')}
                          onClick={() => removeDependencyAction(dep.id)}
                          className="rounded p-1 text-slate-300 hover:bg-red-50 hover:text-red-500"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                      <div className="mt-1 flex gap-1">
                        <Select
                          className="h-6 flex-1 px-1 py-0 text-[11px]"
                          value={dep.type}
                          onChange={(e) =>
                            updateDependencyAction(dep.id, { type: e.target.value as DependencyType })
                          }
                        >
                          {DEP_TYPES.map((dt) => (
                            <option key={dt} value={dt}>
                              {translate(lang, `dep_${dt}` as CopyKey)}
                            </option>
                          ))}
                        </Select>
                        <Input
                          type="number"
                          className="h-6 w-16 px-1 py-0 text-[11px]"
                          title={t('lagDaysLabel')}
                          value={dep.lagDays}
                          onChange={(e) => {
                            const n = parseInt(e.target.value, 10)
                            updateDependencyAction(dep.id, { lagDays: Number.isNaN(n) ? 0 : n })
                          }}
                        />
                      </div>
                    </li>
                  )
                })}
              </ul>
            )}
            {depError ? <p className="mt-1 text-[11px] text-red-500">{depError}</p> : null}
          </section>
        ) : null}

        {/* --- Cross-links ------------------------------------------------------- */}
        <LinkPanel nodeId={node.id} />
      </div>

      <ItemPickerModal
        open={depPickerOpen}
        title={`${t('addDependency')} — ${t('predecessorLabel')}`}
        items={depCandidates()}
        emptyHint={t('noDependencies')}
        onPick={addDep}
        onClose={() => setDepPickerOpen(false)}
      />
    </aside>
  )
}

function Derived({ label, v, badge }: { label: string; v?: string; badge?: React.ReactNode }) {
  return (
    <div>
      <span className="block text-[10px] uppercase tracking-wide text-slate-400">{label}</span>
      <span className="inline-flex items-center gap-1 font-medium tabular-nums text-slate-600">
        {v}
        {badge}
      </span>
    </div>
  )
}
