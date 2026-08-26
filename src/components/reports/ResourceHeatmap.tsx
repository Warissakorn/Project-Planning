import { useMemo } from 'react'
import { Building2 } from 'lucide-react'
import {
  type ReportBucket,
  type ReportGranularity,
  type ResourceLoading,
  type ResourceRow,
} from '../../engine/analytics'
import { formatDateShort, formatMonthIso, isoToDate } from '../../lib/date'
import { useT } from '../../lib/i18n'
import type { Lang } from '../../model/types'
import { useAppStore } from '../../state/store'
import { cx } from '../../lib/cx'
import { EmptyState } from '../ui/Misc'

export const LEFT_W = 220
const ROW_H = 28

/**
 * Sequential ramp quantized on the GLOBAL max — validator-approved indigos
 * (plan D4). Do NOT prepend lighter steps (indigo-200/-300 fail contrast).
 */
export const HEAT_CLASSES = ['#818cf8', '#6366f1', '#4f46e5', '#3730a3'] as const

const CELL_W: Record<ReportGranularity, number> = { week: 64, month: 84 }

function heatIndex(days: number, max: number): number {
  if (days <= 0 || max <= 0) return -1
  return Math.min(HEAT_CLASSES.length - 1, Math.floor((days / max) * HEAT_CLASSES.length))
}

function bucketLabel(b: ReportBucket, granularity: ReportGranularity, lang: Lang): string {
  return granularity === 'month'
    ? formatMonthIso(b.startIso, lang)
    : formatDateShort(isoToDate(b.startIso) ?? new Date(), lang)
}

/**
 * OBS × schedule heatmap: one row per org unit (rolled up the chain), one
 * column per bucket, fill intensity = task-days against the global max.
 * Row click selects the org unit in the inspector.
 */
export function ResourceHeatmap({
  loading,
  lang,
  granularity,
}: {
  loading: ResourceLoading
  lang: Lang
  granularity: ReportGranularity
}) {
  const t = useT()

  const maxDays = useMemo(
    () => Math.max(0, ...loading.rows.map((r) => Math.max(...r.cells))),
    [loading],
  )

  if (loading.rows.length === 0 || loading.stats.loadedOrgCount === 0) {
    return <EmptyState icon={<Building2 size={40} />} title={t('resourceNoAssigns')} />
  }

  const cellW = CELL_W[granularity]
  const showFooter = loading.unassignedDays.some((v) => v > 0)

  return (
    <div>
      {/* scale legend: 0 → ramp → max */}
      <div className="mb-2 flex flex-wrap items-center gap-1 text-[11px] text-slate-400">
        <span className="tabular-nums">0</span>
        {HEAT_CLASSES.map((c) => (
          <span
            key={c}
            aria-hidden
            className="h-3 w-6 rounded-sm border border-slate-200"
            style={{ background: c }}
          />
        ))}
        <span className="ml-1 tabular-nums">{t('resourceTaskDays', { n: maxDays })}</span>
      </div>

      <div className="overflow-auto rounded-lg border border-slate-200">
        <div className="w-max">
          {/* header */}
          <div className="sticky top-0 z-20 flex h-7 border-b border-slate-200 bg-white shadow-sm">
            <div
              className="sticky left-0 z-30 flex shrink-0 items-center border-r border-slate-200 bg-white px-2 text-[11px] font-semibold uppercase tracking-wide text-slate-400"
              style={{ width: LEFT_W }}
            >
              {t('nameLabel')}
            </div>
            {loading.buckets.map((b) => (
              <div
                key={b.startIso}
                className="flex shrink-0 items-end justify-center pb-0.5 text-[10px] text-slate-500"
                style={{ width: cellW }}
              >
                {bucketLabel(b, granularity, lang)}
              </div>
            ))}
          </div>

          {/* org rows */}
          {loading.rows.map((r) => (
            <ResourceHeatmapRow
              key={r.orgNodeId}
              row={r}
              loading={loading}
              lang={lang}
              granularity={granularity}
              maxDays={maxDays}
              cellW={cellW}
            />
          ))}

          {/* unassigned footer */}
          {showFooter ? (
            <div className="flex border-t border-slate-200 bg-slate-50" style={{ height: ROW_H }}>
              <div
                className="sticky left-0 z-10 flex shrink-0 items-center border-r border-slate-200 bg-slate-50 px-2 text-[11px] italic text-slate-400"
                style={{ width: LEFT_W }}
              >
                {t('resourceUnassigned')}
              </div>
              {loading.buckets.map((b, i) => (
                <div
                  key={b.startIso}
                  className="flex shrink-0 items-center justify-center text-[11px] tabular-nums text-slate-400"
                  style={{ width: cellW }}
                  title={`${t('resourceUnassigned')} · ${t('resourceTaskDays', { n: loading.unassignedDays[i] })}`}
                >
                  {loading.unassignedDays[i] > 0 ? loading.unassignedDays[i] : ''}
                </div>
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  )
}

function ResourceHeatmapRow({
  row,
  loading,
  lang,
  granularity,
  maxDays,
  cellW,
}: {
  row: ResourceRow
  loading: ResourceLoading
  lang: Lang
  granularity: ReportGranularity
  maxDays: number
  cellW: number
}) {
  const t = useT()
  const selectNode = useAppStore.getState().selectNode

  const cellTitle = (days: number, i: number): string => {
    const b = loading.buckets[i]
    const lines = [
      `${row.code ? row.code + ' ' : ''}${row.name}`,
      bucketLabel(b, granularity, lang),
      t('resourceTaskDays', { n: days }),
    ]
    for (const task of row.cellTasks[i]) lines.push(`• ${task}`)
    return lines.join('\n')
  }

  return (
    <button
      type="button"
      onClick={() => selectNode(row.orgNodeId)}
      className="flex w-full border-b border-slate-100 text-left hover:bg-slate-50"
      style={{ height: ROW_H }}
    >
      <span
        className="sticky left-0 z-10 flex shrink-0 items-center gap-1 truncate border-r border-slate-100 bg-white pr-2 hover:bg-slate-50"
        style={{ width: LEFT_W, paddingLeft: row.depth * 14 + 8 }}
        title={`${row.code ? row.code + ' ' : ''}${row.name}`}
      >
        {row.code ? (
          <span className="shrink-0 font-mono text-[10px] tabular-nums text-slate-400">{row.code}</span>
        ) : null}
        <span className="truncate">{row.name}</span>
      </span>
      {row.cells.map((days, i) => {
        const idx = heatIndex(days, maxDays)
        return (
          <span
            key={i}
            className={cx(
              'flex shrink-0 items-center justify-center border-l border-slate-100 text-[11px] tabular-nums',
              idx >= 2 ? 'text-white' : 'text-slate-600',
              idx === -1 && 'border-slate-100',
            )}
            style={{
              width: cellW,
              background: idx >= 0 ? HEAT_CLASSES[idx] : '#ffffff',
            }}
            title={cellTitle(days, i)}
          >
            {days > 0 ? days : ''}
          </span>
        )
      })}
    </button>
  )
}
