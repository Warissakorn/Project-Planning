/** 🏗️ Construction templates: new house, renovation, MEP installation. */

import { buildSample } from '../specProject'
import type { TemplateEntry } from './index'

export const CONSTRUCTION_TEMPLATES: TemplateEntry[] = [
  {
    id: 'tpl-house-build',
    name: { th: 'สร้างบ้านใหม่ 1 ชั้น (2 ห้องนอน)', en: 'New single-story house' },
    desc: {
      th: 'ตั้งแต่สำรวจที่ดิน ออกแบบ ขออนุญาต จนถึงงานระบบและส่งมอบ',
      en: 'From survey and permits through structure, MEP and handover',
    },
    build: (lang) =>
      buildSample({
        name: { th: 'สร้างบ้านใหม่ 1 ชั้น (2 ห้องนอน)', en: 'Build a single-storey house (2 bedrooms)' },
        wbs: [
          {
            key: 'pre',
            name: { th: 'งานก่อนก่อสร้าง', en: 'Pre-construction' },
            children: [
              { key: 'survey', name: { th: 'สำรวจที่ดินและวัดระดับ', en: 'Land survey and levelling' }, duration: 5, cost: 15000 },
              {
                key: 'design',
                name: { th: 'ออกแบบและประมาณราคา', en: 'Design and cost estimate' },
                children: [
                  { key: 'draw', name: { th: 'ออกแบบแปลนบ้าน', en: 'Design the house plans' }, duration: 12, cost: 40000 },
                  { key: 'boq', name: { th: 'เขียน BOQ และประมาณการ', en: 'Write the BOQ and cost estimate' }, duration: 18, cost: 20000 },
                ],
              },
              { key: 'permit', name: { th: 'ได้ใบอนุญาตก่อสร้าง', en: 'Construction permit granted' }, milestone: true },
              { key: 'clear', name: { th: 'ปัดตวาดและปรับพื้นที่', en: 'Clear and level the site' }, duration: 4, cost: 20000 },
            ],
          },
          {
            key: 'struct',
            name: { th: 'งานโครงสร้าง', en: 'Structural works' },
            children: [
              {
                key: 'foundation',
                name: { th: 'ฐานรากและคานสะพาน', en: 'Footings and ground beams' },
                children: [
                  { key: 'piles', name: { th: 'เสาเข็มคอนกรีตและหัวเข็ม', en: 'Concrete piles and pile caps' }, duration: 8, cost: 110000 },
                  { key: 'groundBeam', name: { th: 'คานสะพานและหน้าดิน', en: 'Ground beams and subgrade' }, duration: 6, cost: 70000 },
                ],
              },
              { key: 'slab', name: { th: 'เทพื้นคอนกรีต', en: 'Pour the concrete slab' }, duration: 6, cost: 90000 },
              { key: 'walls', name: { th: 'ก่อผนังและเสาคาน', en: 'Masonry walls, columns and beams' }, duration: 18, cost: 220000 },
              { key: 'roof', name: { th: 'โครงหลังคาและกระเบื้อง', en: 'Roof frame and tiles' }, duration: 10, cost: 130000 },
            ],
          },
          {
            key: 'mep',
            name: { th: 'งานระบบ', en: 'Building services' },
            children: [
              { key: 'electric', name: { th: 'เดินท่อร้อยสายไฟฟ้า', en: 'Run electrical conduit' }, duration: 8, cost: 70000 },
              { key: 'plumb', name: { th: 'งานประปาและระบบน้ำเสีย', en: 'Plumbing and wastewater' }, duration: 8, cost: 65000 },
              { key: 'ac', name: { th: 'ติดตั้งแอร์และระบายอากาศ', en: 'Install air conditioning and ventilation' }, duration: 5, cost: 85000 },
            ],
          },
          {
            key: 'finish',
            name: { th: 'งานสถาปัตยกรรม', en: 'Architectural works' },
            children: [
              { key: 'plaster', name: { th: 'ฉาบผนังและเพดาน', en: 'Plaster walls and ceilings' }, duration: 12, cost: 110000 },
              { key: 'tile', name: { th: 'กระเบื้องพื้นและผนัง', en: 'Floor and wall tiling' }, duration: 10, cost: 95000 },
              { key: 'paint', name: { th: 'งานสีภายใน-ภายนอก', en: 'Interior and exterior painting' }, duration: 8, cost: 55000 },
              {
                key: 'doors',
                name: { th: 'งานไม้และครัว', en: 'Joinery and kitchen' },
                children: [
                  { key: 'carpentry', name: { th: 'งานไม้ในตัวและครัวบิ้วอิน', en: 'Built-in joinery and fitted kitchen' }, duration: 4, cost: 70000 },
                  { key: 'installDoors', name: { th: 'ติดตั้งประตู-หน้าต่าง', en: 'Install doors and windows' }, duration: 3, cost: 50000 },
                ],
              },
              { key: 'bath', name: { th: 'ตกแต่งห้องน้ำและสุขภัณฑ์', en: 'Bathroom fit-out and sanitary ware' }, duration: 5, cost: 75000 },
            ],
          },
          {
            key: 'close',
            name: { th: 'ส่งมอบ', en: 'Handover' },
            children: [
              { key: 'testMep', name: { th: 'ทดสอบระบบไฟ-น้ำ-แอร์', en: 'Test electrical, water and air conditioning' }, duration: 2, cost: 5000 },
              { key: 'clean', name: { th: 'ทำความสะอาดก่อนส่งมอบ', en: 'Final clean before handover' }, duration: 2, cost: 10000 },
              { key: 'handover', name: { th: 'ส่งมอบบ้าน', en: 'House handover' }, milestone: true },
            ],
          },
        ],
        deps: [
          { from: 'survey', to: 'draw' },
          { from: 'draw', to: 'boq' },
          { from: 'boq', to: 'permit' },
          { from: 'permit', to: 'clear' },
          { from: 'clear', to: 'piles' },
          { from: 'piles', to: 'groundBeam' },
          { from: 'groundBeam', to: 'slab' },
          { from: 'slab', to: 'walls', type: 'SS', lag: 4 },
          { from: 'walls', to: 'roof' },
          { from: 'walls', to: 'electric', type: 'SS', lag: 8 },
          { from: 'walls', to: 'plumb', type: 'SS', lag: 8 },
          { from: 'roof', to: 'plaster' },
          { from: 'electric', to: 'ac' },
          { from: 'plaster', to: 'tile', lag: 3 },
          { from: 'tile', to: 'paint' },
          { from: 'tile', to: 'carpentry', type: 'SS', lag: 4 },
          { from: 'carpentry', to: 'installDoors' },
          { from: 'bath', to: 'testMep' },
          { from: 'paint', to: 'testMep' },
          { from: 'ac', to: 'testMep' },
          { from: 'testMep', to: 'clean' },
          { from: 'clean', to: 'handover' },
        ],
      }, lang),
  },
  {
    id: 'tpl-house-renovate',
    name: { th: 'ต่อเติม / รีโนเวทบ้าน', en: 'Home extension / renovation' },
    desc: {
      th: 'รื้อ-ต่อเติมห้องหรือชั้นใหม่ พร้อมงานระบบและตกแต่งใหม่ทั้งหมด',
      en: 'Demolish, extend structure, rerun MEP and refinish',
    },
    build: (lang) =>
      buildSample({
        name: { th: 'ต่อเติม / รีโนเวทบ้าน', en: 'Home extension or renovation' },
        wbs: [
          {
            key: 'plan',
            name: { th: 'วางแผนและออกแบบ', en: 'Planning and design' },
            children: [
              { key: 'brief', name: { th: 'สำรวจโครงสร้างเดิมและเก็บความต้องการ', en: 'Survey the existing structure and gather requirements' }, duration: 5, cost: 8000 },
              {
                key: 'draw',
                name: { th: 'ออกแบบและประมาณราคา', en: 'Design and cost estimate' },
                children: [
                  { key: 'conceptDesign', name: { th: 'Concept + แปลนเบื้องต้น', en: 'Concept + preliminary plans' }, duration: 5, cost: 12000 },
                  { key: 'workingDwg', name: { th: 'แบบก่อสร้าง + ใบเสนอราคา', en: 'Construction drawings + quotations' }, duration: 5, cost: 13000 },
                ],
              },
              { key: 'contract', name: { th: 'ทำสัญญากับผู้รับเหมา', en: 'Sign the contractor agreement' }, milestone: true },
            ],
          },
          {
            key: 'demo',
            name: { th: 'งานรื้อถอน', en: 'Demolition' },
            children: [{ key: 'demolish', name: { th: 'รื้อส่วนที่ต่อเติม/รื้อผนังเดิม', en: 'Strip out the extension and existing walls' }, duration: 5, cost: 30000 }],
          },
          {
            key: 'build',
            name: { th: 'งานโครงสร้างต่อเติม', en: 'Extension structural works' },
            children: [
              { key: 'found', name: { th: 'ฐานราก/คานเสริม', en: 'Footings and tie beams' }, duration: 7, cost: 80000 },
              { key: 'frame', name: { th: 'ก่อผนังและโครงหลังคา', en: 'Masonry walls and roof frame' }, duration: 12, cost: 140000 },
            ],
          },
          {
            key: 'systems',
            name: { th: 'งานระบบ', en: 'Building services' },
            children: [
              {
                key: 'wiring',
                name: { th: 'ต่อเติมระบบไฟ-น้ำ', en: 'Extend the electrical and water systems' },
                children: [
                  { key: 'rewiring', name: { th: 'ต่อเติมสายไฟและจุดไฟ', en: 'Extend wiring and lighting points' }, duration: 4, cost: 28000 },
                  { key: 'plumbingFix', name: { th: 'ต่อท่อประปาและจุดน้ำ', en: 'Run water pipes and outlets' }, duration: 3, cost: 17000 },
                ],
              },
              { key: 'acUnit', name: { th: 'ติดตั้งแอร์ใหม่', en: 'Install the new air conditioning' }, duration: 2, cost: 40000 },
            ],
          },
          {
            key: 'refinish',
            name: { th: 'งานตกแต่ง', en: 'Fit-out works' },
            children: [
              { key: 'plaster2', name: { th: 'ฉาบและอุดรอย', en: 'Plaster and fill' }, duration: 6, cost: 35000 },
              {
                key: 'floorTile',
                name: { th: 'งานพื้นและผนัง', en: 'Floor and wall works' },
                children: [
                  { key: 'floorWork', name: { th: 'ปูกระเบื้อง/ไม้ลอย', en: 'Lay tiles and laminate flooring' }, duration: 3, cost: 30000 },
                  { key: 'wallTile', name: { th: 'กระเบื้องผนังห้องเปียก', en: 'Wet-area wall tiling' }, duration: 2, cost: 25000 },
                ],
              },
              { key: 'paint2', name: { th: 'ทาสีใหม่', en: 'Repaint' }, duration: 4, cost: 25000 },
              { key: 'fittings', name: { th: 'ติดตั้งสุขภัณฑ์และอุปกรณ์', en: 'Install sanitary ware and fittings' }, duration: 3, cost: 45000 },
            ],
          },
          {
            key: 'done',
            name: { th: 'ปิดงาน', en: 'Closeout' },
            children: [
              { key: 'inspect', name: { th: 'ตรวจงานร่วมกับเจ้าของบ้าน', en: 'Walk the works with the homeowner' }, duration: 1 },
              { key: 'finalClean', name: { th: 'ทำความสะอาดและส่งมอบ', en: 'Cleaning and handover' }, duration: 1, cost: 5000 },
            ],
          },
        ],
        deps: [
          { from: 'brief', to: 'conceptDesign' },
          { from: 'conceptDesign', to: 'workingDwg' },
          { from: 'workingDwg', to: 'contract' },
          { from: 'contract', to: 'demolish' },
          { from: 'demolish', to: 'found' },
          { from: 'found', to: 'frame' },
          { from: 'frame', to: 'rewiring', type: 'SS', lag: 6 },
          { from: 'frame', to: 'plaster2' },
          { from: 'rewiring', to: 'plumbingFix' },
          { from: 'plumbingFix', to: 'acUnit' },
          { from: 'plaster2', to: 'floorWork' },
          { from: 'floorWork', to: 'wallTile' },
          { from: 'wallTile', to: 'paint2' },
          { from: 'paint2', to: 'fittings' },
          { from: 'fittings', to: 'inspect' },
          { from: 'inspect', to: 'finalClean' },
        ],
      }, lang),
  },
  {
    id: 'tpl-mep-install',
    name: { th: 'ติดตั้งแอร์ + ระบบไฟฟ้า', en: 'AC + electrical installation' },
    desc: {
      th: 'งานรับเหมา MEP ขนาดเล็ก ตั้งแต่สำรวจหน้างานจนทดสอบระบบ',
      en: 'Small MEP job from site survey through system testing',
    },
    build: (lang) =>
      buildSample({
        name: { th: 'ติดตั้งแอร์ + ระบบไฟฟ้า', en: 'Install air conditioning + electrical' },
        wbs: [
          {
            key: 'prep',
            name: { th: 'เตรียมงาน', en: 'Preparation' },
            children: [
              { key: 'siteCheck', name: { th: 'สำรวจหน้างานและวางแผนเดินท่อ/ราง', en: 'Site survey and containment routing plan' }, duration: 2, cost: 3000 },
              { key: 'procure', name: { th: 'จัดซื้อวัสดุและเครื่องปรับอากาศ', en: 'Procure materials and air conditioning units' }, duration: 5, cost: 160000 },
            ],
          },
          {
            key: 'elec',
            name: { th: 'งานไฟฟ้า', en: 'Electrical works' },
            children: [
              {
                key: 'conduit',
                name: { th: 'รางและตู้ควบคุม', en: 'Trays and control panels' },
                children: [
                  { key: 'conduitRun', name: { th: 'เดินท่อร้อยตามแปลน', en: 'Run conduit to the drawings' }, duration: 3, cost: 18000 },
                  { key: 'panelBox', name: { th: 'ติดตั้งตู้ MDB และเบรกเกอร์', en: 'Install the MDB and breakers' }, duration: 1, cost: 10000 },
                ],
              },
              { key: 'wire', name: { th: 'ร้อยสายและติดตั้งโคมไฟ', en: 'Pull cables and install light fittings' }, duration: 4, cost: 22000 },
            ],
          },
          {
            key: 'cool',
            name: { th: 'งานแอร์', en: 'Air conditioning works' },
            children: [
              { key: 'bracket', name: { th: 'ติดตั้งแขวนและท่อน้ำยา', en: 'Install hangers and refrigerant pipework' }, duration: 3, cost: 15000 },
              { key: 'unit', name: { th: 'ติดตั้งตัวเครื่องและเชื่อมท่อ', en: 'Install the units and connect the pipework' }, duration: 3, cost: 12000 },
            ],
          },
          {
            key: 'qa',
            name: { th: 'ทดสอบและส่งมอบ', en: 'Testing and handover' },
            children: [
              { key: 'megger', name: { th: 'วัดค่าความต้านทานและกราวด์', en: 'Measure resistance and earthing' }, duration: 1, cost: 4000 },
              { key: 'runTest', name: { th: 'เปิดทดสอบเครื่องปรับอากาศ', en: 'Commission the air conditioning' }, duration: 1 },
              { key: 'punchList', name: { th: 'แก้ punch list และส่งมอบงาน', en: 'Clear the punch list and hand over' }, duration: 1, cost: 2000 },
            ],
          },
        ],
        deps: [
          { from: 'siteCheck', to: 'procure', type: 'SS', lag: 1 },
          { from: 'procure', to: 'conduitRun', lag: -2 },
          { from: 'conduitRun', to: 'panelBox' },
          { from: 'panelBox', to: 'wire' },
          { from: 'conduitRun', to: 'bracket' },
          { from: 'bracket', to: 'unit' },
          { from: 'wire', to: 'megger' },
          { from: 'unit', to: 'runTest' },
          { from: 'megger', to: 'punchList' },
          { from: 'runTest', to: 'punchList' },
        ],
      }, lang),
  },
]
