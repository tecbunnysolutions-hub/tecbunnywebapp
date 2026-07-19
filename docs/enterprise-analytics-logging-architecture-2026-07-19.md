# TecBunny Enterprise Analytics, Staff Activity, and Audit Logging Architecture

Date: 2026-07-19

Scope: Public Website, Customer Portal, Management, Superadmin, WABA, Webmail, API, Chrome Extension, and shared packages.

## 1. Enterprise Analytics Architecture

TecBunny now has a central analytics and logging foundation with three ingest streams:

- Product and business analytics: `/api/analytics/track` -> `enterprise_analytics_events`.
- Staff activity logs: `/api/enterprise-analytics/staff-logs` -> `enterprise_staff_activity_logs`.
- Audit logs: `/api/enterprise-analytics/audit-logs` -> `enterprise_audit_logs`.

All applications should emit through the shared `@tecbunny/core/enterprise-analytics` contract. The API app is the central collector. Applications can emit browser events, server route events, worker events, webhook events, Gemini usage, notification events, and business workflow events into the same platform tables.

Automatic coverage now exists through `EnterpriseAnalyticsAutoTracker`, mounted in Public, Management, Superadmin, WABA, Webmail, and API layouts. It records page views, dashboard views, link/button/menu interactions, form submissions, and search field commits with application/module/screen context.

API request coverage now exists in the API proxy. Every API request except `/api/analytics/track` emits endpoint, method, status, execution time, request ID, success/failure, and query metadata into the central analytics stream.

Proxy-level mutation compliance coverage now exists in API, Management, Superadmin, and WABA through `emitEnterpriseProxyTelemetry`. Mutating requests (`POST`, `PUT`, `PATCH`, `DELETE`) emit staff activity logs automatically. Sensitive mutating paths such as auth, admin, superadmin, roles, permissions, settings, payment, invoice, order, inventory, users, webhooks, uploads, exports, imports, campaigns, templates, AI, Gemini, and security also emit immutable audit logs automatically. These records include application, module, screen, action, endpoint, method, status, execution time, request ID, success/failure, entity endpoint, and query metadata. Route-level instrumentation should still add old/new values, exact business entity IDs, and business reasons where those values matter.

## 2. Analytics Database Schema

Migration: `supabase/migrations/202607190006_enterprise_analytics_logging.sql`.

Core tables:

- `enterprise_analytics_events`: user, business, sales, revenue, inventory, CRM, marketing, support, service, engineer, employee, API, database, performance, system, security, storage, AI, Gemini, notification, email, WhatsApp, search, feature usage, dashboard, and error analytics.
- `enterprise_staff_activity_logs`: immutable staff action log for login, logout, create, update, delete, approve, reject, assign, transfer, export, import, download, upload, print, view, search, filter, report generation, communications, billing, inventory, settings, AI, Gemini, and API testing.
- `enterprise_audit_logs`: immutable compliance audit log for authentication, authorization, role/permission changes, configuration, database changes, API calls, webhooks, imports, exports, bulk operations, file operations, invoice/payment/order/customer/inventory/company/branch changes, AI configuration, secrets, API keys, and webhook configuration.
- `enterprise_kpi_snapshots`: historical KPI snapshots by role, period, application, category, dimensions, target, and source table.
- `enterprise_saved_filters`: saved search/filter definitions for analytics, staff logs, audit logs, and reports.
- `enterprise_report_exports`: CSV, Excel, PDF, and print export queue metadata.
- `enterprise_retention_policies`: configurable retention and archival policy registry.

Immutability:

- `enterprise_staff_activity_logs` and `enterprise_audit_logs` have database triggers that reject `UPDATE` and `DELETE`.
- Sensitive fields are masked at API ingest before storage.

## 3. Analytics API Design

Implemented APIs:

- `POST /api/analytics/track`: public product analytics ingest. Existing GA/lead behavior is preserved and enterprise ingestion is layered in.
- `GET /api/enterprise-analytics/dashboard`: protected executive dashboard metrics and recent events.
- `GET /api/enterprise-analytics/staff-logs`: protected staff log search/filter.
- `POST /api/enterprise-analytics/staff-logs`: protected staff activity ingest.
- `GET /api/enterprise-analytics/audit-logs`: protected audit log search/filter.
- `POST /api/enterprise-analytics/audit-logs`: protected audit ingest.
- `GET /api/enterprise-analytics/search`: protected global search across analytics, staff logs, and audit logs.
- `GET /api/enterprise-analytics/reports`: protected summary reporting API for daily, weekly, monthly, quarterly, yearly, and custom ranges.
- `GET /api/enterprise-analytics/filters`: protected saved filter list.
- `POST /api/enterprise-analytics/filters`: protected saved filter creation.
- `POST /api/enterprise-analytics/exports`: protected export queue for CSV, Excel, PDF, and print.

Shared client:

- `trackEnterpriseEvent(event)`
- `logStaffActivity(event)`
- `logAuditEvent(event)`
- `withStaffActivity(event, fn)`
- `EnterpriseAnalyticsAutoTracker`
- `emitEnterpriseProxyTelemetry(request, options)`

Export path: `@tecbunny/core/enterprise-analytics`.
Auto-tracker export path: `@tecbunny/core/components/EnterpriseAnalyticsAutoTracker`.
Proxy telemetry export path: `@tecbunny/core/enterprise-analytics-proxy`.

## 4. Staff Logs Architecture

Every staff action should emit `logStaffActivity` with:

- Actor: user, role, company, branch, department.
- Context: application, module, screen, session ID, request ID.
- Action: create, update, delete, approve, reject, assign, transfer, export, import, download, upload, print, view, search, filter, generate report, send email, send WhatsApp, create campaign, create invoice, create order, payment collection, inventory update, product update, customer update, lead update, role change, permission change, settings change, AI usage, Gemini request, Gemini response, API testing.
- Runtime: IP address, browser, operating system, device, endpoint, method, status, execution time, success/failure.

## 5. Audit Logs Architecture

Every privileged or compliance-relevant event should emit `logAuditEvent` with:

- Entity: type and ID.
- Change: old value, new value, reason, remarks.
- Security context: actor, role, application, module, screen, IP, browser, OS, request ID, endpoint, method, status, execution time, success.
- Storage: immutable `enterprise_audit_logs`.

Audit events are required for authentication, authorization, permissions, roles, settings, configurations, database changes, API calls, webhooks, imports, exports, bulk operations, files, invoices, payments, orders, customers, inventory, companies, branches, system changes, AI configuration, API keys, secrets, and webhook configuration.

## 6. Dashboard Designs

Role dashboards should read from `GET /api/enterprise-analytics/dashboard`, `enterprise_kpi_snapshots`, and report APIs.

- CEO / Founder: revenue, orders, invoices, payments, conversion, active users, gross margin, system health, live errors, top business risks.
- Superadmin: tenant/company health, API health, security events, role changes, audit volume, errors, storage, integrations, WABA/email/notification health.
- Management: sales pipeline, orders, leads, customers, inventory, support load, engineer productivity, staff activity.
- Sales: leads, conversions, quotes, orders, revenue, follow-ups, WhatsApp/email engagement.
- Engineer: assigned tickets, SLA, completion rate, warranty/AMC jobs, travel/service updates.
- Support: live chats, tickets, response time, resolution time, escalations, CSAT.
- Accounts: invoices, payments, collections, refunds, failed payments, outstanding amount.
- Marketing: campaigns, WhatsApp sends, email sends, conversion, feature usage, traffic sources.
- Operations: inventory, fulfilment, order status, logistics, service capacity, system incidents.
- HR: employee productivity, attendance-adjacent staff actions, approvals, role changes, workload distribution.

## 7. KPI Definitions

- DAU / WAU / MAU: distinct users in `enterprise_analytics_events` by day/week/month.
- Returning Users: users with events in current and previous period.
- Session Duration: max/min event timestamp per session.
- Revenue: sum of revenue events or KPI snapshots from order/payment tables.
- Orders / Invoices / Payments: count and value of corresponding business events.
- Conversion Rate: converted leads/orders divided by total leads/sessions.
- Inventory Movement: stock update and adjustment events.
- Staff Productivity: completed staff actions, successful actions, execution time, SLA compliance.
- API Health: API request count, latency, failure rate, endpoint error distribution.
- Security Risk: failed auth, permission denied, role/permission/settings changes, secret/webhook changes.
- AI/Gemini Usage: requests, responses, tokens/cost where available, failures, module usage.
- Notification Health: email, WhatsApp, push/in-app sends, delivery/read/failure callbacks.

## 8. Event Tracking Matrix

| Event Name | Description | Application | Module | Trigger | Database Table | API Endpoint | Dashboard | Retention | Priority |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| user_registered | Customer/staff registration | Public, Customer, API | Auth | Signup success | enterprise_analytics_events, enterprise_audit_logs | /api/analytics/track | CEO, Marketing, Superadmin | 26 months / 7 years audit | High |
| user_login | Successful login | All apps | Auth | Login success | enterprise_staff_activity_logs, enterprise_audit_logs | /api/enterprise-analytics/staff-logs | Superadmin, HR | 7 years | High |
| user_logout | Session logout | All apps | Auth | Logout | enterprise_staff_activity_logs | /api/enterprise-analytics/staff-logs | HR, Superadmin | 7 years | Medium |
| authorization_denied | Permission failure | All apps | Security | Guard rejects request | enterprise_audit_logs | /api/enterprise-analytics/audit-logs | Superadmin, Security | 10 years | Critical |
| create_record | Staff creates entity | Mgmt, Superadmin, WABA, API | CRUD | Create action | enterprise_staff_activity_logs, enterprise_audit_logs | /api/enterprise-analytics/staff-logs | Management, Operations | 7 years | High |
| update_record | Staff updates entity | Mgmt, Superadmin, WABA, API | CRUD | Update action | enterprise_staff_activity_logs, enterprise_audit_logs | /api/enterprise-analytics/audit-logs | Management, Operations | 7 years | High |
| delete_record | Staff deletes/archive entity | Mgmt, Superadmin, API | CRUD | Delete/archive | enterprise_staff_activity_logs, enterprise_audit_logs | /api/enterprise-analytics/audit-logs | Superadmin | 7 years | Critical |
| approve_reject | Approval decision | Mgmt, Superadmin | Workflow | Approve/reject | enterprise_staff_activity_logs, enterprise_audit_logs | /api/enterprise-analytics/audit-logs | Management | 7 years | High |
| assign_transfer | Assignment or transfer | Mgmt, WABA, Support | Workflow | Assign/transfer | enterprise_staff_activity_logs | /api/enterprise-analytics/staff-logs | Support, Operations | 7 years | Medium |
| export_import | Data import/export | All admin apps | Data Ops | Import/export request | enterprise_staff_activity_logs, enterprise_audit_logs, enterprise_report_exports | /api/enterprise-analytics/exports | Superadmin | 7 years | Critical |
| file_upload_delete | Upload/delete file | All apps | Storage | File operation | enterprise_analytics_events, enterprise_audit_logs | /api/analytics/track | Operations, Security | 7 years audit | High |
| view_search_filter | View/search/filter action | All apps | Search | Page/search/filter | enterprise_analytics_events, enterprise_staff_activity_logs | /api/analytics/track | Product, Management | 26 months | Medium |
| report_generated | Report generation | Mgmt, Superadmin, API | Reports | Report request | enterprise_staff_activity_logs, enterprise_report_exports | /api/enterprise-analytics/reports | CEO, Accounts, HR | 7 years | High |
| email_sent | Email notification sent | API, Webmail, Mgmt | Email | Send email | enterprise_analytics_events | /api/analytics/track | Marketing, Support | 26 months | Medium |
| whatsapp_sent | WhatsApp message/campaign sent | WABA, Mgmt | WhatsApp | Send WhatsApp | enterprise_analytics_events, enterprise_staff_activity_logs | /api/analytics/track | Marketing, Support | 26 months | High |
| campaign_created | Campaign created | WABA, Mgmt | Marketing | Campaign creation | enterprise_staff_activity_logs, enterprise_audit_logs | /api/enterprise-analytics/staff-logs | Marketing | 7 years | High |
| invoice_order_payment | Invoice/order/payment change | Customer, Mgmt, API | Revenue | Business transaction | enterprise_analytics_events, enterprise_audit_logs | /api/analytics/track | CEO, Accounts | 10 years | Critical |
| inventory_product_update | Inventory/product mutation | Mgmt, Superadmin, API | Inventory | Stock/product update | enterprise_analytics_events, enterprise_audit_logs | /api/enterprise-analytics/audit-logs | Operations | 7 years | High |
| customer_lead_update | Customer/lead mutation | Mgmt, WABA, API | CRM | CRM update | enterprise_analytics_events, enterprise_staff_activity_logs | /api/analytics/track | Sales, Support | 7 years | High |
| role_permission_change | Role or permission mutation | Superadmin, API | Security | RBAC update | enterprise_audit_logs | /api/enterprise-analytics/audit-logs | Superadmin, Security | 10 years | Critical |
| settings_change | System setting changed | Mgmt, Superadmin, API | Settings | Config update | enterprise_audit_logs | /api/enterprise-analytics/audit-logs | Superadmin | 10 years | Critical |
| ai_gemini_request | Gemini request/response | All AI modules | AI | AI invocation | enterprise_analytics_events, enterprise_staff_activity_logs | /api/analytics/track | CEO, Operations | 26 months | High |
| api_request | API request/latency/failure | API, all apps | API | Route execution | enterprise_analytics_events | /api/analytics/track | Superadmin, DevOps | 26 months | High |
| webhook_event | Webhook received/processed | API, WABA | Webhooks | Webhook callback | enterprise_analytics_events, enterprise_audit_logs | /api/analytics/track | DevOps, Operations | 7 years audit | High |
| dashboard_view | Dashboard viewed | Mgmt, Superadmin, WABA | Dashboard | Dashboard load | enterprise_analytics_events | /api/analytics/track | Product | 26 months | Medium |
| system_error | Runtime or integration error | All apps | System | Exception/error | enterprise_analytics_events | /api/analytics/track | DevOps, Superadmin | 26 months | Critical |

## 9. API Documentation

All protected `/api/enterprise-analytics/*` APIs are guarded by the API app policy middleware/admin context. `/api/analytics/track` remains public for product telemetry, masks sensitive metadata, preserves existing GA forwarding, and records enterprise analytics events.

Standard filters:

- `from`, `to`, `days`
- `application`, `module`, `action`, `role`, `user_id`, `company_id`, `branch_id`, `department`
- `source=analytics|staff|audit` for search

Standard export formats: `csv`, `excel`, `pdf`, `print`.

## 10. Database Relationships

- Analytics events, staff logs, and audit logs share `request_id`, `session_id`, `user_id`, `application`, `module`, `entity_type`, and `entity_id` for traceability.
- KPI snapshots point back to source tables through `source_tables` and dimensions.
- Report exports store the filters used to reproduce output.
- Saved filters support reusable dashboard/search/report views.

## 11. Security Strategy

- Staff and audit logs are immutable by trigger.
- Sensitive metadata keys are masked before insert.
- Protected APIs use admin context and service client access.
- Public ingest route only accepts append-only telemetry and does not expose query APIs.
- RLS is enabled on enterprise tables; service-role APIs should be the controlled access path.
- Retention policies are explicit and queryable.

## 12. Performance Strategy

- Time, application, user, request, entity, and metadata indexes are created for primary queries.
- KPI snapshots prevent dashboards from recalculating heavy historical metrics on every page load.
- Report exports are queue-modeled through `enterprise_report_exports`.
- Long-term scale path: monthly partitions for analytics/staff/audit logs, cold archival after policy window, and pre-aggregated KPI jobs.

## 13. Data Retention Strategy

- Analytics events: 26 months, archive after 13 months.
- Staff activity: 7 years, archive after 24 months.
- General audit: 7 years, archive after 24 months.
- Security and financial audit: 10 years, archive after 36 months.
- Retention settings live in `enterprise_retention_policies` and can be surfaced in Superadmin settings.

## 14. Compliance Recommendations

- Apply the migration before production rollout.
- Instrument every route handler, worker, cron, webhook, and privileged UI action with the shared core emitter.
- Add role-scoped dashboards in Management and Superadmin using the protected APIs.
- Add export workers for CSV/Excel/PDF generation from `enterprise_report_exports`.
- Add partition/archive jobs before high-volume launch.
- Add E2E tests proving staff/audit immutability and authorization boundaries.

## 15. Production Readiness Report

Implemented in this pass:

- Central database schema for analytics, staff activity, audit logs, KPIs, filters, exports, and retention.
- Immutable staff and audit log enforcement.
- Central API ingest/query/report/search/export endpoints.
- Shared `@tecbunny/core/enterprise-analytics` emitter for all apps and packages.
- Existing product telemetry route now also writes enterprise analytics.
- Automatic page, dashboard, click, form-submit, and search event capture across all Next app layouts.
- Automatic API request telemetry from the API proxy.
- Automatic staff activity logging for mutating API requests in API, Management, Superadmin, and WABA.
- Automatic immutable audit logging for sensitive mutating API requests in API, Management, Superadmin, and WABA.
- Route-level old/new-value audit wrappers for Superadmin role, organization, branch, and custom setup offer mutations.
- Route-level old/new-value audit wrapper for Management staff role changes.
- Route-level audit wrappers for WABA campaign broadcasts, WhatsApp template creation, and provider template synchronization.

Remaining before full compliance sign-off:

- Continue route-level old/new value snapshots, exact business entity IDs, and business reasons across the remaining long-tail privileged mutations where proxy-level records cannot safely inspect request/response bodies.
- Build role-specific UI dashboards in Management/Superadmin.
- Add export worker implementations for Excel/PDF files.
- Add partitioning/archive jobs for high-volume retention.
- Add security E2E tests for log visibility, masking, and immutability.

Final answers:

1. Is every user activity tracked? Broad page/dashboard/click/form/search/API activity tracking is implemented across the suite, and mutating API requests now generate automatic staff activity logs.
2. Is every critical system event audited? Sensitive mutating API paths now generate automatic immutable audit logs. High-risk Superadmin tenant/security/configuration mutations, Management role changes, and WABA campaign/template mutations now include route-level detail; remaining long-tail mutations should continue receiving old/new value snapshots, exact business entity IDs, and business reasons.
3. Is every business KPI measurable? The KPI storage and reporting foundation exists; KPI jobs must be connected to source business tables.
4. Can every action be traced back to a user? The schema supports user/session/request/entity traceability; completeness depends on each caller passing actor context.
5. Is the platform enterprise-ready from an analytics and compliance perspective? It now has an enterprise-grade foundation plus automatic suite-level activity, sensitive mutation audit coverage, and route-level audit detail on the highest-risk Superadmin, Management role, and WABA mutation paths. Final production compliance sign-off should wait until migrations are applied, role dashboards are connected, remaining long-tail domain mutations receive the same route-level detail, and E2E evidence proves coverage.