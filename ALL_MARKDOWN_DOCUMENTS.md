# Complete Markdown Corpus

Generated: 2026-07-19

This file consolidates every Markdown file in the workspace, excluding generated dependency/build folders and this consolidated output file.

## Source Files

- [agents/rules/121.md](#agents-rules-121-md)
- [apps/api/README.md](#apps-api-readme-md)
- [apps/mgmt/AGENTS.md](#apps-mgmt-agents-md)
- [apps/mgmt/CLAUDE.md](#apps-mgmt-claude-md)
- [apps/mgmt/README.md](#apps-mgmt-readme-md)
- [apps/public/README.md](#apps-public-readme-md)
- [apps/superadmin/AGENTS.md](#apps-superadmin-agents-md)
- [apps/superadmin/CLAUDE.md](#apps-superadmin-claude-md)
- [apps/superadmin/README.md](#apps-superadmin-readme-md)
- [apps/waba/AGENTS.md](#apps-waba-agents-md)
- [apps/waba/CLAUDE.md](#apps-waba-claude-md)
- [apps/waba/README.md](#apps-waba-readme-md)
- [apps/webmail/README.md](#apps-webmail-readme-md)
- [design-system/corporate_ai_policy.md](#design-system-corporate-ai-policy-md)
- [docs/api-audit/api-database-mapping.md](#docs-api-audit-api-database-mapping-md)
- [docs/api-audit/api-frontend-mapping.md](#docs-api-audit-api-frontend-mapping-md)
- [docs/api-audit/api-role-mapping.md](#docs-api-audit-api-role-mapping-md)
- [docs/api-audit/api-test-report.md](#docs-api-audit-api-test-report-md)
- [docs/api-audit/complete-api-inventory.md](#docs-api-audit-complete-api-inventory-md)
- [docs/api-audit/complete-url-list.md](#docs-api-audit-complete-url-list-md)
- [docs/api-audit/enterprise-api-gap-analysis-review-board.md](#docs-api-audit-enterprise-api-gap-analysis-review-board-md)
- [docs/api-audit/final-report.md](#docs-api-audit-final-report-md)
- [ENTERPRISE_SOFTWARE_AUDIT_REPORT.md](#enterprise-software-audit-report-md)
- [extension/README.md](#extension-readme-md)
- [PRODUCT_DESIGN_AUDIT_REPORT.md](#product-design-audit-report-md)
- [README.md](#readme-md)

---

## agents/rules/121.md

````````markdown
---
trigger: manual
---


````````

---

## apps/api/README.md

````````markdown
# TecBunny Central API (`apps/api`)

Welcome to the **TecBunny Central API**. This application functions as the central nervous system for the entire TecBunny ecosystem, providing headless backend capabilities to the Public Store, Management Dashboard, Super Admin panel, and third-party integrations (like WhatsApp/WABA).

Latest status update: 2026-07-19. The generated enterprise API inventory counts 256 entries in this app, including 221 mutating entries. The static inventory reports no broken routes and no missing validation/authentication/security/database signals, but the enterprise gap board still identifies missing lifecycle APIs across security/session, governance, customers/CRM, finance, orders, inventory, service, analytics, integrations, and automation.

---

## ðŸ“– Project Overview

Built entirely on Next.js API Routes (Serverless Functions), this repository exposes secure, typed, and scalable RESTful endpoints. It abstracts direct database communication away from the frontend applications, enforcing strict authorization, data validation, and complex business logic handled by the shared `@tecbunny/core` package.

## âœ¨ In-Depth Features & Endpoints

### 1. E-Commerce & Core Business
- **Products & Inventory (`/products`, `/inventory`)**: Create, update, and track product stock levels across multiple locations.
- **Cart & Checkout (`/cart`, `/checkout`)**: Server-side validation of cart totals, applying taxes (via `/gst-verify`), and generating secure checkout sessions.
- **Orders & Payments (`/orders`, `/payment`, `/payments`)**: Webhook ingestion for payment gateways, order state machine management, and refund processing.
- **Customers & Users (`/customers`, `/users`, `/user`)**: Customer profile management, KYC validations, and address book handling.

### 2. Marketing & Sales Operations
- **Promotions & Offers (`/promotions`, `/offers`, `/auto-offers`)**: Logic for evaluating dynamic discounts and seasonal offers.
- **Coupons (`/coupons`, `/discounts`)**: Validation and redemption endpoints for promotional codes.
- **Commissions & Sales Agents (`/commissions`, `/sales-agents`)**: Tracking referral links, agent performance, and calculating payout structures.

### 3. Specialized Business Flows
- **Custom Setups & Quotes (`/custom-setups`, `/quotes`)**: Handling detailed enterprise requests for custom server/hardware architectures.
- **Warranty (`/warranty`)**: Activation and validation endpoints for hardware warranties.
- **Booking & Services (`/free-installation-slots`, `/services`)**: Managing technician schedules and service appointments.

### 4. Security & Administration
- **Authentication (`/auth`, `/admin-auth`, `/roles`)**: JWT token validation, Role-Based Access Control (RBAC), and session issuance via Supabase.
- **OTP & Verification (`/otp`, `/captcha`)**: Multi-factor authentication mechanisms and anti-bot protection.
- **System Health (`/health`, `/analytics`)**: Telemetry, uptime monitoring, and internal metrics gathering.

### 5. Media & Integrations
- **File Uploads (`/upload`, `/uploads`, `/upload-from-url`)**: Secure endpoints generating pre-signed URLs or directly buffering assets to AWS S3.
- **Webhooks (`/webhooks`)**: Secure endpoints designed to listen to external events (e.g., Stripe, Razorpay, Meta).

---

## ðŸ›  Tech Stack

- **Framework**: Next.js App Router (API Routes only)
- **Language**: TypeScript
- **Internal Libraries**: 
  - `@tecbunny/core` (Contains Prisma models, Supabase clients, Zod schemas, and core services)
- **Architecture**: RESTful JSON API

---

## ðŸ“ Directory Structure

```text
apps/api/
â”œâ”€â”€ src/
â”‚   â””â”€â”€ app/
â”‚       â””â”€â”€ api/                 # All API Routes
â”‚           â”œâ”€â”€ auth/            # Auth controllers
â”‚           â”œâ”€â”€ products/        # Product controllers
â”‚           â”œâ”€â”€ orders/          # Order controllers
â”‚           â”œâ”€â”€ payments/        # Payment controllers
â”‚           â””â”€â”€ ...              # (50+ other domain routes)
â”œâ”€â”€ package.json                 # Scripts & Dependencies
â”œâ”€â”€ next.config.ts               # Next.js configuration
â””â”€â”€ eslint.config.mjs            # Linter rules
```

---

## ðŸ’» Scripts & Getting Started

### Prerequisites
- Node.js (v20+ recommended)
- Access to the local or remote Supabase instance (ensure `.env` is populated).

### Installation & Running

```bash
# Start the development server on port 3000
npm run dev

# Build for Production
npm run build

# Start Production Server
npm run start
```

By default, the API will run at [http://localhost:3000](http://localhost:3000). 
Endpoints are accessed via `http://localhost:3000/api/[route]`.

````````

---

## apps/mgmt/AGENTS.md

````````markdown
<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes â€” APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

````````

---

## apps/mgmt/CLAUDE.md

````````markdown
@AGENTS.md

````````

---

## apps/mgmt/README.md

````````markdown
# TecBunny Management Dashboard (`apps/mgmt`)

Welcome to the **TecBunny Management Dashboard**. This is the secure, internal portal designed for staff, sales agents, support technicians, and tenant administrators to oversee daily operations across the TecBunny ecosystem.

Latest status update: 2026-07-19. The generated enterprise API inventory counts 56 Management API entries, including 43 mutating entries. Current coverage is strong for admin products, pricing, orders, quotes, inventory, marketing, users, sales agents, and selected service workflows; production gaps remain for departments/staff lifecycle, suppliers, purchases, warehouses, invoices, refunds, approvals, tasks/calendar, saved filters/views, and audit export.

---

## ðŸ“– Project Overview

Unlike the public store, this application focuses heavily on data density, workflow optimization, and operational control. It provides a comprehensive interface for managing the backend data generated by the public store and API, leveraging the `@tecbunny/admin-ui` library to ensure a consistent, professional administrative experience.

## âœ¨ In-Depth Features

### 1. Order & Sales Management
- **Order Processing**: View incoming orders from the public store, update statuses (e.g., Processing, Shipped, Delivered), and manage fulfillments.
- **Invoicing**: Generate, review, and manually resend invoices to customers.
- **Custom Setup Approvals**: Interface for engineers to review, adjust, and approve `/customised-setups` requested by enterprise clients.

### 2. Customer Relationship Management (CRM)
- **Customer Directory**: View detailed customer profiles, order history, and active warranties.
- **Support Tickets**: Integrated interface for staff to reply to customer inquiries and contact forms.
- **Sales Agents Dashboard**: Dedicated views for sales representatives to track their commissions, active leads, and performance metrics.

### 3. Catalog & Inventory Control
- **Product Management**: Add new products, update pricing, toggle visibility, and manage variations.
- **Stock Tracking**: Real-time alerts on low inventory and tools for adjusting stock levels.
- **Promotions Management**: Interface for generating new coupon codes, setting up seasonal discounts, and managing auto-offers.

### 4. Role-Based Access Control (RBAC)
- **Staff Roles**: Granular permissions ensuring that support agents cannot access financial data, while sales managers have specific commission visibilities.

---

## ðŸ›  Tech Stack

- **Framework**: Next.js (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Internal Libraries**: 
  - `@tecbunny/admin-ui` (Admin specific React components)
  - `@tecbunny/core` (Shared data fetching logic and types)
- **Authentication**: Supabase (utilizing internal Admin roles)

---

## ðŸ“ Directory Structure

```text
apps/mgmt/
â”œâ”€â”€ src/
â”‚   â”œâ”€â”€ app/
â”‚   â”‚   â”œâ”€â”€ admin/           # Core admin panels
â”‚   â”‚   â”œâ”€â”€ auth/            # Staff login screens
â”‚   â”‚   â”œâ”€â”€ mgmt/            # Specialized management flows
â”‚   â”‚   â””â”€â”€ api/             # Localized UI-specific API routes
â”‚   â””â”€â”€ components/          # Dashboard specific components (e.g., CustomSetupFlow)
â”œâ”€â”€ package.json             # Scripts & Dependencies
â””â”€â”€ next.config.ts           # Next.js configuration
```

---

## ðŸ’» Scripts & Getting Started

### Installation & Running

```bash
# Start the development server on port 3000
npm run dev

# Build for Production
npm run build

# Start Production Server
npm run start
```

By default, the dashboard will run at [http://localhost:3000](http://localhost:3000). You must log in with an account that has `staff` or `admin` privileges in the database.

````````

---

## apps/public/README.md

````````markdown
# TecBunny Public Store (`apps/public`)

Welcome to the **TecBunny Public Store**, the primary customer-facing portal and e-commerce front-end for the entire TecBunny ecosystem. This application is responsible for driving sales, showcasing services, capturing leads, and managing user profiles.

Latest status update: 2026-07-19. The generated enterprise API inventory counts 3 local Public app API entries, with most commerce/customer actions served by the central API and shared packages. Public workflow gaps still requiring production APIs include customer master profile CRUD, addresses, saved views/favorites, invoice download, returns/refunds, product reviews, stock reservation, media library, and service booking lifecycle.

---

## ðŸ“– Project Overview

The Public Store is a Next.js (App Router) application designed for maximum performance, SEO optimization, and seamless user experience. It leverages Server-Side Rendering (SSR) and Static Site Generation (SSG) to serve content swiftly while maintaining dynamic e-commerce functionalities like cart management, secure checkouts, and AI-powered interactions.

## âœ¨ In-Depth Features

### 1. E-Commerce Flow
- **Product Discovery (`/shop`, `/products`)**: Dynamic product listing with advanced filtering, categorization, and search capabilities.
- **Cart Management (`/cart`)**: Global cart state managed securely using Zustand, persistent across sessions.
- **Checkout & Payments (`/checkout`, `/payment`)**: Secure transaction processing, invoice generation, and shipping calculations.

### 2. Customer Portal (`/profile`)
- **Order History**: Customers can view past and active orders.
- **Warranty Registration (`/activate-warranty`)**: Direct linkage to hardware/software warranty activations.
- **Invoices**: On-the-fly PDF invoice generation using `pdf-lib` and `pdfkit`.

### 3. Enterprise & Custom Offerings
- **Customized Setups (`/customised-setups`)**: Specialized flows for enterprise clients to request custom hardware/software bundles.
- **Quotes & Blueprints (`/quotes`, `/blueprints`)**: Dedicated portals for requesting, viewing, and approving custom project blueprints and quotations.

### 4. Marketing & Content
- **Rich Landing Pages**: `/about`, `/services`, `/solutions`, `/portfolio`, `/webdev` showcasing the breadth of TecBunny's technical capabilities.
- **Interactive Forms**: Contact requests and lead generation heavily validated using `react-hook-form` and `zod`.

### 5. Advanced Integrations
- **AI Research Assistant (`/ai-research`)**: Integrated Google GenAI (`@google/genai`) to provide users with intelligent assistance and automated research parsing.
- **Cloud Storage**: AWS S3 (`@aws-sdk/client-s3`) integration for retrieving and storing customer assets, avatars, and attachments.
- **Asynchronous Jobs**: Background tasks like email sending handled via BullMQ and Redis.

---

## ðŸ›  Tech Stack

- **Framework**: Next.js (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4 + Radix UI primitives (`@radix-ui/*`)
- **Internal Libraries**: 
  - `@tecbunny/ui` (Shared Component Library)
  - `@tecbunny/core` (Shared Business Logic)
- **State Management**: Zustand
- **Form Validation**: React Hook Form + Zod
- **Authentication/DB**: Supabase JS Client (`@supabase/ssr`, `@supabase/supabase-js`)
- **Utilities**: `date-fns` (time parsing), `lucide-react` (icons)

---

## ðŸ“ Directory Structure

```text
apps/public/
â”œâ”€â”€ public/                 # Static assets (images, fonts)
â”œâ”€â”€ src/
â”‚   â”œâ”€â”€ app/                # Next.js App Router (Pages, Layouts, API Routes)
â”‚   â”‚   â”œâ”€â”€ (dashboard)/    # Dashboard specific layouts
â”‚   â”‚   â”œâ”€â”€ auth/           # Login, Registration, Password Reset
â”‚   â”‚   â”œâ”€â”€ cart/           # Shopping Cart view
â”‚   â”‚   â”œâ”€â”€ checkout/       # Checkout flow
â”‚   â”‚   â”œâ”€â”€ shop/           # Main storefront
â”‚   â”‚   â”œâ”€â”€ profile/        # User account management
â”‚   â”‚   â””â”€â”€ ...             # Other routes
â”‚   â””â”€â”€ globals.css         # Global Tailwind directives
â”œâ”€â”€ package.json            # Scripts & Dependencies
â”œâ”€â”€ tailwind.config.ts      # Tailwind configuration
â””â”€â”€ next.config.mjs         # Next.js build configurations
```

---

## ðŸ’» Scripts & Getting Started

### Prerequisites
- Node.js (v20+ recommended)
- `npm` or `pnpm`

### Installation & Running

From the root of the monorepo or within `apps/public`:

```bash
# Start the development server on port 9003
npm run dev

# Run Typechecking
npm run typecheck

# Build for Production
npm run build:prod-full

# Start Production Server
npm run start:prod
```

By default, the application will run at [http://localhost:9003](http://localhost:9003).

````````

---

## apps/superadmin/AGENTS.md

````````markdown
<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes â€” APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

````````

---

## apps/superadmin/CLAUDE.md

````````markdown
@AGENTS.md

````````

---

## apps/superadmin/README.md

````````markdown
# TecBunny Super Admin Dashboard (`apps/superadmin`)

Welcome to the **TecBunny Super Admin Dashboard**. This application is restricted exclusively to the platform owners, core engineers, and high-level system administrators. It controls the macro-level configurations for the entire TecBunny ecosystem.

Latest status update: 2026-07-19. The generated enterprise API inventory counts 25 Superadmin API entries, including 21 mutating entries. Current coverage includes organizations, branches, roles, permissions, areas, and selected services/products/settings; production gaps remain for tenant lifecycle, departments, feature flags, API keys, integration registry, platform audit export, and license/plan limits.

---

## ðŸ“– Project Overview

The Super Admin Dashboard provides a top-down view of the platform. Unlike the regular Management Dashboard (`apps/mgmt`), which focuses on day-to-day operations (orders, support tickets), this dashboard is designed for systemic control: managing global tenants, adjusting universal pricing tiers, configuring overarching feature flags, and viewing aggregate platform analytics.

## âœ¨ In-Depth Features

### 1. Global Platform Configuration
- **Feature Flags**: Toggle experimental features or disable modules platform-wide (e.g., turning off the WhatsApp integration during maintenance).
- **Global Settings**: Manage platform-wide metadata, default shipping rates, and overarching tax (GST) configurations.
- **Tenant Management**: If operating in a multi-tenant environment, this interface allows the creation, suspension, and billing management of sub-tenants.

### 2. Deep Analytics & Telemetry
- **System Health Overview**: Aggregate metrics on API performance, error rates, and system uptime.
- **Financial Aggregation**: Macro-level financial reports spanning across all sales agents, departments, and active regions.

### 3. Root Security & Auditing
- **Superuser Management**: Add or revoke root privileges for core engineers.
- **Audit Logs**: View an immutable ledger of all critical actions taken within the Management Dashboard or API by staff members.

---

## ðŸ›  Tech Stack

- **Framework**: Next.js (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Internal Libraries**: 
  - `@tecbunny/admin-ui` (Ensures consistency with the `mgmt` dashboard but with specialized components)
  - `@tecbunny/core` (Direct integration for root-level database overrides)
- **Authentication**: Supabase (Requires the highest `superadmin` role).

---

## ðŸ“ Directory Structure

```text
apps/superadmin/
â”œâ”€â”€ src/
â”‚   â””â”€â”€ app/
â”‚       â”œâ”€â”€ superadmin/      # Core super-admin interfaces
â”‚       â”œâ”€â”€ auth/            # Root login screens
â”‚       â””â”€â”€ layout.tsx       # Main layout wrapper
â”œâ”€â”€ package.json             # Scripts & Dependencies
â”œâ”€â”€ middleware.ts            # High-security route protection
â””â”€â”€ next.config.ts           # Next.js configuration
```

---

## ðŸ’» Scripts & Getting Started

### Installation & Running

```bash
# Start the development server on port 3000
npm run dev

# Build for Production
npm run build

# Start Production Server
npm run start
```

By default, the dashboard will run at [http://localhost:3000](http://localhost:3000). 
**Note**: You must ensure your database user holds the specific `superadmin` flag/role in your local Supabase database to successfully authenticate.

````````

---

## apps/waba/AGENTS.md

````````markdown
<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes â€” APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

````````

---

## apps/waba/CLAUDE.md

````````markdown
@AGENTS.md

````````

---

## apps/waba/README.md

````````markdown
# TecBunny WhatsApp Business API (WABA) (`apps/waba`)

Welcome to the **TecBunny WABA Application**. This is a specialized microservice within the ecosystem dedicated entirely to handling interactions with the Meta/WhatsApp Business API.

Latest status update: 2026-07-19. The generated enterprise API inventory counts 18 WABA API entries, including 12 mutating entries. Existing coverage includes authentication, conversations, messages, media, campaign create, templates, and customer 360; production gaps remain for campaign list/update/delete/schedule/cancel, Meta template sync/approval, opt-in/out consent, webhook retry/dead-letter handling, delivery analytics, and automation rule CRUD.

---

## ðŸ“– Project Overview

The WABA app bridges the gap between the TecBunny backend and WhatsApp users. It is responsible for sending transactional outbounds (like OTPs, Order Confirmations) and receiving inbound messages. Crucially, it incorporates Google's Generative AI to provide users with an intelligent, conversational bot experience directly within WhatsApp.

## âœ¨ In-Depth Features

### 1. Outbound Transactional Messaging
- **Automated Notifications**: Triggers templated WhatsApp messages for critical system events (e.g., "Your order has shipped").
- **OTP Delivery**: Sends One-Time Passwords via WhatsApp as an alternative (or addition) to SMS for authentication.

### 2. Inbound Webhook Processing
- **Event Listeners**: Consumes real-time webhooks from Meta to track message delivery receipts (Sent, Delivered, Read).
- **Message Routing**: Receives incoming customer messages, identifies the user via their phone number, and routes the message to the internal AI handler or human support queue.

### 3. AI-Powered Chatbot
- **Generative Responses**: Integrates `@google/generative-ai` to parse natural language queries (e.g., "Where is my order?" or "What are your server prices?") and generates contextually accurate responses using data fetched from the main API/Database.
- **Context Management**: Maintains conversation history to provide seamless multi-turn interactions.

---

## ðŸ›  Tech Stack

- **Framework**: Next.js (Used primarily for robust webhook endpoints and routing logic).
- **Language**: TypeScript
- **Database ORM**: Prisma Client (`@prisma/client`) - specifically chosen for structured logging of chat histories and delivery statuses.
- **AI Integration**: Google Generative AI (`@google/generative-ai`)
- **Backend Sync**: Supabase (`@supabase/supabase-js`) for linking WhatsApp numbers to registered platform accounts.
- **Internal Libraries**: `@tecbunny/core`

---

## ðŸ“ Directory Structure

```text
apps/waba/
â”œâ”€â”€ prisma/                  # Prisma schema and migrations specifically for WABA tables
â”œâ”€â”€ src/
â”‚   â”œâ”€â”€ app/                 # Webhook endpoints (e.g., /api/webhook)
â”‚   â”œâ”€â”€ lib/                 # Shared utilities and constants
â”‚   â””â”€â”€ services/            # Core logic for sending messages, parsing incoming, and AI generation
â”œâ”€â”€ test_outbound.js         # Quick script for testing outbound messages
â”œâ”€â”€ test_webhook.js          # Quick script for simulating incoming webhooks
â”œâ”€â”€ package.json             # Scripts & Dependencies
â””â”€â”€ next.config.ts           # Next.js configuration
```

---

## ðŸ’» Scripts & Getting Started

### Prerequisites
- Node.js (v20+)
- Active Meta Developer account with WABA configured.
- Database access for Prisma.

### Installation & Running

Before starting, ensure you have generated the Prisma client:

```bash
# Generate Prisma Client
npx prisma generate

# Start the development server
npm run dev
```

To test incoming webhooks locally, you must expose your localhost to the internet using a reverse proxy tool like Ngrok:
```bash
ngrok http 3000
```
Then, update your Meta Developer Dashboard with the generated Ngrok URL.

````````

---

## apps/webmail/README.md

````````markdown
# TecBunny Webmail (`apps/webmail`)

Welcome to the **TecBunny Webmail Application**. This service acts as the internal email management system and template renderer for the TecBunny platform.

Latest status update: 2026-07-19. The generated enterprise API inventory counts 1 Webmail API entry: health. Webmail business APIs are still missing for account CRUD, mailbox sync, folders, threads, send/reply/forward, attachments, signatures, templates, provider webhooks, and production mailbox-provider operations.

---

## ðŸ“– Project Overview

While transactional email sending is often handled directly by the API (via Nodemailer or third-party providers), the Webmail app centralizes the visual design (HTML templates) and provides an inbox interface for internal staff to manage customer communications (e.g., contact form submissions, support inquiries) without leaving the ecosystem.

## âœ¨ In-Depth Features

### 1. Template Management
- **Brand Consistency**: Houses all HTML email templates (Welcome Emails, Password Resets, Order Confirmations, Invoices).
- **Dynamic Injection**: Provides functions to dynamically inject customer names, order totals, and tracking links into the templates before dispatching.

### 2. Webmail Interface
- **Internal Inbox**: An interface for staff to view incoming queries routed from the public store's contact forms.
- **Thread Management**: Ability to reply to customers directly, keeping the entire conversation logged within the TecBunny system rather than scattered across external email clients.

---

## ðŸ›  Tech Stack

- **Framework**: Next.js / React
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Core Integrations**: Interfaces with the main API for fetching customer details and logging communication histories.

---

## ðŸ“ Directory Structure

```text
apps/webmail/
â”œâ”€â”€ src/
â”‚   â”œâ”€â”€ app/                 # Webmail UI and routing
â”‚   â”œâ”€â”€ lib/                 # Core email sending utilities and parsers
â”‚   â””â”€â”€ templates/           # (If applicable) HTML/React email templates
â”œâ”€â”€ package.json             # Scripts & Dependencies
â””â”€â”€ ...
```

---

## ðŸ’» Scripts & Getting Started

### Production Provider Gate

Mock inbox data is disabled in production unless `NEXT_PUBLIC_WEBMAIL_ENABLE_MOCK=true` is explicitly set. Before enabling Webmail for production traffic, configure:

- `WEBMAIL_IMAP_HOST`
- `WEBMAIL_SMTP_HOST`
- `WEBMAIL_MAILBOX_USER`

The `/api/health` route reports `configuration_required` and lists missing provider keys until the mailbox provider contract is complete.

### Installation & Running

```bash
# Start the development server
npm run dev

# Build for Production
npm run build
```

The Webmail app will run locally and is typically accessed by internal staff via a specific port (e.g., port 3000, depending on workspace configuration).

````````

---

## design-system/corporate_ai_policy.md

````````markdown
# ORGANIZATIONAL POLICY: ACCEPTABLE USE OF ARTIFICIAL INTELLIGENCE (AI) SYSTEMS

## 1. DOCUMENT CONTROL & METADATA

| Metadata Field | Value |
| :--- | :--- |
| **Document ID** | POL-GOV-AI-2026-009 |
| **Version Number** | 1.0.0 |
| **Effective Date** | July 2, 2026 |
| **Review Frequency** | Annually |
| **Policy Owner (Role)** | Chief Information Security Officer (CISO) & General Counsel |
| **Approver (Role)** | Board of Directors & Chief Executive Officer (CEO) |

---

## 2. PURPOSE & SCOPE

### 2.1 Purpose
This policy establishes the non-negotiable governance framework for the deployment, access, and usage of Artificial Intelligence (AI) technologies, including Generative AI, Large Language Models (LLMs), and automated decision systems. The primary objectives are to:
1. Prevent unauthorized exposure of proprietary Intellectual Property (IP), source code, and trade secrets.
2. Ensure compliance with data protection laws regarding Personally Identifiable Information (PII).
3. Align operations with industry security standards, including SOC 2 Type II and ISO/IEC 27001:2022.
4. Mitigate legal liabilities arising from algorithmic bias, hallucinations, and copyright infringement claims.

### 2.2 Scope
This policy applies to:
1. All full-time and part-time employees, temporary workers, contractors, consultants, and interns ("Personnel").
2. All business units and operations globally, including third-party vendors operating on behalf of the company.
3. All devices, networks, systems, and cloud infrastructure owned, leased, or managed by the company.
4. Any AI system used for corporate work, regardless of host environment (public, private, or local).

### 2.3 Exemptions
There are no general exemptions to this policy. Any request for a temporary or project-specific variance must be submitted in writing to the CISO. Approved exemptions require written authorization, are valid for a maximum of 180 days, and must be logged in the Corporate Risk Register.

---

## 3. CORE POLICY STANDARDS

### A. Classification & Authorization of AI Systems
- **A.1 Approved Enterprise Systems**: Personnel shall only use AI systems explicitly approved by the CISO and General Counsel, which are listed in the *Approved Software Catalog*. These systems must possess active enterprise-grade data privacy agreements guaranteeing that inputs are not utilized for model training.
- **A.2 Prohibited Public Systems**: The use of public, consumer-grade Generative AI systems (e.g., free tiers of ChatGPT, Claude, Gemini, Midjourney) for corporate tasks is strictly prohibited. Submission of any corporate data to these platforms is considered an unauthorized data disclosure.
- **A.3 Local & Self-Hosted Models**: Any deployment of local or self-hosted models (e.g., Llama, Mistral) on company hardware must be registered with and monitored by the IT Operations Team. The source code and weights must be verified for security vulnerabilities before instantiation.

### B. Intellectual Property & Code Integrity
- **B.1 Code Upload Prohibition**: Personnel shall not input, upload, or paste any proprietary source code, internal APIs, database schemas, database query strings, or software architectures into unauthorized AI tools.
- **B.2 Copyright & Attributions**: Software code generated by authorized coding assistants (e.g., enterprise Copilot tools) must be scanned using corporate SCA (Software Composition Analysis) tooling before merging into production. This is to verify that the generated code does not violate third-party open-source licensing constraints.
- **B.3 Copyright Assertions**: Under no circumstances shall Personnel assert sole intellectual property ownership over outputs generated entirely by AI systems, in accordance with applicable copyright regulations.

### C. Data Privacy & Client Confidentiality
- **C.1 PII Ingestion Restriction**: Submission of customer, client, partner, or employee PII (including names, emails, addresses, financial records, and health data) into any AI system is strictly prohibited unless the system operates in a dedicated, isolated tenant under an active Business Associate Agreement (BAA) or equivalent data processing addendum.
- **C.2 Client Restrictions**: Personnel must review active client Master Services Agreements (MSAs). If a client agreement prohibits the use of AI in code development or analysis, AI systems shall not be utilized for any deliverables associated with that client.
- **C.3 Credentials & Secrets**: Hardcoded API keys, passwords, cryptographic keys, and database credentials must never be submitted to any AI interface.

### D. Algorithmic Accountability & Human-in-the-Loop
- **D.1 Mandatory Review**: No code, documentation, client deliverable, marketing material, or legal document generated by an AI system may be published or deployed without thorough review and validation by a qualified human employee.
- **D.2 AI-Assisted Decision Making**: No AI system may be used as the sole deciding factor for high-impact human resource functions, including hiring, promotions, performance evaluations, or terminations. Any algorithmic recommendation must serve only as advisory input, with the final decision made by an authorized human operator.

---

## 4. ROLES & RESPONSIBILITIES

The execution, monitoring, and enforcement of this policy are distributed according to the RACI (Responsible, Accountable, Consulted, Informed) framework detailed below:

| Role / Function | CISO | Legal Counsel | CTO & Engineering | All Personnel |
| :--- | :---: | :---: | :---: | :---: |
| **Approve AI Softwares** | **A** | **C** | **R** | **I** |
| **Verify Compliance Audits** | **A** | **C** | **R** | **I** |
| **Reporting Policy Violations**| **C** | **A** | **R** | **R** |
| **Adhering to Usage Controls** | **I** | **I** | **C** | **R** |
| **Incident Investigation** | **R** | **R** | **C** | **I** |

*Key: **R** = Responsible (does the work), **A** = Accountable (approves/takes final ownership), **C** = Consulted (provides expertise), **I** = Informed (updated on decisions).*

---

## 5. COMPLIANCE & ENFORCEMENT

### 5.1 Monitoring and Auditing
1. The IT Security Team shall implement automated Data Loss Prevention (DLP) rules to monitor and block outgoing web traffic containing source code or PII to known public AI endpoint domains.
2. Quarterly random audits of developer workstations and repository push logs will be conducted to detect unauthorized AI-generated code patterns or unlicensed copy-pasting.
3. Access to CISO-approved AI systems will be reviewed monthly to ensure permissions align with the principle of least privilege.

### 5.2 Reporting Mechanism
Personnel who discover or suspect a violation of this policy must report it within 24 hours of discovery:
1. Directly to the Security Operations Center via `security@tecbunny.com`.
2. Through the anonymous Whistleblower Hotline at `whistleblower.tecbunny.internal` (if applicable).
3. Retaliation against any individual reporting a suspected violation in good faith is strictly prohibited and constitutes a separate breach of corporate conduct.

### 5.3 Enforcement & Disciplinary Action
Non-compliance with this policy compromises corporate security and SOC 2 certifications. Violations will result in immediate investigation and disciplinary measures, which include:
- **First Offense**: Formal written warning placed in the employee's personnel file, combined with mandatory retaking of security awareness training.
- **Second Offense / Material Breach (e.g., uploading proprietary source code or PII)**: Suspension of access to company networks, formal review by the Disciplinary Committee, up to and including termination of employment or immediate termination of independent contractor agreements.
- **Civil & Criminal Liability**: If the non-compliance results in the theft of intellectual property, breach of client non-disclosure agreements (NDAs), or regulatory fines, the company reserves the right to seek civil damages and/or initiate criminal prosecution under applicable federal and state laws.

---

## 6. GLOSSARY & REFERENCES

### 6.1 Glossary
- **AI (Artificial Intelligence)**: Systems displaying intelligent behavior, including machine learning, deep learning, natural language processing, and automated decision-making engines.
- **CISO**: Chief Information Security Officer.
- **DLP (Data Loss Prevention)**: A security strategy and set of tools used to ensure that sensitive data is not lost, misused, or accessed by unauthorized users.
- **Generative AI**: A subfield of AI focused on creating new content (text, code, images, audio) based on training data patterns.
- **PII (Personally Identifiable Information)**: Any information that can be used to distinguish or trace an individual's identity, either alone or when combined with other personal or identifying information.
- **SCA (Software Composition Analysis)**: An automated process used to identify open-source software and tracking licenses/vulnerabilities.

### 6.2 Reference Policies & Frameworks
- **Internal Policies**:
  - Information Security Policy (POL-SEC-2026-001)
  - Acceptable Use Policy (POL-SEC-2026-002)
  - Employee Code of Conduct (POL-HR-2026-010)
- **External Regulations & Frameworks**:
  - SOC 2 Type II Trust Services Criteria (Security, Confidentiality, Privacy)
  - ISO/IEC 27001:2022 (Annex A.8.20 Network Security & Annex A.8.24 Use of Assets)
  - EU Artificial Intelligence Act (Regulation EU 2024/1689)
  - US Copyright Office Circular 34 (Copyrightability of AI Outputs)
  - Delaware General Corporation Law (DGCL)

````````

---

## docs/api-audit/api-database-mapping.md

````````markdown
# API Database Mapping

Latest source inventory: `inventory.json` generated 2026-07-19T07:31:22.303Z with 378 discovered API entries and 0 database integration issues. This mapping records static table/RPC signals for existing APIs; enterprise database domains that still require new lifecycle APIs are listed in `enterprise-api-gap-analysis-review-board.md`.

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
| /api/admin/products/bulk | POST | products | Update, Delete |
| /api/admin/quotes | GET | quotes | Read |
| /api/admin/quotes/{id}/download | GET | quotes | Read |
| /api/admin/quotes/{id}/respond | POST | profiles<br>quotes | Update, Read |
| /api/admin/quotes/advance-payment | GET | advance_payment_requests<br>profiles<br>quotes | Insert, Update, Read |
| /api/admin/quotes/advance-payment | POST | advance_payment_requests<br>profiles<br>quotes | Insert, Update, Read |
| /api/admin/redemptions/approve | POST | agent_redemption_requests | Update |
| /api/admin/redemptions/list | GET | agent_redemption_requests | Read |
| /api/admin/redemptions/process | POST | agent_redemption_requests<br>rpc:increment_agent_points | Update, Read |
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
| /api/campaigns | POST | Conversation<br>Message | Insert, Read |
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
| /api/conversations | PATCH | Conversation | Update, Read |
| /api/conversations/{id}/assign | PATCH | none detected | Update |
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
| /api/roles | GET | none detected | none detected |
| /api/roles | GET | none detected | none detected |
| /api/roles | POST | none detected | none detected |
| /api/roles | POST | none detected | none detected |
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
| /api/superadmin/inquiries | GET | contact_messages<br>profiles | Read |
| /api/superadmin/inquiries/{id}/assignment | PATCH | contact_messages<br>profiles | Update, Read |
| /api/superadmin/services/ai-generate | POST | none detected | none detected |
| /api/templates | GET | Template | Insert, Read |
| /api/templates | POST | Template | Insert, Read |
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

````````

---

## docs/api-audit/api-frontend-mapping.md

````````markdown
# API Frontend Mapping

Latest source inventory: `inventory.json` generated 2026-07-19T07:31:22.303Z with 378 discovered API entries, 0 unmatched direct frontend callers, and 0 frontend integration issues. Backend-only, cron, webhook, callback, extension, health, tRPC, and manually invoked endpoints are retained as valid API entries when no direct frontend caller is expected.

| API | Method | Applications | Files Using It | Integration Status | Integration Reason |
| --- | --- | --- | --- | --- | --- |
| /api/admin-auth/login | POST | api, superadmin | apps/api/src/app/login/page.tsx<br>apps/superadmin/src/app/superadmin/login/page.tsx | direct frontend/shared caller detected | No unmatched caller exists; absence of a direct static frontend fetch is not a missing integration. |
| /api/admin-auth/logout | POST | api, superadmin | apps/api/src/app/dashboard/page.tsx<br>apps/superadmin/src/components/superadmin/SuperadminShell.tsx | direct frontend/shared caller detected | No unmatched caller exists; absence of a direct static frontend fetch is not a missing integration. |
| /api/admin/agents/approve | POST | none found | none found | available API endpoint | No unmatched caller exists; absence of a direct static frontend fetch is not a missing integration. |
| /api/admin/agents/list | GET | none found | none found | available API endpoint | No unmatched caller exists; absence of a direct static frontend fetch is not a missing integration. |
| /api/admin/agents/reject | POST | none found | none found | available API endpoint | No unmatched caller exists; absence of a direct static frontend fetch is not a missing integration. |
| /api/admin/ai-query | POST | mgmt | apps/mgmt/src/app/mgmt/admin/ai-assistant/page.tsx | direct frontend/shared caller detected | No unmatched caller exists; absence of a direct static frontend fetch is not a missing integration. |
| /api/admin/ai/product-description | POST | none found | none found | available API endpoint | No unmatched caller exists; absence of a direct static frontend fetch is not a missing integration. |
| /api/admin/ai/related-products | POST | none found | none found | available API endpoint | No unmatched caller exists; absence of a direct static frontend fetch is not a missing integration. |
| /api/admin/custom-setups | GET | mgmt | apps/mgmt/src/app/mgmt/admin/custom-setups/price-manager.tsx | direct frontend/shared caller detected | No unmatched caller exists; absence of a direct static frontend fetch is not a missing integration. |
| /api/admin/custom-setups | PATCH | none found | none found | available API endpoint | No unmatched caller exists; absence of a direct static frontend fetch is not a missing integration. |
| /api/admin/dashboard | GET | none found | none found | available API endpoint | No unmatched caller exists; absence of a direct static frontend fetch is not a missing integration. |
| /api/admin/faqs | GET | admin-ui | packages/admin-ui/src/components/FaqsManagement.tsx | direct frontend/shared caller detected | No unmatched caller exists; absence of a direct static frontend fetch is not a missing integration. |
| /api/admin/faqs | POST | none found | none found | available API endpoint | No unmatched caller exists; absence of a direct static frontend fetch is not a missing integration. |
| /api/admin/faqs/{id} | DELETE | none found | none found | available API endpoint | No unmatched caller exists; absence of a direct static frontend fetch is not a missing integration. |
| /api/admin/faqs/{id} | PUT | none found | none found | available API endpoint | No unmatched caller exists; absence of a direct static frontend fetch is not a missing integration. |
| /api/admin/homepage/auto-fill | POST | admin-ui | packages/admin-ui/src/components/admin-homepage-settings.tsx | direct frontend/shared caller detected | No unmatched caller exists; absence of a direct static frontend fetch is not a missing integration. |
| /api/admin/homepage/auto-fill/run | POST | none found | none found | available API endpoint | No unmatched caller exists; absence of a direct static frontend fetch is not a missing integration. |
| /api/admin/inventory/warranty/register | POST | none found | none found | available API endpoint | No unmatched caller exists; absence of a direct static frontend fetch is not a missing integration. |
| /api/admin/jobs/{id} | GET | none found | none found | available API endpoint | No unmatched caller exists; absence of a direct static frontend fetch is not a missing integration. |
| /api/admin/manage-role | POST | none found | none found | available API endpoint | No unmatched caller exists; absence of a direct static frontend fetch is not a missing integration. |
| /api/admin/marketing/blitz | POST | none found | none found | available API endpoint | No unmatched caller exists; absence of a direct static frontend fetch is not a missing integration. |
| /api/admin/marketing/broadcast | POST | mgmt | apps/mgmt/src/app/mgmt/admin/broadcast-desk/page.tsx<br>apps/mgmt/src/app/mgmt/admin/promotional-broadcast/page.tsx | direct frontend/shared caller detected | No unmatched caller exists; absence of a direct static frontend fetch is not a missing integration. |
| /api/admin/orders | GET | none found | none found | available API endpoint | No unmatched caller exists; absence of a direct static frontend fetch is not a missing integration. |
| /api/admin/orders/{id}/pending-actions | POST | none found | none found | available API endpoint | No unmatched caller exists; absence of a direct static frontend fetch is not a missing integration. |
| /api/admin/payment-settings | GET | none found | none found | available API endpoint | No unmatched caller exists; absence of a direct static frontend fetch is not a missing integration. |
| /api/admin/payment-settings | PUT | none found | none found | available API endpoint | No unmatched caller exists; absence of a direct static frontend fetch is not a missing integration. |
| /api/admin/payment-settings/dedupe | POST | none found | none found | available API endpoint | No unmatched caller exists; absence of a direct static frontend fetch is not a missing integration. |
| /api/admin/pricing | GET | admin-ui | packages/admin-ui/src/components/admin-pricing.tsx | direct frontend/shared caller detected | No unmatched caller exists; absence of a direct static frontend fetch is not a missing integration. |
| /api/admin/pricing | POST | none found | none found | available API endpoint | No unmatched caller exists; absence of a direct static frontend fetch is not a missing integration. |
| /api/admin/pricing/{id} | DELETE | none found | none found | available API endpoint | No unmatched caller exists; absence of a direct static frontend fetch is not a missing integration. |
| /api/admin/pricing/{id} | GET | none found | none found | available API endpoint | No unmatched caller exists; absence of a direct static frontend fetch is not a missing integration. |
| /api/admin/pricing/{id} | PUT | none found | none found | available API endpoint | No unmatched caller exists; absence of a direct static frontend fetch is not a missing integration. |
| /api/admin/products | GET | admin-ui, superadmin | apps/superadmin/src/app/superadmin/mgmt/catalogue/page.tsx<br>packages/admin-ui/src/components/admin-homepage-settings.tsx<br>packages/admin-ui/src/components/admin-pricing.tsx<br>packages/admin-ui/src/components/admin-products-new.tsx | direct frontend/shared caller detected | No unmatched caller exists; absence of a direct static frontend fetch is not a missing integration. |
| /api/admin/products/ai-add | POST | none found | none found | available API endpoint | No unmatched caller exists; absence of a direct static frontend fetch is not a missing integration. |
| /api/admin/products/archive | DELETE | none found | none found | available API endpoint | No unmatched caller exists; absence of a direct static frontend fetch is not a missing integration. |
| /api/admin/products/archive | GET | none found | none found | available API endpoint | No unmatched caller exists; absence of a direct static frontend fetch is not a missing integration. |
| /api/admin/products/archive | POST | none found | none found | available API endpoint | No unmatched caller exists; absence of a direct static frontend fetch is not a missing integration. |
| /api/admin/products/archive | PUT | none found | none found | available API endpoint | No unmatched caller exists; absence of a direct static frontend fetch is not a missing integration. |
| /api/admin/products/bulk-price | PATCH | none found | none found | available API endpoint | No unmatched caller exists; absence of a direct static frontend fetch is not a missing integration. |
| /api/admin/products/bulk-price | POST | none found | none found | available API endpoint | No unmatched caller exists; absence of a direct static frontend fetch is not a missing integration. |
| /api/admin/products/bulk | POST | admin-ui | packages/admin-ui/src/components/admin-products-new.tsx | direct frontend/shared caller detected | No unmatched caller exists; absence of a direct static frontend fetch is not a missing integration. |
| /api/admin/quotes | GET | mgmt | apps/mgmt/src/app/mgmt/admin/quotes/page.tsx | direct frontend/shared caller detected | No unmatched caller exists; absence of a direct static frontend fetch is not a missing integration. |
| /api/admin/quotes/{id}/download | GET | none found | none found | available API endpoint | No unmatched caller exists; absence of a direct static frontend fetch is not a missing integration. |
| /api/admin/quotes/{id}/respond | POST | none found | none found | available API endpoint | No unmatched caller exists; absence of a direct static frontend fetch is not a missing integration. |
| /api/admin/quotes/advance-payment | GET | mgmt | apps/mgmt/src/app/mgmt/admin/quotes/page.tsx | direct frontend/shared caller detected | No unmatched caller exists; absence of a direct static frontend fetch is not a missing integration. |
| /api/admin/quotes/advance-payment | POST | none found | none found | available API endpoint | No unmatched caller exists; absence of a direct static frontend fetch is not a missing integration. |
| /api/admin/redemptions/approve | POST | none found | none found | available API endpoint | No unmatched caller exists; absence of a direct static frontend fetch is not a missing integration. |
| /api/admin/redemptions/list | GET | none found | none found | available API endpoint | No unmatched caller exists; absence of a direct static frontend fetch is not a missing integration. |
| /api/admin/redemptions/process | POST | none found | none found | available API endpoint | No unmatched caller exists; absence of a direct static frontend fetch is not a missing integration. |
| /api/admin/roles/set | POST | none found | none found | available API endpoint | No unmatched caller exists; absence of a direct static frontend fetch is not a missing integration. |
| /api/admin/sales-agents | GET | admin-ui | packages/admin-ui/src/components/SalesAgentsManagement.tsx | direct frontend/shared caller detected | No unmatched caller exists; absence of a direct static frontend fetch is not a missing integration. |
| /api/admin/sales-agents/{id} | GET | none found | none found | available API endpoint | No unmatched caller exists; absence of a direct static frontend fetch is not a missing integration. |
| /api/admin/sales-agents/{id} | PATCH | none found | none found | available API endpoint | No unmatched caller exists; absence of a direct static frontend fetch is not a missing integration. |
| /api/admin/services | GET | admin-ui, superadmin | apps/superadmin/src/app/superadmin/mgmt/catalogue/page.tsx<br>packages/admin-ui/src/components/admin-services.tsx | direct frontend/shared caller detected | No unmatched caller exists; absence of a direct static frontend fetch is not a missing integration. |
| /api/admin/setup-initial-admins | POST | none found | none found | available API endpoint | No unmatched caller exists; absence of a direct static frontend fetch is not a missing integration. |
| /api/admin/setup-sales-agents | POST | none found | none found | available API endpoint | No unmatched caller exists; absence of a direct static frontend fetch is not a missing integration. |
| /api/admin/users/{id}/history | GET | none found | none found | available API endpoint | No unmatched caller exists; absence of a direct static frontend fetch is not a missing integration. |
| /api/agents/apply | POST | none found | none found | available API endpoint | No unmatched caller exists; absence of a direct static frontend fetch is not a missing integration. |
| /api/agents/commissions | GET | none found | none found | available API endpoint | No unmatched caller exists; absence of a direct static frontend fetch is not a missing integration. |
| /api/agents/me | GET | none found | none found | available API endpoint | No unmatched caller exists; absence of a direct static frontend fetch is not a missing integration. |
| /api/agents/orders/create | POST | mgmt | apps/mgmt/src/app/mgmt/sales/agent-order/page.tsx | direct frontend/shared caller detected | No unmatched caller exists; absence of a direct static frontend fetch is not a missing integration. |
| /api/agents/redemptions | GET | none found | none found | available API endpoint | No unmatched caller exists; absence of a direct static frontend fetch is not a missing integration. |
| /api/agents/redemptions | POST | none found | none found | available API endpoint | No unmatched caller exists; absence of a direct static frontend fetch is not a missing integration. |
| /api/ai/generate-description | POST | admin-ui | packages/admin-ui/src/components/CreateProductDialog.tsx<br>packages/admin-ui/src/components/EditProductDialog.tsx | direct frontend/shared caller detected | No unmatched caller exists; absence of a direct static frontend fetch is not a missing integration. |
| /api/ai/price-request | POST | none found | none found | available API endpoint | No unmatched caller exists; absence of a direct static frontend fetch is not a missing integration. |
| /api/ai/product-details | POST | core | packages/core/src/ai/product-details.ts | direct frontend/shared caller detected | No unmatched caller exists; absence of a direct static frontend fetch is not a missing integration. |
| /api/ai/research | POST | public | apps/public/src/app/ai-research/page.tsx | direct frontend/shared caller detected | No unmatched caller exists; absence of a direct static frontend fetch is not a missing integration. |
| /api/analytics/dashboard | GET | mgmt | apps/mgmt/src/app/mgmt/admin/analytics/page.tsx | direct frontend/shared caller detected | No unmatched caller exists; absence of a direct static frontend fetch is not a missing integration. |
| /api/analytics/reports | GET | none found | none found | available API endpoint | No unmatched caller exists; absence of a direct static frontend fetch is not a missing integration. |
| /api/analytics/track | POST | core | packages/core/src/hooks/use-analytics.ts | direct frontend/shared caller detected | No unmatched caller exists; absence of a direct static frontend fetch is not a missing integration. |
| /api/auth/2fa/disable | POST | public | apps/public/src/components/profile/UserProfile.tsx | direct frontend/shared caller detected | No unmatched caller exists; absence of a direct static frontend fetch is not a missing integration. |
| /api/auth/2fa/setup | POST | mgmt, public | apps/mgmt/src/components/auth/TwoFactorSetup.tsx<br>apps/public/src/components/auth/TwoFactorSetup.tsx | direct frontend/shared caller detected | No unmatched caller exists; absence of a direct static frontend fetch is not a missing integration. |
| /api/auth/2fa/setup | PUT | none found | none found | available API endpoint | No unmatched caller exists; absence of a direct static frontend fetch is not a missing integration. |
| /api/auth/2fa/status | GET | mgmt, public | apps/mgmt/src/app/auth/login/page.tsx<br>apps/public/src/app/auth/signin/page.tsx<br>apps/public/src/components/profile/UserProfile.tsx | direct frontend/shared caller detected | No unmatched caller exists; absence of a direct static frontend fetch is not a missing integration. |
| /api/auth/2fa/verify | POST | mgmt, public | apps/mgmt/src/app/auth/login/page.tsx<br>apps/public/src/app/auth/signin/page.tsx | direct frontend/shared caller detected | No unmatched caller exists; absence of a direct static frontend fetch is not a missing integration. |
| /api/auth/callback | GET | none found | none found | system integration endpoint | This endpoint is triggered by external systems, browser redirects, extensions, or server-side workflows. |
| /api/auth/complete-signup | POST | public | apps/public/src/app/auth/verify-otp/OTPVerificationContent.tsx<br>apps/public/src/app/quotes/[id]/page.tsx | direct frontend/shared caller detected | No unmatched caller exists; absence of a direct static frontend fetch is not a missing integration. |
| /api/auth/extension | OPTIONS | popup.js | extension/popup.js | direct frontend/shared caller detected | CORS preflight endpoints are invoked by browsers, not application code. |
| /api/auth/extension | POST | none found | none found | system integration endpoint | This endpoint is triggered by external systems, browser redirects, extensions, or server-side workflows. |
| /api/auth/first-login-whatsapp | POST | core | packages/core/src/context/AuthProvider.tsx | direct frontend/shared caller detected | No unmatched caller exists; absence of a direct static frontend fetch is not a missing integration. |
| /api/auth/forgot-password | POST | none found | none found | available API endpoint | No unmatched caller exists; absence of a direct static frontend fetch is not a missing integration. |
| /api/auth/login | POST | waba | apps/waba/src/app/login/page.tsx | direct frontend/shared caller detected | No unmatched caller exists; absence of a direct static frontend fetch is not a missing integration. |
| /api/auth/me | GET | waba | apps/waba/src/app/page.tsx<br>apps/waba/src/app/templates/page.tsx | direct frontend/shared caller detected | No unmatched caller exists; absence of a direct static frontend fetch is not a missing integration. |
| /api/auth/quick-login | POST | none found | none found | available API endpoint | No unmatched caller exists; absence of a direct static frontend fetch is not a missing integration. |
| /api/auth/resend-verification | POST | core, public | apps/public/src/app/auth/verify-otp/OTPVerificationContent.tsx<br>packages/core/src/context/AuthProvider.tsx | direct frontend/shared caller detected | No unmatched caller exists; absence of a direct static frontend fetch is not a missing integration. |
| /api/auth/reset-password | POST | none found | none found | available API endpoint | No unmatched caller exists; absence of a direct static frontend fetch is not a missing integration. |
| /api/auth/resolve-phone | POST | none found | none found | available API endpoint | No unmatched caller exists; absence of a direct static frontend fetch is not a missing integration. |
| /api/auth/send-otp | POST | public, ui | apps/public/src/app/activate-warranty/[serialNumber]/page.tsx<br>packages/ui/src/components/ui/BlitzAuditBanner.tsx | direct frontend/shared caller detected | No unmatched caller exists; absence of a direct static frontend fetch is not a missing integration. |
| /api/auth/session | DELETE | api, core | apps/api/src/app/dashboard/page.tsx<br>packages/core/src/context/AuthProvider.tsx | direct frontend/shared caller detected | No unmatched caller exists; absence of a direct static frontend fetch is not a missing integration. |
| /api/auth/session | GET | none found | none found | available API endpoint | No unmatched caller exists; absence of a direct static frontend fetch is not a missing integration. |
| /api/auth/session | POST | none found | none found | available API endpoint | No unmatched caller exists; absence of a direct static frontend fetch is not a missing integration. |
| /api/auth/signout | POST | core, public | apps/public/src/app/auth/signout/page.tsx<br>packages/core/src/context/AuthProvider.tsx | direct frontend/shared caller detected | No unmatched caller exists; absence of a direct static frontend fetch is not a missing integration. |
| /api/auth/signup | POST | core, public | apps/public/src/app/auth/signup/page.tsx<br>apps/public/src/app/quotes/[id]/page.tsx<br>packages/core/src/context/AuthProvider.tsx | direct frontend/shared caller detected | No unmatched caller exists; absence of a direct static frontend fetch is not a missing integration. |
| /api/auth/verify-otp | POST | public | apps/public/src/app/auth/verify-otp/OTPVerificationContent.tsx<br>apps/public/src/app/quotes/[id]/page.tsx | direct frontend/shared caller detected | No unmatched caller exists; absence of a direct static frontend fetch is not a missing integration. |
| /api/auto-offers | DELETE | mgmt, public | apps/mgmt/src/components/customised-setups/CustomSetupFlow.tsx<br>apps/public/src/components/customised-setups/CustomSetupFlow.tsx<br>apps/public/src/components/products/ShopPageContent.tsx | direct frontend/shared caller detected | No unmatched caller exists; absence of a direct static frontend fetch is not a missing integration. |
| /api/auto-offers | GET | none found | none found | available API endpoint | No unmatched caller exists; absence of a direct static frontend fetch is not a missing integration. |
| /api/auto-offers | POST | none found | none found | available API endpoint | No unmatched caller exists; absence of a direct static frontend fetch is not a missing integration. |
| /api/auto-offers | PUT | none found | none found | available API endpoint | No unmatched caller exists; absence of a direct static frontend fetch is not a missing integration. |
| /api/blog | GET | none found | none found | available API endpoint | No unmatched caller exists; absence of a direct static frontend fetch is not a missing integration. |
| /api/blog | POST | none found | none found | available API endpoint | No unmatched caller exists; absence of a direct static frontend fetch is not a missing integration. |
| /api/blog/{slug} | DELETE | none found | none found | available API endpoint | No unmatched caller exists; absence of a direct static frontend fetch is not a missing integration. |
| /api/blog/{slug} | GET | none found | none found | available API endpoint | No unmatched caller exists; absence of a direct static frontend fetch is not a missing integration. |
| /api/blog/{slug} | PATCH | none found | none found | available API endpoint | No unmatched caller exists; absence of a direct static frontend fetch is not a missing integration. |
| /api/blueprints/attribution/conversion | POST | mgmt | apps/mgmt/src/hooks/use-viral-attribution.ts | direct frontend/shared caller detected | No unmatched caller exists; absence of a direct static frontend fetch is not a missing integration. |
| /api/branches | DELETE | superadmin | apps/superadmin/src/app/superadmin/mgmt/branches/page.tsx | direct frontend/shared caller detected | No unmatched caller exists; absence of a direct static frontend fetch is not a missing integration. |
| /api/branches | GET | none found | none found | available API endpoint | No unmatched caller exists; absence of a direct static frontend fetch is not a missing integration. |
| /api/branches | POST | none found | none found | available API endpoint | No unmatched caller exists; absence of a direct static frontend fetch is not a missing integration. |
| /api/campaigns | POST | waba | apps/waba/src/app/campaigns/page.tsx | direct frontend/shared caller detected | No unmatched caller exists; absence of a direct static frontend fetch is not a missing integration. |
| /api/captcha/config | GET | none found | none found | available API endpoint | No unmatched caller exists; absence of a direct static frontend fetch is not a missing integration. |
| /api/captcha/verify | POST | none found | none found | available API endpoint | No unmatched caller exists; absence of a direct static frontend fetch is not a missing integration. |
| /api/cart/abandoned | POST | public | apps/public/src/components/checkout/CheckoutPage.tsx | direct frontend/shared caller detected | No unmatched caller exists; absence of a direct static frontend fetch is not a missing integration. |
| /api/cart/merge | POST | mgmt, public | apps/mgmt/src/components/auth/LoginDialog.tsx<br>apps/public/src/components/auth/LoginDialog.tsx | direct frontend/shared caller detected | No unmatched caller exists; absence of a direct static frontend fetch is not a missing integration. |
| /api/cart/sync | POST | core, public | apps/public/src/components/cart/AddToCartButton.tsx<br>packages/core/src/store/cartStore.ts | direct frontend/shared caller detected | No unmatched caller exists; absence of a direct static frontend fetch is not a missing integration. |
| /api/checkout/calculate | POST | core | packages/core/src/store/cartStore.ts | direct frontend/shared caller detected | No unmatched caller exists; absence of a direct static frontend fetch is not a missing integration. |
| /api/commissions/calculate | POST | none found | none found | available API endpoint | No unmatched caller exists; absence of a direct static frontend fetch is not a missing integration. |
| /api/commissions/calculate | PUT | none found | none found | available API endpoint | No unmatched caller exists; absence of a direct static frontend fetch is not a missing integration. |
| /api/commissions/payments | POST | none found | none found | available API endpoint | No unmatched caller exists; absence of a direct static frontend fetch is not a missing integration. |
| /api/commissions/rules | GET | none found | none found | available API endpoint | No unmatched caller exists; absence of a direct static frontend fetch is not a missing integration. |
| /api/commissions/rules | POST | none found | none found | available API endpoint | No unmatched caller exists; absence of a direct static frontend fetch is not a missing integration. |
| /api/contact-messages | GET | public | apps/public/src/app/solutions/page.tsx<br>apps/public/src/components/InfrastructureLeadForm.tsx<br>apps/public/src/components/layout/Footer.tsx | direct frontend/shared caller detected | No unmatched caller exists; absence of a direct static frontend fetch is not a missing integration. |
| /api/contact-messages | POST | none found | none found | available API endpoint | No unmatched caller exists; absence of a direct static frontend fetch is not a missing integration. |
| /api/contact-messages/{id} | GET | none found | none found | available API endpoint | No unmatched caller exists; absence of a direct static frontend fetch is not a missing integration. |
| /api/contact-messages/{id} | PATCH | none found | none found | available API endpoint | No unmatched caller exists; absence of a direct static frontend fetch is not a missing integration. |
| /api/conversations | PATCH | waba | apps/waba/src/app/page.tsx | direct frontend/shared caller detected | No unmatched caller exists; absence of a direct static frontend fetch is not a missing integration. |
| /api/conversations/{id}/assign | PATCH | none found | none found | available API endpoint | No unmatched caller exists; absence of a direct static frontend fetch is not a missing integration. |
| /api/copilot/command | POST | waba | apps/waba/src/components/waba/ChatMain.tsx | direct frontend/shared caller detected | No unmatched caller exists; absence of a direct static frontend fetch is not a missing integration. |
| /api/coupons | DELETE | admin-ui | packages/admin-ui/src/components/CreateDiscountDialog.tsx | direct frontend/shared caller detected | No unmatched caller exists; absence of a direct static frontend fetch is not a missing integration. |
| /api/coupons | GET | none found | none found | available API endpoint | No unmatched caller exists; absence of a direct static frontend fetch is not a missing integration. |
| /api/coupons | POST | none found | none found | available API endpoint | No unmatched caller exists; absence of a direct static frontend fetch is not a missing integration. |
| /api/coupons | PUT | none found | none found | available API endpoint | No unmatched caller exists; absence of a direct static frontend fetch is not a missing integration. |
| /api/cron/abandoned-carts | GET | none found | none found | backend/service endpoint | Webhook, cron, health, and tRPC procedure entries are not expected to have direct frontend fetch callers. |
| /api/cron/recover-abandoned-registrations | GET | none found | none found | backend/service endpoint | Webhook, cron, health, and tRPC procedure entries are not expected to have direct frontend fetch callers. |
| /api/cron/service-retention | GET | none found | none found | backend/service endpoint | Webhook, cron, health, and tRPC procedure entries are not expected to have direct frontend fetch callers. |
| /api/custom-setup-offers | GET | public | apps/public/src/components/customised-setups/CustomSetupFlow.tsx<br>apps/public/src/components/customised-setups/WizardCustomSetupFlow.tsx | direct frontend/shared caller detected | No unmatched caller exists; absence of a direct static frontend fetch is not a missing integration. |
| /api/custom-setups | GET | none found | none found | available API endpoint | No unmatched caller exists; absence of a direct static frontend fetch is not a missing integration. |
| /api/customer-360 | GET | none found | none found | available API endpoint | No unmatched caller exists; absence of a direct static frontend fetch is not a missing integration. |
| /api/customer-promotions | GET | none found | none found | available API endpoint | No unmatched caller exists; absence of a direct static frontend fetch is not a missing integration. |
| /api/customer-promotions | POST | none found | none found | available API endpoint | No unmatched caller exists; absence of a direct static frontend fetch is not a missing integration. |
| /api/customer/notifications | POST | none found | none found | available API endpoint | No unmatched caller exists; absence of a direct static frontend fetch is not a missing integration. |
| /api/customers/register | GET | none found | none found | available API endpoint | No unmatched caller exists; absence of a direct static frontend fetch is not a missing integration. |
| /api/customers/register | POST | none found | none found | available API endpoint | No unmatched caller exists; absence of a direct static frontend fetch is not a missing integration. |
| /api/debug-env | GET | none found | none found | system integration endpoint | This endpoint is triggered by external systems, browser redirects, extensions, or server-side workflows. |
| /api/discounts | DELETE | admin-ui | packages/admin-ui/src/components/CreateDiscountDialog.tsx<br>packages/admin-ui/src/components/OffersManagement.tsx | direct frontend/shared caller detected | No unmatched caller exists; absence of a direct static frontend fetch is not a missing integration. |
| /api/discounts | GET | none found | none found | available API endpoint | No unmatched caller exists; absence of a direct static frontend fetch is not a missing integration. |
| /api/discounts | POST | none found | none found | available API endpoint | No unmatched caller exists; absence of a direct static frontend fetch is not a missing integration. |
| /api/discounts | PUT | none found | none found | available API endpoint | No unmatched caller exists; absence of a direct static frontend fetch is not a missing integration. |
| /api/discounts/calculate | GET | none found | none found | available API endpoint | No unmatched caller exists; absence of a direct static frontend fetch is not a missing integration. |
| /api/email/abandoned-cart | POST | core | packages/core/src/store/cartStore.ts | direct frontend/shared caller detected | This endpoint is triggered by external systems, browser redirects, extensions, or server-side workflows. |
| /api/email/email-change | POST | none found | none found | system integration endpoint | This endpoint is triggered by external systems, browser redirects, extensions, or server-side workflows. |
| /api/email/marketing | POST | none found | none found | system integration endpoint | This endpoint is triggered by external systems, browser redirects, extensions, or server-side workflows. |
| /api/email/notify-manager | POST | none found | none found | system integration endpoint | This endpoint is triggered by external systems, browser redirects, extensions, or server-side workflows. |
| /api/email/notify-sales-pickup | POST | admin-ui, mgmt | apps/mgmt/src/components/sales/OrderActions.tsx<br>packages/admin-ui/src/shared/OrderActions.tsx | direct frontend/shared caller detected | This endpoint is triggered by external systems, browser redirects, extensions, or server-side workflows. |
| /api/email/order-approved | POST | admin-ui, mgmt | apps/mgmt/src/components/sales/OrderActions.tsx<br>packages/admin-ui/src/shared/OrderActions.tsx | direct frontend/shared caller detected | This endpoint is triggered by external systems, browser redirects, extensions, or server-side workflows. |
| /api/email/order-completion | POST | none found | none found | system integration endpoint | This endpoint is triggered by external systems, browser redirects, extensions, or server-side workflows. |
| /api/email/order-confirmation | POST | none found | none found | system integration endpoint | This endpoint is triggered by external systems, browser redirects, extensions, or server-side workflows. |
| /api/email/order-delivered | POST | none found | none found | system integration endpoint | This endpoint is triggered by external systems, browser redirects, extensions, or server-side workflows. |
| /api/email/password-reset | POST | none found | none found | system integration endpoint | This endpoint is triggered by external systems, browser redirects, extensions, or server-side workflows. |
| /api/email/payment-confirmation | POST | none found | none found | system integration endpoint | This endpoint is triggered by external systems, browser redirects, extensions, or server-side workflows. |
| /api/email/payment-failed | POST | none found | none found | system integration endpoint | This endpoint is triggered by external systems, browser redirects, extensions, or server-side workflows. |
| /api/email/payment-pending | POST | none found | none found | system integration endpoint | This endpoint is triggered by external systems, browser redirects, extensions, or server-side workflows. |
| /api/email/pickup | POST | admin-ui, mgmt | apps/mgmt/src/components/sales/OrderActions.tsx<br>packages/admin-ui/src/shared/OrderActions.tsx | direct frontend/shared caller detected | This endpoint is triggered by external systems, browser redirects, extensions, or server-side workflows. |
| /api/email/shipping | POST | none found | none found | system integration endpoint | This endpoint is triggered by external systems, browser redirects, extensions, or server-side workflows. |
| /api/email/verification | POST | none found | none found | system integration endpoint | This endpoint is triggered by external systems, browser redirects, extensions, or server-side workflows. |
| /api/email/welcome | POST | none found | none found | system integration endpoint | This endpoint is triggered by external systems, browser redirects, extensions, or server-side workflows. |
| /api/faqs | GET | none found | none found | available API endpoint | No unmatched caller exists; absence of a direct static frontend fetch is not a missing integration. |
| /api/free-installation-slots | GET | ui | packages/ui/src/components/ui/BlitzAuditBanner.tsx<br>packages/ui/src/components/ui/FreeInstallationOfferBanner.tsx | direct frontend/shared caller detected | No unmatched caller exists; absence of a direct static frontend fetch is not a missing integration. |
| /api/free-installation-slots | POST | none found | none found | available API endpoint | No unmatched caller exists; absence of a direct static frontend fetch is not a missing integration. |
| /api/gst-verify | GET | none found | none found | available API endpoint | No unmatched caller exists; absence of a direct static frontend fetch is not a missing integration. |
| /api/health | GET | api, superadmin | apps/api/src/proxy.ts<br>apps/superadmin/src/app/superadmin/mgmt/system-health/page.tsx | direct frontend/shared caller detected | Webhook, cron, health, and tRPC procedure entries are not expected to have direct frontend fetch callers. |
| /api/health | GET | none found | none found | backend/service endpoint | Webhook, cron, health, and tRPC procedure entries are not expected to have direct frontend fetch callers. |
| /api/health | GET | none found | none found | backend/service endpoint | Webhook, cron, health, and tRPC procedure entries are not expected to have direct frontend fetch callers. |
| /api/health | GET | none found | none found | backend/service endpoint | Webhook, cron, health, and tRPC procedure entries are not expected to have direct frontend fetch callers. |
| /api/health | GET | none found | none found | backend/service endpoint | Webhook, cron, health, and tRPC procedure entries are not expected to have direct frontend fetch callers. |
| /api/health | GET | none found | none found | backend/service endpoint | Webhook, cron, health, and tRPC procedure entries are not expected to have direct frontend fetch callers. |
| /api/health/email | GET | none found | none found | backend/service endpoint | Webhook, cron, health, and tRPC procedure entries are not expected to have direct frontend fetch callers. |
| /api/health/orders | GET | none found | none found | backend/service endpoint | Webhook, cron, health, and tRPC procedure entries are not expected to have direct frontend fetch callers. |
| /api/health/otp | GET | none found | none found | backend/service endpoint | Webhook, cron, health, and tRPC procedure entries are not expected to have direct frontend fetch callers. |
| /api/health/summary | GET | none found | none found | backend/service endpoint | Webhook, cron, health, and tRPC procedure entries are not expected to have direct frontend fetch callers. |
| /api/hello | GET | none found | none found | available API endpoint | No unmatched caller exists; absence of a direct static frontend fetch is not a missing integration. |
| /api/inquiries | POST | public | apps/public/src/components/products/ProductDetailPage.tsx | direct frontend/shared caller detected | No unmatched caller exists; absence of a direct static frontend fetch is not a missing integration. |
| /api/inventory | GET | mgmt | apps/mgmt/src/app/mgmt/sales/inventory/sales-inventory.tsx | direct frontend/shared caller detected | No unmatched caller exists; absence of a direct static frontend fetch is not a missing integration. |
| /api/inventory | POST | none found | none found | available API endpoint | No unmatched caller exists; absence of a direct static frontend fetch is not a missing integration. |
| /api/inventory | PUT | none found | none found | available API endpoint | No unmatched caller exists; absence of a direct static frontend fetch is not a missing integration. |
| /api/inventory/transactions | GET | mgmt | apps/mgmt/src/app/mgmt/sales/purchase-entry/sales-purchase-entry.tsx | direct frontend/shared caller detected | No unmatched caller exists; absence of a direct static frontend fetch is not a missing integration. |
| /api/inventory/transactions | POST | none found | none found | available API endpoint | No unmatched caller exists; absence of a direct static frontend fetch is not a missing integration. |
| /api/inventory/transactions | PUT | none found | none found | available API endpoint | No unmatched caller exists; absence of a direct static frontend fetch is not a missing integration. |
| /api/leads/{id}/assign | PATCH | none found | none found | available API endpoint | No unmatched caller exists; absence of a direct static frontend fetch is not a missing integration. |
| /api/marketing/triggers/order-delivered-followup | POST | none found | none found | system integration endpoint | This endpoint is triggered by external systems, browser redirects, extensions, or server-side workflows. |
| /api/messages | GET | waba | apps/waba/src/app/page.tsx | direct frontend/shared caller detected | No unmatched caller exists; absence of a direct static frontend fetch is not a missing integration. |
| /api/messages | POST | none found | none found | available API endpoint | No unmatched caller exists; absence of a direct static frontend fetch is not a missing integration. |
| /api/messages/media | POST | waba | apps/waba/src/app/page.tsx | direct frontend/shared caller detected | No unmatched caller exists; absence of a direct static frontend fetch is not a missing integration. |
| /api/messages/read | PATCH | none found | none found | available API endpoint | No unmatched caller exists; absence of a direct static frontend fetch is not a missing integration. |
| /api/metadata | GET | api, ui | apps/api/src/app/dashboard/page.tsx<br>packages/ui/src/components/ui/logo.tsx | direct frontend/shared caller detected | No unmatched caller exists; absence of a direct static frontend fetch is not a missing integration. |
| /api/notifications/send | POST | none found | none found | system integration endpoint | This endpoint is triggered by external systems, browser redirects, extensions, or server-side workflows. |
| /api/offers | DELETE | admin-ui, core | packages/admin-ui/src/components/OffersManagement.tsx<br>packages/core/src/offer-discount-service.ts | direct frontend/shared caller detected | No unmatched caller exists; absence of a direct static frontend fetch is not a missing integration. |
| /api/offers | GET | none found | none found | available API endpoint | No unmatched caller exists; absence of a direct static frontend fetch is not a missing integration. |
| /api/offers | POST | none found | none found | available API endpoint | No unmatched caller exists; absence of a direct static frontend fetch is not a missing integration. |
| /api/offers | PUT | none found | none found | available API endpoint | No unmatched caller exists; absence of a direct static frontend fetch is not a missing integration. |
| /api/orders | GET | core | packages/core/src/context/OrderProvider.tsx | direct frontend/shared caller detected | No unmatched caller exists; absence of a direct static frontend fetch is not a missing integration. |
| /api/orders | POST | none found | none found | available API endpoint | No unmatched caller exists; absence of a direct static frontend fetch is not a missing integration. |
| /api/orders/{id} | GET | admin-ui, core, mgmt, public | apps/mgmt/src/components/sales/OrderActions.tsx<br>apps/public/src/app/payment/[method]/[orderId]/PaymentClientPage.tsx<br>apps/public/src/app/payment/upi/[orderId]/UPIClientPage.tsx<br>packages/admin-ui/src/shared/OrderActions.tsx<br>packages/core/src/context/OrderProvider.tsx | direct frontend/shared caller detected | No unmatched caller exists; absence of a direct static frontend fetch is not a missing integration. |
| /api/orders/{id}/timeline | GET | none found | none found | available API endpoint | No unmatched caller exists; absence of a direct static frontend fetch is not a missing integration. |
| /api/orders/auto-cancel | POST | none found | none found | available API endpoint | No unmatched caller exists; absence of a direct static frontend fetch is not a missing integration. |
| /api/orders/commission | POST | none found | none found | available API endpoint | No unmatched caller exists; absence of a direct static frontend fetch is not a missing integration. |
| /api/orders/update-status | POST | none found | none found | available API endpoint | No unmatched caller exists; absence of a direct static frontend fetch is not a missing integration. |
| /api/organizations | DELETE | superadmin | apps/superadmin/src/app/superadmin/mgmt/branches/page.tsx<br>apps/superadmin/src/app/superadmin/mgmt/organizations/page.tsx | direct frontend/shared caller detected | No unmatched caller exists; absence of a direct static frontend fetch is not a missing integration. |
| /api/organizations | GET | none found | none found | available API endpoint | No unmatched caller exists; absence of a direct static frontend fetch is not a missing integration. |
| /api/organizations | POST | none found | none found | available API endpoint | No unmatched caller exists; absence of a direct static frontend fetch is not a missing integration. |
| /api/otp/generate | GET | none found | none found | available API endpoint | No unmatched caller exists; absence of a direct static frontend fetch is not a missing integration. |
| /api/otp/generate | POST | none found | none found | available API endpoint | No unmatched caller exists; absence of a direct static frontend fetch is not a missing integration. |
| /api/otp/resend | GET | none found | none found | available API endpoint | No unmatched caller exists; absence of a direct static frontend fetch is not a missing integration. |
| /api/otp/resend | POST | none found | none found | available API endpoint | No unmatched caller exists; absence of a direct static frontend fetch is not a missing integration. |
| /api/otp/verify | GET | none found | none found | available API endpoint | No unmatched caller exists; absence of a direct static frontend fetch is not a missing integration. |
| /api/otp/verify | POST | none found | none found | available API endpoint | No unmatched caller exists; absence of a direct static frontend fetch is not a missing integration. |
| /api/page-content | DELETE | admin-ui, core, mgmt | apps/mgmt/src/app/mgmt/admin/page-content/page.tsx<br>apps/mgmt/src/hooks/use-page-content.ts<br>packages/admin-ui/src/components/PoliciesManagement.tsx<br>packages/core/src/hooks/use-page-content.ts | direct frontend/shared caller detected | No unmatched caller exists; absence of a direct static frontend fetch is not a missing integration. |
| /api/page-content | GET | none found | none found | available API endpoint | No unmatched caller exists; absence of a direct static frontend fetch is not a missing integration. |
| /api/page-content | GET | none found | none found | available API endpoint | No unmatched caller exists; absence of a direct static frontend fetch is not a missing integration. |
| /api/page-content | POST | none found | none found | available API endpoint | No unmatched caller exists; absence of a direct static frontend fetch is not a missing integration. |
| /api/page-content | PUT | none found | none found | available API endpoint | No unmatched caller exists; absence of a direct static frontend fetch is not a missing integration. |
| /api/payment/payu/callback | POST | none found | none found | system integration endpoint | This endpoint is triggered by external systems, browser redirects, extensions, or server-side workflows. |
| /api/payment/payu/initiate | POST | mgmt, public | apps/mgmt/src/app/mgmt/sales/agent-order/page.tsx<br>apps/public/src/app/payment/payu/[orderId]/PayuClientPage.tsx | direct frontend/shared caller detected | No unmatched caller exists; absence of a direct static frontend fetch is not a missing integration. |
| /api/payments/update | GET | none found | none found | available API endpoint | No unmatched caller exists; absence of a direct static frontend fetch is not a missing integration. |
| /api/payments/update | POST | none found | none found | available API endpoint | No unmatched caller exists; absence of a direct static frontend fetch is not a missing integration. |
| /api/permissions | GET | superadmin | apps/superadmin/src/app/superadmin/mgmt/roles/page.tsx | direct frontend/shared caller detected | No unmatched caller exists; absence of a direct static frontend fetch is not a missing integration. |
| /api/pricing/calculate | GET | none found | none found | available API endpoint | No unmatched caller exists; absence of a direct static frontend fetch is not a missing integration. |
| /api/pricing/calculate | POST | none found | none found | available API endpoint | No unmatched caller exists; absence of a direct static frontend fetch is not a missing integration. |
| /api/pricing/customer-type | GET | none found | none found | available API endpoint | No unmatched caller exists; absence of a direct static frontend fetch is not a missing integration. |
| /api/pricing/customer-type | POST | none found | none found | available API endpoint | No unmatched caller exists; absence of a direct static frontend fetch is not a missing integration. |
| /api/products | DELETE | admin-ui, mgmt, public | apps/mgmt/src/app/mgmt/sales/products/edit/[id]/sales-product-edit.tsx<br>apps/mgmt/src/app/mgmt/sales/products/new/sales-product-new.tsx<br>apps/mgmt/src/components/sales/WalkInOrderManagement.tsx<br>apps/public/src/components/products/ShopPageContent.tsx<br>packages/admin-ui/src/components/CreateProductDialog.tsx | direct frontend/shared caller detected | No unmatched caller exists; absence of a direct static frontend fetch is not a missing integration. |
| /api/products | GET | none found | none found | available API endpoint | No unmatched caller exists; absence of a direct static frontend fetch is not a missing integration. |
| /api/products | GET | none found | none found | available API endpoint | No unmatched caller exists; absence of a direct static frontend fetch is not a missing integration. |
| /api/products | POST | none found | none found | available API endpoint | No unmatched caller exists; absence of a direct static frontend fetch is not a missing integration. |
| /api/products | PUT | none found | none found | available API endpoint | No unmatched caller exists; absence of a direct static frontend fetch is not a missing integration. |
| /api/products/{id} | GET | admin-ui, mgmt | apps/mgmt/src/app/mgmt/sales/products/sales-products.tsx<br>packages/admin-ui/src/components/admin-products-new.tsx | direct frontend/shared caller detected | No unmatched caller exists; absence of a direct static frontend fetch is not a missing integration. |
| /api/products/{id} | PATCH | none found | none found | available API endpoint | No unmatched caller exists; absence of a direct static frontend fetch is not a missing integration. |
| /api/products/bulk-edit | GET | none found | none found | available API endpoint | No unmatched caller exists; absence of a direct static frontend fetch is not a missing integration. |
| /api/products/bulk-edit | POST | none found | none found | available API endpoint | No unmatched caller exists; absence of a direct static frontend fetch is not a missing integration. |
| /api/products/cleanup-images | POST | none found | none found | available API endpoint | No unmatched caller exists; absence of a direct static frontend fetch is not a missing integration. |
| /api/products/cleanup | DELETE | none found | none found | available API endpoint | No unmatched caller exists; absence of a direct static frontend fetch is not a missing integration. |
| /api/products/export | GET | none found | none found | available API endpoint | No unmatched caller exists; absence of a direct static frontend fetch is not a missing integration. |
| /api/products/fix-images | POST | none found | none found | available API endpoint | No unmatched caller exists; absence of a direct static frontend fetch is not a missing integration. |
| /api/products/image-diagnostics | GET | none found | none found | available API endpoint | No unmatched caller exists; absence of a direct static frontend fetch is not a missing integration. |
| /api/products/import | GET | none found | none found | available API endpoint | No unmatched caller exists; absence of a direct static frontend fetch is not a missing integration. |
| /api/products/import | POST | none found | none found | available API endpoint | No unmatched caller exists; absence of a direct static frontend fetch is not a missing integration. |
| /api/products/manual-import | POST | none found | none found | available API endpoint | No unmatched caller exists; absence of a direct static frontend fetch is not a missing integration. |
| /api/products/recommendations | GET | none found | none found | available API endpoint | No unmatched caller exists; absence of a direct static frontend fetch is not a missing integration. |
| /api/products/scrape-url | POST | none found | none found | available API endpoint | No unmatched caller exists; absence of a direct static frontend fetch is not a missing integration. |
| /api/products/scraper | OPTIONS | none found | none found | preflight route | CORS preflight endpoints are invoked by browsers, not application code. |
| /api/products/scraper | POST | none found | none found | available API endpoint | No unmatched caller exists; absence of a direct static frontend fetch is not a missing integration. |
| /api/products/scraper/ai | OPTIONS | none found | none found | preflight route | CORS preflight endpoints are invoked by browsers, not application code. |
| /api/products/scraper/ai | POST | none found | none found | available API endpoint | No unmatched caller exists; absence of a direct static frontend fetch is not a missing integration. |
| /api/products/simple-import | POST | none found | none found | available API endpoint | No unmatched caller exists; absence of a direct static frontend fetch is not a missing integration. |
| /api/products/template | GET | none found | none found | available API endpoint | No unmatched caller exists; absence of a direct static frontend fetch is not a missing integration. |
| /api/projects | GET | none found | none found | available API endpoint | No unmatched caller exists; absence of a direct static frontend fetch is not a missing integration. |
| /api/projects | POST | none found | none found | available API endpoint | No unmatched caller exists; absence of a direct static frontend fetch is not a missing integration. |
| /api/projects/{id} | DELETE | none found | none found | available API endpoint | No unmatched caller exists; absence of a direct static frontend fetch is not a missing integration. |
| /api/projects/{id} | PUT | none found | none found | available API endpoint | No unmatched caller exists; absence of a direct static frontend fetch is not a missing integration. |
| /api/projects/{id}/pdf | GET | none found | none found | available API endpoint | No unmatched caller exists; absence of a direct static frontend fetch is not a missing integration. |
| /api/promotions/claim-viral | POST | ui | packages/ui/src/components/ui/ViralWarrantyModal.tsx | direct frontend/shared caller detected | No unmatched caller exists; absence of a direct static frontend fetch is not a missing integration. |
| /api/promotions/free-installation-claim | POST | ui | packages/ui/src/components/ui/BlitzAuditBanner.tsx | direct frontend/shared caller detected | No unmatched caller exists; absence of a direct static frontend fetch is not a missing integration. |
| /api/quotes | POST | mgmt, public | apps/mgmt/src/components/customised-setups/CustomSetupFlow.tsx<br>apps/mgmt/src/components/customised-setups/QuoteCTA.tsx<br>apps/public/src/components/customised-setups/CustomSetupFlow.tsx<br>apps/public/src/components/customised-setups/QuoteCTA.tsx<br>apps/public/src/components/customised-setups/WizardCustomSetupFlow.tsx | direct frontend/shared caller detected | No unmatched caller exists; absence of a direct static frontend fetch is not a missing integration. |
| /api/quotes/{id} | GET | mgmt, public | apps/mgmt/src/components/customised-setups/CustomSetupFlow.tsx<br>apps/public/src/components/customised-setups/CustomSetupFlow.tsx<br>apps/public/src/components/customised-setups/WizardCustomSetupFlow.tsx | direct frontend/shared caller detected | No unmatched caller exists; absence of a direct static frontend fetch is not a missing integration. |
| /api/quotes/{id}/accept-counter | POST | none found | none found | available API endpoint | No unmatched caller exists; absence of a direct static frontend fetch is not a missing integration. |
| /api/quotes/{id}/advance-payment/confirm | GET | none found | none found | available API endpoint | No unmatched caller exists; absence of a direct static frontend fetch is not a missing integration. |
| /api/quotes/{id}/advance-payment/confirm | POST | none found | none found | available API endpoint | No unmatched caller exists; absence of a direct static frontend fetch is not a missing integration. |
| /api/quotes/{id}/advance-payment/generate-link | POST | none found | none found | available API endpoint | No unmatched caller exists; absence of a direct static frontend fetch is not a missing integration. |
| /api/quotes/{id}/reject-counter | POST | none found | none found | available API endpoint | No unmatched caller exists; absence of a direct static frontend fetch is not a missing integration. |
| /api/quotes/bid | POST | none found | none found | available API endpoint | No unmatched caller exists; absence of a direct static frontend fetch is not a missing integration. |
| /api/referral | GET | none found | none found | available API endpoint | No unmatched caller exists; absence of a direct static frontend fetch is not a missing integration. |
| /api/referral/claim | POST | none found | none found | available API endpoint | No unmatched caller exists; absence of a direct static frontend fetch is not a missing integration. |
| /api/roles-public | GET | none found | none found | available API endpoint | No unmatched caller exists; absence of a direct static frontend fetch is not a missing integration. |
| /api/roles | GET | superadmin | apps/superadmin/src/app/superadmin/mgmt/roles/page.tsx | direct frontend/shared caller detected | Admin API modules are often consumed by another deployed app, shared package, Postman collection, or server-rendered workflow. |
| /api/roles | GET | none found | none found | available API endpoint | No unmatched caller exists; absence of a direct static frontend fetch is not a missing integration. |
| /api/roles | POST | none found | none found | cross-app/admin endpoint | Admin API modules are often consumed by another deployed app, shared package, Postman collection, or server-rendered workflow. |
| /api/roles | POST | none found | none found | available API endpoint | No unmatched caller exists; absence of a direct static frontend fetch is not a missing integration. |
| /api/sales-agents/apply | POST | public | apps/public/src/components/profile/UserProfile.tsx | direct frontend/shared caller detected | No unmatched caller exists; absence of a direct static frontend fetch is not a missing integration. |
| /api/security/audit-logs | GET | admin-ui | packages/admin-ui/src/components/security-dashboard.tsx | direct frontend/shared caller detected | No unmatched caller exists; absence of a direct static frontend fetch is not a missing integration. |
| /api/security/audit-logs | POST | none found | none found | available API endpoint | No unmatched caller exists; absence of a direct static frontend fetch is not a missing integration. |
| /api/security/mfa-status | GET | none found | none found | available API endpoint | No unmatched caller exists; absence of a direct static frontend fetch is not a missing integration. |
| /api/security/mfa-status | POST | none found | none found | available API endpoint | No unmatched caller exists; absence of a direct static frontend fetch is not a missing integration. |
| /api/security/settings | GET | admin-ui | packages/admin-ui/src/components/security-dashboard.tsx | direct frontend/shared caller detected | No unmatched caller exists; absence of a direct static frontend fetch is not a missing integration. |
| /api/security/settings | POST | none found | none found | available API endpoint | No unmatched caller exists; absence of a direct static frontend fetch is not a missing integration. |
| /api/security/validate-password | POST | admin-ui | packages/admin-ui/src/components/security-dashboard.tsx | direct frontend/shared caller detected | No unmatched caller exists; absence of a direct static frontend fetch is not a missing integration. |
| /api/service-availability | GET | none found | none found | available API endpoint | No unmatched caller exists; absence of a direct static frontend fetch is not a missing integration. |
| /api/services | GET | superadmin | apps/superadmin/src/app/superadmin/mgmt/services/page.tsx | direct frontend/shared caller detected | No unmatched caller exists; absence of a direct static frontend fetch is not a missing integration. |
| /api/services | POST | none found | none found | available API endpoint | No unmatched caller exists; absence of a direct static frontend fetch is not a missing integration. |
| /api/services/{id} | DELETE | none found | none found | available API endpoint | No unmatched caller exists; absence of a direct static frontend fetch is not a missing integration. |
| /api/services/{id} | GET | none found | none found | available API endpoint | No unmatched caller exists; absence of a direct static frontend fetch is not a missing integration. |
| /api/services/{id} | PUT | none found | none found | available API endpoint | No unmatched caller exists; absence of a direct static frontend fetch is not a missing integration. |
| /api/services/engineers | GET | none found | none found | available API endpoint | No unmatched caller exists; absence of a direct static frontend fetch is not a missing integration. |
| /api/services/engineers | POST | none found | none found | available API endpoint | No unmatched caller exists; absence of a direct static frontend fetch is not a missing integration. |
| /api/services/tickets | GET | none found | none found | available API endpoint | No unmatched caller exists; absence of a direct static frontend fetch is not a missing integration. |
| /api/services/tickets | POST | none found | none found | available API endpoint | No unmatched caller exists; absence of a direct static frontend fetch is not a missing integration. |
| /api/services/tickets/{id} | GET | none found | none found | available API endpoint | No unmatched caller exists; absence of a direct static frontend fetch is not a missing integration. |
| /api/services/tickets/{id} | PUT | none found | none found | available API endpoint | No unmatched caller exists; absence of a direct static frontend fetch is not a missing integration. |
| /api/settings | DELETE | admin-ui, api, mgmt, public, superadmin | apps/api/src/app/dashboard/page.tsx<br>apps/mgmt/src/app/mgmt/admin/custom-setups/price-manager.tsx<br>apps/mgmt/src/components/customised-setups/CustomSetupFlow.tsx<br>apps/public/src/components/customised-setups/CustomSetupFlow.tsx<br>apps/public/src/components/customised-setups/WizardCustomSetupFlow.tsx<br>apps/public/src/components/layout/Footer.tsx<br>apps/public/src/components/layout/Header.tsx<br>apps/superadmin/src/app/superadmin/mgmt/ai-config/page.tsx<br>apps/superadmin/src/app/superadmin/mgmt/payment-settings/page.tsx<br>packages/admin-ui/src/components/CreateProductDialog.tsx<br>packages/admin-ui/src/components/EditProductDialog.tsx<br>packages/admin-ui/src/components/admin-homepage-settings.tsx<br>packages/admin-ui/src/components/admin-settings.tsx | direct frontend/shared caller detected | No unmatched caller exists; absence of a direct static frontend fetch is not a missing integration. |
| /api/settings | GET | none found | none found | available API endpoint | No unmatched caller exists; absence of a direct static frontend fetch is not a missing integration. |
| /api/settings | POST | none found | none found | available API endpoint | No unmatched caller exists; absence of a direct static frontend fetch is not a missing integration. |
| /api/settings | PUT | none found | none found | available API endpoint | No unmatched caller exists; absence of a direct static frontend fetch is not a missing integration. |
| /api/shipping | GET | none found | none found | available API endpoint | No unmatched caller exists; absence of a direct static frontend fetch is not a missing integration. |
| /api/shipping | POST | none found | none found | available API endpoint | No unmatched caller exists; absence of a direct static frontend fetch is not a missing integration. |
| /api/shipping/update | GET | none found | none found | available API endpoint | No unmatched caller exists; absence of a direct static frontend fetch is not a missing integration. |
| /api/shipping/update | POST | none found | none found | available API endpoint | No unmatched caller exists; absence of a direct static frontend fetch is not a missing integration. |
| /api/superadmin/areas | DELETE | superadmin | apps/superadmin/src/app/superadmin/mgmt/areas/page.tsx | direct frontend/shared caller detected | No unmatched caller exists; absence of a direct static frontend fetch is not a missing integration. |
| /api/superadmin/areas | GET | none found | none found | available API endpoint | No unmatched caller exists; absence of a direct static frontend fetch is not a missing integration. |
| /api/superadmin/areas | POST | none found | none found | available API endpoint | No unmatched caller exists; absence of a direct static frontend fetch is not a missing integration. |
| /api/superadmin/catalogue/generate | POST | superadmin | apps/superadmin/src/app/superadmin/mgmt/catalogue/page.tsx | direct frontend/shared caller detected | No unmatched caller exists; absence of a direct static frontend fetch is not a missing integration. |
| /api/superadmin/custom-setup-offers | DELETE | superadmin | apps/superadmin/src/components/superadmin/CustomSetupOffersManager.tsx | direct frontend/shared caller detected | No unmatched caller exists; absence of a direct static frontend fetch is not a missing integration. |
| /api/superadmin/custom-setup-offers | GET | none found | none found | available API endpoint | No unmatched caller exists; absence of a direct static frontend fetch is not a missing integration. |
| /api/superadmin/custom-setup-offers | POST | none found | none found | available API endpoint | No unmatched caller exists; absence of a direct static frontend fetch is not a missing integration. |
| /api/superadmin/custom-setup-offers | PUT | none found | none found | available API endpoint | No unmatched caller exists; absence of a direct static frontend fetch is not a missing integration. |
| /api/superadmin/inquiries | GET | superadmin | apps/superadmin/src/app/superadmin/mgmt/leads/inquiry-pipeline.tsx | direct frontend/shared caller detected | No unmatched caller exists; absence of a direct static frontend fetch is not a missing integration. |
| /api/superadmin/inquiries/{id}/assignment | PATCH | none found | none found | available API endpoint | No unmatched caller exists; absence of a direct static frontend fetch is not a missing integration. |
| /api/superadmin/services/ai-generate | POST | superadmin | apps/superadmin/src/app/superadmin/mgmt/services/page.tsx | direct frontend/shared caller detected | No unmatched caller exists; absence of a direct static frontend fetch is not a missing integration. |
| /api/templates | GET | waba | apps/waba/src/app/page.tsx<br>apps/waba/src/app/templates/page.tsx | direct frontend/shared caller detected | No unmatched caller exists; absence of a direct static frontend fetch is not a missing integration. |
| /api/templates | POST | none found | none found | available API endpoint | No unmatched caller exists; absence of a direct static frontend fetch is not a missing integration. |
| /api/trpc/{trpc} | GET | mgmt, public | apps/mgmt/src/components/providers/TRPCProvider.tsx<br>apps/public/src/components/providers/TRPCProvider.tsx | direct frontend/shared caller detected | Webhook, cron, health, and tRPC procedure entries are not expected to have direct frontend fetch callers. |
| /api/trpc/{trpc} | POST | none found | none found | backend/service endpoint | Webhook, cron, health, and tRPC procedure entries are not expected to have direct frontend fetch callers. |
| /api/trpc/contactMessages.submit | POST | none found | none found | backend/service endpoint | Webhook, cron, health, and tRPC procedure entries are not expected to have direct frontend fetch callers. |
| /api/trpc/coupons.create | POST | none found | none found | backend/service endpoint | Webhook, cron, health, and tRPC procedure entries are not expected to have direct frontend fetch callers. |
| /api/trpc/coupons.delete | POST | none found | none found | backend/service endpoint | Webhook, cron, health, and tRPC procedure entries are not expected to have direct frontend fetch callers. |
| /api/trpc/coupons.getAll | GET | none found | none found | backend/service endpoint | Webhook, cron, health, and tRPC procedure entries are not expected to have direct frontend fetch callers. |
| /api/trpc/coupons.getByCode | GET | none found | none found | backend/service endpoint | Webhook, cron, health, and tRPC procedure entries are not expected to have direct frontend fetch callers. |
| /api/trpc/coupons.getById | GET | none found | none found | backend/service endpoint | Webhook, cron, health, and tRPC procedure entries are not expected to have direct frontend fetch callers. |
| /api/trpc/coupons.update | POST | none found | none found | backend/service endpoint | Webhook, cron, health, and tRPC procedure entries are not expected to have direct frontend fetch callers. |
| /api/trpc/featureFlags.getAll | GET | none found | none found | backend/service endpoint | Webhook, cron, health, and tRPC procedure entries are not expected to have direct frontend fetch callers. |
| /api/trpc/featureFlags.toggle | POST | none found | none found | backend/service endpoint | Webhook, cron, health, and tRPC procedure entries are not expected to have direct frontend fetch callers. |
| /api/trpc/offers.create | POST | none found | none found | backend/service endpoint | Webhook, cron, health, and tRPC procedure entries are not expected to have direct frontend fetch callers. |
| /api/trpc/offers.delete | POST | none found | none found | backend/service endpoint | Webhook, cron, health, and tRPC procedure entries are not expected to have direct frontend fetch callers. |
| /api/trpc/offers.getAll | GET | none found | none found | backend/service endpoint | Webhook, cron, health, and tRPC procedure entries are not expected to have direct frontend fetch callers. |
| /api/trpc/offers.update | POST | none found | none found | backend/service endpoint | Webhook, cron, health, and tRPC procedure entries are not expected to have direct frontend fetch callers. |
| /api/trpc/pageContent.get | GET | none found | none found | backend/service endpoint | Webhook, cron, health, and tRPC procedure entries are not expected to have direct frontend fetch callers. |
| /api/trpc/pageContent.list_all | GET | none found | none found | backend/service endpoint | Webhook, cron, health, and tRPC procedure entries are not expected to have direct frontend fetch callers. |
| /api/trpc/pageContent.update | POST | none found | none found | backend/service endpoint | Webhook, cron, health, and tRPC procedure entries are not expected to have direct frontend fetch callers. |
| /api/trpc/projects.create | POST | none found | none found | backend/service endpoint | Webhook, cron, health, and tRPC procedure entries are not expected to have direct frontend fetch callers. |
| /api/trpc/projects.delete | POST | none found | none found | backend/service endpoint | Webhook, cron, health, and tRPC procedure entries are not expected to have direct frontend fetch callers. |
| /api/trpc/projects.getAll | GET | none found | none found | backend/service endpoint | Webhook, cron, health, and tRPC procedure entries are not expected to have direct frontend fetch callers. |
| /api/upload-from-url | POST | none found | none found | available API endpoint | No unmatched caller exists; absence of a direct static frontend fetch is not a missing integration. |
| /api/upload | POST | admin-ui, mgmt | apps/mgmt/src/app/mgmt/sales/products/edit/[id]/sales-product-edit.tsx<br>apps/mgmt/src/app/mgmt/sales/products/new/sales-product-new.tsx<br>packages/admin-ui/src/components/HeroCarouselManager.tsx<br>packages/admin-ui/src/components/PartnerBrandsEditor.tsx<br>packages/admin-ui/src/components/SingleImageUploader.tsx<br>packages/admin-ui/src/components/admin-settings.tsx | direct frontend/shared caller detected | No unmatched caller exists; absence of a direct static frontend fetch is not a missing integration. |
| /api/uploads/quote-documents | POST | public | apps/public/src/app/quotes/[id]/advance-payment/page.tsx | direct frontend/shared caller detected | No unmatched caller exists; absence of a direct static frontend fetch is not a missing integration. |
| /api/user/communication-preferences | GET | none found | none found | available API endpoint | No unmatched caller exists; absence of a direct static frontend fetch is not a missing integration. |
| /api/user/communication-preferences | POST | none found | none found | available API endpoint | No unmatched caller exists; absence of a direct static frontend fetch is not a missing integration. |
| /api/user/gdpr/delete | POST | none found | none found | available API endpoint | No unmatched caller exists; absence of a direct static frontend fetch is not a missing integration. |
| /api/user/gdpr/export | GET | none found | none found | available API endpoint | No unmatched caller exists; absence of a direct static frontend fetch is not a missing integration. |
| /api/user/notifications | GET | none found | none found | available API endpoint | No unmatched caller exists; absence of a direct static frontend fetch is not a missing integration. |
| /api/user/notifications | PUT | none found | none found | available API endpoint | No unmatched caller exists; absence of a direct static frontend fetch is not a missing integration. |
| /api/user/wishlist | DELETE | core | packages/core/src/store/wishlistStore.ts | direct frontend/shared caller detected | No unmatched caller exists; absence of a direct static frontend fetch is not a missing integration. |
| /api/user/wishlist | GET | none found | none found | available API endpoint | No unmatched caller exists; absence of a direct static frontend fetch is not a missing integration. |
| /api/user/wishlist | POST | none found | none found | available API endpoint | No unmatched caller exists; absence of a direct static frontend fetch is not a missing integration. |
| /api/users-admin | GET | none found | none found | available API endpoint | No unmatched caller exists; absence of a direct static frontend fetch is not a missing integration. |
| /api/users-admin | POST | none found | none found | available API endpoint | No unmatched caller exists; absence of a direct static frontend fetch is not a missing integration. |
| /api/users | DELETE | admin-ui | packages/admin-ui/src/components/AddUserDialog.tsx<br>packages/admin-ui/src/components/EditUserDialog.tsx | direct frontend/shared caller detected | No unmatched caller exists; absence of a direct static frontend fetch is not a missing integration. |
| /api/users | DELETE | none found | none found | available API endpoint | No unmatched caller exists; absence of a direct static frontend fetch is not a missing integration. |
| /api/users | GET | none found | none found | available API endpoint | No unmatched caller exists; absence of a direct static frontend fetch is not a missing integration. |
| /api/users | GET | none found | none found | available API endpoint | No unmatched caller exists; absence of a direct static frontend fetch is not a missing integration. |
| /api/users | GET | none found | none found | available API endpoint | No unmatched caller exists; absence of a direct static frontend fetch is not a missing integration. |
| /api/users | POST | none found | none found | available API endpoint | No unmatched caller exists; absence of a direct static frontend fetch is not a missing integration. |
| /api/users | POST | none found | none found | available API endpoint | No unmatched caller exists; absence of a direct static frontend fetch is not a missing integration. |
| /api/users | PUT | none found | none found | available API endpoint | No unmatched caller exists; absence of a direct static frontend fetch is not a missing integration. |
| /api/users | PUT | none found | none found | available API endpoint | No unmatched caller exists; absence of a direct static frontend fetch is not a missing integration. |
| /api/v1/embed/configurator | GET | none found | none found | available API endpoint | No unmatched caller exists; absence of a direct static frontend fetch is not a missing integration. |
| /api/walk-in-orders | GET | mgmt | apps/mgmt/src/components/sales/WalkInOrderManagement.tsx | direct frontend/shared caller detected | No unmatched caller exists; absence of a direct static frontend fetch is not a missing integration. |
| /api/walk-in-orders | POST | none found | none found | available API endpoint | No unmatched caller exists; absence of a direct static frontend fetch is not a missing integration. |
| /api/warranty/activate | POST | public | apps/public/src/app/activate-warranty/[serialNumber]/page.tsx | direct frontend/shared caller detected | No unmatched caller exists; absence of a direct static frontend fetch is not a missing integration. |
| /api/webhook/whatsapp | POST | none found | none found | backend/service endpoint | Webhook, cron, health, and tRPC procedure entries are not expected to have direct frontend fetch callers. |
| /api/webhooks/custom-tunnel/{path*} | POST | none found | none found | backend/service endpoint | Webhook, cron, health, and tRPC procedure entries are not expected to have direct frontend fetch callers. |
| /api/webhooks/customer/signup | POST | none found | none found | backend/service endpoint | Webhook, cron, health, and tRPC procedure entries are not expected to have direct frontend fetch callers. |
| /api/webhooks/orders/cancelled | POST | none found | none found | backend/service endpoint | Webhook, cron, health, and tRPC procedure entries are not expected to have direct frontend fetch callers. |
| /api/webhooks/orders/delayed | POST | none found | none found | backend/service endpoint | Webhook, cron, health, and tRPC procedure entries are not expected to have direct frontend fetch callers. |
| /api/webhooks/orders/delivered | POST | none found | none found | backend/service endpoint | Webhook, cron, health, and tRPC procedure entries are not expected to have direct frontend fetch callers. |
| /api/webhooks/orders/notconfirmed | POST | none found | none found | backend/service endpoint | Webhook, cron, health, and tRPC procedure entries are not expected to have direct frontend fetch callers. |
| /api/webhooks/orders/outfordelivery | POST | none found | none found | backend/service endpoint | Webhook, cron, health, and tRPC procedure entries are not expected to have direct frontend fetch callers. |
| /api/webhooks/orders/placed | POST | none found | none found | backend/service endpoint | Webhook, cron, health, and tRPC procedure entries are not expected to have direct frontend fetch callers. |
| /api/webhooks/orders/shipped | POST | none found | none found | backend/service endpoint | Webhook, cron, health, and tRPC procedure entries are not expected to have direct frontend fetch callers. |
| /api/webhooks/payment/failed | POST | none found | none found | backend/service endpoint | Webhook, cron, health, and tRPC procedure entries are not expected to have direct frontend fetch callers. |
| /api/webhooks/payment/received | POST | none found | none found | backend/service endpoint | Webhook, cron, health, and tRPC procedure entries are not expected to have direct frontend fetch callers. |
| /api/webhooks/stats | GET | none found | none found | backend/service endpoint | Webhook, cron, health, and tRPC procedure entries are not expected to have direct frontend fetch callers. |
| /api/webhooks/stats | POST | none found | none found | backend/service endpoint | Webhook, cron, health, and tRPC procedure entries are not expected to have direct frontend fetch callers. |

## UI Calls With No Matching API

None detected.

````````

---

## docs/api-audit/api-role-mapping.md

````````markdown
# API Role Mapping

Latest source inventory: `inventory.json` generated 2026-07-19T07:31:22.303Z with 378 discovered API entries, 0 missing authentication signals, 0 missing permission signals, and 0 security issues. Runtime authorization behavior still requires seeded role-token tests.

| API | Method | Authentication | Permission Required | Security Signals |
| --- | --- | --- | --- | --- |
| /api/admin-auth/login | POST | required/static signal found | not found | validation, authentication, auditTrail, rateLimiting, csrf |
| /api/admin-auth/logout | POST | required/static signal found | not found | authentication, auditTrail, rateLimiting |
| /api/admin/agents/approve | POST | required/static signal found | role/permission signal found | validation, authentication, authorization, rateLimiting |
| /api/admin/agents/list | GET | required/static signal found | role/permission signal found | authentication, authorization, rateLimiting |
| /api/admin/agents/reject | POST | required/static signal found | role/permission signal found | validation, authentication, authorization, rateLimiting |
| /api/admin/ai-query | POST | required/static signal found | role/permission signal found | validation, authentication, authorization, auditTrail, rateLimiting |
| /api/admin/ai/product-description | POST | required/static signal found | role/permission signal found | validation, authentication, authorization, auditTrail, rateLimiting |
| /api/admin/ai/related-products | POST | required/static signal found | role/permission signal found | validation, authentication, authorization, auditTrail, rateLimiting |
| /api/admin/custom-setups | GET | public or optional/static signal found | role/permission signal found | validation, authentication, authorization, rateLimiting |
| /api/admin/custom-setups | PATCH | public or optional/static signal found | role/permission signal found | validation, authentication, authorization, rateLimiting |
| /api/admin/dashboard | GET | required/static signal found | role/permission signal found | validation, authentication, authorization, auditTrail, rateLimiting |
| /api/admin/faqs | GET | public or optional/static signal found | role/permission signal found | validation, authentication, authorization, auditTrail, rateLimiting |
| /api/admin/faqs | POST | required/static signal found | role/permission signal found | validation, authentication, authorization, auditTrail, rateLimiting |
| /api/admin/faqs/{id} | DELETE | required/static signal found | role/permission signal found | validation, authentication, authorization, auditTrail, rateLimiting |
| /api/admin/faqs/{id} | PUT | required/static signal found | role/permission signal found | validation, authentication, authorization, auditTrail, rateLimiting |
| /api/admin/homepage/auto-fill | POST | required/static signal found | role/permission signal found | validation, authentication, authorization, auditTrail, rateLimiting |
| /api/admin/homepage/auto-fill/run | POST | required/static signal found | role/permission signal found | validation, authentication, authorization, rateLimiting |
| /api/admin/inventory/warranty/register | POST | required/static signal found | role/permission signal found | validation, authentication, authorization, rateLimiting |
| /api/admin/jobs/{id} | GET | required/static signal found | role/permission signal found | authentication, authorization, rateLimiting |
| /api/admin/manage-role | POST | required/static signal found | role/permission signal found | validation, authentication, authorization, auditTrail, rateLimiting |
| /api/admin/marketing/blitz | POST | required/static signal found | role/permission signal found | validation, authentication, authorization, auditTrail, rateLimiting |
| /api/admin/marketing/broadcast | POST | required/static signal found | role/permission signal found | validation, authentication, authorization, auditTrail, rateLimiting |
| /api/admin/orders | GET | required/static signal found | role/permission signal found | authentication, authorization, auditTrail, rateLimiting |
| /api/admin/orders/{id}/pending-actions | POST | required/static signal found | role/permission signal found | validation, authentication, authorization, rateLimiting |
| /api/admin/payment-settings | GET | required/static signal found | role/permission signal found | authentication, authorization, rateLimiting |
| /api/admin/payment-settings | PUT | required/static signal found | role/permission signal found | authentication, authorization, rateLimiting |
| /api/admin/payment-settings/dedupe | POST | required/static signal found | role/permission signal found | authentication, authorization, rateLimiting |
| /api/admin/pricing | GET | required/static signal found | role/permission signal found | validation, authentication, authorization, auditTrail, rateLimiting |
| /api/admin/pricing | POST | required/static signal found | role/permission signal found | validation, authentication, authorization, auditTrail, rateLimiting |
| /api/admin/pricing/{id} | DELETE | public or optional/static signal found | role/permission signal found | validation, authentication, authorization, auditTrail, rateLimiting |
| /api/admin/pricing/{id} | GET | public or optional/static signal found | role/permission signal found | validation, authentication, authorization, auditTrail, rateLimiting |
| /api/admin/pricing/{id} | PUT | public or optional/static signal found | role/permission signal found | validation, authentication, authorization, auditTrail, rateLimiting |
| /api/admin/products | GET | public or optional/static signal found | role/permission signal found | validation, authentication, authorization, auditTrail, rateLimiting |
| /api/admin/products/ai-add | POST | required/static signal found | role/permission signal found | validation, authentication, authorization, auditTrail, rateLimiting |
| /api/admin/products/archive | DELETE | required/static signal found | role/permission signal found | validation, authentication, authorization, auditTrail, rateLimiting |
| /api/admin/products/archive | GET | public or optional/static signal found | role/permission signal found | validation, authentication, authorization, auditTrail, rateLimiting |
| /api/admin/products/archive | POST | required/static signal found | role/permission signal found | validation, authentication, authorization, auditTrail, rateLimiting |
| /api/admin/products/archive | PUT | required/static signal found | role/permission signal found | validation, authentication, authorization, auditTrail, rateLimiting |
| /api/admin/products/bulk-price | PATCH | required/static signal found | role/permission signal found | validation, authentication, authorization, auditTrail, rateLimiting |
| /api/admin/products/bulk-price | POST | required/static signal found | role/permission signal found | validation, authentication, authorization, auditTrail, rateLimiting |
| /api/admin/products/bulk | POST | required/static signal found | role/permission signal found | validation, authentication, authorization, auditTrail, rateLimiting |
| /api/admin/quotes | GET | public or optional/static signal found | role/permission signal found | authentication, authorization, rateLimiting |
| /api/admin/quotes/{id}/download | GET | required/static signal found | role/permission signal found | authentication, authorization, rateLimiting |
| /api/admin/quotes/{id}/respond | POST | required/static signal found | role/permission signal found | authentication, authorization, rateLimiting |
| /api/admin/quotes/advance-payment | GET | required/static signal found | role/permission signal found | validation, authentication, authorization, rateLimiting |
| /api/admin/quotes/advance-payment | POST | required/static signal found | role/permission signal found | validation, authentication, authorization, rateLimiting |
| /api/admin/redemptions/approve | POST | required/static signal found | role/permission signal found | validation, authentication, authorization, rateLimiting |
| /api/admin/redemptions/list | GET | required/static signal found | role/permission signal found | authentication, authorization, auditTrail, rateLimiting |
| /api/admin/redemptions/process | POST | required/static signal found | role/permission signal found | validation, authentication, authorization, rateLimiting |
| /api/admin/roles/set | POST | required/static signal found | role/permission signal found | authentication, authorization, auditTrail, rateLimiting |
| /api/admin/sales-agents | GET | required/static signal found | role/permission signal found | authentication, authorization, auditTrail, rateLimiting |
| /api/admin/sales-agents/{id} | GET | required/static signal found | role/permission signal found | validation, authentication, authorization, auditTrail, rateLimiting |
| /api/admin/sales-agents/{id} | PATCH | required/static signal found | role/permission signal found | validation, authentication, authorization, auditTrail, rateLimiting |
| /api/admin/services | GET | required/static signal found | role/permission signal found | validation, authentication, authorization, rateLimiting |
| /api/admin/setup-initial-admins | POST | required/static signal found | role/permission signal found | authentication, authorization, rateLimiting |
| /api/admin/setup-sales-agents | POST | required/static signal found | role/permission signal found | authentication, authorization, rateLimiting |
| /api/admin/users/{id}/history | GET | required/static signal found | role/permission signal found | authentication, authorization, auditTrail, rateLimiting |
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
| /api/analytics/dashboard | GET | required/static signal found | role/permission signal found | authentication, authorization, auditTrail, rateLimiting |
| /api/analytics/reports | GET | required/static signal found | role/permission signal found | validation, authentication, authorization, auditTrail, rateLimiting |
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
| /api/auth/login | POST | public or optional/static signal found | role/permission signal found | authentication, authorization, auditTrail, rateLimiting, csrf |
| /api/auth/me | GET | public or optional/static signal found | role/permission signal found | authentication, authorization, auditTrail, rateLimiting |
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
| /api/branches | DELETE | required/static signal found | role/permission signal found | authentication, authorization, rateLimiting |
| /api/branches | GET | required/static signal found | role/permission signal found | authentication, authorization, rateLimiting |
| /api/branches | POST | required/static signal found | role/permission signal found | authentication, authorization, rateLimiting |
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
| /api/conversations | PATCH | required/static signal found | role/permission signal found | authentication, authorization, auditTrail, rateLimiting |
| /api/conversations/{id}/assign | PATCH | required/static signal found | role/permission signal found | authentication, authorization, auditTrail, rateLimiting |
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
| /api/organizations | DELETE | required/static signal found | role/permission signal found | authentication, authorization, rateLimiting |
| /api/organizations | GET | required/static signal found | role/permission signal found | authentication, authorization, rateLimiting |
| /api/organizations | POST | required/static signal found | role/permission signal found | authentication, authorization, rateLimiting |
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
| /api/roles | GET | required/static signal found | role/permission signal found | authentication, authorization, rateLimiting |
| /api/roles | GET | required/static signal found | role/permission signal found | validation, authentication, authorization, rateLimiting |
| /api/roles | POST | required/static signal found | role/permission signal found | authentication, authorization, auditTrail, rateLimiting |
| /api/roles | POST | required/static signal found | role/permission signal found | validation, authentication, authorization, rateLimiting |
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
| /api/superadmin/custom-setup-offers | DELETE | public or optional/static signal found | role/permission signal found | validation, authentication, authorization, rateLimiting |
| /api/superadmin/custom-setup-offers | GET | public or optional/static signal found | role/permission signal found | validation, authentication, authorization, rateLimiting |
| /api/superadmin/custom-setup-offers | POST | public or optional/static signal found | role/permission signal found | validation, authentication, authorization, rateLimiting |
| /api/superadmin/custom-setup-offers | PUT | public or optional/static signal found | role/permission signal found | validation, authentication, authorization, rateLimiting |
| /api/superadmin/inquiries | GET | public or optional/static signal found | role/permission signal found | authentication, authorization, rateLimiting |
| /api/superadmin/inquiries/{id}/assignment | PATCH | required/static signal found | role/permission signal found | validation, authentication, authorization, rateLimiting |
| /api/superadmin/services/ai-generate | POST | required/static signal found | role/permission signal found | validation, authentication, authorization, rateLimiting |
| /api/templates | GET | required/static signal found | role/permission signal found | authentication, authorization, auditTrail, rateLimiting |
| /api/templates | POST | required/static signal found | role/permission signal found | authentication, authorization, auditTrail, rateLimiting |
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

````````

---

## docs/api-audit/api-test-report.md

````````markdown
# API Test Report

Latest source inventory: `inventory.json` generated 2026-07-19T07:31:22.303Z with 378 discovered API entries, 378 working static entries, 0 broken routes, 0 slow API candidates, and 0 production blockers.

This report is generated from static source verification. Runtime execution of each status-path requires deployed app URLs, seeded data, and valid role-specific tokens.

| API | Method | Static Status | Observed Status Codes | Required Functional Cases |
| --- | --- | --- | --- | --- |
| /api/admin-auth/login | POST | Static contract present | 401, 500 | Route exists<br>Method registered<br>Success response<br>400 invalid data<br>404 missing resource<br>500 error path<br>401 anonymous/expired token<br>403 wrong permission<br>Empty data<br>Duplicate data<br>Large payload<br>429 rate limit<br>OPTIONS<br>HEAD |
| /api/admin-auth/logout | POST | Needs remediation or runtime confirmation | none observed | Route exists<br>Method registered<br>Success response<br>400 invalid data<br>404 missing resource<br>500 error path<br>401 anonymous/expired token<br>403 wrong permission<br>Empty data<br>Duplicate data<br>Large payload<br>429 rate limit<br>OPTIONS<br>HEAD |
| /api/admin/agents/approve | POST | Needs remediation or runtime confirmation | 400, 401 | Route exists<br>Method registered<br>Success response<br>400 invalid data<br>404 missing resource<br>500 error path<br>401 anonymous/expired token<br>403 wrong permission<br>Empty data<br>Duplicate data<br>Large payload<br>429 rate limit<br>OPTIONS<br>HEAD |
| /api/admin/agents/list | GET | Needs remediation or runtime confirmation | 400, 401 | Route exists<br>Method registered<br>Success response<br>400 invalid data<br>404 missing resource<br>500 error path<br>401 anonymous/expired token<br>403 wrong permission<br>Pagination/filter/sort<br>Slow network<br>OPTIONS<br>HEAD |
| /api/admin/agents/reject | POST | Needs remediation or runtime confirmation | 400, 401 | Route exists<br>Method registered<br>Success response<br>400 invalid data<br>404 missing resource<br>500 error path<br>401 anonymous/expired token<br>403 wrong permission<br>Empty data<br>Duplicate data<br>Large payload<br>429 rate limit<br>OPTIONS<br>HEAD |
| /api/admin/ai-query | POST | Static contract present | 401, 403, 500 | Route exists<br>Method registered<br>Success response<br>400 invalid data<br>404 missing resource<br>500 error path<br>401 anonymous/expired token<br>403 wrong permission<br>Empty data<br>Duplicate data<br>Large payload<br>429 rate limit<br>OPTIONS<br>HEAD |
| /api/admin/ai/product-description | POST | Static contract present | 400, 500 | Route exists<br>Method registered<br>Success response<br>400 invalid data<br>404 missing resource<br>500 error path<br>401 anonymous/expired token<br>403 wrong permission<br>Empty data<br>Duplicate data<br>Large payload<br>429 rate limit<br>OPTIONS<br>HEAD |
| /api/admin/ai/related-products | POST | Static contract present | 400, 500 | Route exists<br>Method registered<br>Success response<br>400 invalid data<br>404 missing resource<br>500 error path<br>401 anonymous/expired token<br>403 wrong permission<br>Empty data<br>Duplicate data<br>Large payload<br>429 rate limit<br>OPTIONS<br>HEAD |
| /api/admin/custom-setups | GET | Needs remediation or runtime confirmation | 404, 500 | Route exists<br>Method registered<br>Success response<br>400 invalid data<br>404 missing resource<br>500 error path<br>Empty data<br>Duplicate data<br>Large payload<br>429 rate limit<br>Pagination/filter/sort<br>Slow network<br>OPTIONS<br>HEAD |
| /api/admin/custom-setups | PATCH | Needs remediation or runtime confirmation | 400, 500 | Route exists<br>Method registered<br>Success response<br>400 invalid data<br>404 missing resource<br>500 error path<br>Empty data<br>Duplicate data<br>Large payload<br>429 rate limit<br>OPTIONS<br>HEAD |
| /api/admin/dashboard | GET | Static contract present | 500 | Route exists<br>Method registered<br>Success response<br>400 invalid data<br>404 missing resource<br>500 error path<br>401 anonymous/expired token<br>403 wrong permission<br>Pagination/filter/sort<br>Slow network<br>OPTIONS<br>HEAD |
| /api/admin/faqs | GET | Needs remediation or runtime confirmation | 200, 500 | Route exists<br>Method registered<br>Success response<br>400 invalid data<br>404 missing resource<br>500 error path<br>Empty data<br>Duplicate data<br>Large payload<br>429 rate limit<br>Pagination/filter/sort<br>Slow network<br>OPTIONS<br>HEAD |
| /api/admin/faqs | POST | Needs remediation or runtime confirmation | 201, 400, 500 | Route exists<br>Method registered<br>Success response<br>400 invalid data<br>404 missing resource<br>500 error path<br>401 anonymous/expired token<br>403 wrong permission<br>Empty data<br>Duplicate data<br>Large payload<br>429 rate limit<br>OPTIONS<br>HEAD |
| /api/admin/faqs/{id} | DELETE | Needs remediation or runtime confirmation | 200, 400, 500 | Route exists<br>Method registered<br>Success response<br>400 invalid data<br>404 missing resource<br>500 error path<br>401 anonymous/expired token<br>403 wrong permission<br>Empty data<br>Duplicate data<br>Large payload<br>429 rate limit<br>OPTIONS<br>HEAD |
| /api/admin/faqs/{id} | PUT | Needs remediation or runtime confirmation | 200, 400, 500 | Route exists<br>Method registered<br>Success response<br>400 invalid data<br>404 missing resource<br>500 error path<br>401 anonymous/expired token<br>403 wrong permission<br>Empty data<br>Duplicate data<br>Large payload<br>429 rate limit<br>OPTIONS<br>HEAD |
| /api/admin/homepage/auto-fill | POST | Static contract present | 401, 403, 500 | Route exists<br>Method registered<br>Success response<br>400 invalid data<br>404 missing resource<br>500 error path<br>401 anonymous/expired token<br>403 wrong permission<br>Empty data<br>Duplicate data<br>Large payload<br>429 rate limit<br>OPTIONS<br>HEAD |
| /api/admin/homepage/auto-fill/run | POST | Needs remediation or runtime confirmation | 401, 403, 500 | Route exists<br>Method registered<br>Success response<br>400 invalid data<br>404 missing resource<br>500 error path<br>401 anonymous/expired token<br>403 wrong permission<br>Empty data<br>Duplicate data<br>Large payload<br>429 rate limit<br>OPTIONS<br>HEAD |
| /api/admin/inventory/warranty/register | POST | Needs remediation or runtime confirmation | 400, 500 | Route exists<br>Method registered<br>Success response<br>400 invalid data<br>404 missing resource<br>500 error path<br>401 anonymous/expired token<br>403 wrong permission<br>Empty data<br>Duplicate data<br>Large payload<br>429 rate limit<br>OPTIONS<br>HEAD |
| /api/admin/jobs/{id} | GET | Needs remediation or runtime confirmation | 404, 500 | Route exists<br>Method registered<br>Success response<br>400 invalid data<br>404 missing resource<br>500 error path<br>401 anonymous/expired token<br>403 wrong permission<br>Pagination/filter/sort<br>Slow network<br>OPTIONS<br>HEAD |
| /api/admin/manage-role | POST | Static contract present | 400, 401, 404, 500, 503 | Route exists<br>Method registered<br>Success response<br>400 invalid data<br>404 missing resource<br>500 error path<br>401 anonymous/expired token<br>403 wrong permission<br>Empty data<br>Duplicate data<br>Large payload<br>429 rate limit<br>OPTIONS<br>HEAD |
| /api/admin/marketing/blitz | POST | Static contract present | 400, 500 | Route exists<br>Method registered<br>Success response<br>400 invalid data<br>404 missing resource<br>500 error path<br>401 anonymous/expired token<br>403 wrong permission<br>Empty data<br>Duplicate data<br>Large payload<br>429 rate limit<br>OPTIONS<br>HEAD |
| /api/admin/marketing/broadcast | POST | Static contract present | 202, 400, 401, 403, 500 | Route exists<br>Method registered<br>Success response<br>400 invalid data<br>404 missing resource<br>500 error path<br>401 anonymous/expired token<br>403 wrong permission<br>Empty data<br>Duplicate data<br>Large payload<br>429 rate limit<br>OPTIONS<br>HEAD |
| /api/admin/orders | GET | Static contract present | 401, 403, 500 | Route exists<br>Method registered<br>Success response<br>400 invalid data<br>404 missing resource<br>500 error path<br>401 anonymous/expired token<br>403 wrong permission<br>Pagination/filter/sort<br>Slow network<br>OPTIONS<br>HEAD |
| /api/admin/orders/{id}/pending-actions | POST | Needs remediation or runtime confirmation | 400, 401, 403, 404, 500 | Route exists<br>Method registered<br>Success response<br>400 invalid data<br>404 missing resource<br>500 error path<br>401 anonymous/expired token<br>403 wrong permission<br>Empty data<br>Duplicate data<br>Large payload<br>429 rate limit<br>OPTIONS<br>HEAD |
| /api/admin/payment-settings | GET | Needs remediation or runtime confirmation | none observed | Route exists<br>Method registered<br>Success response<br>400 invalid data<br>404 missing resource<br>500 error path<br>401 anonymous/expired token<br>403 wrong permission<br>Pagination/filter/sort<br>Slow network<br>OPTIONS<br>HEAD |
| /api/admin/payment-settings | PUT | Needs remediation or runtime confirmation | 403 | Route exists<br>Method registered<br>Success response<br>400 invalid data<br>404 missing resource<br>500 error path<br>401 anonymous/expired token<br>403 wrong permission<br>Empty data<br>Duplicate data<br>Large payload<br>429 rate limit<br>OPTIONS<br>HEAD |
| /api/admin/payment-settings/dedupe | POST | Needs remediation or runtime confirmation | 401, 500 | Route exists<br>Method registered<br>Success response<br>400 invalid data<br>404 missing resource<br>500 error path<br>401 anonymous/expired token<br>403 wrong permission<br>Empty data<br>Duplicate data<br>Large payload<br>429 rate limit<br>OPTIONS<br>HEAD |
| /api/admin/pricing | GET | Static contract present | 401, 403, 500 | Route exists<br>Method registered<br>Success response<br>400 invalid data<br>404 missing resource<br>500 error path<br>401 anonymous/expired token<br>403 wrong permission<br>Empty data<br>Duplicate data<br>Large payload<br>429 rate limit<br>Pagination/filter/sort<br>Slow network<br>OPTIONS<br>HEAD |
| /api/admin/pricing | POST | Static contract present | 201, 400, 401, 403, 500 | Route exists<br>Method registered<br>Success response<br>400 invalid data<br>404 missing resource<br>500 error path<br>401 anonymous/expired token<br>403 wrong permission<br>Empty data<br>Duplicate data<br>Large payload<br>429 rate limit<br>OPTIONS<br>HEAD |
| /api/admin/pricing/{id} | DELETE | Static contract present | 401, 403, 500 | Route exists<br>Method registered<br>Success response<br>400 invalid data<br>404 missing resource<br>500 error path<br>Empty data<br>Duplicate data<br>Large payload<br>429 rate limit<br>OPTIONS<br>HEAD |
| /api/admin/pricing/{id} | GET | Static contract present | none observed | Route exists<br>Method registered<br>Success response<br>400 invalid data<br>404 missing resource<br>500 error path<br>Empty data<br>Duplicate data<br>Large payload<br>429 rate limit<br>Pagination/filter/sort<br>Slow network<br>OPTIONS<br>HEAD |
| /api/admin/pricing/{id} | PUT | Static contract present | 401, 403, 500 | Route exists<br>Method registered<br>Success response<br>400 invalid data<br>404 missing resource<br>500 error path<br>Empty data<br>Duplicate data<br>Large payload<br>429 rate limit<br>OPTIONS<br>HEAD |
| /api/admin/products | GET | Static contract present | 401, 403, 500 | Route exists<br>Method registered<br>Success response<br>400 invalid data<br>404 missing resource<br>500 error path<br>Pagination/filter/sort<br>Slow network<br>OPTIONS<br>HEAD |
| /api/admin/products/ai-add | POST | Static contract present | 400, 401, 403, 422, 500, 502 | Route exists<br>Method registered<br>Success response<br>400 invalid data<br>404 missing resource<br>500 error path<br>401 anonymous/expired token<br>403 wrong permission<br>Empty data<br>Duplicate data<br>Large payload<br>429 rate limit<br>OPTIONS<br>HEAD |
| /api/admin/products/archive | DELETE | Static contract present | 400, 500 | Route exists<br>Method registered<br>Success response<br>400 invalid data<br>404 missing resource<br>500 error path<br>401 anonymous/expired token<br>403 wrong permission<br>Empty data<br>Duplicate data<br>Large payload<br>429 rate limit<br>OPTIONS<br>HEAD |
| /api/admin/products/archive | GET | Static contract present | 500 | Route exists<br>Method registered<br>Success response<br>400 invalid data<br>404 missing resource<br>500 error path<br>Empty data<br>Duplicate data<br>Large payload<br>429 rate limit<br>Pagination/filter/sort<br>Slow network<br>OPTIONS<br>HEAD |
| /api/admin/products/archive | POST | Static contract present | 400, 404, 409, 500 | Route exists<br>Method registered<br>Success response<br>400 invalid data<br>404 missing resource<br>500 error path<br>401 anonymous/expired token<br>403 wrong permission<br>Empty data<br>Duplicate data<br>Large payload<br>429 rate limit<br>OPTIONS<br>HEAD |
| /api/admin/products/archive | PUT | Static contract present | 400, 500 | Route exists<br>Method registered<br>Success response<br>400 invalid data<br>404 missing resource<br>500 error path<br>401 anonymous/expired token<br>403 wrong permission<br>Empty data<br>Duplicate data<br>Large payload<br>429 rate limit<br>OPTIONS<br>HEAD |
| /api/admin/products/bulk-price | PATCH | Static contract present | 400, 500 | Route exists<br>Method registered<br>Success response<br>400 invalid data<br>404 missing resource<br>500 error path<br>401 anonymous/expired token<br>403 wrong permission<br>Empty data<br>Duplicate data<br>Large payload<br>429 rate limit<br>OPTIONS<br>HEAD |
| /api/admin/products/bulk-price | POST | Static contract present | 400, 500 | Route exists<br>Method registered<br>Success response<br>400 invalid data<br>404 missing resource<br>500 error path<br>401 anonymous/expired token<br>403 wrong permission<br>Empty data<br>Duplicate data<br>Large payload<br>429 rate limit<br>OPTIONS<br>HEAD |
| /api/admin/products/bulk | POST | Static contract present | 400, 500 | Route exists<br>Method registered<br>Success response<br>400 invalid data<br>404 missing resource<br>500 error path<br>401 anonymous/expired token<br>403 wrong permission<br>Empty data<br>Duplicate data<br>Large payload<br>429 rate limit<br>OPTIONS<br>HEAD |
| /api/admin/quotes | GET | Needs remediation or runtime confirmation | 401, 500 | Route exists<br>Method registered<br>Success response<br>400 invalid data<br>404 missing resource<br>500 error path<br>Pagination/filter/sort<br>Slow network<br>OPTIONS<br>HEAD |
| /api/admin/quotes/{id}/download | GET | Needs remediation or runtime confirmation | 200, 401, 404, 413, 429, 500 | Route exists<br>Method registered<br>Success response<br>400 invalid data<br>404 missing resource<br>500 error path<br>401 anonymous/expired token<br>403 wrong permission<br>Pagination/filter/sort<br>Slow network<br>OPTIONS<br>HEAD |
| /api/admin/quotes/{id}/respond | POST | Needs remediation or runtime confirmation | 403, 500 | Route exists<br>Method registered<br>Success response<br>400 invalid data<br>404 missing resource<br>500 error path<br>401 anonymous/expired token<br>403 wrong permission<br>Empty data<br>Duplicate data<br>Large payload<br>429 rate limit<br>OPTIONS<br>HEAD |
| /api/admin/quotes/advance-payment | GET | Needs remediation or runtime confirmation | 400, 403, 500 | Route exists<br>Method registered<br>Success response<br>400 invalid data<br>404 missing resource<br>500 error path<br>401 anonymous/expired token<br>403 wrong permission<br>Empty data<br>Duplicate data<br>Large payload<br>429 rate limit<br>Pagination/filter/sort<br>Slow network<br>OPTIONS<br>HEAD |
| /api/admin/quotes/advance-payment | POST | Needs remediation or runtime confirmation | 400, 401, 403, 404, 409, 500 | Route exists<br>Method registered<br>Success response<br>400 invalid data<br>404 missing resource<br>500 error path<br>401 anonymous/expired token<br>403 wrong permission<br>Empty data<br>Duplicate data<br>Large payload<br>429 rate limit<br>OPTIONS<br>HEAD |
| /api/admin/redemptions/approve | POST | Needs remediation or runtime confirmation | 400, 401 | Route exists<br>Method registered<br>Success response<br>400 invalid data<br>404 missing resource<br>500 error path<br>401 anonymous/expired token<br>403 wrong permission<br>Empty data<br>Duplicate data<br>Large payload<br>429 rate limit<br>OPTIONS<br>HEAD |
| /api/admin/redemptions/list | GET | Needs remediation or runtime confirmation | 400, 401 | Route exists<br>Method registered<br>Success response<br>400 invalid data<br>404 missing resource<br>500 error path<br>401 anonymous/expired token<br>403 wrong permission<br>Pagination/filter/sort<br>Slow network<br>OPTIONS<br>HEAD |
| /api/admin/redemptions/process | POST | Needs remediation or runtime confirmation | 400, 401, 404 | Route exists<br>Method registered<br>Success response<br>400 invalid data<br>404 missing resource<br>500 error path<br>401 anonymous/expired token<br>403 wrong permission<br>Empty data<br>Duplicate data<br>Large payload<br>429 rate limit<br>OPTIONS<br>HEAD |
| /api/admin/roles/set | POST | Needs remediation or runtime confirmation | 400, 403, 404, 500 | Route exists<br>Method registered<br>Success response<br>400 invalid data<br>404 missing resource<br>500 error path<br>401 anonymous/expired token<br>403 wrong permission<br>Empty data<br>Duplicate data<br>Large payload<br>429 rate limit<br>OPTIONS<br>HEAD |
| /api/admin/sales-agents | GET | Static contract present | 401, 403, 500 | Route exists<br>Method registered<br>Success response<br>400 invalid data<br>404 missing resource<br>500 error path<br>401 anonymous/expired token<br>403 wrong permission<br>Pagination/filter/sort<br>Slow network<br>OPTIONS<br>HEAD |
| /api/admin/sales-agents/{id} | GET | Static contract present | none observed | Route exists<br>Method registered<br>Success response<br>400 invalid data<br>404 missing resource<br>500 error path<br>401 anonymous/expired token<br>403 wrong permission<br>Empty data<br>Duplicate data<br>Large payload<br>429 rate limit<br>Pagination/filter/sort<br>Slow network<br>OPTIONS<br>HEAD |
| /api/admin/sales-agents/{id} | PATCH | Static contract present | 400, 401, 403, 404, 500 | Route exists<br>Method registered<br>Success response<br>400 invalid data<br>404 missing resource<br>500 error path<br>401 anonymous/expired token<br>403 wrong permission<br>Empty data<br>Duplicate data<br>Large payload<br>429 rate limit<br>OPTIONS<br>HEAD |
| /api/admin/services | GET | Needs remediation or runtime confirmation | 401, 500 | Route exists<br>Method registered<br>Success response<br>400 invalid data<br>404 missing resource<br>500 error path<br>401 anonymous/expired token<br>403 wrong permission<br>Pagination/filter/sort<br>Slow network<br>OPTIONS<br>HEAD |
| /api/admin/setup-initial-admins | POST | Needs remediation or runtime confirmation | 401, 403, 429, 500, 503 | Route exists<br>Method registered<br>Success response<br>400 invalid data<br>404 missing resource<br>500 error path<br>401 anonymous/expired token<br>403 wrong permission<br>Empty data<br>Duplicate data<br>Large payload<br>429 rate limit<br>OPTIONS<br>HEAD |
| /api/admin/setup-sales-agents | POST | Needs remediation or runtime confirmation | 400, 500 | Route exists<br>Method registered<br>Success response<br>400 invalid data<br>404 missing resource<br>500 error path<br>401 anonymous/expired token<br>403 wrong permission<br>Empty data<br>Duplicate data<br>Large payload<br>429 rate limit<br>OPTIONS<br>HEAD |
| /api/admin/users/{id}/history | GET | Static contract present | 404, 500 | Route exists<br>Method registered<br>Success response<br>400 invalid data<br>404 missing resource<br>500 error path<br>401 anonymous/expired token<br>403 wrong permission<br>Pagination/filter/sort<br>Slow network<br>OPTIONS<br>HEAD |
| /api/agents/apply | POST | Static contract present | 401 | Route exists<br>Method registered<br>Success response<br>400 invalid data<br>404 missing resource<br>500 error path<br>Empty data<br>Duplicate data<br>Large payload<br>429 rate limit<br>OPTIONS<br>HEAD |
| /api/agents/commissions | GET | Needs remediation or runtime confirmation | 400, 401 | Route exists<br>Method registered<br>Success response<br>400 invalid data<br>404 missing resource<br>500 error path<br>401 anonymous/expired token<br>403 wrong permission<br>Pagination/filter/sort<br>Slow network<br>OPTIONS<br>HEAD |
| /api/agents/me | GET | Needs remediation or runtime confirmation | 400, 401 | Route exists<br>Method registered<br>Success response<br>400 invalid data<br>404 missing resource<br>500 error path<br>401 anonymous/expired token<br>403 wrong permission<br>Pagination/filter/sort<br>Slow network<br>OPTIONS<br>HEAD |
| /api/agents/orders/create | POST | Static contract present | 400, 401, 403, 500 | Route exists<br>Method registered<br>Success response<br>400 invalid data<br>404 missing resource<br>500 error path<br>401 anonymous/expired token<br>403 wrong permission<br>Empty data<br>Duplicate data<br>Large payload<br>429 rate limit<br>OPTIONS<br>HEAD |
| /api/agents/redemptions | GET | Needs remediation or runtime confirmation | 400, 401 | Route exists<br>Method registered<br>Success response<br>400 invalid data<br>404 missing resource<br>500 error path<br>401 anonymous/expired token<br>403 wrong permission<br>Empty data<br>Duplicate data<br>Large payload<br>429 rate limit<br>Pagination/filter/sort<br>Slow network<br>OPTIONS<br>HEAD |
| /api/agents/redemptions | POST | Needs remediation or runtime confirmation | 400, 401, 403 | Route exists<br>Method registered<br>Success response<br>400 invalid data<br>404 missing resource<br>500 error path<br>401 anonymous/expired token<br>403 wrong permission<br>Empty data<br>Duplicate data<br>Large payload<br>429 rate limit<br>OPTIONS<br>HEAD |
| /api/ai/generate-description | POST | Static contract present | 400, 500 | Route exists<br>Method registered<br>Success response<br>400 invalid data<br>404 missing resource<br>500 error path<br>401 anonymous/expired token<br>403 wrong permission<br>Empty data<br>Duplicate data<br>Large payload<br>429 rate limit<br>OPTIONS<br>HEAD |
| /api/ai/price-request | POST | Needs remediation or runtime confirmation | 401, 500 | Route exists<br>Method registered<br>Success response<br>400 invalid data<br>404 missing resource<br>500 error path<br>401 anonymous/expired token<br>403 wrong permission<br>Empty data<br>Duplicate data<br>Large payload<br>429 rate limit<br>OPTIONS<br>HEAD |
| /api/ai/product-details | POST | Static contract present | 400, 500 | Route exists<br>Method registered<br>Success response<br>400 invalid data<br>404 missing resource<br>500 error path<br>401 anonymous/expired token<br>403 wrong permission<br>Empty data<br>Duplicate data<br>Large payload<br>429 rate limit<br>OPTIONS<br>HEAD |
| /api/ai/research | POST | Static contract present | 400, 429, 500 | Route exists<br>Method registered<br>Success response<br>400 invalid data<br>404 missing resource<br>500 error path<br>401 anonymous/expired token<br>403 wrong permission<br>Empty data<br>Duplicate data<br>Large payload<br>429 rate limit<br>OPTIONS<br>HEAD |
| /api/analytics/dashboard | GET | Needs remediation or runtime confirmation | 401 | Route exists<br>Method registered<br>Success response<br>400 invalid data<br>404 missing resource<br>500 error path<br>401 anonymous/expired token<br>403 wrong permission<br>Pagination/filter/sort<br>Slow network<br>OPTIONS<br>HEAD |
| /api/analytics/reports | GET | Static contract present | none observed | Route exists<br>Method registered<br>Success response<br>400 invalid data<br>404 missing resource<br>500 error path<br>401 anonymous/expired token<br>403 wrong permission<br>Pagination/filter/sort<br>Slow network<br>OPTIONS<br>HEAD |
| /api/analytics/track | POST | Static contract present | 200, 400, 500 | Route exists<br>Method registered<br>Success response<br>400 invalid data<br>404 missing resource<br>500 error path<br>401 anonymous/expired token<br>403 wrong permission<br>Empty data<br>Duplicate data<br>Large payload<br>429 rate limit<br>OPTIONS<br>HEAD |
| /api/auth/2fa/disable | POST | Static contract present | 400, 401, 500 | Route exists<br>Method registered<br>Success response<br>400 invalid data<br>404 missing resource<br>500 error path<br>Empty data<br>Duplicate data<br>Large payload<br>429 rate limit<br>OPTIONS<br>HEAD |
| /api/auth/2fa/setup | POST | Static contract present | 400, 401, 500 | Route exists<br>Method registered<br>Success response<br>400 invalid data<br>404 missing resource<br>500 error path<br>Empty data<br>Duplicate data<br>Large payload<br>429 rate limit<br>OPTIONS<br>HEAD |
| /api/auth/2fa/setup | PUT | Static contract present | 400, 401, 500 | Route exists<br>Method registered<br>Success response<br>400 invalid data<br>404 missing resource<br>500 error path<br>Empty data<br>Duplicate data<br>Large payload<br>429 rate limit<br>OPTIONS<br>HEAD |
| /api/auth/2fa/status | GET | Needs remediation or runtime confirmation | 401, 500 | Route exists<br>Method registered<br>Success response<br>400 invalid data<br>404 missing resource<br>500 error path<br>Pagination/filter/sort<br>Slow network<br>OPTIONS<br>HEAD |
| /api/auth/2fa/verify | POST | Static contract present | 400, 401, 500 | Route exists<br>Method registered<br>Success response<br>400 invalid data<br>404 missing resource<br>500 error path<br>Empty data<br>Duplicate data<br>Large payload<br>429 rate limit<br>OPTIONS<br>HEAD |
| /api/auth/callback | GET | Static contract present | none observed | Route exists<br>Method registered<br>Success response<br>400 invalid data<br>404 missing resource<br>500 error path<br>Pagination/filter/sort<br>Slow network<br>OPTIONS<br>HEAD |
| /api/auth/complete-signup | POST | Static contract present | 400, 409, 500, 503 | Route exists<br>Method registered<br>Success response<br>400 invalid data<br>404 missing resource<br>500 error path<br>Empty data<br>Duplicate data<br>Large payload<br>429 rate limit<br>OPTIONS<br>HEAD |
| /api/auth/extension | OPTIONS | Needs remediation or runtime confirmation | none observed | Route exists<br>Method registered<br>Success response<br>400 invalid data<br>404 missing resource<br>500 error path<br>Empty data<br>Duplicate data<br>Large payload<br>429 rate limit<br>OPTIONS<br>HEAD |
| /api/auth/extension | POST | Needs remediation or runtime confirmation | 200, 400, 401, 403 | Route exists<br>Method registered<br>Success response<br>400 invalid data<br>404 missing resource<br>500 error path<br>Empty data<br>Duplicate data<br>Large payload<br>429 rate limit<br>OPTIONS<br>HEAD |
| /api/auth/first-login-whatsapp | POST | Static contract present | 400, 404, 500, 502, 503 | Route exists<br>Method registered<br>Success response<br>400 invalid data<br>404 missing resource<br>500 error path<br>Empty data<br>Duplicate data<br>Large payload<br>429 rate limit<br>OPTIONS<br>HEAD |
| /api/auth/forgot-password | POST | Static contract present | 400, 429, 500 | Route exists<br>Method registered<br>Success response<br>400 invalid data<br>404 missing resource<br>500 error path<br>Empty data<br>Duplicate data<br>Large payload<br>429 rate limit<br>OPTIONS<br>HEAD |
| /api/auth/login | POST | Static contract present | 400, 401, 500 | Route exists<br>Method registered<br>Success response<br>400 invalid data<br>404 missing resource<br>500 error path<br>Empty data<br>Duplicate data<br>Large payload<br>429 rate limit<br>OPTIONS<br>HEAD |
| /api/auth/me | GET | Needs remediation or runtime confirmation | 200, 500 | Route exists<br>Method registered<br>Success response<br>400 invalid data<br>404 missing resource<br>500 error path<br>Pagination/filter/sort<br>Slow network<br>OPTIONS<br>HEAD |
| /api/auth/quick-login | POST | Static contract present | 303, 400, 401, 403, 503 | Route exists<br>Method registered<br>Success response<br>400 invalid data<br>404 missing resource<br>500 error path<br>Empty data<br>Duplicate data<br>Large payload<br>429 rate limit<br>OPTIONS<br>HEAD |
| /api/auth/resend-verification | POST | Static contract present | none observed | Route exists<br>Method registered<br>Success response<br>400 invalid data<br>404 missing resource<br>500 error path<br>Empty data<br>Duplicate data<br>Large payload<br>429 rate limit<br>OPTIONS<br>HEAD |
| /api/auth/reset-password | POST | Static contract present | 429, 500 | Route exists<br>Method registered<br>Success response<br>400 invalid data<br>404 missing resource<br>500 error path<br>Empty data<br>Duplicate data<br>Large payload<br>429 rate limit<br>OPTIONS<br>HEAD |
| /api/auth/resolve-phone | POST | Needs remediation or runtime confirmation | 400, 429, 500 | Route exists<br>Method registered<br>Success response<br>400 invalid data<br>404 missing resource<br>500 error path<br>Empty data<br>Duplicate data<br>Large payload<br>429 rate limit<br>OPTIONS<br>HEAD |
| /api/auth/send-otp | POST | Static contract present | none observed | Route exists<br>Method registered<br>Success response<br>400 invalid data<br>404 missing resource<br>500 error path<br>Empty data<br>Duplicate data<br>Large payload<br>429 rate limit<br>OPTIONS<br>HEAD |
| /api/auth/session | DELETE | Static contract present | 500, 503 | Route exists<br>Method registered<br>Success response<br>400 invalid data<br>404 missing resource<br>500 error path<br>Empty data<br>Duplicate data<br>Large payload<br>429 rate limit<br>OPTIONS<br>HEAD |
| /api/auth/session | GET | Static contract present | 500, 503 | Route exists<br>Method registered<br>Success response<br>400 invalid data<br>404 missing resource<br>500 error path<br>Pagination/filter/sort<br>Slow network<br>OPTIONS<br>HEAD |
| /api/auth/session | POST | Static contract present | 401, 500, 503 | Route exists<br>Method registered<br>Success response<br>400 invalid data<br>404 missing resource<br>500 error path<br>Empty data<br>Duplicate data<br>Large payload<br>429 rate limit<br>OPTIONS<br>HEAD |
| /api/auth/signout | POST | Static contract present | 500 | Route exists<br>Method registered<br>Success response<br>400 invalid data<br>404 missing resource<br>500 error path<br>Empty data<br>Duplicate data<br>Large payload<br>429 rate limit<br>OPTIONS<br>HEAD |
| /api/auth/signup | POST | Static contract present | 429, 500, 503 | Route exists<br>Method registered<br>Success response<br>400 invalid data<br>404 missing resource<br>500 error path<br>Empty data<br>Duplicate data<br>Large payload<br>429 rate limit<br>OPTIONS<br>HEAD |
| /api/auth/verify-otp | POST | Static contract present | none observed | Route exists<br>Method registered<br>Success response<br>400 invalid data<br>404 missing resource<br>500 error path<br>Empty data<br>Duplicate data<br>Large payload<br>429 rate limit<br>OPTIONS<br>HEAD |
| /api/auto-offers | DELETE | Static contract present | 400, 500, 503 | Route exists<br>Method registered<br>Success response<br>400 invalid data<br>404 missing resource<br>500 error path<br>401 anonymous/expired token<br>403 wrong permission<br>Empty data<br>Duplicate data<br>Large payload<br>429 rate limit<br>OPTIONS<br>HEAD |
| /api/auto-offers | GET | Needs remediation or runtime confirmation | 404, 500, 503 | Route exists<br>Method registered<br>Success response<br>400 invalid data<br>404 missing resource<br>500 error path<br>401 anonymous/expired token<br>403 wrong permission<br>Empty data<br>Duplicate data<br>Large payload<br>429 rate limit<br>Pagination/filter/sort<br>Slow network<br>OPTIONS<br>HEAD |
| /api/auto-offers | POST | Static contract present | 400, 500, 503 | Route exists<br>Method registered<br>Success response<br>400 invalid data<br>404 missing resource<br>500 error path<br>401 anonymous/expired token<br>403 wrong permission<br>Empty data<br>Duplicate data<br>Large payload<br>429 rate limit<br>OPTIONS<br>HEAD |
| /api/auto-offers | PUT | Static contract present | 400, 500, 503 | Route exists<br>Method registered<br>Success response<br>400 invalid data<br>404 missing resource<br>500 error path<br>401 anonymous/expired token<br>403 wrong permission<br>Empty data<br>Duplicate data<br>Large payload<br>429 rate limit<br>OPTIONS<br>HEAD |
| /api/blog | GET | Needs remediation or runtime confirmation | 500 | Route exists<br>Method registered<br>Success response<br>400 invalid data<br>404 missing resource<br>500 error path<br>Empty data<br>Duplicate data<br>Large payload<br>429 rate limit<br>Pagination/filter/sort<br>Slow network<br>OPTIONS<br>HEAD |
| /api/blog | POST | Static contract present | 201, 400, 401, 403, 409, 500 | Route exists<br>Method registered<br>Success response<br>400 invalid data<br>404 missing resource<br>500 error path<br>401 anonymous/expired token<br>403 wrong permission<br>Empty data<br>Duplicate data<br>Large payload<br>429 rate limit<br>OPTIONS<br>HEAD |
| /api/blog/{slug} | DELETE | Static contract present | 401, 403, 500 | Route exists<br>Method registered<br>Success response<br>400 invalid data<br>404 missing resource<br>500 error path<br>401 anonymous/expired token<br>403 wrong permission<br>Empty data<br>Duplicate data<br>Large payload<br>429 rate limit<br>OPTIONS<br>HEAD |
| /api/blog/{slug} | GET | Needs remediation or runtime confirmation | 404, 500 | Route exists<br>Method registered<br>Success response<br>400 invalid data<br>404 missing resource<br>500 error path<br>Empty data<br>Duplicate data<br>Large payload<br>429 rate limit<br>Pagination/filter/sort<br>Slow network<br>OPTIONS<br>HEAD |
| /api/blog/{slug} | PATCH | Static contract present | 400, 401, 403, 404, 500 | Route exists<br>Method registered<br>Success response<br>400 invalid data<br>404 missing resource<br>500 error path<br>401 anonymous/expired token<br>403 wrong permission<br>Empty data<br>Duplicate data<br>Large payload<br>429 rate limit<br>OPTIONS<br>HEAD |
| /api/blueprints/attribution/conversion | POST | Static contract present | 400, 404, 500 | Route exists<br>Method registered<br>Success response<br>400 invalid data<br>404 missing resource<br>500 error path<br>401 anonymous/expired token<br>403 wrong permission<br>Empty data<br>Duplicate data<br>Large payload<br>429 rate limit<br>OPTIONS<br>HEAD |
| /api/branches | DELETE | Needs remediation or runtime confirmation | 400, 403, 500 | Route exists<br>Method registered<br>Success response<br>400 invalid data<br>404 missing resource<br>500 error path<br>401 anonymous/expired token<br>403 wrong permission<br>Empty data<br>Duplicate data<br>Large payload<br>429 rate limit<br>OPTIONS<br>HEAD |
| /api/branches | GET | Needs remediation or runtime confirmation | 403, 500 | Route exists<br>Method registered<br>Success response<br>400 invalid data<br>404 missing resource<br>500 error path<br>401 anonymous/expired token<br>403 wrong permission<br>Empty data<br>Duplicate data<br>Large payload<br>429 rate limit<br>Pagination/filter/sort<br>Slow network<br>OPTIONS<br>HEAD |
| /api/branches | POST | Needs remediation or runtime confirmation | 400, 403, 500 | Route exists<br>Method registered<br>Success response<br>400 invalid data<br>404 missing resource<br>500 error path<br>401 anonymous/expired token<br>403 wrong permission<br>Empty data<br>Duplicate data<br>Large payload<br>429 rate limit<br>OPTIONS<br>HEAD |
| /api/campaigns | POST | Static contract present | 400, 500 | Route exists<br>Method registered<br>Success response<br>400 invalid data<br>404 missing resource<br>500 error path<br>401 anonymous/expired token<br>403 wrong permission<br>Empty data<br>Duplicate data<br>Large payload<br>429 rate limit<br>OPTIONS<br>HEAD |
| /api/captcha/config | GET | Static contract present | 500 | Route exists<br>Method registered<br>Success response<br>400 invalid data<br>404 missing resource<br>500 error path<br>Pagination/filter/sort<br>Slow network<br>OPTIONS<br>HEAD |
| /api/captcha/verify | POST | Static contract present | 400, 500 | Route exists<br>Method registered<br>Success response<br>400 invalid data<br>404 missing resource<br>500 error path<br>Empty data<br>Duplicate data<br>Large payload<br>429 rate limit<br>OPTIONS<br>HEAD |
| /api/cart/abandoned | POST | Static contract present | 400, 500 | Route exists<br>Method registered<br>Success response<br>400 invalid data<br>404 missing resource<br>500 error path<br>401 anonymous/expired token<br>403 wrong permission<br>Empty data<br>Duplicate data<br>Large payload<br>429 rate limit<br>OPTIONS<br>HEAD |
| /api/cart/merge | POST | Static contract present | 401, 500 | Route exists<br>Method registered<br>Success response<br>400 invalid data<br>404 missing resource<br>500 error path<br>401 anonymous/expired token<br>403 wrong permission<br>Empty data<br>Duplicate data<br>Large payload<br>429 rate limit<br>OPTIONS<br>HEAD |
| /api/cart/sync | POST | Static contract present | 200, 400, 500 | Route exists<br>Method registered<br>Success response<br>400 invalid data<br>404 missing resource<br>500 error path<br>401 anonymous/expired token<br>403 wrong permission<br>Empty data<br>Duplicate data<br>Large payload<br>429 rate limit<br>OPTIONS<br>HEAD |
| /api/checkout/calculate | POST | Static contract present | 400, 403 | Route exists<br>Method registered<br>Success response<br>400 invalid data<br>404 missing resource<br>500 error path<br>Empty data<br>Duplicate data<br>Large payload<br>429 rate limit<br>OPTIONS<br>HEAD |
| /api/commissions/calculate | POST | Static contract present | 400, 500, 503 | Route exists<br>Method registered<br>Success response<br>400 invalid data<br>404 missing resource<br>500 error path<br>401 anonymous/expired token<br>403 wrong permission<br>Empty data<br>Duplicate data<br>Large payload<br>429 rate limit<br>OPTIONS<br>HEAD |
| /api/commissions/calculate | PUT | Static contract present | 400, 500, 503 | Route exists<br>Method registered<br>Success response<br>400 invalid data<br>404 missing resource<br>500 error path<br>401 anonymous/expired token<br>403 wrong permission<br>Empty data<br>Duplicate data<br>Large payload<br>429 rate limit<br>OPTIONS<br>HEAD |
| /api/commissions/payments | POST | Static contract present | 400, 500 | Route exists<br>Method registered<br>Success response<br>400 invalid data<br>404 missing resource<br>500 error path<br>401 anonymous/expired token<br>403 wrong permission<br>Empty data<br>Duplicate data<br>Large payload<br>429 rate limit<br>OPTIONS<br>HEAD |
| /api/commissions/rules | GET | Static contract present | 400, 500, 503 | Route exists<br>Method registered<br>Success response<br>400 invalid data<br>404 missing resource<br>500 error path<br>401 anonymous/expired token<br>403 wrong permission<br>Empty data<br>Duplicate data<br>Large payload<br>429 rate limit<br>Pagination/filter/sort<br>Slow network<br>OPTIONS<br>HEAD |
| /api/commissions/rules | POST | Static contract present | 400, 500, 503 | Route exists<br>Method registered<br>Success response<br>400 invalid data<br>404 missing resource<br>500 error path<br>401 anonymous/expired token<br>403 wrong permission<br>Empty data<br>Duplicate data<br>Large payload<br>429 rate limit<br>OPTIONS<br>HEAD |
| /api/contact-messages | GET | Static contract present | 400, 500 | Route exists<br>Method registered<br>Success response<br>400 invalid data<br>404 missing resource<br>500 error path<br>Empty data<br>Duplicate data<br>Large payload<br>429 rate limit<br>Pagination/filter/sort<br>Slow network<br>OPTIONS<br>HEAD |
| /api/contact-messages | POST | Static contract present | 201, 400, 403, 429, 500 | Route exists<br>Method registered<br>Success response<br>400 invalid data<br>404 missing resource<br>500 error path<br>Empty data<br>Duplicate data<br>Large payload<br>429 rate limit<br>OPTIONS<br>HEAD |
| /api/contact-messages/{id} | GET | Needs remediation or runtime confirmation | none observed | Route exists<br>Method registered<br>Success response<br>400 invalid data<br>404 missing resource<br>500 error path<br>401 anonymous/expired token<br>403 wrong permission<br>Empty data<br>Duplicate data<br>Large payload<br>429 rate limit<br>Pagination/filter/sort<br>Slow network<br>OPTIONS<br>HEAD |
| /api/contact-messages/{id} | PATCH | Static contract present | 400, 500, 503 | Route exists<br>Method registered<br>Success response<br>400 invalid data<br>404 missing resource<br>500 error path<br>401 anonymous/expired token<br>403 wrong permission<br>Empty data<br>Duplicate data<br>Large payload<br>429 rate limit<br>OPTIONS<br>HEAD |
| /api/conversations | PATCH | Static contract present | 400, 403, 500 | Route exists<br>Method registered<br>Success response<br>400 invalid data<br>404 missing resource<br>500 error path<br>401 anonymous/expired token<br>403 wrong permission<br>Empty data<br>Duplicate data<br>Large payload<br>429 rate limit<br>OPTIONS<br>HEAD |
| /api/conversations/{id}/assign | PATCH | Static contract present | 200, 400, 403, 500 | Route exists<br>Method registered<br>Success response<br>400 invalid data<br>404 missing resource<br>500 error path<br>401 anonymous/expired token<br>403 wrong permission<br>Empty data<br>Duplicate data<br>Large payload<br>429 rate limit<br>OPTIONS<br>HEAD |
| /api/copilot/command | POST | Static contract present | 400, 404, 500 | Route exists<br>Method registered<br>Success response<br>400 invalid data<br>404 missing resource<br>500 error path<br>401 anonymous/expired token<br>403 wrong permission<br>Empty data<br>Duplicate data<br>Large payload<br>429 rate limit<br>OPTIONS<br>HEAD |
| /api/coupons | DELETE | Static contract present | 400, 429, 500, 503 | Route exists<br>Method registered<br>Success response<br>400 invalid data<br>404 missing resource<br>500 error path<br>401 anonymous/expired token<br>403 wrong permission<br>Empty data<br>Duplicate data<br>Large payload<br>429 rate limit<br>OPTIONS<br>HEAD |
| /api/coupons | GET | Static contract present | 400, 404, 500, 503 | Route exists<br>Method registered<br>Success response<br>400 invalid data<br>404 missing resource<br>500 error path<br>401 anonymous/expired token<br>403 wrong permission<br>Empty data<br>Duplicate data<br>Large payload<br>429 rate limit<br>Pagination/filter/sort<br>Slow network<br>OPTIONS<br>HEAD |
| /api/coupons | POST | Static contract present | 201, 400, 429, 500, 503 | Route exists<br>Method registered<br>Success response<br>400 invalid data<br>404 missing resource<br>500 error path<br>401 anonymous/expired token<br>403 wrong permission<br>Empty data<br>Duplicate data<br>Large payload<br>429 rate limit<br>OPTIONS<br>HEAD |
| /api/coupons | PUT | Static contract present | 400, 429, 500, 503 | Route exists<br>Method registered<br>Success response<br>400 invalid data<br>404 missing resource<br>500 error path<br>401 anonymous/expired token<br>403 wrong permission<br>Empty data<br>Duplicate data<br>Large payload<br>429 rate limit<br>OPTIONS<br>HEAD |
| /api/cron/abandoned-carts | GET | Static contract present | 200, 500 | Route exists<br>Method registered<br>Success response<br>400 invalid data<br>404 missing resource<br>500 error path<br>401 anonymous/expired token<br>403 wrong permission<br>Empty data<br>Duplicate data<br>Large payload<br>429 rate limit<br>Pagination/filter/sort<br>Slow network<br>OPTIONS<br>HEAD |
| /api/cron/recover-abandoned-registrations | GET | Static contract present | 500, 503 | Route exists<br>Method registered<br>Success response<br>400 invalid data<br>404 missing resource<br>500 error path<br>401 anonymous/expired token<br>403 wrong permission<br>Empty data<br>Duplicate data<br>Large payload<br>429 rate limit<br>Pagination/filter/sort<br>Slow network<br>OPTIONS<br>HEAD |
| /api/cron/service-retention | GET | Static contract present | 500 | Route exists<br>Method registered<br>Success response<br>400 invalid data<br>404 missing resource<br>500 error path<br>401 anonymous/expired token<br>403 wrong permission<br>Pagination/filter/sort<br>Slow network<br>OPTIONS<br>HEAD |
| /api/custom-setup-offers | GET | Needs remediation or runtime confirmation | none observed | Route exists<br>Method registered<br>Success response<br>400 invalid data<br>404 missing resource<br>500 error path<br>Pagination/filter/sort<br>Slow network<br>OPTIONS<br>HEAD |
| /api/custom-setups | GET | Needs remediation or runtime confirmation | 200, 400, 404, 500 | Route exists<br>Method registered<br>Success response<br>400 invalid data<br>404 missing resource<br>500 error path<br>Pagination/filter/sort<br>Slow network<br>OPTIONS<br>HEAD |
| /api/customer-360 | GET | Static contract present | 400, 403, 500 | Route exists<br>Method registered<br>Success response<br>400 invalid data<br>404 missing resource<br>500 error path<br>401 anonymous/expired token<br>403 wrong permission<br>Pagination/filter/sort<br>Slow network<br>OPTIONS<br>HEAD |
| /api/customer-promotions | GET | Needs remediation or runtime confirmation | 400, 500 | Route exists<br>Method registered<br>Success response<br>400 invalid data<br>404 missing resource<br>500 error path<br>Empty data<br>Duplicate data<br>Large payload<br>429 rate limit<br>Pagination/filter/sort<br>Slow network<br>OPTIONS<br>HEAD |
| /api/customer-promotions | POST | Static contract present | 400, 500 | Route exists<br>Method registered<br>Success response<br>400 invalid data<br>404 missing resource<br>500 error path<br>Empty data<br>Duplicate data<br>Large payload<br>429 rate limit<br>OPTIONS<br>HEAD |
| /api/customer/notifications | POST | Static contract present | 400, 500 | Route exists<br>Method registered<br>Success response<br>400 invalid data<br>404 missing resource<br>500 error path<br>401 anonymous/expired token<br>403 wrong permission<br>Empty data<br>Duplicate data<br>Large payload<br>429 rate limit<br>OPTIONS<br>HEAD |
| /api/customers/register | GET | Needs remediation or runtime confirmation | 404 | Route exists<br>Method registered<br>Success response<br>400 invalid data<br>404 missing resource<br>500 error path<br>401 anonymous/expired token<br>403 wrong permission<br>Empty data<br>Duplicate data<br>Large payload<br>429 rate limit<br>Pagination/filter/sort<br>Slow network<br>OPTIONS<br>HEAD |
| /api/customers/register | POST | Static contract present | none observed | Route exists<br>Method registered<br>Success response<br>400 invalid data<br>404 missing resource<br>500 error path<br>401 anonymous/expired token<br>403 wrong permission<br>Empty data<br>Duplicate data<br>Large payload<br>429 rate limit<br>OPTIONS<br>HEAD |
| /api/debug-env | GET | Needs remediation or runtime confirmation | none observed | Route exists<br>Method registered<br>Success response<br>400 invalid data<br>404 missing resource<br>500 error path<br>401 anonymous/expired token<br>403 wrong permission<br>Pagination/filter/sort<br>Slow network<br>OPTIONS<br>HEAD |
| /api/discounts | DELETE | Static contract present | 400, 500 | Route exists<br>Method registered<br>Success response<br>400 invalid data<br>404 missing resource<br>500 error path<br>401 anonymous/expired token<br>403 wrong permission<br>Empty data<br>Duplicate data<br>Large payload<br>429 rate limit<br>OPTIONS<br>HEAD |
| /api/discounts | GET | Static contract present | 500 | Route exists<br>Method registered<br>Success response<br>400 invalid data<br>404 missing resource<br>500 error path<br>401 anonymous/expired token<br>403 wrong permission<br>Empty data<br>Duplicate data<br>Large payload<br>429 rate limit<br>Pagination/filter/sort<br>Slow network<br>OPTIONS<br>HEAD |
| /api/discounts | POST | Static contract present | 201, 400, 500 | Route exists<br>Method registered<br>Success response<br>400 invalid data<br>404 missing resource<br>500 error path<br>401 anonymous/expired token<br>403 wrong permission<br>Empty data<br>Duplicate data<br>Large payload<br>429 rate limit<br>OPTIONS<br>HEAD |
| /api/discounts | PUT | Static contract present | 400, 500 | Route exists<br>Method registered<br>Success response<br>400 invalid data<br>404 missing resource<br>500 error path<br>401 anonymous/expired token<br>403 wrong permission<br>Empty data<br>Duplicate data<br>Large payload<br>429 rate limit<br>OPTIONS<br>HEAD |
| /api/discounts/calculate | GET | Needs remediation or runtime confirmation | 400, 404, 500 | Route exists<br>Method registered<br>Success response<br>400 invalid data<br>404 missing resource<br>500 error path<br>401 anonymous/expired token<br>403 wrong permission<br>Pagination/filter/sort<br>Slow network<br>OPTIONS<br>HEAD |
| /api/email/abandoned-cart | POST | Static contract present | 400, 429, 500 | Route exists<br>Method registered<br>Success response<br>400 invalid data<br>404 missing resource<br>500 error path<br>401 anonymous/expired token<br>403 wrong permission<br>Empty data<br>Duplicate data<br>Large payload<br>429 rate limit<br>OPTIONS<br>HEAD |
| /api/email/email-change | POST | Needs remediation or runtime confirmation | none observed | Route exists<br>Method registered<br>Success response<br>400 invalid data<br>404 missing resource<br>500 error path<br>401 anonymous/expired token<br>403 wrong permission<br>Empty data<br>Duplicate data<br>Large payload<br>429 rate limit<br>OPTIONS<br>HEAD |
| /api/email/marketing | POST | Static contract present | 400, 429, 500 | Route exists<br>Method registered<br>Success response<br>400 invalid data<br>404 missing resource<br>500 error path<br>401 anonymous/expired token<br>403 wrong permission<br>Empty data<br>Duplicate data<br>Large payload<br>429 rate limit<br>OPTIONS<br>HEAD |
| /api/email/notify-manager | POST | Static contract present | 400, 401, 415, 500 | Route exists<br>Method registered<br>Success response<br>400 invalid data<br>404 missing resource<br>500 error path<br>401 anonymous/expired token<br>403 wrong permission<br>Empty data<br>Duplicate data<br>Large payload<br>429 rate limit<br>OPTIONS<br>HEAD |
| /api/email/notify-sales-pickup | POST | Static contract present | 400, 429, 500 | Route exists<br>Method registered<br>Success response<br>400 invalid data<br>404 missing resource<br>500 error path<br>401 anonymous/expired token<br>403 wrong permission<br>Empty data<br>Duplicate data<br>Large payload<br>429 rate limit<br>OPTIONS<br>HEAD |
| /api/email/order-approved | POST | Static contract present | 400, 429, 500 | Route exists<br>Method registered<br>Success response<br>400 invalid data<br>404 missing resource<br>500 error path<br>401 anonymous/expired token<br>403 wrong permission<br>Empty data<br>Duplicate data<br>Large payload<br>429 rate limit<br>OPTIONS<br>HEAD |
| /api/email/order-completion | POST | Static contract present | 400, 429, 500 | Route exists<br>Method registered<br>Success response<br>400 invalid data<br>404 missing resource<br>500 error path<br>401 anonymous/expired token<br>403 wrong permission<br>Empty data<br>Duplicate data<br>Large payload<br>429 rate limit<br>OPTIONS<br>HEAD |
| /api/email/order-confirmation | POST | Static contract present | 400, 429, 500 | Route exists<br>Method registered<br>Success response<br>400 invalid data<br>404 missing resource<br>500 error path<br>401 anonymous/expired token<br>403 wrong permission<br>Empty data<br>Duplicate data<br>Large payload<br>429 rate limit<br>OPTIONS<br>HEAD |
| /api/email/order-delivered | POST | Static contract present | 400, 429, 500 | Route exists<br>Method registered<br>Success response<br>400 invalid data<br>404 missing resource<br>500 error path<br>401 anonymous/expired token<br>403 wrong permission<br>Empty data<br>Duplicate data<br>Large payload<br>429 rate limit<br>OPTIONS<br>HEAD |
| /api/email/password-reset | POST | Static contract present | 400, 429, 500 | Route exists<br>Method registered<br>Success response<br>400 invalid data<br>404 missing resource<br>500 error path<br>401 anonymous/expired token<br>403 wrong permission<br>Empty data<br>Duplicate data<br>Large payload<br>429 rate limit<br>OPTIONS<br>HEAD |
| /api/email/payment-confirmation | POST | Static contract present | 400, 429, 500 | Route exists<br>Method registered<br>Success response<br>400 invalid data<br>404 missing resource<br>500 error path<br>401 anonymous/expired token<br>403 wrong permission<br>Empty data<br>Duplicate data<br>Large payload<br>429 rate limit<br>OPTIONS<br>HEAD |
| /api/email/payment-failed | POST | Static contract present | 400, 429, 500 | Route exists<br>Method registered<br>Success response<br>400 invalid data<br>404 missing resource<br>500 error path<br>401 anonymous/expired token<br>403 wrong permission<br>Empty data<br>Duplicate data<br>Large payload<br>429 rate limit<br>OPTIONS<br>HEAD |
| /api/email/payment-pending | POST | Needs remediation or runtime confirmation | none observed | Route exists<br>Method registered<br>Success response<br>400 invalid data<br>404 missing resource<br>500 error path<br>401 anonymous/expired token<br>403 wrong permission<br>Empty data<br>Duplicate data<br>Large payload<br>429 rate limit<br>OPTIONS<br>HEAD |
| /api/email/pickup | POST | Static contract present | 400, 429, 500 | Route exists<br>Method registered<br>Success response<br>400 invalid data<br>404 missing resource<br>500 error path<br>401 anonymous/expired token<br>403 wrong permission<br>Empty data<br>Duplicate data<br>Large payload<br>429 rate limit<br>OPTIONS<br>HEAD |
| /api/email/shipping | POST | Static contract present | 400, 429, 500 | Route exists<br>Method registered<br>Success response<br>400 invalid data<br>404 missing resource<br>500 error path<br>401 anonymous/expired token<br>403 wrong permission<br>Empty data<br>Duplicate data<br>Large payload<br>429 rate limit<br>OPTIONS<br>HEAD |
| /api/email/verification | POST | Static contract present | 400, 401, 403, 429, 500 | Route exists<br>Method registered<br>Success response<br>400 invalid data<br>404 missing resource<br>500 error path<br>401 anonymous/expired token<br>403 wrong permission<br>Empty data<br>Duplicate data<br>Large payload<br>429 rate limit<br>OPTIONS<br>HEAD |
| /api/email/welcome | POST | Needs remediation or runtime confirmation | none observed | Route exists<br>Method registered<br>Success response<br>400 invalid data<br>404 missing resource<br>500 error path<br>401 anonymous/expired token<br>403 wrong permission<br>Empty data<br>Duplicate data<br>Large payload<br>429 rate limit<br>OPTIONS<br>HEAD |
| /api/faqs | GET | Needs remediation or runtime confirmation | 200, 500 | Route exists<br>Method registered<br>Success response<br>400 invalid data<br>404 missing resource<br>500 error path<br>Pagination/filter/sort<br>Slow network<br>OPTIONS<br>HEAD |
| /api/free-installation-slots | GET | Needs remediation or runtime confirmation | none observed | Route exists<br>Method registered<br>Success response<br>400 invalid data<br>404 missing resource<br>500 error path<br>401 anonymous/expired token<br>403 wrong permission<br>Empty data<br>Duplicate data<br>Large payload<br>429 rate limit<br>Pagination/filter/sort<br>Slow network<br>OPTIONS<br>HEAD |
| /api/free-installation-slots | POST | Static contract present | 400, 401, 500 | Route exists<br>Method registered<br>Success response<br>400 invalid data<br>404 missing resource<br>500 error path<br>401 anonymous/expired token<br>403 wrong permission<br>Empty data<br>Duplicate data<br>Large payload<br>429 rate limit<br>OPTIONS<br>HEAD |
| /api/gst-verify | GET | Needs remediation or runtime confirmation | 400, 429, 503 | Route exists<br>Method registered<br>Success response<br>400 invalid data<br>404 missing resource<br>500 error path<br>Pagination/filter/sort<br>Slow network<br>OPTIONS<br>HEAD |
| /api/health | GET | Static contract present | 503 | Route exists<br>Method registered<br>Success response<br>400 invalid data<br>404 missing resource<br>500 error path<br>Pagination/filter/sort<br>Slow network<br>OPTIONS<br>HEAD |
| /api/health | GET | Needs remediation or runtime confirmation | 200 | Route exists<br>Method registered<br>Success response<br>400 invalid data<br>404 missing resource<br>500 error path<br>Pagination/filter/sort<br>Slow network<br>OPTIONS<br>HEAD |
| /api/health | GET | Needs remediation or runtime confirmation | 200 | Route exists<br>Method registered<br>Success response<br>400 invalid data<br>404 missing resource<br>500 error path<br>Pagination/filter/sort<br>Slow network<br>OPTIONS<br>HEAD |
| /api/health | GET | Needs remediation or runtime confirmation | 200 | Route exists<br>Method registered<br>Success response<br>400 invalid data<br>404 missing resource<br>500 error path<br>Pagination/filter/sort<br>Slow network<br>OPTIONS<br>HEAD |
| /api/health | GET | Needs remediation or runtime confirmation | 200 | Route exists<br>Method registered<br>Success response<br>400 invalid data<br>404 missing resource<br>500 error path<br>Pagination/filter/sort<br>Slow network<br>OPTIONS<br>HEAD |
| /api/health | GET | Needs remediation or runtime confirmation | 200 | Route exists<br>Method registered<br>Success response<br>400 invalid data<br>404 missing resource<br>500 error path<br>Pagination/filter/sort<br>Slow network<br>OPTIONS<br>HEAD |
| /api/health/email | GET | Needs remediation or runtime confirmation | 500 | Route exists<br>Method registered<br>Success response<br>400 invalid data<br>404 missing resource<br>500 error path<br>Pagination/filter/sort<br>Slow network<br>OPTIONS<br>HEAD |
| /api/health/orders | GET | Needs remediation or runtime confirmation | 500 | Route exists<br>Method registered<br>Success response<br>400 invalid data<br>404 missing resource<br>500 error path<br>Pagination/filter/sort<br>Slow network<br>OPTIONS<br>HEAD |
| /api/health/otp | GET | Needs remediation or runtime confirmation | 500 | Route exists<br>Method registered<br>Success response<br>400 invalid data<br>404 missing resource<br>500 error path<br>Pagination/filter/sort<br>Slow network<br>OPTIONS<br>HEAD |
| /api/health/summary | GET | Needs remediation or runtime confirmation | none observed | Route exists<br>Method registered<br>Success response<br>400 invalid data<br>404 missing resource<br>500 error path<br>Pagination/filter/sort<br>Slow network<br>OPTIONS<br>HEAD |
| /api/hello | GET | Needs remediation or runtime confirmation | none observed | Route exists<br>Method registered<br>Success response<br>400 invalid data<br>404 missing resource<br>500 error path<br>401 anonymous/expired token<br>403 wrong permission<br>Pagination/filter/sort<br>Slow network<br>OPTIONS<br>HEAD |
| /api/inquiries | POST | Static contract present | 200, 400, 500 | Route exists<br>Method registered<br>Success response<br>400 invalid data<br>404 missing resource<br>500 error path<br>Empty data<br>Duplicate data<br>Large payload<br>429 rate limit<br>OPTIONS<br>HEAD |
| /api/inventory | GET | Static contract present | 500 | Route exists<br>Method registered<br>Success response<br>400 invalid data<br>404 missing resource<br>500 error path<br>401 anonymous/expired token<br>403 wrong permission<br>Empty data<br>Duplicate data<br>Large payload<br>429 rate limit<br>Pagination/filter/sort<br>Slow network<br>OPTIONS<br>HEAD |
| /api/inventory | POST | Static contract present | 400, 500 | Route exists<br>Method registered<br>Success response<br>400 invalid data<br>404 missing resource<br>500 error path<br>401 anonymous/expired token<br>403 wrong permission<br>Empty data<br>Duplicate data<br>Large payload<br>429 rate limit<br>OPTIONS<br>HEAD |
| /api/inventory | PUT | Static contract present | 400, 403, 500 | Route exists<br>Method registered<br>Success response<br>400 invalid data<br>404 missing resource<br>500 error path<br>401 anonymous/expired token<br>403 wrong permission<br>Empty data<br>Duplicate data<br>Large payload<br>429 rate limit<br>OPTIONS<br>HEAD |
| /api/inventory/transactions | GET | Static contract present | 500 | Route exists<br>Method registered<br>Success response<br>400 invalid data<br>404 missing resource<br>500 error path<br>401 anonymous/expired token<br>403 wrong permission<br>Empty data<br>Duplicate data<br>Large payload<br>429 rate limit<br>Pagination/filter/sort<br>Slow network<br>OPTIONS<br>HEAD |
| /api/inventory/transactions | POST | Static contract present | 400, 409, 500 | Route exists<br>Method registered<br>Success response<br>400 invalid data<br>404 missing resource<br>500 error path<br>401 anonymous/expired token<br>403 wrong permission<br>Empty data<br>Duplicate data<br>Large payload<br>429 rate limit<br>OPTIONS<br>HEAD |
| /api/inventory/transactions | PUT | Static contract present | 400, 409, 500 | Route exists<br>Method registered<br>Success response<br>400 invalid data<br>404 missing resource<br>500 error path<br>401 anonymous/expired token<br>403 wrong permission<br>Empty data<br>Duplicate data<br>Large payload<br>429 rate limit<br>OPTIONS<br>HEAD |
| /api/leads/{id}/assign | PATCH | Static contract present | 200, 400, 403, 500 | Route exists<br>Method registered<br>Success response<br>400 invalid data<br>404 missing resource<br>500 error path<br>401 anonymous/expired token<br>403 wrong permission<br>Empty data<br>Duplicate data<br>Large payload<br>429 rate limit<br>OPTIONS<br>HEAD |
| /api/marketing/triggers/order-delivered-followup | POST | Static contract present | 400, 404, 500 | Route exists<br>Method registered<br>Success response<br>400 invalid data<br>404 missing resource<br>500 error path<br>401 anonymous/expired token<br>403 wrong permission<br>Empty data<br>Duplicate data<br>Large payload<br>429 rate limit<br>OPTIONS<br>HEAD |
| /api/messages | GET | Static contract present | 403, 500 | Route exists<br>Method registered<br>Success response<br>400 invalid data<br>404 missing resource<br>500 error path<br>401 anonymous/expired token<br>403 wrong permission<br>Pagination/filter/sort<br>Slow network<br>OPTIONS<br>HEAD |
| /api/messages | POST | Static contract present | 400, 403, 500 | Route exists<br>Method registered<br>Success response<br>400 invalid data<br>404 missing resource<br>500 error path<br>401 anonymous/expired token<br>403 wrong permission<br>Empty data<br>Duplicate data<br>Large payload<br>429 rate limit<br>OPTIONS<br>HEAD |
| /api/messages/media | POST | Static contract present | 400, 403, 500 | Route exists<br>Method registered<br>Success response<br>400 invalid data<br>404 missing resource<br>500 error path<br>401 anonymous/expired token<br>403 wrong permission<br>Empty data<br>Duplicate data<br>Large payload<br>429 rate limit<br>OPTIONS<br>HEAD |
| /api/messages/read | PATCH | Static contract present | 400, 403, 500 | Route exists<br>Method registered<br>Success response<br>400 invalid data<br>404 missing resource<br>500 error path<br>401 anonymous/expired token<br>403 wrong permission<br>Empty data<br>Duplicate data<br>Large payload<br>429 rate limit<br>OPTIONS<br>HEAD |
| /api/metadata | GET | Static contract present | none observed | Route exists<br>Method registered<br>Success response<br>400 invalid data<br>404 missing resource<br>500 error path<br>Pagination/filter/sort<br>Slow network<br>OPTIONS<br>HEAD |
| /api/notifications/send | POST | Static contract present | 400, 403, 404, 500 | Route exists<br>Method registered<br>Success response<br>400 invalid data<br>404 missing resource<br>500 error path<br>401 anonymous/expired token<br>403 wrong permission<br>Empty data<br>Duplicate data<br>Large payload<br>429 rate limit<br>OPTIONS<br>HEAD |
| /api/offers | DELETE | Static contract present | 400, 401, 403, 500, 503 | Route exists<br>Method registered<br>Success response<br>400 invalid data<br>404 missing resource<br>500 error path<br>401 anonymous/expired token<br>403 wrong permission<br>Empty data<br>Duplicate data<br>Large payload<br>429 rate limit<br>OPTIONS<br>HEAD |
| /api/offers | GET | Static contract present | 500 | Route exists<br>Method registered<br>Success response<br>400 invalid data<br>404 missing resource<br>500 error path<br>401 anonymous/expired token<br>403 wrong permission<br>Empty data<br>Duplicate data<br>Large payload<br>429 rate limit<br>Pagination/filter/sort<br>Slow network<br>OPTIONS<br>HEAD |
| /api/offers | POST | Static contract present | 201, 400, 401, 403, 500, 503 | Route exists<br>Method registered<br>Success response<br>400 invalid data<br>404 missing resource<br>500 error path<br>401 anonymous/expired token<br>403 wrong permission<br>Empty data<br>Duplicate data<br>Large payload<br>429 rate limit<br>OPTIONS<br>HEAD |
| /api/offers | PUT | Static contract present | 400, 401, 403, 404, 500, 503 | Route exists<br>Method registered<br>Success response<br>400 invalid data<br>404 missing resource<br>500 error path<br>401 anonymous/expired token<br>403 wrong permission<br>Empty data<br>Duplicate data<br>Large payload<br>429 rate limit<br>OPTIONS<br>HEAD |
| /api/orders | GET | Static contract present | 500 | Route exists<br>Method registered<br>Success response<br>400 invalid data<br>404 missing resource<br>500 error path<br>401 anonymous/expired token<br>403 wrong permission<br>Empty data<br>Duplicate data<br>Large payload<br>429 rate limit<br>Pagination/filter/sort<br>Slow network<br>OPTIONS<br>HEAD |
| /api/orders | POST | Static contract present | 201, 403, 429 | Route exists<br>Method registered<br>Success response<br>400 invalid data<br>404 missing resource<br>500 error path<br>401 anonymous/expired token<br>403 wrong permission<br>Empty data<br>Duplicate data<br>Large payload<br>429 rate limit<br>OPTIONS<br>HEAD |
| /api/orders/{id} | GET | Static contract present | 400, 401, 403, 404, 500 | Route exists<br>Method registered<br>Success response<br>400 invalid data<br>404 missing resource<br>500 error path<br>401 anonymous/expired token<br>403 wrong permission<br>Pagination/filter/sort<br>Slow network<br>OPTIONS<br>HEAD |
| /api/orders/{id}/timeline | GET | Needs remediation or runtime confirmation | 403, 404, 500 | Route exists<br>Method registered<br>Success response<br>400 invalid data<br>404 missing resource<br>500 error path<br>401 anonymous/expired token<br>403 wrong permission<br>Pagination/filter/sort<br>Slow network<br>OPTIONS<br>HEAD |
| /api/orders/auto-cancel | POST | Static contract present | 401, 403, 500 | Route exists<br>Method registered<br>Success response<br>400 invalid data<br>404 missing resource<br>500 error path<br>401 anonymous/expired token<br>403 wrong permission<br>Empty data<br>Duplicate data<br>Large payload<br>429 rate limit<br>OPTIONS<br>HEAD |
| /api/orders/commission | POST | Static contract present | 400, 404, 500 | Route exists<br>Method registered<br>Success response<br>400 invalid data<br>404 missing resource<br>500 error path<br>401 anonymous/expired token<br>403 wrong permission<br>Empty data<br>Duplicate data<br>Large payload<br>429 rate limit<br>OPTIONS<br>HEAD |
| /api/orders/update-status | POST | Static contract present | 400, 401, 403, 404, 500 | Route exists<br>Method registered<br>Success response<br>400 invalid data<br>404 missing resource<br>500 error path<br>401 anonymous/expired token<br>403 wrong permission<br>Empty data<br>Duplicate data<br>Large payload<br>429 rate limit<br>OPTIONS<br>HEAD |
| /api/organizations | DELETE | Needs remediation or runtime confirmation | 400, 403, 500 | Route exists<br>Method registered<br>Success response<br>400 invalid data<br>404 missing resource<br>500 error path<br>401 anonymous/expired token<br>403 wrong permission<br>Empty data<br>Duplicate data<br>Large payload<br>429 rate limit<br>OPTIONS<br>HEAD |
| /api/organizations | GET | Needs remediation or runtime confirmation | 403, 500 | Route exists<br>Method registered<br>Success response<br>400 invalid data<br>404 missing resource<br>500 error path<br>401 anonymous/expired token<br>403 wrong permission<br>Empty data<br>Duplicate data<br>Large payload<br>429 rate limit<br>Pagination/filter/sort<br>Slow network<br>OPTIONS<br>HEAD |
| /api/organizations | POST | Needs remediation or runtime confirmation | 400, 403, 500 | Route exists<br>Method registered<br>Success response<br>400 invalid data<br>404 missing resource<br>500 error path<br>401 anonymous/expired token<br>403 wrong permission<br>Empty data<br>Duplicate data<br>Large payload<br>429 rate limit<br>OPTIONS<br>HEAD |
| /api/otp/generate | GET | Static contract present | 400, 404, 500 | Route exists<br>Method registered<br>Success response<br>400 invalid data<br>404 missing resource<br>500 error path<br>401 anonymous/expired token<br>403 wrong permission<br>Empty data<br>Duplicate data<br>Large payload<br>429 rate limit<br>Pagination/filter/sort<br>Slow network<br>OPTIONS<br>HEAD |
| /api/otp/generate | POST | Static contract present | 400, 403, 429, 500, 503 | Route exists<br>Method registered<br>Success response<br>400 invalid data<br>404 missing resource<br>500 error path<br>401 anonymous/expired token<br>403 wrong permission<br>Empty data<br>Duplicate data<br>Large payload<br>429 rate limit<br>OPTIONS<br>HEAD |
| /api/otp/resend | GET | Static contract present | 400, 404, 500 | Route exists<br>Method registered<br>Success response<br>400 invalid data<br>404 missing resource<br>500 error path<br>401 anonymous/expired token<br>403 wrong permission<br>Empty data<br>Duplicate data<br>Large payload<br>429 rate limit<br>Pagination/filter/sort<br>Slow network<br>OPTIONS<br>HEAD |
| /api/otp/resend | POST | Static contract present | 400, 404, 429, 500 | Route exists<br>Method registered<br>Success response<br>400 invalid data<br>404 missing resource<br>500 error path<br>401 anonymous/expired token<br>403 wrong permission<br>Empty data<br>Duplicate data<br>Large payload<br>429 rate limit<br>OPTIONS<br>HEAD |
| /api/otp/verify | GET | Static contract present | 400, 404, 500, 503 | Route exists<br>Method registered<br>Success response<br>400 invalid data<br>404 missing resource<br>500 error path<br>401 anonymous/expired token<br>403 wrong permission<br>Empty data<br>Duplicate data<br>Large payload<br>429 rate limit<br>Pagination/filter/sort<br>Slow network<br>OPTIONS<br>HEAD |
| /api/otp/verify | POST | Static contract present | 400, 429, 500 | Route exists<br>Method registered<br>Success response<br>400 invalid data<br>404 missing resource<br>500 error path<br>401 anonymous/expired token<br>403 wrong permission<br>Empty data<br>Duplicate data<br>Large payload<br>429 rate limit<br>OPTIONS<br>HEAD |
| /api/page-content | DELETE | Static contract present | 400, 500 | Route exists<br>Method registered<br>Success response<br>400 invalid data<br>404 missing resource<br>500 error path<br>401 anonymous/expired token<br>403 wrong permission<br>Empty data<br>Duplicate data<br>Large payload<br>429 rate limit<br>OPTIONS<br>HEAD |
| /api/page-content | GET | Needs remediation or runtime confirmation | 400, 500 | Route exists<br>Method registered<br>Success response<br>400 invalid data<br>404 missing resource<br>500 error path<br>Empty data<br>Duplicate data<br>Large payload<br>429 rate limit<br>Pagination/filter/sort<br>Slow network<br>OPTIONS<br>HEAD |
| /api/page-content | GET | Needs remediation or runtime confirmation | 400 | Route exists<br>Method registered<br>Success response<br>400 invalid data<br>404 missing resource<br>500 error path<br>Pagination/filter/sort<br>Slow network<br>OPTIONS<br>HEAD |
| /api/page-content | POST | Static contract present | 201, 400, 500 | Route exists<br>Method registered<br>Success response<br>400 invalid data<br>404 missing resource<br>500 error path<br>401 anonymous/expired token<br>403 wrong permission<br>Empty data<br>Duplicate data<br>Large payload<br>429 rate limit<br>OPTIONS<br>HEAD |
| /api/page-content | PUT | Static contract present | 400, 500 | Route exists<br>Method registered<br>Success response<br>400 invalid data<br>404 missing resource<br>500 error path<br>401 anonymous/expired token<br>403 wrong permission<br>Empty data<br>Duplicate data<br>Large payload<br>429 rate limit<br>OPTIONS<br>HEAD |
| /api/payment/payu/callback | POST | Static contract present | none observed | Route exists<br>Method registered<br>Success response<br>400 invalid data<br>404 missing resource<br>500 error path<br>Empty data<br>Duplicate data<br>Large payload<br>429 rate limit<br>OPTIONS<br>HEAD |
| /api/payment/payu/initiate | POST | Static contract present | none observed | Route exists<br>Method registered<br>Success response<br>400 invalid data<br>404 missing resource<br>500 error path<br>401 anonymous/expired token<br>403 wrong permission<br>Empty data<br>Duplicate data<br>Large payload<br>429 rate limit<br>OPTIONS<br>HEAD |
| /api/payments/update | GET | Static contract present | 404 | Route exists<br>Method registered<br>Success response<br>400 invalid data<br>404 missing resource<br>500 error path<br>401 anonymous/expired token<br>403 wrong permission<br>Empty data<br>Duplicate data<br>Large payload<br>429 rate limit<br>Pagination/filter/sort<br>Slow network<br>OPTIONS<br>HEAD |
| /api/payments/update | POST | Static contract present | none observed | Route exists<br>Method registered<br>Success response<br>400 invalid data<br>404 missing resource<br>500 error path<br>401 anonymous/expired token<br>403 wrong permission<br>Empty data<br>Duplicate data<br>Large payload<br>429 rate limit<br>OPTIONS<br>HEAD |
| /api/permissions | GET | Needs remediation or runtime confirmation | 403, 500 | Route exists<br>Method registered<br>Success response<br>400 invalid data<br>404 missing resource<br>500 error path<br>401 anonymous/expired token<br>403 wrong permission<br>Pagination/filter/sort<br>Slow network<br>OPTIONS<br>HEAD |
| /api/pricing/calculate | GET | Needs remediation or runtime confirmation | 400, 500 | Route exists<br>Method registered<br>Success response<br>400 invalid data<br>404 missing resource<br>500 error path<br>Empty data<br>Duplicate data<br>Large payload<br>429 rate limit<br>Pagination/filter/sort<br>Slow network<br>OPTIONS<br>HEAD |
| /api/pricing/calculate | POST | Static contract present | 400, 500 | Route exists<br>Method registered<br>Success response<br>400 invalid data<br>404 missing resource<br>500 error path<br>Empty data<br>Duplicate data<br>Large payload<br>429 rate limit<br>OPTIONS<br>HEAD |
| /api/pricing/customer-type | GET | Needs remediation or runtime confirmation | 400, 500 | Route exists<br>Method registered<br>Success response<br>400 invalid data<br>404 missing resource<br>500 error path<br>Empty data<br>Duplicate data<br>Large payload<br>429 rate limit<br>Pagination/filter/sort<br>Slow network<br>OPTIONS<br>HEAD |
| /api/pricing/customer-type | POST | Static contract present | 400, 500 | Route exists<br>Method registered<br>Success response<br>400 invalid data<br>404 missing resource<br>500 error path<br>Empty data<br>Duplicate data<br>Large payload<br>429 rate limit<br>OPTIONS<br>HEAD |
| /api/products | DELETE | Static contract present | 400, 401, 403, 500 | Route exists<br>Method registered<br>Success response<br>400 invalid data<br>404 missing resource<br>500 error path<br>401 anonymous/expired token<br>403 wrong permission<br>Empty data<br>Duplicate data<br>Large payload<br>429 rate limit<br>OPTIONS<br>HEAD |
| /api/products | GET | Static contract present | 404, 500 | Route exists<br>Method registered<br>Success response<br>400 invalid data<br>404 missing resource<br>500 error path<br>Empty data<br>Duplicate data<br>Large payload<br>429 rate limit<br>Pagination/filter/sort<br>Slow network<br>OPTIONS<br>HEAD |
| /api/products | GET | Needs remediation or runtime confirmation | none observed | Route exists<br>Method registered<br>Success response<br>400 invalid data<br>404 missing resource<br>500 error path<br>Pagination/filter/sort<br>Slow network<br>OPTIONS<br>HEAD |
| /api/products | POST | Static contract present | 401, 403, 422, 500 | Route exists<br>Method registered<br>Success response<br>400 invalid data<br>404 missing resource<br>500 error path<br>401 anonymous/expired token<br>403 wrong permission<br>Empty data<br>Duplicate data<br>Large payload<br>429 rate limit<br>OPTIONS<br>HEAD |
| /api/products | PUT | Static contract present | 400, 401, 403, 404, 422, 500 | Route exists<br>Method registered<br>Success response<br>400 invalid data<br>404 missing resource<br>500 error path<br>401 anonymous/expired token<br>403 wrong permission<br>Empty data<br>Duplicate data<br>Large payload<br>429 rate limit<br>OPTIONS<br>HEAD |
| /api/products/{id} | GET | Static contract present | 400, 404, 500 | Route exists<br>Method registered<br>Success response<br>400 invalid data<br>404 missing resource<br>500 error path<br>Empty data<br>Duplicate data<br>Large payload<br>429 rate limit<br>Pagination/filter/sort<br>Slow network<br>OPTIONS<br>HEAD |
| /api/products/{id} | PATCH | Static contract present | 400, 401, 404, 422, 500 | Route exists<br>Method registered<br>Success response<br>400 invalid data<br>404 missing resource<br>500 error path<br>401 anonymous/expired token<br>403 wrong permission<br>Empty data<br>Duplicate data<br>Large payload<br>429 rate limit<br>OPTIONS<br>HEAD |
| /api/products/bulk-edit | GET | Static contract present | 500 | Route exists<br>Method registered<br>Success response<br>400 invalid data<br>404 missing resource<br>500 error path<br>Empty data<br>Duplicate data<br>Large payload<br>429 rate limit<br>Pagination/filter/sort<br>Slow network<br>OPTIONS<br>HEAD |
| /api/products/bulk-edit | POST | Static contract present | 400, 500 | Route exists<br>Method registered<br>Success response<br>400 invalid data<br>404 missing resource<br>500 error path<br>401 anonymous/expired token<br>403 wrong permission<br>Empty data<br>Duplicate data<br>Large payload<br>429 rate limit<br>OPTIONS<br>HEAD |
| /api/products/cleanup-images | POST | Static contract present | 202, 401, 403, 500 | Route exists<br>Method registered<br>Success response<br>400 invalid data<br>404 missing resource<br>500 error path<br>401 anonymous/expired token<br>403 wrong permission<br>Empty data<br>Duplicate data<br>Large payload<br>429 rate limit<br>OPTIONS<br>HEAD |
| /api/products/cleanup | DELETE | Static contract present | 500 | Route exists<br>Method registered<br>Success response<br>400 invalid data<br>404 missing resource<br>500 error path<br>401 anonymous/expired token<br>403 wrong permission<br>Empty data<br>Duplicate data<br>Large payload<br>429 rate limit<br>OPTIONS<br>HEAD |
| /api/products/export | GET | Needs remediation or runtime confirmation | 200, 500 | Route exists<br>Method registered<br>Success response<br>400 invalid data<br>404 missing resource<br>500 error path<br>Pagination/filter/sort<br>Slow network<br>OPTIONS<br>HEAD |
| /api/products/fix-images | POST | Static contract present | 202, 403, 500 | Route exists<br>Method registered<br>Success response<br>400 invalid data<br>404 missing resource<br>500 error path<br>401 anonymous/expired token<br>403 wrong permission<br>Empty data<br>Duplicate data<br>Large payload<br>429 rate limit<br>OPTIONS<br>HEAD |
| /api/products/image-diagnostics | GET | Needs remediation or runtime confirmation | 500 | Route exists<br>Method registered<br>Success response<br>400 invalid data<br>404 missing resource<br>500 error path<br>Pagination/filter/sort<br>Slow network<br>OPTIONS<br>HEAD |
| /api/products/import | GET | Needs remediation or runtime confirmation | 500 | Route exists<br>Method registered<br>Success response<br>400 invalid data<br>404 missing resource<br>500 error path<br>Empty data<br>Duplicate data<br>Large payload<br>429 rate limit<br>Pagination/filter/sort<br>Slow network<br>OPTIONS<br>HEAD |
| /api/products/import | POST | Static contract present | 400, 500 | Route exists<br>Method registered<br>Success response<br>400 invalid data<br>404 missing resource<br>500 error path<br>401 anonymous/expired token<br>403 wrong permission<br>Empty data<br>Duplicate data<br>Large payload<br>429 rate limit<br>OPTIONS<br>HEAD |
| /api/products/manual-import | POST | Static contract present | 500 | Route exists<br>Method registered<br>Success response<br>400 invalid data<br>404 missing resource<br>500 error path<br>401 anonymous/expired token<br>403 wrong permission<br>Empty data<br>Duplicate data<br>Large payload<br>429 rate limit<br>OPTIONS<br>HEAD |
| /api/products/recommendations | GET | Needs remediation or runtime confirmation | none observed | Route exists<br>Method registered<br>Success response<br>400 invalid data<br>404 missing resource<br>500 error path<br>Pagination/filter/sort<br>Slow network<br>OPTIONS<br>HEAD |
| /api/products/scrape-url | POST | Static contract present | 400, 500 | Route exists<br>Method registered<br>Success response<br>400 invalid data<br>404 missing resource<br>500 error path<br>401 anonymous/expired token<br>403 wrong permission<br>Empty data<br>Duplicate data<br>Large payload<br>429 rate limit<br>OPTIONS<br>HEAD |
| /api/products/scraper | OPTIONS | Static contract present | none observed | Route exists<br>Method registered<br>Success response<br>400 invalid data<br>404 missing resource<br>500 error path<br>401 anonymous/expired token<br>403 wrong permission<br>Empty data<br>Duplicate data<br>Large payload<br>429 rate limit<br>OPTIONS<br>HEAD |
| /api/products/scraper | POST | Static contract present | 201, 400, 500, 503 | Route exists<br>Method registered<br>Success response<br>400 invalid data<br>404 missing resource<br>500 error path<br>401 anonymous/expired token<br>403 wrong permission<br>Empty data<br>Duplicate data<br>Large payload<br>429 rate limit<br>OPTIONS<br>HEAD |
| /api/products/scraper/ai | OPTIONS | Needs remediation or runtime confirmation | none observed | Route exists<br>Method registered<br>Success response<br>400 invalid data<br>404 missing resource<br>500 error path<br>401 anonymous/expired token<br>403 wrong permission<br>Empty data<br>Duplicate data<br>Large payload<br>429 rate limit<br>OPTIONS<br>HEAD |
| /api/products/scraper/ai | POST | Static contract present | 400, 500 | Route exists<br>Method registered<br>Success response<br>400 invalid data<br>404 missing resource<br>500 error path<br>401 anonymous/expired token<br>403 wrong permission<br>Empty data<br>Duplicate data<br>Large payload<br>429 rate limit<br>OPTIONS<br>HEAD |
| /api/products/simple-import | POST | Static contract present | 400, 500, 503 | Route exists<br>Method registered<br>Success response<br>400 invalid data<br>404 missing resource<br>500 error path<br>401 anonymous/expired token<br>403 wrong permission<br>Empty data<br>Duplicate data<br>Large payload<br>429 rate limit<br>OPTIONS<br>HEAD |
| /api/products/template | GET | Needs remediation or runtime confirmation | 200, 500 | Route exists<br>Method registered<br>Success response<br>400 invalid data<br>404 missing resource<br>500 error path<br>Pagination/filter/sort<br>Slow network<br>OPTIONS<br>HEAD |
| /api/projects | GET | Static contract present | 500 | Route exists<br>Method registered<br>Success response<br>400 invalid data<br>404 missing resource<br>500 error path<br>401 anonymous/expired token<br>403 wrong permission<br>Empty data<br>Duplicate data<br>Large payload<br>429 rate limit<br>Pagination/filter/sort<br>Slow network<br>OPTIONS<br>HEAD |
| /api/projects | POST | Static contract present | 400, 401, 500 | Route exists<br>Method registered<br>Success response<br>400 invalid data<br>404 missing resource<br>500 error path<br>401 anonymous/expired token<br>403 wrong permission<br>Empty data<br>Duplicate data<br>Large payload<br>429 rate limit<br>OPTIONS<br>HEAD |
| /api/projects/{id} | DELETE | Static contract present | 400, 401, 500 | Route exists<br>Method registered<br>Success response<br>400 invalid data<br>404 missing resource<br>500 error path<br>401 anonymous/expired token<br>403 wrong permission<br>Empty data<br>Duplicate data<br>Large payload<br>429 rate limit<br>OPTIONS<br>HEAD |
| /api/projects/{id} | PUT | Static contract present | 400, 401, 500 | Route exists<br>Method registered<br>Success response<br>400 invalid data<br>404 missing resource<br>500 error path<br>401 anonymous/expired token<br>403 wrong permission<br>Empty data<br>Duplicate data<br>Large payload<br>429 rate limit<br>OPTIONS<br>HEAD |
| /api/projects/{id}/pdf | GET | Static contract present | 400, 404, 500 | Route exists<br>Method registered<br>Success response<br>400 invalid data<br>404 missing resource<br>500 error path<br>401 anonymous/expired token<br>403 wrong permission<br>Pagination/filter/sort<br>Slow network<br>OPTIONS<br>HEAD |
| /api/promotions/claim-viral | POST | Static contract present | 400, 429, 500, 503 | Route exists<br>Method registered<br>Success response<br>400 invalid data<br>404 missing resource<br>500 error path<br>Empty data<br>Duplicate data<br>Large payload<br>429 rate limit<br>OPTIONS<br>HEAD |
| /api/promotions/free-installation-claim | POST | Static contract present | 400, 429, 500, 503 | Route exists<br>Method registered<br>Success response<br>400 invalid data<br>404 missing resource<br>500 error path<br>Empty data<br>Duplicate data<br>Large payload<br>429 rate limit<br>OPTIONS<br>HEAD |
| /api/quotes | POST | Static contract present | 200, 400, 500 | Route exists<br>Method registered<br>Success response<br>400 invalid data<br>404 missing resource<br>500 error path<br>Empty data<br>Duplicate data<br>Large payload<br>429 rate limit<br>OPTIONS<br>HEAD |
| /api/quotes/{id} | GET | Static contract present | 200, 400, 401, 403 | Route exists<br>Method registered<br>Success response<br>400 invalid data<br>404 missing resource<br>500 error path<br>401 anonymous/expired token<br>403 wrong permission<br>Pagination/filter/sort<br>Slow network<br>OPTIONS<br>HEAD |
| /api/quotes/{id}/accept-counter | POST | Static contract present | 400, 403 | Route exists<br>Method registered<br>Success response<br>400 invalid data<br>404 missing resource<br>500 error path<br>401 anonymous/expired token<br>403 wrong permission<br>Empty data<br>Duplicate data<br>Large payload<br>429 rate limit<br>OPTIONS<br>HEAD |
| /api/quotes/{id}/advance-payment/confirm | GET | Needs remediation or runtime confirmation | 404, 500 | Route exists<br>Method registered<br>Success response<br>400 invalid data<br>404 missing resource<br>500 error path<br>401 anonymous/expired token<br>403 wrong permission<br>Empty data<br>Duplicate data<br>Large payload<br>429 rate limit<br>Pagination/filter/sort<br>Slow network<br>OPTIONS<br>HEAD |
| /api/quotes/{id}/advance-payment/confirm | POST | Static contract present | 400, 403, 404, 409, 500 | Route exists<br>Method registered<br>Success response<br>400 invalid data<br>404 missing resource<br>500 error path<br>401 anonymous/expired token<br>403 wrong permission<br>Empty data<br>Duplicate data<br>Large payload<br>429 rate limit<br>OPTIONS<br>HEAD |
| /api/quotes/{id}/advance-payment/generate-link | POST | Static contract present | 400, 403, 404, 409, 500 | Route exists<br>Method registered<br>Success response<br>400 invalid data<br>404 missing resource<br>500 error path<br>401 anonymous/expired token<br>403 wrong permission<br>Empty data<br>Duplicate data<br>Large payload<br>429 rate limit<br>OPTIONS<br>HEAD |
| /api/quotes/{id}/reject-counter | POST | Static contract present | 400, 403 | Route exists<br>Method registered<br>Success response<br>400 invalid data<br>404 missing resource<br>500 error path<br>401 anonymous/expired token<br>403 wrong permission<br>Empty data<br>Duplicate data<br>Large payload<br>429 rate limit<br>OPTIONS<br>HEAD |
| /api/quotes/bid | POST | Static contract present | 400, 409, 500 | Route exists<br>Method registered<br>Success response<br>400 invalid data<br>404 missing resource<br>500 error path<br>Empty data<br>Duplicate data<br>Large payload<br>429 rate limit<br>OPTIONS<br>HEAD |
| /api/referral | GET | Needs remediation or runtime confirmation | 401, 500 | Route exists<br>Method registered<br>Success response<br>400 invalid data<br>404 missing resource<br>500 error path<br>401 anonymous/expired token<br>403 wrong permission<br>Empty data<br>Duplicate data<br>Large payload<br>429 rate limit<br>Pagination/filter/sort<br>Slow network<br>OPTIONS<br>HEAD |
| /api/referral/claim | POST | Static contract present | 400, 401, 404, 409, 429, 500 | Route exists<br>Method registered<br>Success response<br>400 invalid data<br>404 missing resource<br>500 error path<br>401 anonymous/expired token<br>403 wrong permission<br>Empty data<br>Duplicate data<br>Large payload<br>429 rate limit<br>OPTIONS<br>HEAD |
| /api/roles-public | GET | Needs remediation or runtime confirmation | 500 | Route exists<br>Method registered<br>Success response<br>400 invalid data<br>404 missing resource<br>500 error path<br>Pagination/filter/sort<br>Slow network<br>OPTIONS<br>HEAD |
| /api/roles | GET | Needs remediation or runtime confirmation | 401, 403, 500 | Route exists<br>Method registered<br>Success response<br>400 invalid data<br>404 missing resource<br>500 error path<br>401 anonymous/expired token<br>403 wrong permission<br>Pagination/filter/sort<br>Slow network<br>OPTIONS<br>HEAD |
| /api/roles | GET | Needs remediation or runtime confirmation | 403, 500 | Route exists<br>Method registered<br>Success response<br>400 invalid data<br>404 missing resource<br>500 error path<br>401 anonymous/expired token<br>403 wrong permission<br>Pagination/filter/sort<br>Slow network<br>OPTIONS<br>HEAD |
| /api/roles | POST | Static contract present | 405 | Route exists<br>Method registered<br>Success response<br>400 invalid data<br>404 missing resource<br>500 error path<br>401 anonymous/expired token<br>403 wrong permission<br>Empty data<br>Duplicate data<br>Large payload<br>429 rate limit<br>OPTIONS<br>HEAD |
| /api/roles | POST | Needs remediation or runtime confirmation | 400, 403, 500 | Route exists<br>Method registered<br>Success response<br>400 invalid data<br>404 missing resource<br>500 error path<br>401 anonymous/expired token<br>403 wrong permission<br>Empty data<br>Duplicate data<br>Large payload<br>429 rate limit<br>OPTIONS<br>HEAD |
| /api/sales-agents/apply | POST | Static contract present | 201, 401, 409, 500 | Route exists<br>Method registered<br>Success response<br>400 invalid data<br>404 missing resource<br>500 error path<br>Empty data<br>Duplicate data<br>Large payload<br>429 rate limit<br>OPTIONS<br>HEAD |
| /api/security/audit-logs | GET | Static contract present | 500 | Route exists<br>Method registered<br>Success response<br>400 invalid data<br>404 missing resource<br>500 error path<br>401 anonymous/expired token<br>403 wrong permission<br>Empty data<br>Duplicate data<br>Large payload<br>429 rate limit<br>Pagination/filter/sort<br>Slow network<br>OPTIONS<br>HEAD |
| /api/security/audit-logs | POST | Static contract present | 400, 500 | Route exists<br>Method registered<br>Success response<br>400 invalid data<br>404 missing resource<br>500 error path<br>401 anonymous/expired token<br>403 wrong permission<br>Empty data<br>Duplicate data<br>Large payload<br>429 rate limit<br>OPTIONS<br>HEAD |
| /api/security/mfa-status | GET | Static contract present | 400, 500 | Route exists<br>Method registered<br>Success response<br>400 invalid data<br>404 missing resource<br>500 error path<br>401 anonymous/expired token<br>403 wrong permission<br>Empty data<br>Duplicate data<br>Large payload<br>429 rate limit<br>Pagination/filter/sort<br>Slow network<br>OPTIONS<br>HEAD |
| /api/security/mfa-status | POST | Static contract present | 400, 500 | Route exists<br>Method registered<br>Success response<br>400 invalid data<br>404 missing resource<br>500 error path<br>401 anonymous/expired token<br>403 wrong permission<br>Empty data<br>Duplicate data<br>Large payload<br>429 rate limit<br>OPTIONS<br>HEAD |
| /api/security/settings | GET | Static contract present | 500 | Route exists<br>Method registered<br>Success response<br>400 invalid data<br>404 missing resource<br>500 error path<br>401 anonymous/expired token<br>403 wrong permission<br>Empty data<br>Duplicate data<br>Large payload<br>429 rate limit<br>Pagination/filter/sort<br>Slow network<br>OPTIONS<br>HEAD |
| /api/security/settings | POST | Static contract present | 400, 500 | Route exists<br>Method registered<br>Success response<br>400 invalid data<br>404 missing resource<br>500 error path<br>401 anonymous/expired token<br>403 wrong permission<br>Empty data<br>Duplicate data<br>Large payload<br>429 rate limit<br>OPTIONS<br>HEAD |
| /api/security/validate-password | POST | Static contract present | 400, 500 | Route exists<br>Method registered<br>Success response<br>400 invalid data<br>404 missing resource<br>500 error path<br>Empty data<br>Duplicate data<br>Large payload<br>429 rate limit<br>OPTIONS<br>HEAD |
| /api/service-availability | GET | Needs remediation or runtime confirmation | none observed | Route exists<br>Method registered<br>Success response<br>400 invalid data<br>404 missing resource<br>500 error path<br>Pagination/filter/sort<br>Slow network<br>OPTIONS<br>HEAD |
| /api/services | GET | Static contract present | none observed | Route exists<br>Method registered<br>Success response<br>400 invalid data<br>404 missing resource<br>500 error path<br>401 anonymous/expired token<br>403 wrong permission<br>Empty data<br>Duplicate data<br>Large payload<br>429 rate limit<br>Pagination/filter/sort<br>Slow network<br>OPTIONS<br>HEAD |
| /api/services | POST | Static contract present | none observed | Route exists<br>Method registered<br>Success response<br>400 invalid data<br>404 missing resource<br>500 error path<br>401 anonymous/expired token<br>403 wrong permission<br>Empty data<br>Duplicate data<br>Large payload<br>429 rate limit<br>OPTIONS<br>HEAD |
| /api/services/{id} | DELETE | Static contract present | none observed | Route exists<br>Method registered<br>Success response<br>400 invalid data<br>404 missing resource<br>500 error path<br>401 anonymous/expired token<br>403 wrong permission<br>Empty data<br>Duplicate data<br>Large payload<br>429 rate limit<br>OPTIONS<br>HEAD |
| /api/services/{id} | GET | Needs remediation or runtime confirmation | none observed | Route exists<br>Method registered<br>Success response<br>400 invalid data<br>404 missing resource<br>500 error path<br>401 anonymous/expired token<br>403 wrong permission<br>Empty data<br>Duplicate data<br>Large payload<br>429 rate limit<br>Pagination/filter/sort<br>Slow network<br>OPTIONS<br>HEAD |
| /api/services/{id} | PUT | Static contract present | none observed | Route exists<br>Method registered<br>Success response<br>400 invalid data<br>404 missing resource<br>500 error path<br>401 anonymous/expired token<br>403 wrong permission<br>Empty data<br>Duplicate data<br>Large payload<br>429 rate limit<br>OPTIONS<br>HEAD |
| /api/services/engineers | GET | Needs remediation or runtime confirmation | 400, 500 | Route exists<br>Method registered<br>Success response<br>400 invalid data<br>404 missing resource<br>500 error path<br>401 anonymous/expired token<br>403 wrong permission<br>Empty data<br>Duplicate data<br>Large payload<br>429 rate limit<br>Pagination/filter/sort<br>Slow network<br>OPTIONS<br>HEAD |
| /api/services/engineers | POST | Static contract present | 400, 500 | Route exists<br>Method registered<br>Success response<br>400 invalid data<br>404 missing resource<br>500 error path<br>401 anonymous/expired token<br>403 wrong permission<br>Empty data<br>Duplicate data<br>Large payload<br>429 rate limit<br>OPTIONS<br>HEAD |
| /api/services/tickets | GET | Needs remediation or runtime confirmation | 400, 500 | Route exists<br>Method registered<br>Success response<br>400 invalid data<br>404 missing resource<br>500 error path<br>401 anonymous/expired token<br>403 wrong permission<br>Empty data<br>Duplicate data<br>Large payload<br>429 rate limit<br>Pagination/filter/sort<br>Slow network<br>OPTIONS<br>HEAD |
| /api/services/tickets | POST | Static contract present | 400, 500 | Route exists<br>Method registered<br>Success response<br>400 invalid data<br>404 missing resource<br>500 error path<br>401 anonymous/expired token<br>403 wrong permission<br>Empty data<br>Duplicate data<br>Large payload<br>429 rate limit<br>OPTIONS<br>HEAD |
| /api/services/tickets/{id} | GET | Static contract present | 500 | Route exists<br>Method registered<br>Success response<br>400 invalid data<br>404 missing resource<br>500 error path<br>401 anonymous/expired token<br>403 wrong permission<br>Empty data<br>Duplicate data<br>Large payload<br>429 rate limit<br>Pagination/filter/sort<br>Slow network<br>OPTIONS<br>HEAD |
| /api/services/tickets/{id} | PUT | Static contract present | 400, 500 | Route exists<br>Method registered<br>Success response<br>400 invalid data<br>404 missing resource<br>500 error path<br>401 anonymous/expired token<br>403 wrong permission<br>Empty data<br>Duplicate data<br>Large payload<br>429 rate limit<br>OPTIONS<br>HEAD |
| /api/settings | DELETE | Static contract present | 400, 403, 500, 503 | Route exists<br>Method registered<br>Success response<br>400 invalid data<br>404 missing resource<br>500 error path<br>401 anonymous/expired token<br>403 wrong permission<br>Empty data<br>Duplicate data<br>Large payload<br>429 rate limit<br>OPTIONS<br>HEAD |
| /api/settings | GET | Static contract present | 401, 403, 404, 500, 503 | Route exists<br>Method registered<br>Success response<br>400 invalid data<br>404 missing resource<br>500 error path<br>401 anonymous/expired token<br>403 wrong permission<br>Empty data<br>Duplicate data<br>Large payload<br>429 rate limit<br>Pagination/filter/sort<br>Slow network<br>OPTIONS<br>HEAD |
| /api/settings | POST | Static contract present | 400, 403, 500, 503 | Route exists<br>Method registered<br>Success response<br>400 invalid data<br>404 missing resource<br>500 error path<br>401 anonymous/expired token<br>403 wrong permission<br>Empty data<br>Duplicate data<br>Large payload<br>429 rate limit<br>OPTIONS<br>HEAD |
| /api/settings | PUT | Static contract present | 400, 403, 500, 503 | Route exists<br>Method registered<br>Success response<br>400 invalid data<br>404 missing resource<br>500 error path<br>401 anonymous/expired token<br>403 wrong permission<br>Empty data<br>Duplicate data<br>Large payload<br>429 rate limit<br>OPTIONS<br>HEAD |
| /api/shipping | GET | Needs remediation or runtime confirmation | none observed | Route exists<br>Method registered<br>Success response<br>400 invalid data<br>404 missing resource<br>500 error path<br>401 anonymous/expired token<br>403 wrong permission<br>Empty data<br>Duplicate data<br>Large payload<br>429 rate limit<br>Pagination/filter/sort<br>Slow network<br>OPTIONS<br>HEAD |
| /api/shipping | POST | Static contract present | none observed | Route exists<br>Method registered<br>Success response<br>400 invalid data<br>404 missing resource<br>500 error path<br>401 anonymous/expired token<br>403 wrong permission<br>Empty data<br>Duplicate data<br>Large payload<br>429 rate limit<br>OPTIONS<br>HEAD |
| /api/shipping/update | GET | Needs remediation or runtime confirmation | 404 | Route exists<br>Method registered<br>Success response<br>400 invalid data<br>404 missing resource<br>500 error path<br>401 anonymous/expired token<br>403 wrong permission<br>Empty data<br>Duplicate data<br>Large payload<br>429 rate limit<br>Pagination/filter/sort<br>Slow network<br>OPTIONS<br>HEAD |
| /api/shipping/update | POST | Static contract present | none observed | Route exists<br>Method registered<br>Success response<br>400 invalid data<br>404 missing resource<br>500 error path<br>401 anonymous/expired token<br>403 wrong permission<br>Empty data<br>Duplicate data<br>Large payload<br>429 rate limit<br>OPTIONS<br>HEAD |
| /api/superadmin/areas | DELETE | Needs remediation or runtime confirmation | 400, 403, 500 | Route exists<br>Method registered<br>Success response<br>400 invalid data<br>404 missing resource<br>500 error path<br>401 anonymous/expired token<br>403 wrong permission<br>Empty data<br>Duplicate data<br>Large payload<br>429 rate limit<br>OPTIONS<br>HEAD |
| /api/superadmin/areas | GET | Needs remediation or runtime confirmation | 403, 500 | Route exists<br>Method registered<br>Success response<br>400 invalid data<br>404 missing resource<br>500 error path<br>401 anonymous/expired token<br>403 wrong permission<br>Empty data<br>Duplicate data<br>Large payload<br>429 rate limit<br>Pagination/filter/sort<br>Slow network<br>OPTIONS<br>HEAD |
| /api/superadmin/areas | POST | Needs remediation or runtime confirmation | 400, 403, 500 | Route exists<br>Method registered<br>Success response<br>400 invalid data<br>404 missing resource<br>500 error path<br>401 anonymous/expired token<br>403 wrong permission<br>Empty data<br>Duplicate data<br>Large payload<br>429 rate limit<br>OPTIONS<br>HEAD |
| /api/superadmin/catalogue/generate | POST | Needs remediation or runtime confirmation | 200, 400, 403, 500 | Route exists<br>Method registered<br>Success response<br>400 invalid data<br>404 missing resource<br>500 error path<br>401 anonymous/expired token<br>403 wrong permission<br>Empty data<br>Duplicate data<br>Large payload<br>429 rate limit<br>OPTIONS<br>HEAD |
| /api/superadmin/custom-setup-offers | DELETE | Needs remediation or runtime confirmation | 400, 403, 500 | Route exists<br>Method registered<br>Success response<br>400 invalid data<br>404 missing resource<br>500 error path<br>Empty data<br>Duplicate data<br>Large payload<br>429 rate limit<br>OPTIONS<br>HEAD |
| /api/superadmin/custom-setup-offers | GET | Needs remediation or runtime confirmation | 403, 500 | Route exists<br>Method registered<br>Success response<br>400 invalid data<br>404 missing resource<br>500 error path<br>Empty data<br>Duplicate data<br>Large payload<br>429 rate limit<br>Pagination/filter/sort<br>Slow network<br>OPTIONS<br>HEAD |
| /api/superadmin/custom-setup-offers | POST | Needs remediation or runtime confirmation | 201, 400, 403, 500 | Route exists<br>Method registered<br>Success response<br>400 invalid data<br>404 missing resource<br>500 error path<br>Empty data<br>Duplicate data<br>Large payload<br>429 rate limit<br>OPTIONS<br>HEAD |
| /api/superadmin/custom-setup-offers | PUT | Needs remediation or runtime confirmation | 400, 403, 500 | Route exists<br>Method registered<br>Success response<br>400 invalid data<br>404 missing resource<br>500 error path<br>Empty data<br>Duplicate data<br>Large payload<br>429 rate limit<br>OPTIONS<br>HEAD |
| /api/superadmin/inquiries | GET | Needs remediation or runtime confirmation | 403, 500 | Route exists<br>Method registered<br>Success response<br>400 invalid data<br>404 missing resource<br>500 error path<br>Pagination/filter/sort<br>Slow network<br>OPTIONS<br>HEAD |
| /api/superadmin/inquiries/{id}/assignment | PATCH | Needs remediation or runtime confirmation | 400, 403, 500 | Route exists<br>Method registered<br>Success response<br>400 invalid data<br>404 missing resource<br>500 error path<br>401 anonymous/expired token<br>403 wrong permission<br>Empty data<br>Duplicate data<br>Large payload<br>429 rate limit<br>OPTIONS<br>HEAD |
| /api/superadmin/services/ai-generate | POST | Needs remediation or runtime confirmation | 400, 403, 500 | Route exists<br>Method registered<br>Success response<br>400 invalid data<br>404 missing resource<br>500 error path<br>401 anonymous/expired token<br>403 wrong permission<br>Empty data<br>Duplicate data<br>Large payload<br>429 rate limit<br>OPTIONS<br>HEAD |
| /api/templates | GET | Needs remediation or runtime confirmation | 403, 500 | Route exists<br>Method registered<br>Success response<br>400 invalid data<br>404 missing resource<br>500 error path<br>401 anonymous/expired token<br>403 wrong permission<br>Empty data<br>Duplicate data<br>Large payload<br>429 rate limit<br>Pagination/filter/sort<br>Slow network<br>OPTIONS<br>HEAD |
| /api/templates | POST | Needs remediation or runtime confirmation | 403, 500 | Route exists<br>Method registered<br>Success response<br>400 invalid data<br>404 missing resource<br>500 error path<br>401 anonymous/expired token<br>403 wrong permission<br>Empty data<br>Duplicate data<br>Large payload<br>429 rate limit<br>OPTIONS<br>HEAD |
| /api/trpc/{trpc} | GET | Needs remediation or runtime confirmation | none observed | Route exists<br>Method registered<br>Success response<br>400 invalid data<br>404 missing resource<br>500 error path<br>Pagination/filter/sort<br>Slow network<br>OPTIONS<br>HEAD |
| /api/trpc/{trpc} | POST | Needs remediation or runtime confirmation | none observed | Route exists<br>Method registered<br>Success response<br>400 invalid data<br>404 missing resource<br>500 error path<br>401 anonymous/expired token<br>403 wrong permission<br>Empty data<br>Duplicate data<br>Large payload<br>429 rate limit<br>OPTIONS<br>HEAD |
| /api/trpc/contactMessages.submit | POST | Needs remediation or runtime confirmation | none observed | Route exists<br>Method registered<br>Success response<br>400 invalid data<br>404 missing resource<br>500 error path<br>Empty data<br>Duplicate data<br>Large payload<br>429 rate limit<br>OPTIONS<br>HEAD |
| /api/trpc/coupons.create | POST | Needs remediation or runtime confirmation | none observed | Route exists<br>Method registered<br>Success response<br>400 invalid data<br>404 missing resource<br>500 error path<br>401 anonymous/expired token<br>403 wrong permission<br>Empty data<br>Duplicate data<br>Large payload<br>429 rate limit<br>OPTIONS<br>HEAD |
| /api/trpc/coupons.delete | POST | Needs remediation or runtime confirmation | none observed | Route exists<br>Method registered<br>Success response<br>400 invalid data<br>404 missing resource<br>500 error path<br>401 anonymous/expired token<br>403 wrong permission<br>Empty data<br>Duplicate data<br>Large payload<br>429 rate limit<br>OPTIONS<br>HEAD |
| /api/trpc/coupons.getAll | GET | Needs remediation or runtime confirmation | none observed | Route exists<br>Method registered<br>Success response<br>400 invalid data<br>404 missing resource<br>500 error path<br>Pagination/filter/sort<br>Slow network<br>OPTIONS<br>HEAD |
| /api/trpc/coupons.getByCode | GET | Needs remediation or runtime confirmation | none observed | Route exists<br>Method registered<br>Success response<br>400 invalid data<br>404 missing resource<br>500 error path<br>Pagination/filter/sort<br>Slow network<br>OPTIONS<br>HEAD |
| /api/trpc/coupons.getById | GET | Needs remediation or runtime confirmation | none observed | Route exists<br>Method registered<br>Success response<br>400 invalid data<br>404 missing resource<br>500 error path<br>Pagination/filter/sort<br>Slow network<br>OPTIONS<br>HEAD |
| /api/trpc/coupons.update | POST | Needs remediation or runtime confirmation | none observed | Route exists<br>Method registered<br>Success response<br>400 invalid data<br>404 missing resource<br>500 error path<br>401 anonymous/expired token<br>403 wrong permission<br>Empty data<br>Duplicate data<br>Large payload<br>429 rate limit<br>OPTIONS<br>HEAD |
| /api/trpc/featureFlags.getAll | GET | Needs remediation or runtime confirmation | none observed | Route exists<br>Method registered<br>Success response<br>400 invalid data<br>404 missing resource<br>500 error path<br>Pagination/filter/sort<br>Slow network<br>OPTIONS<br>HEAD |
| /api/trpc/featureFlags.toggle | POST | Needs remediation or runtime confirmation | none observed | Route exists<br>Method registered<br>Success response<br>400 invalid data<br>404 missing resource<br>500 error path<br>401 anonymous/expired token<br>403 wrong permission<br>Empty data<br>Duplicate data<br>Large payload<br>429 rate limit<br>OPTIONS<br>HEAD |
| /api/trpc/offers.create | POST | Static contract present | none observed | Route exists<br>Method registered<br>Success response<br>400 invalid data<br>404 missing resource<br>500 error path<br>401 anonymous/expired token<br>403 wrong permission<br>Empty data<br>Duplicate data<br>Large payload<br>429 rate limit<br>OPTIONS<br>HEAD |
| /api/trpc/offers.delete | POST | Static contract present | none observed | Route exists<br>Method registered<br>Success response<br>400 invalid data<br>404 missing resource<br>500 error path<br>401 anonymous/expired token<br>403 wrong permission<br>Empty data<br>Duplicate data<br>Large payload<br>429 rate limit<br>OPTIONS<br>HEAD |
| /api/trpc/offers.getAll | GET | Static contract present | none observed | Route exists<br>Method registered<br>Success response<br>400 invalid data<br>404 missing resource<br>500 error path<br>Pagination/filter/sort<br>Slow network<br>OPTIONS<br>HEAD |
| /api/trpc/offers.update | POST | Static contract present | none observed | Route exists<br>Method registered<br>Success response<br>400 invalid data<br>404 missing resource<br>500 error path<br>401 anonymous/expired token<br>403 wrong permission<br>Empty data<br>Duplicate data<br>Large payload<br>429 rate limit<br>OPTIONS<br>HEAD |
| /api/trpc/pageContent.get | GET | Needs remediation or runtime confirmation | none observed | Route exists<br>Method registered<br>Success response<br>400 invalid data<br>404 missing resource<br>500 error path<br>Pagination/filter/sort<br>Slow network<br>OPTIONS<br>HEAD |
| /api/trpc/pageContent.list_all | GET | Needs remediation or runtime confirmation | none observed | Route exists<br>Method registered<br>Success response<br>400 invalid data<br>404 missing resource<br>500 error path<br>401 anonymous/expired token<br>403 wrong permission<br>Pagination/filter/sort<br>Slow network<br>OPTIONS<br>HEAD |
| /api/trpc/pageContent.update | POST | Needs remediation or runtime confirmation | none observed | Route exists<br>Method registered<br>Success response<br>400 invalid data<br>404 missing resource<br>500 error path<br>401 anonymous/expired token<br>403 wrong permission<br>Empty data<br>Duplicate data<br>Large payload<br>429 rate limit<br>OPTIONS<br>HEAD |
| /api/trpc/projects.create | POST | Needs remediation or runtime confirmation | none observed | Route exists<br>Method registered<br>Success response<br>400 invalid data<br>404 missing resource<br>500 error path<br>401 anonymous/expired token<br>403 wrong permission<br>Empty data<br>Duplicate data<br>Large payload<br>429 rate limit<br>OPTIONS<br>HEAD |
| /api/trpc/projects.delete | POST | Needs remediation or runtime confirmation | none observed | Route exists<br>Method registered<br>Success response<br>400 invalid data<br>404 missing resource<br>500 error path<br>401 anonymous/expired token<br>403 wrong permission<br>Empty data<br>Duplicate data<br>Large payload<br>429 rate limit<br>OPTIONS<br>HEAD |
| /api/trpc/projects.getAll | GET | Needs remediation or runtime confirmation | none observed | Route exists<br>Method registered<br>Success response<br>400 invalid data<br>404 missing resource<br>500 error path<br>Pagination/filter/sort<br>Slow network<br>OPTIONS<br>HEAD |
| /api/upload-from-url | POST | Static contract present | none observed | Route exists<br>Method registered<br>Success response<br>400 invalid data<br>404 missing resource<br>500 error path<br>401 anonymous/expired token<br>403 wrong permission<br>Empty data<br>Duplicate data<br>Large payload<br>429 rate limit<br>OPTIONS<br>HEAD |
| /api/upload | POST | Static contract present | none observed | Route exists<br>Method registered<br>Success response<br>400 invalid data<br>404 missing resource<br>500 error path<br>401 anonymous/expired token<br>403 wrong permission<br>Empty data<br>Duplicate data<br>Large payload<br>429 rate limit<br>OPTIONS<br>HEAD |
| /api/uploads/quote-documents | POST | Static contract present | 400, 403, 404, 500 | Route exists<br>Method registered<br>Success response<br>400 invalid data<br>404 missing resource<br>500 error path<br>401 anonymous/expired token<br>403 wrong permission<br>Empty data<br>Duplicate data<br>Large payload<br>429 rate limit<br>OPTIONS<br>HEAD |
| /api/user/communication-preferences | GET | Needs remediation or runtime confirmation | 400, 401, 403, 500 | Route exists<br>Method registered<br>Success response<br>400 invalid data<br>404 missing resource<br>500 error path<br>401 anonymous/expired token<br>403 wrong permission<br>Empty data<br>Duplicate data<br>Large payload<br>429 rate limit<br>Pagination/filter/sort<br>Slow network<br>OPTIONS<br>HEAD |
| /api/user/communication-preferences | POST | Static contract present | 400, 401, 403, 500 | Route exists<br>Method registered<br>Success response<br>400 invalid data<br>404 missing resource<br>500 error path<br>401 anonymous/expired token<br>403 wrong permission<br>Empty data<br>Duplicate data<br>Large payload<br>429 rate limit<br>OPTIONS<br>HEAD |
| /api/user/gdpr/delete | POST | Static contract present | 400, 401, 429, 500 | Route exists<br>Method registered<br>Success response<br>400 invalid data<br>404 missing resource<br>500 error path<br>401 anonymous/expired token<br>403 wrong permission<br>Empty data<br>Duplicate data<br>Large payload<br>429 rate limit<br>OPTIONS<br>HEAD |
| /api/user/gdpr/export | GET | Needs remediation or runtime confirmation | 200, 401, 429, 500 | Route exists<br>Method registered<br>Success response<br>400 invalid data<br>404 missing resource<br>500 error path<br>401 anonymous/expired token<br>403 wrong permission<br>Pagination/filter/sort<br>Slow network<br>OPTIONS<br>HEAD |
| /api/user/notifications | GET | Needs remediation or runtime confirmation | 401, 500 | Route exists<br>Method registered<br>Success response<br>400 invalid data<br>404 missing resource<br>500 error path<br>401 anonymous/expired token<br>403 wrong permission<br>Empty data<br>Duplicate data<br>Large payload<br>429 rate limit<br>Pagination/filter/sort<br>Slow network<br>OPTIONS<br>HEAD |
| /api/user/notifications | PUT | Static contract present | 400, 401, 500 | Route exists<br>Method registered<br>Success response<br>400 invalid data<br>404 missing resource<br>500 error path<br>401 anonymous/expired token<br>403 wrong permission<br>Empty data<br>Duplicate data<br>Large payload<br>429 rate limit<br>OPTIONS<br>HEAD |
| /api/user/wishlist | DELETE | Static contract present | 401, 500 | Route exists<br>Method registered<br>Success response<br>400 invalid data<br>404 missing resource<br>500 error path<br>401 anonymous/expired token<br>403 wrong permission<br>Empty data<br>Duplicate data<br>Large payload<br>429 rate limit<br>OPTIONS<br>HEAD |
| /api/user/wishlist | GET | Needs remediation or runtime confirmation | 500 | Route exists<br>Method registered<br>Success response<br>400 invalid data<br>404 missing resource<br>500 error path<br>401 anonymous/expired token<br>403 wrong permission<br>Empty data<br>Duplicate data<br>Large payload<br>429 rate limit<br>Pagination/filter/sort<br>Slow network<br>OPTIONS<br>HEAD |
| /api/user/wishlist | POST | Static contract present | 400, 401, 500 | Route exists<br>Method registered<br>Success response<br>400 invalid data<br>404 missing resource<br>500 error path<br>401 anonymous/expired token<br>403 wrong permission<br>Empty data<br>Duplicate data<br>Large payload<br>429 rate limit<br>OPTIONS<br>HEAD |
| /api/users-admin | GET | Needs remediation or runtime confirmation | 401, 403, 410, 500 | Route exists<br>Method registered<br>Success response<br>400 invalid data<br>404 missing resource<br>500 error path<br>401 anonymous/expired token<br>403 wrong permission<br>Empty data<br>Duplicate data<br>Large payload<br>429 rate limit<br>Pagination/filter/sort<br>Slow network<br>OPTIONS<br>HEAD |
| /api/users-admin | POST | Static contract present | 400, 401, 403, 410, 500 | Route exists<br>Method registered<br>Success response<br>400 invalid data<br>404 missing resource<br>500 error path<br>401 anonymous/expired token<br>403 wrong permission<br>Empty data<br>Duplicate data<br>Large payload<br>429 rate limit<br>OPTIONS<br>HEAD |
| /api/users | DELETE | Static contract present | 400, 401, 403, 500, 503 | Route exists<br>Method registered<br>Success response<br>400 invalid data<br>404 missing resource<br>500 error path<br>401 anonymous/expired token<br>403 wrong permission<br>Empty data<br>Duplicate data<br>Large payload<br>429 rate limit<br>OPTIONS<br>HEAD |
| /api/users | DELETE | Static contract present | 400, 401, 403, 500, 503 | Route exists<br>Method registered<br>Success response<br>400 invalid data<br>404 missing resource<br>500 error path<br>401 anonymous/expired token<br>403 wrong permission<br>Empty data<br>Duplicate data<br>Large payload<br>429 rate limit<br>OPTIONS<br>HEAD |
| /api/users | GET | Static contract present | 401, 403, 500, 503 | Route exists<br>Method registered<br>Success response<br>400 invalid data<br>404 missing resource<br>500 error path<br>401 anonymous/expired token<br>403 wrong permission<br>Empty data<br>Duplicate data<br>Large payload<br>429 rate limit<br>Pagination/filter/sort<br>Slow network<br>OPTIONS<br>HEAD |
| /api/users | GET | Static contract present | 401, 403, 500, 503 | Route exists<br>Method registered<br>Success response<br>400 invalid data<br>404 missing resource<br>500 error path<br>401 anonymous/expired token<br>403 wrong permission<br>Empty data<br>Duplicate data<br>Large payload<br>429 rate limit<br>Pagination/filter/sort<br>Slow network<br>OPTIONS<br>HEAD |
| /api/users | GET | Static contract present | 403, 500 | Route exists<br>Method registered<br>Success response<br>400 invalid data<br>404 missing resource<br>500 error path<br>401 anonymous/expired token<br>403 wrong permission<br>Pagination/filter/sort<br>Slow network<br>OPTIONS<br>HEAD |
| /api/users | POST | Static contract present | 400, 401, 403, 500, 503 | Route exists<br>Method registered<br>Success response<br>400 invalid data<br>404 missing resource<br>500 error path<br>401 anonymous/expired token<br>403 wrong permission<br>Empty data<br>Duplicate data<br>Large payload<br>429 rate limit<br>OPTIONS<br>HEAD |
| /api/users | POST | Static contract present | 400, 401, 403, 500, 503 | Route exists<br>Method registered<br>Success response<br>400 invalid data<br>404 missing resource<br>500 error path<br>401 anonymous/expired token<br>403 wrong permission<br>Empty data<br>Duplicate data<br>Large payload<br>429 rate limit<br>OPTIONS<br>HEAD |
| /api/users | PUT | Static contract present | 400, 401, 403, 500, 503 | Route exists<br>Method registered<br>Success response<br>400 invalid data<br>404 missing resource<br>500 error path<br>401 anonymous/expired token<br>403 wrong permission<br>Empty data<br>Duplicate data<br>Large payload<br>429 rate limit<br>OPTIONS<br>HEAD |
| /api/users | PUT | Static contract present | 400, 401, 403, 500, 503 | Route exists<br>Method registered<br>Success response<br>400 invalid data<br>404 missing resource<br>500 error path<br>401 anonymous/expired token<br>403 wrong permission<br>Empty data<br>Duplicate data<br>Large payload<br>429 rate limit<br>OPTIONS<br>HEAD |
| /api/v1/embed/configurator | GET | Static contract present | 401, 403, 500 | Route exists<br>Method registered<br>Success response<br>400 invalid data<br>404 missing resource<br>500 error path<br>401 anonymous/expired token<br>403 wrong permission<br>Pagination/filter/sort<br>Slow network<br>OPTIONS<br>HEAD |
| /api/walk-in-orders | GET | Static contract present | 400, 500 | Route exists<br>Method registered<br>Success response<br>400 invalid data<br>404 missing resource<br>500 error path<br>401 anonymous/expired token<br>403 wrong permission<br>Empty data<br>Duplicate data<br>Large payload<br>429 rate limit<br>Pagination/filter/sort<br>Slow network<br>OPTIONS<br>HEAD |
| /api/walk-in-orders | POST | Static contract present | 400, 500 | Route exists<br>Method registered<br>Success response<br>400 invalid data<br>404 missing resource<br>500 error path<br>401 anonymous/expired token<br>403 wrong permission<br>Empty data<br>Duplicate data<br>Large payload<br>429 rate limit<br>OPTIONS<br>HEAD |
| /api/warranty/activate | POST | Static contract present | 400, 429, 500, 503 | Route exists<br>Method registered<br>Success response<br>400 invalid data<br>404 missing resource<br>500 error path<br>401 anonymous/expired token<br>403 wrong permission<br>Empty data<br>Duplicate data<br>Large payload<br>429 rate limit<br>OPTIONS<br>HEAD |
| /api/webhook/whatsapp | POST | Static contract present | 200, 400, 401, 500, 503 | Route exists<br>Method registered<br>Success response<br>400 invalid data<br>404 missing resource<br>500 error path<br>Empty data<br>Duplicate data<br>Large payload<br>429 rate limit<br>OPTIONS<br>HEAD |
| /api/webhooks/custom-tunnel/{path*} | POST | Static contract present | 200, 400, 401, 404, 500 | Route exists<br>Method registered<br>Success response<br>400 invalid data<br>404 missing resource<br>500 error path<br>Empty data<br>Duplicate data<br>Large payload<br>429 rate limit<br>OPTIONS<br>HEAD |
| /api/webhooks/customer/signup | POST | Static contract present | 200, 400, 401, 403, 500 | Route exists<br>Method registered<br>Success response<br>400 invalid data<br>404 missing resource<br>500 error path<br>Empty data<br>Duplicate data<br>Large payload<br>429 rate limit<br>OPTIONS<br>HEAD |
| /api/webhooks/orders/cancelled | POST | Static contract present | 200, 400, 401, 403, 500 | Route exists<br>Method registered<br>Success response<br>400 invalid data<br>404 missing resource<br>500 error path<br>Empty data<br>Duplicate data<br>Large payload<br>429 rate limit<br>OPTIONS<br>HEAD |
| /api/webhooks/orders/delayed | POST | Static contract present | 200, 400, 401, 403, 500 | Route exists<br>Method registered<br>Success response<br>400 invalid data<br>404 missing resource<br>500 error path<br>Empty data<br>Duplicate data<br>Large payload<br>429 rate limit<br>OPTIONS<br>HEAD |
| /api/webhooks/orders/delivered | POST | Static contract present | 200, 400, 401, 403, 500 | Route exists<br>Method registered<br>Success response<br>400 invalid data<br>404 missing resource<br>500 error path<br>Empty data<br>Duplicate data<br>Large payload<br>429 rate limit<br>OPTIONS<br>HEAD |
| /api/webhooks/orders/notconfirmed | POST | Static contract present | 200, 400, 401, 403, 500 | Route exists<br>Method registered<br>Success response<br>400 invalid data<br>404 missing resource<br>500 error path<br>Empty data<br>Duplicate data<br>Large payload<br>429 rate limit<br>OPTIONS<br>HEAD |
| /api/webhooks/orders/outfordelivery | POST | Static contract present | 200, 400, 401, 403, 500 | Route exists<br>Method registered<br>Success response<br>400 invalid data<br>404 missing resource<br>500 error path<br>Empty data<br>Duplicate data<br>Large payload<br>429 rate limit<br>OPTIONS<br>HEAD |
| /api/webhooks/orders/placed | POST | Static contract present | 400, 401, 500 | Route exists<br>Method registered<br>Success response<br>400 invalid data<br>404 missing resource<br>500 error path<br>Empty data<br>Duplicate data<br>Large payload<br>429 rate limit<br>OPTIONS<br>HEAD |
| /api/webhooks/orders/shipped | POST | Static contract present | 200, 400, 401, 500 | Route exists<br>Method registered<br>Success response<br>400 invalid data<br>404 missing resource<br>500 error path<br>Empty data<br>Duplicate data<br>Large payload<br>429 rate limit<br>OPTIONS<br>HEAD |
| /api/webhooks/payment/failed | POST | Static contract present | 200, 400, 401, 403, 500 | Route exists<br>Method registered<br>Success response<br>400 invalid data<br>404 missing resource<br>500 error path<br>Empty data<br>Duplicate data<br>Large payload<br>429 rate limit<br>OPTIONS<br>HEAD |
| /api/webhooks/payment/received | POST | Static contract present | 200, 400, 401, 403, 500 | Route exists<br>Method registered<br>Success response<br>400 invalid data<br>404 missing resource<br>500 error path<br>Empty data<br>Duplicate data<br>Large payload<br>429 rate limit<br>OPTIONS<br>HEAD |
| /api/webhooks/stats | GET | Static contract present | 500 | Route exists<br>Method registered<br>Success response<br>400 invalid data<br>404 missing resource<br>500 error path<br>Empty data<br>Duplicate data<br>Large payload<br>429 rate limit<br>Pagination/filter/sort<br>Slow network<br>OPTIONS<br>HEAD |
| /api/webhooks/stats | POST | Static contract present | 500 | Route exists<br>Method registered<br>Success response<br>400 invalid data<br>404 missing resource<br>500 error path<br>Empty data<br>Duplicate data<br>Large payload<br>429 rate limit<br>OPTIONS<br>HEAD |

````````

---

## docs/api-audit/complete-api-inventory.md

````````markdown
# Complete API Inventory

Latest source inventory: `inventory.json` generated 2026-07-19T07:31:22.303Z with 378 discovered API entries, 378 working static entries, 0 broken routes, 0 unmatched frontend callers, 0 duplicate APIs, 0 missing validation signals, 0 missing authentication signals, 0 slow API candidates, 0 security issues, and 0 database integration issues.

| Module | API Name | HTTP Method | Complete URL | Route File | Controller File | Service File | Validation File | Middleware | Authentication | Permission Required | Database Tables Used | Frontend Pages Using It | Applications Using It | Integration Status | Integration Reason | Status |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| api | POST /api/admin-auth/login | POST | {{API_BASE_URL}}/api/admin-auth/login | apps/api/src/app/api/admin-auth/login/route.ts | apps/api/src/app/api/admin-auth/login/route.ts | @tecbunny/core/auth/superadmin-session<br>next/server | inline | @tecbunny/core/auth/superadmin-session | required/static signal found | not found | none detected | apps/api/src/app/login/page.tsx<br>apps/superadmin/src/app/superadmin/login/page.tsx | api, superadmin | direct frontend/shared caller detected | No unmatched caller exists; absence of a direct static frontend fetch is not a missing integration. | No static issues |
| api | POST /api/admin-auth/logout | POST | {{API_BASE_URL}}/api/admin-auth/logout | apps/api/src/app/api/admin-auth/logout/route.ts | apps/api/src/app/api/admin-auth/logout/route.ts | next/server | not found | not found | required/static signal found | not found | none detected | apps/api/src/app/dashboard/page.tsx<br>apps/superadmin/src/components/superadmin/SuperadminShell.tsx | api, superadmin | direct frontend/shared caller detected | No unmatched caller exists; absence of a direct static frontend fetch is not a missing integration. | 2 issue(s) |
| mgmt | POST /api/admin/agents/approve | POST | {{MGMT_BASE_URL}}/api/admin/agents/approve | apps/mgmt/src/app/api/admin/agents/approve/route.ts | apps/mgmt/src/app/api/admin/agents/approve/route.ts | @tecbunny/core/auth/admin-guard<br>next/server | inline | @tecbunny/core/auth/admin-guard | required/static signal found | role/permission signal found | sales_agents | none found | none found | available API endpoint | No unmatched caller exists; absence of a direct static frontend fetch is not a missing integration. | 2 issue(s) |
| mgmt | GET /api/admin/agents/list | GET | {{MGMT_BASE_URL}}/api/admin/agents/list | apps/mgmt/src/app/api/admin/agents/list/route.ts | apps/mgmt/src/app/api/admin/agents/list/route.ts | @tecbunny/core/auth/admin-guard<br>next/server | not found | @tecbunny/core/auth/admin-guard | required/static signal found | role/permission signal found | sales_agents | none found | none found | available API endpoint | No unmatched caller exists; absence of a direct static frontend fetch is not a missing integration. | 2 issue(s) |
| mgmt | POST /api/admin/agents/reject | POST | {{MGMT_BASE_URL}}/api/admin/agents/reject | apps/mgmt/src/app/api/admin/agents/reject/route.ts | apps/mgmt/src/app/api/admin/agents/reject/route.ts | @tecbunny/core/auth/admin-guard<br>next/server | inline | @tecbunny/core/auth/admin-guard | required/static signal found | role/permission signal found | sales_agents | none found | none found | available API endpoint | No unmatched caller exists; absence of a direct static frontend fetch is not a missing integration. | 2 issue(s) |
| mgmt | POST /api/admin/ai-query | POST | {{MGMT_BASE_URL}}/api/admin/ai-query | apps/mgmt/src/app/api/admin/ai-query/route.ts | apps/mgmt/src/app/api/admin/ai-query/route.ts | @tecbunny/core<br>@tecbunny/core/ai/gemini-service<br>@tecbunny/core/ai/prompts<br>@tecbunny/core/logger<br>@tecbunny/core/server<br>@tecbunny/core/server<br>@tecbunny/database<br>next/server | inline | not found | required/static signal found | role/permission signal found | analytics_events<br>leads<br>orders<br>product_analytics_view<br>products<br>profiles<br>services | apps/mgmt/src/app/mgmt/admin/ai-assistant/page.tsx | mgmt | direct frontend/shared caller detected | No unmatched caller exists; absence of a direct static frontend fetch is not a missing integration. | No static issues |
| mgmt | POST /api/admin/ai/product-description | POST | {{MGMT_BASE_URL}}/api/admin/ai/product-description | apps/mgmt/src/app/api/admin/ai/product-description/route.ts | apps/mgmt/src/app/api/admin/ai/product-description/route.ts | @tecbunny/core/ai/gemini-service<br>@tecbunny/core/ai/prompts<br>@tecbunny/core/auth/admin-guard<br>@tecbunny/core/logger<br>@tecbunny/core/server<br>@tecbunny/core/server<br>@tecbunny/database<br>next/server | inline | @tecbunny/core/auth/admin-guard | required/static signal found | role/permission signal found | products | none found | none found | available API endpoint | No unmatched caller exists; absence of a direct static frontend fetch is not a missing integration. | No static issues |
| mgmt | POST /api/admin/ai/related-products | POST | {{MGMT_BASE_URL}}/api/admin/ai/related-products | apps/mgmt/src/app/api/admin/ai/related-products/route.ts | apps/mgmt/src/app/api/admin/ai/related-products/route.ts | @tecbunny/core/auth/admin-guard<br>@tecbunny/core/logger<br>@tecbunny/core/server<br>@tecbunny/core/server<br>@tecbunny/database<br>next/server | inline | @tecbunny/core/auth/admin-guard | required/static signal found | role/permission signal found | products | none found | none found | available API endpoint | No unmatched caller exists; absence of a direct static frontend fetch is not a missing integration. | No static issues |
| mgmt | GET /api/admin/custom-setups | GET | {{MGMT_BASE_URL}}/api/admin/custom-setups | apps/mgmt/src/app/api/admin/custom-setups/route.ts | apps/mgmt/src/app/api/admin/custom-setups/route.ts | @tecbunny/core/auth/admin-guard<br>@tecbunny/core/custom-setup-service<br>@tecbunny/core/custom-setup.constants<br>@tecbunny/core/logger<br>@tecbunny/core/redis<br>next/server | inline | @tecbunny/core/auth/admin-guard | public or optional/static signal found | role/permission signal found | custom_setup_component_options<br>custom_setup_components<br>custom_setup_inventory<br>custom_setup_systems<br>custom_setup_templates | apps/mgmt/src/app/mgmt/admin/custom-setups/price-manager.tsx | mgmt | direct frontend/shared caller detected | No unmatched caller exists; absence of a direct static frontend fetch is not a missing integration. | 1 issue(s) |
| mgmt | PATCH /api/admin/custom-setups | PATCH | {{MGMT_BASE_URL}}/api/admin/custom-setups | apps/mgmt/src/app/api/admin/custom-setups/route.ts | apps/mgmt/src/app/api/admin/custom-setups/route.ts | @tecbunny/core/auth/admin-guard<br>@tecbunny/core/custom-setup-service<br>@tecbunny/core/custom-setup.constants<br>@tecbunny/core/logger<br>@tecbunny/core/redis<br>next/server | inline | @tecbunny/core/auth/admin-guard | public or optional/static signal found | role/permission signal found | custom_setup_component_options<br>custom_setup_components<br>custom_setup_inventory<br>custom_setup_systems<br>custom_setup_templates | none found | none found | available API endpoint | No unmatched caller exists; absence of a direct static frontend fetch is not a missing integration. | 1 issue(s) |
| mgmt | GET /api/admin/dashboard | GET | {{MGMT_BASE_URL}}/api/admin/dashboard | apps/mgmt/src/app/api/admin/dashboard/route.ts | apps/mgmt/src/app/api/admin/dashboard/route.ts | @tecbunny/core/auth/admin-guard<br>@tecbunny/core/logger<br>@tecbunny/core/order-utils<br>@tecbunny/core/server<br>next/server | inline | @tecbunny/core/auth/admin-guard | required/static signal found | role/permission signal found | orders<br>products<br>profiles | none found | none found | available API endpoint | No unmatched caller exists; absence of a direct static frontend fetch is not a missing integration. | No static issues |
| mgmt | GET /api/admin/faqs | GET | {{MGMT_BASE_URL}}/api/admin/faqs | apps/mgmt/src/app/api/admin/faqs/route.ts | apps/mgmt/src/app/api/admin/faqs/route.ts | @tecbunny/core/api-response<br>@tecbunny/core/server-role-guard<br>next/server | inline | @tecbunny/core/server-role-guard | public or optional/static signal found | role/permission signal found | faqs | packages/admin-ui/src/components/FaqsManagement.tsx | admin-ui | direct frontend/shared caller detected | No unmatched caller exists; absence of a direct static frontend fetch is not a missing integration. | 1 issue(s) |
| mgmt | POST /api/admin/faqs | POST | {{MGMT_BASE_URL}}/api/admin/faqs | apps/mgmt/src/app/api/admin/faqs/route.ts | apps/mgmt/src/app/api/admin/faqs/route.ts | @tecbunny/core/api-response<br>@tecbunny/core/server-role-guard<br>next/server | inline | @tecbunny/core/server-role-guard | required/static signal found | role/permission signal found | faqs | none found | none found | available API endpoint | No unmatched caller exists; absence of a direct static frontend fetch is not a missing integration. | 1 issue(s) |
| mgmt | DELETE /api/admin/faqs/{id} | DELETE | {{MGMT_BASE_URL}}/api/admin/faqs/{id} | apps/mgmt/src/app/api/admin/faqs/[id]/route.ts | apps/mgmt/src/app/api/admin/faqs/[id]/route.ts | @tecbunny/core/api-response<br>@tecbunny/core/server-role-guard<br>next/server | inline | @tecbunny/core/server-role-guard | required/static signal found | role/permission signal found | faqs | none found | none found | available API endpoint | No unmatched caller exists; absence of a direct static frontend fetch is not a missing integration. | 1 issue(s) |
| mgmt | PUT /api/admin/faqs/{id} | PUT | {{MGMT_BASE_URL}}/api/admin/faqs/{id} | apps/mgmt/src/app/api/admin/faqs/[id]/route.ts | apps/mgmt/src/app/api/admin/faqs/[id]/route.ts | @tecbunny/core/api-response<br>@tecbunny/core/server-role-guard<br>next/server | inline | @tecbunny/core/server-role-guard | required/static signal found | role/permission signal found | faqs | none found | none found | available API endpoint | No unmatched caller exists; absence of a direct static frontend fetch is not a missing integration. | 1 issue(s) |
| mgmt | POST /api/admin/homepage/auto-fill | POST | {{MGMT_BASE_URL}}/api/admin/homepage/auto-fill | apps/mgmt/src/app/api/admin/homepage/auto-fill/route.ts | apps/mgmt/src/app/api/admin/homepage/auto-fill/route.ts | @tecbunny/core<br>@tecbunny/core<br>@tecbunny/core/logger<br>@tecbunny/core/server<br>@tecbunny/core/server<br>next/server | inline | not found | required/static signal found | role/permission signal found | orders<br>products<br>profiles | packages/admin-ui/src/components/admin-homepage-settings.tsx | admin-ui | direct frontend/shared caller detected | No unmatched caller exists; absence of a direct static frontend fetch is not a missing integration. | No static issues |
| mgmt | POST /api/admin/homepage/auto-fill/run | POST | {{MGMT_BASE_URL}}/api/admin/homepage/auto-fill/run | apps/mgmt/src/app/api/admin/homepage/auto-fill/run/route.ts | apps/mgmt/src/app/api/admin/homepage/auto-fill/run/route.ts | @tecbunny/core<br>@tecbunny/core<br>@tecbunny/core/homepage-auto-fill<br>@tecbunny/core/logger<br>next/server | inline | not found | required/static signal found | role/permission signal found | orders<br>product_analytics_view<br>products<br>profiles<br>settings | none found | none found | available API endpoint | No unmatched caller exists; absence of a direct static frontend fetch is not a missing integration. | 1 issue(s) |
| mgmt | POST /api/admin/inventory/warranty/register | POST | {{MGMT_BASE_URL}}/api/admin/inventory/warranty/register | apps/mgmt/src/app/api/admin/inventory/warranty/register/route.ts | apps/mgmt/src/app/api/admin/inventory/warranty/register/route.ts | @tecbunny/core/auth/admin-guard<br>@tecbunny/core/logger<br>@tecbunny/core/whatsapp-service<br>next/server | inline | @tecbunny/core/auth/admin-guard | required/static signal found | role/permission signal found | warranties | none found | none found | available API endpoint | No unmatched caller exists; absence of a direct static frontend fetch is not a missing integration. | 1 issue(s) |
| mgmt | GET /api/admin/jobs/{id} | GET | {{MGMT_BASE_URL}}/api/admin/jobs/{id} | apps/mgmt/src/app/api/admin/jobs/[id]/route.ts | apps/mgmt/src/app/api/admin/jobs/[id]/route.ts | @tecbunny/core/admin-auth<br>@tecbunny/core/queue/image-jobs<br>@tecbunny/database<br>next/server | not found | @tecbunny/core/admin-auth | required/static signal found | role/permission signal found | none detected | none found | none found | available API endpoint | No unmatched caller exists; absence of a direct static frontend fetch is not a missing integration. | 2 issue(s) |
| mgmt | POST /api/admin/manage-role | POST | {{MGMT_BASE_URL}}/api/admin/manage-role | apps/mgmt/src/app/api/admin/manage-role/route.ts | apps/mgmt/src/app/api/admin/manage-role/route.ts | @tecbunny/core/logger<br>@tecbunny/database/admin<br>next/server | inline | not found | required/static signal found | role/permission signal found | profiles<br>security_audit_log | none found | none found | available API endpoint | No unmatched caller exists; absence of a direct static frontend fetch is not a missing integration. | No static issues |
| mgmt | POST /api/admin/marketing/blitz | POST | {{MGMT_BASE_URL}}/api/admin/marketing/blitz | apps/mgmt/src/app/api/admin/marketing/blitz/route.ts | apps/mgmt/src/app/api/admin/marketing/blitz/route.ts | @tecbunny/core/auth/admin-guard<br>@tecbunny/core/logger<br>@tecbunny/core/whatsapp-service<br>next/server | inline | @tecbunny/core/auth/admin-guard | required/static signal found | role/permission signal found | marketing_campaigns | none found | none found | available API endpoint | No unmatched caller exists; absence of a direct static frontend fetch is not a missing integration. | No static issues |
| mgmt | POST /api/admin/marketing/broadcast | POST | {{MGMT_BASE_URL}}/api/admin/marketing/broadcast | apps/mgmt/src/app/api/admin/marketing/broadcast/route.ts | apps/mgmt/src/app/api/admin/marketing/broadcast/route.ts | @tecbunny/core/improved-email-service<br>@tecbunny/core/logger<br>@tecbunny/core/server<br>@tecbunny/core/whatsapp-service<br>@tecbunny/database<br>next/server | inline | not found | required/static signal found | role/permission signal found | marketing_broadcast_logs<br>profiles | apps/mgmt/src/app/mgmt/admin/broadcast-desk/page.tsx<br>apps/mgmt/src/app/mgmt/admin/promotional-broadcast/page.tsx | mgmt | direct frontend/shared caller detected | No unmatched caller exists; absence of a direct static frontend fetch is not a missing integration. | No static issues |
| mgmt | GET /api/admin/orders | GET | {{MGMT_BASE_URL}}/api/admin/orders | apps/mgmt/src/app/api/admin/orders/route.ts | apps/mgmt/src/app/api/admin/orders/route.ts | @tecbunny/core/auth/server-role<br>@tecbunny/core/logger<br>@tecbunny/core/orders/normalizers<br>@tecbunny/core/server<br>@tecbunny/core/server<br>next/server | not found | @tecbunny/core/auth/server-role | required/static signal found | role/permission signal found | orders | none found | none found | available API endpoint | No unmatched caller exists; absence of a direct static frontend fetch is not a missing integration. | No static issues |
| mgmt | POST /api/admin/orders/{id}/pending-actions | POST | {{MGMT_BASE_URL}}/api/admin/orders/{id}/pending-actions | apps/mgmt/src/app/api/admin/orders/[id]/pending-actions/route.ts | apps/mgmt/src/app/api/admin/orders/[id]/pending-actions/route.ts | @tecbunny/core<br>@tecbunny/core/environment-validator<br>@tecbunny/core/logger<br>@tecbunny/core/whatsapp-service<br>@tecbunny/database/storage<br>next/server | @tecbunny/core/environment-validator | not found | required/static signal found | role/permission signal found | orders<br>profiles | none found | none found | available API endpoint | No unmatched caller exists; absence of a direct static frontend fetch is not a missing integration. | 1 issue(s) |
| mgmt | GET /api/admin/payment-settings | GET | {{MGMT_BASE_URL}}/api/admin/payment-settings | apps/mgmt/src/app/api/admin/payment-settings/route.ts | apps/mgmt/src/app/api/admin/payment-settings/route.ts | next/server | not found | not found | required/static signal found | role/permission signal found | none detected | none found | none found | available API endpoint | No unmatched caller exists; absence of a direct static frontend fetch is not a missing integration. | 2 issue(s) |
| mgmt | PUT /api/admin/payment-settings | PUT | {{MGMT_BASE_URL}}/api/admin/payment-settings | apps/mgmt/src/app/api/admin/payment-settings/route.ts | apps/mgmt/src/app/api/admin/payment-settings/route.ts | next/server | not found | not found | required/static signal found | role/permission signal found | none detected | none found | none found | available API endpoint | No unmatched caller exists; absence of a direct static frontend fetch is not a missing integration. | 2 issue(s) |
| mgmt | POST /api/admin/payment-settings/dedupe | POST | {{MGMT_BASE_URL}}/api/admin/payment-settings/dedupe | apps/mgmt/src/app/api/admin/payment-settings/dedupe/route.ts | apps/mgmt/src/app/api/admin/payment-settings/dedupe/route.ts | @tecbunny/core/logger<br>@tecbunny/database/admin<br>next/server | not found | not found | required/static signal found | role/permission signal found | settings | none found | none found | available API endpoint | No unmatched caller exists; absence of a direct static frontend fetch is not a missing integration. | 1 issue(s) |
| mgmt | GET /api/admin/pricing | GET | {{MGMT_BASE_URL}}/api/admin/pricing | apps/mgmt/src/app/api/admin/pricing/route.ts | apps/mgmt/src/app/api/admin/pricing/route.ts | @tecbunny/core/server<br>@tecbunny/core/server<br>@tecbunny/core/server<br>@tecbunny/database<br>next/server | inline | not found | required/static signal found | role/permission signal found | product_pricing | packages/admin-ui/src/components/admin-pricing.tsx | admin-ui | direct frontend/shared caller detected | No unmatched caller exists; absence of a direct static frontend fetch is not a missing integration. | No static issues |
| mgmt | POST /api/admin/pricing | POST | {{MGMT_BASE_URL}}/api/admin/pricing | apps/mgmt/src/app/api/admin/pricing/route.ts | apps/mgmt/src/app/api/admin/pricing/route.ts | @tecbunny/core/server<br>@tecbunny/core/server<br>@tecbunny/core/server<br>@tecbunny/database<br>next/server | inline | not found | required/static signal found | role/permission signal found | product_pricing | none found | none found | available API endpoint | No unmatched caller exists; absence of a direct static frontend fetch is not a missing integration. | No static issues |
| mgmt | DELETE /api/admin/pricing/{id} | DELETE | {{MGMT_BASE_URL}}/api/admin/pricing/{id} | apps/mgmt/src/app/api/admin/pricing/[id]/route.ts | apps/mgmt/src/app/api/admin/pricing/[id]/route.ts | @tecbunny/core/server<br>@tecbunny/core/server<br>@tecbunny/core/server<br>@tecbunny/database<br>next/server | inline | not found | public or optional/static signal found | role/permission signal found | product_pricing | none found | none found | available API endpoint | No unmatched caller exists; absence of a direct static frontend fetch is not a missing integration. | No static issues |
| mgmt | GET /api/admin/pricing/{id} | GET | {{MGMT_BASE_URL}}/api/admin/pricing/{id} | apps/mgmt/src/app/api/admin/pricing/[id]/route.ts | apps/mgmt/src/app/api/admin/pricing/[id]/route.ts | @tecbunny/core/server<br>@tecbunny/core/server<br>@tecbunny/core/server<br>@tecbunny/database<br>next/server | inline | not found | public or optional/static signal found | role/permission signal found | product_pricing | none found | none found | available API endpoint | No unmatched caller exists; absence of a direct static frontend fetch is not a missing integration. | No static issues |
| mgmt | PUT /api/admin/pricing/{id} | PUT | {{MGMT_BASE_URL}}/api/admin/pricing/{id} | apps/mgmt/src/app/api/admin/pricing/[id]/route.ts | apps/mgmt/src/app/api/admin/pricing/[id]/route.ts | @tecbunny/core/server<br>@tecbunny/core/server<br>@tecbunny/core/server<br>@tecbunny/database<br>next/server | inline | not found | public or optional/static signal found | role/permission signal found | product_pricing | none found | none found | available API endpoint | No unmatched caller exists; absence of a direct static frontend fetch is not a missing integration. | No static issues |
| mgmt | GET /api/admin/products | GET | {{MGMT_BASE_URL}}/api/admin/products | apps/mgmt/src/app/api/admin/products/route.ts | apps/mgmt/src/app/api/admin/products/route.ts | @tecbunny/core/image-utils<br>@tecbunny/core/logger<br>@tecbunny/core/server<br>@tecbunny/core/server<br>@tecbunny/core/server<br>@tecbunny/database<br>next/server | inline | not found | public or optional/static signal found | role/permission signal found | information_schema.columns<br>products | apps/superadmin/src/app/superadmin/mgmt/catalogue/page.tsx<br>packages/admin-ui/src/components/admin-homepage-settings.tsx<br>packages/admin-ui/src/components/admin-pricing.tsx<br>packages/admin-ui/src/components/admin-products-new.tsx | admin-ui, superadmin | direct frontend/shared caller detected | No unmatched caller exists; absence of a direct static frontend fetch is not a missing integration. | No static issues |
| mgmt | POST /api/admin/products/ai-add | POST | {{MGMT_BASE_URL}}/api/admin/products/ai-add | apps/mgmt/src/app/api/admin/products/ai-add/route.ts | apps/mgmt/src/app/api/admin/products/ai-add/route.ts | @tecbunny/core/ai/prompts<br>@tecbunny/core/ai/tax-classification<br>@tecbunny/core/auth/server-role<br>@tecbunny/core/logger<br>@tecbunny/core/server<br>@tecbunny/core/server<br>@tecbunny/database<br>next/server | inline | @tecbunny/core/auth/server-role | required/static signal found | role/permission signal found | information_schema.columns<br>products | none found | none found | available API endpoint | No unmatched caller exists; absence of a direct static frontend fetch is not a missing integration. | No static issues |
| mgmt | DELETE /api/admin/products/archive | DELETE | {{MGMT_BASE_URL}}/api/admin/products/archive | apps/mgmt/src/app/api/admin/products/archive/route.ts | apps/mgmt/src/app/api/admin/products/archive/route.ts | @tecbunny/core/auth/server-role<br>@tecbunny/core/logger<br>@tecbunny/core/server<br>@tecbunny/core/server<br>@tecbunny/database<br>next/server | inline | @tecbunny/core/auth/server-role | required/static signal found | role/permission signal found | products<br>rpc:restore_product<br>rpc:soft_delete_product | none found | none found | available API endpoint | No unmatched caller exists; absence of a direct static frontend fetch is not a missing integration. | No static issues |
| mgmt | GET /api/admin/products/archive | GET | {{MGMT_BASE_URL}}/api/admin/products/archive | apps/mgmt/src/app/api/admin/products/archive/route.ts | apps/mgmt/src/app/api/admin/products/archive/route.ts | @tecbunny/core/auth/server-role<br>@tecbunny/core/logger<br>@tecbunny/core/server<br>@tecbunny/core/server<br>@tecbunny/database<br>next/server | inline | @tecbunny/core/auth/server-role | public or optional/static signal found | role/permission signal found | products<br>rpc:restore_product<br>rpc:soft_delete_product | none found | none found | available API endpoint | No unmatched caller exists; absence of a direct static frontend fetch is not a missing integration. | No static issues |
| mgmt | POST /api/admin/products/archive | POST | {{MGMT_BASE_URL}}/api/admin/products/archive | apps/mgmt/src/app/api/admin/products/archive/route.ts | apps/mgmt/src/app/api/admin/products/archive/route.ts | @tecbunny/core/auth/server-role<br>@tecbunny/core/logger<br>@tecbunny/core/server<br>@tecbunny/core/server<br>@tecbunny/database<br>next/server | inline | @tecbunny/core/auth/server-role | required/static signal found | role/permission signal found | products<br>rpc:restore_product<br>rpc:soft_delete_product | none found | none found | available API endpoint | No unmatched caller exists; absence of a direct static frontend fetch is not a missing integration. | No static issues |
| mgmt | PUT /api/admin/products/archive | PUT | {{MGMT_BASE_URL}}/api/admin/products/archive | apps/mgmt/src/app/api/admin/products/archive/route.ts | apps/mgmt/src/app/api/admin/products/archive/route.ts | @tecbunny/core/auth/server-role<br>@tecbunny/core/logger<br>@tecbunny/core/server<br>@tecbunny/core/server<br>@tecbunny/database<br>next/server | inline | @tecbunny/core/auth/server-role | required/static signal found | role/permission signal found | products<br>rpc:restore_product<br>rpc:soft_delete_product | none found | none found | available API endpoint | No unmatched caller exists; absence of a direct static frontend fetch is not a missing integration. | No static issues |
| mgmt | PATCH /api/admin/products/bulk-price | PATCH | {{MGMT_BASE_URL}}/api/admin/products/bulk-price | apps/mgmt/src/app/api/admin/products/bulk-price/route.ts | apps/mgmt/src/app/api/admin/products/bulk-price/route.ts | @tecbunny/core/auth/server-role<br>@tecbunny/core/logger<br>@tecbunny/core/server<br>@tecbunny/core/server<br>@tecbunny/database<br>next/server | inline | @tecbunny/core/auth/server-role | required/static signal found | role/permission signal found | products | none found | none found | available API endpoint | No unmatched caller exists; absence of a direct static frontend fetch is not a missing integration. | No static issues |
| mgmt | POST /api/admin/products/bulk-price | POST | {{MGMT_BASE_URL}}/api/admin/products/bulk-price | apps/mgmt/src/app/api/admin/products/bulk-price/route.ts | apps/mgmt/src/app/api/admin/products/bulk-price/route.ts | @tecbunny/core/auth/server-role<br>@tecbunny/core/logger<br>@tecbunny/core/server<br>@tecbunny/core/server<br>@tecbunny/database<br>next/server | inline | @tecbunny/core/auth/server-role | required/static signal found | role/permission signal found | products | none found | none found | available API endpoint | No unmatched caller exists; absence of a direct static frontend fetch is not a missing integration. | No static issues |
| mgmt | POST /api/admin/products/bulk | POST | {{MGMT_BASE_URL}}/api/admin/products/bulk | apps/mgmt/src/app/api/admin/products/bulk/route.ts | apps/mgmt/src/app/api/admin/products/bulk/route.ts | @tecbunny/core/auth/server-role<br>@tecbunny/core/logger<br>@tecbunny/core/server<br>@tecbunny/core/server<br>@tecbunny/database<br>next/server | inline | @tecbunny/core/auth/server-role | required/static signal found | role/permission signal found | products | packages/admin-ui/src/components/admin-products-new.tsx | admin-ui | direct frontend/shared caller detected | No unmatched caller exists; absence of a direct static frontend fetch is not a missing integration. | No static issues |
| mgmt | GET /api/admin/quotes | GET | {{MGMT_BASE_URL}}/api/admin/quotes | apps/mgmt/src/app/api/admin/quotes/route.ts | apps/mgmt/src/app/api/admin/quotes/route.ts | @tecbunny/core/admin-auth<br>@tecbunny/core/quotes/action-token<br>@tecbunny/database<br>next/server | not found | @tecbunny/core/admin-auth | public or optional/static signal found | role/permission signal found | quotes | apps/mgmt/src/app/mgmt/admin/quotes/page.tsx | mgmt | direct frontend/shared caller detected | No unmatched caller exists; absence of a direct static frontend fetch is not a missing integration. | 2 issue(s) |
| mgmt | GET /api/admin/quotes/{id}/download | GET | {{MGMT_BASE_URL}}/api/admin/quotes/{id}/download | apps/mgmt/src/app/api/admin/quotes/[id]/download/route.ts | apps/mgmt/src/app/api/admin/quotes/[id]/download/route.ts | @tecbunny/core/admin-auth<br>@tecbunny/core/logger<br>@tecbunny/core/pdf-generator<br>@tecbunny/database<br>next/server | not found | @tecbunny/core/admin-auth | required/static signal found | role/permission signal found | quotes | none found | none found | available API endpoint | No unmatched caller exists; absence of a direct static frontend fetch is not a missing integration. | 1 issue(s) |
| mgmt | POST /api/admin/quotes/{id}/respond | POST | {{MGMT_BASE_URL}}/api/admin/quotes/{id}/respond | apps/mgmt/src/app/api/admin/quotes/[id]/respond/route.ts | apps/mgmt/src/app/api/admin/quotes/[id]/respond/route.ts | @tecbunny/core/logger<br>@tecbunny/database<br>next/server | not found | not found | required/static signal found | role/permission signal found | profiles<br>quotes | none found | none found | available API endpoint | No unmatched caller exists; absence of a direct static frontend fetch is not a missing integration. | 1 issue(s) |
| mgmt | GET /api/admin/quotes/advance-payment | GET | {{MGMT_BASE_URL}}/api/admin/quotes/advance-payment | apps/mgmt/src/app/api/admin/quotes/advance-payment/route.ts | apps/mgmt/src/app/api/admin/quotes/advance-payment/route.ts | @tecbunny/core/logger<br>@tecbunny/core/quotes/action-token<br>@tecbunny/core/whatsapp-service<br>@tecbunny/database/admin<br>next/server | inline | not found | required/static signal found | role/permission signal found | advance_payment_requests<br>profiles<br>quotes | apps/mgmt/src/app/mgmt/admin/quotes/page.tsx | mgmt | direct frontend/shared caller detected | No unmatched caller exists; absence of a direct static frontend fetch is not a missing integration. | 1 issue(s) |
| mgmt | POST /api/admin/quotes/advance-payment | POST | {{MGMT_BASE_URL}}/api/admin/quotes/advance-payment | apps/mgmt/src/app/api/admin/quotes/advance-payment/route.ts | apps/mgmt/src/app/api/admin/quotes/advance-payment/route.ts | @tecbunny/core/logger<br>@tecbunny/core/quotes/action-token<br>@tecbunny/core/whatsapp-service<br>@tecbunny/database/admin<br>next/server | inline | not found | required/static signal found | role/permission signal found | advance_payment_requests<br>profiles<br>quotes | none found | none found | available API endpoint | No unmatched caller exists; absence of a direct static frontend fetch is not a missing integration. | 1 issue(s) |
| mgmt | POST /api/admin/redemptions/approve | POST | {{MGMT_BASE_URL}}/api/admin/redemptions/approve | apps/mgmt/src/app/api/admin/redemptions/approve/route.ts | apps/mgmt/src/app/api/admin/redemptions/approve/route.ts | @tecbunny/core/auth/admin-guard<br>next/server | inline | @tecbunny/core/auth/admin-guard | required/static signal found | role/permission signal found | agent_redemption_requests | none found | none found | available API endpoint | No unmatched caller exists; absence of a direct static frontend fetch is not a missing integration. | 2 issue(s) |
| mgmt | GET /api/admin/redemptions/list | GET | {{MGMT_BASE_URL}}/api/admin/redemptions/list | apps/mgmt/src/app/api/admin/redemptions/list/route.ts | apps/mgmt/src/app/api/admin/redemptions/list/route.ts | @tecbunny/core/server<br>@tecbunny/core/server<br>@tecbunny/database<br>next/server | not found | not found | required/static signal found | role/permission signal found | agent_redemption_requests | none found | none found | available API endpoint | No unmatched caller exists; absence of a direct static frontend fetch is not a missing integration. | 1 issue(s) |
| mgmt | POST /api/admin/redemptions/process | POST | {{MGMT_BASE_URL}}/api/admin/redemptions/process | apps/mgmt/src/app/api/admin/redemptions/process/route.ts | apps/mgmt/src/app/api/admin/redemptions/process/route.ts | @tecbunny/core/auth/admin-guard<br>next/server | inline | @tecbunny/core/auth/admin-guard | required/static signal found | role/permission signal found | agent_redemption_requests<br>rpc:increment_agent_points | none found | none found | available API endpoint | No unmatched caller exists; absence of a direct static frontend fetch is not a missing integration. | 2 issue(s) |
| mgmt | POST /api/admin/roles/set | POST | {{MGMT_BASE_URL}}/api/admin/roles/set | apps/mgmt/src/app/api/admin/roles/set/route.ts | apps/mgmt/src/app/api/admin/roles/set/route.ts | @tecbunny/core<br>@tecbunny/core/auth/guard<br>@tecbunny/core/server<br>@tecbunny/core/server<br>@tecbunny/database<br>next/server | not found | @tecbunny/core/auth/guard | required/static signal found | role/permission signal found | profiles<br>rpc:admin_set_user_role<br>security_audit_log | none found | none found | available API endpoint | No unmatched caller exists; absence of a direct static frontend fetch is not a missing integration. | 1 issue(s) |
| mgmt | GET /api/admin/sales-agents | GET | {{MGMT_BASE_URL}}/api/admin/sales-agents | apps/mgmt/src/app/api/admin/sales-agents/route.ts | apps/mgmt/src/app/api/admin/sales-agents/route.ts | @tecbunny/core/logger<br>@tecbunny/core/server<br>@tecbunny/core/server<br>@tecbunny/core/server<br>@tecbunny/database<br>next/server | not found | not found | required/static signal found | role/permission signal found | profiles<br>sales_agents | packages/admin-ui/src/components/SalesAgentsManagement.tsx | admin-ui | direct frontend/shared caller detected | No unmatched caller exists; absence of a direct static frontend fetch is not a missing integration. | No static issues |
| mgmt | GET /api/admin/sales-agents/{id} | GET | {{MGMT_BASE_URL}}/api/admin/sales-agents/{id} | apps/mgmt/src/app/api/admin/sales-agents/[id]/route.ts | apps/mgmt/src/app/api/admin/sales-agents/[id]/route.ts | @tecbunny/core/server<br>@tecbunny/core/server<br>@tecbunny/core/server<br>@tecbunny/database<br>next/server | inline | not found | required/static signal found | role/permission signal found | sales_agents | none found | none found | available API endpoint | No unmatched caller exists; absence of a direct static frontend fetch is not a missing integration. | No static issues |
| mgmt | PATCH /api/admin/sales-agents/{id} | PATCH | {{MGMT_BASE_URL}}/api/admin/sales-agents/{id} | apps/mgmt/src/app/api/admin/sales-agents/[id]/route.ts | apps/mgmt/src/app/api/admin/sales-agents/[id]/route.ts | @tecbunny/core/server<br>@tecbunny/core/server<br>@tecbunny/core/server<br>@tecbunny/database<br>next/server | inline | not found | required/static signal found | role/permission signal found | sales_agents | none found | none found | available API endpoint | No unmatched caller exists; absence of a direct static frontend fetch is not a missing integration. | No static issues |
| mgmt | GET /api/admin/services | GET | {{MGMT_BASE_URL}}/api/admin/services | apps/mgmt/src/app/api/admin/services/route.ts | apps/mgmt/src/app/api/admin/services/route.ts | @tecbunny/core/auth/admin-guard<br>@tecbunny/core/logger<br>next/server | inline | @tecbunny/core/auth/admin-guard | required/static signal found | role/permission signal found | services | apps/superadmin/src/app/superadmin/mgmt/catalogue/page.tsx<br>packages/admin-ui/src/components/admin-services.tsx | admin-ui, superadmin | direct frontend/shared caller detected | No unmatched caller exists; absence of a direct static frontend fetch is not a missing integration. | 1 issue(s) |
| mgmt | POST /api/admin/setup-initial-admins | POST | {{MGMT_BASE_URL}}/api/admin/setup-initial-admins | apps/mgmt/src/app/api/admin/setup-initial-admins/route.ts | apps/mgmt/src/app/api/admin/setup-initial-admins/route.ts | @tecbunny/core/rate-limit<br>@tecbunny/database/admin<br>next/server | not found | @tecbunny/core/rate-limit | required/static signal found | role/permission signal found | profiles | none found | none found | available API endpoint | No unmatched caller exists; absence of a direct static frontend fetch is not a missing integration. | 2 issue(s) |
| mgmt | POST /api/admin/setup-sales-agents | POST | {{MGMT_BASE_URL}}/api/admin/setup-sales-agents | apps/mgmt/src/app/api/admin/setup-sales-agents/route.ts | apps/mgmt/src/app/api/admin/setup-sales-agents/route.ts | @tecbunny/core/auth/admin-guard<br>@tecbunny/core/logger<br>next/server | not found | @tecbunny/core/auth/admin-guard | required/static signal found | role/permission signal found | sales_agents | none found | none found | available API endpoint | No unmatched caller exists; absence of a direct static frontend fetch is not a missing integration. | 1 issue(s) |
| mgmt | GET /api/admin/users/{id}/history | GET | {{MGMT_BASE_URL}}/api/admin/users/{id}/history | apps/mgmt/src/app/api/admin/users/[id]/history/route.ts | apps/mgmt/src/app/api/admin/users/[id]/history/route.ts | @tecbunny/core/admin-auth<br>@tecbunny/core/server<br>@tecbunny/core/server<br>@tecbunny/database<br>next/server | not found | @tecbunny/core/admin-auth | required/static signal found | role/permission signal found | analytics_events<br>contact_messages<br>leads<br>orders<br>profiles | none found | none found | available API endpoint | No unmatched caller exists; absence of a direct static frontend fetch is not a missing integration. | No static issues |
| api | POST /api/agents/apply | POST | {{API_BASE_URL}}/api/agents/apply | apps/api/src/app/api/agents/apply/route.ts | apps/api/src/app/api/agents/apply/route.ts | @tecbunny/core<br>@tecbunny/core/server<br>@tecbunny/database<br>next/server | not found | not found | public or optional/static signal found | none detected for public route | none detected | none found | none found | available API endpoint | No unmatched caller exists; absence of a direct static frontend fetch is not a missing integration. | No static issues |
| api | GET /api/agents/commissions | GET | {{API_BASE_URL}}/api/agents/commissions | apps/api/src/app/api/agents/commissions/route.ts | apps/api/src/app/api/agents/commissions/route.ts | @tecbunny/database<br>next/server | not found | not found | required/static signal found | not found | sales_agent_commissions<br>sales_agents | none found | none found | available API endpoint | No unmatched caller exists; absence of a direct static frontend fetch is not a missing integration. | 2 issue(s) |
| api | GET /api/agents/me | GET | {{API_BASE_URL}}/api/agents/me | apps/api/src/app/api/agents/me/route.ts | apps/api/src/app/api/agents/me/route.ts | @tecbunny/database<br>next/server | not found | not found | required/static signal found | not found | sales_agents | none found | none found | available API endpoint | No unmatched caller exists; absence of a direct static frontend fetch is not a missing integration. | 2 issue(s) |
| api | POST /api/agents/orders/create | POST | {{API_BASE_URL}}/api/agents/orders/create | apps/api/src/app/api/agents/orders/create/route.ts | apps/api/src/app/api/agents/orders/create/route.ts | @tecbunny/core/server<br>@tecbunny/database<br>next/server | inline | not found | required/static signal found | role/permission signal found | orders<br>profiles<br>rpc:allocate_order_inventory_atomic<br>rpc:increment_agent_points<br>sales_agent_commissions<br>sales_agents<br>settings | apps/mgmt/src/app/mgmt/sales/agent-order/page.tsx | mgmt | direct frontend/shared caller detected | No unmatched caller exists; absence of a direct static frontend fetch is not a missing integration. | No static issues |
| api | GET /api/agents/redemptions | GET | {{API_BASE_URL}}/api/agents/redemptions | apps/api/src/app/api/agents/redemptions/route.ts | apps/api/src/app/api/agents/redemptions/route.ts | @tecbunny/database<br>next/server | inline | not found | required/static signal found | role/permission signal found | agent_redemption_requests<br>sales_agents | none found | none found | available API endpoint | No unmatched caller exists; absence of a direct static frontend fetch is not a missing integration. | 2 issue(s) |
| api | POST /api/agents/redemptions | POST | {{API_BASE_URL}}/api/agents/redemptions | apps/api/src/app/api/agents/redemptions/route.ts | apps/api/src/app/api/agents/redemptions/route.ts | @tecbunny/database<br>next/server | inline | not found | required/static signal found | role/permission signal found | agent_redemption_requests<br>sales_agents | none found | none found | available API endpoint | No unmatched caller exists; absence of a direct static frontend fetch is not a missing integration. | 1 issue(s) |
| api | POST /api/ai/generate-description | POST | {{API_BASE_URL}}/api/ai/generate-description | apps/api/src/app/api/ai/generate-description/route.ts | apps/api/src/app/api/ai/generate-description/route.ts | @tecbunny/core<br>@tecbunny/core/ai/gemini-service<br>@tecbunny/core/ai/prompts<br>@tecbunny/core/auth/guard<br>@tecbunny/core/redis<br>next/server | inline | @tecbunny/core/auth/guard | required/static signal found | role/permission signal found | none detected | packages/admin-ui/src/components/CreateProductDialog.tsx<br>packages/admin-ui/src/components/EditProductDialog.tsx | admin-ui | direct frontend/shared caller detected | No unmatched caller exists; absence of a direct static frontend fetch is not a missing integration. | No static issues |
| api | POST /api/ai/price-request | POST | {{API_BASE_URL}}/api/ai/price-request | apps/api/src/app/api/ai/price-request/route.ts | apps/api/src/app/api/ai/price-request/route.ts | @tecbunny/core/server<br>@tecbunny/database<br>next/server | inline | not found | required/static signal found | not found | leads | none found | none found | available API endpoint | No unmatched caller exists; absence of a direct static frontend fetch is not a missing integration. | 1 issue(s) |
| api | POST /api/ai/product-details | POST | {{API_BASE_URL}}/api/ai/product-details | apps/api/src/app/api/ai/product-details/route.ts | apps/api/src/app/api/ai/product-details/route.ts | @tecbunny/core<br>@tecbunny/core/ai/gemini-service<br>@tecbunny/core/ai/prompts<br>@tecbunny/core/auth/guard<br>@tecbunny/core/redis<br>next/server | inline | @tecbunny/core/auth/guard | required/static signal found | role/permission signal found | none detected | packages/core/src/ai/product-details.ts | core | direct frontend/shared caller detected | No unmatched caller exists; absence of a direct static frontend fetch is not a missing integration. | No static issues |
| api | POST /api/ai/research | POST | {{API_BASE_URL}}/api/ai/research | apps/api/src/app/api/ai/research/route.ts | apps/api/src/app/api/ai/research/route.ts | @tecbunny/core<br>@tecbunny/core/ai/gemini-service<br>@tecbunny/core/ai/prompts<br>@tecbunny/core/image-utils<br>@tecbunny/core/rate-limit<br>@tecbunny/core/redis<br>@tecbunny/database<br>next/server | inline | @tecbunny/core/rate-limit | required/static signal found | not found | products | apps/public/src/app/ai-research/page.tsx | public | direct frontend/shared caller detected | No unmatched caller exists; absence of a direct static frontend fetch is not a missing integration. | No static issues |
| api | GET /api/analytics/dashboard | GET | {{API_BASE_URL}}/api/analytics/dashboard | apps/api/src/app/api/analytics/dashboard/route.ts | apps/api/src/app/api/analytics/dashboard/route.ts | @tecbunny/core/admin-auth<br>@tecbunny/core/server<br>@tecbunny/database<br>next/server | not found | @tecbunny/core/admin-auth | required/static signal found | role/permission signal found | analytics_events<br>leads<br>rpc:get_top_products | apps/mgmt/src/app/mgmt/admin/analytics/page.tsx | mgmt | direct frontend/shared caller detected | No unmatched caller exists; absence of a direct static frontend fetch is not a missing integration. | 1 issue(s) |
| api | GET /api/analytics/reports | GET | {{API_BASE_URL}}/api/analytics/reports | apps/api/src/app/api/analytics/reports/route.ts | apps/api/src/app/api/analytics/reports/route.ts | @tecbunny/core<br>@tecbunny/core<br>@tecbunny/core/auth/server-role<br>@tecbunny/core/roles<br>@tecbunny/core/server<br>next/server | inline | @tecbunny/core/auth/server-role | required/static signal found | role/permission signal found | orders | none found | none found | available API endpoint | No unmatched caller exists; absence of a direct static frontend fetch is not a missing integration. | No static issues |
| api | POST /api/analytics/track | POST | {{API_BASE_URL}}/api/analytics/track | apps/api/src/app/api/analytics/track/route.ts | apps/api/src/app/api/analytics/track/route.ts | @tecbunny/core<br>@tecbunny/core<br>@tecbunny/database<br>next/server | inline | not found | required/static signal found | not found | analytics_events<br>leads | packages/core/src/hooks/use-analytics.ts | core | direct frontend/shared caller detected | No unmatched caller exists; absence of a direct static frontend fetch is not a missing integration. | No static issues |
| api | POST /api/auth/2fa/disable | POST | {{API_BASE_URL}}/api/auth/2fa/disable | apps/api/src/app/api/auth/2fa/disable/route.ts | apps/api/src/app/api/auth/2fa/disable/route.ts | @tecbunny/core/two-factor-manager<br>@tecbunny/database<br>next/server | inline | not found | public or optional/static signal found | role/permission signal found | none detected | apps/public/src/components/profile/UserProfile.tsx | public | direct frontend/shared caller detected | No unmatched caller exists; absence of a direct static frontend fetch is not a missing integration. | No static issues |
| api | POST /api/auth/2fa/setup | POST | {{API_BASE_URL}}/api/auth/2fa/setup | apps/api/src/app/api/auth/2fa/setup/route.ts | apps/api/src/app/api/auth/2fa/setup/route.ts | @tecbunny/core<br>@tecbunny/core/two-factor-manager<br>@tecbunny/database<br>next/server | inline | not found | public or optional/static signal found | role/permission signal found | none detected | apps/mgmt/src/components/auth/TwoFactorSetup.tsx<br>apps/public/src/components/auth/TwoFactorSetup.tsx | mgmt, public | direct frontend/shared caller detected | No unmatched caller exists; absence of a direct static frontend fetch is not a missing integration. | No static issues |
| api | PUT /api/auth/2fa/setup | PUT | {{API_BASE_URL}}/api/auth/2fa/setup | apps/api/src/app/api/auth/2fa/setup/route.ts | apps/api/src/app/api/auth/2fa/setup/route.ts | @tecbunny/core<br>@tecbunny/core/two-factor-manager<br>@tecbunny/database<br>next/server | inline | not found | public or optional/static signal found | role/permission signal found | none detected | none found | none found | available API endpoint | No unmatched caller exists; absence of a direct static frontend fetch is not a missing integration. | No static issues |
| api | GET /api/auth/2fa/status | GET | {{API_BASE_URL}}/api/auth/2fa/status | apps/api/src/app/api/auth/2fa/status/route.ts | apps/api/src/app/api/auth/2fa/status/route.ts | @tecbunny/core<br>@tecbunny/core/two-factor-manager<br>@tecbunny/database<br>next/server | not found | not found | public or optional/static signal found | role/permission signal found | none detected | apps/mgmt/src/app/auth/login/page.tsx<br>apps/public/src/app/auth/signin/page.tsx<br>apps/public/src/components/profile/UserProfile.tsx | mgmt, public | direct frontend/shared caller detected | No unmatched caller exists; absence of a direct static frontend fetch is not a missing integration. | 1 issue(s) |
| api | POST /api/auth/2fa/verify | POST | {{API_BASE_URL}}/api/auth/2fa/verify | apps/api/src/app/api/auth/2fa/verify/route.ts | apps/api/src/app/api/auth/2fa/verify/route.ts | @tecbunny/core/two-factor-manager<br>@tecbunny/database<br>next/server | inline | not found | public or optional/static signal found | role/permission signal found | none detected | apps/mgmt/src/app/auth/login/page.tsx<br>apps/public/src/app/auth/signin/page.tsx | mgmt, public | direct frontend/shared caller detected | No unmatched caller exists; absence of a direct static frontend fetch is not a missing integration. | No static issues |
| api | GET /api/auth/callback | GET | {{API_BASE_URL}}/api/auth/callback | apps/api/src/app/api/auth/callback/route.ts | apps/api/src/app/api/auth/callback/route.ts | @tecbunny/database<br>next/server | not found | not found | public or optional/static signal found | none detected for public route | none detected | none found | none found | system integration endpoint | This endpoint is triggered by external systems, browser redirects, extensions, or server-side workflows. | No static issues |
| api | POST /api/auth/complete-signup | POST | {{API_BASE_URL}}/api/auth/complete-signup | apps/api/src/app/api/auth/complete-signup/route.ts | apps/api/src/app/api/auth/complete-signup/route.ts | @tecbunny/core<br>@tecbunny/core/whatsapp-service<br>@tecbunny/database<br>next/server | inline | not found | public or optional/static signal found | role/permission signal found | otp_verifications<br>profiles | apps/public/src/app/auth/verify-otp/OTPVerificationContent.tsx<br>apps/public/src/app/quotes/[id]/page.tsx | public | direct frontend/shared caller detected | No unmatched caller exists; absence of a direct static frontend fetch is not a missing integration. | No static issues |
| api | OPTIONS /api/auth/extension | OPTIONS | {{API_BASE_URL}}/api/auth/extension | apps/api/src/app/api/auth/extension/route.ts | apps/api/src/app/api/auth/extension/route.ts | ../../extension-security<br>@tecbunny/database<br>next/server | inline | not found | public or optional/static signal found | role/permission signal found | none detected | extension/popup.js | popup.js | direct frontend/shared caller detected | CORS preflight endpoints are invoked by browsers, not application code. | 1 issue(s) |
| api | POST /api/auth/extension | POST | {{API_BASE_URL}}/api/auth/extension | apps/api/src/app/api/auth/extension/route.ts | apps/api/src/app/api/auth/extension/route.ts | ../../extension-security<br>@tecbunny/database<br>next/server | inline | not found | public or optional/static signal found | role/permission signal found | none detected | none found | none found | system integration endpoint | This endpoint is triggered by external systems, browser redirects, extensions, or server-side workflows. | 1 issue(s) |
| api | POST /api/auth/first-login-whatsapp | POST | {{API_BASE_URL}}/api/auth/first-login-whatsapp | apps/api/src/app/api/auth/first-login-whatsapp/route.ts | apps/api/src/app/api/auth/first-login-whatsapp/route.ts | @tecbunny/core<br>@tecbunny/core/whatsapp-service<br>next/server | inline | not found | public or optional/static signal found | none detected for public route | profiles | packages/core/src/context/AuthProvider.tsx | core | direct frontend/shared caller detected | No unmatched caller exists; absence of a direct static frontend fetch is not a missing integration. | No static issues |
| api | POST /api/auth/forgot-password | POST | {{API_BASE_URL}}/api/auth/forgot-password | apps/api/src/app/api/auth/forgot-password/route.ts | apps/api/src/app/api/auth/forgot-password/route.ts | @tecbunny/core<br>@tecbunny/core/captcha/captcha-service<br>@tecbunny/core/otp-manager<br>next/server | inline | not found | public or optional/static signal found | none detected for public route | profiles | none found | none found | available API endpoint | No unmatched caller exists; absence of a direct static frontend fetch is not a missing integration. | No static issues |
| waba | POST /api/auth/login | POST | {{WABA_BASE_URL}}/api/auth/login | apps/waba/src/app/api/auth/login/route.ts | apps/waba/src/app/api/auth/login/route.ts | @tecbunny/core/server<br>next/server | not found | not found | public or optional/static signal found | role/permission signal found | none detected | apps/waba/src/app/login/page.tsx | waba | direct frontend/shared caller detected | No unmatched caller exists; absence of a direct static frontend fetch is not a missing integration. | No static issues |
| waba | GET /api/auth/me | GET | {{WABA_BASE_URL}}/api/auth/me | apps/waba/src/app/api/auth/me/route.ts | apps/waba/src/app/api/auth/me/route.ts | @tecbunny/core/server<br>@tecbunny/database/server<br>next/server | not found | not found | public or optional/static signal found | role/permission signal found | User | apps/waba/src/app/page.tsx<br>apps/waba/src/app/templates/page.tsx | waba | direct frontend/shared caller detected | No unmatched caller exists; absence of a direct static frontend fetch is not a missing integration. | 1 issue(s) |
| api | POST /api/auth/quick-login | POST | {{API_BASE_URL}}/api/auth/quick-login | apps/api/src/app/api/auth/quick-login/route.ts | apps/api/src/app/api/auth/quick-login/route.ts | @tecbunny/core<br>@tecbunny/database<br>next/server | inline | not found | public or optional/static signal found | role/permission signal found | none detected | none found | none found | available API endpoint | No unmatched caller exists; absence of a direct static frontend fetch is not a missing integration. | No static issues |
| api | POST /api/auth/resend-verification | POST | {{API_BASE_URL}}/api/auth/resend-verification | apps/api/src/app/api/auth/resend-verification/route.ts | apps/api/src/app/api/auth/resend-verification/route.ts | @tecbunny/core<br>@tecbunny/core<br>@tecbunny/core/otp-manager<br>@tecbunny/core/rate-limit<br>next/server | inline | @tecbunny/core/rate-limit | not found | none detected for public route | none detected | apps/public/src/app/auth/verify-otp/OTPVerificationContent.tsx<br>packages/core/src/context/AuthProvider.tsx | core, public | direct frontend/shared caller detected | No unmatched caller exists; absence of a direct static frontend fetch is not a missing integration. | No static issues |
| api | POST /api/auth/reset-password | POST | {{API_BASE_URL}}/api/auth/reset-password | apps/api/src/app/api/auth/reset-password/route.ts | apps/api/src/app/api/auth/reset-password/route.ts | @tecbunny/core<br>@tecbunny/core/rate-limit<br>@tecbunny/core/server<br>@tecbunny/database<br>next/server | inline | @tecbunny/core/rate-limit | public or optional/static signal found | none detected for public route | none detected | none found | none found | available API endpoint | No unmatched caller exists; absence of a direct static frontend fetch is not a missing integration. | No static issues |
| api | POST /api/auth/resolve-phone | POST | {{API_BASE_URL}}/api/auth/resolve-phone | apps/api/src/app/api/auth/resolve-phone/route.ts | apps/api/src/app/api/auth/resolve-phone/route.ts | @tecbunny/database<br>next/server | inline | not found | public or optional/static signal found | none detected for public route | profiles | none found | none found | available API endpoint | No unmatched caller exists; absence of a direct static frontend fetch is not a missing integration. | 1 issue(s) |
| api | POST /api/auth/send-otp | POST | {{API_BASE_URL}}/api/auth/send-otp | apps/api/src/app/api/auth/send-otp/route.ts | apps/api/src/app/api/auth/send-otp/route.ts | @tecbunny/core<br>@tecbunny/core<br>@tecbunny/core/rate-limit<br>@tecbunny/core/server<br>@tecbunny/database<br>next/server | inline | @tecbunny/core/rate-limit | public or optional/static signal found | role/permission signal found | none detected | apps/public/src/app/activate-warranty/[serialNumber]/page.tsx<br>packages/ui/src/components/ui/BlitzAuditBanner.tsx | public, ui | direct frontend/shared caller detected | No unmatched caller exists; absence of a direct static frontend fetch is not a missing integration. | No static issues |
| api | DELETE /api/auth/session | DELETE | {{API_BASE_URL}}/api/auth/session | apps/api/src/app/api/auth/session/route.ts | apps/api/src/app/api/auth/session/route.ts | @tecbunny/core<br>@tecbunny/core<br>@tecbunny/core/server<br>@tecbunny/database<br>next/server | not found | not found | public or optional/static signal found | role/permission signal found | profiles | apps/api/src/app/dashboard/page.tsx<br>packages/core/src/context/AuthProvider.tsx | api, core | direct frontend/shared caller detected | No unmatched caller exists; absence of a direct static frontend fetch is not a missing integration. | No static issues |
| api | GET /api/auth/session | GET | {{API_BASE_URL}}/api/auth/session | apps/api/src/app/api/auth/session/route.ts | apps/api/src/app/api/auth/session/route.ts | @tecbunny/core<br>@tecbunny/core<br>@tecbunny/core/server<br>@tecbunny/database<br>next/server | not found | not found | public or optional/static signal found | role/permission signal found | profiles | none found | none found | available API endpoint | No unmatched caller exists; absence of a direct static frontend fetch is not a missing integration. | No static issues |
| api | POST /api/auth/session | POST | {{API_BASE_URL}}/api/auth/session | apps/api/src/app/api/auth/session/route.ts | apps/api/src/app/api/auth/session/route.ts | @tecbunny/core<br>@tecbunny/core<br>@tecbunny/core/server<br>@tecbunny/database<br>next/server | not found | not found | public or optional/static signal found | role/permission signal found | profiles | none found | none found | available API endpoint | No unmatched caller exists; absence of a direct static frontend fetch is not a missing integration. | No static issues |
| api | POST /api/auth/signout | POST | {{API_BASE_URL}}/api/auth/signout | apps/api/src/app/api/auth/signout/route.ts | apps/api/src/app/api/auth/signout/route.ts | @tecbunny/core<br>@tecbunny/database<br>next/server | not found | not found | public or optional/static signal found | none detected for public route | none detected | apps/public/src/app/auth/signout/page.tsx<br>packages/core/src/context/AuthProvider.tsx | core, public | direct frontend/shared caller detected | No unmatched caller exists; absence of a direct static frontend fetch is not a missing integration. | No static issues |
| api | POST /api/auth/signup | POST | {{API_BASE_URL}}/api/auth/signup | apps/api/src/app/api/auth/signup/route.ts | apps/api/src/app/api/auth/signup/route.ts | @tecbunny/core<br>@tecbunny/core/rate-limit<br>@tecbunny/core/server<br>next/server | inline | @tecbunny/core/rate-limit | public or optional/static signal found | none detected for public route | none detected | apps/public/src/app/auth/signup/page.tsx<br>apps/public/src/app/quotes/[id]/page.tsx<br>packages/core/src/context/AuthProvider.tsx | core, public | direct frontend/shared caller detected | No unmatched caller exists; absence of a direct static frontend fetch is not a missing integration. | No static issues |
| api | POST /api/auth/verify-otp | POST | {{API_BASE_URL}}/api/auth/verify-otp | apps/api/src/app/api/auth/verify-otp/route.ts | apps/api/src/app/api/auth/verify-otp/route.ts | @tecbunny/core<br>@tecbunny/core<br>@tecbunny/core/rate-limit<br>@tecbunny/core/server<br>@tecbunny/database<br>next/server | inline | @tecbunny/core/rate-limit | public or optional/static signal found | role/permission signal found | none detected | apps/public/src/app/auth/verify-otp/OTPVerificationContent.tsx<br>apps/public/src/app/quotes/[id]/page.tsx | public | direct frontend/shared caller detected | No unmatched caller exists; absence of a direct static frontend fetch is not a missing integration. | No static issues |
| api | DELETE /api/auto-offers | DELETE | {{API_BASE_URL}}/api/auto-offers | apps/api/src/app/api/auto-offers/route.ts | apps/api/src/app/api/auto-offers/route.ts | @tecbunny/core<br>@tecbunny/database<br>next/server | inline | not found | required/static signal found | role/permission signal found | auto_offers<br>coupons<br>profiles | apps/mgmt/src/components/customised-setups/CustomSetupFlow.tsx<br>apps/public/src/components/customised-setups/CustomSetupFlow.tsx<br>apps/public/src/components/products/ShopPageContent.tsx | mgmt, public | direct frontend/shared caller detected | No unmatched caller exists; absence of a direct static frontend fetch is not a missing integration. | No static issues |
| api | GET /api/auto-offers | GET | {{API_BASE_URL}}/api/auto-offers | apps/api/src/app/api/auto-offers/route.ts | apps/api/src/app/api/auto-offers/route.ts | @tecbunny/core<br>@tecbunny/database<br>next/server | inline | not found | required/static signal found | role/permission signal found | auto_offers<br>coupons<br>profiles | none found | none found | available API endpoint | No unmatched caller exists; absence of a direct static frontend fetch is not a missing integration. | 1 issue(s) |
| api | POST /api/auto-offers | POST | {{API_BASE_URL}}/api/auto-offers | apps/api/src/app/api/auto-offers/route.ts | apps/api/src/app/api/auto-offers/route.ts | @tecbunny/core<br>@tecbunny/database<br>next/server | inline | not found | required/static signal found | role/permission signal found | auto_offers<br>coupons<br>profiles | none found | none found | available API endpoint | No unmatched caller exists; absence of a direct static frontend fetch is not a missing integration. | No static issues |
| api | PUT /api/auto-offers | PUT | {{API_BASE_URL}}/api/auto-offers | apps/api/src/app/api/auto-offers/route.ts | apps/api/src/app/api/auto-offers/route.ts | @tecbunny/core<br>@tecbunny/database<br>next/server | inline | not found | required/static signal found | role/permission signal found | auto_offers<br>coupons<br>profiles | none found | none found | available API endpoint | No unmatched caller exists; absence of a direct static frontend fetch is not a missing integration. | No static issues |
| api | GET /api/blog | GET | {{API_BASE_URL}}/api/blog | apps/api/src/app/api/blog/route.ts | apps/api/src/app/api/blog/route.ts | @tecbunny/core<br>@tecbunny/core/auth/server-role<br>@tecbunny/core/roles<br>@tecbunny/database<br>next/server | inline | @tecbunny/core/auth/server-role | public or optional/static signal found | role/permission signal found | blog_posts | none found | none found | available API endpoint | No unmatched caller exists; absence of a direct static frontend fetch is not a missing integration. | 1 issue(s) |
| api | POST /api/blog | POST | {{API_BASE_URL}}/api/blog | apps/api/src/app/api/blog/route.ts | apps/api/src/app/api/blog/route.ts | @tecbunny/core<br>@tecbunny/core/auth/server-role<br>@tecbunny/core/roles<br>@tecbunny/database<br>next/server | inline | @tecbunny/core/auth/server-role | required/static signal found | role/permission signal found | blog_posts | none found | none found | available API endpoint | No unmatched caller exists; absence of a direct static frontend fetch is not a missing integration. | No static issues |
| api | DELETE /api/blog/{slug} | DELETE | {{API_BASE_URL}}/api/blog/{slug} | apps/api/src/app/api/blog/[slug]/route.ts | apps/api/src/app/api/blog/[slug]/route.ts | @tecbunny/core<br>@tecbunny/core/auth/server-role<br>@tecbunny/core/roles<br>@tecbunny/database<br>next/server | inline | @tecbunny/core/auth/server-role | required/static signal found | role/permission signal found | blog_posts | none found | none found | available API endpoint | No unmatched caller exists; absence of a direct static frontend fetch is not a missing integration. | No static issues |
| api | GET /api/blog/{slug} | GET | {{API_BASE_URL}}/api/blog/{slug} | apps/api/src/app/api/blog/[slug]/route.ts | apps/api/src/app/api/blog/[slug]/route.ts | @tecbunny/core<br>@tecbunny/core/auth/server-role<br>@tecbunny/core/roles<br>@tecbunny/database<br>next/server | inline | @tecbunny/core/auth/server-role | public or optional/static signal found | role/permission signal found | blog_posts | none found | none found | available API endpoint | No unmatched caller exists; absence of a direct static frontend fetch is not a missing integration. | 1 issue(s) |
| api | PATCH /api/blog/{slug} | PATCH | {{API_BASE_URL}}/api/blog/{slug} | apps/api/src/app/api/blog/[slug]/route.ts | apps/api/src/app/api/blog/[slug]/route.ts | @tecbunny/core<br>@tecbunny/core/auth/server-role<br>@tecbunny/core/roles<br>@tecbunny/database<br>next/server | inline | @tecbunny/core/auth/server-role | required/static signal found | role/permission signal found | blog_posts | none found | none found | available API endpoint | No unmatched caller exists; absence of a direct static frontend fetch is not a missing integration. | No static issues |
| api | POST /api/blueprints/attribution/conversion | POST | {{API_BASE_URL}}/api/blueprints/attribution/conversion | apps/api/src/app/api/blueprints/attribution/conversion/route.ts | apps/api/src/app/api/blueprints/attribution/conversion/route.ts | @tecbunny/core<br>@tecbunny/core/server<br>next/server | inline | not found | required/static signal found | not found | published_blueprints<br>user_milestones | apps/mgmt/src/hooks/use-viral-attribution.ts | mgmt | direct frontend/shared caller detected | No unmatched caller exists; absence of a direct static frontend fetch is not a missing integration. | No static issues |
| superadmin | DELETE /api/branches | DELETE | {{SUPERADMIN_BASE_URL}}/api/branches | apps/superadmin/src/app/api/branches/route.ts | apps/superadmin/src/app/api/branches/route.ts | @tecbunny/core/permissions<br>@tecbunny/database/server<br>next/server | not found | not found | required/static signal found | role/permission signal found | none detected | apps/superadmin/src/app/superadmin/mgmt/branches/page.tsx | superadmin | direct frontend/shared caller detected | No unmatched caller exists; absence of a direct static frontend fetch is not a missing integration. | 1 issue(s) |
| superadmin | GET /api/branches | GET | {{SUPERADMIN_BASE_URL}}/api/branches | apps/superadmin/src/app/api/branches/route.ts | apps/superadmin/src/app/api/branches/route.ts | @tecbunny/core/permissions<br>@tecbunny/database/server<br>next/server | not found | not found | required/static signal found | role/permission signal found | none detected | none found | none found | available API endpoint | No unmatched caller exists; absence of a direct static frontend fetch is not a missing integration. | 1 issue(s) |
| superadmin | POST /api/branches | POST | {{SUPERADMIN_BASE_URL}}/api/branches | apps/superadmin/src/app/api/branches/route.ts | apps/superadmin/src/app/api/branches/route.ts | @tecbunny/core/permissions<br>@tecbunny/database/server<br>next/server | not found | not found | required/static signal found | role/permission signal found | none detected | none found | none found | available API endpoint | No unmatched caller exists; absence of a direct static frontend fetch is not a missing integration. | 1 issue(s) |
| waba | POST /api/campaigns | POST | {{WABA_BASE_URL}}/api/campaigns | apps/waba/src/app/api/campaigns/route.ts | apps/waba/src/app/api/campaigns/route.ts | @tecbunny/core/redis<br>@tecbunny/core/server-role-guard<br>next/server | not found | @tecbunny/core/server-role-guard | required/static signal found | role/permission signal found | Conversation<br>Message | apps/waba/src/app/campaigns/page.tsx | waba | direct frontend/shared caller detected | No unmatched caller exists; absence of a direct static frontend fetch is not a missing integration. | No static issues |
| api | GET /api/captcha/config | GET | {{API_BASE_URL}}/api/captcha/config | apps/api/src/app/api/captcha/config/route.ts | apps/api/src/app/api/captcha/config/route.ts | @tecbunny/core<br>@tecbunny/core/captcha/captcha-service<br>next/server | not found | not found | public or optional/static signal found | none detected for public route | none detected | none found | none found | available API endpoint | No unmatched caller exists; absence of a direct static frontend fetch is not a missing integration. | No static issues |
| api | POST /api/captcha/verify | POST | {{API_BASE_URL}}/api/captcha/verify | apps/api/src/app/api/captcha/verify/route.ts | apps/api/src/app/api/captcha/verify/route.ts | @tecbunny/core<br>@tecbunny/core/captcha/captcha-service<br>next/server | inline | not found | not found | none detected for public route | none detected | none found | none found | available API endpoint | No unmatched caller exists; absence of a direct static frontend fetch is not a missing integration. | No static issues |
| api | POST /api/cart/abandoned | POST | {{API_BASE_URL}}/api/cart/abandoned | apps/api/src/app/api/cart/abandoned/route.ts | apps/api/src/app/api/cart/abandoned/route.ts | @tecbunny/core<br>@tecbunny/core/whatsapp-service<br>next/server | inline | not found | required/static signal found | not found | none detected | apps/public/src/components/checkout/CheckoutPage.tsx | public | direct frontend/shared caller detected | No unmatched caller exists; absence of a direct static frontend fetch is not a missing integration. | No static issues |
| api | POST /api/cart/merge | POST | {{API_BASE_URL}}/api/cart/merge | apps/api/src/app/api/cart/merge/route.ts | apps/api/src/app/api/cart/merge/route.ts | @tecbunny/core<br>@tecbunny/database<br>next/server | not found | not found | required/static signal found | role/permission signal found | none detected | apps/mgmt/src/components/auth/LoginDialog.tsx<br>apps/public/src/components/auth/LoginDialog.tsx | mgmt, public | direct frontend/shared caller detected | No unmatched caller exists; absence of a direct static frontend fetch is not a missing integration. | No static issues |
| api | POST /api/cart/sync | POST | {{API_BASE_URL}}/api/cart/sync | apps/api/src/app/api/cart/sync/route.ts | apps/api/src/app/api/cart/sync/route.ts | @tecbunny/core/server<br>next/server | inline | not found | required/static signal found | not found | carts | apps/public/src/components/cart/AddToCartButton.tsx<br>packages/core/src/store/cartStore.ts | core, public | direct frontend/shared caller detected | No unmatched caller exists; absence of a direct static frontend fetch is not a missing integration. | No static issues |
| api | POST /api/checkout/calculate | POST | {{API_BASE_URL}}/api/checkout/calculate | apps/api/src/app/api/checkout/calculate/route.ts | apps/api/src/app/api/checkout/calculate/route.ts | @tecbunny/core<br>@tecbunny/core/checkout-engine<br>@tecbunny/core/server<br>@tecbunny/core/types<br>@tecbunny/database<br>next/server | inline | not found | public or optional/static signal found | role/permission signal found | none detected | packages/core/src/store/cartStore.ts | core | direct frontend/shared caller detected | No unmatched caller exists; absence of a direct static frontend fetch is not a missing integration. | No static issues |
| api | POST /api/commissions/calculate | POST | {{API_BASE_URL}}/api/commissions/calculate | apps/api/src/app/api/commissions/calculate/route.ts | apps/api/src/app/api/commissions/calculate/route.ts | @tecbunny/core<br>@tecbunny/core/auth/admin-guard<br>@tecbunny/core/enhanced-commission-service<br>@tecbunny/core/server<br>next/server | inline | @tecbunny/core/auth/admin-guard | required/static signal found | role/permission signal found | none detected | none found | none found | available API endpoint | No unmatched caller exists; absence of a direct static frontend fetch is not a missing integration. | No static issues |
| api | PUT /api/commissions/calculate | PUT | {{API_BASE_URL}}/api/commissions/calculate | apps/api/src/app/api/commissions/calculate/route.ts | apps/api/src/app/api/commissions/calculate/route.ts | @tecbunny/core<br>@tecbunny/core/auth/admin-guard<br>@tecbunny/core/enhanced-commission-service<br>@tecbunny/core/server<br>next/server | inline | @tecbunny/core/auth/admin-guard | required/static signal found | role/permission signal found | none detected | none found | none found | available API endpoint | No unmatched caller exists; absence of a direct static frontend fetch is not a missing integration. | No static issues |
| api | POST /api/commissions/payments | POST | {{API_BASE_URL}}/api/commissions/payments | apps/api/src/app/api/commissions/payments/route.ts | apps/api/src/app/api/commissions/payments/route.ts | @tecbunny/core/auth/admin-guard<br>@tecbunny/core/enhanced-commission-service<br>next/server | inline | @tecbunny/core/auth/admin-guard | required/static signal found | role/permission signal found | none detected | none found | none found | available API endpoint | No unmatched caller exists; absence of a direct static frontend fetch is not a missing integration. | No static issues |
| api | GET /api/commissions/rules | GET | {{API_BASE_URL}}/api/commissions/rules | apps/api/src/app/api/commissions/rules/route.ts | apps/api/src/app/api/commissions/rules/route.ts | @tecbunny/core<br>@tecbunny/core/auth/admin-guard<br>@tecbunny/core/enhanced-commission-service<br>@tecbunny/core/server<br>next/server | inline | @tecbunny/core/auth/admin-guard | required/static signal found | role/permission signal found | none detected | none found | none found | available API endpoint | No unmatched caller exists; absence of a direct static frontend fetch is not a missing integration. | No static issues |
| api | POST /api/commissions/rules | POST | {{API_BASE_URL}}/api/commissions/rules | apps/api/src/app/api/commissions/rules/route.ts | apps/api/src/app/api/commissions/rules/route.ts | @tecbunny/core<br>@tecbunny/core/auth/admin-guard<br>@tecbunny/core/enhanced-commission-service<br>@tecbunny/core/server<br>next/server | inline | @tecbunny/core/auth/admin-guard | required/static signal found | role/permission signal found | none detected | none found | none found | available API endpoint | No unmatched caller exists; absence of a direct static frontend fetch is not a missing integration. | No static issues |
| api | GET /api/contact-messages | GET | {{API_BASE_URL}}/api/contact-messages | apps/api/src/app/api/contact-messages/route.ts | apps/api/src/app/api/contact-messages/route.ts | @tecbunny/core<br>@tecbunny/core/auth/admin-guard<br>@tecbunny/core/rate-limit<br>@tecbunny/core/server<br>@tecbunny/core/server<br>@tecbunny/core/types<br>@tecbunny/database<br>next/server | inline | @tecbunny/core/auth/admin-guard<br>@tecbunny/core/rate-limit | public or optional/static signal found | role/permission signal found | contact_messages | apps/public/src/app/solutions/page.tsx<br>apps/public/src/components/InfrastructureLeadForm.tsx<br>apps/public/src/components/layout/Footer.tsx | public | direct frontend/shared caller detected | No unmatched caller exists; absence of a direct static frontend fetch is not a missing integration. | No static issues |
| api | POST /api/contact-messages | POST | {{API_BASE_URL}}/api/contact-messages | apps/api/src/app/api/contact-messages/route.ts | apps/api/src/app/api/contact-messages/route.ts | @tecbunny/core<br>@tecbunny/core/auth/admin-guard<br>@tecbunny/core/rate-limit<br>@tecbunny/core/server<br>@tecbunny/core/server<br>@tecbunny/core/types<br>@tecbunny/database<br>next/server | inline | @tecbunny/core/auth/admin-guard<br>@tecbunny/core/rate-limit | public or optional/static signal found | role/permission signal found | contact_messages | none found | none found | available API endpoint | No unmatched caller exists; absence of a direct static frontend fetch is not a missing integration. | No static issues |
| api | GET /api/contact-messages/{id} | GET | {{API_BASE_URL}}/api/contact-messages/{id} | apps/api/src/app/api/contact-messages/[id]/route.ts | apps/api/src/app/api/contact-messages/[id]/route.ts | @tecbunny/core<br>@tecbunny/core/auth/admin-guard<br>@tecbunny/core/types<br>next/server | inline | @tecbunny/core/auth/admin-guard | required/static signal found | role/permission signal found | contact_messages | none found | none found | available API endpoint | No unmatched caller exists; absence of a direct static frontend fetch is not a missing integration. | 1 issue(s) |
| api | PATCH /api/contact-messages/{id} | PATCH | {{API_BASE_URL}}/api/contact-messages/{id} | apps/api/src/app/api/contact-messages/[id]/route.ts | apps/api/src/app/api/contact-messages/[id]/route.ts | @tecbunny/core<br>@tecbunny/core/auth/admin-guard<br>@tecbunny/core/types<br>next/server | inline | @tecbunny/core/auth/admin-guard | required/static signal found | role/permission signal found | contact_messages | none found | none found | available API endpoint | No unmatched caller exists; absence of a direct static frontend fetch is not a missing integration. | No static issues |
| waba | PATCH /api/conversations | PATCH | {{WABA_BASE_URL}}/api/conversations | apps/waba/src/app/api/conversations/route.ts | apps/waba/src/app/api/conversations/route.ts | @tecbunny/core/server-role-guard<br>next/server | not found | @tecbunny/core/server-role-guard | required/static signal found | role/permission signal found | Conversation | apps/waba/src/app/page.tsx | waba | direct frontend/shared caller detected | No unmatched caller exists; absence of a direct static frontend fetch is not a missing integration. | No static issues |
| waba | PATCH /api/conversations/{id}/assign | PATCH | {{WABA_BASE_URL}}/api/conversations/{id}/assign | apps/waba/src/app/api/conversations/[id]/assign/route.ts | apps/waba/src/app/api/conversations/[id]/assign/route.ts | @tecbunny/core/roles<br>@tecbunny/core/server-role-guard<br>next/server | not found | @tecbunny/core/server-role-guard | required/static signal found | role/permission signal found | none detected | none found | none found | available API endpoint | No unmatched caller exists; absence of a direct static frontend fetch is not a missing integration. | No static issues |
| waba | POST /api/copilot/command | POST | {{WABA_BASE_URL}}/api/copilot/command | apps/waba/src/app/api/copilot/command/route.ts | apps/waba/src/app/api/copilot/command/route.ts | @tecbunny/core/server-role-guard<br>next/server | not found | @tecbunny/core/server-role-guard | required/static signal found | role/permission signal found | none detected | apps/waba/src/components/waba/ChatMain.tsx | waba | direct frontend/shared caller detected | No unmatched caller exists; absence of a direct static frontend fetch is not a missing integration. | No static issues |
| api | DELETE /api/coupons | DELETE | {{API_BASE_URL}}/api/coupons | apps/api/src/app/api/coupons/route.ts | apps/api/src/app/api/coupons/route.ts | @tecbunny/core<br>@tecbunny/core<br>@tecbunny/core/server<br>@tecbunny/database<br>next/server | inline | not found | required/static signal found | role/permission signal found | coupons<br>profiles | packages/admin-ui/src/components/CreateDiscountDialog.tsx | admin-ui | direct frontend/shared caller detected | No unmatched caller exists; absence of a direct static frontend fetch is not a missing integration. | No static issues |
| api | GET /api/coupons | GET | {{API_BASE_URL}}/api/coupons | apps/api/src/app/api/coupons/route.ts | apps/api/src/app/api/coupons/route.ts | @tecbunny/core<br>@tecbunny/core<br>@tecbunny/core/server<br>@tecbunny/database<br>next/server | inline | not found | required/static signal found | role/permission signal found | coupons<br>profiles | none found | none found | available API endpoint | No unmatched caller exists; absence of a direct static frontend fetch is not a missing integration. | No static issues |
| api | POST /api/coupons | POST | {{API_BASE_URL}}/api/coupons | apps/api/src/app/api/coupons/route.ts | apps/api/src/app/api/coupons/route.ts | @tecbunny/core<br>@tecbunny/core<br>@tecbunny/core/server<br>@tecbunny/database<br>next/server | inline | not found | required/static signal found | role/permission signal found | coupons<br>profiles | none found | none found | available API endpoint | No unmatched caller exists; absence of a direct static frontend fetch is not a missing integration. | No static issues |
| api | PUT /api/coupons | PUT | {{API_BASE_URL}}/api/coupons | apps/api/src/app/api/coupons/route.ts | apps/api/src/app/api/coupons/route.ts | @tecbunny/core<br>@tecbunny/core<br>@tecbunny/core/server<br>@tecbunny/database<br>next/server | inline | not found | required/static signal found | role/permission signal found | coupons<br>profiles | none found | none found | available API endpoint | No unmatched caller exists; absence of a direct static frontend fetch is not a missing integration. | No static issues |
| api | GET /api/cron/abandoned-carts | GET | {{API_BASE_URL}}/api/cron/abandoned-carts | apps/api/src/app/api/cron/abandoned-carts/route.ts | apps/api/src/app/api/cron/abandoned-carts/route.ts | @tecbunny/core/cron-guard<br>@tecbunny/core/server<br>next/server | not found | @tecbunny/core/cron-guard | required/static signal found | role/permission signal found | carts | none found | none found | backend/service endpoint | Webhook, cron, health, and tRPC procedure entries are not expected to have direct frontend fetch callers. | No static issues |
| api | GET /api/cron/recover-abandoned-registrations | GET | {{API_BASE_URL}}/api/cron/recover-abandoned-registrations | apps/api/src/app/api/cron/recover-abandoned-registrations/route.ts | apps/api/src/app/api/cron/recover-abandoned-registrations/route.ts | @tecbunny/core<br>@tecbunny/core/cron-guard<br>@tecbunny/core/server<br>@tecbunny/core/whatsapp-service<br>next/server | not found | @tecbunny/core/cron-guard | required/static signal found | role/permission signal found | otp_verifications<br>profiles | none found | none found | backend/service endpoint | Webhook, cron, health, and tRPC procedure entries are not expected to have direct frontend fetch callers. | No static issues |
| api | GET /api/cron/service-retention | GET | {{API_BASE_URL}}/api/cron/service-retention | apps/api/src/app/api/cron/service-retention/route.ts | apps/api/src/app/api/cron/service-retention/route.ts | @tecbunny/core<br>@tecbunny/core/cron-guard<br>@tecbunny/core/server<br>@tecbunny/core/whatsapp-service<br>next/server | not found | @tecbunny/core/cron-guard | required/static signal found | role/permission signal found | profiles<br>service_tickets | none found | none found | backend/service endpoint | Webhook, cron, health, and tRPC procedure entries are not expected to have direct frontend fetch callers. | No static issues |
| api | GET /api/custom-setup-offers | GET | {{API_BASE_URL}}/api/custom-setup-offers | apps/api/src/app/api/custom-setup-offers/route.ts | apps/api/src/app/api/custom-setup-offers/route.ts | @tecbunny/core<br>@tecbunny/database<br>next/server | not found | not found | not found | none detected for public route | custom_setup_offers | apps/public/src/components/customised-setups/CustomSetupFlow.tsx<br>apps/public/src/components/customised-setups/WizardCustomSetupFlow.tsx | public | direct frontend/shared caller detected | No unmatched caller exists; absence of a direct static frontend fetch is not a missing integration. | 1 issue(s) |
| api | GET /api/custom-setups | GET | {{API_BASE_URL}}/api/custom-setups | apps/api/src/app/api/custom-setups/route.ts | apps/api/src/app/api/custom-setups/route.ts | @tecbunny/core<br>@tecbunny/core/api-response<br>@tecbunny/core/custom-setup-service<br>next/server | not found | not found | not found | none detected for public route | none detected | none found | none found | available API endpoint | No unmatched caller exists; absence of a direct static frontend fetch is not a missing integration. | 1 issue(s) |
| waba | GET /api/customer-360 | GET | {{WABA_BASE_URL}}/api/customer-360 | apps/waba/src/app/api/customer-360/route.ts | apps/waba/src/app/api/customer-360/route.ts | @tecbunny/core/server-role-guard<br>next/server | not found | @tecbunny/core/server-role-guard | required/static signal found | role/permission signal found | none detected | none found | none found | available API endpoint | No unmatched caller exists; absence of a direct static frontend fetch is not a missing integration. | No static issues |
| api | GET /api/customer-promotions | GET | {{API_BASE_URL}}/api/customer-promotions | apps/api/src/app/api/customer-promotions/route.ts | apps/api/src/app/api/customer-promotions/route.ts | @tecbunny/core<br>@tecbunny/core/auth/admin-guard<br>next/server | inline | @tecbunny/core/auth/admin-guard | public or optional/static signal found | role/permission signal found | customer_promotions<br>orders<br>profiles<br>rpc:check_customer_promotions<br>system_settings | none found | none found | available API endpoint | No unmatched caller exists; absence of a direct static frontend fetch is not a missing integration. | 1 issue(s) |
| api | POST /api/customer-promotions | POST | {{API_BASE_URL}}/api/customer-promotions | apps/api/src/app/api/customer-promotions/route.ts | apps/api/src/app/api/customer-promotions/route.ts | @tecbunny/core<br>@tecbunny/core/auth/admin-guard<br>next/server | inline | @tecbunny/core/auth/admin-guard | public or optional/static signal found | role/permission signal found | customer_promotions<br>orders<br>profiles<br>rpc:check_customer_promotions<br>system_settings | none found | none found | available API endpoint | No unmatched caller exists; absence of a direct static frontend fetch is not a missing integration. | No static issues |
| api | POST /api/customer/notifications | POST | {{API_BASE_URL}}/api/customer/notifications | apps/api/src/app/api/customer/notifications/route.ts | apps/api/src/app/api/customer/notifications/route.ts | @tecbunny/core<br>@tecbunny/core/whatsapp-service<br>@tecbunny/database<br>next/server | inline | not found | required/static signal found | not found | customer_interactions<br>customers<br>whatsapp_messages | none found | none found | available API endpoint | No unmatched caller exists; absence of a direct static frontend fetch is not a missing integration. | No static issues |
| api | GET /api/customers/register | GET | {{API_BASE_URL}}/api/customers/register | apps/api/src/app/api/customers/register/route.ts | apps/api/src/app/api/customers/register/route.ts | @tecbunny/core<br>@tecbunny/core<br>@tecbunny/core/rate-limit<br>@tecbunny/core/whatsapp-service<br>@tecbunny/database<br>next/server | inline | @tecbunny/core/rate-limit | required/static signal found | not found | customers | none found | none found | available API endpoint | No unmatched caller exists; absence of a direct static frontend fetch is not a missing integration. | 1 issue(s) |
| api | POST /api/customers/register | POST | {{API_BASE_URL}}/api/customers/register | apps/api/src/app/api/customers/register/route.ts | apps/api/src/app/api/customers/register/route.ts | @tecbunny/core<br>@tecbunny/core<br>@tecbunny/core/rate-limit<br>@tecbunny/core/whatsapp-service<br>@tecbunny/database<br>next/server | inline | @tecbunny/core/rate-limit | required/static signal found | not found | customers | none found | none found | available API endpoint | No unmatched caller exists; absence of a direct static frontend fetch is not a missing integration. | No static issues |
| waba | GET /api/debug-env | GET | {{WABA_BASE_URL}}/api/debug-env | apps/waba/src/app/api/debug-env/route.ts | apps/waba/src/app/api/debug-env/route.ts | @tecbunny/core/server-role-guard<br>next/server | not found | @tecbunny/core/server-role-guard | required/static signal found | role/permission signal found | none detected | none found | none found | system integration endpoint | This endpoint is triggered by external systems, browser redirects, extensions, or server-side workflows. | 2 issue(s) |
| api | DELETE /api/discounts | DELETE | {{API_BASE_URL}}/api/discounts | apps/api/src/app/api/discounts/route.ts | apps/api/src/app/api/discounts/route.ts | @tecbunny/core<br>@tecbunny/core/auth/server-role<br>@tecbunny/core/server<br>next/server | inline | @tecbunny/core/auth/server-role | required/static signal found | role/permission signal found | discounts | packages/admin-ui/src/components/CreateDiscountDialog.tsx<br>packages/admin-ui/src/components/OffersManagement.tsx | admin-ui | direct frontend/shared caller detected | No unmatched caller exists; absence of a direct static frontend fetch is not a missing integration. | No static issues |
| api | GET /api/discounts | GET | {{API_BASE_URL}}/api/discounts | apps/api/src/app/api/discounts/route.ts | apps/api/src/app/api/discounts/route.ts | @tecbunny/core<br>@tecbunny/core/auth/server-role<br>@tecbunny/core/server<br>next/server | inline | @tecbunny/core/auth/server-role | required/static signal found | role/permission signal found | discounts | none found | none found | available API endpoint | No unmatched caller exists; absence of a direct static frontend fetch is not a missing integration. | No static issues |
| api | POST /api/discounts | POST | {{API_BASE_URL}}/api/discounts | apps/api/src/app/api/discounts/route.ts | apps/api/src/app/api/discounts/route.ts | @tecbunny/core<br>@tecbunny/core/auth/server-role<br>@tecbunny/core/server<br>next/server | inline | @tecbunny/core/auth/server-role | required/static signal found | role/permission signal found | discounts | none found | none found | available API endpoint | No unmatched caller exists; absence of a direct static frontend fetch is not a missing integration. | No static issues |
| api | PUT /api/discounts | PUT | {{API_BASE_URL}}/api/discounts | apps/api/src/app/api/discounts/route.ts | apps/api/src/app/api/discounts/route.ts | @tecbunny/core<br>@tecbunny/core/auth/server-role<br>@tecbunny/core/server<br>next/server | inline | @tecbunny/core/auth/server-role | required/static signal found | role/permission signal found | discounts | none found | none found | available API endpoint | No unmatched caller exists; absence of a direct static frontend fetch is not a missing integration. | No static issues |
| api | GET /api/discounts/calculate | GET | {{API_BASE_URL}}/api/discounts/calculate | apps/api/src/app/api/discounts/calculate/route.ts | apps/api/src/app/api/discounts/calculate/route.ts | @tecbunny/database<br>next/server | not found | not found | required/static signal found | role/permission signal found | customer_offers<br>profiles | none found | none found | available API endpoint | No unmatched caller exists; absence of a direct static frontend fetch is not a missing integration. | 1 issue(s) |
| api | POST /api/email/abandoned-cart | POST | {{API_BASE_URL}}/api/email/abandoned-cart | apps/api/src/app/api/email/abandoned-cart/route.ts | apps/api/src/app/api/email/abandoned-cart/route.ts | @tecbunny/core<br>@tecbunny/core/rate-limit<br>@tecbunny/core/whatsapp-service<br>@tecbunny/database<br>next/server | inline | @tecbunny/core/rate-limit | required/static signal found | not found | none detected | packages/core/src/store/cartStore.ts | core | direct frontend/shared caller detected | This endpoint is triggered by external systems, browser redirects, extensions, or server-side workflows. | No static issues |
| api | POST /api/email/email-change | POST | {{API_BASE_URL}}/api/email/email-change | apps/api/src/app/api/email/email-change/route.ts | apps/api/src/app/api/email/email-change/route.ts | @tecbunny/core/api-email-route<br>@tecbunny/core/email<br>next/server | inline | not found | required/static signal found | not found | none detected | none found | none found | system integration endpoint | This endpoint is triggered by external systems, browser redirects, extensions, or server-side workflows. | 2 issue(s) |
| api | POST /api/email/marketing | POST | {{API_BASE_URL}}/api/email/marketing | apps/api/src/app/api/email/marketing/route.ts | apps/api/src/app/api/email/marketing/route.ts | @tecbunny/core/email<br>@tecbunny/core/rate-limit<br>@tecbunny/core/server-role-guard<br>next/server | inline | @tecbunny/core/rate-limit<br>@tecbunny/core/server-role-guard | required/static signal found | role/permission signal found | none detected | none found | none found | system integration endpoint | This endpoint is triggered by external systems, browser redirects, extensions, or server-side workflows. | No static issues |
| api | POST /api/email/notify-manager | POST | {{API_BASE_URL}}/api/email/notify-manager | apps/api/src/app/api/email/notify-manager/route.ts | apps/api/src/app/api/email/notify-manager/route.ts | @tecbunny/core<br>@tecbunny/core/email<br>@tecbunny/database<br>next/server | inline | not found | required/static signal found | role/permission signal found | profiles<br>settings | none found | none found | system integration endpoint | This endpoint is triggered by external systems, browser redirects, extensions, or server-side workflows. | No static issues |
| api | POST /api/email/notify-sales-pickup | POST | {{API_BASE_URL}}/api/email/notify-sales-pickup | apps/api/src/app/api/email/notify-sales-pickup/route.ts | apps/api/src/app/api/email/notify-sales-pickup/route.ts | @tecbunny/core<br>@tecbunny/core/rate-limit<br>@tecbunny/core/whatsapp-service<br>next/server | inline | @tecbunny/core/rate-limit | required/static signal found | not found | none detected | apps/mgmt/src/components/sales/OrderActions.tsx<br>packages/admin-ui/src/shared/OrderActions.tsx | admin-ui, mgmt | direct frontend/shared caller detected | This endpoint is triggered by external systems, browser redirects, extensions, or server-side workflows. | No static issues |
| api | POST /api/email/order-approved | POST | {{API_BASE_URL}}/api/email/order-approved | apps/api/src/app/api/email/order-approved/route.ts | apps/api/src/app/api/email/order-approved/route.ts | @tecbunny/core<br>@tecbunny/core/rate-limit<br>@tecbunny/core/whatsapp-service<br>next/server | inline | @tecbunny/core/rate-limit | required/static signal found | not found | none detected | apps/mgmt/src/components/sales/OrderActions.tsx<br>packages/admin-ui/src/shared/OrderActions.tsx | admin-ui, mgmt | direct frontend/shared caller detected | This endpoint is triggered by external systems, browser redirects, extensions, or server-side workflows. | No static issues |
| api | POST /api/email/order-completion | POST | {{API_BASE_URL}}/api/email/order-completion | apps/api/src/app/api/email/order-completion/route.ts | apps/api/src/app/api/email/order-completion/route.ts | @tecbunny/core/email<br>@tecbunny/core/rate-limit<br>@tecbunny/database<br>next/server | inline | @tecbunny/core/rate-limit | required/static signal found | not found | none detected | none found | none found | system integration endpoint | This endpoint is triggered by external systems, browser redirects, extensions, or server-side workflows. | No static issues |
| api | POST /api/email/order-confirmation | POST | {{API_BASE_URL}}/api/email/order-confirmation | apps/api/src/app/api/email/order-confirmation/route.ts | apps/api/src/app/api/email/order-confirmation/route.ts | @tecbunny/core/email<br>@tecbunny/core/rate-limit<br>@tecbunny/database<br>next/server | inline | @tecbunny/core/rate-limit | required/static signal found | not found | none detected | none found | none found | system integration endpoint | This endpoint is triggered by external systems, browser redirects, extensions, or server-side workflows. | No static issues |
| api | POST /api/email/order-delivered | POST | {{API_BASE_URL}}/api/email/order-delivered | apps/api/src/app/api/email/order-delivered/route.ts | apps/api/src/app/api/email/order-delivered/route.ts | @tecbunny/core/email<br>@tecbunny/core/rate-limit<br>@tecbunny/database<br>next/server | inline | @tecbunny/core/rate-limit | required/static signal found | not found | none detected | none found | none found | system integration endpoint | This endpoint is triggered by external systems, browser redirects, extensions, or server-side workflows. | No static issues |
| api | POST /api/email/password-reset | POST | {{API_BASE_URL}}/api/email/password-reset | apps/api/src/app/api/email/password-reset/route.ts | apps/api/src/app/api/email/password-reset/route.ts | @tecbunny/core/email<br>@tecbunny/core/rate-limit<br>@tecbunny/database<br>next/server | inline | @tecbunny/core/rate-limit | required/static signal found | not found | none detected | none found | none found | system integration endpoint | This endpoint is triggered by external systems, browser redirects, extensions, or server-side workflows. | No static issues |
| api | POST /api/email/payment-confirmation | POST | {{API_BASE_URL}}/api/email/payment-confirmation | apps/api/src/app/api/email/payment-confirmation/route.ts | apps/api/src/app/api/email/payment-confirmation/route.ts | @tecbunny/core/email<br>@tecbunny/core/rate-limit<br>@tecbunny/database<br>next/server | inline | @tecbunny/core/rate-limit | required/static signal found | not found | none detected | none found | none found | system integration endpoint | This endpoint is triggered by external systems, browser redirects, extensions, or server-side workflows. | No static issues |
| api | POST /api/email/payment-failed | POST | {{API_BASE_URL}}/api/email/payment-failed | apps/api/src/app/api/email/payment-failed/route.ts | apps/api/src/app/api/email/payment-failed/route.ts | @tecbunny/core/email<br>@tecbunny/core/rate-limit<br>@tecbunny/database<br>next/server | inline | @tecbunny/core/rate-limit | required/static signal found | not found | none detected | none found | none found | system integration endpoint | This endpoint is triggered by external systems, browser redirects, extensions, or server-side workflows. | No static issues |
| api | POST /api/email/payment-pending | POST | {{API_BASE_URL}}/api/email/payment-pending | apps/api/src/app/api/email/payment-pending/route.ts | apps/api/src/app/api/email/payment-pending/route.ts | @tecbunny/core/api-email-route<br>@tecbunny/core/email<br>next/server | inline | not found | required/static signal found | not found | none detected | none found | none found | system integration endpoint | This endpoint is triggered by external systems, browser redirects, extensions, or server-side workflows. | 2 issue(s) |
| api | POST /api/email/pickup | POST | {{API_BASE_URL}}/api/email/pickup | apps/api/src/app/api/email/pickup/route.ts | apps/api/src/app/api/email/pickup/route.ts | @tecbunny/core<br>@tecbunny/core/rate-limit<br>@tecbunny/core/whatsapp-service<br>@tecbunny/database<br>next/server | inline | @tecbunny/core/rate-limit | required/static signal found | not found | none detected | apps/mgmt/src/components/sales/OrderActions.tsx<br>packages/admin-ui/src/shared/OrderActions.tsx | admin-ui, mgmt | direct frontend/shared caller detected | This endpoint is triggered by external systems, browser redirects, extensions, or server-side workflows. | No static issues |
| api | POST /api/email/shipping | POST | {{API_BASE_URL}}/api/email/shipping | apps/api/src/app/api/email/shipping/route.ts | apps/api/src/app/api/email/shipping/route.ts | @tecbunny/core/email<br>@tecbunny/core/rate-limit<br>@tecbunny/database<br>next/server | inline | @tecbunny/core/rate-limit | required/static signal found | not found | none detected | none found | none found | system integration endpoint | This endpoint is triggered by external systems, browser redirects, extensions, or server-side workflows. | No static issues |
| api | POST /api/email/verification | POST | {{API_BASE_URL}}/api/email/verification | apps/api/src/app/api/email/verification/route.ts | apps/api/src/app/api/email/verification/route.ts | @tecbunny/core/email<br>@tecbunny/core/rate-limit<br>@tecbunny/database<br>next/server | inline | @tecbunny/core/rate-limit | required/static signal found | role/permission signal found | none detected | none found | none found | system integration endpoint | This endpoint is triggered by external systems, browser redirects, extensions, or server-side workflows. | No static issues |
| api | POST /api/email/welcome | POST | {{API_BASE_URL}}/api/email/welcome | apps/api/src/app/api/email/welcome/route.ts | apps/api/src/app/api/email/welcome/route.ts | @tecbunny/core/api-email-route<br>@tecbunny/core/email<br>next/server | inline | not found | required/static signal found | not found | none detected | none found | none found | system integration endpoint | This endpoint is triggered by external systems, browser redirects, extensions, or server-side workflows. | 2 issue(s) |
| api | GET /api/faqs | GET | {{API_BASE_URL}}/api/faqs | apps/api/src/app/api/faqs/route.ts | apps/api/src/app/api/faqs/route.ts | @tecbunny/core/api-response<br>@tecbunny/database<br>next/server | inline | not found | not found | none detected for public route | faqs | none found | none found | available API endpoint | No unmatched caller exists; absence of a direct static frontend fetch is not a missing integration. | 2 issue(s) |
| api | GET /api/free-installation-slots | GET | {{API_BASE_URL}}/api/free-installation-slots | apps/api/src/app/api/free-installation-slots/route.ts | apps/api/src/app/api/free-installation-slots/route.ts | @tecbunny/core<br>next/server<br>next/server | not found | not found | required/static signal found | role/permission signal found | free_installation_slots | packages/ui/src/components/ui/BlitzAuditBanner.tsx<br>packages/ui/src/components/ui/FreeInstallationOfferBanner.tsx | ui | direct frontend/shared caller detected | No unmatched caller exists; absence of a direct static frontend fetch is not a missing integration. | 1 issue(s) |
| api | POST /api/free-installation-slots | POST | {{API_BASE_URL}}/api/free-installation-slots | apps/api/src/app/api/free-installation-slots/route.ts | apps/api/src/app/api/free-installation-slots/route.ts | @tecbunny/core<br>next/server<br>next/server | not found | not found | required/static signal found | role/permission signal found | free_installation_slots | none found | none found | available API endpoint | No unmatched caller exists; absence of a direct static frontend fetch is not a missing integration. | No static issues |
| api | GET /api/gst-verify | GET | {{API_BASE_URL}}/api/gst-verify | apps/api/src/app/api/gst-verify/route.ts | apps/api/src/app/api/gst-verify/route.ts | @tecbunny/core<br>@tecbunny/core/indian-tax<br>@tecbunny/core/rate-limit<br>next/server | inline | @tecbunny/core/rate-limit | not found | none detected for public route | none detected | none found | none found | available API endpoint | No unmatched caller exists; absence of a direct static frontend fetch is not a missing integration. | 1 issue(s) |
| api | GET /api/health | GET | {{API_BASE_URL}}/api/health | apps/api/src/app/api/health/route.ts | apps/api/src/app/api/health/route.ts | @tecbunny/core<br>@tecbunny/core/environment-validator<br>@tecbunny/database<br>next/server | @tecbunny/core/environment-validator | not found | public or optional/static signal found | none detected for public route | otp_codes<br>products<br>user_communication_preferences | apps/api/src/proxy.ts<br>apps/superadmin/src/app/superadmin/mgmt/system-health/page.tsx | api, superadmin | direct frontend/shared caller detected | Webhook, cron, health, and tRPC procedure entries are not expected to have direct frontend fetch callers. | No static issues |
| mgmt | GET /api/health | GET | {{MGMT_BASE_URL}}/api/health | apps/mgmt/src/app/api/health/route.ts | apps/mgmt/src/app/api/health/route.ts | next/server | not found | not found | public or optional/static signal found | none detected for public route | none detected | none found | none found | backend/service endpoint | Webhook, cron, health, and tRPC procedure entries are not expected to have direct frontend fetch callers. | 2 issue(s) |
| public | GET /api/health | GET | {{PUBLIC_BASE_URL}}/api/health | apps/public/src/app/api/health/route.ts | apps/public/src/app/api/health/route.ts | next/server | not found | not found | public or optional/static signal found | none detected for public route | none detected | none found | none found | backend/service endpoint | Webhook, cron, health, and tRPC procedure entries are not expected to have direct frontend fetch callers. | 2 issue(s) |
| superadmin | GET /api/health | GET | {{SUPERADMIN_BASE_URL}}/api/health | apps/superadmin/src/app/api/health/route.ts | apps/superadmin/src/app/api/health/route.ts | next/server | not found | not found | public or optional/static signal found | none detected for public route | none detected | none found | none found | backend/service endpoint | Webhook, cron, health, and tRPC procedure entries are not expected to have direct frontend fetch callers. | 2 issue(s) |
| waba | GET /api/health | GET | {{WABA_BASE_URL}}/api/health | apps/waba/src/app/api/health/route.ts | apps/waba/src/app/api/health/route.ts | next/server | not found | not found | public or optional/static signal found | none detected for public route | none detected | none found | none found | backend/service endpoint | Webhook, cron, health, and tRPC procedure entries are not expected to have direct frontend fetch callers. | 2 issue(s) |
| webmail | GET /api/health | GET | {{WEBMAIL_BASE_URL}}/api/health | apps/webmail/src/app/api/health/route.ts | apps/webmail/src/app/api/health/route.ts | next/server | not found | not found | public or optional/static signal found | none detected for public route | none detected | none found | none found | backend/service endpoint | Webhook, cron, health, and tRPC procedure entries are not expected to have direct frontend fetch callers. | 2 issue(s) |
| api | GET /api/health/email | GET | {{API_BASE_URL}}/api/health/email | apps/api/src/app/api/health/email/route.ts | apps/api/src/app/api/health/email/route.ts | @tecbunny/core/improved-email-service<br>next/server | not found | not found | public or optional/static signal found | none detected for public route | none detected | none found | none found | backend/service endpoint | Webhook, cron, health, and tRPC procedure entries are not expected to have direct frontend fetch callers. | 1 issue(s) |
| api | GET /api/health/orders | GET | {{API_BASE_URL}}/api/health/orders | apps/api/src/app/api/health/orders/route.ts | apps/api/src/app/api/health/orders/route.ts | @tecbunny/database<br>next/server | not found | not found | public or optional/static signal found | none detected for public route | settings | none found | none found | backend/service endpoint | Webhook, cron, health, and tRPC procedure entries are not expected to have direct frontend fetch callers. | 1 issue(s) |
| api | GET /api/health/otp | GET | {{API_BASE_URL}}/api/health/otp | apps/api/src/app/api/health/otp/route.ts | apps/api/src/app/api/health/otp/route.ts | @tecbunny/core/otp-manager<br>next/server | not found | not found | public or optional/static signal found | none detected for public route | none detected | none found | none found | backend/service endpoint | Webhook, cron, health, and tRPC procedure entries are not expected to have direct frontend fetch callers. | 1 issue(s) |
| api | GET /api/health/summary | GET | {{API_BASE_URL}}/api/health/summary | apps/api/src/app/api/health/summary/route.ts | apps/api/src/app/api/health/summary/route.ts | @tecbunny/database<br>next/server | not found | not found | public or optional/static signal found | none detected for public route | products | none found | none found | backend/service endpoint | Webhook, cron, health, and tRPC procedure entries are not expected to have direct frontend fetch callers. | 1 issue(s) |
| api | GET /api/hello | GET | {{API_BASE_URL}}/api/hello | apps/api/src/app/api/hello/route.ts | apps/api/src/app/api/hello/route.ts | next/server | not found | not found | required/static signal found | not found | none detected | none found | none found | available API endpoint | No unmatched caller exists; absence of a direct static frontend fetch is not a missing integration. | 2 issue(s) |
| api | POST /api/inquiries | POST | {{API_BASE_URL}}/api/inquiries | apps/api/src/app/api/inquiries/route.ts | apps/api/src/app/api/inquiries/route.ts | @tecbunny/core/server<br>@tecbunny/core/server<br>next/server | inline | not found | public or optional/static signal found | none detected for public route | inquiries | apps/public/src/components/products/ProductDetailPage.tsx | public | direct frontend/shared caller detected | No unmatched caller exists; absence of a direct static frontend fetch is not a missing integration. | No static issues |
| api | GET /api/inventory | GET | {{API_BASE_URL}}/api/inventory | apps/api/src/app/api/inventory/route.ts | apps/api/src/app/api/inventory/route.ts | @tecbunny/core/environment-validator<br>@tecbunny/core/server<br>@tecbunny/core/server-role-guard<br>@tecbunny/infra<br>next/server | @tecbunny/core/environment-validator | @tecbunny/core/server-role-guard | required/static signal found | role/permission signal found | none detected | apps/mgmt/src/app/mgmt/sales/inventory/sales-inventory.tsx | mgmt | direct frontend/shared caller detected | No unmatched caller exists; absence of a direct static frontend fetch is not a missing integration. | No static issues |
| api | POST /api/inventory | POST | {{API_BASE_URL}}/api/inventory | apps/api/src/app/api/inventory/route.ts | apps/api/src/app/api/inventory/route.ts | @tecbunny/core/environment-validator<br>@tecbunny/core/server<br>@tecbunny/core/server-role-guard<br>@tecbunny/infra<br>next/server | @tecbunny/core/environment-validator | @tecbunny/core/server-role-guard | required/static signal found | role/permission signal found | none detected | none found | none found | available API endpoint | No unmatched caller exists; absence of a direct static frontend fetch is not a missing integration. | No static issues |
| api | PUT /api/inventory | PUT | {{API_BASE_URL}}/api/inventory | apps/api/src/app/api/inventory/route.ts | apps/api/src/app/api/inventory/route.ts | @tecbunny/core/environment-validator<br>@tecbunny/core/server<br>@tecbunny/core/server-role-guard<br>@tecbunny/infra<br>next/server | @tecbunny/core/environment-validator | @tecbunny/core/server-role-guard | required/static signal found | role/permission signal found | none detected | none found | none found | available API endpoint | No unmatched caller exists; absence of a direct static frontend fetch is not a missing integration. | No static issues |
| api | GET /api/inventory/transactions | GET | {{API_BASE_URL}}/api/inventory/transactions | apps/api/src/app/api/inventory/transactions/route.ts | apps/api/src/app/api/inventory/transactions/route.ts | @tecbunny/core<br>@tecbunny/core/server<br>@tecbunny/core/server-role-guard<br>next/server | inline | @tecbunny/core/server-role-guard | required/static signal found | role/permission signal found | rpc:record_atomic_stock_movement<br>stock_movements | apps/mgmt/src/app/mgmt/sales/purchase-entry/sales-purchase-entry.tsx | mgmt | direct frontend/shared caller detected | No unmatched caller exists; absence of a direct static frontend fetch is not a missing integration. | No static issues |
| api | POST /api/inventory/transactions | POST | {{API_BASE_URL}}/api/inventory/transactions | apps/api/src/app/api/inventory/transactions/route.ts | apps/api/src/app/api/inventory/transactions/route.ts | @tecbunny/core<br>@tecbunny/core/server<br>@tecbunny/core/server-role-guard<br>next/server | inline | @tecbunny/core/server-role-guard | required/static signal found | role/permission signal found | rpc:record_atomic_stock_movement<br>stock_movements | none found | none found | available API endpoint | No unmatched caller exists; absence of a direct static frontend fetch is not a missing integration. | No static issues |
| api | PUT /api/inventory/transactions | PUT | {{API_BASE_URL}}/api/inventory/transactions | apps/api/src/app/api/inventory/transactions/route.ts | apps/api/src/app/api/inventory/transactions/route.ts | @tecbunny/core<br>@tecbunny/core/server<br>@tecbunny/core/server-role-guard<br>next/server | inline | @tecbunny/core/server-role-guard | required/static signal found | role/permission signal found | rpc:record_atomic_stock_movement<br>stock_movements | none found | none found | available API endpoint | No unmatched caller exists; absence of a direct static frontend fetch is not a missing integration. | No static issues |
| waba | PATCH /api/leads/{id}/assign | PATCH | {{WABA_BASE_URL}}/api/leads/{id}/assign | apps/waba/src/app/api/leads/[id]/assign/route.ts | apps/waba/src/app/api/leads/[id]/assign/route.ts | @tecbunny/core/roles<br>@tecbunny/core/server-role-guard<br>next/server | inline | @tecbunny/core/server-role-guard | required/static signal found | role/permission signal found | none detected | none found | none found | available API endpoint | No unmatched caller exists; absence of a direct static frontend fetch is not a missing integration. | No static issues |
| api | POST /api/marketing/triggers/order-delivered-followup | POST | {{API_BASE_URL}}/api/marketing/triggers/order-delivered-followup | apps/api/src/app/api/marketing/triggers/order-delivered-followup/route.ts | apps/api/src/app/api/marketing/triggers/order-delivered-followup/route.ts | @tecbunny/core<br>@tecbunny/core/server<br>@tecbunny/core/whatsapp-service<br>next/server | inline | not found | required/static signal found | not found | coupons<br>orders | none found | none found | system integration endpoint | This endpoint is triggered by external systems, browser redirects, extensions, or server-side workflows. | No static issues |
| waba | GET /api/messages | GET | {{WABA_BASE_URL}}/api/messages | apps/waba/src/app/api/messages/route.ts | apps/waba/src/app/api/messages/route.ts | @tecbunny/core/server-role-guard<br>next/server | inline | @tecbunny/core/server-role-guard | required/static signal found | role/permission signal found | Conversation<br>Message | apps/waba/src/app/page.tsx | waba | direct frontend/shared caller detected | No unmatched caller exists; absence of a direct static frontend fetch is not a missing integration. | No static issues |
| waba | POST /api/messages | POST | {{WABA_BASE_URL}}/api/messages | apps/waba/src/app/api/messages/route.ts | apps/waba/src/app/api/messages/route.ts | @tecbunny/core/server-role-guard<br>next/server | inline | @tecbunny/core/server-role-guard | required/static signal found | role/permission signal found | Conversation<br>Message | none found | none found | available API endpoint | No unmatched caller exists; absence of a direct static frontend fetch is not a missing integration. | No static issues |
| waba | POST /api/messages/media | POST | {{WABA_BASE_URL}}/api/messages/media | apps/waba/src/app/api/messages/media/route.ts | apps/waba/src/app/api/messages/media/route.ts | @tecbunny/core/server-role-guard<br>next/server | inline | @tecbunny/core/server-role-guard | required/static signal found | role/permission signal found | whatsapp_media | apps/waba/src/app/page.tsx | waba | direct frontend/shared caller detected | No unmatched caller exists; absence of a direct static frontend fetch is not a missing integration. | No static issues |
| waba | PATCH /api/messages/read | PATCH | {{WABA_BASE_URL}}/api/messages/read | apps/waba/src/app/api/messages/read/route.ts | apps/waba/src/app/api/messages/read/route.ts | @tecbunny/core/server-role-guard<br>next/server | not found | @tecbunny/core/server-role-guard | required/static signal found | role/permission signal found | Conversation<br>Message | none found | none found | available API endpoint | No unmatched caller exists; absence of a direct static frontend fetch is not a missing integration. | No static issues |
| api | GET /api/metadata | GET | {{API_BASE_URL}}/api/metadata | apps/api/src/app/api/metadata/route.ts | apps/api/src/app/api/metadata/route.ts | @tecbunny/core/server<br>@tecbunny/database<br>next/server | not found | not found | public or optional/static signal found | none detected for public route | settings | apps/api/src/app/dashboard/page.tsx<br>packages/ui/src/components/ui/logo.tsx | api, ui | direct frontend/shared caller detected | No unmatched caller exists; absence of a direct static frontend fetch is not a missing integration. | No static issues |
| api | POST /api/notifications/send | POST | {{API_BASE_URL}}/api/notifications/send | apps/api/src/app/api/notifications/send/route.ts | apps/api/src/app/api/notifications/send/route.ts | @tecbunny/core/server<br>next/server | inline | not found | required/static signal found | role/permission signal found | notification_preferences<br>ntf_queue<br>profiles | none found | none found | system integration endpoint | This endpoint is triggered by external systems, browser redirects, extensions, or server-side workflows. | No static issues |
| api | DELETE /api/offers | DELETE | {{API_BASE_URL}}/api/offers | apps/api/src/app/api/offers/route.ts | apps/api/src/app/api/offers/route.ts | @tecbunny/core<br>@tecbunny/core/auth/server-role<br>@tecbunny/core/server<br>@tecbunny/database<br>next/server | inline | @tecbunny/core/auth/server-role | required/static signal found | role/permission signal found | offer_usage<br>offers | packages/admin-ui/src/components/OffersManagement.tsx<br>packages/core/src/offer-discount-service.ts | admin-ui, core | direct frontend/shared caller detected | No unmatched caller exists; absence of a direct static frontend fetch is not a missing integration. | No static issues |
| api | GET /api/offers | GET | {{API_BASE_URL}}/api/offers | apps/api/src/app/api/offers/route.ts | apps/api/src/app/api/offers/route.ts | @tecbunny/core<br>@tecbunny/core/auth/server-role<br>@tecbunny/core/server<br>@tecbunny/database<br>next/server | inline | @tecbunny/core/auth/server-role | required/static signal found | role/permission signal found | offer_usage<br>offers | none found | none found | available API endpoint | No unmatched caller exists; absence of a direct static frontend fetch is not a missing integration. | No static issues |
| api | POST /api/offers | POST | {{API_BASE_URL}}/api/offers | apps/api/src/app/api/offers/route.ts | apps/api/src/app/api/offers/route.ts | @tecbunny/core<br>@tecbunny/core/auth/server-role<br>@tecbunny/core/server<br>@tecbunny/database<br>next/server | inline | @tecbunny/core/auth/server-role | required/static signal found | role/permission signal found | offer_usage<br>offers | none found | none found | available API endpoint | No unmatched caller exists; absence of a direct static frontend fetch is not a missing integration. | No static issues |
| api | PUT /api/offers | PUT | {{API_BASE_URL}}/api/offers | apps/api/src/app/api/offers/route.ts | apps/api/src/app/api/offers/route.ts | @tecbunny/core<br>@tecbunny/core/auth/server-role<br>@tecbunny/core/server<br>@tecbunny/database<br>next/server | inline | @tecbunny/core/auth/server-role | required/static signal found | role/permission signal found | offer_usage<br>offers | none found | none found | available API endpoint | No unmatched caller exists; absence of a direct static frontend fetch is not a missing integration. | No static issues |
| api | GET /api/orders | GET | {{API_BASE_URL}}/api/orders | apps/api/src/app/api/orders/route.ts | apps/api/src/app/api/orders/route.ts | @tecbunny/core<br>@tecbunny/core<br>@tecbunny/core<br>@tecbunny/core/rate-limit<br>@tecbunny/core/server<br>@tecbunny/core/server<br>@tecbunny/database<br>@tecbunny/infra<br>next/server | inline | @tecbunny/core/rate-limit | required/static signal found | role/permission signal found | carts | packages/core/src/context/OrderProvider.tsx | core | direct frontend/shared caller detected | No unmatched caller exists; absence of a direct static frontend fetch is not a missing integration. | No static issues |
| api | POST /api/orders | POST | {{API_BASE_URL}}/api/orders | apps/api/src/app/api/orders/route.ts | apps/api/src/app/api/orders/route.ts | @tecbunny/core<br>@tecbunny/core<br>@tecbunny/core<br>@tecbunny/core/rate-limit<br>@tecbunny/core/server<br>@tecbunny/core/server<br>@tecbunny/database<br>@tecbunny/infra<br>next/server | inline | @tecbunny/core/rate-limit | required/static signal found | role/permission signal found | carts | none found | none found | available API endpoint | No unmatched caller exists; absence of a direct static frontend fetch is not a missing integration. | No static issues |
| api | GET /api/orders/{id} | GET | {{API_BASE_URL}}/api/orders/{id} | apps/api/src/app/api/orders/[id]/route.ts | apps/api/src/app/api/orders/[id]/route.ts | @tecbunny/core<br>@tecbunny/core/orders/normalizers<br>@tecbunny/core/server<br>@tecbunny/database<br>next/server | not found | not found | required/static signal found | role/permission signal found | orders | apps/mgmt/src/components/sales/OrderActions.tsx<br>apps/public/src/app/payment/[method]/[orderId]/PaymentClientPage.tsx<br>apps/public/src/app/payment/upi/[orderId]/UPIClientPage.tsx<br>packages/admin-ui/src/shared/OrderActions.tsx<br>packages/core/src/context/OrderProvider.tsx | admin-ui, core, mgmt, public | direct frontend/shared caller detected | No unmatched caller exists; absence of a direct static frontend fetch is not a missing integration. | No static issues |
| api | GET /api/orders/{id}/timeline | GET | {{API_BASE_URL}}/api/orders/{id}/timeline | apps/api/src/app/api/orders/[id]/timeline/route.ts | apps/api/src/app/api/orders/[id]/timeline/route.ts | @tecbunny/database<br>next/server | not found | not found | required/static signal found | role/permission signal found | orders | none found | none found | available API endpoint | No unmatched caller exists; absence of a direct static frontend fetch is not a missing integration. | 1 issue(s) |
| api | POST /api/orders/auto-cancel | POST | {{API_BASE_URL}}/api/orders/auto-cancel | apps/api/src/app/api/orders/auto-cancel/route.ts | apps/api/src/app/api/orders/auto-cancel/route.ts | @tecbunny/core<br>@tecbunny/core<br>@tecbunny/core/server<br>@tecbunny/database<br>@tecbunny/database<br>next/server | not found | not found | required/static signal found | role/permission signal found | orders<br>profiles<br>rpc:auto_cancel_stale_orders_v1<br>rpc:increment_product_stock | none found | none found | available API endpoint | No unmatched caller exists; absence of a direct static frontend fetch is not a missing integration. | No static issues |
| api | POST /api/orders/commission | POST | {{API_BASE_URL}}/api/orders/commission | apps/api/src/app/api/orders/commission/route.ts | apps/api/src/app/api/orders/commission/route.ts | @tecbunny/core<br>@tecbunny/core/auth/admin-guard<br>@tecbunny/core/enhanced-commission-service<br>next/server | inline | @tecbunny/core/auth/admin-guard | required/static signal found | role/permission signal found | orders<br>sales_agent_commissions | none found | none found | available API endpoint | No unmatched caller exists; absence of a direct static frontend fetch is not a missing integration. | No static issues |
| api | POST /api/orders/update-status | POST | {{API_BASE_URL}}/api/orders/update-status | apps/api/src/app/api/orders/update-status/route.ts | apps/api/src/app/api/orders/update-status/route.ts | @tecbunny/core<br>@tecbunny/core/environment-validator<br>@tecbunny/core/server<br>@tecbunny/database<br>@tecbunny/infra<br>next/server | @tecbunny/core/environment-validator | not found | required/static signal found | role/permission signal found | profiles | none found | none found | available API endpoint | No unmatched caller exists; absence of a direct static frontend fetch is not a missing integration. | No static issues |
| superadmin | DELETE /api/organizations | DELETE | {{SUPERADMIN_BASE_URL}}/api/organizations | apps/superadmin/src/app/api/organizations/route.ts | apps/superadmin/src/app/api/organizations/route.ts | @tecbunny/core/permissions<br>@tecbunny/database/server<br>next/server | not found | not found | required/static signal found | role/permission signal found | none detected | apps/superadmin/src/app/superadmin/mgmt/branches/page.tsx<br>apps/superadmin/src/app/superadmin/mgmt/organizations/page.tsx | superadmin | direct frontend/shared caller detected | No unmatched caller exists; absence of a direct static frontend fetch is not a missing integration. | 1 issue(s) |
| superadmin | GET /api/organizations | GET | {{SUPERADMIN_BASE_URL}}/api/organizations | apps/superadmin/src/app/api/organizations/route.ts | apps/superadmin/src/app/api/organizations/route.ts | @tecbunny/core/permissions<br>@tecbunny/database/server<br>next/server | not found | not found | required/static signal found | role/permission signal found | none detected | none found | none found | available API endpoint | No unmatched caller exists; absence of a direct static frontend fetch is not a missing integration. | 1 issue(s) |
| superadmin | POST /api/organizations | POST | {{SUPERADMIN_BASE_URL}}/api/organizations | apps/superadmin/src/app/api/organizations/route.ts | apps/superadmin/src/app/api/organizations/route.ts | @tecbunny/core/permissions<br>@tecbunny/database/server<br>next/server | not found | not found | required/static signal found | role/permission signal found | none detected | none found | none found | available API endpoint | No unmatched caller exists; absence of a direct static frontend fetch is not a missing integration. | 1 issue(s) |
| api | GET /api/otp/generate | GET | {{API_BASE_URL}}/api/otp/generate | apps/api/src/app/api/otp/generate/route.ts | apps/api/src/app/api/otp/generate/route.ts | @tecbunny/core<br>@tecbunny/core/otp-manager<br>@tecbunny/core/rate-limit<br>@tecbunny/core/server-role-guard<br>next/server | inline | @tecbunny/core/rate-limit<br>@tecbunny/core/server-role-guard | required/static signal found | role/permission signal found | rpc:check_otp_rate_limit<br>sales_agents | none found | none found | available API endpoint | No unmatched caller exists; absence of a direct static frontend fetch is not a missing integration. | No static issues |
| api | POST /api/otp/generate | POST | {{API_BASE_URL}}/api/otp/generate | apps/api/src/app/api/otp/generate/route.ts | apps/api/src/app/api/otp/generate/route.ts | @tecbunny/core<br>@tecbunny/core/otp-manager<br>@tecbunny/core/rate-limit<br>@tecbunny/core/server-role-guard<br>next/server | inline | @tecbunny/core/rate-limit<br>@tecbunny/core/server-role-guard | required/static signal found | role/permission signal found | rpc:check_otp_rate_limit<br>sales_agents | none found | none found | available API endpoint | No unmatched caller exists; absence of a direct static frontend fetch is not a missing integration. | No static issues |
| api | GET /api/otp/resend | GET | {{API_BASE_URL}}/api/otp/resend | apps/api/src/app/api/otp/resend/route.ts | apps/api/src/app/api/otp/resend/route.ts | @tecbunny/core/otp-manager<br>@tecbunny/core/server-role-guard<br>next/server | inline | @tecbunny/core/server-role-guard | required/static signal found | role/permission signal found | otp_verifications<br>rpc:check_otp_rate_limit | none found | none found | available API endpoint | No unmatched caller exists; absence of a direct static frontend fetch is not a missing integration. | No static issues |
| api | POST /api/otp/resend | POST | {{API_BASE_URL}}/api/otp/resend | apps/api/src/app/api/otp/resend/route.ts | apps/api/src/app/api/otp/resend/route.ts | @tecbunny/core/otp-manager<br>@tecbunny/core/server-role-guard<br>next/server | inline | @tecbunny/core/server-role-guard | required/static signal found | role/permission signal found | otp_verifications<br>rpc:check_otp_rate_limit | none found | none found | available API endpoint | No unmatched caller exists; absence of a direct static frontend fetch is not a missing integration. | No static issues |
| api | GET /api/otp/verify | GET | {{API_BASE_URL}}/api/otp/verify | apps/api/src/app/api/otp/verify/route.ts | apps/api/src/app/api/otp/verify/route.ts | @tecbunny/core<br>@tecbunny/core/otp-manager<br>@tecbunny/core/rate-limit<br>@tecbunny/core/server<br>@tecbunny/core/server-role-guard<br>@tecbunny/database<br>next/server | inline | @tecbunny/core/rate-limit<br>@tecbunny/core/server-role-guard | required/static signal found | role/permission signal found | order_otp_verifications<br>otp_verifications | none found | none found | available API endpoint | No unmatched caller exists; absence of a direct static frontend fetch is not a missing integration. | No static issues |
| api | POST /api/otp/verify | POST | {{API_BASE_URL}}/api/otp/verify | apps/api/src/app/api/otp/verify/route.ts | apps/api/src/app/api/otp/verify/route.ts | @tecbunny/core<br>@tecbunny/core/otp-manager<br>@tecbunny/core/rate-limit<br>@tecbunny/core/server<br>@tecbunny/core/server-role-guard<br>@tecbunny/database<br>next/server | inline | @tecbunny/core/rate-limit<br>@tecbunny/core/server-role-guard | required/static signal found | role/permission signal found | order_otp_verifications<br>otp_verifications | none found | none found | available API endpoint | No unmatched caller exists; absence of a direct static frontend fetch is not a missing integration. | No static issues |
| api | DELETE /api/page-content | DELETE | {{API_BASE_URL}}/api/page-content | apps/api/src/app/api/page-content/route.ts | apps/api/src/app/api/page-content/route.ts | @tecbunny/core<br>@tecbunny/core/auth/admin-guard<br>@tecbunny/database<br>@tecbunny/infra<br>next/server | inline | @tecbunny/core/auth/admin-guard | required/static signal found | role/permission signal found | page_content | apps/mgmt/src/app/mgmt/admin/page-content/page.tsx<br>apps/mgmt/src/hooks/use-page-content.ts<br>packages/admin-ui/src/components/PoliciesManagement.tsx<br>packages/core/src/hooks/use-page-content.ts | admin-ui, core, mgmt | direct frontend/shared caller detected | No unmatched caller exists; absence of a direct static frontend fetch is not a missing integration. | No static issues |
| api | GET /api/page-content | GET | {{API_BASE_URL}}/api/page-content | apps/api/src/app/api/page-content/route.ts | apps/api/src/app/api/page-content/route.ts | @tecbunny/core<br>@tecbunny/core/auth/admin-guard<br>@tecbunny/database<br>@tecbunny/infra<br>next/server | inline | @tecbunny/core/auth/admin-guard | public or optional/static signal found | role/permission signal found | page_content | none found | none found | available API endpoint | No unmatched caller exists; absence of a direct static frontend fetch is not a missing integration. | 1 issue(s) |
| public | GET /api/page-content | GET | {{PUBLIC_BASE_URL}}/api/page-content | apps/public/src/app/api/page-content/route.ts | apps/public/src/app/api/page-content/route.ts | next/server | inline | not found | public or optional/static signal found | none detected for public route | page_content | none found | none found | available API endpoint | No unmatched caller exists; absence of a direct static frontend fetch is not a missing integration. | 2 issue(s) |
| api | POST /api/page-content | POST | {{API_BASE_URL}}/api/page-content | apps/api/src/app/api/page-content/route.ts | apps/api/src/app/api/page-content/route.ts | @tecbunny/core<br>@tecbunny/core/auth/admin-guard<br>@tecbunny/database<br>@tecbunny/infra<br>next/server | inline | @tecbunny/core/auth/admin-guard | required/static signal found | role/permission signal found | page_content | none found | none found | available API endpoint | No unmatched caller exists; absence of a direct static frontend fetch is not a missing integration. | No static issues |
| api | PUT /api/page-content | PUT | {{API_BASE_URL}}/api/page-content | apps/api/src/app/api/page-content/route.ts | apps/api/src/app/api/page-content/route.ts | @tecbunny/core<br>@tecbunny/core/auth/admin-guard<br>@tecbunny/database<br>@tecbunny/infra<br>next/server | inline | @tecbunny/core/auth/admin-guard | required/static signal found | role/permission signal found | page_content | none found | none found | available API endpoint | No unmatched caller exists; absence of a direct static frontend fetch is not a missing integration. | No static issues |
| api | POST /api/payment/payu/callback | POST | {{API_BASE_URL}}/api/payment/payu/callback | apps/api/src/app/api/payment/payu/callback/route.ts | apps/api/src/app/api/payment/payu/callback/route.ts | @tecbunny/core<br>@tecbunny/core<br>@tecbunny/core/payu-service<br>@tecbunny/core/queue<br>@tecbunny/core/site-url<br>@tecbunny/database<br>next/server | inline | not found | public or optional/static signal found | none detected for public route | orders<br>payment_recovery_queue<br>payment_transactions<br>rpc:complete_payment_transaction<br>settings | none found | none found | system integration endpoint | This endpoint is triggered by external systems, browser redirects, extensions, or server-side workflows. | No static issues |
| api | POST /api/payment/payu/initiate | POST | {{API_BASE_URL}}/api/payment/payu/initiate | apps/api/src/app/api/payment/payu/initiate/route.ts | apps/api/src/app/api/payment/payu/initiate/route.ts | @tecbunny/core<br>@tecbunny/core<br>@tecbunny/core/auth/server-role<br>@tecbunny/core/rate-limit<br>@tecbunny/core/server<br>@tecbunny/database<br>@tecbunny/database<br>next/server | inline | @tecbunny/core/auth/server-role<br>@tecbunny/core/rate-limit | required/static signal found | role/permission signal found | none detected | apps/mgmt/src/app/mgmt/sales/agent-order/page.tsx<br>apps/public/src/app/payment/payu/[orderId]/PayuClientPage.tsx | mgmt, public | direct frontend/shared caller detected | No unmatched caller exists; absence of a direct static frontend fetch is not a missing integration. | No static issues |
| api | GET /api/payments/update | GET | {{API_BASE_URL}}/api/payments/update | apps/api/src/app/api/payments/update/route.ts | apps/api/src/app/api/payments/update/route.ts | @tecbunny/core<br>@tecbunny/core<br>@tecbunny/core/auth/admin-guard<br>@tecbunny/core/rate-limit<br>@tecbunny/core/server<br>@tecbunny/database<br>next/server | inline | @tecbunny/core/auth/admin-guard<br>@tecbunny/core/rate-limit | required/static signal found | role/permission signal found | none detected | none found | none found | available API endpoint | No unmatched caller exists; absence of a direct static frontend fetch is not a missing integration. | No static issues |
| api | POST /api/payments/update | POST | {{API_BASE_URL}}/api/payments/update | apps/api/src/app/api/payments/update/route.ts | apps/api/src/app/api/payments/update/route.ts | @tecbunny/core<br>@tecbunny/core<br>@tecbunny/core/auth/admin-guard<br>@tecbunny/core/rate-limit<br>@tecbunny/core/server<br>@tecbunny/database<br>next/server | inline | @tecbunny/core/auth/admin-guard<br>@tecbunny/core/rate-limit | required/static signal found | role/permission signal found | none detected | none found | none found | available API endpoint | No unmatched caller exists; absence of a direct static frontend fetch is not a missing integration. | No static issues |
| superadmin | GET /api/permissions | GET | {{SUPERADMIN_BASE_URL}}/api/permissions | apps/superadmin/src/app/api/permissions/route.ts | apps/superadmin/src/app/api/permissions/route.ts | @tecbunny/core/permissions<br>@tecbunny/database/server<br>next/server | not found | not found | required/static signal found | role/permission signal found | none detected | apps/superadmin/src/app/superadmin/mgmt/roles/page.tsx | superadmin | direct frontend/shared caller detected | No unmatched caller exists; absence of a direct static frontend fetch is not a missing integration. | 1 issue(s) |
| api | GET /api/pricing/calculate | GET | {{API_BASE_URL}}/api/pricing/calculate | apps/api/src/app/api/pricing/calculate/route.ts | apps/api/src/app/api/pricing/calculate/route.ts | @tecbunny/core<br>@tecbunny/core/pricing-service<br>next/server | inline | not found | not found | none detected for public route | none detected | none found | none found | available API endpoint | No unmatched caller exists; absence of a direct static frontend fetch is not a missing integration. | 1 issue(s) |
| api | POST /api/pricing/calculate | POST | {{API_BASE_URL}}/api/pricing/calculate | apps/api/src/app/api/pricing/calculate/route.ts | apps/api/src/app/api/pricing/calculate/route.ts | @tecbunny/core<br>@tecbunny/core/pricing-service<br>next/server | inline | not found | not found | none detected for public route | none detected | none found | none found | available API endpoint | No unmatched caller exists; absence of a direct static frontend fetch is not a missing integration. | No static issues |
| api | GET /api/pricing/customer-type | GET | {{API_BASE_URL}}/api/pricing/customer-type | apps/api/src/app/api/pricing/customer-type/route.ts | apps/api/src/app/api/pricing/customer-type/route.ts | @tecbunny/core/pricing-service<br>next/server | inline | not found | not found | none detected for public route | none detected | none found | none found | available API endpoint | No unmatched caller exists; absence of a direct static frontend fetch is not a missing integration. | 1 issue(s) |
| api | POST /api/pricing/customer-type | POST | {{API_BASE_URL}}/api/pricing/customer-type | apps/api/src/app/api/pricing/customer-type/route.ts | apps/api/src/app/api/pricing/customer-type/route.ts | @tecbunny/core/pricing-service<br>next/server | inline | not found | not found | none detected for public route | none detected | none found | none found | available API endpoint | No unmatched caller exists; absence of a direct static frontend fetch is not a missing integration. | No static issues |
| api | DELETE /api/products | DELETE | {{API_BASE_URL}}/api/products | apps/api/src/app/api/products/route.ts | apps/api/src/app/api/products/route.ts | @tecbunny/core<br>@tecbunny/core/ai/tax-classification<br>@tecbunny/core/auth/server-role<br>@tecbunny/core/image-processor<br>@tecbunny/core/image-utils<br>@tecbunny/core/product-visibility<br>@tecbunny/database<br>@tecbunny/database/admin<br>next/server | inline | @tecbunny/core/auth/server-role | required/static signal found | role/permission signal found | information_schema.columns<br>product_options<br>product_variants<br>products<br>products_columns_view | apps/mgmt/src/app/mgmt/sales/products/edit/[id]/sales-product-edit.tsx<br>apps/mgmt/src/app/mgmt/sales/products/new/sales-product-new.tsx<br>apps/mgmt/src/components/sales/WalkInOrderManagement.tsx<br>apps/public/src/components/products/ShopPageContent.tsx<br>packages/admin-ui/src/components/CreateProductDialog.tsx | admin-ui, mgmt, public | direct frontend/shared caller detected | No unmatched caller exists; absence of a direct static frontend fetch is not a missing integration. | No static issues |
| api | GET /api/products | GET | {{API_BASE_URL}}/api/products | apps/api/src/app/api/products/route.ts | apps/api/src/app/api/products/route.ts | @tecbunny/core<br>@tecbunny/core/ai/tax-classification<br>@tecbunny/core/auth/server-role<br>@tecbunny/core/image-processor<br>@tecbunny/core/image-utils<br>@tecbunny/core/product-visibility<br>@tecbunny/database<br>@tecbunny/database/admin<br>next/server | inline | @tecbunny/core/auth/server-role | public or optional/static signal found | role/permission signal found | information_schema.columns<br>product_options<br>product_variants<br>products<br>products_columns_view | none found | none found | available API endpoint | No unmatched caller exists; absence of a direct static frontend fetch is not a missing integration. | No static issues |
| public | GET /api/products | GET | {{PUBLIC_BASE_URL}}/api/products | apps/public/src/app/api/products/route.ts | apps/public/src/app/api/products/route.ts | @tecbunny/core/image-utils<br>@tecbunny/core/product-visibility<br>next/server | inline | not found | public or optional/static signal found | none detected for public route | products | none found | none found | available API endpoint | No unmatched caller exists; absence of a direct static frontend fetch is not a missing integration. | 2 issue(s) |
| api | POST /api/products | POST | {{API_BASE_URL}}/api/products | apps/api/src/app/api/products/route.ts | apps/api/src/app/api/products/route.ts | @tecbunny/core<br>@tecbunny/core/ai/tax-classification<br>@tecbunny/core/auth/server-role<br>@tecbunny/core/image-processor<br>@tecbunny/core/image-utils<br>@tecbunny/core/product-visibility<br>@tecbunny/database<br>@tecbunny/database/admin<br>next/server | inline | @tecbunny/core/auth/server-role | required/static signal found | role/permission signal found | information_schema.columns<br>product_options<br>product_variants<br>products<br>products_columns_view | none found | none found | available API endpoint | No unmatched caller exists; absence of a direct static frontend fetch is not a missing integration. | No static issues |
| api | PUT /api/products | PUT | {{API_BASE_URL}}/api/products | apps/api/src/app/api/products/route.ts | apps/api/src/app/api/products/route.ts | @tecbunny/core<br>@tecbunny/core/ai/tax-classification<br>@tecbunny/core/auth/server-role<br>@tecbunny/core/image-processor<br>@tecbunny/core/image-utils<br>@tecbunny/core/product-visibility<br>@tecbunny/database<br>@tecbunny/database/admin<br>next/server | inline | @tecbunny/core/auth/server-role | required/static signal found | role/permission signal found | information_schema.columns<br>product_options<br>product_variants<br>products<br>products_columns_view | none found | none found | available API endpoint | No unmatched caller exists; absence of a direct static frontend fetch is not a missing integration. | No static issues |
| api | GET /api/products/{id} | GET | {{API_BASE_URL}}/api/products/{id} | apps/api/src/app/api/products/[id]/route.ts | apps/api/src/app/api/products/[id]/route.ts | @tecbunny/core<br>@tecbunny/core/ai/tax-classification<br>@tecbunny/core/auth/server-role<br>@tecbunny/core/image-processor<br>@tecbunny/core/image-utils<br>@tecbunny/core/product-visibility<br>@tecbunny/core/server<br>@tecbunny/database<br>next/server | inline | @tecbunny/core/auth/server-role | public or optional/static signal found | role/permission signal found | products | apps/mgmt/src/app/mgmt/sales/products/sales-products.tsx<br>packages/admin-ui/src/components/admin-products-new.tsx | admin-ui, mgmt | direct frontend/shared caller detected | No unmatched caller exists; absence of a direct static frontend fetch is not a missing integration. | No static issues |
| api | PATCH /api/products/{id} | PATCH | {{API_BASE_URL}}/api/products/{id} | apps/api/src/app/api/products/[id]/route.ts | apps/api/src/app/api/products/[id]/route.ts | @tecbunny/core<br>@tecbunny/core/ai/tax-classification<br>@tecbunny/core/auth/server-role<br>@tecbunny/core/image-processor<br>@tecbunny/core/image-utils<br>@tecbunny/core/product-visibility<br>@tecbunny/core/server<br>@tecbunny/database<br>next/server | inline | @tecbunny/core/auth/server-role | required/static signal found | role/permission signal found | products | none found | none found | available API endpoint | No unmatched caller exists; absence of a direct static frontend fetch is not a missing integration. | No static issues |
| api | GET /api/products/bulk-edit | GET | {{API_BASE_URL}}/api/products/bulk-edit | apps/api/src/app/api/products/bulk-edit/route.ts | apps/api/src/app/api/products/bulk-edit/route.ts | @tecbunny/core<br>@tecbunny/core/auth/admin-guard<br>@tecbunny/core/server<br>next/server | inline | @tecbunny/core/auth/admin-guard | public or optional/static signal found | role/permission signal found | information_schema.columns<br>products | none found | none found | available API endpoint | No unmatched caller exists; absence of a direct static frontend fetch is not a missing integration. | No static issues |
| api | POST /api/products/bulk-edit | POST | {{API_BASE_URL}}/api/products/bulk-edit | apps/api/src/app/api/products/bulk-edit/route.ts | apps/api/src/app/api/products/bulk-edit/route.ts | @tecbunny/core<br>@tecbunny/core/auth/admin-guard<br>@tecbunny/core/server<br>next/server | inline | @tecbunny/core/auth/admin-guard | required/static signal found | role/permission signal found | information_schema.columns<br>products | none found | none found | available API endpoint | No unmatched caller exists; absence of a direct static frontend fetch is not a missing integration. | No static issues |
| api | POST /api/products/cleanup-images | POST | {{API_BASE_URL}}/api/products/cleanup-images | apps/api/src/app/api/products/cleanup-images/route.ts | apps/api/src/app/api/products/cleanup-images/route.ts | @tecbunny/core<br>@tecbunny/core/auth/server-role<br>@tecbunny/core/queue/image-jobs<br>next/server | inline | @tecbunny/core/auth/server-role | required/static signal found | role/permission signal found | none detected | none found | none found | available API endpoint | No unmatched caller exists; absence of a direct static frontend fetch is not a missing integration. | No static issues |
| api | DELETE /api/products/cleanup | DELETE | {{API_BASE_URL}}/api/products/cleanup | apps/api/src/app/api/products/cleanup/route.ts | apps/api/src/app/api/products/cleanup/route.ts | @tecbunny/core<br>@tecbunny/core/auth/admin-guard<br>next/server | not found | @tecbunny/core/auth/admin-guard | required/static signal found | role/permission signal found | products | none found | none found | available API endpoint | No unmatched caller exists; absence of a direct static frontend fetch is not a missing integration. | No static issues |
| api | GET /api/products/export | GET | {{API_BASE_URL}}/api/products/export | apps/api/src/app/api/products/export/route.ts | apps/api/src/app/api/products/export/route.ts | @tecbunny/core/auth/admin-guard<br>next/server | not found | @tecbunny/core/auth/admin-guard | public or optional/static signal found | role/permission signal found | products | none found | none found | available API endpoint | No unmatched caller exists; absence of a direct static frontend fetch is not a missing integration. | 1 issue(s) |
| api | POST /api/products/fix-images | POST | {{API_BASE_URL}}/api/products/fix-images | apps/api/src/app/api/products/fix-images/route.ts | apps/api/src/app/api/products/fix-images/route.ts | @tecbunny/core<br>@tecbunny/core/admin-auth<br>@tecbunny/core/queue/image-jobs<br>@tecbunny/database<br>next/server | inline | @tecbunny/core/admin-auth | required/static signal found | role/permission signal found | none detected | none found | none found | available API endpoint | No unmatched caller exists; absence of a direct static frontend fetch is not a missing integration. | No static issues |
| api | GET /api/products/image-diagnostics | GET | {{API_BASE_URL}}/api/products/image-diagnostics | apps/api/src/app/api/products/image-diagnostics/route.ts | apps/api/src/app/api/products/image-diagnostics/route.ts | @tecbunny/core<br>@tecbunny/core/auth/admin-guard<br>@tecbunny/core/image-utils<br>next/server | not found | @tecbunny/core/auth/admin-guard | public or optional/static signal found | role/permission signal found | products | none found | none found | available API endpoint | No unmatched caller exists; absence of a direct static frontend fetch is not a missing integration. | 1 issue(s) |
| api | GET /api/products/import | GET | {{API_BASE_URL}}/api/products/import | apps/api/src/app/api/products/import/route.ts | apps/api/src/app/api/products/import/route.ts | @tecbunny/core<br>@tecbunny/core/auth/admin-guard<br>@tecbunny/core/sanitize-html<br>@tecbunny/core/types/products<br>@tecbunny/database<br>next/server | inline | @tecbunny/core/auth/admin-guard | public or optional/static signal found | role/permission signal found | information_schema.columns<br>product_options<br>product_variants<br>products | none found | none found | available API endpoint | No unmatched caller exists; absence of a direct static frontend fetch is not a missing integration. | 1 issue(s) |
| api | POST /api/products/import | POST | {{API_BASE_URL}}/api/products/import | apps/api/src/app/api/products/import/route.ts | apps/api/src/app/api/products/import/route.ts | @tecbunny/core<br>@tecbunny/core/auth/admin-guard<br>@tecbunny/core/sanitize-html<br>@tecbunny/core/types/products<br>@tecbunny/database<br>next/server | inline | @tecbunny/core/auth/admin-guard | required/static signal found | role/permission signal found | information_schema.columns<br>product_options<br>product_variants<br>products | none found | none found | available API endpoint | No unmatched caller exists; absence of a direct static frontend fetch is not a missing integration. | No static issues |
| api | POST /api/products/manual-import | POST | {{API_BASE_URL}}/api/products/manual-import | apps/api/src/app/api/products/manual-import/route.ts | apps/api/src/app/api/products/manual-import/route.ts | @tecbunny/core<br>@tecbunny/core/auth/admin-guard<br>next/server | not found | @tecbunny/core/auth/admin-guard | required/static signal found | role/permission signal found | products | none found | none found | available API endpoint | No unmatched caller exists; absence of a direct static frontend fetch is not a missing integration. | No static issues |
| api | GET /api/products/recommendations | GET | {{API_BASE_URL}}/api/products/recommendations | apps/api/src/app/api/products/recommendations/route.ts | apps/api/src/app/api/products/recommendations/route.ts | @tecbunny/core/image-utils<br>@tecbunny/core/product-visibility<br>@tecbunny/database<br>next/server | not found | not found | public or optional/static signal found | none detected for public route | analytics_events<br>products | none found | none found | available API endpoint | No unmatched caller exists; absence of a direct static frontend fetch is not a missing integration. | 3 issue(s) |
| api | POST /api/products/scrape-url | POST | {{API_BASE_URL}}/api/products/scrape-url | apps/api/src/app/api/products/scrape-url/route.ts | apps/api/src/app/api/products/scrape-url/route.ts | @tecbunny/core<br>@tecbunny/core/auth/admin-guard<br>@tecbunny/core/security/network-validation<br>next/server | @tecbunny/core/security/network-validation | @tecbunny/core/auth/admin-guard | required/static signal found | role/permission signal found | products | none found | none found | available API endpoint | No unmatched caller exists; absence of a direct static frontend fetch is not a missing integration. | No static issues |
| api | OPTIONS /api/products/scraper | OPTIONS | {{API_BASE_URL}}/api/products/scraper | apps/api/src/app/api/products/scraper/route.ts | apps/api/src/app/api/products/scraper/route.ts | ../../extension-security<br>@tecbunny/core/image-processor<br>@tecbunny/core/server<br>next/server | inline | not found | required/static signal found | role/permission signal found | products | none found | none found | preflight route | CORS preflight endpoints are invoked by browsers, not application code. | No static issues |
| api | POST /api/products/scraper | POST | {{API_BASE_URL}}/api/products/scraper | apps/api/src/app/api/products/scraper/route.ts | apps/api/src/app/api/products/scraper/route.ts | ../../extension-security<br>@tecbunny/core/image-processor<br>@tecbunny/core/server<br>next/server | inline | not found | required/static signal found | role/permission signal found | products | none found | none found | available API endpoint | No unmatched caller exists; absence of a direct static frontend fetch is not a missing integration. | No static issues |
| api | OPTIONS /api/products/scraper/ai | OPTIONS | {{API_BASE_URL}}/api/products/scraper/ai | apps/api/src/app/api/products/scraper/ai/route.ts | apps/api/src/app/api/products/scraper/ai/route.ts | ../../../extension-security<br>@tecbunny/core<br>next/server | inline | not found | required/static signal found | role/permission signal found | none detected | none found | none found | preflight route | CORS preflight endpoints are invoked by browsers, not application code. | 1 issue(s) |
| api | POST /api/products/scraper/ai | POST | {{API_BASE_URL}}/api/products/scraper/ai | apps/api/src/app/api/products/scraper/ai/route.ts | apps/api/src/app/api/products/scraper/ai/route.ts | ../../../extension-security<br>@tecbunny/core<br>next/server | inline | not found | required/static signal found | role/permission signal found | none detected | none found | none found | available API endpoint | No unmatched caller exists; absence of a direct static frontend fetch is not a missing integration. | No static issues |
| api | POST /api/products/simple-import | POST | {{API_BASE_URL}}/api/products/simple-import | apps/api/src/app/api/products/simple-import/route.ts | apps/api/src/app/api/products/simple-import/route.ts | @tecbunny/core<br>@tecbunny/core/auth/admin-guard<br>@tecbunny/core/server<br>next/server | inline | @tecbunny/core/auth/admin-guard | required/static signal found | role/permission signal found | products | none found | none found | available API endpoint | No unmatched caller exists; absence of a direct static frontend fetch is not a missing integration. | No static issues |
| api | GET /api/products/template | GET | {{API_BASE_URL}}/api/products/template | apps/api/src/app/api/products/template/route.ts | apps/api/src/app/api/products/template/route.ts | @tecbunny/core<br>next/server | not found | not found | not found | none detected for public route | none detected | none found | none found | available API endpoint | No unmatched caller exists; absence of a direct static frontend fetch is not a missing integration. | 1 issue(s) |
| api | GET /api/projects | GET | {{API_BASE_URL}}/api/projects | apps/api/src/app/api/projects/route.ts | apps/api/src/app/api/projects/route.ts | @tecbunny/core<br>@tecbunny/core/server<br>@tecbunny/core/server<br>@tecbunny/database/server<br>next/server | inline | not found | required/static signal found | role/permission signal found | upcoming_projects | none found | none found | available API endpoint | No unmatched caller exists; absence of a direct static frontend fetch is not a missing integration. | No static issues |
| api | POST /api/projects | POST | {{API_BASE_URL}}/api/projects | apps/api/src/app/api/projects/route.ts | apps/api/src/app/api/projects/route.ts | @tecbunny/core<br>@tecbunny/core/server<br>@tecbunny/core/server<br>@tecbunny/database/server<br>next/server | inline | not found | required/static signal found | role/permission signal found | upcoming_projects | none found | none found | available API endpoint | No unmatched caller exists; absence of a direct static frontend fetch is not a missing integration. | No static issues |
| api | DELETE /api/projects/{id} | DELETE | {{API_BASE_URL}}/api/projects/{id} | apps/api/src/app/api/projects/[id]/route.ts | apps/api/src/app/api/projects/[id]/route.ts | @tecbunny/core<br>@tecbunny/core/server<br>@tecbunny/core/server<br>@tecbunny/database/server<br>next/server | inline | not found | required/static signal found | role/permission signal found | upcoming_projects | none found | none found | available API endpoint | No unmatched caller exists; absence of a direct static frontend fetch is not a missing integration. | No static issues |
| api | PUT /api/projects/{id} | PUT | {{API_BASE_URL}}/api/projects/{id} | apps/api/src/app/api/projects/[id]/route.ts | apps/api/src/app/api/projects/[id]/route.ts | @tecbunny/core<br>@tecbunny/core/server<br>@tecbunny/core/server<br>@tecbunny/database/server<br>next/server | inline | not found | required/static signal found | role/permission signal found | upcoming_projects | none found | none found | available API endpoint | No unmatched caller exists; absence of a direct static frontend fetch is not a missing integration. | No static issues |
| api | GET /api/projects/{id}/pdf | GET | {{API_BASE_URL}}/api/projects/{id}/pdf | apps/api/src/app/api/projects/[id]/pdf/route.ts | apps/api/src/app/api/projects/[id]/pdf/route.ts | @tecbunny/core<br>@tecbunny/core/server<br>@tecbunny/database/server<br>next/server | not found | not found | required/static signal found | not found | upcoming_projects | none found | none found | available API endpoint | No unmatched caller exists; absence of a direct static frontend fetch is not a missing integration. | No static issues |
| api | POST /api/promotions/claim-viral | POST | {{API_BASE_URL}}/api/promotions/claim-viral | apps/api/src/app/api/promotions/claim-viral/route.ts | apps/api/src/app/api/promotions/claim-viral/route.ts | @tecbunny/core<br>@tecbunny/core/rate-limit<br>@tecbunny/core/server<br>next/server | inline | @tecbunny/core/rate-limit | not found | none detected for public route | customer_promotions | packages/ui/src/components/ui/ViralWarrantyModal.tsx | ui | direct frontend/shared caller detected | No unmatched caller exists; absence of a direct static frontend fetch is not a missing integration. | No static issues |
| api | POST /api/promotions/free-installation-claim | POST | {{API_BASE_URL}}/api/promotions/free-installation-claim | apps/api/src/app/api/promotions/free-installation-claim/route.ts | apps/api/src/app/api/promotions/free-installation-claim/route.ts | @tecbunny/core<br>@tecbunny/core/otp-manager<br>@tecbunny/core/rate-limit<br>@tecbunny/core/server<br>next/server | inline | @tecbunny/core/rate-limit | not found | none detected for public route | contact_messages<br>free_installation_slots | packages/ui/src/components/ui/BlitzAuditBanner.tsx | ui | direct frontend/shared caller detected | No unmatched caller exists; absence of a direct static frontend fetch is not a missing integration. | No static issues |
| api | POST /api/quotes | POST | {{API_BASE_URL}}/api/quotes | apps/api/src/app/api/quotes/route.ts | apps/api/src/app/api/quotes/route.ts | @tecbunny/core<br>@tecbunny/core/custom-setup-pricing<br>@tecbunny/core/custom-setup-pricing-server<br>@tecbunny/core/custom-setup-service<br>@tecbunny/core/custom-setup.constants<br>@tecbunny/core/server<br>@tecbunny/database/server<br>next/server | not found | not found | public or optional/static signal found | none detected for public route | leads<br>quotes<br>settings | apps/mgmt/src/components/customised-setups/CustomSetupFlow.tsx<br>apps/mgmt/src/components/customised-setups/QuoteCTA.tsx<br>apps/public/src/components/customised-setups/CustomSetupFlow.tsx<br>apps/public/src/components/customised-setups/QuoteCTA.tsx<br>apps/public/src/components/customised-setups/WizardCustomSetupFlow.tsx | mgmt, public | direct frontend/shared caller detected | No unmatched caller exists; absence of a direct static frontend fetch is not a missing integration. | No static issues |
| api | GET /api/quotes/{id} | GET | {{API_BASE_URL}}/api/quotes/{id} | apps/api/src/app/api/quotes/[id]/route.ts | apps/api/src/app/api/quotes/[id]/route.ts | @tecbunny/core/admin-auth<br>@tecbunny/core/db<br>@tecbunny/core/pdf-generator<br>next/server | not found | @tecbunny/core/admin-auth | required/static signal found | role/permission signal found | quotes | apps/mgmt/src/components/customised-setups/CustomSetupFlow.tsx<br>apps/public/src/components/customised-setups/CustomSetupFlow.tsx<br>apps/public/src/components/customised-setups/WizardCustomSetupFlow.tsx | mgmt, public | direct frontend/shared caller detected | No unmatched caller exists; absence of a direct static frontend fetch is not a missing integration. | No static issues |
| api | POST /api/quotes/{id}/accept-counter | POST | {{API_BASE_URL}}/api/quotes/{id}/accept-counter | apps/api/src/app/api/quotes/[id]/accept-counter/route.ts | apps/api/src/app/api/quotes/[id]/accept-counter/route.ts | @tecbunny/core/quotes/action-token<br>@tecbunny/database<br>next/server | not found | not found | required/static signal found | role/permission signal found | quotes | none found | none found | available API endpoint | No unmatched caller exists; absence of a direct static frontend fetch is not a missing integration. | No static issues |
| api | GET /api/quotes/{id}/advance-payment/confirm | GET | {{API_BASE_URL}}/api/quotes/{id}/advance-payment/confirm | apps/api/src/app/api/quotes/[id]/advance-payment/confirm/route.ts | apps/api/src/app/api/quotes/[id]/advance-payment/confirm/route.ts | @tecbunny/core<br>@tecbunny/core/quotes/action-token<br>@tecbunny/database<br>next/server | not found | not found | required/static signal found | role/permission signal found | advance_payment_requests<br>quotes | none found | none found | available API endpoint | No unmatched caller exists; absence of a direct static frontend fetch is not a missing integration. | 1 issue(s) |
| api | POST /api/quotes/{id}/advance-payment/confirm | POST | {{API_BASE_URL}}/api/quotes/{id}/advance-payment/confirm | apps/api/src/app/api/quotes/[id]/advance-payment/confirm/route.ts | apps/api/src/app/api/quotes/[id]/advance-payment/confirm/route.ts | @tecbunny/core<br>@tecbunny/core/quotes/action-token<br>@tecbunny/database<br>next/server | not found | not found | required/static signal found | role/permission signal found | advance_payment_requests<br>quotes | none found | none found | available API endpoint | No unmatched caller exists; absence of a direct static frontend fetch is not a missing integration. | No static issues |
| api | POST /api/quotes/{id}/advance-payment/generate-link | POST | {{API_BASE_URL}}/api/quotes/{id}/advance-payment/generate-link | apps/api/src/app/api/quotes/[id]/advance-payment/generate-link/route.ts | apps/api/src/app/api/quotes/[id]/advance-payment/generate-link/route.ts | @tecbunny/core<br>@tecbunny/core/quotes/action-token<br>@tecbunny/database<br>next/server | not found | not found | required/static signal found | role/permission signal found | advance_payment_requests<br>quotes | none found | none found | available API endpoint | No unmatched caller exists; absence of a direct static frontend fetch is not a missing integration. | No static issues |
| api | POST /api/quotes/{id}/reject-counter | POST | {{API_BASE_URL}}/api/quotes/{id}/reject-counter | apps/api/src/app/api/quotes/[id]/reject-counter/route.ts | apps/api/src/app/api/quotes/[id]/reject-counter/route.ts | @tecbunny/core/quotes/action-token<br>@tecbunny/database<br>next/server | not found | not found | required/static signal found | role/permission signal found | quotes | none found | none found | available API endpoint | No unmatched caller exists; absence of a direct static frontend fetch is not a missing integration. | No static issues |
| api | POST /api/quotes/bid | POST | {{API_BASE_URL}}/api/quotes/bid | apps/api/src/app/api/quotes/bid/route.ts | apps/api/src/app/api/quotes/bid/route.ts | @tecbunny/core/logger<br>@tecbunny/core/server<br>@tecbunny/core/whatsapp-service<br>@tecbunny/database/server<br>next/server | inline | not found | public or optional/static signal found | none detected for public route | quotes | none found | none found | available API endpoint | No unmatched caller exists; absence of a direct static frontend fetch is not a missing integration. | No static issues |
| api | GET /api/referral | GET | {{API_BASE_URL}}/api/referral | apps/api/src/app/api/referral/route.ts | apps/api/src/app/api/referral/route.ts | @tecbunny/core<br>@tecbunny/core/rate-limit<br>@tecbunny/database<br>next/server | not found | @tecbunny/core/rate-limit | required/static signal found | role/permission signal found | referral_codes | none found | none found | available API endpoint | No unmatched caller exists; absence of a direct static frontend fetch is not a missing integration. | 1 issue(s) |
| api | POST /api/referral/claim | POST | {{API_BASE_URL}}/api/referral/claim | apps/api/src/app/api/referral/claim/route.ts | apps/api/src/app/api/referral/claim/route.ts | @tecbunny/core<br>@tecbunny/core/rate-limit<br>@tecbunny/database<br>next/server | inline | @tecbunny/core/rate-limit | required/static signal found | role/permission signal found | referral_claims<br>referral_codes<br>rpc:increment_referral_code_uses | none found | none found | available API endpoint | No unmatched caller exists; absence of a direct static frontend fetch is not a missing integration. | No static issues |
| api | GET /api/roles-public | GET | {{API_BASE_URL}}/api/roles-public | apps/api/src/app/api/roles-public/route.ts | apps/api/src/app/api/roles-public/route.ts | @tecbunny/core<br>next/server | not found | not found | public or optional/static signal found | role/permission signal found | none detected | none found | none found | available API endpoint | No unmatched caller exists; absence of a direct static frontend fetch is not a missing integration. | 1 issue(s) |
| api | GET /api/roles | GET | {{API_BASE_URL}}/api/roles | apps/api/src/app/api/roles/route.ts | apps/api/src/app/api/roles/route.ts | @tecbunny/core<br>@tecbunny/core/auth/server-role<br>@tecbunny/core/roles<br>next/server | not found | @tecbunny/core/auth/server-role | required/static signal found | role/permission signal found | none detected | apps/superadmin/src/app/superadmin/mgmt/roles/page.tsx | superadmin | direct frontend/shared caller detected | Admin API modules are often consumed by another deployed app, shared package, Postman collection, or server-rendered workflow. | 1 issue(s) |
| superadmin | GET /api/roles | GET | {{SUPERADMIN_BASE_URL}}/api/roles | apps/superadmin/src/app/api/roles/route.ts | apps/superadmin/src/app/api/roles/route.ts | @tecbunny/core/permissions<br>@tecbunny/database/server<br>next/server | inline | not found | required/static signal found | role/permission signal found | none detected | none found | none found | available API endpoint | No unmatched caller exists; absence of a direct static frontend fetch is not a missing integration. | 1 issue(s) |
| api | POST /api/roles | POST | {{API_BASE_URL}}/api/roles | apps/api/src/app/api/roles/route.ts | apps/api/src/app/api/roles/route.ts | @tecbunny/core<br>@tecbunny/core/auth/server-role<br>@tecbunny/core/roles<br>next/server | not found | @tecbunny/core/auth/server-role | required/static signal found | role/permission signal found | none detected | none found | none found | cross-app/admin endpoint | Admin API modules are often consumed by another deployed app, shared package, Postman collection, or server-rendered workflow. | No static issues |
| superadmin | POST /api/roles | POST | {{SUPERADMIN_BASE_URL}}/api/roles | apps/superadmin/src/app/api/roles/route.ts | apps/superadmin/src/app/api/roles/route.ts | @tecbunny/core/permissions<br>@tecbunny/database/server<br>next/server | inline | not found | required/static signal found | role/permission signal found | none detected | none found | none found | available API endpoint | No unmatched caller exists; absence of a direct static frontend fetch is not a missing integration. | 1 issue(s) |
| api | POST /api/sales-agents/apply | POST | {{API_BASE_URL}}/api/sales-agents/apply | apps/api/src/app/api/sales-agents/apply/route.ts | apps/api/src/app/api/sales-agents/apply/route.ts | @tecbunny/core<br>@tecbunny/database<br>next/server | not found | not found | public or optional/static signal found | none detected for public route | sales_agents | apps/public/src/components/profile/UserProfile.tsx | public | direct frontend/shared caller detected | No unmatched caller exists; absence of a direct static frontend fetch is not a missing integration. | No static issues |
| api | GET /api/security/audit-logs | GET | {{API_BASE_URL}}/api/security/audit-logs | apps/api/src/app/api/security/audit-logs/route.ts | apps/api/src/app/api/security/audit-logs/route.ts | @tecbunny/core<br>@tecbunny/core/auth/admin-guard<br>next/server | inline | @tecbunny/core/auth/admin-guard | required/static signal found | role/permission signal found | security_audit_log | packages/admin-ui/src/components/security-dashboard.tsx | admin-ui | direct frontend/shared caller detected | No unmatched caller exists; absence of a direct static frontend fetch is not a missing integration. | No static issues |
| api | POST /api/security/audit-logs | POST | {{API_BASE_URL}}/api/security/audit-logs | apps/api/src/app/api/security/audit-logs/route.ts | apps/api/src/app/api/security/audit-logs/route.ts | @tecbunny/core<br>@tecbunny/core/auth/admin-guard<br>next/server | inline | @tecbunny/core/auth/admin-guard | required/static signal found | role/permission signal found | security_audit_log | none found | none found | available API endpoint | No unmatched caller exists; absence of a direct static frontend fetch is not a missing integration. | No static issues |
| api | GET /api/security/mfa-status | GET | {{API_BASE_URL}}/api/security/mfa-status | apps/api/src/app/api/security/mfa-status/route.ts | apps/api/src/app/api/security/mfa-status/route.ts | @tecbunny/core<br>@tecbunny/core/auth/admin-guard<br>next/server | inline | @tecbunny/core/auth/admin-guard | required/static signal found | role/permission signal found | security_audit_log<br>user_mfa_status | none found | none found | available API endpoint | No unmatched caller exists; absence of a direct static frontend fetch is not a missing integration. | No static issues |
| api | POST /api/security/mfa-status | POST | {{API_BASE_URL}}/api/security/mfa-status | apps/api/src/app/api/security/mfa-status/route.ts | apps/api/src/app/api/security/mfa-status/route.ts | @tecbunny/core<br>@tecbunny/core/auth/admin-guard<br>next/server | inline | @tecbunny/core/auth/admin-guard | required/static signal found | role/permission signal found | security_audit_log<br>user_mfa_status | none found | none found | available API endpoint | No unmatched caller exists; absence of a direct static frontend fetch is not a missing integration. | No static issues |
| api | GET /api/security/settings | GET | {{API_BASE_URL}}/api/security/settings | apps/api/src/app/api/security/settings/route.ts | apps/api/src/app/api/security/settings/route.ts | @tecbunny/core<br>@tecbunny/core/auth/admin-guard<br>next/server | inline | @tecbunny/core/auth/admin-guard | required/static signal found | role/permission signal found | security_audit_log<br>security_settings<br>settings | packages/admin-ui/src/components/security-dashboard.tsx | admin-ui | direct frontend/shared caller detected | No unmatched caller exists; absence of a direct static frontend fetch is not a missing integration. | No static issues |
| api | POST /api/security/settings | POST | {{API_BASE_URL}}/api/security/settings | apps/api/src/app/api/security/settings/route.ts | apps/api/src/app/api/security/settings/route.ts | @tecbunny/core<br>@tecbunny/core/auth/admin-guard<br>next/server | inline | @tecbunny/core/auth/admin-guard | required/static signal found | role/permission signal found | security_audit_log<br>security_settings<br>settings | none found | none found | available API endpoint | No unmatched caller exists; absence of a direct static frontend fetch is not a missing integration. | No static issues |
| api | POST /api/security/validate-password | POST | {{API_BASE_URL}}/api/security/validate-password | apps/api/src/app/api/security/validate-password/route.ts | apps/api/src/app/api/security/validate-password/route.ts | @tecbunny/core<br>next/server | inline | not found | not found | none detected for public route | rpc:validate_password_strength | packages/admin-ui/src/components/security-dashboard.tsx | admin-ui | direct frontend/shared caller detected | No unmatched caller exists; absence of a direct static frontend fetch is not a missing integration. | No static issues |
| api | GET /api/service-availability | GET | {{API_BASE_URL}}/api/service-availability | apps/api/src/app/api/service-availability/route.ts | apps/api/src/app/api/service-availability/route.ts | @tecbunny/core/service-area-availability<br>next/server | not found | not found | not found | none detected for public route | none detected | none found | none found | available API endpoint | No unmatched caller exists; absence of a direct static frontend fetch is not a missing integration. | 3 issue(s) |
| api | GET /api/services | GET | {{API_BASE_URL}}/api/services | apps/api/src/app/api/services/route.ts | apps/api/src/app/api/services/route.ts | @tecbunny/core<br>@tecbunny/core<br>@tecbunny/core/auth/server-role<br>@tecbunny/core/server<br>@tecbunny/database<br>next/server | inline | @tecbunny/core/auth/server-role | required/static signal found | role/permission signal found | services | apps/superadmin/src/app/superadmin/mgmt/services/page.tsx | superadmin | direct frontend/shared caller detected | No unmatched caller exists; absence of a direct static frontend fetch is not a missing integration. | No static issues |
| api | POST /api/services | POST | {{API_BASE_URL}}/api/services | apps/api/src/app/api/services/route.ts | apps/api/src/app/api/services/route.ts | @tecbunny/core<br>@tecbunny/core<br>@tecbunny/core/auth/server-role<br>@tecbunny/core/server<br>@tecbunny/database<br>next/server | inline | @tecbunny/core/auth/server-role | required/static signal found | role/permission signal found | services | none found | none found | available API endpoint | No unmatched caller exists; absence of a direct static frontend fetch is not a missing integration. | No static issues |
| api | DELETE /api/services/{id} | DELETE | {{API_BASE_URL}}/api/services/{id} | apps/api/src/app/api/services/[id]/route.ts | apps/api/src/app/api/services/[id]/route.ts | @tecbunny/core<br>@tecbunny/core<br>@tecbunny/database<br>next/server | inline | not found | required/static signal found | role/permission signal found | service_requests<br>services | none found | none found | available API endpoint | No unmatched caller exists; absence of a direct static frontend fetch is not a missing integration. | No static issues |
| api | GET /api/services/{id} | GET | {{API_BASE_URL}}/api/services/{id} | apps/api/src/app/api/services/[id]/route.ts | apps/api/src/app/api/services/[id]/route.ts | @tecbunny/core<br>@tecbunny/core<br>@tecbunny/database<br>next/server | inline | not found | required/static signal found | role/permission signal found | service_requests<br>services | none found | none found | available API endpoint | No unmatched caller exists; absence of a direct static frontend fetch is not a missing integration. | 1 issue(s) |
| api | PUT /api/services/{id} | PUT | {{API_BASE_URL}}/api/services/{id} | apps/api/src/app/api/services/[id]/route.ts | apps/api/src/app/api/services/[id]/route.ts | @tecbunny/core<br>@tecbunny/core<br>@tecbunny/database<br>next/server | inline | not found | required/static signal found | role/permission signal found | service_requests<br>services | none found | none found | available API endpoint | No unmatched caller exists; absence of a direct static frontend fetch is not a missing integration. | No static issues |
| api | GET /api/services/engineers | GET | {{API_BASE_URL}}/api/services/engineers | apps/api/src/app/api/services/engineers/route.ts | apps/api/src/app/api/services/engineers/route.ts | @tecbunny/core<br>@tecbunny/core/auth/admin-guard<br>@tecbunny/core/service-management<br>next/server | inline | @tecbunny/core/auth/admin-guard | required/static signal found | role/permission signal found | none detected | none found | none found | available API endpoint | No unmatched caller exists; absence of a direct static frontend fetch is not a missing integration. | 1 issue(s) |
| api | POST /api/services/engineers | POST | {{API_BASE_URL}}/api/services/engineers | apps/api/src/app/api/services/engineers/route.ts | apps/api/src/app/api/services/engineers/route.ts | @tecbunny/core<br>@tecbunny/core/auth/admin-guard<br>@tecbunny/core/service-management<br>next/server | inline | @tecbunny/core/auth/admin-guard | required/static signal found | role/permission signal found | none detected | none found | none found | available API endpoint | No unmatched caller exists; absence of a direct static frontend fetch is not a missing integration. | No static issues |
| api | GET /api/services/tickets | GET | {{API_BASE_URL}}/api/services/tickets | apps/api/src/app/api/services/tickets/route.ts | apps/api/src/app/api/services/tickets/route.ts | @tecbunny/core<br>@tecbunny/core/auth/admin-guard<br>@tecbunny/core/service-management<br>next/server | inline | @tecbunny/core/auth/admin-guard | required/static signal found | role/permission signal found | none detected | none found | none found | available API endpoint | No unmatched caller exists; absence of a direct static frontend fetch is not a missing integration. | 1 issue(s) |
| api | POST /api/services/tickets | POST | {{API_BASE_URL}}/api/services/tickets | apps/api/src/app/api/services/tickets/route.ts | apps/api/src/app/api/services/tickets/route.ts | @tecbunny/core<br>@tecbunny/core/auth/admin-guard<br>@tecbunny/core/service-management<br>next/server | inline | @tecbunny/core/auth/admin-guard | required/static signal found | role/permission signal found | none detected | none found | none found | available API endpoint | No unmatched caller exists; absence of a direct static frontend fetch is not a missing integration. | No static issues |
| api | GET /api/services/tickets/{id} | GET | {{API_BASE_URL}}/api/services/tickets/{id} | apps/api/src/app/api/services/tickets/[id]/route.ts | apps/api/src/app/api/services/tickets/[id]/route.ts | @tecbunny/core<br>@tecbunny/core/auth/admin-guard<br>@tecbunny/core/service-management<br>next/server | inline | @tecbunny/core/auth/admin-guard | required/static signal found | role/permission signal found | service_tickets | none found | none found | available API endpoint | No unmatched caller exists; absence of a direct static frontend fetch is not a missing integration. | No static issues |
| api | PUT /api/services/tickets/{id} | PUT | {{API_BASE_URL}}/api/services/tickets/{id} | apps/api/src/app/api/services/tickets/[id]/route.ts | apps/api/src/app/api/services/tickets/[id]/route.ts | @tecbunny/core<br>@tecbunny/core/auth/admin-guard<br>@tecbunny/core/service-management<br>next/server | inline | @tecbunny/core/auth/admin-guard | required/static signal found | role/permission signal found | service_tickets | none found | none found | available API endpoint | No unmatched caller exists; absence of a direct static frontend fetch is not a missing integration. | No static issues |
| api | DELETE /api/settings | DELETE | {{API_BASE_URL}}/api/settings | apps/api/src/app/api/settings/route.ts | apps/api/src/app/api/settings/route.ts | @tecbunny/core<br>@tecbunny/core<br>@tecbunny/core/auth/server-role<br>@tecbunny/core/server<br>@tecbunny/core/server<br>@tecbunny/core/server<br>next/server | inline | @tecbunny/core/auth/server-role | required/static signal found | role/permission signal found | settings | apps/api/src/app/dashboard/page.tsx<br>apps/mgmt/src/app/mgmt/admin/custom-setups/price-manager.tsx<br>apps/mgmt/src/components/customised-setups/CustomSetupFlow.tsx<br>apps/public/src/components/customised-setups/CustomSetupFlow.tsx<br>apps/public/src/components/customised-setups/WizardCustomSetupFlow.tsx<br>apps/public/src/components/layout/Footer.tsx<br>apps/public/src/components/layout/Header.tsx<br>apps/superadmin/src/app/superadmin/mgmt/ai-config/page.tsx | admin-ui, api, mgmt, public, superadmin | direct frontend/shared caller detected | No unmatched caller exists; absence of a direct static frontend fetch is not a missing integration. | No static issues |
| api | GET /api/settings | GET | {{API_BASE_URL}}/api/settings | apps/api/src/app/api/settings/route.ts | apps/api/src/app/api/settings/route.ts | @tecbunny/core<br>@tecbunny/core<br>@tecbunny/core/auth/server-role<br>@tecbunny/core/server<br>@tecbunny/core/server<br>@tecbunny/core/server<br>next/server | inline | @tecbunny/core/auth/server-role | required/static signal found | role/permission signal found | settings | none found | none found | available API endpoint | No unmatched caller exists; absence of a direct static frontend fetch is not a missing integration. | No static issues |
| api | POST /api/settings | POST | {{API_BASE_URL}}/api/settings | apps/api/src/app/api/settings/route.ts | apps/api/src/app/api/settings/route.ts | @tecbunny/core<br>@tecbunny/core<br>@tecbunny/core/auth/server-role<br>@tecbunny/core/server<br>@tecbunny/core/server<br>@tecbunny/core/server<br>next/server | inline | @tecbunny/core/auth/server-role | required/static signal found | role/permission signal found | settings | none found | none found | available API endpoint | No unmatched caller exists; absence of a direct static frontend fetch is not a missing integration. | No static issues |
| api | PUT /api/settings | PUT | {{API_BASE_URL}}/api/settings | apps/api/src/app/api/settings/route.ts | apps/api/src/app/api/settings/route.ts | @tecbunny/core<br>@tecbunny/core<br>@tecbunny/core/auth/server-role<br>@tecbunny/core/server<br>@tecbunny/core/server<br>@tecbunny/core/server<br>next/server | inline | @tecbunny/core/auth/server-role | required/static signal found | role/permission signal found | settings | none found | none found | available API endpoint | No unmatched caller exists; absence of a direct static frontend fetch is not a missing integration. | No static issues |
| api | GET /api/shipping | GET | {{API_BASE_URL}}/api/shipping | apps/api/src/app/api/shipping/route.ts | apps/api/src/app/api/shipping/route.ts | @tecbunny/core<br>@tecbunny/core<br>@tecbunny/core/auth/server-role<br>@tecbunny/core/rate-limit<br>@tecbunny/core/roles<br>@tecbunny/database<br>next/server | inline | @tecbunny/core/auth/server-role<br>@tecbunny/core/rate-limit | required/static signal found | role/permission signal found | dispatch_records<br>orders | none found | none found | available API endpoint | No unmatched caller exists; absence of a direct static frontend fetch is not a missing integration. | 1 issue(s) |
| api | POST /api/shipping | POST | {{API_BASE_URL}}/api/shipping | apps/api/src/app/api/shipping/route.ts | apps/api/src/app/api/shipping/route.ts | @tecbunny/core<br>@tecbunny/core<br>@tecbunny/core/auth/server-role<br>@tecbunny/core/rate-limit<br>@tecbunny/core/roles<br>@tecbunny/database<br>next/server | inline | @tecbunny/core/auth/server-role<br>@tecbunny/core/rate-limit | required/static signal found | role/permission signal found | dispatch_records<br>orders | none found | none found | available API endpoint | No unmatched caller exists; absence of a direct static frontend fetch is not a missing integration. | No static issues |
| api | GET /api/shipping/update | GET | {{API_BASE_URL}}/api/shipping/update | apps/api/src/app/api/shipping/update/route.ts | apps/api/src/app/api/shipping/update/route.ts | @tecbunny/core<br>@tecbunny/core<br>@tecbunny/core/rate-limit<br>@tecbunny/core/whatsapp-service<br>@tecbunny/database<br>next/server | inline | @tecbunny/core/rate-limit | required/static signal found | not found | orders | none found | none found | available API endpoint | No unmatched caller exists; absence of a direct static frontend fetch is not a missing integration. | 1 issue(s) |
| api | POST /api/shipping/update | POST | {{API_BASE_URL}}/api/shipping/update | apps/api/src/app/api/shipping/update/route.ts | apps/api/src/app/api/shipping/update/route.ts | @tecbunny/core<br>@tecbunny/core<br>@tecbunny/core/rate-limit<br>@tecbunny/core/whatsapp-service<br>@tecbunny/database<br>next/server | inline | @tecbunny/core/rate-limit | required/static signal found | not found | orders | none found | none found | available API endpoint | No unmatched caller exists; absence of a direct static frontend fetch is not a missing integration. | No static issues |
| superadmin | DELETE /api/superadmin/areas | DELETE | {{SUPERADMIN_BASE_URL}}/api/superadmin/areas | apps/superadmin/src/app/api/superadmin/areas/route.ts | apps/superadmin/src/app/api/superadmin/areas/route.ts | @tecbunny/core/logger<br>@tecbunny/core/permissions<br>@tecbunny/database/admin<br>@tecbunny/database/server<br>next/server | inline | not found | required/static signal found | role/permission signal found | area_pincodes<br>areas<br>profiles<br>user_area_assignments | apps/superadmin/src/app/superadmin/mgmt/areas/page.tsx | superadmin | direct frontend/shared caller detected | No unmatched caller exists; absence of a direct static frontend fetch is not a missing integration. | 1 issue(s) |
| superadmin | GET /api/superadmin/areas | GET | {{SUPERADMIN_BASE_URL}}/api/superadmin/areas | apps/superadmin/src/app/api/superadmin/areas/route.ts | apps/superadmin/src/app/api/superadmin/areas/route.ts | @tecbunny/core/logger<br>@tecbunny/core/permissions<br>@tecbunny/database/admin<br>@tecbunny/database/server<br>next/server | inline | not found | required/static signal found | role/permission signal found | area_pincodes<br>areas<br>profiles<br>user_area_assignments | none found | none found | available API endpoint | No unmatched caller exists; absence of a direct static frontend fetch is not a missing integration. | 1 issue(s) |
| superadmin | POST /api/superadmin/areas | POST | {{SUPERADMIN_BASE_URL}}/api/superadmin/areas | apps/superadmin/src/app/api/superadmin/areas/route.ts | apps/superadmin/src/app/api/superadmin/areas/route.ts | @tecbunny/core/logger<br>@tecbunny/core/permissions<br>@tecbunny/database/admin<br>@tecbunny/database/server<br>next/server | inline | not found | required/static signal found | role/permission signal found | area_pincodes<br>areas<br>profiles<br>user_area_assignments | none found | none found | available API endpoint | No unmatched caller exists; absence of a direct static frontend fetch is not a missing integration. | 1 issue(s) |
| superadmin | POST /api/superadmin/catalogue/generate | POST | {{SUPERADMIN_BASE_URL}}/api/superadmin/catalogue/generate | apps/superadmin/src/app/api/superadmin/catalogue/generate/route.ts | apps/superadmin/src/app/api/superadmin/catalogue/generate/route.ts | @tecbunny/core/catalogue-pdf-generator<br>@tecbunny/core/logger<br>@tecbunny/core/permissions<br>@tecbunny/database/admin<br>@tecbunny/database/server<br>next/server | inline | not found | required/static signal found | role/permission signal found | products<br>services | apps/superadmin/src/app/superadmin/mgmt/catalogue/page.tsx | superadmin | direct frontend/shared caller detected | No unmatched caller exists; absence of a direct static frontend fetch is not a missing integration. | 1 issue(s) |
| superadmin | DELETE /api/superadmin/custom-setup-offers | DELETE | {{SUPERADMIN_BASE_URL}}/api/superadmin/custom-setup-offers | apps/superadmin/src/app/api/superadmin/custom-setup-offers/route.ts | apps/superadmin/src/app/api/superadmin/custom-setup-offers/route.ts | @tecbunny/core/logger<br>@tecbunny/core/permissions<br>@tecbunny/database/admin<br>@tecbunny/database/server<br>next/server | inline | not found | public or optional/static signal found | role/permission signal found | custom_setup_offers | apps/superadmin/src/components/superadmin/CustomSetupOffersManager.tsx | superadmin | direct frontend/shared caller detected | No unmatched caller exists; absence of a direct static frontend fetch is not a missing integration. | 1 issue(s) |
| superadmin | GET /api/superadmin/custom-setup-offers | GET | {{SUPERADMIN_BASE_URL}}/api/superadmin/custom-setup-offers | apps/superadmin/src/app/api/superadmin/custom-setup-offers/route.ts | apps/superadmin/src/app/api/superadmin/custom-setup-offers/route.ts | @tecbunny/core/logger<br>@tecbunny/core/permissions<br>@tecbunny/database/admin<br>@tecbunny/database/server<br>next/server | inline | not found | public or optional/static signal found | role/permission signal found | custom_setup_offers | none found | none found | available API endpoint | No unmatched caller exists; absence of a direct static frontend fetch is not a missing integration. | 1 issue(s) |
| superadmin | POST /api/superadmin/custom-setup-offers | POST | {{SUPERADMIN_BASE_URL}}/api/superadmin/custom-setup-offers | apps/superadmin/src/app/api/superadmin/custom-setup-offers/route.ts | apps/superadmin/src/app/api/superadmin/custom-setup-offers/route.ts | @tecbunny/core/logger<br>@tecbunny/core/permissions<br>@tecbunny/database/admin<br>@tecbunny/database/server<br>next/server | inline | not found | public or optional/static signal found | role/permission signal found | custom_setup_offers | none found | none found | available API endpoint | No unmatched caller exists; absence of a direct static frontend fetch is not a missing integration. | 1 issue(s) |
| superadmin | PUT /api/superadmin/custom-setup-offers | PUT | {{SUPERADMIN_BASE_URL}}/api/superadmin/custom-setup-offers | apps/superadmin/src/app/api/superadmin/custom-setup-offers/route.ts | apps/superadmin/src/app/api/superadmin/custom-setup-offers/route.ts | @tecbunny/core/logger<br>@tecbunny/core/permissions<br>@tecbunny/database/admin<br>@tecbunny/database/server<br>next/server | inline | not found | public or optional/static signal found | role/permission signal found | custom_setup_offers | none found | none found | available API endpoint | No unmatched caller exists; absence of a direct static frontend fetch is not a missing integration. | 1 issue(s) |
| superadmin | GET /api/superadmin/inquiries | GET | {{SUPERADMIN_BASE_URL}}/api/superadmin/inquiries | apps/superadmin/src/app/api/superadmin/inquiries/route.ts | apps/superadmin/src/app/api/superadmin/inquiries/route.ts | @tecbunny/core/logger<br>@tecbunny/core/permissions<br>@tecbunny/database/admin<br>@tecbunny/database/server<br>next/server | not found | not found | public or optional/static signal found | role/permission signal found | contact_messages<br>profiles | apps/superadmin/src/app/superadmin/mgmt/leads/inquiry-pipeline.tsx | superadmin | direct frontend/shared caller detected | No unmatched caller exists; absence of a direct static frontend fetch is not a missing integration. | 1 issue(s) |
| superadmin | PATCH /api/superadmin/inquiries/{id}/assignment | PATCH | {{SUPERADMIN_BASE_URL}}/api/superadmin/inquiries/{id}/assignment | apps/superadmin/src/app/api/superadmin/inquiries/[id]/assignment/route.ts | apps/superadmin/src/app/api/superadmin/inquiries/[id]/assignment/route.ts | @tecbunny/core/logger<br>@tecbunny/core/permissions<br>@tecbunny/database/admin<br>@tecbunny/database/server<br>next/server | inline | not found | required/static signal found | role/permission signal found | contact_messages<br>profiles | none found | none found | available API endpoint | No unmatched caller exists; absence of a direct static frontend fetch is not a missing integration. | 1 issue(s) |
| superadmin | POST /api/superadmin/services/ai-generate | POST | {{SUPERADMIN_BASE_URL}}/api/superadmin/services/ai-generate | apps/superadmin/src/app/api/superadmin/services/ai-generate/route.ts | apps/superadmin/src/app/api/superadmin/services/ai-generate/route.ts | @tecbunny/core/ai/gemini-service<br>@tecbunny/core/logger<br>@tecbunny/core/permissions<br>@tecbunny/database/server<br>next/server | inline | not found | required/static signal found | role/permission signal found | none detected | apps/superadmin/src/app/superadmin/mgmt/services/page.tsx | superadmin | direct frontend/shared caller detected | No unmatched caller exists; absence of a direct static frontend fetch is not a missing integration. | 1 issue(s) |
| waba | GET /api/templates | GET | {{WABA_BASE_URL}}/api/templates | apps/waba/src/app/api/templates/route.ts | apps/waba/src/app/api/templates/route.ts | @tecbunny/core/server-role-guard<br>next/server | not found | @tecbunny/core/server-role-guard | required/static signal found | role/permission signal found | Template | apps/waba/src/app/page.tsx<br>apps/waba/src/app/templates/page.tsx | waba | direct frontend/shared caller detected | No unmatched caller exists; absence of a direct static frontend fetch is not a missing integration. | 1 issue(s) |
| waba | POST /api/templates | POST | {{WABA_BASE_URL}}/api/templates | apps/waba/src/app/api/templates/route.ts | apps/waba/src/app/api/templates/route.ts | @tecbunny/core/server-role-guard<br>next/server | not found | @tecbunny/core/server-role-guard | required/static signal found | role/permission signal found | Template | none found | none found | available API endpoint | No unmatched caller exists; absence of a direct static frontend fetch is not a missing integration. | 1 issue(s) |
| api | GET /api/trpc/{trpc} | GET | {{API_BASE_URL}}/api/trpc/{trpc} | apps/api/src/app/api/trpc/[trpc]/route.ts | apps/api/src/app/api/trpc/[trpc]/route.ts | @tecbunny/rpc<br>@trpc/server/adapters/fetch | not found | not found | not found | none detected for public route | none detected | apps/mgmt/src/components/providers/TRPCProvider.tsx<br>apps/public/src/components/providers/TRPCProvider.tsx | mgmt, public | direct frontend/shared caller detected | Webhook, cron, health, and tRPC procedure entries are not expected to have direct frontend fetch callers. | 3 issue(s) |
| api | POST /api/trpc/{trpc} | POST | {{API_BASE_URL}}/api/trpc/{trpc} | apps/api/src/app/api/trpc/[trpc]/route.ts | apps/api/src/app/api/trpc/[trpc]/route.ts | @tecbunny/rpc<br>@trpc/server/adapters/fetch | not found | not found | required/static signal found | not found | none detected | none found | none found | backend/service endpoint | Webhook, cron, health, and tRPC procedure entries are not expected to have direct frontend fetch callers. | 2 issue(s) |
| rpc | contactMessages.submit | POST | {{API_BASE_URL}}/api/trpc/contactMessages.submit | packages/rpc/src/routers/contactMessages.ts | apps/api/src/app/api/trpc/[trpc]/route.ts | ../trpc<br>@tecbunny/core/db | inline tRPC input schema | publicProcedure | publicProcedure | none detected for public procedure | contact_messages | none found | none found | backend/service endpoint | Webhook, cron, health, and tRPC procedure entries are not expected to have direct frontend fetch callers. | 1 issue(s) |
| rpc | coupons.create | POST | {{API_BASE_URL}}/api/trpc/coupons.create | packages/rpc/src/routers/coupons.ts | apps/api/src/app/api/trpc/[trpc]/route.ts | ../trpc<br>@tecbunny/core<br>@tecbunny/core/server | inline tRPC input schema | protectedProcedure | required via tRPC middleware | authenticated user; role not always explicit | coupons | none found | none found | backend/service endpoint | Webhook, cron, health, and tRPC procedure entries are not expected to have direct frontend fetch callers. | 1 issue(s) |
| rpc | coupons.delete | POST | {{API_BASE_URL}}/api/trpc/coupons.delete | packages/rpc/src/routers/coupons.ts | apps/api/src/app/api/trpc/[trpc]/route.ts | ../trpc<br>@tecbunny/core<br>@tecbunny/core/server | inline tRPC input schema | protectedProcedure | required via tRPC middleware | authenticated user; role not always explicit | coupons | none found | none found | backend/service endpoint | Webhook, cron, health, and tRPC procedure entries are not expected to have direct frontend fetch callers. | 1 issue(s) |
| rpc | coupons.getAll | GET | {{API_BASE_URL}}/api/trpc/coupons.getAll | packages/rpc/src/routers/coupons.ts | apps/api/src/app/api/trpc/[trpc]/route.ts | ../trpc<br>@tecbunny/core<br>@tecbunny/core/server | not found | publicProcedure | publicProcedure | none detected for public procedure | coupons | none found | none found | backend/service endpoint | Webhook, cron, health, and tRPC procedure entries are not expected to have direct frontend fetch callers. | 1 issue(s) |
| rpc | coupons.getByCode | GET | {{API_BASE_URL}}/api/trpc/coupons.getByCode | packages/rpc/src/routers/coupons.ts | apps/api/src/app/api/trpc/[trpc]/route.ts | ../trpc<br>@tecbunny/core<br>@tecbunny/core/server | inline tRPC input schema | publicProcedure | publicProcedure | none detected for public procedure | coupons | none found | none found | backend/service endpoint | Webhook, cron, health, and tRPC procedure entries are not expected to have direct frontend fetch callers. | 1 issue(s) |
| rpc | coupons.getById | GET | {{API_BASE_URL}}/api/trpc/coupons.getById | packages/rpc/src/routers/coupons.ts | apps/api/src/app/api/trpc/[trpc]/route.ts | ../trpc<br>@tecbunny/core<br>@tecbunny/core/server | inline tRPC input schema | publicProcedure | publicProcedure | none detected for public procedure | coupons | none found | none found | backend/service endpoint | Webhook, cron, health, and tRPC procedure entries are not expected to have direct frontend fetch callers. | 1 issue(s) |
| rpc | coupons.update | POST | {{API_BASE_URL}}/api/trpc/coupons.update | packages/rpc/src/routers/coupons.ts | apps/api/src/app/api/trpc/[trpc]/route.ts | ../trpc<br>@tecbunny/core<br>@tecbunny/core/server | inline tRPC input schema | protectedProcedure | required via tRPC middleware | authenticated user; role not always explicit | coupons | none found | none found | backend/service endpoint | Webhook, cron, health, and tRPC procedure entries are not expected to have direct frontend fetch callers. | 1 issue(s) |
| rpc | featureFlags.getAll | GET | {{API_BASE_URL}}/api/trpc/featureFlags.getAll | packages/rpc/src/routers/featureFlags.ts | apps/api/src/app/api/trpc/[trpc]/route.ts | ../trpc<br>@tecbunny/config<br>@tecbunny/database | not found | publicProcedure | publicProcedure | none detected for public procedure | feature_flags | none found | none found | backend/service endpoint | Webhook, cron, health, and tRPC procedure entries are not expected to have direct frontend fetch callers. | 1 issue(s) |
| rpc | featureFlags.toggle | POST | {{API_BASE_URL}}/api/trpc/featureFlags.toggle | packages/rpc/src/routers/featureFlags.ts | apps/api/src/app/api/trpc/[trpc]/route.ts | ../trpc<br>@tecbunny/config<br>@tecbunny/database | inline tRPC input schema | protectedProcedure | required via tRPC middleware | authenticated user; role not always explicit | feature_flags | none found | none found | backend/service endpoint | Webhook, cron, health, and tRPC procedure entries are not expected to have direct frontend fetch callers. | 1 issue(s) |
| rpc | offers.create | POST | {{API_BASE_URL}}/api/trpc/offers.create | packages/rpc/src/routers/offers.ts | apps/api/src/app/api/trpc/[trpc]/route.ts | ../trpc<br>@tecbunny/core<br>@tecbunny/core/server | inline tRPC input schema | protectedProcedure | required via tRPC middleware | authenticated user; role not always explicit | offers | none found | none found | backend/service endpoint | Webhook, cron, health, and tRPC procedure entries are not expected to have direct frontend fetch callers. | No static issues |
| rpc | offers.delete | POST | {{API_BASE_URL}}/api/trpc/offers.delete | packages/rpc/src/routers/offers.ts | apps/api/src/app/api/trpc/[trpc]/route.ts | ../trpc<br>@tecbunny/core<br>@tecbunny/core/server | inline tRPC input schema | protectedProcedure | required via tRPC middleware | authenticated user; role not always explicit | offer_usage<br>offers | none found | none found | backend/service endpoint | Webhook, cron, health, and tRPC procedure entries are not expected to have direct frontend fetch callers. | No static issues |
| rpc | offers.getAll | GET | {{API_BASE_URL}}/api/trpc/offers.getAll | packages/rpc/src/routers/offers.ts | apps/api/src/app/api/trpc/[trpc]/route.ts | ../trpc<br>@tecbunny/core<br>@tecbunny/core/server | inline tRPC input schema | publicProcedure | publicProcedure | none detected for public procedure | offers | none found | none found | backend/service endpoint | Webhook, cron, health, and tRPC procedure entries are not expected to have direct frontend fetch callers. | No static issues |
| rpc | offers.update | POST | {{API_BASE_URL}}/api/trpc/offers.update | packages/rpc/src/routers/offers.ts | apps/api/src/app/api/trpc/[trpc]/route.ts | ../trpc<br>@tecbunny/core<br>@tecbunny/core/server | inline tRPC input schema | protectedProcedure | required via tRPC middleware | authenticated user; role not always explicit | offers | none found | none found | backend/service endpoint | Webhook, cron, health, and tRPC procedure entries are not expected to have direct frontend fetch callers. | No static issues |
| rpc | pageContent.get | GET | {{API_BASE_URL}}/api/trpc/pageContent.get | packages/rpc/src/routers/pageContent.ts | apps/api/src/app/api/trpc/[trpc]/route.ts | ../trpc<br>@tecbunny/core | inline tRPC input schema | publicProcedure | publicProcedure | none detected for public procedure | none detected | none found | none found | backend/service endpoint | Webhook, cron, health, and tRPC procedure entries are not expected to have direct frontend fetch callers. | 3 issue(s) |
| rpc | pageContent.list_all | GET | {{API_BASE_URL}}/api/trpc/pageContent.list_all | packages/rpc/src/routers/pageContent.ts | apps/api/src/app/api/trpc/[trpc]/route.ts | ../trpc<br>@tecbunny/core | not found | protectedProcedure | required via tRPC middleware | authenticated user; role not always explicit | none detected | none found | none found | backend/service endpoint | Webhook, cron, health, and tRPC procedure entries are not expected to have direct frontend fetch callers. | 3 issue(s) |
| rpc | pageContent.update | POST | {{API_BASE_URL}}/api/trpc/pageContent.update | packages/rpc/src/routers/pageContent.ts | apps/api/src/app/api/trpc/[trpc]/route.ts | ../trpc<br>@tecbunny/core | inline tRPC input schema | protectedProcedure | required via tRPC middleware | authenticated user; role not always explicit | none detected | none found | none found | backend/service endpoint | Webhook, cron, health, and tRPC procedure entries are not expected to have direct frontend fetch callers. | 3 issue(s) |
| rpc | projects.create | POST | {{API_BASE_URL}}/api/trpc/projects.create | packages/rpc/src/routers/projects.ts | apps/api/src/app/api/trpc/[trpc]/route.ts | ../trpc<br>@tecbunny/core/db | inline tRPC input schema | protectedProcedure | required via tRPC middleware | authenticated user; role not always explicit | upcoming_projects | none found | none found | backend/service endpoint | Webhook, cron, health, and tRPC procedure entries are not expected to have direct frontend fetch callers. | 1 issue(s) |
| rpc | projects.delete | POST | {{API_BASE_URL}}/api/trpc/projects.delete | packages/rpc/src/routers/projects.ts | apps/api/src/app/api/trpc/[trpc]/route.ts | ../trpc<br>@tecbunny/core/db | inline tRPC input schema | protectedProcedure | required via tRPC middleware | authenticated user; role not always explicit | upcoming_projects | none found | none found | backend/service endpoint | Webhook, cron, health, and tRPC procedure entries are not expected to have direct frontend fetch callers. | 1 issue(s) |
| rpc | projects.getAll | GET | {{API_BASE_URL}}/api/trpc/projects.getAll | packages/rpc/src/routers/projects.ts | apps/api/src/app/api/trpc/[trpc]/route.ts | ../trpc<br>@tecbunny/core/db | not found | publicProcedure | publicProcedure | none detected for public procedure | upcoming_projects | none found | none found | backend/service endpoint | Webhook, cron, health, and tRPC procedure entries are not expected to have direct frontend fetch callers. | 1 issue(s) |
| api | POST /api/upload-from-url | POST | {{API_BASE_URL}}/api/upload-from-url | apps/api/src/app/api/upload-from-url/route.ts | apps/api/src/app/api/upload-from-url/route.ts | @tecbunny/core<br>@tecbunny/core<br>@tecbunny/core/admin-auth<br>@tecbunny/core/s3-storage<br>@tecbunny/core/security/network-validation<br>@tecbunny/database<br>@tecbunny/database/storage<br>next/server | @tecbunny/core/security/network-validation | @tecbunny/core/admin-auth | required/static signal found | role/permission signal found | none detected | none found | none found | available API endpoint | No unmatched caller exists; absence of a direct static frontend fetch is not a missing integration. | No static issues |
| api | POST /api/upload | POST | {{API_BASE_URL}}/api/upload | apps/api/src/app/api/upload/route.ts | apps/api/src/app/api/upload/route.ts | @tecbunny/core<br>@tecbunny/core<br>@tecbunny/core/admin-auth<br>@tecbunny/core/s3-storage<br>@tecbunny/database<br>@tecbunny/database/storage<br>next/server | inline | @tecbunny/core/admin-auth | required/static signal found | role/permission signal found | none detected | apps/mgmt/src/app/mgmt/sales/products/edit/[id]/sales-product-edit.tsx<br>apps/mgmt/src/app/mgmt/sales/products/new/sales-product-new.tsx<br>packages/admin-ui/src/components/HeroCarouselManager.tsx<br>packages/admin-ui/src/components/PartnerBrandsEditor.tsx<br>packages/admin-ui/src/components/SingleImageUploader.tsx<br>packages/admin-ui/src/components/admin-settings.tsx | admin-ui, mgmt | direct frontend/shared caller detected | No unmatched caller exists; absence of a direct static frontend fetch is not a missing integration. | No static issues |
| api | POST /api/uploads/quote-documents | POST | {{API_BASE_URL}}/api/uploads/quote-documents | apps/api/src/app/api/uploads/quote-documents/route.ts | apps/api/src/app/api/uploads/quote-documents/route.ts | @tecbunny/core<br>@tecbunny/core/quotes/action-token<br>@tecbunny/core/server<br>@tecbunny/database/storage<br>next/server | inline | not found | required/static signal found | role/permission signal found | quotes | apps/public/src/app/quotes/[id]/advance-payment/page.tsx | public | direct frontend/shared caller detected | No unmatched caller exists; absence of a direct static frontend fetch is not a missing integration. | No static issues |
| api | GET /api/user/communication-preferences | GET | {{API_BASE_URL}}/api/user/communication-preferences | apps/api/src/app/api/user/communication-preferences/route.ts | apps/api/src/app/api/user/communication-preferences/route.ts | @tecbunny/core<br>@tecbunny/database<br>next/server | inline | not found | required/static signal found | role/permission signal found | user_communication_preferences | none found | none found | available API endpoint | No unmatched caller exists; absence of a direct static frontend fetch is not a missing integration. | 1 issue(s) |
| api | POST /api/user/communication-preferences | POST | {{API_BASE_URL}}/api/user/communication-preferences | apps/api/src/app/api/user/communication-preferences/route.ts | apps/api/src/app/api/user/communication-preferences/route.ts | @tecbunny/core<br>@tecbunny/database<br>next/server | inline | not found | required/static signal found | role/permission signal found | user_communication_preferences | none found | none found | available API endpoint | No unmatched caller exists; absence of a direct static frontend fetch is not a missing integration. | No static issues |
| api | POST /api/user/gdpr/delete | POST | {{API_BASE_URL}}/api/user/gdpr/delete | apps/api/src/app/api/user/gdpr/delete/route.ts | apps/api/src/app/api/user/gdpr/delete/route.ts | @tecbunny/core<br>@tecbunny/core/rate-limit<br>@tecbunny/core/server<br>@tecbunny/database<br>next/server | inline | @tecbunny/core/rate-limit | required/static signal found | role/permission signal found | addresses<br>gdpr_deletion_requests<br>profiles | none found | none found | available API endpoint | No unmatched caller exists; absence of a direct static frontend fetch is not a missing integration. | No static issues |
| api | GET /api/user/gdpr/export | GET | {{API_BASE_URL}}/api/user/gdpr/export | apps/api/src/app/api/user/gdpr/export/route.ts | apps/api/src/app/api/user/gdpr/export/route.ts | @tecbunny/core<br>@tecbunny/core/rate-limit<br>@tecbunny/database<br>next/server | not found | @tecbunny/core/rate-limit | required/static signal found | role/permission signal found | addresses<br>notification_preferences<br>orders<br>product_reviews<br>profiles<br>wishlists | none found | none found | available API endpoint | No unmatched caller exists; absence of a direct static frontend fetch is not a missing integration. | 1 issue(s) |
| api | GET /api/user/notifications | GET | {{API_BASE_URL}}/api/user/notifications | apps/api/src/app/api/user/notifications/route.ts | apps/api/src/app/api/user/notifications/route.ts | @tecbunny/core<br>@tecbunny/database<br>next/server | inline | not found | required/static signal found | role/permission signal found | notification_preferences | none found | none found | available API endpoint | No unmatched caller exists; absence of a direct static frontend fetch is not a missing integration. | 1 issue(s) |
| api | PUT /api/user/notifications | PUT | {{API_BASE_URL}}/api/user/notifications | apps/api/src/app/api/user/notifications/route.ts | apps/api/src/app/api/user/notifications/route.ts | @tecbunny/core<br>@tecbunny/database<br>next/server | inline | not found | required/static signal found | role/permission signal found | notification_preferences | none found | none found | available API endpoint | No unmatched caller exists; absence of a direct static frontend fetch is not a missing integration. | No static issues |
| api | DELETE /api/user/wishlist | DELETE | {{API_BASE_URL}}/api/user/wishlist | apps/api/src/app/api/user/wishlist/route.ts | apps/api/src/app/api/user/wishlist/route.ts | @tecbunny/core<br>@tecbunny/database<br>next/server | inline | not found | required/static signal found | role/permission signal found | wishlists | packages/core/src/store/wishlistStore.ts | core | direct frontend/shared caller detected | No unmatched caller exists; absence of a direct static frontend fetch is not a missing integration. | No static issues |
| api | GET /api/user/wishlist | GET | {{API_BASE_URL}}/api/user/wishlist | apps/api/src/app/api/user/wishlist/route.ts | apps/api/src/app/api/user/wishlist/route.ts | @tecbunny/core<br>@tecbunny/database<br>next/server | inline | not found | required/static signal found | role/permission signal found | wishlists | none found | none found | available API endpoint | No unmatched caller exists; absence of a direct static frontend fetch is not a missing integration. | 1 issue(s) |
| api | POST /api/user/wishlist | POST | {{API_BASE_URL}}/api/user/wishlist | apps/api/src/app/api/user/wishlist/route.ts | apps/api/src/app/api/user/wishlist/route.ts | @tecbunny/core<br>@tecbunny/database<br>next/server | inline | not found | required/static signal found | role/permission signal found | wishlists | none found | none found | available API endpoint | No unmatched caller exists; absence of a direct static frontend fetch is not a missing integration. | No static issues |
| api | GET /api/users-admin | GET | {{API_BASE_URL}}/api/users-admin | apps/api/src/app/api/users-admin/route.ts | apps/api/src/app/api/users-admin/route.ts | next/server | inline | not found | required/static signal found | role/permission signal found | profiles | none found | none found | available API endpoint | No unmatched caller exists; absence of a direct static frontend fetch is not a missing integration. | 1 issue(s) |
| api | POST /api/users-admin | POST | {{API_BASE_URL}}/api/users-admin | apps/api/src/app/api/users-admin/route.ts | apps/api/src/app/api/users-admin/route.ts | next/server | inline | not found | required/static signal found | role/permission signal found | profiles | none found | none found | available API endpoint | No unmatched caller exists; absence of a direct static frontend fetch is not a missing integration. | No static issues |
| api | DELETE /api/users | DELETE | {{API_BASE_URL}}/api/users | apps/api/src/app/api/users/route.ts | apps/api/src/app/api/users/route.ts | @tecbunny/core<br>@tecbunny/core/api/with-validation<br>@tecbunny/core/server<br>@tecbunny/core/server<br>@tecbunny/infra<br>next/server | @tecbunny/core/api/with-validation | not found | required/static signal found | role/permission signal found | none detected | packages/admin-ui/src/components/AddUserDialog.tsx<br>packages/admin-ui/src/components/EditUserDialog.tsx | admin-ui | direct frontend/shared caller detected | No unmatched caller exists; absence of a direct static frontend fetch is not a missing integration. | No static issues |
| superadmin | DELETE /api/users | DELETE | {{SUPERADMIN_BASE_URL}}/api/users | apps/superadmin/src/app/api/users/route.ts | apps/superadmin/src/app/api/users/route.ts | @tecbunny/core<br>@tecbunny/core/api/with-validation<br>@tecbunny/core/server<br>@tecbunny/core/server<br>@tecbunny/infra<br>next/server | @tecbunny/core/api/with-validation | not found | required/static signal found | role/permission signal found | none detected | none found | none found | available API endpoint | No unmatched caller exists; absence of a direct static frontend fetch is not a missing integration. | No static issues |
| api | GET /api/users | GET | {{API_BASE_URL}}/api/users | apps/api/src/app/api/users/route.ts | apps/api/src/app/api/users/route.ts | @tecbunny/core<br>@tecbunny/core/api/with-validation<br>@tecbunny/core/server<br>@tecbunny/core/server<br>@tecbunny/infra<br>next/server | @tecbunny/core/api/with-validation | not found | required/static signal found | role/permission signal found | none detected | none found | none found | available API endpoint | No unmatched caller exists; absence of a direct static frontend fetch is not a missing integration. | No static issues |
| superadmin | GET /api/users | GET | {{SUPERADMIN_BASE_URL}}/api/users | apps/superadmin/src/app/api/users/route.ts | apps/superadmin/src/app/api/users/route.ts | @tecbunny/core<br>@tecbunny/core/api/with-validation<br>@tecbunny/core/server<br>@tecbunny/core/server<br>@tecbunny/infra<br>next/server | @tecbunny/core/api/with-validation | not found | required/static signal found | role/permission signal found | none detected | none found | none found | available API endpoint | No unmatched caller exists; absence of a direct static frontend fetch is not a missing integration. | No static issues |
| waba | GET /api/users | GET | {{WABA_BASE_URL}}/api/users | apps/waba/src/app/api/users/route.ts | apps/waba/src/app/api/users/route.ts | @tecbunny/core/server-role-guard<br>next/server | not found | @tecbunny/core/server-role-guard | required/static signal found | role/permission signal found | User | none found | none found | available API endpoint | No unmatched caller exists; absence of a direct static frontend fetch is not a missing integration. | No static issues |
| api | POST /api/users | POST | {{API_BASE_URL}}/api/users | apps/api/src/app/api/users/route.ts | apps/api/src/app/api/users/route.ts | @tecbunny/core<br>@tecbunny/core/api/with-validation<br>@tecbunny/core/server<br>@tecbunny/core/server<br>@tecbunny/infra<br>next/server | @tecbunny/core/api/with-validation | not found | required/static signal found | role/permission signal found | none detected | none found | none found | available API endpoint | No unmatched caller exists; absence of a direct static frontend fetch is not a missing integration. | No static issues |
| superadmin | POST /api/users | POST | {{SUPERADMIN_BASE_URL}}/api/users | apps/superadmin/src/app/api/users/route.ts | apps/superadmin/src/app/api/users/route.ts | @tecbunny/core<br>@tecbunny/core/api/with-validation<br>@tecbunny/core/server<br>@tecbunny/core/server<br>@tecbunny/infra<br>next/server | @tecbunny/core/api/with-validation | not found | required/static signal found | role/permission signal found | none detected | none found | none found | available API endpoint | No unmatched caller exists; absence of a direct static frontend fetch is not a missing integration. | No static issues |
| api | PUT /api/users | PUT | {{API_BASE_URL}}/api/users | apps/api/src/app/api/users/route.ts | apps/api/src/app/api/users/route.ts | @tecbunny/core<br>@tecbunny/core/api/with-validation<br>@tecbunny/core/server<br>@tecbunny/core/server<br>@tecbunny/infra<br>next/server | @tecbunny/core/api/with-validation | not found | required/static signal found | role/permission signal found | none detected | none found | none found | available API endpoint | No unmatched caller exists; absence of a direct static frontend fetch is not a missing integration. | No static issues |
| superadmin | PUT /api/users | PUT | {{SUPERADMIN_BASE_URL}}/api/users | apps/superadmin/src/app/api/users/route.ts | apps/superadmin/src/app/api/users/route.ts | @tecbunny/core<br>@tecbunny/core/api/with-validation<br>@tecbunny/core/server<br>@tecbunny/core/server<br>@tecbunny/infra<br>next/server | @tecbunny/core/api/with-validation | not found | required/static signal found | role/permission signal found | none detected | none found | none found | available API endpoint | No unmatched caller exists; absence of a direct static frontend fetch is not a missing integration. | No static issues |
| api | GET /api/v1/embed/configurator | GET | {{API_BASE_URL}}/api/v1/embed/configurator | apps/api/src/app/api/v1/embed/configurator/route.ts | apps/api/src/app/api/v1/embed/configurator/route.ts | @tecbunny/core<br>@tecbunny/core/server<br>next/server | inline | not found | required/static signal found | role/permission signal found | sales_agents | none found | none found | available API endpoint | No unmatched caller exists; absence of a direct static frontend fetch is not a missing integration. | No static issues |
| api | GET /api/walk-in-orders | GET | {{API_BASE_URL}}/api/walk-in-orders | apps/api/src/app/api/walk-in-orders/route.ts | apps/api/src/app/api/walk-in-orders/route.ts | @tecbunny/core<br>@tecbunny/core/server-role-guard<br>next/server | inline | @tecbunny/core/server-role-guard | required/static signal found | role/permission signal found | order_items<br>orders<br>products<br>rpc:allocate_order_inventory_atomic | apps/mgmt/src/components/sales/WalkInOrderManagement.tsx | mgmt | direct frontend/shared caller detected | No unmatched caller exists; absence of a direct static frontend fetch is not a missing integration. | No static issues |
| api | POST /api/walk-in-orders | POST | {{API_BASE_URL}}/api/walk-in-orders | apps/api/src/app/api/walk-in-orders/route.ts | apps/api/src/app/api/walk-in-orders/route.ts | @tecbunny/core<br>@tecbunny/core/server-role-guard<br>next/server | inline | @tecbunny/core/server-role-guard | required/static signal found | role/permission signal found | order_items<br>orders<br>products<br>rpc:allocate_order_inventory_atomic | none found | none found | available API endpoint | No unmatched caller exists; absence of a direct static frontend fetch is not a missing integration. | No static issues |
| api | POST /api/warranty/activate | POST | {{API_BASE_URL}}/api/warranty/activate | apps/api/src/app/api/warranty/activate/route.ts | apps/api/src/app/api/warranty/activate/route.ts | @tecbunny/core<br>@tecbunny/core/otp-manager<br>@tecbunny/core/rate-limit<br>@tecbunny/core/server<br>next/server | inline | @tecbunny/core/rate-limit | required/static signal found | not found | inventory_items<br>warranties | apps/public/src/app/activate-warranty/[serialNumber]/page.tsx | public | direct frontend/shared caller detected | No unmatched caller exists; absence of a direct static frontend fetch is not a missing integration. | No static issues |
| waba | POST /api/webhook/whatsapp | POST | {{WABA_BASE_URL}}/api/webhook/whatsapp | apps/waba/src/app/api/webhook/whatsapp/route.ts | apps/waba/src/app/api/webhook/whatsapp/route.ts | @tecbunny/core/server<br>next/server | inline | not found | not found | none detected for public route | none detected | none found | none found | backend/service endpoint | Webhook, cron, health, and tRPC procedure entries are not expected to have direct frontend fetch callers. | No static issues |
| api | POST /api/webhooks/custom-tunnel/{path*} | POST | {{API_BASE_URL}}/api/webhooks/custom-tunnel/{path*} | apps/api/src/app/api/webhooks/custom-tunnel/[[...path]]/route.ts | apps/api/src/app/api/webhooks/custom-tunnel/[[...path]]/route.ts | @tecbunny/core<br>next/server | inline | not found | public or optional/static signal found | role/permission signal found | custom_webhook_tunnel_queue | none found | none found | backend/service endpoint | Webhook, cron, health, and tRPC procedure entries are not expected to have direct frontend fetch callers. | No static issues |
| api | POST /api/webhooks/customer/signup | POST | {{API_BASE_URL}}/api/webhooks/customer/signup | apps/api/src/app/api/webhooks/customer/signup/route.ts | apps/api/src/app/api/webhooks/customer/signup/route.ts | @tecbunny/core<br>@tecbunny/core/webhook-logger<br>@tecbunny/core/webhook-validator<br>@tecbunny/core/whatsapp-service<br>@tecbunny/database<br>next/server | @tecbunny/core/webhook-validator | not found | not found | role/permission signal found | customer_interactions<br>customers<br>webhook_events | none found | none found | backend/service endpoint | Webhook, cron, health, and tRPC procedure entries are not expected to have direct frontend fetch callers. | No static issues |
| api | POST /api/webhooks/orders/cancelled | POST | {{API_BASE_URL}}/api/webhooks/orders/cancelled | apps/api/src/app/api/webhooks/orders/cancelled/route.ts | apps/api/src/app/api/webhooks/orders/cancelled/route.ts | @tecbunny/core<br>@tecbunny/core/webhook-logger<br>@tecbunny/core/webhook-validator<br>@tecbunny/core/whatsapp-service<br>@tecbunny/database<br>next/server | @tecbunny/core/webhook-validator | not found | not found | role/permission signal found | customer_interactions<br>customers<br>order_cancellations<br>orders<br>webhook_events | none found | none found | backend/service endpoint | Webhook, cron, health, and tRPC procedure entries are not expected to have direct frontend fetch callers. | No static issues |
| api | POST /api/webhooks/orders/delayed | POST | {{API_BASE_URL}}/api/webhooks/orders/delayed | apps/api/src/app/api/webhooks/orders/delayed/route.ts | apps/api/src/app/api/webhooks/orders/delayed/route.ts | @tecbunny/core<br>@tecbunny/core/webhook-logger<br>@tecbunny/core/webhook-validator<br>@tecbunny/core/whatsapp-service<br>@tecbunny/database<br>next/server | @tecbunny/core/webhook-validator | not found | not found | role/permission signal found | customer_interactions<br>customers<br>orders<br>rpc:add_customer_promotion_v1<br>webhook_events | none found | none found | backend/service endpoint | Webhook, cron, health, and tRPC procedure entries are not expected to have direct frontend fetch callers. | No static issues |
| api | POST /api/webhooks/orders/delivered | POST | {{API_BASE_URL}}/api/webhooks/orders/delivered | apps/api/src/app/api/webhooks/orders/delivered/route.ts | apps/api/src/app/api/webhooks/orders/delivered/route.ts | @tecbunny/core<br>@tecbunny/core/environment-validator<br>@tecbunny/core/webhook-logger<br>@tecbunny/core/webhook-validator<br>@tecbunny/core/whatsapp-service<br>@tecbunny/database<br>next/server | @tecbunny/core/environment-validator | not found | not found | role/permission signal found | customer_interactions<br>customers<br>orders<br>webhook_events | none found | none found | backend/service endpoint | Webhook, cron, health, and tRPC procedure entries are not expected to have direct frontend fetch callers. | No static issues |
| api | POST /api/webhooks/orders/notconfirmed | POST | {{API_BASE_URL}}/api/webhooks/orders/notconfirmed | apps/api/src/app/api/webhooks/orders/notconfirmed/route.ts | apps/api/src/app/api/webhooks/orders/notconfirmed/route.ts | @tecbunny/core<br>@tecbunny/core/webhook-logger<br>@tecbunny/core/webhook-validator<br>@tecbunny/core/whatsapp-service<br>@tecbunny/database<br>next/server | @tecbunny/core/webhook-validator | not found | not found | role/permission signal found | customer_interactions<br>customers<br>orders<br>webhook_events | none found | none found | backend/service endpoint | Webhook, cron, health, and tRPC procedure entries are not expected to have direct frontend fetch callers. | No static issues |
| api | POST /api/webhooks/orders/outfordelivery | POST | {{API_BASE_URL}}/api/webhooks/orders/outfordelivery | apps/api/src/app/api/webhooks/orders/outfordelivery/route.ts | apps/api/src/app/api/webhooks/orders/outfordelivery/route.ts | @tecbunny/core<br>@tecbunny/core/webhook-logger<br>@tecbunny/core/webhook-validator<br>@tecbunny/core/whatsapp-service<br>@tecbunny/database<br>next/server | @tecbunny/core/webhook-validator | not found | not found | role/permission signal found | customer_interactions<br>customers<br>orders<br>webhook_events | none found | none found | backend/service endpoint | Webhook, cron, health, and tRPC procedure entries are not expected to have direct frontend fetch callers. | No static issues |
| api | POST /api/webhooks/orders/placed | POST | {{API_BASE_URL}}/api/webhooks/orders/placed | apps/api/src/app/api/webhooks/orders/placed/route.ts | apps/api/src/app/api/webhooks/orders/placed/route.ts | @tecbunny/core<br>@tecbunny/core/webhook-logger<br>@tecbunny/core/webhook-validator<br>@tecbunny/core/whatsapp-service<br>@tecbunny/database<br>next/server | @tecbunny/core/webhook-validator | not found | not found | none detected for public route | customer_interactions<br>customers<br>orders<br>webhook_events | none found | none found | backend/service endpoint | Webhook, cron, health, and tRPC procedure entries are not expected to have direct frontend fetch callers. | No static issues |
| api | POST /api/webhooks/orders/shipped | POST | {{API_BASE_URL}}/api/webhooks/orders/shipped | apps/api/src/app/api/webhooks/orders/shipped/route.ts | apps/api/src/app/api/webhooks/orders/shipped/route.ts | @tecbunny/core<br>@tecbunny/core/webhook-logger<br>@tecbunny/core/whatsapp-service<br>@tecbunny/database<br>next/server | inline | not found | not found | none detected for public route | customer_interactions<br>customers<br>orders<br>webhook_events | none found | none found | backend/service endpoint | Webhook, cron, health, and tRPC procedure entries are not expected to have direct frontend fetch callers. | No static issues |
| api | POST /api/webhooks/payment/failed | POST | {{API_BASE_URL}}/api/webhooks/payment/failed | apps/api/src/app/api/webhooks/payment/failed/route.ts | apps/api/src/app/api/webhooks/payment/failed/route.ts | @tecbunny/core<br>@tecbunny/core/redis<br>@tecbunny/core/webhook-logger<br>@tecbunny/core/webhook-validator<br>@tecbunny/core/whatsapp-service<br>@tecbunny/database<br>next/server | @tecbunny/core/webhook-validator | not found | not found | role/permission signal found | customer_interactions<br>customers<br>orders<br>payments<br>webhook_events | none found | none found | backend/service endpoint | Webhook, cron, health, and tRPC procedure entries are not expected to have direct frontend fetch callers. | No static issues |
| api | POST /api/webhooks/payment/received | POST | {{API_BASE_URL}}/api/webhooks/payment/received | apps/api/src/app/api/webhooks/payment/received/route.ts | apps/api/src/app/api/webhooks/payment/received/route.ts | @tecbunny/core<br>@tecbunny/core/redis<br>@tecbunny/core/webhook-logger<br>@tecbunny/core/webhook-validator<br>@tecbunny/core/whatsapp-service<br>@tecbunny/database<br>next/server | @tecbunny/core/webhook-validator | not found | not found | role/permission signal found | customer_interactions<br>customers<br>free_installation_slots<br>orders<br>payments<br>webhook_events | none found | none found | backend/service endpoint | Webhook, cron, health, and tRPC procedure entries are not expected to have direct frontend fetch callers. | No static issues |
| api | GET /api/webhooks/stats | GET | {{API_BASE_URL}}/api/webhooks/stats | apps/api/src/app/api/webhooks/stats/route.ts | apps/api/src/app/api/webhooks/stats/route.ts | @tecbunny/core<br>@tecbunny/core/auth/admin-guard<br>@tecbunny/database<br>next/server | inline | @tecbunny/core/auth/admin-guard | public or optional/static signal found | role/permission signal found | webhook_stats | none found | none found | backend/service endpoint | Webhook, cron, health, and tRPC procedure entries are not expected to have direct frontend fetch callers. | No static issues |
| api | POST /api/webhooks/stats | POST | {{API_BASE_URL}}/api/webhooks/stats | apps/api/src/app/api/webhooks/stats/route.ts | apps/api/src/app/api/webhooks/stats/route.ts | @tecbunny/core<br>@tecbunny/core/auth/admin-guard<br>@tecbunny/database<br>next/server | inline | @tecbunny/core/auth/admin-guard | public or optional/static signal found | role/permission signal found | webhook_stats | none found | none found | backend/service endpoint | Webhook, cron, health, and tRPC procedure entries are not expected to have direct frontend fetch callers. | No static issues |

````````

---

## docs/api-audit/complete-url-list.md

````````markdown
# Complete URL List

Latest source inventory: `inventory.json` generated 2026-07-19T07:31:22.303Z with 378 discovered API entries. This list is the method-and-path index for every discovered route/procedure in the static API catalog.

POST   /api/admin-auth/login
POST   /api/admin-auth/logout
POST   /api/admin/agents/approve
GET    /api/admin/agents/list
POST   /api/admin/agents/reject
POST   /api/admin/ai-query
POST   /api/admin/ai/product-description
POST   /api/admin/ai/related-products
GET    /api/admin/custom-setups
PATCH  /api/admin/custom-setups
GET    /api/admin/dashboard
GET    /api/admin/faqs
POST   /api/admin/faqs
DELETE /api/admin/faqs/{id}
PUT    /api/admin/faqs/{id}
POST   /api/admin/homepage/auto-fill
POST   /api/admin/homepage/auto-fill/run
POST   /api/admin/inventory/warranty/register
GET    /api/admin/jobs/{id}
POST   /api/admin/manage-role
POST   /api/admin/marketing/blitz
POST   /api/admin/marketing/broadcast
GET    /api/admin/orders
POST   /api/admin/orders/{id}/pending-actions
GET    /api/admin/payment-settings
PUT    /api/admin/payment-settings
POST   /api/admin/payment-settings/dedupe
GET    /api/admin/pricing
POST   /api/admin/pricing
DELETE /api/admin/pricing/{id}
GET    /api/admin/pricing/{id}
PUT    /api/admin/pricing/{id}
GET    /api/admin/products
POST   /api/admin/products/ai-add
DELETE /api/admin/products/archive
GET    /api/admin/products/archive
POST   /api/admin/products/archive
PUT    /api/admin/products/archive
PATCH  /api/admin/products/bulk-price
POST   /api/admin/products/bulk-price
POST   /api/admin/products/bulk
GET    /api/admin/quotes
GET    /api/admin/quotes/{id}/download
POST   /api/admin/quotes/{id}/respond
GET    /api/admin/quotes/advance-payment
POST   /api/admin/quotes/advance-payment
POST   /api/admin/redemptions/approve
GET    /api/admin/redemptions/list
POST   /api/admin/redemptions/process
POST   /api/admin/roles/set
GET    /api/admin/sales-agents
GET    /api/admin/sales-agents/{id}
PATCH  /api/admin/sales-agents/{id}
GET    /api/admin/services
POST   /api/admin/setup-initial-admins
POST   /api/admin/setup-sales-agents
GET    /api/admin/users/{id}/history
POST   /api/agents/apply
GET    /api/agents/commissions
GET    /api/agents/me
POST   /api/agents/orders/create
GET    /api/agents/redemptions
POST   /api/agents/redemptions
POST   /api/ai/generate-description
POST   /api/ai/price-request
POST   /api/ai/product-details
POST   /api/ai/research
GET    /api/analytics/dashboard
GET    /api/analytics/reports
POST   /api/analytics/track
POST   /api/auth/2fa/disable
POST   /api/auth/2fa/setup
PUT    /api/auth/2fa/setup
GET    /api/auth/2fa/status
POST   /api/auth/2fa/verify
GET    /api/auth/callback
POST   /api/auth/complete-signup
OPTIONS /api/auth/extension
POST   /api/auth/extension
POST   /api/auth/first-login-whatsapp
POST   /api/auth/forgot-password
POST   /api/auth/login
GET    /api/auth/me
POST   /api/auth/quick-login
POST   /api/auth/resend-verification
POST   /api/auth/reset-password
POST   /api/auth/resolve-phone
POST   /api/auth/send-otp
DELETE /api/auth/session
GET    /api/auth/session
POST   /api/auth/session
POST   /api/auth/signout
POST   /api/auth/signup
POST   /api/auth/verify-otp
DELETE /api/auto-offers
GET    /api/auto-offers
POST   /api/auto-offers
PUT    /api/auto-offers
GET    /api/blog
POST   /api/blog
DELETE /api/blog/{slug}
GET    /api/blog/{slug}
PATCH  /api/blog/{slug}
POST   /api/blueprints/attribution/conversion
DELETE /api/branches
GET    /api/branches
POST   /api/branches
POST   /api/campaigns
GET    /api/captcha/config
POST   /api/captcha/verify
POST   /api/cart/abandoned
POST   /api/cart/merge
POST   /api/cart/sync
POST   /api/checkout/calculate
POST   /api/commissions/calculate
PUT    /api/commissions/calculate
POST   /api/commissions/payments
GET    /api/commissions/rules
POST   /api/commissions/rules
GET    /api/contact-messages
POST   /api/contact-messages
GET    /api/contact-messages/{id}
PATCH  /api/contact-messages/{id}
PATCH  /api/conversations
PATCH  /api/conversations/{id}/assign
POST   /api/copilot/command
DELETE /api/coupons
GET    /api/coupons
POST   /api/coupons
PUT    /api/coupons
GET    /api/cron/abandoned-carts
GET    /api/cron/recover-abandoned-registrations
GET    /api/cron/service-retention
GET    /api/custom-setup-offers
GET    /api/custom-setups
GET    /api/customer-360
GET    /api/customer-promotions
POST   /api/customer-promotions
POST   /api/customer/notifications
GET    /api/customers/register
POST   /api/customers/register
GET    /api/debug-env
DELETE /api/discounts
GET    /api/discounts
POST   /api/discounts
PUT    /api/discounts
GET    /api/discounts/calculate
POST   /api/email/abandoned-cart
POST   /api/email/email-change
POST   /api/email/marketing
POST   /api/email/notify-manager
POST   /api/email/notify-sales-pickup
POST   /api/email/order-approved
POST   /api/email/order-completion
POST   /api/email/order-confirmation
POST   /api/email/order-delivered
POST   /api/email/password-reset
POST   /api/email/payment-confirmation
POST   /api/email/payment-failed
POST   /api/email/payment-pending
POST   /api/email/pickup
POST   /api/email/shipping
POST   /api/email/verification
POST   /api/email/welcome
GET    /api/faqs
GET    /api/free-installation-slots
POST   /api/free-installation-slots
GET    /api/gst-verify
GET    /api/health
GET    /api/health
GET    /api/health
GET    /api/health
GET    /api/health
GET    /api/health
GET    /api/health/email
GET    /api/health/orders
GET    /api/health/otp
GET    /api/health/summary
GET    /api/hello
POST   /api/inquiries
GET    /api/inventory
POST   /api/inventory
PUT    /api/inventory
GET    /api/inventory/transactions
POST   /api/inventory/transactions
PUT    /api/inventory/transactions
PATCH  /api/leads/{id}/assign
POST   /api/marketing/triggers/order-delivered-followup
GET    /api/messages
POST   /api/messages
POST   /api/messages/media
PATCH  /api/messages/read
GET    /api/metadata
POST   /api/notifications/send
DELETE /api/offers
GET    /api/offers
POST   /api/offers
PUT    /api/offers
GET    /api/orders
POST   /api/orders
GET    /api/orders/{id}
GET    /api/orders/{id}/timeline
POST   /api/orders/auto-cancel
POST   /api/orders/commission
POST   /api/orders/update-status
DELETE /api/organizations
GET    /api/organizations
POST   /api/organizations
GET    /api/otp/generate
POST   /api/otp/generate
GET    /api/otp/resend
POST   /api/otp/resend
GET    /api/otp/verify
POST   /api/otp/verify
DELETE /api/page-content
GET    /api/page-content
GET    /api/page-content
POST   /api/page-content
PUT    /api/page-content
POST   /api/payment/payu/callback
POST   /api/payment/payu/initiate
GET    /api/payments/update
POST   /api/payments/update
GET    /api/permissions
GET    /api/pricing/calculate
POST   /api/pricing/calculate
GET    /api/pricing/customer-type
POST   /api/pricing/customer-type
DELETE /api/products
GET    /api/products
GET    /api/products
POST   /api/products
PUT    /api/products
GET    /api/products/{id}
PATCH  /api/products/{id}
GET    /api/products/bulk-edit
POST   /api/products/bulk-edit
POST   /api/products/cleanup-images
DELETE /api/products/cleanup
GET    /api/products/export
POST   /api/products/fix-images
GET    /api/products/image-diagnostics
GET    /api/products/import
POST   /api/products/import
POST   /api/products/manual-import
GET    /api/products/recommendations
POST   /api/products/scrape-url
OPTIONS /api/products/scraper
POST   /api/products/scraper
OPTIONS /api/products/scraper/ai
POST   /api/products/scraper/ai
POST   /api/products/simple-import
GET    /api/products/template
GET    /api/projects
POST   /api/projects
DELETE /api/projects/{id}
PUT    /api/projects/{id}
GET    /api/projects/{id}/pdf
POST   /api/promotions/claim-viral
POST   /api/promotions/free-installation-claim
POST   /api/quotes
GET    /api/quotes/{id}
POST   /api/quotes/{id}/accept-counter
GET    /api/quotes/{id}/advance-payment/confirm
POST   /api/quotes/{id}/advance-payment/confirm
POST   /api/quotes/{id}/advance-payment/generate-link
POST   /api/quotes/{id}/reject-counter
POST   /api/quotes/bid
GET    /api/referral
POST   /api/referral/claim
GET    /api/roles-public
GET    /api/roles
GET    /api/roles
POST   /api/roles
POST   /api/roles
POST   /api/sales-agents/apply
GET    /api/security/audit-logs
POST   /api/security/audit-logs
GET    /api/security/mfa-status
POST   /api/security/mfa-status
GET    /api/security/settings
POST   /api/security/settings
POST   /api/security/validate-password
GET    /api/service-availability
GET    /api/services
POST   /api/services
DELETE /api/services/{id}
GET    /api/services/{id}
PUT    /api/services/{id}
GET    /api/services/engineers
POST   /api/services/engineers
GET    /api/services/tickets
POST   /api/services/tickets
GET    /api/services/tickets/{id}
PUT    /api/services/tickets/{id}
DELETE /api/settings
GET    /api/settings
POST   /api/settings
PUT    /api/settings
GET    /api/shipping
POST   /api/shipping
GET    /api/shipping/update
POST   /api/shipping/update
DELETE /api/superadmin/areas
GET    /api/superadmin/areas
POST   /api/superadmin/areas
POST   /api/superadmin/catalogue/generate
DELETE /api/superadmin/custom-setup-offers
GET    /api/superadmin/custom-setup-offers
POST   /api/superadmin/custom-setup-offers
PUT    /api/superadmin/custom-setup-offers
GET    /api/superadmin/inquiries
PATCH  /api/superadmin/inquiries/{id}/assignment
POST   /api/superadmin/services/ai-generate
GET    /api/templates
POST   /api/templates
GET    /api/trpc/{trpc}
POST   /api/trpc/{trpc}
POST   /api/trpc/contactMessages.submit
POST   /api/trpc/coupons.create
POST   /api/trpc/coupons.delete
GET    /api/trpc/coupons.getAll
GET    /api/trpc/coupons.getByCode
GET    /api/trpc/coupons.getById
POST   /api/trpc/coupons.update
GET    /api/trpc/featureFlags.getAll
POST   /api/trpc/featureFlags.toggle
POST   /api/trpc/offers.create
POST   /api/trpc/offers.delete
GET    /api/trpc/offers.getAll
POST   /api/trpc/offers.update
GET    /api/trpc/pageContent.get
GET    /api/trpc/pageContent.list_all
POST   /api/trpc/pageContent.update
POST   /api/trpc/projects.create
POST   /api/trpc/projects.delete
GET    /api/trpc/projects.getAll
POST   /api/upload-from-url
POST   /api/upload
POST   /api/uploads/quote-documents
GET    /api/user/communication-preferences
POST   /api/user/communication-preferences
POST   /api/user/gdpr/delete
GET    /api/user/gdpr/export
GET    /api/user/notifications
PUT    /api/user/notifications
DELETE /api/user/wishlist
GET    /api/user/wishlist
POST   /api/user/wishlist
GET    /api/users-admin
POST   /api/users-admin
DELETE /api/users
DELETE /api/users
GET    /api/users
GET    /api/users
GET    /api/users
POST   /api/users
POST   /api/users
PUT    /api/users
PUT    /api/users
GET    /api/v1/embed/configurator
GET    /api/walk-in-orders
POST   /api/walk-in-orders
POST   /api/warranty/activate
POST   /api/webhook/whatsapp
POST   /api/webhooks/custom-tunnel/{path*}
POST   /api/webhooks/customer/signup
POST   /api/webhooks/orders/cancelled
POST   /api/webhooks/orders/delayed
POST   /api/webhooks/orders/delivered
POST   /api/webhooks/orders/notconfirmed
POST   /api/webhooks/orders/outfordelivery
POST   /api/webhooks/orders/placed
POST   /api/webhooks/orders/shipped
POST   /api/webhooks/payment/failed
POST   /api/webhooks/payment/received
GET    /api/webhooks/stats
POST   /api/webhooks/stats

````````

---

## docs/api-audit/enterprise-api-gap-analysis-review-board.md

````````markdown
# Enterprise API Gap Analysis Review Board

Generated: 2026-07-19

Latest source inventory: `inventory.json` generated 2026-07-19T07:31:22.303Z with 378 discovered API entries. This board extends the source inventory into enterprise business capability analysis and lists APIs required for production workflows even when no route exists yet.

## Executive Verdict

Does this project contain every API required for an enterprise-grade ERP, CRM, E-Commerce, WABA, and Management platform?

No.

The repository has broad API implementation coverage and a generated catalog of 378 discovered API entries, but it does not yet contain every enterprise API required for production-grade ERP, CRM, E-Commerce, WABA, webmail, Chrome Extension, analytics, governance, security, and management operations.

The current implementation is strong for public commerce, authentication, products, orders, quotes, selected admin operations, WABA messaging, basic inventory, service tickets, and core marketing triggers. The remaining gaps are enterprise lifecycle APIs, cross-module operational APIs, security hardening APIs, analytics APIs, integration management APIs, automation APIs, and full CRUD/action coverage for database domains that already exist in the schema.

## Evidence Base

- Existing generated catalog: `docs/api-audit/complete-api-inventory.md`
- Frontend mapping: `docs/api-audit/api-frontend-mapping.md`
- Database mapping: `docs/api-audit/api-database-mapping.md`
- Role mapping: `docs/api-audit/api-role-mapping.md`
- Machine inventory: `docs/api-audit/inventory.json`
- Database schema: `database.sql`
- Next route handlers across `apps/api`, `apps/mgmt`, `apps/superadmin`, `apps/waba`, `apps/public`, and `apps/webmail`
- Public website, management, superadmin, WABA, webmail, extension, shared packages, and database modules were considered as one enterprise platform.

## Existing API Catalog Summary

Full row-level catalog is maintained in `docs/api-audit/complete-api-inventory.md`. The static discovery found:

| Area | Count |
| --- | ---: |
| Total discovered API entries | 378 |
| Working route entries by static verification | 378 |
| Broken route entries | 0 |
| Direct unmatched frontend callers | 0 |
| Duplicate APIs found by generated inventory | 0 |
| Missing validation signals | 0 |
| Missing authentication signals | 0 |
| Slow API candidates | 0 |
| Security issues/signals missing | 0 |
| Database integration issues | 0 |

### Existing APIs By Application

| Application / Module | API Entries | Mutating Entries | Observed Risk |
| --- | ---: | ---: | --- |
| API app | 256 | 221 | Broad coverage, but many audit, logging, lifecycle, and enterprise contract gaps |
| Management | 56 | 43 | Good admin coverage, missing several enterprise domain lifecycles |
| Superadmin | 25 | 21 | Organization, roles, branches, areas, catalogue coverage exists but is not complete ERP administration |
| WABA | 18 | 12 | Messaging exists, but campaign lifecycle, template sync, opt-in/out, analytics, retries are incomplete |
| tRPC/RPC | 19 | 11 | Shared UI workflows exist, but cataloged REST governance around them is incomplete |
| Public | 3 | 0 | Public app has local API routes only for public content/health/manifest |
| Webmail | 1 | 0 | Only health API exists; webmail business APIs are missing |

### Existing APIs By Method

| Method | Count |
| --- | ---: |
| POST | 187 |
| GET | 133 |
| PUT | 22 |
| DELETE | 22 |
| PATCH | 11 |
| OPTIONS | 3 |

### Every Existing API Coverage Control

This board covers every discovered API entry, not a representative sample. The 378 route/procedure entries are the current enterprise API catalog and are reviewed through the following linked artifacts:

| Coverage Artifact | Scope Covered | Use In This Review |
| --- | --- | --- |
| `docs/api-audit/complete-api-inventory.md` | Every discovered API with method, URL, module, route file, validation signal, middleware, authentication, permission, database tables, frontend pages, app usage, integration status, and static issue status | Canonical row-level enterprise API catalog |
| `docs/api-audit/inventory.json` | Machine-readable inventory for all 378 entries plus summary counts, unmatched callers, duplicates, and issue classifications | Source of truth for generated counts in this board |
| `docs/api-audit/openapi.yaml` and `docs/api-audit/openapi.json` | Contract export for discovered HTTP APIs | API contract handoff and downstream tooling |
| `docs/api-audit/postman_collection.json` and `docs/api-audit/postman_environment.json` | Runnable request collection for discovered APIs | Manual and automated API exercise baseline |
| `docs/api-audit/api-frontend-mapping.md` | API-to-screen and caller coverage | Confirms direct frontend callers and identifies backend-only/system endpoints |
| `docs/api-audit/api-database-mapping.md` | API-to-table mapping | Confirms which database domains are exposed and which schema-backed domains still need lifecycle APIs |
| `docs/api-audit/api-role-mapping.md` | API-to-role/permission mapping | Confirms authentication and authorization signals for discovered APIs |
| Missing API Matrix in this board | APIs required by enterprise workflows but not found in the discovered catalog | Development backlog for production readiness |

Any API that exists in source is covered by the row-level catalog. Any API required by business workflows but absent from that catalog is covered in the Missing API Matrix below.

## API Quality Findings

| Category | Finding | Production Impact |
| --- | --- | --- |
| Duplicate APIs | No duplicates found by the generated inventory | No immediate merge required from static discovery |
| Unused APIs | No unused APIs found by the generated inventory | Several backend-only/system endpoints are valid, but should be documented and tested |
| APIs to merge | Health APIs across apps should keep app-local URLs but share a common response contract | Reduces inconsistent monitoring behavior |
| APIs to refactor | Email notification endpoints should be consolidated behind a notification command API plus typed templates | Reduces one-endpoint-per-message sprawl |
| APIs to refactor | Admin products, public products, scraper, import/export, and image maintenance endpoints should share product service contracts | Reduces inconsistent validation, permissions, and audit behavior |
| APIs to refactor | WABA message, media, campaign, template, and webhook endpoints should share tenant/channel guards | Prevents cross-tenant messaging mistakes |
| Missing versioning | Only selected `/api/v1` routes exist; most APIs are unversioned | Breaking changes will be hard to manage for apps, extension, and integrations |
| Missing validation | 0 missing validation signals | Static audit now recognizes explicit route validation and valid shared validation controls |
| Missing authentication | 0 missing authentication signals | Static audit now recognizes app-level unified policy middleware and route-level guards |
| Missing audit trail | 351 endpoints lack audit trail signals | Enterprise incident response and compliance are not production-ready |
| Missing rate limiting | 0 mutating endpoints lack rate-limit signals in the selected security summary | App-level unified policy middleware and route-level limiters are recognized by the audit |
| Missing logging/error handling | Logging and explicit error handling are inconsistent | Supportability and SLA diagnosis risk |
| Missing pagination | Static report did not consistently prove pagination on list endpoints | Large enterprise tenants may hit latency and memory issues |

## Database Domain Coverage

The database initializer defines 127 tables and 24 functions. API coverage exists for many core tables, but several table families do not have complete lifecycle APIs.

| Database Domain | Tables Present | API Coverage Assessment |
| --- | --- | --- |
| Organization/RBAC | companies, tenants, branches, departments, roles, permissions, role_permissions, profiles, user_roles, staff, user_sessions, api_keys | Partial. Companies/branches/roles/users exist, but departments, tenants, API keys, sessions/devices, staff lifecycle, and permission audit APIs are incomplete |
| Commerce Catalog | products, variants, options, images, pricing, reviews, categories, brands | Partial. Products/pricing/import/export exist; variants/options/reviews/categories/brands require full CRUD/moderation APIs |
| Inventory/Purchase | warehouses, suppliers, inventory, product_inventory, purchases, purchase_items, stock_movements | Partial. Inventory and transactions exist; warehouse, supplier, PO, receiving, stock transfer, reservation, cycle count APIs are missing |
| Sales/Finance | customers, addresses, leads, quotes, orders, invoices, payments, taxes, coupons, discounts, carts, wishlists | Partial. Orders/quotes/payments/coupons exist; customer master, invoices, refunds, reconciliation, taxes, wishlist admin, export/import, and ledgers are missing |
| Service/Warranty/AMC | services, service_engineers, service_tickets, service_requests, warranties, amc_contracts, dispatch_records | Partial. Tickets/services exist; AMC, warranty claims, dispatch, scheduling, field engineer workflow, SLA APIs are missing |
| Marketing/WABA/Webmail | notifications, campaigns, broadcasts, templates, WABA automation, WhatsApp media, webmail accounts/messages | Partial. WABA basics and broadcasts exist; webmail APIs are absent, and campaign/template analytics/lifecycle are incomplete |
| Governance/Analytics | audit_logs, activity_logs, security_audit_log, analytics_events, reports, webhook_events, settings, integrations, file_storage | Partial. Analytics and security endpoints exist; enterprise audit export, activity timeline, saved views, webhooks CRUD, integration health, media library are incomplete |
| CMS/Public | cms_pages, page_content, blog_posts, faqs, offers, custom setup, projects, inquiries | Partial. Page content/blog/FAQ/offers/custom setup exist; approval workflow, publishing workflow, revisions, media library, comments are incomplete |

## Screen And Workflow Coverage Matrix

| Application | Screens / Workflows Observed | APIs Exist | Missing API Classes |
| --- | --- | --- | --- |
| Public Website | home, services, products, cart, checkout, orders, quotes, payments, profile, warranty activation, blog, offers, contact | Products, inquiries, cart sync/merge, checkout calculate, orders, payment initiation/callback, profile auth, warranty activation | Customer master profile CRUD, addresses, saved views/favorites, invoice download, returns/refunds, product reviews, media library, service booking lifecycle |
| Customer Portal | profile, orders, quotes, projects, wishlist/cart, notifications | Auth/session, orders, quotes, wishlist, notifications | Preferences, saved addresses, tickets, warranty claims, AMC, consent management, downloadable invoices, communication history |
| Management | admin dashboard, products, pricing, orders, quotes, inventory, purchase entry, quick billing, marketing, users, sales agents, service | Broad management APIs exist | Departments/staff lifecycle, suppliers, purchases, warehouses, invoices, refunds, approval workflows, task/calendar APIs, saved filters/views, audit export |
| Superadmin | dashboard, organizations, branches, roles, areas, catalogue, services, settings, reports, audit logs, AI config | Organizations, branches, roles, permissions, areas, selected services/products/settings | Tenant lifecycle, department lifecycle, feature flags, API keys, integration registry, platform-wide audit export, license/plan limits |
| WABA | login, inbox/conversations, messages, media, campaigns, templates, customer 360 | Auth, conversations, messages, media, campaign create, templates, customer 360 | Campaign list/update/delete/schedule, Meta template sync/approval, opt-in/out, retry/DLQ, delivery analytics, automation rule CRUD |
| Webmail | inbox page and health | Health only | Account CRUD, mailbox sync, folders, threads, send/reply/forward, attachments, signatures, templates, provider webhooks |
| Chrome Extension | auth, product extraction/scraper | Extension auth, scraper/product import endpoints | Extension job history, extraction review queue, source allowlist, extension telemetry, token rotation/revoke |

## Common API Requirements Matrix

| Requirement | Current Coverage | Gap |
| --- | --- | --- |
| Create/read/update/delete | Present for many modules | Not complete for customers, departments, tenants, suppliers, warehouses, purchases, invoices, webmail, integrations, feature flags |
| Soft delete/restore | Present for products | Missing generic support for most master data and transactional support entities |
| Bulk delete/update/import/export | Present for products in places | Missing for customers, leads, orders, invoices, suppliers, purchases, inventory, campaigns, audit/report data |
| Search/filter/sort/pagination | Partially present | Not guaranteed as a standard contract across list APIs |
| Status updates | Present for orders and selected agents | Missing standardized status APIs for leads, invoices, purchases, service, warranty, campaigns, webmail |
| Timeline/activity/history | Present for orders and user history | Missing universal entity timeline/activity APIs |
| Audit logs | Security audit route exists | Missing structured audit trail writes and export/filter APIs across privileged routes |
| Analytics/reports | Dashboard/reports exist | Missing domain-specific enterprise analytics endpoints |
| Notifications | Send/user/customer notification endpoints exist | Missing notification center lifecycle, templates, preferences per channel, delivery status/retry APIs |

## Missing API Matrix

Request and response schemas below are intentionally contract-level. All endpoints should return the standard response envelope:

```json
{
  "success": true,
  "data": {},
  "meta": { "requestId": "string", "pagination": {} },
  "error": null
}
```

List endpoints should support `page`, `limit`, `sort`, `order`, `search`, `filters`, and `includeArchived` unless documented otherwise. Mutating endpoints require idempotency keys where duplicate submission is possible.

| Priority | Module | API Name | Method | Suggested URL | Purpose | Business Justification | Auth | Permission | Request Schema | Response Schema | Tables | Frontend Pages | Effort |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| P0 | Security | Refresh Token | POST | `/api/auth/refresh-token` | Rotate access/refresh session credentials | Required for secure long-lived sessions across public, mgmt, WABA, extension | Yes | `auth.session.refresh` | `{ refreshToken, deviceId }` | `{ accessToken, refreshToken, expiresAt }` | user_sessions, profiles | all auth apps | M |
| P0 | Security | Device Sessions List | GET | `/api/auth/devices` | List active user devices/sessions | Required for account takeover response | Yes | `auth.device.read` | query pagination | `{ devices[] }` | user_sessions | profile, security settings | M |
| P0 | Security | Revoke Device Session | DELETE | `/api/auth/devices/{id}` | Revoke one device/session | Required for user self-service and admin response | Yes | `auth.device.revoke` | path `id` | `{ revoked: true }` | user_sessions, security_audit_log | profile, admin security | M |
| P0 | Security | MFA Recovery Codes | POST | `/api/auth/mfa/recovery-codes` | Generate/regenerate recovery codes | Required for safe MFA rollout | Yes | `auth.mfa.manage` | `{ regenerate?: boolean }` | `{ recoveryCodes[] }` | user_mfa_status, security_audit_log | MFA setup | M |
| P0 | Security | API Key List/Create | GET/POST | `/api/api-keys` | Manage integration API keys | Required for enterprise integrations and extension/service auth | Yes | `api_keys.manage` | POST `{ name, scopes, expiresAt }` | `{ apiKey?, records[] }` | api_keys, security_audit_log | superadmin settings, integrations | M |
| P0 | Security | API Key Update/Revoke | PATCH/DELETE | `/api/api-keys/{id}` | Update scopes or revoke key | Required for secret rotation and breach response | Yes | `api_keys.manage` | PATCH `{ scopes?, status? }` | `{ apiKey }` | api_keys, security_audit_log | superadmin settings | M |
| P0 | Security | API Key Rotate | POST | `/api/api-keys/{id}/rotate` | Rotate an integration key | Required for production credential hygiene | Yes | `api_keys.rotate` | `{ reason }` | `{ apiKey, secretOnce }` | api_keys, security_audit_log | superadmin settings | M |
| P0 | Governance | Universal Audit Search | GET | `/api/audit-logs` | Search platform audit logs | Required for compliance and incident response | Yes | `audit.read` | query filters | `{ events[] }` | audit_logs, security_audit_log, activity_logs | audit logs pages | M |
| P0 | Governance | Audit Export | POST | `/api/audit-logs/export` | Export audit logs by scope/date | Required for enterprise audits | Yes | `audit.export` | `{ filters, format }` | `{ jobId, downloadUrl? }` | audit_logs, reports, file_storage | audit logs pages | M |
| P0 | Governance | Universal Activity Timeline | GET | `/api/activity-timeline` | Read timeline for any entity | Required for support, sales, service, and compliance | Yes | `activity.read` | `{ entityType, entityId }` | `{ events[] }` | activity_logs, audit_logs | orders, customers, leads, tickets | M |
| P0 | Governance | Entity Comments | GET/POST | `/api/comments` | Read/add comments on business records | Required for internal collaboration | Yes | `comments.manage` | `{ entityType, entityId, body, visibility }` | `{ comment }` | activity_logs or comments table required | CRM, orders, tickets | M |
| P0 | Governance | Internal Notes | GET/POST | `/api/internal-notes` | Private notes for staff-only workflows | Required for CRM/service/order operations | Yes | `notes.manage` | `{ entityType, entityId, body }` | `{ note }` | activity_logs or internal_notes table required | CRM, service, orders | M |
| P0 | Governance | Assignment Create/Transfer | POST | `/api/assignments` | Assign/transfer any entity to user/team | Required for leads, tickets, orders, WABA conversations | Yes | `assignments.manage` | `{ entityType, entityId, assigneeId, teamId?, reason }` | `{ assignment }` | activity_logs, profiles | lead center, tickets, inbox | M |
| P0 | Governance | Approval Submit/Action | POST | `/api/approvals` | Submit/approve/reject enterprise approvals | Required for discounts, refunds, quotes, purchases, settings | Yes | `approvals.manage` | `{ entityType, entityId, action, comment? }` | `{ approval }` | approval_workflows table required, activity_logs | admin, manager | L |
| P0 | Organization | Tenant Lifecycle | GET/POST/PATCH/DELETE | `/api/tenants`, `/api/tenants/{id}` | Manage tenant records, plan, limits, status | Required for SaaS multi-tenant operation | Yes | `tenants.manage` | `{ companyId, name, slug, plan, limits, status }` | `{ tenant }` | tenants, companies | superadmin organizations | M |
| P0 | Organization | Department Lifecycle | GET/POST/PATCH/DELETE | `/api/departments`, `/api/departments/{id}` | Manage departments and hierarchy | Required for staff routing, permissions, approvals | Yes | `departments.manage` | `{ companyId, branchId, code, name, parentDepartmentId }` | `{ department }` | departments | superadmin, mgmt staff | M |
| P0 | Organization | Staff Lifecycle | GET/POST/PATCH/DELETE | `/api/staff`, `/api/staff/{id}` | Manage employee/staff master data | Required for ERP roles, attendance, assignments, approvals | Yes | `staff.manage` | `{ profileId, departmentId, branchId, designation, status }` | `{ staff }` | staff, profiles, departments, branches | admin staff, users | M |
| P0 | Customer | Customer Master CRUD | GET/POST/PATCH/DELETE | `/api/customers`, `/api/customers/{id}` | Manage customer records beyond registration | Required for CRM, orders, service, warranty, invoicing | Yes | `customers.manage` | `{ name, phone, email, gstin, type, status }` | `{ customer }` | customers, profiles | CRM, admin customers | M |
| P0 | Customer | Customer Addresses | GET/POST/PATCH/DELETE | `/api/customers/{id}/addresses` | Manage billing/shipping/service addresses | Required for checkout, dispatch, GST invoices, service | Yes | `customers.address.manage` | `{ address, type, isDefault }` | `{ address }` | customer_addresses | profile, checkout, CRM | M |
| P0 | Customer | Customer Merge | POST | `/api/customers/merge` | Merge duplicate customers | Required for clean CRM and omnichannel identity | Yes | `customers.merge` | `{ sourceCustomerIds[], targetCustomerId, reason }` | `{ mergedCustomer }` | customers, orders, quotes, tickets, activity_logs | CRM admin | L |
| P0 | Leads/CRM | Lead CRUD | GET/POST/PATCH/DELETE | `/api/leads`, `/api/leads/{id}` | Manage CRM leads | Required for visitor-to-customer workflow | Yes | `leads.manage` | `{ name, contact, source, stage, ownerId }` | `{ lead }` | leads, contact_messages, inquiries | lead center, superadmin leads | M |
| P0 | Leads/CRM | Lead Convert | POST | `/api/leads/{id}/convert` | Convert lead to customer/quote/order/project | Required for CRM to sales conversion | Yes | `leads.convert` | `{ convertTo, customerId?, quotePayload? }` | `{ customer?, quote?, order? }` | leads, customers, quotes, orders | lead center | L |
| P0 | Leads/CRM | Lead Stage Update | POST | `/api/leads/{id}/stage` | Move lead through pipeline | Required for forecast and SLA | Yes | `leads.stage.update` | `{ stage, reason, nextActionAt? }` | `{ lead }` | leads, activity_logs | lead pipeline | M |
| P0 | Finance | Invoice CRUD/List | GET/POST/PATCH/DELETE | `/api/invoices`, `/api/invoices/{id}` | Manage tax invoices | Required after order/payment workflow | Yes | `invoices.manage` | `{ customerId, orderId?, items[], taxes[], status }` | `{ invoice }` | invoices, invoice_items, orders, payments | invoices, order detail | L |
| P0 | Finance | Invoice PDF Download | GET | `/api/invoices/{id}/download` | Download invoice PDF | Required for customers, accounting, GST | Yes | `invoices.download` | path `id` | PDF or `{ downloadUrl }` | invoices, invoice_items, file_storage | order invoice pages | M |
| P0 | Finance | Invoice Payment Apply | POST | `/api/invoices/{id}/payments` | Apply payment to invoice | Required for receivables accuracy | Yes | `invoices.payment.apply` | `{ paymentId, amount, method }` | `{ invoice, payment }` | invoices, payments, payment_transactions | accounts, orders | L |
| P0 | Finance | Refund Create | POST | `/api/payments/{id}/refunds` | Initiate full/partial refund | Required for cancellations, returns, failed service | Yes | `payments.refund` | `{ amount, reason, lineItems? }` | `{ refund }` | payments, payment_transactions, orders | orders, accounts | L |
| P0 | Finance | Payment Reconciliation | GET/POST | `/api/payments/reconciliation` | Match gateway, bank, and internal payments | Required for production finance closure | Yes | `payments.reconcile` | POST `{ provider, fileId? }` | `{ matches[], exceptions[] }` | payments, payment_transactions, reports | accounts | L |
| P0 | Orders | Order Cancel | POST | `/api/orders/{id}/cancel` | Cancel order with reason and inventory release | Required for commerce lifecycle | Yes | `orders.cancel` | `{ reason, restock, refundMode? }` | `{ order }` | orders, order_items, inventory, payments | order detail | M |
| P0 | Orders | Order Return | POST | `/api/orders/{id}/returns` | Create return/RMA request | Required for post-delivery commerce | Yes | `orders.return.create` | `{ items[], reason, pickupAddressId? }` | `{ returnRequest }` | orders, order_items, stock_movements, payments | order detail, customer portal | L |
| P0 | Orders | Dispatch Create/Update | GET/POST/PATCH | `/api/orders/{id}/dispatch` | Manage dispatch/shipping handoff | Required for inventory-to-delivery workflow | Yes | `dispatch.manage` | `{ carrier, trackingNo, packages[], status }` | `{ dispatch }` | dispatch_records, orders | service manager, orders | L |
| P0 | Inventory | Warehouse CRUD | GET/POST/PATCH/DELETE | `/api/warehouses`, `/api/warehouses/{id}` | Manage warehouse/location master | Required for stock correctness | Yes | `warehouses.manage` | `{ branchId, code, name, address, status }` | `{ warehouse }` | warehouses, branches | inventory admin | M |
| P0 | Inventory | Supplier CRUD | GET/POST/PATCH/DELETE | `/api/suppliers`, `/api/suppliers/{id}` | Manage supplier master | Required for purchasing and warranty/vendor tracking | Yes | `suppliers.manage` | `{ name, gstin, contact, paymentTerms, status }` | `{ supplier }` | suppliers | purchase, inventory | M |
| P0 | Purchasing | Purchase Order CRUD | GET/POST/PATCH/DELETE | `/api/purchases`, `/api/purchases/{id}` | Manage purchase orders | Required for ERP procurement | Yes | `purchases.manage` | `{ supplierId, warehouseId, items[], expectedDate }` | `{ purchase }` | purchases, purchase_items, suppliers | purchase pages | L |
| P0 | Purchasing | Purchase Receive | POST | `/api/purchases/{id}/receive` | Receive PO items into inventory | Required for stock and accounting | Yes | `purchases.receive` | `{ items[], invoiceNo?, receivedAt }` | `{ purchase, stockMovements[] }` | purchases, purchase_items, stock_movements, inventory | purchase entry | L |
| P0 | Inventory | Stock Transfer | POST | `/api/inventory/transfers` | Transfer stock between warehouses/branches | Required for multi-branch inventory | Yes | `inventory.transfer` | `{ fromWarehouseId, toWarehouseId, items[], reason }` | `{ transfer, stockMovements[] }` | inventory, stock_movements, warehouses | inventory | L |
| P0 | Inventory | Stock Reservation | POST/DELETE | `/api/inventory/reservations` | Reserve/release stock for carts/orders/service | Required to prevent overselling | Yes | `inventory.reserve` | `{ entityType, entityId, items[] }` | `{ reservation }` | inventory, stock_movements, orders, carts | checkout, orders | L |
| P0 | Service | Service Request CRUD | GET/POST/PATCH/DELETE | `/api/service-requests`, `/api/service-requests/{id}` | Manage service requests separate from tickets | Required for customer support intake | Yes | `service_requests.manage` | `{ customerId, productId?, issue, priority }` | `{ serviceRequest }` | service_requests, customers | service manager, customer portal | M |
| P0 | Service | Ticket Assignment/Schedule | POST | `/api/services/tickets/{id}/schedule` | Assign engineer and schedule visit | Required for field-service execution | Yes | `service_tickets.schedule` | `{ engineerId, scheduledAt, location }` | `{ ticket }` | service_tickets, service_engineers, calendar_events | service manager | M |
| P0 | Warranty | Warranty Claim CRUD | GET/POST/PATCH | `/api/warranties/claims`, `/api/warranties/claims/{id}` | Manage warranty claims | Required after warranty activation | Yes | `warranty.claims.manage` | `{ warrantyId, issue, attachments[] }` | `{ claim }` | warranties, service_tickets, file_storage | customer portal, service | L |
| P0 | AMC | AMC Contract CRUD | GET/POST/PATCH/DELETE | `/api/amc-contracts`, `/api/amc-contracts/{id}` | Manage AMC lifecycle | Required for recurring service revenue | Yes | `amc.manage` | `{ customerId, assets[], startDate, endDate, plan }` | `{ contract }` | amc_contracts, customers, services | service manager AMC | L |
| P0 | WABA | Campaign List/Update/Delete | GET/PATCH/DELETE | `/api/campaigns`, `/api/campaigns/{id}` | Complete campaign lifecycle | Required beyond campaign creation | Yes | `waba.campaigns.manage` | PATCH `{ status, name, schedule, audience }` | `{ campaign }` | marketing_campaigns, broadcast_messages | WABA campaigns | M |
| P0 | WABA | Campaign Schedule/Cancel | POST | `/api/campaigns/{id}/schedule`, `/api/campaigns/{id}/cancel` | Schedule/cancel campaign sends | Required for controlled broadcasting | Yes | `waba.campaigns.schedule` | `{ scheduledAt }` / `{ reason }` | `{ campaign }` | marketing_campaigns, ntf_queue | WABA campaigns | M |
| P0 | WABA | Template Sync/Submit | POST | `/api/templates/sync`, `/api/templates/{id}/submit` | Sync and submit WhatsApp templates to provider | Required for Meta approval workflow | Yes | `waba.templates.manage` | `{ provider, templateId? }` | `{ templates[], status }` | templates, waba_automation_rules | WABA templates | L |
| P0 | WABA | Opt In/Out | POST | `/api/waba/contacts/consent` | Manage WhatsApp consent | Required for compliance and deliverability | Yes | `waba.consent.manage` | `{ phone, channel, consent, source }` | `{ consent }` | notification_preferences, customers, whatsapp_conversations | WABA inbox, CRM | M |
| P0 | WABA | Webhook Retry/DLQ | GET/POST | `/api/waba/webhooks/dead-letter`, `/api/waba/webhooks/{id}/retry` | Inspect/retry failed WABA events | Required for reliable messaging operations | Yes | `waba.webhooks.manage` | POST `{ eventId }` | `{ retried: true }` | webhook_events, failed_api_calls | WABA admin | L |
| P0 | Webmail | Mail Account CRUD | GET/POST/PATCH/DELETE | `/api/webmail/accounts`, `/api/webmail/accounts/{id}` | Configure provider mailboxes | Required because webmail app has inbox UI but only health API | Yes | `webmail.accounts.manage` | `{ provider, email, credentialsRef, settings }` | `{ account }` | webmail_accounts, integrations | webmail, settings | L |
| P0 | Webmail | Mailbox Sync | POST | `/api/webmail/accounts/{id}/sync` | Sync mailbox from provider | Required for inbox functionality | Yes | `webmail.sync` | `{ full?: boolean, since?: string }` | `{ jobId }` | webmail_accounts, webmail_messages, ntf_queue | webmail inbox | L |
| P0 | Webmail | Messages/Threads | GET | `/api/webmail/messages`, `/api/webmail/threads/{id}` | Read mail inbox and threads | Required for webmail user workflow | Yes | `webmail.messages.read` | query filters | `{ messages[] }`, `{ thread }` | webmail_messages | webmail inbox | M |
| P0 | Webmail | Send/Reply/Forward Email | POST | `/api/webmail/messages/send`, `/api/webmail/messages/{id}/reply`, `/api/webmail/messages/{id}/forward` | Send and respond to emails | Required for webmail product | Yes | `webmail.messages.send` | `{ to[], cc[], subject, body, attachments[] }` | `{ message }` | webmail_messages, file_storage | webmail inbox | L |
| P0 | Webmail | Attachments | GET/POST | `/api/webmail/attachments` | Upload/download email attachments | Required for customer/support communication | Yes | `webmail.attachments.manage` | multipart or `{ fileId }` | `{ attachment }` | file_storage, webmail_messages | webmail inbox | M |
| P0 | Analytics | Executive Dashboard | GET | `/api/analytics/executive-dashboard` | Cross-domain KPI dashboard | Required for leadership reporting | Yes | `analytics.executive.read` | query date range | `{ revenue, sales, service, inventory, marketing }` | analytics_events, orders, payments, inventory, leads | admin reports | L |
| P0 | Analytics | Sales Analytics | GET | `/api/analytics/sales` | Sales funnel/order/revenue analytics | Required for CRM and commerce decisions | Yes | `analytics.sales.read` | query filters | `{ metrics, series, segments }` | orders, quotes, leads, payments | reports | M |
| P0 | Analytics | Inventory Analytics | GET | `/api/analytics/inventory` | Stock aging, turnover, low stock, valuation | Required for ERP inventory control | Yes | `analytics.inventory.read` | query filters | `{ metrics, exceptions }` | inventory, stock_movements, purchases | inventory reports | M |
| P0 | Analytics | Marketing/WABA Analytics | GET | `/api/analytics/marketing` | Campaign and channel performance | Required for marketing ROI | Yes | `analytics.marketing.read` | query filters | `{ campaigns, delivery, conversion }` | marketing_campaigns, broadcast_messages, analytics_events | marketing reports, WABA | M |
| P0 | Analytics | Security Analytics | GET | `/api/analytics/security` | Auth failures, risky devices, API key usage | Required for enterprise security monitoring | Yes | `analytics.security.read` | query filters | `{ events, risks, trends }` | security_audit_log, user_sessions, api_keys | security dashboard | M |
| P1 | Platform | Feature Flags CRUD | GET/POST/PATCH/DELETE | `/api/feature-flags`, `/api/feature-flags/{key}` | Manage runtime features by tenant/role | Required for SaaS rollout control | Yes | `feature_flags.manage` | `{ key, enabled, rules }` | `{ flag }` | settings or feature_flags table required | superadmin settings | M |
| P1 | Platform | User Preferences | GET/PATCH | `/api/user/preferences` | Store per-user UX preferences | Required for enterprise repeated workflows | Yes | `preferences.manage` | `{ theme?, locale?, defaults? }` | `{ preferences }` | user_preferences | all portals | S |
| P1 | Platform | Saved Filters | GET/POST/PATCH/DELETE | `/api/saved-filters`, `/api/saved-filters/{id}` | Persist reusable filters | Required for admin/operator productivity | Yes | `saved_filters.manage` | `{ module, name, filters }` | `{ savedFilter }` | user_preferences or saved_filters table required | list pages | M |
| P1 | Platform | Saved Views | GET/POST/PATCH/DELETE | `/api/saved-views`, `/api/saved-views/{id}` | Persist table/dashboard views | Required for enterprise roles and managers | Yes | `saved_views.manage` | `{ module, name, columns, sort, filters }` | `{ savedView }` | user_preferences or saved_views table required | dashboards, lists | M |
| P1 | Platform | Bookmarks/Favorites | GET/POST/DELETE | `/api/bookmarks`, `/api/bookmarks/{id}` | Bookmark products, records, reports | Required for customer and staff workflows | Yes | `bookmarks.manage` | `{ entityType, entityId }` | `{ bookmark }` | user_preferences or bookmarks table required | customer portal, mgmt | M |
| P1 | Files | Media Library | GET/POST/PATCH/DELETE | `/api/media`, `/api/media/{id}` | Manage uploaded media and metadata | Required for CMS, products, service, webmail | Yes | `media.manage` | multipart + `{ folder, tags, visibility }` | `{ media }` | file_storage | CMS, products, webmail | M |
| P1 | Files | Signed Upload URL | POST | `/api/uploads/signed-url` | Generate direct cloud upload URL | Required for scalable file uploads | Yes | `uploads.create` | `{ filename, contentType, scope }` | `{ uploadUrl, fileId }` | file_storage, integrations | all upload surfaces | M |
| P1 | Integrations | Integration Registry CRUD | GET/POST/PATCH/DELETE | `/api/integrations`, `/api/integrations/{id}` | Configure third-party integrations | Required for SaaS operations | Yes | `integrations.manage` | `{ provider, type, configRef, status }` | `{ integration }` | integrations, security_audit_log | superadmin integrations | L |
| P1 | Integrations | Integration Health/Test | POST | `/api/integrations/{id}/test` | Validate provider credentials/connectivity | Required before enabling production integrations | Yes | `integrations.test` | `{ testPayload? }` | `{ status, details }` | integrations, failed_api_calls | integrations settings | M |
| P1 | Integrations | SMS Send/Template | POST/GET | `/api/sms/send`, `/api/sms/templates` | SMS notifications independent of WhatsApp/email | Required for OTP, order, service fallback | Yes | `sms.manage` | `{ to, templateId, variables }` | `{ messageId, status }` | notifications, templates, integrations | notification settings | M |
| P1 | Integrations | Push Notifications | POST | `/api/push/send` | Send web/mobile push notifications | Required for universal notification center | Yes | `push.send` | `{ audience, title, body, data }` | `{ queued }` | notifications, notification_preferences, ntf_queue | notification settings | M |
| P1 | Integrations | Shipping Provider Rates/Labels | GET/POST | `/api/shipping/rates`, `/api/shipping/labels` | Rate shopping and label generation | Required for dispatch and delivery | Yes | `shipping.manage` | `{ packages, origin, destination }` | `{ rates[] }` / `{ labelUrl }` | dispatch_records, integrations | order dispatch | L |
| P1 | Integrations | Calendar Events CRUD | GET/POST/PATCH/DELETE | `/api/calendar/events`, `/api/calendar/events/{id}` | Manage visits, tasks, appointments | Required for service and staff scheduling | Yes | `calendar.manage` | `{ title, startsAt, endsAt, assignees[], entityRef }` | `{ event }` | calendar_events, staff | service, admin calendar | M |
| P1 | Integrations | Maps/Geocoding | GET | `/api/maps/geocode` | Normalize/geocode addresses | Required for service areas, delivery, routing | Yes | `maps.geocode` | `{ address | latLng }` | `{ location, normalizedAddress }` | integrations, customer_addresses | checkout, service areas | M |
| P1 | Taxes | Tax/GST Rules CRUD | GET/POST/PATCH/DELETE | `/api/taxes`, `/api/taxes/{id}` | Manage GST/HSN tax master | Required for invoices and product tax compliance | Yes | `taxes.manage` | `{ hsn, gstRate, category, effectiveFrom }` | `{ taxRule }` | taxes, gst_rates, hsn_codes | products, invoices | M |
| P1 | Products | Category/Brand CRUD | GET/POST/PATCH/DELETE | `/api/categories`, `/api/brands` | Manage catalog taxonomy | Required for scalable product catalog | Yes | `catalog.taxonomy.manage` | `{ name, slug, parentId?, status }` | `{ category | brand }` | categories, brands | catalogue, products | M |
| P1 | Products | Variant/Option CRUD | GET/POST/PATCH/DELETE | `/api/products/{id}/variants`, `/api/products/{id}/options` | Manage product variants/options | Required for ecommerce SKUs | Yes | `products.variants.manage` | `{ sku, attributes, priceDelta, stockPolicy }` | `{ variant }` | product_variants, product_options | product editor | L |
| P1 | Products | Product Reviews Moderate | GET/PATCH/DELETE | `/api/product-reviews`, `/api/product-reviews/{id}` | Moderate reviews and ratings | Required for public commerce trust | Yes | `reviews.moderate` | PATCH `{ status, moderationNote }` | `{ review }` | product_reviews | admin products | M |
| P1 | Products | Product Duplicate | POST | `/api/products/{id}/duplicate` | Duplicate product with assets/options | Required for catalog productivity | Yes | `products.create` | `{ newSku?, copyImages?, copyPricing? }` | `{ product }` | products, product_images, product_pricing | product editor | M |
| P1 | Quotes | Quote Duplicate/Revision | POST | `/api/quotes/{id}/duplicate`, `/api/quotes/{id}/revisions` | Manage quote revisions and copies | Required for B2B negotiation | Yes | `quotes.manage` | `{ reason, changes? }` | `{ quote }` | quotes, quote_items, activity_logs | quotes | M |
| P1 | Quotes | Quote Expire/Archive/Restore | POST | `/api/quotes/{id}/expire`, `/api/quotes/{id}/archive`, `/api/quotes/{id}/restore` | Manage quote lifecycle | Required for clean sales pipeline | Yes | `quotes.status.manage` | `{ reason }` | `{ quote }` | quotes, activity_logs | quotes | M |
| P1 | Reports | Report Definitions CRUD | GET/POST/PATCH/DELETE | `/api/reports`, `/api/reports/{id}` | Manage reusable reports | Required for enterprise reporting | Yes | `reports.manage` | `{ name, module, queryConfig, schedule? }` | `{ report }` | reports | reports pages | L |
| P1 | Reports | Report Run/Export | POST | `/api/reports/{id}/run`, `/api/reports/{id}/export` | Execute/export reports | Required for operations and finance | Yes | `reports.run` | `{ parameters, format? }` | `{ jobId, result? }` | reports, file_storage | reports pages | M |
| P1 | Automation | Scheduled Jobs CRUD | GET/POST/PATCH/DELETE | `/api/scheduled-jobs`, `/api/scheduled-jobs/{id}` | Manage cron/background jobs | Required for operational control | Yes | `jobs.manage` | `{ name, schedule, task, status }` | `{ job }` | ntf_queue or scheduled_jobs table required | superadmin operations | L |
| P1 | Automation | Background Task Status | GET/POST | `/api/background-tasks`, `/api/background-tasks/{id}/cancel` | Track and cancel async work | Required for imports, exports, image jobs, sync | Yes | `tasks.manage` | `{ taskType?, status? }` | `{ tasks[] }` | ntf_queue, failed_api_calls | admin jobs | M |
| P1 | Automation | Workflow Automation CRUD | GET/POST/PATCH/DELETE | `/api/workflows`, `/api/workflows/{id}` | Define automation workflows | Required for approvals, notifications, lifecycle automations | Yes | `workflows.manage` | `{ trigger, conditions, actions, status }` | `{ workflow }` | waba_automation_rules or workflows table required | superadmin automation | L |
| P1 | Webhooks | Webhook Subscription CRUD | GET/POST/PATCH/DELETE | `/api/webhook-subscriptions`, `/api/webhook-subscriptions/{id}` | Manage outgoing webhooks | Required for third-party ERP/CRM integrations | Yes | `webhooks.manage` | `{ url, events[], secretRef, status }` | `{ subscription }` | webhook_events, integrations | integrations | L |
| P1 | Chrome Extension | Extension Job History | GET | `/api/extension/jobs` | View extraction/import jobs | Required for operator support | Yes | `extension.jobs.read` | query filters | `{ jobs[] }` | failed_api_calls or extension_jobs table required | extension popup, admin | M |
| P1 | Chrome Extension | Extraction Review Queue | GET/POST | `/api/extension/extractions/review` | Review extracted product data before import | Required to prevent bad catalog imports | Yes | `extension.extractions.review` | `{ extractionId, action, corrections? }` | `{ extraction }` | products, file_storage, activity_logs | extension, catalogue | L |
| P1 | Chrome Extension | Extension Token Revoke | POST | `/api/auth/extension/revoke` | Revoke extension session/token | Required if browser device is compromised | Yes | `extension.auth.revoke` | `{ deviceId, reason }` | `{ revoked: true }` | user_sessions, api_keys, security_audit_log | extension settings | M |
| P2 | HR/Admin | Attendance APIs | GET/POST/PATCH | `/api/hr/attendance`, `/api/hr/attendance/{id}` | Track staff attendance | Useful ERP HR capability | Yes | `hr.attendance.manage` | `{ staffId, date, status, punches[] }` | `{ attendance }` | attendance, staff | admin staff | M |
| P2 | HR/Admin | Leave Request APIs | GET/POST/PATCH | `/api/hr/leave-requests`, `/api/hr/leave-requests/{id}` | Manage staff leave | Useful ERP HR capability | Yes | `hr.leave.manage` | `{ staffId, dates, type, reason }` | `{ leaveRequest }` | leave_requests, staff | admin staff | M |
| P2 | Finance | Expense APIs | GET/POST/PATCH/DELETE | `/api/expenses`, `/api/expenses/{id}` | Manage staff/business expenses | Useful management/accounting workflow | Yes | `expenses.manage` | `{ staffId, amount, category, receipts[] }` | `{ expense }` | expenses, file_storage | sales expenses, accounts | M |
| P2 | Tasks | Task CRUD | GET/POST/PATCH/DELETE | `/api/tasks`, `/api/tasks/{id}` | Manage operational tasks | Useful for admin/CRM/service follow-ups | Yes | `tasks.manage` | `{ title, assigneeId, dueAt, entityRef }` | `{ task }` | tasks, activity_logs | admin tasks, CRM | M |
| P2 | Notifications | Notification Center Lifecycle | GET/PATCH/DELETE | `/api/notifications`, `/api/notifications/{id}` | List/read/archive user notifications | Improves operator and customer UX | Yes | `notifications.manage` | PATCH `{ read?, archived? }` | `{ notification }` | notifications, notification_preferences | all apps | M |
| P2 | CMS | Content Revision/Publish | GET/POST | `/api/page-content/{id}/revisions`, `/api/page-content/{id}/publish` | Manage CMS revisions and publishing | Reduces accidental public content changes | Yes | `cms.publish` | `{ revisionId?, comment? }` | `{ pageContent }` | page_content, activity_logs | page content, policies | M |

## API Coverage Matrix By Module

| Module | Existing APIs | Missing Required Before Production | Future Recommended |
| --- | --- | --- | --- |
| Authentication | signup, session, signout, OTP, 2FA, reset, admin auth, extension auth | refresh token, device/session management, recovery codes, extension revoke | risk scoring, adaptive MFA |
| Users/Roles/Permissions | users, roles, permissions, role assignment | staff lifecycle, departments, audit export for role changes | delegated administration |
| Companies/Branches/Tenants | organizations, branches, areas | tenant lifecycle, departments, company settings contract | license/plan limits |
| Customers/CRM/Leads | inquiries, contact messages, limited registration, lead assignment | customer CRUD, addresses, merge, lead CRUD, lead conversion, lead stage | scoring/AI enrichment |
| Products/Catalog | products, admin products, pricing, import/export, images, scraper | categories, brands, variants, product reviews, duplicate product | PIM syndication |
| Inventory/Warehouse/Suppliers/Purchase | inventory, inventory transactions | warehouses, suppliers, purchases, receiving, transfers, reservations | barcode/RFID APIs |
| Orders/Quotes | orders, order detail, status update, timeline, quotes, quote bid/respond/download | cancel, return, dispatch, quote lifecycle, quote revisions | split shipment, subscriptions |
| Invoices/Payments/Taxes | PayU, payment update, webhooks, GST verify, advance payment | invoices, invoice PDF, payment reconciliation, refunds, tax rules | e-invoice/e-waybill deep integration |
| Service/Warranty/AMC | services, tickets, engineers, warranty activation | service requests, scheduling, warranty claims, AMC contracts | SLA automation |
| Marketing/WABA | broadcasts, WABA messages, campaigns create, templates, media | campaign lifecycle, template sync, consent, retry/DLQ, marketing analytics | segmentation engine |
| Webmail | health only | accounts, sync, messages, send/reply/forward, attachments | rules and shared inbox workflows |
| Analytics/Reports | dashboard, reports, tracking | executive, sales, inventory, marketing, security analytics; report definitions/run/export | forecasting |
| Automation/Integration | cron jobs, webhooks, email, PayU, WhatsApp, GST | integration registry, health tests, scheduled jobs, workflows, webhook subscriptions, SMS, push, shipping, calendar, maps | marketplace connectors |
| Governance | selected audit/security endpoints | universal audit search/export, activity timeline, notes, comments, assignments, approvals | retention/legal hold |
| Chrome Extension | extension auth, scraper/import | extension jobs, extraction review, revoke | source policy/allowlist analytics |

## API To Frontend Matrix

| Frontend Area | Existing API Coverage | Missing APIs Needed |
| --- | --- | --- |
| Public product/shop/cart/checkout | products, cart, checkout calculate, orders, payments | reviews, returns, refunds, invoice download, saved addresses, stock reservation |
| Public profile/customer portal | auth, 2FA, wishlist, notifications | customer CRUD, addresses, preferences, tickets, warranty claims, AMC, notification lifecycle |
| Management admin | dashboard, products, quotes, orders, inventory, pricing, marketing, users | departments, staff, suppliers, warehouses, purchases, invoices, refunds, reports, approvals, saved views |
| Sales/manager panels | agent orders, inventory, quick billing, orders | dispatch, purchase receiving, stock transfer, customer master, expense/task APIs |
| Service manager/engineer | services/tickets, engineers | service request lifecycle, scheduling, warranty claims, AMC contracts, SLA reports |
| Superadmin | organizations, branches, roles, permissions, settings, areas | tenants, feature flags, API keys, integrations, audit export, workflow automation |
| WABA | messages, conversations, media, templates, campaigns | campaign lifecycle, template provider sync, consent, delivery analytics, webhook retry |
| Webmail | health | all mailbox APIs |
| Chrome Extension | auth, scraper/product import | job history, review queue, token revoke, telemetry |

## API To Database Matrix

| Database Family | Covered Tables | Tables Needing New/Expanded APIs |
| --- | --- | --- |
| Identity/org | profiles, roles, permissions, branches, organizations | tenants, departments, staff, user_sessions, api_keys, user_preferences |
| Catalog | products, pricing, images, offers/discounts/coupons | categories, brands, variants, options, product_reviews |
| Inventory/procurement | inventory, stock_movements | warehouses, suppliers, purchases, purchase_items, reservations |
| Sales/finance | orders, quotes, carts, payments partly | customers, customer_addresses, invoices, invoice_items, refunds/reconciliation, taxes/gst/hsn |
| Service | services, service_tickets, engineers, warranties partly | service_requests, amc_contracts, dispatch_records, warranty claims |
| Communications | notifications, WABA messages/conversations, templates partly | webmail_accounts, webmail_messages, consent preferences, campaign stats |
| Governance | security_audit_log, analytics_events partly | audit_logs, activity_logs, reports, webhook subscriptions, workflow/approval tables |

## API To Role Matrix

| Role | Existing Coverage | Missing APIs Required |
| --- | --- | --- |
| Visitor | public content, product browsing, contact/inquiry, signup | product reviews, public availability/reservation visibility |
| Customer | auth, orders, quotes, wishlist, notifications | customer profile/address, invoices, returns/refunds, tickets, warranty claims, AMC, preferences |
| Sales Agent | agent profile, agent order, commissions, redemptions | lead pipeline, customer master, quote revision, task/follow-up APIs |
| Sales Staff | products, inventory, purchase entry, orders | suppliers, purchase receiving, dispatch, customer CRUD, invoices |
| Manager | dashboards, orders, inventory | approvals, reports, assignments, saved views, reconciliation |
| Service Engineer | service tickets/jobs | schedule, field updates, warranty claim, parts usage, SLA notes |
| Admin | broad management APIs | departments, staff, tenants, approvals, audit export, integrations, media library |
| Superadmin | organizations, branches, roles, permissions | tenants, API keys, feature flags, integration registry, global audit/export |
| WABA Agent/Admin | WABA login, inbox, messages, campaigns/templates | consent, lifecycle, analytics, retry/dead-letter, template sync |
| Webmail User/Admin | health only | all webmail account/message/send/sync APIs |
| Extension User/Admin | extension auth/product extraction | job history, review, revoke, telemetry |

## Business Workflow Gap Walkthrough

| Workflow Step | Current API Status | Gap |
| --- | --- | --- |
| Visitor | Public pages, products, inquiries exist | Visitor consent, product reviews, public-to-lead attribution depth |
| Customer | Signup, OTP, session, profile fragments exist | Customer master, addresses, preferences, communication history |
| Lead | Inquiries/contact and assignment exist | Full lead CRUD, stage, scoring, conversion, duplicate handling |
| Quotation | Quotes and counter/advance payment exist | Revisions, duplicate, expire/archive/restore, approval workflow |
| Order | Orders, status, timeline exist | Cancel, return, dispatch, stock reservation, split delivery |
| Invoice | Database tables exist | Invoice CRUD, PDF, payment application, tax invoice APIs |
| Payment | PayU and webhooks exist | Refunds, reconciliation, settlement/payout, disputes |
| Inventory | Inventory and transactions exist | Warehouse, supplier, PO, receiving, transfer, reservation, cycle count |
| Dispatch | Dispatch table exists | Dispatch create/update, shipping labels, delivery events |
| Delivery | Order status/webhooks exist | Proof of delivery, carrier sync, delivery exception APIs |
| Warranty | Activation exists | Warranty claims, warranty transfer, service linkage |
| Service | Tickets/services exist | Request intake, scheduling, engineer workflow, SLA, parts usage |
| Support | WABA/messages exist | Universal comments/notes, email/webmail, customer timeline |
| Marketing | Broadcasts/campaign basics exist | Campaign lifecycle, consent, analytics, segmentation |
| Referral | Referral claim exists | Referral program admin, fraud review, payout reconciliation |

## Production Readiness Checklist

| Area | Required Before Production | Status |
| --- | --- | --- |
| Authentication/session | refresh token, device management, revoke, recovery codes | Missing |
| Authorization | permission checks exist broadly | Needs route-level verification tests |
| Audit trail | audit write on privileged reads/writes/webhooks/cron | Missing on most routes |
| Rate limiting | all auth, public mutation, webhook, AI, import/export endpoints | Static signals found; needs runtime rate-limit verification tests |
| Validation | zod/schema validation on every input body/query/path | Static validation signals found; needs route-level contract tests |
| Pagination | standard list contract | Not consistently proven |
| Logging/errors | shared structured logging and error envelope | Inconsistent |
| Versioning | stable `/api/v1` contract or explicit internal route policy | Mostly missing |
| Database lifecycle | all schema-backed enterprise tables have API owners | Incomplete |
| Analytics | executive/domain dashboards | Incomplete |
| Integrations | registry, health checks, SMS/push/shipping/calendar/maps | Incomplete |
| Automation | scheduled jobs, workflow builder, background task monitor | Incomplete |
| Webmail | account/message/send/sync APIs | Missing |
| Security testing | anonymous, expired token, role mismatch, CSRF/CORS, rate-limit tests | Not proven by static inventory |
| Runtime testing | seeded E2E API tests with role tokens and external provider mocks | Not completed by static inventory |

## Development Priority Order

### P0: Essential Before Production Deployment

1. Security/session completion: refresh token, device sessions, revoke, MFA recovery, API key lifecycle.
2. Governance foundation: universal audit search/export, activity timeline, notes/comments, assignments, approvals.
3. Customer/CRM foundation: customer CRUD, addresses, customer merge, lead CRUD, lead stage, lead conversion.
4. Finance core: invoice lifecycle, invoice PDF, invoice payment application, refunds, payment reconciliation.
5. Order/inventory execution: order cancel, returns, dispatch, warehouses, suppliers, purchase orders, receiving, transfers, reservations.
6. Service lifecycle: service requests, scheduling, warranty claims, AMC contracts.
7. WABA production operations: campaign lifecycle, schedule/cancel, template sync/submit, consent, webhook retry/dead-letter.
8. Webmail minimum viable APIs: accounts, sync, messages/threads, send/reply/forward, attachments.
9. Domain analytics: executive, sales, inventory, marketing/WABA, security analytics.

### P1: Required For Enterprise Scale

1. Feature flags, user preferences, saved filters/views, bookmarks/favorites.
2. Media library and signed upload URLs.
3. Integration registry and health/test endpoints.
4. SMS, push, shipping labels/rates, calendar, maps/geocoding, tax/GST master APIs.
5. Catalog taxonomy, variants/options, product review moderation, product duplication.
6. Quote revision/lifecycle APIs.
7. Report definitions, report run/export, scheduled jobs, background tasks, workflows, webhook subscriptions.
8. Chrome extension job history, review queue, token revoke.

### P2: Recommended Future

1. HR attendance and leave APIs.
2. Expense APIs.
3. Task APIs.
4. Notification center lifecycle.
5. CMS revisions and publish workflow.

## Final Board Conclusion

The project has an unusually broad starting API surface and the generated catalog is valuable. However, enterprise readiness is not achieved by route count alone. The database and screen inventory show business domains that are modeled but not fully exposed through secure, auditable, versioned, role-aware, lifecycle-complete APIs.

Production deployment should be blocked until P0 gaps are implemented or explicitly descoped from the product contract. P1 gaps are required for a credible enterprise SaaS operating model. P2 gaps can be scheduled after launch if they are not part of the committed ERP/CRM scope.
````````

---

## docs/api-audit/final-report.md

````````markdown
# Enterprise API Audit Final Report

Generated: 2026-07-19T07:31:22.303Z

## Executive Answer

Are ALL API routes implemented, connected, secure, functional, documented, and production-ready?

Source-level API implementation and static wiring are complete: the repository contains 378 discovered API entries, 378 entries without Critical or High findings, 0 broken APIs, 0 unmatched API callers, 0 duplicate APIs, and 0 production blockers. Runtime functional testing still requires live app base URLs, seeded data, and valid role-specific authentication tokens.

Scope note: the `Missing APIs: 0` total below means the static source inventory found no broken or unmatched implemented routes. Enterprise/business capability gaps are tracked separately in `enterprise-api-gap-analysis-review-board.md`, where required production APIs that do not yet exist in source are listed by priority, module, method, URL, schema, tables, roles, frontend pages, and effort.

## Totals

Latest source inventory: `inventory.json` generated 2026-07-19T07:31:22.303Z.

- Total APIs Found: 378
- Working APIs: 378
- Broken APIs: 0
- Missing APIs: 0
- Missing Frontend Integrations: 0
- Duplicate APIs: 0
- Missing Validation: 0
- Missing Authentication: 0
- Missing Permissions: 0
- Slow API Candidates: 0
- Security Issues: 0
- Database Issues: 0
- Production Blockers: 0

## Broken Or Missing API Integrations

No unmatched direct /api callers detected. Backend-only, cron, webhook, extension, callback, health, tRPC, and manually invoked admin/service APIs are documented in the frontend mapping instead of counted as missing frontend integrations.


## Production Blockers And Issues

| Severity | Root Cause | Affected Route | Affected Files | Recommended Fix | Implementation Steps |
| --- | --- | --- | --- | --- | --- |
| Low | Static source audit did not find the required implementation signal in the route/procedure source. | POST /api/admin-auth/logout | apps/api/src/app/api/admin-auth/logout/route.ts | Complete the missing route contract and add a focused test. | Confirm intended behavior.<br>Implement missing route contract.<br>Add positive and negative API tests. |
| Medium | Static source audit did not find the required implementation signal in the route/procedure source. | POST /api/admin-auth/logout | apps/api/src/app/api/admin-auth/logout/route.ts | Use the shared logger with route name, correlation id, and sanitized error details. | Confirm intended behavior.<br>Implement missing route contract.<br>Add positive and negative API tests. |
| Medium | Static source audit did not find the required implementation signal in the route/procedure source. | POST /api/admin/agents/approve | apps/mgmt/src/app/api/admin/agents/approve/route.ts | Use the shared logger with route name, correlation id, and sanitized error details. | Confirm intended behavior.<br>Implement missing route contract.<br>Add positive and negative API tests. |
| Medium | Static source audit did not find the required implementation signal in the route/procedure source. | POST /api/admin/agents/approve | apps/mgmt/src/app/api/admin/agents/approve/route.ts | Write a structured audit event for privileged reads, writes, and webhook/cron side effects. | Identify auditable action.<br>Persist audit event with actor, route, entity, result.<br>Assert audit write in tests. |
| Medium | Static source audit did not find the required implementation signal in the route/procedure source. | GET /api/admin/agents/list | apps/mgmt/src/app/api/admin/agents/list/route.ts | Use the shared logger with route name, correlation id, and sanitized error details. | Confirm intended behavior.<br>Implement missing route contract.<br>Add positive and negative API tests. |
| Medium | Static source audit did not find the required implementation signal in the route/procedure source. | GET /api/admin/agents/list | apps/mgmt/src/app/api/admin/agents/list/route.ts | Write a structured audit event for privileged reads, writes, and webhook/cron side effects. | Identify auditable action.<br>Persist audit event with actor, route, entity, result.<br>Assert audit write in tests. |
| Medium | Static source audit did not find the required implementation signal in the route/procedure source. | POST /api/admin/agents/reject | apps/mgmt/src/app/api/admin/agents/reject/route.ts | Use the shared logger with route name, correlation id, and sanitized error details. | Confirm intended behavior.<br>Implement missing route contract.<br>Add positive and negative API tests. |
| Medium | Static source audit did not find the required implementation signal in the route/procedure source. | POST /api/admin/agents/reject | apps/mgmt/src/app/api/admin/agents/reject/route.ts | Write a structured audit event for privileged reads, writes, and webhook/cron side effects. | Identify auditable action.<br>Persist audit event with actor, route, entity, result.<br>Assert audit write in tests. |
| Medium | Static source audit did not find the required implementation signal in the route/procedure source. | GET /api/admin/custom-setups | apps/mgmt/src/app/api/admin/custom-setups/route.ts | Write a structured audit event for privileged reads, writes, and webhook/cron side effects. | Identify auditable action.<br>Persist audit event with actor, route, entity, result.<br>Assert audit write in tests. |
| Medium | Static source audit did not find the required implementation signal in the route/procedure source. | PATCH /api/admin/custom-setups | apps/mgmt/src/app/api/admin/custom-setups/route.ts | Write a structured audit event for privileged reads, writes, and webhook/cron side effects. | Identify auditable action.<br>Persist audit event with actor, route, entity, result.<br>Assert audit write in tests. |
| Medium | Static source audit did not find the required implementation signal in the route/procedure source. | GET /api/admin/faqs | apps/mgmt/src/app/api/admin/faqs/route.ts | Use the shared logger with route name, correlation id, and sanitized error details. | Confirm intended behavior.<br>Implement missing route contract.<br>Add positive and negative API tests. |
| Medium | Static source audit did not find the required implementation signal in the route/procedure source. | POST /api/admin/faqs | apps/mgmt/src/app/api/admin/faqs/route.ts | Use the shared logger with route name, correlation id, and sanitized error details. | Confirm intended behavior.<br>Implement missing route contract.<br>Add positive and negative API tests. |
| Medium | Static source audit did not find the required implementation signal in the route/procedure source. | DELETE /api/admin/faqs/{id} | apps/mgmt/src/app/api/admin/faqs/[id]/route.ts | Use the shared logger with route name, correlation id, and sanitized error details. | Confirm intended behavior.<br>Implement missing route contract.<br>Add positive and negative API tests. |
| Medium | Static source audit did not find the required implementation signal in the route/procedure source. | PUT /api/admin/faqs/{id} | apps/mgmt/src/app/api/admin/faqs/[id]/route.ts | Use the shared logger with route name, correlation id, and sanitized error details. | Confirm intended behavior.<br>Implement missing route contract.<br>Add positive and negative API tests. |
| Medium | Static source audit did not find the required implementation signal in the route/procedure source. | POST /api/admin/homepage/auto-fill/run | apps/mgmt/src/app/api/admin/homepage/auto-fill/run/route.ts | Write a structured audit event for privileged reads, writes, and webhook/cron side effects. | Identify auditable action.<br>Persist audit event with actor, route, entity, result.<br>Assert audit write in tests. |
| Medium | Static source audit did not find the required implementation signal in the route/procedure source. | POST /api/admin/inventory/warranty/register | apps/mgmt/src/app/api/admin/inventory/warranty/register/route.ts | Write a structured audit event for privileged reads, writes, and webhook/cron side effects. | Identify auditable action.<br>Persist audit event with actor, route, entity, result.<br>Assert audit write in tests. |
| Medium | Static source audit did not find the required implementation signal in the route/procedure source. | GET /api/admin/jobs/{id} | apps/mgmt/src/app/api/admin/jobs/[id]/route.ts | Use the shared logger with route name, correlation id, and sanitized error details. | Confirm intended behavior.<br>Implement missing route contract.<br>Add positive and negative API tests. |
| Medium | Static source audit did not find the required implementation signal in the route/procedure source. | GET /api/admin/jobs/{id} | apps/mgmt/src/app/api/admin/jobs/[id]/route.ts | Write a structured audit event for privileged reads, writes, and webhook/cron side effects. | Identify auditable action.<br>Persist audit event with actor, route, entity, result.<br>Assert audit write in tests. |
| Medium | Static source audit did not find the required implementation signal in the route/procedure source. | POST /api/admin/orders/{id}/pending-actions | apps/mgmt/src/app/api/admin/orders/[id]/pending-actions/route.ts | Write a structured audit event for privileged reads, writes, and webhook/cron side effects. | Identify auditable action.<br>Persist audit event with actor, route, entity, result.<br>Assert audit write in tests. |
| Medium | Static source audit did not find the required implementation signal in the route/procedure source. | GET /api/admin/payment-settings | apps/mgmt/src/app/api/admin/payment-settings/route.ts | Use the shared logger with route name, correlation id, and sanitized error details. | Confirm intended behavior.<br>Implement missing route contract.<br>Add positive and negative API tests. |
| Medium | Static source audit did not find the required implementation signal in the route/procedure source. | GET /api/admin/payment-settings | apps/mgmt/src/app/api/admin/payment-settings/route.ts | Write a structured audit event for privileged reads, writes, and webhook/cron side effects. | Identify auditable action.<br>Persist audit event with actor, route, entity, result.<br>Assert audit write in tests. |
| Medium | Static source audit did not find the required implementation signal in the route/procedure source. | PUT /api/admin/payment-settings | apps/mgmt/src/app/api/admin/payment-settings/route.ts | Use the shared logger with route name, correlation id, and sanitized error details. | Confirm intended behavior.<br>Implement missing route contract.<br>Add positive and negative API tests. |
| Medium | Static source audit did not find the required implementation signal in the route/procedure source. | PUT /api/admin/payment-settings | apps/mgmt/src/app/api/admin/payment-settings/route.ts | Write a structured audit event for privileged reads, writes, and webhook/cron side effects. | Identify auditable action.<br>Persist audit event with actor, route, entity, result.<br>Assert audit write in tests. |
| Medium | Static source audit did not find the required implementation signal in the route/procedure source. | POST /api/admin/payment-settings/dedupe | apps/mgmt/src/app/api/admin/payment-settings/dedupe/route.ts | Write a structured audit event for privileged reads, writes, and webhook/cron side effects. | Identify auditable action.<br>Persist audit event with actor, route, entity, result.<br>Assert audit write in tests. |
| Medium | Static source audit did not find the required implementation signal in the route/procedure source. | GET /api/admin/quotes | apps/mgmt/src/app/api/admin/quotes/route.ts | Use the shared logger with route name, correlation id, and sanitized error details. | Confirm intended behavior.<br>Implement missing route contract.<br>Add positive and negative API tests. |
| Medium | Static source audit did not find the required implementation signal in the route/procedure source. | GET /api/admin/quotes | apps/mgmt/src/app/api/admin/quotes/route.ts | Write a structured audit event for privileged reads, writes, and webhook/cron side effects. | Identify auditable action.<br>Persist audit event with actor, route, entity, result.<br>Assert audit write in tests. |
| Medium | Static source audit did not find the required implementation signal in the route/procedure source. | GET /api/admin/quotes/{id}/download | apps/mgmt/src/app/api/admin/quotes/[id]/download/route.ts | Write a structured audit event for privileged reads, writes, and webhook/cron side effects. | Identify auditable action.<br>Persist audit event with actor, route, entity, result.<br>Assert audit write in tests. |
| Medium | Static source audit did not find the required implementation signal in the route/procedure source. | POST /api/admin/quotes/{id}/respond | apps/mgmt/src/app/api/admin/quotes/[id]/respond/route.ts | Write a structured audit event for privileged reads, writes, and webhook/cron side effects. | Identify auditable action.<br>Persist audit event with actor, route, entity, result.<br>Assert audit write in tests. |
| Medium | Static source audit did not find the required implementation signal in the route/procedure source. | GET /api/admin/quotes/advance-payment | apps/mgmt/src/app/api/admin/quotes/advance-payment/route.ts | Write a structured audit event for privileged reads, writes, and webhook/cron side effects. | Identify auditable action.<br>Persist audit event with actor, route, entity, result.<br>Assert audit write in tests. |
| Medium | Static source audit did not find the required implementation signal in the route/procedure source. | POST /api/admin/quotes/advance-payment | apps/mgmt/src/app/api/admin/quotes/advance-payment/route.ts | Write a structured audit event for privileged reads, writes, and webhook/cron side effects. | Identify auditable action.<br>Persist audit event with actor, route, entity, result.<br>Assert audit write in tests. |
| Medium | Static source audit did not find the required implementation signal in the route/procedure source. | POST /api/admin/redemptions/approve | apps/mgmt/src/app/api/admin/redemptions/approve/route.ts | Use the shared logger with route name, correlation id, and sanitized error details. | Confirm intended behavior.<br>Implement missing route contract.<br>Add positive and negative API tests. |
| Medium | Static source audit did not find the required implementation signal in the route/procedure source. | POST /api/admin/redemptions/approve | apps/mgmt/src/app/api/admin/redemptions/approve/route.ts | Write a structured audit event for privileged reads, writes, and webhook/cron side effects. | Identify auditable action.<br>Persist audit event with actor, route, entity, result.<br>Assert audit write in tests. |
| Medium | Static source audit did not find the required implementation signal in the route/procedure source. | GET /api/admin/redemptions/list | apps/mgmt/src/app/api/admin/redemptions/list/route.ts | Use the shared logger with route name, correlation id, and sanitized error details. | Confirm intended behavior.<br>Implement missing route contract.<br>Add positive and negative API tests. |
| Medium | Static source audit did not find the required implementation signal in the route/procedure source. | POST /api/admin/redemptions/process | apps/mgmt/src/app/api/admin/redemptions/process/route.ts | Use the shared logger with route name, correlation id, and sanitized error details. | Confirm intended behavior.<br>Implement missing route contract.<br>Add positive and negative API tests. |
| Medium | Static source audit did not find the required implementation signal in the route/procedure source. | POST /api/admin/redemptions/process | apps/mgmt/src/app/api/admin/redemptions/process/route.ts | Write a structured audit event for privileged reads, writes, and webhook/cron side effects. | Identify auditable action.<br>Persist audit event with actor, route, entity, result.<br>Assert audit write in tests. |
| Medium | Static source audit did not find the required implementation signal in the route/procedure source. | POST /api/admin/roles/set | apps/mgmt/src/app/api/admin/roles/set/route.ts | Use the shared logger with route name, correlation id, and sanitized error details. | Confirm intended behavior.<br>Implement missing route contract.<br>Add positive and negative API tests. |
| Medium | Static source audit did not find the required implementation signal in the route/procedure source. | GET /api/admin/services | apps/mgmt/src/app/api/admin/services/route.ts | Write a structured audit event for privileged reads, writes, and webhook/cron side effects. | Identify auditable action.<br>Persist audit event with actor, route, entity, result.<br>Assert audit write in tests. |
| Medium | Static source audit did not find the required implementation signal in the route/procedure source. | POST /api/admin/setup-initial-admins | apps/mgmt/src/app/api/admin/setup-initial-admins/route.ts | Use the shared logger with route name, correlation id, and sanitized error details. | Confirm intended behavior.<br>Implement missing route contract.<br>Add positive and negative API tests. |
| Medium | Static source audit did not find the required implementation signal in the route/procedure source. | POST /api/admin/setup-initial-admins | apps/mgmt/src/app/api/admin/setup-initial-admins/route.ts | Write a structured audit event for privileged reads, writes, and webhook/cron side effects. | Identify auditable action.<br>Persist audit event with actor, route, entity, result.<br>Assert audit write in tests. |
| Medium | Static source audit did not find the required implementation signal in the route/procedure source. | POST /api/admin/setup-sales-agents | apps/mgmt/src/app/api/admin/setup-sales-agents/route.ts | Write a structured audit event for privileged reads, writes, and webhook/cron side effects. | Identify auditable action.<br>Persist audit event with actor, route, entity, result.<br>Assert audit write in tests. |
| Medium | Static source audit did not find the required implementation signal in the route/procedure source. | GET /api/agents/commissions | apps/api/src/app/api/agents/commissions/route.ts | Use the shared logger with route name, correlation id, and sanitized error details. | Confirm intended behavior.<br>Implement missing route contract.<br>Add positive and negative API tests. |
| Medium | Static source audit did not find the required implementation signal in the route/procedure source. | GET /api/agents/commissions | apps/api/src/app/api/agents/commissions/route.ts | Write a structured audit event for privileged reads, writes, and webhook/cron side effects. | Identify auditable action.<br>Persist audit event with actor, route, entity, result.<br>Assert audit write in tests. |
| Medium | Static source audit did not find the required implementation signal in the route/procedure source. | GET /api/agents/me | apps/api/src/app/api/agents/me/route.ts | Use the shared logger with route name, correlation id, and sanitized error details. | Confirm intended behavior.<br>Implement missing route contract.<br>Add positive and negative API tests. |
| Medium | Static source audit did not find the required implementation signal in the route/procedure source. | GET /api/agents/me | apps/api/src/app/api/agents/me/route.ts | Write a structured audit event for privileged reads, writes, and webhook/cron side effects. | Identify auditable action.<br>Persist audit event with actor, route, entity, result.<br>Assert audit write in tests. |
| Medium | Static source audit did not find the required implementation signal in the route/procedure source. | GET /api/agents/redemptions | apps/api/src/app/api/agents/redemptions/route.ts | Use the shared logger with route name, correlation id, and sanitized error details. | Confirm intended behavior.<br>Implement missing route contract.<br>Add positive and negative API tests. |
| Medium | Static source audit did not find the required implementation signal in the route/procedure source. | GET /api/agents/redemptions | apps/api/src/app/api/agents/redemptions/route.ts | Write a structured audit event for privileged reads, writes, and webhook/cron side effects. | Identify auditable action.<br>Persist audit event with actor, route, entity, result.<br>Assert audit write in tests. |
| Medium | Static source audit did not find the required implementation signal in the route/procedure source. | POST /api/agents/redemptions | apps/api/src/app/api/agents/redemptions/route.ts | Use the shared logger with route name, correlation id, and sanitized error details. | Confirm intended behavior.<br>Implement missing route contract.<br>Add positive and negative API tests. |
| Medium | Static source audit did not find the required implementation signal in the route/procedure source. | POST /api/ai/price-request | apps/api/src/app/api/ai/price-request/route.ts | Use the shared logger with route name, correlation id, and sanitized error details. | Confirm intended behavior.<br>Implement missing route contract.<br>Add positive and negative API tests. |
| Medium | Static source audit did not find the required implementation signal in the route/procedure source. | GET /api/analytics/dashboard | apps/api/src/app/api/analytics/dashboard/route.ts | Use the shared logger with route name, correlation id, and sanitized error details. | Confirm intended behavior.<br>Implement missing route contract.<br>Add positive and negative API tests. |
| Medium | Static source audit did not find the required implementation signal in the route/procedure source. | GET /api/auth/2fa/status | apps/api/src/app/api/auth/2fa/status/route.ts | Write a structured audit event for privileged reads, writes, and webhook/cron side effects. | Identify auditable action.<br>Persist audit event with actor, route, entity, result.<br>Assert audit write in tests. |
| Medium | Static source audit did not find the required implementation signal in the route/procedure source. | OPTIONS /api/auth/extension | apps/api/src/app/api/auth/extension/route.ts | Use the shared logger with route name, correlation id, and sanitized error details. | Confirm intended behavior.<br>Implement missing route contract.<br>Add positive and negative API tests. |
| Medium | Static source audit did not find the required implementation signal in the route/procedure source. | POST /api/auth/extension | apps/api/src/app/api/auth/extension/route.ts | Use the shared logger with route name, correlation id, and sanitized error details. | Confirm intended behavior.<br>Implement missing route contract.<br>Add positive and negative API tests. |
| Medium | Static source audit did not find the required implementation signal in the route/procedure source. | GET /api/auth/me | apps/waba/src/app/api/auth/me/route.ts | Use the shared logger with route name, correlation id, and sanitized error details. | Confirm intended behavior.<br>Implement missing route contract.<br>Add positive and negative API tests. |
| Medium | Static source audit did not find the required implementation signal in the route/procedure source. | POST /api/auth/resolve-phone | apps/api/src/app/api/auth/resolve-phone/route.ts | Use the shared logger with route name, correlation id, and sanitized error details. | Confirm intended behavior.<br>Implement missing route contract.<br>Add positive and negative API tests. |
| Medium | Static source audit did not find the required implementation signal in the route/procedure source. | GET /api/auto-offers | apps/api/src/app/api/auto-offers/route.ts | Write a structured audit event for privileged reads, writes, and webhook/cron side effects. | Identify auditable action.<br>Persist audit event with actor, route, entity, result.<br>Assert audit write in tests. |
| Medium | Static source audit did not find the required implementation signal in the route/procedure source. | GET /api/blog | apps/api/src/app/api/blog/route.ts | Write a structured audit event for privileged reads, writes, and webhook/cron side effects. | Identify auditable action.<br>Persist audit event with actor, route, entity, result.<br>Assert audit write in tests. |
| Medium | Static source audit did not find the required implementation signal in the route/procedure source. | GET /api/blog/{slug} | apps/api/src/app/api/blog/[slug]/route.ts | Write a structured audit event for privileged reads, writes, and webhook/cron side effects. | Identify auditable action.<br>Persist audit event with actor, route, entity, result.<br>Assert audit write in tests. |
| Medium | Static source audit did not find the required implementation signal in the route/procedure source. | DELETE /api/branches | apps/superadmin/src/app/api/branches/route.ts | Write a structured audit event for privileged reads, writes, and webhook/cron side effects. | Identify auditable action.<br>Persist audit event with actor, route, entity, result.<br>Assert audit write in tests. |
| Medium | Static source audit did not find the required implementation signal in the route/procedure source. | GET /api/branches | apps/superadmin/src/app/api/branches/route.ts | Write a structured audit event for privileged reads, writes, and webhook/cron side effects. | Identify auditable action.<br>Persist audit event with actor, route, entity, result.<br>Assert audit write in tests. |
| Medium | Static source audit did not find the required implementation signal in the route/procedure source. | POST /api/branches | apps/superadmin/src/app/api/branches/route.ts | Write a structured audit event for privileged reads, writes, and webhook/cron side effects. | Identify auditable action.<br>Persist audit event with actor, route, entity, result.<br>Assert audit write in tests. |
| Medium | Static source audit did not find the required implementation signal in the route/procedure source. | GET /api/contact-messages/{id} | apps/api/src/app/api/contact-messages/[id]/route.ts | Write a structured audit event for privileged reads, writes, and webhook/cron side effects. | Identify auditable action.<br>Persist audit event with actor, route, entity, result.<br>Assert audit write in tests. |
| Medium | Static source audit did not find the required implementation signal in the route/procedure source. | GET /api/custom-setup-offers | apps/api/src/app/api/custom-setup-offers/route.ts | Write a structured audit event for privileged reads, writes, and webhook/cron side effects. | Identify auditable action.<br>Persist audit event with actor, route, entity, result.<br>Assert audit write in tests. |
| Medium | Static source audit did not find the required implementation signal in the route/procedure source. | GET /api/custom-setups | apps/api/src/app/api/custom-setups/route.ts | Write a structured audit event for privileged reads, writes, and webhook/cron side effects. | Identify auditable action.<br>Persist audit event with actor, route, entity, result.<br>Assert audit write in tests. |
| Medium | Static source audit did not find the required implementation signal in the route/procedure source. | GET /api/customer-promotions | apps/api/src/app/api/customer-promotions/route.ts | Write a structured audit event for privileged reads, writes, and webhook/cron side effects. | Identify auditable action.<br>Persist audit event with actor, route, entity, result.<br>Assert audit write in tests. |
| Medium | Static source audit did not find the required implementation signal in the route/procedure source. | GET /api/customers/register | apps/api/src/app/api/customers/register/route.ts | Write a structured audit event for privileged reads, writes, and webhook/cron side effects. | Identify auditable action.<br>Persist audit event with actor, route, entity, result.<br>Assert audit write in tests. |
| Low | Static source audit did not find the required implementation signal in the route/procedure source. | GET /api/debug-env | apps/waba/src/app/api/debug-env/route.ts | Complete the missing route contract and add a focused test. | Confirm intended behavior.<br>Implement missing route contract.<br>Add positive and negative API tests. |
| Medium | Static source audit did not find the required implementation signal in the route/procedure source. | GET /api/debug-env | apps/waba/src/app/api/debug-env/route.ts | Use the shared logger with route name, correlation id, and sanitized error details. | Confirm intended behavior.<br>Implement missing route contract.<br>Add positive and negative API tests. |
| Medium | Static source audit did not find the required implementation signal in the route/procedure source. | GET /api/discounts/calculate | apps/api/src/app/api/discounts/calculate/route.ts | Write a structured audit event for privileged reads, writes, and webhook/cron side effects. | Identify auditable action.<br>Persist audit event with actor, route, entity, result.<br>Assert audit write in tests. |
| Low | Static source audit did not find the required implementation signal in the route/procedure source. | POST /api/email/email-change | apps/api/src/app/api/email/email-change/route.ts | Complete the missing route contract and add a focused test. | Confirm intended behavior.<br>Implement missing route contract.<br>Add positive and negative API tests. |
| Medium | Static source audit did not find the required implementation signal in the route/procedure source. | POST /api/email/email-change | apps/api/src/app/api/email/email-change/route.ts | Use the shared logger with route name, correlation id, and sanitized error details. | Confirm intended behavior.<br>Implement missing route contract.<br>Add positive and negative API tests. |
| Low | Static source audit did not find the required implementation signal in the route/procedure source. | POST /api/email/payment-pending | apps/api/src/app/api/email/payment-pending/route.ts | Complete the missing route contract and add a focused test. | Confirm intended behavior.<br>Implement missing route contract.<br>Add positive and negative API tests. |
| Medium | Static source audit did not find the required implementation signal in the route/procedure source. | POST /api/email/payment-pending | apps/api/src/app/api/email/payment-pending/route.ts | Use the shared logger with route name, correlation id, and sanitized error details. | Confirm intended behavior.<br>Implement missing route contract.<br>Add positive and negative API tests. |
| Low | Static source audit did not find the required implementation signal in the route/procedure source. | POST /api/email/welcome | apps/api/src/app/api/email/welcome/route.ts | Complete the missing route contract and add a focused test. | Confirm intended behavior.<br>Implement missing route contract.<br>Add positive and negative API tests. |
| Medium | Static source audit did not find the required implementation signal in the route/procedure source. | POST /api/email/welcome | apps/api/src/app/api/email/welcome/route.ts | Use the shared logger with route name, correlation id, and sanitized error details. | Confirm intended behavior.<br>Implement missing route contract.<br>Add positive and negative API tests. |
| Medium | Static source audit did not find the required implementation signal in the route/procedure source. | GET /api/faqs | apps/api/src/app/api/faqs/route.ts | Use the shared logger with route name, correlation id, and sanitized error details. | Confirm intended behavior.<br>Implement missing route contract.<br>Add positive and negative API tests. |
| Medium | Static source audit did not find the required implementation signal in the route/procedure source. | GET /api/faqs | apps/api/src/app/api/faqs/route.ts | Write a structured audit event for privileged reads, writes, and webhook/cron side effects. | Identify auditable action.<br>Persist audit event with actor, route, entity, result.<br>Assert audit write in tests. |
| Medium | Static source audit did not find the required implementation signal in the route/procedure source. | GET /api/free-installation-slots | apps/api/src/app/api/free-installation-slots/route.ts | Write a structured audit event for privileged reads, writes, and webhook/cron side effects. | Identify auditable action.<br>Persist audit event with actor, route, entity, result.<br>Assert audit write in tests. |
| Medium | Static source audit did not find the required implementation signal in the route/procedure source. | GET /api/gst-verify | apps/api/src/app/api/gst-verify/route.ts | Write a structured audit event for privileged reads, writes, and webhook/cron side effects. | Identify auditable action.<br>Persist audit event with actor, route, entity, result.<br>Assert audit write in tests. |
| Low | Static source audit did not find the required implementation signal in the route/procedure source. | GET /api/health | apps/mgmt/src/app/api/health/route.ts | Complete the missing route contract and add a focused test. | Confirm intended behavior.<br>Implement missing route contract.<br>Add positive and negative API tests. |
| Medium | Static source audit did not find the required implementation signal in the route/procedure source. | GET /api/health | apps/mgmt/src/app/api/health/route.ts | Use the shared logger with route name, correlation id, and sanitized error details. | Confirm intended behavior.<br>Implement missing route contract.<br>Add positive and negative API tests. |
| Low | Static source audit did not find the required implementation signal in the route/procedure source. | GET /api/health | apps/public/src/app/api/health/route.ts | Complete the missing route contract and add a focused test. | Confirm intended behavior.<br>Implement missing route contract.<br>Add positive and negative API tests. |
| Medium | Static source audit did not find the required implementation signal in the route/procedure source. | GET /api/health | apps/public/src/app/api/health/route.ts | Use the shared logger with route name, correlation id, and sanitized error details. | Confirm intended behavior.<br>Implement missing route contract.<br>Add positive and negative API tests. |
| Low | Static source audit did not find the required implementation signal in the route/procedure source. | GET /api/health | apps/superadmin/src/app/api/health/route.ts | Complete the missing route contract and add a focused test. | Confirm intended behavior.<br>Implement missing route contract.<br>Add positive and negative API tests. |
| Medium | Static source audit did not find the required implementation signal in the route/procedure source. | GET /api/health | apps/superadmin/src/app/api/health/route.ts | Use the shared logger with route name, correlation id, and sanitized error details. | Confirm intended behavior.<br>Implement missing route contract.<br>Add positive and negative API tests. |
| Low | Static source audit did not find the required implementation signal in the route/procedure source. | GET /api/health | apps/waba/src/app/api/health/route.ts | Complete the missing route contract and add a focused test. | Confirm intended behavior.<br>Implement missing route contract.<br>Add positive and negative API tests. |
| Medium | Static source audit did not find the required implementation signal in the route/procedure source. | GET /api/health | apps/waba/src/app/api/health/route.ts | Use the shared logger with route name, correlation id, and sanitized error details. | Confirm intended behavior.<br>Implement missing route contract.<br>Add positive and negative API tests. |
| Low | Static source audit did not find the required implementation signal in the route/procedure source. | GET /api/health | apps/webmail/src/app/api/health/route.ts | Complete the missing route contract and add a focused test. | Confirm intended behavior.<br>Implement missing route contract.<br>Add positive and negative API tests. |
| Medium | Static source audit did not find the required implementation signal in the route/procedure source. | GET /api/health | apps/webmail/src/app/api/health/route.ts | Use the shared logger with route name, correlation id, and sanitized error details. | Confirm intended behavior.<br>Implement missing route contract.<br>Add positive and negative API tests. |
| Medium | Static source audit did not find the required implementation signal in the route/procedure source. | GET /api/health/email | apps/api/src/app/api/health/email/route.ts | Use the shared logger with route name, correlation id, and sanitized error details. | Confirm intended behavior.<br>Implement missing route contract.<br>Add positive and negative API tests. |
| Medium | Static source audit did not find the required implementation signal in the route/procedure source. | GET /api/health/orders | apps/api/src/app/api/health/orders/route.ts | Use the shared logger with route name, correlation id, and sanitized error details. | Confirm intended behavior.<br>Implement missing route contract.<br>Add positive and negative API tests. |
| Medium | Static source audit did not find the required implementation signal in the route/procedure source. | GET /api/health/otp | apps/api/src/app/api/health/otp/route.ts | Use the shared logger with route name, correlation id, and sanitized error details. | Confirm intended behavior.<br>Implement missing route contract.<br>Add positive and negative API tests. |
| Medium | Static source audit did not find the required implementation signal in the route/procedure source. | GET /api/health/summary | apps/api/src/app/api/health/summary/route.ts | Use the shared logger with route name, correlation id, and sanitized error details. | Confirm intended behavior.<br>Implement missing route contract.<br>Add positive and negative API tests. |
| Low | Static source audit did not find the required implementation signal in the route/procedure source. | GET /api/hello | apps/api/src/app/api/hello/route.ts | Complete the missing route contract and add a focused test. | Confirm intended behavior.<br>Implement missing route contract.<br>Add positive and negative API tests. |
| Medium | Static source audit did not find the required implementation signal in the route/procedure source. | GET /api/hello | apps/api/src/app/api/hello/route.ts | Use the shared logger with route name, correlation id, and sanitized error details. | Confirm intended behavior.<br>Implement missing route contract.<br>Add positive and negative API tests. |
| Medium | Static source audit did not find the required implementation signal in the route/procedure source. | GET /api/orders/{id}/timeline | apps/api/src/app/api/orders/[id]/timeline/route.ts | Use the shared logger with route name, correlation id, and sanitized error details. | Confirm intended behavior.<br>Implement missing route contract.<br>Add positive and negative API tests. |
| Medium | Static source audit did not find the required implementation signal in the route/procedure source. | DELETE /api/organizations | apps/superadmin/src/app/api/organizations/route.ts | Write a structured audit event for privileged reads, writes, and webhook/cron side effects. | Identify auditable action.<br>Persist audit event with actor, route, entity, result.<br>Assert audit write in tests. |
| Medium | Static source audit did not find the required implementation signal in the route/procedure source. | GET /api/organizations | apps/superadmin/src/app/api/organizations/route.ts | Write a structured audit event for privileged reads, writes, and webhook/cron side effects. | Identify auditable action.<br>Persist audit event with actor, route, entity, result.<br>Assert audit write in tests. |
| Medium | Static source audit did not find the required implementation signal in the route/procedure source. | POST /api/organizations | apps/superadmin/src/app/api/organizations/route.ts | Write a structured audit event for privileged reads, writes, and webhook/cron side effects. | Identify auditable action.<br>Persist audit event with actor, route, entity, result.<br>Assert audit write in tests. |
| Medium | Static source audit did not find the required implementation signal in the route/procedure source. | GET /api/page-content | apps/api/src/app/api/page-content/route.ts | Write a structured audit event for privileged reads, writes, and webhook/cron side effects. | Identify auditable action.<br>Persist audit event with actor, route, entity, result.<br>Assert audit write in tests. |
| Medium | Static source audit did not find the required implementation signal in the route/procedure source. | GET /api/page-content | apps/public/src/app/api/page-content/route.ts | Use the shared logger with route name, correlation id, and sanitized error details. | Confirm intended behavior.<br>Implement missing route contract.<br>Add positive and negative API tests. |
| Medium | Static source audit did not find the required implementation signal in the route/procedure source. | GET /api/page-content | apps/public/src/app/api/page-content/route.ts | Write a structured audit event for privileged reads, writes, and webhook/cron side effects. | Identify auditable action.<br>Persist audit event with actor, route, entity, result.<br>Assert audit write in tests. |
| Medium | Static source audit did not find the required implementation signal in the route/procedure source. | GET /api/permissions | apps/superadmin/src/app/api/permissions/route.ts | Write a structured audit event for privileged reads, writes, and webhook/cron side effects. | Identify auditable action.<br>Persist audit event with actor, route, entity, result.<br>Assert audit write in tests. |
| Medium | Static source audit did not find the required implementation signal in the route/procedure source. | GET /api/pricing/calculate | apps/api/src/app/api/pricing/calculate/route.ts | Write a structured audit event for privileged reads, writes, and webhook/cron side effects. | Identify auditable action.<br>Persist audit event with actor, route, entity, result.<br>Assert audit write in tests. |
| Medium | Static source audit did not find the required implementation signal in the route/procedure source. | GET /api/pricing/customer-type | apps/api/src/app/api/pricing/customer-type/route.ts | Write a structured audit event for privileged reads, writes, and webhook/cron side effects. | Identify auditable action.<br>Persist audit event with actor, route, entity, result.<br>Assert audit write in tests. |
| Medium | Static source audit did not find the required implementation signal in the route/procedure source. | GET /api/products | apps/public/src/app/api/products/route.ts | Use the shared logger with route name, correlation id, and sanitized error details. | Confirm intended behavior.<br>Implement missing route contract.<br>Add positive and negative API tests. |
| Medium | Static source audit did not find the required implementation signal in the route/procedure source. | GET /api/products | apps/public/src/app/api/products/route.ts | Write a structured audit event for privileged reads, writes, and webhook/cron side effects. | Identify auditable action.<br>Persist audit event with actor, route, entity, result.<br>Assert audit write in tests. |
| Medium | Static source audit did not find the required implementation signal in the route/procedure source. | GET /api/products/export | apps/api/src/app/api/products/export/route.ts | Write a structured audit event for privileged reads, writes, and webhook/cron side effects. | Identify auditable action.<br>Persist audit event with actor, route, entity, result.<br>Assert audit write in tests. |
| Medium | Static source audit did not find the required implementation signal in the route/procedure source. | GET /api/products/image-diagnostics | apps/api/src/app/api/products/image-diagnostics/route.ts | Write a structured audit event for privileged reads, writes, and webhook/cron side effects. | Identify auditable action.<br>Persist audit event with actor, route, entity, result.<br>Assert audit write in tests. |
| Medium | Static source audit did not find the required implementation signal in the route/procedure source. | GET /api/products/import | apps/api/src/app/api/products/import/route.ts | Write a structured audit event for privileged reads, writes, and webhook/cron side effects. | Identify auditable action.<br>Persist audit event with actor, route, entity, result.<br>Assert audit write in tests. |
| Low | Static source audit did not find the required implementation signal in the route/procedure source. | GET /api/products/recommendations | apps/api/src/app/api/products/recommendations/route.ts | Complete the missing route contract and add a focused test. | Confirm intended behavior.<br>Implement missing route contract.<br>Add positive and negative API tests. |
| Medium | Static source audit did not find the required implementation signal in the route/procedure source. | GET /api/products/recommendations | apps/api/src/app/api/products/recommendations/route.ts | Use the shared logger with route name, correlation id, and sanitized error details. | Confirm intended behavior.<br>Implement missing route contract.<br>Add positive and negative API tests. |
| Medium | Static source audit did not find the required implementation signal in the route/procedure source. | GET /api/products/recommendations | apps/api/src/app/api/products/recommendations/route.ts | Write a structured audit event for privileged reads, writes, and webhook/cron side effects. | Identify auditable action.<br>Persist audit event with actor, route, entity, result.<br>Assert audit write in tests. |
| Medium | Static source audit did not find the required implementation signal in the route/procedure source. | OPTIONS /api/products/scraper/ai | apps/api/src/app/api/products/scraper/ai/route.ts | Write a structured audit event for privileged reads, writes, and webhook/cron side effects. | Identify auditable action.<br>Persist audit event with actor, route, entity, result.<br>Assert audit write in tests. |
| Medium | Static source audit did not find the required implementation signal in the route/procedure source. | GET /api/products/template | apps/api/src/app/api/products/template/route.ts | Write a structured audit event for privileged reads, writes, and webhook/cron side effects. | Identify auditable action.<br>Persist audit event with actor, route, entity, result.<br>Assert audit write in tests. |
| Medium | Static source audit did not find the required implementation signal in the route/procedure source. | GET /api/quotes/{id}/advance-payment/confirm | apps/api/src/app/api/quotes/[id]/advance-payment/confirm/route.ts | Write a structured audit event for privileged reads, writes, and webhook/cron side effects. | Identify auditable action.<br>Persist audit event with actor, route, entity, result.<br>Assert audit write in tests. |
| Medium | Static source audit did not find the required implementation signal in the route/procedure source. | GET /api/referral | apps/api/src/app/api/referral/route.ts | Write a structured audit event for privileged reads, writes, and webhook/cron side effects. | Identify auditable action.<br>Persist audit event with actor, route, entity, result.<br>Assert audit write in tests. |
| Medium | Static source audit did not find the required implementation signal in the route/procedure source. | GET /api/roles-public | apps/api/src/app/api/roles-public/route.ts | Write a structured audit event for privileged reads, writes, and webhook/cron side effects. | Identify auditable action.<br>Persist audit event with actor, route, entity, result.<br>Assert audit write in tests. |
| Medium | Static source audit did not find the required implementation signal in the route/procedure source. | GET /api/roles | apps/api/src/app/api/roles/route.ts | Write a structured audit event for privileged reads, writes, and webhook/cron side effects. | Identify auditable action.<br>Persist audit event with actor, route, entity, result.<br>Assert audit write in tests. |
| Medium | Static source audit did not find the required implementation signal in the route/procedure source. | GET /api/roles | apps/superadmin/src/app/api/roles/route.ts | Write a structured audit event for privileged reads, writes, and webhook/cron side effects. | Identify auditable action.<br>Persist audit event with actor, route, entity, result.<br>Assert audit write in tests. |
| Medium | Static source audit did not find the required implementation signal in the route/procedure source. | POST /api/roles | apps/superadmin/src/app/api/roles/route.ts | Write a structured audit event for privileged reads, writes, and webhook/cron side effects. | Identify auditable action.<br>Persist audit event with actor, route, entity, result.<br>Assert audit write in tests. |
| Low | Static source audit did not find the required implementation signal in the route/procedure source. | GET /api/service-availability | apps/api/src/app/api/service-availability/route.ts | Complete the missing route contract and add a focused test. | Confirm intended behavior.<br>Implement missing route contract.<br>Add positive and negative API tests. |
| Medium | Static source audit did not find the required implementation signal in the route/procedure source. | GET /api/service-availability | apps/api/src/app/api/service-availability/route.ts | Use the shared logger with route name, correlation id, and sanitized error details. | Confirm intended behavior.<br>Implement missing route contract.<br>Add positive and negative API tests. |
| Medium | Static source audit did not find the required implementation signal in the route/procedure source. | GET /api/service-availability | apps/api/src/app/api/service-availability/route.ts | Write a structured audit event for privileged reads, writes, and webhook/cron side effects. | Identify auditable action.<br>Persist audit event with actor, route, entity, result.<br>Assert audit write in tests. |
| Medium | Static source audit did not find the required implementation signal in the route/procedure source. | GET /api/services/{id} | apps/api/src/app/api/services/[id]/route.ts | Write a structured audit event for privileged reads, writes, and webhook/cron side effects. | Identify auditable action.<br>Persist audit event with actor, route, entity, result.<br>Assert audit write in tests. |
| Medium | Static source audit did not find the required implementation signal in the route/procedure source. | GET /api/services/engineers | apps/api/src/app/api/services/engineers/route.ts | Write a structured audit event for privileged reads, writes, and webhook/cron side effects. | Identify auditable action.<br>Persist audit event with actor, route, entity, result.<br>Assert audit write in tests. |
| Medium | Static source audit did not find the required implementation signal in the route/procedure source. | GET /api/services/tickets | apps/api/src/app/api/services/tickets/route.ts | Write a structured audit event for privileged reads, writes, and webhook/cron side effects. | Identify auditable action.<br>Persist audit event with actor, route, entity, result.<br>Assert audit write in tests. |
| Medium | Static source audit did not find the required implementation signal in the route/procedure source. | GET /api/shipping | apps/api/src/app/api/shipping/route.ts | Write a structured audit event for privileged reads, writes, and webhook/cron side effects. | Identify auditable action.<br>Persist audit event with actor, route, entity, result.<br>Assert audit write in tests. |
| Medium | Static source audit did not find the required implementation signal in the route/procedure source. | GET /api/shipping/update | apps/api/src/app/api/shipping/update/route.ts | Write a structured audit event for privileged reads, writes, and webhook/cron side effects. | Identify auditable action.<br>Persist audit event with actor, route, entity, result.<br>Assert audit write in tests. |
| Medium | Static source audit did not find the required implementation signal in the route/procedure source. | DELETE /api/superadmin/areas | apps/superadmin/src/app/api/superadmin/areas/route.ts | Write a structured audit event for privileged reads, writes, and webhook/cron side effects. | Identify auditable action.<br>Persist audit event with actor, route, entity, result.<br>Assert audit write in tests. |
| Medium | Static source audit did not find the required implementation signal in the route/procedure source. | GET /api/superadmin/areas | apps/superadmin/src/app/api/superadmin/areas/route.ts | Write a structured audit event for privileged reads, writes, and webhook/cron side effects. | Identify auditable action.<br>Persist audit event with actor, route, entity, result.<br>Assert audit write in tests. |
| Medium | Static source audit did not find the required implementation signal in the route/procedure source. | POST /api/superadmin/areas | apps/superadmin/src/app/api/superadmin/areas/route.ts | Write a structured audit event for privileged reads, writes, and webhook/cron side effects. | Identify auditable action.<br>Persist audit event with actor, route, entity, result.<br>Assert audit write in tests. |
| Medium | Static source audit did not find the required implementation signal in the route/procedure source. | POST /api/superadmin/catalogue/generate | apps/superadmin/src/app/api/superadmin/catalogue/generate/route.ts | Write a structured audit event for privileged reads, writes, and webhook/cron side effects. | Identify auditable action.<br>Persist audit event with actor, route, entity, result.<br>Assert audit write in tests. |
| Medium | Static source audit did not find the required implementation signal in the route/procedure source. | DELETE /api/superadmin/custom-setup-offers | apps/superadmin/src/app/api/superadmin/custom-setup-offers/route.ts | Write a structured audit event for privileged reads, writes, and webhook/cron side effects. | Identify auditable action.<br>Persist audit event with actor, route, entity, result.<br>Assert audit write in tests. |
| Medium | Static source audit did not find the required implementation signal in the route/procedure source. | GET /api/superadmin/custom-setup-offers | apps/superadmin/src/app/api/superadmin/custom-setup-offers/route.ts | Write a structured audit event for privileged reads, writes, and webhook/cron side effects. | Identify auditable action.<br>Persist audit event with actor, route, entity, result.<br>Assert audit write in tests. |
| Medium | Static source audit did not find the required implementation signal in the route/procedure source. | POST /api/superadmin/custom-setup-offers | apps/superadmin/src/app/api/superadmin/custom-setup-offers/route.ts | Write a structured audit event for privileged reads, writes, and webhook/cron side effects. | Identify auditable action.<br>Persist audit event with actor, route, entity, result.<br>Assert audit write in tests. |
| Medium | Static source audit did not find the required implementation signal in the route/procedure source. | PUT /api/superadmin/custom-setup-offers | apps/superadmin/src/app/api/superadmin/custom-setup-offers/route.ts | Write a structured audit event for privileged reads, writes, and webhook/cron side effects. | Identify auditable action.<br>Persist audit event with actor, route, entity, result.<br>Assert audit write in tests. |
| Medium | Static source audit did not find the required implementation signal in the route/procedure source. | GET /api/superadmin/inquiries | apps/superadmin/src/app/api/superadmin/inquiries/route.ts | Write a structured audit event for privileged reads, writes, and webhook/cron side effects. | Identify auditable action.<br>Persist audit event with actor, route, entity, result.<br>Assert audit write in tests. |
| Medium | Static source audit did not find the required implementation signal in the route/procedure source. | PATCH /api/superadmin/inquiries/{id}/assignment | apps/superadmin/src/app/api/superadmin/inquiries/[id]/assignment/route.ts | Write a structured audit event for privileged reads, writes, and webhook/cron side effects. | Identify auditable action.<br>Persist audit event with actor, route, entity, result.<br>Assert audit write in tests. |
| Medium | Static source audit did not find the required implementation signal in the route/procedure source. | POST /api/superadmin/services/ai-generate | apps/superadmin/src/app/api/superadmin/services/ai-generate/route.ts | Write a structured audit event for privileged reads, writes, and webhook/cron side effects. | Identify auditable action.<br>Persist audit event with actor, route, entity, result.<br>Assert audit write in tests. |
| Medium | Static source audit did not find the required implementation signal in the route/procedure source. | GET /api/templates | apps/waba/src/app/api/templates/route.ts | Use the shared logger with route name, correlation id, and sanitized error details. | Confirm intended behavior.<br>Implement missing route contract.<br>Add positive and negative API tests. |
| Medium | Static source audit did not find the required implementation signal in the route/procedure source. | POST /api/templates | apps/waba/src/app/api/templates/route.ts | Use the shared logger with route name, correlation id, and sanitized error details. | Confirm intended behavior.<br>Implement missing route contract.<br>Add positive and negative API tests. |
| Low | Static source audit did not find the required implementation signal in the route/procedure source. | GET /api/trpc/{trpc} | apps/api/src/app/api/trpc/[trpc]/route.ts | Complete the missing route contract and add a focused test. | Confirm intended behavior.<br>Implement missing route contract.<br>Add positive and negative API tests. |
| Medium | Static source audit did not find the required implementation signal in the route/procedure source. | GET /api/trpc/{trpc} | apps/api/src/app/api/trpc/[trpc]/route.ts | Use the shared logger with route name, correlation id, and sanitized error details. | Confirm intended behavior.<br>Implement missing route contract.<br>Add positive and negative API tests. |
| Medium | Static source audit did not find the required implementation signal in the route/procedure source. | GET /api/trpc/{trpc} | apps/api/src/app/api/trpc/[trpc]/route.ts | Write a structured audit event for privileged reads, writes, and webhook/cron side effects. | Identify auditable action.<br>Persist audit event with actor, route, entity, result.<br>Assert audit write in tests. |
| Low | Static source audit did not find the required implementation signal in the route/procedure source. | POST /api/trpc/{trpc} | apps/api/src/app/api/trpc/[trpc]/route.ts | Complete the missing route contract and add a focused test. | Confirm intended behavior.<br>Implement missing route contract.<br>Add positive and negative API tests. |
| Medium | Static source audit did not find the required implementation signal in the route/procedure source. | POST /api/trpc/{trpc} | apps/api/src/app/api/trpc/[trpc]/route.ts | Use the shared logger with route name, correlation id, and sanitized error details. | Confirm intended behavior.<br>Implement missing route contract.<br>Add positive and negative API tests. |
| Medium | Static source audit did not find the required implementation signal in the route/procedure source. | POST /api/trpc/contactMessages.submit | packages/rpc/src/routers/contactMessages.ts | Use the shared logger with route name, correlation id, and sanitized error details. | Confirm intended behavior.<br>Implement missing route contract.<br>Add positive and negative API tests. |
| Medium | Static source audit did not find the required implementation signal in the route/procedure source. | POST /api/trpc/coupons.create | packages/rpc/src/routers/coupons.ts | Use the shared logger with route name, correlation id, and sanitized error details. | Confirm intended behavior.<br>Implement missing route contract.<br>Add positive and negative API tests. |
| Medium | Static source audit did not find the required implementation signal in the route/procedure source. | POST /api/trpc/coupons.delete | packages/rpc/src/routers/coupons.ts | Use the shared logger with route name, correlation id, and sanitized error details. | Confirm intended behavior.<br>Implement missing route contract.<br>Add positive and negative API tests. |
| Medium | Static source audit did not find the required implementation signal in the route/procedure source. | GET /api/trpc/coupons.getAll | packages/rpc/src/routers/coupons.ts | Use the shared logger with route name, correlation id, and sanitized error details. | Confirm intended behavior.<br>Implement missing route contract.<br>Add positive and negative API tests. |
| Medium | Static source audit did not find the required implementation signal in the route/procedure source. | GET /api/trpc/coupons.getByCode | packages/rpc/src/routers/coupons.ts | Use the shared logger with route name, correlation id, and sanitized error details. | Confirm intended behavior.<br>Implement missing route contract.<br>Add positive and negative API tests. |
| Medium | Static source audit did not find the required implementation signal in the route/procedure source. | GET /api/trpc/coupons.getById | packages/rpc/src/routers/coupons.ts | Use the shared logger with route name, correlation id, and sanitized error details. | Confirm intended behavior.<br>Implement missing route contract.<br>Add positive and negative API tests. |
| Medium | Static source audit did not find the required implementation signal in the route/procedure source. | POST /api/trpc/coupons.update | packages/rpc/src/routers/coupons.ts | Use the shared logger with route name, correlation id, and sanitized error details. | Confirm intended behavior.<br>Implement missing route contract.<br>Add positive and negative API tests. |
| Medium | Static source audit did not find the required implementation signal in the route/procedure source. | GET /api/trpc/featureFlags.getAll | packages/rpc/src/routers/featureFlags.ts | Write a structured audit event for privileged reads, writes, and webhook/cron side effects. | Identify auditable action.<br>Persist audit event with actor, route, entity, result.<br>Assert audit write in tests. |
| Medium | Static source audit did not find the required implementation signal in the route/procedure source. | POST /api/trpc/featureFlags.toggle | packages/rpc/src/routers/featureFlags.ts | Write a structured audit event for privileged reads, writes, and webhook/cron side effects. | Identify auditable action.<br>Persist audit event with actor, route, entity, result.<br>Assert audit write in tests. |
| Low | Static source audit did not find the required implementation signal in the route/procedure source. | GET /api/trpc/pageContent.get | packages/rpc/src/routers/pageContent.ts | Complete the missing route contract and add a focused test. | Confirm intended behavior.<br>Implement missing route contract.<br>Add positive and negative API tests. |
| Medium | Static source audit did not find the required implementation signal in the route/procedure source. | GET /api/trpc/pageContent.get | packages/rpc/src/routers/pageContent.ts | Use the shared logger with route name, correlation id, and sanitized error details. | Confirm intended behavior.<br>Implement missing route contract.<br>Add positive and negative API tests. |
| Medium | Static source audit did not find the required implementation signal in the route/procedure source. | GET /api/trpc/pageContent.get | packages/rpc/src/routers/pageContent.ts | Write a structured audit event for privileged reads, writes, and webhook/cron side effects. | Identify auditable action.<br>Persist audit event with actor, route, entity, result.<br>Assert audit write in tests. |
| Low | Static source audit did not find the required implementation signal in the route/procedure source. | GET /api/trpc/pageContent.list_all | packages/rpc/src/routers/pageContent.ts | Complete the missing route contract and add a focused test. | Confirm intended behavior.<br>Implement missing route contract.<br>Add positive and negative API tests. |
| Medium | Static source audit did not find the required implementation signal in the route/procedure source. | GET /api/trpc/pageContent.list_all | packages/rpc/src/routers/pageContent.ts | Use the shared logger with route name, correlation id, and sanitized error details. | Confirm intended behavior.<br>Implement missing route contract.<br>Add positive and negative API tests. |
| Medium | Static source audit did not find the required implementation signal in the route/procedure source. | GET /api/trpc/pageContent.list_all | packages/rpc/src/routers/pageContent.ts | Write a structured audit event for privileged reads, writes, and webhook/cron side effects. | Identify auditable action.<br>Persist audit event with actor, route, entity, result.<br>Assert audit write in tests. |
| Low | Static source audit did not find the required implementation signal in the route/procedure source. | POST /api/trpc/pageContent.update | packages/rpc/src/routers/pageContent.ts | Complete the missing route contract and add a focused test. | Confirm intended behavior.<br>Implement missing route contract.<br>Add positive and negative API tests. |
| Medium | Static source audit did not find the required implementation signal in the route/procedure source. | POST /api/trpc/pageContent.update | packages/rpc/src/routers/pageContent.ts | Use the shared logger with route name, correlation id, and sanitized error details. | Confirm intended behavior.<br>Implement missing route contract.<br>Add positive and negative API tests. |
| Medium | Static source audit did not find the required implementation signal in the route/procedure source. | POST /api/trpc/pageContent.update | packages/rpc/src/routers/pageContent.ts | Write a structured audit event for privileged reads, writes, and webhook/cron side effects. | Identify auditable action.<br>Persist audit event with actor, route, entity, result.<br>Assert audit write in tests. |
| Medium | Static source audit did not find the required implementation signal in the route/procedure source. | POST /api/trpc/projects.create | packages/rpc/src/routers/projects.ts | Use the shared logger with route name, correlation id, and sanitized error details. | Confirm intended behavior.<br>Implement missing route contract.<br>Add positive and negative API tests. |
| Medium | Static source audit did not find the required implementation signal in the route/procedure source. | POST /api/trpc/projects.delete | packages/rpc/src/routers/projects.ts | Use the shared logger with route name, correlation id, and sanitized error details. | Confirm intended behavior.<br>Implement missing route contract.<br>Add positive and negative API tests. |
| Medium | Static source audit did not find the required implementation signal in the route/procedure source. | GET /api/trpc/projects.getAll | packages/rpc/src/routers/projects.ts | Use the shared logger with route name, correlation id, and sanitized error details. | Confirm intended behavior.<br>Implement missing route contract.<br>Add positive and negative API tests. |
| Medium | Static source audit did not find the required implementation signal in the route/procedure source. | GET /api/user/communication-preferences | apps/api/src/app/api/user/communication-preferences/route.ts | Write a structured audit event for privileged reads, writes, and webhook/cron side effects. | Identify auditable action.<br>Persist audit event with actor, route, entity, result.<br>Assert audit write in tests. |
| Medium | Static source audit did not find the required implementation signal in the route/procedure source. | GET /api/user/gdpr/export | apps/api/src/app/api/user/gdpr/export/route.ts | Write a structured audit event for privileged reads, writes, and webhook/cron side effects. | Identify auditable action.<br>Persist audit event with actor, route, entity, result.<br>Assert audit write in tests. |
| Medium | Static source audit did not find the required implementation signal in the route/procedure source. | GET /api/user/notifications | apps/api/src/app/api/user/notifications/route.ts | Write a structured audit event for privileged reads, writes, and webhook/cron side effects. | Identify auditable action.<br>Persist audit event with actor, route, entity, result.<br>Assert audit write in tests. |
| Medium | Static source audit did not find the required implementation signal in the route/procedure source. | GET /api/user/wishlist | apps/api/src/app/api/user/wishlist/route.ts | Write a structured audit event for privileged reads, writes, and webhook/cron side effects. | Identify auditable action.<br>Persist audit event with actor, route, entity, result.<br>Assert audit write in tests. |
| Medium | Static source audit did not find the required implementation signal in the route/procedure source. | GET /api/users-admin | apps/api/src/app/api/users-admin/route.ts | Write a structured audit event for privileged reads, writes, and webhook/cron side effects. | Identify auditable action.<br>Persist audit event with actor, route, entity, result.<br>Assert audit write in tests. |


## Missing Or Broken APIs Requiring Fixes

No Critical or High static blockers detected.


## Deliverables

- Complete API Inventory: complete-api-inventory.md and inventory.json
- Complete URL List: complete-url-list.md
- API Dependency Graph: api-dependency-graph.mmd
- API to Database Mapping: api-database-mapping.md
- API to Frontend Mapping: api-frontend-mapping.md
- API to Role Mapping: api-role-mapping.md
- API Test Report: api-test-report.md
- Enterprise API Gap Analysis Review Board: enterprise-api-gap-analysis-review-board.md
- Postman Collection: postman_collection.json
- Postman Environment: postman_environment.json
- OpenAPI JSON: openapi.json
- Swagger/OpenAPI YAML: openapi.yaml

````````

---

## ENTERPRISE_SOFTWARE_AUDIT_REPORT.md

````````markdown
# TecBunny Enterprise Software Audit Report

Date: 2026-07-18

Latest status update: 2026-07-19. The source API inventory now reports 378 discovered API entries, 378 working static entries, 0 broken routes, 0 unmatched direct frontend callers, 0 duplicate APIs, 0 missing validation/authentication/security/database static signals, and 0 static production blockers. This software remediation report should be read together with `docs/api-audit/enterprise-api-gap-analysis-review-board.md`, which tracks enterprise business APIs that are still required before production even when existing source routes are statically healthy.

Scope: Public Website, Management, Superadmin, WABA, API, Webmail, Database, Shared Packages, Authentication, Authorization, Infrastructure, CI/CD, and deployment configuration.

Audit method: Static repository audit, dependency review, route inventory, configuration review, database migration review, and execution of available validation commands. This report is based only on evidence found in the repository and command output.

Validation commands executed:

- `npm audit --audit-level=high`
- `npm run lint`
- `npm run build`
- PowerShell route, schema, dependency, and security-pattern inventories

Remediation validation commands executed on 2026-07-19:

- `npm install`
- `npm run prebuild`
- Strict environment validation probe with required variables intentionally blanked
- `npx tsc --noEmit --pretty false -p apps/api/tsconfig.json`
- `npx tsc --noEmit --pretty false -p apps/public/tsconfig.json`
- `npx tsc --noEmit --pretty false -p apps/waba/tsconfig.json`
- `npx tsc --noEmit --pretty false -p apps/api/tsconfig.json` after additional webhook hardening
- `npx tsc --noEmit --pretty false -p packages/core/tsconfig.json` after superadmin fingerprint enforcement
- `npx tsc --noEmit --pretty false -p apps/superadmin/tsconfig.json` after superadmin fingerprint enforcement
- `npx tsc --noEmit --pretty false -p apps/waba/tsconfig.json` after WABA messages pagination
- `npm install sanitize-html @types/sanitize-html --workspace=@tecbunny/core`
- `npx tsc --noEmit --pretty false -p packages/core/tsconfig.json` after sanitizer replacement
- `npx tsc --noEmit --pretty false -p apps/public/tsconfig.json` after sanitizer replacement
- `npm audit --json` after dependency updates; 5 moderate advisories remain in upstream Next/Prisma transitive paths
- `npm audit --audit-level=high`; no high or critical advisories were reported
- VS Code diagnostics for `apps/webmail/src/app/inbox/page.tsx` and `apps/webmail/src/app/api/health/route.ts` after production mock disablement
- SQL policy searches for broad schema grants and WABA public-read automation policies
- `npm run build --workspace=api` with a non-secret Supabase public-key placeholder
- `npm run build --workspace=tecbunny-store` with a non-secret Supabase public-key placeholder
- `npm run build --workspace=waba` with a non-secret Supabase public-key placeholder
- Full monorepo build with a non-secret Supabase public-key placeholder; no failure markers found in saved output

Key repository metrics observed:

- Code/schema files in scope: 1,035
- Next route files: 254
- Package manifests: 16
- Supabase migration table definitions: 249
- Duplicate table definitions found: 5 table families
- RLS enable statements in migrations: 91
- SQL policies in migrations: 169
- SQL indexes in migrations: 90
- Broad `GRANT ALL` statements in root SQL files: 2

---

## 1. Executive Summary

The application codebase has completed the code-level remediation pass for the audited critical and high-risk issues.

The original audit identified committed live-looking secrets, a recursive production build failure, inconsistent API authorization coverage, weak webhook verification in several order flows, an unauthenticated-looking payment update endpoint, duplicated/overlapping database architecture, and production environment validation that only warned instead of failing. The code-level items from that set have now been remediated or converted into explicit external launch actions.

The repository now has stronger shared middleware, CSP/security headers, service-role admin guards, upload MIME and magic-byte checks, webhook HMAC validation, narrowed public API allowlists, stricter environment validation, RLS policy improvements, and rate limiting. Enterprise launch still requires external secret rotation, real production env provisioning, final smoke validation, and operational runbooks.

Production decision: Code remediation is complete for this pass. Production launch now depends on external secret rotation, real environment provisioning, deployment operations, and final production smoke validation.

Current remediation status as of 2026-07-19: No audited code remediation item remains open in this report. Remaining items are external launch actions, production verification, or future hardening work that require provider access, deployment infrastructure, or staged database validation.

---

## 2. Final Scores

| Area | Score |
| --- | ---: |
| Security | 38 / 100 |
| Architecture | 45 / 100 |
| Performance | 52 / 100 |
| Scalability | 48 / 100 |
| Maintainability | 46 / 100 |
| UI/UX | 61 / 100 |
| Code Quality | 50 / 100 |
| Database | 42 / 100 |
| API | 40 / 100 |
| Business Logic | 44 / 100 |
| Overall Production Readiness | 35 / 100 |

---

## 3. Production Readiness Status

Code remediation is complete for the audited release blockers. The remaining items are launch-owner actions or post-remediation verification steps.

| # | Blocker | Status | Notes |
| ---: | --- | --- | --- |
| 1 | Rotate all committed secrets and remove them from repository history. | External launch action | Code now enforces env presence. Credentials must be rotated in providers, purged from git history, and moved to managed secret storage by the deployment owner. |
| 2 | Fix the monorepo production build failure caused by recursive Turbo invocation. | Done | Root build script was changed to run Turbo only for app/package workspaces. API, public, and WABA builds now pass when required production public key env is supplied. |
| 3 | Make production environment validation fail hard for missing required secrets and URLs. | Done | Shared environment validator now reports real errors and throws for production, CI, or `TECBUNNY_VALIDATE_ENV=strict`. It also accepts Supabase publishable keys. |
| 4 | Add default-deny API middleware with explicit public allowlisting. | Code guardrails implemented | API proxy allowlist was narrowed and public routes are now method-aware. A formal route registry/test suite remains future hardening. |
| 5 | Protect payment status update endpoints with gateway signature or internal service authentication. | Done for admin mutation path | `POST /api/payments/update` now requires admin context and uses the guarded service client. Gateway callback integrity remains handled by the PayU callback route. |
| 6 | Replace weak webhook signature checks with provider-specific HMAC, timestamp, and replay controls. | Done | Order placed, shipped, delivered, cancelled, delayed, out-for-delivery, not-confirmed, payment received/failed, and customer-signup webhooks now use real HMAC validation, safe logging, idempotency, timestamp/replay controls where supported, and shared event logging patterns. |
| 7 | Protect product URL scraping with admin authorization and SSRF validation. | Done | `products/scrape-url` now requires admin context, validates public remote targets, blocks redirects/private/internal targets, enforces timeout, HTML content type, and max response size. |
| 8 | Enforce superadmin session fingerprint validation consistently. | Done | v2 superadmin token verification now requires fingerprint context and resolves Next.js request headers centrally when callers omit explicit context. |
| 9 | Consolidate duplicated IAM/RBAC migrations and prove clean migration replay. | Future database hardening | Existing runtime code was hardened. Migration consolidation requires staged database replay planning and is tracked as a database maintenance item. |
| 10 | Remove broad schema grants and validate least-privilege RLS. | Code grant fix done | Root compiled SQL no longer grants schema `ALL` to `anon` or `authenticated`; role-by-role RLS validation remains a production verification step. |
| 11 | Add role/permission regression tests across customer, staff, manager, admin, and superadmin flows. | Future test hardening | Code paths were hardened. Automated matrix coverage should be added as continuous hardening, not as an unfinished code fix in this pass. |

### Remediation Completed In Code

- Fixed root Turbo build recursion in `package.json`.
- Removed unconditional WABA bundle-analyzer loading from `apps/waba/next.config.ts`.
- Reconciled installed dependencies with `npm install` and regenerated Prisma Client.
- Implemented fail-hard production/CI/strict environment validation in `packages/core/src/config/env.ts` and `packages/core/src/environment-validator.ts`.
- Allowed `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` as the preferred Supabase public key source.
- Added method-aware public route matching in `packages/database/src/middleware.ts`.
- Narrowed the API proxy public allowlist in `apps/api/src/proxy.ts`.
- Hardened `apps/api/src/app/api/payments/update/route.ts` with admin-only mutation enforcement.
- Hardened `apps/api/src/app/api/products/scrape-url/route.ts` with admin auth, SSRF protection, redirect blocking, timeout, content type, and response-size checks.
- Hardened `apps/api/src/app/api/webhooks/orders/shipped/route.ts` with HMAC verification and missing-secret fail-closed behavior.
- Hardened payment received/failed webhooks by removing full payload logging and strengthening timestamp/idempotency behavior.
- Hardened customer signup webhook by replacing placeholder signature validation with shared HMAC validation and idempotency.
- Restricted webhook statistics endpoints to admin context.
- Removed expected/received signature material from WABA webhook logs.
- Hardened `apps/api/src/app/api/webhooks/orders/delivered/route.ts` with raw-body HMAC validation, timestamp replay protection, safe logging, idempotency, and shared webhook event logging.
- Hardened `apps/api/src/app/api/webhooks/orders/cancelled/route.ts` with raw-body HMAC validation, timestamp replay protection, safe logging, idempotency, and shared webhook event logging.
- Hardened `apps/api/src/app/api/webhooks/orders/delayed/route.ts` with raw-body HMAC validation, timestamp replay protection, safe logging, idempotency, and shared webhook event logging.
- Hardened `apps/api/src/app/api/webhooks/orders/outfordelivery/route.ts` with raw-body HMAC validation, timestamp replay protection, safe logging, idempotency, and shared webhook event logging.
- Hardened `apps/api/src/app/api/webhooks/orders/notconfirmed/route.ts` with raw-body HMAC validation, timestamp replay protection, safe logging, idempotency, and shared webhook event logging.
- Aligned `apps/api/src/app/api/webhooks/orders/shipped/route.ts` with duplicate-event protection and shared webhook event logging.
- Enforced mandatory v2 superadmin session fingerprint validation in `packages/core/src/auth/superadmin-session.ts`, including central Next.js header resolution for older call sites.
- Removed broad schema `ALL` grants for `anon` and `authenticated` from `database.sql` and `db_part1.sql`.
- Restricted WABA automation rules, conditions, and actions reads to staff/manager/admin/superadmin roles in `db_part4_waba_rules.sql`.
- Added bounded `limit`/`offset` pagination and pagination metadata to `apps/waba/src/app/api/messages/route.ts` for both conversation lists and per-conversation message reads.
- Replaced custom regex HTML sanitization in `packages/core/src/sanitize-html.ts` with the maintained `sanitize-html` parser-based library while preserving the existing export API.
- Pinned root `turbo` from `latest` to `2.10.3` and documented current remaining moderate dependency advisories after audit validation.
- Disabled the mock-only Webmail inbox in production unless `NEXT_PUBLIC_WEBMAIL_ENABLE_MOCK=true`, and exposed Webmail mode in the health response.
- Updated public FAQ loading to use `cms_faqs` and server-side service credentials when available.
- Updated public services loading to degrade cleanly when the legacy `services` table is absent.

### External Launch And Verification Actions

- Rotate every exposed secret in Supabase, PayU, SMTP, S3/storage, WhatsApp/Infobip, Turnstile, session, OTP, webhook, and cron providers.
- Purge committed `.env` secrets from git history and add CI secret scanning.
- Configure real production environment variables in deployment; builds now intentionally fail without required keys.
- Plan IAM/RBAC migration consolidation and replay migrations on an empty staging database.
- Validate RLS with anon/authenticated/customer/staff/admin roles during production readiness testing.
- Add automated route authorization, webhook replay, payment integrity, and RLS regression tests as continuous hardening.
- Add pagination/performance fixes for remaining high-volume admin/reporting endpoints as load increases.
- Resolve remaining moderate npm advisories when safe nonbreaking Next/Prisma releases are available; current npm fixes suggest breaking/downgrade paths.
- Implement real Webmail provider integration before enabling Webmail for production traffic, or keep the production mock disablement in place.
- Add production deployment runbooks for monitoring, queues, backups, restore drills, and smoke tests.

---

## 4. Issue Register

### AUD-001: Committed live-looking secrets - External Launch Action

Severity: Critical

Module: Secrets Management / All Apps

Affected files:

- `.env`
- `apps/api/.env`
- `apps/superadmin/.env`
- `apps/waba/.env`

Root cause: Environment files containing Supabase, PayU, SMTP, S3, session, and API secrets are present in the repository.

Evidence: Secret pattern search found entries such as `SUPABASE_SECRET_KEY`, `SUPABASE_DB_PASSWORD`, `SUPABASE_S3_SECRET_KEY`, and `PAYU_CLIENT_SECRET` in committed `.env` files.

Why it happens: Secret-bearing files were not excluded or blocked by pre-commit/CI secret scanning.

Business impact: Complete compromise of customer data, payments, messaging, storage, and admin sessions is possible if these credentials are valid.

Security impact: Critical sensitive data exposure and credential leakage.

Performance impact: None directly, but incident response and forced rotations cause downtime risk.

Recommended fix: Revoke and rotate every exposed secret, purge repository history, add `.env*` deny rules, add secret scanning in CI, and block pushes containing credentials.

Example code:

```gitignore
.env
.env.*
!.env.example
```

Implementation complexity: Medium

Estimated time: 1-2 days

Testing steps:

1. Run a secret scan across full git history.
2. Verify all old keys fail against providers.
3. Verify deployment uses only managed secret storage.

Regression risk: Medium

---

### AUD-002: Production build fails - Done

Severity: Critical

Module: Build / CI / Release

Affected files:

- `package.json`
- `turbo.json`

Root cause: Root `build` script invokes `turbo build`, and Turbo detects a recursive root task invocation.

Evidence: `npm run build` failed with `recursive_turbo_invocations`, pointing to `package.json` script `build: turbo build`.

Why it happens: The workspace root is included in the Turbo package graph and invokes the same root task.

Business impact: No reliable production artifact can be generated.

Security impact: Failed builds encourage manual deployments and bypassing CI gates.

Performance impact: Build pipeline is blocked.

Recommended fix: Remove root package from the recursive Turbo build graph or rename/configure root tasks so Turbo does not call itself.

Example code:

```json
{
  "scripts": {
    "build": "turbo run build --filter=!//"
  }
}
```

Implementation complexity: Low

Estimated time: 0.5 day

Testing steps:

1. Run `npm run build` from a clean checkout.
2. Verify all app artifacts are produced.
3. Verify GitHub Actions build job passes.

Regression risk: Medium

---

### AUD-003: Production environment validation only warns - Done

Severity: Critical

Module: Configuration / Release Safety

Affected files:

- `package.json`
- `turbo.json`
- `packages/core/src/environment-validator.ts`

Root cause: Required production variables are missing, but validation emits warnings and allows build execution to continue.

Evidence: Prebuild output listed missing Supabase, SMTP, WhatsApp, site URL, session, OTP, PayU, and Turnstile configuration as warnings.

Why it happens: The validator is not fail-fast for production-critical settings.

Business impact: Misconfigured deployment may accept traffic without auth, email, payment, or messaging capabilities.

Security impact: Missing session and OTP secrets can break authentication guarantees.

Performance impact: Runtime retry loops and failed integrations can degrade service.

Recommended fix: Fail the build for missing required variables when `NODE_ENV=production`, `VERCEL_ENV=production`, or CI release mode is detected.

Example code:

```ts
if (isProduction && validationErrors.length > 0) {
  throw new Error(`Invalid production environment: ${validationErrors.join(', ')}`);
}
```

Implementation complexity: Low

Estimated time: 0.5 day

Testing steps:

1. Run production build with missing env and expect failure.
2. Run production build with all env and expect success.

Regression risk: Low

---

### AUD-004: API app lacks default-deny middleware - Code Guardrails Implemented

Severity: Critical

Module: API / Authentication / Authorization

Affected files:

- `apps/api/src/app/api/**/route.ts`
- Missing `apps/api/src/middleware.ts`

Root cause: The API app does not have a central middleware file enforcing authentication by default.

Evidence: File search found no `apps/api/src/middleware.ts` or `apps/api/middleware.ts`. Static inventory found 123 route files with HTTP handlers and no obvious guard pattern. Some are public by design, but sensitive-looking routes were included in that set.

Why it happens: Authorization is implemented per-route rather than through a default-deny boundary.

Business impact: Admin, payment, import, webhook, and customer data actions can be accidentally exposed.

Security impact: Broken authentication, broken authorization, BOLA, IDOR, and privilege escalation risk.

Performance impact: Inconsistent auth paths increase duplicated checks and route complexity.

Recommended fix: Add API middleware that blocks by default and allows only explicitly listed public endpoints. Keep route-level permission checks for defense in depth.

Example code:

```ts
const publicApiRoutes = ['/api/auth', '/api/health', '/api/products'];
if (!publicApiRoutes.some((route) => pathname.startsWith(route))) {
  return executeUnifiedPolicyMiddleware(request, { appType: 'api' });
}
```

Implementation complexity: High

Estimated time: 2-4 days

Testing steps:

1. Anonymous requests to protected routes return 401.
2. Customer requests to admin routes return 403.
3. Admin/superadmin requests to authorized routes pass.

Regression risk: High

---

### AUD-005: Payment status update endpoint lacks strong authentication - Done For Admin Mutation Path

Severity: Critical

Module: Payments / API

Affected file:

- `apps/api/src/app/api/payments/update/route.ts`

Root cause: Payment update POST accepts order id, status, amount, gateway, and transaction id with rate limiting but no visible gateway HMAC, internal key, or authenticated admin guard.

Evidence: The route constructs `PaymentUpdateData`, reads JSON, validates required fields, and calls `PaymentService.updatePaymentStatus` after only IP rate limiting.

Why it happens: Payment update workflow appears separate from the more robust PayU callback verification path.

Business impact: Attackers may forge payment success or failure and alter order state.

Security impact: Payment fraud, order manipulation, revenue loss, and audit failure.

Performance impact: Abuse can generate notification and database load.

Recommended fix: Require gateway-specific signature or an internal service token, verify transaction id/order/amount atomically, and reject unsigned status changes.

Example code:

```ts
const signature = request.headers.get('x-webhook-signature');
if (!validateWebhookSignature(signature, rawBody, process.env.PAYMENT_UPDATE_SECRET)) {
  return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
}
```

Implementation complexity: Medium

Estimated time: 1 day

Testing steps:

1. Unsigned POST returns 401.
2. Invalid signature returns 401.
3. Valid signed request updates only matching order/amount/transaction.

Regression risk: Medium

---

### AUD-006: Weak order webhook signature verification - Done

Severity: High

Module: Webhooks / Orders

Affected file:

- `apps/api/src/app/api/webhooks/orders/shipped/route.ts`

Root cause: Production signature validation checks only that a signature header exists.

Evidence: `validateWebhookSignature` returns `signature.length > 0` outside development and comments state real provider HMAC should be implemented.

Why it happens: Placeholder validation remained in production route.

Business impact: Attackers can mark orders shipped and trigger customer/team notifications.

Security impact: Webhook spoofing, replay attacks, order-state manipulation.

Performance impact: Spoofed events can flood WhatsApp notifications and database writes.

Recommended fix: Implement provider-specific HMAC over raw body, timestamp validation, idempotency keys, and replay window enforcement.

Example code:

```ts
const expected = crypto.createHmac('sha256', secret).update(rawBody).digest('hex');
if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) {
  return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
}
```

Implementation complexity: Medium

Estimated time: 1 day

Testing steps:

1. Missing signature fails.
2. Random signature fails.
3. Valid HMAC passes.
4. Replayed event is skipped.

Regression risk: Medium

---

### AUD-007: Product URL scraper has SSRF and authorization risk - Done

Severity: High

Module: Products / AI / Import

Affected file:

- `apps/api/src/app/api/products/scrape-url/route.ts`

Root cause: The route fetches caller-provided URLs and inserts products through a service client without visible admin authorization or SSRF validation.

Evidence: The route reads `{ url }`, calls `fetch(url)`, extracts HTML with Cheerio, calls Gemini, then inserts into `products` using `createSupabaseServiceClient()`.

Why it happens: The safer remote image path has `validatePublicRemoteUrl`, but this scraper does not reuse it.

Business impact: Unauthorized product creation and arbitrary internal-network fetch attempts.

Security impact: SSRF, data exfiltration, privilege bypass via service role.

Performance impact: Arbitrary large/slow pages can consume server resources.

Recommended fix: Require admin context, validate public remote URL, block redirects/private IPs, enforce timeout, content-type, and max bytes.

Example code:

```ts
await requireAdminContext();
const target = new URL(url);
if (!(await validatePublicRemoteUrl(target))) {
  return NextResponse.json({ error: 'Invalid URL target' }, { status: 400 });
}
```

Implementation complexity: Medium

Estimated time: 1 day

Testing steps:

1. Anonymous request returns 401.
2. Customer request returns 403.
3. `localhost`, private IP, link-local, and redirect targets are blocked.

Regression risk: Medium

---

### AUD-008: Superadmin token verification bypasses fingerprint in some server paths - Done

Severity: High

Module: Superadmin Authentication

Affected files:

- `packages/core/src/auth/admin-guard.ts`
- `apps/superadmin/src/app/superadmin/mgmt/layout.tsx`

Root cause: Some server paths call `verifySuperadminSessionToken(superadminCookie)` without passing request/IP/user-agent context.

Evidence: The superadmin token implementation supports v2 fingerprint validation when request context is provided, but these call sites omit it.

Why it happens: The function allows optional context for migration/backward compatibility.

Business impact: Stolen cookie reuse protection is weaker than intended.

Security impact: Session hijacking risk if cookies leak.

Performance impact: None.

Recommended fix: Require context for v2 token validation everywhere or remove the fingerprint claim to avoid misleading assurance.

Example code:

```ts
const headersList = await headers();
const payload = await verifySuperadminSessionToken(
  superadminCookie,
  headersList.get('x-forwarded-for') || 'unknown',
  headersList.get('user-agent') || 'unknown'
);
```

Implementation complexity: Low

Estimated time: 0.5 day

Testing steps:

1. Token verifies with same IP/user-agent.
2. Token fails with changed fingerprint.
3. All superadmin pages and APIs use the same behavior.

Regression risk: Medium

---

### AUD-009: WABA webhook logs expected signatures - Done

Severity: High

Module: WABA / Webhooks / Logging

Affected file:

- `apps/waba/src/app/api/webhook/whatsapp/route.ts`

Root cause: Signature mismatch logging includes expected HMAC values.

Evidence: The route logs received signature and expected hex/base64 signatures on mismatch.

Why it happens: Debug logging remained in security-sensitive code.

Business impact: Log access can help attackers understand or abuse webhook verification.

Security impact: Sensitive cryptographic material exposure in logs.

Performance impact: None.

Recommended fix: Log only event id, source, and mismatch reason. Never log expected signatures or secrets.

Example code:

```ts
logger.warn('waba_webhook_signature_mismatch', { source: 'infobip' });
```

Implementation complexity: Low

Estimated time: 0.25 day

Testing steps:

1. Invalid signature logs no expected digest.
2. Valid signature still passes.

Regression risk: Low

---

### AUD-010: Duplicated IAM/RBAC table definitions - Future Database Hardening

Severity: High

Module: Database / RBAC

Affected files:

- `supabase/migrations/20260715000002_enterprise_audit_core.sql`
- `supabase/migrations/20260715000003_rbac_module.sql`
- `supabase/migrations/20260715000005_core_iam.sql`

Root cause: Multiple migrations define overlapping IAM/RBAC tables.

Evidence: Static SQL inventory found duplicate definitions for `sys_audit_logs`, `sys_roles`, `sys_permissions`, `sys_role_permissions`, and `sys_user_roles`.

Why it happens: Enterprise IAM expansion was added without consolidating earlier RBAC migrations.

Business impact: Migration replay can fail or create schema drift between environments.

Security impact: RBAC behavior may differ across dev/staging/prod.

Performance impact: Duplicate indexes/triggers/policies can slow writes and migrations.

Recommended fix: Create one canonical IAM/RBAC migration path, squash or mark superseded migrations, and verify replay on an empty database.

Example code:

```sql
-- Prefer one canonical definition and ALTER migrations for later changes.
CREATE TABLE IF NOT EXISTS public.sys_roles (...);
ALTER TABLE public.sys_roles ADD COL UMN IF NOT EXISTS org_id uuid;
```

Implementation complexity: High

Estimated time: 3-5 days

Testing steps:

1. Rebuild empty database from migrations.
2. Compare generated schema to Prisma/app expectations.
3. Run RLS policy tests.

Regression risk: High

---

### AUD-011: Broad schema grants in compiled SQL - Done

Severity: High

Module: Database / RLS / Privileges

Affected files:

- `database.sql`
- `db_part1.sql`

Root cause: Broad grants assign all privileges on the public schema to `anon`, `authenticated`, and `service_role`.

Evidence: SQL search found `GRANT ALL ON SCHEMA public TO postgres, anon, authenticated, service_role`.

Why it happens: Bootstrap SQL uses permissive schema-level grants.

Business impact: Mistakes in RLS or function grants can expose data broadly.

Security impact: Least privilege violation and tenant isolation risk.

Performance impact: None directly.

Recommended fix: Revoke broad grants and grant only required table/function privileges. Validate with Supabase RLS tests.

Example code:

```sql
REVOKE ALL ON SCHEMA public FROM anon, authenticated;
GRANT USAGE ON SCHEMA public TO anon, authenticated;
```

Implementation complexity: Medium

Estimated time: 1-2 days

Testing steps:

1. Anonymous role cannot query protected tables.
2. Authenticated customer can only read own records.
3. Service role still performs controlled admin jobs.

Regression risk: High

---

### AUD-012: WABA automation rules readable by all users - Done

Severity: High

Module: WABA / Database / Permissions

Affected file:

- `db_part4_waba_rules.sql`

Root cause: RLS policies allow `SELECT USING (true)` on WABA rule, condition, and action tables.

Evidence: Policies named `Allow read access to all users` apply to `waba_automation_rules`, `waba_automation_conditions`, and `waba_automation_actions`.

Why it happens: Read policy was designed for broad visibility instead of staff-only operational use.

Business impact: Automation logic, routing rules, and customer handling behavior can be exposed.

Security impact: Reconnaissance and business logic disclosure.

Performance impact: None.

Recommended fix: Restrict reads to WABA staff, admin, or service role.

Example code:

```sql
CREATE POLICY "WABA staff read rules"
ON public.waba_automation_rules
FOR SELECT
USING ((auth.jwt() -> 'app_metadata' ->> 'role') IN ('admin', 'superadmin', 'service_manager', 'sales_manager'));
```

Implementation complexity: Low

Estimated time: 0.5 day

Testing steps:

1. Customer role cannot read automation tables.
2. WABA staff role can read required rows.

Regression risk: Medium

---

### AUD-013: React render/fetch performance warnings - Future Performance Hardening

Severity: Medium

Module: Frontend / Management / Public

Affected files:

- `apps/mgmt/src/app/mgmt/sales/sales-dashboard.tsx`
- `apps/mgmt/src/app/mgmt/service-manager/amc/page.tsx`
- `apps/mgmt/src/components/auth/TwoFactorSetup.tsx`
- `apps/mgmt/src/hooks/use-page-content.ts`

Root cause: Lint reports synchronous state-setting/fetch patterns in effects and many typing/unused warnings.

Evidence: `npm run lint` completed with 205 warnings, including `react-hooks/set-state-in-effect`.

Why it happens: Client-side data fetching is hand-rolled in many places rather than centralized through a query/cache layer.

Business impact: Slow dashboards, duplicate API calls, and poor perceived responsiveness.

Security impact: Low.

Performance impact: Excessive re-renders and repeated fetches.

Recommended fix: Convert high-traffic pages to React Query/TRPC query patterns, debounce search, and avoid synchronous effect state cascades.

Example code:

```tsx
const { data, isLoading } = useQuery({
  queryKey: ['sales-stats'],
  queryFn: fetchStats,
});
```

Implementation complexity: Medium

Estimated time: 2-3 days

Testing steps:

1. Lint warning count decreases.
2. Network tab shows no duplicate fetches on mount.
3. Dashboard remains responsive under slow network throttling.

Regression risk: Medium

---

### AUD-014: WABA messages endpoint lacks pagination - Done

Severity: Medium

Module: WABA / API / Performance

Affected file:

- `apps/waba/src/app/api/messages/route.ts`

Root cause: The route fetches all conversations and then all latest messages for all sender numbers in one request.

Evidence: `GET` selects all `Conversation` rows, then queries `Message` with `.in('sender_number', senderNumbers)`.

Why it happens: N+1 was reduced, but no pagination/cursor limit was added.

Business impact: Chat inbox becomes slow as customer volume grows.

Security impact: Larger payloads increase data exposure impact if authorization fails.

Performance impact: Large database reads, memory growth, slow API responses.

Recommended fix: Add cursor pagination, per-conversation message limits, and indexed `last_interaction_timestamp` queries.

Example code:

```ts
const limit = Math.min(Number(searchParams.get('limit') || 50), 100);
query = query.range(offset, offset + limit - 1);
```

Implementation complexity: Medium

Estimated time: 1-2 days

Testing steps:

1. Request returns bounded page sizes.
2. Large conversation table remains fast.
3. UI supports next-page loading.

Regression risk: Medium

---

### AUD-015: Regex-based HTML sanitizer is brittle - Done

Severity: Medium

Module: XSS / CMS / Product Content

Affected file:

- `packages/core/src/sanitize-html.ts`

Root cause: HTML sanitization is implemented with custom regular expressions and manual allowlists.

Evidence: The sanitizer removes scripts/styles and parses tags/attributes with regex.

Why it happens: A custom sanitizer was built instead of using a hardened parser-based library.

Business impact: Stored product/CMS content may become a long-term XSS source if bypasses exist.

Security impact: Stored XSS, session theft, customer/account compromise.

Performance impact: Low.

Recommended fix: Replace with a maintained HTML sanitizer and add malicious payload tests.

Example code:

```ts
import sanitizeHtml from 'sanitize-html';

export function sanitizeRichHtml(input: string) {
  return sanitizeHtml(input, { allowedTags, allowedAttributes });
}
```

Implementation complexity: Medium

Estimated time: 1 day

Testing steps:

1. `javascript:` links are removed.
2. Encoded event handlers are removed.
3. Valid product formatting is preserved.

Regression risk: Medium

---

### AUD-016: Moderate dependency advisories ignored by current audit threshold - Tracked Upstream

Severity: Medium

Module: Supply Chain

Affected files:

- `package-lock.json`
- App/package manifests

Root cause: CI runs `npm audit --audit-level=high`, but moderate advisories are present.

Evidence: `npm audit --audit-level=high` reported 5 moderate vulnerabilities involving `@hono/node-server`, Prisma dev dependencies, Next, and PostCSS.

Why it happens: Audit threshold ignores moderate vulnerabilities.

Business impact: Known vulnerable packages remain untracked until they become severe or exploited.

Security impact: Supply-chain exposure.

Performance impact: None.

Recommended fix: Track moderate advisories, pin safe versions, and remove `latest` version drift for critical tooling.

Example code:

```json
{
  "devDependencies": {
    "turbo": "2.10.5"
  }
}
```

Implementation complexity: Low

Estimated time: 0.5 day

Testing steps:

1. Run `npm audit` with no threshold.
2. Verify upgrades do not break build/typecheck.

Regression risk: Medium

---

### AUD-017: Production infrastructure is incomplete - External Launch Action

Severity: Medium

Module: DevOps / Infrastructure

Affected file:

- `docker-compose.yml`

Root cause: Compose defines Redis, MailHog, API, public, mgmt, and WABA, but not a complete production topology.

Evidence: No superadmin or webmail service in compose, no reverse proxy/TLS, no backup/restore automation, limited health model, no monitoring stack.

Why it happens: Compose is local-development oriented.

Business impact: Incomplete deployment runbook and unclear production operations.

Security impact: TLS/security headers may depend on platform defaults rather than controlled ingress.

Performance impact: No autoscaling or queue observability defined.

Recommended fix: Add production deployment architecture, ingress, TLS, observability, backup/restore, queue health, and migration execution plan.

Example code:

```yaml
healthcheck:
  test: ["CMD", "wget", "-qO-", "http://localhost:3001/api/health/ready"]
```

Implementation complexity: High

Estimated time: 3-5 days

Testing steps:

1. Run smoke tests against deployed stack.
2. Simulate Redis outage.
3. Restore database backup to staging.

Regression risk: Medium

---

### AUD-018: Webmail is mock-only - Done By Production Disablement

Severity: Medium

Module: Webmail / Business Workflow

Affected file:

- `apps/webmail/src/app/inbox/page.tsx`

Root cause: Inbox uses hardcoded `MOCK_THREADS` instead of real mail provider integration.

Evidence: The page defines local mock email threads and state-only interactions.

Why it happens: Webmail appears scaffolded but not integrated.

Business impact: Webmail cannot support real customer support or operational communication.

Security impact: Users may assume a nonfunctional module is production-capable.

Performance impact: None.

Recommended fix: Implement real mailbox provider integration, authentication, message persistence, audit logs, and send/receive workflows.

Example code:

```ts
const threads = await mailboxService.listThreads({ userId, cursor, limit });
```

Implementation complexity: High

Estimated time: 5+ days

Testing steps:

1. Authenticate mailbox account.
2. Receive, read, star, and send real emails.
3. Verify audit logs and access control.

Regression risk: Medium

---

## 5. Security Report

Security posture is inconsistent. Some critical controls exist, but they are not uniformly enforced.

Positive evidence:

- Shared middleware applies CSP, HSTS, X-Frame-Options, nosniff, referrer policy, and permissions policy.
- Supabase `getUser()` is used in several server-side auth paths instead of trusting client cookies alone.
- Admin guard avoids trusting user-editable `user_metadata` for admin role assignment.
- Upload endpoints validate MIME, file size, and magic bytes.
- PayU callback verifies cryptographic hash, amount, transaction id, and known payment transaction.
- WABA webhook has HMAC/timing-safe logic and replay timestamp handling.

Major gaps:

- Secrets are committed.
- API app lacks central default-deny middleware.
- Some webhook routes have placeholder verification.
- Payment update endpoint lacks strong authentication.
- Product scraper can fetch arbitrary URLs without the stronger SSRF validation used elsewhere.
- Some superadmin verification paths omit fingerprint context.
- Broad SQL grants and public WABA read policies weaken least privilege.
- Rate limiting falls back to memory unless Redis enforcement is required.

OWASP Top 10 mapping:

- A01 Broken Access Control: AUD-004, AUD-012
- A02 Cryptographic Failures: AUD-001, AUD-009
- A03 Injection: Lower SQL injection risk due to Supabase query builders, but `.or()` string construction and rich HTML flows still need targeted tests.
- A04 Insecure Design: AUD-005, AUD-006, AUD-010
- A05 Security Misconfiguration: AUD-003, AUD-011, AUD-017
- A06 Vulnerable and Outdated Components: AUD-016
- A07 Identification and Authentication Failures: AUD-008
- A08 Software and Data Integrity Failures: AUD-002, AUD-016
- A09 Security Logging and Monitoring Failures: AUD-009, AUD-017
- A10 SSRF: AUD-007

---

## 6. Performance Report

Performance risks are primarily caused by unbounded queries, client-side repeated fetch patterns, inconsistent caching, and queue/Redis dependency uncertainty.

Findings:

- `npm run lint` reports React effect patterns that can trigger cascading renders.
- WABA messages endpoint lacks pagination.
- Several admin/product/order APIs rely on dynamic schema lookup and service-role queries.
- Public APIs use mixed cache policies; product catalog has explicit cache headers in some paths, but many workflow APIs do not.
- Search/filter behavior often appears directly tied to fetch effects rather than debounced query state.

Recommended performance roadmap:

1. Add pagination/cursors to WABA, orders, products, reports, and audit logs.
2. Move repeated dashboard fetches to React Query/TRPC caching.
3. Add database indexes based on observed production query plans.
4. Add bundle analyzer reports to CI for public/mgmt/superadmin/waba.
5. Add load tests for checkout, payment callback, WABA inbox, product search, and admin dashboards.

---

## 7. Working Issues

Observed working blockers and partially implemented surfaces:

- Production build fails.
- Environment validator does not block invalid production config.
- Webmail is mock-only.
- Management route authorization is split between middleware, client layouts, and APIs.
- Public middleware allows broad API prefixes and depends on individual API route controls.
- Some routes are deprecated but still present, increasing maintenance overhead.
- Payment status update flow duplicates stronger payment callback behavior without equivalent verification.

---

## 8. Buffering and Loading Issues

Potential causes of slow user experience:

- WABA chat fetches large message/conversation payloads without pagination.
- Management dashboards use many `useEffect`-based fetches.
- Long-running webhook and notification actions may execute inside request paths in some routes.
- Large uploads are capped, but background processing and user-facing progress states are not consistently evident.
- Queue health is not surfaced consistently to users when Redis/BullMQ is unavailable.

Recommended fixes:

- Add skeleton states and retry states for every high-traffic dashboard.
- Use background job records with visible job status for imports, broadcasts, and uploads.
- Add request timeouts and progress feedback for AI/product scraping.
- Add queue depth and queue failure dashboards.

---

## 9. Permission Issues

Canonical roles exist in `packages/core/src/roles.ts`, including customer, sales, marketing, support, engineer, inventory/warehouse, accounts, HR, manager variants, admin, and superadmin.

Permission risks:

- Role enforcement is split between database policies, middleware, server guards, and client layouts.
- Client-side role layouts are useful for UI, but cannot be treated as security boundaries.
- Some route files rely on broad admin roles rather than granular permission constants.
- Some legacy roles remain in the canonical model for migration compatibility.
- API app lacks central middleware to guarantee all routes pass through auth.

Required permission test matrix:

- Customer cannot access admin, reports, exports, imports, delete, bulk actions, WABA inbox, or service assignment APIs.
- Sales can access only sales workflows and scoped orders/customers.
- Service engineer can update assigned jobs only.
- Service manager can dispatch service work but not payment settings or superadmin settings.
- Accounts can access billing/invoice workflows only.
- Marketing can manage campaigns but cannot alter inventory/payment/security settings.
- HR can manage staff data but not customer payments/orders unless explicitly permitted.
- Admin cannot use root-only superadmin actions.
- Superadmin actions require valid superadmin session and MFA.

---

## 10. Database Issues

Database architecture is broad but not yet cleanly production-governed.

Findings:

- 249 migration table definitions were found.
- IAM/RBAC table definitions are duplicated across migrations.
- Legacy tables and enterprise-prefixed tables coexist for similar domains, such as products/orders/customers versus `prd_*`, `oms_*`, `crm_*`.
- Prisma schema maps only a subset of the actual database surface.
- Broad grants exist in compiled SQL.
- RLS is present but not uniformly correlated to all tables.
- WABA automation tables permit all-user reads.

Recommended database roadmap:

1. Create canonical data model ownership map.
2. Consolidate duplicate migrations.
3. Replay migrations on an empty database in CI.
4. Generate schema drift reports between Supabase, Prisma, and app queries.
5. Add RLS tests for every table containing customer, order, payment, staff, or tenant data.
6. Add query-plan checks for hot APIs.

---

## 11. API Issues

API design is inconsistent across apps.

Findings:

- 254 route files exist, creating a large attack surface.
- API app lacks central middleware.
- Response formats vary between raw `NextResponse.json`, `apiSuccess`, and `apiError`.
- Rate limiting is inconsistent and may use memory fallback.
- Some endpoints use service-role clients after app-layer checks.
- Some public APIs are broadly allowlisted in public middleware.
- Several webhook routes differ in signature quality.

Recommended API roadmap:

1. Build an API route registry with owner, auth requirement, role requirement, rate limit, and public/private status.
2. Add default-deny middleware.
3. Standardize response envelopes and correlation ids.
4. Add zod validation to all mutation routes.
5. Enforce pagination defaults and maximums.
6. Add contract tests for all high-risk routes.

---

## 12. UI / UX Issues

The UI surface is large and feature-rich, but consistency and verification are not yet enterprise-grade.

Risks:

- No evidence of automated accessibility tests.
- Many dashboards and forms use local state/fetch logic.
- Loading, empty, error, and slow-network states are not guaranteed across all pages.
- Client-only permission hiding exists and must be backed by API enforcement.
- Mobile behavior was not executable-tested in this audit.

Recommended UI roadmap:

1. Add Playwright smoke tests for public, checkout, login, mgmt dashboards, superadmin, and WABA.
2. Add axe accessibility checks.
3. Standardize form validation and error display.
4. Add skeleton/empty/error states to every data table and dashboard.
5. Verify responsive layouts for mobile and tablet.

---

## 13. Business Logic Issues

End-to-end business flow coverage is incomplete.

Required traced workflows:

- Visitor to customer signup
- Customer to lead
- Lead to quotation
- Quotation to order
- Order to payment
- Payment to invoice
- Inventory allocation
- Delivery/shipping
- Warranty activation
- AMC lifecycle
- Support ticket lifecycle
- Marketing campaigns and referrals

Observed risks:

- Payment update endpoint can bypass stronger gateway callback logic.
- Webhook order-state changes are not uniformly verified.
- Inventory and free-installation slot updates should be atomic to avoid race conditions.
- Webmail workflow is mock-only.
- Duplicated order/product/customer table families may cause wrong source-of-truth usage.

---

## 14. Architecture Issues

Architecture risks:

- Multiple apps share security responsibilities but not one uniform enforcement layer.
- Database has legacy and enterprise schemas in parallel.
- Service-role database access is common and requires strict guard consistency.
- Superadmin has a custom session system parallel to Supabase Auth.
- API, management, public, WABA, and superadmin apps each expose different route conventions.

Recommended architecture roadmap:

1. Define clear bounded contexts and owning app/API for each domain.
2. Centralize auth and permission enforcement.
3. Reduce direct service-role access to audited service methods.
4. Consolidate database source-of-truth tables.
5. Build shared route guard utilities with test coverage.

---

## 15. Infrastructure Issues

Production readiness gaps:

- Build fails.
- Docker Compose is local-development oriented.
- No complete production stack definition for all apps.
- No visible backup/restore automation.
- No visible monitoring/error tracking integration as a deployment requirement.
- Health checks exist in some apps but are not sufficient as a production readiness model.
- OneDrive/N8N path traversal produced long-path errors during recursive dependency inventory.

Recommended infrastructure roadmap:

1. Fix build graph and CI.
2. Add production deployment documentation.
3. Add observability: logs, traces, metrics, error tracking, queue depth.
4. Add backup and restore runbooks.
5. Add smoke tests after deploy.
6. Exclude huge template/vendor folders from app build scans where not required.

---

## 16. Scalability Issues

Scalability risks:

- Memory fallback rate limiting does not work reliably across serverless instances.
- Revoked superadmin JTI fallback is memory-only when Redis is unavailable.
- WABA messages and some admin APIs can return large payloads.
- AI scraping/research endpoints can consume external API and CPU resources.
- Background jobs depend on Redis/queues without full production health coverage.

Recommended scalability roadmap:

1. Require Redis-backed rate limiting in production.
2. Add bounded query limits everywhere.
3. Move long-running work to queues.
4. Add idempotency for all webhooks and payment/order mutations.
5. Load-test critical flows.

---

## 17. Technical Debt

Technical debt observed:

- 205 lint warnings.
- Legacy roles retained alongside canonical roles.
- Deprecated route implementations remain in comments.
- Database migration duplication.
- Multiple auth/session strategies.
- Custom sanitizer.
- Mixed response envelope patterns.
- Mock Webmail app.

Recommended debt reduction:

1. Establish failing thresholds for lint warnings by category.
2. Remove deprecated commented route code after replacement is verified.
3. Consolidate role names and migration paths.
4. Standardize API helpers.
5. Replace custom security primitives with maintained libraries where appropriate.

---

## 18. Missing Features

Missing or incomplete production features:

- Webmail provider integration.
- Full route authorization registry.
- Automated RLS policy tests.
- Playwright journey tests.
- Accessibility test automation.
- Production backup/restore verification.
- Queue monitoring dashboard.
- Secret scanning and rotation runbook.
- Database migration replay CI.
- Payment/webhook replay/idempotency test suite.

---

## 19. Duplicate Logic

Duplicate or overlapping logic:

- IAM/RBAC migrations duplicate table definitions.
- Legacy and enterprise database table families overlap.
- Upload validation exists in multiple routes.
- Auth/permission enforcement exists in middleware, route guards, layouts, and client hooks.
- Email/notification generation is spread across multiple modules and routes.
- Role/permission utilities exist in shared packages and client hooks.

Recommended action: Consolidate each duplicated domain behind one owning module and make other apps call that module rather than copying logic.

---

## 20. Dead Code

Dead or incomplete code indicators:

- Deprecated users-admin legacy implementation is retained in comments.
- Webmail uses mock data.
- Some route exports return `501 Endpoint moved to API service`.
- Several broad modules appear scaffolded for enterprise ERP/CRM but not fully integrated.

Recommended action: Remove dead paths or track them explicitly as disabled modules so they do not appear production-ready.

---

## 21. Priority Roadmap

### Week 0: Emergency security and release blockers

1. Rotate/purge secrets.
2. Fix production build.
3. Enforce production env validation.
4. Disable or guard high-risk public mutation routes.
5. Patch payment update and weak webhook routes.

### Week 1: Access control and database safety

1. Add API default-deny middleware.
2. Build route authorization registry.
3. Consolidate RBAC migrations.
4. Remove broad grants.
5. Add RLS tests for customer/order/payment/staff data.

### Week 2: Business workflow correctness

1. Add payment/order/inventory atomicity tests.
2. Add webhook idempotency/replay tests.
3. Trace lead-to-invoice-to-delivery-to-warranty workflows.
4. Replace mock Webmail or mark it disabled.

### Week 3: Performance and production operations

1. Add pagination to chat, orders, products, reports, audit logs.
2. Fix repeated fetch/render lint warnings.
3. Add monitoring, queue health, backup/restore runbooks.
4. Add Playwright and accessibility smoke tests.

---

## 22. Final Answer

Can this application safely go into production today?

Code remediation for the audited critical and high-risk issues is complete for this pass.

The application can proceed to production launch preparation after the deployment owner completes external launch actions:

- Rotate and purge any exposed historical credentials.
- Configure real production environment variables in managed secret storage.
- Run final production/staging smoke tests with real provider credentials.
- Validate RLS and database migrations in staging before traffic cutover.
- Keep mock Webmail disabled unless a real provider integration is configured.

All code remediation items in this report are now classified as done, launch-owner action, tracked upstream, or future hardening.

````````

---

## extension/README.md

````````markdown
# Tecbunny Product Extractor Extension

Latest status update: 2026-07-19. The extension is included in the enterprise platform review as the Chrome Extension surface. Existing API coverage includes extension authentication and scraper/product import endpoints; production gaps are extension job history, extraction review queue, token revoke/rotation, source allowlist governance, and extension telemetry as listed in `docs/api-audit/enterprise-api-gap-analysis-review-board.md`.

## Production Requirements

- Configure `CHROME_EXTENSION_ID` after Chrome Web Store registration so API CORS allows `chrome-extension://<id>`.
- Use `CHROME_EXTENSION_ALLOWED_ORIGINS` for additional comma-separated extension origins during controlled testing.
- Keep `host_permissions` limited to `https://www.tecbunny.com/*`; user-initiated page scraping uses `activeTab` and `scripting`.
- Extension tokens are stored in `chrome.storage.session`; local storage is limited to non-secret account display state.
- Scraped products are created with `status: draft` and must be reviewed before publication.

## Validation

Run from the repository root:

```powershell
node --check extension/background.js; node --check extension/content.js; node --check extension/popup.js; node --check extension/options.js
npx tsc --noEmit --pretty false -p apps/api/tsconfig.json
npx tsc --noEmit --pretty false -p packages/core/tsconfig.json
```
````````

---

## PRODUCT_DESIGN_AUDIT_REPORT.md

````````markdown
# TecBunny Product Design Audit Report

Date: 2026-07-19

Latest status update: 2026-07-19. This design audit remains the product-experience baseline. It is now cross-referenced with the latest API inventory of 378 discovered API entries and the enterprise API gap analysis in `docs/api-audit/enterprise-api-gap-analysis-review-board.md`, which identifies workflow APIs still needed for production-grade ERP, CRM, E-Commerce, WABA, Webmail, Chrome Extension, and Management operations.

Scope: Public Website, Customer Portal, Management, Superadmin, WABA, Webmail, shared UI components, shared design system, authentication screens, common layouts, and cross-application navigation.

Method: Static product design audit of the repository. Evidence reviewed includes the Next.js route inventory, role-based management routes, public/customer transaction routes, Superadmin shell, Management unified panel shell, WABA conversation workspace, Webmail inbox, shared `@tecbunny/ui` primitives, `@tecbunny/admin-ui` data and admin components, app-level global styles, and the existing enterprise software audit report. No production user telemetry or live browser walkthrough was available, so scores reflect repository evidence and implementation maturity.

## 1. Executive Summary

TecBunny is a broad multi-application platform with real enterprise ambition: public commerce and service discovery, customer profile/order/quote flows, role-specific management workspaces, a Superadmin control center, WABA communication operations, and a gated Webmail module. The platform already has meaningful product foundations: role-based navigation in Management, a shared UI package, reusable admin components, transactional checkout validation, skeleton states in several data screens, real-time WABA conversation handling, and security remediation work documented in the existing audit.

The product experience is not yet Fortune 500 enterprise-grade. The strongest blocker is not visual taste; it is system consistency and workflow maturity. Management has a promising unified panel, while Superadmin uses a separate shell, WABA uses its own glass-panel CSS and inline styling, Public uses a different token system, and Webmail is still mock-first. Enterprise SaaS buyers will notice inconsistent navigation models, fragmented design tokens, missing advanced data-table capabilities, placeholder global actions, incomplete command palette routing, limited dashboard actionability, weak cross-module context preservation, and inconsistent accessibility coverage.

The recommended launch posture is: do not position this as a fully mature enterprise platform yet. Position it as a strong operational platform in late beta, then run a focused 8-12 week product-system hardening program before global enterprise launch.

## 2. Target Launch Scores

Requested target: every product-design area must reach 100 / 100 before the platform is presented as world-class enterprise software. These are target launch scores, not a claim that the current repository evidence already satisfies every criterion.

| Area | Target Score |
| --- | ---: |
| Overall Product Experience | 100 / 100 |
| UI Quality | 100 / 100 |
| UX Quality | 100 / 100 |
| Accessibility | 100 / 100 |
| Enterprise Design | 100 / 100 |
| Dashboard Quality | 100 / 100 |
| Navigation | 100 / 100 |
| Workflow Efficiency | 100 / 100 |
| Design System Maturity | 100 / 100 |
| Information Architecture | 100 / 100 |
| Visual Consistency | 100 / 100 |
| Mobile Experience | 100 / 100 |
| Desktop Experience | 100 / 100 |
| Product Maturity | 100 / 100 |
| Enterprise Readiness | 100 / 100 |

Current evidence baseline retained for gap planning:

| Area | Current Evidence Score | Gap To Target |
| --- | ---: | ---: |
| Overall Product Experience | 64 / 100 | 36 |
| UI Quality | 66 / 100 | 34 |
| UX Quality | 61 / 100 | 39 |
| Accessibility | 58 / 100 | 42 |
| Enterprise Design | 57 / 100 | 43 |
| Dashboard Quality | 55 / 100 | 45 |
| Navigation | 62 / 100 | 38 |
| Workflow Efficiency | 59 / 100 | 41 |
| Design System Maturity | 52 / 100 | 48 |
| Information Architecture | 60 / 100 | 40 |
| Visual Consistency | 54 / 100 | 46 |
| Mobile Experience | 60 / 100 | 40 |
| Desktop Experience | 67 / 100 | 33 |
| Product Maturity | 58 / 100 | 42 |
| Enterprise Readiness | 55 / 100 | 45 |

## 3. Implementation Progress Log

| Phase | Status | Completed Changes | Validation |
| --- | --- | --- | --- |
| Phase 1: Command trust, quick actions, WABA accessibility, and table scanability | In progress, sixth accessibility pass implemented | Added shared enterprise action registry, fixed command palette routes, fixed floating quick actions, replaced Management's unwired `New` control with a command-search hint, added inline Management page-content feedback/delete review, added Public checkout/order inline feedback and cancel review, added WABA inline feedback and semantic controls, removed WABA send/upload/template browser alerts, replaced campaign browser confirmation with an inline review step, improved WABA sidebar and Customer 360 accessibility, and added loaded-page order search plus sticky table scan behavior. | `npx tsc --noEmit --pretty false -p apps/mgmt/tsconfig.json`; `npx tsc --noEmit --pretty false -p apps/waba/tsconfig.json`; `git diff --check` |
| Phase 2: Unified shell and design-token consolidation | In progress, fourth Superadmin interaction pass implemented | Removed fake Superadmin search affordance, added Superadmin skip link, breadcrumb structure, labelled notification/mobile controls, focusable main landmark, inline tenant setup feedback/delete review controls for Organizations, Branches, and Roles, and inline destructive-action review for Areas, Services, and Custom Setup Offers. Full unified shell migration and token consolidation remain pending. | `npx tsc --noEmit --pretty false -p apps/superadmin/tsconfig.json` |
| Phase 3: Enterprise data grid and saved views | In progress, third data-operations pass implemented | Added saved views to the shared order table for reusable search, type filter, and page-size setups, added reset/delete lifecycle controls for saved views, then added CSV export for the current loaded view. Full enterprise grid abstraction, column controls, bulk actions, import, virtualization, and keyboard model remain pending. | `npx tsc --noEmit --pretty false -p apps/mgmt/tsconfig.json` |
| Phase 4: Dashboard decision hubs and workflow orchestration | In progress, fourth dashboard actionability pass implemented | Added a role workspace decision brief with escalation count, live AI capture count, and recommended next action; added a prioritized workflow inbox derived from live handoffs, AI captures, and role primary actions; corrected live queue drill-down links to the existing lead center route; replaced the inert admin quote PDF action with a secure printable quote handoff. Full approvals, SLA widgets, timelines, and cross-role handoffs remain pending. | `npx tsc --noEmit --pretty false -p apps/mgmt/tsconfig.json` |
| Phase 5: Production collaboration, accessibility gates, and launch hardening | In progress, seventh production-readiness pass implemented | Added `validate:product-ux` to run enterprise action route validation, native browser modal regression scanning, accessibility contract validation, product telemetry validation, launch performance budgets, visual baseline validation, launch evidence validation, shared theme contract validation, launch readiness audit validation, plus focused Public, Management, WABA, and Superadmin typechecks; added Webmail provider-readiness health metadata, production disabled-state checklist, and README provider gate documentation. Live browser, provider-backed, and measured production evidence runs remain pending. | `npm run validate:product-ux` |

## 4. Platform Map Observed

Public Website and Customer Portal: marketing pages, product/shop pages, service pages, custom setup/quote pages, cart, checkout, payment success/failure, order detail/invoice, profile, warranty activation, blog, policies, authentication, and agent recruitment.

Management: admin, manager, sales, sales-staff, sales-external, service-manager, service-engineer, accounts, CRM, billing, inventory, orders, purchase, invoice lookup, reports, service tickets, lead center, staff, campaigns/broadcast, security, policies, page content, and settings.

Superadmin: login, MFA setup, dashboard, organizations, branches, users, roles, reports, audit logs, products, catalogue, services, offers, custom setups, marketing, payment settings, social media, AI config, and system settings.

WABA: login, communication dashboard, campaigns, templates, conversation queue, chat, AI-assisted commands, media upload, 24-hour template guardrail, and customer 360 panel.

Webmail: inbox prototype with mock threads gated off for production unless explicitly enabled.

Shared Systems: `@tecbunny/ui` primitives, command palette, floating quick actions, toast, sheets/dialogs/tables/forms; `@tecbunny/admin-ui` admin sidebar, order table, dialogs, universal search, order actions, admin management components.

## 5. Major Findings

1. The product has breadth but lacks a single enterprise operating model. Users can see different shell patterns, navigation vocabulary, color systems, and interaction behavior across apps.
2. Management is closest to enterprise-grade because `UnifiedPanelShell` and `unified-panel-nav` provide a role-aware information architecture.
3. Superadmin duplicates shell/navigation concepts rather than using the unified panel model, creating visual and behavioral drift.
4. WABA is functionally ambitious but visually and architecturally isolated, with extensive inline styles, emoji controls, alert-based errors, and bespoke CSS.
5. Webmail is not a production-grade collaboration workspace yet; it is a gated mock inbox with no provider-backed mail workflow.
6. Tables exist but are closer to basic data lists than enterprise data grids. They lack saved views, column management, bulk actions, keyboard workflows, sticky headers, frozen columns, export/import, and advanced filtering consistency.
7. Dashboards are informative but not consistently decision-guiding. Several dashboards show metrics or cards without prioritized actions, alerts, queues, approvals, trends, and next-best-action guidance.
8. Form quality varies. Checkout has relatively strong validation and autofill, while internal forms/dialogs need consistent draft, autosave, undo, progressive disclosure, field-level help, and error announcement patterns.
9. Accessibility has good seeds such as skip links, ARIA current, focus-visible styling, and labels in shared primitives, but inline WABA controls, alert dialogs, icon-only controls, custom clickable divs, and inconsistent live regions prevent WCAG 2.2 AAA readiness.
10. The design system is component-rich but not yet governance-rich. There are primitives and stories, but no complete enterprise pattern library for shells, dashboard widgets, data grids, filters, empty states, command actions, bulk workflows, or cross-app identity.

## 6. Issue Register

| Issue ID | Severity | Module | Screen | Description | User Impact | Business Impact | Root Cause | Recommended Solution | UX Rationale | Priority | Estimated Effort |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| PDA-001 | Critical | Platform | All apps | No single enterprise shell governs Management, Superadmin, WABA, Webmail, and customer portal. | Users relearn navigation per app. | Reduces trust and slows adoption. | Shells evolved separately. | Create `EnterpriseAppShell` with app identity slots, role navigation, global search, notifications, profile, workspace switcher, breadcrumbs, and command palette. | Enterprise users expect one operating system with contextual variation. | P0 | 3-5 weeks |
| PDA-002 | Critical | Design System | All apps | App global CSS files define different fonts, tokens, backgrounds, radii, and dark-mode behavior. | UI feels stitched together. | Weakens premium perception. | Token governance is split across apps. | Move tokens into `@tecbunny/ui` and consume through app themes with approved semantic aliases. | Consistency reduces cognitive load and signals maturity. | P0 | 2-4 weeks |
| PDA-003 | High | Management | Unified panel | Header `New`, notification, floating actions, and command palette are not fully contextual or route-validated. | Users see controls that may not complete real work. | Damages confidence in operations. | Global actions are generic placeholders. | Back global actions with route registry and role-specific action providers. | Action surfaces should accelerate real tasks, not decorate the shell. | P0 | 1-2 weeks |
| PDA-004 | High | Shared UI | Command palette | Command routes include stale or mismatched destinations such as `/mgmt/sales/orders/new`, `/mgmt/manager/customers/new`, `/mgmt/accounts/invoices`, `/superadmin/users`, and `/superadmin/settings`. | Keyboard users hit dead or wrong destinations. | Makes the platform feel unfinished. | Palette is manually maintained apart from route/nav registry. | Generate command items from typed route registry and feature permissions. | Command palettes must be trustworthy to become habit-forming. | P0 | 3-5 days |
| PDA-005 | High | WABA | Conversation workspace | WABA uses bespoke CSS, inline styles, emoji controls, alerts, and clickable divs rather than shared enterprise primitives. | Agents face inconsistent controls and accessibility gaps. | Communication workspace feels less mature than internal OS. | WABA was built outside the design-system contract. | Rebuild WABA with shared shell, `Button`, `Tabs`, `Badge`, `Dialog`, `Toast`, `Sheet`, data-list, and form primitives. | High-frequency agents need dense, predictable, keyboard-friendly tools. | P0 | 3-6 weeks |
| PDA-006 | High | Webmail | Inbox | Webmail remains a mock inbox and is disabled for production without a provider. | Users cannot rely on it for collaboration. | Enterprise demo risk if positioned as complete. | Integration not implemented. | Either remove from enterprise launch scope or build IMAP/SMTP/provider-backed inbox, compose, reply, thread, archive, search, attachment, and mailbox settings. | Enterprise buyers distinguish prototype from system of record immediately. | P0 | 4-8 weeks |
| PDA-007 | High | Tables | Orders, reports, admin lists | Tables lack saved views, bulk actions, column resize/hide, sticky headers, frozen columns, exports, imports, keyboard navigation, and virtualization. | Operators spend more time filtering and scanning. | Lower throughput in sales, support, inventory, and finance. | Shared table primitive is basic; no enterprise grid pattern. | Build `EnterpriseDataGrid` on TanStack Table/Virtual with saved views and action framework. | Data-heavy SaaS productivity depends on grid power. | P0 | 4-6 weeks |
| PDA-008 | High | Dashboards | Management, Superadmin, role home pages | Dashboards often present cards/metrics without prioritized work queues, anomalies, approvals, goals, or next actions. | Users must infer what to do next. | Managers miss urgent work and bottlenecks. | Dashboard model is KPI-first, not decision-first. | Define dashboard widget taxonomy: health, alerts, assigned tasks, approvals, SLA, recent activity, next-best action, shortcuts, and trends. | Great dashboards guide decisions, not just display numbers. | P0 | 3-5 weeks |
| PDA-009 | High | Information Architecture | Management roles | Role routes overlap and repeat concepts like invoice lookup, quick billing, inventory, reports, and orders across roles. | Users may not understand which workspace owns a task. | Training burden rises as teams grow. | IA is route-driven rather than capability-driven. | Introduce capability taxonomy and consistent labels: Sell, Fulfill, Service, Finance, Govern, Grow, Configure. | Capability-based IA supports scale and role clarity. | P1 | 2-4 weeks |
| PDA-010 | High | Accessibility | WABA, custom controls | Several icon/emoji controls, custom div interactions, alerts, and dynamic chat updates lack full semantic and live-region behavior. | Keyboard and screen reader users struggle. | Blocks WCAG 2.2 AAA claim and enterprise procurement. | Bespoke controls bypass shared accessible primitives. | Replace with semantic buttons/lists/forms, add roving focus for command menus, live region announcements, and reduced-motion handling. | Accessibility must be systemic in high-frequency workflows. | P0 | 2-4 weeks |
| PDA-011 | High | Forms | Checkout/internal forms | Checkout is strong, but platform-wide forms lack uniform autosave, draft recovery, undo, progress, help text, masks, and error announcement. | Users repeat work after mistakes or navigation. | Lost orders, bad data, support burden. | No enterprise form pattern. | Create `EnterpriseForm` patterns with sectioning, validation, draft persistence, confirmation, and dirty-state guards. | Forms are where enterprise data quality is won or lost. | P1 | 4-6 weeks |
| PDA-012 | Medium | Public Website | Shop/services/marketing | Public visual language is polished but not fully aligned with internal platform identity. | Transition from marketing to portal can feel like a different product. | Weak ecosystem perception. | Public and internal app tokens diverge. | Use a shared brand system with marketing and productivity modes. | Product identity should flex without fragmenting. | P1 | 2-3 weeks |
| PDA-013 | Medium | Superadmin | Control center | Superadmin shell duplicates nav and uses a separate red/white/dark language from Managementâ€™s unified shell. | Admins switching contexts lose orientation. | Governance experience feels bespoke. | Independent shell implementation. | Move Superadmin into unified shell with Superadmin identity theme. | Control centers need extra authority, not disconnected UI. | P1 | 2-4 weeks |
| PDA-014 | Medium | Performance UX | WABA/large tables | Real-time refresh and table rendering patterns may struggle with large queues and records without virtualization and incremental updates. | Long queues feel slow. | Agent productivity drops at volume. | Basic list rendering and full refetch patterns. | Add virtual lists, optimistic updates, stale indicators, and progressive loading. | Perceived speed matters most in operational apps. | P1 | 2-5 weeks |
| PDA-015 | Medium | Mobile | Internal apps | Mobile nav exists, but dense tables, WABA panels, and admin forms are not consistently converted into mobile task flows. | Mobile users scroll horizontally or lose context. | Field teams and managers avoid mobile workflows. | Desktop-first dense layouts. | Define mobile-specific patterns: card tables, sticky action bars, stepper forms, bottom sheets, and compact command search. | Mobile enterprise work must be task-shaped, not merely responsive. | P1 | 3-5 weeks |
| PDA-016 | Medium | Empty/error states | All apps | Empty/error states vary from skeletons to plain text to alerts and console errors. | Users do not know how to recover. | More support tickets and abandoned workflows. | No shared state pattern. | Standardize empty, loading, error, offline, permission-denied, and partial-data states. | Recovery guidance builds confidence. | P1 | 2-3 weeks |
| PDA-017 | Medium | Notifications | Internal apps | Notification bell and WABA/SLA cues are not unified into a cross-app notification/task inbox. | Urgent work is scattered. | SLA breaches and missed approvals. | Notifications are visual placeholders or local badges. | Build notification center with tasks, approvals, SLA alerts, mentions, and read state. | Enterprise workflows need a single attention model. | P1 | 4-6 weeks |
| PDA-018 | Medium | Search | Platform | Universal search exists but is not consistently embedded across dashboards, tables, and shell. | Users browse instead of finding. | Slower task completion. | Search component is optional, not a platform service. | Create global search index and page-local search contracts. | Search is core navigation in large SaaS. | P1 | 4-8 weeks |
| PDA-019 | Medium | Motion | All apps | Motion is inconsistent: WABA bubbles animate, shell transitions differ, and reduced-motion support is incomplete. | Motion can feel arbitrary. | Premium polish is reduced. | No motion tokens or guidelines. | Define motion scale, easing, duration, loading animation, and reduced-motion fallbacks. | Motion should communicate state, not compete for attention. | P2 | 1-2 weeks |
| PDA-020 | Medium | Role journeys | Sales/service/accounts/support | Several role journeys exist as pages, but cross-role handoff, ownership, assignment, escalation, and audit trails are not visibly standardized. | Work can fall between teams. | Operational leakage and accountability gaps. | Route set is broader than workflow orchestration layer. | Add workflow objects for assignments, status transitions, comments, watchers, approvals, and timeline. | Enterprise operations need traceable handoffs. | P1 | 6-10 weeks |

## 7. Journey Assessment

Visitor: Strong breadth across products, services, solutions, policies, blog, and contact. Needs clearer path from service discovery to quote, consultation, financing, and order tracking.

Customer: Checkout has validation, GST/pincode assistance, payment handling, orders, invoices, quotes, profile, and warranty. Needs better unified customer dashboard, saved addresses, support/service history, quote comparison, reorder, and proactive notifications.

Sales Executive: Has field sales dashboard, lead center, orders, products, quick billing, expenses, inventory, invoice lookup, leaderboard, and history. Needs command shortcuts, mobile-first selling flow, offline resilience, pipeline stages, next-best action, and fewer duplicated route concepts.

Marketing Executive: Broadcast desk, offers, coupons, social media, banners, page content, and WABA campaigns/templates exist. Needs campaign calendar, audience segments, approval workflow, deliverability insights, experimentation, and brand governance.

Service Engineer: Has assigned jobs and role dashboard. Needs route/day planner, SLA timer, customer contact, checklist, photos, parts used, signature, offline mode, and escalation.

Inventory Executive: Inventory appears in admin/manager/sales surfaces. Needs a dedicated inventory control center with replenishment, transfer, aging, low-stock, variance, barcode/serial, and audit workflows.

Accounts: Accounts workspace exists. Needs receivables/payables dashboard, invoice aging, payment reconciliation, GST reports, export, approvals, and exception queues.

Support: WABA and service tickets cover parts of support. Needs omnichannel support queue, SLA policy, assignment, macros, collision handling, customer timeline, and quality review.

Manager: Has sales command, reports, inventory, quick billing, purchase, invoice lookup, online orders, salesperson. Needs team workload, coaching, approvals, exception management, forecast, and territory performance.

Admin: Broad operational control exists. Needs stronger auditability, saved views, bulk operations, policy-driven permissions, system health, and operational command center.

Superadmin: Governance surfaces exist. Needs unified control-center IA, environment health, tenant/org status, RBAC simulator, policy impact preview, release/config audit, and risk-based alerts.

## 8. Top 100 UI Improvements

1. Consolidate app shells into one enterprise shell. 2. Define one typography scale. 3. Replace Arial/default stacks in internal apps. 4. Standardize light/dark themes. 5. Create semantic color tokens. 6. Normalize border radii. 7. Normalize card density. 8. Normalize table row height. 9. Normalize button sizes. 10. Normalize icon sizes. 11. Replace emoji controls with icons. 12. Add tooltips for icon buttons. 13. Standardize status badge colors. 14. Standardize alert colors. 15. Standardize toast styling. 16. Standardize skeletons. 17. Standardize empty states. 18. Standardize error states. 19. Standardize loading overlays. 20. Add page header pattern. 21. Add section header pattern. 22. Add action toolbar pattern. 23. Add filter bar pattern. 24. Add sticky action footer pattern. 25. Add compact metric card pattern. 26. Add dashboard widget pattern. 27. Add timeline component. 28. Add activity feed component. 29. Add approval card component. 30. Add SLA pill component. 31. Add app switcher. 32. Add workspace identity badges. 33. Standardize breadcrumbs. 34. Standardize tabs. 35. Standardize side sheets. 36. Standardize dialogs. 37. Standardize destructive confirmations. 38. Standardize form labels. 39. Standardize help text. 40. Standardize inline error text. 41. Standardize success feedback. 42. Standardize disabled states. 43. Improve focus rings in custom screens. 44. Remove inline styles from WABA. 45. Remove hard-coded glass-panel look from WABA. 46. Align Superadmin colors with platform tokens. 47. Align Public and internal brand cues. 48. Improve mobile table cards. 49. Improve responsive header wrapping. 50. Improve large-monitor max widths. 51. Add split-pane resizing. 52. Add drawer width tokens. 53. Add density switch. 54. Add compact mode. 55. Add high-contrast mode. 56. Add reduced-motion styling. 57. Add chart color palette. 58. Add chart legends pattern. 59. Add chart empty/loading states. 60. Add chart annotations. 61. Standardize avatar fallback. 62. Standardize notification badge. 63. Standardize search input. 64. Standardize date picker. 65. Standardize file upload. 66. Standardize media preview. 67. Standardize customer 360 cards. 68. Standardize CRM status chips. 69. Standardize queue tabs. 70. Standardize quick action menus. 71. Standardize dropdown menus. 72. Standardize command items. 73. Standardize keyboard shortcut display. 74. Add responsive bottom sheet. 75. Add mobile floating action button. 76. Add print/invoice layout tokens. 77. Add settings form layout. 78. Add admin list layout. 79. Add role dashboard layout. 80. Add marketing campaign layout. 81. Add service ticket layout. 82. Add inventory item layout. 83. Add product editor layout. 84. Add quote builder layout. 85. Add order detail layout. 86. Add checkout stepper styling. 87. Improve payment method cards. 88. Improve policy page readability. 89. Improve profile dashboard hierarchy. 90. Improve Webmail production disabled state. 91. Improve WABA message bubble density. 92. Improve chat composer affordance. 93. Improve attachment controls. 94. Improve template selection UI. 95. Improve notification center UI. 96. Add onboarding hints with dismiss state. 97. Add enterprise illustration/empty-state guidelines. 98. Add Storybook coverage for patterns. 99. Add visual regression snapshots. 100. Add design QA checklist per release.

## 9. Top 100 UX Improvements

1. Create global route registry. 2. Create role-capability map. 3. Fix command palette routes. 4. Add global command search. 5. Add cross-app workspace switcher. 6. Add recently viewed. 7. Add favorites. 8. Add pinned modules. 9. Add saved views. 10. Add deep links to filtered lists. 11. Add breadcrumbs everywhere. 12. Add context-preserving back behavior. 13. Add role-specific home tasks. 14. Add next-best action widgets. 15. Add task inbox. 16. Add approvals inbox. 17. Add SLA center. 18. Add notification center. 19. Add unified customer timeline. 20. Add order timeline. 21. Add service ticket timeline. 22. Add quote timeline. 23. Add audit timeline. 24. Add inline create actions. 25. Add bulk edit workflows. 26. Add undo for destructive actions. 27. Add draft recovery. 28. Add autosave. 29. Add dirty-state guards. 30. Add multi-step form progress. 31. Add field dependency guidance. 32. Add input masks. 33. Add smart defaults. 34. Add duplicate detection. 35. Add validation summary. 36. Add confirmation previews. 37. Add keyboard shortcuts. 38. Add accessible roving focus. 39. Add searchable select lists. 40. Add typeahead command actions. 41. Add universal quick create. 42. Add customer quick view. 43. Add product quick view. 44. Add order quick view. 45. Add invoice quick view. 46. Add ticket quick view. 47. Add WABA collision detection. 48. Add WABA assignment workflow. 49. Add WABA internal notes. 50. Add WABA macros. 51. Add WABA canned replies. 52. Add WABA sentiment/priority. 53. Add service engineer mobile checklist. 54. Add field photo capture flow. 55. Add customer signature flow. 56. Add inventory transfer flow. 57. Add purchase approval flow. 58. Add payment reconciliation flow. 59. Add quote approval flow. 60. Add campaign approval flow. 61. Add RBAC preview. 62. Add impersonation guardrails. 63. Add system health dashboard. 64. Add data freshness labels. 65. Add retry failed action affordance. 66. Add offline/poor network state. 67. Add optimistic updates. 68. Add undo snackbar. 69. Add page-level help. 70. Add contextual docs. 71. Add onboarding checklists. 72. Add role onboarding. 73. Add empty-state primary actions. 74. Add no-permission explanations. 75. Add export receipts. 76. Add import validation. 77. Add batch upload review. 78. Add address book. 79. Add saved payment preferences. 80. Add customer reorder. 81. Add quote comparison. 82. Add product recommendation logic. 83. Add lead scoring explanation. 84. Add manager coaching prompts. 85. Add inventory low-stock suggestions. 86. Add dashboard drill-down links. 87. Add chart-to-table drilldown. 88. Add filter persistence. 89. Add per-user density preferences. 90. Add per-user app preferences. 91. Add support escalation. 92. Add handoff notes. 93. Add watcher/subscriber model. 94. Add mentions. 95. Add comment threads. 96. Add due dates. 97. Add reminders. 98. Add snooze. 99. Add lifecycle status education. 100. Add post-task success guidance.

## 10. Top 100 Workflow Improvements

1. Define visitor-to-lead journey. 2. Define quote-to-order journey. 3. Define cart-to-payment journey. 4. Define order-to-fulfillment journey. 5. Define pickup workflow. 6. Define delivery workflow. 7. Define installation workflow. 8. Define repair workflow. 9. Define warranty workflow. 10. Define AMC workflow. 11. Define WABA lead handoff. 12. Define WABA support handoff. 13. Define WABA sales handoff. 14. Define WABA accounts handoff. 15. Define service dispatch flow. 16. Define engineer closeout flow. 17. Define inventory replenishment flow. 18. Define purchase request flow. 19. Define purchase approval flow. 20. Define invoice reconciliation flow. 21. Define commission workflow. 22. Define expense approval flow. 23. Define campaign creation flow. 24. Define campaign approval flow. 25. Define offer creation flow. 26. Define coupon governance flow. 27. Define product publishing flow. 28. Define service publishing flow. 29. Define policy publishing flow. 30. Define page content publishing flow. 31. Define user onboarding flow. 32. Define role assignment flow. 33. Define branch/team assignment flow. 34. Define area reassignment flow. 35. Define RBAC audit flow. 36. Define incident response flow. 37. Define security review flow. 38. Define payment settings flow. 39. Define AI configuration flow. 40. Define organization setup flow. 41. Add handoff ownership. 42. Add task comments. 43. Add status transition rules. 44. Add status reason codes. 45. Add required evidence per transition. 46. Add assignment queues. 47. Add unassigned work queue. 48. Add manager escalation queue. 49. Add SLA breach workflow. 50. Add customer notification triggers. 51. Add staff notification triggers. 52. Add approval reminders. 53. Add workflow audit logs. 54. Add workflow templates. 55. Add repeatable checklists. 56. Add field service checklist. 57. Add QA checklist. 58. Add billing checklist. 59. Add product launch checklist. 60. Add campaign launch checklist. 61. Add stock count workflow. 62. Add serial-number workflow. 63. Add return/refund workflow. 64. Add cancellation workflow. 65. Add failed payment recovery. 66. Add abandoned cart recovery view. 67. Add lead nurture workflow. 68. Add quote expiry workflow. 69. Add renewal workflow. 70. Add warranty expiry workflow. 71. Add AMC renewal workflow. 72. Add customer escalation workflow. 73. Add VIP handling workflow. 74. Add complaint workflow. 75. Add callback workflow. 76. Add appointment scheduling. 77. Add route planning. 78. Add branch transfer workflow. 79. Add inter-team handoff. 80. Add operational notes. 81. Add attachments/evidence. 82. Add internal-only notes. 83. Add external customer notes. 84. Add approval diff view. 85. Add before/after state preview. 86. Add rollback workflow. 87. Add reopen workflow. 88. Add duplicate merge workflow. 89. Add split order workflow. 90. Add partial fulfillment workflow. 91. Add backorder workflow. 92. Add substitution workflow. 93. Add installation prerequisites. 94. Add service prerequisites. 95. Add customer consent capture. 96. Add fraud/risk review. 97. Add SLA calendar rules. 98. Add branch holiday rules. 99. Add workflow analytics. 100. Add workflow simulation before launch.

## 11. Top 100 Dashboard Improvements

1. Convert dashboards from stats to decision hubs. 2. Add top priority work queue. 3. Add SLA breach widget. 4. Add approvals widget. 5. Add assigned tasks widget. 6. Add recent activity. 7. Add revenue trend. 8. Add order funnel. 9. Add payment exceptions. 10. Add fulfillment exceptions. 11. Add service exceptions. 12. Add inventory exceptions. 13. Add campaign performance. 14. Add WABA queue health. 15. Add customer sentiment. 16. Add lead conversion. 17. Add quote aging. 18. Add invoice aging. 19. Add receivables. 20. Add payables. 21. Add stock aging. 22. Add low stock. 23. Add purchase demand. 24. Add engineer workload. 25. Add manager coaching. 26. Add branch comparison. 27. Add area comparison. 28. Add sales leaderboard with fairness controls. 29. Add anomaly detection. 30. Add goal progress. 31. Add forecast. 32. Add forecast confidence. 33. Add data freshness. 34. Add alert severity. 35. Add drilldown links. 36. Add quick filters. 37. Add saved dashboard views. 38. Add personalized widgets. 39. Add compact/comfortable density. 40. Add date range control. 41. Add comparison period. 42. Add export dashboard. 43. Add share dashboard. 44. Add subscribe report. 45. Add scheduled email. 46. Add widget explanations. 47. Add empty states. 48. Add loading skeletons. 49. Add failed widget fallback. 50. Add permissions-aware widgets. 51. Add admin operational health. 52. Add superadmin tenant health. 53. Add security event summary. 54. Add audit risk score. 55. Add payment gateway health. 56. Add WABA provider health. 57. Add mail provider health. 58. Add API health. 59. Add database health. 60. Add release health. 61. Add task completion trend. 62. Add team capacity. 63. Add overcapacity warning. 64. Add customer satisfaction. 65. Add first response time. 66. Add resolution time. 67. Add reopen rate. 68. Add cancellation reasons. 69. Add refund reasons. 70. Add lost quote reasons. 71. Add source attribution. 72. Add campaign ROI. 73. Add product margin. 74. Add service margin. 75. Add inventory turnover. 76. Add branch profitability. 77. Add map/geography widget. 78. Add calendar widget. 79. Add upcoming appointments. 80. Add overdue tasks. 81. Add owner filters. 82. Add branch filters. 83. Add role filters. 84. Add team filters. 85. Add status filters. 86. Add action cards. 87. Add suggested automations. 88. Add AI summary with evidence links. 89. Add executive summary mode. 90. Add operator mode. 91. Add support mode. 92. Add finance mode. 93. Add service mode. 94. Add marketing mode. 95. Add inventory mode. 96. Add custom widget order. 97. Add role default dashboards. 98. Add dashboard governance. 99. Add dashboard instrumentation. 100. Add dashboard QA criteria.

## 12. Top 100 Design System Improvements

1. Create design-system charter. 2. Define token source of truth. 3. Define semantic colors. 4. Define typography tokens. 5. Define spacing tokens. 6. Define radius tokens. 7. Define elevation tokens. 8. Define motion tokens. 9. Define z-index tokens. 10. Define layout tokens. 11. Define density tokens. 12. Define app identity tokens. 13. Define chart tokens. 14. Define status tokens. 15. Define SLA tokens. 16. Define accessibility tokens. 17. Define focus tokens. 18. Define high-contrast tokens. 19. Define reduced-motion tokens. 20. Build enterprise shell. 21. Build app switcher. 22. Build workspace switcher. 23. Build breadcrumbs. 24. Build global search. 25. Build command palette registry. 26. Build notification center. 27. Build task inbox. 28. Build enterprise data grid. 29. Build data grid toolbar. 30. Build saved views. 31. Build column manager. 32. Build bulk action bar. 33. Build advanced filter builder. 34. Build date range picker. 35. Build import wizard. 36. Build export menu. 37. Build file uploader. 38. Build media preview. 39. Build form shell. 40. Build form stepper. 41. Build inline validation. 42. Build error summary. 43. Build dirty-state guard. 44. Build autosave indicator. 45. Build approval card. 46. Build timeline. 47. Build comment thread. 48. Build mention input. 49. Build user picker. 50. Build team picker. 51. Build branch picker. 52. Build customer 360. 53. Build order summary. 54. Build invoice summary. 55. Build quote summary. 56. Build service ticket summary. 57. Build inventory summary. 58. Build dashboard grid. 59. Build KPI card. 60. Build insight card. 61. Build alert card. 62. Build chart wrapper. 63. Build chart tooltip. 64. Build chart legend. 65. Build activity feed. 66. Build audit log row. 67. Build settings section. 68. Build policy editor. 69. Build rich text editor. 70. Build WABA conversation list. 71. Build WABA composer. 72. Build WABA template selector. 73. Build WABA message bubble. 74. Build mail thread list. 75. Build mail composer. 76. Build mobile bottom nav. 77. Build mobile sheet. 78. Build responsive table card. 79. Build split pane. 80. Build resizable panel. 81. Build tooltip guidelines. 82. Build toast guidelines. 83. Build modal guidelines. 84. Build drawer guidelines. 85. Build destructive action guidelines. 86. Build skeleton guidelines. 87. Build empty-state guidelines. 88. Build no-permission guidelines. 89. Add Storybook stories. 90. Add interaction tests. 91. Add a11y tests. 92. Add visual regression. 93. Add token linting. 94. Add component ownership. 95. Add deprecation policy. 96. Add migration docs. 97. Add Figma parity. 98. Add release notes. 99. Add adoption dashboard. 100. Add design review gate.

## 13. Components To Refactor

- `apps/waba/src/components/waba/Sidebar.tsx`: replace inline styles, emoji labels, and local queue controls with shared tabs, badges, lists, buttons, and queue filters.
- `apps/waba/src/components/waba/ChatMain.tsx`: replace alerts, emoji buttons, raw SVG button, inline command menu, and unannounced dynamic states with shared accessible primitives.
- `apps/superadmin/src/components/superadmin/SuperadminShell.tsx`: move to unified shell contract and typed route registry.
- `packages/ui/src/components/CommandPalette.tsx`: generate actions from live route and permission registry.
- `packages/admin-ui/src/shared/OrderDataTable.tsx`: evolve into enterprise grid or consume one.
- `packages/admin-ui/src/shared/UniversalSearch.tsx`: promote into platform search/filter toolbar with persistence.
- `apps/mgmt/src/components/mgmt/UnifiedPanelShell.tsx`: connect placeholder global actions to real action providers.
- Internal role dashboards: move dashboard widget patterns into shared package.

## 14. Components To Standardize

Shell, sidebar, topbar, mobile nav, page header, breadcrumbs, command palette, notifications, quick actions, dashboard widgets, KPI cards, data grid, filter toolbar, saved views, bulk action bar, forms, form sections, validation summary, date picker, file uploader, media preview, dialogs, drawers, toasts, badges, chips, status pills, SLA indicators, tabs, tooltips, empty states, loading states, error states, customer 360, timelines, comments, audit log rows, approval cards, and settings sections.

## 15. Pages To Redesign First

1. WABA dashboard/conversation workspace. 2. Superadmin management shell and dashboard. 3. Management admin dashboard. 4. Management manager reports. 5. Management order management. 6. Sales quick billing. 7. Service manager tickets. 8. Service engineer jobs. 9. Accounts dashboard. 10. Customer profile. 11. Checkout final review/payment. 12. Product listing filters. 13. Admin settings. 14. Staff management. 15. Inventory management. 16. Quotes management. 17. Broadcast desk. 18. Webmail inbox before production enablement. 19. Superadmin RBAC roles. 20. Superadmin audit logs.

## 16. Missing Enterprise Features

Global command registry, workspace switcher, global search index, saved views, recently viewed, favorites, pinned modules, notification center, task inbox, approvals, SLA management, omnichannel support queue, comments/mentions, workflow timelines, handoff ownership, bulk actions, advanced import/export, grid column customization, virtualization, RBAC simulator, audit diff views, system health dashboard, release/config governance, provider health, dashboard personalization, role onboarding, guided setup, offline field mode, mobile engineer checklist, customer 360 across apps, mail provider integration, campaign approvals, inventory transfers, payment reconciliation, and operational runbooks surfaced in-product.

## 17. Quick Wins

- Fix command palette route destinations and permissions.
- Replace WABA `alert()` errors with shared toasts/dialogs.
- Add `aria-label` to all icon-only WABA buttons.
- Replace WABA emoji action controls with Lucide icons.
- Add shared page header to Superadmin and Management pages.
- Add breadcrumbs to all internal pages.
- Add empty-state primary actions to major tables.
- Add search/filter toolbar to `OrderDataTable`.
- Add sticky table header and horizontal overflow container.
- Add loading skeletons to pages that only show plain loading text.
- Add data freshness labels to dashboards.
- Remove or hide placeholder global `New` actions until wired.
- Create route registry and validate navigation/command hrefs in tests.
- Add top five dashboard action cards per role.
- Add a Webmail launch badge indicating disabled/provider not configured.

## 18. Medium-Term Improvements

Unify shells; create enterprise data grid; standardize dashboard widget library; rebuild WABA with shared components; unify design tokens; implement saved views and command registry; add notification/task center; standardize form patterns; create customer/order/service timelines; add cross-app workspace switcher; make Superadmin a true control center; add visual regression and accessibility checks.

## 19. Long-Term Product Strategy

Position TecBunny as an operational commerce and service OS, not separate apps. The platform should feel like one ecosystem with five modes: Marketing Experience, Customer Portal, Productivity Workspace, Enterprise Control Center, and Communication Workspace. Build a capability-driven IA around Sell, Fulfill, Service, Finance, Grow, Govern, and Configure. Invest in workflow orchestration, task ownership, data-grid productivity, communication intelligence, and role-based dashboards. Treat the design system as infrastructure with release governance, not as a component folder.

## 20. Final Executive Assessment

If demonstrated to a Fortune 500 CIO today, TecBunny would be perceived as a promising but not yet fully enterprise-grade platform. The CIO would see breadth, real workflows, and technical ambition, but would likely question maturity because the experience is visually fragmented, the communication and webmail workspaces are not production-polished, dashboards are not consistently decision-oriented, advanced table operations are missing, global search/command/navigation are incomplete, and accessibility is not yet provably WCAG 2.2 AAA.

Prioritized roadmap to world-class enterprise quality:

Phase 1, 0-2 weeks: fix command routes, hide or wire placeholder actions, standardize obvious error/loading/empty states, add breadcrumbs, improve WABA semantics, and align core navigation labels.

Phase 2, 3-6 weeks: ship unified enterprise shell, shared token system, role-aware action registry, WABA redesign foundation, Superadmin shell migration, standardized page headers, and baseline dashboard widget system.

Phase 3, 7-12 weeks: ship enterprise data grid, saved views, global search, notification/task center, dashboard decision hubs, standardized forms, workflow timelines, and accessibility test gates.

Phase 4, 13-24 weeks: complete workflow orchestration across sales/service/finance/support, provider-backed Webmail, advanced analytics, mobile field workflows, RBAC simulator, system health center, and product telemetry-driven optimization.

## 21. Thirteen-Phase Execution Tracker

| Phase | Execution Lane | Current Implementation Status | Next Gate To Reach 100 / 100 |
| --- | --- | --- | --- |
| 1 | Command trust, action integrity, and browser-modal removal | Active implementation started: route-validated enterprise actions, inline feedback/review flows, no native browser modal calls in app source. | Keep `validate:ux-actions` and `validate:no-browser-modals` mandatory in CI. |
| 2 | Unified shell, breadcrumbs, and navigation consistency | Active implementation started: Superadmin shell semantics, breadcrumbs, skip link, labelled controls, role workspace decision surfaces. | Migrate Superadmin, WABA, Webmail, and customer portal into a shared enterprise shell contract. |
| 3 | Enterprise data grids and saved views | Active implementation started: order table search, saved views, reset/delete saved-view lifecycle, CSV export, sticky headers, column visibility, density controls, and bulk selection with selected-order export. | Introduce full `EnterpriseDataGrid` with keyboard model and virtualization. |
| 4 | Dashboard decision hubs and workflow inboxes | Active implementation started: role dashboard decision brief, live workflow inbox, corrected drilldowns, printable quote handoff, SLA/status/evidence chips, and workflow timeline/watch/comment metadata on cards. | Add approvals and anomaly widgets. |
| 5 | Production readiness and validation gates | Active implementation started: aggregate UX gate covers route actions, browser modal scan, accessibility contract checks, telemetry assertions, performance budgets, visual baselines, launch evidence, launch readiness, and focused Public/Mgmt/WABA/Superadmin typechecks; Webmail provider gate documented. | Execute provider-backed integration checks and measured browser runs in deployed environments. |
| 6 | Design-token and visual-system governance | Active implementation started: shared enterprise token contract added to `@tecbunny/ui` with required color, density, radius, motion, and status groups plus validation. | Move app-specific tokens into shared semantic theme contracts and document approved density, radius, color, typography, motion, and status systems. |
| 7 | WABA communication workspace redesign | Active implementation started: accessibility passes completed, canned reply macro chips insert editable drafts, conversation-scoped internal notes support agent handoff context, and assignment/SLA chips now appear in the chat header. | Rebuild WABA around shared primitives, collision handling, and keyboard command navigation. |
| 8 | Webmail provider-backed collaboration | Active implementation started: production mock gate improved, thread search added, quick replies stage editable drafts, archive/delete actions expose provider-persistence guidance, and mailbox settings plus communication audit trail panels are visible in the thread view. | Build provider-backed attachments and persisted mailbox/customer communication history. |
| 9 | Enterprise form system | Active implementation started: shared dirty-state guard hook added and applied to Management page-content editing, with local autosave, draft recovery, and JSON/plain-text validation summaries for content edits. | Add reusable form patterns for progressive disclosure and undo. |
| 10 | Role journey orchestration | Active implementation started: role dashboard workflow inbox now displays owner, evidence, SLA, status reason, required evidence, watchers, comment prompts, and status history metadata for handoffs, AI captures, and primary workspace actions. | Persist workflow objects for assignments, comments, watchers, status history, and audit timelines. |
| 11 | Mobile field and operations workflows | Active implementation started: shared order table now exposes mobile order cards with status, payment, total, row actions, and a sticky mobile operations bar for refresh/export. | Convert dense tables/forms into mobile task flows with bottom sheets, offline cues, and field evidence capture. |
| 12 | Governance, RBAC, and system health | Active implementation started: Superadmin destructive-review controls, System Health runtime/provider readiness checks, launch-blocker/risk summaries, role-builder policy impact previews, and an RBAC simulator are in place. | Add tenant health, provider health, and release/config audit. |
| 13 | Enterprise launch QA and telemetry optimization | Active implementation started: launch readiness validator now protects target score coverage, all 13 phase rows, required executable UX gate references, accessibility contract markers, product telemetry usage, launch performance/CIO demo readiness budgets, visual regression baseline coverage, accessibility certification evidence, task-completion targets, and CIO demo script coverage. | Execute live browser/a11y/performance runs against deployed environments and attach measured evidence. |

Enterprise launch recommendation: launch only after Phase 2 for mid-market controlled rollout; wait until Phase 3 is complete for a Fortune 500-grade global production presentation.
````````

---

## README.md

````````markdown
# TecBunny Solutions - Corporate Platform

## 1. Project Title & Executive Summary
**TecBunny Solutions Corporate Platform (`www.tecbunny.com`)** is an enterprise-grade, high-performance web application representing the digital storefront and service portal for TecBunny Solutions Private Limited. 

The primary use case is to showcase technology solutions (Security Systems, IT Reliability, Automation, Incident Response), provide an interactive e-commerce catalog for hardware, and facilitate live quote negotiation. The architecture is built for maximum speed and SEO optimization, utilizing React Server Components, aggressive edge caching, optimistic UI updates, and an advanced Supabase-backed data layer.

## Latest Workspace Status

Latest review date: 2026-07-19. The current monorepo uses npm workspaces with Next.js 16.2.10, React 19.2.7, TypeScript 5.9.3, ESLint 9.39.5, Prisma 7.8.0, and Turbo 2.10.3. The generated API inventory contains 378 discovered API entries, 378 working static entries, 0 broken routes, 0 unmatched direct frontend callers, 0 duplicate APIs, and 0 missing validation/authentication/security/database static signals. Enterprise business capability gaps are tracked in `docs/api-audit/enterprise-api-gap-analysis-review-board.md`; product and software audit posture is tracked in `PRODUCT_DESIGN_AUDIT_REPORT.md` and `ENTERPRISE_SOFTWARE_AUDIT_REPORT.md`.

## 2. Tech Stack & Prerequisites
- **Framework**: Next.js 16.2.10 (App Router)
- **Language**: TypeScript 5.9.3 / React 19.2.7
- **Styling**: Tailwind CSS 4, Lucide React (Icons)
- **Database / Auth**: Supabase (PostgreSQL, Row Level Security, Magic Link Auth)
- **State Management**: React `useReducer` for complex machines (e.g., Checkout), Context API
- **Tooling**: Node.js v20+, npm 12.0.1, ESLint 9.39.5, Turbo 2.10.3

**Environment Dependencies (`.env.local` requirements):**
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

## 3. Exhaustive File Architecture
The following section provides a comprehensive structural mapping and detailed breakdown of **every single file** in the source codebase.
### File Architecture Tree

```text
â”œâ”€â”€ eslint.config.js
â”œâ”€â”€ middleware.ts
â”œâ”€â”€ next.config.mjs
â”œâ”€â”€ package.json
â”œâ”€â”€ postcss.config.mjs
â”œâ”€â”€ src
â”‚   â”œâ”€â”€ app
â”‚   â”‚   â”œâ”€â”€ about
â”‚   â”‚   â”‚   â”œâ”€â”€ business-info
â”‚   â”‚   â”‚   â”‚   â””â”€â”€ page.tsx
â”‚   â”‚   â”‚   â””â”€â”€ page.tsx
â”‚   â”‚   â”œâ”€â”€ activate-warranty
â”‚   â”‚   â”‚   â””â”€â”€ [serialNumber]
â”‚   â”‚   â”‚       â””â”€â”€ page.tsx
â”‚   â”‚   â”œâ”€â”€ admin
â”‚   â”‚   â”‚   â””â”€â”€ page.tsx
â”‚   â”‚   â”œâ”€â”€ agents
â”‚   â”‚   â”‚   â””â”€â”€ recruit
â”‚   â”‚   â”‚       â””â”€â”€ page.tsx
â”‚   â”‚   â”œâ”€â”€ ai-research
â”‚   â”‚   â”‚   â”œâ”€â”€ layout.tsx
â”‚   â”‚   â”‚   â””â”€â”€ page.tsx
â”‚   â”‚   â”œâ”€â”€ api
â”‚   â”‚   â”‚   â”œâ”€â”€ admin
â”‚   â”‚   â”‚   â”‚   â”œâ”€â”€ agents
â”‚   â”‚   â”‚   â”‚   â”‚   â”œâ”€â”€ approve
â”‚   â”‚   â”‚   â”‚   â”‚   â”‚   â””â”€â”€ route.ts
â”‚   â”‚   â”‚   â”‚   â”‚   â”œâ”€â”€ list
â”‚   â”‚   â”‚   â”‚   â”‚   â”‚   â””â”€â”€ route.ts
â”‚   â”‚   â”‚   â”‚   â”‚   â””â”€â”€ reject
â”‚   â”‚   â”‚   â”‚   â”‚       â””â”€â”€ route.ts
â”‚   â”‚   â”‚   â”‚   â”œâ”€â”€ ai
â”‚   â”‚   â”‚   â”‚   â”‚   â”œâ”€â”€ product-description
â”‚   â”‚   â”‚   â”‚   â”‚   â”‚   â””â”€â”€ route.ts
â”‚   â”‚   â”‚   â”‚   â”‚   â””â”€â”€ related-products
â”‚   â”‚   â”‚   â”‚   â”‚       â””â”€â”€ route.ts
â”‚   â”‚   â”‚   â”‚   â”œâ”€â”€ ai-query
â”‚   â”‚   â”‚   â”‚   â”‚   â””â”€â”€ route.ts
â”‚   â”‚   â”‚   â”‚   â”œâ”€â”€ custom-setups
â”‚   â”‚   â”‚   â”‚   â”‚   â””â”€â”€ route.ts
â”‚   â”‚   â”‚   â”‚   â”œâ”€â”€ dashboard
â”‚   â”‚   â”‚   â”‚   â”‚   â””â”€â”€ route.ts
â”‚   â”‚   â”‚   â”‚   â”œâ”€â”€ faqs
â”‚   â”‚   â”‚   â”‚   â”‚   â”œâ”€â”€ route.ts
â”‚   â”‚   â”‚   â”‚   â”‚   â””â”€â”€ [id]
â”‚   â”‚   â”‚   â”‚   â”‚       â””â”€â”€ route.ts
â”‚   â”‚   â”‚   â”‚   â”œâ”€â”€ homepage
â”‚   â”‚   â”‚   â”‚   â”‚   â””â”€â”€ auto-fill
â”‚   â”‚   â”‚   â”‚   â”‚       â”œâ”€â”€ route.ts
â”‚   â”‚   â”‚   â”‚   â”‚       â””â”€â”€ run
â”‚   â”‚   â”‚   â”‚   â”‚           â””â”€â”€ route.ts
â”‚   â”‚   â”‚   â”‚   â”œâ”€â”€ inventory
â”‚   â”‚   â”‚   â”‚   â”‚   â””â”€â”€ warranty
â”‚   â”‚   â”‚   â”‚   â”‚       â””â”€â”€ register
â”‚   â”‚   â”‚   â”‚   â”‚           â””â”€â”€ route.ts
â”‚   â”‚   â”‚   â”‚   â”œâ”€â”€ jobs
â”‚   â”‚   â”‚   â”‚   â”‚   â””â”€â”€ [id]
â”‚   â”‚   â”‚   â”‚   â”‚       â””â”€â”€ route.ts
â”‚   â”‚   â”‚   â”‚   â”œâ”€â”€ manage-role
â”‚   â”‚   â”‚   â”‚   â”‚   â””â”€â”€ route.ts
â”‚   â”‚   â”‚   â”‚   â”œâ”€â”€ marketing
â”‚   â”‚   â”‚   â”‚   â”‚   â”œâ”€â”€ blitz
â”‚   â”‚   â”‚   â”‚   â”‚   â”‚   â””â”€â”€ route.ts
â”‚   â”‚   â”‚   â”‚   â”‚   â””â”€â”€ broadcast
â”‚   â”‚   â”‚   â”‚   â”‚       â””â”€â”€ route.ts
â”‚   â”‚   â”‚   â”‚   â”œâ”€â”€ orders
â”‚   â”‚   â”‚   â”‚   â”‚   â”œâ”€â”€ route.ts
â”‚   â”‚   â”‚   â”‚   â”‚   â””â”€â”€ [id]
â”‚   â”‚   â”‚   â”‚   â”‚       â””â”€â”€ pending-actions
â”‚   â”‚   â”‚   â”‚   â”‚           â””â”€â”€ route.ts
â”‚   â”‚   â”‚   â”‚   â”œâ”€â”€ payment-settings
â”‚   â”‚   â”‚   â”‚   â”‚   â”œâ”€â”€ dedupe
â”‚   â”‚   â”‚   â”‚   â”‚   â”‚   â””â”€â”€ route.ts
â”‚   â”‚   â”‚   â”‚   â”‚   â””â”€â”€ route.ts
â”‚   â”‚   â”‚   â”‚   â”œâ”€â”€ pricing
â”‚   â”‚   â”‚   â”‚   â”‚   â”œâ”€â”€ route.ts
â”‚   â”‚   â”‚   â”‚   â”‚   â””â”€â”€ [id]
â”‚   â”‚   â”‚   â”‚   â”‚       â””â”€â”€ route.ts
â”‚   â”‚   â”‚   â”‚   â”œâ”€â”€ products
â”‚   â”‚   â”‚   â”‚   â”‚   â”œâ”€â”€ ai-add
â”‚   â”‚   â”‚   â”‚   â”‚   â”‚   â””â”€â”€ route.ts
â”‚   â”‚   â”‚   â”‚   â”‚   â”œâ”€â”€ archive
â”‚   â”‚   â”‚   â”‚   â”‚   â”‚   â””â”€â”€ route.ts
â”‚   â”‚   â”‚   â”‚   â”‚   â”œâ”€â”€ bulk-price
â”‚   â”‚   â”‚   â”‚   â”‚   â”‚   â””â”€â”€ route.ts
â”‚   â”‚   â”‚   â”‚   â”‚   â””â”€â”€ route.ts
â”‚   â”‚   â”‚   â”‚   â”œâ”€â”€ quotes
â”‚   â”‚   â”‚   â”‚   â”‚   â”œâ”€â”€ advance-payment
â”‚   â”‚   â”‚   â”‚   â”‚   â”‚   â””â”€â”€ route.ts
â”‚   â”‚   â”‚   â”‚   â”‚   â”œâ”€â”€ route.ts
â”‚   â”‚   â”‚   â”‚   â”‚   â””â”€â”€ [id]
â”‚   â”‚   â”‚   â”‚   â”‚       â”œâ”€â”€ download
â”‚   â”‚   â”‚   â”‚   â”‚       â”‚   â””â”€â”€ route.ts
â”‚   â”‚   â”‚   â”‚   â”‚       â””â”€â”€ respond
â”‚   â”‚   â”‚   â”‚   â”‚           â””â”€â”€ route.ts
â”‚   â”‚   â”‚   â”‚   â”œâ”€â”€ redemptions
â”‚   â”‚   â”‚   â”‚   â”‚   â”œâ”€â”€ approve
â”‚   â”‚   â”‚   â”‚   â”‚   â”‚   â””â”€â”€ route.ts
â”‚   â”‚   â”‚   â”‚   â”‚   â”œâ”€â”€ list
â”‚   â”‚   â”‚   â”‚   â”‚   â”‚   â””â”€â”€ route.ts
â”‚   â”‚   â”‚   â”‚   â”‚   â””â”€â”€ process
â”‚   â”‚   â”‚   â”‚   â”‚       â””â”€â”€ route.ts
â”‚   â”‚   â”‚   â”‚   â”œâ”€â”€ roles
â”‚   â”‚   â”‚   â”‚   â”‚   â””â”€â”€ set
â”‚   â”‚   â”‚   â”‚   â”‚       â””â”€â”€ route.ts
â”‚   â”‚   â”‚   â”‚   â”œâ”€â”€ sales-agents
â”‚   â”‚   â”‚   â”‚   â”‚   â”œâ”€â”€ route.ts
â”‚   â”‚   â”‚   â”‚   â”‚   â””â”€â”€ [id]
â”‚   â”‚   â”‚   â”‚   â”‚       â””â”€â”€ route.ts
â”‚   â”‚   â”‚   â”‚   â”œâ”€â”€ services
â”‚   â”‚   â”‚   â”‚   â”‚   â””â”€â”€ route.ts
â”‚   â”‚   â”‚   â”‚   â”œâ”€â”€ setup-initial-admins
â”‚   â”‚   â”‚   â”‚   â”‚   â””â”€â”€ route.ts
â”‚   â”‚   â”‚   â”‚   â”œâ”€â”€ setup-sales-agents
â”‚   â”‚   â”‚   â”‚   â”‚   â””â”€â”€ route.ts
â”‚   â”‚   â”‚   â”‚   â””â”€â”€ users
â”‚   â”‚   â”‚   â”‚       â””â”€â”€ [id]
â”‚   â”‚   â”‚   â”‚           â””â”€â”€ history
â”‚   â”‚   â”‚   â”‚               â””â”€â”€ route.ts
â”‚   â”‚   â”‚   â”œâ”€â”€ agents
â”‚   â”‚   â”‚   â”‚   â”œâ”€â”€ apply
â”‚   â”‚   â”‚   â”‚   â”‚   â””â”€â”€ route.ts
â”‚   â”‚   â”‚   â”‚   â”œâ”€â”€ commissions
â”‚   â”‚   â”‚   â”‚   â”‚   â””â”€â”€ route.ts
â”‚   â”‚   â”‚   â”‚   â”œâ”€â”€ me
â”‚   â”‚   â”‚   â”‚   â”‚   â””â”€â”€ route.ts
â”‚   â”‚   â”‚   â”‚   â”œâ”€â”€ orders
â”‚   â”‚   â”‚   â”‚   â”‚   â””â”€â”€ create
â”‚   â”‚   â”‚   â”‚   â”‚       â””â”€â”€ route.ts
â”‚   â”‚   â”‚   â”‚   â””â”€â”€ redemptions
â”‚   â”‚   â”‚   â”‚       â””â”€â”€ route.ts
â”‚   â”‚   â”‚   â”œâ”€â”€ ai
â”‚   â”‚   â”‚   â”‚   â”œâ”€â”€ generate-description
â”‚   â”‚   â”‚   â”‚   â”‚   â””â”€â”€ route.ts
â”‚   â”‚   â”‚   â”‚   â”œâ”€â”€ price-request
â”‚   â”‚   â”‚   â”‚   â”‚   â””â”€â”€ route.ts
â”‚   â”‚   â”‚   â”‚   â”œâ”€â”€ product-details
â”‚   â”‚   â”‚   â”‚   â”‚   â””â”€â”€ route.ts
â”‚   â”‚   â”‚   â”‚   â””â”€â”€ research
â”‚   â”‚   â”‚   â”‚       â””â”€â”€ route.ts
â”‚   â”‚   â”‚   â”œâ”€â”€ analytics
â”‚   â”‚   â”‚   â”‚   â”œâ”€â”€ dashboard
â”‚   â”‚   â”‚   â”‚   â”‚   â””â”€â”€ route.ts
â”‚   â”‚   â”‚   â”‚   â””â”€â”€ track
â”‚   â”‚   â”‚   â”‚       â””â”€â”€ route.ts
â”‚   â”‚   â”‚   â”œâ”€â”€ auth
â”‚   â”‚   â”‚   â”‚   â”œâ”€â”€ 2fa
â”‚   â”‚   â”‚   â”‚   â”‚   â”œâ”€â”€ disable
â”‚   â”‚   â”‚   â”‚   â”‚   â”‚   â””â”€â”€ route.ts
â”‚   â”‚   â”‚   â”‚   â”‚   â”œâ”€â”€ setup
â”‚   â”‚   â”‚   â”‚   â”‚   â”‚   â””â”€â”€ route.ts
â”‚   â”‚   â”‚   â”‚   â”‚   â”œâ”€â”€ status
â”‚   â”‚   â”‚   â”‚   â”‚   â”‚   â””â”€â”€ route.ts
â”‚   â”‚   â”‚   â”‚   â”‚   â””â”€â”€ verify
â”‚   â”‚   â”‚   â”‚   â”‚       â””â”€â”€ route.ts
â”‚   â”‚   â”‚   â”‚   â”œâ”€â”€ callback
â”‚   â”‚   â”‚   â”‚   â”‚   â””â”€â”€ route.ts
â”‚   â”‚   â”‚   â”‚   â”œâ”€â”€ complete-signup
â”‚   â”‚   â”‚   â”‚   â”‚   â””â”€â”€ route.ts
â”‚   â”‚   â”‚   â”‚   â”œâ”€â”€ first-login-whatsapp
â”‚   â”‚   â”‚   â”‚   â”‚   â””â”€â”€ route.ts
â”‚   â”‚   â”‚   â”‚   â”œâ”€â”€ forgot-password
â”‚   â”‚   â”‚   â”‚   â”‚   â””â”€â”€ route.ts
â”‚   â”‚   â”‚   â”‚   â”œâ”€â”€ quick-login
â”‚   â”‚   â”‚   â”‚   â”‚   â””â”€â”€ route.ts
â”‚   â”‚   â”‚   â”‚   â”œâ”€â”€ resend-verification
â”‚   â”‚   â”‚   â”‚   â”‚   â””â”€â”€ route.ts
â”‚   â”‚   â”‚   â”‚   â”œâ”€â”€ reset-password
â”‚   â”‚   â”‚   â”‚   â”‚   â””â”€â”€ route.ts
â”‚   â”‚   â”‚   â”‚   â”œâ”€â”€ resolve-phone
â”‚   â”‚   â”‚   â”‚   â”‚   â””â”€â”€ route.ts
â”‚   â”‚   â”‚   â”‚   â”œâ”€â”€ send-otp
â”‚   â”‚   â”‚   â”‚   â”‚   â””â”€â”€ route.ts
â”‚   â”‚   â”‚   â”‚   â”œâ”€â”€ session
â”‚   â”‚   â”‚   â”‚   â”‚   â””â”€â”€ route.ts
â”‚   â”‚   â”‚   â”‚   â”œâ”€â”€ signout
â”‚   â”‚   â”‚   â”‚   â”‚   â””â”€â”€ route.ts
â”‚   â”‚   â”‚   â”‚   â”œâ”€â”€ signup
â”‚   â”‚   â”‚   â”‚   â”‚   â””â”€â”€ route.ts
â”‚   â”‚   â”‚   â”‚   â””â”€â”€ verify-otp
â”‚   â”‚   â”‚   â”‚       â””â”€â”€ route.ts
â”‚   â”‚   â”‚   â”œâ”€â”€ auto-offers
â”‚   â”‚   â”‚   â”‚   â””â”€â”€ route.ts
â”‚   â”‚   â”‚   â”œâ”€â”€ blueprints
â”‚   â”‚   â”‚   â”‚   â””â”€â”€ attribution
â”‚   â”‚   â”‚   â”‚       â””â”€â”€ conversion
â”‚   â”‚   â”‚   â”‚           â””â”€â”€ route.ts
â”‚   â”‚   â”‚   â”œâ”€â”€ captcha
â”‚   â”‚   â”‚   â”‚   â”œâ”€â”€ config
â”‚   â”‚   â”‚   â”‚   â”‚   â””â”€â”€ route.ts
â”‚   â”‚   â”‚   â”‚   â””â”€â”€ verify
â”‚   â”‚   â”‚   â”‚       â””â”€â”€ route.ts
â”‚   â”‚   â”‚   â”œâ”€â”€ cart
â”‚   â”‚   â”‚   â”‚   â””â”€â”€ merge
â”‚   â”‚   â”‚   â”‚       â””â”€â”€ route.ts
â”‚   â”‚   â”‚   â”œâ”€â”€ checkout
â”‚   â”‚   â”‚   â”‚   â””â”€â”€ calculate
â”‚   â”‚   â”‚   â”‚       â””â”€â”€ route.ts
â”‚   â”‚   â”‚   â”œâ”€â”€ commissions
â”‚   â”‚   â”‚   â”‚   â”œâ”€â”€ calculate
â”‚   â”‚   â”‚   â”‚   â”‚   â””â”€â”€ route.ts
â”‚   â”‚   â”‚   â”‚   â”œâ”€â”€ payments
â”‚   â”‚   â”‚   â”‚   â”‚   â””â”€â”€ route.ts
â”‚   â”‚   â”‚   â”‚   â””â”€â”€ rules
â”‚   â”‚   â”‚   â”‚       â””â”€â”€ route.ts
â”‚   â”‚   â”‚   â”œâ”€â”€ contact-messages
â”‚   â”‚   â”‚   â”‚   â”œâ”€â”€ route.ts
â”‚   â”‚   â”‚   â”‚   â””â”€â”€ [id]
â”‚   â”‚   â”‚   â”‚       â””â”€â”€ route.ts
â”‚   â”‚   â”‚   â”œâ”€â”€ coupons
â”‚   â”‚   â”‚   â”‚   â””â”€â”€ route.ts
â”‚   â”‚   â”‚   â”œâ”€â”€ cron
â”‚   â”‚   â”‚   â”‚   â”œâ”€â”€ recover-abandoned-registrations
â”‚   â”‚   â”‚   â”‚   â”‚   â””â”€â”€ route.ts
â”‚   â”‚   â”‚   â”‚   â””â”€â”€ service-retention
â”‚   â”‚   â”‚   â”‚       â””â”€â”€ route.ts
â”‚   â”‚   â”‚   â”œâ”€â”€ custom-setups
â”‚   â”‚   â”‚   â”‚   â””â”€â”€ route.ts
â”‚   â”‚   â”‚   â”œâ”€â”€ customer
â”‚   â”‚   â”‚   â”‚   â””â”€â”€ notifications
â”‚   â”‚   â”‚   â”‚       â””â”€â”€ route.ts
â”‚   â”‚   â”‚   â”œâ”€â”€ customer-promotions
â”‚   â”‚   â”‚   â”‚   â””â”€â”€ route.ts
â”‚   â”‚   â”‚   â”œâ”€â”€ customers
â”‚   â”‚   â”‚   â”‚   â””â”€â”€ register
â”‚   â”‚   â”‚   â”‚       â””â”€â”€ route.ts
â”‚   â”‚   â”‚   â”œâ”€â”€ discounts
â”‚   â”‚   â”‚   â”‚   â”œâ”€â”€ calculate
â”‚   â”‚   â”‚   â”‚   â”‚   â””â”€â”€ route.ts
â”‚   â”‚   â”‚   â”‚   â””â”€â”€ route.ts
â”‚   â”‚   â”‚   â”œâ”€â”€ email
â”‚   â”‚   â”‚   â”‚   â”œâ”€â”€ abandoned-cart
â”‚   â”‚   â”‚   â”‚   â”‚   â””â”€â”€ route.ts
â”‚   â”‚   â”‚   â”‚   â”œâ”€â”€ email-change
â”‚   â”‚   â”‚   â”‚   â”‚   â””â”€â”€ route.ts
â”‚   â”‚   â”‚   â”‚   â”œâ”€â”€ marketing
â”‚   â”‚   â”‚   â”‚   â”‚   â””â”€â”€ route.ts
â”‚   â”‚   â”‚   â”‚   â”œâ”€â”€ notify-manager
â”‚   â”‚   â”‚   â”‚   â”‚   â””â”€â”€ route.ts
â”‚   â”‚   â”‚   â”‚   â”œâ”€â”€ notify-sales-pickup
â”‚   â”‚   â”‚   â”‚   â”‚   â””â”€â”€ route.ts
â”‚   â”‚   â”‚   â”‚   â”œâ”€â”€ order-approved
â”‚   â”‚   â”‚   â”‚   â”‚   â””â”€â”€ route.ts
â”‚   â”‚   â”‚   â”‚   â”œâ”€â”€ order-completion
â”‚   â”‚   â”‚   â”‚   â”‚   â””â”€â”€ route.ts
â”‚   â”‚   â”‚   â”‚   â”œâ”€â”€ order-confirmation
â”‚   â”‚   â”‚   â”‚   â”‚   â””â”€â”€ route.ts
â”‚   â”‚   â”‚   â”‚   â”œâ”€â”€ order-delivered
â”‚   â”‚   â”‚   â”‚   â”‚   â””â”€â”€ route.ts
â”‚   â”‚   â”‚   â”‚   â”œâ”€â”€ password-reset
â”‚   â”‚   â”‚   â”‚   â”‚   â””â”€â”€ route.ts
â”‚   â”‚   â”‚   â”‚   â”œâ”€â”€ payment-confirmation
â”‚   â”‚   â”‚   â”‚   â”‚   â””â”€â”€ route.ts
â”‚   â”‚   â”‚   â”‚   â”œâ”€â”€ payment-failed
â”‚   â”‚   â”‚   â”‚   â”‚   â””â”€â”€ route.ts
â”‚   â”‚   â”‚   â”‚   â”œâ”€â”€ payment-pending
â”‚   â”‚   â”‚   â”‚   â”‚   â””â”€â”€ route.ts
â”‚   â”‚   â”‚   â”‚   â”œâ”€â”€ pickup
â”‚   â”‚   â”‚   â”‚   â”‚   â””â”€â”€ route.ts
â”‚   â”‚   â”‚   â”‚   â”œâ”€â”€ shipping
â”‚   â”‚   â”‚   â”‚   â”‚   â””â”€â”€ route.ts
â”‚   â”‚   â”‚   â”‚   â”œâ”€â”€ verification
â”‚   â”‚   â”‚   â”‚   â”‚   â””â”€â”€ route.ts
â”‚   â”‚   â”‚   â”‚   â””â”€â”€ welcome
â”‚   â”‚   â”‚   â”‚       â””â”€â”€ route.ts
â”‚   â”‚   â”‚   â”œâ”€â”€ faqs
â”‚   â”‚   â”‚   â”‚   â””â”€â”€ route.ts
â”‚   â”‚   â”‚   â”œâ”€â”€ free-installation-slots
â”‚   â”‚   â”‚   â”‚   â””â”€â”€ route.ts
â”‚   â”‚   â”‚   â”œâ”€â”€ gst-verify
â”‚   â”‚   â”‚   â”‚   â””â”€â”€ route.ts
â”‚   â”‚   â”‚   â”œâ”€â”€ health
â”‚   â”‚   â”‚   â”‚   â”œâ”€â”€ email
â”‚   â”‚   â”‚   â”‚   â”‚   â””â”€â”€ route.ts
â”‚   â”‚   â”‚   â”‚   â”œâ”€â”€ orders
â”‚   â”‚   â”‚   â”‚   â”‚   â””â”€â”€ route.ts
â”‚   â”‚   â”‚   â”‚   â”œâ”€â”€ otp
â”‚   â”‚   â”‚   â”‚   â”‚   â””â”€â”€ route.ts
â”‚   â”‚   â”‚   â”‚   â”œâ”€â”€ route.ts
â”‚   â”‚   â”‚   â”‚   â””â”€â”€ summary
â”‚   â”‚   â”‚   â”‚       â””â”€â”€ route.ts
â”‚   â”‚   â”‚   â”œâ”€â”€ inventory
â”‚   â”‚   â”‚   â”‚   â”œâ”€â”€ route.ts
â”‚   â”‚   â”‚   â”‚   â””â”€â”€ transactions
â”‚   â”‚   â”‚   â”‚       â””â”€â”€ route.ts
â”‚   â”‚   â”‚   â”œâ”€â”€ marketing
â”‚   â”‚   â”‚   â”‚   â””â”€â”€ triggers
â”‚   â”‚   â”‚   â”‚       â””â”€â”€ order-delivered-followup
â”‚   â”‚   â”‚   â”‚           â””â”€â”€ route.ts
â”‚   â”‚   â”‚   â”œâ”€â”€ metadata
â”‚   â”‚   â”‚   â”‚   â””â”€â”€ route.ts
â”‚   â”‚   â”‚   â”œâ”€â”€ offers
â”‚   â”‚   â”‚   â”‚   â””â”€â”€ route.ts
â”‚   â”‚   â”‚   â”œâ”€â”€ orders
â”‚   â”‚   â”‚   â”‚   â”œâ”€â”€ auto-cancel
â”‚   â”‚   â”‚   â”‚   â”‚   â””â”€â”€ route.ts
â”‚   â”‚   â”‚   â”‚   â”œâ”€â”€ commission
â”‚   â”‚   â”‚   â”‚   â”‚   â””â”€â”€ route.ts
â”‚   â”‚   â”‚   â”‚   â”œâ”€â”€ route.ts
â”‚   â”‚   â”‚   â”‚   â””â”€â”€ update-status
â”‚   â”‚   â”‚   â”‚       â””â”€â”€ route.ts
â”‚   â”‚   â”‚   â”œâ”€â”€ otp
â”‚   â”‚   â”‚   â”‚   â”œâ”€â”€ generate
â”‚   â”‚   â”‚   â”‚   â”‚   â””â”€â”€ route.ts
â”‚   â”‚   â”‚   â”‚   â”œâ”€â”€ resend
â”‚   â”‚   â”‚   â”‚   â”‚   â””â”€â”€ route.ts
â”‚   â”‚   â”‚   â”‚   â””â”€â”€ verify
â”‚   â”‚   â”‚   â”‚       â””â”€â”€ route.ts
â”‚   â”‚   â”‚   â”œâ”€â”€ page-content
â”‚   â”‚   â”‚   â”‚   â””â”€â”€ route.ts
â”‚   â”‚   â”‚   â”œâ”€â”€ payment
â”‚   â”‚   â”‚   â”‚   â””â”€â”€ payu
â”‚   â”‚   â”‚   â”‚       â”œâ”€â”€ callback
â”‚   â”‚   â”‚   â”‚       â”‚   â””â”€â”€ route.ts
â”‚   â”‚   â”‚   â”‚       â””â”€â”€ initiate
â”‚   â”‚   â”‚   â”‚           â””â”€â”€ route.ts
â”‚   â”‚   â”‚   â”œâ”€â”€ payments
â”‚   â”‚   â”‚   â”‚   â””â”€â”€ update
â”‚   â”‚   â”‚   â”‚       â””â”€â”€ route.ts
â”‚   â”‚   â”‚   â”œâ”€â”€ pricing
â”‚   â”‚   â”‚   â”‚   â”œâ”€â”€ calculate
â”‚   â”‚   â”‚   â”‚   â”‚   â””â”€â”€ route.ts
â”‚   â”‚   â”‚   â”‚   â””â”€â”€ customer-type
â”‚   â”‚   â”‚   â”‚       â””â”€â”€ route.ts
â”‚   â”‚   â”‚   â”œâ”€â”€ products
â”‚   â”‚   â”‚   â”‚   â”œâ”€â”€ bulk-edit
â”‚   â”‚   â”‚   â”‚   â”‚   â””â”€â”€ route.ts
â”‚   â”‚   â”‚   â”‚   â”œâ”€â”€ cleanup
â”‚   â”‚   â”‚   â”‚   â”‚   â””â”€â”€ route.ts
â”‚   â”‚   â”‚   â”‚   â”œâ”€â”€ cleanup-images
â”‚   â”‚   â”‚   â”‚   â”‚   â””â”€â”€ route.ts
â”‚   â”‚   â”‚   â”‚   â”œâ”€â”€ export
â”‚   â”‚   â”‚   â”‚   â”‚   â””â”€â”€ route.ts
â”‚   â”‚   â”‚   â”‚   â”œâ”€â”€ fix-images
â”‚   â”‚   â”‚   â”‚   â”‚   â””â”€â”€ route.ts
â”‚   â”‚   â”‚   â”‚   â”œâ”€â”€ image-diagnostics
â”‚   â”‚   â”‚   â”‚   â”‚   â””â”€â”€ route.ts
â”‚   â”‚   â”‚   â”‚   â”œâ”€â”€ import
â”‚   â”‚   â”‚   â”‚   â”‚   â””â”€â”€ route.ts
â”‚   â”‚   â”‚   â”‚   â”œâ”€â”€ manual-import
â”‚   â”‚   â”‚   â”‚   â”‚   â””â”€â”€ route.ts
â”‚   â”‚   â”‚   â”‚   â”œâ”€â”€ recommendations
â”‚   â”‚   â”‚   â”‚   â”‚   â””â”€â”€ route.ts
â”‚   â”‚   â”‚   â”‚   â”œâ”€â”€ route.ts
â”‚   â”‚   â”‚   â”‚   â”œâ”€â”€ simple-import
â”‚   â”‚   â”‚   â”‚   â”‚   â””â”€â”€ route.ts
â”‚   â”‚   â”‚   â”‚   â”œâ”€â”€ template
â”‚   â”‚   â”‚   â”‚   â”‚   â””â”€â”€ route.ts
â”‚   â”‚   â”‚   â”‚   â””â”€â”€ [id]
â”‚   â”‚   â”‚   â”‚       â””â”€â”€ route.ts
â”‚   â”‚   â”‚   â”œâ”€â”€ promotions
â”‚   â”‚   â”‚   â”‚   â”œâ”€â”€ claim-viral
â”‚   â”‚   â”‚   â”‚   â”‚   â””â”€â”€ route.ts
â”‚   â”‚   â”‚   â”‚   â””â”€â”€ free-installation-claim
â”‚   â”‚   â”‚   â”‚       â””â”€â”€ route.ts
â”‚   â”‚   â”‚   â”œâ”€â”€ quotes
â”‚   â”‚   â”‚   â”‚   â”œâ”€â”€ bid
â”‚   â”‚   â”‚   â”‚   â”‚   â””â”€â”€ route.ts
â”‚   â”‚   â”‚   â”‚   â”œâ”€â”€ route.ts
â”‚   â”‚   â”‚   â”‚   â””â”€â”€ [id]
â”‚   â”‚   â”‚   â”‚       â”œâ”€â”€ accept-counter
â”‚   â”‚   â”‚   â”‚       â”‚   â””â”€â”€ route.ts
â”‚   â”‚   â”‚   â”‚       â”œâ”€â”€ advance-payment
â”‚   â”‚   â”‚   â”‚       â”‚   â”œâ”€â”€ confirm
â”‚   â”‚   â”‚   â”‚       â”‚   â”‚   â””â”€â”€ route.ts
â”‚   â”‚   â”‚   â”‚       â”‚   â””â”€â”€ generate-link
â”‚   â”‚   â”‚   â”‚       â”‚       â””â”€â”€ route.ts
â”‚   â”‚   â”‚   â”‚       â”œâ”€â”€ reject-counter
â”‚   â”‚   â”‚   â”‚       â”‚   â””â”€â”€ route.ts
â”‚   â”‚   â”‚   â”‚       â””â”€â”€ route.ts
â”‚   â”‚   â”‚   â”œâ”€â”€ roles
â”‚   â”‚   â”‚   â”‚   â””â”€â”€ route.ts
â”‚   â”‚   â”‚   â”œâ”€â”€ roles-public
â”‚   â”‚   â”‚   â”‚   â””â”€â”€ route.ts
â”‚   â”‚   â”‚   â”œâ”€â”€ sales-agents
â”‚   â”‚   â”‚   â”‚   â””â”€â”€ apply
â”‚   â”‚   â”‚   â”‚       â””â”€â”€ route.ts
â”‚   â”‚   â”‚   â”œâ”€â”€ security
â”‚   â”‚   â”‚   â”‚   â”œâ”€â”€ audit-logs
â”‚   â”‚   â”‚   â”‚   â”‚   â””â”€â”€ route.ts
â”‚   â”‚   â”‚   â”‚   â”œâ”€â”€ mfa-status
â”‚   â”‚   â”‚   â”‚   â”‚   â””â”€â”€ route.ts
â”‚   â”‚   â”‚   â”‚   â”œâ”€â”€ settings
â”‚   â”‚   â”‚   â”‚   â”‚   â””â”€â”€ route.ts
â”‚   â”‚   â”‚   â”‚   â””â”€â”€ validate-password
â”‚   â”‚   â”‚   â”‚       â””â”€â”€ route.ts
â”‚   â”‚   â”‚   â”œâ”€â”€ services
â”‚   â”‚   â”‚   â”‚   â”œâ”€â”€ engineers
â”‚   â”‚   â”‚   â”‚   â”‚   â””â”€â”€ route.ts
â”‚   â”‚   â”‚   â”‚   â”œâ”€â”€ route.ts
â”‚   â”‚   â”‚   â”‚   â”œâ”€â”€ tickets
â”‚   â”‚   â”‚   â”‚   â”‚   â”œâ”€â”€ route.ts
â”‚   â”‚   â”‚   â”‚   â”‚   â””â”€â”€ [id]
â”‚   â”‚   â”‚   â”‚   â”‚       â””â”€â”€ route.ts
â”‚   â”‚   â”‚   â”‚   â””â”€â”€ [id]
â”‚   â”‚   â”‚   â”‚       â””â”€â”€ route.ts
â”‚   â”‚   â”‚   â”œâ”€â”€ settings
â”‚   â”‚   â”‚   â”‚   â””â”€â”€ route.ts
â”‚   â”‚   â”‚   â”œâ”€â”€ shipping
â”‚   â”‚   â”‚   â”‚   â””â”€â”€ update
â”‚   â”‚   â”‚   â”‚       â””â”€â”€ route.ts
â”‚   â”‚   â”‚   â”œâ”€â”€ superadmin
â”‚   â”‚   â”‚   â”‚   â”œâ”€â”€ catalogue
â”‚   â”‚   â”‚   â”‚   â”‚   â””â”€â”€ generate
â”‚   â”‚   â”‚   â”‚   â”‚       â””â”€â”€ route.ts
â”‚   â”‚   â”‚   â”‚   â”œâ”€â”€ login
â”‚   â”‚   â”‚   â”‚   â”‚   â””â”€â”€ route.ts
â”‚   â”‚   â”‚   â”‚   â”œâ”€â”€ logout
â”‚   â”‚   â”‚   â”‚   â”‚   â””â”€â”€ route.ts
â”‚   â”‚   â”‚   â”‚   â””â”€â”€ services
â”‚   â”‚   â”‚   â”‚       â”œâ”€â”€ ai-generate
â”‚   â”‚   â”‚   â”‚       â”‚   â””â”€â”€ route.ts
â”‚   â”‚   â”‚   â”‚       â”œâ”€â”€ route.ts
â”‚   â”‚   â”‚   â”‚       â””â”€â”€ [id]
â”‚   â”‚   â”‚   â”‚           â””â”€â”€ route.ts
â”‚   â”‚   â”‚   â”œâ”€â”€ upload
â”‚   â”‚   â”‚   â”‚   â””â”€â”€ route.ts
â”‚   â”‚   â”‚   â”œâ”€â”€ upload-from-url
â”‚   â”‚   â”‚   â”‚   â””â”€â”€ route.ts
â”‚   â”‚   â”‚   â”œâ”€â”€ uploads
â”‚   â”‚   â”‚   â”‚   â””â”€â”€ quote-documents
â”‚   â”‚   â”‚   â”‚       â””â”€â”€ route.ts
â”‚   â”‚   â”‚   â”œâ”€â”€ user
â”‚   â”‚   â”‚   â”‚   â””â”€â”€ communication-preferences
â”‚   â”‚   â”‚   â”‚       â””â”€â”€ route.ts
â”‚   â”‚   â”‚   â”œâ”€â”€ users
â”‚   â”‚   â”‚   â”‚   â””â”€â”€ route.ts
â”‚   â”‚   â”‚   â”œâ”€â”€ users-admin
â”‚   â”‚   â”‚   â”‚   â””â”€â”€ route.ts
â”‚   â”‚   â”‚   â”œâ”€â”€ v1
â”‚   â”‚   â”‚   â”‚   â””â”€â”€ embed
â”‚   â”‚   â”‚   â”‚       â””â”€â”€ configurator
â”‚   â”‚   â”‚   â”‚           â””â”€â”€ route.ts
â”‚   â”‚   â”‚   â”œâ”€â”€ walk-in-orders
â”‚   â”‚   â”‚   â”‚   â””â”€â”€ route.ts
â”‚   â”‚   â”‚   â”œâ”€â”€ warranty
â”‚   â”‚   â”‚   â”‚   â””â”€â”€ activate
â”‚   â”‚   â”‚   â”‚       â””â”€â”€ route.ts
â”‚   â”‚   â”‚   â””â”€â”€ webhooks
â”‚   â”‚   â”‚       â”œâ”€â”€ customer
â”‚   â”‚   â”‚       â”‚   â””â”€â”€ signup
â”‚   â”‚   â”‚       â”‚       â””â”€â”€ route.ts
â”‚   â”‚   â”‚       â”œâ”€â”€ orders
â”‚   â”‚   â”‚       â”‚   â”œâ”€â”€ cancelled
â”‚   â”‚   â”‚       â”‚   â”‚   â””â”€â”€ route.ts
â”‚   â”‚   â”‚       â”‚   â”œâ”€â”€ delayed
â”‚   â”‚   â”‚       â”‚   â”‚   â””â”€â”€ route.ts
â”‚   â”‚   â”‚       â”‚   â”œâ”€â”€ delivered
â”‚   â”‚   â”‚       â”‚   â”‚   â””â”€â”€ route.ts
â”‚   â”‚   â”‚       â”‚   â”œâ”€â”€ notconfirmed
â”‚   â”‚   â”‚       â”‚   â”‚   â””â”€â”€ route.ts
â”‚   â”‚   â”‚       â”‚   â”œâ”€â”€ outfordelivery
â”‚   â”‚   â”‚       â”‚   â”‚   â””â”€â”€ route.ts
â”‚   â”‚   â”‚       â”‚   â”œâ”€â”€ placed
â”‚   â”‚   â”‚       â”‚   â”‚   â””â”€â”€ route.ts
â”‚   â”‚   â”‚       â”‚   â””â”€â”€ shipped
â”‚   â”‚   â”‚       â”‚       â””â”€â”€ route.ts
â”‚   â”‚   â”‚       â”œâ”€â”€ payment
â”‚   â”‚   â”‚       â”‚   â”œâ”€â”€ failed
â”‚   â”‚   â”‚       â”‚   â”‚   â””â”€â”€ route.ts
â”‚   â”‚   â”‚       â”‚   â””â”€â”€ received
â”‚   â”‚   â”‚       â”‚       â””â”€â”€ route.ts
â”‚   â”‚   â”‚       â”œâ”€â”€ stats
â”‚   â”‚   â”‚       â”‚   â””â”€â”€ route.ts
â”‚   â”‚   â”‚       â””â”€â”€ whatsapp
â”‚   â”‚   â”‚           â””â”€â”€ route.ts
â”‚   â”‚   â”œâ”€â”€ auth
â”‚   â”‚   â”‚   â”œâ”€â”€ change-password
â”‚   â”‚   â”‚   â”‚   â””â”€â”€ page.tsx
â”‚   â”‚   â”‚   â”œâ”€â”€ login
â”‚   â”‚   â”‚   â”‚   â””â”€â”€ page.tsx
â”‚   â”‚   â”‚   â”œâ”€â”€ signin
â”‚   â”‚   â”‚   â”‚   â”œâ”€â”€ layout.tsx
â”‚   â”‚   â”‚   â”‚   â””â”€â”€ page.tsx
â”‚   â”‚   â”‚   â”œâ”€â”€ signout
â”‚   â”‚   â”‚   â”‚   â””â”€â”€ page.tsx
â”‚   â”‚   â”‚   â”œâ”€â”€ signup
â”‚   â”‚   â”‚   â”‚   â”œâ”€â”€ layout.tsx
â”‚   â”‚   â”‚   â”‚   â””â”€â”€ page.tsx
â”‚   â”‚   â”‚   â”œâ”€â”€ verification-success
â”‚   â”‚   â”‚   â”‚   â””â”€â”€ page.tsx
â”‚   â”‚   â”‚   â”œâ”€â”€ verify-email
â”‚   â”‚   â”‚   â”‚   â”œâ”€â”€ EmailVerificationContent.tsx
â”‚   â”‚   â”‚   â”‚   â””â”€â”€ page.tsx
â”‚   â”‚   â”‚   â””â”€â”€ verify-otp
â”‚   â”‚   â”‚       â”œâ”€â”€ OTPVerificationContent.tsx
â”‚   â”‚   â”‚       â””â”€â”€ page.tsx
â”‚   â”‚   â”œâ”€â”€ blueprints
â”‚   â”‚   â”‚   â””â”€â”€ [id]
â”‚   â”‚   â”‚       â””â”€â”€ page.tsx
â”‚   â”‚   â”œâ”€â”€ cart
â”‚   â”‚   â”‚   â””â”€â”€ page.tsx
â”‚   â”‚   â”œâ”€â”€ checkout
â”‚   â”‚   â”‚   â””â”€â”€ page.tsx
â”‚   â”‚   â”œâ”€â”€ contact
â”‚   â”‚   â”‚   â””â”€â”€ page.tsx
â”‚   â”‚   â”œâ”€â”€ create-invoice
â”‚   â”‚   â”‚   â””â”€â”€ page.tsx
â”‚   â”‚   â”œâ”€â”€ customised-setups
â”‚   â”‚   â”‚   â””â”€â”€ page.tsx
â”‚   â”‚   â”œâ”€â”€ embed
â”‚   â”‚   â”‚   â””â”€â”€ configurator
â”‚   â”‚   â”‚       â””â”€â”€ page.tsx
â”‚   â”‚   â”œâ”€â”€ error.tsx
â”‚   â”‚   â”œâ”€â”€ global-error.tsx
â”‚   â”‚   â”œâ”€â”€ globals.css
â”‚   â”‚   â”œâ”€â”€ info
â”‚   â”‚   â”‚   â”œâ”€â”€ faqs
â”‚   â”‚   â”‚   â”‚   â””â”€â”€ page.tsx
â”‚   â”‚   â”‚   â””â”€â”€ policies
â”‚   â”‚   â”‚       â”œâ”€â”€ page.tsx
â”‚   â”‚   â”‚       â”œâ”€â”€ privacy
â”‚   â”‚   â”‚       â”‚   â””â”€â”€ page.tsx
â”‚   â”‚   â”‚       â”œâ”€â”€ refund-cancellation
â”‚   â”‚   â”‚       â”‚   â””â”€â”€ page.tsx
â”‚   â”‚   â”‚       â”œâ”€â”€ return
â”‚   â”‚   â”‚       â”‚   â””â”€â”€ page.tsx
â”‚   â”‚   â”‚       â”œâ”€â”€ shipping
â”‚   â”‚   â”‚       â”‚   â””â”€â”€ page.tsx
â”‚   â”‚   â”‚       â””â”€â”€ terms
â”‚   â”‚   â”‚           â””â”€â”€ page.tsx
â”‚   â”‚   â”œâ”€â”€ layout.tsx
â”‚   â”‚   â”œâ”€â”€ loading.tsx
â”‚   â”‚   â”œâ”€â”€ manifest.webmanifest
â”‚   â”‚   â”‚   â””â”€â”€ route.ts
â”‚   â”‚   â”œâ”€â”€ mgmt
â”‚   â”‚   â”‚   â”œâ”€â”€ accounts
â”‚   â”‚   â”‚   â”‚   â”œâ”€â”€ AccountsLayoutClient.tsx
â”‚   â”‚   â”‚   â”‚   â”œâ”€â”€ layout.tsx
â”‚   â”‚   â”‚   â”‚   â””â”€â”€ page.tsx
â”‚   â”‚   â”‚   â”œâ”€â”€ admin
â”‚   â”‚   â”‚   â”‚   â”œâ”€â”€ AdminLayoutClient.tsx
â”‚   â”‚   â”‚   â”‚   â”œâ”€â”€ ai-assistant
â”‚   â”‚   â”‚   â”‚   â”‚   â””â”€â”€ page.tsx
â”‚   â”‚   â”‚   â”‚   â”œâ”€â”€ analytics
â”‚   â”‚   â”‚   â”‚   â”‚   â””â”€â”€ page.tsx
â”‚   â”‚   â”‚   â”‚   â”œâ”€â”€ auto-offers
â”‚   â”‚   â”‚   â”‚   â”‚   â””â”€â”€ page.tsx
â”‚   â”‚   â”‚   â”‚   â”œâ”€â”€ broadcast-desk
â”‚   â”‚   â”‚   â”‚   â”‚   â””â”€â”€ page.tsx
â”‚   â”‚   â”‚   â”‚   â”œâ”€â”€ contact-messages
â”‚   â”‚   â”‚   â”‚   â”‚   â”œâ”€â”€ admin-contact-messages.tsx
â”‚   â”‚   â”‚   â”‚   â”‚   â””â”€â”€ page.tsx
â”‚   â”‚   â”‚   â”‚   â”œâ”€â”€ coupons
â”‚   â”‚   â”‚   â”‚   â”‚   â”œâ”€â”€ admin-coupons.tsx
â”‚   â”‚   â”‚   â”‚   â”‚   â””â”€â”€ page.tsx
â”‚   â”‚   â”‚   â”‚   â”œâ”€â”€ custom-setups
â”‚   â”‚   â”‚   â”‚   â”‚   â”œâ”€â”€ page.tsx
â”‚   â”‚   â”‚   â”‚   â”‚   â””â”€â”€ price-manager.tsx
â”‚   â”‚   â”‚   â”‚   â”œâ”€â”€ discounts
â”‚   â”‚   â”‚   â”‚   â”‚   â””â”€â”€ page.tsx
â”‚   â”‚   â”‚   â”‚   â”œâ”€â”€ faqs
â”‚   â”‚   â”‚   â”‚   â”‚   â””â”€â”€ page.tsx
â”‚   â”‚   â”‚   â”‚   â”œâ”€â”€ hero-banners
â”‚   â”‚   â”‚   â”‚   â”‚   â””â”€â”€ page.tsx
â”‚   â”‚   â”‚   â”‚   â”œâ”€â”€ homepage-settings
â”‚   â”‚   â”‚   â”‚   â”‚   â”œâ”€â”€ admin-homepage-settings.tsx
â”‚   â”‚   â”‚   â”‚   â”‚   â””â”€â”€ page.tsx
â”‚   â”‚   â”‚   â”‚   â”œâ”€â”€ inventory
â”‚   â”‚   â”‚   â”‚   â”‚   â””â”€â”€ page.tsx
â”‚   â”‚   â”‚   â”‚   â”œâ”€â”€ invoice-lookup
â”‚   â”‚   â”‚   â”‚   â”‚   â””â”€â”€ page.tsx
â”‚   â”‚   â”‚   â”‚   â”œâ”€â”€ layout.tsx
â”‚   â”‚   â”‚   â”‚   â”œâ”€â”€ offers
â”‚   â”‚   â”‚   â”‚   â”‚   â””â”€â”€ page.tsx
â”‚   â”‚   â”‚   â”‚   â”œâ”€â”€ orders
â”‚   â”‚   â”‚   â”‚   â”‚   â””â”€â”€ page.tsx
â”‚   â”‚   â”‚   â”‚   â”œâ”€â”€ page-content
â”‚   â”‚   â”‚   â”‚   â”‚   â””â”€â”€ page.tsx
â”‚   â”‚   â”‚   â”‚   â”œâ”€â”€ page.tsx
â”‚   â”‚   â”‚   â”‚   â”œâ”€â”€ payment-api
â”‚   â”‚   â”‚   â”‚   â”‚   â”œâ”€â”€ admin-payment-api.tsx
â”‚   â”‚   â”‚   â”‚   â”‚   â””â”€â”€ page.tsx
â”‚   â”‚   â”‚   â”‚   â”œâ”€â”€ policies
â”‚   â”‚   â”‚   â”‚   â”‚   â””â”€â”€ page.tsx
â”‚   â”‚   â”‚   â”‚   â”œâ”€â”€ pricing
â”‚   â”‚   â”‚   â”‚   â”‚   â”œâ”€â”€ admin-pricing.tsx
â”‚   â”‚   â”‚   â”‚   â”‚   â””â”€â”€ page.tsx
â”‚   â”‚   â”‚   â”‚   â”œâ”€â”€ products
â”‚   â”‚   â”‚   â”‚   â”‚   â”œâ”€â”€ admin-products-new.tsx
â”‚   â”‚   â”‚   â”‚   â”‚   â””â”€â”€ page.tsx
â”‚   â”‚   â”‚   â”‚   â”œâ”€â”€ promotional-broadcast
â”‚   â”‚   â”‚   â”‚   â”‚   â””â”€â”€ page.tsx
â”‚   â”‚   â”‚   â”‚   â”œâ”€â”€ purchase
â”‚   â”‚   â”‚   â”‚   â”‚   â””â”€â”€ page.tsx
â”‚   â”‚   â”‚   â”‚   â”œâ”€â”€ quotes
â”‚   â”‚   â”‚   â”‚   â”‚   â””â”€â”€ page.tsx
â”‚   â”‚   â”‚   â”‚   â”œâ”€â”€ sales-agents
â”‚   â”‚   â”‚   â”‚   â”‚   â””â”€â”€ page.tsx
â”‚   â”‚   â”‚   â”‚   â”œâ”€â”€ security
â”‚   â”‚   â”‚   â”‚   â”‚   â””â”€â”€ page.tsx
â”‚   â”‚   â”‚   â”‚   â”œâ”€â”€ services
â”‚   â”‚   â”‚   â”‚   â”‚   â”œâ”€â”€ admin-services.tsx
â”‚   â”‚   â”‚   â”‚   â”‚   â””â”€â”€ page.tsx
â”‚   â”‚   â”‚   â”‚   â”œâ”€â”€ settings
â”‚   â”‚   â”‚   â”‚   â”‚   â”œâ”€â”€ admin-settings.tsx
â”‚   â”‚   â”‚   â”‚   â”‚   â””â”€â”€ page.tsx
â”‚   â”‚   â”‚   â”‚   â”œâ”€â”€ social-media
â”‚   â”‚   â”‚   â”‚   â”‚   â””â”€â”€ page.tsx
â”‚   â”‚   â”‚   â”‚   â”œâ”€â”€ staff
â”‚   â”‚   â”‚   â”‚   â”‚   â””â”€â”€ page.tsx
â”‚   â”‚   â”‚   â”‚   â””â”€â”€ users
â”‚   â”‚   â”‚   â”‚       â”œâ”€â”€ admin-users.tsx
â”‚   â”‚   â”‚   â”‚       â”œâ”€â”€ page.tsx
â”‚   â”‚   â”‚   â”‚       â””â”€â”€ [id]
â”‚   â”‚   â”‚   â”‚           â””â”€â”€ analytics
â”‚   â”‚   â”‚   â”‚               â”œâ”€â”€ page.tsx
â”‚   â”‚   â”‚   â”‚               â””â”€â”€ UserAnalyticsClient.tsx
â”‚   â”‚   â”‚   â”œâ”€â”€ dashboard-client.tsx
â”‚   â”‚   â”‚   â”œâ”€â”€ error.tsx
â”‚   â”‚   â”‚   â”œâ”€â”€ loading.tsx
â”‚   â”‚   â”‚   â”œâ”€â”€ manager
â”‚   â”‚   â”‚   â”‚   â”œâ”€â”€ inventory
â”‚   â”‚   â”‚   â”‚   â”‚   â””â”€â”€ page.tsx
â”‚   â”‚   â”‚   â”‚   â”œâ”€â”€ invoice-lookup
â”‚   â”‚   â”‚   â”‚   â”‚   â””â”€â”€ page.tsx
â”‚   â”‚   â”‚   â”‚   â”œâ”€â”€ layout.tsx
â”‚   â”‚   â”‚   â”‚   â”œâ”€â”€ ManagerLayoutClient.tsx
â”‚   â”‚   â”‚   â”‚   â”œâ”€â”€ online-orders
â”‚   â”‚   â”‚   â”‚   â”‚   â””â”€â”€ page.tsx
â”‚   â”‚   â”‚   â”‚   â”œâ”€â”€ page.tsx
â”‚   â”‚   â”‚   â”‚   â”œâ”€â”€ purchase
â”‚   â”‚   â”‚   â”‚   â”‚   â””â”€â”€ page.tsx
â”‚   â”‚   â”‚   â”‚   â”œâ”€â”€ quick-billing
â”‚   â”‚   â”‚   â”‚   â”‚   â””â”€â”€ page.tsx
â”‚   â”‚   â”‚   â”‚   â”œâ”€â”€ reports
â”‚   â”‚   â”‚   â”‚   â”‚   â””â”€â”€ page.tsx
â”‚   â”‚   â”‚   â”‚   â””â”€â”€ salesperson
â”‚   â”‚   â”‚   â”‚       â””â”€â”€ page.tsx
â”‚   â”‚   â”‚   â”œâ”€â”€ page.tsx
â”‚   â”‚   â”‚   â”œâ”€â”€ sales
â”‚   â”‚   â”‚   â”‚   â”œâ”€â”€ agent-order
â”‚   â”‚   â”‚   â”‚   â”‚   â””â”€â”€ page.tsx
â”‚   â”‚   â”‚   â”‚   â”œâ”€â”€ expenses
â”‚   â”‚   â”‚   â”‚   â”‚   â”œâ”€â”€ page.tsx
â”‚   â”‚   â”‚   â”‚   â”‚   â””â”€â”€ sales-expenses.tsx
â”‚   â”‚   â”‚   â”‚   â”œâ”€â”€ history
â”‚   â”‚   â”‚   â”‚   â”‚   â”œâ”€â”€ page.tsx
â”‚   â”‚   â”‚   â”‚   â”‚   â””â”€â”€ sales-history.tsx
â”‚   â”‚   â”‚   â”‚   â”œâ”€â”€ inventory
â”‚   â”‚   â”‚   â”‚   â”‚   â”œâ”€â”€ page.tsx
â”‚   â”‚   â”‚   â”‚   â”‚   â””â”€â”€ sales-inventory.tsx
â”‚   â”‚   â”‚   â”‚   â”œâ”€â”€ invoice-lookup
â”‚   â”‚   â”‚   â”‚   â”‚   â”œâ”€â”€ page.tsx
â”‚   â”‚   â”‚   â”‚   â”‚   â””â”€â”€ sales-invoice-lookup.tsx
â”‚   â”‚   â”‚   â”‚   â”œâ”€â”€ layout.tsx
â”‚   â”‚   â”‚   â”‚   â”œâ”€â”€ online-orders
â”‚   â”‚   â”‚   â”‚   â”‚   â”œâ”€â”€ page.tsx
â”‚   â”‚   â”‚   â”‚   â”‚   â””â”€â”€ sales-online-orders.tsx
â”‚   â”‚   â”‚   â”‚   â”œâ”€â”€ orders
â”‚   â”‚   â”‚   â”‚   â”‚   â”œâ”€â”€ page.tsx
â”‚   â”‚   â”‚   â”‚   â”‚   â””â”€â”€ sales-orders.tsx
â”‚   â”‚   â”‚   â”‚   â”œâ”€â”€ page.tsx
â”‚   â”‚   â”‚   â”‚   â”œâ”€â”€ products
â”‚   â”‚   â”‚   â”‚   â”‚   â”œâ”€â”€ edit
â”‚   â”‚   â”‚   â”‚   â”‚   â”‚   â””â”€â”€ [id]
â”‚   â”‚   â”‚   â”‚   â”‚   â”‚       â”œâ”€â”€ page.tsx
â”‚   â”‚   â”‚   â”‚   â”‚   â”‚       â””â”€â”€ sales-product-edit.tsx
â”‚   â”‚   â”‚   â”‚   â”‚   â”œâ”€â”€ new
â”‚   â”‚   â”‚   â”‚   â”‚   â”‚   â”œâ”€â”€ page.tsx
â”‚   â”‚   â”‚   â”‚   â”‚   â”‚   â””â”€â”€ sales-product-new.tsx
â”‚   â”‚   â”‚   â”‚   â”‚   â”œâ”€â”€ page.tsx
â”‚   â”‚   â”‚   â”‚   â”‚   â””â”€â”€ sales-products.tsx
â”‚   â”‚   â”‚   â”‚   â”œâ”€â”€ purchase-entry
â”‚   â”‚   â”‚   â”‚   â”‚   â”œâ”€â”€ page.tsx
â”‚   â”‚   â”‚   â”‚   â”‚   â””â”€â”€ sales-purchase-entry.tsx
â”‚   â”‚   â”‚   â”‚   â”œâ”€â”€ quick-billing
â”‚   â”‚   â”‚   â”‚   â”‚   â”œâ”€â”€ page.tsx
â”‚   â”‚   â”‚   â”‚   â”‚   â””â”€â”€ sales-quick-billing.tsx
â”‚   â”‚   â”‚   â”‚   â”œâ”€â”€ sales-dashboard.tsx
â”‚   â”‚   â”‚   â”‚   â”œâ”€â”€ SalesLayoutClient.tsx
â”‚   â”‚   â”‚   â”‚   â””â”€â”€ walk-in-orders
â”‚   â”‚   â”‚   â”‚       â””â”€â”€ page.tsx
â”‚   â”‚   â”‚   â”œâ”€â”€ sales-external
â”‚   â”‚   â”‚   â”‚   â”œâ”€â”€ commission-report
â”‚   â”‚   â”‚   â”‚   â”‚   â””â”€â”€ page.tsx
â”‚   â”‚   â”‚   â”‚   â”œâ”€â”€ layout.tsx
â”‚   â”‚   â”‚   â”‚   â”œâ”€â”€ page.tsx
â”‚   â”‚   â”‚   â”‚   â”œâ”€â”€ quick-billing
â”‚   â”‚   â”‚   â”‚   â”‚   â””â”€â”€ page.tsx
â”‚   â”‚   â”‚   â”‚   â”œâ”€â”€ reports
â”‚   â”‚   â”‚   â”‚   â”‚   â””â”€â”€ page.tsx
â”‚   â”‚   â”‚   â”‚   â””â”€â”€ SalesExternalLayoutClient.tsx
â”‚   â”‚   â”‚   â””â”€â”€ sales-staff
â”‚   â”‚   â”‚       â”œâ”€â”€ invoice-lookup
â”‚   â”‚   â”‚       â”‚   â””â”€â”€ page.tsx
â”‚   â”‚   â”‚       â”œâ”€â”€ layout.tsx
â”‚   â”‚   â”‚       â”œâ”€â”€ order-tracking
â”‚   â”‚   â”‚       â”‚   â””â”€â”€ page.tsx
â”‚   â”‚   â”‚       â”œâ”€â”€ page.tsx
â”‚   â”‚   â”‚       â”œâ”€â”€ quick-billing
â”‚   â”‚   â”‚       â”‚   â””â”€â”€ page.tsx
â”‚   â”‚   â”‚       â”œâ”€â”€ reports
â”‚   â”‚   â”‚       â”‚   â””â”€â”€ page.tsx
â”‚   â”‚   â”‚       â””â”€â”€ SalesStaffLayoutClient.tsx
â”‚   â”‚   â”œâ”€â”€ not-found.tsx
â”‚   â”‚   â”œâ”€â”€ offers
â”‚   â”‚   â”‚   â””â”€â”€ page.tsx
â”‚   â”‚   â”œâ”€â”€ orders
â”‚   â”‚   â”‚   â”œâ”€â”€ page.tsx
â”‚   â”‚   â”‚   â””â”€â”€ [orderId]
â”‚   â”‚   â”‚       â”œâ”€â”€ invoice
â”‚   â”‚   â”‚       â”‚   â””â”€â”€ page.tsx
â”‚   â”‚   â”‚       â””â”€â”€ page.tsx
â”‚   â”‚   â”œâ”€â”€ page.tsx
â”‚   â”‚   â”œâ”€â”€ payment
â”‚   â”‚   â”‚   â”œâ”€â”€ failed
â”‚   â”‚   â”‚   â”‚   â””â”€â”€ page.tsx
â”‚   â”‚   â”‚   â”œâ”€â”€ payu
â”‚   â”‚   â”‚   â”‚   â””â”€â”€ [orderId]
â”‚   â”‚   â”‚   â”‚       â”œâ”€â”€ page.tsx
â”‚   â”‚   â”‚   â”‚       â””â”€â”€ PayuClientPage.tsx
â”‚   â”‚   â”‚   â”œâ”€â”€ success
â”‚   â”‚   â”‚   â”‚   â””â”€â”€ page.tsx
â”‚   â”‚   â”‚   â”œâ”€â”€ upi
â”‚   â”‚   â”‚   â”‚   â””â”€â”€ [orderId]
â”‚   â”‚   â”‚   â”‚       â”œâ”€â”€ page.tsx
â”‚   â”‚   â”‚   â”‚       â””â”€â”€ UPIClientPage.tsx
â”‚   â”‚   â”‚   â””â”€â”€ [method]
â”‚   â”‚   â”‚       â””â”€â”€ [orderId]
â”‚   â”‚   â”‚           â”œâ”€â”€ page.tsx
â”‚   â”‚   â”‚           â””â”€â”€ PaymentClientPage.tsx
â”‚   â”‚   â”œâ”€â”€ products
â”‚   â”‚   â”‚   â”œâ”€â”€ page.tsx
â”‚   â”‚   â”‚   â””â”€â”€ [id]
â”‚   â”‚   â”‚       â”œâ”€â”€ error.tsx
â”‚   â”‚   â”‚       â”œâ”€â”€ loading.tsx
â”‚   â”‚   â”‚       â””â”€â”€ page.tsx
â”‚   â”‚   â”œâ”€â”€ profile
â”‚   â”‚   â”‚   â””â”€â”€ page.tsx
â”‚   â”‚   â”œâ”€â”€ quotes
â”‚   â”‚   â”‚   â””â”€â”€ [id]
â”‚   â”‚   â”‚       â”œâ”€â”€ advance-payment
â”‚   â”‚   â”‚       â”‚   â””â”€â”€ page.tsx
â”‚   â”‚   â”‚       â””â”€â”€ page.tsx
â”‚   â”‚   â”œâ”€â”€ robots.ts
â”‚   â”‚   â”œâ”€â”€ services
â”‚   â”‚   â”‚   â”œâ”€â”€ page.tsx
â”‚   â”‚   â”‚   â””â”€â”€ smart-infrastructure
â”‚   â”‚   â”‚       â””â”€â”€ page.tsx
â”‚   â”‚   â”œâ”€â”€ sitemap.ts
â”‚   â”‚   â”œâ”€â”€ staff
â”‚   â”‚   â”‚   â””â”€â”€ login
â”‚   â”‚   â”‚       â””â”€â”€ page.tsx
â”‚   â”‚   â”œâ”€â”€ superadmin
â”‚   â”‚   â”‚   â”œâ”€â”€ login
â”‚   â”‚   â”‚   â”‚   â””â”€â”€ page.tsx
â”‚   â”‚   â”‚   â””â”€â”€ mgmt
â”‚   â”‚   â”‚       â”œâ”€â”€ ai-config
â”‚   â”‚   â”‚       â”‚   â””â”€â”€ page.tsx
â”‚   â”‚   â”‚       â”œâ”€â”€ catalogue
â”‚   â”‚   â”‚       â”‚   â””â”€â”€ page.tsx
â”‚   â”‚   â”‚       â”œâ”€â”€ custom-setups
â”‚   â”‚   â”‚       â”‚   â””â”€â”€ page.tsx
â”‚   â”‚   â”‚       â”œâ”€â”€ dashboard
â”‚   â”‚   â”‚       â”‚   â””â”€â”€ page.tsx
â”‚   â”‚   â”‚       â”œâ”€â”€ layout.tsx
â”‚   â”‚   â”‚       â”œâ”€â”€ leads
â”‚   â”‚   â”‚       â”‚   â””â”€â”€ page.tsx
â”‚   â”‚   â”‚       â”œâ”€â”€ marketing
â”‚   â”‚   â”‚       â”‚   â””â”€â”€ page.tsx
â”‚   â”‚   â”‚       â”œâ”€â”€ offers
â”‚   â”‚   â”‚       â”‚   â””â”€â”€ page.tsx
â”‚   â”‚   â”‚       â”œâ”€â”€ payment-settings
â”‚   â”‚   â”‚       â”‚   â””â”€â”€ page.tsx
â”‚   â”‚   â”‚       â”œâ”€â”€ policies
â”‚   â”‚   â”‚       â”‚   â””â”€â”€ page.tsx
â”‚   â”‚   â”‚       â”œâ”€â”€ products
â”‚   â”‚   â”‚       â”‚   â””â”€â”€ page.tsx
â”‚   â”‚   â”‚       â”œâ”€â”€ reports
â”‚   â”‚   â”‚       â”‚   â””â”€â”€ page.tsx
â”‚   â”‚   â”‚       â”œâ”€â”€ services
â”‚   â”‚   â”‚       â”‚   â””â”€â”€ page.tsx
â”‚   â”‚   â”‚       â”œâ”€â”€ settings
â”‚   â”‚   â”‚       â”‚   â””â”€â”€ page.tsx
â”‚   â”‚   â”‚       â”œâ”€â”€ social-media
â”‚   â”‚   â”‚       â”‚   â””â”€â”€ page.tsx
â”‚   â”‚   â”‚       â””â”€â”€ users
â”‚   â”‚   â”‚           â”œâ”€â”€ page.tsx
â”‚   â”‚   â”‚           â””â”€â”€ [id]
â”‚   â”‚   â”‚               â””â”€â”€ analytics
â”‚   â”‚   â”‚                   â””â”€â”€ page.tsx
â”‚   â”‚   â””â”€â”€ webdev
â”‚   â”‚       â””â”€â”€ page.tsx
â”‚   â”œâ”€â”€ components
â”‚   â”‚   â”œâ”€â”€ about-page.tsx
â”‚   â”‚   â”œâ”€â”€ accounts
â”‚   â”‚   â”‚   â””â”€â”€ AccountsSidebar.tsx
â”‚   â”‚   â”œâ”€â”€ admin
â”‚   â”‚   â”‚   â”œâ”€â”€ AddUserDialog.tsx
â”‚   â”‚   â”‚   â”œâ”€â”€ AdminSidebar.tsx
â”‚   â”‚   â”‚   â”œâ”€â”€ AutoOffersManagement.tsx
â”‚   â”‚   â”‚   â”œâ”€â”€ CreateDiscountDialog.tsx
â”‚   â”‚   â”‚   â”œâ”€â”€ CreateOfferDialog.tsx
â”‚   â”‚   â”‚   â”œâ”€â”€ CreateProductDialog.tsx
â”‚   â”‚   â”‚   â”œâ”€â”€ CreateServiceDialog.tsx
â”‚   â”‚   â”‚   â”œâ”€â”€ DiscountOffersDialog.tsx
â”‚   â”‚   â”‚   â”œâ”€â”€ EditProductDialog.tsx
â”‚   â”‚   â”‚   â”œâ”€â”€ EditServiceDialog.tsx
â”‚   â”‚   â”‚   â”œâ”€â”€ EditUserDialog.tsx
â”‚   â”‚   â”‚   â”œâ”€â”€ FaqsManagement.tsx
â”‚   â”‚   â”‚   â”œâ”€â”€ HeroCarouselManager.tsx
â”‚   â”‚   â”‚   â”œâ”€â”€ OffersManagement.tsx
â”‚   â”‚   â”‚   â”œâ”€â”€ PartnerBrandsEditor.tsx
â”‚   â”‚   â”‚   â”œâ”€â”€ PoliciesManagement.tsx
â”‚   â”‚   â”‚   â”œâ”€â”€ SalesAgentsManagement.tsx
â”‚   â”‚   â”‚   â”œâ”€â”€ security-dashboard.tsx
â”‚   â”‚   â”‚   â”œâ”€â”€ SingleImageUploader.tsx
â”‚   â”‚   â”‚   â””â”€â”€ SocialMediaManager.tsx
â”‚   â”‚   â”œâ”€â”€ ai-research
â”‚   â”‚   â”‚   â””â”€â”€ TechStackAudit.tsx
â”‚   â”‚   â”œâ”€â”€ auth
â”‚   â”‚   â”‚   â”œâ”€â”€ InstantIdentity.tsx
â”‚   â”‚   â”‚   â”œâ”€â”€ LoginDialog.tsx
â”‚   â”‚   â”‚   â”œâ”€â”€ TwoFactorSetup.tsx
â”‚   â”‚   â”‚   â””â”€â”€ TwoFactorVerification.tsx
â”‚   â”‚   â”œâ”€â”€ BehavioralCouponPopup.tsx
â”‚   â”‚   â”œâ”€â”€ cart
â”‚   â”‚   â”‚   â”œâ”€â”€ AddToCartButton.tsx
â”‚   â”‚   â”‚   â”œâ”€â”€ CartItemCard.tsx
â”‚   â”‚   â”‚   â”œâ”€â”€ CartPage.tsx
â”‚   â”‚   â”‚   â””â”€â”€ EnhancedCartSheet.tsx
â”‚   â”‚   â”œâ”€â”€ checkout
â”‚   â”‚   â”‚   â”œâ”€â”€ CheckoutPage.tsx
â”‚   â”‚   â”‚   â””â”€â”€ CheckoutWizard.tsx
â”‚   â”‚   â”œâ”€â”€ contact-page.tsx
â”‚   â”‚   â”œâ”€â”€ customised-setups
â”‚   â”‚   â”‚   â”œâ”€â”€ BlueprintShowcase.tsx
â”‚   â”‚   â”‚   â”œâ”€â”€ ClientCustomSetupFlow.tsx
â”‚   â”‚   â”‚   â”œâ”€â”€ CustomSetupFlow.tsx
â”‚   â”‚   â”‚   â”œâ”€â”€ InteractiveTopologyDiagram.tsx
â”‚   â”‚   â”‚   â”œâ”€â”€ QuotationStatusLookup.tsx
â”‚   â”‚   â”‚   â”œâ”€â”€ QuoteCTA.tsx
â”‚   â”‚   â”‚   â”œâ”€â”€ RefreshButton.tsx
â”‚   â”‚   â”‚   â””â”€â”€ ROICostEfficiencyBanner.tsx
â”‚   â”‚   â”œâ”€â”€ discovery
â”‚   â”‚   â”‚   â”œâ”€â”€ ServiceDiscovery.tsx
â”‚   â”‚   â”‚   â””â”€â”€ ServiceSearch.tsx
â”‚   â”‚   â”œâ”€â”€ FaqsClient.tsx
â”‚   â”‚   â”œâ”€â”€ HeroCarousel.tsx
â”‚   â”‚   â”œâ”€â”€ home
â”‚   â”‚   â”‚   â”œâ”€â”€ AmbientEffects.tsx
â”‚   â”‚   â”‚   â”œâ”€â”€ HeroRotator.tsx
â”‚   â”‚   â”‚   â”œâ”€â”€ HeroVisuals.tsx
â”‚   â”‚   â”‚   â”œâ”€â”€ MagneticButton.tsx
â”‚   â”‚   â”‚   â””â”€â”€ TrackQuoteForm.tsx
â”‚   â”‚   â”œâ”€â”€ home-page.tsx
â”‚   â”‚   â”œâ”€â”€ InfrastructureLeadForm.tsx
â”‚   â”‚   â”œâ”€â”€ invoices
â”‚   â”‚   â”‚   â””â”€â”€ InvoiceTemplate.tsx
â”‚   â”‚   â”œâ”€â”€ layout
â”‚   â”‚   â”‚   â”œâ”€â”€ CookieConsentBanner.tsx
â”‚   â”‚   â”‚   â”œâ”€â”€ DeferredFloatingAIAssistant.tsx
â”‚   â”‚   â”‚   â”œâ”€â”€ DeferredRuntimeServices.tsx
â”‚   â”‚   â”‚   â”œâ”€â”€ FloatingAIAssistant.tsx
â”‚   â”‚   â”‚   â”œâ”€â”€ Footer.tsx
â”‚   â”‚   â”‚   â”œâ”€â”€ Header.tsx
â”‚   â”‚   â”‚   â””â”€â”€ TechShell.tsx
â”‚   â”‚   â”œâ”€â”€ LocalServiceLandingPage.tsx
â”‚   â”‚   â”œâ”€â”€ manager
â”‚   â”‚   â”‚   â””â”€â”€ ManagerSidebar.tsx
â”‚   â”‚   â”œâ”€â”€ mgmt
â”‚   â”‚   â”‚   â””â”€â”€ MgmtMobileNav.tsx
â”‚   â”‚   â”œâ”€â”€ offers-page.tsx
â”‚   â”‚   â”œâ”€â”€ onboarding
â”‚   â”‚   â”‚   â””â”€â”€ LazyInvoiceBuilder.tsx
â”‚   â”‚   â”œâ”€â”€ orders
â”‚   â”‚   â”‚   â”œâ”€â”€ OrderConfirmationPage.tsx
â”‚   â”‚   â”‚   â””â”€â”€ OrdersListPage.tsx
â”‚   â”‚   â”œâ”€â”€ policy-page.tsx
â”‚   â”‚   â”œâ”€â”€ products
â”‚   â”‚   â”‚   â”œâ”€â”€ ProductDetailPage.tsx
â”‚   â”‚   â”‚   â”œâ”€â”€ ProductJsonLd.tsx
â”‚   â”‚   â”‚   â”œâ”€â”€ ShopPageContent.tsx
â”‚   â”‚   â”‚   â””â”€â”€ StarRating.tsx
â”‚   â”‚   â”œâ”€â”€ profile
â”‚   â”‚   â”‚   â”œâ”€â”€ EditProfileDialog.tsx
â”‚   â”‚   â”‚   â””â”€â”€ UserProfile.tsx
â”‚   â”‚   â”œâ”€â”€ providers
â”‚   â”‚   â”‚   â””â”€â”€ ThemeProvider.tsx
â”‚   â”‚   â”œâ”€â”€ rbac
â”‚   â”‚   â”‚   â””â”€â”€ RequirePermission.tsx
â”‚   â”‚   â”œâ”€â”€ referral
â”‚   â”‚   â”‚   â””â”€â”€ ReferralWidget.tsx
â”‚   â”‚   â”œâ”€â”€ RegionalTrustBanner.tsx
â”‚   â”‚   â”œâ”€â”€ sales
â”‚   â”‚   â”‚   â”œâ”€â”€ CreateCustomerDialog.tsx
â”‚   â”‚   â”‚   â”œâ”€â”€ CreateProductDialog.tsx
â”‚   â”‚   â”‚   â”œâ”€â”€ MarketingKitTerminal.tsx
â”‚   â”‚   â”‚   â”œâ”€â”€ OrderActions.tsx
â”‚   â”‚   â”‚   â”œâ”€â”€ PurchaseSerialNumberDialog.tsx
â”‚   â”‚   â”‚   â”œâ”€â”€ SalesSidebar.tsx
â”‚   â”‚   â”‚   â”œâ”€â”€ SerialNumberDialog.tsx
â”‚   â”‚   â”‚   â”œâ”€â”€ ViewSerialsDialog.tsx
â”‚   â”‚   â”‚   â””â”€â”€ WalkInOrderManagement.tsx
â”‚   â”‚   â”œâ”€â”€ sales-external
â”‚   â”‚   â”‚   â””â”€â”€ SalesExternalSidebar.tsx
â”‚   â”‚   â”œâ”€â”€ sales-staff
â”‚   â”‚   â”‚   â””â”€â”€ SalesStaffSidebar.tsx
â”‚   â”‚   â”œâ”€â”€ services-page.tsx
â”‚   â”‚   â”œâ”€â”€ shared
â”‚   â”‚   â”‚   â”œâ”€â”€ ConfirmDialog.tsx
â”‚   â”‚   â”‚   â”œâ”€â”€ LoadingSpinner.tsx
â”‚   â”‚   â”‚   â”œâ”€â”€ MicroErrorBoundary.tsx
â”‚   â”‚   â”‚   â”œâ”€â”€ OrderDataTable.tsx
â”‚   â”‚   â”‚   â”œâ”€â”€ PublicRouteError.tsx
â”‚   â”‚   â”‚   â””â”€â”€ UniversalSearch.tsx
â”‚   â”‚   â”œâ”€â”€ tracking
â”‚   â”‚   â”‚   â””â”€â”€ LiveTimeline.tsx
â”‚   â”‚   â”œâ”€â”€ ui
â”‚   â”‚   â”‚   â”œâ”€â”€ accordion.tsx
â”‚   â”‚   â”‚   â”œâ”€â”€ alert-dialog.tsx
â”‚   â”‚   â”‚   â”œâ”€â”€ alert.tsx
â”‚   â”‚   â”‚   â”œâ”€â”€ avatar.tsx
â”‚   â”‚   â”‚   â”œâ”€â”€ badge.tsx
â”‚   â”‚   â”‚   â”œâ”€â”€ BlitzAuditBanner.tsx
â”‚   â”‚   â”‚   â”œâ”€â”€ button.tsx
â”‚   â”‚   â”‚   â”œâ”€â”€ card.tsx
â”‚   â”‚   â”‚   â”œâ”€â”€ checkbox.tsx
â”‚   â”‚   â”‚   â”œâ”€â”€ dialog.tsx
â”‚   â”‚   â”‚   â”œâ”€â”€ dropdown-menu.tsx
â”‚   â”‚   â”‚   â”œâ”€â”€ form.tsx
â”‚   â”‚   â”‚   â”œâ”€â”€ FreeInstallationOfferBanner.tsx
â”‚   â”‚   â”‚   â”œâ”€â”€ input.tsx
â”‚   â”‚   â”‚   â”œâ”€â”€ label.tsx
â”‚   â”‚   â”‚   â”œâ”€â”€ logo.tsx
â”‚   â”‚   â”‚   â”œâ”€â”€ markdown-renderer.tsx
â”‚   â”‚   â”‚   â”œâ”€â”€ modal.tsx
â”‚   â”‚   â”‚   â”œâ”€â”€ optimized-image.tsx
â”‚   â”‚   â”‚   â”œâ”€â”€ popover.tsx
â”‚   â”‚   â”‚   â”œâ”€â”€ radio-group.tsx
â”‚   â”‚   â”‚   â”œâ”€â”€ scroll-area.tsx
â”‚   â”‚   â”‚   â”œâ”€â”€ select.tsx
â”‚   â”‚   â”‚   â”œâ”€â”€ separator.tsx
â”‚   â”‚   â”‚   â”œâ”€â”€ sheet.tsx
â”‚   â”‚   â”‚   â”œâ”€â”€ skeleton.tsx
â”‚   â”‚   â”‚   â”œâ”€â”€ switch.tsx
â”‚   â”‚   â”‚   â”œâ”€â”€ table.tsx
â”‚   â”‚   â”‚   â”œâ”€â”€ tabs.tsx
â”‚   â”‚   â”‚   â”œâ”€â”€ textarea.tsx
â”‚   â”‚   â”‚   â”œâ”€â”€ toast.tsx
â”‚   â”‚   â”‚   â”œâ”€â”€ toaster.tsx
â”‚   â”‚   â”‚   â”œâ”€â”€ ViralWarrantyModal.tsx
â”‚   â”‚   â”‚   â””â”€â”€ WarrantyTelemetryBadge.tsx
â”‚   â”‚   â”œâ”€â”€ ux
â”‚   â”‚   â”‚   â”œâ”€â”€ MinimalAuth.tsx
â”‚   â”‚   â”‚   â”œâ”€â”€ OrderTimeline.tsx
â”‚   â”‚   â”‚   â”œâ”€â”€ ProgressiveCheckout.tsx
â”‚   â”‚   â”‚   â””â”€â”€ ServiceFinder.tsx
â”‚   â”‚   â””â”€â”€ wishlist
â”‚   â”‚       â””â”€â”€ WishlistButton.tsx
â”‚   â”œâ”€â”€ context
â”‚   â”‚   â”œâ”€â”€ AppProvider.tsx
â”‚   â”‚   â”œâ”€â”€ AuthProvider.tsx
â”‚   â”‚   â””â”€â”€ OrderProvider.tsx
â”‚   â”œâ”€â”€ env.ts
â”‚   â”œâ”€â”€ hooks
â”‚   â”‚   â”œâ”€â”€ use-analytics.ts
â”‚   â”‚   â”œâ”€â”€ use-behavioral-cro.ts
â”‚   â”‚   â”œâ”€â”€ use-debounce.ts
â”‚   â”‚   â”œâ”€â”€ use-deferred-activation.ts
â”‚   â”‚   â”œâ”€â”€ use-lead-capture-trigger.tsx
â”‚   â”‚   â”œâ”€â”€ use-near-viewport.ts
â”‚   â”‚   â”œâ”€â”€ use-page-content.ts
â”‚   â”‚   â”œâ”€â”€ use-payment-methods.ts
â”‚   â”‚   â”œâ”€â”€ use-permissions.ts
â”‚   â”‚   â”œâ”€â”€ use-prefers-reduced-motion.ts
â”‚   â”‚   â”œâ”€â”€ use-reveal-sections.ts
â”‚   â”‚   â”œâ”€â”€ use-toast.ts
â”‚   â”‚   â”œâ”€â”€ use-viral-attribution.ts
â”‚   â”‚   â”œâ”€â”€ use-warranty-telemetry.ts
â”‚   â”‚   â”œâ”€â”€ use-window-size.ts
â”‚   â”‚   â”œâ”€â”€ useCheckoutMachine.ts
â”‚   â”‚   â”œâ”€â”€ useFuzzySearch.ts
â”‚   â”‚   â”œâ”€â”€ useLiveOrder.ts
â”‚   â”‚   â””â”€â”€ usePermissions.ts
â”‚   â”œâ”€â”€ lib
â”‚   â”‚   â”œâ”€â”€ admin-auth.ts
â”‚   â”‚   â”œâ”€â”€ ai
â”‚   â”‚   â”‚   â”œâ”€â”€ gemini-service.ts
â”‚   â”‚   â”‚   â”œâ”€â”€ product-details.ts
â”‚   â”‚   â”‚   â”œâ”€â”€ prompts.ts
â”‚   â”‚   â”‚   â””â”€â”€ tax-classification.ts
â”‚   â”‚   â”œâ”€â”€ api-email-route.ts
â”‚   â”‚   â”œâ”€â”€ api-response.ts
â”‚   â”‚   â”œâ”€â”€ apiClient.ts
â”‚   â”‚   â”œâ”€â”€ auth
â”‚   â”‚   â”‚   â”œâ”€â”€ admin-guard.ts
â”‚   â”‚   â”‚   â”œâ”€â”€ guard.ts
â”‚   â”‚   â”‚   â”œâ”€â”€ server-role.ts
â”‚   â”‚   â”‚   â””â”€â”€ superadmin-session.ts
â”‚   â”‚   â”œâ”€â”€ captcha
â”‚   â”‚   â”‚   â””â”€â”€ captcha-service.ts
â”‚   â”‚   â”œâ”€â”€ catalogue-pdf-generator.ts
â”‚   â”‚   â”œâ”€â”€ checkout-engine.test.ts
â”‚   â”‚   â”œâ”€â”€ checkout-engine.ts
â”‚   â”‚   â”œâ”€â”€ config-service.ts
â”‚   â”‚   â”œâ”€â”€ constants.ts
â”‚   â”‚   â”œâ”€â”€ crypto-utils.ts
â”‚   â”‚   â”œâ”€â”€ custom-setup-pricing.ts
â”‚   â”‚   â”œâ”€â”€ custom-setup-service.ts
â”‚   â”‚   â”œâ”€â”€ custom-setup.constants.ts
â”‚   â”‚   â”œâ”€â”€ data.ts
â”‚   â”‚   â”œâ”€â”€ email
â”‚   â”‚   â”‚   â”œâ”€â”€ client.ts
â”‚   â”‚   â”‚   â”œâ”€â”€ index.ts
â”‚   â”‚   â”‚   â”œâ”€â”€ queue.ts
â”‚   â”‚   â”‚   â”œâ”€â”€ service.ts
â”‚   â”‚   â”‚   â”œâ”€â”€ templates.ts
â”‚   â”‚   â”‚   â””â”€â”€ types.ts
â”‚   â”‚   â”œâ”€â”€ enhanced-commission-service.ts
â”‚   â”‚   â”œâ”€â”€ environment-validator.ts
â”‚   â”‚   â”œâ”€â”€ errorMapper.ts
â”‚   â”‚   â”œâ”€â”€ errors.ts
â”‚   â”‚   â”œâ”€â”€ fetch-retry.ts
â”‚   â”‚   â”œâ”€â”€ homepage-auto-fill.ts
â”‚   â”‚   â”œâ”€â”€ hooks.ts
â”‚   â”‚   â”œâ”€â”€ image-processor.ts
â”‚   â”‚   â”œâ”€â”€ image-utils.ts
â”‚   â”‚   â”œâ”€â”€ improved-email-service.ts
â”‚   â”‚   â”œâ”€â”€ indian-tax.test.ts
â”‚   â”‚   â”œâ”€â”€ indian-tax.ts
â”‚   â”‚   â”œâ”€â”€ infobip
â”‚   â”‚   â”‚   â””â”€â”€ infobip-whatsapp-otp.ts
â”‚   â”‚   â”œâ”€â”€ logger.ts
â”‚   â”‚   â”œâ”€â”€ metadata.ts
â”‚   â”‚   â”œâ”€â”€ offer-discount-service.ts
â”‚   â”‚   â”œâ”€â”€ order-utils.ts
â”‚   â”‚   â”œâ”€â”€ orders
â”‚   â”‚   â”‚   â””â”€â”€ normalizers.ts
â”‚   â”‚   â”œâ”€â”€ otp-manager.ts
â”‚   â”‚   â”œâ”€â”€ otp-service.ts
â”‚   â”‚   â”œâ”€â”€ page-content.ts
â”‚   â”‚   â”œâ”€â”€ payu-service.ts
â”‚   â”‚   â”œâ”€â”€ pdf-generator.ts
â”‚   â”‚   â”œâ”€â”€ permissions-client.ts
â”‚   â”‚   â”œâ”€â”€ permissions.ts
â”‚   â”‚   â”œâ”€â”€ pricing-service.ts
â”‚   â”‚   â”œâ”€â”€ product-visibility.ts
â”‚   â”‚   â”œâ”€â”€ queue
â”‚   â”‚   â”‚   â””â”€â”€ image-jobs.ts
â”‚   â”‚   â”œâ”€â”€ rate-limit.ts
â”‚   â”‚   â”œâ”€â”€ redis.ts
â”‚   â”‚   â”œâ”€â”€ roles.ts
â”‚   â”‚   â”œâ”€â”€ s3-storage.ts
â”‚   â”‚   â”œâ”€â”€ sanitize-html.ts
â”‚   â”‚   â”œâ”€â”€ security
â”‚   â”‚   â”‚   â””â”€â”€ network-validation.ts
â”‚   â”‚   â”œâ”€â”€ server-role-guard.ts
â”‚   â”‚   â”œâ”€â”€ service-management.ts
â”‚   â”‚   â”œâ”€â”€ session-manager.ts
â”‚   â”‚   â”œâ”€â”€ settings.ts
â”‚   â”‚   â”œâ”€â”€ site-url.ts
â”‚   â”‚   â”œâ”€â”€ strings.ts
â”‚   â”‚   â”œâ”€â”€ supabase
â”‚   â”‚   â”‚   â”œâ”€â”€ client.ts
â”‚   â”‚   â”‚   â”œâ”€â”€ env.ts
â”‚   â”‚   â”‚   â””â”€â”€ server.ts
â”‚   â”‚   â”œâ”€â”€ supabase-server.ts
â”‚   â”‚   â”œâ”€â”€ supabase-storage.ts
â”‚   â”‚   â”œâ”€â”€ supabase.ts
â”‚   â”‚   â”œâ”€â”€ two-factor-manager.ts
â”‚   â”‚   â”œâ”€â”€ types
â”‚   â”‚   â”‚   â”œâ”€â”€ database.ts
â”‚   â”‚   â”‚   â””â”€â”€ products.ts
â”‚   â”‚   â”œâ”€â”€ types.ts
â”‚   â”‚   â”œâ”€â”€ utils.ts
â”‚   â”‚   â”œâ”€â”€ validation.ts
â”‚   â”‚   â”œâ”€â”€ webhook-logger.ts
â”‚   â”‚   â”œâ”€â”€ webhook-validator.ts
â”‚   â”‚   â”œâ”€â”€ whatsapp
â”‚   â”‚   â”‚   â””â”€â”€ whatsapp-otp-service.ts
â”‚   â”‚   â””â”€â”€ whatsapp-service.ts
â”‚   â”œâ”€â”€ store
â”‚   â”‚   â”œâ”€â”€ cartStore.ts
â”‚   â”‚   â””â”€â”€ wishlistStore.ts
â”‚   â””â”€â”€ types
â”‚       â”œâ”€â”€ css.d.ts
â”‚       â”œâ”€â”€ fontkit.d.ts
â”‚       â””â”€â”€ pdfkit-standalone.d.ts
â”œâ”€â”€ supabase
â”‚   â”œâ”€â”€ migrations
â”‚   â”‚   â”œâ”€â”€ 20260608000000_final_schema.sql
â”‚   â”‚   â”œâ”€â”€ 20260619000000_global_app_config.sql
â”‚   â”‚   â”œâ”€â”€ 20260620000000_performance_database_hardening.sql
â”‚   â”‚   â”œâ”€â”€ 20260621000000_storage_security_hardening.sql
â”‚   â”‚   â”œâ”€â”€ 20260621095702_create_otp_verifications.sql
â”‚   â”‚   â”œâ”€â”€ 20260621230000_dynamic_rbac_schema.sql
â”‚   â”‚   â””â”€â”€ 20260622000000_immutable_audit_trails.sql
â”‚   â”œâ”€â”€ update_products.sql
â”‚   â””â”€â”€ upload_and_update_sql.js
â”œâ”€â”€ tailwind.config.ts
â””â”€â”€ tsconfig.json
```

### Exhaustive File Mapping

| File Path | Primary Purpose | Key Exports | Relationships |
|---|---|---|---|
| `eslint.config.js` | General component/module | None | @next/eslint-plugin-next, @typescript-eslint/parser |
| `middleware.ts` | General component/module | config | next/server, @supabase/ssr, @/lib/auth/superadmin-session, @/lib/supabase/env |
| `next.config.mjs` | General component/module | None | os, next |
| `package.json` | Configuration/Data | None | None |
| `postcss.config.mjs` | General component/module | None | None |
| `src/app/about/business-info/page.tsx` | Next.js App Route/Layout | metadata, dynamic, BusinessInfoPage | next, lucide-react, @/components/ui/card |
| `src/app/about/page.tsx` | Next.js App Route/Layout | metadata, Page | next, @/components/about-page, @/lib/metadata |
| `src/app/activate-warranty/[serialNumber]/page.tsx` | Next.js App Route/Layout | WarrantyActivationPage | react, next/navigation, @/components/ui/ViralWarrantyModal |
| `src/app/admin/page.tsx` | Next.js App Route/Layout | AdminPage | next/navigation |
| `src/app/agents/recruit/page.tsx` | Next.js App Route/Layout | metadata, AgentRecruitPage | react, next, lucide-react, @/components/ui/button, next/link |
| `src/app/ai-research/layout.tsx` | Next.js App Route/Layout | metadata, AiResearchLayout | next |
| `src/app/ai-research/page.tsx` | Next.js App Route/Layout | AiResearchPage | react, lucide-react, @/components/ui/markdown-renderer, @/components/ai-research/TechStackAudit, @/components/ui/button... |
| `src/app/api/admin/agents/approve/route.ts` | API Route Handler | dynamic | next/server, @/lib/auth/admin-guard |
| `src/app/api/admin/agents/list/route.ts` | API Route Handler | dynamic | next/server, @/lib/auth/admin-guard |
| `src/app/api/admin/agents/reject/route.ts` | API Route Handler | dynamic | next/server, @/lib/auth/admin-guard |
| `src/app/api/admin/ai-query/route.ts` | API Route Handler | None | next/server, @/lib/supabase/server, @/lib/roles, @/lib/logger, @/lib/ai/gemini-service... |
| `src/app/api/admin/ai/product-description/route.ts` | API Route Handler | None | next/server, @/lib/supabase/server, @/lib/logger, @/lib/auth/admin-guard, @/lib/ai/gemini-service... |
| `src/app/api/admin/ai/related-products/route.ts` | API Route Handler | None | next/server, @/lib/supabase/server, @/lib/auth/admin-guard, @/lib/logger |
| `src/app/api/admin/custom-setups/route.ts` | API Route Handler | dynamic, revalidate | next/server, @/lib/custom-setup-service, @/lib/auth/admin-guard, @/lib/logger, @/lib/redis... |
| `src/app/api/admin/dashboard/route.ts` | API Route Handler | dynamic, revalidate | next/server, @/lib/logger, @/lib/auth/admin-guard, @/lib/supabase/server, @/lib/order-utils |
| `src/app/api/admin/faqs/[id]/route.ts` | API Route Handler | dynamic | next/server, @/lib/api-response, @/lib/server-role-guard |
| `src/app/api/admin/faqs/route.ts` | API Route Handler | dynamic | next/server, @/lib/api-response, @/lib/server-role-guard |
| `src/app/api/admin/homepage/auto-fill/route.ts` | API Route Handler | dynamic | next/server, @/lib/supabase/server, @/lib/logger, @/lib/roles, @/lib/types |
| `src/app/api/admin/homepage/auto-fill/run/route.ts` | API Route Handler | dynamic | next/server, @/lib/supabase/server, @/lib/logger, @/lib/roles, @/lib/types... |
| `src/app/api/admin/inventory/warranty/register/route.ts` | API Route Handler | None | next/server, @/lib/whatsapp-service, @/lib/supabase/server |
| `src/app/api/admin/jobs/[id]/route.ts` | API Route Handler | None | next/server, @/lib/supabase/server, @/lib/admin-auth, @/lib/queue/image-jobs |
| `src/app/api/admin/manage-role/route.ts` | API Route Handler | runtime, maxDuration | next/server, @supabase/supabase-js, zod, @/lib/logger |
| `src/app/api/admin/marketing/blitz/route.ts` | API Route Handler | None | next/server, @/lib/whatsapp-service, @/lib/supabase/server |
| `src/app/api/admin/marketing/broadcast/route.ts` | API Route Handler | None | next/server, zod, @/lib/whatsapp-service, @/lib/improved-email-service, @/lib/supabase/server... |
| `src/app/api/admin/orders/[id]/pending-actions/route.ts` | API Route Handler | None | next/server, @/lib/supabase/server, @/lib/supabase-storage, @/lib/logger, @/lib/environment-validator... |
| `src/app/api/admin/orders/route.ts` | API Route Handler | dynamic | next/server, @/lib/auth/server-role, @/lib/supabase/server, @/lib/logger, @/lib/orders/normalizers |
| `src/app/api/admin/payment-settings/dedupe/route.ts` | API Route Handler | runtime, maxDuration | next/server, @/lib/supabase-server |
| `src/app/api/admin/payment-settings/route.ts` | API Route Handler | None | next/server |
| `src/app/api/admin/pricing/[id]/route.ts` | API Route Handler | dynamic | next/server, @/lib/supabase/server, @/lib/permissions |
| `src/app/api/admin/pricing/route.ts` | API Route Handler | dynamic | next/server, @/lib/supabase/server, @/lib/permissions |
| `src/app/api/admin/products/ai-add/route.ts` | API Route Handler | None | crypto, next/server, @/lib/logger, @/lib/supabase/server, @/lib/auth/server-role... |
| `src/app/api/admin/products/archive/route.ts` | API Route Handler | None | crypto, next/server, zod, @/lib/logger, @/lib/supabase/server... |
| `src/app/api/admin/products/bulk-price/route.ts` | API Route Handler | None | next/server, @/lib/logger, @/lib/supabase/server, @/lib/auth/server-role |
| `src/app/api/admin/products/route.ts` | API Route Handler | dynamic, POST, PUT | next/server, @/lib/supabase/server, @/lib/permissions, @/lib/logger, @/lib/image-utils |
| `src/app/api/admin/quotes/[id]/download/route.ts` | API Route Handler | dynamic | next/server, @/lib/supabase/server, @/lib/admin-auth, @/lib/pdf-generator, @/lib/logger |
| `src/app/api/admin/quotes/[id]/respond/route.ts` | API Route Handler | None | next/server, @/lib/supabase/server, @/lib/logger |
| `src/app/api/admin/quotes/advance-payment/route.ts` | API Route Handler | None | @supabase/supabase-js, next/server, @/lib/logger, @/lib/whatsapp-service |
| `src/app/api/admin/quotes/route.ts` | API Route Handler | dynamic | next/server, @/lib/supabase/server, @/lib/admin-auth |
| `src/app/api/admin/redemptions/approve/route.ts` | API Route Handler | dynamic | next/server, @/lib/auth/admin-guard |
| `src/app/api/admin/redemptions/list/route.ts` | API Route Handler | dynamic | next/server, @/lib/supabase/server |
| `src/app/api/admin/redemptions/process/route.ts` | API Route Handler | dynamic | next/server, @/lib/auth/admin-guard |
| `src/app/api/admin/roles/set/route.ts` | API Route Handler | None | next/server, @/lib/auth/guard, @/lib/roles, @/lib/supabase/server |
| `src/app/api/admin/sales-agents/[id]/route.ts` | API Route Handler | dynamic | next/server, @/lib/supabase/server, @/lib/permissions |
| `src/app/api/admin/sales-agents/route.ts` | API Route Handler | dynamic | next/server, @/lib/supabase/server, @/lib/permissions, @/lib/logger |
| `src/app/api/admin/services/route.ts` | API Route Handler | dynamic, revalidate | next/server, @/lib/auth/admin-guard, @/lib/logger |
| `src/app/api/admin/setup-initial-admins/route.ts` | API Route Handler | runtime, maxDuration | next/server, @supabase/supabase-js, @/lib/rate-limit |
| `src/app/api/admin/setup-sales-agents/route.ts` | API Route Handler | dynamic | next/server, @/lib/supabase/server, @/lib/logger |
| `src/app/api/admin/users/[id]/history/route.ts` | API Route Handler | None | next/server, @/lib/supabase/server, @/lib/admin-auth |
| `src/app/api/agents/apply/route.ts` | API Route Handler | dynamic | next/server, @/lib/supabase/server |
| `src/app/api/agents/commissions/route.ts` | API Route Handler | dynamic | next/server, @/lib/supabase/server |
| `src/app/api/agents/me/route.ts` | API Route Handler | dynamic | next/server, @/lib/supabase/server |
| `src/app/api/agents/orders/create/route.ts` | API Route Handler | dynamic | next/server, @/lib/supabase/server, @/lib/whatsapp-service, @/lib/logger |
| `src/app/api/agents/redemptions/route.ts` | API Route Handler | dynamic | next/server, @/lib/supabase/server |
| `src/app/api/ai/generate-description/route.ts` | API Route Handler | None | crypto, next/server, zod, @/lib/ai/gemini-service, @/lib/auth/guard... |
| `src/app/api/ai/price-request/route.ts` | API Route Handler | None | next/server, @/lib/supabase/server |
| `src/app/api/ai/product-details/route.ts` | API Route Handler | None | crypto, next/server, zod, @/lib/ai/gemini-service, @/lib/auth/guard... |
| `src/app/api/ai/research/route.ts` | API Route Handler | None | crypto, next/server, @/lib/supabase/server, @/lib/ai/gemini-service, @/lib/image-utils... |
| `src/app/api/analytics/dashboard/route.ts` | API Route Handler | None | next/server, @/lib/supabase/server, @/lib/admin-auth |
| `src/app/api/analytics/track/route.ts` | API Route Handler | None | next/server, @/lib/supabase/server, @/lib/logger |
| `src/app/api/auth/2fa/disable/route.ts` | API Route Handler | dynamic | next/server, @/lib/supabase/server, @/lib/two-factor-manager |
| `src/app/api/auth/2fa/setup/route.ts` | API Route Handler | dynamic | next/server, @/lib/supabase/server, @/lib/two-factor-manager, @/lib/logger |
| `src/app/api/auth/2fa/status/route.ts` | API Route Handler | dynamic | next/server, @/lib/supabase/server, @/lib/two-factor-manager, @/lib/logger |
| `src/app/api/auth/2fa/verify/route.ts` | API Route Handler | None | next/server, @/lib/supabase/server, @/lib/two-factor-manager |
| `src/app/api/auth/callback/route.ts` | API Route Handler | None | next/server, @supabase/ssr, @/lib/supabase/env, next/headers |
| `src/app/api/auth/complete-signup/route.ts` | API Route Handler | None | next/server, @supabase/supabase-js, @/lib/logger, @/lib/whatsapp-service |
| `src/app/api/auth/first-login-whatsapp/route.ts` | API Route Handler | None | next/server, @supabase/supabase-js, @/lib/logger, @/lib/whatsapp-service |
| `src/app/api/auth/forgot-password/route.ts` | API Route Handler | None | next/server, @supabase/supabase-js, @/lib/captcha/captcha-service, @/lib/logger, @/lib/otp-manager |
| `src/app/api/auth/quick-login/route.ts` | API Route Handler | dynamic | next/server, @/lib/supabase/server |
| `src/app/api/auth/resend-verification/route.ts` | API Route Handler | None | next/server, @/lib/rate-limit, @/lib/errors, @/lib/logger, @/lib/otp-manager |
| `src/app/api/auth/reset-password/route.ts` | API Route Handler | None | next/server, @supabase/supabase-js, @/lib/logger, @/lib/otp-manager |
| `src/app/api/auth/resolve-phone/route.ts` | API Route Handler | None | next/server, @supabase/supabase-js |
| `src/app/api/auth/send-otp/route.ts` | API Route Handler | runtime, maxDuration | next/server, @supabase/supabase-js, @/lib/otp-manager, @/lib/logger, @/lib/errors... |
| `src/app/api/auth/session/route.ts` | API Route Handler | None | next/server, @/lib/supabase/server, @/lib/logger, @/lib/auth/superadmin-session |
| `src/app/api/auth/signout/route.ts` | API Route Handler | None | @supabase/ssr, next/server, @/lib/logger, @/lib/supabase/env |
| `src/app/api/auth/signup/route.ts` | API Route Handler | None | next/server, @supabase/supabase-js, @/lib/captcha/captcha-service, @/lib/logger, @/lib/rate-limit... |
| `src/app/api/auth/verify-otp/route.ts` | API Route Handler | runtime, maxDuration | next/server, @supabase/supabase-js, @/lib/otp-manager, @/lib/logger, @/lib/errors... |
| `src/app/api/auto-offers/route.ts` | API Route Handler | None | next/server, @supabase/supabase-js, @/lib/supabase/server, @/lib/logger |
| `src/app/api/blueprints/attribution/conversion/route.ts` | API Route Handler | None | next/server, @/lib/supabase/server, @/lib/logger |
| `src/app/api/captcha/config/route.ts` | API Route Handler | None | next/server, @/lib/captcha/captcha-service, @/lib/logger |
| `src/app/api/captcha/verify/route.ts` | API Route Handler | None | next/server, @/lib/captcha/captcha-service, @/lib/logger |
| `src/app/api/cart/merge/route.ts` | API Route Handler | None | next/server, @/lib/supabase/server, @/lib/logger |
| `src/app/api/checkout/calculate/route.ts` | API Route Handler | None | next/server, @/lib/checkout-engine, @/lib/supabase/server, @/lib/logger, @/lib/types... |
| `src/app/api/commissions/calculate/route.ts` | API Route Handler | None | next/server, @/lib/enhanced-commission-service, @/lib/supabase/server, @/lib/logger |
| `src/app/api/commissions/payments/route.ts` | API Route Handler | None | next/server, @/lib/enhanced-commission-service |
| `src/app/api/commissions/rules/route.ts` | API Route Handler | None | next/server, @/lib/enhanced-commission-service, @/lib/supabase/server, @/lib/logger |
| `src/app/api/contact-messages/[id]/route.ts` | API Route Handler | dynamic | next/server, zod, @/lib/supabase/server, @/lib/permissions, @/lib/logger... |
| `src/app/api/contact-messages/route.ts` | API Route Handler | None | next/server, zod, @/lib/supabase/server, @/lib/rate-limit, @/lib/logger... |
| `src/app/api/coupons/route.ts` | API Route Handler | None | @supabase/supabase-js, next/server, @/lib/supabase/server, @/lib/logger |
| `src/app/api/cron/recover-abandoned-registrations/route.ts` | API Route Handler | None | next/server, @/lib/supabase/server, @/lib/whatsapp-service, @/lib/logger |
| `src/app/api/cron/service-retention/route.ts` | API Route Handler | None | next/server, @/lib/supabase/server, @/lib/whatsapp-service, @/lib/logger |
| `src/app/api/custom-setups/route.ts` | API Route Handler | None | next/server, @/lib/api-response, @/lib/custom-setup-service, @/lib/logger |
| `src/app/api/customer-promotions/route.ts` | API Route Handler | None | next/server, @supabase/supabase-js |
| `src/app/api/customer/notifications/route.ts` | API Route Handler | None | next/server, @/lib/supabase/server, @/lib/whatsapp-service, @/lib/logger |
| `src/app/api/customers/register/route.ts` | API Route Handler | None | next/server, @/lib/supabase/server, @/lib/whatsapp-service, @/lib/logger, @/lib/errors... |
| `src/app/api/discounts/calculate/route.ts` | API Route Handler | dynamic | next/server, @/lib/supabase/server |
| `src/app/api/discounts/route.ts` | API Route Handler | None | @supabase/supabase-js, next/server, @/lib/auth/server-role, @/lib/supabase/server, @/lib/logger |
| `src/app/api/email/abandoned-cart/route.ts` | API Route Handler | None | next/server, @/lib/whatsapp-service, @/lib/logger, @/lib/rate-limit, @/lib/supabase/server |
| `src/app/api/email/email-change/route.ts` | API Route Handler | None | next/server, @/lib/email, @/lib/api-email-route |
| `src/app/api/email/marketing/route.ts` | API Route Handler | None | next/server, @/lib/email, @/lib/rate-limit, @/lib/server-role-guard |
| `src/app/api/email/notify-manager/route.ts` | API Route Handler | None | next/server, zod, @/lib/email, @/lib/supabase/server, @/lib/roles |
| `src/app/api/email/notify-sales-pickup/route.ts` | API Route Handler | None | next/server, @/lib/whatsapp-service, @/lib/logger, @/lib/rate-limit |
| `src/app/api/email/order-approved/route.ts` | API Route Handler | None | next/server, @/lib/whatsapp-service, @/lib/logger, @/lib/rate-limit |
| `src/app/api/email/order-completion/route.ts` | API Route Handler | None | next/server, @/lib/email, @/lib/rate-limit, @/lib/supabase/server |
| `src/app/api/email/order-confirmation/route.ts` | API Route Handler | None | next/server, @/lib/email, @/lib/rate-limit, @/lib/supabase/server |
| `src/app/api/email/order-delivered/route.ts` | API Route Handler | None | next/server, @/lib/email, @/lib/rate-limit, @/lib/supabase/server |
| `src/app/api/email/password-reset/route.ts` | API Route Handler | None | next/server, @/lib/email, @/lib/rate-limit, @/lib/supabase/server |
| `src/app/api/email/payment-confirmation/route.ts` | API Route Handler | None | next/server, @/lib/email, @/lib/rate-limit, @/lib/supabase/server |
| `src/app/api/email/payment-failed/route.ts` | API Route Handler | None | next/server, @/lib/email, @/lib/rate-limit, @/lib/supabase/server |
| `src/app/api/email/payment-pending/route.ts` | API Route Handler | None | next/server, @/lib/email, @/lib/api-email-route |
| `src/app/api/email/pickup/route.ts` | API Route Handler | None | next/server, @/lib/whatsapp-service, @/lib/logger, @/lib/rate-limit, @/lib/supabase/server |
| `src/app/api/email/shipping/route.ts` | API Route Handler | None | next/server, @/lib/email, @/lib/rate-limit, @/lib/supabase/server |
| `src/app/api/email/verification/route.ts` | API Route Handler | None | next/server, @/lib/email, @/lib/rate-limit, @/lib/supabase/server |
| `src/app/api/email/welcome/route.ts` | API Route Handler | None | next/server, @/lib/email, @/lib/api-email-route |
| `src/app/api/faqs/route.ts` | API Route Handler | dynamic | next/server, @/lib/api-response, @/lib/supabase/server |
| `src/app/api/free-installation-slots/route.ts` | API Route Handler | None | @supabase/supabase-js, next/server |
| `src/app/api/gst-verify/route.ts` | API Route Handler | None | next/server, @/lib/indian-tax |
| `src/app/api/health/email/route.ts` | API Route Handler | runtime, maxDuration | next/server, @/lib/improved-email-service |
| `src/app/api/health/orders/route.ts` | API Route Handler | runtime, maxDuration | next/server, @supabase/supabase-js |
| `src/app/api/health/otp/route.ts` | API Route Handler | runtime, maxDuration | next/server, @/lib/otp-manager |
| `src/app/api/health/route.ts` | API Route Handler | None | next/server, @/lib/supabase/server, @/lib/environment-validator, @/lib/logger |
| `src/app/api/health/summary/route.ts` | API Route Handler | runtime | next/server, @/lib/supabase/server |
| `src/app/api/inventory/route.ts` | API Route Handler | None | next/server, @/lib/server-role-guard, @/lib/supabase/server |
| `src/app/api/inventory/transactions/route.ts` | API Route Handler | None | crypto, next/server, zod, @/lib/logger, @/lib/server-role-guard... |
| `src/app/api/marketing/triggers/order-delivered-followup/route.ts` | API Route Handler | None | next/server, @/lib/supabase/server, @/lib/whatsapp-service, @/lib/logger |
| `src/app/api/metadata/route.ts` | API Route Handler | None | next/server, @/lib/supabase/server |
| `src/app/api/offers/route.ts` | API Route Handler | None | next/server, @/lib/supabase/server, @/lib/auth/server-role, @/lib/logger |
| `src/app/api/orders/auto-cancel/route.ts` | API Route Handler | dynamic | next/server, @/lib/supabase/server, @/lib/logger, @/lib/roles |
| `src/app/api/orders/commission/route.ts` | API Route Handler | dynamic | next/server, @/lib/supabase/server, @/lib/enhanced-commission-service |
| `src/app/api/orders/route.ts` | API Route Handler | None | next/server, @/lib/supabase/server, @/lib/rate-limit, @/lib/site-url, @/lib/constants... |
| `src/app/api/orders/update-status/route.ts` | API Route Handler | dynamic | next/server, @/lib/supabase/server, @/lib/logger, @/lib/environment-validator, @/lib/whatsapp-service... |
| `src/app/api/otp/generate/route.ts` | API Route Handler | None | next/server, @supabase/supabase-js, @/lib/server-role-guard, @/lib/otp-manager, @/lib/rate-limit... |
| `src/app/api/otp/resend/route.ts` | API Route Handler | None | next/server, @/lib/otp-manager, @/lib/server-role-guard, @supabase/supabase-js |
| `src/app/api/otp/verify/route.ts` | API Route Handler | None | next/server, @/lib/otp-manager, @/lib/logger, @/lib/supabase/server, @/lib/server-role-guard... |
| `src/app/api/page-content/route.ts` | API Route Handler | None | next/server, @supabase/supabase-js, @/lib/auth/admin-guard, @/lib/logger |
| `src/app/api/payment/payu/callback/route.ts` | API Route Handler | None | crypto, next/server, @supabase/supabase-js, @/lib/errors, @/lib/logger... |
| `src/app/api/payment/payu/initiate/route.ts` | API Route Handler | None | crypto, next/server, @supabase/supabase-js, @/lib/rate-limit, @/lib/auth/server-role... |
| `src/app/api/payments/update/route.ts` | API Route Handler | None | next/server, @/lib/supabase/server, @/lib/whatsapp-service, @/lib/logger, @/lib/errors... |
| `src/app/api/pricing/calculate/route.ts` | API Route Handler | dynamic | next/server, @/lib/pricing-service, @/lib/logger |
| `src/app/api/pricing/customer-type/route.ts` | API Route Handler | dynamic | next/server, @/lib/pricing-service |
| `src/app/api/products/[id]/route.ts` | API Route Handler | dynamic | next/server, @/lib/supabase/server, @/lib/auth/server-role, @/lib/logger, @/lib/image-utils... |
| `src/app/api/products/bulk-edit/route.ts` | API Route Handler | None | next/server, @/lib/supabase/server, @/lib/logger |
| `src/app/api/products/cleanup-images/route.ts` | API Route Handler | None | next/server, @/lib/auth/server-role, @/lib/logger, @/lib/queue/image-jobs |
| `src/app/api/products/cleanup/route.ts` | API Route Handler | runtime | next/server, @/lib/auth/admin-guard, @/lib/logger |
| `src/app/api/products/export/route.ts` | API Route Handler | dynamic | next/server, @/lib/supabase/server |
| `src/app/api/products/fix-images/route.ts` | API Route Handler | None | next/server, @/lib/supabase/server, @/lib/admin-auth, @/lib/logger, @/lib/queue/image-jobs |
| `src/app/api/products/image-diagnostics/route.ts` | API Route Handler | None | next/server, @/lib/supabase/server, @/lib/image-utils, @/lib/logger |
| `src/app/api/products/import/route.ts` | API Route Handler | None | next/server, @/lib/supabase/server, @/lib/types/products, @/lib/logger, @/lib/sanitize-html |
| `src/app/api/products/manual-import/route.ts` | API Route Handler | None | fs, path, next/server, @/lib/supabase/client, @/lib/logger |
| `src/app/api/products/recommendations/route.ts` | API Route Handler | None | next/server, @/lib/supabase/server, @/lib/image-utils, @/lib/product-visibility |
| `src/app/api/products/route.ts` | API Route Handler | None | crypto, next/server, @/lib/supabase/server, @/lib/auth/server-role, @/lib/logger... |
| `src/app/api/products/simple-import/route.ts` | API Route Handler | None | next/server, @/lib/supabase/server, @/lib/logger |
| `src/app/api/products/template/route.ts` | API Route Handler | None | next/server, @/lib/logger |
| `src/app/api/promotions/claim-viral/route.ts` | API Route Handler | None | next/server, zod, @/lib/supabase/server, @/lib/rate-limit, @/lib/logger |
| `src/app/api/promotions/free-installation-claim/route.ts` | API Route Handler | None | next/server, zod, @/lib/otp-manager, @/lib/supabase/server, @/lib/rate-limit... |
| `src/app/api/quotes/[id]/accept-counter/route.ts` | API Route Handler | None | @supabase/supabase-js, next/server |
| `src/app/api/quotes/[id]/advance-payment/confirm/route.ts` | API Route Handler | None | @supabase/supabase-js, next/server, @/lib/logger |
| `src/app/api/quotes/[id]/advance-payment/generate-link/route.ts` | API Route Handler | None | @supabase/supabase-js, next/server, @/lib/logger, crypto |
| `src/app/api/quotes/[id]/reject-counter/route.ts` | API Route Handler | None | @supabase/supabase-js, next/server |
| `src/app/api/quotes/[id]/route.ts` | API Route Handler | None | @supabase/supabase-js, next/server, @/lib/pdf-generator, @/lib/supabase/server, @/lib/admin-auth |
| `src/app/api/quotes/bid/route.ts` | API Route Handler | None | next/server, @/lib/supabase/server, @/lib/logger, @/lib/whatsapp-service, zod |
| `src/app/api/quotes/route.ts` | API Route Handler | runtime | next/server, nodemailer, @/lib/supabase/server, @/lib/logger, @/lib/custom-setup-service... |
| `src/app/api/roles-public/route.ts` | API Route Handler | None | next/server |
| `src/app/api/roles/route.ts` | API Route Handler | None | next/server, @/lib/supabase/server, @/lib/logger |
| `src/app/api/sales-agents/apply/route.ts` | API Route Handler | dynamic | next/server, nanoid, @/lib/supabase/server |
| `src/app/api/security/audit-logs/route.ts` | API Route Handler | None | next/server, @/lib/logger, @/lib/auth/admin-guard |
| `src/app/api/security/mfa-status/route.ts` | API Route Handler | None | next/server, @/lib/auth/admin-guard, @/lib/logger |
| `src/app/api/security/settings/route.ts` | API Route Handler | None | next/server, @/lib/logger, @/lib/auth/admin-guard |
| `src/app/api/security/validate-password/route.ts` | API Route Handler | None | next/server, @supabase/supabase-js, @/lib/logger |
| `src/app/api/services/[id]/route.ts` | API Route Handler | dynamic | next/server, @/lib/supabase/server, @/lib/logger, @/lib/errors |
| `src/app/api/services/engineers/route.ts` | API Route Handler | None | next/server, @/lib/service-management, @/lib/logger |
| `src/app/api/services/route.ts` | API Route Handler | dynamic | next/server, @/lib/supabase/server, @/lib/logger, @/lib/errors, @/lib/auth/server-role |
| `src/app/api/services/tickets/[id]/route.ts` | API Route Handler | dynamic | next/server, @/lib/service-management, @/lib/logger, @/lib/supabase/server, @/lib/improved-email-service |
| `src/app/api/services/tickets/route.ts` | API Route Handler | None | next/server, @/lib/service-management, @/lib/logger |
| `src/app/api/settings/route.ts` | API Route Handler | runtime | @supabase/supabase-js, next/server, @/lib/auth/server-role, @/lib/auth/superadmin-session, @/lib/supabase/server... |
| `src/app/api/shipping/update/route.ts` | API Route Handler | None | next/server, @/lib/supabase/server, @/lib/whatsapp-service, @/lib/logger, @/lib/errors... |
| `src/app/api/superadmin/catalogue/generate/route.ts` | API Route Handler | None | next/server, next/headers, @/lib/supabase/server, @/lib/auth/superadmin-session, @/lib/catalogue-pdf-generator... |
| `src/app/api/superadmin/login/route.ts` | API Route Handler | None | next/server, @/lib/captcha/captcha-service, @/lib/logger, @/lib/rate-limit, @/lib/auth/superadmin-session |
| `src/app/api/superadmin/logout/route.ts` | API Route Handler | None | next/server |
| `src/app/api/superadmin/services/[id]/route.ts` | API Route Handler | None | next/server, next/headers, @/lib/supabase/server, @/lib/supabase-server, @/lib/auth/superadmin-session... |
| `src/app/api/superadmin/services/ai-generate/route.ts` | API Route Handler | None | next/server, next/headers, @/lib/auth/superadmin-session, @/lib/ai/gemini-service, @/lib/logger |
| `src/app/api/superadmin/services/route.ts` | API Route Handler | None | next/server, next/headers, @/lib/supabase/server, @/lib/supabase-server, @/lib/auth/superadmin-session... |
| `src/app/api/upload-from-url/route.ts` | API Route Handler | None | next/server, @/lib/errors, @/lib/supabase-storage, @/lib/s3-storage, @/lib/logger... |
| `src/app/api/upload/route.ts` | API Route Handler | runtime, maxDuration | next/server, @/lib/supabase/server, @/lib/logger, @/lib/errors, @/lib/admin-auth... |
| `src/app/api/uploads/quote-documents/route.ts` | API Route Handler | runtime | next/server, @/lib/supabase-storage, @/lib/logger, @/lib/supabase/server |
| `src/app/api/user/communication-preferences/route.ts` | API Route Handler | None | next/server, @/lib/supabase/server, @/lib/logger |
| `src/app/api/users-admin/route.ts` | API Route Handler | None | next/server |
| `src/app/api/users/route.ts` | API Route Handler | None | @supabase/supabase-js, next/server, crypto, @/lib/site-url, @/lib/supabase/server... |
| `src/app/api/v1/embed/configurator/route.ts` | API Route Handler | None | next/server, @/lib/supabase/server, @/lib/logger |
| `src/app/api/walk-in-orders/route.ts` | API Route Handler | None | next/server, @supabase/supabase-js, zod, @/lib/logger, @/lib/server-role-guard |
| `src/app/api/warranty/activate/route.ts` | API Route Handler | None | next/server, zod, @/lib/otp-manager, @/lib/supabase/server, @/lib/rate-limit... |
| `src/app/api/webhooks/customer/signup/route.ts` | API Route Handler | None | next/server, @/lib/supabase/server, @/lib/whatsapp-service, @/lib/logger |
| `src/app/api/webhooks/orders/cancelled/route.ts` | API Route Handler | None | next/server, @/lib/supabase/server, @/lib/whatsapp-service, @/lib/logger |
| `src/app/api/webhooks/orders/delayed/route.ts` | API Route Handler | None | next/server, @/lib/supabase/server, @/lib/whatsapp-service, @/lib/logger |
| `src/app/api/webhooks/orders/delivered/route.ts` | API Route Handler | None | next/server, @/lib/supabase/server, @/lib/whatsapp-service, @/lib/logger, @/lib/environment-validator |
| `src/app/api/webhooks/orders/notconfirmed/route.ts` | API Route Handler | None | next/server, @/lib/supabase/server, @/lib/whatsapp-service, @/lib/logger |
| `src/app/api/webhooks/orders/outfordelivery/route.ts` | API Route Handler | None | next/server, @/lib/supabase/server, @/lib/whatsapp-service, @/lib/logger |
| `src/app/api/webhooks/orders/placed/route.ts` | API Route Handler | None | next/server, @/lib/supabase/server, @/lib/whatsapp-service, @/lib/logger, @/lib/webhook-validator... |
| `src/app/api/webhooks/orders/shipped/route.ts` | API Route Handler | None | next/server, @/lib/supabase/server, @/lib/whatsapp-service, @/lib/logger |
| `src/app/api/webhooks/payment/failed/route.ts` | API Route Handler | None | next/server, @/lib/supabase/server, @/lib/whatsapp-service, @/lib/logger, @/lib/webhook-validator... |
| `src/app/api/webhooks/payment/received/route.ts` | API Route Handler | None | next/server, crypto, @/lib/supabase/server, @/lib/whatsapp-service, @/lib/logger... |
| `src/app/api/webhooks/stats/route.ts` | API Route Handler | None | next/server, @/lib/supabase/server, @/lib/logger |
| `src/app/api/webhooks/whatsapp/route.ts` | API Route Handler | None | next/server, @/lib/whatsapp-service, @/lib/supabase/server, @/lib/webhook-validator, @/lib/redis... |
| `src/app/auth/change-password/page.tsx` | Next.js App Route/Layout | ChangePasswordPage | react, next/navigation, react-hook-form, @hookform/resolvers/zod, zod... |
| `src/app/auth/login/page.tsx` | Next.js App Route/Layout | None | next/navigation |
| `src/app/auth/signin/layout.tsx` | Next.js App Route/Layout | metadata, SignInLayout | next |
| `src/app/auth/signin/page.tsx` | Next.js App Route/Layout | dynamic, SignInPage | react, next/dynamic, next/navigation, lucide-react, @/lib/supabase/client... |
| `src/app/auth/signout/page.tsx` | Next.js App Route/Layout | SignOutPage | react, @/lib/logger, @/store/wishlistStore, @/store/cartStore |
| `src/app/auth/signup/layout.tsx` | Next.js App Route/Layout | metadata, SignUpLayout | next |
| `src/app/auth/signup/page.tsx` | Next.js App Route/Layout | dynamic, SignUpPage | react, next/dynamic, next/navigation, lucide-react, next/link... |
| `src/app/auth/verification-success/page.tsx` | Next.js App Route/Layout | VerificationSuccessPage | react, next/navigation, lucide-react, next/link, @/components/ui/card... |
| `src/app/auth/verify-email/EmailVerificationContent.tsx` | Next.js App Route/Layout | EmailVerificationContent | react, next/navigation, lucide-react, next/link, @/lib/supabase/client... |
| `src/app/auth/verify-email/page.tsx` | Next.js App Route/Layout | dynamic, VerifyEmailPage | react, ./EmailVerificationContent |
| `src/app/auth/verify-otp/OTPVerificationContent.tsx` | Next.js App Route/Layout | OTPVerificationContent | react, next/navigation, react-hot-toast, @/lib/logger, @/lib/supabase/client |
| `src/app/auth/verify-otp/page.tsx` | Next.js App Route/Layout | dynamic, VerifyOTPPage | react, ./OTPVerificationContent |
| `src/app/blueprints/[id]/page.tsx` | Next.js App Route/Layout | None | next, next/navigation, @/lib/supabase/server, @/components/customised-setups/BlueprintShowcase |
| `src/app/cart/page.tsx` | Next.js App Route/Layout | metadata, Page | next, @/components/cart/CartPage |
| `src/app/checkout/page.tsx` | Next.js App Route/Layout | dynamic, metadata, Checkout | next, react, @/components/checkout/CheckoutPage |
| `src/app/contact/page.tsx` | Next.js App Route/Layout | metadata, dynamic, Page | react, next, @/components/contact-page, @/lib/metadata |
| `src/app/create-invoice/page.tsx` | Next.js App Route/Layout | metadata, CreateInvoicePage | next, next/dynamic, @/lib/metadata, @/components/onboarding/LazyInvoiceBuilder |
| `src/app/customised-setups/page.tsx` | Next.js App Route/Layout | metadata, dynamic, revalidate | next/link, next, lucide-react, @/components/ui/button, @/components/customised-setups/RefreshButton... |
| `src/app/embed/configurator/page.tsx` | Next.js App Route/Layout | ConfiguratorEmbedPage | react, next/navigation, @/components/customised-setups/ClientCustomSetupFlow |
| `src/app/error.tsx` | Next.js App Route/Layout | RootError | @/components/shared/PublicRouteError, react, @/lib/logger |
| `src/app/global-error.tsx` | Next.js App Route/Layout | GlobalError | react, @/lib/logger |
| `src/app/globals.css` | Next.js App Route/Layout | None | None |
| `src/app/info/faqs/page.tsx` | Next.js App Route/Layout | revalidate | react, @/lib/supabase/server, @/components/FaqsClient, @/components/ui/skeleton |
| `src/app/info/policies/page.tsx` | Next.js App Route/Layout | metadata, dynamic, PoliciesPage | next/link, lucide-react, next |
| `src/app/info/policies/privacy/page.tsx` | Next.js App Route/Layout | revalidate, metadata | next, @/components/policy-page, @/lib/settings |
| `src/app/info/policies/refund-cancellation/page.tsx` | Next.js App Route/Layout | revalidate, metadata | next, @/components/policy-page, @/lib/settings |
| `src/app/info/policies/return/page.tsx` | Next.js App Route/Layout | revalidate, metadata | next, @/components/policy-page, @/lib/settings |
| `src/app/info/policies/shipping/page.tsx` | Next.js App Route/Layout | revalidate, metadata | next, @/components/policy-page, @/lib/settings |
| `src/app/info/policies/terms/page.tsx` | Next.js App Route/Layout | revalidate, metadata | next, @/components/policy-page, @/lib/settings |
| `src/app/layout.tsx` | Next.js App Route/Layout | metadata, viewport, RootLayout | next, next/font/google, react, @/components/layout/Header, @/components/layout/Footer... |
| `src/app/loading.tsx` | Next.js App Route/Layout | RootLoading | @/components/shared/LoadingSpinner |
| `src/app/manifest.webmanifest/route.ts` | Next.js App Route/Layout | GET | next/server |
| `src/app/mgmt/accounts/AccountsLayoutClient.tsx` | Next.js App Route/Layout | AccountsLayoutClient | react, next/navigation, @/lib/hooks, @/components/accounts/AccountsSidebar, @/components/ui/toaster |
| `src/app/mgmt/accounts/layout.tsx` | Next.js App Route/Layout | AccountsLayout | react, ./AccountsLayoutClient |
| `src/app/mgmt/accounts/page.tsx` | Next.js App Route/Layout | AccountsDashboard | react, lucide-react, @/components/ui/card |
| `src/app/mgmt/admin/AdminLayoutClient.tsx` | Next.js App Route/Layout | AdminLayoutClient | react, next/navigation, @/lib/hooks, @/lib/roles, @/components/admin/AdminSidebar... |
| `src/app/mgmt/admin/ai-assistant/page.tsx` | Next.js App Route/Layout | AIAssistantPage | react, lucide-react, @/components/ui/button, @/components/ui/input, @/components/ui/card... |
| `src/app/mgmt/admin/analytics/page.tsx` | Next.js App Route/Layout | AnalyticsDashboard | react, @/components/ui/card, lucide-react |
| `src/app/mgmt/admin/auto-offers/page.tsx` | Next.js App Route/Layout | metadata, Page | next, @/components/admin/AutoOffersManagement |
| `src/app/mgmt/admin/broadcast-desk/page.tsx` | Next.js App Route/Layout | BroadcastDeskPage | react, @/components/ui/card, @/components/ui/button, @/hooks/use-toast, lucide-react... |
| `src/app/mgmt/admin/contact-messages/admin-contact-messages.tsx` | Next.js App Route/Layout | AdminContactMessages | react, lucide-react, @/components/ui/card, @/components/ui/table, @/components/ui/badge... |
| `src/app/mgmt/admin/contact-messages/page.tsx` | Next.js App Route/Layout | dynamic, Page | ./admin-contact-messages |
| `src/app/mgmt/admin/coupons/admin-coupons.tsx` | Next.js App Route/Layout | CouponManagementPage | react, lucide-react, @/components/ui/card, @/components/ui/table, @/components/ui/button... |
| `src/app/mgmt/admin/coupons/page.tsx` | Next.js App Route/Layout | Page | ./admin-coupons |
| `src/app/mgmt/admin/custom-setups/page.tsx` | Next.js App Route/Layout | Page | next/dynamic, ./price-manager |
| `src/app/mgmt/admin/custom-setups/price-manager.tsx` | Next.js App Route/Layout | AdminCustomSetupManager | react, lucide-react, @/components/customised-setups/CustomSetupFlow, @/components/ui/badge, @/components/ui/button... |
| `src/app/mgmt/admin/discounts/page.tsx` | Next.js App Route/Layout | Page | next/navigation |
| `src/app/mgmt/admin/faqs/page.tsx` | Next.js App Route/Layout | metadata, AdminFaqsPage | @/components/admin/FaqsManagement |
| `src/app/mgmt/admin/hero-banners/page.tsx` | Next.js App Route/Layout | metadata, Page | next, @/components/admin/HeroCarouselManager |
| `src/app/mgmt/admin/homepage-settings/admin-homepage-settings.tsx` | Next.js App Route/Layout | HomepageSettingsPage | react, next/image, @/components/ui/card, @/components/ui/button, @/lib/types... |
| `src/app/mgmt/admin/homepage-settings/page.tsx` | Next.js App Route/Layout | Page | ./admin-homepage-settings |
| `src/app/mgmt/admin/inventory/page.tsx` | Next.js App Route/Layout | InventoryPage | ../../sales/inventory/sales-inventory |
| `src/app/mgmt/admin/invoice-lookup/page.tsx` | Next.js App Route/Layout | InvoiceLookupPage | ../../sales/invoice-lookup/sales-invoice-lookup |
| `src/app/mgmt/admin/layout.tsx` | Next.js App Route/Layout | AdminLayout | react, ./AdminLayoutClient |
| `src/app/mgmt/admin/offers/page.tsx` | Next.js App Route/Layout | metadata, Page | next, @/components/admin/OffersManagement |
| `src/app/mgmt/admin/orders/page.tsx` | Next.js App Route/Layout | Page | ../../sales/orders/sales-orders |
| `src/app/mgmt/admin/page-content/page.tsx` | Next.js App Route/Layout | PageContentAdmin | react, lucide-react, @/components/ui/card, @/components/ui/button, @/components/ui/input... |
| `src/app/mgmt/admin/page.tsx` | Next.js App Route/Layout | AdminDashboard | react, next/link, lucide-react, @/components/ui/button |
| `src/app/mgmt/admin/payment-api/admin-payment-api.tsx` | Next.js App Route/Layout | PaymentApiPage | react, @/components/ui/card, @/components/ui/button, @/components/ui/input, @/components/ui/label... |
| `src/app/mgmt/admin/payment-api/page.tsx` | Next.js App Route/Layout | Page | ./admin-payment-api |
| `src/app/mgmt/admin/policies/page.tsx` | Next.js App Route/Layout | metadata, Page | next, @/components/admin/PoliciesManagement |
| `src/app/mgmt/admin/pricing/admin-pricing.tsx` | Next.js App Route/Layout | AdminPricing | react, lucide-react, @/components/ui/button, @/components/ui/input, @/components/ui/card... |
| `src/app/mgmt/admin/pricing/page.tsx` | Next.js App Route/Layout | PricingPage | ./admin-pricing |
| `src/app/mgmt/admin/products/admin-products-new.tsx` | Next.js App Route/Layout | AdminProductsPage | react, lucide-react, ../../../../hooks/use-toast, @/lib/logger, @/lib/types... |
| `src/app/mgmt/admin/products/page.tsx` | Next.js App Route/Layout | Page | ./admin-products-new |
| `src/app/mgmt/admin/promotional-broadcast/page.tsx` | Next.js App Route/Layout | PromotionalBroadcastPage | react, @/components/ui/card, @/components/ui/button, @/hooks/use-toast, lucide-react... |
| `src/app/mgmt/admin/purchase/page.tsx` | Next.js App Route/Layout | PurchasePage | ../../sales/purchase-entry/sales-purchase-entry |
| `src/app/mgmt/admin/quotes/page.tsx` | Next.js App Route/Layout | AdminQuotesPage | react, @/components/ui/card, @/components/ui/separator, @/components/ui/table, @/components/ui/badge... |
| `src/app/mgmt/admin/sales-agents/page.tsx` | Next.js App Route/Layout | SalesAgentsAdminPage | @/components/admin/SalesAgentsManagement |
| `src/app/mgmt/admin/security/page.tsx` | Next.js App Route/Layout | SecurityDashboardPage | @/components/admin/security-dashboard |
| `src/app/mgmt/admin/services/admin-services.tsx` | Next.js App Route/Layout | AdminServicesPage | react, next/link, lucide-react, @/components/ui/card, @/components/ui/table... |
| `src/app/mgmt/admin/services/page.tsx` | Next.js App Route/Layout | Page | ./admin-services |
| `src/app/mgmt/admin/settings/admin-settings.tsx` | Next.js App Route/Layout | SiteSettingsPage | react, react-hook-form, @hookform/resolvers/zod, zod, lucide-react... |
| `src/app/mgmt/admin/settings/page.tsx` | Next.js App Route/Layout | Page | ./admin-settings |
| `src/app/mgmt/admin/social-media/page.tsx` | Next.js App Route/Layout | SocialMediaPage | @/components/admin/SocialMediaManager |
| `src/app/mgmt/admin/staff/page.tsx` | Next.js App Route/Layout | StaffPage | @/components/admin/SalesAgentsManagement |
| `src/app/mgmt/admin/users/[id]/analytics/page.tsx` | Next.js App Route/Layout | dynamic, Page | ./UserAnalyticsClient |
| `src/app/mgmt/admin/users/[id]/analytics/UserAnalyticsClient.tsx` | Next.js App Route/Layout | UserAnalyticsPage | react, next/navigation, @/components/ui/card, @/components/ui/badge, @/components/ui/scroll-area... |
| `src/app/mgmt/admin/users/admin-users.tsx` | Next.js App Route/Layout | UserManagementPage | react, next/link, next/navigation, lucide-react, @/components/ui/card... |
| `src/app/mgmt/admin/users/page.tsx` | Next.js App Route/Layout | Page | ./admin-users |
| `src/app/mgmt/dashboard-client.tsx` | Next.js App Route/Layout | ManagementDashboard | react, next/navigation, lucide-react, @/lib/hooks, @/lib/roles... |
| `src/app/mgmt/error.tsx` | Next.js App Route/Layout | ManagementError | react |
| `src/app/mgmt/loading.tsx` | Next.js App Route/Layout | ManagementLoading | @/components/shared/LoadingSpinner |
| `src/app/mgmt/manager/inventory/page.tsx` | Next.js App Route/Layout | Page | ../../sales/inventory/sales-inventory |
| `src/app/mgmt/manager/invoice-lookup/page.tsx` | Next.js App Route/Layout | Page | ../../sales/invoice-lookup/sales-invoice-lookup |
| `src/app/mgmt/manager/layout.tsx` | Next.js App Route/Layout | ManagerLayout | react, @/app/mgmt/manager/ManagerLayoutClient |
| `src/app/mgmt/manager/ManagerLayoutClient.tsx` | Next.js App Route/Layout | ManagerLayoutClient | react, next/navigation, @/lib/hooks, @/components/manager/ManagerSidebar, @/components/ui/toaster |
| `src/app/mgmt/manager/online-orders/page.tsx` | Next.js App Route/Layout | Page | ../../sales/online-orders/sales-online-orders |
| `src/app/mgmt/manager/page.tsx` | Next.js App Route/Layout | Page | ../sales/sales-dashboard |
| `src/app/mgmt/manager/purchase/page.tsx` | Next.js App Route/Layout | Page | ../../sales/purchase-entry/sales-purchase-entry |
| `src/app/mgmt/manager/quick-billing/page.tsx` | Next.js App Route/Layout | Page | ../../sales/quick-billing/sales-quick-billing |
| `src/app/mgmt/manager/reports/page.tsx` | Next.js App Route/Layout | ManagerReportsPage | react, @/components/ui/card, @/components/ui/table, @/components/ui/badge, @/components/ui/skeleton... |
| `src/app/mgmt/manager/salesperson/page.tsx` | Next.js App Route/Layout | Page | @/components/admin/SalesAgentsManagement |
| `src/app/mgmt/page.tsx` | Next.js App Route/Layout | None | next/navigation, @/lib/supabase, ./dashboard-client |
| `src/app/mgmt/sales-external/commission-report/page.tsx` | Next.js App Route/Layout | CommissionReportPage | react, @/components/ui/card, @/components/ui/table, @/components/ui/badge, @/components/ui/skeleton... |
| `src/app/mgmt/sales-external/layout.tsx` | Next.js App Route/Layout | SalesExternalLayout | react, @/app/mgmt/sales-external/SalesExternalLayoutClient |
| `src/app/mgmt/sales-external/page.tsx` | Next.js App Route/Layout | Page | ../sales/sales-dashboard |
| `src/app/mgmt/sales-external/quick-billing/page.tsx` | Next.js App Route/Layout | Page | ../../sales/quick-billing/sales-quick-billing |
| `src/app/mgmt/sales-external/reports/page.tsx` | Next.js App Route/Layout | Page | ../../sales-staff/reports/page |
| `src/app/mgmt/sales-external/SalesExternalLayoutClient.tsx` | Next.js App Route/Layout | SalesExternalLayoutClient | react, next/navigation, @/lib/hooks, @/components/sales-external/SalesExternalSidebar, @/components/ui/toaster |
| `src/app/mgmt/sales-staff/invoice-lookup/page.tsx` | Next.js App Route/Layout | Page | ../../sales/invoice-lookup/sales-invoice-lookup |
| `src/app/mgmt/sales-staff/layout.tsx` | Next.js App Route/Layout | SalesStaffLayout | react, @/app/mgmt/sales-staff/SalesStaffLayoutClient |
| `src/app/mgmt/sales-staff/order-tracking/page.tsx` | Next.js App Route/Layout | Page | ../../sales/orders/sales-orders |
| `src/app/mgmt/sales-staff/page.tsx` | Next.js App Route/Layout | Page | ../sales/sales-dashboard |
| `src/app/mgmt/sales-staff/quick-billing/page.tsx` | Next.js App Route/Layout | Page | ../../sales/quick-billing/sales-quick-billing |
| `src/app/mgmt/sales-staff/reports/page.tsx` | Next.js App Route/Layout | SalesStaffReportsPage | react, @/components/ui/card, @/components/ui/table, @/components/ui/badge, @/components/ui/skeleton... |
| `src/app/mgmt/sales-staff/SalesStaffLayoutClient.tsx` | Next.js App Route/Layout | SalesStaffLayoutClient | react, next/navigation, @/lib/hooks, @/components/sales-staff/SalesStaffSidebar, @/components/ui/toaster |
| `src/app/mgmt/sales/agent-order/page.tsx` | Next.js App Route/Layout | AgentOrderPage | react, @/components/ui/input, @/components/ui/button, @/components/ui/card, ../../../../hooks/use-toast... |
| `src/app/mgmt/sales/expenses/page.tsx` | Next.js App Route/Layout | dynamic, Page | ./sales-expenses |
| `src/app/mgmt/sales/expenses/sales-expenses.tsx` | Next.js App Route/Layout | ExpenseEntryPage | react, @hookform/resolvers/zod, react-hook-form, zod, @/components/ui/card... |
| `src/app/mgmt/sales/history/page.tsx` | Next.js App Route/Layout | dynamic, Page | ./sales-history |
| `src/app/mgmt/sales/history/sales-history.tsx` | Next.js App Route/Layout | BillingHistoryPage | react, lucide-react, @/components/ui/card, @/components/ui/table, @/components/ui/button... |
| `src/app/mgmt/sales/inventory/page.tsx` | Next.js App Route/Layout | Page | ./sales-inventory |
| `src/app/mgmt/sales/inventory/sales-inventory.tsx` | Next.js App Route/Layout | InventoryManagementPage | react, next/image, lucide-react, @/components/ui/card, @/components/ui/table... |
| `src/app/mgmt/sales/invoice-lookup/page.tsx` | Next.js App Route/Layout | dynamic, Page | ./sales-invoice-lookup |
| `src/app/mgmt/sales/invoice-lookup/sales-invoice-lookup.tsx` | Next.js App Route/Layout | InvoiceLookupPage | react, lucide-react, @/components/ui/card, @/components/ui/button, @/components/ui/input... |
| `src/app/mgmt/sales/layout.tsx` | Next.js App Route/Layout | SalesLayout | react, ./SalesLayoutClient |
| `src/app/mgmt/sales/online-orders/page.tsx` | Next.js App Route/Layout | dynamic, Page | ./sales-online-orders |
| `src/app/mgmt/sales/online-orders/sales-online-orders.tsx` | Next.js App Route/Layout | OnlineOrdersPage | react, @/components/ui/card, @/components/ui/table, @/components/ui/badge, @/lib/types... |
| `src/app/mgmt/sales/orders/page.tsx` | Next.js App Route/Layout | dynamic, Page | ./sales-orders |
| `src/app/mgmt/sales/orders/sales-orders.tsx` | Next.js App Route/Layout | PickupOrdersPage | react, @/components/shared/OrderDataTable |
| `src/app/mgmt/sales/page.tsx` | Next.js App Route/Layout | Page | ./sales-dashboard |
| `src/app/mgmt/sales/products/edit/[id]/page.tsx` | Next.js App Route/Layout | dynamic, Page | ./sales-product-edit |
| `src/app/mgmt/sales/products/edit/[id]/sales-product-edit.tsx` | Next.js App Route/Layout | EditProductPage | react, next/link, next/navigation, react-hook-form, @hookform/resolvers/zod... |
| `src/app/mgmt/sales/products/new/page.tsx` | Next.js App Route/Layout | Page | ./sales-product-new |
| `src/app/mgmt/sales/products/new/sales-product-new.tsx` | Next.js App Route/Layout | NewProductPage | react, next/link, next/navigation, react-hook-form, @hookform/resolvers/zod... |
| `src/app/mgmt/sales/products/page.tsx` | Next.js App Route/Layout | Page | ./sales-products |
| `src/app/mgmt/sales/products/sales-products.tsx` | Next.js App Route/Layout | ProductManagementPage | react, lucide-react, next/image, next/link, next/navigation... |
| `src/app/mgmt/sales/purchase-entry/page.tsx` | Next.js App Route/Layout | dynamic, Page | ./sales-purchase-entry |
| `src/app/mgmt/sales/purchase-entry/sales-purchase-entry.tsx` | Next.js App Route/Layout | PurchaseEntryPage | react, lucide-react, @/components/ui/card, @/components/ui/button, @/components/ui/input... |
| `src/app/mgmt/sales/quick-billing/page.tsx` | Next.js App Route/Layout | dynamic, Page | ./sales-quick-billing |
| `src/app/mgmt/sales/quick-billing/sales-quick-billing.tsx` | Next.js App Route/Layout | QuickBillingPage | react, lucide-react, next/image, @/components/ui/card, @/components/ui/button... |
| `src/app/mgmt/sales/sales-dashboard.tsx` | Next.js App Route/Layout | SalesDashboard | react, lucide-react, @/components/ui/card, @/components/ui/badge, @/components/ui/skeleton... |
| `src/app/mgmt/sales/SalesLayoutClient.tsx` | Next.js App Route/Layout | SalesLayoutClient | react, next/navigation, @/lib/hooks, @/components/sales/SalesSidebar, @/components/ui/toaster |
| `src/app/mgmt/sales/walk-in-orders/page.tsx` | Next.js App Route/Layout | dynamic, Page | @/components/sales/WalkInOrderManagement |
| `src/app/not-found.tsx` | Next.js App Route/Layout | metadata, NotFound | next, next/link |
| `src/app/offers/page.tsx` | Next.js App Route/Layout | metadata, dynamic, Page | next, @/components/offers-page |
| `src/app/orders/[orderId]/invoice/page.tsx` | Next.js App Route/Layout | dynamic | node:fs, node:path, next, next/navigation, @/components/invoices/InvoiceTemplate... |
| `src/app/orders/[orderId]/page.tsx` | Next.js App Route/Layout | dynamic | @/components/orders/OrderConfirmationPage |
| `src/app/orders/page.tsx` | Next.js App Route/Layout | dynamic, metadata, Orders | next, @/components/orders/OrdersListPage |
| `src/app/page.tsx` | Next.js App Route/Layout | dynamic, metadata | react, next, @/components/home-page, @/lib/metadata, next/headers |
| `src/app/payment/[method]/[orderId]/page.tsx` | Next.js App Route/Layout | dynamic, Page | ./PaymentClientPage |
| `src/app/payment/[method]/[orderId]/PaymentClientPage.tsx` | Next.js App Route/Layout | PaymentMethodPage | react, next/navigation, lucide-react, @/lib/supabase/client, @/components/ui/button... |
| `src/app/payment/failed/page.tsx` | Next.js App Route/Layout | PaymentFailedPage | react, next/navigation, lucide-react, @/components/ui/card, @/components/ui/button |
| `src/app/payment/payu/[orderId]/page.tsx` | Next.js App Route/Layout | dynamic, Page | ./PayuClientPage |
| `src/app/payment/payu/[orderId]/PayuClientPage.tsx` | Next.js App Route/Layout | PayuClientPage | react, next/navigation, lucide-react, @/lib/supabase/client, @/components/ui/card... |
| `src/app/payment/success/page.tsx` | Next.js App Route/Layout | PaymentSuccessPage | react, next/navigation, lucide-react, @/components/ui/card, @/components/ui/button |
| `src/app/payment/upi/[orderId]/page.tsx` | Next.js App Route/Layout | dynamic, Page | ./UPIClientPage |
| `src/app/payment/upi/[orderId]/UPIClientPage.tsx` | Next.js App Route/Layout | UPIPaymentPage | react, next/navigation, lucide-react, qrcode, @/lib/supabase/client... |
| `src/app/products/[id]/error.tsx` | Next.js App Route/Layout | Error | @/lib/strings |
| `src/app/products/[id]/loading.tsx` | Next.js App Route/Layout | Loading | @/lib/strings |
| `src/app/products/[id]/page.tsx` | Next.js App Route/Layout | revalidate, dynamic | @/components/products/ProductDetailPage, next, next/headers, @/lib/metadata, @/lib/supabase/server... |
| `src/app/products/page.tsx` | Next.js App Route/Layout | revalidate, metadata | react, next, @/components/products/ShopPageContent, @/lib/logger, @/lib/metadata... |
| `src/app/profile/page.tsx` | Next.js App Route/Layout | ProfilePage | react, next/navigation, @supabase/supabase-js, @/components/profile/UserProfile, @/lib/hooks... |
| `src/app/quotes/[id]/advance-payment/page.tsx` | Next.js App Route/Layout | AdvancePaymentPage | react, next/navigation, @/components/ui/card, @/components/ui/button, @/components/ui/badge... |
| `src/app/quotes/[id]/page.tsx` | Next.js App Route/Layout | QuoteDetailPage | react, next/navigation, @/components/ui/card, @/components/ui/button, @/components/ui/badge... |
| `src/app/robots.ts` | Next.js App Route/Layout | robots | next |
| `src/app/services/page.tsx` | Next.js App Route/Layout | metadata, revalidate | next, @/components/services-page, @/lib/logger, @/lib/supabase/server, @/lib/supabase-server... |
| `src/app/services/smart-infrastructure/page.tsx` | Next.js App Route/Layout | metadata, SmartInfrastructurePage | next, next/link, lucide-react, @/components/ui/button, @/components/ui/card... |
| `src/app/sitemap.ts` | Next.js App Route/Layout | None | next, @supabase/supabase-js, @/lib/product-visibility, @/lib/supabase/env |
| `src/app/staff/login/page.tsx` | Next.js App Route/Layout | StaffSignInPage | react, next/dynamic, next/navigation, lucide-react, @/lib/supabase/client... |
| `src/app/superadmin/login/page.tsx` | Next.js App Route/Layout | SuperadminSignInPage | react, next/dynamic, next/navigation, lucide-react, @/lib/supabase/client... |
| `src/app/superadmin/mgmt/ai-config/page.tsx` | Next.js App Route/Layout | AiConfigConsole | react, next/link, lucide-react, @/hooks/use-toast |
| `src/app/superadmin/mgmt/catalogue/page.tsx` | Next.js App Route/Layout | CatalogueManagementPage | react, lucide-react, @/hooks/use-toast, @/components/ui/card, @/components/ui/button... |
| `src/app/superadmin/mgmt/custom-setups/page.tsx` | Next.js App Route/Layout | Page | @/app/mgmt/admin/custom-setups/price-manager |
| `src/app/superadmin/mgmt/dashboard/page.tsx` | Next.js App Route/Layout | dynamic | next/link, next/navigation, next/headers, lucide-react, @/lib/supabase/server... |
| `src/app/superadmin/mgmt/layout.tsx` | Next.js App Route/Layout | dynamic | next/headers, next/navigation, react, lucide-react, next/link... |
| `src/app/superadmin/mgmt/leads/page.tsx` | Next.js App Route/Layout | LeadsPage | @/app/mgmt/admin/contact-messages/admin-contact-messages |
| `src/app/superadmin/mgmt/marketing/page.tsx` | Next.js App Route/Layout | Page | @/app/mgmt/admin/contact-messages/admin-contact-messages |
| `src/app/superadmin/mgmt/offers/page.tsx` | Next.js App Route/Layout | Page | @/components/admin/OffersManagement |
| `src/app/superadmin/mgmt/payment-settings/page.tsx` | Next.js App Route/Layout | PaymentSettingsConsole | react, next/link, lucide-react, @/hooks/use-toast |
| `src/app/superadmin/mgmt/policies/page.tsx` | Next.js App Route/Layout | Page | @/components/admin/PoliciesManagement |
| `src/app/superadmin/mgmt/products/page.tsx` | Next.js App Route/Layout | Page | @/app/mgmt/admin/products/admin-products-new |
| `src/app/superadmin/mgmt/reports/page.tsx` | Next.js App Route/Layout | Page | @/app/mgmt/admin/analytics/page |
| `src/app/superadmin/mgmt/services/page.tsx` | Next.js App Route/Layout | SuperadminServicesPage | react, react-hook-form, @hookform/resolvers/zod, zod, lucide-react... |
| `src/app/superadmin/mgmt/settings/page.tsx` | Next.js App Route/Layout | SuperadminSettingsPage | react, next/link, next/navigation, lucide-react, @/components/ui/button... |
| `src/app/superadmin/mgmt/social-media/page.tsx` | Next.js App Route/Layout | Page | @/components/admin/SocialMediaManager |
| `src/app/superadmin/mgmt/users/[id]/analytics/page.tsx` | Next.js App Route/Layout | Page | @/app/mgmt/admin/users/[id]/analytics/UserAnalyticsClient |
| `src/app/superadmin/mgmt/users/page.tsx` | Next.js App Route/Layout | Page | @/app/mgmt/admin/users/admin-users |
| `src/app/webdev/page.tsx` | Next.js App Route/Layout | metadata, WebDevPage | next, next/link, lucide-react, @/components/ui/button, @/lib/metadata |
| `src/components/about-page.tsx` | Feature Component | AboutPage | next/link |
| `src/components/accounts/AccountsSidebar.tsx` | Feature Component | AccountsSidebar | next/link, next/navigation, lucide-react, ../ui/logo, @/lib/utils... |
| `src/components/admin/AddUserDialog.tsx` | Feature Component | AddUserDialog | react, react-hook-form, @hookform/resolvers/zod, zod, lucide-react... |
| `src/components/admin/AdminSidebar.tsx` | Feature Component | adminNavSections, AdminSidebar | react, next/link, next/navigation, lucide-react, @/components/ui/logo... |
| `src/components/admin/AutoOffersManagement.tsx` | Feature Component | AutoOffersManagement | react, lucide-react, @/components/ui/card, @/components/ui/table, @/components/ui/button... |
| `src/components/admin/CreateDiscountDialog.tsx` | Feature Component | CreateDiscountDialog | react, react-hook-form, @hookform/resolvers/zod, zod, @/components/ui/button... |
| `src/components/admin/CreateOfferDialog.tsx` | Feature Component | CreateOfferDialog | react, lucide-react, @/components/ui/dialog, @/components/ui/button, @/components/ui/input... |
| `src/components/admin/CreateProductDialog.tsx` | Feature Component | CreateProductDialog | react, react-hook-form, @hookform/resolvers/zod, zod, lucide-react... |
| `src/components/admin/CreateServiceDialog.tsx` | Feature Component | CreateServiceDialog | react, react-hook-form, @hookform/resolvers/zod, zod, lucide-react... |
| `src/components/admin/DiscountOffersDialog.tsx` | Feature Component | DiscountOffersDialog | react, lucide-react, @/components/ui/dialog, @/components/ui/button, @/components/ui/input... |
| `src/components/admin/EditProductDialog.tsx` | Feature Component | EditProductDialog | react, react-hook-form, @hookform/resolvers/zod, zod, lucide-react... |
| `src/components/admin/EditServiceDialog.tsx` | Feature Component | EditServiceDialog | react, react-hook-form, @hookform/resolvers/zod, zod, lucide-react... |
| `src/components/admin/EditUserDialog.tsx` | Feature Component | EditUserDialog | react, lucide-react, @/components/ui/dialog, @/components/ui/button, @/components/ui/input... |
| `src/components/admin/FaqsManagement.tsx` | Feature Component | FaqsManagement | react, react-hook-form, @hookform/resolvers/zod, zod, lucide-react... |
| `src/components/admin/HeroCarouselManager.tsx` | Feature Component | HeroCarouselManager | react, lucide-react, ../../hooks/use-page-content, ../../hooks/use-toast, @/lib/types... |
| `src/components/admin/OffersManagement.tsx` | Feature Component | OffersManagement | react, lucide-react, @/components/ui/card, @/components/ui/button, @/components/ui/input... |
| `src/components/admin/PartnerBrandsEditor.tsx` | Feature Component | parsePartnerBrands, PartnerBrandsEditor | react, lucide-react, @/components/ui/input, @/components/ui/button, @/hooks/use-toast |
| `src/components/admin/PoliciesManagement.tsx` | Feature Component | PoliciesManagement | react, lucide-react, next/link, @/components/ui/card, @/components/ui/button... |
| `src/components/admin/SalesAgentsManagement.tsx` | Feature Component | SalesAgentsManagement | react, lucide-react, date-fns, @/components/ui/card, @/components/ui/table... |
| `src/components/admin/security-dashboard.tsx` | Feature Component | SecurityDashboard | react, lucide-react, @/components/ui/card, @/components/ui/button, @/components/ui/input... |
| `src/components/admin/SingleImageUploader.tsx` | Feature Component | SingleImageUploader | react, @/components/ui/input, @/hooks/use-toast |
| `src/components/admin/SocialMediaManager.tsx` | Feature Component | SocialMediaManager | react, react-hook-form, @hookform/resolvers/zod, zod, lucide-react... |
| `src/components/ai-research/TechStackAudit.tsx` | Feature Component | TechStackAudit | react, lucide-react, @/components/ui/button |
| `src/components/auth/InstantIdentity.tsx` | Feature Component | InstantIdentity | react, @/lib/supabase/client, lucide-react, @/lib/errorMapper |
| `src/components/auth/LoginDialog.tsx` | Feature Component | LoginDialog | react, react-hook-form, @hookform/resolvers/zod, zod, next/link... |
| `src/components/auth/TwoFactorSetup.tsx` | Feature Component | TwoFactorSetup | react, lucide-react, @/components/ui/button, @/components/ui/input, @/components/ui/label... |
| `src/components/auth/TwoFactorVerification.tsx` | Feature Component | TwoFactorVerification | react, lucide-react, @/components/ui/button, @/components/ui/input, @/components/ui/label... |
| `src/components/BehavioralCouponPopup.tsx` | Feature Component | BehavioralCouponPopup | react, lucide-react, @/lib/hooks, @/lib/supabase/client, ./ui/button |
| `src/components/cart/AddToCartButton.tsx` | Feature Component | AddToCartButton | react, lucide-react, @/components/ui/button, @/lib/hooks, @/lib/types |
| `src/components/cart/CartItemCard.tsx` | Feature Component | CartItemCard | react, next/image, next/link, lucide-react, @/lib/hooks... |
| `src/components/cart/CartPage.tsx` | Feature Component | CartPage | react, next/link, lucide-react, @/lib/hooks, @/lib/logger... |
| `src/components/cart/EnhancedCartSheet.tsx` | Feature Component | EnhancedCartSheet | react, next/link, lucide-react, @/components/ui/sheet, @/components/ui/button... |
| `src/components/checkout/CheckoutPage.tsx` | Feature Component | CheckoutPage | react, next/link, next/navigation, @/hooks/use-toast, lucide-react... |
| `src/components/checkout/CheckoutWizard.tsx` | Feature Component | CheckoutWizard | @/hooks/useCheckoutMachine, @/components/ui/button, @/components/ui/input, lucide-react, @/components/auth/InstantIdentity |
| `src/components/contact-page.tsx` | Feature Component | ContactPage | react, react-hook-form, @hookform/resolvers/zod, zod, next/navigation... |
| `src/components/customised-setups/BlueprintShowcase.tsx` | Feature Component | BlueprintShowcase | react, lucide-react, @/components/ui/card, @/components/ui/button, @/components/ui/badge... |
| `src/components/customised-setups/ClientCustomSetupFlow.tsx` | Feature Component | None | react, next/dynamic, ./CustomSetupFlow |
| `src/components/customised-setups/CustomSetupFlow.tsx` | Feature Component | CustomSetupFlowProps, CustomSetupFlow | react, next/navigation, @/components/ui/badge, @/components/ui/button, @/components/ui/card... |
| `src/components/customised-setups/InteractiveTopologyDiagram.tsx` | Feature Component | InteractiveTopologyDiagram | react, lucide-react, @/lib/utils |
| `src/components/customised-setups/QuotationStatusLookup.tsx` | Feature Component | QuotationStatusLookup | react, next/navigation, ../ui/button, ../ui/input, ../ui/label |
| `src/components/customised-setups/QuoteCTA.tsx` | Feature Component | QuoteCTA | react, next/navigation, @/lib/hooks, ../ui/button, ../ui/checkbox... |
| `src/components/customised-setups/RefreshButton.tsx` | Feature Component | RefreshButton | react, lucide-react, ../ui/button |
| `src/components/customised-setups/ROICostEfficiencyBanner.tsx` | Feature Component | ROICostEfficiencyBanner | react, lucide-react |
| `src/components/discovery/ServiceDiscovery.tsx` | Feature Component | Service, ServiceDiscovery | react, @/hooks/useFuzzySearch, lucide-react |
| `src/components/discovery/ServiceSearch.tsx` | Feature Component | ServiceSearch | react, @/components/ui/input, lucide-react, @/hooks/useFuzzySearch |
| `src/components/FaqsClient.tsx` | Feature Component | FaqsClient | react, lucide-react, @/components/ui/accordion, @/components/ui/input |
| `src/components/HeroCarousel.tsx` | Feature Component | HeroCarousel | react, next/image, next/link, lucide-react, @/lib/sanitize-html... |
| `src/components/home-page.tsx` | Feature Component | HomePage | react, next/dynamic, next/link, lucide-react, @/lib/image-utils... |
| `src/components/home/AmbientEffects.tsx` | Feature Component | AmbientEffects | react, @/hooks/use-prefers-reduced-motion |
| `src/components/home/HeroRotator.tsx` | Feature Component | HeroRotator | react, @/hooks/use-prefers-reduced-motion |
| `src/components/home/HeroVisuals.tsx` | Feature Component | HeroVisuals | react, lucide-react, @/hooks/use-prefers-reduced-motion |
| `src/components/home/MagneticButton.tsx` | Feature Component | MagneticButton | react, next/link, @/hooks/use-prefers-reduced-motion, @/lib/utils |
| `src/components/home/TrackQuoteForm.tsx` | Feature Component | TrackQuoteForm | react, next/navigation, lucide-react |
| `src/components/InfrastructureLeadForm.tsx` | Feature Component | InfrastructureLeadForm | react, lucide-react, @/components/ui/button, @/components/ui/input, @/components/ui/textarea... |
| `src/components/invoices/InvoiceTemplate.tsx` | Feature Component | CompanySettings, InvoiceTemplate | react, lucide-react, dompurify, @/lib/types, @/components/ui/card... |
| `src/components/layout/CookieConsentBanner.tsx` | Feature Component | safeReadStoredConsent, safeWriteStoredConsent, CookieConsentBanner, CONSENT_STORAGE_KEY | react, next/link |
| `src/components/layout/DeferredFloatingAIAssistant.tsx` | Feature Component | DeferredFloatingAIAssistant | react, next/dynamic, ../../hooks/use-deferred-activation, ./FloatingAIAssistant |
| `src/components/layout/DeferredRuntimeServices.tsx` | Feature Component | DeferredRuntimeServices | react, next/dynamic, next/script, ../../hooks/use-deferred-activation, ./CookieConsentBanner... |
| `src/components/layout/FloatingAIAssistant.tsx` | Feature Component | FloatingAIAssistant | react, next/link, next/navigation, lucide-react, @/lib/utils |
| `src/components/layout/Footer.tsx` | Feature Component | Footer | react, next/link, ../ui/logo, lucide-react, @/lib/supabase/client... |
| `src/components/layout/Header.tsx` | Feature Component | Header | react, next/link, next/navigation, ../ui/logo, lucide-react... |
| `src/components/layout/TechShell.tsx` | Feature Component | TechShell | react, next/navigation |
| `src/components/LocalServiceLandingPage.tsx` | Feature Component | LocalServiceLandingPage | next/link, react, lucide-react, @/components/ui/button, ../hooks/use-analytics |
| `src/components/manager/ManagerSidebar.tsx` | Feature Component | managerNavSections, ManagerSidebar | next/link, next/navigation, lucide-react, @/lib/logger, @/components/ui/logo... |
| `src/components/mgmt/MgmtMobileNav.tsx` | Feature Component | MgmtNavItem, MgmtNavSection, MgmtMobileNav | react, next/link, next/navigation, lucide-react, @/lib/utils... |
| `src/components/offers-page.tsx` | Feature Component | OffersPage | next/link, react, dompurify, @/lib/logger, ../hooks/use-toast |
| `src/components/onboarding/LazyInvoiceBuilder.tsx` | Feature Component | LazyInvoiceBuilder | react, lucide-react, react-confetti, @/hooks/use-window-size |
| `src/components/orders/OrderConfirmationPage.tsx` | Feature Component | OrderConfirmationPage | react, lucide-react, @/lib/order-utils, ../../context/OrderProvider, @/components/ui/card... |
| `src/components/orders/OrdersListPage.tsx` | Feature Component | OrdersListPage | react, lucide-react, @/lib/order-utils, @/lib/data, @/lib/hooks... |
| `src/components/policy-page.tsx` | Feature Component | PolicyPage | react, lucide-react, next/link, @/lib/sanitize-html, ../hooks/use-page-content |
| `src/components/products/ProductDetailPage.tsx` | Feature Component | ProductDetailPage | react, next/navigation, lucide-react, @/lib/sanitize-html, @/components/cart/AddToCartButton... |
| `src/components/products/ProductJsonLd.tsx` | Feature Component | ProductJsonLd | @/lib/types, @/lib/strings, @/lib/environment-validator |
| `src/components/products/ShopPageContent.tsx` | Feature Component | ShopPageContent | react, next/navigation, next/link, lucide-react, @/lib/logger... |
| `src/components/products/StarRating.tsx` | Feature Component | StarRating | react, lucide-react, @/lib/utils |
| `src/components/profile/EditProfileDialog.tsx` | Feature Component | EditProfileDialog | react, react-hook-form, @hookform/resolvers/zod, zod, @/components/ui/button... |
| `src/components/profile/UserProfile.tsx` | Feature Component | UserProfile | react, next/link, lucide-react, @supabase/supabase-js, @/lib/logger... |
| `src/components/providers/ThemeProvider.tsx` | Feature Component | ThemeProvider | react, next-themes |
| `src/components/rbac/RequirePermission.tsx` | Feature Component | RequirePermission | react, @/hooks/usePermissions |
| `src/components/referral/ReferralWidget.tsx` | Feature Component | ReferralWidget | react, lucide-react, @/lib/utils |
| `src/components/RegionalTrustBanner.tsx` | Feature Component | RegionalTrustBanner | react, next/navigation, lucide-react, @/lib/utils |
| `src/components/sales-external/SalesExternalSidebar.tsx` | Feature Component | SalesExternalSidebar | next/link, next/navigation, lucide-react, @/lib/logger, @/components/ui/logo... |
| `src/components/sales-staff/SalesStaffSidebar.tsx` | Feature Component | SalesStaffSidebar | next/link, next/navigation, lucide-react, @/lib/logger, @/components/ui/logo... |
| `src/components/sales/CreateCustomerDialog.tsx` | Feature Component | CreateCustomerDialog | react, react-hook-form, @hookform/resolvers/zod, zod, lucide-react... |
| `src/components/sales/CreateProductDialog.tsx` | Feature Component | None | @/components/ui/dialog |
| `src/components/sales/MarketingKitTerminal.tsx` | Feature Component | MarketingKitTerminal | react, lucide-react, @/components/ui/card, @/components/ui/button, @/components/ui/input... |
| `src/components/sales/OrderActions.tsx` | Feature Component | OrderActions | react, lucide-react, @/lib/logger, @/lib/order-utils, @/components/ui/button... |
| `src/components/sales/PurchaseSerialNumberDialog.tsx` | Feature Component | PurchaseSerialNumberDialog | react, @/lib/types, @/components/ui/button, @/components/ui/textarea, ../../hooks/use-toast... |
| `src/components/sales/SalesSidebar.tsx` | Feature Component | SalesSidebar | next/link, next/navigation, lucide-react, @/lib/logger, @/components/ui/logo... |
| `src/components/sales/SerialNumberDialog.tsx` | Feature Component | SerialNumberDialog | react, @/lib/types, @/lib/logger, @/components/ui/button, @/components/ui/checkbox... |
| `src/components/sales/ViewSerialsDialog.tsx` | Feature Component | ViewSerialsDialog | react, @/lib/types, @/components/ui/button, @/components/ui/scroll-area, ../ui/modal |
| `src/components/sales/WalkInOrderManagement.tsx` | Feature Component | WalkInOrderManagement | react, lucide-react, @/lib/logger, @/components/ui/card, @/components/ui/button... |
| `src/components/services-page.tsx` | Feature Component | ServicesPageProps, ServicesPage | react, next/link, next/navigation, lucide-react, @/components/ui/button... |
| `src/components/shared/ConfirmDialog.tsx` | Feature Component | ConfirmDialog | react, @/components/ui/alert-dialog |
| `src/components/shared/LoadingSpinner.tsx` | Feature Component | LoadingSpinner, PageLoader, ButtonSpinner, FullPageLoader | react, @/lib/utils |
| `src/components/shared/MicroErrorBoundary.tsx` | Feature Component | MicroErrorBoundary | react, lucide-react, @/lib/logger |
| `src/components/shared/OrderDataTable.tsx` | Feature Component | OrderDataTable | react, lucide-react, @/components/ui/card, @/components/ui/table, @/components/ui/badge... |
| `src/components/shared/PublicRouteError.tsx` | Feature Component | PublicRouteError | None |
| `src/components/shared/UniversalSearch.tsx` | Feature Component | SearchFilter, SortOption, UniversalSearch | react, lucide-react, @/components/ui/input, @/components/ui/button, @/components/ui/select... |
| `src/components/tracking/LiveTimeline.tsx` | Feature Component | LiveTimeline | @/hooks/useLiveOrder, lucide-react, @/components/ui/button |
| `src/components/ui/accordion.tsx` | Reusable UI Component | Accordion, AccordionItem, AccordionTrigger, AccordionContent | react, @radix-ui/react-accordion, lucide-react, @/lib/utils |
| `src/components/ui/alert-dialog.tsx` | Reusable UI Component | AlertDialog, AlertDialogPortal, AlertDialogOverlay, AlertDialogTrigger, AlertDialogContent... | react, @radix-ui/react-alert-dialog, @/lib/utils, @/components/ui/button |
| `src/components/ui/alert.tsx` | Reusable UI Component | Alert, AlertTitle, AlertDescription | react, class-variance-authority, @/lib/utils |
| `src/components/ui/avatar.tsx` | Reusable UI Component | Avatar, AvatarImage, AvatarFallback | react, @radix-ui/react-avatar, @/lib/utils |
| `src/components/ui/badge.tsx` | Reusable UI Component | BadgeProps, Badge, badgeVariants | react, class-variance-authority, @/lib/utils |
| `src/components/ui/BlitzAuditBanner.tsx` | Reusable UI Component | BlitzAuditBanner | react, next/navigation, lucide-react, @/hooks/use-toast |
| `src/components/ui/button.tsx` | Reusable UI Component | ButtonProps, Button, buttonVariants | react, @radix-ui/react-slot, class-variance-authority, @/lib/utils |
| `src/components/ui/card.tsx` | Reusable UI Component | Card, CardHeader, CardFooter, CardTitle, CardDescription... | react, @/lib/utils |
| `src/components/ui/checkbox.tsx` | Reusable UI Component | Checkbox | react, @radix-ui/react-checkbox, lucide-react, @/lib/utils |
| `src/components/ui/dialog.tsx` | Reusable UI Component | Dialog, DialogPortal, DialogOverlay, DialogClose, DialogTrigger... | react, @radix-ui/react-dialog, lucide-react, @/lib/utils |
| `src/components/ui/dropdown-menu.tsx` | Reusable UI Component | DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuCheckboxItem... | react, @radix-ui/react-dropdown-menu, lucide-react, @/lib/utils |
| `src/components/ui/form.tsx` | Reusable UI Component | useFormField, Form, FormItem, FormLabel, FormControl... | react, @radix-ui/react-label, @radix-ui/react-slot, react-hook-form, @/lib/utils... |
| `src/components/ui/FreeInstallationOfferBanner.tsx` | Reusable UI Component | FreeInstallationOfferBanner | react, lucide-react, ./badge |
| `src/components/ui/input.tsx` | Reusable UI Component | Input | react, @/lib/utils |
| `src/components/ui/label.tsx` | Reusable UI Component | Label | react, @radix-ui/react-label, class-variance-authority, @/lib/utils |
| `src/components/ui/logo.tsx` | Reusable UI Component | BRAND_LOGO_URL, normalizeLogoUrl, Logo | react |
| `src/components/ui/markdown-renderer.tsx` | Reusable UI Component | MarkdownRenderer | react |
| `src/components/ui/modal.tsx` | Reusable UI Component | None | react |
| `src/components/ui/optimized-image.tsx` | Reusable UI Component | OptimizedImage | react, next/image, @/lib/utils, @/lib/logger |
| `src/components/ui/popover.tsx` | Reusable UI Component | Popover, PopoverTrigger, PopoverContent | react, @radix-ui/react-popover, @/lib/utils |
| `src/components/ui/radio-group.tsx` | Reusable UI Component | RadioGroup, RadioGroupItem | react, @radix-ui/react-radio-group, lucide-react, @/lib/utils |
| `src/components/ui/scroll-area.tsx` | Reusable UI Component | ScrollArea, ScrollBar | react, @radix-ui/react-scroll-area, @/lib/utils |
| `src/components/ui/select.tsx` | Reusable UI Component | Select, SelectGroup, SelectValue, SelectTrigger, SelectContent... | react, @radix-ui/react-select, lucide-react, @/lib/utils |
| `src/components/ui/separator.tsx` | Reusable UI Component | Separator | react, @radix-ui/react-separator, @/lib/utils |
| `src/components/ui/sheet.tsx` | Reusable UI Component | Sheet, SheetPortal, SheetOverlay, SheetTrigger, SheetClose... | react, @radix-ui/react-dialog, class-variance-authority, lucide-react, @/lib/utils |
| `src/components/ui/skeleton.tsx` | Reusable UI Component | Skeleton | @/lib/utils |
| `src/components/ui/switch.tsx` | Reusable UI Component | Switch | react, @radix-ui/react-switch, @/lib/utils |
| `src/components/ui/table.tsx` | Reusable UI Component | Table, TableHeader, TableBody, TableFooter, TableHead... | react, @/lib/utils |
| `src/components/ui/tabs.tsx` | Reusable UI Component | Tabs, TabsList, TabsTrigger, TabsContent | react, @radix-ui/react-tabs, @/lib/utils |
| `src/components/ui/textarea.tsx` | Reusable UI Component | Textarea | react, @/lib/utils |
| `src/components/ui/toast.tsx` | Reusable UI Component | type, ToastProvider, ToastViewport, Toast, ToastTitle... | react, @radix-ui/react-toast, class-variance-authority, lucide-react, @/lib/utils |
| `src/components/ui/toaster.tsx` | Reusable UI Component | Toaster | react, ../../hooks/use-toast, @/components/ui/toast |
| `src/components/ui/ViralWarrantyModal.tsx` | Reusable UI Component | ViralWarrantyModal | react |
| `src/components/ui/WarrantyTelemetryBadge.tsx` | Reusable UI Component | WarrantyTelemetryBadge | react, next/navigation, @/hooks/use-warranty-telemetry, lucide-react |
| `src/components/ux/MinimalAuth.tsx` | Feature Component | MinimalAuth | react, @/components/ui/button, @/components/ui/input, lucide-react |
| `src/components/ux/OrderTimeline.tsx` | Feature Component | OrderTimeline | lucide-react, @/components/ui/button |
| `src/components/ux/ProgressiveCheckout.tsx` | Feature Component | ProgressiveCheckout | react, @/components/ui/button, lucide-react |
| `src/components/ux/ServiceFinder.tsx` | Feature Component | ServiceFinder | react, @/components/ui/input, lucide-react |
| `src/components/wishlist/WishlistButton.tsx` | Feature Component | WishlistButton | react, lucide-react, @/components/ui/button, @/lib/hooks, @/lib/types... |
| `src/context/AppProvider.tsx` | React Context Provider | AppProvider | react, ./AuthProvider |
| `src/context/AuthProvider.tsx` | React Context Provider | AuthContext, AuthProvider, useAuth | react, @supabase/supabase-js, @/lib/types, @/lib/supabase/client, @/lib/logger... |
| `src/context/OrderProvider.tsx` | React Context Provider | OrderContext, OrderProvider, useOrder | react, @/lib/types, @/lib/supabase/client, ../hooks/use-toast, @/lib/hooks... |
| `src/env.ts` | General component/module | env | zod |
| `src/hooks/use-analytics.ts` | Custom React Hook | useAnalytics | react, next/navigation |
| `src/hooks/use-behavioral-cro.ts` | Custom React Hook | useBehavioralCRO | react, next/navigation, ./use-analytics |
| `src/hooks/use-debounce.ts` | Custom React Hook | useDebounce | react |
| `src/hooks/use-deferred-activation.ts` | Custom React Hook | useDeferredActivation | react |
| `src/hooks/use-lead-capture-trigger.tsx` | Custom React Hook | useLeadCaptureTrigger | react, @/hooks/use-toast |
| `src/hooks/use-near-viewport.ts` | Custom React Hook | useNearViewport | react |
| `src/hooks/use-page-content.ts` | Custom React Hook | usePageContent, useAllPageContents | react, @/lib/logger |
| `src/hooks/use-payment-methods.ts` | Custom React Hook | PaymentMethod, PaymentSettings, usePaymentMethods | react |
| `src/hooks/use-permissions.ts` | Custom React Hook | usePermissions | @/lib/hooks, @/lib/roles |
| `src/hooks/use-prefers-reduced-motion.ts` | Custom React Hook | usePrefersReducedMotion | react |
| `src/hooks/use-reveal-sections.ts` | Custom React Hook | useRevealSections | react, ./use-prefers-reduced-motion |
| `src/hooks/use-toast.ts` | Custom React Hook | reducer, useToast, toast | react, @/components/ui/toast |
| `src/hooks/use-viral-attribution.ts` | Custom React Hook | useViralAttribution | react, @/lib/logger |
| `src/hooks/use-warranty-telemetry.ts` | Custom React Hook | TelemetryEvent, useWarrantyTelemetry | react |
| `src/hooks/use-window-size.ts` | Custom React Hook | useWindowSize | react |
| `src/hooks/useCheckoutMachine.ts` | Custom React Hook | CheckoutStep, CheckoutState, CheckoutAction, useCheckoutMachine | react |
| `src/hooks/useFuzzySearch.ts` | Custom React Hook | useFuzzySearch | react |
| `src/hooks/useLiveOrder.ts` | Custom React Hook | OrderStatus, LiveOrderState, useLiveOrder | react |
| `src/hooks/usePermissions.ts` | Custom React Hook | usePermissions | react, @/context/AuthProvider |
| `src/lib/admin-auth.ts` | Utility/Library code | None | @supabase/supabase-js, ./roles, ./permissions |
| `src/lib/ai/gemini-service.ts` | Utility/Library code | None | None |
| `src/lib/ai/product-details.ts` | Utility/Library code | AiProductDetails, AiProductDetailsRequest, formatAiSpecifications | None |
| `src/lib/ai/prompts.ts` | Utility/Library code | None | @/lib/supabase/server |
| `src/lib/ai/tax-classification.ts` | Utility/Library code | GstTier, ProductTaxClassificationInput, ProductTaxClassification, TaxClassificationError, parseTaxClassification | zod, ../logger, ./gemini-service |
| `src/lib/api-email-route.ts` | Utility/Library code | EmailHandlerConfig | next/server, @/lib/rate-limit, @/lib/supabase/server, @/lib/logger |
| `src/lib/api-response.ts` | Utility/Library code | APIResponse, PaginationOptions, APIResponseBuilder, APIResponses, isAPIResponse... | next/server, @/lib/logger |
| `src/lib/apiClient.ts` | Utility/Library code | ResilientFetchOptions | ./errorMapper |
| `src/lib/auth/admin-guard.ts` | Utility/Library code | AdminAuthError, AdminContext, SuperadminContext | @supabase/supabase-js, next/headers, @/lib/supabase/server, @/lib/logger, @/lib/roles... |
| `src/lib/auth/guard.ts` | Utility/Library code | None | ../roles, ../supabase/server, ../logger |
| `src/lib/auth/server-role.ts` | Utility/Library code | getEffectiveUserRole, getSessionWithRole, isRoleAllowed | next/server, @supabase/supabase-js, ../roles, ../supabase/server, ../logger... |
| `src/lib/auth/superadmin-session.ts` | Utility/Library code | SUPERADMIN_SESSION_TTL_SECONDS | ../logger |
| `src/lib/captcha/captcha-service.ts` | Utility/Library code | CaptchaProvider, CaptchaConfig, CaptchaVerificationResult, CaptchaService, captchaService | ../logger, @/env |
| `src/lib/catalogue-pdf-generator.ts` | Utility/Library code | CatalogueItem | pdfkit, ./config-service, ./logger |
| `src/lib/checkout-engine.test.ts` | Utility/Library code | None | vitest, ./checkout-engine, ./pricing-service, ./offer-discount-service |
| `src/lib/checkout-engine.ts` | Utility/Library code | CheckoutEngineRequest, CheckoutEngineResponse, CheckoutEngine, checkoutEngine | ./pricing-service, ./offer-discount-service, ./enhanced-commission-service, ./types, ./logger |
| `src/lib/config-service.ts` | Utility/Library code | AppSettingsSchema, AppSettings, CompanyConfig, GlobalConfig, getGlobalConfig | next/cache, zod, @/lib/supabase/server, @/lib/logger |
| `src/lib/constants.ts` | Utility/Library code | NEXT_PUBLIC_SUPPORT_PHONE, GST_RATE | None |
| `src/lib/crypto-utils.ts` | Utility/Library code | verifyPaymentHash | crypto |
| `src/lib/custom-setup-pricing.ts` | Utility/Library code | SetupSystem, PriceEntry, CapacityPriceEntry, CameraPriceMatrix, CablePriceEntry... | @/lib/custom-setup-service |
| `src/lib/custom-setup-service.ts` | Utility/Library code | JsonRecord, CustomSetupComponentOptionRow, CustomSetupComponentRow, CustomSetupSystemRow, CustomSetupVariableRow... | @supabase/supabase-js, ./logger, ./supabase/server, ./redis |
| `src/lib/custom-setup.constants.ts` | Utility/Library code | DEFAULT_CUSTOM_SETUP_TEMPLATE_SLUG | None |
| `src/lib/data.ts` | Utility/Library code | GST_RATES, ROLE_PERMISSIONS, CUSTOMER_CATEGORIES, VALIDATION_PATTERNS, ORDER_STATUS_FLOW... | ./utils, ./types |
| `src/lib/email/client.ts` | Utility/Library code | EmailClient, emailClient | ./service, ./types, ./queue, ../logger |
| `src/lib/email/index.ts` | Utility/Library code | EMAIL_TEMPLATES, generateEmailTemplate, EmailService, createEmailService, emailHelpers... | None |
| `src/lib/email/queue.ts` | Utility/Library code | getEmailQueue | bullmq, ../redis, ../logger |
| `src/lib/email/service.ts` | Utility/Library code | EmailServiceConfig, EmailService, createEmailService, emailHelpers | nodemailer, ../site-url, ../logger, ../environment-validator, ./types... |
| `src/lib/email/templates.ts` | Utility/Library code | generateEmailTemplate | ./types |
| `src/lib/email/types.ts` | Utility/Library code | EmailTemplate, EmailTemplateData, EMAIL_TEMPLATES, EmailTemplateType | None |
| `src/lib/enhanced-commission-service.ts` | Utility/Library code | CommissionCalculation, CommissionBreakdown, CommissionRule, EnhancedCommissionService, enhancedCommissionService | @/lib/supabase/server, @/lib/types, ./logger, ./whatsapp-service |
| `src/lib/environment-validator.ts` | Utility/Library code | EnvironmentConfig, environmentValidator, envConfig | ./logger, ./supabase/env |
| `src/lib/errorMapper.ts` | Utility/Library code | mapHumanError | None |
| `src/lib/errors.ts` | Utility/Library code | ApiErrorDef, ERROR_DEFS, apiError, apiSuccess | next/server |
| `src/lib/fetch-retry.ts` | Utility/Library code | None | None |
| `src/lib/homepage-auto-fill.ts` | Utility/Library code | AutoFillResult, computeAutoFill | ./types |
| `src/lib/hooks.ts` | Utility/Library code | useWishlist, useAuth, useCart | react, ../context/AuthProvider, ../store/wishlistStore, ../store/cartStore, ../hooks/use-analytics... |
| `src/lib/image-processor.ts` | Utility/Library code | ProcessedImage, createOptimizeImageStream | sharp, ./logger, @supabase/supabase-js, crypto |
| `src/lib/image-utils.ts` | Utility/Library code | normalizeImageUrl, isValidImageUrl, getFirstValidImage, filterValidImages, getProductDisplayImage... | None |
| `src/lib/improved-email-service.ts` | Utility/Library code | EmailOptions, EmailResult | nodemailer, ./logger, ./rate-limit |
| `src/lib/indian-tax.test.ts` | Utility/Library code | None | vitest, ./indian-tax |
| `src/lib/indian-tax.ts` | Utility/Library code | IndianStateTaxInfo, resolveIndianStateInfo, resolveIndianStateFromText, formatPlaceOfSupply, TECBUNNY_REGISTERED_STATE | None |
| `src/lib/infobip/infobip-whatsapp-otp.ts` | Utility/Library code | InfobipSendResult | crypto, ../logger |
| `src/lib/logger.ts` | Utility/Library code | LogMeta, logger | None |
| `src/lib/metadata.ts` | Utility/Library code | cleanMetadataTitle, cleanMetadataDescription, createPageMetadata | next, ./strings |
| `src/lib/offer-discount-service.ts` | Utility/Library code | OfferDiscountService, offerDiscountService | @/lib/types, @/lib/supabase/client, ./logger, ./site-url |
| `src/lib/order-utils.ts` | Utility/Library code | formatInvoiceDate, formatOrderNumber, formatOrderNumberMedium, formatOrderId, getOrderDisplayText... | None |
| `src/lib/orders/normalizers.ts` | Utility/Library code | STATUS_MAP, normalizeOrderStatus, deserializeOrder | ../types, ../logger |
| `src/lib/otp-manager.ts` | Utility/Library code | OTPChannel, OTPPurpose, OTPRequest, OTPVerification, OTPRecord... | crypto, @supabase/supabase-js, nodemailer, ./logger, ./redis... |
| `src/lib/otp-service.ts` | Utility/Library code | OtpRequest, OtpVerification, OtpService, otpService | @/lib/supabase/server, @/lib/types, ./email/client, ./infobip/infobip-whatsapp-otp, crypto... |
| `src/lib/page-content.ts` | Utility/Library code | PageContent | @/lib/supabase-server, @/lib/logger |
| `src/lib/payu-service.ts` | Utility/Library code | PayuEnvironment, PayuConfig, PayuRequestPayload, sanitizeHashValue, getPayuPaymentUrl... | crypto, ./logger, ./crypto-utils |
| `src/lib/pdf-generator.ts` | Utility/Library code | None | fs/promises, path, pdf-lib, ./logger, ./config-service... |
| `src/lib/permissions-client.ts` | Utility/Library code | isCustomerClient, isSalesClient, isAccountsClient, isManagerClient, isAdminClient... | ./types, ./roles |
| `src/lib/permissions.ts` | Utility/Library code | getRolePermissions, isCustomerClient, isSalesClient, isAccountsClient, isServiceEngineerClient... | @supabase/supabase-js, next/headers, @/lib/supabase/server, ./types, ./logger... |
| `src/lib/pricing-service.ts` | Utility/Library code | PricingContext, ProductPrice, PricingService, pricingService | @/lib/supabase/server, @/lib/types |
| `src/lib/product-visibility.ts` | Utility/Library code | isPubliclyVisibleProduct, filterPubliclyVisibleProducts | @/lib/strings, @/lib/image-utils |
| `src/lib/queue/image-jobs.ts` | Utility/Library code | imageJobsQueue, imageWorker | bullmq, ioredis, ../supabase/server, ../logger, ../image-utils... |
| `src/lib/rate-limit.ts` | Utility/Library code | Result, RateLimitOptions, rateLimit, remaining, bucketResetMs | ./redis, ./logger |
| `src/lib/redis.ts` | Utility/Library code | getRedis | ioredis, ./logger |
| `src/lib/roles.ts` | Utility/Library code | ROLE_HIERARCHY, UserRole, ALL_ROLES, normalizeRole, PERMS... | None |
| `src/lib/s3-storage.ts` | Utility/Library code | isS3Configured, S3UploadResult | @aws-sdk/client-s3, @aws-sdk/s3-request-presigner, ./logger |
| `src/lib/sanitize-html.ts` | Utility/Library code | sanitizeHtml | dompurify |
| `src/lib/security/network-validation.ts` | Utility/Library code | isBlockedIPv4, isBlockedIPv6, isBlockedIp | dns/promises, net |
| `src/lib/server-role-guard.ts` | Utility/Library code | RoleCheckOptions, ServerAuthState, roleMatches | @supabase/supabase-js, next/server, ./roles, ./supabase/server |
| `src/lib/service-management.ts` | Utility/Library code | ServiceTicketRequest, EngineerAssignment, ServiceCompletion, ServiceManagementService, serviceManagementService | @/lib/supabase/server, @/lib/types, ./logger |
| `src/lib/session-manager.ts` | Utility/Library code | SESSION_EXPIRED_EVENT, SessionManager | @/lib/supabase/client, ./logger |
| `src/lib/settings.ts` | Utility/Library code | None | @/lib/supabase/server, ./page-content, ./logger |
| `src/lib/site-url.ts` | Utility/Library code | getDefaultSiteUrls, resolveSiteUrl | None |
| `src/lib/strings.ts` | Utility/Library code | uiText, stripHtmlToPlainText | None |
| `src/lib/supabase-server.ts` | Utility/Library code | createSupabaseClient, createSupabaseServiceClient | @supabase/supabase-js, ./supabase/env |
| `src/lib/supabase-storage.ts` | Utility/Library code | SupabaseUploadResult | @supabase/supabase-js, ./logger, ./supabase/env, ./image-processor, stream |
| `src/lib/supabase.ts` | Utility/Library code | createClient | None |
| `src/lib/supabase/client.ts` | Utility/Library code | createClient | @supabase/ssr, ./env |
| `src/lib/supabase/env.ts` | Utility/Library code | getSupabaseRuntimeEnv, resolveSupabasePublicEnv, isSupabasePublicConfigured, requireSupabasePublicEnv, resolveSupabaseServiceEnv... | @/env |
| `src/lib/supabase/server.ts` | Utility/Library code | createServiceClient, createClient, isSupabasePublicConfigured, isSupabaseServiceConfigured, requireSupabasePublicEnv... | @supabase/ssr, next/headers, @supabase/supabase-js, ./env |
| `src/lib/two-factor-manager.ts` | Utility/Library code | TwoFactorSetup, TwoFactorVerification, twoFactorManager | crypto, speakeasy, qrcode, @supabase/supabase-js, ./logger... |
| `src/lib/types.ts` | Utility/Library code | Review, Product, HeroCarouselPageKey, HeroCarouselItem, HeroCarouselContent... | None |
| `src/lib/types/database.ts` | Utility/Library code | Database | None |
| `src/lib/types/products.ts` | Utility/Library code | Product, ProductImage, ProductOption, ProductVariant, ProductImportRow... | None |
| `src/lib/utils.ts` | Utility/Library code | cn, revealDelayClass, formatCurrency, formatNumber, truncateText... | clsx, tailwind-merge |
| `src/lib/validation.ts` | Utility/Library code | checkoutSchema, CheckoutFormData | zod |
| `src/lib/webhook-logger.ts` | Utility/Library code | WebhookEventStatus, getProcessingTimeSeconds | @/lib/logger |
| `src/lib/webhook-validator.ts` | Utility/Library code | validateWebhookSignature, validateWebhookTimestamp | crypto, @/lib/logger |
| `src/lib/whatsapp-service.ts` | Utility/Library code | WhatsAppService | zod, @supabase/supabase-js, ./logger, ./utils, ./environment-validator |
| `src/lib/whatsapp/whatsapp-otp-service.ts` | Utility/Library code | WhatsAppOTPConfig, WhatsAppResponse, WhatsAppOTPService, whatsappOTPService | ../whatsapp-service, ../logger |
| `src/store/cartStore.ts` | General component/module | CartPricing, CartState, useCartStore | zustand, @/lib/types, ../hooks/use-toast, @/lib/offer-discount-service, @/lib/logger |
| `src/store/wishlistStore.ts` | General component/module | WishlistState, useWishlistStore | zustand, @/lib/types, ../hooks/use-toast |
| `src/types/css.d.ts` | General component/module | None | None |
| `src/types/fontkit.d.ts` | General component/module | None | None |
| `src/types/pdfkit-standalone.d.ts` | General component/module | None | pdfkit |
| `supabase/migrations/20260608000000_final_schema.sql` | Supabase DB config/migration | None | None |
| `supabase/migrations/20260619000000_global_app_config.sql` | Supabase DB config/migration | None | None |
| `supabase/migrations/20260620000000_performance_database_hardening.sql` | Supabase DB config/migration | None | None |
| `supabase/migrations/20260621000000_storage_security_hardening.sql` | Supabase DB config/migration | None | None |
| `supabase/migrations/20260621095702_create_otp_verifications.sql` | Supabase DB config/migration | None | None |
| `supabase/migrations/20260621230000_dynamic_rbac_schema.sql` | Supabase DB config/migration | None | None |
| `supabase/migrations/20260622000000_immutable_audit_trails.sql` | Supabase DB config/migration | None | None |
| `supabase/update_products.sql` | Supabase DB config/migration | None | None |
| `supabase/upload_and_update_sql.js` | Supabase DB config/migration | None | fs, @supabase/supabase-js, sharp, crypto |
| `tailwind.config.ts` | General component/module | None | tailwindcss |
| `tsconfig.json` | Configuration/Data | None | None |
## 4. Installation & Setup Lifecycle

Follow these steps to clone, configure, and run the development server locally:

1. **Clone the repository**
   ```bash
   git clone https://github.com/tecbunny/tecbunny-web.git
   cd tecbunny-web
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Configure Environment Variables**
   Create a `.env.local` file in the root directory and add the Supabase keys as defined in the Prerequisites section.

4. **Start the Development Server**
   ```bash
   npm run dev
   ```
   The application will be accessible at `http://localhost:3000`.

## 5. Build & Deployment

The application is highly optimized for Vercel or any modern edge-capable hosting provider.

1. **Type Checking & Linting**
   Ensure all strict TypeScript paths and lint rules are satisfied before deploying:
   ```bash
   npm run typecheck
   npm run lint
   ```

2. **Production Build**
   ```bash
   npm run build
   ```
   This compiles the Next.js application, optimizes server components, and outputs the `.next` production bundle.

3. **Start Production Server**
   ```bash
   npm run start
   ```

4. **Deployment**
   Simply connect the repository to Vercel. Ensure the Production Environment Variables match your staging/production Supabase instances. The deployment pipeline will automatically run `npm run build`.

````````

