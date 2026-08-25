import type { GanttModel } from './ganttModel'

/**
 * SVG overlay drawing dependency arrows between bars.
 * Positioned by the parent to cover exactly the rows region (below header,
 * right of the sticky name column).
 */
export function DependencyArrows({
  model,
  pxPerDay,
  rowH,
}: {
  model: GanttModel
  pxPerDay: number
  rowH: number
}) {
  const rowIndex = new Map(model.bars.map((b, i) => [b.id, i]))
  const w = model.totalDays * pxPerDay
  const h = model.bars.length * rowH

  return (
    <svg
      className="pointer-events-none absolute"
      style={{ left: 0, top: 0, width: w, height: h, overflow: 'visible' }}
    >
      <defs>
        <marker id="ga-arrow" viewBox="0 0 8 8" refX={7} refY={4} markerWidth={7} markerHeight={7} orient="auto">
          <path d="M0,0 L8,4 L0,8 z" fill="#94a3b8" />
        </marker>
      </defs>
      {model.edges.map((e) => {
        const fi = rowIndex.get(e.fromId)
        const ti = rowIndex.get(e.toId)
        if (fi === undefined || ti === undefined) return null
        const fb = model.bars[fi]
        const tb = model.bars[ti]
        if (!fb.hasDates || !tb.hasDates || fb.startOffset === undefined || tb.startOffset === undefined) {
          return null
        }
        const yF = fi * rowH + rowH / 2
        const yT = ti * rowH + rowH / 2
        const xSF = fb.startOffset * pxPerDay
        const xEF = (fb.endOffset! + 1) * pxPerDay
        const xST = tb.startOffset * pxPerDay
        const xET = (tb.endOffset! + 1) * pxPerDay

        let d: string
        switch (e.type) {
          case 'FS':
            d = `M ${xEF} ${yF} H ${xEF + 8} V ${yT} H ${xST - 5}`
            break
          case 'SS':
            d = `M ${xSF} ${yF} H ${xSF - 6} V ${yT} H ${xST - 5}`
            break
          case 'FF':
            d = `M ${xEF} ${yF} H ${xEF + 8} V ${yT} H ${xET + 5}`
            break
          case 'SF':
            d = `M ${xSF} ${yF} H ${xSF - 6} V ${yT} H ${xET + 5}`
            break
        }
        return (
          <path
            key={e.depId}
            d={d}
            fill="none"
            stroke="#94a3b8"
            strokeWidth={1.2}
            markerEnd="url(#ga-arrow)"
          />
        )
      })}
    </svg>
  )
}
