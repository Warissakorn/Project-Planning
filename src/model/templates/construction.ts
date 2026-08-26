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
    build: () =>
      buildSample({
        name: 'สร้างบ้านใหม่ 1 ชั้น (2 ห้องนอน)',
        wbs: [
          {
            key: 'pre',
            name: 'งานก่อนก่อสร้าง',
            children: [
              { key: 'survey', name: 'สำรวจที่ดินและวัดระดับ', duration: 5, cost: 15000 },
              {
                key: 'design',
                name: 'ออกแบบและประมาณราคา',
                children: [
                  { key: 'draw', name: 'ออกแบบแปลนบ้าน', duration: 12, cost: 40000 },
                  { key: 'boq', name: 'เขียน BOQ และประมาณการ', duration: 18, cost: 20000 },
                ],
              },
              { key: 'permit', name: 'ได้ใบอนุญาตก่อสร้าง', milestone: true },
              { key: 'clear', name: 'ปัดตวาดและปรับพื้นที่', duration: 4, cost: 20000 },
            ],
          },
          {
            key: 'struct',
            name: 'งานโครงสร้าง',
            children: [
              {
                key: 'foundation',
                name: 'ฐานรากและคานสะพาน',
                children: [
                  { key: 'piles', name: 'เสาเข็มคอนกรีตและหัวเข็ม', duration: 8, cost: 110000 },
                  { key: 'groundBeam', name: 'คานสะพานและหน้าดิน', duration: 6, cost: 70000 },
                ],
              },
              { key: 'slab', name: 'เทพื้นคอนกรีต', duration: 6, cost: 90000 },
              { key: 'walls', name: 'ก่อผนังและเสาคาน', duration: 18, cost: 220000 },
              { key: 'roof', name: 'โครงหลังคาและกระเบื้อง', duration: 10, cost: 130000 },
            ],
          },
          {
            key: 'mep',
            name: 'งานระบบ',
            children: [
              { key: 'electric', name: 'เดินท่อร้อยสายไฟฟ้า', duration: 8, cost: 70000 },
              { key: 'plumb', name: 'งานประปาและระบบน้ำเสีย', duration: 8, cost: 65000 },
              { key: 'ac', name: 'ติดตั้งแอร์และระบายอากาศ', duration: 5, cost: 85000 },
            ],
          },
          {
            key: 'finish',
            name: 'งานสถาปัตยกรรม',
            children: [
              { key: 'plaster', name: 'ฉาบผนังและเพดาน', duration: 12, cost: 110000 },
              { key: 'tile', name: 'กระเบื้องพื้นและผนัง', duration: 10, cost: 95000 },
              { key: 'paint', name: 'งานสีภายใน-ภายนอก', duration: 8, cost: 55000 },
              {
                key: 'doors',
                name: 'งานไม้และครัว',
                children: [
                  { key: 'carpentry', name: 'งานไม้ในตัวและครัวบิ้วอิน', duration: 4, cost: 70000 },
                  { key: 'installDoors', name: 'ติดตั้งประตู-หน้าต่าง', duration: 3, cost: 50000 },
                ],
              },
              { key: 'bath', name: 'ตกแต่งห้องน้ำและสุขภัณฑ์', duration: 5, cost: 75000 },
            ],
          },
          {
            key: 'close',
            name: 'ส่งมอบ',
            children: [
              { key: 'testMep', name: 'ทดสอบระบบไฟ-น้ำ-แอร์', duration: 2, cost: 5000 },
              { key: 'clean', name: 'ทำความสะอาดก่อนส่งมอบ', duration: 2, cost: 10000 },
              { key: 'handover', name: 'ส่งมอบบ้าน', milestone: true },
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
      }),
  },
  {
    id: 'tpl-house-renovate',
    name: { th: 'ต่อเติม / รีโนเวทบ้าน', en: 'Home extension / renovation' },
    desc: {
      th: 'รื้อ-ต่อเติมห้องหรือชั้นใหม่ พร้อมงานระบบและตกแต่งใหม่ทั้งหมด',
      en: 'Demolish, extend structure, rerun MEP and refinish',
    },
    build: () =>
      buildSample({
        name: 'ต่อเติม / รีโนเวทบ้าน',
        wbs: [
          {
            key: 'plan',
            name: 'วางแผนและออกแบบ',
            children: [
              { key: 'brief', name: 'สำรวจโครงสร้างเดิมและเก็บความต้องการ', duration: 5, cost: 8000 },
              {
                key: 'draw',
                name: 'ออกแบบและประมาณราคา',
                children: [
                  { key: 'conceptDesign', name: 'Concept + แปลนเบื้องต้น', duration: 5, cost: 12000 },
                  { key: 'workingDwg', name: 'แบบก่อสร้าง + ใบเสนอราคา', duration: 5, cost: 13000 },
                ],
              },
              { key: 'contract', name: 'ทำสัญญากับผู้รับเหมา', milestone: true },
            ],
          },
          {
            key: 'demo',
            name: 'งานรื้อถอน',
            children: [{ key: 'demolish', name: 'รื้อส่วนที่ต่อเติม/รื้อผนังเดิม', duration: 5, cost: 30000 }],
          },
          {
            key: 'build',
            name: 'งานโครงสร้างต่อเติม',
            children: [
              { key: 'found', name: 'ฐานราก/คานเสริม', duration: 7, cost: 80000 },
              { key: 'frame', name: 'ก่อผนังและโครงหลังคา', duration: 12, cost: 140000 },
            ],
          },
          {
            key: 'systems',
            name: 'งานระบบ',
            children: [
              {
                key: 'wiring',
                name: 'ต่อเติมระบบไฟ-น้ำ',
                children: [
                  { key: 'rewiring', name: 'ต่อเติมสายไฟและจุดไฟ', duration: 4, cost: 28000 },
                  { key: 'plumbingFix', name: 'ต่อท่อประปาและจุดน้ำ', duration: 3, cost: 17000 },
                ],
              },
              { key: 'acUnit', name: 'ติดตั้งแอร์ใหม่', duration: 2, cost: 40000 },
            ],
          },
          {
            key: 'refinish',
            name: 'งานตกแต่ง',
            children: [
              { key: 'plaster2', name: 'ฉาบและอุดรอย', duration: 6, cost: 35000 },
              {
                key: 'floorTile',
                name: 'งานพื้นและผนัง',
                children: [
                  { key: 'floorWork', name: 'ปูกระเบื้อง/ไม้ลอย', duration: 3, cost: 30000 },
                  { key: 'wallTile', name: 'กระเบื้องผนังห้องเปียก', duration: 2, cost: 25000 },
                ],
              },
              { key: 'paint2', name: 'ทาสีใหม่', duration: 4, cost: 25000 },
              { key: 'fittings', name: 'ติดตั้งสุขภัณฑ์และอุปกรณ์', duration: 3, cost: 45000 },
            ],
          },
          {
            key: 'done',
            name: 'ปิดงาน',
            children: [
              { key: 'inspect', name: 'ตรวจงานร่วมกับเจ้าของบ้าน', duration: 1 },
              { key: 'finalClean', name: 'ทำความสะอาดและส่งมอบ', duration: 1, cost: 5000 },
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
      }),
  },
  {
    id: 'tpl-mep-install',
    name: { th: 'ติดตั้งแอร์ + ระบบไฟฟ้า', en: 'AC + electrical installation' },
    desc: {
      th: 'งานรับเหมา MEP ขนาดเล็ก ตั้งแต่สำรวจหน้างานจนทดสอบระบบ',
      en: 'Small MEP job from site survey through system testing',
    },
    build: () =>
      buildSample({
        name: 'ติดตั้งแอร์ + ระบบไฟฟ้า',
        wbs: [
          {
            key: 'prep',
            name: 'เตรียมงาน',
            children: [
              { key: 'siteCheck', name: 'สำรวจหน้างานและวางแผนเดินท่อ/ราง', duration: 2, cost: 3000 },
              { key: 'procure', name: 'จัดซื้อวัสดุและเครื่องปรับอากาศ', duration: 5, cost: 160000 },
            ],
          },
          {
            key: 'elec',
            name: 'งานไฟฟ้า',
            children: [
              {
                key: 'conduit',
                name: 'รางและตู้ควบคุม',
                children: [
                  { key: 'conduitRun', name: 'เดินท่อร้อยตามแปลน', duration: 3, cost: 18000 },
                  { key: 'panelBox', name: 'ติดตั้งตู้ MDB และเบรกเกอร์', duration: 1, cost: 10000 },
                ],
              },
              { key: 'wire', name: 'ร้อยสายและติดตั้งโคมไฟ', duration: 4, cost: 22000 },
            ],
          },
          {
            key: 'cool',
            name: 'งานแอร์',
            children: [
              { key: 'bracket', name: 'ติดตั้งแขวนและท่อน้ำยา', duration: 3, cost: 15000 },
              { key: 'unit', name: 'ติดตั้งตัวเครื่องและเชื่อมท่อ', duration: 3, cost: 12000 },
            ],
          },
          {
            key: 'qa',
            name: 'ทดสอบและส่งมอบ',
            children: [
              { key: 'megger', name: 'วัดค่าความต้านทานและกราวด์', duration: 1, cost: 4000 },
              { key: 'runTest', name: 'เปิดทดสอบเครื่องปรับอากาศ', duration: 1 },
              { key: 'punchList', name: 'แก้ punch list และส่งมอบงาน', duration: 1, cost: 2000 },
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
      }),
  },
]
