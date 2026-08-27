/**
 * Project template library: ready-made WBS starting points grouped by
 * category, each carrying phases → main tasks → subtasks with durations and
 * basic dependencies. Unlike the showcase samples, templates stay WBS-only
 * (no OBS/CBS/RBS/PBS) and omit a fixed id/start date, so every instantiation
 * is a fresh project scheduled to start today via the CPM builder.
 */

import type { Bilingual, ID, Lang, Project } from '../types'
import { CONSTRUCTION_TEMPLATES } from './construction'
import { SOFTWARE_TEMPLATES } from './software'
import { MARKETING_TEMPLATES } from './marketing'
import { EVENT_TEMPLATES } from './events'
import { BUSINESS_TEMPLATES } from './business'
import { PERSONAL_TEMPLATES } from './personal'

export interface TemplateEntry {
  /** Stable template id ('tpl-house-build') — never used as a project id. */
  id: string
  name: Bilingual
  desc: Bilingual
  build: (lang: Lang) => Project
}

export interface TemplateCategory {
  id: string
  label: Bilingual
  emoji: string
  templates: TemplateEntry[]
}

export const TEMPLATE_CATEGORIES: TemplateCategory[] = [
  {
    id: 'construction',
    label: { th: 'ก่อสร้าง / บ้าน', en: 'Construction' },
    emoji: '🏗️',
    templates: CONSTRUCTION_TEMPLATES,
  },
  {
    id: 'software',
    label: { th: 'IT / Software', en: 'IT / Software' },
    emoji: '💻',
    templates: SOFTWARE_TEMPLATES,
  },
  {
    id: 'marketing',
    label: { th: 'การตลาด', en: 'Marketing' },
    emoji: '📣',
    templates: MARKETING_TEMPLATES,
  },
  {
    id: 'events',
    label: { th: 'อีเวนต์', en: 'Events' },
    emoji: '🎪',
    templates: EVENT_TEMPLATES,
  },
  {
    id: 'business',
    label: { th: 'ธุรกิจ / องค์กร', en: 'Business' },
    emoji: '🏪',
    templates: BUSINESS_TEMPLATES,
  },
  {
    id: 'personal',
    label: { th: 'ส่วนบุคคล / เรียน', en: 'Personal / Study' },
    emoji: '🎓',
    templates: PERSONAL_TEMPLATES,
  },
]

/**
 * Phase (top-level branch) and leaf counts for the picker's meta line. The
 * shape is language-independent, so counting in Thai is enough.
 */
export function countTemplateTasks(t: TemplateEntry): { phases: number; tasks: number } {
  const p = t.build('th')
  const wbs = p.structures[0]
  const root = p.nodes[wbs.rootId]
  const leaves = (id: ID): number => {
    const n = p.nodes[id]
    return n.childIds.length === 0 ? 1 : n.childIds.reduce((s, c) => s + leaves(c), 0)
  }
  return { phases: root.childIds.length, tasks: leaves(wbs.rootId) }
}
