# Breakdown Planner

> เครื่องมือวางแผนงาน WBS · CPM · Gantt ทำงานในเบราว์เซอร์ ไม่ต้องต่อเซิร์ฟเวอร์

🇬🇧 [Read in English](README.md) · 📖 [คู่มือการใช้งาน](docs/user-guide.th.md) · [User guide (EN)](docs/user-guide.en.md)

Breakdown Planner วางแผนโปรเจ็คด้วย Breakdown Structure — WBS, OBS, CBS, RBS และ PBS —
ในที่เดียว จัดกำหนดการด้วย Critical Path Method ของจริง แล้ววาดออกมาเป็น Gantt Chart
ทำงานในเบราว์เซอร์ทั้งหมด ไม่มีเซิร์ฟเวอร์ ไม่มีบัญชีผู้ใช้ และไม่มีข้อมูลออกจากเครื่อง

## ความสามารถ

- **5 โครงสร้างในโปรเจ็คเดียว** — งาน (WBS), หน่วยงาน (OBS), ต้นทุน (CBS),
  ความเสี่ยง (RBS) และผลผลิต (PBS) ใช้ tree editor ตัวเดียวกัน ลากวางได้ เลื่อนระดับได้
  และเลขลำดับคำนวณสดจากตำแหน่งจริงในต้นไม้
- **งานปลายสุดคือแหล่งความจริง** — กรอกวันที่ ความคืบหน้า และต้นทุนที่งานปลายสุด
  งานแม่คำนวณ span, ความคืบหน้าถ่วงน้ำหนัก และต้นทุนรวมให้เอง
- **CPM ของจริง** — dependency FS/SS/FF/SF พร้อม lag และการกันวงจร ป้อนเข้า forward pass
  ที่วางตำแหน่งทุก bar ระบายสีแดงให้ critical path และแสดง slack ของงานที่เหลือ
- **เชื่อมข้ามโครงสร้าง** — มอบหมายงานให้หน่วยงาน ผูกต้นทุนกับหมวด ชี้ไปยังผลผลิตหรือความเสี่ยง
  แล้วเปิดอีกฝั่งเพื่อดู mini-schedule ย้อนกลับ ไม่ใช่แค่ยอดรวม
- **รายงาน** — เส้นโค้งต้นทุนสะสม (S-Curve) แยกตามหมวด และตารางความร้อน OBS × กำหนดการ
  แสดง task-days สำหรับหาคอขวด
- **สองภาษา** — ไทยและอังกฤษทั้งระบบ รวมถึงโปรเจ็คตัวอย่าง template ทั้ง 16 ชุด และคู่มือ
  วันที่เปลี่ยนตามภาษา: พ.ศ. ในภาษาไทย ค.ศ. ในภาษาอังกฤษ
- **ข้อมูลเป็นของคุณคนเดียว** — เก็บใน localStorage · ส่งออก/นำเข้า JSON เพื่อย้ายเครื่อง ·
  ส่งออก CSV เปิดใน Excel ได้โดยภาษาไทยไม่เพี้ยน

## เริ่มใช้งาน

```bash
npm install
npm run dev      # เปิด dev server ของ Vite
npm test         # รันเทสต์ด้วย vitest
npm run build    # ตรวจ type แล้ว build ลง dist/
```

ผลลัพธ์เป็น static bundle วางบนโฮสต์ไหนก็ได้ ส่วนการ deploy ขึ้น GitHub Pages ทำงานผ่าน
`.github/workflows/deploy-pages.yml` เมื่อ push เข้า `main`

เพิ่งเริ่มใช้? เปิดแอปแล้วกด **โหลดตัวอย่าง 5 โปรเจ็ค** จะได้โปรเจ็คที่วางแผนไว้ครบ
ทั้งวันที่ dependency และ critical path — แนะนำให้ดูตัวอย่างงานก่อสร้างก่อน
critical path ยาว 273 วัน และเห็น slack ของ branch รอบข้างชัดเจน

## เบื้องหลัง

Vite · React · TypeScript · Tailwind · zustand (immer + persist middleware) · date-fns
โดย CPM engine (`src/engine/`) แยกขาดจากปฏิทินและมี golden test คุมไว้ พฤติกรรมการจัด
กำหนดการจึงถูกตรึงไว้ ไม่ใช่แค่คาดเดา

```
src/
  components/   tree, gantt, inspector, links, reports, projects, layout, ui
  engine/       CPM, การจัดการต้นไม้, analytics
  model/        types, ค่าเริ่มต้น, โปรเจ็คตัวอย่าง, คลัง template
  state/        zustand store, slices, ประวัติ undo
  lib/          i18n, วันที่, ส่งออก CSV/JSON, id
docs/           คู่มือการใช้งาน ทั้งไทยและอังกฤษ
```

## ข้อจำกัด

ควรรู้ก่อนใช้งานจริง: ไม่มี backend จึงไม่มีการแชร์หรือทำงานร่วมกันแบบ real-time ·
ปฏิทินนับวันติดต่อกัน เสาร์-อาทิตย์และวันหยุดจึงนับเป็นวันทำงาน · ยังไม่มี resource
leveling และการเทียบ baseline · CSV ส่งออกได้อย่างเดียว · และโครงสร้างทั้ง 5 เป็น preset
ตายตัว รายละเอียดว่ากระทบการใช้งานอย่างไร อ่านได้ใน
[บทที่ 10 ของคู่มือ](docs/user-guide.th.md#10-แอปนี้ควบคุมงานได้จริงแค่ไหน)

## สัญญาอนุญาต

[MIT](LICENSE) — Copyright (c) 2026 Warissakorn ส่วนฟอนต์ที่แนบมา
(IBM Plex Sans Thai และ IBM Plex Mono) อยู่ภายใต้ SIL Open Font License แยกต่างหาก
ดู [NOTICE](NOTICE) และ `public/fonts/OFL.txt`
