# syntax=docker/dockerfile:1.7
# apps/web — Next.js standalone image. Build from the REPO ROOT:
#   docker build -f apps/web/Dockerfile -t serviceflow-web .
# NEXT_PUBLIC_* values are inlined at build time, so they are build args.

FROM node:24-alpine AS base
ENV PNPM_HOME=/pnpm PATH=/pnpm:$PATH NEXT_TELEMETRY_DISABLED=1
RUN corepack enable
WORKDIR /repo

FROM base AS deps
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY apps/web/package.json apps/web/
COPY packages/contracts/package.json packages/contracts/
COPY packages/ui/package.json packages/ui/
COPY packages/ui-tokens/package.json packages/ui-tokens/
RUN --mount=type=cache,id=pnpm,target=/pnpm/store \
    pnpm install --frozen-lockfile --filter "@serviceflow/web..."

FROM deps AS build
COPY tsconfig.base.json ./
COPY docs/design/tokens.json docs/design/tokens.json
COPY packages packages
COPY apps/web apps/web
ARG APP_ENV=production
ARG NEXT_PUBLIC_API_MOCKING=disabled
ENV APP_ENV=$APP_ENV NEXT_PUBLIC_API_MOCKING=$NEXT_PUBLIC_API_MOCKING
RUN pnpm --filter @serviceflow/ui-tokens gen \
 && pnpm --filter @serviceflow/web build \
 && if [ "$NEXT_PUBLIC_API_MOCKING" != "enabled" ]; then rm -f apps/web/public/mockServiceWorker.js; fi

FROM node:24-alpine AS runner
ENV NODE_ENV=production NEXT_TELEMETRY_DISABLED=1 PORT=3000 HOSTNAME=0.0.0.0
WORKDIR /app
COPY --from=build --chown=node:node /repo/apps/web/.next/standalone ./
COPY --from=build --chown=node:node /repo/apps/web/.next/static ./apps/web/.next/static
COPY --from=build --chown=node:node /repo/apps/web/public ./apps/web/public
USER node
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=3s CMD wget -qO- http://127.0.0.1:3000/ >/dev/null 2>&1 || exit 1
CMD ["node", "apps/web/server.js"]
