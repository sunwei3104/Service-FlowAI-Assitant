# ServiceFlow AI — project rules (frontend phase)

Read `docs/PROJECT.md` first (decisions, rules, open questions). Plan of record: `docs/ServiceFlow-AI-Engineering-Plan-v1.1.docx`.

- Never decide on your own when something is unclear — ask the owner, then record the answer in docs/PROJECT.md §2/§7.
- Colors/fonts/spacing come ONLY from `docs/design/tokens.json` (→ `pnpm gen`). No hex/rgb, no Tailwind default palette, no `bg-[#…]`. A color not in tokens → ask first.
- Pages follow `docs/design/html/<Page>.html` + `docs/design/png/<Page>.png` exactly. Do not copy inline styles; map to token classes. After building a page, screenshot it next to the PNG and list remaining differences in docs/PROJECT.md §6.
- API changes start in `packages/contracts/*.yaml` → `pnpm gen` → service (`apps/*/src/features/<domain>/api.ts`) → mock (`src/mocks`) → page. Never edit `gen/` or `src/generated/`.
- Components never call `api.*` directly; they use the domain service hooks. No raw `fetch` (ESLint enforces).
- User-facing text lives in `apps/*/messages/th.json`. URLs come from `src/config/routes.ts`.
- Every data page has Loading / Empty / Error / Forbidden states. POST that creates → Idempotency-Key; versioned update → If-Match.
- apps/web and apps/console never import each other; share via `packages/*`.
- Add shadcn components with `pnpm --filter @serviceflow/ui ui:add <name>` (fixes imports/classes).
- Before finishing: `pnpm lint && pnpm typecheck && pnpm test` (and `pnpm test:e2e` for UI changes — includes axe).
