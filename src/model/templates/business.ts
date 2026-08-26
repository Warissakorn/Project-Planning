/** 🏪 Business templates: open a café, mini office move, ISO readiness. */

import { buildSample } from '../specProject'
import type { TemplateEntry } from './index'

export const BUSINESS_TEMPLATES: TemplateEntry[] = [
  {
    id: 'tpl-open-cafe',
    name: { th: 'เปิดร้านกาแฟ / ร้านค้า', en: 'Open a café / shop' },
    desc: {
      th: 'ศึกษาตลาด หาทำเล รีโนเวท ซื้ออุปกรณ์ จ้างคน ถึง grand opening',
      en: 'Research, site, fit-out, equipment, hiring, soft and grand opening',
    },
    build: () =>
      buildSample({
        name: 'เปิดร้านกาแฟ',
        wbs: [
          {
            key: 'study',
            name: 'ศึกษาและวางแผนธุรกิจ',
            children: [
              { key: 'market', name: 'สำรวจตลาดและคู่แข่งย่านเป้าหมาย', duration: 10 },
              { key: 'bizPlan', name: 'ทำ business plan + ต้นทุน/กำไร', duration: 7, cost: 10000 },
              { key: 'fundingOk', name: 'ได้เงินทุน (เงินเอง/สินเชื่อ)', milestone: true },
            ],
          },
          {
            key: 'location',
            name: 'ทำเลและหน้าร้าน',
            children: [
              { key: 'scout', name: 'หาและเลือกทำเล', duration: 14, cost: 5000 },
              { key: 'leaseSign', name: 'เซ็นสัญญาเช่า + เงินประกัน', milestone: true },
              { key: 'permits', name: 'ขอใบอนุญาต (ร้านค้า/ป้าย)', duration: 12, cost: 15000 },
            ],
          },
          {
            key: 'fitout',
            name: 'ตกแต่งร้าน',
            children: [
              { key: 'designShop', name: 'ออกแบบร้าน + mood&tone', duration: 10, cost: 25000 },
              {
                key: 'reno',
                name: 'รีโนเวทหน้าร้าน',
                children: [
                  { key: 'civilReno', name: 'งานช่างหลัก (ผนัง/พื้น/ท่อ)', duration: 15, cost: 180000 },
                  { key: 'interiorDecor', name: 'ตกแต่ง+เฟอร์นิเจอร์', duration: 10, cost: 100000 },
                ],
              },
            ],
          },
          {
            key: 'equipStock',
            name: 'อุปกรณ์และวัตถุดิบ',
            children: [
              {
                key: 'machines',
                name: 'เครื่องและอุปกรณ์',
                children: [
                  { key: 'buyMachine', name: 'เครื่องชงกาแฟ + เครื่องบด', duration: 6, cost: 150000 },
                  { key: 'smallEquip', name: 'ตู้เย็น เครื่องใบใบ เครื่องวัด', duration: 4, cost: 70000 },
                ],
              },
              { key: 'suppliers', name: 'เจรจา supplier เมล็ด/วัตถุดิบ', duration: 8, cost: 30000 },
              { key: 'firstStock', name: 'สั่ง stock เปิดร้านแรก', duration: 4, cost: 40000 },
            ],
          },
          {
            key: 'people',
            name: 'ทีมงานและเมนู',
            children: [
              {
                key: 'hireBarista',
                name: 'จ้างและฝึกบาริสต้า',
                children: [
                  { key: 'interviewHire', name: 'ประกาศ + สัมภาษณ์ + จ้าง', duration: 4, cost: 10000 },
                  { key: 'trainingBarista', name: 'อบรมชง + มาตรฐานร้าน', duration: 6, cost: 15000 },
                ],
              },
              { key: 'menuDev', name: 'พัฒนาเมนู + ตั้งราคา', duration: 7 },
              { key: 'softTest', name: 'Soft opening กับเพื่อน/ญาติ', duration: 3, cost: 8000 },
            ],
          },
          {
            key: 'openPhase',
            name: 'เปิดร้าน',
            children: [
              { key: 'grandOpening', name: 'Grand opening 🎊', milestone: true },
              { key: 'tuneOps', name: 'ปรับ flow ร้านตาม feedback 2 สัปดาห์แรก', duration: 14 },
            ],
          },
        ],
        deps: [
          { from: 'market', to: 'bizPlan' },
          { from: 'bizPlan', to: 'fundingOk' },
          { from: 'fundingOk', to: 'scout' },
          { from: 'scout', to: 'leaseSign' },
          { from: 'leaseSign', to: 'permits' },
          { from: 'leaseSign', to: 'designShop' },
          { from: 'designShop', to: 'civilReno' },
          { from: 'civilReno', to: 'interiorDecor' },
          { from: 'designShop', to: 'buyMachine', type: 'SS', lag: 5 },
          { from: 'buyMachine', to: 'smallEquip' },
          { from: 'permits', to: 'grandOpening' },
          { from: 'interiorDecor', to: 'softTest' },
          { from: 'smallEquip', to: 'firstStock' },
          { from: 'suppliers', to: 'firstStock' },
          { from: 'interviewHire', to: 'trainingBarista' },
          { from: 'interviewHire', to: 'menuDev', type: 'SS' },
          { from: 'menuDev', to: 'softTest' },
          { from: 'firstStock', to: 'softTest' },
          { from: 'softTest', to: 'grandOpening' },
          { from: 'grandOpening', to: 'tuneOps' },
        ],
      }),
  },
  {
    id: 'tpl-office-move-mini',
    name: { th: 'ย้ายสำนักงาน (ฉบับย่อ)', en: 'Office move (compact)' },
    desc: {
      th: 'เวอร์ชันกระชับสำหรับทีมเล็ก: เลือกที่ใหม่ ย้าย IT เฟอร์ฯ และวันย้ายจริง',
      en: 'Compact version for small teams: site, IT, furniture, move day',
    },
    build: () =>
      buildSample({
        name: 'ย้ายสำนักงาน (ฉบับย่อ)',
        wbs: [
          {
            key: 'find',
            name: 'หาสถานที่ใหม่',
            children: [
              { key: 'reqSpace', name: 'สรุปพื้นที่ที่ต้องการ + งบเช่า', duration: 5 },
              { key: 'tourSites', name: 'ดึงที่ 3–5 ที่ + เจรจาเช่า', duration: 15, cost: 8000 },
              { key: 'leaseNew', name: 'เซ็นสัญญาที่ใหม่', milestone: true },
            ],
          },
          {
            key: 'prepare',
            name: 'เตรียมสถานที่',
            children: [
              {
                key: 'fitOutNew',
                name: 'ตกแต่งและระบบ',
                children: [
                  { key: 'buildOut', name: 'งาน build-out (ผนัง/พื้น/ห้องประชุม)', duration: 12, cost: 130000 },
                  { key: 'acElecNew', name: 'งานแอร์ ไฟฟ้า และสุขภัณฑ์', duration: 8, cost: 70000 },
                ],
              },
              // เน็ต lead time ยาว ต้องสั่งคู่ขนานกับตกแต่ง
              { key: 'internetNew', name: 'ติดตั้งเน็ต/เสาอากาศ', duration: 15, cost: 12000 },
            ],
          },
          {
            key: 'itMove',
            name: 'IT และอุปกรณ์',
            children: [
              { key: 'inventoryIt', name: 'ทำ inventory เครื่อง+server', duration: 4 },
              { key: 'packIt', name: 'ถอด+แพ็ค server/PC วันศุกร์', duration: 1, cost: 10000 },
            ],
          },
          {
            key: 'stuff',
            name: 'เฟอร์นิเจอร์และของ',
            children: [
              { key: 'moverQuote', name: 'ขายราคาบริษัทขนย้าย', duration: 5 },
              {
                key: 'packBoxes',
                name: 'แพ็คกล่องตามโซน',
                children: [
                  { key: 'packZoneA', name: 'แพ็คโซน A (ops) + label', duration: 3, cost: 3000 },
                  { key: 'packZoneB', name: 'แพ็คโซน B (sale/hr) + label', duration: 3, cost: 3000 },
                ],
              },
            ],
          },
          {
            key: 'moveDayPhase',
            name: 'วันย้ายและเข้าใหม่',
            children: [
              { key: 'moveDay', name: 'วันย้าย 🚚', milestone: true },
              { key: 'setupPc', name: 'ต่อ PC/server + ทดสอบเน็ต', duration: 2, cost: 5000 },
              { key: 'announceAddr', name: 'แจ้งที่อยู่ใหม่ลูกค้า/สรรพากร/ไปรษณีย์', duration: 5 },
            ],
          },
        ],
        deps: [
          { from: 'reqSpace', to: 'tourSites' },
          { from: 'tourSites', to: 'leaseNew' },
          { from: 'leaseNew', to: 'buildOut' },
          { from: 'buildOut', to: 'acElecNew' },
          { from: 'acElecNew', to: 'moveDay', lag: -3 },
          // เน็ตต้องติดตั้งก่อนวันย้าย จึงสั่งคู่ขนานกับตกแต่ง
          { from: 'leaseNew', to: 'internetNew' },
          { from: 'leaseNew', to: 'inventoryIt' },
          { from: 'acElecNew', to: 'packIt' },
          { from: 'inventoryIt', to: 'packIt' },
          { from: 'leaseNew', to: 'packZoneA', lag: 3 },
          { from: 'packZoneA', to: 'packZoneB' },
          { from: 'tourSites', to: 'moverQuote', type: 'SS', lag: 10 },
          { from: 'packIt', to: 'moveDay' },
          { from: 'packZoneB', to: 'moveDay' },
          { from: 'moveDay', to: 'setupPc' },
          { from: 'setupPc', to: 'announceAddr' },
        ],
      }),
  },
  {
    id: 'tpl-iso-prep',
    name: { th: 'เตรียม ISO / ตรวจประเมิน', en: 'ISO certification prep' },
    desc: {
      th: 'Gap analysis เขียนคู่มือ อบรม internal audit แก้ gap และรับ external audit',
      en: 'Gap analysis, documentation, training, internal audit, certification',
    },
    build: () =>
      buildSample({
        name: 'เตรียม ISO 9001',
        wbs: [
          {
            key: 'gap',
            name: 'Gap analysis',
            children: [
              { key: 'buyStd', name: 'ซื้อมาตรฐาน + เข้าอบรมหลักสูตร', duration: 7, cost: 18000 },
              { key: 'gapAssess', name: 'ประเมินช่องว่างระบบเดิม', duration: 10, cost: 25000 },
              { key: 'steerKick', name: 'ตั้งคณะกรรมการ QMS และ kickoff', milestone: true },
            ],
          },
          {
            key: 'docs',
            name: 'เอกสารระบบ',
            children: [
              { key: 'qualityManual', name: 'คู่มือคุณภาพ + นโยบาย', duration: 12 },
              {
                key: 'sopWrite',
                name: 'เขียน SOP กระบวนการ',
                children: [
                  { key: 'sopCore', name: 'SOP กระบวนการหลัก 6–8 ฉบับ', duration: 15 },
                  { key: 'sopSupport', name: 'SOP งานสนับสนุน (HR/IT/ซ่อมบำรุง)', duration: 10 },
                ],
              },
              { key: 'formsRec', name: 'แบบฟอร์มบันทึก + ระบบจัดเก็บ', duration: 8 },
            ],
          },
          {
            key: 'rollout',
            name: 'ฝึกใช้จริง',
            children: [
              { key: 'trainStaff', name: 'อบรมพนักงานทุกแผนก', duration: 6, cost: 15000 },
              { key: 'runQms', name: 'ใช้ QMS จริง ≥ 1 เดือน (เก็บ evidence)', duration: 30 },
            ],
          },
          {
            key: 'audit',
            name: 'Internal audit และแก้ gap',
            children: [
              { key: 'internalAudit', name: 'Internal audit ทุกแผนก', duration: 6, cost: 12000 },
              {
                key: 'corrective',
                name: 'Corrective actions',
                children: [
                  { key: 'capaPlan', name: 'สรุป finding + วางแผนแก้', duration: 4 },
                  { key: 'capaFix', name: 'แก้และยืนยัน effectiveness', duration: 8 },
                ],
              },
              { key: 'mgReview', name: 'Management review meeting', milestone: true },
            ],
          },
          {
            key: 'cert',
            name: 'รับ certification',
            children: [
              { key: 'bookCb', name: 'จอง certification body (stage 1+2)', duration: 5, cost: 85000 },
              { key: 'extAudit', name: 'External audit 2 stage', duration: 4 },
              { key: 'getCert', name: 'ได้ใบรับรอง ISO 🎓', milestone: true },
            ],
          },
        ],
        deps: [
          { from: 'buyStd', to: 'gapAssess' },
          { from: 'gapAssess', to: 'steerKick' },
          { from: 'steerKick', to: 'qualityManual' },
          { from: 'qualityManual', to: 'sopCore' },
          { from: 'sopCore', to: 'sopSupport' },
          // แบบฟอร์มของกระบวนการหลักทำคู่ไปกับ SOP สนับสนุนได้
          { from: 'sopCore', to: 'formsRec', lag: -10 },
          { from: 'formsRec', to: 'trainStaff' },
          { from: 'trainStaff', to: 'runQms' },
          { from: 'runQms', to: 'internalAudit' },
          { from: 'internalAudit', to: 'capaPlan' },
          { from: 'capaPlan', to: 'capaFix' },
          { from: 'capaFix', to: 'mgReview' },
          { from: 'mgReview', to: 'extAudit' },
          { from: 'steerKick', to: 'bookCb', type: 'SS', lag: 40 },
          { from: 'bookCb', to: 'extAudit', type: 'FF' },
          { from: 'extAudit', to: 'getCert' },
        ],
      }),
  },
]
