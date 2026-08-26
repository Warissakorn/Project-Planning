import { useMemo, useState } from 'react'
import { BarChart3 } from 'lucide-react'
import type { CopyKey } from '../../lib/i18n'
import { formatDate, addDaysIso } from '../../lib/date'
import { useT } from '../../lib/i18n'
import { useAppStore } from '../../state/store'
import { useStructureData } from '../../state/selectors'
import { cx } from '../../lib/cx'
import { ROW_H } from '../tree/TreeNodeRow'
import { ColGrip } from '../tree/StructureTree'
import { EmptyState } from '../ui/Misc'
import { buildGanttModel, type GanttBar } from './ganttModel'
import { GanttHeader } from './GanttHeader'
import { TaskBar } from './TaskBar'
import { DependencyArrows } from './DependencyArrows'
import { TodayMarker } from './TodayMarker'

const DEFAULT_LEFT_W = 220
const GANTT_LEFT_KEY = '__ganttLeft'
const HEADER_H = 42

type Zoom = 'day' | 'week' | 'month'
const PX_PER_DAY: Record<Zoom, number> = { day: 26, week: 12, month: 4 }

/**
 * Gantt pane: sticky name column + horizontally scrolling day grid with bars,
 * dependency arrows and a today marker. Rows align 1:1 with the flattened
 * tree (same ROW_H), including collapsed branches.
 */
export function GanttView() {
  const t = useT()
  const lang = useAppStore((s) => s.lang)
  const selectedNodeId = useAppStore((s) => s.selectedNodeId)
  const selectNode = useAppStore.getState().selectNode
  const { project, structure } = useStructureData()
  const leftW = useAppStore((s) => s.columnWidths[GANTT_LEFT_KEY]) ?? DEFAULT_LEFT_W
  const setColumnWidth = useAppStore.getState().setColumnWidth

  const [zoom, setZoom] = useState<Zoom>('day')
  const pxPerDay = PX_PER_DAY[zoom]

  const model = useMemo(
    () => (project && structure ? buildGanttModel(project, structure) : null),
    [project, structure],
  )

  if (!project || !structure || !model) return null

  const anyDates = model.bars.some((b) => b.hasDates)
  if (!anyDates) {
    return (
      <div className="min-h-0 flex-1">
        <EmptyState icon={<BarChart3 size={40} />} title={t('ganttNeedsDates')} />
      </div>
    )
  }

  const totalPx = model.totalDays * pxPerDay

  const tooltipFor = (b: GanttBar): string => {
    const lines = [`${b.code ? b.code + ' ' : ''}${b.name || t('untitled')}`]
    if (b.hasDates && b.startOffset !== undefined && b.endOffset !== undefined) {
      lines.push(
        `${formatDate(addDaysIso(model.anchorIso, b.startOffset), lang)} → ${formatDate(
          addDaysIso(model.anchorIso, b.endOffset),
          lang,
        )}`,
      )
      if (!b.hasChildren && b.slack !== undefined) lines.push(t('ganttSlack', { n: b.slack }))
      if (b.critical) lines.push(t('ganttCritical'))
    }
    return lines.join('\n')
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      {/* zoom switch */}
      <div className="flex h-9 shrink-0 items-center justify-end gap-1 border-b border-slate-200 bg-slate-50 px-2">
        {(['day', 'week', 'month'] as const).map((z) => (
          <button
            key={z}
            type="button"
            onClick={() => setZoom(z)}
            className={cx(
              'inline-flex h-7 items-center rounded px-2.5 text-xs font-medium transition-colors',
              zoom === z ? 'bg-indigo-600 text-white' : 'text-slate-500 hover:bg-slate-200',
            )}
          >
            {t(`ganttZoom_${z}` as CopyKey)}
          </button>
        ))}
      </div>

      <div className="min-h-0 flex-1 overflow-auto">
        <div className="relative" style={{ width: leftW + totalPx }}>
          {/* header row: sticky corner + calendar */}
          <div className="sticky top-0 z-20 flex shadow-sm">
            <div
              className="sticky left-0 z-30 flex shrink-0 items-center border-b border-r border-slate-200 bg-white px-2 text-xs font-semibold uppercase tracking-wide text-slate-400"
              style={{ width: leftW, height: HEADER_H }}
            >
              {t('nameLabel')}
              <ColGrip
                width={leftW}
                min={140}
                max={480}
                title={t('colResizeHint')}
                onResize={(w) => setColumnWidth(GANTT_LEFT_KEY, w)}
                onReset={() => setColumnWidth(GANTT_LEFT_KEY, null)}
              />
            </div>
            <GanttHeader
              anchorIso={model.anchorIso}
              totalDays={model.totalDays}
              pxPerDay={pxPerDay}
              lang={lang}
            />
          </div>

          {/* rows */}
          {model.bars.map((b) => (
            <div key={b.id} className="flex border-b border-slate-100" style={{ height: ROW_H }}>
              <button
                type="button"
                onClick={() => selectNode(b.id)}
                className={cx(
                  'sticky left-0 z-10 flex shrink-0 items-center gap-1 truncate border-r border-slate-100 bg-white text-left text-[13px] hover:bg-slate-50',
                  selectedNodeId === b.id && 'bg-indigo-50',
                )}
                style={{ width: leftW, paddingLeft: Math.max(0, b.depth) * 14 + 8 }}
                title={b.name || t('untitled')}
              >
                {b.code ? (
                  <span className="shrink-0 font-mono text-[11px] tabular-nums text-slate-400">
                    {b.code}
                  </span>
                ) : null}
                <span className={cx('truncate', b.name === '' && 'italic text-slate-300')}>
                  {b.name === '' ? t('untitled') : b.name}
                </span>
              </button>
              <div className="relative shrink-0 border-l border-slate-100" style={{ width: totalPx }}>
                <TaskBar bar={b} pxPerDay={pxPerDay} title={tooltipFor(b)} onSelect={selectNode} />
              </div>
            </div>
          ))}

          {/* overlays over the rows region only */}
          <div className="pointer-events-none absolute bottom-0" style={{ left: leftW, top: HEADER_H }}>
            <DependencyArrows model={model} pxPerDay={pxPerDay} rowH={ROW_H} />
            <TodayMarker
              anchorIso={model.anchorIso}
              totalDays={model.totalDays}
              pxPerDay={pxPerDay}
              lang={lang}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
