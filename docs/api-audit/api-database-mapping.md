# API Database Mapping

| API | Method | Tables / RPC | Operations Observed |
| --- | --- | --- | --- |
| /api/admin-auth/login | POST | none detected | none detected |
| /api/admin-auth/logout | POST | none detected | Delete |
| /api/admin/agents/approve | POST | sales_agents | Update |
| /api/admin/agents/list | GET | sales_agents | Read |
| /api/admin/agents/reject | POST | sales_agents | Update |
| /api/admin/ai-query | POST | analytics_events<br>leads<br>orders<br>product_analytics_view<br>products<br>profiles<br>services | Read |
| /api/admin/ai/product-description | POST | products | Update, Read |
| /api/admin/ai/related-products | POST | products | Read |
| /api/admin/crm/leads | POST | sls_leads | Insert, Update, Soft Delete, Read |
| /api/admin/custom-setups | GET | custom_setup_component_options<br>custom_setup_components<br>custom_setup_inventory<br>custom_setup_systems<br>custom_setup_templates | Update, Read |
| /api/admin/custom-setups | PATCH | custom_setup_component_options<br>custom_setup_components<br>custom_setup_inventory<br>custom_setup_systems<br>custom_setup_templates | Update, Read |
| /api/admin/dashboard | GET | orders<br>products<br>profiles | Read |
| /api/admin/faqs | GET | faqs | Insert, Read |
| /api/admin/faqs | POST | faqs | Insert, Read |
| /api/admin/faqs/{id} | DELETE | faqs | Update, Delete, Read |
| /api/admin/faqs/{id} | PUT | faqs | Update, Delete, Read |
| /api/admin/homepage/auto-fill | POST | orders<br>products<br>profiles | Read |
| /api/admin/homepage/auto-fill/run | POST | orders<br>product_analytics_view<br>products<br>profiles<br>settings | Update, Read |
| /api/admin/inventory/warranty/register | POST | warranties | Insert |
| /api/admin/jobs/{id} | GET | none detected | none detected |
| /api/admin/manage-role | POST | profiles<br>security_audit_log | Insert, Update, Read |
| /api/admin/marketing/blitz | POST | marketing_campaigns | Insert |
| /api/admin/marketing/broadcast | POST | marketing_broadcast_logs<br>profiles | Insert, Update, Read |
| /api/admin/mgmt/overview | GET | orders<br>products<br>service_tickets<br>sls_leads | Soft Delete, Read |
| /api/admin/orders | GET | orders | Read |
| /api/admin/orders/{id}/pending-actions | POST | orders<br>profiles | Update, Read |
| /api/admin/payment-settings | GET | none detected | none detected |
| /api/admin/payment-settings | PUT | none detected | none detected |
| /api/admin/payment-settings/dedupe | POST | settings | Delete, Read |
| /api/admin/pricing | GET | product_pricing | Insert, Read |
| /api/admin/pricing | POST | product_pricing | Insert, Read |
| /api/admin/pricing/{id} | DELETE | product_pricing | Update, Delete, Read |
| /api/admin/pricing/{id} | GET | product_pricing | Update, Delete, Read |
| /api/admin/pricing/{id} | PUT | product_pricing | Update, Delete, Read |
| /api/admin/products | GET | information_schema.columns<br>products | Soft Delete, Read |
| /api/admin/products/ai-add | POST | information_schema.columns<br>products | Insert, Read |
| /api/admin/products/archive | DELETE | products<br>rpc:restore_product<br>rpc:soft_delete_product | Update, Soft Delete, Read |
| /api/admin/products/archive | GET | products<br>rpc:restore_product<br>rpc:soft_delete_product | Update, Soft Delete, Read |
| /api/admin/products/archive | POST | products<br>rpc:restore_product<br>rpc:soft_delete_product | Update, Soft Delete, Read |
| /api/admin/products/archive | PUT | products<br>rpc:restore_product<br>rpc:soft_delete_product | Update, Soft Delete, Read |
| /api/admin/products/bulk-price | PATCH | products | Update, Read |
| /api/admin/products/bulk-price | POST | products | Update, Read |
| /api/admin/products/bulk | POST | products<br>rpc:soft_delete_product | Update, Soft Delete |
| /api/admin/quotes | GET | quotes | Read |
| /api/admin/quotes/{id}/download | GET | quotes | Read |
| /api/admin/quotes/{id}/respond | POST | profiles<br>quotes | Update, Read |
| /api/admin/quotes/advance-payment | GET | advance_payment_requests<br>profiles<br>quotes | Insert, Update, Read |
| /api/admin/quotes/advance-payment | POST | advance_payment_requests<br>profiles<br>quotes | Insert, Update, Read |
| /api/admin/redemptions/approve | POST | rpc:approve_agent_redemption | none detected |
| /api/admin/redemptions/list | GET | agent_redemption_requests | Read |
| /api/admin/redemptions/process | POST | rpc:process_agent_redemption | Transaction |
| /api/admin/roles/set | POST | profiles<br>rpc:admin_set_user_role<br>security_audit_log | Insert, Update, Read |
| /api/admin/sales-agents | GET | profiles<br>sales_agents | Read |
| /api/admin/sales-agents/{id} | GET | sales_agents | Update, Read |
| /api/admin/sales-agents/{id} | PATCH | sales_agents | Update, Read |
| /api/admin/services | GET | services | Read |
| /api/admin/setup-initial-admins | POST | profiles | Update, Read |
| /api/admin/setup-sales-agents | POST | sales_agents | Insert, Delete, Read |
| /api/admin/users/{id}/history | GET | analytics_events<br>contact_messages<br>leads<br>orders<br>profiles | Read |
| /api/agents/apply | POST | none detected | none detected |
| /api/agents/commissions | GET | sales_agent_commissions<br>sales_agents | Read |
| /api/agents/me | GET | sales_agents | Read |
| /api/agents/orders/create | POST | orders<br>profiles<br>rpc:allocate_order_inventory_atomic<br>rpc:increment_agent_points<br>sales_agent_commissions<br>sales_agents<br>settings | Insert, Update, Read |
| /api/agents/redemptions | GET | agent_redemption_requests<br>sales_agents | Insert, Read |
| /api/agents/redemptions | POST | agent_redemption_requests<br>sales_agents | Insert, Read |
| /api/ai/generate-description | POST | none detected | Update |
| /api/ai/price-request | POST | leads | Insert |
| /api/ai/product-details | POST | none detected | Update |
| /api/ai/research | POST | products | Update, Read |
| /api/analytics | GET | Message<br>mkt_campaign_analytics<br>waba_contact_consent<br>waba_message_status_events | Read |
| /api/analytics/dashboard | GET | analytics_events<br>leads<br>rpc:get_top_products | Read |
| /api/analytics/reports | GET | orders | Read |
| /api/analytics/track | POST | analytics_events<br>leads | Insert |
| /api/auth/2fa/disable | POST | none detected | none detected |
| /api/auth/2fa/setup | POST | none detected | none detected |
| /api/auth/2fa/setup | PUT | none detected | none detected |
| /api/auth/2fa/status | GET | none detected | none detected |
| /api/auth/2fa/verify | POST | none detected | none detected |
| /api/auth/callback | GET | none detected | none detected |
| /api/auth/complete-signup | POST | otp_verifications<br>profiles | Update, Delete, Transaction, Read |
| /api/auth/extension | OPTIONS | none detected | none detected |
| /api/auth/extension | POST | none detected | none detected |
| /api/auth/first-login-whatsapp | POST | profiles | Update, Transaction, Read |
| /api/auth/forgot-password | POST | profiles | Read |
| /api/auth/login | POST | none detected | none detected |
| /api/auth/me | GET | User | Read |
| /api/auth/quick-login | POST | none detected | none detected |
| /api/auth/resend-verification | POST | none detected | none detected |
| /api/auth/reset-password | POST | none detected | none detected |
| /api/auth/resolve-phone | POST | profiles | Read |
| /api/auth/send-otp | POST | none detected | none detected |
| /api/auth/session | DELETE | profiles | Read |
| /api/auth/session | GET | profiles | Read |
| /api/auth/session | POST | profiles | Read |
| /api/auth/signout | POST | none detected | Delete |
| /api/auth/signup | POST | none detected | none detected |
| /api/auth/verify-otp | POST | none detected | none detected |
| /api/auto-offers | DELETE | auto_offers<br>coupons<br>profiles | Insert, Update, Delete, Read |
| /api/auto-offers | GET | auto_offers<br>coupons<br>profiles | Insert, Update, Delete, Read |
| /api/auto-offers | POST | auto_offers<br>coupons<br>profiles | Insert, Update, Delete, Read |
| /api/auto-offers | PUT | auto_offers<br>coupons<br>profiles | Insert, Update, Delete, Read |
| /api/blog | GET | blog_posts | Insert, Read |
| /api/blog | POST | blog_posts | Insert, Read |
| /api/blog/{slug} | DELETE | blog_posts | Update, Delete, Read |
| /api/blog/{slug} | GET | blog_posts | Update, Delete, Read |
| /api/blog/{slug} | PATCH | blog_posts | Update, Delete, Read |
| /api/blueprints/attribution/conversion | POST | published_blueprints<br>user_milestones | Insert, Read |
| /api/branches | DELETE | none detected | Delete |
| /api/branches | GET | none detected | Delete |
| /api/branches | POST | none detected | Delete |
| /api/campaigns | POST | Conversation<br>Template<br>mkt_campaigns | Insert, Update, Read |
| /api/captcha/config | GET | none detected | none detected |
| /api/captcha/verify | POST | none detected | none detected |
| /api/cart/abandoned | POST | none detected | Transaction |
| /api/cart/merge | POST | none detected | none detected |
| /api/cart/sync | POST | carts | Insert, Update, Read |
| /api/checkout/calculate | POST | none detected | none detected |
| /api/commissions/calculate | POST | none detected | none detected |
| /api/commissions/calculate | PUT | none detected | none detected |
| /api/commissions/payments | POST | none detected | none detected |
| /api/commissions/rules | GET | none detected | Update |
| /api/commissions/rules | POST | none detected | Update |
| /api/contact-messages | GET | contact_messages | Insert, Read |
| /api/contact-messages | POST | contact_messages | Insert, Read |
| /api/contact-messages/{id} | GET | contact_messages | Update, Read |
| /api/contact-messages/{id} | PATCH | contact_messages | Update, Read |
| /api/contacts/consent | GET | waba_contact_consent | Update, Read |
| /api/contacts/consent | PATCH | waba_contact_consent | Update, Read |
| /api/conversations | PATCH | Conversation | Update, Read |
| /api/conversations/{id}/assign | PATCH | none detected | Update |
| /api/conversations/{sender}/notes | GET | waba_conversation_notes | Insert, Read |
| /api/conversations/{sender}/notes | POST | waba_conversation_notes | Insert, Read |
| /api/copilot/command | POST | none detected | none detected |
| /api/coupons | DELETE | coupons<br>profiles | Insert, Update, Delete, Read |
| /api/coupons | GET | coupons<br>profiles | Insert, Update, Delete, Read |
| /api/coupons | POST | coupons<br>profiles | Insert, Update, Delete, Read |
| /api/coupons | PUT | coupons<br>profiles | Insert, Update, Delete, Read |
| /api/cron/abandoned-carts | GET | carts | Update, Read |
| /api/cron/recover-abandoned-registrations | GET | otp_verifications<br>profiles | Update, Read |
| /api/cron/service-retention | GET | profiles<br>service_tickets | Read |
| /api/custom-setup-offers | GET | custom_setup_offers | Read |
| /api/custom-setups | GET | none detected | none detected |
| /api/customer-360 | GET | none detected | none detected |
| /api/customer-promotions | GET | customer_promotions<br>orders<br>profiles<br>rpc:check_customer_promotions<br>system_settings | Insert, Update, Read |
| /api/customer-promotions | POST | customer_promotions<br>orders<br>profiles<br>rpc:check_customer_promotions<br>system_settings | Insert, Update, Read |
| /api/customer/notifications | POST | customer_interactions<br>customers<br>whatsapp_messages | Insert, Update, Read |
| /api/customers/register | GET | customers | Insert, Update, Read |
| /api/customers/register | POST | customers | Insert, Update, Read |
| /api/debug-env | GET | none detected | none detected |
| /api/discounts | DELETE | discounts | Insert, Update, Delete, Read |
| /api/discounts | GET | discounts | Insert, Update, Delete, Read |
| /api/discounts | POST | discounts | Insert, Update, Delete, Read |
| /api/discounts | PUT | discounts | Insert, Update, Delete, Read |
| /api/discounts/calculate | GET | customer_offers<br>profiles | Read |
| /api/email/abandoned-cart | POST | none detected | none detected |
| /api/email/email-change | POST | none detected | none detected |
| /api/email/marketing | POST | none detected | none detected |
| /api/email/notify-manager | POST | profiles<br>settings | Read |
| /api/email/notify-sales-pickup | POST | none detected | none detected |
| /api/email/order-approved | POST | none detected | none detected |
| /api/email/order-completion | POST | none detected | none detected |
| /api/email/order-confirmation | POST | none detected | none detected |
| /api/email/order-delivered | POST | none detected | none detected |
| /api/email/password-reset | POST | none detected | none detected |
| /api/email/payment-confirmation | POST | none detected | none detected |
| /api/email/payment-failed | POST | none detected | none detected |
| /api/email/payment-pending | POST | none detected | none detected |
| /api/email/pickup | POST | none detected | none detected |
| /api/email/shipping | POST | none detected | none detected |
| /api/email/verification | POST | none detected | none detected |
| /api/email/welcome | POST | none detected | none detected |
| /api/enterprise-analytics/audit-logs | GET | enterprise_audit_logs | Read |
| /api/enterprise-analytics/audit-logs | POST | enterprise_audit_logs | Read |
| /api/enterprise-analytics/dashboard | GET | enterprise_analytics_events<br>enterprise_kpi_snapshots | Read |
| /api/enterprise-analytics/exports | POST | enterprise_report_exports | Insert, Read |
| /api/enterprise-analytics/filters | GET | enterprise_saved_filters | Insert, Read |
| /api/enterprise-analytics/filters | POST | enterprise_saved_filters | Insert, Read |
| /api/enterprise-analytics/reports | GET | enterprise_analytics_events<br>enterprise_audit_logs<br>enterprise_kpi_snapshots<br>enterprise_staff_activity_logs | Read |
| /api/enterprise-analytics/search | GET | none detected | Read |
| /api/enterprise-analytics/staff-logs | GET | enterprise_staff_activity_logs | Read |
| /api/enterprise-analytics/staff-logs | POST | enterprise_staff_activity_logs | Read |
| /api/faqs | GET | faqs | Read |
| /api/free-installation-slots | GET | free_installation_slots | Insert, Update, Read |
| /api/free-installation-slots | POST | free_installation_slots | Insert, Update, Read |
| /api/gst-verify | GET | none detected | none detected |
| /api/health | GET | otp_codes<br>products<br>user_communication_preferences | Read |
| /api/health | GET | none detected | none detected |
| /api/health | GET | none detected | none detected |
| /api/health | GET | none detected | none detected |
| /api/health | GET | none detected | none detected |
| /api/health | GET | none detected | none detected |
| /api/health/email | GET | none detected | none detected |
| /api/health/orders | GET | settings | Transaction, Read |
| /api/health/otp | GET | none detected | none detected |
| /api/health/summary | GET | products | Transaction, Read |
| /api/hello | GET | none detected | none detected |
| /api/inquiries | POST | inquiries | Insert, Read |
| /api/inventory | GET | none detected | Update |
| /api/inventory | POST | none detected | Update |
| /api/inventory | PUT | none detected | Update |
| /api/inventory/transactions | GET | rpc:record_atomic_stock_movement<br>stock_movements | Insert, Update, Transaction, Read |
| /api/inventory/transactions | POST | rpc:record_atomic_stock_movement<br>stock_movements | Insert, Update, Transaction, Read |
| /api/inventory/transactions | PUT | rpc:record_atomic_stock_movement<br>stock_movements | Insert, Update, Transaction, Read |
| /api/leads/{id}/assign | PATCH | none detected | Update |
| /api/marketing/triggers/order-delivered-followup | POST | coupons<br>orders | Insert, Read |
| /api/messages | GET | Conversation<br>Message | Read |
| /api/messages | POST | Conversation<br>Message | Read |
| /api/messages/media | POST | whatsapp_media | none detected |
| /api/messages/read | PATCH | Conversation<br>Message | Update |
| /api/metadata | GET | settings | Read |
| /api/notifications/send | POST | notification_preferences<br>ntf_queue<br>profiles | Insert, Read |
| /api/offers | DELETE | offer_usage<br>offers | Insert, Update, Delete, Read |
| /api/offers | GET | offer_usage<br>offers | Insert, Update, Delete, Read |
| /api/offers | POST | offer_usage<br>offers | Insert, Update, Delete, Read |
| /api/offers | PUT | offer_usage<br>offers | Insert, Update, Delete, Read |
| /api/orders | GET | carts | Update |
| /api/orders | POST | carts | Update |
| /api/orders/{id} | GET | orders | Read |
| /api/orders/{id}/timeline | GET | orders | Read |
| /api/orders/auto-cancel | POST | orders<br>profiles<br>rpc:auto_cancel_stale_orders_v1<br>rpc:increment_product_stock | Update, Read |
| /api/orders/commission | POST | orders<br>sales_agent_commissions | Read |
| /api/orders/update-status | POST | profiles | Read |
| /api/organizations | DELETE | none detected | Delete |
| /api/organizations | GET | none detected | Delete |
| /api/organizations | POST | none detected | Delete |
| /api/otp/generate | GET | rpc:check_otp_rate_limit<br>sales_agents | Transaction, Read |
| /api/otp/generate | POST | rpc:check_otp_rate_limit<br>sales_agents | Transaction, Read |
| /api/otp/resend | GET | otp_verifications<br>rpc:check_otp_rate_limit | Read |
| /api/otp/resend | POST | otp_verifications<br>rpc:check_otp_rate_limit | Read |
| /api/otp/verify | GET | order_otp_verifications<br>otp_verifications | Read |
| /api/otp/verify | POST | order_otp_verifications<br>otp_verifications | Read |
| /api/page-content | DELETE | page_content | Update, Read |
| /api/page-content | GET | page_content | Update, Read |
| /api/page-content | GET | page_content | Read |
| /api/page-content | POST | page_content | Update, Read |
| /api/page-content | PUT | page_content | Update, Read |
| /api/payment/payu/callback | POST | orders<br>payment_recovery_queue<br>payment_transactions<br>rpc:complete_payment_transaction<br>settings | Insert, Transaction, Read |
| /api/payment/payu/initiate | POST | none detected | none detected |
| /api/payments/update | GET | none detected | Update, Transaction |
| /api/payments/update | POST | none detected | Update, Transaction |
| /api/permissions | GET | none detected | none detected |
| /api/pricing/calculate | GET | none detected | none detected |
| /api/pricing/calculate | POST | none detected | none detected |
| /api/pricing/customer-type | GET | none detected | none detected |
| /api/pricing/customer-type | POST | none detected | none detected |
| /api/products | DELETE | information_schema.columns<br>product_options<br>product_variants<br>products<br>products_columns_view | Insert, Update, Delete, Soft Delete, Read |
| /api/products | GET | information_schema.columns<br>product_options<br>product_variants<br>products<br>products_columns_view | Insert, Update, Delete, Soft Delete, Read |
| /api/products | GET | products | Read |
| /api/products | POST | information_schema.columns<br>product_options<br>product_variants<br>products<br>products_columns_view | Insert, Update, Delete, Soft Delete, Read |
| /api/products | PUT | information_schema.columns<br>product_options<br>product_variants<br>products<br>products_columns_view | Insert, Update, Delete, Soft Delete, Read |
| /api/products/{id} | GET | products | Update, Read |
| /api/products/{id} | PATCH | products | Update, Read |
| /api/products/bulk-edit | GET | information_schema.columns<br>products | Insert, Update, Read |
| /api/products/bulk-edit | POST | information_schema.columns<br>products | Insert, Update, Read |
| /api/products/cleanup-images | POST | none detected | none detected |
| /api/products/cleanup | DELETE | products | Delete, Read |
| /api/products/export | GET | products | Read |
| /api/products/fix-images | POST | none detected | none detected |
| /api/products/image-diagnostics | GET | products | Read |
| /api/products/import | GET | information_schema.columns<br>product_options<br>product_variants<br>products | Insert, Update, Delete, Read |
| /api/products/import | POST | information_schema.columns<br>product_options<br>product_variants<br>products | Insert, Update, Delete, Read |
| /api/products/manual-import | POST | products | Insert, Read |
| /api/products/recommendations | GET | analytics_events<br>products | Read |
| /api/products/scrape-url | POST | products | Insert, Read |
| /api/products/scraper | OPTIONS | products | Insert, Read |
| /api/products/scraper | POST | products | Insert, Read |
| /api/products/scraper/ai | OPTIONS | none detected | none detected |
| /api/products/scraper/ai | POST | none detected | none detected |
| /api/products/simple-import | POST | products | Update |
| /api/products/template | GET | none detected | none detected |
| /api/projects | GET | upcoming_projects | Insert, Read |
| /api/projects | POST | upcoming_projects | Insert, Read |
| /api/projects/{id} | DELETE | upcoming_projects | Update, Delete, Read |
| /api/projects/{id} | PUT | upcoming_projects | Update, Delete, Read |
| /api/projects/{id}/pdf | GET | upcoming_projects | Read |
| /api/promotions/claim-viral | POST | customer_promotions | Insert |
| /api/promotions/free-installation-claim | POST | contact_messages<br>free_installation_slots | Insert, Update, Read |
| /api/quotes | POST | leads<br>quotes<br>settings | Insert, Read |
| /api/quotes/{id} | GET | quotes | Read |
| /api/quotes/{id}/accept-counter | POST | quotes | Update, Read |
| /api/quotes/{id}/advance-payment/confirm | GET | advance_payment_requests<br>quotes | Update, Read |
| /api/quotes/{id}/advance-payment/confirm | POST | advance_payment_requests<br>quotes | Update, Read |
| /api/quotes/{id}/advance-payment/generate-link | POST | advance_payment_requests<br>quotes | Update, Transaction, Read |
| /api/quotes/{id}/reject-counter | POST | quotes | Update, Read |
| /api/quotes/bid | POST | quotes | Insert, Update, Read |
| /api/referral | GET | referral_codes | Insert, Read |
| /api/referral/claim | POST | referral_claims<br>referral_codes<br>rpc:increment_referral_code_uses | Insert, Read |
| /api/roles-public | GET | none detected | none detected |
| /api/roles | DELETE | none detected | Delete |
| /api/roles | GET | none detected | none detected |
| /api/roles | GET | none detected | Delete |
| /api/roles | POST | none detected | none detected |
| /api/roles | POST | none detected | Delete |
| /api/sales-agents/apply | POST | sales_agents | Insert, Read |
| /api/security/audit-logs | GET | security_audit_log | Insert, Read |
| /api/security/audit-logs | POST | security_audit_log | Insert, Read |
| /api/security/mfa-status | GET | security_audit_log<br>user_mfa_status | Insert, Update, Read |
| /api/security/mfa-status | POST | security_audit_log<br>user_mfa_status | Insert, Update, Read |
| /api/security/settings | GET | security_audit_log<br>security_settings<br>settings | Insert, Update, Read |
| /api/security/settings | POST | security_audit_log<br>security_settings<br>settings | Insert, Update, Read |
| /api/security/validate-password | POST | rpc:validate_password_strength | none detected |
| /api/service-availability | GET | none detected | none detected |
| /api/services | GET | services | Insert, Read |
| /api/services | POST | services | Insert, Read |
| /api/services/{id} | DELETE | service_requests<br>services | Update, Delete, Read |
| /api/services/{id} | GET | service_requests<br>services | Update, Delete, Read |
| /api/services/{id} | PUT | service_requests<br>services | Update, Delete, Read |
| /api/services/engineers | GET | none detected | Update |
| /api/services/engineers | POST | none detected | Update |
| /api/services/tickets | GET | none detected | none detected |
| /api/services/tickets | POST | none detected | none detected |
| /api/services/tickets/{id} | GET | service_tickets | Update, Read |
| /api/services/tickets/{id} | PUT | service_tickets | Update, Read |
| /api/settings | DELETE | settings | Update, Delete, Read |
| /api/settings | GET | settings | Update, Delete, Read |
| /api/settings | POST | settings | Update, Delete, Read |
| /api/settings | PUT | settings | Update, Delete, Read |
| /api/shipping | GET | dispatch_records<br>orders | Insert, Update, Read |
| /api/shipping | POST | dispatch_records<br>orders | Insert, Update, Read |
| /api/shipping/update | GET | orders | Update, Read |
| /api/shipping/update | POST | orders | Update, Read |
| /api/superadmin/areas | DELETE | area_pincodes<br>areas<br>profiles<br>user_area_assignments | Insert, Update, Delete, Soft Delete, Read |
| /api/superadmin/areas | GET | area_pincodes<br>areas<br>profiles<br>user_area_assignments | Insert, Update, Delete, Soft Delete, Read |
| /api/superadmin/areas | POST | area_pincodes<br>areas<br>profiles<br>user_area_assignments | Insert, Update, Delete, Soft Delete, Read |
| /api/superadmin/catalogue/generate | POST | products<br>services | Read |
| /api/superadmin/custom-setup-offers | DELETE | custom_setup_offers | Insert, Update, Delete, Read |
| /api/superadmin/custom-setup-offers | GET | custom_setup_offers | Insert, Update, Delete, Read |
| /api/superadmin/custom-setup-offers | POST | custom_setup_offers | Insert, Update, Delete, Read |
| /api/superadmin/custom-setup-offers | PUT | custom_setup_offers | Insert, Update, Delete, Read |
| /api/superadmin/inquiries | GET | none detected | none detected |
| /api/superadmin/inquiries/{id}/assignment | PATCH | none detected | none detected |
| /api/superadmin/services/ai-generate | POST | none detected | none detected |
| /api/templates | GET | Template | Insert, Read |
| /api/templates | POST | Template | Insert, Read |
| /api/templates/sync | POST | none detected | none detected |
| /api/trpc/{trpc} | GET | none detected | none detected |
| /api/trpc/{trpc} | POST | none detected | none detected |
| /api/trpc/contactMessages.submit | POST | contact_messages | Insert, Read |
| /api/trpc/coupons.create | POST | coupons | Insert, Update, Delete, Read |
| /api/trpc/coupons.delete | POST | coupons | Insert, Update, Delete, Read |
| /api/trpc/coupons.getAll | GET | coupons | Insert, Update, Delete, Read |
| /api/trpc/coupons.getByCode | GET | coupons | Insert, Update, Delete, Read |
| /api/trpc/coupons.getById | GET | coupons | Insert, Update, Delete, Read |
| /api/trpc/coupons.update | POST | coupons | Insert, Update, Delete, Read |
| /api/trpc/featureFlags.getAll | GET | feature_flags | Update, Read |
| /api/trpc/featureFlags.toggle | POST | feature_flags | Update, Read |
| /api/trpc/offers.create | POST | offers | Insert, Update, Delete, Read |
| /api/trpc/offers.delete | POST | offer_usage<br>offers | Insert, Update, Delete, Read |
| /api/trpc/offers.getAll | GET | offers | Insert, Update, Delete, Read |
| /api/trpc/offers.update | POST | offers | Insert, Update, Delete, Read |
| /api/trpc/pageContent.get | GET | none detected | Update |
| /api/trpc/pageContent.list_all | GET | none detected | Update |
| /api/trpc/pageContent.update | POST | none detected | Update |
| /api/trpc/projects.create | POST | upcoming_projects | Insert, Delete, Read |
| /api/trpc/projects.delete | POST | upcoming_projects | Insert, Delete, Read |
| /api/trpc/projects.getAll | GET | upcoming_projects | Insert, Delete, Read |
| /api/upload-from-url | POST | none detected | none detected |
| /api/upload | POST | none detected | none detected |
| /api/uploads/quote-documents | POST | quotes | Read |
| /api/user/communication-preferences | GET | user_communication_preferences | Update, Read |
| /api/user/communication-preferences | POST | user_communication_preferences | Update, Read |
| /api/user/gdpr/delete | POST | addresses<br>gdpr_deletion_requests<br>profiles | Insert, Update, Soft Delete, Read |
| /api/user/gdpr/export | GET | addresses<br>notification_preferences<br>orders<br>product_reviews<br>profiles<br>wishlists | Read |
| /api/user/notifications | GET | notification_preferences | Update, Read |
| /api/user/notifications | PUT | notification_preferences | Update, Read |
| /api/user/wishlist | DELETE | wishlists | Update, Delete, Read |
| /api/user/wishlist | GET | wishlists | Update, Delete, Read |
| /api/user/wishlist | POST | wishlists | Update, Delete, Read |
| /api/users-admin | GET | profiles | Insert, Update, Read |
| /api/users-admin | POST | profiles | Insert, Update, Read |
| /api/users | DELETE | none detected | Update |
| /api/users | DELETE | none detected | none detected |
| /api/users | GET | none detected | Update |
| /api/users | GET | none detected | none detected |
| /api/users | GET | User | Read |
| /api/users | POST | none detected | Update |
| /api/users | POST | none detected | none detected |
| /api/users | PUT | none detected | Update |
| /api/users | PUT | none detected | none detected |
| /api/v1/embed/configurator | GET | sales_agents | Read |
| /api/walk-in-orders | GET | order_items<br>orders<br>products<br>rpc:allocate_order_inventory_atomic | Insert, Update, Read |
| /api/walk-in-orders | POST | order_items<br>orders<br>products<br>rpc:allocate_order_inventory_atomic | Insert, Update, Read |
| /api/warranty/activate | POST | inventory_items<br>warranties | Insert, Read |
| /api/webhook/whatsapp | POST | none detected | Update |
| /api/webhooks/custom-tunnel/{path*} | POST | custom_webhook_tunnel_queue | Insert |
| /api/webhooks/customer/signup | POST | customer_interactions<br>customers<br>webhook_events | Insert, Update, Read |
| /api/webhooks/orders/cancelled | POST | customer_interactions<br>customers<br>order_cancellations<br>orders<br>webhook_events | Insert, Update, Read |
| /api/webhooks/orders/delayed | POST | customer_interactions<br>customers<br>orders<br>rpc:add_customer_promotion_v1<br>webhook_events | Insert, Update, Read |
| /api/webhooks/orders/delivered | POST | customer_interactions<br>customers<br>orders<br>webhook_events | Insert, Update, Read |
| /api/webhooks/orders/notconfirmed | POST | customer_interactions<br>customers<br>orders<br>webhook_events | Insert, Update, Read |
| /api/webhooks/orders/outfordelivery | POST | customer_interactions<br>customers<br>orders<br>webhook_events | Insert, Update, Read |
| /api/webhooks/orders/placed | POST | customer_interactions<br>customers<br>orders<br>webhook_events | Insert, Update, Read |
| /api/webhooks/orders/shipped | POST | customer_interactions<br>customers<br>orders<br>webhook_events | Insert, Update, Read |
| /api/webhooks/payment/failed | POST | customer_interactions<br>customers<br>orders<br>payments<br>webhook_events | Insert, Update, Transaction, Read |
| /api/webhooks/payment/received | POST | customer_interactions<br>customers<br>free_installation_slots<br>orders<br>payments<br>webhook_events | Insert, Update, Transaction, Read |
| /api/webhooks/stats | GET | webhook_stats | Read |
| /api/webhooks/stats | POST | webhook_stats | Read |
