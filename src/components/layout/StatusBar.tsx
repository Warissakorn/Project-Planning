import { useMemo } from 'react'
import { AlertTriangle, CheckCircle2, HardDrive } from 'lucide-react'
import { useAppStore, storageUsageBytes } from '../../state/store'
import { translate, useT } from '../../lib/i18n'
import { schedulingStructureIds } from '../../engine/validation'
import { isLeaf } from '../../engine/treeOps'

const STORAGE_SOFT_LIMIT = 4_000_000 // ~4 MB of a typical 5 MB localStorage quota

/** Bottom strip: scheduling warnings + localStorage usage. */
export function StatusBar() {
  const t = useT()
  const lang = useAppStore((s) => s.lang)
  const project = useAppStore((s) =>
    s.activeProjectId ? (s.projects[s.activeProjectId] ?? null) : null,
  )

  const missingDates = useMemo(() => {
    if (!project) return 0
    const sched = schedulingStructureIds(project.structures)
    return Object.values(project.nodes).filter(
      (n) =>
        sched.has(n.structureId) &&
        isLeaf(project.nodes, n.id) &&
        !n.isMilestone &&
        (!n.startDate || n.durationDays === undefined),
    ).length
  }, [project])

  const bytes = storageUsageBytes()
  const kb = Math.round(bytes / 102.4) / 10

  return (
    <footer className="flex h-8 shrink-0 items-center gap-3 border-t border-slate-200 bg-white px-3 text-xs text-slate-500">
      {missingDates > 0 ? (
        <span className="inline-flex items-center gap-1 text-amber-600">
          <AlertTriangle size={13} />
          {translate(lang, 'warnNoDates', { n: missingDates })}
        </span>
      ) : (
        <span className="inline-flex items-center gap-1 text-emerald-600">
          <CheckCircle2 size={13} />
          {t('ok')}
        </span>
      )}

      <span
        className={`ml-auto inline-flex items-center gap-1 ${
          bytes > STORAGE_SOFT_LIMIT ? 'text-red-600' : ''
        }`}
      >
        <HardDrive size={13} />
        {kb.toLocaleString()} KB
      </span>
    </footer>
  )
}
