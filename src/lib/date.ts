import { addDays, differenceInCalendarDays, format, parseISO } from 'date-fns'
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
