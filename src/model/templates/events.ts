/** 🎪 Event templates: seminar, wedding, company party. */

import { buildSample } from '../specProject'
import type { TemplateEntry } from './index'

export const EVENT_TEMPLATES: TemplateEntry[] = [
  {
    id: 'tpl-seminar',
    name: { th: 'จัดสัมมนา / อบรม 1 วัน', en: 'One-day seminar / workshop' },
    desc: {
      th: 'หัวข้อ วิทยากร สถานที่ เปิดรับสมัคร ของแจก ซ้อม จนถึงวันงาน',
      en: 'Topic, speakers, venue, registration, materials, dry run, event day',
    },
    build: () =>
      buildSample({
        name: 'จัดสัมมนา / อบรม 1 วัน',
        wbs: [
          {
            key: 'concept',
            name: 'คอนเซ็ปต์งาน',
            children: [
              { key: 'topic', name: 'กำหนดหัวข้อและกลุ่มผู้เข้าอบรม', duration: 3 },
              { key: 'speakers', name: 'เชิญวิทยากรและยืนยันตัว', duration: 10, cost: 20000 },
              { key: 'budgetOkEv', name: 'อนุมัติงบประมาณงาน', milestone: true },
            ],
          },
          {
            key: 'venue',
            name: 'สถานที่และอุปกรณ์',
            children: [
              { key: 'bookHall', name: 'จองหอประชุม/โรงแรม', duration: 4, cost: 30000 },
              {
                key: 'avSetup',
                name: 'เตรียม AV/สตรีมมิ่ง',
                children: [
                  { key: 'soundLight', name: 'ระบบเสียง-ไฟ-โปรเจคเตอร์', duration: 1, cost: 7000 },
                  { key: 'streamSetup', name: 'ตั้งไฮบริดสตรีม + ทดสอบสัญญาณ', duration: 1, cost: 5000 },
                ],
              },
              { key: 'catering', name: 'จองอาหารว่าง+กลางวัน (คิดตามจำนวน)', duration: 3, cost: 18000 },
            ],
          },
          {
            key: 'promo',
            name: 'ประชาสัมพันธ์และรับสมัคร',
            children: [
              { key: 'poster', name: 'โปสเตอร์ + หน้าลงทะเบียนออนไลน์', duration: 5, cost: 8000 },
              { key: 'openReg', name: 'เปิดรับสมัคร', milestone: true },
              {
                key: 'runReg',
                name: 'ระยะรับสมัคร',
                children: [
                  { key: 'pushPromo', name: 'โพสต์+ส่ง email เร่งสมัคร', duration: 14 },
                  { key: 'confirmCount', name: 'ติดตามจำนวนและ waitlist', duration: 7 },
                ],
              },
              { key: 'closeReg', name: 'ปิดรับสมัครและสรุปจำนวนคน', milestone: true },
            ],
          },
          {
            key: 'materials',
            name: 'สื่อและของแจก',
            children: [
              { key: 'slides', name: 'เก็บสไลด์วิทยากรทุกท่าน', duration: 5 },
              { key: 'printHandout', name: 'พิมพ์ของแจกตามจำนวนคนที่สมัคร', duration: 4, cost: 10000 },
              { key: 'certs', name: 'พิมพ์ใบประกาศนียบัตร', duration: 2, cost: 4000 },
            ],
          },
          {
            key: 'day',
            name: 'วันงานและปิดโครงการ',
            children: [
              { key: 'rehearse', name: 'ซ้อมรัน flow ร่วมกับทีมงาน', duration: 1 },
              { key: 'eventDay', name: 'วันจัดสัมมนา 🎤', milestone: true },
              { key: 'feedback', name: 'ส่งแบบประเมินและสรุปผล', duration: 4, cost: 2000 },
              { key: 'payClose', name: 'จ่ายค่าบริการทุกฝ่ายและปิดบัญชีงาน', duration: 5 },
            ],
          },
        ],
        deps: [
          { from: 'topic', to: 'speakers' },
          { from: 'speakers', to: 'budgetOkEv' },
          { from: 'budgetOkEv', to: 'bookHall' },
          { from: 'budgetOkEv', to: 'poster' },
          { from: 'bookHall', to: 'soundLight' },
          { from: 'soundLight', to: 'streamSetup' },
          { from: 'poster', to: 'openReg' },
          { from: 'openReg', to: 'pushPromo' },
          { from: 'pushPromo', to: 'confirmCount' },
          { from: 'confirmCount', to: 'closeReg' },
          // ของแจกต้องรู้จำนวนคนจริง จึงพิมพ์หลังปิดรับสมัคร
          { from: 'closeReg', to: 'printHandout' },
          { from: 'closeReg', to: 'certs' },
          { from: 'slides', to: 'printHandout', type: 'SS', lag: -1 },
          { from: 'catering', to: 'rehearse' },
          { from: 'printHandout', to: 'rehearse' },
          { from: 'rehearse', to: 'eventDay' },
          { from: 'eventDay', to: 'feedback' },
          { from: 'feedback', to: 'payClose' },
        ],
      }),
  },
  {
    id: 'tpl-wedding',
    name: { th: 'งานแต่งงาน', en: 'Wedding day' },
    desc: {
      th: 'จองสถานที่ ชุด ภาพ บัตรเชิญ อาหาร จนถึงพิธีและงานเลี้ยง',
      en: 'Venue, outfits, photos, invitations, catering, ceremony, banquet',
    },
    build: () =>
      buildSample({
        name: 'งานแต่งงาน',
        wbs: [
          {
            key: 'setupW',
            name: 'วางแผนร่วมกัน',
            children: [
              { key: 'guestList', name: 'ร่างรายชื่อแขก + งบรวม', duration: 7 },
              { key: 'dateFix', name: 'เลือกวันแต่ง (เช็คฤกษ์งาม)', milestone: true },
            ],
          },
          {
            key: 'venueW',
            name: 'สถานที่และพิธี',
            children: [
              { key: 'bookVenue', name: 'จองสถานที่พิธี+เลี้ยง', duration: 14, cost: 150000 },
              { key: 'monkCerem', name: 'นัดพระและเตรียมพิธีแบบไทย', duration: 6, cost: 25000 },
              { key: 'decor', name: 'ตกแต่งสถานที่', duration: 5, cost: 60000 },
            ],
          },
          {
            key: 'attire',
            name: 'ชุดและภาพ',
            children: [
              { key: 'dress', name: 'ชุดเจ้าสาว-เจ้าบ่าว + ทดลอง', duration: 21, cost: 45000 },
              {
                key: 'photog',
                name: 'ภาพและวิดีโอ',
                children: [
                  { key: 'bookPhotog', name: 'เลือกและจองช่างภาพ/วิดีโอ', duration: 4, cost: 15000 },
                  { key: 'prewedShoot', name: 'Pre-wedding shoot', duration: 10, cost: 40000 },
                ],
              },
              { key: 'makeupTrial', name: 'ทดลองแต่งหน้า', duration: 2, cost: 8000 },
            ],
          },
          {
            key: 'inviteW',
            name: 'บัตรเชิญและของชำร่วย',
            children: [
              {
                key: 'cards',
                name: 'บัตรเชิญ',
                children: [
                  { key: 'designCard', name: 'ออกแบบบัตร', duration: 5, cost: 9000 },
                  { key: 'printCard', name: 'สั่งพิมพ์', duration: 5, cost: 6000 },
                ],
              },
              { key: 'sendCards', name: 'แจกบัตร/ส่งออนไลน์', duration: 14 },
              { key: 'favors', name: 'ซื้อของชำร่วย', duration: 5, cost: 12000 },
            ],
          },
          {
            key: 'banquet',
            name: 'งานเลี้ยง',
            children: [
              { key: 'tasting', name: 'ชิมอาหารกับร้านจัดเลี้ยง', duration: 2, cost: 5000 },
              { key: 'menuFinal', name: 'ล็อกเมนู+จำนวนโต๊ะ', milestone: true },
              {
                key: 'cake',
                name: 'เค้กและโต๊ะพิธี',
                children: [
                  { key: 'orderCake', name: 'ออกแบบ+สั่งเค้ก', duration: 2, cost: 8000 },
                  { key: 'ceremonyTable', name: 'จัดโต๊ะพิธี/โต๊ะจัดเลี้ยง', duration: 2, cost: 10000 },
                ],
              },
            ],
          },
          {
            key: 'weddingWeek',
            name: 'สัปดาห์แต่งและวันจริง',
            children: [
              { key: 'confirmAll', name: 'ยืนยัน timeline กับทุก vendor', duration: 2 },
              { key: 'weddingDay', name: 'วันแต่ง 💍', milestone: true },
              { key: 'thankYou', name: 'ขอบคุณแขก + เก็บภาพจากช่าง', duration: 7 },
            ],
          },
        ],
        deps: [
          { from: 'guestList', to: 'dateFix' },
          { from: 'dateFix', to: 'bookVenue' },
          { from: 'bookVenue', to: 'monkCerem' },
          { from: 'bookVenue', to: 'decor' },
          { from: 'dateFix', to: 'dress' },
          { from: 'dress', to: 'bookPhotog', type: 'SS', lag: 7 },
          { from: 'bookPhotog', to: 'prewedShoot' },
          { from: 'dress', to: 'makeupTrial', lag: 14 },
          { from: 'guestList', to: 'designCard' },
          { from: 'designCard', to: 'printCard' },
          { from: 'printCard', to: 'sendCards' },
          { from: 'sendCards', to: 'menuFinal' },
          { from: 'bookVenue', to: 'tasting' },
          { from: 'tasting', to: 'menuFinal' },
          { from: 'menuFinal', to: 'orderCake' },
          { from: 'orderCake', to: 'ceremonyTable' },
          { from: 'favors', to: 'confirmAll' },
          { from: 'ceremonyTable', to: 'confirmAll' },
          { from: 'decor', to: 'confirmAll' },
          { from: 'confirmAll', to: 'weddingDay' },
          { from: 'weddingDay', to: 'thankYou' },
        ],
      }),
  },
  {
    id: 'tpl-company-party',
    name: { th: 'ปาร์ตี้บริษัท / ปีใหม่', en: 'Company party / New Year event' },
    desc: {
      th: 'ธีม สถานที่ ของรางวัล โชว์ และไทม์ไลน์คืนงาน สำหรับ HR/ทีมอีเวนต์',
      en: 'Theme, venue, prizes, show and run-sheet — for HR / event teams',
    },
    build: () =>
      buildSample({
        name: 'ปาร์ตี้บริษัท / ปีใหม่',
        wbs: [
          {
            key: 'theme',
            name: 'คอนเซ็ปต์และงบ',
            children: [
              { key: 'pickTheme', name: 'เลือกธีม+รูปแบบงาน', duration: 3 },
              { key: 'partyBudget', name: 'อนุมัติงบต่อหัว', milestone: true },
            ],
          },
          {
            key: 'logistics',
            name: 'สถานที่และจัดเลี้ยง',
            children: [
              { key: 'venueP', name: 'จองโรงแรม/ห้องงาน', duration: 7, cost: 60000 },
              {
                key: 'foodP',
                name: 'อาหารและเครื่องดื่ม',
                children: [
                  { key: 'menuPick', name: 'เลือกเมนูบุฟเฟ่ต์ + bar', duration: 2 },
                  { key: 'depositFood', name: 'วางมัดจำตามจำนวนหัว', duration: 2, cost: 45000 },
                ],
              },
            ],
          },
          {
            key: 'program',
            name: 'โปรแกรมคืนงาน',
            children: [
              {
                key: 'mcBand',
                name: 'MC และโชว์',
                children: [
                  { key: 'bookBand', name: 'จองวงดนตรี/โชว์', duration: 4, cost: 22000 },
                  { key: 'bookMc', name: 'จอง MC + script กลางคืน', duration: 2, cost: 13000 },
                ],
              },
              { key: 'luckyDraw', name: 'ของรางวัล lucky draw', duration: 4, cost: 25000 },
              { key: 'awards', name: 'รางวัลพนักงานดีเด่น + สไลด์ย้อนปี', duration: 5 },
              { key: 'runsheet', name: 'Run sheet รายชั่วโมง', duration: 2 },
            ],
          },
          {
            key: 'partyWeek',
            name: 'ก่อนงานและคืนงาน',
            children: [
              { key: 'rsvp', name: 'นับ RSVP + จัดที่นั่ง', duration: 5 },
              { key: 'soundcheck', name: 'Sound check + ซ้อมไทม์ไลน์', duration: 1 },
              { key: 'partyNight', name: 'คืนปาร์ตี้ 🎉', milestone: true },
              { key: 'settlePay', name: 'เคลียร์ค่าใช้จ่าย vendor', duration: 5 },
            ],
          },
        ],
        deps: [
          { from: 'pickTheme', to: 'partyBudget' },
          { from: 'partyBudget', to: 'venueP' },
          { from: 'venueP', to: 'menuPick' },
          { from: 'menuPick', to: 'depositFood' },
          { from: 'partyBudget', to: 'bookBand' },
          { from: 'bookBand', to: 'bookMc' },
          { from: 'bookMc', to: 'luckyDraw' },
          { from: 'awards', to: 'runsheet' },
          { from: 'bookMc', to: 'runsheet' },
          { from: 'depositFood', to: 'rsvp' },
          { from: 'rsvp', to: 'soundcheck' },
          { from: 'runsheet', to: 'soundcheck' },
          { from: 'soundcheck', to: 'partyNight' },
          { from: 'partyNight', to: 'settlePay' },
        ],
      }),
  },
]
