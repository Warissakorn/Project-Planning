/**
 * Concrete export builders: whole-project JSON backups and per-structure CSV
 * sheets with outline codes and derived roll-up values filled in.
 */

import type { ID, Project, Structure } from '../model/types'
import { getStructureTypeOrFallback } from '../model/structureTypes'
import { flattenStructure } from '../engine/numbering'
import { collectRollups, effectiveValues } from '../engine/rollup'
import { endIso } from './date'
import { csvWithBom, type CsvCell } from './csv'
import { makeEnvelope } from './jsonFile'

const STATUS_TEXT: Record<string, string> = {
  todo: 'todo',
  in_progress: 'in_progress',
  done: 'done',
}

/**
 * One CSV sheet per structure: Code / Name / Level / scheduling columns /
 * the structure type's own attr columns. Both TH+EN appear in headers.
 */
export function structureToCsvRows(project: Project, structure: Structure): CsvCell[][] {
  const nodes = project.nodes
  const cfg = getStructureTypeOrFallback(structure.typeId)
  const rows = flattenStructure(nodes, structure.rootId, structure.collapsedIds, true)
  const rollups = collectRollups(nodes, structure.rootId)

  const header: CsvCell[] = [
    'Code/รหัส',
    'Name/ชื่อ',
    'Level/ระดับ',
    'Start/วันเริ่ม',
    'End/วันสิ้นสุด',
    'Days/ระยะเวลา (วัน)',
    'Progress/ความคืบหน้า (%)',
    'Status/สถานะ',
    'Cost/ต้นทุน',
    ...cfg.columns.filter((c) => c.stored === 'attrs').map((c) => `${c.label.en}/${c.label.th}`),
  ]

  const body = rows.map((row) => {
    const { values } = effectiveValues(nodes, row.id, rollups)
    const end =
      values.startDate !== undefined && values.durationDays !== undefined
        ? endIso(values.startDate, values.durationDays)
        : values.endDate
    const line: CsvCell[] = [
      row.code,
      row.node.name,
      row.depth + 1,
      values.startDate ?? '',
      end ?? '',
      values.durationDays ?? '',
      values.progress ?? '',
      values.status ? (STATUS_TEXT[values.status] ?? values.status) : '',
      values.cost ?? '',
    ]
    for (const col of cfg.columns) {
      if (col.stored !== 'attrs') continue
      line.push(row.node.attrs?.[col.key] ?? '')
    }
    return line
  })

  return [header, ...body]
}

export function projectToCsv(project: Project, structure: Structure): string {
  return csvWithBom(structureToCsvRows(project, structure))
}

export function projectToJson(project: Project): string {
  return JSON.stringify(makeEnvelope(project), null, 2)
}

/** Count of schedulable leaves still missing dates — used by warnings. */
export function missingDateCount(project: Project, structureId?: ID): number {
  const structures = structureId
    ? project.structures.filter((s) => s.id === structureId)
    : project.structures
  let count = 0
  for (const s of structures) {
    const cfg = getStructureTypeOrFallback(s.typeId)
    if (!cfg.capabilities.scheduling) continue
    for (const id of subtreeLeaves(project, s.rootId)) {
      const n = project.nodes[id]
      if (!n.startDate || (n.durationDays === undefined && !n.isMilestone)) count++
    }
  }
  return count
}

function subtreeLeaves(project: Project, rootId: ID): ID[] {
  const out: ID[] = []
  const walk = (id: ID) => {
    const n = project.nodes[id]
    if (!n) return
    if (n.childIds.length === 0) out.push(id)
    n.childIds.forEach(walk)
  }
  walk(rootId)
  return out
}
