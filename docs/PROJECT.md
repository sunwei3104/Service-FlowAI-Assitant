# ServiceFlow AI — Frontend: บันทึกโครงการ (PROJECT.md)

> เอกสารหลักของงานหน้าบ้าน จดทุกการตัดสินใจ กติกา สถานะ และคำถามที่ยังค้าง
> **อ่านไฟล์นี้ก่อนแก้โครงสร้างทุกครั้ง** และอัปเดตทุกครั้งที่ตัดสินใจอะไรใหม่
> แหล่งอ้างอิงหลัก: `docs/ServiceFlow-AI-Engineering-Plan-v1.1.docx` (เรียกสั้น ๆ ว่า "แผน §x")

อัปเดตล่าสุด: 2026-10-22

---

## 1. ภาพรวม

- ระบบรับแจ้งปัญหาผ่าน LINE แบบ Multi-tenant SaaS (แผน §1)
- **ช่วงนี้ทำหน้าบ้านก่อน** backend (Go) ทำทีหลัง หน้าบ้านจึงคุยกับ **Mock API (MSW)** ที่ตอบตาม `openapi.yaml`
- พอ backend เสร็จ: ตั้ง `NEXT_PUBLIC_API_MOCKING=disabled` แล้วชี้ `/api` ไปที่ services/api **โดยไม่ต้องแก้ service หรือหน้าใด ๆ**

| แอป            | ผู้ใช้                                                              | พอร์ต dev | API                                                       |
| -------------- | ------------------------------------------------------------------- | --------- | --------------------------------------------------------- |
| `apps/web`     | Owner/Admin/Viewer (desktop) + ช่าง (มือถือ, route group `(field)`) | 3000      | `/api/v1` ← `packages/contracts/openapi.yaml`             |
| `apps/console` | เจ้าของระบบและทีม ServiceFlow                                       | 3001      | `/console/v1` ← `packages/contracts/console.openapi.yaml` |

---

## 2. การตัดสินใจ (Decision log)

| #   | เรื่อง                                | ข้อตัดสินใจ                                                                                                                                                                                    | ใครตัดสิน                    | อ้างอิง         |
| --- | ------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------- | --------------- |
| D1  | แยกแอป                                | 2 แอป: `apps/web` (Admin + ช่าง) และ `apps/console` (เจ้าของระบบ)                                                                                                                              | เจ้าของโปรเจกต์              | แผน §4.2, §22.1 |
| D2  | ข้อมูลระหว่างรอ backend               | ร่าง `openapi.yaml` + `console.openapi.yaml` จากแบบ แล้วใช้ MSW mock; backend ใช้ spec เดียวกันเป็นสัญญา                                                                                       | เจ้าของโปรเจกต์              | แผน §7.1        |
| D3  | Design tokens                         | `docs/design/tokens.json` (v2) เป็นแหล่งเดียว → CSS variables + Tailwind theme; **ห้ามใช้ hex ในโค้ด** สีที่ไม่มีใน tokens ต้องถามก่อน                                                         | เจ้าของโปรเจกต์              | แผน §21.7       |
| D4  | หน้าที่ไม่มีแบบ                       | ทำ route เป็นหน้า "เร็ว ๆ นี้" ด้วย `EmptyState` ตัวเดียวกัน เมนูยังกดได้ ไม่ออกแบบเอง                                                                                                         | เจ้าของโปรเจกต์              | —               |
| D5  | ขนาดหน้าช่าง                          | ตั้งใจให้เป็นมือถือ (390px); route group `(field)` ใช้ header + เมนูล่าง; หน้าอื่นใช้ AppShell desktop ที่ย่อได้                                                                               | เจ้าของโปรเจกต์              | แผน §21.5       |
| D6  | โครงสร้าง monorepo                    | ตามแผน §5: `apps/*`, `packages/{contracts,ui,ui-tokens}` + pnpm workspace + Makefile (ไม่เพิ่ม Turborepo เพราะไม่อยู่ในสเปค)                                                                   | ตามแผน                       | แผน §5          |
| D7  | เวอร์ชันไลบรารี                       | ล็อกเวอร์ชันตรงตัว (exact) เลือกตัวที่เสถียร: Next 16.4, React 19.3, Tailwind 4.3, TS 5.9 (ไม่ใช้ TS 7 เพราะ openapi-typescript/typescript-eslint ยังไม่รองรับ), MSW 2.x, Vitest 4.1, ESLint 9 | ผู้พัฒนา (ตามความเข้ากันได้) | —               |
| D8  | ปิดสี default ของ Tailwind            | `theme.css` ใส่ `--color-*: initial` ใช้ได้เฉพาะสีจาก tokens; `bg-blue-500` จะไม่ทำงาน + มีสคริปต์ `scripts/check-design-tokens.mjs` ตรวจ hex/rgb/palette ใน CI                                | ผู้พัฒนา (บังคับ D3)         | —               |
| D9  | ฟอนต์                                 | `next/font/google` (self-host ตอน build) IBM Plex Sans Thai + IBM Plex Mono ผูกกับ token `--font-sans/--font-mono`                                                                             | ผู้พัฒนา                     | สเปค            |
| D10 | ไลบรารีตรวจ JWT ของ Cloudflare Access | `jose` (คอนโซลต้องตรวจ aud/iss ทุกคำขอ — แผน §22.3) fail-closed                                                                                                                                | ผู้พัฒนา                     | แผน §22.3       |

### 2.1 การแมปคลาสของ shadcn → tokens (อัตโนมัติด้วย `ui:add`)

shadcn ใช้คลาสมาตรฐาน Tailwind ที่ถูกปิดไป จึงแปลงเป็น token ที่ใกล้ที่สุด (`packages/ui/scripts/shadcn-postprocess.mjs`):

| shadcn                    | ServiceFlow               |
| ------------------------- | ------------------------- |
| `text-xs`                 | `text-caption` (12/18)    |
| `text-sm`, `text-base`    | `text-body` (14/21)       |
| `text-lg`                 | `text-card-title` (17/26) |
| `shadow-xs` / `shadow-lg` | `shadow-sm` / `shadow-md` |
| `bg-black/50` (overlay)   | `bg-navy/50`              |
| `text-white`              | `text-on-primary`         |

และชื่อ semantic ของ shadcn (`bg-background`, `text-muted-foreground` ฯลฯ) เป็น **alias** ไปยัง token ใน `packages/ui/src/styles/globals.css` (ไม่ใช่สีใหม่)

---

## 3. โครงสร้างโฟลเดอร์

```
ServiceFlowAiAssitant/
├── apps/
│   ├── web/                         # Next.js — Admin/Owner/Viewer + ช่าง (PWA)
│   │   ├── src/app/
│   │   │   ├── (auth)/sign-in/      # เข้าสู่ระบบ (LINE / Google)
│   │   │   ├── (dashboard)/[tenant]/   # desktop: ภาพรวม, tickets, assets, knowledge, line, reports, settings(/team)
│   │   │   ├── (field)/[tenant]/       # มือถือช่าง: jobs, jobs/[id], scan, history, account
│   │   │   ├── manifest.ts          # PWA manifest (สีจาก tokens)
│   │   │   └── layout / error / not-found / global-error
│   │   ├── src/config/              # env (zod), routes, navigation, permissions, api(ชื่อ cookie/header)
│   │   ├── src/features/<domain>/   # ★ service layer ต่อโดเมน: api.ts (query keys + queries + mutations) + components/
│   │   ├── src/lib/api/             # client.ts (typed openapi-fetch), query-client, useIdempotencyKey
│   │   ├── src/components/          # glue ของแอป: shell, TenantGate, RequirePermission, QueryErrorState, ComingSoon, PagePending
│   │   ├── src/mocks/               # MSW: db.ts (state เดียว), fixtures/, handlers/, browser.ts, server.ts, mock-gate
│   │   ├── src/i18n/request.ts      # next-intl (th, Asia/Bangkok)
│   │   ├── src/proxy.ts             # Next 16 proxy: ไม่มี session cookie → /sign-in (optimistic)
│   │   ├── messages/th.json         # ข้อความภาษาไทยทั้งหมด
│   │   ├── tests/e2e/               # Playwright + axe
│   │   └── Dockerfile               # standalone
│   └── console/                     # Next.js — คอนโซลเจ้าของระบบ (โครงเดียวกับ web)
│       ├── src/app/(console)/       # /, tenants, tenants/[id], system, ai, support-access, audit
│       ├── src/lib/cf-access.ts     # ตรวจ JWT ของ Cloudflare Access (มี unit test)
│       └── src/proxy.ts             # บังคับ Cloudflare Access ทุกคำขอ (ยกเว้น APP_ENV=local)
├── packages/
│   ├── contracts/                   # ★ สัญญา API
│   │   ├── openapi.yaml             # API ลูกค้า (DRAFT — backend ต้องรีวิว)
│   │   ├── console.openapi.yaml     # Console API (DRAFT)
│   │   ├── gen/ts/                  # type ที่ generate (ห้ามแก้มือ)
│   │   ├── src/http.ts              # createApiClient, unwrap, ApiError, CSRF, shouldRetry
│   │   └── redocly.yaml             # กฎ lint ของ spec
│   ├── ui/                          # component ที่ใช้ร่วม web + console
│   │   ├── src/components/ui/       # shadcn primitives (ผ่าน postprocess แล้ว)
│   │   ├── src/components/shell/    # AppShell, Sidebar*, Topbar*, PageMain, FieldShell, FieldBottomNav
│   │   ├── src/components/states/   # EmptyState, ErrorState, ForbiddenState
│   │   ├── src/components/icons/    # ไอคอนจากแบบ (path ตรงตามแบบ) + LogoMark
│   │   ├── src/components/feedback/ # SampleDataChip
│   │   ├── src/lib/                 # cn, initials
│   │   └── src/styles/globals.css   # Tailwind + tokens + shadcn alias + base (focus ring, link)
│   └── ui-tokens/
│       ├── scripts/build.mjs        # tokens.json → tokens.css / theme.css / tokens.ts (+ ตรวจความถูกต้อง)
│       └── src/generated/           # ห้ามแก้มือ
├── docs/
│   ├── PROJECT.md                   # ← ไฟล์นี้
│   ├── adr/                         # Architecture Decision Records
│   ├── design/
│   │   ├── tokens.json              # ★ แหล่งเดียวของสี/ฟอนต์/ระยะ
│   │   ├── html/<Page>.html         # แบบแยกรายหน้า (อ่านง่าย แตกจาก bundle)
│   │   ├── png/<Page>.png           # ภาพอ้างอิง
│   │   └── source/{web,console}/    # ไฟล์ต้นฉบับที่ได้รับ (bundle HTML + zip)
│   └── ServiceFlow-AI-Engineering-Plan-v1.1.docx
├── scripts/check-design-tokens.mjs  # กัน hex/rgb/palette ในโค้ด
├── .github/workflows/ci.yml
├── Makefile · package.json · pnpm-workspace.yaml · tsconfig.base.json · .prettierrc.json
└── CLAUDE.md · README.md
```

### ชื่อไฟล์แบบ ↔ หน้า ↔ route

| แบบ (docs/design/html) | หน้า                       | Route                         | Service                                     |
| ---------------------- | -------------------------- | ----------------------------- | ------------------------------------------- |
| SignIn                 | เข้าสู่ระบบ                | web `/sign-in`                | `features/auth`                             |
| Main                   | ภาพรวม (Admin)             | web `/[tenant]`               | `reports`, `tickets`, `line`                |
| Tickets                | รายการ Ticket              | web `/[tenant]/tickets`       | `tickets`                                   |
| TicketDetail           | รายละเอียด Ticket          | web `/[tenant]/tickets/[id]`  | `tickets`                                   |
| Assets                 | เครื่อง / อุปกรณ์ + นำเข้า | web `/[tenant]/assets`        | `assets`                                    |
| Knowledge              | ฐานความรู้ + ทดลองถาม AI   | web `/[tenant]/knowledge`     | `knowledge`                                 |
| LineSettings           | LINE OA และประเภทปัญหา     | web `/[tenant]/line`          | `line`                                      |
| Team                   | ทีมงานและสิทธิ์            | web `/[tenant]/settings/team` | `team`                                      |
| Reports                | รายงานและการใช้งาน         | web `/[tenant]/reports`       | `reports`                                   |
| TechJobs               | ช่าง: งานของฉัน            | web `/[tenant]/jobs`          | `tickets` (assignee=me), `field`, `session` |
| TechJob                | ช่าง: รายละเอียดงาน        | web `/[tenant]/jobs/[id]`     | `tickets`, `field`                          |
| OpsOverview            | ภาพรวมแพลตฟอร์ม            | console `/`                   | `overview`                                  |
| OpsTenants             | บริษัทลูกค้า               | console `/tenants`            | `tenants`                                   |
| OpsTenantDetail        | รายละเอียดบริษัทลูกค้า     | console `/tenants/[id]`       | `tenants`                                   |
| OpsSystem              | สุขภาพระบบและต้นทุน        | console `/system`             | `system`                                    |

---

## 4. กติกา (ห้ามละเมิด)

1. **สี/ฟอนต์/ระยะ/มุม/เงา มาจาก tokens เท่านั้น** — ห้าม hex/rgb, ห้าม `bg-blue-500`, ห้าม `bg-[#...]`. เจอสีที่ไม่มีใน tokens → **ถามเจ้าของโปรเจกต์ก่อน** แล้วเพิ่มใน `tokens.json` → `pnpm gen`
2. **ห้ามคัดลอก inline style จากแบบตรง ๆ** แปลงเป็น Tailwind class ที่ผูก token
3. **เรียก API ผ่าน `src/lib/api/client.ts` เท่านั้น** (ESLint ห้าม `fetch` ตรง) และเรียกจาก **service ใน `features/<domain>/api.ts`** — component ไม่เรียก `api.GET` เอง
4. **แก้ API เริ่มที่ spec** (`packages/contracts/*.yaml`) → `pnpm gen` → แก้ service/mock → แก้หน้า. ห้ามแก้ `gen/` มือ
5. **ข้อความที่ผู้ใช้เห็นอยู่ใน `messages/th.json`** ห้ามพิมพ์ภาษาไทยในโค้ด (ยกเว้น `global-error.tsx` ที่ไม่มี i18n และ fixture ของ mock)
6. **URL สร้างจาก `config/routes.ts`** ห้ามเขียน path ในคอมโพเนนต์
7. **ทุกหน้าที่ดึงข้อมูลต้องมีครบ 4 สถานะ**: Loading / Empty / Error (`QueryErrorState`) / Forbidden (แผน §21.1)
8. **POST ที่สร้างข้อมูลส่ง `Idempotency-Key`** (`useIdempotencyKey`) และ **แก้ข้อมูลที่มี version ส่ง `If-Match`**
9. **apps/web กับ apps/console ห้าม import กันเอง** ใช้ร่วมผ่าน `packages/*` เท่านั้น (ESLint บังคับ)
10. **การซ่อนปุ่มตามสิทธิ์เป็นแค่ความสะดวก** — API ตรวจซ้ำทุกครั้ง (แผน §8.3)
11. **Mock ต้องตรง contract**: fixture พิมพ์ type จาก `Schemas[...]` state อยู่ใน `mocks/db.ts` ที่เดียว (reset ทุกเทสต์)
12. **Accessibility WCAG 2.1 AA**: ทุก E2E เรียก `expectNoA11yViolations` (axe); เป้าสัมผัส ≥ 44px; ไอคอนอย่างเดียวต้องมีชื่อ; ห้ามใช้ `aria-label` ที่ไม่มีข้อความที่มองเห็น (WCAG 2.5.3)

---

## 5. วิธีทำงาน

### รัน

```bash
pnpm install
cp apps/web/.env.example apps/web/.env.local          # (ทำไว้แล้ว) mock เปิดอยู่
cp apps/console/.env.example apps/console/.env.local
pnpm dev           # web :3000 + console :3001
# เปิด http://localhost:3000/sign-in?tenant=smartvend  → กด "เข้าสู่ระบบด้วย LINE" (mock) → /smartvend
# ดูมุมมองช่าง: http://localhost:3000/smartvend/jobs
# เปลี่ยนผู้ใช้ mock เป็นช่าง: แก้ mockSession ใน apps/web/src/mocks/fixtures/people.ts
```

### คำสั่ง

| คำสั่ง                                                          | ทำอะไร                                                 |
| --------------------------------------------------------------- | ------------------------------------------------------ |
| `pnpm gen`                                                      | tokens.json → CSS/Tailwind/TS และ OpenAPI → TS types   |
| `pnpm lint`                                                     | ตรวจ hex/palette + ESLint ทุกแพ็กเกจ                   |
| `pnpm typecheck` / `pnpm test` / `pnpm test:e2e` / `pnpm build` | ตามชื่อ                                                |
| `pnpm --filter @serviceflow/ui ui:add <name>`                   | เพิ่ม shadcn component (แก้ import/class ให้อัตโนมัติ) |
| `make check`                                                    | สิ่งที่ CI รัน                                         |
| `make docker-web` / `make docker-console`                       | สร้าง image (build จาก root)                           |

### สร้างหน้าใหม่ตามแบบ (ขั้นตอนมาตรฐาน)

1. เปิด `docs/design/html/<Page>.html` + `docs/design/png/<Page>.png`
2. ตรวจว่าสี/ขนาดตัวอักษรทุกค่ามีใน tokens (`node scripts/...` หรือดูตาราง §7) — ไม่มี → ถาม
3. ตรวจว่า service/endpoint ที่หน้าใช้มีครบใน `features/<domain>/api.ts` และ mock — ไม่ครบ → แก้ spec ก่อน (กติกา 4)
4. แตก component: ของที่ใช้หลายหน้า → `packages/ui`; เฉพาะหน้า → `features/<domain>/components`
5. แทน `<PagePending>` ใน `page.tsx` ด้วยหน้าจริง ข้อความลง `messages/th.json`
6. เขียน component test (Vitest + MSW) และ E2E + axe
7. เปิดหน้าเทียบกับ PNG (1440px desktop / 390px มือถือ) แล้ว **จดจุดที่ยังไม่ตรงในตาราง §6**

### เปลี่ยนจาก mock เป็น backend จริง

1. backend implement ตาม `openapi.yaml` (ลบ `x-draft-note` เมื่อยืนยันแล้ว)
2. ตั้ง `NEXT_PUBLIC_API_MOCKING=disabled` และ (dev) `API_ORIGIN=http://localhost:8080`
3. ไม่ต้องแก้ service/หน้า — ถ้า response ไม่ตรง spec ให้แก้ที่ backend หรือ spec (ไม่ใช่หน้าบ้าน)

---

## 6. สถานะหน้าจอ

| หน้า                                                                        | สถานะ                                        | จุดที่ยังไม่ตรงแบบ / หมายเหตุ                                                                                                                |
| --------------------------------------------------------------------------- | -------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| Shell desktop (web)                                                         | ✅ ตามแบบ (เทียบ Main.png แล้ว)              | ตัวย่อชื่อบริษัทได้ "สม" แบบเขียน "สว" (Q8) · กระดิ่งไม่มีตัวเลข (ไม่มี API การแจ้งเตือน, Q6) · เมนูบัญชีมีแค่ "ออกจากระบบ" (Q7)             |
| Shell มือถือ (field)                                                        | ✅ เมนูล่างตามแบบ (TechJobs.png)             | header ของแต่ละหน้าช่างยังไม่ทำ (ทำพร้อมหน้า TechJobs/TechJob)                                                                               |
| Shell console                                                               | ✅ ตามแบบ (OpsOverview.png)                  | ป้าย "ข้อมูลตัวอย่าง" แสดงเมื่อใช้ mock (console API ไม่มี flag demo)                                                                        |
| SignIn                                                                      | ✅ ตามแบบ (เทียบ SignIn.png แล้ว)            | บรรทัด "พื้นที่ทำงาน" แสดงเมื่อมี `?tenant=` เท่านั้น (ต้องมี endpoint สาธารณะ, Q5) · ขนาดตัวอักษร 15/16/20/28/36px ยังไม่อยู่ใน tokens (Q1) |
| Main, Tickets, TicketDetail, Assets, Knowledge, LineSettings, Team, Reports | ⏳ โครง + service + mock พร้อม (PagePending) | รอสร้าง UI ตามแบบทีละหน้า                                                                                                                    |
| TechJobs, TechJob                                                           | ⏳ โครง + service + mock พร้อม               | ต้องตอบ Q2 (สี 2 ค่า) ก่อนทำ TechJobs                                                                                                        |
| OpsOverview, OpsTenants, OpsTenantDetail, OpsSystem                         | ⏳ โครง + service + mock พร้อม               |                                                                                                                                              |
| ตั้งค่า, สแกน QR, ประวัติ, บัญชี, AI และต้นทุน                              | 🕓 "เร็ว ๆ นี้" (D4)                         |                                                                                                                                              |
| การเข้าช่วยเหลือ, Audit log (console)                                       | 🕓 "เร็ว ๆ นี้" ชั่วคราว                     | **รอยืนยัน (Q3)**                                                                                                                            |

---

## 7. คำถามค้าง (ต้องให้เจ้าของโปรเจกต์ตัดสิน)

| #   | คำถาม                                                                                                                                                                                                         | ผลกระทบ                             | ตอนนี้ทำไว้แบบไหน                                                                                          |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| Q1  | ขนาดตัวอักษรในแบบ **11 ค่าไม่อยู่ใน tokens**: 15, 16, 18, 20, 21, 22, 24, 28, 30, 32, 36px (tokens มีแค่ 12/13/14/17/26/34) — เพิ่มเป็น type style ใน tokens.json ไหม?                                        | ทุกหน้า                             | ใช้ค่าตรง `text-[16px]` ชั่วคราวเฉพาะที่จำเป็น (shell, SignIn) พร้อมคอมเมนต์                               |
| Q2  | **สี 2 ค่าไม่อยู่ใน tokens** (หน้า TechJobs): `#F87171` จุดแจ้งเตือนบน header ดำ, `#22C55E` สวิตช์ "พร้อมรับงานใหม่" — เพิ่ม token หรือใช้ token เดิม (`danger-ink` dark / `success`)?                        | TechJobs                            | ยังไม่ทำหน้า                                                                                               |
| Q3  | เมนูคอนโซล "การเข้าช่วยเหลือ" และ "Audit log" ไม่มีแบบ (ในแบบลิงก์ไป OpsTenantDetail / OpsSystem) — ให้เป็น "เร็ว ๆ นี้" เหมือนข้ออื่นไหม? (แผน §22.6 มีหน้า `audit`)                                         | console                             | ทำเป็น "เร็ว ๆ นี้" ไว้ก่อน                                                                                |
| Q4  | หน้า Tickets ในแบบใช้ **เลขหน้า** ("แสดง 1–10 จาก 23", 1 2 3) แต่แผน §7.2 กำหนด **cursor pagination** (ข้ามไปหน้า 3 ไม่ได้) — ใช้แบบไหน?                                                                      | Tickets, Assets, Knowledge, Tenants | spec เป็น cursor ตามแผน                                                                                    |
| Q5  | หน้าเข้าสู่ระบบโชว์ชื่อบริษัทก่อน login ต้องมี endpoint สาธารณะ (ร่างไว้ `GET /workspaces/{slug}/public`) — มีความเสี่ยงให้คนเดาชื่อบริษัทได้ (ต้อง rate-limit) รับได้ไหม หรือให้ลิงก์เชิญฝังชื่อบริษัทมาเอง? | SignIn                              | ร่าง endpoint + mock                                                                                       |
| Q6  | กระดิ่งแจ้งเตือน (แบบโชว์ "3 รายการ") — แผนไม่มี API การแจ้งเตือน ต้องการไหม/แสดงอะไร?                                                                                                                        | Shell                               | ปุ่มไม่มีตัวเลข                                                                                            |
| Q7  | เมนูของปุ่มโปรไฟล์ (มุมขวาบน) ไม่มีแบบ — มีอะไรบ้าง?                                                                                                                                                          | Shell                               | มีแค่ "ออกจากระบบ" (จำเป็นต้องมีทางออกจากระบบ)                                                             |
| Q8  | ตัวย่อชื่อในแบบไม่สม่ำเสมอ (นภา→นภ, ทินกร→ทก, สมาร์ทเวนด์→สว) — ใช้กฎไหน? หรือให้ backend ส่งมา                                                                                                               | Shell                               | กฎ "พยัญชนะ 2 ตัวแรก"                                                                                      |
| Q9  | **State machine ของ Ticket** (เปลี่ยนจากสถานะไหนไปไหนได้) แผนระบุว่ามีแต่ไม่ได้ให้ตาราง                                                                                                                       | Ticket, ช่าง                        | mock ตรวจแค่: ต้อง If-Match, ห้ามเปลี่ยนเป็นสถานะเดิม, รอ = ต้องระบุเหตุผล, ปิดงานต้องมีรูปถ้าประเภทบังคับ |
| Q10 | เมนู "ตั้งค่า" ในแบบลิงก์ไป LineSettings (ซ้ำกับ LINE OA) — ตอนนี้เป็น "เร็ว ๆ นี้" ตาม D4 ใครเห็นเมนูนี้ได้ (ตอนนี้ Owner/Admin)?                                                                            | Shell                               | Owner/Admin                                                                                                |
| Q11 | ค่าบางอย่างในแบบไม่อยู่ใน tokens แต่ไม่ใช่สี: max-width 1240px (หน้า Main; tokens = 1320), radius 6px (ชิปบริษัท), ระยะ 14/26/38px — ใช้ค่าตามแบบตรง ๆ (arbitrary) ได้ไหม หรือปัดเข้า scale?                  | หลายหน้า                            | ใช้ค่าตามแบบ                                                                                               |
| Q12 | หน้า "ยืนยัน Passkey" ของคอนโซลไม่มีแบบ (แผน §22.3 บังคับ)                                                                                                                                                    | console                             | แสดง ForbiddenState "ต้องยืนยันตัวตนด้วย Passkey"                                                          |
| Q13 | ชื่อ cookie CSRF (`sf_csrf`, `sf_console_csrf`) — แผนบอกแค่ double-submit ไม่ได้ระบุชื่อ                                                                                                                      | backend                             | ตั้งชื่อไว้ใน `config/api.ts` รอ backend ยืนยัน                                                            |

### Endpoint ที่หน้าบ้านเพิ่มใน spec (ไม่อยู่ในตาราง 17/18 ของแผน — `x-draft-note`)

`PUT /me/availability`, `GET /tickets/counts`, `GET /tickets/export`, `POST /tickets/bulk-assign`, `GET /tickets/{id}/assignee-suggestions`, `PUT /imports/{id}/mapping`, `POST /imports/{id}/confirm`, `GET /reports/export`, `GET /workspaces/{slug}/public`, console `GET /me`, `GET /tenants/{id}/support-access-requests`, `GET /audit`
→ ทั้งหมดมาจากสิ่งที่แบบต้องใช้ backend ต้องรีวิว

---

## 8. ความปลอดภัยที่ทำแล้วในหน้าบ้าน

- **TenantGate**: URL `/[tenant]` ต้องตรงกับ active tenant ใน session ก่อนโหลดข้อมูลใด ๆ (ไม่งั้นข้อมูลบริษัท A อาจแสดงใต้ URL บริษัท B) และ slug ที่ไม่ใช่สมาชิก → ForbiddenState (มีเทสต์)
- สลับบริษัท → ลบ cache ของบริษัทเดิมทั้งหมด
- **Open-redirect guard** `safeReturnTo` (มีเทสต์)
- CSRF header อัตโนมัติทุก POST/PUT/PATCH/DELETE; 401 → กลับหน้า sign-in
- **Console**: ตรวจ Cloudflare Access JWT (ลายเซ็น/aud/iss/หมดอายุ) ทุกคำขอ fail-closed (มีเทสต์ 6 กรณี); cookie/session แยกจาก web; `noindex`
- Mock ถูกปฏิเสธตอน build ถ้า `APP_ENV=production`; โค้ด mock ไม่ถูก bundle เมื่อปิด mock; `mockServiceWorker.js` ถูกลบจาก image เมื่อปิด mock
- Security headers พื้นฐาน (nosniff, frame DENY, referrer, permissions) — HSTS/CSP ให้ Caddy ใส่ (แผน §9.4)
- ไม่มี secret ใน repo; `.env*` ถูก ignore (ยกเว้น `.env.example`)

---

## 9. ผลตรวจล่าสุด (2026-10-22)

| ตรวจ                            | ผล                                                 |
| ------------------------------- | -------------------------------------------------- |
| `pnpm lint` (guard สี + ESLint) | ✅ ผ่าน                                            |
| `pnpm typecheck`                | ✅ ผ่าน                                            |
| Unit/Component (Vitest)         | ✅ 34 เทสต์ (contracts 6, ui 3, web 19, console 6) |
| E2E + axe (Playwright)          | ✅ web 5, console 1 — ไม่มี a11y violation         |
| `next build` ทั้ง 2 แอป         | ✅                                                 |
| Docker image web (standalone)   | ✅ build + รันได้ `/sign-in` 200                   |
| OpenAPI lint (Redocly)          | ✅ 0 error 0 warning                               |

### บทเรียน/บั๊กที่เจอและแก้แล้ว (ทบทวนตัวเอง)

- shadcn CLI ใส่ import `cn` จากแพ็กเกจ npm ชื่อ "cn" (ผิด) → แก้ + ทำ `ui:add` ให้แก้อัตโนมัติ
- MSW `worker.start()` ถูกเรียกซ้ำใน React StrictMode → หน้าว่าง → ทำ start ครั้งเดียว + แสดง error แทนหน้าว่าง
- openapi-fetch จับ `fetch` ตอนสร้าง client ทำให้ MSW ในเทสต์ไม่ทำงาน → resolve `fetch` ตอนเรียก
- `queryClient.clear()` ตอนสลับบริษัทลบ query `me` ที่กำลังถูกใช้ → ลบเฉพาะข้อมูลของบริษัท
- axe เจอ: ลิงก์ในข้อความไม่มีขีดเส้นใต้ + ปุ่มที่ `aria-label` ไม่ตรงข้อความที่เห็น (ปัญหานี้มีในแบบเองด้วย) → แก้แล้ว
- mock state กระจายหลายไฟล์ทำให้เทสต์รั่ว → รวมไว้ `mocks/db.ts`

---

## 10. Changelog

- **2026-10-22** — สร้าง monorepo, tokens pipeline, ร่าง contracts ทั้ง 2 ไฟล์, service layer ครบทุก endpoint, MSW mock, shell ทั้ง 3 แบบ, หน้า SignIn, หน้า "เร็ว ๆ นี้", เทสต์ + CI + Docker
