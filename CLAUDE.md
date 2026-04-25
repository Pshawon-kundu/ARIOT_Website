# CLAUDE.md — Claude Compatibility Notes

Companion to `AGENTS.md`. When Claude (or another non-Cascade agent) is invoked in this repo, read **both** files. Where they conflict, `AGENTS.md` wins.

---

## Project Overview

ARIOT — *Autonomous Robotics and IoT* — is a premium full-stack company website built for Bangladesh and South Asia, with global readiness baked in. The site combines a marketing front-end, B2C ecommerce, a B2B quote-request funnel, customer support, a blog/innovation lab, and a private admin dashboard.

- **Aesthetic**: premium dark — near-black/graphite base, brushed-steel neutrals, electric-cyan signature accent, cinematic hero treatments, optional R3F-powered 3D moments.
- **Currency**: BDT primary, USD secondary.
- **Payments (planned)**: bKash, Nagad, SSLCommerz placeholders; Stripe-ready scaffolding for later international rollout.
- **Quality bar**: $20,000+ studio-grade.

---

## Commands (will exist after Phase 1 init — do not run before then)

| Command | Purpose |
|---|---|
| `pnpm install` | Install dependencies |
| `pnpm dev` | Start the Next.js dev server |
| `pnpm build` | Production build |
| `pnpm start` | Run the production build locally |
| `pnpm lint` | ESLint with zero-warning policy |
| `pnpm typecheck` | `tsc --noEmit` |
| `pnpm test` | Unit + integration tests (Vitest) |
| `pnpm e2e` | Playwright end-to-end |
| `pnpm prisma migrate dev` | Apply DB migrations in dev |
| `pnpm prisma studio` | Browse the DB locally |
| `pnpm seed` | Seed local DB with dev fixtures |

Until project initialization, none of these exist. **Do not invent flags or run commands speculatively.**

---

## Expected Stack

- Next.js (App Router, RSC-first)
- TypeScript (strict)
- Tailwind CSS + design tokens
- shadcn/ui-style, locally-owned components
- Motion (animations)
- React Three Fiber + drei + Three.js (3D, lazy-loaded)
- Prisma + PostgreSQL
- Zod (validation everywhere)
- Auth: TBD (Auth.js / Clerk / custom)
- Email: Resend (or equivalent transactional provider)
- Storage: S3-compatible (DigitalOcean Spaces / Cloudflare R2 / AWS S3)
- Analytics: Vercel Analytics + Plausible (privacy-first)
- Payments: bKash, Nagad, SSLCommerz adapters; Stripe later

---

## Code Style

- 2-space indent, single quotes in TS, ESLint + Prettier enforced.
- File naming: `kebab-case.tsx`; exported symbol `PascalCase`.
- Hooks: `use-thing.ts` exporting `useThing`. Server-only modules: `*.server.ts` when ambiguity is possible.
- Imports via `@/` alias. No deep relative paths.
- Public functions: explicit return types.
- No `any` without an inline justification.
- No commented-out code on commit-equivalent actions.

---

## Component Rules

- **Server Components by default.** Mark `"use client"` only when interactivity, browser APIs, refs, or animation hooks demand it.
- One component per file, ≤ 300 lines.
- Props are typed with named interfaces. No inline anonymous prop types longer than 3 keys.
- Every interactive component has hover, focus-visible, active, disabled, loading variants.
- Forms use `react-hook-form` + Zod resolver.
- Error boundaries at route-group granularity.
- Suspense boundaries around any async server boundary so the UX never goes blank.

---

## UI / UX Rules

- Mobile-first. Test 360 px width before signing off any page.
- Design tokens only — never raw color literals (see `docs/DESIGN_SYSTEM.md`).
- Spacing on the 8-pt scale. Typography from the project pair only (display geometric sans + technical mono).
- Animations honor `prefers-reduced-motion`.
- Empty / loading / error states ship with every data-driven component.
- Accessibility: WCAG 2.2 AA minimum. Keyboard reachable, visible focus, semantic HTML, alt text, ARIA only where needed.
- No autoplay audio. Video autoplay only when muted, looped, and `playsInline`.
- Maintain a believable section rhythm — every page reads like one document.

---

## Database Rules

- All schema changes via Prisma migrations. No raw SQL in app code unless wrapped in a reviewed adapter.
- Soft-delete (`deletedAt`) on user-facing entities (`Product`, `BlogPost`, `Order`).
- Audit columns on every table: `createdAt`, `updatedAt`, `createdBy?`, `updatedBy?` where applicable.
- Indices on every foreign key and on every column used in a `where` filter at scale.
- Multi-currency price stored as `priceMinor` (integer, smallest unit) + `currency` (ISO 4217). **Never** floats for money.
- Seeds are idempotent. Re-running `pnpm seed` does not duplicate.
- Soft-delete records still respect FK integrity in queries — always filter `deletedAt: null` in default scopes.

---

## Admin Dashboard Rules

- Route group `(admin)` with its own layout, navigation, and middleware.
- RBAC roles: `super_admin`, `content_admin`, `support_admin`, `sales_admin`. Role check on the server.
- Data tables: paginated, sortable, filterable. No client-side full dataset loads.
- Destructive actions require explicit confirmation modals + server-side re-verification.
- Optimistic UI for low-risk updates (toggle published, reorder); pessimistic for money/stock-affecting ones.
- Every admin mutation writes to an `AuditLog` row.

---

## Ecommerce Rules

- Catalog supports variants, multi-image, multi-video, downloads, spec table, related products.
- Cart persists for guests (cookie-keyed) and migrates on auth.
- Checkout is single-page, three logical sections (contact + ship, payment, review).
- Payment providers are pluggable adapters under `server/payments/<provider>/`. bKash, Nagad, SSLCommerz placeholders ship first; Stripe adapter scaffolded for later.
- Orders move through documented states (see `docs/ECOMMERCE_PLAN.md`). State changes are server-authoritative and logged.
- Stock decrements on order confirmation, restores on cancellation. Race-safe via DB transaction.
- Transactional emails for: order placed, payment received, shipped, delivered, cancelled, refunded.
- Currency selector shows BDT first, USD second; price stored canonical and converted at render.

---

## AI Asset Rules

- Image generation via **Seedream**; video via **Seedance**. See `docs/AI_ASSET_PIPELINE.md`.
- Naming: `<area>-<subject>-<variant>-<aspect>.<ext>` — e.g., `home-hero-robotic-arm-21x9.webp`.
- Format: AVIF or WebP for stills; MP4 (H.264) + WebM (AV1) for video, with poster frames.
- Optimize before commit: hero ≤ 350 KB, product render ≤ 220 KB, blog thumb ≤ 120 KB at sign-off resolution.
- Storage layout: `public/media/<area>/...` for static; CDN bucket for variant pyramids once Phase 3 lands.
- Save source prompts and seeds in `content/ai-prompts/<asset-name>.json` for reproducibility.
- No AI-generated text shipped without human review and edit.

---

## Build / Check Rules

- Never end a turn with a red `pnpm typecheck`, `pnpm lint`, or `pnpm build`.
- Run the relevant subset after each meaningful change. For doc-only changes, run a markdown linter if available; otherwise skip.
- Report results explicitly: pass/fail and noteworthy warnings.
- Never disable a check or mute an error to ship.
- A red Lighthouse below the agreed budgets (see `docs/TECH_ARCHITECTURE.md`) is treated as a failure on Phase 1+ work.

---

## When in Doubt

1. Re-read `AGENTS.md`.
2. Re-read the most relevant doc under `docs/`.
3. Ask the user. Do not improvise on premium-quality decisions.
