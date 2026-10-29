# ---------- 1. Install deps + build (single stage = one copy of node_modules) ----------
FROM node:22-alpine AS builder
RUN apk add --no-cache libstdc++ libgcc
COPY --from=oven/bun:1.2.23-alpine /usr/local/bin/bun /usr/local/bin/bun
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile
COPY . .
RUN node_modules/.bin/next build

# ---------- 2. Slim runtime: Next.js standalone output (~90 MB instead of ~1 GB) ----------
FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    PORT=3000 \
    HOSTNAME=0.0.0.0
RUN addgroup -S app && adduser -S app -G app

COPY --from=builder --chown=app:app /app/.next/standalone ./
COPY --from=builder --chown=app:app /app/.next/static ./.next/static

# Migration runner (node db/migrate.mjs) — only needs drizzle-orm + postgres
COPY --from=builder --chown=app:app /app/db/migrations ./db/migrations
COPY --from=builder --chown=app:app /app/db/migrate.mjs ./db/migrate.mjs
COPY --from=builder --chown=app:app /app/node_modules/drizzle-orm ./node_modules/drizzle-orm
COPY --from=builder --chown=app:app /app/node_modules/postgres ./node_modules/postgres

USER app
EXPOSE 3000
CMD ["node", "server.js"]
