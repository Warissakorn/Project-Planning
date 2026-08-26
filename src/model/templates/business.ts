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
    build: (lang) =>
      buildSample({
        name: { th: 'เปิดร้านกาแฟ', en: 'Open a coffee shop' },
        wbs: [
          {
            key: 'study',
            name: { th: 'ศึกษาและวางแผนธุรกิจ', en: 'Research and business planning' },
            children: [
              { key: 'market', name: { th: 'สำรวจตลาดและคู่แข่งย่านเป้าหมาย', en: 'Survey the market and competitors in the target area' }, duration: 10 },
              { key: 'bizPlan', name: { th: 'ทำ business plan + ต้นทุน/กำไร', en: 'Write the business plan + cost and margin' }, duration: 7, cost: 10000 },
              { key: 'fundingOk', name: { th: 'ได้เงินทุน (เงินเอง/สินเชื่อ)', en: 'Funding secured (own funds or loan)' }, milestone: true },
            ],
          },
          {
            key: 'location',
            name: { th: 'ทำเลและหน้าร้าน', en: 'Location and shopfront' },
            children: [
              { key: 'scout', name: { th: 'หาและเลือกทำเล', en: 'Search for and choose the location' }, duration: 14, cost: 5000 },
              { key: 'leaseSign', name: { th: 'เซ็นสัญญาเช่า + เงินประกัน', en: 'Sign the lease + pay the deposit' }, milestone: true },
              { key: 'permits', name: { th: 'ขอใบอนุญาต (ร้านค้า/ป้าย)', en: 'Apply for permits (shop and signage)' }, duration: 12, cost: 15000 },
            ],
          },
          {
            key: 'fitout',
            name: { th: 'ตกแต่งร้าน', en: 'Shop fit-out' },
            children: [
              { key: 'designShop', name: { th: 'ออกแบบร้าน + mood&tone', en: 'Shop design + mood and tone' }, duration: 10, cost: 25000 },
              {
                key: 'reno',
                name: { th: 'รีโนเวทหน้าร้าน', en: 'Renovate the shopfront' },
                children: [
                  { key: 'civilReno', name: { th: 'งานช่างหลัก (ผนัง/พื้น/ท่อ)', en: 'Main trades (walls, floors, plumbing)' }, duration: 15, cost: 180000 },
                  { key: 'interiorDecor', name: { th: 'ตกแต่ง+เฟอร์นิเจอร์', en: 'Decoration and furniture' }, duration: 10, cost: 100000 },
                ],
              },
            ],
          },
          {
            key: 'equipStock',
            name: { th: 'อุปกรณ์และวัตถุดิบ', en: 'Equipment and ingredients' },
            children: [
              {
                key: 'machines',
                name: { th: 'เครื่องและอุปกรณ์', en: 'Machines and equipment' },
                children: [
                  { key: 'buyMachine', name: { th: 'เครื่องชงกาแฟ + เครื่องบด', en: 'Espresso machine + grinder' }, duration: 6, cost: 150000 },
                  { key: 'smallEquip', name: { th: 'ตู้เย็น เครื่องใบใบ เครื่องวัด', en: 'Fridge, blender and scales' }, duration: 4, cost: 70000 },
                ],
              },
              { key: 'suppliers', name: { th: 'เจรจา supplier เมล็ด/วัตถุดิบ', en: 'Negotiate with coffee and ingredient suppliers' }, duration: 8, cost: 30000 },
              { key: 'firstStock', name: { th: 'สั่ง stock เปิดร้านแรก', en: 'Order opening stock' }, duration: 4, cost: 40000 },
            ],
          },
          {
            key: 'people',
            name: { th: 'ทีมงานและเมนู', en: 'Staff and menu' },
            children: [
              {
                key: 'hireBarista',
                name: { th: 'จ้างและฝึกบาริสต้า', en: 'Hire and train baristas' },
                children: [
                  { key: 'interviewHire', name: { th: 'ประกาศ + สัมภาษณ์ + จ้าง', en: 'Advertise + interview + hire' }, duration: 4, cost: 10000 },
                  { key: 'trainingBarista', name: { th: 'อบรมชง + มาตรฐานร้าน', en: 'Barista training + shop standards' }, duration: 6, cost: 15000 },
                ],
              },
              { key: 'menuDev', name: { th: 'พัฒนาเมนู + ตั้งราคา', en: 'Develop the menu + set prices' }, duration: 7 },
              { key: 'softTest', name: { th: 'Soft opening กับเพื่อน/ญาติ', en: 'Soft opening with friends and family' }, duration: 3, cost: 8000 },
            ],
          },
          {
            key: 'openPhase',
            name: { th: 'เปิดร้าน', en: 'Opening' },
            children: [
              { key: 'grandOpening', name: 'Grand opening 🎊', milestone: true },
              { key: 'tuneOps', name: { th: 'ปรับ flow ร้านตาม feedback 2 สัปดาห์แรก', en: 'Tune the shop flow on the first two weeks of feedback' }, duration: 14 },
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
      }, lang),
  },
  {
    id: 'tpl-office-move-mini',
    name: { th: 'ย้ายสำนักงาน (ฉบับย่อ)', en: 'Office move (compact)' },
    desc: {
      th: 'เวอร์ชันกระชับสำหรับทีมเล็ก: เลือกที่ใหม่ ย้าย IT เฟอร์ฯ และวันย้ายจริง',
      en: 'Compact version for small teams: site, IT, furniture, move day',
    },
    build: (lang) =>
      buildSample({
        name: { th: 'ย้ายสำนักงาน (ฉบับย่อ)', en: 'Office relocation (short version)' },
        wbs: [
          {
            key: 'find',
            name: { th: 'หาสถานที่ใหม่', en: 'Find a new site' },
            children: [
              { key: 'reqSpace', name: { th: 'สรุปพื้นที่ที่ต้องการ + งบเช่า', en: 'Confirm the space required + rent budget' }, duration: 5 },
              { key: 'tourSites', name: { th: 'ดึงที่ 3–5 ที่ + เจรจาเช่า', en: 'Shortlist 3-5 sites + negotiate the lease' }, duration: 15, cost: 8000 },
              { key: 'leaseNew', name: { th: 'เซ็นสัญญาที่ใหม่', en: 'Sign for the new place' }, milestone: true },
            ],
          },
          {
            key: 'prepare',
            name: { th: 'เตรียมสถานที่', en: 'Prepare the venue' },
            children: [
              {
                key: 'fitOutNew',
                name: { th: 'ตกแต่งและระบบ', en: 'Fit-out and services' },
                children: [
                  { key: 'buildOut', name: { th: 'งาน build-out (ผนัง/พื้น/ห้องประชุม)', en: 'Build-out (walls, floors, meeting rooms)' }, duration: 12, cost: 130000 },
                  { key: 'acElecNew', name: { th: 'งานแอร์ ไฟฟ้า และสุขภัณฑ์', en: 'Air conditioning, electrical and sanitary works' }, duration: 8, cost: 70000 },
                ],
              },
              // เน็ต lead time ยาว ต้องสั่งคู่ขนานกับตกแต่ง
              { key: 'internetNew', name: { th: 'ติดตั้งเน็ต/เสาอากาศ', en: 'Install internet and aerial' }, duration: 15, cost: 12000 },
            ],
          },
          {
            key: 'itMove',
            name: { th: 'IT และอุปกรณ์', en: 'IT and equipment' },
            children: [
              { key: 'inventoryIt', name: { th: 'ทำ inventory เครื่อง+server', en: 'Inventory workstations and servers' }, duration: 4 },
              { key: 'packIt', name: { th: 'ถอด+แพ็ค server/PC วันศุกร์', en: 'Strip and pack servers and PCs on Friday' }, duration: 1, cost: 10000 },
            ],
          },
          {
            key: 'stuff',
            name: { th: 'เฟอร์นิเจอร์และของ', en: 'Furniture and belongings' },
            children: [
              { key: 'moverQuote', name: { th: 'ขายราคาบริษัทขนย้าย', en: 'Get quotes from moving companies' }, duration: 5 },
              {
                key: 'packBoxes',
                name: { th: 'แพ็คกล่องตามโซน', en: 'Pack boxes zone by zone' },
                children: [
                  { key: 'packZoneA', name: { th: 'แพ็คโซน A (ops) + label', en: 'Pack zone A (ops) + label' }, duration: 3, cost: 3000 },
                  { key: 'packZoneB', name: { th: 'แพ็คโซน B (sale/hr) + label', en: 'Pack zone B (sales/HR) + label' }, duration: 3, cost: 3000 },
                ],
              },
            ],
          },
          {
            key: 'moveDayPhase',
            name: { th: 'วันย้ายและเข้าใหม่', en: 'Moving day and settling in' },
            children: [
              { key: 'moveDay', name: { th: 'วันย้าย 🚚', en: 'Moving day 🚚' }, milestone: true },
              { key: 'setupPc', name: { th: 'ต่อ PC/server + ทดสอบเน็ต', en: 'Reconnect PCs and servers + test the network' }, duration: 2, cost: 5000 },
              { key: 'announceAddr', name: { th: 'แจ้งที่อยู่ใหม่ลูกค้า/สรรพากร/ไปรษณีย์', en: 'Notify customers, the tax office and the post office' }, duration: 5 },
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
      }, lang),
  },
  {
    id: 'tpl-iso-prep',
    name: { th: 'เตรียม ISO / ตรวจประเมิน', en: 'ISO certification prep' },
    desc: {
      th: 'Gap analysis เขียนคู่มือ อบรม internal audit แก้ gap และรับ external audit',
      en: 'Gap analysis, documentation, training, internal audit, certification',
    },
    build: (lang) =>
      buildSample({
        name: { th: 'เตรียม ISO 9001', en: 'ISO 9001 preparation' },
        wbs: [
          {
            key: 'gap',
            name: 'Gap analysis',
            children: [
              { key: 'buyStd', name: { th: 'ซื้อมาตรฐาน + เข้าอบรมหลักสูตร', en: 'Buy the standard + attend the course' }, duration: 7, cost: 18000 },
              { key: 'gapAssess', name: { th: 'ประเมินช่องว่างระบบเดิม', en: 'Assess gaps in the current system' }, duration: 10, cost: 25000 },
              { key: 'steerKick', name: { th: 'ตั้งคณะกรรมการ QMS และ kickoff', en: 'Form the QMS committee and kick off' }, milestone: true },
            ],
          },
          {
            key: 'docs',
            name: { th: 'เอกสารระบบ', en: 'System documentation' },
            children: [
              { key: 'qualityManual', name: { th: 'คู่มือคุณภาพ + นโยบาย', en: 'Quality manual + policy' }, duration: 12 },
              {
                key: 'sopWrite',
                name: { th: 'เขียน SOP กระบวนการ', en: 'Write the process SOPs' },
                children: [
                  { key: 'sopCore', name: { th: 'SOP กระบวนการหลัก 6–8 ฉบับ', en: '6-8 SOPs for the core processes' }, duration: 15 },
                  { key: 'sopSupport', name: { th: 'SOP งานสนับสนุน (HR/IT/ซ่อมบำรุง)', en: 'SOPs for support functions (HR/IT/maintenance)' }, duration: 10 },
                ],
              },
              { key: 'formsRec', name: { th: 'แบบฟอร์มบันทึก + ระบบจัดเก็บ', en: 'Record forms + filing system' }, duration: 8 },
            ],
          },
          {
            key: 'rollout',
            name: { th: 'ฝึกใช้จริง', en: 'Hands-on training' },
            children: [
              { key: 'trainStaff', name: { th: 'อบรมพนักงานทุกแผนก', en: 'Train staff in every department' }, duration: 6, cost: 15000 },
              { key: 'runQms', name: { th: 'ใช้ QMS จริง ≥ 1 เดือน (เก็บ evidence)', en: 'Run the QMS for at least a month (collect evidence)' }, duration: 30 },
            ],
          },
          {
            key: 'audit',
            name: { th: 'Internal audit และแก้ gap', en: 'Internal audit and gap closure' },
            children: [
              { key: 'internalAudit', name: { th: 'Internal audit ทุกแผนก', en: 'Internal audit of every department' }, duration: 6, cost: 12000 },
              {
                key: 'corrective',
                name: 'Corrective actions',
                children: [
                  { key: 'capaPlan', name: { th: 'สรุป finding + วางแผนแก้', en: 'Summarise the findings + plan the fixes' }, duration: 4 },
                  { key: 'capaFix', name: { th: 'แก้และยืนยัน effectiveness', en: 'Correct and verify effectiveness' }, duration: 8 },
                ],
              },
              { key: 'mgReview', name: 'Management review meeting', milestone: true },
            ],
          },
          {
            key: 'cert',
            name: { th: 'รับ certification', en: 'Certification' },
            children: [
              { key: 'bookCb', name: { th: 'จอง certification body (stage 1+2)', en: 'Book the certification body (stage 1+2)' }, duration: 5, cost: 85000 },
              { key: 'extAudit', name: 'External audit 2 stage', duration: 4 },
              { key: 'getCert', name: { th: 'ได้ใบรับรอง ISO 🎓', en: 'ISO certificate awarded 🎓' }, milestone: true },
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
      }, lang),
  },
]
