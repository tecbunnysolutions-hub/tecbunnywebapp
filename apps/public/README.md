# TecBunny Public Store (`apps/public`)

Welcome to the **TecBunny Public Store**, the primary customer-facing portal and e-commerce front-end for the entire TecBunny ecosystem. This application is responsible for driving sales, showcasing services, capturing leads, and managing user profiles.

Latest status update: 2026-07-19. The generated enterprise API inventory counts 3 local Public app API entries, with most commerce/customer actions served by the central API and shared packages. Public workflow gaps still requiring production APIs include customer master profile CRUD, addresses, saved views/favorites, invoice download, returns/refunds, product reviews, stock reservation, media library, and service booking lifecycle.

---

## 📖 Project Overview

The Public Store is a Next.js (App Router) application designed for maximum performance, SEO optimization, and seamless user experience. It leverages Server-Side Rendering (SSR) and Static Site Generation (SSG) to serve content swiftly while maintaining dynamic e-commerce functionalities like cart management, secure checkouts, and AI-powered interactions.

## ✨ In-Depth Features

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

## 🛠 Tech Stack

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

## 📁 Directory Structure

```text
apps/public/
├── public/                 # Static assets (images, fonts)
├── src/
│   ├── app/                # Next.js App Router (Pages, Layouts, API Routes)
│   │   ├── (dashboard)/    # Dashboard specific layouts
│   │   ├── auth/           # Login, Registration, Password Reset
│   │   ├── cart/           # Shopping Cart view
│   │   ├── checkout/       # Checkout flow
│   │   ├── shop/           # Main storefront
│   │   ├── profile/        # User account management
│   │   └── ...             # Other routes
│   └── globals.css         # Global Tailwind directives
├── package.json            # Scripts & Dependencies
├── tailwind.config.ts      # Tailwind configuration
└── next.config.mjs         # Next.js build configurations
```

---

## 💻 Scripts & Getting Started

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
