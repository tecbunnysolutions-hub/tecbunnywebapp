# The production VPS exposes only the x86-64 v1 CPU baseline. Build the exact
# maintained image binding against baseline libvips instead of its v2 prebuild.
FROM node:22-alpine AS sharp-native
COPY apps/api/native/build-cpu-v1.sh /build-cpu-v1.sh
RUN sh /build-cpu-v1.sh

# ─── Stage 1: deps ─────────────────────────────────────────────────────────────
FROM node:22-alpine AS deps
RUN apk add --no-cache libc6-compat python3 make g++
WORKDIR /app

COPY package.json package-lock.json turbo.json .npmrc ./
COPY packages/ packages/
COPY scripts/apply-zod-security-backport.mjs ./scripts/apply-zod-security-backport.mjs
COPY patches/zod/ ./patches/zod/
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

# Dummy runtime values so module-scope code that assumes a fully-configured
# production environment doesn't crash while Next.js imports routes to collect
# page data (e.g. TypeError: .endsWith on undefined). Builder stage only —
# the runner image never sees these; real values come from .env.local.
ENV SUPABASE_ANON_KEY=build-dummy \
    SUPABASE_SERVICE_ROLE_KEY=build-dummy \
    SMTP_HOST=localhost \
    SMTP_PORT=1025 \
    SMTP_SECURE=false \
    SMTP_USER=build-dummy \
    SMTP_PASS=build-dummy \
    SMTP_FROM=build@localhost \
    INFOBIP_API_KEY=build-dummy \
    INFOBIP_WHATSAPP_FROM=0000000000 \
    INFOBIP_BASE_URL=https://localhost \
    WHATSAPP_WEBHOOK_VERIFY_TOKEN=build-dummy \
    OTP_SECRET_PEPPER=build-dummy \
    SUPERADMIN_SESSION_SECRET=build-dummy \
    SUPERADMIN_USER_ID=build-dummy \
    TOTP_SECRET_ENCRYPTION_KEY=build-dummy \
    SESSION_SECRET=build-dummy \
    PAYU_MERCHANT_KEY=build-dummy \
    PAYU_MERCHANT_SALT=build-dummy \
    PAYU_CLIENT_ID=build-dummy \
    PAYU_CLIENT_SECRET=build-dummy \
    PAYU_ENVIRONMENT=test \
    TURNSTILE_SECRET_KEY=build-dummy

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
ENV LD_LIBRARY_PATH=/opt/tecbunny-vips-v1/lib

RUN addgroup --system --gid 1001 nodejs && adduser --system --uid 1001 nextjs

COPY --from=builder /app/apps/api/public ./apps/api/public
COPY --from=builder --chown=nextjs:nodejs /app/apps/api/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/apps/api/.next/static ./apps/api/.next/static
COPY --from=sharp-native /native-runtime/ /
RUN node -e "if (require('./node_modules/sharp/package.json').version !== '0.35.5') throw new Error('Update the pinned CPU compatibility recipe for this Sharp version')"

USER nextjs
EXPOSE $PORT

CMD ["node", "apps/api/server.js"]
