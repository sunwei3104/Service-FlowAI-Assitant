# ADR-0001: Monorepo (pnpm workspace)

- Status: Accepted (plan §3.5, §5) · 2026-10-22
- Context: Spec, frontend (2 apps) and later the Go backend must change together and be checked by one CI.
- Decision: One repository. pnpm workspace with `apps/web`, `apps/console`, `packages/{contracts,ui,ui-tokens}`; `services/api` (Go) joins later. Root `Makefile` + pnpm scripts; no Turborepo (not in the spec — revisit if CI gets slow).
- Consequences: apps share code only through packages (ESLint blocks app→app imports). Generated code (`packages/contracts/gen`, `packages/ui-tokens/src/generated`) is committed and checked fresh in CI (`pnpm gen:check`).
