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
    build: () =>
      buildSample({
        name: 'Thesis ปริญญานิพนธ์',
        wbs: [
          {
            key: 'prop',
            name: 'Proposal',
            children: [
              { key: 'topicPick', name: 'เลือกหัวข้อและอาจารย์ที่ปรึกษา', duration: 10 },
              { key: 'proposalDoc', name: 'เขียน proposal (โจทย์+วิธีการ)', duration: 20 },
              { key: 'proposalExam', name: 'สอบ proposal', milestone: true },
            ],
          },
          {
            key: 'lit',
            name: 'วรรณกรรมและเครื่องมือ',
            children: [
              { key: 'litReview', name: 'อ่านงานวิจัย + สรุป lit review', duration: 25 },
              { key: 'instrument', name: 'ออกแบบแบบสอบถาม/ชุดทดลอง', duration: 12 },
              { key: 'ethicsOk', name: 'ผ่าน ethics (ถ้าต้องใช้คน)', milestone: true },
            ],
          },
          {
            key: 'collectPhase',
            name: 'เก็บข้อมูล',
            children: [
              { key: 'pilot', name: 'ทดลองนำ (pilot) 5–10 ตัวอย่าง', duration: 7 },
              {
                key: 'dataCollect',
                name: 'เก็บข้อมูลจริง',
                children: [
                  { key: 'collectWave1', name: 'รอบที่ 1 (กลุ่มตัวอย่างหลัก)', duration: 15 },
                  { key: 'collectWave2', name: 'รอบที่ 2 (ตัวอย่างที่ขาด/ตามคืน)', duration: 15 },
                ],
              },
            ],
          },
          {
            key: 'analysis',
            name: 'วิเคราะห์ผล',
            children: [
              { key: 'cleanData', name: 'เก็บ data สะอาด + coding', duration: 6 },
              { key: 'statsRun', name: 'วิเคราะห์ตามสมมติฐาน', duration: 15 },
              { key: 'interpret', name: 'ตีความผล + ทำกราฟ/ตาราง', duration: 8 },
            ],
          },
          {
            key: 'writeUp',
            name: 'เขียนและสอบ',
            children: [
              {
                key: 'draftChapters',
                name: 'เขียนร่างบท 1–5',
                children: [
                  { key: 'ch1to3', name: 'ร่างบท 1–3 (ทฤษฎี/วิธีการ)', duration: 12 },
                  { key: 'ch4to5', name: 'ร่างบท 4–5 (ผล/สรุป)', duration: 13 },
                ],
              },
              { key: 'advisorRev', name: 'ส่งที่ปรึกษาตรวจ 2 รอบ', duration: 18 },
              { key: 'formatCheck', name: 'ตรวจรูปเล่ม+ส่งกรรมการ', duration: 7 },
              { key: 'defenseDay', name: 'สอบป้องกัน 🎓', milestone: true },
              { key: 'finalSubmit', name: 'แก้ตามกรรมการ+ส่งเล่มจบ', duration: 14 },
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
      }),
  },
  {
    id: 'tpl-move-house',
    name: { th: 'ย้ายบ้าน / ย้ายหอ', en: 'Moving house' },
    desc: {
      th: 'ตั้งงบ หาที่ใหม่ ทำสัญญา จัดกล่อง ย้ายของ โอนค่าไฟ-น้ำ-เน็ต',
      en: 'Budget, hunting, contract, packing, movers, utility transfer',
    },
    build: () =>
      buildSample({
        name: 'ย้ายบ้าน / ย้ายหอ',
        wbs: [
          {
            key: 'prepMove',
            name: 'เตรียมตัว',
            children: [
              { key: 'moveBudget', name: 'ตั้งงบย้าย + วัน target', duration: 2 },
              { key: 'declutter', name: 'คัดของออก/ขาย/บริจาค', duration: 7 },
            ],
          },
          {
            key: 'hunt',
            name: 'หาที่ใหม่',
            children: [
              { key: 'viewRooms', name: 'ดูห้อง/บ้าน 4–6 ที่', duration: 8, cost: 1000 },
              { key: 'signLease', name: 'ทำสัญญา + วางประกัน', milestone: true },
              { key: 'paintFix', name: 'ทำความสะอาด/แต้มสีก่อนเข้า', duration: 3, cost: 4000 },
            ],
          },
          {
            key: 'packPhase',
            name: 'จัดของ',
            children: [
              { key: 'buyBoxes', name: 'ซื้อกล่อง เทป ฟองน้ำ', duration: 1, cost: 800 },
              {
                key: 'packAll',
                name: 'จัดกล่องทีละห้อง',
                children: [
                  { key: 'packRooms', name: 'แพ็คห้องนอน/ห้องนั่งเล่น + label', duration: 5 },
                  { key: 'packKitchen', name: 'แพ็คครัวและของเปราะ', duration: 3 },
                ],
              },
            ],
          },
          {
            key: 'logistics',
            name: 'ขนย้ายและเอกสาร',
            children: [
              { key: 'bookMovers', name: 'จองรถ/ทีมย้ายของ', duration: 3, cost: 5000 },
              {
                key: 'transferUtil',
                name: 'ไฟ-น้ำ-เน็ต เก่าและใหม่',
                children: [
                  { key: 'closeOldUtil', name: 'แจ้งปิดย้ายที่เก่า', duration: 2 },
                  { key: 'setupNewUtil', name: 'สมัคร/ย้ายเครื่องผู้ใช้ที่ใหม่', duration: 2 },
                ],
              },
              { key: 'changeAddr', name: 'แจ้งเปลี่ยนที่อยู่ (ธนาคาร/พัสดุ)', duration: 3 },
            ],
          },
          {
            key: 'settleIn',
            name: 'วันย้ายและเข้าใหม่',
            children: [
              { key: 'movingDay', name: 'วันย้าย 📦', milestone: true },
              { key: 'unpackKey', name: 'แกะกล่องห้องนอน+ครัวก่อน', duration: 3 },
              { key: 'oldClean', name: 'ส่งมอบที่เก่า + รับคืนเงินประกัน', duration: 2 },
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
      }),
  },
]
