# TecBunny WhatsApp Business API (WABA) (`apps/waba`)

Welcome to the **TecBunny WABA Application**. This is a specialized microservice within the ecosystem dedicated entirely to handling interactions with the Meta/WhatsApp Business API.

Latest status update: 2026-07-19. The generated enterprise API inventory counts 18 WABA API entries, including 12 mutating entries. Existing coverage includes authentication, conversations, messages, media, campaign create, templates, and customer 360; production gaps remain for campaign list/update/delete/schedule/cancel, Meta template sync/approval, opt-in/out consent, webhook retry/dead-letter handling, delivery analytics, and automation rule CRUD.

---

## 📖 Project Overview

The WABA app bridges the gap between the TecBunny backend and WhatsApp users. It is responsible for sending transactional outbounds (like OTPs, Order Confirmations) and receiving inbound messages. Crucially, it incorporates Google's Generative AI to provide users with an intelligent, conversational bot experience directly within WhatsApp.

## ✨ In-Depth Features

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

## 🛠 Tech Stack

- **Framework**: Next.js (Used primarily for robust webhook endpoints and routing logic).
- **Language**: TypeScript
- **Database ORM**: Prisma Client (`@prisma/client`) - specifically chosen for structured logging of chat histories and delivery statuses.
- **AI Integration**: Google Generative AI (`@google/generative-ai`)
- **Backend Sync**: Supabase (`@supabase/supabase-js`) for linking WhatsApp numbers to registered platform accounts.
- **Internal Libraries**: `@tecbunny/core`

---

## 📁 Directory Structure

```text
apps/waba/
├── prisma/                  # Prisma schema and migrations specifically for WABA tables
├── src/
│   ├── app/                 # Webhook endpoints (e.g., /api/webhook)
│   ├── lib/                 # Shared utilities and constants
│   └── services/            # Core logic for sending messages, parsing incoming, and AI generation
├── test_outbound.js         # Quick script for testing outbound messages
├── test_webhook.js          # Quick script for simulating incoming webhooks
├── package.json             # Scripts & Dependencies
└── next.config.ts           # Next.js configuration
```

---

## 💻 Scripts & Getting Started

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
