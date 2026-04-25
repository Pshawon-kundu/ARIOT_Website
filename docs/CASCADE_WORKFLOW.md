# CASCADE_WORKFLOW.md

How Cascade (and any compatible AI agent) should operate inside this repository, step by step. This file is short on purpose — it must be re-readable in under a minute before every implementation turn.

---

## 1. Golden Rules

1. **Plan first. Implement second. Summarize third.**
2. **Read `AGENTS.md` and the relevant `docs/*.md` before coding.** Never improvise on premium-quality decisions.
3. **One phase at a time** per `docs/FEATURE_ROADMAP.md`. Do not silently leak Phase 3 work into Phase 1.
4. **Always summarize changed files** at the end of every implementation turn.
5. **Run checks after major changes** — `pnpm typecheck`, `pnpm lint`, `pnpm build` (when project is initialized).
6. **Ask before destructive actions** — DB migrations, mass deletions, dependency upgrades, route renames.
7. **Keep the UI premium and consistent** at every step — every new section must visibly belong to the rest of the site.

---

## 2. Standard Turn

For every non-trivial user request, run this loop:

### Step 1 — Read
- Identify the relevant docs under `docs/` for the request (often: `PROJECT_BRIEF`, the page-specific blueprint, `DESIGN_SYSTEM`, `TECH_ARCHITECTURE`).
- If a needed decision is not yet documented, **stop and ask** before writing code.

### Step 2 — Plan
- Draft a short plan: files to add or change, the order, the testing approach, and any follow-ups.
- Flag any deviation from existing docs and propose updating the doc first.
- For multi-step work, post the plan to the user before executing.

### Step 3 — Implement
- Use the smallest, most focused edits that solve the problem cleanly.
- Stay within file/length limits (one component per file, ≤ 300 lines).
- Never introduce unused imports, dead code, or `any` without justification.
- Add Zod schemas at every input boundary you touch.
- Add tests for critical flows you touch.

### Step 4 — Verify
- Run the relevant subset of `pnpm typecheck`, `pnpm lint`, `pnpm test`, `pnpm build` once the project is initialized.
- For UI work, manually verify hover, focus-visible, active, disabled, loading, empty, error states.
- For 3D work, verify lazy-load, suspense fallback, off-screen pause, and DPR clamp.

### Step 5 — Summarize
- List every changed/created/deleted file with a 1-line "what changed."
- Call out any follow-ups, open questions, or known limitations.
- Note doc updates if any.

---

## 3. Hard Stops — never proceed past these without confirmation

- A user request that contradicts `AGENTS.md` or a `docs/*.md`.
- A change that would require a new top-level dependency (propose first, then add).
- A change to the database schema (always propose migration first).
- A change that would weaken or remove a test.
- A change that would commit AI-generated marketing copy without human review.
- A change that introduces a new payment provider, auth provider, or third-party SDK.
- Any "let me just do it quickly" instinct that bypasses the plan/implement/summarize loop.

---

## 4. Style of Communication

- Concise, factual, action-oriented. No filler.
- File references use the absolute-path citation style.
- Lists over walls of text. Headings for any response longer than ~10 lines.
- Honest about uncertainty — "I do not know X yet, here is how I would find out" beats a confident guess.

---

## 5. Phase Discipline

The roadmap (`docs/FEATURE_ROADMAP.md`) defines what is in scope right now. When in doubt:

- Phase 1 is **public website only**. No admin work, no DB writes from public pages, no payments.
- Phase 2 introduces the **admin CMS**. No customer-facing ecommerce yet.
- Phase 3 introduces **ecommerce**. No support tickets yet.
- Phase 4 introduces **support tickets + KB**.
- Phase 5 introduces the **customer dashboard + IoT-ready hooks**.

If a phase boundary is fuzzy, ask before crossing it.

---

## 6. Premium Consistency Checklist (run mentally before signing off any UI work)

- Are all colors token-driven? (no raw hex / rgb / hsl)
- Is the type ramp from the project pair only?
- Do spacings sit on the 8-pt scale?
- Do all interactive elements have hover, focus-visible, active, disabled, loading?
- Are empty/loading/error states present?
- Does the section visually belong to the rest of the site?
- Does the page work and look correct at 360 px, 768 px, 1024 px, 1440 px, 1920 px?
- Does motion respect `prefers-reduced-motion`?
- Are images dimensioned, alt-tagged, and in modern formats?
- Does the page hit Lighthouse mobile ≥ 90 on Performance, Accessibility, Best Practices, SEO?

If any answer is "no," the work is not done.

---

## 7. End-of-Turn Template

Every implementation turn ends with a summary like:

```
## Changed files

- `app/(marketing)/page.tsx` — added hero section + CTA stack
- `components/marketing/hero.tsx` — new, premium hero with R3F lazy mount
- `lib/seo/metadata.ts` — added home metadata helper
- `docs/PAGE_BLUEPRINTS.md` — clarified hero CTA hierarchy

## Checks

- pnpm typecheck: PASS
- pnpm lint: PASS (0 warnings)
- pnpm build: PASS

## Follow-ups

- Replace `[HERO_HEADLINE]` placeholder with real copy once approved.
- Generate Seedance hero loop and place at `public/media/home/hero-loop-21x9.mp4`.
```

This format is non-negotiable.
