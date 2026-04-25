# ARIOT

Premium full-stack site for **ARIOT — Autonomous Robotics and IoT**. This README covers local setup only. **All product, design, and architecture decisions live in `docs/`** — read those before making non-trivial changes.

## Prerequisites

- Node.js **≥ 20** (developed on 24).
- pnpm **≥ 10** — install with `iwr https://get.pnpm.io/install.ps1 -useb | iex` on Windows or `corepack enable` on Unix.
- Git.

## Quickstart

```bash
pnpm install
cp .env.example .env.local
pnpm dev
```

The site runs at `http://localhost:3000`.

## Scripts

| Command | Purpose |
|---|---|
| `pnpm dev` | Local dev server (webpack runtime, port 3000). |
| `pnpm build` | Production build. |
| `pnpm start` | Run the production build locally. |
| `pnpm lint` | ESLint flat config across the repo, max-warnings 0. |
| `pnpm typecheck` | `tsc --noEmit` against the strict `tsconfig.json`. |
| `pnpm format` | Prettier write across all source files. |

## Stack

- **Next.js 16** (App Router, RSC by default, webpack runtime in dev)
- **React 19**
- **TypeScript 5** (strict)
- **Tailwind CSS v4** — tokens declared in `app/globals.css` via `@theme inline`. There is **no** `tailwind.config.ts`.
- **ESLint v9** flat config (`eslint.config.mjs`)
- **Prettier 3** + Tailwind class sort
- **Zod 4** for boundary validation
- **react-hook-form** + `@hookform/resolvers` for client form state
- **Motion** (Framer Motion successor) for UI animation
- **Lucide** icons
- **@vercel/analytics** for privacy-respecting RUM

Why webpack over Turbopack: stability for the foundation work. We will revisit Turbopack once Phase 1 is signed off.

## Project layout (Phase 1 scaffold)

```
ariot_website/
├── AGENTS.md, CLAUDE.md      # AI agent operating manuals — protected
├── docs/                     # Product / design / architecture truth source — protected
├── app/                      # Next.js App Router routes
├── lib/                      # Framework-agnostic utilities (cn, design tokens, motion, seo)
├── server/                   # Server-only modules (env validation lives here)
├── public/                   # Static assets
└── eslint.config.mjs, ...    # Tooling
```

The full target structure is described in `docs/TECH_ARCHITECTURE.md`.

## Design tokens

Every visual decision is grounded in `docs/DESIGN_SYSTEM.md`. Tokens are declared once as CSS custom properties in `app/globals.css` and bridged to Tailwind utilities through Tailwind v4's `@theme inline` directive. `lib/design-tokens.ts` mirrors the same values for TypeScript consumers (motion configs, future R3F materials, charts).

**Never use raw hex / rgb / hsl in component code.** Use Tailwind utilities or `var(--token)`.

## Environment variables

See `.env.example`. All env access is funneled through the Zod-validated `server/env.ts` module — never read `process.env` directly in source. A missing or malformed env is a boot-time error, by design.

## Phase 1 sub-turn pacing

The Phase 1 scaffold is delivered in five reviewable sub-turns. The current state of this repo represents **Sub-turn 1** only:

1. **Sub-turn 1** (current) — project init, dependencies, design tokens, root layout, env validation, SEO foundation, tooling.
2. **Sub-turn 2** — UI primitives, layout shell (header / footer / drawer), error and not-found surfaces.
3. **Sub-turn 3** — marketing blocks and the home page, with hero placeholder.
4. **Sub-turn 4** — remaining public routes (products, solutions, support, blog, about, legal) with placeholder content.
5. **Sub-turn 5** — forms (contact / quote / newsletter) with client validation and stub server handlers; sitemap, robots, JSON-LD; final a11y + Lighthouse sweep.

Sub-turns are not started without explicit approval from the project owner.

## Cascade workflow

This repository is built in close partnership with Cascade (Windsurf AI). The agent operates under the rules in `AGENTS.md` and the workflow in `docs/CASCADE_WORKFLOW.md`. Read those before requesting changes that involve the agent.
