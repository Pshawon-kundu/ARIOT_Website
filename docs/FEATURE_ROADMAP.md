# FEATURE_ROADMAP.md

ARIOT ships in five phases. Each phase has a clear deliverable, exit criteria, and a "do-not-touch" list to keep scope honest. Cascade does **one phase at a time** — no leaking Phase 3 work into Phase 1.

Phase boundaries are *commitments to the user*, not bureaucracy. If a phase boundary feels fuzzy, stop and ask before crossing it.

---

## Phase 1 — Premium Public Website

**Goal**: a marketing website credible enough to anchor every sales conversation. No customer-facing transactions yet.

### Scope

- Project scaffold: Next.js App Router, TypeScript strict, Tailwind, design tokens, Prettier, ESLint, Husky/lint-staged.
- Design system implementation in code: tokens, base typography, button/card/input primitives, layout grid.
- Pages (read-only, content-driven):
  - `/` — Home with cinematic hero (R3F or Seedance loop), feature stack, products preview, solutions, metric band, blog teaser, CTA band, footer.
  - `/products` — catalog grid (filterable; data from a static or seeded source).
  - `/products/:slug` — product detail (no cart actions yet; CTA is "Request a quote").
  - `/products/category/:slug` — category page.
  - `/solutions` + `/solutions/:slug`.
  - `/about` + subpages.
  - `/contact` (form posts to `/api/contact`, sends email via Resend).
  - `/quote` (form posts to `/api/quote`, sends email).
  - `/blog` + `/blog/:slug` (MDX or DB-backed; either works for Phase 1).
  - `/support` (read-only KB) + `/support/article/:slug` + `/support/manuals` + `/support/firmware`.
  - `/legal/*` — privacy, terms, cookies, warranty, shipping & returns.
- Global header, footer, mobile drawer, command palette (`Ctrl+K`), 404 page.
- SEO: metadata API, JSON-LD per page type, `sitemap.ts`, `robots.ts`, OG image generator.
- Performance baseline: Lighthouse mobile ≥ 90 on top 5 pages.
- One R3F scene (home hero) — lazy, suspense fallback, off-screen pause.
- Seed AI assets (Seedream, Seedance) for hero, products preview, solutions, blog covers.
- Analytics: Vercel Analytics + Plausible.
- Forms: contact, quote, newsletter — Zod validated, rate-limited, email delivery.

### Out of scope (Phase 1)

- No cart, no checkout, no payment integration.
- No admin dashboard.
- No customer accounts.
- No support ticketing (KB read-only is fine).
- No customer-managed downloads or firmware history (static lists are fine).
- No IoT device features.

### Exit criteria

- Lighthouse mobile ≥ 90 on `/`, `/products`, `/products/:slug`, `/blog/:slug`, `/support/article/:slug`.
- LCP ≤ 2.5 s on regional 4G profile (WebPageTest from Dhaka or comparable).
- WCAG 2.2 AA passes axe-core on all public pages.
- All copy is real or `[BRACKETED]` — no lorem ipsum.
- Contact + quote + newsletter forms verified end-to-end with email delivery.
- One signed-off case study or featured product detail page that serves as the "premium reference" for downstream phases.

---

## Phase 2 — Product CMS / Admin

**Goal**: replace the seeded product/blog source with an admin-managed CMS, run by the ARIOT team without engineering help.

### Scope

- Database: Prisma schema for `Product`, `ProductImage`, `ProductVideo`, `ProductDownload`, `Category`, `BlogPost`, `BlogCategory`, `MediaAsset`, `Admin`, `Role`, `AuditLog`.
- Migrations + seed scripts.
- Auth for admin (Auth.js / Clerk / custom — decision made in this phase).
- RBAC: `super_admin`, `content_admin` (others reserved).
- `(admin)` route group with layout, sidebar, top bar, theme.
- Admin pages:
  - `/admin` overview with mini KPIs (content counts, recently edited).
  - Products CRUD with tabs (Details, Media, Variants, Inventory, SEO, Related, History).
  - Categories tree management.
  - Blog CRUD with rich editor + preview + scheduled publish.
  - Media library with folders, tags, upload, replace, usage map.
  - Admin user + role management.
  - Audit log viewer.
- Server actions for every mutation. Optimistic UI for low-risk updates.
- Public pages now read from the DB through cache-tagged RSC.
- Revalidation: `revalidateTag` on each entity mutation.
- Storage adapter: signed-URL uploads via S3-compatible bucket.
- ISR + on-demand revalidation wired to admin publishing.

### Out of scope (Phase 2)

- No customer accounts (admin only).
- No cart / checkout.
- No payment.
- No support tickets.

### Exit criteria

- ARIOT content team publishes a new product end-to-end without dev help.
- Catalog and blog public pages reflect admin changes within 60 s.
- Image variants serve via the configured CDN/storage path.
- Audit log shows every admin mutation with `actor`, `action`, `entityType`, `entityId`, `before`, `after`.
- Role-gated routes verified — a `content_admin` cannot reach orders or roles.

---

## Phase 3 — Ecommerce

**Goal**: enable direct B2C purchases on selected SKUs, with the regional payment ecosystem working end-to-end.

### Scope

- Customer auth (Auth.js / Clerk / custom — same provider as admin where possible).
- Customer accounts (`/account/*`): orders, addresses, downloads, profile.
- Cart:
  - Guest cart via signed cookie token; merge into user cart on auth.
  - Server actions: add, update, remove, voucher, clear.
  - Cart drawer + dedicated `/cart` page.
- Checkout single-page (contact + ship → payment → review):
  - Address with BD/SA-aware fields and validation.
  - Shipping methods + cost estimation.
  - Payment provider tabs: bKash, Nagad, SSLCommerz. Stripe scaffolded but disabled.
  - Server-authoritative totals; never trust the client.
- Order state machine: `created → awaiting_payment → paid → packed → shipped → delivered → completed` plus `cancelled`, `refunded`, `failed`.
- Stock management: decrement on `paid`, restore on `cancelled` / `refunded`. Race-safe via DB transaction.
- Transactional emails: order placed, payment received, shipped, delivered, cancelled, refunded.
- Admin order management:
  - Orders list with filters and bulk actions.
  - Order detail with state controls, payment view, shipment view, refund flow.
  - Customer detail (orders, lifetime value, ticket count).
- Webhooks for each payment provider with signature verification + idempotency keys.
- Tax & shipping zones configurable via admin.
- Currency: BDT primary, USD secondary; canonical per-cart currency.
- Vouchers / promo codes (basic).
- Quote-to-order conversion in admin (`/admin/quotes/:id` → "Convert to order").

### Out of scope (Phase 3)

- No support ticketing.
- No subscription / recurring billing.
- No multi-warehouse logistics.
- No B2B account-level pricing tiers (defer; placeholder field on customer).

### Exit criteria

- Successful end-to-end purchase via each enabled provider on staging.
- Refund flow tested per provider.
- Order emails delivered, formatted on the design system.
- Lighthouse mobile ≥ 90 on `/products/:slug` and `/cart`.
- Penetration-test pass focused on cart/checkout/auth (recommended before live).
- Admin team can fulfill an order without spreadsheet help.

---

## Phase 4 — Support / Ticket System

**Goal**: structured customer support with SLAs and self-service.

### Scope

- Database: `SupportTicket`, `TicketMessage`, `TicketEvent`, `SupportArticle`, `SupportCategory`, `SupportFeedback`.
- Public KB:
  - Search across articles, manuals, firmware.
  - Article voting ("Was this helpful?") with anonymous telemetry.
  - Suggested articles in ticket creation flow.
- Ticket flow:
  - `/support/ticket/new` (auth-prompt fallback for guests).
  - Ticket creation form: subject, related product (autocomplete), description, attachments (signed-URL uploads).
  - `/account/tickets` list and `/account/tickets/:id` thread.
  - Email notifications on create, reply, resolution.
- Admin support workspace:
  - `/admin/tickets` list with filters (status, priority, assignee, SLA).
  - Detail with internal notes, status controls, assignment, macros, SLA timer.
  - Per-team queues (`support_admin` role).
- SLA engine: priority × business-hours window; breaches flagged in admin.
- Customer satisfaction (CSAT) survey email post-resolution.

### Out of scope (Phase 4)

- No live chat.
- No phone integration.
- Inbound email parsing for ticket replies — placeholder only; full implementation deferred.

### Exit criteria

- Customer creates and resolves a ticket end-to-end.
- Admin sees SLA timer; breaches highlighted.
- Manuals and firmware downloads gated to purchasers (per-customer license check).
- KB article positively impacts deflection (tracked via feedback + ticket-volume baseline).

---

## Phase 5 — Customer Dashboard + IoT-Ready Hooks

**Goal**: the platform becomes useful *after* purchase, opening the door to IoT product features.

### Scope

- `/account/devices` — registered IoT devices list.
- Device pairing flow (QR or activation code) — placeholder UX with stubbed backend.
- Telemetry ingest endpoint at `/api/devices/telemetry` (rate-limited, signed by device cert).
- Per-device telemetry view (charts, recent events).
- Firmware OTA placeholder UI (no actual delivery yet — version listing + manual download).
- Customer notifications: device offline, firmware update available.
- Admin device management:
  - Devices list (per-customer).
  - Bulk firmware promotion (placeholder).
- B2B account features:
  - Multi-user accounts with seat roles (owner, member).
  - Account-level price tiers (activate the placeholder field from Phase 3).
- Developer portal (`/developers`) `[evaluate based on demand]`:
  - API docs.
  - SDKs index.

### Out of scope (Phase 5)

- No production OTA delivery (defer to a later, dedicated phase).
- No real-time streaming (telemetry is store-and-fetch; live channels deferred).

### Exit criteria

- A customer registers a device, sees telemetry, downloads firmware.
- Multi-user B2B account verified with role-gated views.
- Admin can promote a firmware version without redeploying the site.

---

## Cross-phase notes

- Each phase ends with a written **release note** (in `docs/RELEASES/<date>.md`, created at that time) — what shipped, what changed in the docs, what known gaps remain.
- Documentation is updated **before** crossing a phase boundary, never after.
- Tests added per phase: integration for cart and checkout (Phase 3), ticket creation (Phase 4), device registration (Phase 5). Visual regressions for the home hero and product detail page from Phase 1 onward.
- Performance budgets do not relax across phases. New features must respect them.
- Security baseline gets a dedicated review before Phase 3 (ecommerce) and Phase 5 (IoT) launch.
