# ─── Stage 1: deps ─────────────────────────────────────────────────────────────
FROM node:22-alpine AS deps
RUN apk add --no-cache libc6-compat python3 make g++
WORKDIR /app

COPY package.json package-lock.json turbo.json .npmrc ./
COPY packages/ packages/
COPY apps/api/package.json ./apps/api/package.json
COPY apps/mgmt/package.json ./apps/mgmt/package.json
COPY apps/public/package.json ./apps/public/package.json
COPY apps/superadmin/package.json ./apps/superadmin/package.json
COPY apps/waba/package.json ./apps/waba/package.json
COPY apps/webmail/package.json ./apps/webmail/package.json

RUN npm ci --include=dev

# ─── Stage 2: builder ──────────────────────────────────────────────────────────
FROM node:22-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/apps ./apps
COPY --from=deps /app/packages ./packages
COPY . .

ENV NEXT_TELEMETRY_DISABLED=1
ENV DOCKER_BUILD=true

# Public configuration is embedded by Next.js during the build.
ARG NEXT_PUBLIC_SUPABASE_URL
ARG NEXT_PUBLIC_SUPABASE_ANON_KEY
ARG NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
ARG NEXT_PUBLIC_SITE_URL
ARG NEXT_PUBLIC_API_URL
ARG NEXT_PUBLIC_MGMT_URL
ARG NEXT_PUBLIC_SUPERADMIN_URL
ARG NEXT_PUBLIC_WABA_URL
ARG NEXT_PUBLIC_TURNSTILE_SITE_KEY
RUN npx turbo run build --filter=superadmin

# ─── Stage 3: runner ───────────────────────────────────────────────────────────
FROM node:22-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV HOSTNAME=0.0.0.0
ENV NEXT_TELEMETRY_DISABLED=1
ARG PORT=3002
ENV PORT=$PORT

RUN addgroup --system --gid 1001 nodejs && adduser --system --uid 1001 nextjs

COPY --from=builder /app/apps/superadmin/public ./apps/superadmin/public
COPY --from=builder --chown=nextjs:nodejs /app/apps/superadmin/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/apps/superadmin/.next/static ./apps/superadmin/.next/static

USER nextjs
EXPOSE $PORT

CMD ["node", "apps/superadmin/server.js"]
