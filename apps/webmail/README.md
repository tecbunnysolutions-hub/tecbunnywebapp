# TecBunny Webmail (`apps/webmail`)

Welcome to the **TecBunny Webmail Application**. This service acts as the internal email management system and template renderer for the TecBunny platform.

---

## 📖 Project Overview

While transactional email sending is often handled directly by the API (via Nodemailer or third-party providers), the Webmail app centralizes the visual design (HTML templates) and provides an inbox interface for internal staff to manage customer communications (e.g., contact form submissions, support inquiries) without leaving the ecosystem.

## ✨ In-Depth Features

### 1. Template Management
- **Brand Consistency**: Houses all HTML email templates (Welcome Emails, Password Resets, Order Confirmations, Invoices).
- **Dynamic Injection**: Provides functions to dynamically inject customer names, order totals, and tracking links into the templates before dispatching.

### 2. Webmail Interface
- **Internal Inbox**: An interface for staff to view incoming queries routed from the public store's contact forms.
- **Thread Management**: Ability to reply to customers directly, keeping the entire conversation logged within the TecBunny system rather than scattered across external email clients.

---

## 🛠 Tech Stack

- **Framework**: Next.js / React
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Core Integrations**: Interfaces with the main API for fetching customer details and logging communication histories.

---

## 📁 Directory Structure

```text
apps/webmail/
├── src/
│   ├── app/                 # Webmail UI and routing
│   ├── lib/                 # Core email sending utilities and parsers
│   └── templates/           # (If applicable) HTML/React email templates
├── package.json             # Scripts & Dependencies
└── ...
```

---

## 💻 Scripts & Getting Started

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
