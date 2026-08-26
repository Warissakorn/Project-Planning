/** 📣 Marketing templates: social campaign, product launch. */

import { buildSample } from '../specProject'
import type { TemplateEntry } from './index'

export const MARKETING_TEMPLATES: TemplateEntry[] = [
  {
    id: 'tpl-social-campaign',
    name: { th: 'แคมเปญ Social Media 1 เดือน', en: 'One-month social media campaign' },
    desc: {
      th: 'ตั้งกลยุทธ์ ผลิตคอนเทนต์ล่วงหน้า เปิด ads รันเดือนเดียว แล้วสรุปผล',
      en: 'Strategy, batch content, paid boost for a month, wrap-up report',
    },
    build: () =>
      buildSample({
        name: 'แคมเปญ Social Media 1 เดือน',
        wbs: [
          {
            key: 'strat',
            name: 'กลยุทธ์',
            children: [
              { key: 'audience', name: 'นิยามกลุ่มเป้าหมายและ insight', duration: 3, cost: 6000 },
              { key: 'bigIdea', name: 'Big idea + key message', duration: 4, cost: 10000 },
              { key: 'kpiSet', name: 'ตั้ง KPI และงบแชแนล', milestone: true },
            ],
          },
          {
            key: 'content',
            name: 'ผลิตคอนเทนต์ล่วงหน้า',
            children: [
              { key: 'calendar', name: 'Content calendar 1 เดือน', duration: 2, cost: 3000 },
              {
                key: 'shoot',
                name: 'ถ่ายทำสื่อหลัก',
                children: [
                  { key: 'shootPhoto', name: 'ถ่ายภาพสินค้า/บุคลากร', duration: 2, cost: 15000 },
                  { key: 'shootVideo', name: 'ถ่ายวิดีโอ short-form', duration: 3, cost: 20000 },
                ],
              },
              { key: 'editPost', name: 'ตัดต่อ+เขียนแคปทั้งเดือน', duration: 6, cost: 15000 },
            ],
          },
          {
            key: 'media',
            name: 'สื่อและเปิดแคมเปญ',
            children: [
              { key: 'adSetup', name: 'ตั้ง ad account + targeting', duration: 2, cost: 5000 },
              { key: 'goLiveCamp', name: 'เปิดแคมเปญ 📣', milestone: true },
              {
                key: 'boost',
                name: 'รัน paid boost',
                children: [
                  { key: 'boostW12', name: 'Boost สัปดาห์ 1–2 (A/B creative)', duration: 14, cost: 45000 },
                  { key: 'boostW34', name: 'Boost สัปดาห์ 3–4 (scale ที่ชนะ)', duration: 14, cost: 45000 },
                ],
              },
            ],
          },
          {
            key: 'wrap',
            name: 'เฝ้าระวังและสรุปผล',
            children: [
              { key: 'weeklyWatch', name: 'Monitor + ปรับคอนเทนต์รายสัปดาห์', duration: 28, cost: 12000 },
              { key: 'report', name: 'สรุปผลเทียบ KPI + lesson learned', duration: 3, cost: 8000 },
            ],
          },
        ],
        deps: [
          { from: 'audience', to: 'bigIdea' },
          { from: 'bigIdea', to: 'kpiSet' },
          { from: 'kpiSet', to: 'calendar' },
          { from: 'calendar', to: 'shootPhoto' },
          { from: 'shootPhoto', to: 'shootVideo' },
          { from: 'shootVideo', to: 'editPost' },
          { from: 'calendar', to: 'adSetup', type: 'SS', lag: 2 },
          { from: 'editPost', to: 'goLiveCamp' },
          { from: 'adSetup', to: 'goLiveCamp' },
          { from: 'goLiveCamp', to: 'boostW12' },
          { from: 'boostW12', to: 'boostW34' },
          { from: 'goLiveCamp', to: 'weeklyWatch' },
          { from: 'boostW34', to: 'report' },
        ],
      }),
  },
  {
    id: 'tpl-product-launch',
    name: { th: 'เปิดตัวสินค้า / บริการใหม่', en: 'Product / service launch' },
    desc: {
      th: 'จาก positioning สู่ teaser PR และวันเปิดตัว พร้อมตามยอดหลัง launch',
      en: 'Positioning through teaser, press day and post-launch follow-up',
    },
    build: () =>
      buildSample({
        name: 'เปิดตัวสินค้า / บริการใหม่',
        wbs: [
          {
            key: 'define',
            name: 'นิยามสินค้าและราคา',
            children: [
              { key: 'position', name: 'Positioning + จุดขายหลัก', duration: 5, cost: 20000 },
              { key: 'pricing', name: 'ตั้งราคาและโปรโมชันเปิดตัว', duration: 4, cost: 8000 },
              { key: 'packaging', name: 'Packaging / ภาพสินค้า', duration: 8, cost: 45000 },
            ],
          },
          {
            key: 'assets',
            name: 'สื่อโฆษณา',
            children: [
              { key: 'keyVisual', name: 'Key visual + brand asset', duration: 6, cost: 30000 },
              {
                key: 'clipTeaser',
                name: 'วิดีโอ teaser 30 วินาที',
                children: [
                  { key: 'scriptBoard', name: 'Script + storyboard', duration: 2, cost: 15000 },
                  { key: 'filmEdit', name: 'ถ่ายทำและตัดต่อ', duration: 5, cost: 40000 },
                ],
              },
              { key: 'pressKit', name: 'Press kit + บทความเปิดตัว', duration: 4, cost: 15000 },
            ],
          },
          {
            key: 'channel',
            name: 'ช่องทางขาย',
            children: [
              { key: 'sellIn', name: 'Sell-in ร้านค้า/ตัวแทนจำหน่าย', duration: 10, cost: 25000 },
              {
                key: 'stockUp',
                name: 'เตรียมสต๊อกพร้อมขาย',
                children: [
                  { key: 'produceStock', name: 'ผลิต/สั่งล็อตแรก', duration: 5, cost: 90000 },
                  { key: 'qcPack', name: 'QC + แพ็คพร้อมขาย', duration: 2, cost: 30000 },
                ],
              },
              { key: 'ecomReady', name: 'ตั้งขายออนไลน์ (marketplace + เว็บ)', duration: 4, cost: 12000 },
            ],
          },
          {
            key: 'launchPhase',
            name: 'เปิดตัว',
            children: [
              { key: 'teaseRun', name: 'รัน teaser 1 สัปดาห์', duration: 7, cost: 40000 },
              { key: 'launchEvent', name: 'วันเปิดตัว + สื่อ 🎉', milestone: true },
              { key: 'adsRun', name: 'Ads หนัก 2 สัปดาห์แรก', duration: 14, cost: 80000 },
              { key: 'reviewSales', name: 'Review ยอดขายและ feedback', duration: 3 },
            ],
          },
        ],
        deps: [
          { from: 'position', to: 'pricing' },
          { from: 'pricing', to: 'packaging', type: 'SS', lag: 2 },
          { from: 'packaging', to: 'keyVisual' },
          { from: 'position', to: 'keyVisual' },
          { from: 'keyVisual', to: 'scriptBoard' },
          { from: 'scriptBoard', to: 'filmEdit' },
          { from: 'filmEdit', to: 'pressKit', lag: -3 },
          { from: 'position', to: 'sellIn' },
          { from: 'sellIn', to: 'produceStock', type: 'SS', lag: 4 },
          { from: 'produceStock', to: 'qcPack' },
          { from: 'pricing', to: 'ecomReady' },
          { from: 'filmEdit', to: 'teaseRun' },
          { from: 'teaseRun', to: 'launchEvent' },
          { from: 'qcPack', to: 'launchEvent' },
          { from: 'ecomReady', to: 'launchEvent' },
          { from: 'launchEvent', to: 'adsRun' },
          { from: 'adsRun', to: 'reviewSales' },
        ],
      }),
  },
]
