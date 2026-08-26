import { useMemo, useState } from 'react'
import {
  Building2,
  ChevronDown,
  ChevronUp,
  Coins,
  Package,
  ShieldAlert,
  Unlink,
} from 'lucide-react'
import type { ID, LinkKind, Project, TaskStatus } from '../../model/types'
import { getStructureTypeOrFallback } from '../../model/structureTypes'
import { outlineCodeOf } from '../../engine/numbering'
import { flattenStructure } from '../../engine/numbering'
import type { FlatRow } from '../../engine/numbering'
import { collectRollups, leafInfo, type RollupInfo } from '../../engine/rollup'
import { formatDate } from '../../lib/date'
import { translate, useT, type CopyKey } from '../../lib/i18n'
import { useAppStore } from '../../state/store'
import { Button } from '../ui/Button'
import { ItemPickerModal, type PickerItem } from './ItemPickerModal'

/** Label like "1.2.3 Design" (or the structure name for its root). */
export function nodeLabel(project: Project, id: ID): string {
  const node = project.nodes[id]
  if (!node) return id
  const structure = project.structures.find((s) => s.id === node.structureId)
  if (!structure) return node.name
  if (id === structure.rootId) return structure.name
  const code = outlineCodeOf(project.nodes, id)
  return `${code ? code + ' ' : ''}${node.name}`
}

const KIND_ICON: Record<LinkKind, React.ReactNode> = {
  assigns: <Building2 size={13} className="text-sky-500" />,
  charges: <Coins size={13} className="text-amber-500" />,
  delivers: <Package size={13} className="text-emerald-600" />,
  mitigates: <ShieldAlert size={13} className="text-violet-600" />,
}

const KIND_TITLE_KEY: Record<LinkKind, CopyKey> = {
  assigns: 'assignedOrgs',
  charges: 'chargedCosts',
  delivers: 'deliversTitle',
  mitigates: 'mitigatesTitle',
}

const KIND_ADD_KEY: Record<LinkKind, CopyKey> = {
  assigns: 'addLinkAssigns',
  charges: 'addLinkCharges',
  delivers: 'addLinkDelivers',
  mitigates: 'addLinkMitigates',
}

/** Mini-schedule dot colors; undefined status renders as a hollow dot. */
const STATUS_DOT: Record<TaskStatus, string> = {
  todo: 'bg-status-todo',
  in_progress: 'bg-status-progress',
  done: 'bg-status-done',
}

interface InboundRow {
  linkId: ID
  kind: LinkKind
  fromNodeId: ID
  info: RollupInfo
}

/**
 * Span/status of a linked-from node: leaves use their own values, branches
 * roll up their subtree (mirrors NodeInspector's derivedOf precedent).
 */
function spanOf(project: Project, nodeId: ID): RollupInfo {
  const node = project.nodes[nodeId]
  if (!node) return {}
  return node.childIds.length === 0
    ? leafInfo(node)
    : (collectRollups(project.nodes, nodeId).get(nodeId) ?? {})
}

/** Inbound links enriched with schedule data, dated first, undated last. */
function buildInboundRows(project: Project, nodeId: ID): InboundRow[] {
  const rows = project.links
    .filter((l) => l.toNodeId === nodeId)
    .map((l) => ({ linkId: l.id, kind: l.kind, fromNodeId: l.fromNodeId, info: spanOf(project, l.fromNodeId) }))
  return rows.sort((a, b) => {
    if (a.info.startDate && b.info.startDate) return a.info.startDate.localeCompare(b.info.startDate)
    if (a.info.startDate) return -1
    if (b.info.startDate) return 1
    return 0
  })
}

const INBOUND_CAP = 8

/**
 * Inspector section for WBS-side links: assigned OBS units and charged CBS
 * categories. On OBS/CBS/RBS/PBS nodes it instead shows the inbound WBS
 * references with a mini-schedule (status dot + date span + progress).
 */
export function LinkPanel({ nodeId }: { nodeId: ID }) {
  const t = useT()
  const lang = useAppStore((s) => s.lang)
  const project = useAppStore((s) =>
    s.activeProjectId ? (s.projects[s.activeProjectId] ?? null) : null,
  )
  const addLinkAction = useAppStore.getState().addLinkAction
  const removeLinkAction = useAppStore.getState().removeLinkAction

  const [pickerKind, setPickerKind] = useState<LinkKind | null>(null)
  const [expanded, setExpanded] = useState(false)

  const node = project?.nodes[nodeId]
  if (!project || !node) return null

  const ownStructure = project.structures.find((s) => s.id === node.structureId)
  const ownType = getStructureTypeOrFallback(ownStructure?.typeId ?? '')
  const outboundKinds = ownType.capabilities.linkableFrom

  // Target-side: inbound links pointing at this node from WBS.
  const inboundStructureIsTarget =
    ownType.capabilities.linkableTo.length > 0 && outboundKinds.length === 0

  const candidateItems = (kind: LinkKind): PickerItem[] => {
    const items: PickerItem[] = []
    for (const s of project.structures) {
      const cfg = getStructureTypeOrFallback(s.typeId)
      if (!cfg.capabilities.linkableTo.includes(kind)) continue
      const rows: FlatRow[] = flattenStructure(project.nodes, s.rootId, s.collapsedIds)
      for (const r of rows) {
        if (r.id === nodeId) continue
        items.push({ id: r.id, label: `${r.code} ${r.node.name}`.trim(), sub: s.name })
      }
    }
    return items
  }

  const inboundRows = useMemo(
    () => (inboundStructureIsTarget ? buildInboundRows(project, nodeId) : []),
    [project, nodeId, inboundStructureIsTarget],
  )

  const pickerItems = useMemo(
    () => (pickerKind ? candidateItems(pickerKind) : []),
    [pickerKind, project],
  )

  const visibleRows = expanded ? inboundRows : inboundRows.slice(0, INBOUND_CAP)

  return (
    <section className="space-y-2">
      <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-400">
        {t('linksSection')}
      </h3>

      {outboundKinds.map((kind) => {
        const links = project.links.filter((l) => l.kind === kind && l.fromNodeId === nodeId)
        return (
          <div key={kind} className="rounded-lg border border-slate-200 p-2">
            <div className="mb-1 flex items-center justify-between">
              <span className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-600">
                {KIND_ICON[kind]}
                {t(KIND_TITLE_KEY[kind])}
              </span>
              <Button size="sm" onClick={() => setPickerKind(kind)}>
                + {translate(lang, 'add')}
              </Button>
            </div>
            {links.length === 0 ? (
              <p className="px-0.5 py-1 text-[11px] text-slate-400">{t('noDependencies')}</p>
            ) : (
              <ul className="space-y-0.5">
                {links.map((l) => {
                  const target = project.nodes[l.toNodeId]
                  return (
                    <li key={l.id} className="group flex items-center gap-1 rounded px-0.5 py-0.5 hover:bg-slate-50">
                      <span className="min-w-0 flex-1 truncate text-[12px] text-slate-700">
                        {target ? nodeLabel(project, l.toNodeId) : '—'}
                      </span>
                      <button
                        type="button"
                        aria-label={t('removeLink')}
                        title={t('removeLink')}
                        onClick={() => removeLinkAction(l.id)}
                        className="rounded p-1 text-slate-300 opacity-0 transition-opacity hover:bg-red-50 hover:text-red-500 group-hover:opacity-100"
                      >
                        <Unlink size={12} />
                      </button>
                    </li>
                  )
                })}
              </ul>
            )}
          </div>
        )
      })}

      {inboundStructureIsTarget ? (
        <div className="rounded-lg border border-slate-200 p-2">
          <span className="text-xs font-medium text-slate-600">{t('inboundLinks')}</span>
          {inboundRows.length === 0 ? (
            <p className="px-0.5 py-1 text-[11px] text-slate-400">{t('noDependencies')}</p>
          ) : (
            <>
              <ul className="mt-1 space-y-1">
                {visibleRows.map((row) => (
                  <li key={row.linkId} className="rounded px-0.5 py-0.5">
                    <div className="flex items-center gap-1.5">
                      {KIND_ICON[row.kind]}
                      <StatusDot status={row.info.status} />
                      <span className="min-w-0 flex-1 truncate text-[12px] text-slate-600">
                        {nodeLabel(project, row.fromNodeId)}
                      </span>
                      {row.info.progress !== undefined ? (
                        <span className="text-[11px] tabular-nums text-slate-400">
                          {Math.round(row.info.progress)}%
                        </span>
                      ) : null}
                    </div>
                    <p className="pl-[22px] text-[10px] tabular-nums text-slate-400">
                      {row.info.startDate
                        ? `${formatDate(row.info.startDate, lang)} – ${formatDate(row.info.endDate ?? row.info.startDate, lang)}`
                        : t('inboundNoDates')}
                    </p>
                  </li>
                ))}
              </ul>
              {inboundRows.length > INBOUND_CAP ? (
                <button
                  type="button"
                  onClick={() => setExpanded((v) => !v)}
                  className="mt-1 inline-flex items-center gap-1 rounded px-1 py-0.5 text-[11px] font-medium text-indigo-600 hover:bg-indigo-50"
                >
                  {expanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                  {expanded ? t('showLess') : t('inboundMore', { n: inboundRows.length - INBOUND_CAP })}
                </button>
              ) : null}
            </>
          )}
        </div>
      ) : null}

      <ItemPickerModal
        open={pickerKind !== null}
        title={pickerKind ? `${translate(lang, KIND_ADD_KEY[pickerKind])} — ${t('selectTargetTitle')}` : ''}
        items={pickerItems}
        onPick={(targetId) => pickerKind && addLinkAction(pickerKind, nodeId, targetId)}
        onClose={() => setPickerKind(null)}
      />
    </section>
  )
}

function StatusDot({ status }: { status: TaskStatus | undefined }) {
  return (
    <span
      aria-hidden
      className={`h-2 w-2 shrink-0 rounded-full ${
        status ? STATUS_DOT[status] : 'border border-slate-300 bg-white'
      }`}
    />
  )
}
