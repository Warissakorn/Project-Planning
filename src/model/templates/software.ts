/** 💻 Software templates: company website, mobile MVP, cloud migration. */

import { buildSample } from '../specProject'
import type { TemplateEntry } from './index'

export const SOFTWARE_TEMPLATES: TemplateEntry[] = [
  {
    id: 'tpl-company-website',
    name: { th: 'เว็บไซต์บริษัท / ร้านค้าออนไลน์', en: 'Company / e-commerce website' },
    desc: {
      th: 'ตั้งแต่เก็บความต้องการและดีไซน์ จนถึงพัฒนา ทดสอบ ขึ้นโดเมนจริง',
      en: 'Requirements and design through build, QA and go-live',
    },
    build: () =>
      buildSample({
        name: 'เว็บไซต์บริษัท / ร้านค้าออนไลน์',
        wbs: [
          {
            key: 'disc',
            name: 'ความต้องการและเนื้อหา',
            children: [
              { key: 'reqs', name: 'ประชุมเก็บความต้องการ', duration: 3, cost: 9000 },
              { key: 'sitemap', name: 'โครงเว็บ (sitemap) และสารบัญเนื้อหา', duration: 3, cost: 6000 },
              { key: 'copy', name: 'รวบรวมข้อความและภาพประกอบ', duration: 7, cost: 8000 },
            ],
          },
          {
            key: 'design',
            name: 'ออกแบบ',
            children: [
              { key: 'wire', name: 'Wireframe หน้าหลัก', duration: 4, cost: 12000 },
              {
                key: 'ui',
                name: 'UI Design',
                children: [
                  { key: 'uiMain', name: 'ดีไซน์หน้าหลัก + design system เล็ก', duration: 4, cost: 15000 },
                  { key: 'uiRest', name: 'ดีไซน์หน้าย่อยที่เหลือ', duration: 3, cost: 10000 },
                ],
              },
              { key: 'signoff', name: 'ฝ่ายเจ้าของงานอนุมัติดีไซน์', milestone: true },
            ],
          },
          {
            key: 'dev',
            name: 'พัฒนา',
            children: [
              { key: 'setup', name: 'ตั้ง repo, hosting และ CI deploy', duration: 2, cost: 4000 },
              {
                key: 'frontend',
                name: 'พัฒนาหน้าเว็บ',
                children: [
                  { key: 'pagesBuild', name: 'สร้างหน้าตามดีไซน์', duration: 7, cost: 30000 },
                  { key: 'responsiveFix', name: 'ปรับ responsive + browser test', duration: 5, cost: 18000 },
                ],
              },
              { key: 'cms', name: 'ต่อ CMS/ฐานข้อมูลสินค้า', duration: 6, cost: 24000 },
              {
                key: 'payShip',
                name: 'ระบบสั่งซื้อ-ชำระเงิน-จัดส่ง',
                children: [
                  { key: 'cartCheckout', name: 'ตะกร้าสินค้า + checkout flow', duration: 5, cost: 22000 },
                  { key: 'payGateway', name: 'เชื่อม payment gateway + shipping rate', duration: 3, cost: 14000 },
                ],
              },
            ],
          },
          {
            key: 'qa',
            name: 'ทดสอบและเปิดใช้',
            children: [
              { key: 'qaTest', name: 'ทดสอบทุกหน้าทั้งมือถือ/เดสก์ท็อป', duration: 4, cost: 12000 },
              { key: 'seoSpeed', name: 'ตรวจ SEO พื้นฐานและความเร็ว', duration: 2, cost: 5000 },
              { key: 'goLive', name: 'ขึ้นโดเมนจริง (Go live)', milestone: true },
              { key: 'training', name: 'อบรมทีมดูแลเว็บและส่งมอบ', duration: 1, cost: 3000 },
            ],
          },
        ],
        deps: [
          { from: 'reqs', to: 'sitemap' },
          { from: 'sitemap', to: 'copy', type: 'SS', lag: 1 },
          { from: 'sitemap', to: 'wire' },
          { from: 'copy', to: 'uiMain', lag: 2 },
          { from: 'wire', to: 'uiMain' },
          { from: 'uiMain', to: 'uiRest' },
          { from: 'uiRest', to: 'signoff' },
          { from: 'signoff', to: 'setup' },
          { from: 'setup', to: 'pagesBuild' },
          { from: 'pagesBuild', to: 'responsiveFix' },
          { from: 'setup', to: 'cms', type: 'SS', lag: 1 },
          { from: 'cms', to: 'cartCheckout' },
          { from: 'cartCheckout', to: 'payGateway' },
          { from: 'responsiveFix', to: 'qaTest' },
          { from: 'payGateway', to: 'qaTest' },
          { from: 'qaTest', to: 'seoSpeed' },
          { from: 'seoSpeed', to: 'goLive' },
          { from: 'goLive', to: 'training' },
        ],
      }),
  },
  {
    id: 'tpl-app-mvp',
    name: { th: 'แอปมือถือ MVP', en: 'Mobile app MVP' },
    desc: {
      th: 'สายผลิตแบบ lean: UX → UI → API → แอป → beta test → เปิดสโตร์',
      en: 'Lean pipeline: UX → UI → API → app → beta → store launch',
    },
    build: () =>
      buildSample({
        name: 'แอปมือถือ MVP',
        wbs: [
          {
            key: 'kick',
            name: 'Discovery',
            children: [
              { key: 'problem', name: 'นิยามปัญหาและ user persona', duration: 4, cost: 20000 },
              { key: 'scope', name: 'ตัด scope MVP ให้เหลือ core flow', duration: 2, cost: 8000 },
              { key: 'mvpGate', name: 'อนุมัติ scope MVP', milestone: true },
            ],
          },
          {
            key: 'ux',
            name: 'UX / UI',
            children: [
              { key: 'flow', name: 'User flow + wireframe ทุกหน้า', duration: 8, cost: 32000 },
              { key: 'uiKit', name: 'UI kit และดีไซน์หน้าหลัก', duration: 7, cost: 36000 },
              { key: 'proto', name: 'Prototype ทดลองกับผู้ใช้ 5 คน', duration: 4, cost: 14000 },
            ],
          },
          {
            key: 'api',
            name: 'Backend & API',
            children: [
              { key: 'schema', name: 'ออกแบบ data model + API contract', duration: 4, cost: 16000 },
              { key: 'auth', name: 'Auth + user profile API', duration: 6, cost: 26000 },
              {
                key: 'coreApi',
                name: 'Core feature API',
                children: [
                  { key: 'apiCoreA', name: 'API ฟีเจอร์กลุ่ม A', duration: 6, cost: 26000 },
                  { key: 'apiCoreB', name: 'API ฟีเจอร์กลุ่ม B + integration stub', duration: 4, cost: 18000 },
                ],
              },
            ],
          },
          {
            key: 'app',
            name: 'Mobile app',
            children: [
              { key: 'shell', name: 'App shell + navigation', duration: 4, cost: 18000 },
              {
                key: 'featureDev',
                name: 'พัฒนา core features ต่อ API',
                children: [
                  { key: 'featA', name: 'Features กลุ่ม A (ต่อ API A)', duration: 8, cost: 34000 },
                  { key: 'featB', name: 'Features กลุ่ม B + offline state', duration: 6, cost: 26000 },
                ],
              },
              { key: 'pushNoti', name: 'Push notification + analytics', duration: 3, cost: 10000 },
            ],
          },
          {
            key: 'beta',
            name: 'Beta & launch',
            children: [
              { key: 'integrate', name: 'Integration test แอป↔API', duration: 4, cost: 14000 },
              { key: 'betaRun', name: 'Closed beta 2 สัปดาห์ + เก็บ feedback', duration: 14, cost: 20000 },
              { key: 'fixes', name: 'แก้ bug ก้อนใหญ่จาก beta', duration: 6, cost: 22000 },
              { key: 'storeSub', name: 'Submit ขึ้น App Store / Play Store', duration: 3, cost: 5000 },
              { key: 'launchDay', name: 'เปิดตัว MVP 🚀', milestone: true },
            ],
          },
        ],
        deps: [
          { from: 'problem', to: 'scope' },
          { from: 'scope', to: 'mvpGate' },
          { from: 'mvpGate', to: 'flow' },
          { from: 'flow', to: 'uiKit' },
          { from: 'uiKit', to: 'proto' },
          { from: 'mvpGate', to: 'schema' },
          { from: 'schema', to: 'auth' },
          { from: 'auth', to: 'apiCoreA' },
          { from: 'apiCoreA', to: 'apiCoreB' },
          { from: 'proto', to: 'shell', lag: -3 },
          { from: 'shell', to: 'featA' },
          { from: 'apiCoreA', to: 'featA', type: 'SS', lag: 5 },
          { from: 'featA', to: 'featB' },
          { from: 'featB', to: 'pushNoti' },
          { from: 'apiCoreB', to: 'integrate' },
          { from: 'pushNoti', to: 'integrate' },
          { from: 'integrate', to: 'betaRun' },
          { from: 'betaRun', to: 'fixes' },
          { from: 'fixes', to: 'storeSub' },
          { from: 'storeSub', to: 'launchDay' },
        ],
      }),
  },
  {
    id: 'tpl-cloud-migration',
    name: { th: 'ย้ายระบบขึ้น Cloud', en: 'Cloud migration' },
    desc: {
      th: 'ประเมินระบบเดิม ตั้ง landing zone ย้ายทีละระบบ แล้ว cutover อย่างปลอดภัย',
      en: 'Assess, land, migrate system by system, then cut over safely',
    },
    build: () =>
      buildSample({
        name: 'ย้ายระบบขึ้น Cloud',
        wbs: [
          {
            key: 'assess',
            name: 'ประเมินและวางแผน',
            children: [
              { key: 'inventory', name: 'สำรวจระบบ/VM/ฐานข้อมูลที่ต้องย้าย', duration: 6, cost: 40000 },
              { key: 'wavePlan', name: 'จัด wave การย้ายและ rollback plan', duration: 4, cost: 24000 },
              { key: 'budgetOk', name: 'อนุมัติงบ migration', milestone: true },
            ],
          },
          {
            key: 'landing',
            name: 'Landing zone',
            children: [
              {
                key: 'vpc',
                name: 'Network และ IAM',
                children: [
                  { key: 'accountsVpc', name: 'ตั้ง account/VPC/subnet', duration: 4, cost: 18000 },
                  { key: 'iamPolicy', name: 'IAM policy + security baseline', duration: 3, cost: 12000 },
                ],
              },
              { key: 'cicdCloud', name: 'Pipeline deploy ฝั่ง cloud', duration: 5, cost: 26000 },
              { key: 'monitor', name: 'Monitoring/logging พื้นฐาน', duration: 4, cost: 18000 },
            ],
          },
          {
            key: 'migrate',
            name: 'ย้าย workload',
            children: [
              { key: 'dbReplica', name: 'ตั้ง replica ฐานข้อมูล', duration: 6, cost: 34000 },
              {
                key: 'app1',
                name: 'ย้ายระบบภายใน (intranet)',
                children: [
                  { key: 'assessApp1', name: 'Assess dependency + fix compatibility', duration: 3, cost: 16000 },
                  { key: 'migrateApp1', name: 'Migrate + smoke test', duration: 5, cost: 26000 },
                ],
              },
              { key: 'app2', name: 'ย้ายระบบบริการลูกค้า', duration: 8, cost: 42000 },
              { key: 'dataSync', name: 'Sync ข้อมูลจริงและตรวจ integrity', duration: 5, cost: 22000 },
            ],
          },
          {
            key: 'cutover',
            name: 'Cutover',
            children: [
              { key: 'uat', name: 'UAT กับผู้ใช้จริงบน cloud', duration: 6, cost: 26000 },
              { key: 'freeze', name: 'Cutover weekend: switch DNS + final sync', duration: 2, cost: 30000 },
              { key: 'hypercare', name: 'Hypercare 2 สัปดาห์', duration: 14, cost: 40000 },
              { key: 'decom', name: 'ปิด server เก่า', duration: 3, cost: 8000 },
            ],
          },
        ],
        deps: [
          { from: 'inventory', to: 'wavePlan' },
          { from: 'wavePlan', to: 'budgetOk' },
          { from: 'budgetOk', to: 'accountsVpc' },
          { from: 'accountsVpc', to: 'iamPolicy' },
          { from: 'iamPolicy', to: 'cicdCloud' },
          { from: 'cicdCloud', to: 'monitor', lag: -2 },
          { from: 'monitor', to: 'assessApp1', lag: -1 },
          { from: 'budgetOk', to: 'dbReplica' },
          { from: 'dbReplica', to: 'dataSync', type: 'SS', lag: 8 },
          { from: 'assessApp1', to: 'migrateApp1' },
          { from: 'migrateApp1', to: 'app2' },
          { from: 'app2', to: 'uat' },
          { from: 'dataSync', to: 'uat' },
          { from: 'uat', to: 'freeze' },
          { from: 'freeze', to: 'hypercare' },
          { from: 'hypercare', to: 'decom' },
        ],
      }),
  },
]
