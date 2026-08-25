import { describe, expect, it } from 'vitest'
import { computeCpmOffsets, type CpmEdge, type CpmTask } from './cpm'

const t = (id: string, duration: number, pinnedStart?: number): CpmTask => ({
  id,
  duration,
  pinnedStart,
})
const e = (from: string, to: string, type: CpmEdge['type'] = 'FS', lag = 0): CpmEdge => ({
  fromNodeId: from,
  toNodeId: to,
  type,
  lagDays: lag,
})

describe('computeCpmOffsets', () => {
  it('a finish-to-start chain is fully critical with zero slack', () => {
    const res = computeCpmOffsets([t('A', 3), t('B', 2), t('C', 1)], [
      e('A', 'B'),
      e('B', 'C'),
    ])
    expect(res.get('A')).toMatchObject({ es: 0, ef: 3, slack: 0, critical: true })
    expect(res.get('B')).toMatchObject({ es: 3, ef: 5, slack: 0, critical: true })
    expect(res.get('C')).toMatchObject({ es: 5, ef: 6, slack: 0, critical: true })
  })

  it('the shorter parallel branch gets positive slack', () => {
    // A(5) → D ; B(2) → D : B can slip by 3 days.
    const res = computeCpmOffsets([t('A', 5), t('B', 2), t('D', 1)], [
      e('A', 'D'),
      e('B', 'D'),
    ])
    expect(res.get('B')!.slack).toBe(3)
    expect(res.get('B')!.critical).toBe(false)
    expect(res.get('A')!.critical).toBe(true)
    expect(res.get('D')!.es).toBe(5)
  })

  it('start-to-start with positive lag', () => {
    const res = computeCpmOffsets([t('A', 10), t('B', 4)], [e('A', 'B', 'SS', 2)])
    expect(res.get('B')!.es).toBe(2)
  })

  it('finish-to-finish aligns finishes', () => {
    // A(5) FF B(2): B must finish no earlier than A → es(B) = 5 - 2 = 3.
    const res = computeCpmOffsets([t('A', 5), t('B', 2)], [e('A', 'B', 'FF')])
    expect(res.get('B')!.ef).toBe(5)
    expect(res.get('B')!.es).toBe(3)
  })

  it('negative FS lag allows overlap', () => {
    const res = computeCpmOffsets([t('A', 5), t('B', 3)], [e('A', 'B', 'FS', -2)])
    expect(res.get('B')!.es).toBe(3)
  });

  it('start-to-finish constrains the successor finish via predecessor start', () => {
    // A(4) SF lag 5 B(2): finish(B) ≥ start(A)+5 → es(B) = 0+5-2 = 3.
    const res = computeCpmOffsets([t('A', 4), t('B', 2)], [e('A', 'B', 'SF', 5)])
    expect(res.get('B')!.es).toBe(3)
    expect(res.get('B')!.ef).toBe(5)
  })

  it('a pinned start later than predecessors wins (max rule)', () => {
    const res = computeCpmOffsets(
      [t('A', 2), t('B', 3, 10)],
      [e('A', 'B')],
    )
    expect(res.get('B')!.es).toBe(10)
  })

  it('zero-duration milestones sit on the junction and are critical', () => {
    const res = computeCpmOffsets(
      [t('A', 3), t('M', 0), t('B', 2)],
      [e('A', 'M'), e('M', 'B')],
    )
    expect(res.get('M')).toMatchObject({ es: 3, ef: 3, critical: true })
  })

  it('throws when the graph contains a cycle', () => {
    expect(() =>
      computeCpmOffsets([t('A', 1), t('B', 1), t('C', 1)], [
        e('A', 'B'),
        e('B', 'C'),
        e('C', 'A'),
      ]),
    ).toThrow(/cycle/)
  })

  it('ignores edges that reference unknown tasks', () => {
    const res = computeCpmOffsets([t('A', 1)], [e('A', 'GHOST')])
    expect(res.get('A')!.critical).toBe(true)
  })
})
