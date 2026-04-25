# AGENTS.md — Cascade Operating Manual for ARIOT

This file is the **single source of truth** for any AI coding agent (primarily Windsurf Cascade) working in this repository. Read it before every meaningful change. If anything here conflicts with a user request, surface the conflict before acting.

---

## 1. Project Identity

- **Name**: ARIOT
- **Full form**: *Autonomous Robotics and IoT*
- **Type**: Premium full-stack company website — marketing + ecommerce + admin + support + blog.
- **Quality bar**: $20,000+ studio-grade. Visual finish, motion polish, and engineering hygiene must all pass at this bar.
- **Primary market**: Bangladesh + South Asia (English primary, Bangla bilingual-ready in a later phase).
- **Currency**: BDT primary, USD secondary.
- **Funnel**: B2B quote requests + B2C direct ecommerce (dual-funnel).

---

## 2. North Star

Every change must move the site toward one or more of:

1. **Believable premium feel** — the visitor thinks "this company is serious."
2. **Technical credibility** — the site reads like a real robotics + IoT company built it.
3. **Conversion clarity** — quote, purchase, ticket, subscribe paths are obvious.
4. **Performance** — fast, fluid, accessible on mid-range mobile on regional networks.

If a change does not serve one of these, do not make it.

---

## 3. Tech Stack (target — do not assume installed yet)

- **Framework**: Next.js (App Router) + React Server Components by default.
- **Language**: TypeScript, `strict: true`, no `any` without justification.
- **Styling**: Tailwind CSS + design tokens defined in `docs/DESIGN_SYSTEM.md`.
- **UI Primitives**: shadcn/ui-style locally-owned components (no copy-paste from unrelated UI libraries).
- **Animation**: Motion (Framer Motion successor) for UI; CSS for micro-interactions.
- **3D**: React Three Fiber + drei + Three.js, lazy-loaded.
- **ORM**: Prisma.
- **Database**: PostgreSQL.
- **Validation**: Zod at every input boundary.
- **Auth**: TBD (Auth.js / Clerk / custom — decided in Phase 2).
- **Media**: S3-compatible bucket placeholder; CDN later.
- **Email**: Resend or equivalent transactional provider.

Until the project is initialized, **do not** create `package.json`, `next.config.*`, `tsconfig.json`, or any source file. Planning docs only.

---

## 4. Coding Standards

### TypeScript
- `strict: true`. No implicit `any`. No `// @ts-ignore` without an inline reason.
- Prefer `type` for unions/aliases, `interface` for extendable object shapes.
- Public functions get explicit return types. Internal helpers may infer.

### React / Next.js
- **Server Components by default.** Add `"use client"` only when the component truly needs browser-only APIs (state, refs to DOM, event handlers, animation hooks).
- Server Actions for mutations; route handlers for public APIs and webhooks.
- Co-locate route-specific UI under the route folder; shared UI lives in `components/`.

### Naming
- Files: `kebab-case.tsx` for components; the exported symbol is `PascalCase`.
- Hooks: `use-thing.ts` exporting `useThing`.
- Tests: `*.test.ts(x)` next to the unit under test.
- DB models: `PascalCase` singular (`Product`, `OrderItem`).

### Imports
- Absolute imports via `@/` alias.
- No deep relative chains (`../../../`). Refactor instead.

### Style
- 2-space indent, single quotes in TS, double quotes in JSX attributes (Prettier default).
- ESLint must pass with zero warnings before a turn ends.
- No commented-out code in committed files.

---

## 5. Architecture Rules

- App Router with **route groups**: `(marketing)`, `(shop)`, `(account)`, `(admin)`, `(api)`.
- One route folder = one screen concern. Do not stuff multiple unrelated routes in one segment.
- `features/<domain>/` for cross-cutting domain logic (e.g., `features/cart/`, `features/quote/`).
- `lib/` for framework-agnostic utilities. `server/` for server-only modules (DB clients, mailers, payment adapters).
- Never import from `app/` into `components/` or `lib/`. One-way dependency.
- API contracts live next to their handlers as Zod schemas + exported types.
- Full target structure is defined in `docs/TECH_ARCHITECTURE.md`. Update that doc before deviating.

---

## 6. UI Quality Rules

- **Tokens only.** No raw hex/rgb/hsl in components — use the tokens defined in `docs/DESIGN_SYSTEM.md` (`--bg-base`, `--steel-*`, `--cyan-*`, etc.).
- **No placeholder lorem ipsum** in any committed page that could be seen by a user. If real copy is pending, use grep-able `[BRACKETED_PLACEHOLDERS]`.
- Every section has: a clear hero intent, a primary CTA, and an honest mobile layout (not a desktop layout shrunk).
- Images always have explicit dimensions and `alt`. No layout shift.
- Buttons have hover, focus-visible, active, disabled, and loading states. No half-baked components.
- Empty, loading, and error states are **first-class**, not afterthoughts.
- Maintain a tight section rhythm — vertical spacing tokens only, no ad-hoc padding.

---

## 7. Animation Rules

- Library: Motion. Transitions use the project easing tokens (`ease-out-quart`, `ease-out-expo`).
- Default duration: 200–400 ms for UI; 600–1200 ms for hero/cinematic.
- Respect `prefers-reduced-motion` — provide a non-animated fallback for any non-decorative motion.
- Never animate `width`/`height`/`top`/`left`. Animate `transform` and `opacity`.
- Stagger reveals only when the section warrants drama (hero, product feature stacks). Do not over-stagger every list.
- No infinite background animations on mobile unless GPU-cheap and paused off-screen.

---

## 8. 3D Performance Rules (React Three Fiber)

- R3F canvases are **lazy-loaded** behind `dynamic(() => import(...), { ssr: false })`.
- Wrap with `Suspense` and a steel-skeleton fallback — never a blank gap.
- Geometry: prefer GLB with Draco/Meshopt compression. Cap polycount per hero scene at the budget set in `docs/TECH_ARCHITECTURE.md`.
- Lights: keep ≤ 3 dynamic lights per scene; bake the rest.
- Pause `useFrame` work when the canvas is off-screen (IntersectionObserver gate).
- DPR clamp: `[1, 1.75]`. No uncapped `devicePixelRatio`.
- Post-processing budget per scene: at most 2 effects (e.g., bloom + vignette). Profile before adding more.
- Never load a 3D scene above-the-fold on mobile without a low-poly fallback.

---

## 9. Security Baseline

- All env access via a typed `env.ts` (Zod-validated). No `process.env.X` scattered in code.
- Server actions and route handlers validate every input with Zod.
- RBAC checks at the **server boundary**, not the UI. Admin routes are gated server-side.
- Rate-limit public mutating endpoints (quote, contact, ticket create, login).
- CSRF: rely on Next.js Server Action protections; for raw route handlers use a double-submit token.
- No secrets in client bundles. Verify with a build-time check.
- File uploads: signed URLs only, MIME + size validated server-side.
- Logs never contain PII or tokens.
- Payment-related code never logs raw payloads.

---

## 10. File Organization Rules

- Recommended root structure lives in `docs/TECH_ARCHITECTURE.md`. Do not deviate without updating that doc first.
- One component per file. Sub-components allowed only if private to the file.
- Hard limit: **300 lines per file**. If approaching, split.
- Hard limit: **single responsibility per module.** No `utils.ts` dumping ground.
- Markdown docs live under `docs/`. Agent-instruction files (`AGENTS.md`, `CLAUDE.md`) live at repo root.

---

## 11. Testing & Build Rules

- After any non-trivial change, run (when the project is initialized): `pnpm typecheck`, `pnpm lint`, `pnpm build`. Report pass/fail.
- Critical flows (cart, checkout, quote submission, ticket creation) get integration tests.
- Visual regressions for the homepage hero and product detail page (Playwright + screenshot diff) once Phase 1 lands.
- No test deletion or weakening without explicit user direction.
- Never disable a CI check to "make it green." Fix the root cause.

---

## 12. Strict Rules (non-negotiable)

1. **No messy one-file code.** Long monoliths must be split before review.
2. **Always summarize changed files** at the end of every implementation turn — paths + 1-line "what changed."
3. **No fake dependencies.** Every imported package must be added to `package.json` in the same change. No imports from packages that do not exist.
4. **Do not overuse client components.** `"use client"` is opt-in, justified per file.
5. **No lorem ipsum in production copy.** Use `[BRACKETED_PLACEHOLDERS]` if waiting on copy.
6. **No silent destructive actions.** DB migrations, mass file deletions, or dependency upgrades must be proposed and confirmed first.
7. **Read `docs/` before coding.** If a rule is unclear, ask — do not improvise.
8. **No broken commits.** If a change leaves the build red, fix it or revert before ending the turn.
9. **No invented data.** Product specs, prices, names, and stats are either real or `[BRACKETED]` — never made up.
10. **Premium consistency.** Every new section must visually belong to the rest of the site at first glance.

---

## 13. Cascade Workflow Expectations

- **Plan first. Implement second. Summarize third.**
- One phase at a time per `docs/FEATURE_ROADMAP.md`.
- After every implementation: list changed files + 1-line description, plus any follow-ups.
- See `docs/CASCADE_WORKFLOW.md` for the full step-by-step.

---

## 14. Document Index

| Doc | Purpose |
|---|---|
| `docs/PROJECT_BRIEF.md` | Company, audience, goals |
| `docs/SITE_MAP.md` | Every route the site will eventually expose |
| `docs/DESIGN_SYSTEM.md` | Tokens, typography, components, motion grammar |
| `docs/PAGE_BLUEPRINTS.md` | Section-by-section structure of every page |
| `docs/TECH_ARCHITECTURE.md` | Folder structure, frontend/backend/db architecture |
| `docs/FEATURE_ROADMAP.md` | Phase 1–5 sequencing |
| `docs/AI_ASSET_PIPELINE.md` | Seedream/Seedance usage, naming, optimization |
| `docs/CONTENT_STRATEGY.md` | Voice, copy direction, SEO |
| `docs/DATABASE_SCHEMA_PLAN.md` | Prisma model sketch |
| `docs/ADMIN_DASHBOARD_PLAN.md` | Admin pages, RBAC, UX rules |
| `docs/ECOMMERCE_PLAN.md` | Catalog → checkout → orders flow |
| `docs/CASCADE_WORKFLOW.md` | Step-by-step agent workflow |

If a doc does not yet cover a decision needed for a change, **stop and ask** — do not improvise on premium-quality decisions.
