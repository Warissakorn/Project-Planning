import { useMemo, useState } from 'react'
import { Building2, Coins, Unlink } from 'lucide-react'
import type { ID, LinkKind, Project } from '../../model/types'
import { getStructureTypeOrFallback } from '../../model/structureTypes'
import { outlineCodeOf } from '../../engine/numbering'
import { flattenStructure } from '../../engine/numbering'
import type { FlatRow } from '../../engine/numbering'
import { translate, useT } from '../../lib/i18n'
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
}

/**
 * Inspector section for WBS-side links: assigned OBS units and charged CBS
 * categories. On OBS/CBS nodes it instead shows the inbound WBS references.
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

  const node = project?.nodes[nodeId]
  if (!project || !node) return null

  const ownStructure = project.structures.find((s) => s.id === node.structureId)
  const ownType = getStructureTypeOrFallback(ownStructure?.typeId ?? '')
  const outboundKinds = ownType.capabilities.linkableFrom

  // Target-side: inbound links pointing at this node from WBS.
  const inbound = project.links.filter((l) => l.toNodeId === nodeId)
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

  const kindTitle = (kind: LinkKind) =>
    kind === 'assigns' ? t('assignedOrgs') : t('chargedCosts')
  const kindAddLabel = (kind: LinkKind) =>
    kind === 'assigns' ? t('addLinkAssigns') : t('addLinkCharges')

  const pickerItems = useMemo(
    () => (pickerKind ? candidateItems(pickerKind) : []),
    [pickerKind, project],
  )

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
                {kindTitle(kind)}
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
          {inbound.length === 0 ? (
            <p className="px-0.5 py-1 text-[11px] text-slate-400">{t('noDependencies')}</p>
          ) : (
            <ul className="mt-1 space-y-0.5">
              {inbound.map((l) => (
                <li key={l.id} className="flex items-center gap-1.5 truncate text-[12px] text-slate-600">
                  {KIND_ICON[l.kind]}
                  <span className="truncate">{nodeLabel(project, l.fromNodeId)}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      ) : null}

      <ItemPickerModal
        open={pickerKind !== null}
        title={pickerKind ? `${kindAddLabel(pickerKind)} — ${t('selectTargetTitle')}` : ''}
        items={pickerItems}
        onPick={(targetId) => pickerKind && addLinkAction(pickerKind, nodeId, targetId)}
        onClose={() => setPickerKind(null)}
      />
    </section>
  )
}
