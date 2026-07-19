# TecBunny Solutions - Corporate Platform

## 1. Project Title & Executive Summary
**TecBunny Solutions Corporate Platform (`www.tecbunny.com`)** is an enterprise-grade, high-performance web application representing the digital storefront and service portal for TecBunny Solutions Private Limited. 

The primary use case is to showcase technology solutions (Security Systems, IT Reliability, Automation, Incident Response), provide an interactive e-commerce catalog for hardware, and facilitate live quote negotiation. The architecture is built for maximum speed and SEO optimization, utilizing React Server Components, aggressive edge caching, optimistic UI updates, and an advanced Supabase-backed data layer.

## Latest Workspace Status

Latest review date: 2026-07-19. The current monorepo uses npm workspaces with Next.js 16.2.10, React 19.2.7, TypeScript 5.9.3, ESLint 9.39.5, Prisma 7.8.0, and Turbo 2.10.3. The generated API inventory contains 378 discovered API entries, 378 working static entries, 0 broken routes, 0 unmatched direct frontend callers, 0 duplicate APIs, and 0 missing validation/authentication/security/database static signals. Enterprise business capability gaps, product design posture, and software audit posture are archived in `ALL_MARKDOWN_DOCUMENTS.md`.

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
├── eslint.config.js
├── middleware.ts
├── next.config.mjs
├── package.json
├── postcss.config.mjs
├── src
│   ├── app
│   │   ├── about
│   │   │   ├── business-info
│   │   │   │   └── page.tsx
│   │   │   └── page.tsx
│   │   ├── activate-warranty
│   │   │   └── [serialNumber]
│   │   │       └── page.tsx
│   │   ├── admin
│   │   │   └── page.tsx
│   │   ├── agents
│   │   │   └── recruit
│   │   │       └── page.tsx
│   │   ├── ai-research
│   │   │   ├── layout.tsx
│   │   │   └── page.tsx
│   │   ├── api
│   │   │   ├── admin
│   │   │   │   ├── agents
│   │   │   │   │   ├── approve
│   │   │   │   │   │   └── route.ts
│   │   │   │   │   ├── list
│   │   │   │   │   │   └── route.ts
│   │   │   │   │   └── reject
│   │   │   │   │       └── route.ts
│   │   │   │   ├── ai
│   │   │   │   │   ├── product-description
│   │   │   │   │   │   └── route.ts
│   │   │   │   │   └── related-products
│   │   │   │   │       └── route.ts
│   │   │   │   ├── ai-query
│   │   │   │   │   └── route.ts
│   │   │   │   ├── custom-setups
│   │   │   │   │   └── route.ts
│   │   │   │   ├── dashboard
│   │   │   │   │   └── route.ts
│   │   │   │   ├── faqs
│   │   │   │   │   ├── route.ts
│   │   │   │   │   └── [id]
│   │   │   │   │       └── route.ts
│   │   │   │   ├── homepage
│   │   │   │   │   └── auto-fill
│   │   │   │   │       ├── route.ts
│   │   │   │   │       └── run
│   │   │   │   │           └── route.ts
│   │   │   │   ├── inventory
│   │   │   │   │   └── warranty
│   │   │   │   │       └── register
│   │   │   │   │           └── route.ts
│   │   │   │   ├── jobs
│   │   │   │   │   └── [id]
│   │   │   │   │       └── route.ts
│   │   │   │   ├── manage-role
│   │   │   │   │   └── route.ts
│   │   │   │   ├── marketing
│   │   │   │   │   ├── blitz
│   │   │   │   │   │   └── route.ts
│   │   │   │   │   └── broadcast
│   │   │   │   │       └── route.ts
│   │   │   │   ├── orders
│   │   │   │   │   ├── route.ts
│   │   │   │   │   └── [id]
│   │   │   │   │       └── pending-actions
│   │   │   │   │           └── route.ts
│   │   │   │   ├── payment-settings
│   │   │   │   │   ├── dedupe
│   │   │   │   │   │   └── route.ts
│   │   │   │   │   └── route.ts
│   │   │   │   ├── pricing
│   │   │   │   │   ├── route.ts
│   │   │   │   │   └── [id]
│   │   │   │   │       └── route.ts
│   │   │   │   ├── products
│   │   │   │   │   ├── ai-add
│   │   │   │   │   │   └── route.ts
│   │   │   │   │   ├── archive
│   │   │   │   │   │   └── route.ts
│   │   │   │   │   ├── bulk-price
│   │   │   │   │   │   └── route.ts
│   │   │   │   │   └── route.ts
│   │   │   │   ├── quotes
│   │   │   │   │   ├── advance-payment
│   │   │   │   │   │   └── route.ts
│   │   │   │   │   ├── route.ts
│   │   │   │   │   └── [id]
│   │   │   │   │       ├── download
│   │   │   │   │       │   └── route.ts
│   │   │   │   │       └── respond
│   │   │   │   │           └── route.ts
│   │   │   │   ├── redemptions
│   │   │   │   │   ├── approve
│   │   │   │   │   │   └── route.ts
│   │   │   │   │   ├── list
│   │   │   │   │   │   └── route.ts
│   │   │   │   │   └── process
│   │   │   │   │       └── route.ts
│   │   │   │   ├── roles
│   │   │   │   │   └── set
│   │   │   │   │       └── route.ts
│   │   │   │   ├── sales-agents
│   │   │   │   │   ├── route.ts
│   │   │   │   │   └── [id]
│   │   │   │   │       └── route.ts
│   │   │   │   ├── services
│   │   │   │   │   └── route.ts
│   │   │   │   ├── setup-initial-admins
│   │   │   │   │   └── route.ts
│   │   │   │   ├── setup-sales-agents
│   │   │   │   │   └── route.ts
│   │   │   │   └── users
│   │   │   │       └── [id]
│   │   │   │           └── history
│   │   │   │               └── route.ts
│   │   │   ├── agents
│   │   │   │   ├── apply
│   │   │   │   │   └── route.ts
│   │   │   │   ├── commissions
│   │   │   │   │   └── route.ts
│   │   │   │   ├── me
│   │   │   │   │   └── route.ts
│   │   │   │   ├── orders
│   │   │   │   │   └── create
│   │   │   │   │       └── route.ts
│   │   │   │   └── redemptions
│   │   │   │       └── route.ts
│   │   │   ├── ai
│   │   │   │   ├── generate-description
│   │   │   │   │   └── route.ts
│   │   │   │   ├── price-request
│   │   │   │   │   └── route.ts
│   │   │   │   ├── product-details
│   │   │   │   │   └── route.ts
│   │   │   │   └── research
│   │   │   │       └── route.ts
│   │   │   ├── analytics
│   │   │   │   ├── dashboard
│   │   │   │   │   └── route.ts
│   │   │   │   └── track
│   │   │   │       └── route.ts
│   │   │   ├── auth
│   │   │   │   ├── 2fa
│   │   │   │   │   ├── disable
│   │   │   │   │   │   └── route.ts
│   │   │   │   │   ├── setup
│   │   │   │   │   │   └── route.ts
│   │   │   │   │   ├── status
│   │   │   │   │   │   └── route.ts
│   │   │   │   │   └── verify
│   │   │   │   │       └── route.ts
│   │   │   │   ├── callback
│   │   │   │   │   └── route.ts
│   │   │   │   ├── complete-signup
│   │   │   │   │   └── route.ts
│   │   │   │   ├── first-login-whatsapp
│   │   │   │   │   └── route.ts
│   │   │   │   ├── forgot-password
│   │   │   │   │   └── route.ts
│   │   │   │   ├── quick-login
│   │   │   │   │   └── route.ts
│   │   │   │   ├── resend-verification
│   │   │   │   │   └── route.ts
│   │   │   │   ├── reset-password
│   │   │   │   │   └── route.ts
│   │   │   │   ├── resolve-phone
│   │   │   │   │   └── route.ts
│   │   │   │   ├── send-otp
│   │   │   │   │   └── route.ts
│   │   │   │   ├── session
│   │   │   │   │   └── route.ts
│   │   │   │   ├── signout
│   │   │   │   │   └── route.ts
│   │   │   │   ├── signup
│   │   │   │   │   └── route.ts
│   │   │   │   └── verify-otp
│   │   │   │       └── route.ts
│   │   │   ├── auto-offers
│   │   │   │   └── route.ts
│   │   │   ├── blueprints
│   │   │   │   └── attribution
│   │   │   │       └── conversion
│   │   │   │           └── route.ts
│   │   │   ├── captcha
│   │   │   │   ├── config
│   │   │   │   │   └── route.ts
│   │   │   │   └── verify
│   │   │   │       └── route.ts
│   │   │   ├── cart
│   │   │   │   └── merge
│   │   │   │       └── route.ts
│   │   │   ├── checkout
│   │   │   │   └── calculate
│   │   │   │       └── route.ts
│   │   │   ├── commissions
│   │   │   │   ├── calculate
│   │   │   │   │   └── route.ts
│   │   │   │   ├── payments
│   │   │   │   │   └── route.ts
│   │   │   │   └── rules
│   │   │   │       └── route.ts
│   │   │   ├── contact-messages
│   │   │   │   ├── route.ts
│   │   │   │   └── [id]
│   │   │   │       └── route.ts
│   │   │   ├── coupons
│   │   │   │   └── route.ts
│   │   │   ├── cron
│   │   │   │   ├── recover-abandoned-registrations
│   │   │   │   │   └── route.ts
│   │   │   │   └── service-retention
│   │   │   │       └── route.ts
│   │   │   ├── custom-setups
│   │   │   │   └── route.ts
│   │   │   ├── customer
│   │   │   │   └── notifications
│   │   │   │       └── route.ts
│   │   │   ├── customer-promotions
│   │   │   │   └── route.ts
│   │   │   ├── customers
│   │   │   │   └── register
│   │   │   │       └── route.ts
│   │   │   ├── discounts
│   │   │   │   ├── calculate
│   │   │   │   │   └── route.ts
│   │   │   │   └── route.ts
│   │   │   ├── email
│   │   │   │   ├── abandoned-cart
│   │   │   │   │   └── route.ts
│   │   │   │   ├── email-change
│   │   │   │   │   └── route.ts
│   │   │   │   ├── marketing
│   │   │   │   │   └── route.ts
│   │   │   │   ├── notify-manager
│   │   │   │   │   └── route.ts
│   │   │   │   ├── notify-sales-pickup
│   │   │   │   │   └── route.ts
│   │   │   │   ├── order-approved
│   │   │   │   │   └── route.ts
│   │   │   │   ├── order-completion
│   │   │   │   │   └── route.ts
│   │   │   │   ├── order-confirmation
│   │   │   │   │   └── route.ts
│   │   │   │   ├── order-delivered
│   │   │   │   │   └── route.ts
│   │   │   │   ├── password-reset
│   │   │   │   │   └── route.ts
│   │   │   │   ├── payment-confirmation
│   │   │   │   │   └── route.ts
│   │   │   │   ├── payment-failed
│   │   │   │   │   └── route.ts
│   │   │   │   ├── payment-pending
│   │   │   │   │   └── route.ts
│   │   │   │   ├── pickup
│   │   │   │   │   └── route.ts
│   │   │   │   ├── shipping
│   │   │   │   │   └── route.ts
│   │   │   │   ├── verification
│   │   │   │   │   └── route.ts
│   │   │   │   └── welcome
│   │   │   │       └── route.ts
│   │   │   ├── faqs
│   │   │   │   └── route.ts
│   │   │   ├── free-installation-slots
│   │   │   │   └── route.ts
│   │   │   ├── gst-verify
│   │   │   │   └── route.ts
│   │   │   ├── health
│   │   │   │   ├── email
│   │   │   │   │   └── route.ts
│   │   │   │   ├── orders
│   │   │   │   │   └── route.ts
│   │   │   │   ├── otp
│   │   │   │   │   └── route.ts
│   │   │   │   ├── route.ts
│   │   │   │   └── summary
│   │   │   │       └── route.ts
│   │   │   ├── inventory
│   │   │   │   ├── route.ts
│   │   │   │   └── transactions
│   │   │   │       └── route.ts
│   │   │   ├── marketing
│   │   │   │   └── triggers
│   │   │   │       └── order-delivered-followup
│   │   │   │           └── route.ts
│   │   │   ├── metadata
│   │   │   │   └── route.ts
│   │   │   ├── offers
│   │   │   │   └── route.ts
│   │   │   ├── orders
│   │   │   │   ├── auto-cancel
│   │   │   │   │   └── route.ts
│   │   │   │   ├── commission
│   │   │   │   │   └── route.ts
│   │   │   │   ├── route.ts
│   │   │   │   └── update-status
│   │   │   │       └── route.ts
│   │   │   ├── otp
│   │   │   │   ├── generate
│   │   │   │   │   └── route.ts
│   │   │   │   ├── resend
│   │   │   │   │   └── route.ts
│   │   │   │   └── verify
│   │   │   │       └── route.ts
│   │   │   ├── page-content
│   │   │   │   └── route.ts
│   │   │   ├── payment
│   │   │   │   └── payu
│   │   │   │       ├── callback
│   │   │   │       │   └── route.ts
│   │   │   │       └── initiate
│   │   │   │           └── route.ts
│   │   │   ├── payments
│   │   │   │   └── update
│   │   │   │       └── route.ts
│   │   │   ├── pricing
│   │   │   │   ├── calculate
│   │   │   │   │   └── route.ts
│   │   │   │   └── customer-type
│   │   │   │       └── route.ts
│   │   │   ├── products
│   │   │   │   ├── bulk-edit
│   │   │   │   │   └── route.ts
│   │   │   │   ├── cleanup
│   │   │   │   │   └── route.ts
│   │   │   │   ├── cleanup-images
│   │   │   │   │   └── route.ts
│   │   │   │   ├── export
│   │   │   │   │   └── route.ts
│   │   │   │   ├── fix-images
│   │   │   │   │   └── route.ts
│   │   │   │   ├── image-diagnostics
│   │   │   │   │   └── route.ts
│   │   │   │   ├── import
│   │   │   │   │   └── route.ts
│   │   │   │   ├── manual-import
│   │   │   │   │   └── route.ts
│   │   │   │   ├── recommendations
│   │   │   │   │   └── route.ts
│   │   │   │   ├── route.ts
│   │   │   │   ├── simple-import
│   │   │   │   │   └── route.ts
│   │   │   │   ├── template
│   │   │   │   │   └── route.ts
│   │   │   │   └── [id]
│   │   │   │       └── route.ts
│   │   │   ├── promotions
│   │   │   │   ├── claim-viral
│   │   │   │   │   └── route.ts
│   │   │   │   └── free-installation-claim
│   │   │   │       └── route.ts
│   │   │   ├── quotes
│   │   │   │   ├── bid
│   │   │   │   │   └── route.ts
│   │   │   │   ├── route.ts
│   │   │   │   └── [id]
│   │   │   │       ├── accept-counter
│   │   │   │       │   └── route.ts
│   │   │   │       ├── advance-payment
│   │   │   │       │   ├── confirm
│   │   │   │       │   │   └── route.ts
│   │   │   │       │   └── generate-link
│   │   │   │       │       └── route.ts
│   │   │   │       ├── reject-counter
│   │   │   │       │   └── route.ts
│   │   │   │       └── route.ts
│   │   │   ├── roles
│   │   │   │   └── route.ts
│   │   │   ├── roles-public
│   │   │   │   └── route.ts
│   │   │   ├── sales-agents
│   │   │   │   └── apply
│   │   │   │       └── route.ts
│   │   │   ├── security
│   │   │   │   ├── audit-logs
│   │   │   │   │   └── route.ts
│   │   │   │   ├── mfa-status
│   │   │   │   │   └── route.ts
│   │   │   │   ├── settings
│   │   │   │   │   └── route.ts
│   │   │   │   └── validate-password
│   │   │   │       └── route.ts
│   │   │   ├── services
│   │   │   │   ├── engineers
│   │   │   │   │   └── route.ts
│   │   │   │   ├── route.ts
│   │   │   │   ├── tickets
│   │   │   │   │   ├── route.ts
│   │   │   │   │   └── [id]
│   │   │   │   │       └── route.ts
│   │   │   │   └── [id]
│   │   │   │       └── route.ts
│   │   │   ├── settings
│   │   │   │   └── route.ts
│   │   │   ├── shipping
│   │   │   │   └── update
│   │   │   │       └── route.ts
│   │   │   ├── superadmin
│   │   │   │   ├── catalogue
│   │   │   │   │   └── generate
│   │   │   │   │       └── route.ts
│   │   │   │   ├── login
│   │   │   │   │   └── route.ts
│   │   │   │   ├── logout
│   │   │   │   │   └── route.ts
│   │   │   │   └── services
│   │   │   │       ├── ai-generate
│   │   │   │       │   └── route.ts
│   │   │   │       ├── route.ts
│   │   │   │       └── [id]
│   │   │   │           └── route.ts
│   │   │   ├── upload
│   │   │   │   └── route.ts
│   │   │   ├── upload-from-url
│   │   │   │   └── route.ts
│   │   │   ├── uploads
│   │   │   │   └── quote-documents
│   │   │   │       └── route.ts
│   │   │   ├── user
│   │   │   │   └── communication-preferences
│   │   │   │       └── route.ts
│   │   │   ├── users
│   │   │   │   └── route.ts
│   │   │   ├── users-admin
│   │   │   │   └── route.ts
│   │   │   ├── v1
│   │   │   │   └── embed
│   │   │   │       └── configurator
│   │   │   │           └── route.ts
│   │   │   ├── walk-in-orders
│   │   │   │   └── route.ts
│   │   │   ├── warranty
│   │   │   │   └── activate
│   │   │   │       └── route.ts
│   │   │   └── webhooks
│   │   │       ├── customer
│   │   │       │   └── signup
│   │   │       │       └── route.ts
│   │   │       ├── orders
│   │   │       │   ├── cancelled
│   │   │       │   │   └── route.ts
│   │   │       │   ├── delayed
│   │   │       │   │   └── route.ts
│   │   │       │   ├── delivered
│   │   │       │   │   └── route.ts
│   │   │       │   ├── notconfirmed
│   │   │       │   │   └── route.ts
│   │   │       │   ├── outfordelivery
│   │   │       │   │   └── route.ts
│   │   │       │   ├── placed
│   │   │       │   │   └── route.ts
│   │   │       │   └── shipped
│   │   │       │       └── route.ts
│   │   │       ├── payment
│   │   │       │   ├── failed
│   │   │       │   │   └── route.ts
│   │   │       │   └── received
│   │   │       │       └── route.ts
│   │   │       ├── stats
│   │   │       │   └── route.ts
│   │   │       └── whatsapp
│   │   │           └── route.ts
│   │   ├── auth
│   │   │   ├── change-password
│   │   │   │   └── page.tsx
│   │   │   ├── login
│   │   │   │   └── page.tsx
│   │   │   ├── signin
│   │   │   │   ├── layout.tsx
│   │   │   │   └── page.tsx
│   │   │   ├── signout
│   │   │   │   └── page.tsx
│   │   │   ├── signup
│   │   │   │   ├── layout.tsx
│   │   │   │   └── page.tsx
│   │   │   ├── verification-success
│   │   │   │   └── page.tsx
│   │   │   ├── verify-email
│   │   │   │   ├── EmailVerificationContent.tsx
│   │   │   │   └── page.tsx
│   │   │   └── verify-otp
│   │   │       ├── OTPVerificationContent.tsx
│   │   │       └── page.tsx
│   │   ├── blueprints
│   │   │   └── [id]
│   │   │       └── page.tsx
│   │   ├── cart
│   │   │   └── page.tsx
│   │   ├── checkout
│   │   │   └── page.tsx
│   │   ├── contact
│   │   │   └── page.tsx
│   │   ├── create-invoice
│   │   │   └── page.tsx
│   │   ├── customised-setups
│   │   │   └── page.tsx
│   │   ├── embed
│   │   │   └── configurator
│   │   │       └── page.tsx
│   │   ├── error.tsx
│   │   ├── global-error.tsx
│   │   ├── globals.css
│   │   ├── info
│   │   │   ├── faqs
│   │   │   │   └── page.tsx
│   │   │   └── policies
│   │   │       ├── page.tsx
│   │   │       ├── privacy
│   │   │       │   └── page.tsx
│   │   │       ├── refund-cancellation
│   │   │       │   └── page.tsx
│   │   │       ├── return
│   │   │       │   └── page.tsx
│   │   │       ├── shipping
│   │   │       │   └── page.tsx
│   │   │       └── terms
│   │   │           └── page.tsx
│   │   ├── layout.tsx
│   │   ├── loading.tsx
│   │   ├── manifest.webmanifest
│   │   │   └── route.ts
│   │   ├── mgmt
│   │   │   ├── accounts
│   │   │   │   ├── AccountsLayoutClient.tsx
│   │   │   │   ├── layout.tsx
│   │   │   │   └── page.tsx
│   │   │   ├── admin
│   │   │   │   ├── AdminLayoutClient.tsx
│   │   │   │   ├── ai-assistant
│   │   │   │   │   └── page.tsx
│   │   │   │   ├── analytics
│   │   │   │   │   └── page.tsx
│   │   │   │   ├── auto-offers
│   │   │   │   │   └── page.tsx
│   │   │   │   ├── broadcast-desk
│   │   │   │   │   └── page.tsx
│   │   │   │   ├── contact-messages
│   │   │   │   │   ├── admin-contact-messages.tsx
│   │   │   │   │   └── page.tsx
│   │   │   │   ├── coupons
│   │   │   │   │   ├── admin-coupons.tsx
│   │   │   │   │   └── page.tsx
│   │   │   │   ├── custom-setups
│   │   │   │   │   ├── page.tsx
│   │   │   │   │   └── price-manager.tsx
│   │   │   │   ├── discounts
│   │   │   │   │   └── page.tsx
│   │   │   │   ├── faqs
│   │   │   │   │   └── page.tsx
│   │   │   │   ├── hero-banners
│   │   │   │   │   └── page.tsx
│   │   │   │   ├── homepage-settings
│   │   │   │   │   ├── admin-homepage-settings.tsx
│   │   │   │   │   └── page.tsx
│   │   │   │   ├── inventory
│   │   │   │   │   └── page.tsx
│   │   │   │   ├── invoice-lookup
│   │   │   │   │   └── page.tsx
│   │   │   │   ├── layout.tsx
│   │   │   │   ├── offers
│   │   │   │   │   └── page.tsx
│   │   │   │   ├── orders
│   │   │   │   │   └── page.tsx
│   │   │   │   ├── page-content
│   │   │   │   │   └── page.tsx
│   │   │   │   ├── page.tsx
│   │   │   │   ├── payment-api
│   │   │   │   │   ├── admin-payment-api.tsx
│   │   │   │   │   └── page.tsx
│   │   │   │   ├── policies
│   │   │   │   │   └── page.tsx
│   │   │   │   ├── pricing
│   │   │   │   │   ├── admin-pricing.tsx
│   │   │   │   │   └── page.tsx
│   │   │   │   ├── products
│   │   │   │   │   ├── admin-products-new.tsx
│   │   │   │   │   └── page.tsx
│   │   │   │   ├── promotional-broadcast
│   │   │   │   │   └── page.tsx
│   │   │   │   ├── purchase
│   │   │   │   │   └── page.tsx
│   │   │   │   ├── quotes
│   │   │   │   │   └── page.tsx
│   │   │   │   ├── sales-agents
│   │   │   │   │   └── page.tsx
│   │   │   │   ├── security
│   │   │   │   │   └── page.tsx
│   │   │   │   ├── services
│   │   │   │   │   ├── admin-services.tsx
│   │   │   │   │   └── page.tsx
│   │   │   │   ├── settings
│   │   │   │   │   ├── admin-settings.tsx
│   │   │   │   │   └── page.tsx
│   │   │   │   ├── social-media
│   │   │   │   │   └── page.tsx
│   │   │   │   ├── staff
│   │   │   │   │   └── page.tsx
│   │   │   │   └── users
│   │   │   │       ├── admin-users.tsx
│   │   │   │       ├── page.tsx
│   │   │   │       └── [id]
│   │   │   │           └── analytics
│   │   │   │               ├── page.tsx
│   │   │   │               └── UserAnalyticsClient.tsx
│   │   │   ├── dashboard-client.tsx
│   │   │   ├── error.tsx
│   │   │   ├── loading.tsx
│   │   │   ├── manager
│   │   │   │   ├── inventory
│   │   │   │   │   └── page.tsx
│   │   │   │   ├── invoice-lookup
│   │   │   │   │   └── page.tsx
│   │   │   │   ├── layout.tsx
│   │   │   │   ├── ManagerLayoutClient.tsx
│   │   │   │   ├── online-orders
│   │   │   │   │   └── page.tsx
│   │   │   │   ├── page.tsx
│   │   │   │   ├── purchase
│   │   │   │   │   └── page.tsx
│   │   │   │   ├── quick-billing
│   │   │   │   │   └── page.tsx
│   │   │   │   ├── reports
│   │   │   │   │   └── page.tsx
│   │   │   │   └── salesperson
│   │   │   │       └── page.tsx
│   │   │   ├── page.tsx
│   │   │   ├── sales
│   │   │   │   ├── agent-order
│   │   │   │   │   └── page.tsx
│   │   │   │   ├── expenses
│   │   │   │   │   ├── page.tsx
│   │   │   │   │   └── sales-expenses.tsx
│   │   │   │   ├── history
│   │   │   │   │   ├── page.tsx
│   │   │   │   │   └── sales-history.tsx
│   │   │   │   ├── inventory
│   │   │   │   │   ├── page.tsx
│   │   │   │   │   └── sales-inventory.tsx
│   │   │   │   ├── invoice-lookup
│   │   │   │   │   ├── page.tsx
│   │   │   │   │   └── sales-invoice-lookup.tsx
│   │   │   │   ├── layout.tsx
│   │   │   │   ├── online-orders
│   │   │   │   │   ├── page.tsx
│   │   │   │   │   └── sales-online-orders.tsx
│   │   │   │   ├── orders
│   │   │   │   │   ├── page.tsx
│   │   │   │   │   └── sales-orders.tsx
│   │   │   │   ├── page.tsx
│   │   │   │   ├── products
│   │   │   │   │   ├── edit
│   │   │   │   │   │   └── [id]
│   │   │   │   │   │       ├── page.tsx
│   │   │   │   │   │       └── sales-product-edit.tsx
│   │   │   │   │   ├── new
│   │   │   │   │   │   ├── page.tsx
│   │   │   │   │   │   └── sales-product-new.tsx
│   │   │   │   │   ├── page.tsx
│   │   │   │   │   └── sales-products.tsx
│   │   │   │   ├── purchase-entry
│   │   │   │   │   ├── page.tsx
│   │   │   │   │   └── sales-purchase-entry.tsx
│   │   │   │   ├── quick-billing
│   │   │   │   │   ├── page.tsx
│   │   │   │   │   └── sales-quick-billing.tsx
│   │   │   │   ├── sales-dashboard.tsx
│   │   │   │   ├── SalesLayoutClient.tsx
│   │   │   │   └── walk-in-orders
│   │   │   │       └── page.tsx
│   │   │   ├── sales-external
│   │   │   │   ├── commission-report
│   │   │   │   │   └── page.tsx
│   │   │   │   ├── layout.tsx
│   │   │   │   ├── page.tsx
│   │   │   │   ├── quick-billing
│   │   │   │   │   └── page.tsx
│   │   │   │   ├── reports
│   │   │   │   │   └── page.tsx
│   │   │   │   └── SalesExternalLayoutClient.tsx
│   │   │   └── sales-staff
│   │   │       ├── invoice-lookup
│   │   │       │   └── page.tsx
│   │   │       ├── layout.tsx
│   │   │       ├── order-tracking
│   │   │       │   └── page.tsx
│   │   │       ├── page.tsx
│   │   │       ├── quick-billing
│   │   │       │   └── page.tsx
│   │   │       ├── reports
│   │   │       │   └── page.tsx
│   │   │       └── SalesStaffLayoutClient.tsx
│   │   ├── not-found.tsx
│   │   ├── offers
│   │   │   └── page.tsx
│   │   ├── orders
│   │   │   ├── page.tsx
│   │   │   └── [orderId]
│   │   │       ├── invoice
│   │   │       │   └── page.tsx
│   │   │       └── page.tsx
│   │   ├── page.tsx
│   │   ├── payment
│   │   │   ├── failed
│   │   │   │   └── page.tsx
│   │   │   ├── payu
│   │   │   │   └── [orderId]
│   │   │   │       ├── page.tsx
│   │   │   │       └── PayuClientPage.tsx
│   │   │   ├── success
│   │   │   │   └── page.tsx
│   │   │   ├── upi
│   │   │   │   └── [orderId]
│   │   │   │       ├── page.tsx
│   │   │   │       └── UPIClientPage.tsx
│   │   │   └── [method]
│   │   │       └── [orderId]
│   │   │           ├── page.tsx
│   │   │           └── PaymentClientPage.tsx
│   │   ├── products
│   │   │   ├── page.tsx
│   │   │   └── [id]
│   │   │       ├── error.tsx
│   │   │       ├── loading.tsx
│   │   │       └── page.tsx
│   │   ├── profile
│   │   │   └── page.tsx
│   │   ├── quotes
│   │   │   └── [id]
│   │   │       ├── advance-payment
│   │   │       │   └── page.tsx
│   │   │       └── page.tsx
│   │   ├── robots.ts
│   │   ├── services
│   │   │   ├── page.tsx
│   │   │   └── smart-infrastructure
│   │   │       └── page.tsx
│   │   ├── sitemap.ts
│   │   ├── staff
│   │   │   └── login
│   │   │       └── page.tsx
│   │   ├── superadmin
│   │   │   ├── login
│   │   │   │   └── page.tsx
│   │   │   └── mgmt
│   │   │       ├── ai-config
│   │   │       │   └── page.tsx
│   │   │       ├── catalogue
│   │   │       │   └── page.tsx
│   │   │       ├── custom-setups
│   │   │       │   └── page.tsx
│   │   │       ├── dashboard
│   │   │       │   └── page.tsx
│   │   │       ├── layout.tsx
│   │   │       ├── leads
│   │   │       │   └── page.tsx
│   │   │       ├── marketing
│   │   │       │   └── page.tsx
│   │   │       ├── offers
│   │   │       │   └── page.tsx
│   │   │       ├── payment-settings
│   │   │       │   └── page.tsx
│   │   │       ├── policies
│   │   │       │   └── page.tsx
│   │   │       ├── products
│   │   │       │   └── page.tsx
│   │   │       ├── reports
│   │   │       │   └── page.tsx
│   │   │       ├── services
│   │   │       │   └── page.tsx
│   │   │       ├── settings
│   │   │       │   └── page.tsx
│   │   │       ├── social-media
│   │   │       │   └── page.tsx
│   │   │       └── users
│   │   │           ├── page.tsx
│   │   │           └── [id]
│   │   │               └── analytics
│   │   │                   └── page.tsx
│   │   └── webdev
│   │       └── page.tsx
│   ├── components
│   │   ├── about-page.tsx
│   │   ├── accounts
│   │   │   └── AccountsSidebar.tsx
│   │   ├── admin
│   │   │   ├── AddUserDialog.tsx
│   │   │   ├── AdminSidebar.tsx
│   │   │   ├── AutoOffersManagement.tsx
│   │   │   ├── CreateDiscountDialog.tsx
│   │   │   ├── CreateOfferDialog.tsx
│   │   │   ├── CreateProductDialog.tsx
│   │   │   ├── CreateServiceDialog.tsx
│   │   │   ├── DiscountOffersDialog.tsx
│   │   │   ├── EditProductDialog.tsx
│   │   │   ├── EditServiceDialog.tsx
│   │   │   ├── EditUserDialog.tsx
│   │   │   ├── FaqsManagement.tsx
│   │   │   ├── HeroCarouselManager.tsx
│   │   │   ├── OffersManagement.tsx
│   │   │   ├── PartnerBrandsEditor.tsx
│   │   │   ├── PoliciesManagement.tsx
│   │   │   ├── SalesAgentsManagement.tsx
│   │   │   ├── security-dashboard.tsx
│   │   │   ├── SingleImageUploader.tsx
│   │   │   └── SocialMediaManager.tsx
│   │   ├── ai-research
│   │   │   └── TechStackAudit.tsx
│   │   ├── auth
│   │   │   ├── InstantIdentity.tsx
│   │   │   ├── LoginDialog.tsx
│   │   │   ├── TwoFactorSetup.tsx
│   │   │   └── TwoFactorVerification.tsx
│   │   ├── BehavioralCouponPopup.tsx
│   │   ├── cart
│   │   │   ├── AddToCartButton.tsx
│   │   │   ├── CartItemCard.tsx
│   │   │   ├── CartPage.tsx
│   │   │   └── EnhancedCartSheet.tsx
│   │   ├── checkout
│   │   │   ├── CheckoutPage.tsx
│   │   │   └── CheckoutWizard.tsx
│   │   ├── contact-page.tsx
│   │   ├── customised-setups
│   │   │   ├── BlueprintShowcase.tsx
│   │   │   ├── ClientCustomSetupFlow.tsx
│   │   │   ├── CustomSetupFlow.tsx
│   │   │   ├── InteractiveTopologyDiagram.tsx
│   │   │   ├── QuotationStatusLookup.tsx
│   │   │   ├── QuoteCTA.tsx
│   │   │   ├── RefreshButton.tsx
│   │   │   └── ROICostEfficiencyBanner.tsx
│   │   ├── discovery
│   │   │   ├── ServiceDiscovery.tsx
│   │   │   └── ServiceSearch.tsx
│   │   ├── FaqsClient.tsx
│   │   ├── HeroCarousel.tsx
│   │   ├── home
│   │   │   ├── AmbientEffects.tsx
│   │   │   ├── HeroRotator.tsx
│   │   │   ├── HeroVisuals.tsx
│   │   │   ├── MagneticButton.tsx
│   │   │   └── TrackQuoteForm.tsx
│   │   ├── home-page.tsx
│   │   ├── InfrastructureLeadForm.tsx
│   │   ├── invoices
│   │   │   └── InvoiceTemplate.tsx
│   │   ├── layout
│   │   │   ├── CookieConsentBanner.tsx
│   │   │   ├── DeferredFloatingAIAssistant.tsx
│   │   │   ├── DeferredRuntimeServices.tsx
│   │   │   ├── FloatingAIAssistant.tsx
│   │   │   ├── Footer.tsx
│   │   │   ├── Header.tsx
│   │   │   └── TechShell.tsx
│   │   ├── LocalServiceLandingPage.tsx
│   │   ├── manager
│   │   │   └── ManagerSidebar.tsx
│   │   ├── mgmt
│   │   │   └── MgmtMobileNav.tsx
│   │   ├── offers-page.tsx
│   │   ├── onboarding
│   │   │   └── LazyInvoiceBuilder.tsx
│   │   ├── orders
│   │   │   ├── OrderConfirmationPage.tsx
│   │   │   └── OrdersListPage.tsx
│   │   ├── policy-page.tsx
│   │   ├── products
│   │   │   ├── ProductDetailPage.tsx
│   │   │   ├── ProductJsonLd.tsx
│   │   │   ├── ShopPageContent.tsx
│   │   │   └── StarRating.tsx
│   │   ├── profile
│   │   │   ├── EditProfileDialog.tsx
│   │   │   └── UserProfile.tsx
│   │   ├── providers
│   │   │   └── ThemeProvider.tsx
│   │   ├── rbac
│   │   │   └── RequirePermission.tsx
│   │   ├── referral
│   │   │   └── ReferralWidget.tsx
│   │   ├── RegionalTrustBanner.tsx
│   │   ├── sales
│   │   │   ├── CreateCustomerDialog.tsx
│   │   │   ├── CreateProductDialog.tsx
│   │   │   ├── MarketingKitTerminal.tsx
│   │   │   ├── OrderActions.tsx
│   │   │   ├── PurchaseSerialNumberDialog.tsx
│   │   │   ├── SalesSidebar.tsx
│   │   │   ├── SerialNumberDialog.tsx
│   │   │   ├── ViewSerialsDialog.tsx
│   │   │   └── WalkInOrderManagement.tsx
│   │   ├── sales-external
│   │   │   └── SalesExternalSidebar.tsx
│   │   ├── sales-staff
│   │   │   └── SalesStaffSidebar.tsx
│   │   ├── services-page.tsx
│   │   ├── shared
│   │   │   ├── ConfirmDialog.tsx
│   │   │   ├── LoadingSpinner.tsx
│   │   │   ├── MicroErrorBoundary.tsx
│   │   │   ├── OrderDataTable.tsx
│   │   │   ├── PublicRouteError.tsx
│   │   │   └── UniversalSearch.tsx
│   │   ├── tracking
│   │   │   └── LiveTimeline.tsx
│   │   ├── ui
│   │   │   ├── accordion.tsx
│   │   │   ├── alert-dialog.tsx
│   │   │   ├── alert.tsx
│   │   │   ├── avatar.tsx
│   │   │   ├── badge.tsx
│   │   │   ├── BlitzAuditBanner.tsx
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── checkbox.tsx
│   │   │   ├── dialog.tsx
│   │   │   ├── dropdown-menu.tsx
│   │   │   ├── form.tsx
│   │   │   ├── FreeInstallationOfferBanner.tsx
│   │   │   ├── input.tsx
│   │   │   ├── label.tsx
│   │   │   ├── logo.tsx
│   │   │   ├── markdown-renderer.tsx
│   │   │   ├── modal.tsx
│   │   │   ├── optimized-image.tsx
│   │   │   ├── popover.tsx
│   │   │   ├── radio-group.tsx
│   │   │   ├── scroll-area.tsx
│   │   │   ├── select.tsx
│   │   │   ├── separator.tsx
│   │   │   ├── sheet.tsx
│   │   │   ├── skeleton.tsx
│   │   │   ├── switch.tsx
│   │   │   ├── table.tsx
│   │   │   ├── tabs.tsx
│   │   │   ├── textarea.tsx
│   │   │   ├── toast.tsx
│   │   │   ├── toaster.tsx
│   │   │   ├── ViralWarrantyModal.tsx
│   │   │   └── WarrantyTelemetryBadge.tsx
│   │   ├── ux
│   │   │   ├── MinimalAuth.tsx
│   │   │   ├── OrderTimeline.tsx
│   │   │   ├── ProgressiveCheckout.tsx
│   │   │   └── ServiceFinder.tsx
│   │   └── wishlist
│   │       └── WishlistButton.tsx
│   ├── context
│   │   ├── AppProvider.tsx
│   │   ├── AuthProvider.tsx
│   │   └── OrderProvider.tsx
│   ├── env.ts
│   ├── hooks
│   │   ├── use-analytics.ts
│   │   ├── use-behavioral-cro.ts
│   │   ├── use-debounce.ts
│   │   ├── use-deferred-activation.ts
│   │   ├── use-lead-capture-trigger.tsx
│   │   ├── use-near-viewport.ts
│   │   ├── use-page-content.ts
│   │   ├── use-payment-methods.ts
│   │   ├── use-permissions.ts
│   │   ├── use-prefers-reduced-motion.ts
│   │   ├── use-reveal-sections.ts
│   │   ├── use-toast.ts
│   │   ├── use-viral-attribution.ts
│   │   ├── use-warranty-telemetry.ts
│   │   ├── use-window-size.ts
│   │   ├── useCheckoutMachine.ts
│   │   ├── useFuzzySearch.ts
│   │   ├── useLiveOrder.ts
│   │   └── usePermissions.ts
│   ├── lib
│   │   ├── admin-auth.ts
│   │   ├── ai
│   │   │   ├── gemini-service.ts
│   │   │   ├── product-details.ts
│   │   │   ├── prompts.ts
│   │   │   └── tax-classification.ts
│   │   ├── api-email-route.ts
│   │   ├── api-response.ts
│   │   ├── apiClient.ts
│   │   ├── auth
│   │   │   ├── admin-guard.ts
│   │   │   ├── guard.ts
│   │   │   ├── server-role.ts
│   │   │   └── superadmin-session.ts
│   │   ├── captcha
│   │   │   └── captcha-service.ts
│   │   ├── catalogue-pdf-generator.ts
│   │   ├── checkout-engine.test.ts
│   │   ├── checkout-engine.ts
│   │   ├── config-service.ts
│   │   ├── constants.ts
│   │   ├── crypto-utils.ts
│   │   ├── custom-setup-pricing.ts
│   │   ├── custom-setup-service.ts
│   │   ├── custom-setup.constants.ts
│   │   ├── data.ts
│   │   ├── email
│   │   │   ├── client.ts
│   │   │   ├── index.ts
│   │   │   ├── queue.ts
│   │   │   ├── service.ts
│   │   │   ├── templates.ts
│   │   │   └── types.ts
│   │   ├── enhanced-commission-service.ts
│   │   ├── environment-validator.ts
│   │   ├── errorMapper.ts
│   │   ├── errors.ts
│   │   ├── fetch-retry.ts
│   │   ├── homepage-auto-fill.ts
│   │   ├── hooks.ts
│   │   ├── image-processor.ts
│   │   ├── image-utils.ts
│   │   ├── improved-email-service.ts
│   │   ├── indian-tax.test.ts
│   │   ├── indian-tax.ts
│   │   ├── infobip
│   │   │   └── infobip-whatsapp-otp.ts
│   │   ├── logger.ts
│   │   ├── metadata.ts
│   │   ├── offer-discount-service.ts
│   │   ├── order-utils.ts
│   │   ├── orders
│   │   │   └── normalizers.ts
│   │   ├── otp-manager.ts
│   │   ├── otp-service.ts
│   │   ├── page-content.ts
│   │   ├── payu-service.ts
│   │   ├── pdf-generator.ts
│   │   ├── permissions-client.ts
│   │   ├── permissions.ts
│   │   ├── pricing-service.ts
│   │   ├── product-visibility.ts
│   │   ├── queue
│   │   │   └── image-jobs.ts
│   │   ├── rate-limit.ts
│   │   ├── redis.ts
│   │   ├── roles.ts
│   │   ├── s3-storage.ts
│   │   ├── sanitize-html.ts
│   │   ├── security
│   │   │   └── network-validation.ts
│   │   ├── server-role-guard.ts
│   │   ├── service-management.ts
│   │   ├── session-manager.ts
│   │   ├── settings.ts
│   │   ├── site-url.ts
│   │   ├── strings.ts
│   │   ├── supabase
│   │   │   ├── client.ts
│   │   │   ├── env.ts
│   │   │   └── server.ts
│   │   ├── supabase-server.ts
│   │   ├── supabase-storage.ts
│   │   ├── supabase.ts
│   │   ├── two-factor-manager.ts
│   │   ├── types
│   │   │   ├── database.ts
│   │   │   └── products.ts
│   │   ├── types.ts
│   │   ├── utils.ts
│   │   ├── validation.ts
│   │   ├── webhook-logger.ts
│   │   ├── webhook-validator.ts
│   │   ├── whatsapp
│   │   │   └── whatsapp-otp-service.ts
│   │   └── whatsapp-service.ts
│   ├── store
│   │   ├── cartStore.ts
│   │   └── wishlistStore.ts
│   └── types
│       ├── css.d.ts
│       ├── fontkit.d.ts
│       └── pdfkit-standalone.d.ts
├── supabase
│   ├── migrations
│   │   ├── 20260608000000_final_schema.sql
│   │   ├── 20260619000000_global_app_config.sql
│   │   ├── 20260620000000_performance_database_hardening.sql
│   │   ├── 20260621000000_storage_security_hardening.sql
│   │   ├── 20260621095702_create_otp_verifications.sql
│   │   ├── 20260621230000_dynamic_rbac_schema.sql
│   │   └── 20260622000000_immutable_audit_trails.sql
│   ├── update_products.sql
│   └── upload_and_update_sql.js
├── tailwind.config.ts
└── tsconfig.json
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
