# Architecture boundaries

TecBunny is a modular monorepo. Applications are independently deployable; packages are shared implementation units, not separate services.

## Application ownership

| Area | Owner | Responsibility |
| --- | --- | --- |
| Public customer experience | `apps/public` | Pages, client-side interactions, SEO, and calls to the API. |
| Public and integration API | `apps/api` | Route handlers, webhooks, scheduled endpoints, API documentation, and API authentication. |
| Staff operations | `apps/mgmt` | Role-scoped internal workflows. |
| Privileged operations | `apps/superadmin` | Superadmin-only workflows and their stricter authorization boundary. |
| WhatsApp automation | `apps/waba` | WhatsApp product UI and background workers. |
| Internal mail | `apps/webmail` | Internal mail UI. |

`apps/public` may retain only document-discovery route handlers (`feed.xml`, `catalog.xml`, and `manifest.webmanifest`). All business, payment, webhook, seller, and authenticated API routes belong in `apps/api`.

## Package direction

```text
apps → admin-ui/ui → client-facing packages
apps/api → domain → repository interfaces
apps/api → infra/database → external services
```

`@tecbunny/domain` is pure TypeScript: it must not import application, UI, database, RPC, or infrastructure packages. `@tecbunny/ui` base components must not import server or data-access packages. App-specific components currently live under `@tecbunny/ui/app`; do not add to that compatibility layer—new app-aware components belong with their owning app or a dedicated app package.

## Verification

Run `npm run validate:architecture` for boundary checks and `npm run typecheck` to execute every available workspace typecheck through Turbo. `npm run check` runs architecture validation, typechecking, and tests.
