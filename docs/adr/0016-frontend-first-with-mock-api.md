# ADR-0016: Frontend first against a draft OpenAPI + MSW

- Status: Accepted (owner decision D2) · 2026-10-22
- Context: The backend is built after the frontend. Pages still need realistic data, and the switch to the real API must not require rewriting services.
- Decision: The frontend drafts `openapi.yaml` / `console.openapi.yaml` from the designs (items not in the plan carry `x-draft-note`). Types come from openapi-typescript; requests go through openapi-fetch. MSW answers the same paths in the browser (dev) and in Vitest. `NEXT_PUBLIC_API_MOCKING=enabled|disabled` switches; mocking is refused when `APP_ENV=production` and is tree-shaken when disabled.
- Consequences: The backend implements the reviewed spec (design-first, plan §7.1). Mock fixtures are typed by the contract, so a spec change breaks the mock at compile time instead of silently drifting.
