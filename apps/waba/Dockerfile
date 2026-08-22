# ─── Stage 1: deps ─────────────────────────────────────────────────────────────
FROM node:20-alpine AS deps
RUN apk add --no-cache libc6-compat python3 make g++
WORKDIR /app

COPY package.json package-lock.json turbo.json ./
COPY packages/ packages/
COPY apps/waba/package.json ./apps/waba/package.json

RUN npm ci --include=dev

# ─── Stage 2: builder ──────────────────────────────────────────────────────────
FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

ENV NEXT_TELEMETRY_DISABLED=1

# NEXT_PUBLIC_* vars must be present at build time so Next.js can embed them
ARG NEXT_PUBLIC_SUPABASE_URL
ARG NEXT_PUBLIC_SUPABASE_ANON_KEY
ARG NEXT_PUBLIC_SITE_URL
ARG NEXT_PUBLIC_WABA_URL
ARG NEXT_PUBLIC_SUPERADMIN_USER_ID
ENV NEXT_PUBLIC_SUPABASE_URL=$NEXT_PUBLIC_SUPABASE_URL
ENV NEXT_PUBLIC_SUPABASE_ANON_KEY=$NEXT_PUBLIC_SUPABASE_ANON_KEY
ENV NEXT_PUBLIC_SITE_URL=$NEXT_PUBLIC_SITE_URL
ENV NEXT_PUBLIC_WABA_URL=$NEXT_PUBLIC_WABA_URL
ENV NEXT_PUBLIC_SUPERADMIN_USER_ID=$NEXT_PUBLIC_SUPERADMIN_USER_ID

RUN npx turbo run build --filter=waba

# ─── Stage 3: runner ───────────────────────────────────────────────────────────
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ARG PORT=3000
ENV PORT=$PORT

RUN addgroup --system --gid 1001 nodejs && adduser --system --uid 1001 nextjs

COPY --from=builder /app/apps/waba/public ./apps/waba/public
COPY --from=builder --chown=nextjs:nodejs /app/apps/waba/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/apps/waba/.next/static ./apps/waba/.next/static

USER nextjs
EXPOSE $PORT

CMD ["node", "apps/waba/server.js"]
