import type { ID } from '../../model/types'
import type { GanttBar } from './ganttModel'
import { cx } from '../../lib/cx'

/**
 * One bar/diamond inside its row lane. The lane (position:relative) comes from
 * GanttView; this component only positions horizontally.
 */
export function TaskBar({
  bar,
  pxPerDay,
  title,
  onSelect,
}: {
  bar: GanttBar
  pxPerDay: number
  title: string
  onSelect: (id: ID) => void
}) {
  if (!bar.hasDates || bar.startOffset === undefined || bar.endOffset === undefined) return null

  const left = bar.startOffset * pxPerDay

  // Milestones render as diamonds.
  if (bar.isMilestone) {
    return (
      <button
        type="button"
        title={title}
        onClick={() => onSelect(bar.id)}
        className="absolute z-[5] flex items-center justify-center"
        style={{ left: left + pxPerDay / 2 - 7, top: 9 }}
      >
        <span className="block size-3.5 rotate-45 rounded-[2px] bg-amber-500 ring-1 ring-amber-600" />
      </button>
    )
  }

  // Branch rows get a thin summary bracket.
  if (bar.hasChildren) {
    const w = Math.max((bar.endOffset - bar.startOffset + 1) * pxPerDay - 2, 4)
    return (
      <button
        type="button"
        title={title}
        onClick={() => onSelect(bar.id)}
        className="absolute z-[5] rounded-full bg-slate-400 hover:bg-slate-500"
        style={{ left: left + 1, width: w, top: 12, height: 8 }}
      >
        {bar.progress !== undefined ? (
          <span
            className="absolute inset-y-0 left-0 rounded-full bg-slate-500"
            style={{ width: `${Math.min(100, Math.max(0, bar.progress))}%` }}
          />
        ) : null}
      </button>
    )
  }

  const w = Math.max((bar.endOffset - bar.startOffset + 1) * pxPerDay - 2, 4)
  return (
    <button
      type="button"
      title={title}
      onClick={() => onSelect(bar.id)}
      className={cx(
        'absolute z-[5] overflow-hidden rounded-sm shadow-sm',
        bar.critical ? 'bg-red-500 hover:bg-red-400' : 'bg-indigo-500 hover:bg-indigo-400',
      )}
      style={{ left: left + 1, width: w, top: 8, height: 16 }}
    >
      {bar.progress !== undefined && bar.progress > 0 ? (
        <span
          className="absolute inset-y-0 left-0 bg-white/35"
          style={{ width: `${Math.min(100, Math.max(0, bar.progress))}%` }}
        />
      ) : null}
    </button>
  )
}
