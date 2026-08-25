import { format, parseISO } from 'date-fns'
import { th as thLocale } from 'date-fns/locale'
import type { Lang } from '../../model/types'
import { addDaysIso } from '../../lib/date'

/**
 * Two-tier calendar header: month bands on top, day cells below.
 * Weekends are shaded; day numbers show when zoomed in far enough.
 */
export function GanttHeader({
  anchorIso,
  totalDays,
  pxPerDay,
  lang,
}: {
  anchorIso: string
  totalDays: number
  pxPerDay: number
  lang: Lang
}) {
  const locale = lang === 'th' ? thLocale : undefined

  // Group consecutive days into month segments.
  const segments: { key: string; label: string; days: number }[] = []
  for (let i = 0; i < totalDays; i++) {
    const iso = addDaysIso(anchorIso, i)
    const key = iso.slice(0, 7)
    const last = segments[segments.length - 1]
    if (last && last.key === key) last.days++
    else segments.push({ key, label: format(parseISO(iso), 'MMM yyyy', { locale }), days: 1 })
  }

  return (
    <div className="shrink-0 border-b border-slate-200 bg-white">
      {/* months */}
      <div className="flex" style={{ height: 24 }}>
        {segments.map((s, i) => (
          <div
            key={`${s.key}-${i}`}
            className="truncate border-r border-slate-200 px-1.5 text-[11px] font-semibold leading-[24px] text-slate-500"
            style={{ width: s.days * pxPerDay }}
          >
            {s.label}
          </div>
        ))}
      </div>
      {/* days */}
      <div className="flex" style={{ height: 18 }}>
        {Array.from({ length: totalDays }, (_, i) => {
          const iso = addDaysIso(anchorIso, i)
          const dow = parseISO(iso).getDay()
          const weekend = dow === 0 || dow === 6
          const label = pxPerDay >= 16 ? format(parseISO(iso), 'd') : dow === 1 ? format(parseISO(iso), 'd') : ''
          return (
            <div
              key={iso}
              className={cxDay(weekend)}
              style={{
                width: pxPerDay,
                borderRight: pxPerDay >= 10 || dow === 1 ? '1px solid #f1f5f9' : undefined,
              }}
            >
              {label}
            </div>
          )
        })}
      </div>
    </div>
  )
}

function cxDay(weekend: boolean): string {
  return [
    'shrink-0 text-center text-[9px] leading-[18px] tabular-nums',
    weekend ? 'bg-slate-100 text-slate-400' : 'text-slate-500',
    'border-b border-slate-200',
  ].join(' ')
}
