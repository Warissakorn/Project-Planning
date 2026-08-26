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
import type { Project } from './types'

// --- The five samples -----------------------------------------------------------

export interface SampleEntry {
  id: string
  name: string
  build: () => Project
}

export const SAMPLE_PROJECTS: SampleEntry[] = [
  // ------------------------------------------------------------------ 1 · construction
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
            key: 'pre',
            name: 'งานก่อนก่อสร้าง',
            children: [
              { key: 'survey', name: 'สำรวจหน้างานและตรวจสอบดิน', duration: 10, cost: 80000 },
              { key: 'arch', name: 'ออกแบบสถาปัตยกรรม', duration: 20, cost: 150000 },
              { key: 'structDesign', name: 'ออกแบบโครงสร้างและระบบ MEP', duration: 25, cost: 180000 },
              { key: 'boq', name: 'ประมาณการราคา (BOQ) และจ้างผู้รับเหมา', duration: 12, cost: 40000 },
              { key: 'permit', name: 'ขอใบอนุญาตก่อสร้าง', duration: 30, cost: 30000 },
              { key: 'permitDone', name: 'ได้รับใบอนุญาต', milestone: true },
              { key: 'sitePrep', name: 'ปิดล้อมหน้างานและเตรียมพื้นที่', duration: 8, cost: 120000 },
            ],
          },
          {
            key: 'foundation',
            name: 'งานฐานราก',
            children: [
              { key: 'pilingA', name: 'ตอกเสาเข็มโซน A', duration: 12, cost: 250000 },
              { key: 'pilingB', name: 'ตอกเสาเข็มโซน B', duration: 10, cost: 230000 },
              { key: 'excavation', name: 'ขุดคันดินและระบบระบายน้ำกันน้ำท่วมหน้างาน', duration: 8, cost: 90000 },
              { key: 'footing', name: 'หล่อฐานรากและคานค้ำ', duration: 15, cost: 380000 },
              { key: 'waterproof', name: 'งานกันซึมฐานราก', duration: 4, cost: 70000 },
            ],
          },
          {
            key: 'structure',
            name: 'งานโครงสร้างอาคาร',
            children: [
              { key: 'floor1', name: 'โครงสร้างชั้น 1', duration: 18, cost: 320000 },
              { key: 'floor2', name: 'โครงสร้างชั้น 2', duration: 15, cost: 310000 },
              { key: 'floor3', name: 'โครงสร้างชั้น 3', duration: 15, cost: 300000 },
              { key: 'topOut', name: 'Topping out — ยกหลังคาอาคารสำเร็จ', milestone: true },
              { key: 'roofSlab', name: 'งานหลังคาและถังน้ำบนดาดฟ้า', duration: 8, cost: 160000 },
            ],
          },
          {
            key: 'mep',
            name: 'งานระบบ MEP',
            children: [
              { key: 'riser', name: 'ระบบหลักและชัฟท์เดินท่อ–สายไฟ', duration: 14, cost: 210000 },
              { key: 'elec', name: 'ระบบไฟฟ้าและไฟส่องสว่างภายใน', duration: 22, cost: 280000 },
              { key: 'plumbing', name: 'ระบบประปาและสุขาภิบาล', duration: 18, cost: 190000 },
              { key: 'hvac', name: 'ติดตั้งเครื่องปรับอากาศและระบายอากาศ', duration: 16, cost: 240000 },
              { key: 'fire', name: 'ระบบดับเพลิงและสัญญาณแจ้งเหตุ', duration: 10, cost: 130000 },
              { key: 'lift', name: 'ติดตั้งลิฟต์โดยสาร', duration: 14, cost: 520000 },
            ],
          },
          {
            key: 'finish',
            name: 'งานสถาปัตยกรรมและตกแต่ง',
            children: [
              { key: 'masonry', name: 'งานก่อฉากผนัง', duration: 20, cost: 350000 },
              { key: 'tile', name: 'กระเบื้องพื้นและผนัง', duration: 14, cost: 300000 },
              { key: 'doorWin', name: 'ประตู หน้าต่าง และกระจกเคลือบ', duration: 10, cost: 260000 },
              { key: 'ceiling', name: 'ฝ้าเพดานและโคมไฟ', duration: 8, cost: 140000 },
              { key: 'paint', name: 'งานทาสีทั้งอาคาร', duration: 12, cost: 170000 },
              { key: 'lobby', name: 'ตกแต่งล็อบบี้และห้องรับรอง', duration: 12, cost: 290000 },
            ],
          },
          {
            key: 'external',
            name: 'งานภายนอกอาคาร',
            children: [
              { key: 'landscape', name: 'งานภูมิทัศน์และที่จอดรถ', duration: 15, cost: 220000 },
              { key: 'driveway', name: 'ถนนภายในและระบบระบายน้ำหน้างาน', duration: 10, cost: 180000 },
            ],
          },
          {
            key: 'close',
            name: 'ทดสอบและส่งมอบ',
            children: [
              { key: 'commissioning', name: 'ทดสอบระบบทั้งหมด (commissioning)', duration: 8, cost: 90000 },
              { key: 'inspection', name: 'ตรวจรับกับผู้ควบคุมงานและเจ้าของโครงการ', duration: 5, cost: 20000 },
              { key: 'handoverDay', name: 'ส่งมอบอาคาร', milestone: true },
              { key: 'asbuilt', name: 'ส่งแบบ as-built และคู่มือดูแลอาคาร', duration: 6, cost: 40000 },
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
            name: 'หน่วยงานในโครงการ (OBS)',
            nodes: [
              { key: 'pm', name: 'ผู้จัดการโครงการ', attrs: { owner: 'คุณสมชาย วงศ์ประเสริฐ' } },
              { key: 'designOrg', name: 'ฝ่ายออกแบบ', attrs: { owner: 'บจก. สถาปนิก ร่วมแบบ' } },
              { key: 'contractorStruct', name: 'ผู้รับเหมางานโครงสร้าง', attrs: { owner: 'บจก. สร้างการ' } },
              { key: 'contractorMep', name: 'ผู้รับเหมาระบบ MEP', attrs: { owner: 'บจก. ระบบสมบูรณ์' } },
              { key: 'contractorFin', name: 'ผู้รับเหมางานตกแต่ง', attrs: { owner: 'หจก. สวยงามตกแต่ง' } },
              { key: 'extOrg', name: 'ผู้รับเหมางานภูมิทัศน์', attrs: { owner: 'บจก. เขียวขจีแลนด์' } },
              { key: 'qa', name: 'ฝ่ายควบคุมคุณภาพและความปลอดภัย', attrs: { owner: 'วศ. อารีย์ ใจดี' } },
              { key: 'procurement', name: 'ฝ่ายจัดซื้อวัสดุ', attrs: { owner: 'คุณมะลิ ซื้อของดี' } },
            ],
          },
          {
            typeId: 'cbs',
            name: 'หมวดต้นทุน (CBS)',
            nodes: [
              { key: 'cSoft', name: 'ค่าออกแบบและขออนุญาต', attrs: { budget: 400000 } },
              {
                key: 'cMaterial',
                name: 'ค่าวัสดุก่อสร้าง',
                children: [
                  { key: 'matStruct', name: 'วัสดุงานฐานรากและโครงสร้าง', attrs: { budget: 1600000 } },
                  { key: 'matMep', name: 'วัสดุระบบ MEP และลิฟต์', attrs: { budget: 900000 } },
                  { key: 'matFin', name: 'วัสดุงานตกแต่ง', attrs: { budget: 800000 } },
                ],
              },
              {
                key: 'cLabour',
                name: 'ค่าแรงงาน',
                children: [
                  { key: 'labStruct', name: 'แรงงานงานโครงสร้าง', attrs: { budget: 700000 } },
                  { key: 'labMep', name: 'แรงงานระบบ MEP', attrs: { budget: 450000 } },
                  { key: 'labFin', name: 'แรงงานงานตกแต่ง', attrs: { budget: 500000 } },
                ],
              },
              { key: 'cEquip', name: 'ค่าเช่าเครื่องจักรและนั่งร้าน', attrs: { budget: 350000 } },
              { key: 'cClose', name: 'ค่าทดสอบและส่งมอบ', attrs: { budget: 150000 } },
              { key: 'cCont', name: 'สำรองเผื่อฉุกเฉิน (contingency)', attrs: { budget: 500000 } },
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
                    name: 'ฝนตกซ้ำซากทำงานโครงสร้างล่าช้า',
                    attrs: { probability: 40, impact: 'high', response: 'เผื่อเวลาในแผนงานกลางแจ้ง + เตรียมผ้าคลุมคอนกรีต' },
                  },
                  {
                    key: 'price',
                    name: 'ราคาเหล็กและคอนกรีตผันผวน',
                    attrs: { probability: 50, impact: 'medium', response: 'ล็อกราคากับซัพพลายเออร์ล่วงหน้า' },
                  },
                  {
                    key: 'regulation',
                    name: 'เอกสารขออนุญาตถูกตีกลับ',
                    attrs: { probability: 20, impact: 'high', response: 'ให้ที่ปรึกษาตรวจแบบตาม รพน. ก่อนยื่นจริง' },
                  },
                ],
              },
              {
                key: 'rOps',
                name: 'ความเสี่ยงการดำเนินงาน',
                children: [
                  {
                    key: 'labour',
                    name: 'แรงงานขาดมือช่วงเร่งงานโครงสร้าง',
                    attrs: { probability: 30, impact: 'high', response: 'สัญญาระบุโทษความล่าช้า + มีผู้รับเหมาสำรอง' },
                  },
                  {
                    key: 'change',
                    name: 'เจ้าของงานขอแบบเปลี่ยนกลางทาง',
                    attrs: { probability: 35, impact: 'medium', response: 'ตรึงแบบก่อนเริ่มงาน + change control' },
                  },
                  {
                    key: 'liftDelay',
                    name: 'ลิฟต์นำเข้ามาไม่ทันจังหวะติดตั้ง',
                    attrs: { probability: 25, impact: 'high', response: 'สั่งจองลิฟต์ตั้งแต่ต้นโครงการ พร้อมติดตาม shipment' },
                  },
                ],
              },
              {
                key: 'rFinance',
                name: 'ความเสี่ยงด้านการเงิน',
                children: [
                  {
                    key: 'cashflow',
                    name: 'กระแสเงินสดติดลบช่วงงานโครงสร้าง',
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
      }),
  },

  // ------------------------------------------------------------------ 2 · mobile app
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
              { key: 'competitor', name: 'วิเคราะห์แอปคู่แข่ง', duration: 4 },
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
              { key: 'usability', name: 'Usability test กับผู้ใช้จริง', duration: 5 },
            ],
          },
          {
            key: 'dev',
            name: 'พัฒนา',
            children: [
              {
                key: 'devBackend',
                name: 'ฝั่ง Backend',
                children: [
                  { key: 'backend', name: 'ตั้งโครง backend + CI/CD', duration: 6 },
                  { key: 'authApi', name: 'API สมาชิกและล็อกอิน', duration: 10 },
                  { key: 'menuApi', name: 'API เมนูและค้นหาร้าน', duration: 12 },
                  { key: 'payApi', name: 'API ชำระเงินและ receipt', duration: 10 },
                ],
              },
              {
                key: 'devApp',
                name: 'แอปมือถือ',
                children: [
                  { key: 'appShell', name: 'โครงแอปและ navigation', duration: 6 },
                  { key: 'uiAuth', name: 'หน้าจอสมาชิก', duration: 6 },
                  { key: 'uiMenu', name: 'หน้าจอเมนู–ค้นหา', duration: 9 },
                  { key: 'uiCart', name: 'หน้าจอตะกร้า–ชำระเงิน', duration: 9 },
                  { key: 'notify', name: 'แจ้งเตือนสถานะออเดอร์', duration: 5 },
                ],
              },
            ],
          },
          {
            key: 'test',
            name: 'ทดสอบ',
            children: [
              { key: 'qa', name: 'QA รวมทุกโมดูล', duration: 10 },
              { key: 'perf', name: 'ทดสอบ load และประสิทธิภาพ', duration: 5 },
              { key: 'beta', name: 'Beta กับร้านนำร่อง 10 ร้าน', duration: 10 },
            ],
          },
          {
            key: 'launch',
            name: 'เปิดตัว',
            children: [
              { key: 'assets', name: 'สื่อแนะนำแอปใน App Store', duration: 5 },
              { key: 'storeReview', name: 'ส่งรีวิว App Store / Play Store', duration: 7 },
              { key: 'launchDay', name: 'เปิดตัว v1.0', milestone: true },
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
            name: 'โครงสร้างผลผลิต (PBS)',
            nodes: [
              { key: 'pAuth', name: 'โมดูลสมาชิก', attrs: { version: '1.0' } },
              { key: 'pMenu', name: 'โมดูลเมนูและค้นหา', attrs: { version: '1.0' } },
              { key: 'pCart', name: 'โมดูลสั่งซื้อ/ชำระเงิน', attrs: { version: '1.0' } },
              { key: 'pNotify', name: 'ระบบแจ้งเตือน', attrs: { version: '1.0' } },
              { key: 'pReview', name: 'ระบบรีวิวร้าน', attrs: { version: '1.1 (roadmap)' } },
              { key: 'pAnalytics', name: 'Dashboard analytics ร้านค้า', attrs: { version: '1.1 (roadmap)' } },
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
              { key: 'marketing', name: 'ทีม Marketing', attrs: { owner: 'คุณแพร วัลย์พร' } },
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
      }),
  },

  // ------------------------------------------------------------------ 3 · seminar
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
              { key: 'sponsor', name: 'ติดต่อสปอนเซอร์และบูธแสดงสินค้า', duration: 6 },
            ],
          },
          {
            key: 'content',
            name: 'วิทยากรและเนื้อหา',
            children: [
              { key: 'invite', name: 'เชิญและยืนยันวิทยากร', duration: 14 },
              { key: 'agenda', name: 'จัด agenda และลำดับช่วงบรรยาย', duration: 3 },
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
              { key: 'badgeKit', name: 'ป้าย เอกสาร และของที่ระลึก', duration: 4 },
            ],
          },
          {
            key: 'promo',
            name: 'ประชาสัมพันธ์และลงทะเบียน',
            children: [
              { key: 'poster', name: 'โพสเตอร์และหน้าลงทะเบียนออนไลน์', duration: 5 },
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
            name: 'คณะทำงาน (OBS)',
            nodes: [
              { key: 'chair', name: 'ประธานจัดงาน', attrs: { owner: 'คุณอร วิไลลักษณ์' } },
              { key: 'contentTeam', name: 'ฝ่ายเนื้อหา', attrs: { owner: 'คุณต้น ฤทธิ์มะนาว' } },
              { key: 'venueTeam', name: 'ฝ่ายสถานที่', attrs: { owner: 'คุณกล้วย มณีรัตน์' } },
              { key: 'prTeam', name: 'ฝ่ายประชาสัมพันธ์', attrs: { owner: 'คุณเบลล์ กมลชนก' } },
              { key: 'bizTeam', name: 'ฝ่ายพันธมิตรและผู้สนับสนุน', attrs: { owner: 'คุณน็อต ธนกฤต' } },
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
              { key: 'cPrint', name: 'ค่าเอกสารและของที่ระลึก', attrs: { budget: 12000 } },
              { key: 'cSponsorBooth', name: 'ตกแต่งบูธสปอนเซอร์', attrs: { budget: 18000 } },
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
      }),
  },

  // ------------------------------------------------------------------ 4 · marketing launch
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
              { key: 'video', name: 'ถ่ายทำวิดีโอโฆษณาหลัก', duration: 12 },
              { key: 'unbox', name: 'คอนเทนต์ unboxing และรีวิวเชิงลึก', duration: 8 },
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
            key: 'sales',
            name: 'ช่องทางขาย',
            children: [
              { key: 'marketplace', name: 'เปิดร้านบน marketplace ออนไลน์', duration: 7 },
              { key: 'csTrain', name: 'ฝึกทีมบริการลูกค้าและสคริปต์ตอบคำถาม', duration: 4 },
            ],
          },
          {
            key: 'measure',
            name: 'เปิดขายและวัดผล',
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
              { key: 'cChannel', name: 'ค่าธรรมเนียม marketplace', attrs: { budget: 60000 } },
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
      }),
  },

  // ------------------------------------------------------------------ 5 · office move
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
              { key: 'itInventory', name: 'จัดทำบัญชีอุปกรณ์ IT ที่ต้องย้าย', duration: 4 },
            ],
          },
          {
            key: 'fitout',
            name: 'ปรับปรุงอาคารใหม่',
            children: [
              { key: 'decor', name: 'ตกแต่งและระบบไฟ–แอร์', duration: 20 },
              { key: 'network', name: 'ติดตั้งเน็ตและโทรศัพท์', duration: 5 },
              { key: 'furniture', name: 'จัดซื้อโต๊ะ เก้าอี้ และตู้ล็อกเกอร์', duration: 15 },
              { key: 'security', name: 'ติดตั้งกล้องวงจรปิดและ door access', duration: 6 },
            ],
          },
          {
            key: 'move',
            name: 'การย้าย',
            children: [
              { key: 'mover', name: 'จ้างบริษัทขนย้ายและวางแผนวันย้าย', duration: 4 },
              { key: 'packIt', name: 'แพ็กอุปกรณ์ IT และเซิร์ฟเวอร์', duration: 2 },
              { key: 'packDoc', name: 'แพ็กเอกสารและของแต่ละแผนก', duration: 5 },
              { key: 'moveIt', name: 'ย้ายและตั้งระบบ IT ที่อาคารใหม่', duration: 2 },
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
      }),
  },
]
