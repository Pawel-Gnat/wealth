# syntax=docker/dockerfile:1

FROM node:22-alpine AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable && corepack prepare pnpm@10.33.0 --activate

FROM base AS build
WORKDIR /app

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml .npmrc ./
COPY apps/backend/package.json ./apps/backend/
COPY packages/api/package.json ./packages/api/
COPY packages/common/package.json ./packages/common/
COPY packages/observability/package.json ./packages/observability/
COPY packages/biome-config/package.json ./packages/biome-config/
COPY packages/tsdown-config/package.json ./packages/tsdown-config/
COPY packages/typescript-config/package.json ./packages/typescript-config/

RUN --mount=type=secret,id=NODE_AUTH_TOKEN \
	TOKEN="$(cat /run/secrets/NODE_AUTH_TOKEN)" \
	&& test -n "$TOKEN" \
	&& CI=true NODE_AUTH_TOKEN="$TOKEN" pnpm install --frozen-lockfile --filter backend...

COPY apps/backend ./apps/backend
COPY packages/api ./packages/api
COPY packages/common ./packages/common
COPY packages/observability ./packages/observability
COPY packages/biome-config ./packages/biome-config
COPY packages/tsdown-config ./packages/tsdown-config
COPY packages/typescript-config ./packages/typescript-config

RUN pnpm --filter @repo/common build \
	&& pnpm --filter @repo/api build \
	&& pnpm --filter @repo/observability build \
	&& pnpm --filter backend build

RUN CI=true pnpm --filter backend --prod deploy --legacy /prod/backend

FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production

RUN addgroup -S nodejs && adduser -S nestjs -G nodejs
COPY --from=build --chown=nestjs:nodejs /prod/backend ./

USER nestjs
EXPOSE 4000
CMD ["node", "scripts/docker-entrypoint.mjs"]
