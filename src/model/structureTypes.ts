import type {
  ColumnDef,
  LinkKind,
  StructureTypeCapabilities,
  StructureTypeConfig,
  StructureTypeId,
} from './types'

/**
 * Built-in breakdown-structure presets. Every structure instance points at one
 * of these ids; the registry drives which tree columns render and what the
 * structure can do (scheduling / costing / dependencies / cross-links).
 * A future custom-type flow would clone a preset and edit its columns.
 */

/** Helper to keep column defs readable. */
function column(
  key: string,
  label: { th: string; en: string },
  kind: ColumnDef['kind'],
  stored: ColumnDef['stored'],
  aggregate: ColumnDef['aggregate'] = 'none',
  options?: string[],
): ColumnDef {
  return { key, label, kind, stored, aggregate, options }
}

const caps = (partial: Partial<StructureTypeCapabilities> = {}): StructureTypeCapabilities => ({
  scheduling: false,
  costing: false,
  dependencySource: false,
  linkableFrom: [] as LinkKind[],
  linkableTo: [] as LinkKind[],
  ...partial,
})

const wbsColumns: ColumnDef[] = [
  column('startDate', { th: 'เริ่ม', en: 'Start' }, 'date', 'core'),
  column('durationDays', { th: 'วัน', en: 'Days' }, 'number', 'core'),
  column('progress', { th: 'คืบหน้า', en: 'Progress' }, 'percent', 'core'),
  column('status', { th: 'สถานะ', en: 'Status' }, 'select', 'core', 'none', [
    'todo',
    'in_progress',
    'done',
  ]),
  column('cost', { th: 'ต้นทุน', en: 'Cost' }, 'currency', 'core', 'sum'),
]

const obsColumns: ColumnDef[] = [
  column('owner', { th: 'ผู้รับผิดชอบ', en: 'Owner' }, 'text', 'attrs'),
]

const cbsColumns: ColumnDef[] = [
  column('budget', { th: 'งบประมาณ', en: 'Budget' }, 'currency', 'attrs', 'sum'),
]

const rbsColumns: ColumnDef[] = [
  column('probability', { th: 'โอกาสเกิด', en: 'Probability' }, 'percent', 'attrs'),
  column('impact', { th: 'ผลกระทบ', en: 'Impact' }, 'select', 'attrs', 'none', [
    'low',
    'medium',
    'high',
  ]),
  column('response', { th: 'แผนรับมือ', en: 'Response' }, 'text', 'attrs'),
]

const pbsColumns: ColumnDef[] = [
  column('version', { th: 'เวอร์ชัน', en: 'Version' }, 'text', 'attrs'),
]

export const STRUCTURE_TYPE_PRESETS: StructureTypeConfig[] = [
  {
    id: 'wbs',
    label: { th: 'โครงสร้างการทำงาน (WBS)', en: 'Work Breakdown (WBS)' },
    capabilities: caps({
      scheduling: true,
      costing: true,
      dependencySource: true,
      linkableFrom: ['assigns', 'charges'],
    }),
    columns: wbsColumns,
  },
  {
    id: 'obs',
    label: { th: 'โครงสร้างองค์กร (OBS)', en: 'Organization (OBS)' },
    capabilities: caps({ linkableTo: ['assigns'] }),
    columns: obsColumns,
  },
  {
    id: 'cbs',
    label: { th: 'โครงสร้างต้นทุน (CBS)', en: 'Cost (CBS)' },
    capabilities: caps({ costing: true, linkableTo: ['charges'] }),
    columns: cbsColumns,
  },
  {
    id: 'rbs',
    label: { th: 'โครงสร้างความเสี่ยง (RBS)', en: 'Risk (RBS)' },
    capabilities: caps(),
    columns: rbsColumns,
  },
  {
    id: 'pbs',
    label: { th: 'โครงสร้างผลผลิต (PBS)', en: 'Product (PBS)' },
    capabilities: caps(),
    columns: pbsColumns,
  },
]

const REGISTRY: Record<StructureTypeId, StructureTypeConfig> = Object.fromEntries(
  STRUCTURE_TYPE_PRESETS.map((t) => [t.id, t]),
)

export function getStructureType(id: StructureTypeId): StructureTypeConfig | undefined {
  return REGISTRY[id]
}

/** Unknown/custom type ids fall back to a neutral config instead of crashing. */
export function getStructureTypeOrFallback(id: StructureTypeId): StructureTypeConfig {
  return (
    REGISTRY[id] ?? {
      id,
      label: { th: id, en: id },
      capabilities: caps(),
      columns: [],
    }
  )
}
