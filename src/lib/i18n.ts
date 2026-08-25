import { useCallback } from 'react'
import type { Bilingual, Lang } from '../model/types'
import { useAppStore } from '../state/store'

/**
 * Lightweight i18n: flat dictionaries typed so `en` must have exactly the same
 * keys as `th` (compiler-enforced parity). Technical terms like WBS / Gantt /
 * CPM stay English in both languages.
 */

const th = {
  appName: 'Breakdown Planner',

  // generic
  cancel: 'ยกเลิก',
  save: 'บันทึก',
  delete: 'ลบ',
  rename: 'เปลี่ยนชื่อ',
  duplicate: 'ทำสำเนา',
  open: 'เปิด',
  close: 'ปิด',
  add: 'เพิ่ม',
  untitled: '(ไม่มีชื่อ)',
  confirmDeleteTitle: 'ยืนยันการลบ',
  confirmDeleteText: 'ลบ “{name}” พร้อมทุกรายการย่อย?',
  backToProjects: 'กลับหน้าโปรเจ็ค',

  // project list page
  projects: 'โปรเจ็คของฉัน',
  newProject: 'สร้างโปรเจ็คใหม่',
  projectNameLabel: 'ชื่อโปรเจ็ค',
  projectNamePlaceholder: 'เช่น โครงการต่ออาคารสำนักงาน',
  noProjects: 'ยังไม่มีโปรเจ็ค — กด “สร้างโปรเจ็คใหม่” เพื่อเริ่มต้น',
  createdLabel: 'สร้าง',
  updatedLabel: 'แก้ไข',
  structuresCount: '{n} โครงสร้าง',
  tasksCount: '{n} งาน',
  storageUsage: 'พื้นที่จัดเก็บ: {size}',
  storageWarning: 'พื้นที่ใกล้เต็ม — แนะนำส่งออกไฟล์ JSON เก็บไว้',
  loadSamples: 'โหลดตัวอย่าง 5 โปรเจ็ค',

  // workspace header
  undo: 'Undo',
  redo: 'Redo',
  importJson: 'นำเข้า JSON',
  exportMenu: 'ส่งออก',
  exportJson: 'ส่งออก JSON',
  exportCsv: 'ส่งออก CSV',
  importErrInvalidJson: 'ไฟล์ที่เลือกไม่ใช่ JSON ที่ถูกต้อง',
  importErrInvalidFormat: 'โครงสร้างไฟล์ไม่ตรงกับไฟล์ส่งออกของ Breakdown Planner',
  importErrNewerVersion: 'ไฟล์นี้สร้างจากแอปเวอร์ชันที่ใหม่กว่า — โปรดอัปเดตแอปก่อนนำเข้า',

  // workspace / tree
  treeView: 'ตาราง',
  ganttView: 'Gantt',
  addChild: 'เพิ่มรายการย่อย',
  addSibling: 'เพิ่มรายการข้างเคียง',
  indent: 'ย่อหน้าเข้า',
  outdent: 'ย่อหน้าออก',
  collapseAll: 'พับทั้งหมด',
  expandAll: 'กางทั้งหมด',
  emptyTree: 'ยังไม่มีรายการ — กด “เพิ่มรายการย่อย” เพื่อเริ่มสร้างโครงสร้าง',
  rootRow: 'รากโครงสร้าง',

  // inspector
  details: 'รายละเอียด',
  nameLabel: 'ชื่อ',
  notes: 'โน้ต',
  startDateField: 'วันเริ่ม',
  durationField: 'ระยะเวลา (วัน)',
  progressField: 'ความคืบหน้า (%)',
  statusField: 'สถานะ',
  costField: 'ต้นทุน',
  milestoneField: 'Milestone',
  derivedHint: 'ค่าจากการคำนวณรวมของรายการย่อย',
  status_todo: 'รอทำ',
  status_in_progress: 'กำลังทำ',
  status_done: 'เสร็จสิ้น',
  leafOnlyHint: 'แก้ไขได้เฉพาะรายการปลายสุด (ไม่มีงานย่อย)',

  // dependencies
  dependencies: 'ความสัมพันธ์ (Dependencies)',
  addDependency: 'เพิ่มความสัมพันธ์',
  predecessorLabel: 'งานก่อนหน้า',
  dependencyTypeLabel: 'ประเภท',
  lagDaysLabel: 'Lag (วัน)',
  noDependencies: 'ไม่มีความสัมพันธ์',
  dep_FS: 'FS — เสร็จแล้วค่อยเริ่ม',
  dep_SS: 'SS — เริ่มพร้อมกัน',
  dep_FF: 'FF — เสร็จพร้อมกัน',
  dep_SF: 'SF — เริ่มก่อนเสร็จ',
  depCycleError: 'ไม่สามารถเพิ่มได้: จะทำให้เกิดวงจร (cycle)',
  depDuplicateError: 'ความสัมพันธ์นี้มีอยู่แล้ว',
  depSelfError: 'งานไม่สามารถขึ้นกับตัวเองได้',
  depNotLeafError: 'เลือกได้เฉพาะรายการปลายสุดที่มีกำหนดการ',
  depCrossStructureError: 'ต้องอยู่ในโครงสร้างเดียวกัน',

  // cross-links
  linksSection: 'เชื่อมโยง (Links)',
  assignedOrgs: 'หน่วยงานรับผิดชอบ (OBS)',
  chargedCosts: 'หมวดต้นทุน (CBS)',
  addLinkAssigns: 'มอบหมายให้หน่วยงาน',
  addLinkCharges: 'ผูกต้นทุนกับหมวด',
  removeLink: 'ถอด',
  selectTargetTitle: 'เลือกปลายทาง',
  inboundLinks: 'ได้รับมอบหมาย/ต้นทุนจาก WBS',
  linkedTasksCount: '{n} งานที่เชื่อมโยง',
  linkedCostSum: 'ต้นทุนรวม {n}',

  // gantt
  ganttCritical: 'Critical Path',
  ganttSlack: 'Slack: {n} วัน',
  today: 'วันนี้',
  ganttNeedsDates: 'ใส่วันเริ่มและระยะเวลาของงานเพื่อดู Gantt',
  ganttZoom_day: 'รายวัน',
  ganttZoom_week: 'รายสัปดาห์',
  ganttZoom_month: 'รายเดือน',

  // structures tabs
  addStructure: 'เพิ่มโครงสร้าง',
  structureNameLabel: 'ชื่อโครงสร้าง',
  deleteStructureConfirm: 'ลบโครงสร้างนี้พร้อมทุกรายการภายใน?',

  // status bar warnings
  warnNoDates: '{n} งานยังไม่มีวันเริ่ม/ระยะเวลา',
  ok: 'พร้อมใช้งาน',
} as const

export type CopyKey = keyof typeof th

const en: Record<CopyKey, string> = {
  appName: 'Breakdown Planner',

  cancel: 'Cancel',
  save: 'Save',
  delete: 'Delete',
  rename: 'Rename',
  duplicate: 'Duplicate',
  open: 'Open',
  close: 'Close',
  add: 'Add',
  untitled: '(Untitled)',
  confirmDeleteTitle: 'Confirm deletion',
  confirmDeleteText: 'Delete “{name}” and all of its children?',
  backToProjects: 'Back to projects',

  projects: 'My projects',
  newProject: 'New project',
  projectNameLabel: 'Project name',
  projectNamePlaceholder: 'e.g. Office Building Construction',
  noProjects: 'No projects yet — click “New project” to start',
  createdLabel: 'Created',
  updatedLabel: 'Updated',
  structuresCount: '{n} structures',
  tasksCount: '{n} tasks',
  storageUsage: 'Storage: {size}',
  storageWarning: 'Storage is nearly full — consider exporting a JSON backup',
  loadSamples: 'Load 5 sample projects',

  undo: 'Undo',
  redo: 'Redo',
  importJson: 'Import JSON',
  exportMenu: 'Export',
  exportJson: 'Export JSON',
  exportCsv: 'Export CSV',
  importErrInvalidJson: 'The selected file is not valid JSON',
  importErrInvalidFormat: 'This file is not a Breakdown Planner export file',
  importErrNewerVersion: 'This file was created by a newer app version — update the app first',

  treeView: 'Table',
  ganttView: 'Gantt',
  addChild: 'Add child',
  addSibling: 'Add sibling',
  indent: 'Indent',
  outdent: 'Outdent',
  collapseAll: 'Collapse all',
  expandAll: 'Expand all',
  emptyTree: 'Nothing here yet — use “Add child” to start building the structure',
  rootRow: 'Structure root',

  details: 'Details',
  nameLabel: 'Name',
  notes: 'Notes',
  startDateField: 'Start date',
  durationField: 'Duration (days)',
  progressField: 'Progress (%)',
  statusField: 'Status',
  costField: 'Cost',
  milestoneField: 'Milestone',
  derivedHint: 'Computed from child tasks',
  status_todo: 'To do',
  status_in_progress: 'In progress',
  status_done: 'Done',
  leafOnlyHint: 'Editable on leaf rows only (no children)',

  dependencies: 'Dependencies',
  addDependency: 'Add dependency',
  predecessorLabel: 'Predecessor',
  dependencyTypeLabel: 'Type',
  lagDaysLabel: 'Lag (days)',
  noDependencies: 'No dependencies',
  dep_FS: 'FS — finish to start',
  dep_SS: 'SS — start to start',
  dep_FF: 'FF — finish to finish',
  dep_SF: 'SF — start to finish',
  depCycleError: 'Cannot add: this would create a cycle',
  depDuplicateError: 'This dependency already exists',
  depSelfError: 'A task cannot depend on itself',
  depNotLeafError: 'Pick schedulable leaf tasks only',
  depCrossStructureError: 'Tasks must be in the same structure',

  linksSection: 'Links',
  assignedOrgs: 'Responsible org units (OBS)',
  chargedCosts: 'Charged cost categories (CBS)',
  addLinkAssigns: 'Assign to org unit',
  addLinkCharges: 'Charge to category',
  removeLink: 'Unlink',
  selectTargetTitle: 'Pick a target',
  inboundLinks: 'Assigned / charged from WBS',
  linkedTasksCount: '{n} linked tasks',
  linkedCostSum: 'Total cost {n}',

  ganttCritical: 'Critical path',
  ganttSlack: 'Slack: {n} days',
  today: 'Today',
  ganttNeedsDates: 'Give tasks start dates and durations to see the Gantt',
  ganttZoom_day: 'Day',
  ganttZoom_week: 'Week',
  ganttZoom_month: 'Month',

  addStructure: 'Add structure',
  structureNameLabel: 'Structure name',
  deleteStructureConfirm: 'Delete this structure and everything inside it?',

  warnNoDates: '{n} tasks have no start date / duration',
  ok: 'Ready',
}

export const dictionaries: Record<Lang, Record<CopyKey, string>> = { th, en }

/** Translate with `{param}` interpolation. */
export function translate(lang: Lang, key: CopyKey, params?: Record<string, string | number>) {
  let text: string = dictionaries[lang][key]
  if (params) {
    for (const [k, v] of Object.entries(params)) text = text.replaceAll(`{${k}}`, String(v))
  }
  return text
}

/** Pick the right side of a bilingual model label. */
export const bl = (label: Bilingual, lang: Lang) => label[lang]

/** Hook: `const t = useT()` then `t('newProject')` or `t('tasksCount', {n: 3})`. */
export function useT() {
  const lang = useAppStore((s) => s.lang)
  return useCallback(
    (key: CopyKey, params?: Record<string, string | number>) => translate(lang, key, params),
    [lang],
  )
}
