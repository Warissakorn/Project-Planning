import { useMemo, useState } from 'react'
import { buildCostCurve, buildResourceLoading } from '../../engine/analytics'
import { useT } from '../../lib/i18n'
import { useAppStore } from '../../state/store'
import { useStructureData } from '../../state/selectors'
import { cx } from '../../lib/cx'
import { ResourceHeatmap } from './ResourceHeatmap'
import { SCurveChart } from './SCurveChart'

export type Granularity = 'week' | 'month'

/**
 * Reports pane: a bucket-granularity toggle (mirrors the Gantt zoom bar) above
 * stacked report sections. Granularity is view-local state, not persisted.
 * Each section owns its model + empty states — one may be empty while the
 * other has data.
 */
export function ReportsView() {
  const t = useT()
  const lang = useAppStore((s) => s.lang)
  const { project } = useStructureData()
  const [granularity, setGranularity] = useState<Granularity>('month')

  const curve = useMemo(
    () => (project ? buildCostCurve(project, granularity) : null),
    [project, granularity],
  )
  const loading = useMemo(
    () => (project ? buildResourceLoading(project, granularity) : null),
    [project, granularity],
  )

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      {/* bucket switch */}
      <div className="flex h-8 shrink-0 items-center justify-end gap-1 border-b border-slate-200 bg-slate-50 px-2">
        <span className="mr-auto text-[11px] text-slate-400">{t('reportsSubtitle')}</span>
        {(['week', 'month'] as const).map((g) => (
          <button
            key={g}
            type="button"
            onClick={() => setGranularity(g)}
            className={cx(
              'inline-flex h-6 items-center rounded px-2 text-xs font-medium',
              granularity === g ? 'bg-indigo-600 text-white' : 'text-slate-500 hover:bg-slate-100',
            )}
          >
            {t(g === 'week' ? 'bucketWeek' : 'bucketMonth')}
          </button>
        ))}
      </div>

      <div className="min-h-0 flex-1 space-y-4 overflow-auto p-3">
        <section className="rounded-lg border border-slate-200 bg-white">
          <header className="flex items-center gap-2 border-b border-slate-100 px-3 py-2">
            <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-500">{t('scurveTitle')}</h2>
          </header>
          <div className="p-3">{curve ? <SCurveChart curve={curve} lang={lang} granularity={granularity} /> : null}</div>
        </section>

        <section className="rounded-lg border border-slate-200 bg-white">
          <header className="flex items-center gap-2 border-b border-slate-100 px-3 py-2">
            <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-500">{t('resourceLoadingTitle')}</h2>
          </header>
          <div className="p-3">{loading ? <ResourceHeatmap loading={loading} lang={lang} granularity={granularity} /> : null}</div>
        </section>
      </div>
    </div>
  )
}
