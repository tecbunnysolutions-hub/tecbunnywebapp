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

# Cache mount keeps downloaded tarballs across builds (this VPS's network chokes
# under npm's default concurrency — fetch retry knobs + fewer sockets prevent
# transient ETIMEDOUTs from killing a ~20 min install).
RUN --mount=type=cache,target=/root/.npm \
    npm ci --include=dev --no-audit --no-fund \
      --maxsockets=4 \
      --fetch-retries=5 \
      --fetch-retry-maxtimeout=120000 \
      --fetch-timeout=600000

# ─── Stage 2: builder ──────────────────────────────────────────────────────────
FROM node:22-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/apps ./apps
COPY --from=deps /app/packages ./packages
COPY . .

ENV NEXT_TELEMETRY_DISABLED=1
ENV DOCKER_BUILD=true
# Runtime secrets (Supabase service key, SMTP, PayU, ...) are not present inside
# the image build; env validation must not fail hard while Next.js collects
# page data. The runner stage omits this, so production still validates at boot.
ENV TECBUNNY_VALIDATE_ENV=off

# Allows tuning Node heap on small build hosts (e.g. a 1 GB VPS with swap):
#   docker build --build-arg NODE_OPTIONS=--max-old-space-size=1792 ...
ARG NODE_OPTIONS
ENV NODE_OPTIONS=${NODE_OPTIONS}

# Public configuration is embedded by Next.js during the build.
ARG NEXT_PUBLIC_SUPABASE_URL
ARG NEXT_PUBLIC_SUPABASE_ANON_KEY
ARG NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
ARG NEXT_PUBLIC_SITE_URL
ARG NEXT_PUBLIC_MGMT_URL
ARG NEXT_PUBLIC_SUPERADMIN_URL
ARG NEXT_PUBLIC_WABA_URL
ARG NEXT_PUBLIC_TURNSTILE_SITE_KEY
RUN npx turbo run build --filter=api

# ─── Stage 3: runner ───────────────────────────────────────────────────────────
FROM node:22-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV HOSTNAME=0.0.0.0
ENV NEXT_TELEMETRY_DISABLED=1
ARG PORT=3001
ENV PORT=$PORT

RUN addgroup --system --gid 1001 nodejs && adduser --system --uid 1001 nextjs

COPY --from=builder /app/apps/api/public ./apps/api/public
COPY --from=builder --chown=nextjs:nodejs /app/apps/api/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/apps/api/.next/static ./apps/api/.next/static

USER nextjs
EXPOSE $PORT

CMD ["node", "apps/api/server.js"]
