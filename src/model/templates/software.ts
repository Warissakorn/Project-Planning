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
    build: (lang) =>
      buildSample({
        name: { th: 'เว็บไซต์บริษัท / ร้านค้าออนไลน์', en: 'Company website or online shop' },
        wbs: [
          {
            key: 'disc',
            name: { th: 'ความต้องการและเนื้อหา', en: 'Requirements and content' },
            children: [
              { key: 'reqs', name: { th: 'ประชุมเก็บความต้องการ', en: 'Requirements workshop' }, duration: 3, cost: 9000 },
              { key: 'sitemap', name: { th: 'โครงเว็บ (sitemap) และสารบัญเนื้อหา', en: 'Sitemap and content outline' }, duration: 3, cost: 6000 },
              { key: 'copy', name: { th: 'รวบรวมข้อความและภาพประกอบ', en: 'Collect the copy and imagery' }, duration: 7, cost: 8000 },
            ],
          },
          {
            key: 'design',
            name: { th: 'ออกแบบ', en: 'Design' },
            children: [
              { key: 'wire', name: { th: 'Wireframe หน้าหลัก', en: 'Wireframe the main pages' }, duration: 4, cost: 12000 },
              {
                key: 'ui',
                name: 'UI Design',
                children: [
                  { key: 'uiMain', name: { th: 'ดีไซน์หน้าหลัก + design system เล็ก', en: 'Design the main pages + a small design system' }, duration: 4, cost: 15000 },
                  { key: 'uiRest', name: { th: 'ดีไซน์หน้าย่อยที่เหลือ', en: 'Design the remaining pages' }, duration: 3, cost: 10000 },
                ],
              },
              { key: 'signoff', name: { th: 'ฝ่ายเจ้าของงานอนุมัติดีไซน์', en: 'Client design approval' }, milestone: true },
            ],
          },
          {
            key: 'dev',
            name: { th: 'พัฒนา', en: 'Development' },
            children: [
              { key: 'setup', name: { th: 'ตั้ง repo, hosting และ CI deploy', en: 'Set up the repo, hosting and CI deploy' }, duration: 2, cost: 4000 },
              {
                key: 'frontend',
                name: { th: 'พัฒนาหน้าเว็บ', en: 'Build the pages' },
                children: [
                  { key: 'pagesBuild', name: { th: 'สร้างหน้าตามดีไซน์', en: 'Build the pages from the designs' }, duration: 7, cost: 30000 },
                  { key: 'responsiveFix', name: { th: 'ปรับ responsive + browser test', en: 'Responsive tuning + browser testing' }, duration: 5, cost: 18000 },
                ],
              },
              { key: 'cms', name: { th: 'ต่อ CMS/ฐานข้อมูลสินค้า', en: 'Connect the CMS and product database' }, duration: 6, cost: 24000 },
              {
                key: 'payShip',
                name: { th: 'ระบบสั่งซื้อ-ชำระเงิน-จัดส่ง', en: 'Ordering, payment and delivery' },
                children: [
                  { key: 'cartCheckout', name: { th: 'ตะกร้าสินค้า + checkout flow', en: 'Cart + checkout flow' }, duration: 5, cost: 22000 },
                  { key: 'payGateway', name: { th: 'เชื่อม payment gateway + shipping rate', en: 'Connect the payment gateway + shipping rates' }, duration: 3, cost: 14000 },
                ],
              },
            ],
          },
          {
            key: 'qa',
            name: { th: 'ทดสอบและเปิดใช้', en: 'Testing and go-live' },
            children: [
              { key: 'qaTest', name: { th: 'ทดสอบทุกหน้าทั้งมือถือ/เดสก์ท็อป', en: 'Test every page on mobile and desktop' }, duration: 4, cost: 12000 },
              { key: 'seoSpeed', name: { th: 'ตรวจ SEO พื้นฐานและความเร็ว', en: 'Check basic SEO and page speed' }, duration: 2, cost: 5000 },
              { key: 'goLive', name: { th: 'ขึ้นโดเมนจริง (Go live)', en: 'Point the live domain (go live)' }, milestone: true },
              { key: 'training', name: { th: 'อบรมทีมดูแลเว็บและส่งมอบ', en: 'Train the site owners and hand over' }, duration: 1, cost: 3000 },
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
      }, lang),
  },
  {
    id: 'tpl-app-mvp',
    name: { th: 'แอปมือถือ MVP', en: 'Mobile app MVP' },
    desc: {
      th: 'สายผลิตแบบ lean: UX → UI → API → แอป → beta test → เปิดสโตร์',
      en: 'Lean pipeline: UX → UI → API → app → beta → store launch',
    },
    build: (lang) =>
      buildSample({
        name: { th: 'แอปมือถือ MVP', en: 'Mobile app MVP' },
        wbs: [
          {
            key: 'kick',
            name: 'Discovery',
            children: [
              { key: 'problem', name: { th: 'นิยามปัญหาและ user persona', en: 'Define the problem and user personas' }, duration: 4, cost: 20000 },
              { key: 'scope', name: { th: 'ตัด scope MVP ให้เหลือ core flow', en: 'Cut the MVP scope down to the core flow' }, duration: 2, cost: 8000 },
              { key: 'mvpGate', name: { th: 'อนุมัติ scope MVP', en: 'Approve the MVP scope' }, milestone: true },
            ],
          },
          {
            key: 'ux',
            name: 'UX / UI',
            children: [
              { key: 'flow', name: { th: 'User flow + wireframe ทุกหน้า', en: 'User flow + wireframes for every screen' }, duration: 8, cost: 32000 },
              { key: 'uiKit', name: { th: 'UI kit และดีไซน์หน้าหลัก', en: 'UI kit and key screen designs' }, duration: 7, cost: 36000 },
              { key: 'proto', name: { th: 'Prototype ทดลองกับผู้ใช้ 5 คน', en: 'Prototype tested with 5 users' }, duration: 4, cost: 14000 },
            ],
          },
          {
            key: 'api',
            name: 'Backend & API',
            children: [
              { key: 'schema', name: { th: 'ออกแบบ data model + API contract', en: 'Design the data model + API contract' }, duration: 4, cost: 16000 },
              { key: 'auth', name: 'Auth + user profile API', duration: 6, cost: 26000 },
              {
                key: 'coreApi',
                name: 'Core feature API',
                children: [
                  { key: 'apiCoreA', name: { th: 'API ฟีเจอร์กลุ่ม A', en: 'Feature group A API' }, duration: 6, cost: 26000 },
                  { key: 'apiCoreB', name: { th: 'API ฟีเจอร์กลุ่ม B + integration stub', en: 'Feature group B API + integration stub' }, duration: 4, cost: 18000 },
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
                name: { th: 'พัฒนา core features ต่อ API', en: 'Build the core features against the API' },
                children: [
                  { key: 'featA', name: { th: 'Features กลุ่ม A (ต่อ API A)', en: 'Feature group A (against API A)' }, duration: 8, cost: 34000 },
                  { key: 'featB', name: { th: 'Features กลุ่ม B + offline state', en: 'Feature group B + offline state' }, duration: 6, cost: 26000 },
                ],
              },
              { key: 'pushNoti', name: 'Push notification + analytics', duration: 3, cost: 10000 },
            ],
          },
          {
            key: 'beta',
            name: 'Beta & launch',
            children: [
              { key: 'integrate', name: { th: 'Integration test แอป↔API', en: 'App-to-API integration test' }, duration: 4, cost: 14000 },
              { key: 'betaRun', name: { th: 'Closed beta 2 สัปดาห์ + เก็บ feedback', en: 'Closed beta for 2 weeks + collect feedback' }, duration: 14, cost: 20000 },
              { key: 'fixes', name: { th: 'แก้ bug ก้อนใหญ่จาก beta', en: 'Fix the major bugs from beta' }, duration: 6, cost: 22000 },
              { key: 'storeSub', name: { th: 'Submit ขึ้น App Store / Play Store', en: 'Submit to the App Store / Play Store' }, duration: 3, cost: 5000 },
              { key: 'launchDay', name: { th: 'เปิดตัว MVP 🚀', en: 'MVP launch 🚀' }, milestone: true },
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
      }, lang),
  },
  {
    id: 'tpl-cloud-migration',
    name: { th: 'ย้ายระบบขึ้น Cloud', en: 'Cloud migration' },
    desc: {
      th: 'ประเมินระบบเดิม ตั้ง landing zone ย้ายทีละระบบ แล้ว cutover อย่างปลอดภัย',
      en: 'Assess, land, migrate system by system, then cut over safely',
    },
    build: (lang) =>
      buildSample({
        name: { th: 'ย้ายระบบขึ้น Cloud', en: 'Cloud migration' },
        wbs: [
          {
            key: 'assess',
            name: { th: 'ประเมินและวางแผน', en: 'Assessment and planning' },
            children: [
              { key: 'inventory', name: { th: 'สำรวจระบบ/VM/ฐานข้อมูลที่ต้องย้าย', en: 'Inventory the systems, VMs and databases to migrate' }, duration: 6, cost: 40000 },
              { key: 'wavePlan', name: { th: 'จัด wave การย้ายและ rollback plan', en: 'Plan the migration waves and rollback' }, duration: 4, cost: 24000 },
              { key: 'budgetOk', name: { th: 'อนุมัติงบ migration', en: 'Approve the migration budget' }, milestone: true },
            ],
          },
          {
            key: 'landing',
            name: 'Landing zone',
            children: [
              {
                key: 'vpc',
                name: { th: 'Network และ IAM', en: 'Network and IAM' },
                children: [
                  { key: 'accountsVpc', name: { th: 'ตั้ง account/VPC/subnet', en: 'Set up accounts, VPC and subnets' }, duration: 4, cost: 18000 },
                  { key: 'iamPolicy', name: 'IAM policy + security baseline', duration: 3, cost: 12000 },
                ],
              },
              { key: 'cicdCloud', name: { th: 'Pipeline deploy ฝั่ง cloud', en: 'Cloud-side deploy pipeline' }, duration: 5, cost: 26000 },
              { key: 'monitor', name: { th: 'Monitoring/logging พื้นฐาน', en: 'Basic monitoring and logging' }, duration: 4, cost: 18000 },
            ],
          },
          {
            key: 'migrate',
            name: { th: 'ย้าย workload', en: 'Migrate the workloads' },
            children: [
              { key: 'dbReplica', name: { th: 'ตั้ง replica ฐานข้อมูล', en: 'Set up the database replica' }, duration: 6, cost: 34000 },
              {
                key: 'app1',
                name: { th: 'ย้ายระบบภายใน (intranet)', en: 'Migrate the intranet' },
                children: [
                  { key: 'assessApp1', name: 'Assess dependency + fix compatibility', duration: 3, cost: 16000 },
                  { key: 'migrateApp1', name: 'Migrate + smoke test', duration: 5, cost: 26000 },
                ],
              },
              { key: 'app2', name: { th: 'ย้ายระบบบริการลูกค้า', en: 'Migrate the customer service system' }, duration: 8, cost: 42000 },
              { key: 'dataSync', name: { th: 'Sync ข้อมูลจริงและตรวจ integrity', en: 'Sync live data and verify integrity' }, duration: 5, cost: 22000 },
            ],
          },
          {
            key: 'cutover',
            name: 'Cutover',
            children: [
              { key: 'uat', name: { th: 'UAT กับผู้ใช้จริงบน cloud', en: 'UAT with real users on the cloud' }, duration: 6, cost: 26000 },
              { key: 'freeze', name: 'Cutover weekend: switch DNS + final sync', duration: 2, cost: 30000 },
              { key: 'hypercare', name: { th: 'Hypercare 2 สัปดาห์', en: 'Two weeks of hypercare' }, duration: 14, cost: 40000 },
              { key: 'decom', name: { th: 'ปิด server เก่า', en: 'Decommission the old servers' }, duration: 3, cost: 8000 },
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
      }, lang),
  },
]
