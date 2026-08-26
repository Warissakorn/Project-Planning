import {
  addDays,
  addMonths,
  differenceInCalendarDays,
  endOfMonth,
  format,
  parseISO,
  startOfMonth,
  startOfWeek,
} from 'date-fns'
import { th as thLocale } from 'date-fns/locale'
import type { Lang } from '../model/types'

/** All scheduling is day-granularity, stored as ISO `yyyy-MM-dd` strings. */

export const isoToDate = (iso: string | undefined): Date | null => {
  if (!iso) return null
  const d = parseISO(iso)
  return Number.isNaN(d.getTime()) ? null : d
}

export const dateToIso = (d: Date): string => format(d, 'yyyy-MM-dd')

export const addDaysIso = (iso: string, days: number): string =>
  format(addDays(parseISO(iso), days), 'yyyy-MM-dd')

export const diffDaysIso = (a: string, b: string): number =>
  differenceInCalendarDays(parseISO(a), parseISO(b))

/** Inclusive end date of a task that starts at `iso` and lasts `durationDays`. */
export const endIso = (iso: string, durationDays: number): string =>
  durationDays <= 0 ? iso : addDaysIso(iso, durationDays - 1)

export const todayIso = (): string => dateToIso(new Date())

export const formatDate = (iso: string | undefined, lang: Lang): string => {
  const d = isoToDate(iso)
  if (!d) return ''
  return format(d, 'd MMM yyyy', { locale: lang === 'th' ? thLocale : undefined })
}

export const formatDateShort = (d: Date, lang: Lang): string =>
  format(d, 'd MMM', { locale: lang === 'th' ? thLocale : undefined })

/** Monday-start week containing `iso` (explicit so it is locale-independent). */
export const startOfWeekIso = (iso: string): string =>
  format(startOfWeek(parseISO(iso), { weekStartsOn: 1 }), 'yyyy-MM-dd')

/** First day of the month containing `iso`. */
export const startOfMonthIso = (iso: string): string => format(startOfMonth(parseISO(iso)), 'yyyy-MM-dd')

/** Last day of the month containing `iso`. */
export const endOfMonthIso = (iso: string): string => format(endOfMonth(parseISO(iso)), 'yyyy-MM-dd')

export const addMonthsIso = (iso: string, months: number): string =>
  format(addMonths(parseISO(iso), months), 'yyyy-MM-dd')

/** Month label like "ม.ค. 2026" / "Jan 2026" for chart axes. */
export const formatMonthIso = (iso: string, lang: Lang): string => {
  const d = isoToDate(iso)
  if (!d) return ''
  return format(d, 'MMM yyyy', { locale: lang === 'th' ? thLocale : undefined })
}
