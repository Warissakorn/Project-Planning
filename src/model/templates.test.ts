import { describe, expect, it } from 'vitest'
import { countTemplateTasks, TEMPLATE_CATEGORIES } from './templates'
import type { Project, TreeNode } from './types'

/** WBS nodes of a built project in DFS order with depth (root = 0). */
function wbsRows(project: Project): { node: TreeNode; depth: number }[] {
  const wbs = project.structures[0]
  const out: { node: TreeNode; depth: number }[] = []
  const walk = (id: string, depth: number) => {
    out.push({ node: project.nodes[id], depth })
    for (const c of project.nodes[id].childIds) walk(c, depth + 1)
  }
  walk(wbs.rootId, 0)
  return out
}

describe('template library', () => {
  it('has ≥2 templates in every category and unique ids/names overall', () => {
    const ids: string[] = []
    const names: string[] = []
    for (const cat of TEMPLATE_CATEGORIES) {
      expect(cat.templates.length).toBeGreaterThanOrEqual(2)
      for (const t of cat.templates) {
        ids.push(t.id)
        names.push(t.name.th)
      }
    }
    expect(new Set(ids).size).toBe(ids.length)
    expect(new Set(names).size).toBe(names.length)
    expect(TEMPLATE_CATEGORIES.length).toBeGreaterThanOrEqual(6)
  })

  for (const cat of TEMPLATE_CATEGORIES) {
    describe(`category ${cat.id}`, () => {
      for (const entry of cat.templates) {
        describe(entry.id, () => {
          // Build once per assertion batch — the builder throws on bad dep/link
          // keys, so any spec typo surfaces right here at test time.
          const project = entry.build()
          const rows = wbsRows(project)
          const leaves = rows.filter((r) => r.node.childIds.length === 0)

          it('builds a WBS with phases AND leaf tasks below the root', () => {
            expect(rows[0].node.childIds.length).toBeGreaterThanOrEqual(3) // phases
            expect(leaves.length).toBeGreaterThanOrEqual(8)
            // Depth ≥2 somewhere under the root → main tasks carry subtasks
            expect(rows.some((r) => r.depth >= 3)).toBe(true)
          })

          it('schedules every leaf via CPM (startDate stamped)', () => {
            for (const { node } of leaves) {
              expect(node.startDate, `${node.name} missing startDate`).toBeTruthy()
              // Milestones are zero-length; real tasks at least one day.
              if (node.isMilestone) expect(node.durationDays).toBe(0)
              else expect(node.durationDays).toBeGreaterThanOrEqual(1)
            }
          })

          it('produces fresh ids on every instantiation', () => {
            expect(project.id).not.toBe(entry.build().id)
          })

          it('reports phase/task counts matching the built tree', () => {
            const counts = countTemplateTasks(entry)
            expect(counts.phases).toBe(rows[0].node.childIds.length)
            expect(counts.tasks).toBe(leaves.length)
          })
        })
      }
    })
  }
})
