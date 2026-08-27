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
    build: (lang) =>
      buildSample({
        name: { th: 'จัดสัมมนา / อบรม 1 วัน', en: 'One-day seminar or training' },
        wbs: [
          {
            key: 'concept',
            name: { th: 'คอนเซ็ปต์งาน', en: 'Event concept' },
            children: [
              { key: 'topic', name: { th: 'กำหนดหัวข้อและกลุ่มผู้เข้าอบรม', en: 'Define the topics and the audience' }, duration: 3 },
              { key: 'speakers', name: { th: 'เชิญวิทยากรและยืนยันตัว', en: 'Invite and confirm the speakers' }, duration: 10, cost: 20000 },
              { key: 'budgetOkEv', name: { th: 'อนุมัติงบประมาณงาน', en: 'Approve the event budget' }, milestone: true },
            ],
          },
          {
            key: 'venue',
            name: { th: 'สถานที่และอุปกรณ์', en: 'Venue and equipment' },
            children: [
              { key: 'bookHall', name: { th: 'จองหอประชุม/โรงแรม', en: 'Book the hall or hotel' }, duration: 4, cost: 30000 },
              {
                key: 'avSetup',
                name: { th: 'เตรียม AV/สตรีมมิ่ง', en: 'Prepare AV and streaming' },
                children: [
                  { key: 'soundLight', name: { th: 'ระบบเสียง-ไฟ-โปรเจคเตอร์', en: 'Sound, lighting and projection' }, duration: 1, cost: 7000 },
                  { key: 'streamSetup', name: { th: 'ตั้งไฮบริดสตรีม + ทดสอบสัญญาณ', en: 'Set up the hybrid stream + signal test' }, duration: 1, cost: 5000 },
                ],
              },
              { key: 'catering', name: { th: 'จองอาหารว่าง+กลางวัน (คิดตามจำนวน)', en: 'Book refreshments and lunch (per head)' }, duration: 3, cost: 18000 },
            ],
          },
          {
            key: 'promo',
            name: { th: 'ประชาสัมพันธ์และรับสมัคร', en: 'Promotion and registration' },
            children: [
              { key: 'poster', name: { th: 'โปสเตอร์ + หน้าลงทะเบียนออนไลน์', en: 'Poster + online registration page' }, duration: 5, cost: 8000 },
              { key: 'openReg', name: { th: 'เปิดรับสมัคร', en: 'Open registration' }, milestone: true },
              {
                key: 'runReg',
                name: { th: 'ระยะรับสมัคร', en: 'Registration period' },
                children: [
                  { key: 'pushPromo', name: { th: 'โพสต์+ส่ง email เร่งสมัคร', en: 'Posts + email push for sign-ups' }, duration: 14 },
                  { key: 'confirmCount', name: { th: 'ติดตามจำนวนและ waitlist', en: 'Track sign-ups and the waitlist' }, duration: 7 },
                ],
              },
              { key: 'closeReg', name: { th: 'ปิดรับสมัครและสรุปจำนวนคน', en: 'Close registration and confirm headcount' }, milestone: true },
            ],
          },
          {
            key: 'materials',
            name: { th: 'สื่อและของแจก', en: 'Assets and handouts' },
            children: [
              { key: 'slides', name: { th: 'เก็บสไลด์วิทยากรทุกท่าน', en: 'Collect every speaker\'s slides' }, duration: 5 },
              { key: 'printHandout', name: { th: 'พิมพ์ของแจกตามจำนวนคนที่สมัคร', en: 'Print handouts to the registered headcount' }, duration: 4, cost: 10000 },
              { key: 'certs', name: { th: 'พิมพ์ใบประกาศนียบัตร', en: 'Print the certificates' }, duration: 2, cost: 4000 },
            ],
          },
          {
            key: 'day',
            name: { th: 'วันงานและปิดโครงการ', en: 'Event day and closeout' },
            children: [
              { key: 'rehearse', name: { th: 'ซ้อมรัน flow ร่วมกับทีมงาน', en: 'Rehearse the run of show with the crew' }, duration: 1 },
              { key: 'eventDay', name: { th: 'วันจัดสัมมนา 🎤', en: 'Seminar day 🎤' }, milestone: true },
              { key: 'feedback', name: { th: 'ส่งแบบประเมินและสรุปผล', en: 'Send the evaluation form and report the results' }, duration: 4, cost: 2000 },
              { key: 'payClose', name: { th: 'จ่ายค่าบริการทุกฝ่ายและปิดบัญชีงาน', en: 'Pay every vendor and close the books' }, duration: 5 },
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
      }, lang),
  },
  {
    id: 'tpl-wedding',
    name: { th: 'งานแต่งงาน', en: 'Wedding day' },
    desc: {
      th: 'จองสถานที่ ชุด ภาพ บัตรเชิญ อาหาร จนถึงพิธีและงานเลี้ยง',
      en: 'Venue, outfits, photos, invitations, catering, ceremony, banquet',
    },
    build: (lang) =>
      buildSample({
        name: { th: 'งานแต่งงาน', en: 'Wedding' },
        wbs: [
          {
            key: 'setupW',
            name: { th: 'วางแผนร่วมกัน', en: 'Joint planning' },
            children: [
              { key: 'guestList', name: { th: 'ร่างรายชื่อแขก + งบรวม', en: 'Draft the guest list + overall budget' }, duration: 7 },
              { key: 'dateFix', name: { th: 'เลือกวันแต่ง (เช็คฤกษ์งาม)', en: 'Choose the wedding date (check the auspicious times)' }, milestone: true },
            ],
          },
          {
            key: 'venueW',
            name: { th: 'สถานที่และพิธี', en: 'Venue and ceremony' },
            children: [
              { key: 'bookVenue', name: { th: 'จองสถานที่พิธี+เลี้ยง', en: 'Book the ceremony and reception venues' }, duration: 14, cost: 150000 },
              { key: 'monkCerem', name: { th: 'นัดพระและเตรียมพิธีแบบไทย', en: 'Book the monks and prepare the Thai ceremony' }, duration: 6, cost: 25000 },
              { key: 'decor', name: { th: 'ตกแต่งสถานที่', en: 'Dress the venue' }, duration: 5, cost: 60000 },
            ],
          },
          {
            key: 'attire',
            name: { th: 'ชุดและภาพ', en: 'Outfits and photography' },
            children: [
              { key: 'dress', name: { th: 'ชุดเจ้าสาว-เจ้าบ่าว + ทดลอง', en: 'Bride and groom outfits + fittings' }, duration: 21, cost: 45000 },
              {
                key: 'photog',
                name: { th: 'ภาพและวิดีโอ', en: 'Photo and video' },
                children: [
                  { key: 'bookPhotog', name: { th: 'เลือกและจองช่างภาพ/วิดีโอ', en: 'Choose and book the photographer and videographer' }, duration: 4, cost: 15000 },
                  { key: 'prewedShoot', name: 'Pre-wedding shoot', duration: 10, cost: 40000 },
                ],
              },
              { key: 'makeupTrial', name: { th: 'ทดลองแต่งหน้า', en: 'Makeup trial' }, duration: 2, cost: 8000 },
            ],
          },
          {
            key: 'inviteW',
            name: { th: 'บัตรเชิญและของชำร่วย', en: 'Invitations and favours' },
            children: [
              {
                key: 'cards',
                name: { th: 'บัตรเชิญ', en: 'Invitations' },
                children: [
                  { key: 'designCard', name: { th: 'ออกแบบบัตร', en: 'Design the invitations' }, duration: 5, cost: 9000 },
                  { key: 'printCard', name: { th: 'สั่งพิมพ์', en: 'Send to print' }, duration: 5, cost: 6000 },
                ],
              },
              { key: 'sendCards', name: { th: 'แจกบัตร/ส่งออนไลน์', en: 'Hand out and send the invitations' }, duration: 14 },
              { key: 'favors', name: { th: 'ซื้อของชำร่วย', en: 'Buy the favours' }, duration: 5, cost: 12000 },
            ],
          },
          {
            key: 'banquet',
            name: { th: 'งานเลี้ยง', en: 'Reception' },
            children: [
              { key: 'tasting', name: { th: 'ชิมอาหารกับร้านจัดเลี้ยง', en: 'Menu tasting with the caterer' }, duration: 2, cost: 5000 },
              { key: 'menuFinal', name: { th: 'ล็อกเมนู+จำนวนโต๊ะ', en: 'Lock the menu + table count' }, milestone: true },
              {
                key: 'cake',
                name: { th: 'เค้กและโต๊ะพิธี', en: 'Cake and ceremony table' },
                children: [
                  { key: 'orderCake', name: { th: 'ออกแบบ+สั่งเค้ก', en: 'Design and order the cake' }, duration: 2, cost: 8000 },
                  { key: 'ceremonyTable', name: { th: 'จัดโต๊ะพิธี/โต๊ะจัดเลี้ยง', en: 'Lay out the ceremony and banquet tables' }, duration: 2, cost: 10000 },
                ],
              },
            ],
          },
          {
            key: 'weddingWeek',
            name: { th: 'สัปดาห์แต่งและวันจริง', en: 'Wedding week and the day itself' },
            children: [
              { key: 'confirmAll', name: { th: 'ยืนยัน timeline กับทุก vendor', en: 'Confirm the timeline with every vendor' }, duration: 2 },
              { key: 'weddingDay', name: { th: 'วันแต่ง 💍', en: 'Wedding day 💍' }, milestone: true },
              { key: 'thankYou', name: { th: 'ขอบคุณแขก + เก็บภาพจากช่าง', en: 'Thank the guests + collect the photos' }, duration: 7 },
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
      }, lang),
  },
  {
    id: 'tpl-company-party',
    name: { th: 'ปาร์ตี้บริษัท / ปีใหม่', en: 'Company party / New Year event' },
    desc: {
      th: 'ธีม สถานที่ ของรางวัล โชว์ และไทม์ไลน์คืนงาน สำหรับ HR/ทีมอีเวนต์',
      en: 'Theme, venue, prizes, show and run-sheet — for HR / event teams',
    },
    build: (lang) =>
      buildSample({
        name: { th: 'ปาร์ตี้บริษัท / ปีใหม่', en: 'Company or new year party' },
        wbs: [
          {
            key: 'theme',
            name: { th: 'คอนเซ็ปต์และงบ', en: 'Concept and budget' },
            children: [
              { key: 'pickTheme', name: { th: 'เลือกธีม+รูปแบบงาน', en: 'Choose the theme and format' }, duration: 3 },
              { key: 'partyBudget', name: { th: 'อนุมัติงบต่อหัว', en: 'Approve the per-head budget' }, milestone: true },
            ],
          },
          {
            key: 'logistics',
            name: { th: 'สถานที่และจัดเลี้ยง', en: 'Venue and catering' },
            children: [
              { key: 'venueP', name: { th: 'จองโรงแรม/ห้องงาน', en: 'Book the hotel or function room' }, duration: 7, cost: 60000 },
              {
                key: 'foodP',
                name: { th: 'อาหารและเครื่องดื่ม', en: 'Food and drink' },
                children: [
                  { key: 'menuPick', name: { th: 'เลือกเมนูบุฟเฟ่ต์ + bar', en: 'Choose the buffet menu + bar' }, duration: 2 },
                  { key: 'depositFood', name: { th: 'วางมัดจำตามจำนวนหัว', en: 'Pay the per-head deposit' }, duration: 2, cost: 45000 },
                ],
              },
            ],
          },
          {
            key: 'program',
            name: { th: 'โปรแกรมคืนงาน', en: 'Evening programme' },
            children: [
              {
                key: 'mcBand',
                name: { th: 'MC และโชว์', en: 'MC and entertainment' },
                children: [
                  { key: 'bookBand', name: { th: 'จองวงดนตรี/โชว์', en: 'Book the band and entertainment' }, duration: 4, cost: 22000 },
                  { key: 'bookMc', name: { th: 'จอง MC + script กลางคืน', en: 'Book the MC + write the evening script' }, duration: 2, cost: 13000 },
                ],
              },
              { key: 'luckyDraw', name: { th: 'ของรางวัล lucky draw', en: 'Lucky draw prizes' }, duration: 4, cost: 25000 },
              { key: 'awards', name: { th: 'รางวัลพนักงานดีเด่น + สไลด์ย้อนปี', en: 'Employee awards + year-in-review slides' }, duration: 5 },
              { key: 'runsheet', name: { th: 'Run sheet รายชั่วโมง', en: 'Hour-by-hour run sheet' }, duration: 2 },
            ],
          },
          {
            key: 'partyWeek',
            name: { th: 'ก่อนงานและคืนงาน', en: 'Pre-event and event night' },
            children: [
              { key: 'rsvp', name: { th: 'นับ RSVP + จัดที่นั่ง', en: 'Count RSVPs + plan the seating' }, duration: 5 },
              { key: 'soundcheck', name: { th: 'Sound check + ซ้อมไทม์ไลน์', en: 'Sound check + timeline rehearsal' }, duration: 1 },
              { key: 'partyNight', name: { th: 'คืนปาร์ตี้ 🎉', en: 'Party night 🎉' }, milestone: true },
              { key: 'settlePay', name: { th: 'เคลียร์ค่าใช้จ่าย vendor', en: 'Settle the vendor invoices' }, duration: 5 },
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
      }, lang),
  },
]
