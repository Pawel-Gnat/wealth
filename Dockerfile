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
COPY packages/biome-config/package.json ./packages/biome-config/
COPY packages/typescript-config/package.json ./packages/typescript-config/
COPY packages/emails/package.json ./packages/emails/

RUN --mount=type=secret,id=NODE_AUTH_TOKEN \
	NODE_AUTH_TOKEN="$(cat /run/secrets/NODE_AUTH_TOKEN)" \
	pnpm install --frozen-lockfile --filter backend...

COPY apps/backend ./apps/backend
COPY packages/api ./packages/api
COPY packages/common ./packages/common
COPY packages/biome-config ./packages/biome-config
COPY packages/typescript-config ./packages/typescript-config

RUN pnpm --filter @repo/common build \
	&& pnpm --filter @repo/api build \
	&& pnpm --filter backend build

RUN pnpm --filter backend --prod deploy --legacy /prod/backend

FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production

RUN addgroup -S nodejs && adduser -S nestjs -G nodejs
COPY --from=build --chown=nestjs:nodejs /prod/backend ./

USER nestjs
EXPOSE 4000
CMD ["node", "scripts/docker-entrypoint.mjs"]
