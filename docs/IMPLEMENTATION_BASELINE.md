# IMPLEMENTATION_BASELINE.md

**Purpose**: Snapshot of the project state at the moment implementation begins. Every future AI agent reads this file first to understand what exists, what's installed, and what's ready.

**Usage**: Update this file only when a significant infrastructure change occurs (new dependency, framework upgrade, Node version change, new branch strategy). Do NOT update for routine code changes.

**Last Updated**: 2026-07-10 (pre-auth cleanup; supersedes the 2026-07-08 closeout snapshot for Phase 2 progress and config notes).

---

## Project Identity

| Field | Value |
|-------|-------|
| **Name** | ARIOT (*Autonomous Robotics and IoT*) |
| **Version** | 0.1.0 |
| **Private** | true |
| **Quality Bar** | $20,000+ studio-grade website |

---

## Framework & Runtime

| Tool | Version | Notes |
|------|---------|-------|
| **Next.js** | 16.2.4 | App Router, React Server Components |
| **React** | 19.2.4 | Server Components by default |
| **TypeScript** | ^5 | `strict: true` (zero `any` in hand-written code) |
| **Tailwind CSS** | ^4 | CSS-based config (no tailwind.config.ts) |
| **ESLint** | ^9 | Flat config (`eslint.config.mjs`), `--max-warnings 0` |
| **Prettier** | ^3.8.3 | With tailwindcss plugin |
| **Node.js** | >=20 (engine) | `.nvmrc` present; local runtime 24.x |
| **pnpm** | 10.33.2 | Package manager |

---

## Key Dependencies

### Runtime

| Package | Version | Purpose | Status |
|---------|---------|---------|--------|
| next | 16.2.4 | Framework | Installed |
| react / react-dom | 19.2.4 | UI | Installed |
| zod | ^4.3.6 | Validation at every boundary | Installed |
| motion | ^12.38.0 | Animations | Installed + USED (`command-palette.tsx`) |
| @hookform/resolvers | ^5.2.2 | Zod resolver for RHF | Installed |
| react-hook-form | ^7.73.1 | Form handling | Installed |
| lucide-react | ^1.11.0 | Icons | Installed |
| clsx / tailwind-merge | ^2.1.1 / ^3.5.0 | Class utilities | Installed |
| class-variance-authority | ^0.7.1 | Component variants | Installed |
| @radix-ui/react-slot | ^1.2.4 | Component composition | Installed |
| @vercel/analytics | ^2.0.1 | Analytics | Installed |
| @react-three/fiber | ^9.6.1 | 3D (R3F) | Installed |
| @react-three/drei | ^10.7.7 | 3D helpers | Installed |
| three / @types/three | ^0.185.1 / ^0.185.0 | 3D engine | Installed |
| resend | ^6.16.0 | Email delivery | Installed |
| @mdx-js/loader / @mdx-js/react / @next/mdx | ^3.1.1 / ^3.1.1 / ^16.2.10 | MDX content | Installed |
| remark-gfm / rehype-slug | ^4.0.1 / ^6.0.0 | MDX pipeline (GFM unused - see note) | Installed (remark-gfm not wired) |
| prisma / @prisma/client | ^7.8.0 | ORM + client | Installed |
| @prisma/adapter-pg / pg | 7.8.0 / 8.22.0 | Prisma 7 PostgreSQL runtime adapter | Installed |

### Dev

| Package | Version | Purpose |
|---------|---------|---------|
| typescript | ^5 | Type checking |
| eslint / eslint-config-next | ^9 / 16.2.4 | Linting |
| eslint-config-prettier | ^10.1.8 | Prettier compat |
| prettier / prettier-plugin-tailwindcss | ^3.8.3 / ^0.7.3 | Formatting |
| @tailwindcss/postcss | ^4 | PostCSS integration |
| @next/bundle-analyzer | ^16.2.10 | Bundle analysis |
| husky / lint-staged | ^9.1.7 / ^17.0.8 | Pre-commit |
| @types/node / @types/react / @types/react-dom | ^20 / ^19 / ^19 | Types |

### NOT Yet Installed (needed for later phases)

| Package | Phase | Purpose |
|---------|-------|---------|
| better-auth | 2 | Authentication (decision D-035; supersedes D-034/Auth.js; makes ARIOT's custom `User`/`Session` field names work via Prisma adapter `modelName`/`fields` mapping) |
| recharts | 5 | Sensor data charts |
| Stripe / bKash / Nagad / SSLCommerz SDKs | 3 | Regional payments (adapters scaffolded in plan) |

---

## Git State

| Field | Value |
|-------|-------|
| **Branch** | `main` |
| **Last commit** | `4461301` - `docs: add AI_ASSET_REQUIREMENTS` |
| **Working tree** | Uncommitted Phase 1 + Phase 2.1 work; closeout changes pending commit |

---

## Build Status

| Check | Status | Notes |
|-------|--------|-------|
| **Typecheck** | PASS | `tsc --noEmit` - zero errors. `pnpm typecheck` may fail in non-TTY shells before running because pnpm asks to reconcile `node_modules`. |
| **Lint** | PASS | `eslint . --max-warnings 0` - zero warnings. `pnpm lint` has the same possible non-TTY pnpm blocker. |
| **Build** | PASS | `next build` - 48 routes. `pnpm build` has the same possible non-TTY pnpm blocker. |
| **Prisma** | PASS | `prisma validate` + `prisma generate` pass. `db seed` was verified during Step 2.1.5, not rerun during pre-auth cleanup. |
| **Lighthouse / axe-core / Rich Results** | NOT RUN | No local CLI; asserted via code analysis only (I-016) |
| **Live email delivery** | NOT RUN | Requires `RESEND_API_KEY`; dev stub logs instead |

---

## Implementation Metrics

| Metric | Value |
|--------|-------|
| **Total TypeScript/TSX files** | ~137 (incl. ~28 generated Prisma client files) |
| **Phase 1 steps completed** | 74 of 74 (100%) |
| **Phase 2 steps completed** | 9 of original 43 (21%) + corrective C.1 and C.2 complete. Step 2.4.3 final closure complete (2026-07-26): shared authorization orchestration factory, test-only wrapper removed, denied-write DB test, API security contract. 117 tests pass. Next: Step 2.4.4 (Product editor Media tab). |
| **Phases 3-5** | Not started (0%) |
| **Overall project completion** | ~20% (Phase 1 = full public MVP; 4 phases remaining) |

---

## Project Structure Summary

```
app/
  (marketing)/       # All public pages: home, products (catalog+detail+category),
                     #   solutions (index+detail), blog (index+post), about, contact,
                     #   quote, support (hub+article+manuals+firmware), legal (layout+5)
  api/                # 4 API routes: contact, newsletter, quote, og (Edge)
  layout.tsx          # Root layout (imports env)
  error.tsx           # Error boundary
  not-found.tsx       # 404 page
  globals.css         # Design tokens
  robots.ts / sitemap.ts

components/
  layout/             # site-header, site-footer, mobile-drawer, nav-link, command-palette
  marketing/          # hero-shell, feature-grid, feature-stack, cta-band, metric-band, etc.
  seo/                # 9 JSON-LD structured data components
  three/              # r3f-wrapper, hero-scene, hero-3d-client (3D hero system)
  ui/                 # button, card, input, label, select, textarea, etc.

lib/
  design-tokens.ts    # Color, spacing, typography tokens (mirror of globals.css)
  motion/tokens.ts    # Easing, duration tokens
  seo/                # metadata.ts (per-page-type variants), site.ts
  validators/         # Zod schemas (contact, quote, newsletter, common)
  utils/              # cn.ts, slugify.ts
  analytics.ts        # typed trackEvent

features/
  forms/              # contact-form, quote-form, newsletter-form, use-form-submit, form-status
  blog/ solutions/ support/   # seed _data.ts
  analytics/          # product-grid-tracker, product-view-tracker

server/
  env.ts              # Zod-validated env (DATABASE_URL optional at boot; typed DB helper)
  db.ts               # Prisma singleton with @prisma/adapter-pg
  rate-limit.ts       # in-memory fixed-window limiter (10 req/min/IP)
  mail/               # client.ts + templates/

prisma/
  schema.prisma       # 18 models; init migration + auth migration + corrective C.2 applied (3 total)
  seed.ts             # seeds roles, admin, categories, products, posts, media
  migrations/         # 20260707160338_init, 20260710081202_auth_better_auth_foundation, corrective_c2_drop_search_vectors

docs/                 # 22 planning + tracking documents
content/              # MDX (3 blog + 3 support) + ai-prompts JSON
public/media/         # SVG placeholder assets
tests/                # 7 test files: permission-evaluator, product-details-validation, product-save-queue, product-auth-wrapper, product-api-route-security, product-editor-integration, product-denied-write (117 total tests)
```

---

**Baseline Date**: 2026-07-02 (original) - **Regenerated**: 2026-07-26 (Step 2.4.3 final closure)
