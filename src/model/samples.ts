/**
 * Five ready-made sample projects for learning the app, one per project
 * flavour: construction (full showcase), software (PBS + parallel work),
 * event (tight timeline), marketing launch (RBS-heavy), office move
 * (minimal WBS-only). Built with the same primitives the store uses and
 * scheduled through the real CPM forward pass, so dependency dates line up
 * exactly with what the Gantt draws. Statuses/progress derive automatically
 * from each task's dates vs today.
 */

import { computeCpmOffsets } from '../engine/cpm'
import { addDaysIso, endIso, todayIso } from '../lib/date'
import type {
  DependencyType,
  ID,
  LinkKind,
  Project,
  TreeNode,
} from './types'
import { createNode, createStructure, newProject } from './defaults'

// --- Spec types ---------------------------------------------------------------

interface LeafSpec {
  key: string
  name: string
  /** Duration in days; milestones ignore it. Omitted → plain undated node. */
  duration?: number
  milestone?: boolean
  cost?: number
  attrs?: Record<string, string | number | boolean | null>
  notes?: string
}
type NodeSpec = LeafSpec & { children?: NodeSpec[] }

interface DepSpec {
  from: string
  to: string
  type?: DependencyType
  lag?: number
}

interface LinkSpec {
  kind: LinkKind
  from: string
  to: string
}

interface ExtraStructureSpec {
  typeId: 'obs' | 'cbs' | 'rbs' | 'pbs'
  name: string
  nodes: NodeSpec[]
}

interface SampleSpec {
  id: string
  name: string
  /** ISO date the whole network starts from. */
  startIso: string
  wbs: NodeSpec[]
  deps?: DepSpec[]
  extraStructures?: ExtraStructureSpec[]
  links?: LinkSpec[]
}

// --- Builder ------------------------------------------------------------------

/** key→id map for one structure's built subtree. */
type KeyMap = Record<string, ID>

function buildSubtree(
  structureId: ID,
  parentId: ID,
  specs: NodeSpec[],
  projectNodes: Record<ID, TreeNode>,
): KeyMap {
  const keys: KeyMap = {}
  for (const spec of specs) {
    const node = createNode(structureId, spec.name)
    if (spec.cost !== undefined) node.cost = spec.cost
    if (spec.notes !== undefined) node.notes = spec.notes
    if (spec.attrs) node.attrs = spec.attrs
    if (spec.milestone) node.isMilestone = true

    node.parentId = parentId
    projectNodes[node.id] = node
    projectNodes[parentId].childIds.push(node.id)
    keys[spec.key] = node.id

    if (spec.children?.length) {
      Object.assign(keys, buildSubtree(structureId, node.id, spec.children, projectNodes))
    }
  }
  return keys
}

/** Leaves in DFS order with their duration (0 for milestones). */
function leafSpecs(specs: NodeSpec[]): { spec: LeafSpec; depth: number }[] {
  const out: { spec: LeafSpec; depth: number }[] = []
  const walk = (list: NodeSpec[], depth: number) => {
    for (const s of list) {
      if (s.children?.length) walk(s.children, depth + 1)
      else out.push({ spec: s, depth })
    }
  }
  walk(specs, 0)
  return out
}

/**
 * Fill every WBS leaf's startDate/durationDays from a CPM pass over its dep
 * network, then stamp status/progress by comparing dates to today:
 * finished → done/100%, spanning today → in_progress/50%, future → todo.
 */
function scheduleWbs(
  project: Project,
  specs: NodeSpec[],
  keys: KeyMap,
  deps: DepSpec[],
  startIso: string,
): void {
  const leaves = leafSpecs(specs)
  const tasks = leaves.map(({ spec }) => ({
    id: spec.key,
    duration: spec.milestone ? 0 : Math.max(1, spec.duration ?? 1),
  }))
  const edges = deps.map((d) => ({
    fromNodeId: d.from,
    toNodeId: d.to,
    type: d.type ?? ('FS' as DependencyType),
    lagDays: d.lag ?? 0,
  }))

  const cpm = computeCpmOffsets(tasks, edges)

  const today = todayIso()
  for (const { spec } of leaves) {
    const node = project.nodes[keys[spec.key]]
    const r = cpm.get(spec.key)
    // No incoming edge → es is 0, so standalone tasks start at the project date.
    node.startDate = addDaysIso(startIso, r?.es ?? 0)
    node.durationDays = spec.milestone ? 0 : Math.max(0, spec.duration ?? 0)

    if (node.isMilestone || node.durationDays === undefined || node.durationDays === null)
      continue
    const end = endIso(node.startDate, node.durationDays)
    if (end < today) {
      node.status = 'done'
      node.progress = 100
    } else if (node.startDate <= today && end >= today) {
      node.status = 'in_progress'
      node.progress = 50
    } else {
      node.status = 'todo'
    }
  }
}

function buildSample(spec: SampleSpec): Project {
  const project = newProject(spec.name)
  project.id = spec.id

  const wbsKeys = buildSubtree(
    project.structures[0].id,
    project.structures[0].rootId,
    spec.wbs,
    project.nodes,
  )
  scheduleWbs(project, spec.wbs, wbsKeys, spec.deps ?? [], spec.startIso)

  const structureKeys: Record<string, KeyMap> = {}
  for (const extra of spec.extraStructures ?? []) {
    const created = createStructure(extra.typeId, extra.name)
    project.structures.push(created.structure)
    Object.assign(project.nodes, created.nodes)
    // Name the synthetic root so Gantt rows read nicely when included.
    created.nodes[created.structure.rootId].name = extra.name
    structureKeys[extra.typeId] = buildSubtree(
      created.structure.id,
      created.structure.rootId,
      extra.nodes,
      project.nodes,
    )
  }

  project.dependencies = (spec.deps ?? []).map((d, i) => ({
    id: `dep-${i}`,
    fromNodeId: wbsKeys[d.from],
    toNodeId: wbsKeys[d.to],
    type: d.type ?? 'FS',
    lagDays: d.lag ?? 0,
  }))

  project.links = (spec.links ?? []).map((l, i) => {
    // Links always go WBS → target structure node.
    const fromId = wbsKeys[l.from]
    const toMap = Object.values(structureKeys).find((map) => map[l.to])
    const toId = toMap?.[l.to] ?? null
    if (!fromId || !toId) throw new Error(`bad link spec: ${l.kind} ${l.from}->${l.to}`)
    return { id: `link-${i}`, kind: l.kind, fromNodeId: fromId, toNodeId: toId }
  })

  return project
}

// --- The five samples -----------------------------------------------------------

export interface SampleEntry {
  id: string
  name: string
  build: () => Project
}

export const SAMPLE_PROJECTS: SampleEntry[] = [
  {
    id: 'sample-construction',
    name: 'ตัวอย่าง 1 · ก่อสร้างอาคารสำนักงาน',
    build: () =>
      buildSample({
        id: 'sample-construction',
        name: 'ตัวอย่าง 1 · ก่อสร้างอาคารสำนักงาน',
        startIso: '2026-06-01',
        wbs: [
          {
            key: 'design',
            name: 'งานออกแบบและขออนุญาต',
            children: [
              { key: 'arch', name: 'ออกแบบสถาปัตยกรรม', duration: 20, cost: 150000 },
              { key: 'struct', name: 'ออกแบบโครงสร้างและระบบ', duration: 20, cost: 180000 },
              { key: 'permit', name: 'ขอใบอนุญาตก่อสร้าง', duration: 25, cost: 30000 },
              { key: 'permitDone', name: 'ได้รับใบอนุญาต', milestone: true },
            ],
          },
          {
            key: 'structure',
            name: 'งานฐานรากและโครงสร้าง',
            children: [
              { key: 'piling', name: 'งานเสาเข็ม', duration: 20, cost: 450000 },
              { key: 'footing', name: 'หล่อฐานราก', duration: 15, cost: 380000 },
              { key: 'frame', name: 'โครงสร้างชั้น 1–3', duration: 45, cost: 950000 },
            ],
          },
          {
            key: 'mep',
            name: 'งานระบบและงานตกแต่ง',
            children: [
              { key: 'mepWork', name: 'ระบบไฟฟ้าและสุขาภิบาล', duration: 40, cost: 620000 },
              { key: 'plaster', name: 'งานฉาบและทาสี', duration: 25, cost: 400000 },
              { key: 'interior', name: 'งานตกแต่งภายใน', duration: 30, cost: 750000 },
            ],
          },
          {
            key: 'handover',
            name: 'การส่งมอบ',
            children: [
              { key: 'testing', name: 'ทดสอบระบบ', duration: 10, cost: 80000 },
              { key: 'handoverDay', name: 'ส่งมอบอาคาร', milestone: true },
            ],
          },
        ],
        deps: [
          { from: 'arch', to: 'struct' },
          { from: 'struct', to: 'permit' },
          { from: 'permit', to: 'permitDone' },
          { from: 'permitDone', to: 'piling' },
          { from: 'piling', to: 'footing' },
          { from: 'footing', to: 'frame' },
          { from: 'frame', to: 'mepWork', type: 'SS', lag: 30 },
          { from: 'mepWork', to: 'plaster' },
          { from: 'plaster', to: 'interior' },
          { from: 'interior', to: 'testing' },
          { from: 'testing', to: 'handoverDay' },
        ],
        extraStructures: [
          {
            typeId: 'obs',
            name: 'หน่วยงานในโครงการ (OBS)',
            nodes: [
              { key: 'mgmt', name: 'ฝ่ายบริหารโครงการ', attrs: { owner: 'คุณสมชาย วงศ์ประเสริฐ' } },
              { key: 'designOrg', name: 'ฝ่ายออกแบบ', attrs: { owner: 'สถป. ออกแบบร่วม' } },
              { key: 'contractor', name: 'ผู้รับเหมาก่อสร้าง', attrs: { owner: 'บจก. สร้างการ' } },
              { key: 'qa', name: 'ฝ่ายควบคุมคุณภาพ', attrs: { owner: 'วศ. อารีย์ ใจดี' } },
            ],
          },
          {
            typeId: 'cbs',
            name: 'หมวดต้นทุน (CBS)',
            nodes: [
              { key: 'cDesign', name: 'ค่าออกแบบ', attrs: { budget: 400000 } },
              { key: 'cMaterial', name: 'ค่าวัสดุ', attrs: { budget: 1400000 } },
              { key: 'cLabour', name: 'ค่าแรงงาน', attrs: { budget: 900000 } },
              { key: 'cTest', name: 'ค่าทดสอบและส่งมอบ', attrs: { budget: 150000 } },
              { key: 'cReserve', name: 'สำรองฉุกเฉิน', attrs: { budget: 250000 } },
            ],
          },
          {
            typeId: 'rbs',
            name: 'ทะเบียนความเสี่ยง (RBS)',
            nodes: [
              {
                key: 'rExternal',
                name: 'ความเสี่ยงภายนอก',
                children: [
                  {
                    key: 'rain',
                    name: 'ฝนตกซ้ำซากทำงานล่าช้า',
                    attrs: { probability: 40, impact: 'high', response: 'เผื่อเวลาไว้ในแผนงานกลางแจ้ง' },
                  },
                  {
                    key: 'price',
                    name: 'ราคาวัสดุผันผวน',
                    attrs: { probability: 50, impact: 'medium', response: 'ล็อกราคากับซัพพลายเออร์ล่วงหน้า' },
                  },
                ],
              },
              {
                key: 'rOps',
                name: 'ความเสี่ยงการดำเนินงาน',
                children: [
                  {
                    key: 'labour',
                    name: 'แรงงานขาดมือช่วงเร่งงาน',
                    attrs: { probability: 30, impact: 'high', response: 'สัญญาระบุโทษความล่าช้า + มีผู้รับเหมาสำรอง' },
                  },
                  {
                    key: 'change',
                    name: 'เจ้าของงานขอแบบเปลี่ยนกลางทาง',
                    attrs: { probability: 35, impact: 'medium', response: 'ตรึงแบบก่อนเริ่มงาน + change control' },
                  },
                ],
              },
            ],
          },
        ],
        links: [
          { kind: 'assigns', from: 'arch', to: 'designOrg' },
          { kind: 'assigns', from: 'struct', to: 'designOrg' },
          { kind: 'assigns', from: 'piling', to: 'contractor' },
          { kind: 'assigns', from: 'footing', to: 'contractor' },
          { kind: 'assigns', from: 'frame', to: 'contractor' },
          { kind: 'assigns', from: 'testing', to: 'qa' },
          { kind: 'charges', from: 'arch', to: 'cDesign' },
          { kind: 'charges', from: 'struct', to: 'cDesign' },
          { kind: 'charges', from: 'piling', to: 'cMaterial' },
          { kind: 'charges', from: 'footing', to: 'cMaterial' },
          { kind: 'charges', from: 'plaster', to: 'cLabour' },
          { kind: 'charges', from: 'testing', to: 'cTest' },
        ],
      }),
  },

  {
    id: 'sample-mobile-app',
    name: 'ตัวอย่าง 2 · พัฒนาแอปมือถือ FoodieGo',
    build: () =>
      buildSample({
        id: 'sample-mobile-app',
        name: 'ตัวอย่าง 2 · พัฒนาแอปมือถือ FoodieGo',
        startIso: '2026-09-01',
        wbs: [
          {
            key: 'discovery',
            name: 'Discovery',
            children: [
              { key: 'research', name: 'สัมภาษณ์ผู้ใช้และร้านค้า', duration: 8 },
              { key: 'scope', name: 'สรุป scope และ user story', duration: 5 },
            ],
          },
          {
            key: 'ux',
            name: 'ออกแบบประสบการณ์',
            children: [
              { key: 'wireframe', name: 'Wireframe หน้าจอหลัก', duration: 7 },
              { key: 'uikit', name: 'UI Kit และ Design System', duration: 8 },
              { key: 'prototype', name: 'Prototype คลิกได้', duration: 5 },
            ],
          },
          {
            key: 'dev',
            name: 'พัฒนา',
            children: [
              { key: 'backend', name: 'ตั้งโครง backend + CI', duration: 6 },
              { key: 'auth', name: 'โมดูลสมาชิกและล็อกอิน', duration: 10 },
              { key: 'menu', name: 'โมดูลเมนูและค้นหาร้าน', duration: 12 },
              { key: 'cart', name: 'โมดูลตะกร้าและชำระเงิน', duration: 10 },
              { key: 'api', name: 'เชื่อม API ร้านค้า', duration: 8 },
            ],
          },
          {
            key: 'test',
            name: 'ทดสอบ',
            children: [
              { key: 'qa', name: 'QA รวมทุกโมดูล', duration: 10 },
              { key: 'beta', name: 'Beta กับร้านนำร่อง', duration: 10 },
            ],
          },
          {
            key: 'launch',
            name: 'เปิดตัว',
            children: [
              { key: 'storeReview', name: 'ส่งรีวิว App Store / Play Store', duration: 7 },
              { key: 'launchDay', name: 'เปิดตัว v1.0', milestone: true },
            ],
          },
        ],
        deps: [
          { from: 'research', to: 'scope' },
          { from: 'scope', to: 'wireframe' },
          { from: 'wireframe', to: 'uikit' },
          { from: 'uikit', to: 'prototype' },
          { from: 'scope', to: 'backend' }, // dev starts in parallel with design
          { from: 'backend', to: 'auth' },
          { from: 'backend', to: 'menu' },
          { from: 'auth', to: 'cart' },
          { from: 'menu', to: 'cart' },
          { from: 'menu', to: 'api' },
          { from: 'cart', to: 'qa' },
          { from: 'api', to: 'qa' },
          { from: 'qa', to: 'beta' },
          { from: 'beta', to: 'storeReview' },
          { from: 'storeReview', to: 'launchDay' },
        ],
        extraStructures: [
          {
            typeId: 'pbs',
            name: 'โครงสร้างผลผลิต (PBS)',
            nodes: [
              { key: 'pAuth', name: 'โมดูลสมาชิก', attrs: { version: '1.0' } },
              { key: 'pMenu', name: 'โมดูลเมนูและค้นหา', attrs: { version: '1.0' } },
              { key: 'pCart', name: 'โมดูลสั่งซื้อ/ชำระเงิน', attrs: { version: '1.0' } },
              { key: 'pReview', name: 'ระบบรีวิวร้าน', attrs: { version: '1.1 (roadmap)' } },
            ],
          },
          {
            typeId: 'obs',
            name: 'ทีมงาน (OBS)',
            nodes: [
              { key: 'po', name: 'Product Owner', attrs: { owner: 'คุณไผ่ เตชะณรงค์' } },
              { key: 'designers', name: 'ทีมออกแบบ UX/UI', attrs: { owner: 'คุณมิน ศรีสุข' } },
              { key: 'devs', name: 'ทีม Developer', attrs: { owner: 'คุณโอ๊ต พัฒนกิจ' } },
              { key: 'qas', name: 'ทีม QA', attrs: { owner: 'คุณเจ Jirapat' } },
            ],
          },
        ],
        links: [
          { kind: 'assigns', from: 'wireframe', to: 'designers' },
          { kind: 'assigns', from: 'uikit', to: 'designers' },
          { kind: 'assigns', from: 'auth', to: 'devs' },
          { kind: 'assigns', from: 'cart', to: 'devs' },
          { kind: 'assigns', from: 'qa', to: 'qas' },
        ],
      }),
  },

  {
    id: 'sample-seminar',
    name: 'ตัวอย่าง 3 · จัดสัมมนา Digital Transformation',
    build: () =>
      buildSample({
        id: 'sample-seminar',
        name: 'ตัวอย่าง 3 · จัดสัมมนา Digital Transformation',
        startIso: '2026-08-10',
        wbs: [
          {
            key: 'plan',
            name: 'วางแผนงาน',
            children: [
              { key: 'topic', name: 'กำหนดหัวข้อและวิทยากรเป้าหมาย', duration: 4 },
              { key: 'budget', name: 'งบประมาณและจุดคุ้มทุน', duration: 3 },
            ],
          },
          {
            key: 'content',
            name: 'วิทยากรและเนื้อหา',
            children: [
              { key: 'invite', name: 'เชิญและยืนยันวิทยากร', duration: 14 },
              { key: 'rehearse', name: 'รับสไลด์และซ้อมพูด', duration: 5 },
            ],
          },
          {
            key: 'venue',
            name: 'สถานที่และอุปกรณ์',
            children: [
              { key: 'room', name: 'จองห้องประชุมและที่พักวิทยากร', duration: 5 },
              { key: 'av', name: 'เตรียม AV และระบบสตรีมมิง', duration: 8 },
              { key: 'catering', name: 'จัดเลี้ยงและอาหารว่าง', duration: 4 },
            ],
          },
          {
            key: 'promo',
            name: 'ประชาสัมพันธ์และลงทะเบียน',
            children: [
              { key: 'poster', name: 'โพสเตอร์และหน้าลงทะเบียน', duration: 5 },
              { key: 'social', name: 'โซเชียลมีเดียและ email blast', duration: 8 },
              { key: 'regClose', name: 'ปิดรับลงทะเบียน', milestone: true },
            ],
          },
          {
            key: 'event',
            name: 'วันงาน',
            children: [
              { key: 'checkin', name: 'ลงทะเบียนหน้างานและอำนวยความสะดวก', duration: 1 },
              { key: 'eventDay', name: 'วันจัดสัมมนา', milestone: true },
              { key: 'retro', name: 'สรุปบทเรียนและส่งแบบประเมิน', duration: 3 },
            ],
          },
        ],
        deps: [
          { from: 'topic', to: 'budget' },
          { from: 'topic', to: 'invite' },
          { from: 'invite', to: 'rehearse' },
          { from: 'topic', to: 'room' },
          { from: 'room', to: 'av' },
          { from: 'budget', to: 'poster' },
          { from: 'poster', to: 'social' },
          { from: 'social', to: 'regClose' },
          { from: 'regClose', to: 'checkin' },
          { from: 'rehearse', to: 'eventDay' },
          { from: 'checkin', to: 'eventDay' },
          { from: 'eventDay', to: 'retro' },
        ],
        extraStructures: [
          {
            typeId: 'obs',
            name: 'คณะทำงาน (OBS)',
            nodes: [
              { key: 'chair', name: 'ประธานจัดงาน', attrs: { owner: 'คุณอร วิไลลักษณ์' } },
              { key: 'contentTeam', name: 'ฝ่ายเนื้อหา', attrs: { owner: 'คุณต้น ฤทธิ์มะนาว' } },
              { key: 'venueTeam', name: 'ฝ่ายสถานที่', attrs: { owner: 'คุณกล้วย มณีรัตน์' } },
              { key: 'prTeam', name: 'ฝ่ายประชาสัมพันธ์', attrs: { owner: 'คุณเบลล์ กมลชนก' } },
            ],
          },
          {
            typeId: 'cbs',
            name: 'งบประมาณ (CBS)',
            nodes: [
              { key: 'cRoom', name: 'ค่าห้องและอุปกรณ์', attrs: { budget: 60000 } },
              { key: 'cSpeaker', name: 'ค่าวิทยากร', attrs: { budget: 45000 } },
              { key: 'cFood', name: 'ค่าจัดเลี้ยง', attrs: { budget: 30000 } },
              { key: 'cAds', name: 'ค่าสื่อโฆษณา', attrs: { budget: 25000 } },
              { key: 'cGift', name: 'ของที่ระลึกและเอกสาร', attrs: { budget: 12000 } },
            ],
          },
        ],
        links: [
          { kind: 'assigns', from: 'invite', to: 'contentTeam' },
          { kind: 'assigns', from: 'av', to: 'venueTeam' },
          { kind: 'assigns', from: 'checkin', to: 'venueTeam' },
          { kind: 'assigns', from: 'social', to: 'prTeam' },
          { kind: 'charges', from: 'room', to: 'cRoom' },
          { kind: 'charges', from: 'invite', to: 'cSpeaker' },
          { kind: 'charges', from: 'catering', to: 'cFood' },
          { kind: 'charges', from: 'social', to: 'cAds' },
        ],
      }),
  },

  {
    id: 'sample-marketing-launch',
    name: 'ตัวอย่าง 4 · แคมเปญเปิดตัวเครื่องฟอกอากาศ AIRA X1',
    build: () =>
      buildSample({
        id: 'sample-marketing-launch',
        name: 'ตัวอย่าง 4 · แคมเปญเปิดตัวเครื่องฟอกอากาศ AIRA X1',
        startIso: '2026-09-15',
        wbs: [
          {
            key: 'prep',
            name: 'งานเตรียม',
            children: [
              { key: 'positioning', name: 'กำหนด positioning และข้อความหลัก', duration: 7 },
              { key: 'kpi', name: 'ตั้ง KPI และงบแคมเปญ', duration: 4 },
            ],
          },
          {
            key: 'content',
            name: 'สื่อและคอนเทนต์',
            children: [
              { key: 'video', name: 'ถ่ายทำวิดีโอโฆษณา', duration: 12 },
              { key: 'socialContent', name: 'คอนเทนต์โซเชียล 30 ชิ้น', duration: 15 },
              { key: 'website', name: 'หน้าเว็บผลิตภัณฑ์', duration: 10 },
            ],
          },
          {
            key: 'ads',
            name: 'สื่อโฆษณา',
            children: [
              { key: 'mediaPlan', name: 'วางแผนซื้อสื่อ (media plan)', duration: 6 },
              { key: 'goLive', name: 'ปล่อยแคมเปญออนไลน์', duration: 3 },
            ],
          },
          {
            key: 'pr',
            name: 'PR และพาร์ตเนอร์',
            children: [
              { key: 'pressEvent', name: 'จัด press launch event', duration: 5 },
              { key: 'influencer', name: 'ติดต่อ influencer รีวิวสินค้า', duration: 12 },
            ],
          },
          {
            key: 'measure',
            name: 'วัดผล',
            children: [
              { key: 'onSale', name: 'เริ่มเปิดขายพร้อมแคมเปญ', milestone: true },
              { key: 'track', name: 'ติดตาม KPI รายสัปดาห์', duration: 28 },
            ],
          },
        ],
        deps: [
          { from: 'positioning', to: 'kpi' },
          { from: 'positioning', to: 'video' },
          { from: 'positioning', to: 'socialContent' },
          { from: 'positioning', to: 'website' },
          { from: 'kpi', to: 'mediaPlan' },
          { from: 'mediaPlan', to: 'goLive' },
          { from: 'video', to: 'goLive' },
          { from: 'website', to: 'pressEvent' },
          { from: 'goLive', to: 'onSale' },
          { from: 'pressEvent', to: 'onSale' },
          { from: 'onSale', to: 'track' },
        ],
        extraStructures: [
          {
            typeId: 'rbs',
            name: 'ความเสี่ยงแคมเปญ (RBS)',
            nodes: [
              {
                key: 'market',
                name: 'ความเสี่ยงตลาด',
                children: [
                  {
                    key: 'competitor',
                    name: 'คู่แข่งปล่อยโปรโมชันตีราคาช่วงเดียวกัน',
                    attrs: { probability: 40, impact: 'high', response: 'เตรียม bundle และสิทธิพิเศษล่วงหน้า' },
                  },
                  {
                    key: 'viralMiss',
                    name: 'คอนเทนต์ไม่ไวรัลตามเป้า',
                    attrs: { probability: 35, impact: 'medium', response: 'สำรองงบ boost โพสต์ที่ engagement ดี' },
                  },
                ],
              },
              {
                key: 'supply',
                name: 'ความเสี่ยงอุปทาน',
                children: [
                  {
                    key: 'stock',
                    name: 'สต๊อกสินค้าไม่ทันวันเปิดขาย',
                    attrs: { probability: 25, impact: 'high', response: 'เปิด pre-order + สื่อสารวันส่งมอบชัดเจน' },
                  },
                  {
                    key: 'overspend',
                    name: 'งบโฆษณาบานปลาย',
                    attrs: { probability: 30, impact: 'medium', response: 'รีวิว spend รายสัปดาห์กับทีมการเงิน' },
                  },
                ],
              },
            ],
          },
          {
            typeId: 'cbs',
            name: 'งบแคมเปญ (CBS)',
            nodes: [
              { key: 'cProduce', name: 'งบผลิตสื่อ', attrs: { budget: 800000 } },
              { key: 'cMedia', name: 'งบซื้อสื่อโฆษณา', attrs: { budget: 1500000 } },
              { key: 'cEvent', name: 'งบอีเวนต์และ PR', attrs: { budget: 500000 } },
              { key: 'cInfluencer', name: 'ค่าอินฟลูเอนเซอร์', attrs: { budget: 400000 } },
            ],
          },
        ],
        links: [
          { kind: 'charges', from: 'video', to: 'cProduce' },
          { kind: 'charges', from: 'socialContent', to: 'cProduce' },
          { kind: 'charges', from: 'mediaPlan', to: 'cMedia' },
          { kind: 'charges', from: 'pressEvent', to: 'cEvent' },
          { kind: 'charges', from: 'influencer', to: 'cInfluencer' },
        ],
      }),
  },

  {
    id: 'sample-office-move',
    name: 'ตัวอย่าง 5 · ย้ายสำนักงาน',
    build: () =>
      buildSample({
        id: 'sample-office-move',
        name: 'ตัวอย่าง 5 · ย้ายสำนักงาน',
        startIso: '2026-10-01',
        wbs: [
          {
            key: 'prep',
            name: 'เตรียมการ',
            children: [
              { key: 'survey', name: 'สำรวจความต้องการพื้นที่', duration: 5 },
              { key: 'lease', name: 'เลือกและเซ็นสัญญาอาคารใหม่', duration: 10 },
              { key: 'layout', name: 'ออกแบบผังสำนักงาน', duration: 10 },
            ],
          },
          {
            key: 'fitout',
            name: 'ปรับปรุงอาคารใหม่',
            children: [
              { key: 'decor', name: 'ตกแต่งและระบบไฟ–แอร์', duration: 20 },
              { key: 'network', name: 'ติดตั้งเน็ตและโทรศัพท์', duration: 5 },
            ],
          },
          {
            key: 'move',
            name: 'การย้าย',
            children: [
              { key: 'mover', name: 'จ้างบริษัทขนย้าย', duration: 4 },
              { key: 'itMove', name: 'ย้ายเซิร์ฟเวอร์และอุปกรณ์ IT', duration: 2 },
              { key: 'moveDay', name: 'วันย้ายจริง', milestone: true },
            ],
          },
          {
            key: 'after',
            name: 'หลังย้าย',
            children: [
              { key: 'oldSite', name: 'คืนอาคารเก่า', duration: 5 },
              { key: 'settle', name: 'แก้ปัญหาช่วงเริ่มใช้งาน', duration: 10 },
            ],
          },
        ],
        deps: [
          { from: 'survey', to: 'lease' },
          { from: 'lease', to: 'layout' },
          { from: 'layout', to: 'decor' },
          { from: 'decor', to: 'network', lag: 10 },
          { from: 'network', to: 'mover' },
          { from: 'network', to: 'itMove' },
          { from: 'mover', to: 'moveDay' },
          { from: 'itMove', to: 'moveDay' },
          { from: 'moveDay', to: 'oldSite' },
          { from: 'moveDay', to: 'settle' },
        ],
      }),
  },
]
