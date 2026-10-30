# TecBunny role naming

Use `CANONICAL_ROLES`, `STAFF_ASSIGNABLE_ROLES`, `ROLE_DISPLAY_NAME`, and
`normalizeRole` from the shared role model. User creation and editing offer only
canonical roles. Normalize persisted values before role comparisons or routing.

Existing accounts remain compatible through these input aliases:

| Persisted alias | Canonical role | Display label |
| --- | --- | --- |
| sales | sales_executive | Sales Executive |
| sales-staff | store_executive | Store Executive |
| sales-external | sales_agent | Sales Agent |
| manager | sales_manager | Sales Manager |

Aliases do not represent additional business roles. Historical URL paths such as
`/mgmt/sales-staff` remain stable; they are workspace routes, not role identifiers.
No production database migration is performed by these code changes.

All fourteen assignable staff roles use the staff login, including Administrator.
Support, Delivery, Warehouse, HR and both Marketing roles start at the shared
`/mgmt` dashboard. Existing sales, service, accounts and administrator roles keep
their specialized workspaces. Login eligibility does not grant additional module
or API permissions; the existing authorization graph remains authoritative.

Customer access remains separate. System Super Administrator uses the separate
Superadmin login and is excluded from normal user role assignment and staff login.
