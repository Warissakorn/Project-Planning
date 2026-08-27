import { describe, expect, it } from 'vitest'
import type { ID } from './types'
import { SAMPLE_PROJECTS } from './samples'

/** Any character in the Thai block. */
const THAI = /[\u0E00-\u0E7F]/

describe('sample projects', () => {
  it.each(SAMPLE_PROJECTS)('$id builds cleanly', ({ id, build }) => {
    const p = build('th')
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
      const p = build('th')
      const wbsId = p.structures.find((s) => s.typeId === 'wbs')!.id
      for (const l of p.links) {
        expect(p.nodes[l.fromNodeId].structureId).toBe(wbsId)
        expect(p.nodes[l.toNodeId].structureId).not.toBe(wbsId)
      }
    }
  })

  it('dependencies reference existing WBS leaves', () => {
    for (const { build } of SAMPLE_PROJECTS) {
      const p = build('th')
      for (const d of p.dependencies) {
        expect(p.nodes[d.fromNodeId]).toBeDefined()
        expect(p.nodes[d.toNodeId]).toBeDefined()
      }
    }
  })

  // The whole point of an English session is that nothing Thai leaks into it,
  // and a sample carries hundreds of names — a missing `en` is easy to miss by
  // eye but never by this.
  it('builds English samples with no Thai left in them', () => {
    for (const { build, name } of SAMPLE_PROJECTS) {
      expect(THAI.test(name.en), `sample name: ${name.en}`).toBe(false)
      const p = build('en')
      expect(THAI.test(p.name), `project name: ${p.name}`).toBe(false)
      for (const n of Object.values(p.nodes)) {
        expect(THAI.test(n.name), `node name: ${n.name}`).toBe(false)
      }
      for (const st of p.structures) {
        expect(THAI.test(st.name), `structure name: ${st.name}`).toBe(false)
      }
    }
  })
})
