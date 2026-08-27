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
    build: (lang) =>
      buildSample({
        name: { th: 'แคมเปญ Social Media 1 เดือน', en: 'One-month social media campaign' },
        wbs: [
          {
            key: 'strat',
            name: { th: 'กลยุทธ์', en: 'Strategy' },
            children: [
              { key: 'audience', name: { th: 'นิยามกลุ่มเป้าหมายและ insight', en: 'Define the audience and the insight' }, duration: 3, cost: 6000 },
              { key: 'bigIdea', name: 'Big idea + key message', duration: 4, cost: 10000 },
              { key: 'kpiSet', name: { th: 'ตั้ง KPI และงบแชแนล', en: 'Set the channel KPIs and budget' }, milestone: true },
            ],
          },
          {
            key: 'content',
            name: { th: 'ผลิตคอนเทนต์ล่วงหน้า', en: 'Produce content in advance' },
            children: [
              { key: 'calendar', name: { th: 'Content calendar 1 เดือน', en: 'One-month content calendar' }, duration: 2, cost: 3000 },
              {
                key: 'shoot',
                name: { th: 'ถ่ายทำสื่อหลัก', en: 'Shoot the main assets' },
                children: [
                  { key: 'shootPhoto', name: { th: 'ถ่ายภาพสินค้า/บุคลากร', en: 'Product and team photography' }, duration: 2, cost: 15000 },
                  { key: 'shootVideo', name: { th: 'ถ่ายวิดีโอ short-form', en: 'Shoot short-form video' }, duration: 3, cost: 20000 },
                ],
              },
              { key: 'editPost', name: { th: 'ตัดต่อ+เขียนแคปทั้งเดือน', en: 'Edit + write captions for the month' }, duration: 6, cost: 15000 },
            ],
          },
          {
            key: 'media',
            name: { th: 'สื่อและเปิดแคมเปญ', en: 'Assets and campaign launch' },
            children: [
              { key: 'adSetup', name: { th: 'ตั้ง ad account + targeting', en: 'Set up the ad account + targeting' }, duration: 2, cost: 5000 },
              { key: 'goLiveCamp', name: { th: 'เปิดแคมเปญ 📣', en: 'Campaign launch 📣' }, milestone: true },
              {
                key: 'boost',
                name: { th: 'รัน paid boost', en: 'Run the paid boost' },
                children: [
                  { key: 'boostW12', name: { th: 'Boost สัปดาห์ 1–2 (A/B creative)', en: 'Boost weeks 1-2 (A/B creative)' }, duration: 14, cost: 45000 },
                  { key: 'boostW34', name: { th: 'Boost สัปดาห์ 3–4 (scale ที่ชนะ)', en: 'Boost weeks 3-4 (scale the winner)' }, duration: 14, cost: 45000 },
                ],
              },
            ],
          },
          {
            key: 'wrap',
            name: { th: 'เฝ้าระวังและสรุปผล', en: 'Monitoring and wrap-up' },
            children: [
              { key: 'weeklyWatch', name: { th: 'Monitor + ปรับคอนเทนต์รายสัปดาห์', en: 'Monitor + tune content weekly' }, duration: 28, cost: 12000 },
              { key: 'report', name: { th: 'สรุปผลเทียบ KPI + lesson learned', en: 'Report results against KPIs + lessons learned' }, duration: 3, cost: 8000 },
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
      }, lang),
  },
  {
    id: 'tpl-product-launch',
    name: { th: 'เปิดตัวสินค้า / บริการใหม่', en: 'Product / service launch' },
    desc: {
      th: 'จาก positioning สู่ teaser PR และวันเปิดตัว พร้อมตามยอดหลัง launch',
      en: 'Positioning through teaser, press day and post-launch follow-up',
    },
    build: (lang) =>
      buildSample({
        name: { th: 'เปิดตัวสินค้า / บริการใหม่', en: 'New product or service launch' },
        wbs: [
          {
            key: 'define',
            name: { th: 'นิยามสินค้าและราคา', en: 'Define the product and pricing' },
            children: [
              { key: 'position', name: { th: 'Positioning + จุดขายหลัก', en: 'Positioning + key selling points' }, duration: 5, cost: 20000 },
              { key: 'pricing', name: { th: 'ตั้งราคาและโปรโมชันเปิดตัว', en: 'Set launch pricing and promotions' }, duration: 4, cost: 8000 },
              { key: 'packaging', name: { th: 'Packaging / ภาพสินค้า', en: 'Packaging and product photography' }, duration: 8, cost: 45000 },
            ],
          },
          {
            key: 'assets',
            name: { th: 'สื่อโฆษณา', en: 'Advertising assets' },
            children: [
              { key: 'keyVisual', name: 'Key visual + brand asset', duration: 6, cost: 30000 },
              {
                key: 'clipTeaser',
                name: { th: 'วิดีโอ teaser 30 วินาที', en: '30-second teaser video' },
                children: [
                  { key: 'scriptBoard', name: 'Script + storyboard', duration: 2, cost: 15000 },
                  { key: 'filmEdit', name: { th: 'ถ่ายทำและตัดต่อ', en: 'Shoot and edit' }, duration: 5, cost: 40000 },
                ],
              },
              { key: 'pressKit', name: { th: 'Press kit + บทความเปิดตัว', en: 'Press kit + launch article' }, duration: 4, cost: 15000 },
            ],
          },
          {
            key: 'channel',
            name: { th: 'ช่องทางขาย', en: 'Sales channels' },
            children: [
              { key: 'sellIn', name: { th: 'Sell-in ร้านค้า/ตัวแทนจำหน่าย', en: 'Sell-in to retailers and distributors' }, duration: 10, cost: 25000 },
              {
                key: 'stockUp',
                name: { th: 'เตรียมสต๊อกพร้อมขาย', en: 'Prepare sale-ready stock' },
                children: [
                  { key: 'produceStock', name: { th: 'ผลิต/สั่งล็อตแรก', en: 'Produce or order the first batch' }, duration: 5, cost: 90000 },
                  { key: 'qcPack', name: { th: 'QC + แพ็คพร้อมขาย', en: 'QC + pack for sale' }, duration: 2, cost: 30000 },
                ],
              },
              { key: 'ecomReady', name: { th: 'ตั้งขายออนไลน์ (marketplace + เว็บ)', en: 'Set up online sales (marketplace + own site)' }, duration: 4, cost: 12000 },
            ],
          },
          {
            key: 'launchPhase',
            name: { th: 'เปิดตัว', en: 'Launch' },
            children: [
              { key: 'teaseRun', name: { th: 'รัน teaser 1 สัปดาห์', en: 'Run the teaser for a week' }, duration: 7, cost: 40000 },
              { key: 'launchEvent', name: { th: 'วันเปิดตัว + สื่อ 🎉', en: 'Launch day + media 🎉' }, milestone: true },
              { key: 'adsRun', name: { th: 'Ads หนัก 2 สัปดาห์แรก', en: 'Heavy ad spend for the first 2 weeks' }, duration: 14, cost: 80000 },
              { key: 'reviewSales', name: { th: 'Review ยอดขายและ feedback', en: 'Review sales and feedback' }, duration: 3 },
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
      }, lang),
  },
]
