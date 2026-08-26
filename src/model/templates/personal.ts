/** 🎓 Personal templates: thesis, moving house. */

import { buildSample } from '../specProject'
import type { TemplateEntry } from './index'

export const PERSONAL_TEMPLATES: TemplateEntry[] = [
  {
    id: 'tpl-thesis',
    name: { th: 'Thesis / สารนิพนธ์', en: 'Thesis / final project' },
    desc: {
      th: 'จาก proposal วรรณกรรม เก็บข้อมูล วิเคราะห์ ถึงสอบป้องกัน',
      en: 'Proposal through literature, data, analysis and defense',
    },
    build: (lang) =>
      buildSample({
        name: { th: 'Thesis ปริญญานิพนธ์', en: 'Thesis' },
        wbs: [
          {
            key: 'prop',
            name: 'Proposal',
            children: [
              { key: 'topicPick', name: { th: 'เลือกหัวข้อและอาจารย์ที่ปรึกษา', en: 'Choose the topic and advisor' }, duration: 10 },
              { key: 'proposalDoc', name: { th: 'เขียน proposal (โจทย์+วิธีการ)', en: 'Write the proposal (question + method)' }, duration: 20 },
              { key: 'proposalExam', name: { th: 'สอบ proposal', en: 'Proposal defence' }, milestone: true },
            ],
          },
          {
            key: 'lit',
            name: { th: 'วรรณกรรมและเครื่องมือ', en: 'Literature and instruments' },
            children: [
              { key: 'litReview', name: { th: 'อ่านงานวิจัย + สรุป lit review', en: 'Read the research + write the literature review' }, duration: 25 },
              { key: 'instrument', name: { th: 'ออกแบบแบบสอบถาม/ชุดทดลอง', en: 'Design the questionnaire and test set' }, duration: 12 },
              { key: 'ethicsOk', name: { th: 'ผ่าน ethics (ถ้าต้องใช้คน)', en: 'Ethics approval (if human subjects are involved)' }, milestone: true },
            ],
          },
          {
            key: 'collectPhase',
            name: { th: 'เก็บข้อมูล', en: 'Data collection' },
            children: [
              { key: 'pilot', name: { th: 'ทดลองนำ (pilot) 5–10 ตัวอย่าง', en: 'Pilot with 5-10 samples' }, duration: 7 },
              {
                key: 'dataCollect',
                name: { th: 'เก็บข้อมูลจริง', en: 'Field data collection' },
                children: [
                  { key: 'collectWave1', name: { th: 'รอบที่ 1 (กลุ่มตัวอย่างหลัก)', en: 'Round 1 (main sample group)' }, duration: 15 },
                  { key: 'collectWave2', name: { th: 'รอบที่ 2 (ตัวอย่างที่ขาด/ตามคืน)', en: 'Round 2 (missing and follow-up samples)' }, duration: 15 },
                ],
              },
            ],
          },
          {
            key: 'analysis',
            name: { th: 'วิเคราะห์ผล', en: 'Analysis' },
            children: [
              { key: 'cleanData', name: { th: 'เก็บ data สะอาด + coding', en: 'Clean the data + coding' }, duration: 6 },
              { key: 'statsRun', name: { th: 'วิเคราะห์ตามสมมติฐาน', en: 'Analyse against the hypotheses' }, duration: 15 },
              { key: 'interpret', name: { th: 'ตีความผล + ทำกราฟ/ตาราง', en: 'Interpret the results + build charts and tables' }, duration: 8 },
            ],
          },
          {
            key: 'writeUp',
            name: { th: 'เขียนและสอบ', en: 'Writing and defence' },
            children: [
              {
                key: 'draftChapters',
                name: { th: 'เขียนร่างบท 1–5', en: 'Draft chapters 1-5' },
                children: [
                  { key: 'ch1to3', name: { th: 'ร่างบท 1–3 (ทฤษฎี/วิธีการ)', en: 'Draft chapters 1-3 (theory and method)' }, duration: 12 },
                  { key: 'ch4to5', name: { th: 'ร่างบท 4–5 (ผล/สรุป)', en: 'Draft chapters 4-5 (results and conclusion)' }, duration: 13 },
                ],
              },
              { key: 'advisorRev', name: { th: 'ส่งที่ปรึกษาตรวจ 2 รอบ', en: 'Two review rounds with the advisor' }, duration: 18 },
              { key: 'formatCheck', name: { th: 'ตรวจรูปเล่ม+ส่งกรรมการ', en: 'Proofread the manuscript + submit to the committee' }, duration: 7 },
              { key: 'defenseDay', name: { th: 'สอบป้องกัน 🎓', en: 'Thesis defence 🎓' }, milestone: true },
              { key: 'finalSubmit', name: { th: 'แก้ตามกรรมการ+ส่งเล่มจบ', en: 'Revise per the committee + submit the final copy' }, duration: 14 },
            ],
          },
        ],
        deps: [
          { from: 'topicPick', to: 'proposalDoc' },
          { from: 'proposalDoc', to: 'proposalExam' },
          { from: 'litReview', to: 'instrument' },
          { from: 'instrument', to: 'ethicsOk' },
          { from: 'proposalExam', to: 'pilot' },
          { from: 'ethicsOk', to: 'pilot' },
          { from: 'pilot', to: 'collectWave1' },
          { from: 'collectWave1', to: 'collectWave2' },
          { from: 'collectWave2', to: 'cleanData' },
          { from: 'cleanData', to: 'statsRun' },
          { from: 'statsRun', to: 'interpret' },
          // เริ่มร่างบทต้น ๆ ได้ก่อนผลวิเคราะห์ออก
          { from: 'proposalExam', to: 'ch1to3', type: 'SS', lag: 30 },
          { from: 'interpret', to: 'ch4to5' },
          { from: 'ch1to3', to: 'ch4to5', type: 'SS', lag: 8 },
          { from: 'ch4to5', to: 'advisorRev' },
          { from: 'advisorRev', to: 'formatCheck' },
          { from: 'formatCheck', to: 'defenseDay' },
          { from: 'defenseDay', to: 'finalSubmit' },
        ],
      }, lang),
  },
  {
    id: 'tpl-move-house',
    name: { th: 'ย้ายบ้าน / ย้ายหอ', en: 'Moving house' },
    desc: {
      th: 'ตั้งงบ หาที่ใหม่ ทำสัญญา จัดกล่อง ย้ายของ โอนค่าไฟ-น้ำ-เน็ต',
      en: 'Budget, hunting, contract, packing, movers, utility transfer',
    },
    build: (lang) =>
      buildSample({
        name: { th: 'ย้ายบ้าน / ย้ายหอ', en: 'House or dorm move' },
        wbs: [
          {
            key: 'prepMove',
            name: { th: 'เตรียมตัว', en: 'Preparation' },
            children: [
              { key: 'moveBudget', name: { th: 'ตั้งงบย้าย + วัน target', en: 'Set the moving budget + target date' }, duration: 2 },
              { key: 'declutter', name: { th: 'คัดของออก/ขาย/บริจาค', en: 'Sort out, sell or donate belongings' }, duration: 7 },
            ],
          },
          {
            key: 'hunt',
            name: { th: 'หาที่ใหม่', en: 'Find a new place' },
            children: [
              { key: 'viewRooms', name: { th: 'ดูห้อง/บ้าน 4–6 ที่', en: 'View 4-6 properties' }, duration: 8, cost: 1000 },
              { key: 'signLease', name: { th: 'ทำสัญญา + วางประกัน', en: 'Sign the contract + pay the deposit' }, milestone: true },
              { key: 'paintFix', name: { th: 'ทำความสะอาด/แต้มสีก่อนเข้า', en: 'Clean and touch up paint before moving in' }, duration: 3, cost: 4000 },
            ],
          },
          {
            key: 'packPhase',
            name: { th: 'จัดของ', en: 'Sort belongings' },
            children: [
              { key: 'buyBoxes', name: { th: 'ซื้อกล่อง เทป ฟองน้ำ', en: 'Buy boxes, tape and bubble wrap' }, duration: 1, cost: 800 },
              {
                key: 'packAll',
                name: { th: 'จัดกล่องทีละห้อง', en: 'Pack room by room' },
                children: [
                  { key: 'packRooms', name: { th: 'แพ็คห้องนอน/ห้องนั่งเล่น + label', en: 'Pack the bedroom and living room + label' }, duration: 5 },
                  { key: 'packKitchen', name: { th: 'แพ็คครัวและของเปราะ', en: 'Pack the kitchen and fragile items' }, duration: 3 },
                ],
              },
            ],
          },
          {
            key: 'logistics',
            name: { th: 'ขนย้ายและเอกสาร', en: 'Moving and paperwork' },
            children: [
              { key: 'bookMovers', name: { th: 'จองรถ/ทีมย้ายของ', en: 'Book the truck and moving crew' }, duration: 3, cost: 5000 },
              {
                key: 'transferUtil',
                name: { th: 'ไฟ-น้ำ-เน็ต เก่าและใหม่', en: 'Utilities at both places (power, water, internet)' },
                children: [
                  { key: 'closeOldUtil', name: { th: 'แจ้งปิดย้ายที่เก่า', en: 'Give notice on the old premises' }, duration: 2 },
                  { key: 'setupNewUtil', name: { th: 'สมัคร/ย้ายเครื่องผู้ใช้ที่ใหม่', en: 'Register and move user machines to the new site' }, duration: 2 },
                ],
              },
              { key: 'changeAddr', name: { th: 'แจ้งเปลี่ยนที่อยู่ (ธนาคาร/พัสดุ)', en: 'Change of address (bank and deliveries)' }, duration: 3 },
            ],
          },
          {
            key: 'settleIn',
            name: { th: 'วันย้ายและเข้าใหม่', en: 'Moving day and settling in' },
            children: [
              { key: 'movingDay', name: { th: 'วันย้าย 📦', en: 'Moving day 📦' }, milestone: true },
              { key: 'unpackKey', name: { th: 'แกะกล่องห้องนอน+ครัวก่อน', en: 'Unpack the bedroom and kitchen first' }, duration: 3 },
              { key: 'oldClean', name: { th: 'ส่งมอบที่เก่า + รับคืนเงินประกัน', en: 'Hand back the old place + recover the deposit' }, duration: 2 },
            ],
          },
        ],
        deps: [
          { from: 'moveBudget', to: 'declutter' },
          { from: 'declutter', to: 'viewRooms' },
          { from: 'viewRooms', to: 'signLease' },
          { from: 'signLease', to: 'paintFix' },
          { from: 'declutter', to: 'buyBoxes', lag: -1 },
          { from: 'buyBoxes', to: 'packRooms' },
          { from: 'packRooms', to: 'packKitchen' },
          { from: 'signLease', to: 'bookMovers' },
          { from: 'signLease', to: 'closeOldUtil' },
          { from: 'closeOldUtil', to: 'setupNewUtil' },
          { from: 'bookMovers', to: 'movingDay' },
          { from: 'packKitchen', to: 'movingDay' },
          // ไฟใหม่ต้องเข้าก่อน/พร้อมวันย้าย
          { from: 'setupNewUtil', to: 'movingDay', type: 'FF' },
          { from: 'movingDay', to: 'unpackKey' },
          { from: 'unpackKey', to: 'oldClean' },
        ],
      }, lang),
  },
]
