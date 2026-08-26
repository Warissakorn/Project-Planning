import { describe, expect, it } from 'vitest'
import type { LinkKind, Project, Structure, TreeNode } from '../model/types'
import { addChild, type Nodes } from './treeOps'
import {
  buildCostCurve,
  buildResourceLoading,
  makeBuckets,
  UNASSIGNED_KEY,
} from './analytics'

/**
 * All fixtures live in August–December 2099 so the "extend range to include
 * today" rule never fires on a developer machine and results stay constant.
 * Verified weekday anchors: 2099-08-03 is a MONDAY, 2099-08-30 a SUNDAY.
 */

// --- fixture builder -------------------------------------------------------

class Fixture {
  nodes: Nodes = {}
  structures: Structure[] = []
  links: Project['links'] = []
  private seq = 0

  structure(id: string, typeId: string): string {
    const rootId = `${id}#root`
    this.nodes[rootId] = {
      id: rootId,
      structureId: id,
      parentId: null,
      childIds: [],
      name: `${id}-root`,
    }
    this.structures.push({ id, typeId, name: id.toUpperCase(), rootId, collapsedIds: [] })
    return rootId
  }

  node(parentId: string, name: string, extra: Partial<TreeNode> = {}): string {
    const id = `n${++this.seq}`
    addChild(this.nodes, parentId, {
      id,
      structureId: this.nodes[parentId].structureId,
      parentId: parentId,
      childIds: [],
      name,
      ...extra,
    })
    return id
  }

  link(kind: LinkKind, fromNodeId: string, toNodeId: string): void {
    this.links.push({ id: `l${++this.seq}`, kind, fromNodeId, toNodeId })
  }

  project(): Project {
    return {
      id: 'p',
      name: 'Fixture',
      createdAt: 0,
      updatedAt: 0,
      structures: this.structures,
      nodes: this.nodes,
      dependencies: [],
      links: this.links,
    }
  }
}

/** One WBS leaf + one OBS unit + one CBS category, all wired by default. */
function singleTaskFxt(cost = 1000): {
  f: Fixture
  wbsRoot: string
  cbsRoot: string
  task: string
  org: string
  cat: string
} {
  const f = new Fixture()
  const wbsRoot = f.structure('w', 'wbs')
  const obsRoot = f.structure('o', 'obs')
  const cbsRoot = f.structure('c', 'cbs')
  const task = f.node(wbsRoot, 'task', { startDate: '2099-08-07', durationDays: 4, cost })
  const org = f.node(obsRoot, 'orgA')
  const cat = f.node(cbsRoot, 'catA')
  return { f, wbsRoot, cbsRoot, task, org, cat }
}

// --- buckets ---------------------------------------------------------------

describe('makeBuckets', () => {
  it('weeks are Monday-start and split correctly across a month edge', () => {
    // Anchor Sunday 08-30: the first bucket clamps to the anchor itself, the
    // next week begins on the month edge (Mon 08-31).
    const buckets = makeBuckets('2099-08-30', '2099-09-10', 'week')
    expect(buckets[0]).toEqual({ startIso: '2099-08-30', endIso: '2099-08-30' })
    expect(buckets[1]).toEqual({ startIso: '2099-08-31', endIso: '2099-09-06' })
    expect(buckets[2]).toEqual({ startIso: '2099-09-07', endIso: '2099-09-10' })
    expect(buckets).toHaveLength(3)
  })

  it('months cut cleanly across a year edge', () => {
    const buckets = makeBuckets('2099-11-15', '2100-01-20', 'month')
    expect(buckets).toEqual([
      { startIso: '2099-11-15', endIso: '2099-11-30' },
      { startIso: '2099-12-01', endIso: '2099-12-31' },
      { startIso: '2100-01-01', endIso: '2100-01-20' },
    ])
  })

  it('an inverted range collapses instead of looping forever', () => {
    const buckets = makeBuckets('2099-08-10', '2099-08-01', 'month')
    expect(buckets).toEqual([{ startIso: '2099-08-10', endIso: '2099-08-10' }])
  })
})

// --- cost curve -------------------------------------------------------------

describe('buildCostCurve', () => {
  it('spreads cost evenly over the inclusive span and sums to the grand total', () => {
    const { f } = singleTaskFxt(1000)
    // Fri 08-07 + 4 days = Fri..Mon: 3 days in week [08-03..08-09], 1 in next.
    const curve = buildCostCurve(f.project(), 'week')
    expect(curve.grandTotal).toBe(1000)
    expect(curve.cumulativeTotal[0]).toBeCloseTo(750)
    expect(curve.cumulativeTotal[curve.cumulativeTotal.length - 1]).toBeCloseTo(1000)
    expect(curve.stats.datedTaskCount).toBe(1)
  })

  it('deposits a milestone’s full cost on its start day only', () => {
    const f = new Fixture()
    const wbsRoot = f.structure('w', 'wbs')
    f.node(wbsRoot, 'm', { startDate: '2099-08-05', isMilestone: true, cost: 500 })
    const curve = buildCostCurve(f.project(), 'week')
    expect(curve.cumulativeTotal[0]).toBe(500)
    expect(new Set(curve.cumulativeTotal)).toEqual(new Set([500]))
  })

  it('treats a missing duration as a 1-day span (Gantt parity)', () => {
    const f = new Fixture()
    const wbsRoot = f.structure('w', 'wbs')
    f.node(wbsRoot, 't', { startDate: '2099-08-06', cost: 300 })
    const curve = buildCostCurve(f.project(), 'week')
    expect(curve.cumulativeTotal[0]).toBe(300)
  })

  it('sums overlapping tasks and counts the inclusive end day', () => {
    const f = new Fixture()
    const wbsRoot = f.structure('w', 'wbs')
    f.node(wbsRoot, 'a', { startDate: '2099-08-03', durationDays: 2, cost: 200 })
    f.node(wbsRoot, 'b', { startDate: '2099-08-04', durationDays: 2, cost: 200 })
    const curve = buildCostCurve(f.project(), 'week')
    expect(curve.cumulativeTotal[0]).toBe(400)
  })

  it('excludes undated cost-bearing tasks but counts them in stats', () => {
    const { f, wbsRoot } = singleTaskFxt()
    f.node(wbsRoot, 'ghost', { cost: 999 })
    const curve = buildCostCurve(f.project(), 'month')
    expect(curve.grandTotal).toBe(1000)
    expect(curve.stats.undatedTaskCount).toBe(1)
    expect(curve.stats.undatedCost).toBe(999)
  })

  it('has __unassigned iff uncharged cost exists', () => {
    const { f, task, cat } = singleTaskFxt()
    const charged = buildCostCurve(f.project(), 'month')
    f.link('charges', task, cat)
    const after = buildCostCurve(f.project(), 'month')

    expect(charged.series.some((s) => s.key === UNASSIGNED_KEY)).toBe(true)
    expect(after.series.some((s) => s.key === UNASSIGNED_KEY)).toBe(false)
    expect(after.series[0]).toMatchObject({ key: cat, total: 1000 })
  })

  it('charges a task to N categories at FULL cost each while the total counts it once', () => {
    const f = new Fixture()
    const wbsRoot = f.structure('w', 'wbs')
    const cbsRoot = f.structure('c', 'cbs')
    const task = f.node(wbsRoot, 't', { startDate: '2099-08-03', durationDays: 2, cost: 400 })
    const cat1 = f.node(cbsRoot, 'mat')
    const cat2 = f.node(cbsRoot, 'lab')
    f.link('charges', task, cat1)
    f.link('charges', task, cat2)

    const curve = buildCostCurve(f.project(), 'week')
    expect(curve.series.map((s) => s.total).sort()).toEqual([400, 400])
    expect(curve.grandTotal).toBe(400)
    expect(curve.cumulativeTotal[0]).toBe(400)
    expect(curve.stats.multiChargedTaskCount).toBe(1)
  })

  it('skips categories nothing links to', () => {
    const { f, cbsRoot } = singleTaskFxt()
    f.node(cbsRoot, 'emptyCat')
    const curve = buildCostCurve(f.project(), 'month')
    expect(curve.series).toHaveLength(1) // just __unassigned
  })
})

// --- resource loading --------------------------------------------------------

describe('buildResourceLoading', () => {
  function obsFxt() {
    const f = new Fixture()
    const wbsRoot = f.structure('w', 'wbs')
    const obsRoot = f.structure('o', 'obs')
    const grp = f.node(wbsRoot, 'grp') // branch
    const l1 = f.node(grp, 'l1', { startDate: '2099-08-03', durationDays: 1 })
    const l2 = f.node(grp, 'l2', { startDate: '2099-08-05', durationDays: 2 })
    const orgParent = f.node(obsRoot, 'orgParent')
    const orgChild = f.node(orgParent, 'orgChild')
    const orgIdle = f.node(obsRoot, 'orgIdle')
    return { f, grp, l1, l2, orgParent, orgChild, orgIdle }
  }

  it('expands branch links and dedupes direct+ancestor paths to the same unit', () => {
    const { f, grp, l1, orgChild } = obsFxt()
    f.link('assigns', grp, orgChild)
    f.link('assigns', l1, orgChild) // would double-count l1 without dedupe

    const loading = buildResourceLoading(f.project(), 'week')
    const childRow = loading.rows.find((r) => r.name === 'orgChild')!
    expect(childRow.cells[0]).toBe(3) // l1 (1d, once) + l2 (2d)
    expect(childRow.cellTasks[0].join(',')).toContain('l1 (1d)')
    expect(loading.rows.find((r) => r.name === 'orgIdle')!.cells[0]).toBe(0)
    expect(loading.unassignedDays[0]).toBe(0)
  })

  it('rolls assignments up the OBS chain and indents nested rows', () => {
    const { f, l1, l2, orgChild } = obsFxt()
    f.link('assigns', l1, orgChild)
    f.link('assigns', l2, orgChild)

    const loading = buildResourceLoading(f.project(), 'week')
    const parentRow = loading.rows.find((r) => r.name === 'orgParent')!
    expect(parentRow.depth).toBe(0)
    expect(parentRow.cells[0]).toBe(3) // rolled up from orgChild
    const childRow = loading.rows.find((r) => r.name === 'orgChild')!
    expect(childRow.depth).toBe(1)
    expect(childRow.cells[0]).toBe(3)
    expect(loading.stats.loadedOrgCount).toBe(2)
  })

  it('a leaf assigned to two units accumulates full days in both rows', () => {
    const { f, l1, orgChild, orgIdle } = obsFxt()
    f.link('assigns', l1, orgChild)
    f.link('assigns', l1, orgIdle)

    const loading = buildResourceLoading(f.project(), 'week')
    expect(loading.rows.find((r) => r.name === 'orgChild')!.cells[0]).toBe(1)
    expect(loading.rows.find((r) => r.name === 'orgIdle')!.cells[0]).toBe(1)
  })

  it('unassigned days collect dated leaves no assigns link touches', () => {
    const { f, l2, orgChild } = obsFxt()
    f.link('assigns', l2, orgChild)

    const loading = buildResourceLoading(f.project(), 'week')
    expect(loading.unassignedDays[0]).toBe(1) // l1 floats free
  })

  it('excludes the synthetic OBS root from rows', () => {
    const { f } = obsFxt()
    const loading = buildResourceLoading(f.project(), 'week')
    expect(loading.rows.map((r) => r.code).every((c) => c !== '')).toBe(true)
    expect(loading.rows).toHaveLength(3)
  })
})

// --- guards & purity ----------------------------------------------------------

describe('analytics guards', () => {
  it('handles an empty project without throwing', () => {
    const p = new Fixture().project()
    const curve = buildCostCurve(p, 'week')
    const loading = buildResourceLoading(p, 'month')
    expect(curve.buckets.length).toBeGreaterThan(0)
    expect(curve.cumulativeTotal.every((v) => v === 0)).toBe(true)
    expect(curve.grandTotal).toBe(0)
    expect(loading.rows).toEqual([])
    expect(loading.buckets.length).toBeGreaterThan(0)
  })

  it('is pure apart from the clock: two calls agree', () => {
    const { f } = singleTaskFxt()
    const p = f.project()
    expect(buildCostCurve(p, 'week')).toEqual(buildCostCurve(p, 'week'))
    expect(buildResourceLoading(p, 'month')).toEqual(buildResourceLoading(p, 'month'))
  })
})
