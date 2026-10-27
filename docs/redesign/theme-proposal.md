# TecBunny theme and redesign proposal

Status: proposed, awaiting approval. Read alongside [the complete coverage ledger](coverage-ledger.md).

## Positioning and voice

Project content describes TecBunny as a local technology team for homes and small businesses in Goa, with North Goa and Sawantwadi coverage mentioned in metadata. Core offerings are CCTV, IT support, RFID locks, networking, and websites; the app also contains product sales and seller/customer journeys.

Proposed personality: capable, approachable, precise. Primary marketing conversion: a qualified quote enquiry or WhatsApp conversation. Product pages retain purchase CTAs. Audience age and unsupported commercial promises will not be invented.

Example homepage:

- Eyebrow: Technology services for Goa homes and businesses
- H1: Make your technology work for you.
- Supporting copy: Plan your CCTV, improve your Wi-Fi, sort out computer problems, or build a website with one local team. Tell us what you need and we’ll help you work through the options.
- Primary CTA: Discuss your project
- Secondary CTA: Explore our services
- Process section: Tell us what needs fixing. Review the options. Agree the work before it starts.

Existing price, warranty, delivery, hosting, and policy claims require source verification before reuse. Customer reviews and project photos remain hidden until genuine material is available.

## Proposed semantic colors

| Role | Light | Dark |
|---|---|---|
| Page background | #F8FAFC | #0B1220 |
| Card / popover | #FFFFFF | #111D30 |
| Body text | #0F172A | #F1F5F9 |
| Muted text | #475569 | #A8B5C9 |
| Primary / focus ring | #1D4ED8 | #60A5FA |
| Primary button text | #FFFFFF | #0B1220 |
| Secondary surface | #E2E8F0 | #1E293B |
| Secondary text | #0F172A | #F1F5F9 |
| Warm accent | #C2410C | #FDBA74 |
| Accent foreground | #FFFFFF | #0B1220 |
| Decorative divider | #CBD5E1 | #334155 |
| Control border | #64748B | #64748B |
| Success text/icon | #166534 | #86EFAC |
| Warning text/icon | #92400E | #FCD34D |
| Error text/icon | #B91C1C | #FCA5A5 |

Measured contrast: light body/background 17.06:1; dark body/background 17.09:1; light muted/card 7.58:1; dark muted/card 8.14:1; light primary button 6.70:1; dark primary button 7.36:1. Accent pairs 5.18:1 and 11.10:1. Status text on card backgrounds exceeds 6.4:1. Control borders on cards: 4.76:1 light and 3.55:1 dark. Decorative dividers are not used as the only indicator of interactive boundaries. These are token calculations, not whole-app accessibility certification. Hover, focus, validation, charts, imagery overlays, and disabled treatments need rendered review.

Use the existing semantic contract and consolidate physical values into a shared stylesheet exported by packages/ui. App-specific layouts consume those tokens. Adopt a visible Light / Dark / System selector, with system default for new visitors and persisted explicit preference.

## Typography and layout

Propose one family, Inter with system-ui fallback, for headings and body to keep the payload small. Bundle it if licensing/assets permit; otherwise use system-ui without blocking rendering. Weights 400/500/600/700. Type scale 12/14/16/18/20/24/32/40/56px expressed as rem tokens; marketing headings adapt using clamp. Body line height 1.6; headings 1.1–1.25. Comfortable reading widths around 65 characters.

Spacing: 4/8/12/16/24/32/48/64/96px tokens. Container maximum 1200px with 16px mobile, 24px tablet, and 32px desktop gutters. Single-column mobile, two-column tablet, and up to twelve-column desktop composition. Proposed breakpoints 640/768/1024/1280px, aligned with the current stack after configuration review.

Control radius 10px, cards 16px, major feature panels 24px, badges pill-shaped. Subtle shared shadows: small elevation for menus/controls, medium for floating panels/dialogs. Avoid decorative shadows on dense internal tables. Internal tools use compact density with the same palette and components.

## Representative treatments

- Buttons: 44–48px comfortable touch height; cobalt filled primary, secondary surface, outlined, and text variants. Focus ring offset from the edge; descriptive busy/disabled states. Marketing CTAs do not change transactional semantics.
- Cards: clean surface, deliberate whitespace, clear heading and one primary next action. Service cards use one Lucide icon and benefit-led copy; product cards preserve price, availability, variants, and purchase behavior.
- Forms: visible labels, help text, clear required/optional treatment, error text associated with each field, and a concise error summary where warranted. Preserve submitted names/payloads and validation.
- Navigation: legible logo, service discovery, product/account/cart access, one clear enquiry CTA, and keyboard-accessible mobile navigation. Footer groups services, company, support, and policies.
- Tables: consistent headers, numeric alignment, row actions, filters, pagination, empty state, and mobile overflow or task-appropriate stacked view.
- Modals/alerts/badges/loaders: reuse existing shared primitives, add semantic variants, retain focus handling and status announcements. Skeletons match content geometry.
- Imagery: real installation/product imagery with honest captions, meaningful alt text, and predictable aspect ratios. No fabricated project proof.
- Motion: existing 120/200/320ms contract for feedback, panels, and deliberate transitions; reduced-motion users get minimal motion.

## Rollout tied to the ledger

1. Consolidate theme tokens, typography, icons, primitives, and theme preference behavior in the existing packages. Preserve the existing enterprise token contract and validators.
2. Redesign public shell and customer acquisition pages: home, service categories, solutions, about, contact, portfolio, guides, blog, FAQ, policies, assessment and lead flows. Maintain legacy redirects and canonical behavior.
3. Redesign catalog/search/detail, cart, checkout, payments, orders/invoices, quotes/advance payments, account/authentication, seller flows, warranty, and configurator states. Preserve authentication, ownership, payment provider behavior, analytics, and API payloads.
4. Apply the same system with task-oriented density to all 92 management and 33 superadmin entrypoints. Preserve role/module filtering and shared admin-ui behavior.
5. Cover eight WhatsApp operations pages, two webmail pages, and four API-app rendered pages. Extension popup/settings are inventoried separately; include them only if the user wants extension styling in scope.
6. Reconcile every ledger row, including redirect-only entries and all explicit and delegated states. Run appropriate existing validation, build/type/lint/tests and browser checks; report remaining gaps honestly.

## Verification plan and current limitations

Use existing architecture, theme, accessibility, SEO, and UX validators where applicable, along with workspace build/type/lint/tests. Use fixtures or safe local test accounts to verify affected workflows and viewport/theme variants. Re-scan routes to detect omissions. Authenticated screens and providers require suitable test access before interaction verification can be claimed.

Current work is a static source audit and theme proposal. No application code was changed and no app build was run at this approval stage. Approval is requested for implementation across the six app surfaces; extension inclusion is a separate choice. Deployment and production data changes are outside this proposal.
