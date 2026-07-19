# API Role Mapping

| API | Method | Authentication | Permission Required | Security Signals |
| --- | --- | --- | --- | --- |
| /api/admin-auth/login | POST | required/static signal found | not found | validation, authentication, auditTrail, rateLimiting, csrf |
| /api/admin-auth/logout | POST | required/static signal found | not found | authentication, auditTrail, rateLimiting |
| /api/admin/agents/approve | POST | required/static signal found | role/permission signal found | validation, authentication, authorization, rateLimiting |
| /api/admin/agents/list | GET | required/static signal found | role/permission signal found | authentication, authorization, rateLimiting |
| /api/admin/agents/reject | POST | required/static signal found | role/permission signal found | validation, authentication, authorization, rateLimiting |
| /api/admin/ai-query | POST | required/static signal found | role/permission signal found | validation, authentication, authorization, rateLimiting |
| /api/admin/ai/product-description | POST | required/static signal found | role/permission signal found | validation, authentication, authorization, auditTrail, rateLimiting |
| /api/admin/ai/related-products | POST | required/static signal found | role/permission signal found | validation, authentication, authorization, auditTrail, rateLimiting |
| /api/admin/crm/leads | POST | required/static signal found | role/permission signal found | validation, authentication, authorization, rateLimiting |
| /api/admin/custom-setups | GET | public or optional/static signal found | role/permission signal found | validation, authentication, authorization, rateLimiting |
| /api/admin/custom-setups | PATCH | public or optional/static signal found | role/permission signal found | validation, authentication, authorization, rateLimiting |
| /api/admin/dashboard | GET | required/static signal found | role/permission signal found | validation, authentication, authorization, rateLimiting |
| /api/admin/faqs | GET | public or optional/static signal found | role/permission signal found | validation, authentication, authorization, auditTrail, rateLimiting |
| /api/admin/faqs | POST | required/static signal found | role/permission signal found | validation, authentication, authorization, auditTrail, rateLimiting |
| /api/admin/faqs/{id} | DELETE | required/static signal found | role/permission signal found | validation, authentication, authorization, auditTrail, rateLimiting |
| /api/admin/faqs/{id} | PUT | required/static signal found | role/permission signal found | validation, authentication, authorization, auditTrail, rateLimiting |
| /api/admin/homepage/auto-fill | POST | required/static signal found | role/permission signal found | validation, authentication, authorization, rateLimiting |
| /api/admin/homepage/auto-fill/run | POST | required/static signal found | role/permission signal found | validation, authentication, authorization, rateLimiting |
| /api/admin/inventory/warranty/register | POST | required/static signal found | role/permission signal found | validation, authentication, authorization, rateLimiting |
| /api/admin/jobs/{id} | GET | required/static signal found | role/permission signal found | authentication, authorization, rateLimiting |
| /api/admin/manage-role | POST | required/static signal found | role/permission signal found | validation, authentication, authorization, auditTrail, rateLimiting |
| /api/admin/marketing/blitz | POST | required/static signal found | role/permission signal found | validation, authentication, authorization, auditTrail, rateLimiting |
| /api/admin/marketing/broadcast | POST | required/static signal found | role/permission signal found | validation, authentication, authorization, rateLimiting |
| /api/admin/mgmt/overview | GET | required/static signal found | role/permission signal found | validation, authentication, authorization, rateLimiting |
| /api/admin/orders | GET | required/static signal found | role/permission signal found | authentication, authorization, rateLimiting |
| /api/admin/orders/{id}/pending-actions | POST | required/static signal found | role/permission signal found | validation, authentication, authorization, rateLimiting |
| /api/admin/payment-settings | GET | required/static signal found | role/permission signal found | authentication, authorization, rateLimiting |
| /api/admin/payment-settings | PUT | required/static signal found | role/permission signal found | authentication, authorization, rateLimiting |
| /api/admin/payment-settings/dedupe | POST | required/static signal found | role/permission signal found | authentication, authorization, rateLimiting |
| /api/admin/pricing | GET | required/static signal found | role/permission signal found | validation, authentication, authorization, rateLimiting |
| /api/admin/pricing | POST | required/static signal found | role/permission signal found | validation, authentication, authorization, rateLimiting |
| /api/admin/pricing/{id} | DELETE | public or optional/static signal found | role/permission signal found | validation, authentication, authorization, rateLimiting |
| /api/admin/pricing/{id} | GET | public or optional/static signal found | role/permission signal found | validation, authentication, authorization, rateLimiting |
| /api/admin/pricing/{id} | PUT | public or optional/static signal found | role/permission signal found | validation, authentication, authorization, rateLimiting |
| /api/admin/products | GET | public or optional/static signal found | role/permission signal found | validation, authentication, authorization, rateLimiting |
| /api/admin/products/ai-add | POST | required/static signal found | role/permission signal found | validation, authentication, authorization, auditTrail, rateLimiting |
| /api/admin/products/archive | DELETE | required/static signal found | role/permission signal found | validation, authentication, authorization, auditTrail, rateLimiting |
| /api/admin/products/archive | GET | public or optional/static signal found | role/permission signal found | validation, authentication, authorization, auditTrail, rateLimiting |
| /api/admin/products/archive | POST | required/static signal found | role/permission signal found | validation, authentication, authorization, auditTrail, rateLimiting |
| /api/admin/products/archive | PUT | required/static signal found | role/permission signal found | validation, authentication, authorization, auditTrail, rateLimiting |
| /api/admin/products/bulk-price | PATCH | required/static signal found | role/permission signal found | validation, authentication, authorization, auditTrail, rateLimiting |
| /api/admin/products/bulk-price | POST | required/static signal found | role/permission signal found | validation, authentication, authorization, auditTrail, rateLimiting |
| /api/admin/products/bulk | POST | required/static signal found | role/permission signal found | validation, authentication, authorization, auditTrail, rateLimiting |
| /api/admin/profile | GET | required/static signal found | role/permission signal found | validation, authentication, authorization, auditTrail, rateLimiting |
| /api/admin/profile | PATCH | required/static signal found | role/permission signal found | validation, authentication, authorization, auditTrail, rateLimiting |
| /api/admin/profile | POST | required/static signal found | role/permission signal found | validation, authentication, authorization, auditTrail, rateLimiting |
| /api/admin/quotes | GET | public or optional/static signal found | role/permission signal found | authentication, authorization, rateLimiting |
| /api/admin/quotes/{id}/download | GET | required/static signal found | role/permission signal found | authentication, authorization, rateLimiting |
| /api/admin/quotes/{id}/respond | POST | required/static signal found | role/permission signal found | authentication, authorization, rateLimiting |
| /api/admin/quotes/advance-payment | GET | required/static signal found | role/permission signal found | validation, authentication, authorization, rateLimiting |
| /api/admin/quotes/advance-payment | POST | required/static signal found | role/permission signal found | validation, authentication, authorization, rateLimiting |
| /api/admin/redemptions/approve | POST | required/static signal found | role/permission signal found | validation, authentication, authorization, rateLimiting |
| /api/admin/redemptions/list | GET | required/static signal found | role/permission signal found | authentication, authorization, rateLimiting |
| /api/admin/redemptions/process | POST | required/static signal found | role/permission signal found | validation, authentication, authorization, rateLimiting |
| /api/admin/roles/set | POST | required/static signal found | role/permission signal found | authentication, authorization, auditTrail, rateLimiting |
| /api/admin/sales-agents | GET | required/static signal found | role/permission signal found | authentication, authorization, rateLimiting |
| /api/admin/sales-agents/{id} | GET | required/static signal found | role/permission signal found | validation, authentication, authorization, rateLimiting |
| /api/admin/sales-agents/{id} | PATCH | required/static signal found | role/permission signal found | validation, authentication, authorization, rateLimiting |
| /api/admin/services | GET | required/static signal found | role/permission signal found | validation, authentication, authorization, rateLimiting |
| /api/admin/setup-initial-admins | POST | required/static signal found | role/permission signal found | authentication, authorization, rateLimiting |
| /api/admin/setup-sales-agents | POST | required/static signal found | role/permission signal found | authentication, authorization, rateLimiting |
| /api/admin/users/{id}/history | GET | required/static signal found | role/permission signal found | authentication, authorization, rateLimiting |
| /api/agents/apply | POST | public or optional/static signal found | none detected for public route | authentication, auditTrail, rateLimiting |
| /api/agents/commissions | GET | required/static signal found | not found | authentication, rateLimiting |
| /api/agents/me | GET | required/static signal found | not found | authentication, rateLimiting |
| /api/agents/orders/create | POST | required/static signal found | role/permission signal found | validation, authentication, authorization, auditTrail, rateLimiting, csrf |
| /api/agents/redemptions | GET | required/static signal found | role/permission signal found | validation, authentication, authorization, rateLimiting |
| /api/agents/redemptions | POST | required/static signal found | role/permission signal found | validation, authentication, authorization, auditTrail, rateLimiting |
| /api/ai/generate-description | POST | required/static signal found | role/permission signal found | validation, authentication, authorization, auditTrail, rateLimiting |
| /api/ai/price-request | POST | required/static signal found | not found | validation, authentication, auditTrail, rateLimiting |
| /api/ai/product-details | POST | required/static signal found | role/permission signal found | validation, authentication, authorization, auditTrail, rateLimiting |
| /api/ai/research | POST | required/static signal found | not found | validation, authentication, auditTrail, rateLimiting |
| /api/analytics | GET | required/static signal found | role/permission signal found | authentication, authorization, auditTrail, rateLimiting |
| /api/analytics/dashboard | GET | required/static signal found | role/permission signal found | authentication, authorization, auditTrail, rateLimiting |
| /api/analytics/reports | GET | required/static signal found | role/permission signal found | validation, authentication, authorization, rateLimiting |
| /api/analytics/track | POST | required/static signal found | not found | validation, authentication, auditTrail, rateLimiting |
| /api/auth/2fa/disable | POST | public or optional/static signal found | role/permission signal found | validation, authentication, authorization, auditTrail, rateLimiting |
| /api/auth/2fa/setup | POST | public or optional/static signal found | role/permission signal found | validation, authentication, authorization, auditTrail, rateLimiting |
| /api/auth/2fa/setup | PUT | public or optional/static signal found | role/permission signal found | validation, authentication, authorization, auditTrail, rateLimiting |
| /api/auth/2fa/status | GET | public or optional/static signal found | role/permission signal found | authentication, authorization, rateLimiting |
| /api/auth/2fa/verify | POST | public or optional/static signal found | role/permission signal found | validation, authentication, authorization, auditTrail, rateLimiting |
| /api/auth/callback | GET | public or optional/static signal found | none detected for public route | authentication, auditTrail, rateLimiting, csrf |
| /api/auth/complete-signup | POST | public or optional/static signal found | role/permission signal found | validation, authentication, authorization, auditTrail, rateLimiting |
| /api/auth/extension | OPTIONS | public or optional/static signal found | role/permission signal found | validation, authentication, authorization, auditTrail, rateLimiting, cors |
| /api/auth/extension | POST | public or optional/static signal found | role/permission signal found | validation, authentication, authorization, auditTrail, rateLimiting, cors |
| /api/auth/first-login-whatsapp | POST | public or optional/static signal found | none detected for public route | validation, authentication, auditTrail, rateLimiting |
| /api/auth/forgot-password | POST | public or optional/static signal found | none detected for public route | validation, authentication, auditTrail, rateLimiting, csrf |
| /api/auth/login | POST | public or optional/static signal found | role/permission signal found | authentication, authorization, rateLimiting, csrf |
| /api/auth/me | GET | public or optional/static signal found | role/permission signal found | authentication, authorization, rateLimiting |
| /api/auth/quick-login | POST | public or optional/static signal found | role/permission signal found | validation, authentication, authorization, auditTrail, rateLimiting |
| /api/auth/resend-verification | POST | not found | none detected for public route | validation, auditTrail, rateLimiting |
| /api/auth/reset-password | POST | public or optional/static signal found | none detected for public route | validation, authentication, auditTrail, rateLimiting |
| /api/auth/resolve-phone | POST | public or optional/static signal found | none detected for public route | validation, authentication, auditTrail, rateLimiting |
| /api/auth/send-otp | POST | public or optional/static signal found | role/permission signal found | validation, authentication, authorization, auditTrail, rateLimiting |
| /api/auth/session | DELETE | public or optional/static signal found | role/permission signal found | authentication, authorization, auditTrail, rateLimiting |
| /api/auth/session | GET | public or optional/static signal found | role/permission signal found | authentication, authorization, auditTrail, rateLimiting |
| /api/auth/session | POST | public or optional/static signal found | role/permission signal found | authentication, authorization, auditTrail, rateLimiting |
| /api/auth/signout | POST | public or optional/static signal found | none detected for public route | authentication, auditTrail, rateLimiting |
| /api/auth/signup | POST | public or optional/static signal found | none detected for public route | validation, authentication, auditTrail, rateLimiting |
| /api/auth/verify-otp | POST | public or optional/static signal found | role/permission signal found | validation, authentication, authorization, auditTrail, rateLimiting |
| /api/auto-offers | DELETE | required/static signal found | role/permission signal found | validation, authentication, authorization, auditTrail, rateLimiting |
| /api/auto-offers | GET | required/static signal found | role/permission signal found | validation, authentication, authorization, rateLimiting |
| /api/auto-offers | POST | required/static signal found | role/permission signal found | validation, authentication, authorization, auditTrail, rateLimiting |
| /api/auto-offers | PUT | required/static signal found | role/permission signal found | validation, authentication, authorization, auditTrail, rateLimiting |
| /api/blog | GET | public or optional/static signal found | role/permission signal found | validation, authentication, authorization, rateLimiting |
| /api/blog | POST | required/static signal found | role/permission signal found | validation, authentication, authorization, auditTrail, rateLimiting |
| /api/blog/{slug} | DELETE | required/static signal found | role/permission signal found | validation, authentication, authorization, auditTrail, rateLimiting |
| /api/blog/{slug} | GET | public or optional/static signal found | role/permission signal found | validation, authentication, authorization, rateLimiting |
| /api/blog/{slug} | PATCH | required/static signal found | role/permission signal found | validation, authentication, authorization, auditTrail, rateLimiting |
| /api/blueprints/attribution/conversion | POST | required/static signal found | not found | validation, authentication, auditTrail, rateLimiting |
| /api/branches | DELETE | required/static signal found | role/permission signal found | validation, authentication, authorization, auditTrail, rateLimiting |
| /api/branches | GET | required/static signal found | role/permission signal found | validation, authentication, authorization, auditTrail, rateLimiting |
| /api/branches | POST | required/static signal found | role/permission signal found | validation, authentication, authorization, auditTrail, rateLimiting |
| /api/campaigns | POST | required/static signal found | role/permission signal found | authentication, authorization, auditTrail, rateLimiting |
| /api/captcha/config | GET | public or optional/static signal found | none detected for public route | authentication, auditTrail, rateLimiting |
| /api/captcha/verify | POST | not found | none detected for public route | validation, auditTrail, rateLimiting |
| /api/cart/abandoned | POST | required/static signal found | not found | validation, authentication, auditTrail, rateLimiting |
| /api/cart/merge | POST | required/static signal found | role/permission signal found | authentication, authorization, auditTrail, rateLimiting |
| /api/cart/sync | POST | required/static signal found | not found | validation, authentication, auditTrail, rateLimiting |
| /api/checkout/calculate | POST | public or optional/static signal found | role/permission signal found | validation, authentication, authorization, auditTrail, rateLimiting |
| /api/commissions/calculate | POST | required/static signal found | role/permission signal found | validation, authentication, authorization, auditTrail, rateLimiting |
| /api/commissions/calculate | PUT | required/static signal found | role/permission signal found | validation, authentication, authorization, auditTrail, rateLimiting |
| /api/commissions/payments | POST | required/static signal found | role/permission signal found | validation, authentication, authorization, auditTrail, rateLimiting |
| /api/commissions/rules | GET | required/static signal found | role/permission signal found | validation, authentication, authorization, auditTrail, rateLimiting |
| /api/commissions/rules | POST | required/static signal found | role/permission signal found | validation, authentication, authorization, auditTrail, rateLimiting |
| /api/contact-messages | GET | public or optional/static signal found | role/permission signal found | validation, authentication, authorization, auditTrail, rateLimiting |
| /api/contact-messages | POST | public or optional/static signal found | role/permission signal found | validation, authentication, authorization, auditTrail, rateLimiting |
| /api/contact-messages/{id} | GET | required/static signal found | role/permission signal found | validation, authentication, authorization, rateLimiting |
| /api/contact-messages/{id} | PATCH | required/static signal found | role/permission signal found | validation, authentication, authorization, auditTrail, rateLimiting |
| /api/contacts/consent | GET | required/static signal found | role/permission signal found | validation, authentication, authorization, auditTrail, rateLimiting |
| /api/contacts/consent | PATCH | required/static signal found | role/permission signal found | validation, authentication, authorization, auditTrail, rateLimiting |
| /api/conversations | PATCH | required/static signal found | role/permission signal found | authentication, authorization, auditTrail, rateLimiting |
| /api/conversations/{id}/assign | PATCH | required/static signal found | role/permission signal found | authentication, authorization, auditTrail, rateLimiting |
| /api/conversations/{sender}/notes | GET | required/static signal found | role/permission signal found | validation, authentication, authorization, auditTrail, rateLimiting |
| /api/conversations/{sender}/notes | POST | required/static signal found | role/permission signal found | validation, authentication, authorization, auditTrail, rateLimiting |
| /api/copilot/command | POST | required/static signal found | role/permission signal found | authentication, authorization, auditTrail, rateLimiting |
| /api/coupons | DELETE | required/static signal found | role/permission signal found | validation, authentication, authorization, auditTrail, rateLimiting |
| /api/coupons | GET | required/static signal found | role/permission signal found | validation, authentication, authorization, auditTrail, rateLimiting |
| /api/coupons | POST | required/static signal found | role/permission signal found | validation, authentication, authorization, auditTrail, rateLimiting |
| /api/coupons | PUT | required/static signal found | role/permission signal found | validation, authentication, authorization, auditTrail, rateLimiting |
| /api/cron/abandoned-carts | GET | required/static signal found | role/permission signal found | authentication, authorization, auditTrail, rateLimiting |
| /api/cron/recover-abandoned-registrations | GET | required/static signal found | role/permission signal found | authentication, authorization, auditTrail, rateLimiting |
| /api/cron/service-retention | GET | required/static signal found | role/permission signal found | authentication, authorization, auditTrail, rateLimiting |
| /api/custom-setup-offers | GET | not found | none detected for public route | rateLimiting |
| /api/custom-setups | GET | not found | none detected for public route | rateLimiting |
| /api/customer-360 | GET | required/static signal found | role/permission signal found | authentication, authorization, auditTrail, rateLimiting |
| /api/customer-promotions | GET | public or optional/static signal found | role/permission signal found | validation, authentication, authorization, rateLimiting |
| /api/customer-promotions | POST | public or optional/static signal found | role/permission signal found | validation, authentication, authorization, auditTrail, rateLimiting |
| /api/customer/notifications | POST | required/static signal found | not found | validation, authentication, auditTrail, rateLimiting |
| /api/customers/register | GET | required/static signal found | not found | validation, authentication, rateLimiting |
| /api/customers/register | POST | required/static signal found | not found | validation, authentication, auditTrail, rateLimiting |
| /api/debug-env | GET | required/static signal found | role/permission signal found | authentication, authorization, auditTrail, rateLimiting |
| /api/discounts | DELETE | required/static signal found | role/permission signal found | validation, authentication, authorization, auditTrail, rateLimiting |
| /api/discounts | GET | required/static signal found | role/permission signal found | validation, authentication, authorization, auditTrail, rateLimiting |
| /api/discounts | POST | required/static signal found | role/permission signal found | validation, authentication, authorization, auditTrail, rateLimiting |
| /api/discounts | PUT | required/static signal found | role/permission signal found | validation, authentication, authorization, auditTrail, rateLimiting |
| /api/discounts/calculate | GET | required/static signal found | role/permission signal found | authentication, authorization, rateLimiting |
| /api/email/abandoned-cart | POST | required/static signal found | not found | validation, authentication, auditTrail, rateLimiting |
| /api/email/email-change | POST | required/static signal found | not found | validation, authentication, auditTrail, rateLimiting |
| /api/email/marketing | POST | required/static signal found | role/permission signal found | validation, authentication, authorization, auditTrail, rateLimiting |
| /api/email/notify-manager | POST | required/static signal found | role/permission signal found | validation, authentication, authorization, auditTrail, rateLimiting |
| /api/email/notify-sales-pickup | POST | required/static signal found | not found | validation, authentication, auditTrail, rateLimiting |
| /api/email/order-approved | POST | required/static signal found | not found | validation, authentication, auditTrail, rateLimiting |
| /api/email/order-completion | POST | required/static signal found | not found | validation, authentication, auditTrail, rateLimiting |
| /api/email/order-confirmation | POST | required/static signal found | not found | validation, authentication, auditTrail, rateLimiting |
| /api/email/order-delivered | POST | required/static signal found | not found | validation, authentication, auditTrail, rateLimiting |
| /api/email/password-reset | POST | required/static signal found | not found | validation, authentication, auditTrail, rateLimiting |
| /api/email/payment-confirmation | POST | required/static signal found | not found | validation, authentication, auditTrail, rateLimiting |
| /api/email/payment-failed | POST | required/static signal found | not found | validation, authentication, auditTrail, rateLimiting |
| /api/email/payment-pending | POST | required/static signal found | not found | validation, authentication, auditTrail, rateLimiting |
| /api/email/pickup | POST | required/static signal found | not found | validation, authentication, auditTrail, rateLimiting |
| /api/email/shipping | POST | required/static signal found | not found | validation, authentication, auditTrail, rateLimiting |
| /api/email/verification | POST | required/static signal found | role/permission signal found | validation, authentication, authorization, auditTrail, rateLimiting |
| /api/email/welcome | POST | required/static signal found | not found | validation, authentication, auditTrail, rateLimiting |
| /api/enterprise-analytics/audit-logs | GET | required/static signal found | role/permission signal found | validation, authentication, authorization, auditTrail, rateLimiting |
| /api/enterprise-analytics/audit-logs | POST | required/static signal found | role/permission signal found | validation, authentication, authorization, auditTrail, rateLimiting |
| /api/enterprise-analytics/dashboard | GET | required/static signal found | role/permission signal found | authentication, authorization, auditTrail, rateLimiting |
| /api/enterprise-analytics/exports | POST | required/static signal found | role/permission signal found | validation, authentication, authorization, auditTrail, rateLimiting |
| /api/enterprise-analytics/filters | GET | required/static signal found | role/permission signal found | validation, authentication, authorization, rateLimiting |
| /api/enterprise-analytics/filters | POST | required/static signal found | role/permission signal found | validation, authentication, authorization, auditTrail, rateLimiting |
| /api/enterprise-analytics/reports | GET | required/static signal found | role/permission signal found | authentication, authorization, auditTrail, rateLimiting |
| /api/enterprise-analytics/search | GET | required/static signal found | role/permission signal found | authentication, authorization, auditTrail, rateLimiting |
| /api/enterprise-analytics/staff-logs | GET | required/static signal found | role/permission signal found | validation, authentication, authorization, rateLimiting |
| /api/enterprise-analytics/staff-logs | POST | required/static signal found | role/permission signal found | validation, authentication, authorization, auditTrail, rateLimiting |
| /api/faqs | GET | not found | none detected for public route | validation, rateLimiting |
| /api/free-installation-slots | GET | required/static signal found | role/permission signal found | authentication, authorization, rateLimiting |
| /api/free-installation-slots | POST | required/static signal found | role/permission signal found | authentication, authorization, auditTrail, rateLimiting |
| /api/gst-verify | GET | not found | none detected for public route | validation, rateLimiting |
| /api/health | GET | public or optional/static signal found | none detected for public route | authentication, auditTrail, rateLimiting |
| /api/health | GET | public or optional/static signal found | none detected for public route | authentication, auditTrail, rateLimiting |
| /api/health | GET | public or optional/static signal found | none detected for public route | authentication, auditTrail, rateLimiting |
| /api/health | GET | public or optional/static signal found | none detected for public route | authentication, auditTrail, rateLimiting |
| /api/health | GET | public or optional/static signal found | none detected for public route | authentication, auditTrail, rateLimiting |
| /api/health | GET | public or optional/static signal found | none detected for public route | authentication, auditTrail |
| /api/health/email | GET | public or optional/static signal found | none detected for public route | authentication, auditTrail, rateLimiting |
| /api/health/orders | GET | public or optional/static signal found | none detected for public route | authentication, auditTrail, rateLimiting |
| /api/health/otp | GET | public or optional/static signal found | none detected for public route | authentication, auditTrail, rateLimiting |
| /api/health/summary | GET | public or optional/static signal found | none detected for public route | authentication, auditTrail, rateLimiting |
| /api/hello | GET | required/static signal found | not found | authentication, auditTrail, rateLimiting |
| /api/inquiries | POST | public or optional/static signal found | none detected for public route | validation, authentication, auditTrail, rateLimiting |
| /api/inventory | GET | required/static signal found | role/permission signal found | validation, authentication, authorization, auditTrail, rateLimiting |
| /api/inventory | POST | required/static signal found | role/permission signal found | validation, authentication, authorization, auditTrail, rateLimiting |
| /api/inventory | PUT | required/static signal found | role/permission signal found | validation, authentication, authorization, auditTrail, rateLimiting |
| /api/inventory/transactions | GET | required/static signal found | role/permission signal found | validation, authentication, authorization, auditTrail, rateLimiting |
| /api/inventory/transactions | POST | required/static signal found | role/permission signal found | validation, authentication, authorization, auditTrail, rateLimiting |
| /api/inventory/transactions | PUT | required/static signal found | role/permission signal found | validation, authentication, authorization, auditTrail, rateLimiting |
| /api/leads/{id}/assign | PATCH | required/static signal found | role/permission signal found | validation, authentication, authorization, auditTrail, rateLimiting |
| /api/marketing/triggers/order-delivered-followup | POST | required/static signal found | not found | validation, authentication, auditTrail, rateLimiting |
| /api/messages | GET | required/static signal found | role/permission signal found | validation, authentication, authorization, auditTrail, rateLimiting |
| /api/messages | POST | required/static signal found | role/permission signal found | validation, authentication, authorization, auditTrail, rateLimiting |
| /api/messages/media | POST | required/static signal found | role/permission signal found | validation, authentication, authorization, auditTrail, rateLimiting |
| /api/messages/read | PATCH | required/static signal found | role/permission signal found | authentication, authorization, auditTrail, rateLimiting |
| /api/metadata | GET | public or optional/static signal found | none detected for public route | authentication, auditTrail, rateLimiting |
| /api/notifications/send | POST | required/static signal found | role/permission signal found | validation, authentication, authorization, auditTrail, rateLimiting |
| /api/offers | DELETE | required/static signal found | role/permission signal found | validation, authentication, authorization, auditTrail, rateLimiting |
| /api/offers | GET | required/static signal found | role/permission signal found | validation, authentication, authorization, auditTrail, rateLimiting |
| /api/offers | POST | required/static signal found | role/permission signal found | validation, authentication, authorization, auditTrail, rateLimiting |
| /api/offers | PUT | required/static signal found | role/permission signal found | validation, authentication, authorization, auditTrail, rateLimiting |
| /api/orders | GET | required/static signal found | role/permission signal found | validation, authentication, authorization, auditTrail, rateLimiting |
| /api/orders | POST | required/static signal found | role/permission signal found | validation, authentication, authorization, auditTrail, rateLimiting |
| /api/orders/{id} | GET | required/static signal found | role/permission signal found | authentication, authorization, auditTrail, rateLimiting |
| /api/orders/{id}/timeline | GET | required/static signal found | role/permission signal found | authentication, authorization, auditTrail, rateLimiting |
| /api/orders/auto-cancel | POST | required/static signal found | role/permission signal found | authentication, authorization, auditTrail, rateLimiting |
| /api/orders/commission | POST | required/static signal found | role/permission signal found | validation, authentication, authorization, auditTrail, rateLimiting |
| /api/orders/update-status | POST | required/static signal found | role/permission signal found | validation, authentication, authorization, auditTrail, rateLimiting |
| /api/organizations | DELETE | required/static signal found | role/permission signal found | validation, authentication, authorization, auditTrail, rateLimiting |
| /api/organizations | GET | required/static signal found | role/permission signal found | validation, authentication, authorization, auditTrail, rateLimiting |
| /api/organizations | POST | required/static signal found | role/permission signal found | validation, authentication, authorization, auditTrail, rateLimiting |
| /api/otp/generate | GET | required/static signal found | role/permission signal found | validation, authentication, authorization, auditTrail, rateLimiting |
| /api/otp/generate | POST | required/static signal found | role/permission signal found | validation, authentication, authorization, auditTrail, rateLimiting |
| /api/otp/resend | GET | required/static signal found | role/permission signal found | validation, authentication, authorization, auditTrail, rateLimiting |
| /api/otp/resend | POST | required/static signal found | role/permission signal found | validation, authentication, authorization, auditTrail, rateLimiting |
| /api/otp/verify | GET | required/static signal found | role/permission signal found | validation, authentication, authorization, auditTrail, rateLimiting |
| /api/otp/verify | POST | required/static signal found | role/permission signal found | validation, authentication, authorization, auditTrail, rateLimiting |
| /api/page-content | DELETE | required/static signal found | role/permission signal found | validation, authentication, authorization, auditTrail, rateLimiting |
| /api/page-content | GET | public or optional/static signal found | role/permission signal found | validation, authentication, authorization, rateLimiting |
| /api/page-content | GET | public or optional/static signal found | none detected for public route | validation, authentication, rateLimiting |
| /api/page-content | POST | required/static signal found | role/permission signal found | validation, authentication, authorization, auditTrail, rateLimiting |
| /api/page-content | PUT | required/static signal found | role/permission signal found | validation, authentication, authorization, auditTrail, rateLimiting |
| /api/payment/payu/callback | POST | public or optional/static signal found | none detected for public route | validation, authentication, auditTrail, rateLimiting |
| /api/payment/payu/initiate | POST | required/static signal found | role/permission signal found | validation, authentication, authorization, auditTrail, rateLimiting |
| /api/payments/update | GET | required/static signal found | role/permission signal found | validation, authentication, authorization, auditTrail, rateLimiting |
| /api/payments/update | POST | required/static signal found | role/permission signal found | validation, authentication, authorization, auditTrail, rateLimiting |
| /api/permissions | GET | required/static signal found | role/permission signal found | authentication, authorization, rateLimiting |
| /api/pricing/calculate | GET | not found | none detected for public route | validation, rateLimiting |
| /api/pricing/calculate | POST | not found | none detected for public route | validation, auditTrail, rateLimiting |
| /api/pricing/customer-type | GET | not found | none detected for public route | validation, rateLimiting |
| /api/pricing/customer-type | POST | not found | none detected for public route | validation, auditTrail, rateLimiting |
| /api/products | DELETE | required/static signal found | role/permission signal found | validation, authentication, authorization, auditTrail, rateLimiting |
| /api/products | GET | public or optional/static signal found | role/permission signal found | validation, authentication, authorization, auditTrail, rateLimiting |
| /api/products | GET | public or optional/static signal found | none detected for public route | validation, authentication, rateLimiting |
| /api/products | POST | required/static signal found | role/permission signal found | validation, authentication, authorization, auditTrail, rateLimiting |
| /api/products | PUT | required/static signal found | role/permission signal found | validation, authentication, authorization, auditTrail, rateLimiting |
| /api/products/{id} | GET | public or optional/static signal found | role/permission signal found | validation, authentication, authorization, auditTrail, rateLimiting |
| /api/products/{id} | PATCH | required/static signal found | role/permission signal found | validation, authentication, authorization, auditTrail, rateLimiting |
| /api/products/bulk-edit | GET | public or optional/static signal found | role/permission signal found | validation, authentication, authorization, auditTrail, rateLimiting |
| /api/products/bulk-edit | POST | required/static signal found | role/permission signal found | validation, authentication, authorization, auditTrail, rateLimiting |
| /api/products/cleanup-images | POST | required/static signal found | role/permission signal found | validation, authentication, authorization, auditTrail, rateLimiting |
| /api/products/cleanup | DELETE | required/static signal found | role/permission signal found | authentication, authorization, auditTrail, rateLimiting |
| /api/products/export | GET | public or optional/static signal found | role/permission signal found | authentication, authorization, rateLimiting |
| /api/products/fix-images | POST | required/static signal found | role/permission signal found | validation, authentication, authorization, auditTrail, rateLimiting |
| /api/products/image-diagnostics | GET | public or optional/static signal found | role/permission signal found | authentication, authorization, rateLimiting |
| /api/products/import | GET | public or optional/static signal found | role/permission signal found | validation, authentication, authorization, rateLimiting |
| /api/products/import | POST | required/static signal found | role/permission signal found | validation, authentication, authorization, auditTrail, rateLimiting |
| /api/products/manual-import | POST | required/static signal found | role/permission signal found | authentication, authorization, auditTrail, rateLimiting |
| /api/products/recommendations | GET | public or optional/static signal found | none detected for public route | authentication, rateLimiting |
| /api/products/scrape-url | POST | required/static signal found | role/permission signal found | validation, authentication, authorization, auditTrail, rateLimiting |
| /api/products/scraper | OPTIONS | required/static signal found | role/permission signal found | validation, authentication, authorization, auditTrail, rateLimiting |
| /api/products/scraper | POST | required/static signal found | role/permission signal found | validation, authentication, authorization, auditTrail, rateLimiting |
| /api/products/scraper/ai | OPTIONS | required/static signal found | role/permission signal found | validation, authentication, authorization, rateLimiting |
| /api/products/scraper/ai | POST | required/static signal found | role/permission signal found | validation, authentication, authorization, auditTrail, rateLimiting |
| /api/products/simple-import | POST | required/static signal found | role/permission signal found | validation, authentication, authorization, auditTrail, rateLimiting |
| /api/products/template | GET | not found | none detected for public route | rateLimiting |
| /api/projects | GET | required/static signal found | role/permission signal found | validation, authentication, authorization, auditTrail, rateLimiting |
| /api/projects | POST | required/static signal found | role/permission signal found | validation, authentication, authorization, auditTrail, rateLimiting |
| /api/projects/{id} | DELETE | required/static signal found | role/permission signal found | validation, authentication, authorization, auditTrail, rateLimiting |
| /api/projects/{id} | PUT | required/static signal found | role/permission signal found | validation, authentication, authorization, auditTrail, rateLimiting |
| /api/projects/{id}/pdf | GET | required/static signal found | not found | authentication, auditTrail, rateLimiting |
| /api/promotions/claim-viral | POST | not found | none detected for public route | validation, auditTrail, rateLimiting |
| /api/promotions/free-installation-claim | POST | not found | none detected for public route | validation, auditTrail, rateLimiting |
| /api/quotes | POST | public or optional/static signal found | none detected for public route | authentication, auditTrail, rateLimiting |
| /api/quotes/{id} | GET | required/static signal found | role/permission signal found | authentication, authorization, auditTrail, rateLimiting |
| /api/quotes/{id}/accept-counter | POST | required/static signal found | role/permission signal found | authentication, authorization, auditTrail, rateLimiting |
| /api/quotes/{id}/advance-payment/confirm | GET | required/static signal found | role/permission signal found | authentication, authorization, rateLimiting |
| /api/quotes/{id}/advance-payment/confirm | POST | required/static signal found | role/permission signal found | authentication, authorization, auditTrail, rateLimiting |
| /api/quotes/{id}/advance-payment/generate-link | POST | required/static signal found | role/permission signal found | authentication, authorization, auditTrail, rateLimiting |
| /api/quotes/{id}/reject-counter | POST | required/static signal found | role/permission signal found | authentication, authorization, auditTrail, rateLimiting |
| /api/quotes/bid | POST | public or optional/static signal found | none detected for public route | validation, authentication, auditTrail, rateLimiting |
| /api/referral | GET | required/static signal found | role/permission signal found | authentication, authorization, rateLimiting |
| /api/referral/claim | POST | required/static signal found | role/permission signal found | validation, authentication, authorization, auditTrail, rateLimiting |
| /api/roles-public | GET | public or optional/static signal found | role/permission signal found | authentication, authorization, rateLimiting |
| /api/roles | DELETE | required/static signal found | role/permission signal found | validation, authentication, authorization, auditTrail, rateLimiting |
| /api/roles | GET | required/static signal found | role/permission signal found | authentication, authorization, rateLimiting |
| /api/roles | GET | required/static signal found | role/permission signal found | validation, authentication, authorization, auditTrail, rateLimiting |
| /api/roles | POST | required/static signal found | role/permission signal found | authentication, authorization, auditTrail, rateLimiting |
| /api/roles | POST | required/static signal found | role/permission signal found | validation, authentication, authorization, auditTrail, rateLimiting |
| /api/sales-agents/apply | POST | public or optional/static signal found | none detected for public route | authentication, auditTrail, rateLimiting |
| /api/security/audit-logs | GET | required/static signal found | role/permission signal found | validation, authentication, authorization, auditTrail, rateLimiting |
| /api/security/audit-logs | POST | required/static signal found | role/permission signal found | validation, authentication, authorization, auditTrail, rateLimiting |
| /api/security/mfa-status | GET | required/static signal found | role/permission signal found | validation, authentication, authorization, auditTrail, rateLimiting |
| /api/security/mfa-status | POST | required/static signal found | role/permission signal found | validation, authentication, authorization, auditTrail, rateLimiting |
| /api/security/settings | GET | required/static signal found | role/permission signal found | validation, authentication, authorization, auditTrail, rateLimiting |
| /api/security/settings | POST | required/static signal found | role/permission signal found | validation, authentication, authorization, auditTrail, rateLimiting |
| /api/security/validate-password | POST | not found | none detected for public route | validation, auditTrail, rateLimiting |
| /api/service-availability | GET | not found | none detected for public route | rateLimiting |
| /api/services | GET | required/static signal found | role/permission signal found | validation, authentication, authorization, auditTrail, rateLimiting |
| /api/services | POST | required/static signal found | role/permission signal found | validation, authentication, authorization, auditTrail, rateLimiting |
| /api/services/{id} | DELETE | required/static signal found | role/permission signal found | validation, authentication, authorization, auditTrail, rateLimiting |
| /api/services/{id} | GET | required/static signal found | role/permission signal found | validation, authentication, authorization, rateLimiting |
| /api/services/{id} | PUT | required/static signal found | role/permission signal found | validation, authentication, authorization, auditTrail, rateLimiting |
| /api/services/engineers | GET | required/static signal found | role/permission signal found | validation, authentication, authorization, rateLimiting |
| /api/services/engineers | POST | required/static signal found | role/permission signal found | validation, authentication, authorization, auditTrail, rateLimiting |
| /api/services/tickets | GET | required/static signal found | role/permission signal found | validation, authentication, authorization, rateLimiting |
| /api/services/tickets | POST | required/static signal found | role/permission signal found | validation, authentication, authorization, auditTrail, rateLimiting |
| /api/services/tickets/{id} | GET | required/static signal found | role/permission signal found | validation, authentication, authorization, auditTrail, rateLimiting |
| /api/services/tickets/{id} | PUT | required/static signal found | role/permission signal found | validation, authentication, authorization, auditTrail, rateLimiting |
| /api/settings | DELETE | required/static signal found | role/permission signal found | validation, authentication, authorization, auditTrail, rateLimiting |
| /api/settings | GET | required/static signal found | role/permission signal found | validation, authentication, authorization, auditTrail, rateLimiting |
| /api/settings | POST | required/static signal found | role/permission signal found | validation, authentication, authorization, auditTrail, rateLimiting |
| /api/settings | PUT | required/static signal found | role/permission signal found | validation, authentication, authorization, auditTrail, rateLimiting |
| /api/shipping | GET | required/static signal found | role/permission signal found | validation, authentication, authorization, rateLimiting |
| /api/shipping | POST | required/static signal found | role/permission signal found | validation, authentication, authorization, auditTrail, rateLimiting |
| /api/shipping/update | GET | required/static signal found | not found | validation, authentication, rateLimiting |
| /api/shipping/update | POST | required/static signal found | not found | validation, authentication, auditTrail, rateLimiting |
| /api/superadmin/areas | DELETE | required/static signal found | role/permission signal found | validation, authentication, authorization, rateLimiting |
| /api/superadmin/areas | GET | required/static signal found | role/permission signal found | validation, authentication, authorization, rateLimiting |
| /api/superadmin/areas | POST | required/static signal found | role/permission signal found | validation, authentication, authorization, rateLimiting |
| /api/superadmin/catalogue/generate | POST | required/static signal found | role/permission signal found | validation, authentication, authorization, rateLimiting |
| /api/superadmin/custom-setup-offers | DELETE | public or optional/static signal found | role/permission signal found | validation, authentication, authorization, auditTrail, rateLimiting |
| /api/superadmin/custom-setup-offers | GET | public or optional/static signal found | role/permission signal found | validation, authentication, authorization, auditTrail, rateLimiting |
| /api/superadmin/custom-setup-offers | POST | public or optional/static signal found | role/permission signal found | validation, authentication, authorization, auditTrail, rateLimiting |
| /api/superadmin/custom-setup-offers | PUT | public or optional/static signal found | role/permission signal found | validation, authentication, authorization, auditTrail, rateLimiting |
| /api/superadmin/dashboard/alerts | GET | required/static signal found | role/permission signal found | validation, authentication, authorization, rateLimiting |
| /api/superadmin/dashboard/alerts | POST | required/static signal found | role/permission signal found | validation, authentication, authorization, rateLimiting |
| /api/superadmin/dashboard/ask | POST | required/static signal found | role/permission signal found | validation, authentication, authorization, auditTrail, rateLimiting |
| /api/superadmin/dashboard/command-center | GET | required/static signal found | role/permission signal found | authentication, authorization, rateLimiting |
| /api/superadmin/dashboard/export | GET | required/static signal found | role/permission signal found | authentication, authorization, auditTrail, rateLimiting |
| /api/superadmin/dashboard/platform-health | GET | required/static signal found | role/permission signal found | authentication, authorization, rateLimiting |
| /api/superadmin/inquiries | GET | public or optional/static signal found | role/permission signal found | authentication, authorization, auditTrail, rateLimiting |
| /api/superadmin/inquiries/{id}/assignment | PATCH | required/static signal found | role/permission signal found | authentication, authorization, auditTrail, rateLimiting |
| /api/superadmin/services/ai-generate | POST | required/static signal found | role/permission signal found | validation, authentication, authorization, rateLimiting |
| /api/templates | GET | required/static signal found | role/permission signal found | validation, authentication, authorization, auditTrail, rateLimiting |
| /api/templates | POST | required/static signal found | role/permission signal found | validation, authentication, authorization, auditTrail, rateLimiting |
| /api/templates/sync | POST | required/static signal found | role/permission signal found | authentication, authorization, auditTrail, rateLimiting |
| /api/trpc/{trpc} | GET | not found | none detected for public route | rateLimiting |
| /api/trpc/{trpc} | POST | required/static signal found | not found | authentication, auditTrail, rateLimiting |
| /api/trpc/contactMessages.submit | POST | publicProcedure | none detected for public procedure | validation, authentication, authorization, auditTrail, rateLimiting |
| /api/trpc/coupons.create | POST | required via tRPC middleware | authenticated user; role not always explicit | validation, authentication, authorization, auditTrail, rateLimiting |
| /api/trpc/coupons.delete | POST | required via tRPC middleware | authenticated user; role not always explicit | validation, authentication, authorization, auditTrail, rateLimiting |
| /api/trpc/coupons.getAll | GET | publicProcedure | none detected for public procedure | authentication, authorization, auditTrail, rateLimiting |
| /api/trpc/coupons.getByCode | GET | publicProcedure | none detected for public procedure | validation, authentication, authorization, auditTrail, rateLimiting |
| /api/trpc/coupons.getById | GET | publicProcedure | none detected for public procedure | validation, authentication, authorization, auditTrail, rateLimiting |
| /api/trpc/coupons.update | POST | required via tRPC middleware | authenticated user; role not always explicit | validation, authentication, authorization, auditTrail, rateLimiting |
| /api/trpc/featureFlags.getAll | GET | publicProcedure | none detected for public procedure | authentication, authorization, rateLimiting |
| /api/trpc/featureFlags.toggle | POST | required via tRPC middleware | authenticated user; role not always explicit | validation, authentication, authorization, rateLimiting |
| /api/trpc/offers.create | POST | required via tRPC middleware | authenticated user; role not always explicit | validation, authentication, authorization, auditTrail, rateLimiting |
| /api/trpc/offers.delete | POST | required via tRPC middleware | authenticated user; role not always explicit | validation, authentication, authorization, auditTrail, rateLimiting |
| /api/trpc/offers.getAll | GET | publicProcedure | none detected for public procedure | validation, authentication, authorization, auditTrail, rateLimiting |
| /api/trpc/offers.update | POST | required via tRPC middleware | authenticated user; role not always explicit | validation, authentication, authorization, auditTrail, rateLimiting |
| /api/trpc/pageContent.get | GET | publicProcedure | none detected for public procedure | validation, authentication, authorization, rateLimiting |
| /api/trpc/pageContent.list_all | GET | required via tRPC middleware | authenticated user; role not always explicit | authentication, authorization, rateLimiting |
| /api/trpc/pageContent.update | POST | required via tRPC middleware | authenticated user; role not always explicit | validation, authentication, authorization, rateLimiting |
| /api/trpc/projects.create | POST | required via tRPC middleware | authenticated user; role not always explicit | validation, authentication, authorization, auditTrail, rateLimiting |
| /api/trpc/projects.delete | POST | required via tRPC middleware | authenticated user; role not always explicit | validation, authentication, authorization, auditTrail, rateLimiting |
| /api/trpc/projects.getAll | GET | publicProcedure | none detected for public procedure | authentication, authorization, auditTrail, rateLimiting |
| /api/upload-from-url | POST | required/static signal found | role/permission signal found | validation, authentication, authorization, auditTrail, rateLimiting |
| /api/upload | POST | required/static signal found | role/permission signal found | validation, authentication, authorization, auditTrail, rateLimiting |
| /api/uploads/quote-documents | POST | required/static signal found | role/permission signal found | validation, authentication, authorization, auditTrail, rateLimiting |
| /api/user/communication-preferences | GET | required/static signal found | role/permission signal found | validation, authentication, authorization, rateLimiting |
| /api/user/communication-preferences | POST | required/static signal found | role/permission signal found | validation, authentication, authorization, auditTrail, rateLimiting |
| /api/user/gdpr/delete | POST | required/static signal found | role/permission signal found | validation, authentication, authorization, auditTrail, rateLimiting |
| /api/user/gdpr/export | GET | required/static signal found | role/permission signal found | authentication, authorization, rateLimiting |
| /api/user/notifications | GET | required/static signal found | role/permission signal found | validation, authentication, authorization, rateLimiting |
| /api/user/notifications | PUT | required/static signal found | role/permission signal found | validation, authentication, authorization, auditTrail, rateLimiting |
| /api/user/wishlist | DELETE | required/static signal found | role/permission signal found | validation, authentication, authorization, auditTrail, rateLimiting |
| /api/user/wishlist | GET | required/static signal found | role/permission signal found | validation, authentication, authorization, rateLimiting |
| /api/user/wishlist | POST | required/static signal found | role/permission signal found | validation, authentication, authorization, auditTrail, rateLimiting |
| /api/users-admin | GET | required/static signal found | role/permission signal found | validation, authentication, authorization, rateLimiting |
| /api/users-admin | POST | required/static signal found | role/permission signal found | validation, authentication, authorization, auditTrail, rateLimiting |
| /api/users | DELETE | required/static signal found | role/permission signal found | validation, authentication, authorization, auditTrail, rateLimiting |
| /api/users | DELETE | required/static signal found | role/permission signal found | validation, authentication, authorization, auditTrail, rateLimiting |
| /api/users | GET | required/static signal found | role/permission signal found | validation, authentication, authorization, auditTrail, rateLimiting |
| /api/users | GET | required/static signal found | role/permission signal found | validation, authentication, authorization, auditTrail, rateLimiting |
| /api/users | GET | required/static signal found | role/permission signal found | authentication, authorization, auditTrail, rateLimiting |
| /api/users | POST | required/static signal found | role/permission signal found | validation, authentication, authorization, auditTrail, rateLimiting |
| /api/users | POST | required/static signal found | role/permission signal found | validation, authentication, authorization, auditTrail, rateLimiting |
| /api/users | PUT | required/static signal found | role/permission signal found | validation, authentication, authorization, auditTrail, rateLimiting |
| /api/users | PUT | required/static signal found | role/permission signal found | validation, authentication, authorization, auditTrail, rateLimiting |
| /api/v1/embed/configurator | GET | required/static signal found | role/permission signal found | validation, authentication, authorization, auditTrail, rateLimiting |
| /api/walk-in-orders | GET | required/static signal found | role/permission signal found | validation, authentication, authorization, auditTrail, rateLimiting |
| /api/walk-in-orders | POST | required/static signal found | role/permission signal found | validation, authentication, authorization, auditTrail, rateLimiting |
| /api/warranty/activate | POST | required/static signal found | not found | validation, authentication, auditTrail, rateLimiting |
| /api/webhook/whatsapp | POST | not found | none detected for public route | validation, auditTrail, rateLimiting |
| /api/webhooks/custom-tunnel/{path*} | POST | public or optional/static signal found | role/permission signal found | validation, authentication, authorization, auditTrail, rateLimiting |
| /api/webhooks/customer/signup | POST | not found | role/permission signal found | validation, authorization, auditTrail, rateLimiting |
| /api/webhooks/orders/cancelled | POST | not found | role/permission signal found | validation, authorization, auditTrail, rateLimiting |
| /api/webhooks/orders/delayed | POST | not found | role/permission signal found | validation, authorization, auditTrail, rateLimiting |
| /api/webhooks/orders/delivered | POST | not found | role/permission signal found | validation, authorization, auditTrail, rateLimiting |
| /api/webhooks/orders/notconfirmed | POST | not found | role/permission signal found | validation, authorization, auditTrail, rateLimiting |
| /api/webhooks/orders/outfordelivery | POST | not found | role/permission signal found | validation, authorization, auditTrail, rateLimiting |
| /api/webhooks/orders/placed | POST | not found | none detected for public route | validation, auditTrail, rateLimiting |
| /api/webhooks/orders/shipped | POST | not found | none detected for public route | validation, auditTrail, rateLimiting |
| /api/webhooks/payment/failed | POST | not found | role/permission signal found | validation, authorization, auditTrail, rateLimiting |
| /api/webhooks/payment/received | POST | not found | role/permission signal found | validation, authorization, auditTrail, rateLimiting |
| /api/webhooks/stats | GET | public or optional/static signal found | role/permission signal found | validation, authentication, authorization, auditTrail, rateLimiting |
| /api/webhooks/stats | POST | public or optional/static signal found | role/permission signal found | validation, authentication, authorization, auditTrail, rateLimiting |
