# TecBunny Super Admin Dashboard (`apps/superadmin`)

Welcome to the **TecBunny Super Admin Dashboard**. This application is restricted exclusively to the platform owners, core engineers, and high-level system administrators. It controls the macro-level configurations for the entire TecBunny ecosystem.

---

## 📖 Project Overview

The Super Admin Dashboard provides a top-down view of the platform. Unlike the regular Management Dashboard (`apps/mgmt`), which focuses on day-to-day operations (orders, support tickets), this dashboard is designed for systemic control: managing global tenants, adjusting universal pricing tiers, configuring overarching feature flags, and viewing aggregate platform analytics.

## ✨ In-Depth Features

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

## 🛠 Tech Stack

- **Framework**: Next.js (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Internal Libraries**: 
  - `@tecbunny/admin-ui` (Ensures consistency with the `mgmt` dashboard but with specialized components)
  - `@tecbunny/core` (Direct integration for root-level database overrides)
- **Authentication**: Supabase (Requires the highest `superadmin` role).

---

## 📁 Directory Structure

```text
apps/superadmin/
├── src/
│   └── app/
│       ├── superadmin/      # Core super-admin interfaces
│       ├── auth/            # Root login screens
│       └── layout.tsx       # Main layout wrapper
├── package.json             # Scripts & Dependencies
├── middleware.ts            # High-security route protection
└── next.config.ts           # Next.js configuration
```

---

## 💻 Scripts & Getting Started

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
