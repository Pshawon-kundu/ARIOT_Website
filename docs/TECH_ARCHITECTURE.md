# TECH_ARCHITECTURE.md

How ARIOT is built. Folder structure, frontend, backend, database, admin, ecommerce, support, media, SEO, performance, security. Update this file *before* deviating from any rule it contains.

---

## 1. Final folder structure (target)

```
ariot_website/
├── AGENTS.md
├── CLAUDE.md
├── README.md
├── package.json
├── pnpm-lock.yaml
├── tsconfig.json
├── next.config.ts
├── tailwind.config.ts
├── postcss.config.mjs
├── .eslintrc.cjs
├── .prettierrc
├── .env.example
├── docs/                            # all planning + architecture docs
├── prisma/
│   ├── schema.prisma
│   ├── migrations/
│   └── seed.ts
├── public/
│   ├── favicon.ico
│   ├── icons/
│   ├── og/
│   └── media/
│       ├── home/
│       ├── products/
│       ├── solutions/
│       ├── blog/
│       └── support/
├── content/
│   ├── ai-prompts/                  # Seedream/Seedance prompts + seeds (per asset)
│   └── legal/                       # MDX of legal pages
├── app/
│   ├── layout.tsx                   # Root layout: fonts, metadata defaults, providers
│   ├── globals.css                  # Tokens + base styles
│   ├── icon.tsx
│   ├── opengraph-image.tsx
│   ├── sitemap.ts
│   ├── robots.ts
│   ├── (marketing)/
│   │   ├── layout.tsx
│   │   ├── page.tsx                 # /
│   │   ├── about/
│   │   ├── contact/
│   │   ├── quote/
│   │   ├── solutions/[slug]/
│   │   ├── products/
│   │   │   ├── page.tsx
│   │   │   ├── [slug]/page.tsx
│   │   │   └── category/[slug]/page.tsx
│   │   ├── support/
│   │   ├── blog/
│   │   ├── innovation-lab/
│   │   └── legal/
│   ├── (shop)/
│   │   ├── layout.tsx
│   │   ├── cart/page.tsx
│   │   └── checkout/
│   │       ├── page.tsx
│   │       ├── payment/[provider]/route.ts
│   │       ├── success/[orderId]/page.tsx
│   │       └── cancelled/[orderId]/page.tsx
│   ├── (account)/
│   │   ├── layout.tsx               # auth-protected
│   │   └── account/
│   │       ├── page.tsx
│   │       ├── orders/
│   │       ├── quotes/
│   │       ├── tickets/
│   │       ├── downloads/
│   │       ├── addresses/
│   │       └── profile/
│   ├── (admin)/
│   │   ├── layout.tsx               # RBAC
│   │   └── admin/
│   │       ├── page.tsx
│   │       ├── products/
│   │       ├── orders/
│   │       ├── quotes/
│   │       ├── tickets/
│   │       ├── blog/
│   │       ├── media/
│   │       ├── customers/
│   │       ├── settings/
│   │       └── analytics/
│   ├── auth/
│   │   ├── sign-in/
│   │   ├── sign-up/
│   │   ├── forgot-password/
│   │   ├── reset-password/[token]/
│   │   └── verify-email/[token]/
│   └── api/
│       ├── contact/route.ts
│       ├── quote/route.ts
│       ├── newsletter/route.ts
│       ├── cart/route.ts
│       ├── checkout/route.ts
│       ├── payments/{bkash,nagad,sslcommerz,stripe}/webhook/route.ts
│       ├── uploads/sign/route.ts
│       ├── og/route.ts
│       ├── health/route.ts
│       └── devices/telemetry/route.ts            # [future, Phase 5]
├── components/
│   ├── ui/                          # primitives (button, input, dialog, sheet, tabs, ...)
│   ├── marketing/                   # hero, feature-grid, metric-band, testimonial
│   ├── shop/                        # product-card, price, cart-line, ...
│   ├── account/                     # order-row, ticket-thread, ...
│   ├── admin/                       # data-table, kpi-card, status-chip, ...
│   ├── layout/                      # header, footer, mobile-drawer
│   ├── three/                       # R3F scenes (lazy-loaded clients)
│   ├── icons/                       # custom robotics/IoT glyphs
│   └── seo/                         # JSON-LD components, meta helpers
├── features/                        # cross-cutting domain logic
│   ├── cart/
│   ├── quote/
│   ├── checkout/
│   ├── support/
│   ├── blog/
│   ├── product/
│   └── auth/
├── server/                          # server-only modules
│   ├── db.ts                        # Prisma client singleton
│   ├── env.ts                       # Zod-validated env
│   ├── auth/
│   ├── mail/                        # Resend client + templates
│   ├── payments/{bkash,nagad,sslcommerz,stripe}/
│   ├── storage/                     # S3 adapter, signed URLs
│   ├── rate-limit/
│   ├── logger/
│   └── analytics/
├── lib/                             # framework-agnostic
│   ├── design-tokens.ts
│   ├── format/                      # currency, date, number
│   ├── validators/                  # shared Zod schemas
│   ├── seo/
│   ├── motion/
│   └── utils/
├── tests/
│   ├── unit/
│   ├── integration/
│   └── e2e/
└── scripts/
    ├── seed-products.ts
    ├── seed-blog.ts
    └── generate-og-images.ts
```

### Folder rules

- `app/` is the only place that imports from `features/`, `server/`, `components/`, `lib/`. The other folders never import from `app/`.
- `server/*` is server-only — enforce via `import 'server-only'` at the top of each module.
- `lib/*` is framework-agnostic. No React, no Next, no Prisma.
- One concern per folder. No `utils.ts` dumping grounds.

---

## 2. Frontend architecture

### 2.1 Rendering strategy

| Surface | Strategy |
|---|---|
| Marketing (home, products, solutions, about, contact) | Static + ISR (revalidate on CMS publish) |
| Product detail | Static + ISR per-slug; on-demand revalidate on admin edit |
| Catalog grid | RSC with cache tags; revalidate on product mutation |
| Blog index/post | Static + ISR |
| Support hub / article | Static + ISR |
| Cart | Streamed RSC + client islands for quantity stepper |
| Checkout | RSC layout + client islands for payment widgets |
| Account | RSC, dynamic, no cache |
| Admin | RSC, dynamic, no cache |

- **RSC by default**. Client islands for interactivity, animation, charts, R3F.
- **Server actions** for mutations (cart, quote, contact, ticket).
- **Route handlers** only for: webhooks, public APIs (telemetry), uploads, OG image, sitemap/robots.
- **Streaming** with `<Suspense>` to keep TTFB low.

### 2.2 Caching & revalidation

- `revalidateTag` on entity mutation: `product:<slug>`, `blog:<slug>`, `catalog`, etc.
- `revalidatePath` only when a path is sui generis (e.g., sitemap on bulk publish).
- `unstable_cache` (or successor) for cross-page queries.

### 2.3 State management

- Server is source of truth. Avoid client global stores except for cart UI optimism and theme.
- Forms via `react-hook-form` + Zod resolver.
- URL is the source of truth for filterable views (query params), not local state.

### 2.4 Performance budgets (mobile, regional 4G profile)

| Metric | Budget |
|---|---|
| LCP | ≤ 2.5 s |
| INP | ≤ 200 ms |
| CLS | ≤ 0.05 |
| Initial JS (gzip) | ≤ 180 KB on marketing routes |
| Initial JS (gzip) | ≤ 240 KB on shop routes |
| Hero image | ≤ 350 KB AVIF/WebP |
| Hero video loop | ≤ 1.8 MB (≤ 8 s, AV1/H.264, looped) |
| 3D hero scene polycount | ≤ 250k tris, ≤ 12 MB GLB compressed |
| Lighthouse mobile | ≥ 90 on Performance / A11y / Best Practices / SEO |

If a budget would be missed, ship a lower-fidelity variant (e.g., static hero image instead of 3D).

---

## 3. Backend / API architecture

### 3.1 Server actions vs route handlers

- **Server actions**: cart mutations, quote submission, contact form, ticket create/update, admin CRUD, profile updates.
- **Route handlers**: webhooks (payments), uploads/sign, OG image, sitemap/robots, health, IoT telemetry ingest.
- Every action and route handler:
  1. Validates input with Zod.
  2. Authenticates and authorizes.
  3. Logs an event (no PII / no secrets).
  4. Returns typed result.

### 3.2 Validation

- Co-located Zod schemas next to their handler. Cross-cutting schemas live in `lib/validators/`.
- Type inference: `type Foo = z.infer<typeof FooSchema>` — never duplicate types.

### 3.3 Errors

- Throw typed `AppError` (with `code`, `httpStatus`, safe `message`).
- A single error boundary at the route group level returns user-safe messaging.
- Server logs include the full error; the client never sees stack traces.

### 3.4 Environment

- `server/env.ts` exposes a `env` object validated at boot. Build fails if a required var is missing in production.
- Three tiers: `public` (NEXT_PUBLIC_*), `server`, `secret`. Build-time check that `secret` never leaks into client bundles.

### 3.5 Rate limiting

- Public mutating endpoints (contact, quote, newsletter, ticket-create, login, password-reset) are rate-limited.
- Adapter under `server/rate-limit/` — defaults to in-memory in dev, Upstash Redis in prod.

### 3.6 Webhooks

- Signature-verified per provider. Idempotency keys recorded in DB.
- Webhook handlers do minimum work synchronously and dispatch heavy work to a background queue (BullMQ on Redis, or simple Postgres-backed queue for Phase 1).

---

## 4. Database architecture (Prisma + PostgreSQL)

### 4.1 Conventions

- Models in `PascalCase` singular: `User`, `Product`, `OrderItem`.
- All tables include: `id` (cuid2), `createdAt`, `updatedAt`. User-facing entities also include `deletedAt` (soft delete) and `createdBy`/`updatedBy` where applicable.
- Money: `priceMinor` (BigInt) + `currency` (`BDT` | `USD`). Never floats.
- Multi-currency display: store canonical price in catalog currency; convert at render via daily FX snapshot.
- Indices on every FK and on every column used in hot `where` filters.
- Postgres extensions: `citext` for case-insensitive emails, `pg_trgm` for product/blog search.

### 4.2 Migration discipline

- All schema changes via Prisma migrations. Never hand-edit migration SQL post-merge.
- Migrations run in a transaction in dev, with explicit `BEGIN`/`COMMIT` checkpoints in prod for risky changes.
- Each migration is reviewed for: data backfill plan, downtime risk, rollback plan.

### 4.3 Connection pooling

- App connects via PgBouncer-compatible pooler (e.g., Supabase pooler, Neon serverless driver, or Prisma Accelerate).
- `prisma` client is a module-level singleton with `globalThis` guard for hot reload.

### 4.4 Search

- Phase 1: Postgres full-text + `pg_trgm` for product and blog search.
- Phase 3+: evaluate Meilisearch / Typesense if relevance becomes a bottleneck.

Full schema sketch lives in `docs/DATABASE_SCHEMA_PLAN.md`.

---

## 5. Admin dashboard architecture

- Route group `(admin)` with its own layout and middleware.
- Auth + RBAC checked in `app/(admin)/layout.tsx` server component before rendering.
- Roles: `super_admin`, `content_admin`, `support_admin`, `sales_admin`. Permission map under `server/auth/permissions.ts`.
- Server actions are guarded by a `requireRole(action)` helper that throws if the session lacks permission.
- Every mutation writes an `AuditLog` row (`actorId`, `action`, `entityType`, `entityId`, `before`, `after`, `ipHash`).
- Data tables use cursor-based pagination by default, server-side filters and sort.
- Destructive actions: confirmation modal + server-side re-verification + audit log.

Detailed page-by-page spec in `docs/ADMIN_DASHBOARD_PLAN.md`.

---

## 6. Ecommerce architecture

- Catalog read paths cache aggressively (`revalidateTag`).
- Cart server actions:
  - `addToCart`, `updateQuantity`, `removeItem`, `applyVoucher`, `clearCart`.
  - Guest cart keyed by `cartToken` cookie (HTTP-only, signed). Auth migration merges guest cart into user cart.
- Checkout state machine on the server — never trust client-supplied totals; recompute server-side.
- Payment adapters under `server/payments/<provider>/`:
  - `bkash/`, `nagad/`, `sslcommerz/` ship in Phase 3.
  - `stripe/` scaffolded with placeholder, enabled in a later phase.
  - Each provider exposes: `createIntent(order)`, `capture(intentId)`, `refund(...)`, `verifyWebhook(req)`, `mapStatus()`.
- Order state machine: `created → awaiting_payment → paid → packed → shipped → delivered → completed` plus `cancelled`, `refunded`, `failed`. State transitions happen only via documented mutations.
- Stock decrement on `paid`; restore on `cancelled` / `refunded` (race-safe via transaction).
- Transactional emails via `server/mail/templates/{order-placed, payment-received, shipped, delivered, cancelled, refunded}.tsx`.
- Currency: BDT primary; USD secondary. FX snapshot stored daily, used for display only — orders are placed in a single canonical currency per cart.

Full catalog → cart → checkout → fulfillment flow in `docs/ECOMMERCE_PLAN.md`.

---

## 7. Support system architecture

- Knowledge base content in DB (`SupportArticle`, `SupportCategory`) with MDX rendering.
- Public read paths use ISR + revalidate-on-publish.
- Tickets: `SupportTicket` + `TicketMessage` + `TicketEvent` (status changes, assignments).
- Ticket creation rate-limited; attachment uploads via signed URL, MIME + size validated server-side.
- Internal notes are a flag on `TicketMessage` (`internal: true`) — never returned to customer endpoints.
- SLA: each ticket has `slaDeadlineAt` computed from `priority` × business-hours. Breaches flagged in admin.
- Email notifications: confirmation on create, on each agent reply, on resolution. Reply-by-email handled via inbound parsing in a later phase (placeholder).

---

## 8. Media storage strategy

- **Static assets** (logos, hero stills, OG defaults) live in `public/media/...` and ship in the deployment bundle.
- **Dynamic assets** (admin-uploaded product images, blog covers, manuals, firmware) live in S3-compatible storage. Adapter under `server/storage/`.
  - Phase 1 dev: local file-system adapter under `.local/media/` (gitignored).
  - Phase 2+: DigitalOcean Spaces / Cloudflare R2 / AWS S3 — configurable via env.
- **CDN**: Cloudflare in front of bucket once Phase 2 lands. Image variants generated on demand or pre-generated by a worker (sizes: 240/480/720/1080/1440/2160 wide).
- **Uploads** always go through a signed URL; admin requests `/api/uploads/sign` with MIME and size, server validates against an allow-list, returns a pre-signed PUT URL.
- **AI assets** (Seedream/Seedance) are committed to `public/media/` once approved; their prompt + seed JSON lives at `content/ai-prompts/<asset-name>.json` for reproducibility.
- **No PII in filenames.** Random IDs only.

---

## 9. SEO strategy

- Metadata via Next.js Metadata API. Per-page `generateMetadata` helpers under `lib/seo/`.
- `app/sitemap.ts` enumerates static + dynamic routes (products, blog, solutions, support).
- `app/robots.ts` allows public marketing routes; disallows `/admin`, `/account`, `/auth`, `/api`, `/checkout`.
- Structured data (JSON-LD) via `components/seo/` components: `Organization`, `WebSite`, `BreadcrumbList`, `Product` (with `offers`, `aggregateRating`, `brand`, `gtin`), `BlogPosting`, `TechArticle`, `FAQPage`, `Service`.
- OG images generated dynamically at `app/api/og/route.ts` using design tokens (Edge runtime, `next/og`).
- Canonical URLs set on every public page. Pagination uses `rel=next/prev` via metadata.
- `hreflang` reserved for the Bangla bilingual phase — IA is structured to support `[locale]` segments without route refactor.

---

## 10. Performance strategy

- **RSC-first**, client islands only when needed.
- **next/image** everywhere, with explicit dimensions, AVIF + WebP, sized variants.
- **Fonts** loaded via `next/font` with weight subsetting and `display: swap`.
- **Edge cache** for marketing pages; node runtime for stateful routes.
- **R3F**: lazy-loaded behind `dynamic({ ssr: false })`, pause when off-screen, DPR clamp `[1, 1.75]`, polycount budget per scene.
- **Third-party scripts**: zero on first paint. Analytics via Vercel Analytics (zero-cost) + Plausible (small, deferred).
- **Bundle analysis** via `@next/bundle-analyzer` in CI; fail if marketing bundle exceeds budget.
- **Lighthouse CI** on PRs blocking merges if scores drop below 90 on top 5 pages.
- **Core Web Vitals** reported to a server endpoint via `web-vitals` for real-user monitoring.

---

## 11. Security baseline

- All env access via `server/env.ts` (Zod). No `process.env.X` scattered in code.
- All input validated with Zod at the boundary.
- RBAC at the server boundary; never trust client.
- Rate-limit public mutating endpoints.
- CSRF: rely on Next.js Server Action protections; double-submit token for raw route handlers.
- Auth: HTTP-only, Secure, SameSite=Lax cookies; rotate session secrets quarterly.
- Passwords: argon2id; password reset via single-use tokens, time-boxed.
- Uploads: signed URLs only; MIME + size validated server-side; AV scan in a later phase.
- Webhooks: signature verification, idempotency keys, replay protection (timestamp window).
- Headers (via `next.config.ts`): `Strict-Transport-Security`, `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy` minimal, `Content-Security-Policy` hardened (no unsafe-inline; nonce-based for any inline scripts).
- Logs structured (JSON) with request id; no PII, no tokens, no card data.
- Payment: never log raw payloads; never store PAN; rely on hosted provider iframes.
- Dependencies: Renovate / Dependabot enabled; weekly audit; `pnpm audit` in CI.
- Secrets in CI: GitHub Actions secrets, no committed `.env`.
- Penetration test recommended before Phase 3 (ecommerce) goes live.

---

## 12. Observability

- Structured logger in `server/logger/`. JSON logs, request id propagation.
- Metrics: Vercel Analytics for web vitals, custom server metrics via `/api/health` + a future Prometheus endpoint.
- Error tracking: Sentry (or equivalent) with PII scrubbing rules.
- Uptime monitoring: external pinger against `/api/health`.

---

## 13. CI / CD

- GitHub Actions:
  - PR pipeline: install → typecheck → lint → unit → build → bundle analyze → Lighthouse CI on preview deploy.
  - Main pipeline: same plus migration plan check + deploy.
- Preview deploys via Vercel (or comparable) per PR.
- Feature flags via env-driven toggles at first; consider a flag service in Phase 4.

---

## 14. Local development

- `pnpm dev` runs Next.js + Prisma migrate + seed.
- `pnpm prisma studio` for DB browsing.
- Docker compose file for Postgres + Redis (rate-limit + queue) — opt-in.
- `.env.example` documents every required var with comments.
