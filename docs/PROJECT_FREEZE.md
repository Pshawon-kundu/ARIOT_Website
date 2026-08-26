# PROJECT_FREEZE.md

**Purpose**: Formally declares the planning phase complete and freezes the architecture. This file is the gate between planning and implementation. Any future agent must read this file before making structural changes.

**Usage**: When an architectural change is needed during implementation, update this file FIRST, get user approval, then implement. Do not silently change architecture.

---

## Planning Status

| Area | Status | Date |
|------|--------|------|
| **Planning** | ✅ APPROVED | 2026-07-02 |
| **Implementation** | 🟢 READY TO START | — |
| **Architecture** | 🔒 FROZEN | 2026-07-02 |
| **Business Requirements** | 🔒 FROZEN | 2026-07-02 |
| **Database Planning** | 🔒 FROZEN | 2026-07-02 |
| **Information Architecture** | 🔒 FROZEN | 2026-07-02 |
| **Design System** | 🔒 FROZEN | 2026-07-02 |
| **Implementation Master Plan** | 🔒 FROZEN | 2026-07-02 |

---

## Allowed Changes

| Change Type | Allowed | Notes |
|-------------|---------|-------|
| **Implementation** | ✅ Yes | Building features per the master plan |
| **Bug fixes** | ✅ Yes | Fixing broken code, typos, logic errors |
| **Documentation corrections** | ✅ Yes | Fixing typos, clarifying ambiguous text |
| **Minor CSS/spacing adjustments** | ✅ Yes | Within design system tokens |
| **New Zod schemas** | ✅ Yes | At new input boundaries |
| **New components** | ✅ Yes | Per existing patterns and design system |
| **Package updates** | ⚠️ Minor only | Patch/minor updates; major updates need approval |

---

## Forbidden Changes

| Change Type | Allowed | Notes |
|-------------|---------|-------|
| **Architecture redesign** | ❌ No | Changing folder structure, rendering strategy, or component architecture |
| **Database redesign** | ❌ No | Changing model structure, removing/renaming models, altering relationships |
| **Business requirement changes** | ❌ No | Adding features, changing scope, modifying success criteria |
| **Design system rewrite** | ❌ No | Changing tokens, typography, color palette, component API |
| **New top-level dependencies** | ❌ No | Adding packages not in the master plan without approval |
| **Phase boundary crossing** | ❌ No | Building Phase 3 features during Phase 1 without explicit approval |
| **Removing tests** | ❌ No | Tests may only be added, never removed or weakened |
| **Disabling CI checks** | ❌ No | If a check fails, fix the root cause |

---

## Architecture Freeze Declaration

This file declares that the following documents represent the **final, approved architecture** for the ARIOT project:

1. `docs/00_PROJECT_OVERVIEW.md` — Business context and goals
2. `docs/01_BUSINESS_REQUIREMENTS.md` — Functional and non-functional requirements
3. `docs/TECH_ARCHITECTURE.md` — Technical architecture and folder structure
4. `docs/DATABASE_SCHEMA_PLAN.md` — Data model sketch
5. `docs/DESIGN_SYSTEM.md` — Visual and motion grammar
6. `docs/SITE_MAP.md` — Route enumeration
7. `docs/PAGE_BLUEPRINTS.md` — Section-by-section page structures
8. `docs/FEATURE_ROADMAP.md` — Phase 1–5 sequencing and exit criteria
9. `docs/05_IMPLEMENTATION_MASTER_PLAN.md` — 240-step implementation roadmap

**Any future architectural change must:**
1. Update the relevant document(s) above
2. Document the change in `docs/09_CHANGELOG.md`
3. Record the decision in `docs/07_DECISIONS.md`
4. Get explicit user approval before implementation

---

## Implementation Rules

1. **One phase at a time.** Complete Phase 1 fully before starting Phase 2.
2. **Follow the master plan.** Execute steps in order unless the dependency graph allows parallelism.
3. **Verify after every step.** Run `pnpm typecheck && pnpm lint` after non-trivial changes.
4. **Update progress.** Mark completed steps in `docs/06_PROGRESS_LOG.md`.
5. **Log decisions.** Record any new decision in `docs/07_DECISIONS.md`.
6. **Track issues.** Add discovered issues to `docs/08_KNOWN_ISSUES.md`.
7. **No scope creep.** Do not add features not in the master plan.
8. **Premium quality.** Every change must pass the $20K+ studio-grade bar.

---

**Freeze Date**: 2026-07-02
**Frozen By**: User approval (planning review)
**Last Updated**: 2026-07-02
