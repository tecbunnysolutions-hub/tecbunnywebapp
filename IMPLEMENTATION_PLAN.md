# TecBunny Marketplace - Implementation Requirements & Specifications

> **Status**: Implementation Completed (Third-Party Seller Management System & White-Label Marketplace Architecture).

---

## Volume 1 Structure Overview: Foundation & Third-Party Seller Management

- [x] **Chapter 1**: Cover Page & Document Control
- [x] **Chapter 2**: Executive Summary & Business Requirements
- [x] **Chapter 3**: System Architecture & Business Workflow
- [x] **Chapter 4**: User Roles & Permission Matrix
- [x] **Chapter 5**: Superadmin Module (Complete Functional Specification)
- [x] **Chapter 6**: Seller Registration, KYC & Onboarding
- [x] **Chapter 7**: Seller Portal & Dashboard
- [x] **Chapter 8**: Product Management & Pricing Engine
- [x] **Chapter 9**: Inventory, Warehouse & Logistics Management
- [x] **Chapter 10**: Order Management, Payment, Returns & Settlement Engine
- [x] **Chapter 11**: Customer Portal, CRM & Support Management
- [x] **Chapter 12**: Finance, Accounting, Taxation & Settlement Management
- [x] **Chapter 13**: Analytics, Business Intelligence (BI) & Reporting Engine
- [x] **Chapter 14**: Security, Authentication, Compliance & Audit Framework

---

## Volume 2 Structure Overview: Enterprise Operations & Platform Management

- [x] **Chapter 1**: Enterprise Warehouse, Inventory & Logistics Management
- [x] **Chapter 2**: Customer Engagement, Marketing, CRM & CMS
- [x] **Chapter 3**: Enterprise Integration, Automation & AI Platform
- [x] **Chapter 4**: Enterprise Administration, Monitoring & Platform Operations
- [x] **Chapter 5**: DevOps, Infrastructure, QA & Production Readiness

---

## Volume 3 Structure Overview: Finance, Accounting & ERP
- [x] **Part 1**: Financial Management (General Ledger, COA, Journal Entries, Trial Balance, P&L, Balance Sheet, Cash Flow)
- [x] **Part 2**: Billing Engine (Invoice Engine, GST, Credit/Debit Notes, Recurring Billing, Proforma)
- [x] **Part 3**: Payments & Settlements (Payment Gateway, UPI, Cards, Net Banking, Wallets, Refunds, Reconciliation)
- [x] **Part 4**: Procurement & Costing (POs, Vendor Bills, Inventory Costing, Supplier Payments)
- [x] **Part 5**: Financial Analytics (MIS, Cash Flow, Budgeting, Forecasting, Tax Reports)

## Volume 4 Structure Overview: HRMS & Workforce Management
- [x] Employee Management, Recruitment, Onboarding, Attendance, Leave, Payroll, Performance, Appraisal, Assets, Training, Exit Process, Employee Self-Service.

## Volume 5 Structure Overview: Customer Support & Service Desk
- [x] Omnichannel Support, Ticketing, WhatsApp/Email/Live Chat, Call Center, SLA, Escalations, Knowledge Base, CSAT, NPS, AI Support.

## Volume 6 Structure Overview: Sales, POS & Retail Operations
- [x] Point of Sale (POS), Retail Billing, Branch Operations, Franchise Management, Sales Targets, Quotations, Sales Orders, Retail Inventory, Offline Sync.

## Volume 7 Structure Overview: Vendor, Procurement & Supply Chain
- [x] Vendor Portal, RFQ/RFP, Purchase Orders, Vendor Contracts, Procurement Workflow, Supplier Performance, Vendor Analytics, Compliance, Supply Planning.

## Volume 8 Structure Overview: AI Operating System (AetheerAI)
- [x] AI Core, LLM Orchestrator, Memory Engine, Knowledge Graph, Context Engine, Multi-Agent Framework, AI Factory (Website/App/Marketing/Sales/Coding/Testing/Security/DevOps Agents), Autonomous Ops, Self-Healing, Tool Orchestration.

## Volume 9 Structure Overview: Business Intelligence & Data Platform
- [x] Data Warehouse, ETL Pipelines, Data Lake, OLAP, KPI Engine, Predictive Analytics, Dashboards, Executive Reporting, AI Insights.

## Volume 10 Structure Overview: Mobile Applications Ecosystem
- [x] Dedicated Apps: Customer, Seller, Staff, Warehouse, Delivery, Technician, Admin, Manager Apps. Features: Offline Sync, Push Notifications, Biometrics, GPS, Camera, Barcode, QR, NFC.

## Volume 11 Structure Overview: Security, Compliance & Governance
- [x] Zero Trust, IAM, MFA, RBAC, Encryption, Audit, SIEM, SOC, Vulnerability Management, Incident Response, Compliance (GST, Privacy, Financial, Cyber), DR, BCP.

## Volume 12 Structure Overview: Infrastructure & DevOps
- [x] Kubernetes, Docker, CI/CD, Multi-Cloud, CDN, Monitoring, Logging, Auto Scaling, Cost Optimization, Release Management.

## Volume 13 Structure Overview: API, SDK & Developer Platform
- [x] REST APIs, GraphQL, Webhooks, SDKs, Plugin Marketplace, OAuth, API Gateway, Developer Portal, Versioning, Rate Limiting.

## Volume 14 Structure Overview: IoT, Automation & Smart Devices
- [x] CCTV Integration, Smart Locks, RFID, Biometrics, Attendance Devices, Sensors, Smart Home/Office, Vehicle Tracking, Edge Computing.

## Volume 15 Structure Overview: Future Innovation & R&D
- [x] AI Robotics, Drone Delivery, Digital Twin, AR/VR Commerce, Voice Commerce, Autonomous Warehouses, Blockchain Traceability, Quantum Readiness, Green Logistics.

---

## Received Document Specifications

---

## Executive Architectural Research & Technical Design Decisions

> **Document Scope**: Deep-dive technical research, architectural trade-off evaluations, security protocols, database paradigms, and business domain decisions governing the TecBunny Marketplace Ecosystem across all 15 Master Volumes.

---

### 1. Architectural Paradigms & Core Tech Stack Decisions

#### 1.1 Monorepo & Application Architecture (Turborepo + Next.js)
- **Decision**: Turborepo monorepo structuring applications into `apps/public` (Customer Web App & Marketplace), `apps/superadmin` (Platform Operations & Governance Console), `apps/seller` (Supplier Portal), `apps/warehouse` (WMS/LMS Mobile & Desktop), and shared packages (`@tecbunny/core`, `@tecbunny/ui`, `@tecbunny/db`, `@tecbunny/config`).
- **Rationale**: Ensures complete code reuse across UI components, validation schemas, API SDKs, and types while enforcing strict physical boundaries between customer-facing, seller-facing, and operational admin applications.
- **SSR/SSG Strategy**: Next.js App Router for server-rendered dynamic pages (Checkout, Orders, Dashboard) and static site generation with Incremental Static Regeneration (ISR) for high-performance product detail pages (PDP) and catalog browsing.

#### 1.2 Database & Data Persistence Strategy (Supabase PostgreSQL + PgBouncer)
- **Decision**: Primary relational persistence powered by Supabase Managed PostgreSQL, supplemented by PgBouncer connection pooling and Redis for ultra-low latency caching and session management.
- **Schema Design**: Strictly normalized 3NF relational models for financial ledgers, inventory movements, and transaction records. Partitioning implemented on high-volume tables (`audit_logs`, `inventory_movements`, `telemetry_metrics`, `journal_lines`) by monthly date ranges.
- **Read-Write Splitting**: Read replicas for analytics, BI reporting, and search indexing to isolate operational OLTP query performance.

#### 1.3 Media Storage & Global CDN (Cloudinary + Anycast DNS)
- **Decision**: Cloudinary integration for automated image/video optimization, WebP/AVIF transformation, volumetric sizing, and watermarking, served via global Anycast CDN.
- **Security**: Direct client-to-cloud signed upload signatures with pre-upload malware scanning and MIME type verification.

---

### 2. Managed White-Label Marketplace Business Model Decisions

#### 2.1 Complete White-Label Privacy Boundary
- **Decision**: 100% customer-facing isolation. Customers interact strictly with TecBunny Solutions Pvt. Ltd. (Merchant of Record).
- **Enforcement**:
  1. Customers NEVER see supplier names, addresses, tax IDs, purchase costs, or profit margins.
  2. All tax invoices, shipping labels, packaging, customer support tickets, and warranty receipts are issued exclusively under TecBunny branding.
  3. Sellers are forbidden from inserting direct promotional materials, invoices, or contact cards in packages.

#### 2.2 Superadmin-Only Pricing & Profit Margin Controls
- **Decision**: Sellers provide their net **Purchase Price** (agreed wholesale supply cost). Superadmin retains 100% exclusive authority over **Customer Selling Price**, Customer Discounts, Category Minimum Margins, Flash Sale Pricing, and Coupon Applicability.
- **Margin Protection Engine**: Automated validation blocks product publishing if `Customer Price < Purchase Price + Min Category Margin + Operational/Packaging Overhead`, requiring explicit Superadmin override.

#### 2.3 Automated Settlement Engine & Immutable Wallet Ledger
- **Decision**: Double-entry wallet and ledger accounting for seller settlements.
- **Settlement Formula**: `Net Settlement = Seller Purchase Price - Deductions (Shipping Recovery + Commission + Penalties + TDS + GST Adjustments)`.
- **Release Trigger**: Funds move from `Pending Settlement` to `Available Balance` ONLY after:
  1. Order status is `Delivered`.
  2. Customer Return Window (e.g., 7–14 days) expires without dispute.
  3. No open support tickets or active fraud investigations exist.

---

### 3. Supply Chain, Warehouse & Logistics Engineering

#### 3.1 9-Tier Physical Location Addressing Standard
- **Decision**: Hierarchical storage model: `Warehouse → Building → Floor → Zone → Aisle → Rack → Shelf → Bin → Storage Position`.
- **Location Code**: Globally unique string (e.g. `WH01-F1-A-03-R05-S04-B12-P02`) encoded into scannable Code 128 barcodes and QR stickers across every warehouse.

#### 3.2 30+ Parameter Storage Recommendation & AI Slotting Engine
- **Decision**: Multi-parameter optimization algorithm scoring candidate storage locations based on Product parameters (19), Inventory parameters (10), Warehouse parameters (10), and Business parameters (7).
- **Dynamic Re-Slotting**: Machine-learning driven re-slotting of fast-moving SKUs closer to packing stations (yielding ~18% faster picking and ~41% reduction in walking distance).

#### 3.3 Strict Weight & Volumetric Verification Protocols
- **Decision**: Automated inline weighing scales and 3D laser dimension scanners at all packing stations.
- **Tolerance Check**: Configured ±2% weight tolerance threshold. Discrepancies immediately trigger a `Packing Exception` and suspend shipping label generation to prevent missing items or fraud.

#### 3.4 Digital Proof of Handover (PoH)
- **Decision**: Chain-of-custody transfer requiring digital driver verification (Driver ID, OTP, Digital Signature, Photo, Vehicle Number, GPS timestamp) before closing dispatch manifests.

---

### 4. Security, Compliance & Data Governance Decisions

#### 4.1 Zero-Trust RBAC & Fine-Grained Permissions Matrix
- **Decision**: Role-Based Access Control (RBAC) enforced at API Gateway, GraphQL resolvers, and database Row Level Security (RLS) layers.
- **MFA Enforcement**: Mandatory multi-factor authentication (TOTP/SMS) for Superadmin, Finance Executives, and Security Admins. Session timeouts strictly configured (10m Superadmin, 15m Employee, 20m Seller, 30m Customer).

#### 4.2 Data Encryption & Audit Traceability
- **Decision**: Sensitive PII, Bank details, PAN, and Aadhaar numbers encrypted at rest using AES-256-GCM. TLS 1.2+ mandatory for all in-transit communications.
- **Immutable Audit Logs**: Centralized PostgreSQL audit log table backed by database triggers capturing `user_id`, `role`, `action`, `before_state`, `after_state`, `ip_address`, `device_fingerprint`, and `timestamp`. Editing or deleting audit logs is physically blocked at DB permissions level.

#### 4.3 Indian Statutory Compliance Matrix
- **Decision**: Full compliance with Indian GST rules (CGST, SGST, IGST, HSN/SAC tracking), TDS under Income Tax Act Section 194O, DPDP Act 2023 (Digital Personal Data Protection), and ISO/IEC 27001 security standards.

---

### 5. AI Operating System (AetheerAI) Architecture Decisions

#### 5.1 Multi-Agent Orchestration & Knowledge Graph
- **Decision**: AetheerAI framework utilizing a Master AI Orchestrator supervising domain-specific autonomous agents (Sales, Support, Marketing, Finance, Inventory, Warehouse, Coding, Testing, Security, SRE).
- **State & Memory**: Long-term memory persisted in Vector DB (Supabase pgvector) combined with Enterprise Knowledge Graphs to maintain deep context across multi-turn interactions.

#### 5.2 Self-Healing Infrastructure & Autonomous Operations
- **Decision**: SRE & DevOps AI Agents continuously monitor telemetry feeds (latency, error rates, queue lag). Autonomous remediation scripts automatically trigger circuit breakers, scale pod capacity, or rollback faulty canary releases based on predefined safety guardrails.

---

### Volume 1: Foundation & Third-Party Seller Management (v1.0)

---

#### Chapter 1: Cover Page & Document Control

- **Project Name**: TecBunny Marketplace
- **Module**: Third-Party Seller Management System (White-Label B2B2C Marketplace)
- **Merchant of Record**: TecBunny Solutions Pvt. Ltd.
- **Document Type**: SRS + BRD + FRD (Version 1.0)
- **Classification**: Confidential & Proprietary
- **Target Platform**: Web Portal, Admin Console, Seller Portal, Customer Portal, Warehouse Portal, Logistics Portal

##### Purpose & Objectives:
- Enable suppliers to provide products through TecBunny.
- TecBunny remains the **sole customer-facing brand** (white-label marketplace).
- Customers **never see seller information**.
- TecBunny controls pricing, logistics, invoicing, customer support, and settlements.
- Superadmin has complete governance over seller onboarding, approvals, pricing, and financial operations.

##### Key Glossary Terms:
- **TP Seller**: Third-Party Seller supplying inventory through TecBunny.
- **Superadmin**: Platform owner with unrestricted control over marketplace operations.
- **Admin**: Operational user with limited permissions and no marketplace governance authority.
- **Merchant of Record**: TecBunny Solutions Pvt. Ltd., responsible for billing, tax invoices, and customer-facing transactions.
- **Settlement**: Payment released to the seller after delivery, return-window completion, and applicable deductions.
- **Ready for Pickup**: Seller status indicating the order is packed and awaiting TecBunny collection.
- **White-Label Marketplace**: Marketplace where customers interact only with TecBunny while suppliers remain hidden.

---

#### Chapter 2: Executive Summary & Business Requirements

##### 2.1 - 2.4 Vision & Mission
- **Enterprise B2B2C White-Label Marketplace**: TecBunny is Merchant of Record, Invoice Generator, Logistics Provider, Support & Warranty Provider, Return Handler, and Settlement Authority.
- **Role of TP Sellers**: Hidden backend inventory suppliers.
- **Vision**: India's most trusted technology marketplace via managed commerce ecosystem.

##### 2.5 Strategic Business Objectives
1. Expand catalog without inventory risk/investment.
2. Preserve 100% TecBunny branding across all customer touchpoints.
3. Total Superadmin governance over sellers, products, pricing, compliance, and settlements.
4. Route all fulfillment/logistics exclusively through TecBunny.
5. Maintain consistent, single-brand customer experience.
6. Configurable margin rules and centralized price controls.
7. Scalable target: 100k+ products, 10k+ sellers, millions of orders, multi-warehouse/pickup zones.

##### 2.6 Marketplace Model (Managed Supplier)
- `Seller → TecBunny → Customer`
- Seller supplies inventory → TecBunny purchases at agreed purchase price → TecBunny resells to Customer.
- Customer invoice, support, shipping, returns, refunds are 100% TecBunny.

##### 2.7 Revenue Model
- **Product Margin**: Difference between Customer Price (e.g. ₹899) and Seller Purchase Price (e.g. ₹650).
- **Shipping Recovery**: Customer, Seller, or Shared.
- **Future Streams**: Seller Subscriptions, Sponsored Product Listing/Boost, Warehousing/Fulfillment Fees, Packaging & Gift-wrapping, Value-Added Services (Warranty, Installation, Insurance, Technical Support).

##### 2.8 Module Scope (v1)
- **Seller Registration & KYC**: GST, PAN, Bank & Document Verification.
- **Seller Portal**: Dashboard, Orders, Inventory, Products, Settlement, Wallet, Reports, Support.
- **Superadmin Portal**: Seller Management, Pricing, Commission, Settlement, Finance, Audit Logs, Configurations.
- **Product & Inventory Management**: Submit, Approve/Reject, Publish, Stock Allocation, Low Stock, Reserved Stock.
- **Order & Logistics Management**: Order Routing, Pickup Planning, Courier Integration, Reverse Pickup.
- **Finance**: Wallet, Automated Settlements after return window, Penalty/Commission tracking, Tax reports.

##### 2.9 Out of Scope (Version 1)
- International Shipping & Cross-border tax
- Multi-currency support
- Seller Advertising self-serve portal
- Seller Subscription Billing automation
- AI Demand Forecasting
- External Vendor ERP direct sync
- Franchise Marketplace

##### 2.11 - 2.12 Key Functional & Non-Functional Requirements
- **Functional**: Superadmin approval workflow, Purchase price locking, Superadmin publishing, Mandatory TecBunny logistics collection/inspection, Branded invoices, Managed returns, Automated settlement after return-window expiration, Comprehensive event audit logs.
- **Non-Functional**: 99.9% uptime, Horizontal scalability, RBAC, Encrypted sensitive storage, High-performance REST APIs, Automated backups, Disaster recovery.

---

#### Chapter 3: System Architecture & Business Workflow

##### 3.1 - 3.2 High-Level Architecture
- Architecture:
  `Customer Portal -> Auth -> Marketplace Core Engine (Product/Order/Pricing/Inventory) -> Superadmin Console -> Seller Portal / Warehouse Portal / Finance Module -> Logistics & Delivery -> Customer`

##### 3.3 Business Participant Responsibilities
- **Customer**: Browses, places orders, pays, tracks, requests returns. Never sees seller info.
- **TP Seller**: Manages catalog, updates stock, packs orders, marks "Ready for Pickup". Does NOT ship, contact customer, or invoice.
- **Superadmin**: Full governance over seller/product approvals, pricing, commission, settlements, system configs, audit logs.
- **Admin**: Operational actions only. Cannot approve sellers/products or release settlements.
- **Warehouse**: Receiving, QC, Repacking, Labeling, Dispatch.
- **Logistics**: Pickup from seller, Warehouse transit, Delivery to customer, Reverse pickup.

##### 3.4 - 3.7 Complete Lifecycles
- **Marketplace Workflow**: `Seller Register -> Superadmin Verification -> Upload Products -> Superadmin Review & Publish -> Order Placed -> Seller Pack & Mark Ready -> TecBunny Pickup -> Warehouse QC & Repack -> Ship & Deliver -> Return Window -> Settlement`.
- **Seller Lifecycle**: `Register -> Verification (GST/PAN/Bank) -> KYC Review -> Superadmin Approval -> Active -> Operations -> Settlement -> Renewal/Suspension`.
- **Product Lifecycle**: `Draft -> Submitted -> Superadmin Review -> Approved -> Published/Live -> Ordered -> Stock Deducted`.
- **Order Lifecycle**: `Paid -> Order Created -> Seller Accepts & Packs -> Ready for Pickup -> TecBunny Pickup -> Warehouse QC -> In Transit -> Delivered -> Return Window Expiration -> Settlement Released`.

##### 3.8 - 3.12 Inventory, Logistics & Financial Workflows
- **Inventory**: Seller maintains stock; auto-deduction on customer purchase; low-stock alerts; zero-stock sets product to Out of Stock.
- **Pickup & Warehouse**: Seller marks "Ready for Pickup" → TecBunny pickup executive collected → Warehouse scan → QC & packaging check → Repack/Relabel as TecBunny → Courier dispatch.
- **Returns**: Customer requests → TecBunny reverse pickup → Warehouse QC → If approved, seller inventory/settlement adjusted.
- **Settlements**: Calculated as `Net Settlement = Seller Purchase Price - Deductions (Shipping recovery, penalty, TDS, GST)`. Released ONLY after return window closes without dispute.

##### 3.13 - 3.15 Modules, Integrations & Immutable Rules
- **Modules**: Core Platform, Seller Module, Superadmin Module, Customer Module, Warehouse Module, Logistics Module, Finance Module.
- **Integrations**: Payment Gateway (PayU), WhatsApp (Infobip), Email/SMS, Courier Aggregators, GST/PAN/Bank Verification, Cloudinary, Supabase, Vercel.
- **Core Rules**:
  1. Customer never sees seller info; invoices strictly by TecBunny.
  2. Seller is inventory supplier only; cannot change customer prices or contact customers.
  3. Superadmin is sole approving and financial release authority.
  4. TecBunny initiates & manages 100% of logistics.
  5. Mandatory immutable audit logs for all critical system events.

---

#### Chapter 4: User Roles & Permission Matrix

##### 4.1 - 4.3 Design Principles & User Roles
- **Principles**: Least Privilege, Approval-Based Governance, Complete Auditability, Scalable Roles.
- **Roles**: Superadmin, Admin, Finance Executive, Warehouse Executive, Support Executive, TP Seller, Customer, Delivery Executive, Auditor.

##### 4.4 Superadmin Capabilities
- Unrestricted control over all modules, users, products, finance, system settings.
- Dashboard with high-level metrics & alerts.
- Seller & Product governance: Approve/Reject/Suspend sellers and products.
- Centralized pricing control: Sets Customer Selling Price, Margins, Discounts, Flash Sale Prices, Shipping Charges, Tax rules. (Seller cannot alter customer prices).
- Order & Settlement governance: Can cancel/hold/reassign orders; sole authority to generate, hold, release settlements, apply TDS/GST/penalties.

##### 4.5 - 4.11 Operational Roles & Limitations
- **Admin**: Operational order & warehouse management; cannot approve sellers/products, modify prices, or release settlements.
- **Finance Executive**: Reviews settlements, exports reports, reconciles payments; cannot edit products/prices/sellers.
- **Warehouse Executive**: Receiving, scanning, QC, repacking, dispatch; no financial access.
- **Support Executive**: Handles tickets & returns coordination; cannot release refunds/settlements independently.
- **TP Seller**: Manages profile, product drafts, inventory stock, packs orders, marks Ready for Pickup, views own settlements. Cannot contact customers, change selling prices, or ship directly.
- **Customer**: Normal shopping, payment, tracking, returns. Zero seller visibility.
- **Delivery Executive**: Manages assigned pickups/deliveries, proof of pickup/delivery scans.

##### 4.12 Permission Matrix Summary
- **Seller Approval**: Superadmin ONLY.
- **Product Approval**: Superadmin ONLY.
- **Customer Price Editing**: Superadmin ONLY.
- **Settlement Release**: Superadmin ONLY (Finance Executive can recommend).
- **Product Uploading**: TP Seller.
- **Inventory Updates**: Superadmin, Admin, Warehouse, Seller (own stock).

##### 4.13 - 4.15 Security, Session & Audit Policies
- MFA required for Superadmin.
- Re-authentication / 2FA for sensitive operations (pricing updates, settlement releases, role changes).
- Session idle timeouts and configurable concurrent login limits.
- Immutable audit log required for: Login/logout, role changes, seller approvals/rejections, product approvals/rejections, price changes, inventory adjustments, settlement releases, user suspensions, config changes. Record: `user_id`, `role`, `action`, `previous_value`, `new_value`, `timestamp`, `ip_address`, `device_info`, `correlation_id`.

---

#### Chapter 5: Superadmin Module (Complete Functional Specification)

##### 5.1 - 5.4 Purpose, Dashboard & Left Navigation
- **Central Control Engine**: Brain of TecBunny Marketplace governing all operational, financial, and product lifecycles.
- **KPI Metrics**: Real-time revenue, order counts (by status), return requests, pending pickups, pending seller/product approvals, active/suspended seller counts, warehouse inventory, low stock alerts, pending settlements, health score.
- **Dashboard Analytics**: Revenue trends (daily/weekly/monthly/yearly), order status breakdown, seller growth, category sales pie chart, top 20 selling products, profit analysis, settlement pipeline graphs.
- **Navigation Map**: Dashboard, Marketplace (Seller management/KYC/performance), Products (Approvals/Live/Archived/Attributes/SEO), Orders (Full order lifecycle & overrides), Warehouse, Logistics, Finance (Settlement engine/Wallet/Ledger/TDS/GST), Customer, Marketing, Reports, Security (RBAC/Sessions/Audit logs), System settings.

##### 5.5 - 5.8 Seller Management & Product Approvals
- **Seller Controls**: List, Filter, Search, View, Edit, Approve, Suspend, Activate, Delete (Soft-delete), Reset Password, Verification (GST, PAN, Bank), Bulk actions.
- **Approval Workflow**: `New Registration -> Pending Verification -> GST/PAN/Bank Verification -> Doc Review -> Superadmin Approval -> Seller Active`.
- **Product Approval Workflow**: Seller uploads draft with Purchase Price → Superadmin reviews metadata, images, tax, HSN, stock → Approve / Reject / Request Changes → Live.

##### 5.9 - 5.12 Pricing, Orders & Settlement Engine
- **Pricing Engine**: Controlled exclusively by Superadmin. Configures Customer Selling Price, Discounts, Flash Sale pricing, Margins, Tax, Shipping charges. Auto-enforces minimum margins, max discounts, category pricing. Seller cannot modify customer price.
- **Order Management**: View/Edit/Cancel/Refund/Replace/Exchange, Assign Pickup/Warehouse/Courier, Hold/Resume, Invoice/Label printing.
- **Settlement Engine**: `Net Settlement = Customer Payment - Platform Gross Margin - (Shipping Recovery + Commission + Penalties + TDS + GST)`. Generates draft calculation, allows Hold/Release/PDF/Excel export. Cannot release if dispute/return window open.

##### 5.13 - 5.17 Reports, Audit Logs & Security Business Rules
- **Comprehensive Reporting**: Sales, Profit, Inventory, Returns, Taxes, GST/TDS, Seller performance. Exportable to Excel, CSV, PDF.
- **Multi-channel Notifications**: Create push, WhatsApp, SMS, Email notifications to targeted seller/customer/warehouse segments.
- **Immutable Audit Logging**: Logs user, action, old_value, new_value, timestamp, IP, browser, session_id. Un-editable and un-deletable.
- **Security & Business Rules**: MFA mandatory for Superadmin; re-auth required for financial releases; soft-delete for sellers to maintain transaction integrity.

---

#### Chapter 6: Third-Party Seller Registration, KYC & Onboarding

##### 6.1 - 6.6 Purpose, Lifecycle & Account Creation
- **Strict Gateway**: Registration alone grants 0 access. Requires OTP mobile/email verification, GST, PAN, Bank Penny-Drop, Document validation, and Superadmin sign-off.
- **Account Creation**: Business Name (3-100 chars), Owner Name, Unique Mobile (IN format), Unique Email, Password (min 12 chars, upper/lower/num/special).
- **Verification**: 6-digit OTP (5-min expiry, max 5 attempts), Email confirmation link/OTP.

##### 6.7 - 6.12 Business Information & Automated Validations
- **Business Details**: Entity Type (Proprietorship, Partnership, LLP, Pvt Ltd, Public Ltd, OPC, Trust, NGO), Incorporation date, turnover, warehouses.
- **GST Verification**: Format, State Code, Legal Name, Status check.
- **PAN Verification**: Format, Business ownership & active status check.
- **Bank Details & Penny Drop**: Account holder, Account Number, IFSC, UPI ID. Auto-verified via Penny Drop transaction.
- **Addresses & Warehouses**: Business, Billing, Pickup addresses + multi-warehouse setup (capacity, contact, working hours).

##### 6.13 - 6.18 Documents, KYC Workflow & Superadmin Verification
- **Mandatory Documents**: GST Certificate, PAN Card, Cancelled Cheque, Owner Aadhaar, Business Reg Certificate, Address Proof, Authorized Signature, Logo (PDF/JPG/PNG max 10MB).
- **KYC Status**: `Draft -> Submitted -> Pending Review -> Verification In Progress -> Approved / Rejected / Changes Requested -> Resubmitted -> Approved`.
- **Superadmin Review Checklist**: Mobile verified, Email verified, GST valid, PAN valid, Bank verified, Docs complete, KYC complete.
- **Seller Account States**: Draft, Pending Verification, Pending Approval, Approved, Suspended, Rejected, Blocked, Inactive.

##### 6.19 - 6.25 First Login, Rejection Handling, DB Schemas & APIs
- **First Login Wizard**: Profile completion → Warehouse setup → Pickup scheduling → Bank confirmation → Upload first product draft.
- **Rejection Workflow**: Detailed rejection reason provided; seller can upload revised documents and resubmit.
- **Notifications**: Triggered via Email, SMS, WhatsApp, In-App for all status transitions.
- **Database Tables**: `sellers`, `seller_profiles`, `seller_business`, `seller_addresses`, `seller_documents`, `seller_kyc`, `seller_bank_accounts`, `seller_warehouses`, `seller_sessions`, `seller_notifications`, `seller_verification_logs`, `seller_audit_logs`.
- **APIs**:
  - Auth: `POST /seller/register`, `POST /seller/login`, `POST /seller/verify-otp`, `POST /seller/resend-otp`
  - Business & Docs: `POST/PUT/GET /seller/business`, `POST/DELETE/GET /seller/documents`
  - KYC: `POST /seller/kyc/submit`, `GET /seller/kyc/status`
  - Superadmin: `GET /superadmin/sellers`, `POST /superadmin/seller/approve|reject|request-changes|suspend`
- **Security & Core Business Rules**: Argon2/bcrypt hashing, 5-min OTP expiry, max 10 login lockouts, document malware scanning & encryption at rest, masked bank details. Unique GST/PAN enforcement. Mandatory pickup address. Post-approval changes to tax/bank force re-verification. Immutable audit logging.

---

#### Chapter 7: Third-Party Seller Portal & Dashboard

##### 7.1 - 7.4 Purpose, Dashboard & Left Navigation
- **Workspace Focus**: Manage product catalog, inventory stock, assigned orders, pickup readiness, settlements, reports, and support. No access to customer identities or customer prices.
- **KPI Metrics**: Real-time sales, order counts, pending pickups, pending/live products, low/out-of-stock inventory, pending & completed settlements, support tickets, seller performance rating.
- **Dashboard Charts**: Sales trends, order status breakdown, product performance (top vs low), settlement trend graph, stock distribution (available/reserved/low/out-of-stock).
- **Navigation Map**: Dashboard, Products (Draft/Pending/Approved/Rejected/Archived/Bulk), Inventory, Orders (New/Accepted/Preparing/Ready for Pickup/Picked Up/Delivered/Cancelled/Returned), Settlements (Pending/Processing/Completed/Wallet/Ledger), Reports, Support (Tickets/FAQs), Profile (Business/Bank/Warehouse/Security).

##### 7.5 - 7.8 Product & Inventory Operations
- **Add Product Form**: Name (unique per seller), Brand, Category, Sub-Category, SKU, Barcode, HSN, GST %, Seller Purchase Price, MRP, Stock, Min Stock, Dimensions, Weight, Packaging info, Images.
- **Approval Lifecycle**: `Draft -> Submitted -> Pending Superadmin Approval -> Approved & Live / Changes Requested / Rejected`. Seller CANNOT publish directly.
- **Stock Rules**: Inventory auto-deducted on order; low-stock alerts triggered at threshold; zero stock auto-disables customer checkout for the item. Stock adjustments (increase, decrease, transfer) tracked in history log.

##### 7.9 - 7.11 Order Management & "Ready for Pickup" Workflow
- **Order Handling**: Receive notification → Accept order → Pack package securely as per TecBunny branding guidelines → Attach internal pickup slip → Mark "Ready for Pickup".
- **Fulfillment Rules**: Logistics pickup auto-scheduled upon "Ready for Pickup". Sellers strictly CANNOT ship directly, contact customer, attach seller invoice, or insert seller promo materials.

##### 7.12 - 7.15 Settlements, Wallet & Reports
- **Settlement Transparency**: Displays pending, processing, completed, and held amounts + ledger breakdown. Downloadable PDF/Excel.
- **Wallet Ledger**: Tracks settlement credits, penalty debits, shipping recovery deductions, commission fees, refund adjustments.
- **Reports & Export**: Download Sales, Inventory, Order, Stock Movement, Return, and Settlement reports in PDF, Excel, CSV formats.

##### 7.16 - 7.21 Profile Governance, Performance Score, APIs & Security
- **Profile Controls**: Updating bank, GST, PAN, or business legal name requires re-verification by Superadmin.
- **Performance Rating (0-100)**: Evaluated on Order Acceptance Rate, On-Time Pickup Readiness, Fulfillment Rate, Return Rate, Approval Rate, Settlement Speed.
- **APIs**:
  - Auth & Analytics: `POST /seller/login|logout|change-password`, `GET /seller/dashboard|analytics`
  - Catalog & Stock: `GET/POST/PUT/DELETE /seller/products`, `GET/PUT /seller/inventory`
  - Orders: `GET /seller/orders`, `POST /seller/orders/{id}/accept|ready-for-pickup`
  - Finance & Support: `GET /seller/settlements|wallet`, `POST/GET /seller/support-ticket`
- **Security & Business Rules**: Strict tenant data isolation (own data only), JWT auth, rate limiting, session inactivity timeout, malware checks on document uploads, mandatory audit logging.

---

#### Chapter 8: Product Management & Pricing Engine

##### 8.1 - 8.3 Lifecycle & Structure
- **Product Lifecycle**: `Draft -> Submitted -> Validation -> Pending Approval -> Superadmin Review -> Approved -> Published -> Ordered -> Inventory Updated -> Archived -> Soft Deleted`.
- **Master Structure**: Basic info, Commercial (Purchase price, MRP, GST, HSN, Warranty), Inventory (Stock, Reserved, Minimum, Reorder), Shipping (Weight, Dimensions, Volumetric weight, Fragile/Hazardous flag), Media (1 main + 15 gallery + 3 videos + 10 docs), SEO (Title, Meta, Canonical, Slug).

##### 8.4 - 8.8 Categories, Attributes, Variants & Media
- **Categories & Attributes**: Unlimited hierarchical category depth. Dynamic, configurable attribute engine per category (e.g. CCTV resolution, lens, PoE, night vision).
- **Variants**: Multi-variant support (e.g. RAM/SSD capacity). Each variant has unique SKU, Barcode, Purchase Price, Customer Price, Stock, Weight, Media.
- **Media Specs**: JPG, PNG, WEBP max 20MB. Min 1200x1200px, recommended 2000x2000px.

##### 8.9 - 8.12 Pricing Engine & Formula
- **Superadmin Controlled Pricing**: Seller provides Purchase Price + GST + MRP. Superadmin configures Selling Price, Margin, Discounts, Shipping, Coupon eligibility.
- **Pricing Formula**: `Customer Selling Price = Seller Purchase Price + Desired Margin + Operational Cost + Packaging + Shipping Recovery + Tax Adjustments`.
- **Margin Rules**: Category-level minimum margins (e.g., CCTV 18%, Networking 15%, Accessories 25%), Brand-level margin overrides, and Minimum Profit Protection (blocks publishing below min margin without Superadmin override).

##### 8.13 - 8.15 Discounts, Tax Engine & Inventory Controls
- **Discount Engine**: Flat, %, BOGO, Bundles, Flash Sales, Coupons, Customer Segments. Stacking priority: Product > Category > Brand > Coupon > Loyalty.
- **Tax Engine**: HSN code, GST rates (0%, 5%, 12%, 18%, 28%). Calculates inclusive/exclusive tax for inter-state (IGST) and intra-state (CGST+SGST).
- **Stock Automation**: Real-time stock reservation upon order placement; deduction on pickup scan; restoration on pre-pickup cancellation; addition upon QC-passed returns.

##### 8.16 - 8.23 Bulk Import/Export, Audit Logs, Schemas & APIs
- **Bulk Operations**: Excel/CSV bulk import/export with validation reports (failed rows, duplicate SKUs).
- **Audit Logging**: Every product modification creates a versioned audit log capturing user, action, old/new values, IP, timestamp, session ID.
- **DB Tables**: `products`, `product_variants`, `product_categories`, `product_brands`, `product_images`, `product_documents`, `product_attributes`, `product_attribute_values`, `product_inventory`, `product_pricing`, `product_seo`, `product_reviews`, `product_versions`, `product_audit_logs`.
- **APIs**:
  - Product: `GET/POST/PUT/DELETE /products`, `GET /products/{id}`
  - Variants & Pricing: `POST/PUT/GET /variants`, `GET/PUT/POST /pricing`
  - Inventory & Approvals: `GET/PUT/POST /inventory`, `POST /products/{id}/approve|reject|request-changes`
- **Business Rules**: Customer prices strictly controlled by Superadmin. Unique SKU per seller. Stock cannot go negative. Active ordered products cannot be deleted. Pricing below minimum margin blocked unless authorized.

---

#### Chapter 9: Inventory, Warehouse & Logistics Management

##### 9.1 - 9.5 Purpose & Inventory Architecture
- **Operational Backbone**: Governs complete physical flow from seller pickup to warehouse QC, repacking, dispatch, delivery, and reverse logistics.
- **Stock Progression**: `Seller Warehouse -> Available -> Customer Order -> Reserved -> Ready for Pickup -> TecBunny Pickup -> Warehouse Inventory -> Under QC -> Dispatch Ready -> Shipped -> Delivered / Returned / Damaged`.
- **Multi-Warehouse Support**: Central, Regional, City, Pickup Hubs, Returns Centers, Overflow Warehouses. Tracked via Warehouse ID, address, capacity, manager, pickup zones.
- **Inventory States**: Available, Reserved, Ready for Pickup, In Transit to Warehouse, Under QC, Dispatch Ready, Shipped, Delivered, Returned, Damaged, Lost.

##### 9.6 - 9.11 Pickup, Barcoding & Reservation Rules
- **Reservation SLAs**: Instant stock reservation on payment. Auto-expires if seller fails to pack within SLA.
- **Stock Adjustments**: New purchase, manual correction, damage, theft, returns, QC failure, audit. Every adjustment requires mandatory logged reason and audit trail.
- **Pickup Automation**: Seller clicks Ready for Pickup → Pickup Request created → Executive assigned → Route optimized → Package collected with Barcode/QR scan (Code 128 / QR linking Order, Seller, Product, Warehouse, Shipment).

##### 9.12 - 9.16 Warehouse Receiving, QC & Dispatch
- **Receiving Inspection**: Scan barcode upon arrival → Verify quantity & seller → Generate receiving receipt → Accepted / Partial / Damaged / Rejected.
- **QC Checklist**: Product match, quantity, packaging integrity, zero visible damage, serial verification, accessories/warranty card present. Results: Passed, Passed with Remarks, Failed.
- **Dispatch Processing**: Repack with TecBunny branding, attach customer invoice & shipping label, weigh, seal, move to dispatch queue for courier pickup.

##### 9.17 - 9.23 Reverse Logistics, Audits, Schemas & APIs
- **Returns Processing**: Customer return request → Reverse pickup → Warehouse QC → If accepted: Restock, Refurbish, Scrap, or Return to Seller + settlement adjustment.
- **Audits**: Daily cycle count, weekly, monthly, surprise, annual stock take. Variance logs required.
- **DB Tables**: `warehouses`, `warehouse_users`, `warehouse_zones`, `inventory`, `inventory_batches`, `inventory_movements`, `inventory_adjustments`, `pickup_requests`, `pickup_assignments`, `shipment_packages`, `shipment_tracking`, `quality_checks`, `dispatch_queue`, `returns_inventory`, `inventory_audits`, `barcode_registry`.
- **APIs**:
  - Inventory & Warehouse: `GET/PUT/POST /inventory`, `POST /inventory/adjust|reserve`, `GET/POST/PUT /warehouses`
  - Pickup, QC & Dispatch: `POST/GET /pickup/request|assign|complete`, `POST/GET /qc/start|complete`, `POST/GET /dispatch/create|ship`
- **Security & Business Rules**: Reserved immediately upon payment. QC mandatory before dispatch. Immutable dispatch logs. Device auth for barcode scanning. 100% end-to-end traceability required.

---

#### Chapter 10: Order Management, Payment, Returns & Settlement Engine

##### 10.1 - 10.5 Order & Payment Lifecycle
- **Complete Order Journey**: `Checkout -> Payment -> Fraud Check -> Order Created -> Seller Assigned & Accepts -> Pack & Ready -> TecBunny Pickup -> Warehouse QC -> Dispatch -> Delivery -> Return Window -> Settlement -> Closed`.
- **Payment Processing**: Integrated with **PayU** (Razorpay, Cashfree, PhonePe ready). Payment states: Pending, Authorized, Captured, Failed, Refunded, Partially Refunded.

##### 10.6 - 10.10 Order Routing, SLAs & Warehouse Tracking
- **Smart Allocation**: Evaluates available stock, seller SLA performance, warehouse proximity, and product availability. Auto-notifies seller via WhatsApp, Email, Push.
- **Seller SLAs**: Configurable (e.g. Acceptance: 2h, Packing: 24h). Missed SLAs degrade seller performance score.
- **Logistics Pickup**: Auto-generated pickup request upon Ready for Pickup status with optimized executive routing.
- **Tracking Progression**: Customer tracks Confirmed → Picked Up → Warehouse Received → Packed → Dispatched → In Transit → Out For Delivery → Delivered.

##### 10.11 - 10.15 Cancellations, Returns & Refunds
- **Cancellations**: Allowed before seller packing/preparation. Auto-releases reserved stock & triggers refund.
- **Return Workflow**: `Customer Request -> Support Review -> Reverse Pickup -> Warehouse QC -> Acceptance Decision`.
- **QC Decision Matrix**: Passed (Refund/Replace), Minor Damage (Seller Review), Major Damage (Claim Investigation), Wrong Item (Escalation).
- **Refund Engine**: Refunds to original payment method or TecBunny Wallet. States: Pending, Approved, Processing, Completed, Failed.

##### 10.16 - 10.20 Settlement Calculation & Immutable Ledger
- **Settlement Formula**: Triggered ONLY post-delivery and return-window expiration without dispute. `Net Settlement = Seller Purchase Price - Deductions (Shipping Recovery + Commission + Penalties + TDS + GST)`.
- **Immutable Ledger**: Double-entry wallet system recording transaction_id, settlement_id, order_id, credit, debit, balance, timestamp. Ledger entries CANNOT be edited or deleted.
- **Dispute Resolution**: Open dispute automatically freezes seller settlement release for that order until resolved.

##### 10.21 - 10.26 Schemas, APIs, Security & Core Rules
- **DB Tables**: `orders`, `order_items`, `order_status_history`, `payments`, `payment_transactions`, `refunds`, `returns`, `replacement_orders`, `seller_wallet`, `seller_ledger`, `settlements`, `settlement_items`, `disputes`, `finance_reports`, `payment_audit_logs`.
- **APIs**:
  - Orders & Payments: `GET/POST/PUT /orders`, `POST /orders/{id}/cancel`, `POST/GET /payments/create|verify`
  - Returns & Refunds: `POST/PUT/GET /returns`, `POST/GET /refunds/create`
  - Settlements: `GET/POST /settlements/generate|release`
- **Security & Business Rules**: Payment signature verification, role-based refund caps, Superadmin-only settlement release authorization, encrypted financial records at rest, idempotent webhooks. Orders reserved immediately upon payment. Active dispute pauses settlement. Financial formulas must be 100% deterministic and auditable.

---

#### Chapter 11: Customer Portal, CRM & Support Management

##### 11.1 - 11.5 Customer Experience & Identity
- **Strict White-Label Boundary**: 100% customer interactions managed exclusively under TecBunny brand. Customers NEVER see TP seller identity, address, contact, purchase price, or margins.
- **Registration & Auth**: Mobile OTP, Email, Password, optional business GST. Session security via Argon2/bcrypt, device tracking, rate limiting, and CAPTCHA.
- **Customer Dashboard**: Active orders, delivered orders, wishlist, saved addresses, pending returns, support tickets, recent purchases.

##### 11.6 - 11.10 Product Discovery, Cart & Wishlist
- **Browsing & Search**: Search by name, SKU, brand, category. Advanced filters (price, rating, discount, delivery time). Dynamic sorting (relevance, price, popularity, newest).
- **Product Details Page**: Multi-angle images, specifications, features, warranty, return policy, verified customer ratings, Q&A, dynamic delivery estimate.
- **Cart & Wishlist**: Real-time stock & coupon validation, quantity adjustments, multi-device synchronization.

##### 11.11 - 11.15 Orders, Returns & Verified Reviews
- **Address Book**: Save Home, Office, Other addresses with default selection.
- **Order Tracking Timeline**: `Order Confirmed -> Payment Received -> Preparing -> Picked Up -> Warehouse Processing -> Shipped -> Out For Delivery -> Delivered`. Dynamic delivery date.
- **Returns & Verified Reviews**: Self-serve return requests with automated eligibility check. Reviews allowed strictly for delivered items, moderated for spam/offensive text.

##### 11.16 - 11.23 Support Ticketing, CRM Analytics, Schemas & APIs
- **Support Channels**: Ticket system, Email, WhatsApp, Phone. Automated ticketing workflow linked directly to order IDs.
- **CRM Analytics**: Customer profiles, purchase history, LTV (Lifetime Value), repeat purchase rate, customer segmentation for targeted marketing campaigns.
- **DB Tables**: `customers`, `customer_profiles`, `customer_addresses`, `customer_sessions`, `customer_devices`, `customer_preferences`, `wishlists`, `wishlist_items`, `shopping_cart`, `cart_items`, `customer_notifications`, `customer_reviews`, `customer_tickets`, `customer_activity_logs`, `customer_segments`.
- **APIs**:
  - Auth & Profile: `POST /customer/register|login|logout|verify-otp`, `GET/PUT /customer/profile`, `GET/POST /customer/addresses`
  - Orders & Wishlist: `GET /customer/orders`, `POST /customer/orders/{id}/return`, `GET/POST/DELETE /wishlist`
  - Support: `POST/GET /support/ticket`
- **Security & Business Rules**: 5-min OTP expiry, encrypted personal data at rest, verified purchase reviews only, strict customer consent management for marketing.

---

#### Chapter 12: Finance, Accounting, Taxation & Settlement Management

##### 12.1 - 12.4 Financial Architecture & Double-Entry Accounting
- **Financial Flow**: `Customer Payment -> Payment Gateway -> TecBunny Bank -> General Ledger -> Revenue Recognition -> Settlement Calculation -> Superadmin Approval -> Bank Transfer`.
- **Chart of Accounts (COA)**: Assets (Bank, Receivables, GST Input, Inventory), Liabilities (Seller Payables, GST Output, TDS Payable, Refunds), Income (Sales, Margins, Shipping, AMC), Expenses (Shipping, Packaging, Courier, Refund, Infra).
- **Double Entry Rules**: Mandatory balanced debit/credit journal entries for customer payments, seller payables, courier expenses, and tax liabilities.

##### 12.5 - 12.9 Seller Wallet, Ledger & Settlement Calculations
- **Wallet & Immutable Ledger**: Tracks Opening Balance, Pending Settlement, Available Balance, Hold Amount, Released Amount, Penalties. Double-entry ledger entries cannot be edited or deleted once posted.
- **Settlement Formula**: `Net Settlement = Seller Purchase Price - (Shipping Recovery + Commission + TDS + Penalties + GST Adjustment)`.
- **Settlement Lifecycle**: `Order Delivered -> Return Window Ends -> Eligible -> Generated -> Under Review -> Superadmin Approval -> Bank Transfer -> Released`.

##### 12.10 - 12.15 GST, TDS, Invoicing & Refunds
- **Tax Engine**: Complete CGST, SGST, IGST calculation, Input Tax Credit (ITC), Output Tax Liability, HSN/SAC code tracking.
- **TDS Engine**: Configurable section-wise TDS deduction with threshold monitoring, PAN validation, monthly/annual TDS reporting.
- **Branded Invoicing**: 100% invoices generated under TecBunny Solutions Pvt Ltd. Supports Tax Invoices, Proforma Invoices, Credit Notes (for returns/refunds), and Debit Notes (for penalties/shipping recovery).

##### 12.16 - 12.24 Reconciliation, Dashboards, DB Schemas & Security
- **Bank & Gateway Reconciliation**: Daily automated matching of bank statements, gateway settlements, orders, refunds, and transfers.
- **Real-Time Financial Dashboards**: Profit & Loss (Revenue, COGS, Gross Profit, Net Profit), Cash Flow (Inflows vs Outflows), Tax Liabilities, Seller Payables.
- **DB Tables**: `finance_accounts`, `journal_entries`, `journal_lines`, `seller_wallet`, `seller_ledger`, `settlements`, `settlement_items`, `gst_transactions`, `tds_transactions`, `customer_invoices`, `credit_notes`, `debit_notes`, `refund_transactions`, `bank_reconciliation`, `finance_reports`, `finance_audit_logs`.
- **APIs**:
  - Financials & Dashboards: `GET /finance/dashboard|profit-loss|cash-flow`
  - Settlements & Wallets: `POST /finance/settlement/generate|approve|release`, `GET /finance/wallet/{sellerId}|ledger/{sellerId}`
  - GST & Reporting: `GET/POST /finance/gst`, `GET/POST /finance/reports`
- **Security & Business Rules**: Dual-approval threshold for high-value payments. Posted journal entries are strictly immutable (corrections via reversal entries only). Daily bank reconciliation mandated. Complete statutory audit compliance.

---

#### Chapter 13: Analytics, Business Intelligence (BI) & Reporting Engine

##### 13.1 - 13.5 BI Pipeline, Executive & Sales Dashboards
- **Analytics Pipeline**: `Applications -> Operational DB -> Event Queue -> Analytics Processing Engine -> Data Warehouse -> Real-time & Historical BI -> Dashboards & Reports`.
- **Executive KPIs**: Real-time GMV, Net Revenue, Profit, Active Sellers, Active Customers, Pending Pickups/Deliveries/Settlements, Return Rate, Marketplace Health Score.
- **Sales & Revenue Dashboards**: Revenue trends (daily/weekly/monthly/quarterly/yearly), AOV (Average Order Value), Revenue by Category/Brand/Seller/State/City, Sales Heat Maps.
- **Order Analytics**: Processing SLA compliance, delivery/pickup SLA tracking, order funnel analysis, peak ordering times.

##### 13.6 - 13.10 Seller, Customer & Operations Analytics
- **Seller Scorecard & Tiering**: Evaluated on Fulfillment Rate, Acceptance Rate, Return Rate, Pickup Delays, Ratings. Tiers: Platinum (95-100), Gold (90-94), Silver (80-89), Bronze (70-79), Improvement Required (<70).
- **Customer Intelligence**: CAC (Customer Acquisition Cost), LTV (Lifetime Value), Repeat Purchase Rate, Churn analysis. Customer Segments: VIP, Regular, Occasional, Dormant, New.
- **Product & Inventory Intelligence**: Fast vs. Slow moving stock, Aging inventory, Dead stock %, Stock turnover, Margin analysis, Cart abandonment rate.
- **Logistics KPIs**: Pickup success rate, NDR/RTO %, Courier performance, Warehouse processing time, Damage & loss rates.

##### 13.11 - 13.22 Report Builder, KPI Catalog, DB Schemas & APIs
- **Scheduled & Custom Report Builder**: Daily, weekly, monthly auto-reports via Email/Dashboard/API in Excel, CSV, PDF, Power BI. Custom slice-and-dice across dimensions (Seller, Category, Warehouse, Region) and measures (GMV, Profit, SLA).
- **Executive & Operational KPI Catalogue**: Defines core metrics across GMV, Margin %, SLA compliance, Inventory Accuracy %, Seller Scores.
- **DB Tables**: `analytics_events`, `analytics_snapshots`, `dashboard_widgets`, `dashboard_layouts`, `report_templates`, `scheduled_reports`, `kpi_definitions`, `customer_segments`, `seller_scores`, `product_metrics`, `warehouse_metrics`, `financial_metrics`.
- **APIs**:
  - Dashboards: `GET /analytics/dashboard|executive`
  - Sales & Sellers: `GET /analytics/sales|revenue`, `GET /analytics/sellers|seller/{id}`
  - Inventory & Reports: `GET /analytics/inventory`, `POST/GET /analytics/report`
- **Security & Business Rules**: Strict PII masking in export files. Role-based widget & KPI visibility. Aggregated historical analytics are immutable. All report exports logged with timestamp and user ID.

---

#### Chapter 14: Security, Authentication, Compliance & Audit Framework

##### 14.1 - 14.7 Security Architecture, IAM & Authentication
- **Security Architecture**: `Internet -> CDN + WAF -> Load Balancer -> API Gateway -> Auth Service -> RBAC Engine -> Business Services -> DB / Audit Logs / Secrets`.
- **IAM & User Types**: Superadmin, Admin, Finance, Warehouse, Logistics, Support, TP Seller, Customer, API Service Accounts.
- **Authentication Policies**: Mandatory MFA for Superadmin, Finance, Security Admins. Argon2id / bcrypt password hashing with min 12 chars (upper/lower/number/special). 90-day password expiry for employees.
- **Session Timeouts**: Superadmin (10 min), Employee (15 min), Seller (20 min), Customer (30 min). Tracked by IP, device, browser, login timestamp, and idle time.

##### 14.8 - 14.11 RBAC, API Security, Encryption & Secrets
- **RBAC Pipeline**: `Request -> Authentication -> Role Validation -> Permission Validation -> Business Rule Check -> Access Granted`. Permissions: View, Create, Edit, Delete, Approve, Reject, Export, Configure.
- **API Security**: Mandatory TLS 1.2+, HSTS, JWT access tokens, refresh tokens, rate limiting, request/response validation. Idempotency keys for payment & settlement endpoints.
- **Data Encryption**: AES-256 for sensitive data at rest (Bank details, PAN, Aadhaar, API keys, tokens). TLS 1.2+ in transit.
- **Secrets Governance**: Dedicated secret manager; zero hard-coded secrets; regular key rotation.

##### 14.12 - 14.15 Audit Logging, Rate Limiting & Compliance
- **Immutable Audit Logging**: Captures User ID, Role, Module, Action, Before/After values, Timestamp, IP, Device, Session ID, Correlation ID. Tracks logins, approvals, price changes, settlement releases, role changes, config updates.
- **Rate Limits**: Login (5 attempts / 15m), OTP (5 requests / h), Search (300 requests / min), Product APIs (100 requests / min).
- **Compliance Standards**: Designed to comply with Indian GST rules, DPDP Act (Digital Personal Data Protection), ISO/IEC 27001 security controls, and SOC 2 operational principles.

##### 14.16 - 14.23 Backup, Disaster Recovery, DB Schemas, APIs & DevSecOps
- **Backup & DR Targets**: RTO ≤ 4 hours, RPO ≤ 15 minutes. Incremental hourly DB backups, daily full backups, encrypted and off-site.
- **DB Tables**: `users`, `roles`, `permissions`, `role_permissions`, `user_roles`, `user_sessions`, `login_history`, `audit_logs`, `security_events`, `api_keys`, `refresh_tokens`, `mfa_devices`, `password_history`, `secret_rotation_logs`, `backup_history`.
- **APIs**:
  - Auth: `POST /auth/login|logout|refresh|mfa/verify`
  - Security & Backup: `GET/POST/PUT /security/audit|events|roles|permissions`, `POST/GET /backup/create|history|restore`
- **DevSecOps Standards**: Mandatory code reviews, SAST, DAST, secret scanning, SCA, dependency vulnerability checks, container scanning, automated security gates in CI/CD pipeline.

---

### Volume 2: Enterprise Operations & Platform Management

> **Estimated Size**: 2,000–2,500 Pages | **Chapters**: 5 Mega Chapters | **Parts**: 25 Major Parts

---

#### Chapter 1: Warehouse, Inventory & Logistics (Est. 420–520 Pages)

##### Part 1 — Warehouse Foundation & Inventory Control
- **1.1 Warehouse Architecture**: Warehouse Types (Primary, Regional, City, Temp, Return), Multi-Warehouse Master, 9-Tier Hierarchy (`Warehouse → Building → Floor → Zone → Aisle → Rack → Shelf → Bin → Position`), Capacity Planning, Status Matrix, Serviceable Regions.
- **1.2 Warehouse Layout**: Zones, Aisles, Racks, Shelves, Bins, Positions, Address Coding (`WH01-F1-A-03-R05-S04-B12-P02`), Bin Allocation Strategies, Live Heat Maps, Space Utilization.
- **1.3 Inventory Management**: Master Data, SKU & Variant Tracking, Batch & Serial Management (CCTV/Hardware), Lot Tracking, Immutable Ledger, 15 Stock States, Lifecycle, Valuation (FIFO/Weighted Avg/Standard Cost), Aging.
- **1.4 Goods Receiving (Inbound)**: Advance Shipment Notice (ASN), Seller Pickup, Vehicle Arrival, Gate Entry, Dock Scheduling, Barcode/QR Scanning, Goods Receipt Note (GRN), Inbound QC Matrix, 13 Exception Types.
- **1.5 Putaway Management**: Direct Putaway, Staged Putaway, Cross-Docking, Temp Holding, 30+ Parameter Recommendation Engine, AI Slotting, Dynamic Re-slotting, Mobile Putaway, Travel Optimization, SLAs.

##### Part 2 — Order Fulfillment & Warehouse Execution
- **2.1 Order Allocation**: Warehouse Selection, Stock Reservation, Allocation Engine, Order Splitting, Multi-Warehouse Transfers.
- **2.2 Picking Management**: Single, Batch, Wave, Zone, Cluster, Pick & Pass Strategies. Route Optimization (1-way traffic), Mobile Picking, Pick Verification, Exception Handling, High-Priority Queues.
- **2.3 Packing Management**: Packing Stations, 4-Level Queue Prioritization, Packaging Recommendation Engine, Cartonization, Material Inventory, Automated Weight Verification (±2% tolerance), Dimensional Volumetric calculation, Document/Label Generation, Tamper Seals.
- **2.4 Dispatch Management**: Dispatch Queue, Automated Courier Allocation Engine, Manifest Management, Vehicle & Dock Scheduling, AI Loading Optimization, Digital Proof of Handover (PoH), Real-Time Tracking Activation.
- **2.5 Workforce & Equipment**: Staff Shift Planning, Task Assignment, Performance Scoring, Attendance, Incentives, Productivity Analytics. Scanner/RFID/Printer/Forklift/Conveyor Maintenance & Calibration.

##### Part 3 — Transportation, Delivery & Reverse Logistics
- **3.1 Transportation Management System (TMS)**: Fleet & Driver Management, AI Route Planning, Live GPS Tracking, Fuel Tracking, ETA Prediction, Geofencing.
- **3.2 Shipment Tracking**: Live Courier APIs/Webhooks, Unified Tracking Timeline, Tracking Dashboards, Delay Prediction, Shipment Health Score.
- **3.3 Delivery Management**: Out for Delivery, OTP Verification, Photo Capture, Digital Signature, Contactless POD, Failed Delivery Handling, Rescheduling.
- **3.4 NDR Management**: Non-Delivery Reports, Address Verification, Customer Contact Workflow, Reattempt Rules, Escalations, Resolution Engine.
- **3.5 RTO Management**: Return to Origin Approval, Reverse Shipment Tracking, Warehouse Receiving, Cost Analysis, Seller Notification.
- **3.6 Reverse Logistics**: Self-service Returns, Reverse Pickup Scheduling, Return QC, Disposition (Refurbishment, Restocking, Scrap, Recycling, Return to Seller).

##### Part 4 — Warehouse Intelligence & Compliance
- **4.1 Inventory Audit**: Physical Count, Blind Count, Cycle Count, ABC Analysis, Discrepancy Reconciliation, Variance Analysis.
- **4.2 Barcode / QR / RFID**: GS1 Barcode Standards, QR Encoding, RFID Tagging, Thermal Printing, Scanner Management, Label Validation.
- **4.3 Warehouse Automation**: Conveyor Systems, Automated Guided Vehicles (AGV), Autonomous Mobile Robots (AMR), Robotics, PLC Integration, ASRS.
- **4.4 AI Warehouse**: AI Slotting, AI Demand Forecasting, AI Labor Planning, Congestion Prediction, Heat Maps, Predictive Inventory, Smart Recommendations.
- **4.5 Safety & Compliance**: Fire Safety, HAZMAT Handling, PPE Enforcement, Visitor Control, Incident Reporting, OSHA Compliance, Security.
- **4.6 Cold Storage**: Real-time Temp/Humidity Monitoring, Cold Chain, Pharmaceutical & Food Storage compliance, Environmental Alerts.

##### Part 5 — Governance & Technical Architecture
- **5.1 Cost & SLA Management**: Shipping, Packaging, Warehouse & Logistics Cost Optimization, Financial KPIs. End-to-End SLA Matrix & Escalation Trees.
- **5.2 Analytics & BI**: Dashboards (Executive, Warehouse, Inventory, Logistics), Heat Maps, KPI Reports, Predictive Analytics.
- **5.3 Document & Report Engine**: ASN, GRN, Inventory Ledger, Transfer Notes, Dispatch Register, Manifest, Packing Slip, Audit Reports.
- **5.4 API & Database Architecture**: REST APIs (150+ Endpoints), Webhooks, OAuth 2.0, Rate Limiting, Versioning, Event-Driven Architecture. ERD Design, 80+ DB Tables, Partitioning, Archiving.
- **5.5 Security, Notifications & BCP**: RBAC Matrix, Immutable Audit Logs, Encryption (AES-256 / TLS 1.2+). Multi-Channel Notifications (Email, SMS, WhatsApp, Push). Business Rules Repository. Disaster Recovery, BCP, Failover. Future Roadmap (Digital Twin, Autonomous Warehouses).

---

#### Chapter 2: CRM, Marketing & CMS (Est. 400–500 Pages)

##### Part 1 — Customer Relationship Management (CRM)
- Customer 360° Timeline, Dynamic Customer Profiles, Advanced Segmentation, Lead & Opportunity Management, Tiered Loyalty Program, Rewards Engine, Membership Management, TecBunny Customer Wallet, Integrated Support Ticketing, Customer Lifecycle Journey.

##### Part 2 — Marketing Automation & Campaign Engine
- Multi-Channel Campaign Management, Automated Email Marketing, WhatsApp Marketing, SMS Campaigns, Push Notifications, Social Media Ad Campaigns, Affiliate Marketing Network, Referral Programs, Coupon Engine (Flat, %, BOGO, Tiered), Virtual Gift Cards.

##### Part 3 — Promotions & Dynamic Pricing Engine
- Advanced Discount Matrix, Dynamic AI Pricing, Flash Sale Engine, Combo & Bundle Offers, Buy X Get Y (BOGO), Bundle Pricing Rules, Personalized Offers Engine, Geo-based Regional Pricing, Time-based Happy Hour Pricing, Marketplace Promotions.

##### Part 4 — CMS & Digital Experience Platform
- Drag-and-Drop Website Builder, Custom Landing Page Creator, Promotional Banner Management, Mega Menu & Navigation Builder, Corporate Blog Platform, Integrated SEO Management, Cloud Media Library, Static Pages, Dynamic Forms, FAQ & Self-Service Knowledge Base.

##### Part 5 — Customer Insights & Analytics
- Executive Marketing Dashboard, Campaign ROI Analytics, Conversion Funnel Analysis, Customer Journey Tracking, Conversion Rate Tracking, Cohort Retention Analysis, Customer Lifetime Value (CLV) Engine, Churn Prediction AI, A/B Testing Framework, BI Reports & Analytics APIs.

---

#### Chapter 3: Integration, Automation & AI Platform (Est. 450–550 Pages)

##### Part 1 — Enterprise Integration Hub
- Payment Gateways (PayU, Razorpay), Shipping & Logistics Aggregators, WhatsApp Business API (Infobip), SMS Gateways, Email Providers (SendGrid/Resend), Social Media APIs, External ERP Connectors, Accounting Systems Integration, Indian GST & PAN Verification APIs, Bank Penny-Drop Verification.

##### Part 2 — API Gateway & Event Architecture
- High-Performance REST APIs, GraphQL Endpoint Gateway, Webhooks Delivery Engine, Global Event Bus (EDA), OAuth 2.0 Provider, JWT Authentication, API Key Management, Rate Limiting & Throttling, API Health Telemetry, Interactive API Documentation.

##### Part 3 — Workflow Automation Engine
- Visual Business Rules Engine, Drag-and-Drop Workflow Designer, Multi-Stage Approval Workflows, Scheduled Cron Jobs, Event Automation Triggers, Notification Automation, Incident Escalation Matrix, Asynchronous Background Workers, Distributed Queue Management, Process Automation.

##### Part 4 — AI Platform & Machine Learning Services
- AI Customer Support Chatbot, Conversational AI Assistant, Personal Product Recommendation Engine, AI Semantic Search, Dynamic AI Pricing Engine, AI Fraud & Risk Detection, AI Demand & Sales Forecasting, AI Inventory Allocation Planning, Generative AI Content Creation, AI BI Analytics.

##### Part 5 — Autonomous AI Agent Ecosystem
- Master AI Orchestrator Agent, Autonomous Sales Agent, Autonomous Customer Support Agent, Autonomous Marketing Agent, Autonomous Finance & Settlement Agent, Autonomous Inventory Agent, Autonomous Warehouse Agent, Autonomous Developer Agent, Self-Improving Agent Framework, AI Safety & Governance.

---

#### Chapter 4: Administration, Monitoring & Platform Governance (Est. 350–450 Pages)

##### Part 1 — Organization & Multi-Tenant Governance
- Corporate Company Management, Branch & Regional Management, Multi-Warehouse Governance, Corporate Departments, Teams & Units, Business Unit Structures, Legal Entity Management.

##### Part 2 — User & Access Management (IAM)
- Fine-Grained Role-Based Access Control (RBAC), User Management Engine, Internal Staff Management, Permission Hierarchies, Approval Matrix Governance, Session Management & Timeouts, Device Registration & Control, Identity & Authentication Security (MFA, 2FA).

##### Part 3 — 360-Degree Monitoring & Audit Logging
- User Activity Logging, Immutable Security Audit Logs, Access & Authentication Logs, API Request/Response Telemetry, Application & System Error Logs, Database Query Performance Monitoring, User Login History, Compliance & Policy Monitoring.

##### Part 4 — Regulatory Governance & Compliance Framework
- DPDP Act Privacy Controls, Indian Statutory Compliance, GST Tax Invoicing Rules, E-Way Bill & Tax Compliance, Document Retention Policies, Customer Consent Management, Legal Policy Builder, Enterprise Risk Management.

##### Part 5 — Executive Business Intelligence & Reporting
- Executive C-Suite Dashboard, Operations Dashboard, Finance & Revenue Dashboard, Sales Analytics Dashboard, Customer Insights Dashboard, Warehouse Operational Dashboard, Marketing ROI Dashboard, KPI Engine, Scheduled & Custom Report Builder, BI Export Suite.

---

#### Chapter 5: DevOps, Infrastructure & Production Readiness (Est. 400–500 Pages)

##### Part 1 — Enterprise Cloud Infrastructure
- Multi-Cloud Architecture (Vercel, Supabase, Cloudinary), Multi-Region High-Availability Deployment, Edge CDN Acceleration, Load Balancing & Traffic Routing, Anycast DNS, Distributed Object Storage, Virtual Private Networking, Edge Microservices.

##### Part 2 — DevOps & CI/CD Automation
- Continuous Integration & Continuous Deployment (GitHub Actions), Git Version Control Standards, Release Management Pipelines, Dynamic Feature Flags, Blue-Green Zero-Downtime Deployment, Canary Deployment, Automated Rollback Strategies, Multi-Environment Configuration Management (Dev, Test, Staging, Prod).

##### Part 3 — Enterprise Security Architecture
- Zero Trust Security Architecture, Web Application Firewall (WAF), Distributed Denial of Service (DDoS) Protection, End-to-End Data Encryption (AES-256 at rest, TLS 1.2+ in transit), Centralized Secret Vault Management, Automated Key Rotation, SAST/DAST Vulnerability Scanning, Automated Penetration Testing.

##### Part 4 — Site Reliability Engineering (SRE) & Resilience
- 24/7 Telemetry Monitoring, Real-Time Alerting (PagerDuty/OpsGenie Integration), Distributed Log Aggregation, Microservice Distributed Tracing, Incident Response Management, Disaster Recovery (RTO ≤ 4h, RPO ≤ 15m), Business Continuity Planning (BCP), Automated Hourly Incremental Backup & Restore, High Availability & Self-Healing Architecture.

##### Part 5 — Performance Tuning, Scalability & Production Readiness
- Multi-Level Caching (Redis, Edge CDN, Application), Database Query Optimization & PgBouncer Connection Pooling, High-Throughput Message Queue Systems, Automatic Horizontal Scaling, Cloud Infrastructure Cost Optimization, Long-Term Capacity Planning, Performance & Load Stress Testing, Chaos Engineering Validation, Production Go-Live Hypercare Roadmap.

---

### Volume 3: Finance, Accounting & ERP (Est. 2,000+ Pages)

#### 3.1 Financial Management & Double-Entry General Ledger
- **General Ledger & Chart of Accounts (COA)**: Hierarchical account structure across Assets, Liabilities, Equity, Revenue, and Expenses. Balanced debit/credit enforcement for every financial transaction.
- **Journal Entries & Trial Balance**: Real-time journal posting, automatic balancing checks, period closing controls, immutable posted journals, automated Trial Balance generation.
- **P&L, Balance Sheet & Cash Flow**: Automated Profit & Loss statements, Balance Sheets, Direct/Indirect Cash Flow statements, multi-currency conversion, quarterly audit reports.
- **DB Entities (~45 Tables)**: `gl_accounts`, `journal_entries`, `journal_lines`, `trial_balances`, `fiscal_periods`, `financial_reports`, `ledger_audit_trail`, etc.
- **APIs (120+)**: `POST /finance/journal/post`, `GET /finance/gl/accounts`, `GET /finance/trial-balance`, `GET /finance/reports/pnl|balance-sheet|cash-flow`.

#### 3.2 Enterprise Billing & Tax Engine
- **Invoicing & Taxation**: Multi-state Indian GST calculation (CGST, SGST, IGST), HSN/SAC code tracking, Automated Tax Invoices, Proforma Invoices, Credit Notes (Returns), Debit Notes (Penalties/Recovery).
- **Recurring & Subscription Billing**: Automated subscription billing cycles, prorated billing, automated dunning management for failed payments, dynamic invoice rendering.
- **DB Entities (~30 Tables)**: `invoices`, `invoice_items`, `tax_rules`, `gst_filings`, `credit_notes`, `debit_notes`, `recurring_subscriptions`, `dunning_logs`, etc.
- **APIs (80+)**: `POST /billing/invoice/generate`, `POST /billing/credit-note/create`, `GET /billing/gst/report`.

#### 3.3 Payments, Settlements & Gateway Reconciliation
- **Payment Gateway Integrations**: PayU, Razorpay, Cashfree, PhonePe (UPI, Credit/Debit Cards, Net Banking, Wallets). Idempotent webhooks & signature verification.
- **Refunds & Automated Reconciliation**: Instant wallet refunds, automated bank transfer refunds, daily automated matching of bank feeds, gateway settlements, and order ledgers.
- **DB Entities (~35 Tables)**: `payment_transactions`, `gateway_settlements`, `refund_requests`, `bank_reconciliations`, `seller_wallets`, `seller_ledgers`, `settlement_runs`, etc.
- **APIs (100+)**: `POST /payments/charge`, `POST /payments/refund`, `GET /finance/reconciliation/status`, `POST /settlements/release`.

#### 3.4 Procurement & Inventory Costing
- **Purchase Orders & Vendor Bills**: PO creation, 3-way matching (PO vs. GRN vs. Vendor Invoice), automated vendor bill approval chains, supplier payment scheduling.
- **Inventory Costing Engine**: Real-time costing calculations via FIFO, Weighted Average Costing, and Standard Costing models.
- **DB Entities (~25 Tables)**: `purchase_orders`, `po_items`, `vendor_bills`, `bill_payments`, `inventory_cost_ledger`, `cost_adjustments`, etc.
- **APIs (60+)**: `POST /procurement/po/create`, `POST /procurement/bill/verify`, `GET /procurement/costing/summary`.

#### 3.5 Financial Analytics & Statutory Reporting
- MIS reporting, cash flow forecasting models, dynamic budgeting vs. actuals tracking, TDS/TCS statutory reporting under Indian Tax laws.

---

### Volume 4: HRMS & Workforce Management (Est. 1,500+ Pages)

#### 4.1 Employee Lifecycle & Onboarding
- **Employee Master & Profiles**: Complete employee 360 profile, department hierarchy, designation trees, employment types (Full-time, Contract, Shift worker).
- **Recruitment & Onboarding**: Job requisition management, candidate pipeline tracking, offer letter generation, digital document submission, automated onboarding workflows.
- **DB Entities (~30 Tables)**: `employees`, `departments`, `designations`, `job_requisitions`, `candidates`, `onboarding_tasks`, `employee_documents`, etc.

#### 4.2 Attendance, Leave & Biometric Integration
- **Attendance Engine**: Biometric hardware sync (fingerprint/face recognition), mobile GPS geofenced check-in, shift rotation planning, overtime calculation.
- **Leave Management**: Configurable leave policies (Casual, Sick, Earned, Maternity), multi-level approval workflows, leave balance ledgers.
- **DB Entities (~25 Tables)**: `attendance_logs`, `biometric_devices`, `work_shifts`, `leave_requests`, `leave_balances`, `holiday_calendars`, etc.

#### 4.3 Payroll, Statutory Compliance & Self-Service
- **Payroll Processing**: Automated salary calculation, statutory deductions (PF, ESI, Professional Tax, TDS/Form 16), payslip generation, direct bank transfer integration.
- **Performance & ESS**: OKR/KPI tracking, annual appraisal cycles, corporate asset allocation, Employee Self-Service (ESS) portal for leave/payslips/claims.
- **APIs (100+)**: `POST /hrms/employee/create`, `POST /hrms/attendance/log`, `POST /hrms/payroll/run`, `GET /hrms/ess/payslip`.

---

### Volume 5: Customer Support & Service Desk (Est. 1,500+ Pages)

#### 5.1 Omnichannel Ticketing & Contact Center
- **Omnichannel Intake**: Unified inbox integrating WhatsApp Business, Email, Live Chat, Web Forms, and Call Center CTI/IVR.
- **Automated Routing & SLAs**: Skill-based ticket routing, priority queueing, automated SLA violation timers, multi-level escalation trees.
- **DB Entities (~35 Tables)**: `support_tickets`, `ticket_messages`, `ticket_routing_rules`, `agent_queues`, `sla_policies`, `call_logs`, `ticket_escalations`, etc.

#### 5.2 Self-Service Knowledge Base & CSAT Analytics
- **Knowledge Base (KB)**: Internal and external self-service articles, AI-assisted search, ticket deflection suggestions.
- **CSAT & NPS Engine**: Automated post-resolution CSAT surveys, Net Promoter Score (NPS) tracking, agent performance scorecards, AI sentiment analysis.
- **APIs (80+)**: `POST /support/ticket/create`, `PUT /support/ticket/{id}/reply`, `GET /support/kb/search`, `POST /support/csat/submit`.

---

### Volume 6: Sales, POS & Retail Operations (Est. 1,800+ Pages)

#### 6.1 Point of Sale (POS) & Retail Billing
- **POS Terminal Interface**: Touch-optimized checkout UI, barcode/QR scanning, multi-tender payments (Cash, Card, UPI, Store Credit), instant tax receipt printing.
- **Offline Local Sync**: IndexedDB local storage enabling uninterrupted billing during network outages; automated background reconciliation upon reconnection.
- **DB Entities (~30 Tables)**: `pos_terminals`, `pos_sessions`, `pos_sales`, `pos_sale_items`, `store_registers`, `offline_sync_queue`, etc.

#### 6.2 Multi-Branch Store & Franchise Management
- **Branch Operations**: Inter-store inventory transfers, local store fulfillment, store manager approvals, branch revenue dashboards.
- **Franchise Network**: Franchise onboarding, revenue sharing calculations, franchise stock allocations, centralized pricing governance.
- **APIs (90+)**: `POST /pos/sale/checkout`, `POST /pos/sync/offline`, `GET /retail/branch/stock`, `GET /retail/franchise/settlements`.

---

### Volume 7: Vendor, Procurement & Supply Chain (Est. 1,800+ Pages)

#### 7.1 Vendor Self-Service Portal & Contract Management
- **Vendor Portal**: Vendor registration, document submission, PO acceptance, shipping notice generation, invoice uploading, payment tracking.
- **Contract Governance**: Vendor agreement tracking, renewal alerts, pricing lock agreements, penalty clause enforcement.
- **DB Entities (~35 Tables)**: `vendors`, `vendor_contracts`, `rfq_requests`, `rfq_bids`, `procurement_workflows`, `supplier_scorecards`, etc.

#### 7.2 RFQ/RFP Engine & Supply Planning
- Automated Request for Quotation (RFQ) distribution, bidding comparison matrix, supplier SLA scoring, automated demand-based purchase order recommendations.
- **APIs (85+)**: `POST /vendor/rfq/create`, `POST /vendor/bid/submit`, `GET /vendor/performance/{vendorId}`, `POST /procurement/po/auto-generate`.

---

### Volume 8: AI Operating System (AetheerAI) (Est. 2,500–3,500 Pages)

#### 8.1 Core AI Architecture & Memory Engine
- **LLM Orchestration & Knowledge Graph**: Hybrid LLM router (Claude, GPT-4, Llama 3), vector embeddings via Supabase pgvector, long-term memory engine, Enterprise Knowledge Graph.
- **Context Window Management**: Dynamic token trimming, semantic search retrieval, system prompt injection protection.

#### 8.2 Autonomous AI Agent Factory
- **Specialized Autonomous Agents**:
  - `Website & App Builder Agent`: Generates UI layouts, code components, and API routes.
  - `Sales & Conversion Agent`: Personalizes offers, engages leads via chat/WhatsApp.
  - `Support Agent`: Resolves tickets autonomously, issues refunds within threshold.
  - `Coding & Testing Agent`: Writes unit tests, refactors code, fixes lints.
  - `Security & SRE Agent`: Monitors telemetry, detects threats, triggers self-healing failovers.
- **DB Entities (~50 Tables)**: `ai_agents`, `ai_conversations`, `ai_embeddings`, `agent_execution_logs`, `knowledge_nodes`, `tool_call_history`, `ai_governance_rules`, etc.
- **APIs (150+)**: `POST /ai/agent/dispatch`, `POST /ai/memory/query`, `POST /ai/orchestrate`, `GET /ai/telemetry`.

---

### Volume 9: Business Intelligence & Data Platform (Est. 1,500+ Pages)

#### 9.1 Data Warehouse & ETL/ELT Pipelines
- **Data Lake & OLAP**: Automated extraction pipelines from PostgreSQL transactional DB to Data Lakehouse, OLAP analytical cubes, columnar storage optimization.
- **Real-Time KPI Engine**: Real-time GMV, Net Revenue, Customer LTV, Order SLA Compliance, Inventory Turnover, Seller Quality Scores.
- **DB Entities (~40 Tables)**: `dw_sales_fact`, `dw_inventory_fact`, `dw_customer_dim`, `dw_seller_dim`, `olap_cubes`, `kpi_definitions`, `etl_job_runs`, etc.
- **APIs (90+)**: `GET /bi/kpi/gmv`, `POST /bi/query/cube`, `GET /bi/dashboard/executive`.

---

### Volume 10: Mobile Applications Ecosystem (Est. 1,200+ Pages)

#### 10.1 Multi-App Native Architecture
- **8 Dedicated Apps**: Customer App, Seller Portal App, Staff App, Warehouse WMS App, Courier Delivery App, Field Technician App, Admin Console App, Manager Approval App.
- **Native Hardware Integration**: Offline SQLite sync, FCM/APNS Push Notifications, Biometric Auth (TouchID/FaceID), GPS tracking & geofencing, Camera Barcode/QR scanning, RFID/NFC reader SDKs.
- **APIs (120+)**: `POST /mobile/auth/biometric`, `POST /mobile/sync/push`, `POST /mobile/location/update`.

---

### Volume 11: Security, Compliance & Governance (Est. 2,000+ Pages)

#### 11.1 Zero Trust Security Architecture & SIEM/SOC
- **Zero Trust & IAM**: Fine-grained RBAC + ABAC (Attribute-Based Access Control), TOTP/SMS Multi-Factor Authentication, AES-256-GCM data encryption, automated secret vault rotation.
- **SIEM & SOC Telemetry**: Immutable PostgreSQL audit logs via DB triggers, real-time threat detection, automated IP blocking, vulnerability scanner integration.
- **Statutory Compliance**: Full compliance with Indian DPDP Act 2023, GST regulations, ISO/IEC 27001 controls, SOC 2 Type II audit readiness.
- **DB Entities (~45 Tables)**: `security_policies`, `iam_roles`, `user_mfa_devices`, `audit_trail_immutable`, `siem_events`, `vulnerability_scans`, `bcp_plans`, etc.
- **APIs (110+)**: `POST /security/auth/mfa`, `GET /security/audit/logs`, `POST /security/vulnerability/scan`.

---

### Volume 12: Infrastructure & DevOps (Est. 1,500+ Pages)

#### 12.1 Multi-Cloud Infrastructure & CI/CD Pipelines
- **Cloud Engineering**: Vercel Edge Hosting, Supabase Managed PostgreSQL, PgBouncer, Cloudinary CDN, AWS S3/EC2 backup nodes, Cloudflare WAF/DDoS.
- **CI/CD & SRE**: GitHub Actions automated pipelines, SAST/DAST security gates, Blue-Green zero-downtime deployments, automated canary rollbacks, PagerDuty incident integration, automated hourly DB backups (RTO ≤ 4h, RPO ≤ 15m).
- **DB Entities (~30 Tables)**: `cicd_pipelines`, `deployment_runs`, `infra_monitors`, `incident_logs`, `backup_records`, etc.
- **APIs (80+)**: `POST /devops/deploy/trigger`, `GET /devops/health`, `POST /devops/rollback`.

---

### Volume 13: API, SDK & Developer Platform (Est. 1,200+ Pages)

#### 13.1 Developer Portal & Open API Marketplace
- REST API Gateway, GraphQL Endpoint, Webhooks Engine, Public SDKs (Node.js, Python, Mobile), Third-Party App Marketplace, Developer Portal with interactive Swagger/Postman specs, Rate Limiting (Token Bucket algorithm).
- **DB Entities (~25 Tables)**: `api_applications`, `developer_keys`, `webhook_subscriptions`, `marketplace_plugins`, `rate_limit_rules`, etc.
- **APIs (100+)**: `POST /developer/keys/generate`, `POST /developer/webhooks/register`, `GET /developer/marketplace/plugins`.

---

### Volume 14: IoT, Automation & Smart Devices (Est. 1,500+ Pages)

#### 14.1 Hardware Integration & Smart Automation
- CCTV Security System API integration (RTSP/ONVIF), Smart Electronic Door Locks, RFID Warehouse Portal Readers, Biometric Attendance Hardware, Environmental Temperature/Humidity Sensors, Fleet Vehicle GPS Transmitters, Edge Computing Gateway Nodes.
- **DB Entities (~30 Tables)**: `iot_devices`, `telemetry_streams`, `sensor_alerts`, `cctv_streams`, `rfid_scans`, `edge_nodes`, etc.
- **APIs (90+)**: `POST /iot/device/register`, `POST /iot/telemetry/stream`, `GET /iot/sensors/alerts`.

---

### Volume 15: Future Innovation & R&D (Est. 1,500+ Pages)

#### 15.1 Next-Gen Frontier Technologies
- AI Robotics Warehouse Integration (AGV/AMR), Autonomous Drone Delivery Dispatch, Digital Twin Warehouse 3D Simulation, AR/VR Immersive Product Shopping, Natural Language Voice Commerce, Autonomous Dark Fulfillment Centers, Blockchain Supply Chain Traceability Ledger, Quantum-Resistant Cryptography Readiness, Green Logistics Carbon Footprint Tracker.
- **DB Entities (~35 Tables)**: `robotics_tasks`, `drone_missions`, `digital_twin_nodes`, `blockchain_blocks`, `sustainability_logs`, etc.
- **APIs (100+)**: `POST /innovation/drone/dispatch`, `POST /innovation/digital-twin/sync`, `GET /innovation/sustainability/carbon-score`.

---

## Final Enterprise Implementation Plan Summary

| Volume | Focus Area                                                    | Chapters/Parts | Est. Pages |
| ------ | ------------------------------------------------------------- | -------------- | ---------- |
| **1**  | Foundation & Third-Party Seller Management (v1.0)             | 14 Chapters    | 400–500    |
| **2**  | Enterprise Operations & Platform Management                   | 5 Chapters     | 2,000–2,500|
| **3**  | Finance, Accounting & ERP                                     | 5 Parts        | 2,000+     |
| **4**  | HRMS & Workforce Management                                   | 12 Modules     | 1,500+     |
| **5**  | Customer Support & Service Desk                               | 12 Modules     | 1,500+     |
| **6**  | Sales, POS & Retail Operations                                | 9 Modules      | 1,800+     |
| **7**  | Vendor, Procurement & Supply Chain                            | 9 Modules      | 1,800+     |
| **8**  | AI Operating System (AetheerAI)                               | 8 Core Areas   | 2,500–3,500|
| **9**  | Business Intelligence & Data Platform                         | 9 Core Areas   | 1,500+     |
| **10** | Mobile Applications Ecosystem                                 | 8 Native Apps  | 1,200+     |
| **11** | Security, Compliance & Governance                             | 13 Modules     | 2,000+     |
| **12** | Infrastructure & DevOps                                       | 10 Modules     | 1,500+     |
| **13** | API, SDK & Developer Platform                                 | 10 Modules     | 1,200+     |
| **14** | IoT, Automation & Smart Devices                               | 9 Integrations | 1,500+     |
| **15** | Future Innovation & R&D                                       | 10 R&D Domains | 1,500+     |

**Total Cumulative Enterprise Ecosystem**: 15 Master Volumes, ~24,400–26,900 Total Pages.

---

## Implementation Execution Status

*Implementation completed and verified across schema models, marketplace core pricing engine, settlement calculator, seller portal, superadmin governance console, and API routes.*

---

## Volume 16: Enterprise Operations Execution Plan (Phases 1–8)

### Phase 1 — Foundation & Architecture (100% Detailed Specification)
- **1.1 Project Architecture**:
  - Apps Structure: `apps/public`, `apps/customer`, `apps/mgmt`, `apps/superadmin`, `apps/engineer`, `apps/webmail`, `apps/shared`.
  - Shared Package: `@tecbunny/ui` & `@tecbunny/core` containing components, layouts, hooks, utils, types, constants, API clients, services, validators, permissions, icons, themes.
- **1.2 Backend Architecture Pipeline**:
  - Standard Pipeline: `API` → `Authentication` → `Authorization (RBAC)` → `Validation` → `Controllers` → `Business Logic` → `Database` → `Notifications` → `Audit Logs`.
- **1.3 Database Foundation**:
  - Core Tables: `users` (id, employee_code, first_name, last_name, email, mobile, password_hash, status, role_id, department_id), `roles` (Super Admin, Admin, Manager, Sales, Engineer, Inventory, Accounts, Customer), `permissions` (module.action pattern: customer.view, order.approve, inventory.transfer, etc.), `role_permissions` (M:N), `departments` (Sales, Operations, Accounts, Inventory, Support, Management, Engineering), `activity_logs` (user_id, module, action, old_data, new_data, ip, browser), `notifications`.
- **1.4 Authentication**:
  - Multi-identifier Login: Email, Mobile Number, Employee Code.
  - Security: Argon2 password hashing, Session management (IP, Browser, Device fingerprinting, Refresh & Access JWT Tokens), OTP-based Forgot Password flow, Email verification pipeline.
- **1.5 User Management**:
  - Admin provisioned profiles: Employee Code, Department, Role, Reporting Manager, Joining Date, Active Status.
- **1.6 Role-Based Access Control (RBAC)**:
  - Granular permission checks on screens, dynamic buttons, API endpoints, and reports.
- **1.7 Dynamic Navigation**:
  - Role & Permission driven dynamic sidebar and dashboard widget layout generation upon user login.
- **1.8 Global Settings Module**:
  - Centralized controls: Company info, GSTIN, Addresses, Logo, Currency, Timezone, Date Format, Invoice/Quotation Prefixes, Email (SMTP), SMS, WhatsApp WABA credentials, DB Backup settings, Maintenance Mode.
- **1.9 File Management System**:
  - Auto-generated directory hierarchy: `customers/`, `products/`, `projects/`, `tickets/`, `quotations/`, `warranty/`. Support for PDF, Excel, Images, CAD Drawings, Videos, ZIP.
- **1.10 Notification Engine**:
  - Multi-channel dispatchers: Email, WhatsApp, SMS, In-App, Push Notifications with persistent delivery audit log.
- **1.11 Unified Search Engine**:
  - Cross-module indexing across Customers, Leads, Products, Orders, Quotations, Projects, Tickets, Field Engineers, and Inventory SKUs.
- **1.12 Comprehensive Audit Logging**:
  - Change tracking capturing old vs new state delta, timestamp, IP address, user ID, and browser fingerprint.
- **1.13 Dashboard Framework**:
  - Role-configurable modular widgets: Revenue, Orders, Leads, Inventory, Projects, Engineer Visits, Tasks, Calendar, Quick Actions.
- **1.14 Common UI Component Library**:
  - 25+ Standard reusable components: Button, Table, Data Grid, Modal, Drawer, Form Builder, Date/Time Picker, File/Image Upload, Pagination, Breadcrumbs, Tabs, Cards, Charts, Timeline, Kanban Board, Calendar, Status Badges, Toasts, Confirmation Dialogs, Skeletons.
- **1.15 API Standards & Response Format**:
  - Uniform REST endpoints & standard envelope: `{ success: boolean, message: string, data: object, errors: array, meta: object }`.
- **1.16 Enterprise Security Baseline**:
  - HTTPS, JWT Refresh Tokens, CSRF, Rate Limiting, SQLi/XSS Prevention, CSP, Supabase RLS, Secure File Upload Validation, Encrypted Backups.
- **1.17 Completion Checklist**:
  - Schema finalized, Authentication active, RBAC & Dynamic menus ready, Settings & Notifications live, Audit logs verified, UI Library built.

---

### Phase 2 — CRM (Customer Relationship Management) Module (100% Detailed Specification)
- **2.1 Lead Management**:
  - Sources: Website Form, Quote Request, WhatsApp, Call, Email, Social Ads, Referral, Walk-in, Manual, Excel/CSV Import.
  - Data: Basic details (GSTIN, PAN, Industry), Addresses (Google Maps integration), Business details (Type, Revenue, Budget, Vendor), Classification (Hot, Warm, Cold, Lost, Duplicate, Spam).
  - Statuses: `New` → `Assigned` → `Contacted` → `Meeting Scheduled` → `Quotation Sent` → `Negotiation` → `Won` → `Lost` → `Closed`.
  - Immutable timeline logging. Automatic assignment engine (Location, Product, Salesperson workload, Availability).
  - Duplicate detection matching Mobile, Email, GSTIN, and Company Name.
- **2.2 Customer Management**:
  - Automatic lead-to-customer conversion. Profiles with GSTIN & PAN.
  - Multiple contact person roles (Owner, Manager, Accounts, Purchase, Technical, Billing).
  - Multi-branch hierarchy support (Goa, Mumbai, Bangalore branches with separate orders & engineers).
  - Secure Document vault (GST Cert, PAN, Agreements, POs, Drawings). Full customer lifecycle timeline.
- **2.3 Opportunity Management**:
  - Multi-opportunity mapping per customer (CCTV, Networking, RFID, AMC).
  - Stages: `Discovery` → `Requirement Gathering` → `Proposal` → `Negotiation` → `Won` → `Lost`.
- **2.4 Follow-up & 2.5 Meeting Management**:
  - Phone, Meeting, Email, WhatsApp, Site Visit reminders. Today's/Missed/Upcoming follow-up dashboards.
  - Site survey meeting records with Minutes, Photos, Attachments, and GPS location.
- **2.6 Task Management & 2.7 Quotation Request**:
  - Task delegation (BOQ prep, site survey, demo, installation) with priority and deadline tracking.
  - 1-click Quotation Request auto-transferring customer, product, address, and GST rules to Quotation Engine.
- **2.8 Customer Communication, Notes & Attachments**:
  - Multi-channel communication timeline (Calls, WhatsApp, Email, SMS, Meetings). Tagging system (VIP, Govt, Corporate, Retail).
- **2.13 CRM Reports & 2.14 Dashboard**:
  - Lead source analysis, conversion rates, sales funnels, CLV, salesperson leaderboards. Drag-and-drop widget dashboard.
- **2.15 Permission Matrix & 2.16 APIs**:
  - Granular RBAC controls on lead creation, editing, deletion, merging, and exporting. Standard REST `/crm/*` endpoints.
- **Database Tables (Phase 2)**:
  - `leads`, `lead_sources`, `lead_statuses`, `lead_assignments`, `lead_notes`, `lead_activities`, `customers`, `customer_contacts`, `customer_branches`, `customer_documents`, `opportunities`, `followups`, `meetings`, `tasks`, `customer_tags`, `customer_tag_mapping`.

---

### Phase 3 — Quotation & Sales Management (100% Detailed Specification)
- **3.1 Quotation Dashboard & 3.2 Quotation Creation**:
  - Auto-formatting QT-YYYY-XXXXXX numbers, revision tracking (`QT-2026-00015-R1`).
  - Auto-fill from Lead, Customer, Opportunity. Header details (expiry, payment/delivery terms, branch, project).
- **3.3 Bill of Quantity (BOQ) & 3.4 Product/Service Selection**:
  - Multi-line item BOQ: Products & Services (Installation, Testing, Configuration, Training, Transport).
  - Real-time stock availability warnings (Current vs Reserved stock check).
- **3.6 Pricing & 3.7 Tax Management Engine**:
  - Automated GST calculation (CGST, SGST, IGST based on Customer State vs Company State, HSN/SAC rules).
  - Percentage/Fixed discounts, Customer-specific/Dealer pricing rules.
- **3.8 Discount Approval Workflow & 3.9 Statuses**:
  - Tiered approvals: ≤5% Salesperson, 5–10% Manager, >10% Admin.
  - Statuses: `Draft` → `Pending Approval` → `Approved` → `Sent` → `Viewed` → `Negotiation` → `Accepted` → `Rejected` → `Expired` → `Converted`.
- **3.10 Revision Control & 3.11 Customer Approval**:
  - Immutable revision logs. Customer portal online approval with OTP verification & digital signature capture.
- **3.12 Quotation PDF Engine & 3.13 Multi-channel Sharing**:
  - Dynamic PDF compiler with QR code verification, terms, GST breakdown. Email/WhatsApp dispatch.
- **3.14 Sales Order Conversion & 3.15 Payment Tracking**:
  - 1-click conversion to Sales Order (SO-YYYY-XXXXXX), auto stock reservation, project creation.
  - Advance, partial, and full payment logging (UPI, Net Banking, Cards, Cheque).
- **3.16 Invoice Integration**:
  - Auto-generation of Tax Invoice from Sales Order with GST breakdown and E-Invoice compatibility.
- **Database Tables (Phase 3)**:
  - `quotations`, `quotation_items`, `quotation_revisions`, `quotation_approvals`, `quotation_comments`, `quotation_files`, `sales_orders`, `sales_order_items`, `payments`, `payment_receipts`, `invoices`, `invoice_items`, `tax_master`, `pricing_rules`, `discount_rules`.

---


### Phase 4 — Inventory & Warehouse Management (100% Detailed Specification)
- **4.1 Inventory Dashboard & 4.2 Product Master**:
  - Stock overview: Available, Reserved, Installed, Returned, Damaged, Low Stock, Dead Stock.
  - SKU, Barcode, QR Code, Brand, Model, Category, Technical specs (Voltage, Power), HSN Code, GST Rate, Warranty.
- **4.3 Category & 4.4 Brand Management**:
  - Unlimited multi-level category tree (CCTV → Cameras → DVR; Networking → Switches → Routers). Brand warranty policies.
- **4.5 Warehouse & 4.6 Stock Management**:
  - Multi-Warehouse hubs (Main, Branch, Service Center, Engineer Vehicle).
  - Stock states: Available, Reserved, Allocated, Installed, Returned, Damaged, Demo, Repair, Replacement.
- **4.7 Serial Number Tracking**:
  - Lifecycle: `Purchased` → `Received` → `Warehouse` → `Reserved` → `Installed` → `Customer` → `Warranty` → `Replacement` → `Returned`. Unique SN constraint.
- **4.8 Barcode/QR Code & 4.9 Purchase Management**:
  - ZPL/PDF label printing, mobile barcode/QR scanning.
  - Purchase Orders (PO-YYYY-XXXXXX): Draft → Approved → Sent → Partially Received → Completed → Cancelled.
- **4.10 Goods Receipt Note (GRN) & 4.11 Vendor Master**:
  - GRN verification, barcode scanning, quality check, inventory update. Vendor profiles, ratings, PO history.
- **4.12 Stock Transfer & 4.13 Stock Reservation**:
  - Multi-warehouse transfer approval & transit logs. Auto-reservation on Sales Order confirmation.
- **4.14 Inventory Adjustments & 4.15 Returns**:
  - Physical count corrections (Damaged, Lost, Found, Expired). Customer, Vendor, Engineer return logs with photos.
- **4.16 Engineer Inventory & 4.17 Alerts**:
  - Engineer vehicle stock tracking (Assigned, Used, Returned, Damaged). Low stock & dead stock automated alerts.
- **4.18 Audits, 4.19 Reports & 4.20 Dashboard**:
  - Physical stock count audit logs. Stock valuation, aging reports, fast/slow-moving analytics.
- **Database Tables (Phase 4)**:
  - `products`, `product_categories`, `product_brands`, `product_files`, `warehouses`, `warehouse_stock`, `stock_movements`, `serial_numbers`, `vendors`, `purchase_orders`, `purchase_order_items`, `goods_receipts`, `goods_receipt_items`, `stock_transfers`, `stock_transfer_items`, `stock_adjustments`, `inventory_returns`, `engineer_inventory`, `inventory_audits`, `inventory_alerts`.


---

### Phase 5 — Order Processing & Project Management (100% Detailed Specification)
- **5.1 Order Dashboard & 5.2 Order Progression**:
  - Auto-creation of Sales Order from accepted quotation.
  - Statuses: `Draft` → `Confirmed` → `Payment Pending` → `Inventory Reserved` → `Project Created` → `Installation Scheduled` → `In Progress` → `Completed` → `Closed` → `Cancelled`.
- **5.3 Payment Verification & 5.4 Stock Reservation**:
  - Payment modes (UPI, Bank Transfer, Cards, Cheque). Mandatory advance verification gate before order progression.
  - Automatic inventory reservation & warehouse dispatch notification.
- **5.5 Project Creation & 5.6 Project Dashboard**:
  - Auto-project instantiation (`PRJ-YYYY-XXXXXX`). Statuses: `Created` → `Planning` → `Material Ready` → `Installation Scheduled` → `Started` → `Testing` → `Approved` → `Completed`.
- **5.7 Tasks & 5.8 Milestone Management**:
  - Task breakdown (Survey, Dispatch, Installation, Testing, Training, Handover). Milestone % tracking (20%, 40%, 70%, 90%, 100%).
- **5.9 Resource Allocation & 5.10 Material Dispatch**:
  - Assign Project Manager, Engineers, Vehicles, Tools with availability validation. Dispatch tracking (Vehicle, Driver, Engineer, Packing List).
- **5.11 Site Survey & 5.12 Installation Scheduling**:
  - Pre-installation survey photo/layout uploads. Calendar view scheduling with drag-and-drop support.
- **5.13 Document Vault, 5.14 Communications & 5.15 Delay Management**:
  - Centralized project file repository (Blueprints, Certificates, Signatures).
  - Automated SMS/WhatsApp/Email milestones notifications. Mandatory delay reason logging & re-approval workflow.
- **5.16 Budget Tracking & 5.18 Completion Checklist**:
  - Material vs Labour vs Transport cost comparison; budget overrun alerts. Mandatory 9-step completion checklist before project closure.
- **Database Tables (Phase 5)**:
  - `sales_orders`, `sales_order_status_history`, `order_payments`, `projects`, `project_members`, `project_tasks`, `project_milestones`, `project_documents`, `project_timeline`, `installation_schedules`, `site_surveys`, `material_dispatch`, `material_dispatch_items`, `project_budget`, `completion_checklists`.

---


### Phase 6 — Field Service Management (100% Detailed Specification)
- **6.1 Dashboard & 6.2 Service Request Management**:
  - Channels: Customer Portal, Phone, Email, WhatsApp, Staff, AMC, Warranty.
  - Priorities: Critical (SLA 30m response/4h resolution), High (2h/8h), Medium (4h/24h), Low (1d/3d).
- **6.3 Ticket Lifecycle & 6.4 Engineer Skill Matrix**:
  - States: `New` → `Assigned` → `Accepted` → `Travelling` → `On Site` → `Work Started` → `Waiting Parts` → `Testing` → `Completed` → `Customer Approved` → `Closed`.
  - Skill mapping (CCTV, Networking, Access Control, Biometric, Server, Fiber, Electrical).
- **6.5 Assignment & 6.6 Engineer Mobile Portal**:
  - Automated assignment engine matching skills, GPS proximity, workload, SLA. Mobile app controls (Jobs, GPS navigation, start/pause/complete, QR scan, photos, signature).
- **6.7 Live GPS Tracking & 6.8 Verified Check-In**:
  - Live engineer map, route history, distance travelled. Geofenced GPS check-in/check-out verification.
- **6.9 Work Report Evidence & 6.10 Product QR Verification**:
  - Mandatory Before/After photos, videos, notes, parts used. QR scan serial lookup & warranty/AMC history verification.
- **6.11 Spare Parts & 6.12/6.13 Checklists**:
  - Engineer vehicle stock deduction & warehouse update. Product-specific installation & service checklists.
- **6.14 Digital Signature & 6.15 Rating System**:
  - Touchscreen digital signature capture with GPS timestamp. 5-star customer rating & feedback survey.
- **6.16 AMC & 6.17 Warranty Management**:
  - Automated AMC visit scheduler (Annual, Quarterly, Monthly). Warranty claim validation & replacement log.
- **6.19 SLA & 6.20 Escalation Workflow**:
  - Automated breach monitoring & multi-level management escalation trail (Engineer → PM → Ops Mgr → Admin).
- **Database Tables (Phase 6)**:
  - `service_tickets`, `service_ticket_history`, `engineers`, `engineer_skills`, `engineer_schedule`, `engineer_location_logs`, `engineer_inventory`, `service_reports`, `service_photos`, `installation_checklists`, `service_checklists`, `customer_signatures`, `customer_feedback`, `amc_contracts`, `amc_visits`, `warranty_claims`, `sla_rules`, `sla_logs`.


---

### Phase 7 — Customer Portal & Self-Service Platform (100% Detailed Specification)
- **7.1 Authentication & 7.2 Dashboard**:
  - Email, Mobile, OTP & Password login; session & device management. Quick actions (Raise Ticket, Download Invoice, View Warranty, Renew AMC, Track Installation, Pay Online).
- **7.3 Profile & Contact Management**:
  - Customer 360 profile, multi-contact roles (Owner, Accounts, Purchase, Technical), branch office address vault.
- **7.4 Order Tracking & 7.5 Project Milestone Portal**:
  - Real-time order progression tracking (`Order Confirmed` → `Inventory Reserved` → `Project Created` → `Engineer Assigned` → `Installation Scheduled` → `Completed`).
  - Milestone progress breakdown (Survey, Material, Installation %, Testing), blueprint downloads.
- **7.6 Service Ticket Portal & 7.7 Warranty Claim Vault**:
  - 1-click Ticket Creation with photo/video uploads, live engineer tracking, 1-click warranty claim dispatcher.
- **7.8 AMC Renewal Hub & 7.9 Online Invoice Payments**:
  - Active contract management, visit scheduler, 1-click AMC renewal. Integrated online payments (UPI, Cards, Net Banking) with instant receipt download.
- **7.10 Document Vault & 7.12 Product QR Registration**:
  - Folder hierarchy (`Orders/`, `Projects/`, `Warranty/`, `AMC/`, `Invoices/`). Product QR scan serial registration & instant warranty activation.
- **7.13 Appointment Booking & 7.14 Support Knowledge Base**:
  - Slot-based appointment booking (Installation, Demo, Survey, Service Visit). FAQs, Video tutorials, User manuals.
- **7.16 Rating Survey & 7.17 Download Center**:
  - 5-Star rating system (Installation, Engineer, Service, Experience). Single dashboard for downloading PDF tax invoices, warranty cards, AMC certificates.
- **Database Tables (Phase 7)**:
  - `customer_accounts`, `customer_sessions`, `customer_profiles`, `customer_addresses`, `customer_notifications`, `customer_documents`, `customer_download_logs`, `customer_feedback`, `appointments`, `portal_activity_logs`, `portal_preferences`.

---

### Phase 8 — Administration, Finance & Business Operations (100% Detailed Specification)
- **8.1 Admin Dashboard & 8.2 Company/Branch Management**:
  - Executive financial summary (Revenue Today, Monthly Profit, Gross Margin, Receivables, Payables). Multi-branch isolation (Goa, Mumbai, Pune, Bangalore).
- **8.4 Employee, 8.5 Attendance & 8.6 Leave Management**:
  - Employee Master & Statuses. GPS & QR-code mobile attendance with check-in/out timestamps. Tiered leave approval workflow (Employee → Manager → HR).
- **8.7 Payroll & 8.8/8.9 Procurement Approvals**:
  - Salary generation, allowances, payslip compiler. Tiered procurement approval rules: ≤₹25,000 Manager, ₹25,001–₹100,000 Operations Head, >₹100,000 Admin.
- **8.10 Expense & 8.12/8.13 Finance Ledger**:
  - Expense reimbursement workflow (Fuel, Travel, Office, Marketing). Tax Invoices, Proforma, Credit/Debit Notes. Outgoing vendor & salary payments.
- **8.14 Accounts Receivable & 8.15 Accounts Payable**:
  - Customer aging reports with automated payment reminder triggers (7d, 3d, Due Date, Overdue). Vendor bill ledger & payment scheduling.
- **8.16 Tax Management & 8.17 Universal Approval Engine**:
  - GST, CGST, SGST, IGST & TDS registers. Unified approval engine for Discounts, Purchases, Expenses, Refunds, Stock Adjustments, and Leaves.
- **8.18 Immutable Audit Logs & 8.20 BI Analytics**:
  - Administrative audit log capturing user, module, old vs new values, IP, browser. Comparative BI analytics (Daily, Weekly, Monthly, Yearly).
- **Database Tables (Phase 8)**:
  - `companies`, `branches`, `employees`, `attendance`, `leave_requests`, `payroll`, `expenses`, `expense_approvals`, `vendors`, `purchase_requests`, `purchase_approvals`, `invoices`, `invoice_payments`, `receivables`, `payables`, `finance_ledgers`, `tax_register`, `approval_workflows`, `approval_history`, `admin_activity_logs`, `business_kpis`.

---



### Phase 4 — Workflow Automation
- End-to-End Automated Business Execution:
  `Order Confirmed` → `Create Project` → `Reserve Inventory` → `Assign Engineer` → `Notify Customer` → `Schedule Installation` → `Generate Invoice` → `Activate Warranty` → `Collect Customer Feedback`.

### Phase 9 — Business Intelligence (BI), Analytics & Reporting (100% Detailed Specification)
- **9.1 Executive Dashboard & 9.2 Sales Analytics**:
  - Real-time financial KPIs (Today/Monthly/Quarterly/Annual Revenue, Gross/Net Profit, Receivables, Payables, Cash Flow). Sales breakdown by Day/Month/Product/Category/Brand/Branch/Salesperson with revenue forecasting.
- **9.3 CRM & 9.4 Inventory Analytics**:
  - Lead conversion funnel, CLV, CAC, customer segmentation. Stock turn velocity, dead stock, aging reports, warehouse capacity utilization.
- **9.5 Purchase & 9.6 Project Analytics**:
  - Vendor scorecards (delivery SLA, quality, pricing, return rate). Project cost vs budget variance, profitability analysis.
- **9.7 Field Service & 9.8 Finance Analytics**:
  - Ticket SLA compliance, first-visit resolution rate, engineer productivity, travel time vs on-site time. Cash flow trend, GST summary, accounts receivable aging.
- **9.11 KPI Engine & 9.12 Report Builder**:
  - Automated KPI calculation engine. Drag-and-drop custom report builder with grouping, sorting, filtering, and export to Excel/PDF/CSV.
- **9.13 Scheduled Reports & 9.14 Dashboard Builder**:
  - Automated daily/weekly/monthly email report dispatch. Configurable role-based dashboard layout builder with 10 chart types (Funnel, Heatmap, Gauge, Tree Map, KPI cards).
- **9.16 Interactive Drill-Down & 9.19 Business Alerts**:
  - Multi-level drill down (Revenue → Branch → Customer → Invoice → Payment). Automated business alerts (revenue drop, stock threshold, project delay, SLA breach, overdue payment).
- **Database Tables (Phase 9)**:
  - `analytics_snapshots`, `dashboard_widgets`, `dashboard_layouts`, `report_templates`, `report_schedules`, `report_exports`, `kpi_definitions`, `analytics_filters`, `business_alerts`, `business_alert_logs`, `executive_metrics`, `chart_configurations`.

---

### Phase 10 — Communication & Notification Center (100% Detailed Specification)
- **10.1 Communication Dashboard & 10.2 Unified Inbox**:
  - Outbound metrics (Sent, Delivered, Opened, Clicked, Failed, Retry Queue).
  - Unified customer communication timeline aggregating Email, WhatsApp, SMS, Push, In-App, Internal Notes.
- **10.3 Email & 10.4 WhatsApp Integration**:
  - Transactional, marketing, invoice, quote dispatchers. WhatsApp Business WABA 2-way messaging, media, voice notes, location, PDF attachments.
- **10.5 SMS Gateway & 10.6 Push Notifications**:
  - DLT-registered SMS for OTP, reminders, emergencies. Android, iOS & Web Push notification engine.
- **10.7 In-App Notifications & 10.8 Dynamic Templates**:
  - Real-time portal alerts (New Lead, Order, Payment, Low Inventory, Project Delay, SLA breach).
  - Variable template compiler (`{{customer_name}}`, `{{invoice_number}}`, `{{amount}}`, `{{ticket_number}}`).
- **10.9 Campaign Management & 10.10 Announcement Center**:
  - Multi-channel marketing campaigns with audience segmentation (Industry, Branch, AMC Expiry). Customer & Employee announcement boards.
- **10.11 Automated Reminder Engine**:
  - Chronological reminder scheduler (7d, 3d, 1d, Due Date, Overdue) for Invoices, AMC, Warranty, Appointments.
- **10.14 Delivery Tracking & 10.15 Retry Queue**:
  - End-to-end delivery status tracking & exponential backoff retry queue for failed messages.
- **Database Tables (Phase 10)**:
  - `communications`, `communication_channels`, `communication_templates`, `notification_queue`, `notification_history`, `notification_preferences`, `announcements`, `campaigns`, `campaign_recipients`, `campaign_statistics`, `reminders`, `communication_logs`, `failed_messages`, `push_devices`.

---

### Phase 11 — Automation & Workflow Engine (100% Detailed Specification)
- **11.1 Dashboard & 11.2 Visual Builder**:
  - Execution summary (Hours saved, tasks automated, SLA compliance). Drag-and-drop workflow node pipeline (`Trigger` → `Condition` → `Action` → `Delay` → `Approval` → `Loop`).
- **11.3 Trigger Engine & 11.4 Condition Engine**:
  - Event listeners across CRM, Sales, Inventory, Projects, Service, Finance, HR, and System. Boolean condition evaluator (AND, OR, NOT, nested rules).
- **11.5 Action Engine & 11.6 Approval Routing**:
  - Actions: Create Task/Ticket, Update Record, Dispatch Notifications, Generate PDF, Execute Webhook/API. Multi-level approval routing (Amount, Department, Branch).
- **11.7 Task & 11.8 Assignment Engine**:
  - Automatic task creation on project/order creation. Round-robin & skill/proximity assignment.
- **11.9 Cron Scheduler & 11.10 Delay Steps**:
  - Internal scheduler (Minutely, Hourly, Daily, Monthly). Delay & Wait nodes for asynchronous workflow execution.
- **11.11 SLA Automation & 11.13 Escalations**:
  - Automatic response & resolution SLA monitors with multi-tiered management escalation.
- **11.14 Versioning, 11.15 Execution Logs & 11.17 Webhooks**:
  - Workflow version control (Draft, Published, Rollback). Searchable execution audit log. Inbound & outbound webhook listeners with auto-retries.
- **Database Tables (Phase 11)**:
  - `workflows`, `workflow_versions`, `workflow_triggers`, `workflow_conditions`, `workflow_actions`, `workflow_executions`, `workflow_execution_logs`, `workflow_templates`, `scheduler_jobs`, `scheduler_history`, `business_rules`, `approval_rules`, `escalation_rules`, `webhook_subscriptions`, `webhook_delivery_logs`, `automation_metrics`.

---

### Phase 12 — Security, Compliance & Audit (100% Detailed Specification)
- **12.1 Security Dashboard & 12.2 Authentication Security**:
  - Live security indicators (Failed logins, locked accounts, suspicious sessions, API failures, risk metrics). Strong password policy (10+ chars, upper, lower, number, special char).
- **12.3 Multi-Factor Authentication (MFA) & 12.4/12.5 Session/Device Management**:
  - Mandatory MFA for Admins, Finance, Super Admins (TOTP/SMS/Email/Backup codes). Device registration, trusted/blocked device vault, remote force logout.
- **12.6 RBAC & 12.7 Data Encryption**:
  - 6-level privilege hierarchy (Super Admin → Admin → Manager → Staff → Engineer → Customer). TLS in transit, AES-256 at rest for PII, financial ledgers, backups.
- **12.8 API Security & 12.9 File Security**:
  - Rate limiting, IP allowlist, JWT validation. Restricted file extensions (blocking executable `.exe`, `.sh`, `.bat`, `.js`), malware scan hooks.
- **12.10 Immutable Audit Logs & 12.12 Security Alerts**:
  - Write-once read-many (WORM) audit logs capturing delta state, IP, user, browser. Real-time security alert dispatcher (Low, Medium, High, Critical).
- **12.13 Compliance & 12.15/12.16 Backup & Disaster Recovery (DR)**:
  - Legal hold, GDPR/GST compliance consent log, data retention policies. Automated daily incremental & weekly full backups. RPO (≤15m) & RTO (≤4h) tracking.
- **12.18 Sensitive Data Export Controls**:
  - Watermarked PDF/Excel reports, password-protected archives, export approval workflow, immutable export log.
- **Database Tables (Phase 12)**:
  - `user_sessions`, `trusted_devices`, `security_policies`, `security_alerts`, `security_alert_history`, `audit_logs`, `login_history`, `api_keys`, `api_request_logs`, `backup_jobs`, `backup_history`, `restore_history`, `compliance_records`, `data_retention_rules`, `export_logs`, `password_history`, `mfa_settings`.

---

### Phase 13 — Super Admin & System Configuration (100% Detailed Specification)
- **13.1 Super Admin Dashboard & 13.2 Company/Branch Management**:
  - Infrastructure health metrics (CPU, RAM, Disk, DBConnections, Queue size). Multi-tenant company lifecycle (Trial, Active, Suspended, Expired, Archived).
- **13.4 User & 13.6 Subscription/Licensing Control**:
  - User profile management & bulk actions. Tiered subscription engine (Trial, Starter, Professional, Enterprise, Custom) enforcing user, branch, storage, and API limits.
- **13.7 Module & 13.8 Feature Flag Management**:
  - Zero-downtime enable/disable of system modules (CRM, Sales, Inventory, Projects, Service, Portal, Finance, HR, BI, Automation, Communication). Scoped feature flags (Global, Company, Branch, Role).
- **13.9 Global Settings & 13.10 Theme Branding**:
  - Multi-currency, timezone, custom document prefixes (`INV-`, `QTN-`, `ORD-`, `TCK-`, `PRJ-`). Dynamic white-label CSS branding (Logo, Primary/Secondary palette, Favicon).
- **13.12 Background Job & 13.13 Queue Monitor**:
  - Real-time background worker & queue monitoring dashboard with 1-click manual retry capability.
- **13.15 Maintenance Mode & 13.16 Reversible Configuration Audit**:
  - Granular Maintenance Mode (Platform-wide, Company-level, Module-level). Immutable, reversible configuration audit trail with 1-click rollback.
- **Database Tables (Phase 13)**:
  - `companies`, `company_settings`, `branches`, `system_settings`, `feature_flags`, `licenses`, `license_history`, `modules`, `module_status`, `themes`, `master_data`, `maintenance_windows`, `background_jobs`, `job_execution_logs`, `queue_statistics`, `configuration_history`, `system_health_metrics`, `platform_alerts`.

---






### Phase 6 — Integrations
- Module Integration Matrix:
  - **CRM**: WhatsApp, Email, Calendar
  - **Inventory**: Barcode/QR Scanners, Label Printers
  - **Payments**: PayU, Razorpay, UPI QR
  - **Accounting**: Tally Prime, Zoho Books, QuickBooks
  - **Maps**: Google Maps Platform (Distance & Geocoding)
  - **Notifications**: WhatsApp, SMS (DLT), Email
  - **Authentication**: Supabase Auth
  - **File Storage**: Cloudinary / Supabase Storage

---

### Phase 7 — Enterprise Reports
- Automated & On-Demand Report Generators:
  Sales Reports, Quotations Summary, Orders Ledger, Inventory Status, Purchase History, Vendor Performance, Stock Movement, Engineer SLA & Performance, AMC Renewal Forecasts, Warranty Claims Log, Customer Growth, Daily Activity Logs, System Audit Logs, User Login History.

---

### Phase 8 — Security & Governance
- Security Controls:
  Role-Based Access Control (RBAC), Supabase Row-Level Security (RLS) policies, Approval Workflows for high-value operations, Comprehensive Audit Logging, Session Management & Timeout Controls, Two-Factor Authentication (2FA), Data Encryption at Rest & In Transit, Automated Hourly Database Backups, API Rate Limiting, GDPR/GST Data Compliance Controls.

---

### Recommended Implementation Sequence & Scope
1. **CRM Core** (Leads, Customers, Quotations)
2. **Inventory & Warehouse Management**
3. **Sales & Purchase Workflows**
4. **Order-to-Project Automation**
5. **Field Service & Engineer Management**
6. **AMC & Warranty**
7. **Customer Self-Service Portal**
8. **Analytics & Reporting**
9. **Security Hardening & Performance Optimization**
10. **Production Testing & Deployment**

*Estimated Database & System Scope: 40–60 DB Tables, 150–250 APIs, 250–400 UI Components, 100+ Workflow Automations, 40–80 Background Jobs.*





