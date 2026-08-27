/**
 * Five ready-made sample projects for learning the app, one per project
 * flavour: construction (full showcase with a long critical path), software
 * (PBS + parallel work), event (tight timeline), marketing launch
 * (RBS-heavy), office move (WBS-only). Built with the same primitives the
 * store uses and scheduled through the real CPM forward pass, so dependency
 * dates line up exactly with what the Gantt draws. Statuses/progress derive
 * automatically from each task's dates vs today.
 *
 * Depth is deliberate: the construction sample carries ~35 leaf tasks across
 * four WBS levels so the critical path, near-critical branches and slack are
 * all visible when studying Breakdown Structures.
 *
 * The declarative spec format + builder live in ./specProject (shared with the
 * template library).
 */

import { buildSample } from './specProject'
import type { Bilingual, Lang, Project } from './types'

// --- The five samples -----------------------------------------------------------

export interface SampleEntry {
  id: string
  name: Bilingual
  build: (lang: Lang) => Project
}

export const SAMPLE_PROJECTS: SampleEntry[] = [
  // ------------------------------------------------------------------ 1 · construction
  {
    id: 'sample-construction',
    name: { th: 'ตัวอย่าง 1 · ก่อสร้างอาคารสำนักงาน', en: 'Sample 1 · Office building construction' },
    build: (lang) =>
      buildSample({
        id: 'sample-construction',
        name: { th: 'ตัวอย่าง 1 · ก่อสร้างอาคารสำนักงาน', en: 'Sample 1 · Office building construction' },
        startIso: '2026-06-01',
        wbs: [
          {
            key: 'pre',
            name: { th: 'งานก่อนก่อสร้าง', en: 'Pre-construction' },
            children: [
              { key: 'survey', name: { th: 'สำรวจหน้างานและตรวจสอบดิน', en: 'Site survey and soil investigation' }, duration: 10, cost: 80000 },
              { key: 'arch', name: { th: 'ออกแบบสถาปัตยกรรม', en: 'Architectural design' }, duration: 20, cost: 150000 },
              { key: 'structDesign', name: { th: 'ออกแบบโครงสร้างและระบบ MEP', en: 'Structural and MEP design' }, duration: 25, cost: 180000 },
              { key: 'boq', name: { th: 'ประมาณการราคา (BOQ) และจ้างผู้รับเหมา', en: 'Cost estimate (BOQ) and contractor tender' }, duration: 12, cost: 40000 },
              { key: 'permit', name: { th: 'ขอใบอนุญาตก่อสร้าง', en: 'Apply for the construction permit' }, duration: 30, cost: 30000 },
              { key: 'permitDone', name: { th: 'ได้รับใบอนุญาต', en: 'Permit granted' }, milestone: true },
              { key: 'sitePrep', name: { th: 'ปิดล้อมหน้างานและเตรียมพื้นที่', en: 'Hoard the site and prepare the ground' }, duration: 8, cost: 120000 },
            ],
          },
          {
            key: 'foundation',
            name: { th: 'งานฐานราก', en: 'Foundation works' },
            children: [
              { key: 'pilingA', name: { th: 'ตอกเสาเข็มโซน A', en: 'Pile driving, zone A' }, duration: 12, cost: 250000 },
              { key: 'pilingB', name: { th: 'ตอกเสาเข็มโซน B', en: 'Pile driving, zone B' }, duration: 10, cost: 230000 },
              { key: 'excavation', name: { th: 'ขุดคันดินและระบบระบายน้ำกันน้ำท่วมหน้างาน', en: 'Earthworks and site drainage against flooding' }, duration: 8, cost: 90000 },
              { key: 'footing', name: { th: 'หล่อฐานรากและคานค้ำ', en: 'Cast the footings and tie beams' }, duration: 15, cost: 380000 },
              { key: 'waterproof', name: { th: 'งานกันซึมฐานราก', en: 'Foundation waterproofing' }, duration: 4, cost: 70000 },
            ],
          },
          {
            key: 'structure',
            name: { th: 'งานโครงสร้างอาคาร', en: 'Building structural works' },
            children: [
              { key: 'floor1', name: { th: 'โครงสร้างชั้น 1', en: 'Level 1 structure' }, duration: 18, cost: 320000 },
              { key: 'floor2', name: { th: 'โครงสร้างชั้น 2', en: 'Level 2 structure' }, duration: 15, cost: 310000 },
              { key: 'floor3', name: { th: 'โครงสร้างชั้น 3', en: 'Level 3 structure' }, duration: 15, cost: 300000 },
              { key: 'topOut', name: { th: 'Topping out — ยกหลังคาอาคารสำเร็จ', en: 'Topping out — roof structure complete' }, milestone: true },
              { key: 'roofSlab', name: { th: 'งานหลังคาและถังน้ำบนดาดฟ้า', en: 'Roofing and rooftop water tanks' }, duration: 8, cost: 160000 },
            ],
          },
          {
            key: 'mep',
            name: { th: 'งานระบบ MEP', en: 'MEP works' },
            children: [
              { key: 'riser', name: { th: 'ระบบหลักและชัฟท์เดินท่อ–สายไฟ', en: 'Main systems and service shafts' }, duration: 14, cost: 210000 },
              { key: 'elec', name: { th: 'ระบบไฟฟ้าและไฟส่องสว่างภายใน', en: 'Electrical and interior lighting' }, duration: 22, cost: 280000 },
              { key: 'plumbing', name: { th: 'ระบบประปาและสุขาภิบาล', en: 'Plumbing and sanitary systems' }, duration: 18, cost: 190000 },
              { key: 'hvac', name: { th: 'ติดตั้งเครื่องปรับอากาศและระบายอากาศ', en: 'Install air conditioning and ventilation' }, duration: 16, cost: 240000 },
              { key: 'fire', name: { th: 'ระบบดับเพลิงและสัญญาณแจ้งเหตุ', en: 'Fire fighting and alarm systems' }, duration: 10, cost: 130000 },
              { key: 'lift', name: { th: 'ติดตั้งลิฟต์โดยสาร', en: 'Install the passenger lift' }, duration: 14, cost: 520000 },
            ],
          },
          {
            key: 'finish',
            name: { th: 'งานสถาปัตยกรรมและตกแต่ง', en: 'Architectural and fit-out works' },
            children: [
              { key: 'masonry', name: { th: 'งานก่อฉากผนัง', en: 'Partition walls' }, duration: 20, cost: 350000 },
              { key: 'tile', name: { th: 'กระเบื้องพื้นและผนัง', en: 'Floor and wall tiling' }, duration: 14, cost: 300000 },
              { key: 'doorWin', name: { th: 'ประตู หน้าต่าง และกระจกเคลือบ', en: 'Doors, windows and coated glazing' }, duration: 10, cost: 260000 },
              { key: 'ceiling', name: { th: 'ฝ้าเพดานและโคมไฟ', en: 'Ceilings and light fittings' }, duration: 8, cost: 140000 },
              { key: 'paint', name: { th: 'งานทาสีทั้งอาคาร', en: 'Painting throughout the building' }, duration: 12, cost: 170000 },
              { key: 'lobby', name: { th: 'ตกแต่งล็อบบี้และห้องรับรอง', en: 'Fit out the lobby and reception rooms' }, duration: 12, cost: 290000 },
            ],
          },
          {
            key: 'external',
            name: { th: 'งานภายนอกอาคาร', en: 'External works' },
            children: [
              { key: 'landscape', name: { th: 'งานภูมิทัศน์และที่จอดรถ', en: 'Landscaping and car park' }, duration: 15, cost: 220000 },
              { key: 'driveway', name: { th: 'ถนนภายในและระบบระบายน้ำหน้างาน', en: 'Internal roads and site drainage' }, duration: 10, cost: 180000 },
            ],
          },
          {
            key: 'close',
            name: { th: 'ทดสอบและส่งมอบ', en: 'Testing and handover' },
            children: [
              { key: 'commissioning', name: { th: 'ทดสอบระบบทั้งหมด (commissioning)', en: 'Whole-system commissioning' }, duration: 8, cost: 90000 },
              { key: 'inspection', name: { th: 'ตรวจรับกับผู้ควบคุมงานและเจ้าของโครงการ', en: 'Inspection with the site supervisor and the owner' }, duration: 5, cost: 20000 },
              { key: 'handoverDay', name: { th: 'ส่งมอบอาคาร', en: 'Building handover' }, milestone: true },
              { key: 'asbuilt', name: { th: 'ส่งแบบ as-built และคู่มือดูแลอาคาร', en: 'Issue as-built drawings and the building manual' }, duration: 6, cost: 40000 },
            ],
          },
        ],
        deps: [
          // design & permit chain — deliberately long so it drives the CP
          { from: 'survey', to: 'arch' },
          { from: 'arch', to: 'structDesign' },
          { from: 'structDesign', to: 'boq' },
          { from: 'boq', to: 'permit' },
          { from: 'permit', to: 'permitDone' },
          { from: 'permitDone', to: 'sitePrep' },
          // foundation — piling zones run in parallel and merge at excavation
          { from: 'sitePrep', to: 'pilingA' },
          { from: 'sitePrep', to: 'pilingB' },
          { from: 'pilingA', to: 'excavation' },
          { from: 'pilingB', to: 'excavation' },
          { from: 'excavation', to: 'footing' },
          { from: 'footing', to: 'waterproof' },
          // floors chase each other up to topping out
          { from: 'waterproof', to: 'floor1' },
          { from: 'floor1', to: 'floor2' },
          { from: 'floor2', to: 'floor3' },
          { from: 'floor3', to: 'topOut' },
          { from: 'topOut', to: 'roofSlab' },
          // MEP risers start once level-1 structure exists; branches fan out
          { from: 'floor1', to: 'riser' },
          { from: 'riser', to: 'elec' },
          { from: 'riser', to: 'plumbing' },
          { from: 'riser', to: 'fire' },
          { from: 'roofSlab', to: 'hvac' },
          { from: 'floor3', to: 'lift' },
          // finishing follows the topped-out structure
          { from: 'roofSlab', to: 'masonry' },
          { from: 'masonry', to: 'tile' },
          { from: 'masonry', to: 'doorWin' },
          { from: 'tile', to: 'paint' },
          { from: 'tile', to: 'ceiling' },
          { from: 'ceiling', to: 'lobby' },
          // external works can proceed once the shell is done
          { from: 'roofSlab', to: 'landscape' },
          { from: 'landscape', to: 'driveway' },
          // everything converges at commissioning → inspection → handover
          { from: 'elec', to: 'commissioning' },
          { from: 'plumbing', to: 'commissioning' },
          { from: 'fire', to: 'commissioning' },
          { from: 'hvac', to: 'commissioning' },
          { from: 'lift', to: 'commissioning' },
          { from: 'paint', to: 'commissioning' },
          { from: 'lobby', to: 'commissioning' },
          { from: 'driveway', to: 'inspection' },
          { from: 'commissioning', to: 'inspection' },
          { from: 'inspection', to: 'handoverDay' },
          { from: 'handoverDay', to: 'asbuilt' },
        ],
        extraStructures: [
          {
            typeId: 'obs',
            name: { th: 'หน่วยงานในโครงการ (OBS)', en: 'Org units (OBS)' },
            nodes: [
              { key: 'pm', name: { th: 'ผู้จัดการโครงการ', en: 'Project manager' }, attrs: { owner: 'คุณสมชาย วงศ์ประเสริฐ' } },
              { key: 'designOrg', name: { th: 'ฝ่ายออกแบบ', en: 'Design department' }, attrs: { owner: 'บจก. สถาปนิก ร่วมแบบ' } },
              { key: 'contractorStruct', name: { th: 'ผู้รับเหมางานโครงสร้าง', en: 'Structural contractor' }, attrs: { owner: 'บจก. สร้างการ' } },
              { key: 'contractorMep', name: { th: 'ผู้รับเหมาระบบ MEP', en: 'MEP contractor' }, attrs: { owner: 'บจก. ระบบสมบูรณ์' } },
              { key: 'contractorFin', name: { th: 'ผู้รับเหมางานตกแต่ง', en: 'Fit-out contractor' }, attrs: { owner: 'หจก. สวยงามตกแต่ง' } },
              { key: 'extOrg', name: { th: 'ผู้รับเหมางานภูมิทัศน์', en: 'Landscaping contractor' }, attrs: { owner: 'บจก. เขียวขจีแลนด์' } },
              { key: 'qa', name: { th: 'ฝ่ายควบคุมคุณภาพและความปลอดภัย', en: 'Quality and safety department' }, attrs: { owner: 'วศ. อารีย์ ใจดี' } },
              { key: 'procurement', name: { th: 'ฝ่ายจัดซื้อวัสดุ', en: 'Materials procurement department' }, attrs: { owner: 'คุณมะลิ ซื้อของดี' } },
            ],
          },
          {
            typeId: 'cbs',
            name: { th: 'หมวดต้นทุน (CBS)', en: 'Cost categories (CBS)' },
            nodes: [
              { key: 'cSoft', name: { th: 'ค่าออกแบบและขออนุญาต', en: 'Design and permit cost' }, attrs: { budget: 400000 } },
              {
                key: 'cMaterial',
                name: { th: 'ค่าวัสดุก่อสร้าง', en: 'Construction material cost' },
                children: [
                  { key: 'matStruct', name: { th: 'วัสดุงานฐานรากและโครงสร้าง', en: 'Foundation and structural materials' }, attrs: { budget: 1600000 } },
                  { key: 'matMep', name: { th: 'วัสดุระบบ MEP และลิฟต์', en: 'MEP materials and lift' }, attrs: { budget: 900000 } },
                  { key: 'matFin', name: { th: 'วัสดุงานตกแต่ง', en: 'Fit-out materials' }, attrs: { budget: 800000 } },
                ],
              },
              {
                key: 'cLabour',
                name: { th: 'ค่าแรงงาน', en: 'Labour cost' },
                children: [
                  { key: 'labStruct', name: { th: 'แรงงานงานโครงสร้าง', en: 'Structural labour' }, attrs: { budget: 700000 } },
                  { key: 'labMep', name: { th: 'แรงงานระบบ MEP', en: 'MEP labour' }, attrs: { budget: 450000 } },
                  { key: 'labFin', name: { th: 'แรงงานงานตกแต่ง', en: 'Fit-out labour' }, attrs: { budget: 500000 } },
                ],
              },
              { key: 'cEquip', name: { th: 'ค่าเช่าเครื่องจักรและนั่งร้าน', en: 'Plant and scaffolding hire' }, attrs: { budget: 350000 } },
              { key: 'cClose', name: { th: 'ค่าทดสอบและส่งมอบ', en: 'Testing and handover cost' }, attrs: { budget: 150000 } },
              { key: 'cCont', name: { th: 'สำรองเผื่อฉุกเฉิน (contingency)', en: 'Contingency reserve' }, attrs: { budget: 500000 } },
            ],
          },
          {
            typeId: 'rbs',
            name: { th: 'ทะเบียนความเสี่ยง (RBS)', en: 'Risk register (RBS)' },
            nodes: [
              {
                key: 'rExternal',
                name: { th: 'ความเสี่ยงภายนอก', en: 'External risks' },
                children: [
                  {
                    key: 'rain',
                    name: { th: 'ฝนตกซ้ำซากทำงานโครงสร้างล่าช้า', en: 'Persistent rain delays the structural works' },
                    attrs: { probability: 40, impact: 'high', response: 'เผื่อเวลาในแผนงานกลางแจ้ง + เตรียมผ้าคลุมคอนกรีต' },
                  },
                  {
                    key: 'price',
                    name: { th: 'ราคาเหล็กและคอนกรีตผันผวน', en: 'Steel and concrete prices swing' },
                    attrs: { probability: 50, impact: 'medium', response: 'ล็อกราคากับซัพพลายเออร์ล่วงหน้า' },
                  },
                  {
                    key: 'regulation',
                    name: { th: 'เอกสารขออนุญาตถูกตีกลับ', en: 'The permit application is rejected' },
                    attrs: { probability: 20, impact: 'high', response: 'ให้ที่ปรึกษาตรวจแบบตาม รพน. ก่อนยื่นจริง' },
                  },
                ],
              },
              {
                key: 'rOps',
                name: { th: 'ความเสี่ยงการดำเนินงาน', en: 'Operational risks' },
                children: [
                  {
                    key: 'labour',
                    name: { th: 'แรงงานขาดมือช่วงเร่งงานโครงสร้าง', en: 'Labour shortage during the structural push' },
                    attrs: { probability: 30, impact: 'high', response: 'สัญญาระบุโทษความล่าช้า + มีผู้รับเหมาสำรอง' },
                  },
                  {
                    key: 'change',
                    name: { th: 'เจ้าของงานขอแบบเปลี่ยนกลางทาง', en: 'The client changes the design mid-project' },
                    attrs: { probability: 35, impact: 'medium', response: 'ตรึงแบบก่อนเริ่มงาน + change control' },
                  },
                  {
                    key: 'liftDelay',
                    name: { th: 'ลิฟต์นำเข้ามาไม่ทันจังหวะติดตั้ง', en: 'The imported lift misses its installation window' },
                    attrs: { probability: 25, impact: 'high', response: 'สั่งจองลิฟต์ตั้งแต่ต้นโครงการ พร้อมติดตาม shipment' },
                  },
                ],
              },
              {
                key: 'rFinance',
                name: { th: 'ความเสี่ยงด้านการเงิน', en: 'Financial risks' },
                children: [
                  {
                    key: 'cashflow',
                    name: { th: 'กระแสเงินสดติดลบช่วงงานโครงสร้าง', en: 'Negative cash flow during structural works' },
                    attrs: { probability: 30, impact: 'medium', response: 'วางแผน billing รายเดือนให้ตรงความก้าวหน้า' },
                  },
                ],
              },
            ],
          },
        ],
        links: [
          { kind: 'assigns', from: 'survey', to: 'qa' },
          { kind: 'assigns', from: 'arch', to: 'designOrg' },
          { kind: 'assigns', from: 'structDesign', to: 'designOrg' },
          { kind: 'assigns', from: 'boq', to: 'pm' },
          { kind: 'assigns', from: 'permit', to: 'designOrg' },
          { kind: 'assigns', from: 'sitePrep', to: 'contractorStruct' },
          { kind: 'assigns', from: 'pilingA', to: 'contractorStruct' },
          { kind: 'assigns', from: 'footing', to: 'contractorStruct' },
          { kind: 'assigns', from: 'floor1', to: 'contractorStruct' },
          { kind: 'assigns', from: 'floor2', to: 'contractorStruct' },
          { kind: 'assigns', from: 'floor3', to: 'contractorStruct' },
          { kind: 'assigns', from: 'riser', to: 'contractorMep' },
          { kind: 'assigns', from: 'elec', to: 'contractorMep' },
          { kind: 'assigns', from: 'hvac', to: 'contractorMep' },
          { kind: 'assigns', from: 'lift', to: 'contractorMep' },
          { kind: 'assigns', from: 'tile', to: 'contractorFin' },
          { kind: 'assigns', from: 'lobby', to: 'contractorFin' },
          { kind: 'assigns', from: 'landscape', to: 'extOrg' },
          { kind: 'assigns', from: 'commissioning', to: 'contractorMep' },
          { kind: 'assigns', from: 'inspection', to: 'qa' },
          { kind: 'assigns', from: 'asbuilt', to: 'designOrg' },
          { kind: 'charges', from: 'arch', to: 'cSoft' },
          { kind: 'charges', from: 'structDesign', to: 'cSoft' },
          { kind: 'charges', from: 'permit', to: 'cSoft' },
          { kind: 'charges', from: 'pilingA', to: 'matStruct' },
          { kind: 'charges', from: 'footing', to: 'matStruct' },
          { kind: 'charges', from: 'floor1', to: 'matStruct' },
          { kind: 'charges', from: 'floor2', to: 'matStruct' },
          { kind: 'charges', from: 'floor3', to: 'matStruct' },
          { kind: 'charges', from: 'riser', to: 'matMep' },
          { kind: 'charges', from: 'elec', to: 'matMep' },
          { kind: 'charges', from: 'lift', to: 'matMep' },
          { kind: 'charges', from: 'tile', to: 'matFin' },
          { kind: 'charges', from: 'lobby', to: 'matFin' },
          { kind: 'charges', from: 'excavation', to: 'cEquip' },
          { kind: 'charges', from: 'commissioning', to: 'cClose' },
          { kind: 'charges', from: 'inspection', to: 'cClose' },
        ],
      }, lang),
  },

  // ------------------------------------------------------------------ 2 · mobile app
  {
    id: 'sample-mobile-app',
    name: { th: 'ตัวอย่าง 2 · พัฒนาแอปมือถือ FoodieGo', en: 'Sample 2 · FoodieGo mobile app' },
    build: (lang) =>
      buildSample({
        id: 'sample-mobile-app',
        name: { th: 'ตัวอย่าง 2 · พัฒนาแอปมือถือ FoodieGo', en: 'Sample 2 · FoodieGo mobile app' },
        startIso: '2026-09-01',
        wbs: [
          {
            key: 'discovery',
            name: 'Discovery',
            children: [
              { key: 'research', name: { th: 'สัมภาษณ์ผู้ใช้และร้านค้า', en: 'Interview users and restaurants' }, duration: 8 },
              { key: 'competitor', name: { th: 'วิเคราะห์แอปคู่แข่ง', en: 'Analyse competitor apps' }, duration: 4 },
              { key: 'scope', name: { th: 'สรุป scope และ user story', en: 'Agree the scope and user stories' }, duration: 5 },
            ],
          },
          {
            key: 'ux',
            name: { th: 'ออกแบบประสบการณ์', en: 'Experience design' },
            children: [
              { key: 'wireframe', name: { th: 'Wireframe หน้าจอหลัก', en: 'Wireframe the main screens' }, duration: 7 },
              { key: 'uikit', name: { th: 'UI Kit และ Design System', en: 'UI kit and design system' }, duration: 8 },
              { key: 'prototype', name: { th: 'Prototype คลิกได้', en: 'Clickable prototype' }, duration: 5 },
              { key: 'usability', name: { th: 'Usability test กับผู้ใช้จริง', en: 'Usability test with real users' }, duration: 5 },
            ],
          },
          {
            key: 'dev',
            name: { th: 'พัฒนา', en: 'Development' },
            children: [
              {
                key: 'devBackend',
                name: { th: 'ฝั่ง Backend', en: 'Backend' },
                children: [
                  { key: 'backend', name: { th: 'ตั้งโครง backend + CI/CD', en: 'Scaffold the backend + CI/CD' }, duration: 6 },
                  { key: 'authApi', name: { th: 'API สมาชิกและล็อกอิน', en: 'Account and login API' }, duration: 10 },
                  { key: 'menuApi', name: { th: 'API เมนูและค้นหาร้าน', en: 'Menu and restaurant search API' }, duration: 12 },
                  { key: 'payApi', name: { th: 'API ชำระเงินและ receipt', en: 'Payment and receipt API' }, duration: 10 },
                ],
              },
              {
                key: 'devApp',
                name: { th: 'แอปมือถือ', en: 'Mobile app' },
                children: [
                  { key: 'appShell', name: { th: 'โครงแอปและ navigation', en: 'App shell and navigation' }, duration: 6 },
                  { key: 'uiAuth', name: { th: 'หน้าจอสมาชิก', en: 'Account screens' }, duration: 6 },
                  { key: 'uiMenu', name: { th: 'หน้าจอเมนู–ค้นหา', en: 'Menu and search screens' }, duration: 9 },
                  { key: 'uiCart', name: { th: 'หน้าจอตะกร้า–ชำระเงิน', en: 'Cart and checkout screens' }, duration: 9 },
                  { key: 'notify', name: { th: 'แจ้งเตือนสถานะออเดอร์', en: 'Order status notifications' }, duration: 5 },
                ],
              },
            ],
          },
          {
            key: 'test',
            name: { th: 'ทดสอบ', en: 'Testing' },
            children: [
              { key: 'qa', name: { th: 'QA รวมทุกโมดูล', en: 'QA across all modules' }, duration: 10 },
              { key: 'perf', name: { th: 'ทดสอบ load และประสิทธิภาพ', en: 'Load and performance testing' }, duration: 5 },
              { key: 'beta', name: { th: 'Beta กับร้านนำร่อง 10 ร้าน', en: 'Beta with 10 pilot restaurants' }, duration: 10 },
            ],
          },
          {
            key: 'launch',
            name: { th: 'เปิดตัว', en: 'Launch' },
            children: [
              { key: 'assets', name: { th: 'สื่อแนะนำแอปใน App Store', en: 'App Store listing assets' }, duration: 5 },
              { key: 'storeReview', name: { th: 'ส่งรีวิว App Store / Play Store', en: 'Submit for App Store / Play Store review' }, duration: 7 },
              { key: 'launchDay', name: { th: 'เปิดตัว v1.0', en: 'v1.0 launch' }, milestone: true },
            ],
          },
        ],
        deps: [
          { from: 'research', to: 'scope' },
          { from: 'competitor', to: 'scope' },
          // design branch
          { from: 'scope', to: 'wireframe' },
          { from: 'wireframe', to: 'uikit' },
          { from: 'uikit', to: 'prototype' },
          { from: 'prototype', to: 'usability' },
          // dev branch starts in parallel with design
          { from: 'scope', to: 'backend' },
          { from: 'backend', to: 'authApi' },
          { from: 'backend', to: 'menuApi' },
          { from: 'authApi', to: 'payApi' },
          { from: 'backend', to: 'appShell' },
          { from: 'appShell', to: 'uiAuth' },
          { from: 'uiAuth', to: 'uiMenu' },
          { from: 'uiMenu', to: 'uiCart' },
          { from: 'uiCart', to: 'notify' },
          // both branches converge at QA
          { from: 'payApi', to: 'qa' },
          { from: 'menuApi', to: 'qa' },
          { from: 'uiCart', to: 'qa' },
          { from: 'notify', to: 'qa' },
          { from: 'usability', to: 'qa' },
          { from: 'qa', to: 'perf' },
          { from: 'qa', to: 'beta' },
          { from: 'beta', to: 'assets' },
          { from: 'beta', to: 'storeReview' },
          { from: 'assets', to: 'launchDay' },
          { from: 'storeReview', to: 'launchDay' },
        ],
        extraStructures: [
          {
            typeId: 'pbs',
            name: { th: 'โครงสร้างผลผลิต (PBS)', en: 'Product breakdown (PBS)' },
            nodes: [
              { key: 'pAuth', name: { th: 'โมดูลสมาชิก', en: 'Account module' }, attrs: { version: '1.0' } },
              { key: 'pMenu', name: { th: 'โมดูลเมนูและค้นหา', en: 'Menu and search module' }, attrs: { version: '1.0' } },
              { key: 'pCart', name: { th: 'โมดูลสั่งซื้อ/ชำระเงิน', en: 'Ordering and payment module' }, attrs: { version: '1.0' } },
              { key: 'pNotify', name: { th: 'ระบบแจ้งเตือน', en: 'Notifications' }, attrs: { version: '1.0' } },
              { key: 'pReview', name: { th: 'ระบบรีวิวร้าน', en: 'Restaurant review system' }, attrs: { version: '1.1 (roadmap)' } },
              { key: 'pAnalytics', name: { th: 'Dashboard analytics ร้านค้า', en: 'Restaurant analytics dashboard' }, attrs: { version: '1.1 (roadmap)' } },
            ],
          },
          {
            typeId: 'obs',
            name: { th: 'ทีมงาน (OBS)', en: 'Teams (OBS)' },
            nodes: [
              { key: 'po', name: 'Product Owner', attrs: { owner: 'คุณไผ่ เตชะณรงค์' } },
              { key: 'designers', name: { th: 'ทีมออกแบบ UX/UI', en: 'UX/UI design team' }, attrs: { owner: 'คุณมิน ศรีสุข' } },
              { key: 'devs', name: { th: 'ทีม Developer', en: 'Development team' }, attrs: { owner: 'คุณโอ๊ต พัฒนกิจ' } },
              { key: 'qas', name: { th: 'ทีม QA', en: 'QA team' }, attrs: { owner: 'คุณเจ Jirapat' } },
              { key: 'marketing', name: { th: 'ทีม Marketing', en: 'Marketing team' }, attrs: { owner: 'คุณแพร วัลย์พร' } },
            ],
          },
        ],
        links: [
          { kind: 'assigns', from: 'research', to: 'po' },
          { kind: 'assigns', from: 'scope', to: 'po' },
          { kind: 'assigns', from: 'wireframe', to: 'designers' },
          { kind: 'assigns', from: 'uikit', to: 'designers' },
          { kind: 'assigns', from: 'prototype', to: 'designers' },
          { kind: 'assigns', from: 'usability', to: 'designers' },
          { kind: 'assigns', from: 'authApi', to: 'devs' },
          { kind: 'assigns', from: 'menuApi', to: 'devs' },
          { kind: 'assigns', from: 'payApi', to: 'devs' },
          { kind: 'assigns', from: 'appShell', to: 'devs' },
          { kind: 'assigns', from: 'uiCart', to: 'devs' },
          { kind: 'assigns', from: 'notify', to: 'devs' },
          { kind: 'assigns', from: 'qa', to: 'qas' },
          { kind: 'assigns', from: 'perf', to: 'qas' },
          { kind: 'assigns', from: 'beta', to: 'qas' },
          { kind: 'assigns', from: 'assets', to: 'marketing' },
        ],
      }, lang),
  },

  // ------------------------------------------------------------------ 3 · seminar
  {
    id: 'sample-seminar',
    name: { th: 'ตัวอย่าง 3 · จัดสัมมนา Digital Transformation', en: 'Sample 3 · Digital Transformation seminar' },
    build: (lang) =>
      buildSample({
        id: 'sample-seminar',
        name: { th: 'ตัวอย่าง 3 · จัดสัมมนา Digital Transformation', en: 'Sample 3 · Digital Transformation seminar' },
        startIso: '2026-08-10',
        wbs: [
          {
            key: 'plan',
            name: { th: 'วางแผนงาน', en: 'Planning' },
            children: [
              { key: 'topic', name: { th: 'กำหนดหัวข้อและวิทยากรเป้าหมาย', en: 'Define the topics and target speakers' }, duration: 4 },
              { key: 'budget', name: { th: 'งบประมาณและจุดคุ้มทุน', en: 'Budget and break-even' }, duration: 3 },
              { key: 'sponsor', name: { th: 'ติดต่อสปอนเซอร์และบูธแสดงสินค้า', en: 'Approach sponsors and exhibition booths' }, duration: 6 },
            ],
          },
          {
            key: 'content',
            name: { th: 'วิทยากรและเนื้อหา', en: 'Speakers and content' },
            children: [
              { key: 'invite', name: { th: 'เชิญและยืนยันวิทยากร', en: 'Invite and confirm the speakers' }, duration: 14 },
              { key: 'agenda', name: { th: 'จัด agenda และลำดับช่วงบรรยาย', en: 'Build the agenda and session order' }, duration: 3 },
              { key: 'rehearse', name: { th: 'รับสไลด์และซ้อมพูด', en: 'Collect the slides and rehearse' }, duration: 5 },
            ],
          },
          {
            key: 'venue',
            name: { th: 'สถานที่และอุปกรณ์', en: 'Venue and equipment' },
            children: [
              { key: 'room', name: { th: 'จองห้องประชุมและที่พักวิทยากร', en: 'Book the meeting room and speaker accommodation' }, duration: 5 },
              { key: 'av', name: { th: 'เตรียม AV และระบบสตรีมมิง', en: 'Prepare AV and streaming' }, duration: 8 },
              { key: 'catering', name: { th: 'จัดเลี้ยงและอาหารว่าง', en: 'Catering and refreshments' }, duration: 4 },
              { key: 'badgeKit', name: { th: 'ป้าย เอกสาร และของที่ระลึก', en: 'Signage, handouts and souvenirs' }, duration: 4 },
            ],
          },
          {
            key: 'promo',
            name: { th: 'ประชาสัมพันธ์และลงทะเบียน', en: 'Promotion and registration' },
            children: [
              { key: 'poster', name: { th: 'โพสเตอร์และหน้าลงทะเบียนออนไลน์', en: 'Poster and online registration page' }, duration: 5 },
              { key: 'social', name: { th: 'โซเชียลมีเดียและ email blast', en: 'Social media and email blast' }, duration: 8 },
              { key: 'regClose', name: { th: 'ปิดรับลงทะเบียน', en: 'Close registration' }, milestone: true },
            ],
          },
          {
            key: 'event',
            name: { th: 'วันงาน', en: 'Event day' },
            children: [
              { key: 'checkin', name: { th: 'ลงทะเบียนหน้างานและอำนวยความสะดวก', en: 'On-site registration and guest services' }, duration: 1 },
              { key: 'eventDay', name: { th: 'วันจัดสัมมนา', en: 'Seminar day' }, milestone: true },
              { key: 'retro', name: { th: 'สรุปบทเรียนและส่งแบบประเมิน', en: 'Capture lessons learned and send the evaluation form' }, duration: 3 },
            ],
          },
        ],
        deps: [
          { from: 'topic', to: 'budget' },
          { from: 'topic', to: 'invite' },
          { from: 'topic', to: 'room' },
          { from: 'topic', to: 'sponsor' },
          { from: 'invite', to: 'agenda' },
          { from: 'agenda', to: 'rehearse' },
          { from: 'room', to: 'av' },
          { from: 'budget', to: 'poster' },
          { from: 'poster', to: 'social' },
          { from: 'social', to: 'regClose' },
          { from: 'regClose', to: 'badgeKit' }, // print after attendee count is final
          { from: 'regClose', to: 'checkin' },
          { from: 'rehearse', to: 'eventDay' },
          { from: 'checkin', to: 'eventDay' },
          { from: 'badgeKit', to: 'eventDay' },
          { from: 'eventDay', to: 'retro' },
        ],
        extraStructures: [
          {
            typeId: 'obs',
            name: { th: 'คณะทำงาน (OBS)', en: 'Working teams (OBS)' },
            nodes: [
              { key: 'chair', name: { th: 'ประธานจัดงาน', en: 'Event chair' }, attrs: { owner: 'คุณอร วิไลลักษณ์' } },
              { key: 'contentTeam', name: { th: 'ฝ่ายเนื้อหา', en: 'Content department' }, attrs: { owner: 'คุณต้น ฤทธิ์มะนาว' } },
              { key: 'venueTeam', name: { th: 'ฝ่ายสถานที่', en: 'Venue department' }, attrs: { owner: 'คุณกล้วย มณีรัตน์' } },
              { key: 'prTeam', name: { th: 'ฝ่ายประชาสัมพันธ์', en: 'Communications department' }, attrs: { owner: 'คุณเบลล์ กมลชนก' } },
              { key: 'bizTeam', name: { th: 'ฝ่ายพันธมิตรและผู้สนับสนุน', en: 'Partners and sponsors department' }, attrs: { owner: 'คุณน็อต ธนกฤต' } },
            ],
          },
          {
            typeId: 'cbs',
            name: { th: 'งบประมาณ (CBS)', en: 'Budget (CBS)' },
            nodes: [
              { key: 'cRoom', name: { th: 'ค่าห้องและอุปกรณ์', en: 'Venue and equipment cost' }, attrs: { budget: 60000 } },
              { key: 'cSpeaker', name: { th: 'ค่าวิทยากร', en: 'Speaker fees' }, attrs: { budget: 45000 } },
              { key: 'cFood', name: { th: 'ค่าจัดเลี้ยง', en: 'Catering cost' }, attrs: { budget: 30000 } },
              { key: 'cAds', name: { th: 'ค่าสื่อโฆษณา', en: 'Media cost' }, attrs: { budget: 25000 } },
              { key: 'cPrint', name: { th: 'ค่าเอกสารและของที่ระลึก', en: 'Handout and souvenir cost' }, attrs: { budget: 12000 } },
              { key: 'cSponsorBooth', name: { th: 'ตกแต่งบูธสปอนเซอร์', en: 'Dress the sponsor booths' }, attrs: { budget: 18000 } },
            ],
          },
        ],
        links: [
          { kind: 'assigns', from: 'invite', to: 'contentTeam' },
          { kind: 'assigns', from: 'rehearse', to: 'contentTeam' },
          { kind: 'assigns', from: 'av', to: 'venueTeam' },
          { kind: 'assigns', from: 'badgeKit', to: 'venueTeam' },
          { kind: 'assigns', from: 'checkin', to: 'venueTeam' },
          { kind: 'assigns', from: 'social', to: 'prTeam' },
          { kind: 'assigns', from: 'sponsor', to: 'bizTeam' },
          { kind: 'charges', from: 'room', to: 'cRoom' },
          { kind: 'charges', from: 'invite', to: 'cSpeaker' },
          { kind: 'charges', from: 'catering', to: 'cFood' },
          { kind: 'charges', from: 'social', to: 'cAds' },
          { kind: 'charges', from: 'badgeKit', to: 'cPrint' },
          { kind: 'charges', from: 'sponsor', to: 'cSponsorBooth' },
        ],
      }, lang),
  },

  // ------------------------------------------------------------------ 4 · marketing launch
  {
    id: 'sample-marketing-launch',
    name: { th: 'ตัวอย่าง 4 · แคมเปญเปิดตัวเครื่องฟอกอากาศ AIRA X1', en: 'Sample 4 · AIRA X1 air purifier launch campaign' },
    build: (lang) =>
      buildSample({
        id: 'sample-marketing-launch',
        name: { th: 'ตัวอย่าง 4 · แคมเปญเปิดตัวเครื่องฟอกอากาศ AIRA X1', en: 'Sample 4 · AIRA X1 air purifier launch campaign' },
        startIso: '2026-09-15',
        wbs: [
          {
            key: 'prep',
            name: { th: 'งานเตรียม', en: 'Preparation' },
            children: [
              { key: 'positioning', name: { th: 'กำหนด positioning และข้อความหลัก', en: 'Set positioning and key messages' }, duration: 7 },
              { key: 'kpi', name: { th: 'ตั้ง KPI และงบแคมเปญ', en: 'Set the campaign KPIs and budget' }, duration: 4 },
            ],
          },
          {
            key: 'content',
            name: { th: 'สื่อและคอนเทนต์', en: 'Assets and content' },
            children: [
              { key: 'video', name: { th: 'ถ่ายทำวิดีโอโฆษณาหลัก', en: 'Shoot the hero advertising video' }, duration: 12 },
              { key: 'unbox', name: { th: 'คอนเทนต์ unboxing และรีวิวเชิงลึก', en: 'Unboxing content and in-depth reviews' }, duration: 8 },
              { key: 'socialContent', name: { th: 'คอนเทนต์โซเชียล 30 ชิ้น', en: '30 pieces of social content' }, duration: 15 },
              { key: 'website', name: { th: 'หน้าเว็บผลิตภัณฑ์', en: 'Product pages' }, duration: 10 },
            ],
          },
          {
            key: 'ads',
            name: { th: 'สื่อโฆษณา', en: 'Advertising assets' },
            children: [
              { key: 'mediaPlan', name: { th: 'วางแผนซื้อสื่อ (media plan)', en: 'Media plan' }, duration: 6 },
              { key: 'goLive', name: { th: 'ปล่อยแคมเปญออนไลน์', en: 'Launch the online campaign' }, duration: 3 },
            ],
          },
          {
            key: 'pr',
            name: { th: 'PR และพาร์ตเนอร์', en: 'PR and partners' },
            children: [
              { key: 'pressEvent', name: { th: 'จัด press launch event', en: 'Run the press launch event' }, duration: 5 },
              { key: 'influencer', name: { th: 'ติดต่อ influencer รีวิวสินค้า', en: 'Line up influencers for product reviews' }, duration: 12 },
            ],
          },
          {
            key: 'sales',
            name: { th: 'ช่องทางขาย', en: 'Sales channels' },
            children: [
              { key: 'marketplace', name: { th: 'เปิดร้านบน marketplace ออนไลน์', en: 'Open the online marketplace storefront' }, duration: 7 },
              { key: 'csTrain', name: { th: 'ฝึกทีมบริการลูกค้าและสคริปต์ตอบคำถาม', en: 'Train the support team and write the response scripts' }, duration: 4 },
            ],
          },
          {
            key: 'measure',
            name: { th: 'เปิดขายและวัดผล', en: 'On-sale and measurement' },
            children: [
              { key: 'onSale', name: { th: 'เริ่มเปิดขายพร้อมแคมเปญ', en: 'Go on sale alongside the campaign' }, milestone: true },
              { key: 'track', name: { th: 'ติดตาม KPI รายสัปดาห์', en: 'Track KPIs weekly' }, duration: 28 },
            ],
          },
        ],
        deps: [
          { from: 'positioning', to: 'kpi' },
          { from: 'positioning', to: 'video' },
          { from: 'positioning', to: 'socialContent' },
          { from: 'positioning', to: 'website' },
          { from: 'positioning', to: 'unbox' },
          { from: 'kpi', to: 'mediaPlan' },
          { from: 'kpi', to: 'csTrain' },
          { from: 'website', to: 'marketplace' },
          { from: 'mediaPlan', to: 'goLive' },
          { from: 'video', to: 'goLive' },
          { from: 'website', to: 'pressEvent' },
          { from: 'goLive', to: 'onSale' },
          { from: 'pressEvent', to: 'onSale' },
          { from: 'influencer', to: 'onSale' },
          { from: 'marketplace', to: 'onSale' },
          { from: 'csTrain', to: 'onSale' },
          { from: 'onSale', to: 'track' },
        ],
        extraStructures: [
          {
            typeId: 'rbs',
            name: { th: 'ความเสี่ยงแคมเปญ (RBS)', en: 'Campaign risks (RBS)' },
            nodes: [
              {
                key: 'market',
                name: { th: 'ความเสี่ยงตลาด', en: 'Market risks' },
                children: [
                  {
                    key: 'competitor',
                    name: { th: 'คู่แข่งปล่อยโปรโมชันตีราคาช่วงเดียวกัน', en: 'A competitor undercuts prices in the same window' },
                    attrs: { probability: 40, impact: 'high', response: 'เตรียม bundle และสิทธิพิเศษล่วงหน้า' },
                  },
                  {
                    key: 'viralMiss',
                    name: { th: 'คอนเทนต์ไม่ไวรัลตามเป้า', en: 'Content fails to reach its reach target' },
                    attrs: { probability: 35, impact: 'medium', response: 'สำรองงบ boost โพสต์ที่ engagement ดี' },
                  },
                ],
              },
              {
                key: 'supply',
                name: { th: 'ความเสี่ยงอุปทาน', en: 'Supply risks' },
                children: [
                  {
                    key: 'stock',
                    name: { th: 'สต๊อกสินค้าไม่ทันวันเปิดขาย', en: 'Stock does not arrive before the on-sale date' },
                    attrs: { probability: 25, impact: 'high', response: 'เปิด pre-order + สื่อสารวันส่งมอบชัดเจน' },
                  },
                  {
                    key: 'overspend',
                    name: { th: 'งบโฆษณาบานปลาย', en: 'Ad budget overruns' },
                    attrs: { probability: 30, impact: 'medium', response: 'รีวิว spend รายสัปดาห์กับทีมการเงิน' },
                  },
                ],
              },
            ],
          },
          {
            typeId: 'cbs',
            name: { th: 'งบแคมเปญ (CBS)', en: 'Campaign budget (CBS)' },
            nodes: [
              { key: 'cProduce', name: { th: 'งบผลิตสื่อ', en: 'Production budget' }, attrs: { budget: 800000 } },
              { key: 'cMedia', name: { th: 'งบซื้อสื่อโฆษณา', en: 'Media buying budget' }, attrs: { budget: 1500000 } },
              { key: 'cEvent', name: { th: 'งบอีเวนต์และ PR', en: 'Event and PR budget' }, attrs: { budget: 500000 } },
              { key: 'cInfluencer', name: { th: 'ค่าอินฟลูเอนเซอร์', en: 'Influencer cost' }, attrs: { budget: 400000 } },
              { key: 'cChannel', name: { th: 'ค่าธรรมเนียม marketplace', en: 'Marketplace fees' }, attrs: { budget: 60000 } },
            ],
          },
        ],
        links: [
          { kind: 'charges', from: 'video', to: 'cProduce' },
          { kind: 'charges', from: 'unbox', to: 'cProduce' },
          { kind: 'charges', from: 'socialContent', to: 'cProduce' },
          { kind: 'charges', from: 'mediaPlan', to: 'cMedia' },
          { kind: 'charges', from: 'pressEvent', to: 'cEvent' },
          { kind: 'charges', from: 'influencer', to: 'cInfluencer' },
          { kind: 'charges', from: 'marketplace', to: 'cChannel' },
        ],
      }, lang),
  },

  // ------------------------------------------------------------------ 5 · office move
  {
    id: 'sample-office-move',
    name: { th: 'ตัวอย่าง 5 · ย้ายสำนักงาน', en: 'Sample 5 · Office relocation' },
    build: (lang) =>
      buildSample({
        id: 'sample-office-move',
        name: { th: 'ตัวอย่าง 5 · ย้ายสำนักงาน', en: 'Sample 5 · Office relocation' },
        startIso: '2026-10-01',
        wbs: [
          {
            key: 'prep',
            name: { th: 'เตรียมการ', en: 'Preparation' },
            children: [
              { key: 'survey', name: { th: 'สำรวจความต้องการพื้นที่', en: 'Survey the space requirements' }, duration: 5 },
              { key: 'lease', name: { th: 'เลือกและเซ็นสัญญาอาคารใหม่', en: 'Choose and sign for the new building' }, duration: 10 },
              { key: 'layout', name: { th: 'ออกแบบผังสำนักงาน', en: 'Design the office layout' }, duration: 10 },
              { key: 'itInventory', name: { th: 'จัดทำบัญชีอุปกรณ์ IT ที่ต้องย้าย', en: 'Inventory the IT equipment to be moved' }, duration: 4 },
            ],
          },
          {
            key: 'fitout',
            name: { th: 'ปรับปรุงอาคารใหม่', en: 'Refurbish the new premises' },
            children: [
              { key: 'decor', name: { th: 'ตกแต่งและระบบไฟ–แอร์', en: 'Fit-out, lighting and air conditioning' }, duration: 20 },
              { key: 'network', name: { th: 'ติดตั้งเน็ตและโทรศัพท์', en: 'Install internet and phone lines' }, duration: 5 },
              { key: 'furniture', name: { th: 'จัดซื้อโต๊ะ เก้าอี้ และตู้ล็อกเกอร์', en: 'Procure desks, chairs and lockers' }, duration: 15 },
              { key: 'security', name: { th: 'ติดตั้งกล้องวงจรปิดและ door access', en: 'Install CCTV and door access' }, duration: 6 },
            ],
          },
          {
            key: 'move',
            name: { th: 'การย้าย', en: 'The move' },
            children: [
              { key: 'mover', name: { th: 'จ้างบริษัทขนย้ายและวางแผนวันย้าย', en: 'Hire the movers and plan moving day' }, duration: 4 },
              { key: 'packIt', name: { th: 'แพ็กอุปกรณ์ IT และเซิร์ฟเวอร์', en: 'Pack the IT equipment and servers' }, duration: 2 },
              { key: 'packDoc', name: { th: 'แพ็กเอกสารและของแต่ละแผนก', en: 'Pack each department\'s files and belongings' }, duration: 5 },
              { key: 'moveIt', name: { th: 'ย้ายและตั้งระบบ IT ที่อาคารใหม่', en: 'Move and set up IT at the new building' }, duration: 2 },
              { key: 'moveDay', name: { th: 'วันย้ายจริง', en: 'Moving day' }, milestone: true },
            ],
          },
          {
            key: 'after',
            name: { th: 'หลังย้าย', en: 'After the move' },
            children: [
              { key: 'oldSite', name: { th: 'คืนอาคารเก่า', en: 'Hand back the old premises' }, duration: 5 },
              { key: 'settle', name: { th: 'แก้ปัญหาช่วงเริ่มใช้งาน', en: 'Troubleshoot the early usage period' }, duration: 10 },
            ],
          },
        ],
        deps: [
          { from: 'survey', to: 'lease' },
          { from: 'lease', to: 'layout' },
          { from: 'lease', to: 'itInventory' },
          { from: 'layout', to: 'decor' },
          { from: 'layout', to: 'furniture' },
          // network cabling waits for decoration, plus a 10-day buffer lag
          { from: 'decor', to: 'network', lag: 10 },
          { from: 'network', to: 'security' },
          { from: 'network', to: 'packIt' },
          { from: 'furniture', to: 'packDoc' },
          { from: 'network', to: 'mover' },
          { from: 'packIt', to: 'moveIt' },
          { from: 'mover', to: 'moveDay' },
          { from: 'packDoc', to: 'moveDay' },
          { from: 'moveIt', to: 'moveDay' },
          { from: 'moveDay', to: 'oldSite' },
          { from: 'moveDay', to: 'settle' },
        ],
      }, lang),
  },
]
