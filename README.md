# ServiceFlow AI

ระบบรับแจ้งปัญหาผ่าน LINE และบริหารงานบริการ (Multi-tenant SaaS) — monorepo หน้าบ้าน

- `apps/web` — Dashboard ของบริษัทลูกค้า + หน้าช่างบนมือถือ (http://localhost:3000)
- `apps/console` — คอนโซลเจ้าของระบบ (http://localhost:3001)
- `packages/contracts` — OpenAPI (สัญญากับ backend) + typed client
- `packages/ui`, `packages/ui-tokens` — Design system จาก `docs/design/tokens.json`

```bash
pnpm install
pnpm dev                    # ใช้ Mock API (MSW) — ไม่ต้องมี backend
open http://localhost:3000/sign-in?tenant=smartvend
```

เอกสารทั้งหมด (การตัดสินใจ กติกา สถานะหน้า คำถามค้าง): **[docs/PROJECT.md](docs/PROJECT.md)**
