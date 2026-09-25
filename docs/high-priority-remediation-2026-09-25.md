# High-priority audit remediation — 25 September 2026

This change addresses findings 1–8 in [the original audit](project-audit-2026-09-24.md). It changes repository code and supplies database migrations; no production migration or deployment was performed.

| Finding | Remediation |
| --- | --- |
| 1. Browser database clients in server routes | API handlers now use request-scoped server clients. Signed webhook handlers perform database operations with a service client behind their signature checks. The shared email handler and feature-flag router were corrected too. Public XML feeds use explicit anonymous, non-persistent clients to preserve caching. The API-boundary validator rejects browser-factory imports in server route handlers. |
| 2. Cashfree payment/order substitution | Checkout first records an authenticated owner's local order, unique gateway reference, expected amount and environment. Verification checks that association, gateway identity, INR currency and amount before settlement. |
| 3. Missing storefront proxy and Cashfree CSP | The proxy lives at `apps/public/src/proxy.ts`. Cashfree SDK, API and frame sources are admitted by the nonce-based policy. The existing protected-page layouts retain dynamic rendering for nonce injection. |
| 4. Payment success despite persistence failure | Both gateways stop checkout when transaction creation fails. Settlement uses one service-only PostgreSQL function, locks the order and transaction, and updates both atomically. Failed persistence returns a retryable response. Cashfree's confirmation screen retries verification without creating another charge. PayU does not redirect to success on failed settlement or transaction reads. |
| 5. Missing WABA user relation | WABA uses the service-only `waba_staff_directory` view of canonical `profiles`, including the role string and company/branch ownership. The unsigned legacy agent-ID cookie is no longer an authentication fallback. |
| 6. WABA tenant escape via unassignment | Conversations persist organization and branch separately from assignment. Application checks protect history, replies, media, notes, read receipts, copilot, recipient selection, consent and assignment. Restrictive SELECT policies protect Conversation/Message browser and Realtime reads, including installations with older permissive policies. Ownership is immutable after attribution. Account-wide analytics is global-admin only. |
| 7. External webhook requests blocked by login | The gateway admits the intended order, payment, customer and WhatsApp webhook methods. Existing handler signature/token validation remains in place. Private webhook routes still require authentication. |
| 8. Cookie refresh loses chunks | SSR adapters use `getAll`/`setAll`. Middleware accumulates cookie changes, forwards refreshed request cookies, and retains refreshed/deleted cookies on normal responses, redirects and access-denied responses. |

Related corrections include ordinary Supabase bearer-token verification in middleware and privileged guards (audit finding 17), and the previously missing atomic payment RPC (finding 9). This does not claim to close the remaining lower-priority audit findings.

## Verification

- All 159 tests pass across 27 files in five workspace test tasks. Regressions cover gateway/local-order substitution, ownership and amount/currency mismatches, transaction-creation failures, pending settlement, PayU success gating, cookie chunks, bearer/MFA checks, WABA ownership, registered storefront guards and gateway webhook admission.
- `npm run test:security-migrations` executes both actual migrations in an isolated in-memory PostgreSQL instance. It checks settlement rollback, reference/amount/currency validation, idempotency, late failure, restricted execution, ownership backfill, immutable ownership, reassignment rejection and tenant/branch RLS despite pre-existing permissive policies.
- Architecture and API-boundary validators pass. Prisma client generation succeeds.
- All 16 configured workspace typechecks pass after targeted reruns for corrected test fixtures and removal of the storefront's inaccurate `next/server` type shim.
- The built storefront contains `server/proxy.js` and a Node.js `/_middleware` entry in `server/functions-config-manifest.json`. Its Edge middleware manifest is empty, as expected for the Node.js proxy. A local production server returned HTTP 307 to `/auth/login` for `/checkout`, `/profile`, `/orders` and `/payment/cashfree/test-order`, with the updated Cashfree CSP on every response.
- The full serial production build passed all 16 build/lint tasks, including all six applications. Existing lint and framework deprecation warnings remain; the separate shared-package lint and readiness findings from the original audit are outside this remediation.

The migration tests use a minimal legacy-schema fixture. They do not prove compatibility with uncommitted production schema differences. No real gateway charge or authenticated browser checkout was performed.

### 26 September migration compatibility correction

An existing `payment_transactions` table without `payment_method`, then `transaction_id`, caused error 42703 when creating the gateway-reference index. The initial single-column correction was incomplete: `CREATE TABLE IF NOT EXISTS` leaves existing tables unchanged. The settlement migration now explicitly adds every missing settlement column (`order_id`, `transaction_id`, `payment_method`, `amount`, `status`, `gateway_response`, `created_at`) before creating the index/function. Defaults apply to future inserts only. Rerun the updated full settlement migration after this failure. Regression fixtures cover a fresh ledger, a ledger missing `payment_method`, and a minimal existing ledger missing all settlement columns, including repeated execution and preservation of historical rows. Unknown historical references, amounts, states and dates remain null; reconcile those records against provider evidence before attempting settlement. Existing column types and unrelated constraints are not rewritten; compatibility with other live-schema differences still requires inspection of the actual table definition.

## Deployment order and operational changes

1. Inspect the target database's `orders`, `payment_transactions`, `profiles`, `Conversation` and `Message` relations against the committed migrations. Resolve any duplicate `(payment_method, transaction_id)` records before the new unique index is created; the migration intentionally does not discard financial history.
2. Apply `supabase/migrations/20260925000000_atomic_gateway_settlement.sql`, then `supabase/migrations/20260925000001_waba_conversation_ownership.sql` through the normal deployment process. Deploy the updated applications after those migrations. Until the SQL is installed, new payment settlement fails closed and scoped WABA requests cannot resolve the new directory/ownership fields.
3. Existing assigned conversations are backfilled from the assignee's canonical `profiles.company_id` and `branch_id`. Existing unassigned conversations, or assignments without a trustworthy company, remain quarantined to global administrators. A global administrator must assign those conversations to staff with a valid company. Removing an assignee afterward retains ownership. Automatic pincode routing cannot establish an unknown conversation's tenant.
4. Ensure server service credentials are configured for API gateway settlement and WABA. Keep Cashfree's environment and credentials consistent with each recorded session. Test a sandbox checkout and scoped WABA account before enabling live traffic.

Cashfree sessions created by the old code have no recorded association and cannot be safely accepted by the new verifier. Reconcile any in-flight legacy payments against gateway records before switching traffic; do not ask already-charged customers to pay again. PayU retains recorded transaction references and retries the atomic settlement call.

Cross-company or cross-branch ownership transfers are deliberately rejected by the database trigger. A separate reviewed administrative migration is required if a legitimate ownership transfer is needed.
