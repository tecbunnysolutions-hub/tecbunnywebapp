# TecBunny

TypeScript monorepo using npm workspaces, Turborepo, Next.js, and Supabase/PostgreSQL.

## Repository layout

| Directory | Purpose |
| --- | --- |
| `apps/public` | Customer storefront (`tecbunny-store`) |
| `apps/api` | Central API and integration endpoints (`api`) |
| `apps/mgmt` | Staff operations (`mgmt`) |
| `apps/superadmin` | Privileged operations (`superadmin`) |
| `apps/waba` | WhatsApp UI and background worker (`waba`) |
| `apps/webmail` | Internal mail UI (`@tecbunny/webmail`) |
| `packages` | Shared UI, business logic, database access, types, and configuration |
| `supabase/migrations` | Versioned SQL migrations |
| `scripts` | Repository validation, cleanup, and operational probes |
| `docs` | Architecture, policy, and release evidence |
| `extension` | Browser extension |

See [architecture boundaries](docs/architecture.md) before moving application code.

## Setup

Use Node.js 22 or 24 and npm 11.12.1. Install from the repository root with `npm ci`.
The install generates the Prisma client; do not commit generated clients or dependencies.

Copy [.env.example](.env.example) into each app's `.env.local` and set the values that
app requires. Next.js loads environment files from its own app directory. Supply
root-level CLI variables through your shell or a local root `.env` as required by
the tool. Keep real credentials out of version control.

Container builds accept public settings as `NEXT_PUBLIC_*` build arguments. Compose
can load them with `docker compose --env-file .env.local build`; use the origins for
the intended deployment. Private environment files are excluded from Docker images
and supplied to running containers through `env_file` or your deployment platform.

Start the API and storefront in separate terminals:

```sh
npm run dev --workspace=api -- --port 3001
npm run dev --workspace=tecbunny-store
```

The storefront uses port 9003. Set `NEXT_PUBLIC_API_URL=http://localhost:3001`
for local API access. Other apps can use `npm run dev --workspace=<name> -- --port <port>`.
The optional local Redis and mail testing services start with `docker compose up redis mailhog -d`.

## Checks and production builds

```sh
npm run check
npm run validate:product-ux
npm run validate:launch-readiness
npm run build
```

`check` covers architecture, API boundaries, workspace types, lint, and tests.
`build` uses the workspace production builds and lint prerequisites. For a single
app, use `npm run build --workspace=<name>` and `npm run start --workspace=<name>`.
Set production environment variables before building; `NEXT_PUBLIC_*` values are
embedded into browser assets. Deploy the WABA worker separately with
`npm run worker --workspace=waba` when that integration is enabled.

Before releasing, run `npm audit --audit-level=high`,
`npm run validate:runtime-evidence-completeness`, and
`npm run validate:runtime-readiness`. Use `npm run smoke:production` only against
the intended deployed environment. Static checks and historical evidence alone do
not certify a live deployment. Release workflows are in `.github/workflows`.

If parallel tasks exhaust local memory, run Turbo with `--concurrency=1`, for example
`npm run typecheck -- --concurrency=1`.

## Maintenance

`npm run clean` removes generated build output, caches, coverage, and incremental
TypeScript files across workspaces. It preserves source, dependencies, environment
files, and curated evidence under `docs/runtime-evidence`.
Preview its targets with `npm run clean -- --dry-run`.

Keep required operating instructions and release evidence in `docs`; remove obsolete
session summaries and generated demo assets. Build output and local reports are ignored.
Database schema changes belong in `supabase/migrations`. The development database
seed entry point is `packages/infra/db/seed.ts`; do not run reset commands on production.
