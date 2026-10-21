# Main commands (plan §5.2 — frontend part; backend targets are added with services/api).
.PHONY: install dev dev-web dev-console gen gen-check lint typecheck test e2e build docker-web docker-console check

install:        ## install all workspace dependencies
	pnpm install

dev:            ## web (:3000) + console (:3001) with the mock API
	pnpm dev

dev-web:
	pnpm dev:web

dev-console:
	pnpm dev:console

gen:            ## tokens.json → CSS/Tailwind, OpenAPI → TS types
	pnpm gen

gen-check:      ## fail if generated code is stale (CI)
	pnpm gen:check

lint:           ## raw-color guard + ESLint everywhere
	pnpm lint

typecheck:
	pnpm typecheck

test:           ## unit + component tests (Vitest)
	pnpm test

e2e:            ## Playwright + axe (starts the dev servers itself)
	pnpm test:e2e

build:
	pnpm build

docker-web:
	docker build -f apps/web/Dockerfile -t serviceflow-web .

docker-console:
	docker build -f apps/console/Dockerfile -t serviceflow-console .

check: gen-check lint typecheck test build   ## everything CI runs before e2e
