# TecBunny Central API (`apps/api`)

Welcome to the **TecBunny Central API**. This application functions as the central nervous system for the entire TecBunny ecosystem, providing headless backend capabilities to the Public Store, Management Dashboard, Super Admin panel, and third-party integrations (like WhatsApp/WABA).

---

## 📖 Project Overview

Built entirely on Next.js API Routes (Serverless Functions), this repository exposes secure, typed, and scalable RESTful endpoints. It abstracts direct database communication away from the frontend applications, enforcing strict authorization, data validation, and complex business logic handled by the shared `@tecbunny/core` package.

## ✨ In-Depth Features & Endpoints

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

## 🛠 Tech Stack

- **Framework**: Next.js App Router (API Routes only)
- **Language**: TypeScript
- **Internal Libraries**: 
  - `@tecbunny/core` (Contains Prisma models, Supabase clients, Zod schemas, and core services)
- **Architecture**: RESTful JSON API

---

## 📁 Directory Structure

```text
apps/api/
├── src/
│   └── app/
│       └── api/                 # All API Routes
│           ├── auth/            # Auth controllers
│           ├── products/        # Product controllers
│           ├── orders/          # Order controllers
│           ├── payments/        # Payment controllers
│           └── ...              # (50+ other domain routes)
├── package.json                 # Scripts & Dependencies
├── next.config.ts               # Next.js configuration
└── eslint.config.mjs            # Linter rules
```

---

## 💻 Scripts & Getting Started

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
