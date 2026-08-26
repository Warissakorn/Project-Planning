import { useEffect, useMemo, useRef, useState } from 'react'
import { CalendarClock, Coins } from 'lucide-react'
import {
  UNASSIGNED_KEY,
  type CostCurve,
  type ReportBucket,
  type ReportGranularity,
} from '../../engine/analytics'
import {
  diffDaysIso,
  formatDate,
  formatDateShort,
  formatMonthIso,
  isoToDate,
  todayIso,
} from '../../lib/date'
import { translate, useT } from '../../lib/i18n'
import type { Lang } from '../../model/types'
import { EmptyState } from '../ui/Misc'

// Palette validated for the white surface (plan D4): do NOT swap hexes without
// re-running the dataviz validator — amber-500 and violet fail CVD/contrast.
const TOTAL_COLOR = '#4f46e5' // indigo-600
const SLOT_COLORS = ['#0284c7', '#d97706', '#059669', '#be123c']
const OTHER_COLOR = '#94a3b8' // slate-400 — folded "Other" + unassigned
const MAX_SLOTS = 4

const M = { top: 18, right: 52, bottom: 26, left: 58 }
const SVG_H = 240
const MIN_W = 360

interface VisibleSeries {
  key: string
  name: string
  color: string
  total: number
  cumulative: number[]
}

/** Compact axis number: 1.2M / 850K-style suffixes in both languages. */
function compactNumber(v: number): string {
  const trim = (n: number) => {
    const s = n >= 100 ? Math.round(n).toString() : n.toFixed(1)
    return s.endsWith('.0') ? s.slice(0, -2) : s
  }
  if (v >= 1_000_000) return `${trim(v / 1_000_000)}M`
  if (v >= 1_000) return `${trim(v / 1_000)}K`
  return String(Math.round(v))
}

/** Roundest step keeping the axis at ≤5 ticks. */
function niceStep(max: number): number {
  const raw = Math.max(max, 1) / 5
  const mag = 10 ** Math.floor(Math.log10(raw))
  for (const m of [1, 2, 2.5, 5, 10]) {
    if (max / (m * mag) <= 5) return m * mag
  }
  return 10 * mag
}

function useMeasuredWidth(min: number): [React.RefObject<HTMLDivElement | null>, number] {
  const ref = useRef<HTMLDivElement>(null)
  const [w, setW] = useState(min)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    setW(el.clientWidth || min)
    const ro = new ResizeObserver((entries) => {
      const cw = entries[0]?.contentRect.width
      if (cw && cw > 0) setW(cw)
    })
    ro.observe(el)
    return () => ro.disconnect()
  }, [min])
  return [ref, Math.max(w, min)]
}

/**
 * Cumulative cost S-curve: muted other/unassigned series underneath, category
 * lines above, bold total drawn last with a direct endpoint label. Native
 * title tooltips per bucket (GanttView convention); crosshair overlay deferred.
 */
export function SCurveChart({
  curve,
  lang,
  granularity,
}: {
  curve: CostCurve
  lang: Lang
  granularity: ReportGranularity
}) {
  const t = useT()
  const [containerRef, width] = useMeasuredWidth(MIN_W)

  // Fold slots beyond MAX_SLOTS into one "Other" series BEFORE rendering.
  const visible = useMemo<VisibleSeries[]>(() => {
    const cats = curve.series.filter((s) => s.key !== UNASSIGNED_KEY)
    const unassigned = curve.series.find((s) => s.key === UNASSIGNED_KEY)
    const out: VisibleSeries[] = cats.slice(0, MAX_SLOTS).map((s, i) => ({
      key: s.key,
      name: s.name,
      color: SLOT_COLORS[i],
      total: s.total,
      cumulative: s.cumulative,
    }))
    if (cats.length > MAX_SLOTS) {
      const tail = cats.slice(MAX_SLOTS)
      const cumulative = curve.buckets.map(() => 0)
      let total = 0
      for (const s of tail) {
        s.cumulative.forEach((v, i) => {
          cumulative[i] += v
        })
        total += s.total
      }
      out.push({
        key: '__other',
        name: translate(lang, 'scurveLegendOther'),
        color: OTHER_COLOR,
        total,
        cumulative,
      })
    }
    if (unassigned) {
      out.push({
        key: UNASSIGNED_KEY,
        name: translate(lang, 'scurveLegendUnassigned'),
        color: OTHER_COLOR,
        total: unassigned.total,
        cumulative: unassigned.cumulative,
      })
    }
    return out
  }, [curve, lang])

  if (curve.stats.datedTaskCount === 0) {
    return (
      <div ref={containerRef}>
        <EmptyState icon={<CalendarClock size={40} />} title={t('reportsNoDates')} />
      </div>
    )
  }
  if (curve.grandTotal === 0) {
    return (
      <div ref={containerRef}>
        <EmptyState icon={<Coins size={40} />} title={t('scurveNoCosts')} />
      </div>
    )
  }

  const buckets = curve.buckets
  const anchor = curve.anchorIso
  const plotW = width - M.left - M.right
  const plotH = SVG_H - M.top - M.bottom
  const rangeDays = diffDaysIso(buckets[buckets.length - 1].endIso, anchor) + 1
  const pxPerDay = plotW / rangeDays
  const xOf = (iso: string) => M.left + diffDaysIso(iso, anchor) * pxPerDay
  const endXOf = (b: ReportBucket) => xOf(b.endIso) + pxPerDay

  // Multi-charge attribution means one category can reach but not exceed the
  // grand total; maxing over all endpoints keeps the axis honest regardless.
  const dataMax = Math.max(
    curve.cumulativeTotal[curve.cumulativeTotal.length - 1] ?? 0,
    ...visible.map((s) => s.cumulative[s.cumulative.length - 1] ?? 0),
    1,
  )
  const step = niceStep(dataMax)
  const yMax = Math.ceil(dataMax / step) * step
  const ticks: number[] = []
  for (let v = 0; v <= yMax + step / 2; v += step) ticks.push(v)
  const yOf = (v: number) => M.top + plotH * (1 - v / yMax)

  // X labels: month view marks every bucket, week view each month's first —
  // both thinned so adjacent labels never collide on narrow containers.
  const MIN_LABEL_GAP = 52
  const labeled: ReportBucket[] = []
  let lastLabelX = -Infinity
  buckets.forEach((b, i) => {
    const x = xOf(b.startIso)
    if (x > width - M.right - 40) return
    const isMonthStart = i === 0 || b.startIso.slice(0, 7) !== buckets[i - 1].startIso.slice(0, 7)
    if ((granularity === 'month' || isMonthStart) && x - lastLabelX >= MIN_LABEL_GAP) {
      labeled.push(b)
      lastLabelX = x
    }
  })

  const totalEndX = endXOf(buckets[buckets.length - 1])
  const totalLastY = yOf(curve.cumulativeTotal[curve.cumulativeTotal.length - 1])

  function pointsFor(cumulative: number[]): string {
    const pts: Array<[number, number]> = [[M.left, yOf(0)]]
    buckets.forEach((b, i) => pts.push([endXOf(b), yOf(cumulative[i] ?? 0)]))
    return pts.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(' ')
  }

  function bucketTooltip(i: number): string {
    const b = buckets[i]
    const lines = [`${formatDate(b.startIso, lang)} – ${formatDate(b.endIso, lang)}`]
    lines.push(`${t('scurveLegendTotal')}: ${Math.round(curve.cumulativeTotal[i]).toLocaleString()}`)
    for (const s of visible) {
      lines.push(`${s.name}: ${Math.round(s.cumulative[i]).toLocaleString()}`)
    }
    return lines.join('\n')
  }

  const todayOff = diffDaysIso(todayIso(), anchor)

  return (
    <div ref={containerRef}>
      <svg width={width} height={SVG_H} className="block" role="img" aria-label={t('scurveTitle')}>
        {/* gridlines + y tick labels */}
        {ticks.map((v) => (
          <g key={v}>
            <line
              x1={M.left}
              x2={width - M.right}
              y1={yOf(v)}
              y2={yOf(v)}
              stroke={v === 0 ? '#cbd5e1' : '#e2e8f0'}
              strokeWidth={1}
            />
            <text
              x={M.left - 8}
              y={yOf(v) + 3.5}
              textAnchor="end"
              fontSize={10}
              fill="#94a3b8"
              className="tabular-nums"
            >
              {compactNumber(v)}
            </text>
          </g>
        ))}

        {/* x labels */}
        {labeled.map((b) => (
          <text key={b.startIso} x={xOf(b.startIso)} y={SVG_H - 8} fontSize={10} fill="#64748b">
            {granularity === 'month'
              ? formatMonthIso(b.startIso, lang)
              : formatDateShort(isoToDate(b.startIso) ?? new Date(), lang)}
          </text>
        ))}

        {/* today marker — red dashed reserved for exactly this */}
        {todayOff >= 0 && todayOff <= rangeDays ? (
          <g>
            <line
              x1={xOf(todayIso())}
              x2={xOf(todayIso())}
              y1={M.top}
              y2={M.top + plotH}
              stroke="#ef4444"
              strokeWidth={1}
              strokeDasharray="3 3"
              opacity={0.7}
            />
            <text x={xOf(todayIso()) + 3} y={M.top + 8} fontSize={9} fill="#ef4444">
              {t('today')}
            </text>
          </g>
        ) : null}

        {/* series: muted other/unassigned → categories → TOTAL last */}
        {visible.map((s) => (
          <polyline
            key={s.key}
            fill="none"
            stroke={s.color}
            strokeWidth={1.5}
            strokeLinejoin="round"
            strokeLinecap="round"
            points={pointsFor(s.cumulative)}
          />
        ))}
        <polyline
          fill="none"
          stroke={TOTAL_COLOR}
          strokeWidth={2.5}
          strokeLinejoin="round"
          strokeLinecap="round"
          points={pointsFor(curve.cumulativeTotal)}
        />

        {/* selective direct label: total endpoint only */}
        <text
          x={totalEndX + 5}
          y={Math.max(totalLastY + 3.5, M.top + 8)}
          fontSize={11}
          fontWeight={600}
          fill={TOTAL_COLOR}
          className="tabular-nums"
        >
          {compactNumber(curve.grandTotal)}
        </text>

        {/* bucket hit rects with native tooltips */}
        {buckets.map((b, i) => (
          <rect
            key={i}
            x={xOf(b.startIso)}
            y={M.top}
            width={Math.max(endXOf(b) - xOf(b.startIso), 1)}
            height={plotH}
            fill="transparent"
          >
            <title>{bucketTooltip(i)}</title>
          </rect>
        ))}
      </svg>

      {/* legend — hidden when the total line stands alone */}
      {visible.length > 0 ? (
        <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1">
          <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-slate-600">
            <span className="inline-block h-1 w-4 rounded-full" style={{ background: TOTAL_COLOR }} />
            {t('scurveLegendTotal')}
          </span>
          {visible.map((s) => (
            <span key={s.key} className="inline-flex items-center gap-1.5 text-[11px] text-slate-500">
              <span className="inline-block h-1 w-4 rounded-full" style={{ background: s.color }} />
              {s.name}
            </span>
          ))}
        </div>
      ) : null}

      {/* footnotes */}
      {curve.stats.undatedTaskCount > 0 || curve.stats.multiChargedTaskCount > 0 ? (
        <div className="mt-2 space-y-1">
          {curve.stats.undatedTaskCount > 0 ? (
            <p className="inline-flex items-center rounded border border-amber-200 bg-amber-50 px-2 py-0.5 text-[11px] text-amber-700">
              {t('reportsUndatedWarning', {
                n: curve.stats.undatedTaskCount,
                cost: compactNumber(curve.stats.undatedCost),
              })}
            </p>
          ) : null}
          {curve.stats.multiChargedTaskCount > 0 ? (
            <p className="text-[11px] text-slate-400">
              {t('scurveMultiChargedFootnote', { n: curve.stats.multiChargedTaskCount })}
            </p>
          ) : null}
        </div>
      ) : null}
    </div>
  )
}
