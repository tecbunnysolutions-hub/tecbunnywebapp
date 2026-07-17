# ─── Stage 1: deps ─────────────────────────────────────────────────────────────
FROM node:20-alpine AS deps
RUN apk add --no-cache libc6-compat python3 make g++
WORKDIR /app

COPY package.json package-lock.json turbo.json ./
COPY packages/ packages/
COPY apps/mgmt/package.json ./apps/mgmt/package.json

RUN npm ci --include=dev

# ─── Stage 2: builder ──────────────────────────────────────────────────────────
FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

ENV NEXT_TELEMETRY_DISABLED=1
RUN npx turbo run build --filter=mgmt

# ─── Stage 3: runner ───────────────────────────────────────────────────────────
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ARG PORT=3003
ENV PORT=$PORT

RUN addgroup --system --gid 1001 nodejs && adduser --system --uid 1001 nextjs

COPY --from=builder /app/apps/mgmt/public ./apps/mgmt/public
COPY --from=builder --chown=nextjs:nodejs /app/apps/mgmt/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/apps/mgmt/.next/static ./apps/mgmt/.next/static

USER nextjs
EXPOSE $PORT

CMD ["node", "apps/mgmt/server.js"]
