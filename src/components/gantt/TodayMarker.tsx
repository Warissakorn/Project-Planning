import { diffDaysIso, todayIso } from '../../lib/date'
import { translate, type CopyKey } from '../../lib/i18n'
import type { Lang } from '../../model/types'

/** Vertical red line at today's date when it falls inside the visible range. */
export function TodayMarker({
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
  const off = diffDaysIso(todayIso(), anchorIso)
  if (off < 0 || off >= totalDays) return null
  return (
    <div
      title={translate(lang, 'today' as CopyKey)}
      className="pointer-events-none absolute bottom-0 z-10 w-px bg-red-500/70"
      style={{ left: off * pxPerDay, top: 0 }}
    />
  )
}
