/**
 * Export/import round trips — the automated half of the manual smoke
 * checklist: export JSON → wipe storage → import → identical tree.
 * (csv quoting/BOM per RFC 4180; import validation errors.)
 */

import { describe, expect, it } from 'vitest'
import type { Project } from '../model/types'
import { createNode, newProject } from '../model/defaults'
import { UTF8_BOM, csvEscape, csvWithBom, toCsv } from './csv'
import {
  importErrorMessage,
  parseImportedProject,
  SCHEMA_VERSION,
} from './jsonFile'
import { projectToJson, structureToCsvRows } from './exporters'

/** A small but complete project: 3-level WBS, dates, dep edge, cross-link. */
function makeSampleProject(): Project {
  const p = newProject('โครงการทดสอบ')
  const wbs = p.structures[0]
  const rootId = wbs.rootId

  const design = createNode(wbs.id, 'ออกแบบ')
  const draft = createNode(wbs.id, 'ร่างแบบ')
  const build = createNode(wbs.id, 'ก่อสร้าง')
  p.nodes[design.id] = design
  p.nodes[draft.id] = draft
  p.nodes[build.id] = build

  p.nodes[rootId].childIds = [design.id, build.id]
  design.parentId = rootId
  build.parentId = rootId
  design.childIds = [draft.id]
  draft.parentId = design.id

  p.nodes[draft.id].startDate = '2026-01-05'
  p.nodes[draft.id].durationDays = 10
  p.nodes[draft.id].progress = 40
  p.nodes[draft.id].status = 'in_progress'
  p.nodes[draft.id].cost = 1500.5

  p.dependencies.push({
    id: 'dep1',
    fromNodeId: draft.id,
    toNodeId: build.id,
    type: 'FS',
    lagDays: 1,
  })
  p.links.push({
    id: 'lnk1',
    kind: 'assigns',
    fromNodeId: draft.id,
    toNodeId: build.id,
    note: 'ชื่อมี " QUOTE ", จุลภาค, และขึ้นบรรทัด\nใหม่',
  })
  return p
}

describe('lib/csv', () => {
  it('escapes quotes / commas / newlines per RFC 4180', () => {
    expect(csvEscape('plain')).toBe('plain')
    expect(csvEscape('say "hi"')).toBe('"say ""hi"""')
    expect(csvEscape('a,b')).toBe('"a,b"')
    expect(csvEscape('line\nbreak')).toBe('"line\nbreak"')
    expect(csvEscape(null)).toBe('')
    expect(csvEscape(undefined)).toBe('')
    expect(csvEscape(false)).toBe('false')
  })

  it('joins CRLF rows and prepends the UTF-8 BOM', () => {
    expect(toCsv([[1, 'a'], [true, null]])).toBe('1,a\r\ntrue,')
    expect(csvWithBom([['x']])).toBe(UTF8_BOM + 'x')
  })

  it('keeps Thai text intact through escape + BOM', () => {
    const out = csvWithBom([['ชื่องาน', 'สถานะ']])
    expect(out.charCodeAt(0)).toBe(0xfeff)
    expect(out.endsWith('ชื่องาน,สถานะ')).toBe(true)
  })
})

describe('JSON export → import round trip', () => {
  it('restores an identical project (nodes, deps, links)', () => {
    const project = makeSampleProject()
    const text = projectToJson(project)

    const imported = parseImportedProject(text)

    expect(imported).toEqual(project)
    expect(Object.keys(imported.nodes).length).toBe(Object.keys(project.nodes).length)
    expect(imported.dependencies).toEqual(project.dependencies)
    expect(imported.links).toEqual(project.links)
  })

  it('envelope carries app tag and current schemaVersion', () => {
    const env = JSON.parse(projectToJson(makeSampleProject()))
    expect(env.app).toBe('breakdown-planner')
    expect(env.schemaVersion).toBe(SCHEMA_VERSION)
    expect(typeof env.exportedAt).toBe('string')
  })
})

describe('import validation', () => {
  it('rejects non-JSON payloads', () => {
    try {
      parseImportedProject('{not json')
      expect.unreachable()
    } catch (err) {
      expect(importErrorMessage(err)).toBe('invalid-json')
    }
  })

  it('rejects well-formed JSON that is not our envelope', () => {
    for (const bad of ['{}', '{"app":"other"}', '{"app":"breakdown-planner"}', '{"project":{}}']) {
      try {
        parseImportedProject(bad)
        expect.unreachable()
      } catch (err) {
        expect(importErrorMessage(err)).toBe('invalid-format')
      }
    }
  })

  it('rejects files from a newer schema version', () => {
    const env = JSON.parse(projectToJson(makeSampleProject()))
    env.schemaVersion = SCHEMA_VERSION + 1
    try {
      parseImportedProject(JSON.stringify(env))
      expect.unreachable()
    } catch (err) {
      expect(importErrorMessage(err)).toBe('newer-version')
    }
  })
})

describe('CSV sheet export', () => {
  it('writes bilingual headers and outline-coded rows', () => {
    const project = makeSampleProject()
    const rows = structureToCsvRows(project, project.structures[0])

    // Fixed scheduling columns; WBS preset adds no extra attr columns.
    expect(rows[0][0]).toBe('Code/รหัส')
    expect(rows[0]).toHaveLength(9)

    const names = rows.map((r) => String(r[1]))
    expect(names).toContain('ออกแบบ')
    expect(names).toContain('ก่อสร้าง')

    // Root is row "1"; its first child is "1.1".
    const codes = rows.map((r) => String(r[0]))
    expect(codes).toContain('1')
    expect(codes).toContain('1.1')

    // Leaf scheduling fields land in their cells.
    const draftRow = rows.find((r) => r[1] === 'ร่างแบบ')!
    expect(draftRow[3]).toBe('2026-01-05')
    expect(draftRow[5]).toBe(10)
  })
})
