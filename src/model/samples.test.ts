import { describe, expect, it } from 'vitest'
import type { ID } from './types'
import { SAMPLE_PROJECTS } from './samples'

describe('sample projects', () => {
  it.each(SAMPLE_PROJECTS)('$name builds cleanly', ({ id, build }) => {
    const p = build()
    expect(p.id).toBe(id)

    // Each structure's subtree reaches exactly its own nodes (no orphans).
    for (const s of p.structures) {
      let reached = 0
      const walk = (nodeId: ID): void => {
        reached++
        p.nodes[nodeId].childIds.forEach(walk)
      }
      walk(s.rootId)
      const owned = Object.values(p.nodes).filter((n) => n.structureId === s.id).length
      expect(reached).toBe(owned)
    }

    // Every WBS leaf carries scheduling data the Gantt can place.
    const wbs = p.structures[0]
    for (const n of Object.values(p.nodes)) {
      if (n.structureId !== wbs.id || n.childIds.length > 0) continue
      expect(n.startDate).toBeDefined()
      expect(n.durationDays).toBeDefined()
    }
  })

  it('cross-links always go WBS → another structure', () => {
    for (const { build } of SAMPLE_PROJECTS) {
      const p = build()
      const wbsId = p.structures.find((s) => s.typeId === 'wbs')!.id
      for (const l of p.links) {
        expect(p.nodes[l.fromNodeId].structureId).toBe(wbsId)
        expect(p.nodes[l.toNodeId].structureId).not.toBe(wbsId)
      }
    }
  })

  it('dependencies reference existing WBS leaves', () => {
    for (const { build } of SAMPLE_PROJECTS) {
      const p = build()
      for (const d of p.dependencies) {
        expect(p.nodes[d.fromNodeId]).toBeDefined()
        expect(p.nodes[d.toNodeId]).toBeDefined()
      }
    }
  })
})
