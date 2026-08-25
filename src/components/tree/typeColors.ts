import type { StructureTypeId } from '../../model/types'

/** Accent color per structure family (used on tabs and pickers). */
export const TYPE_DOT: Record<string, string> = {
  wbs: 'bg-indigo-500',
  obs: 'bg-sky-500',
  cbs: 'bg-amber-500',
  rbs: 'bg-rose-500',
  pbs: 'bg-emerald-500',
}

export const dotFor = (typeId: StructureTypeId): string => TYPE_DOT[typeId] ?? 'bg-slate-400'
