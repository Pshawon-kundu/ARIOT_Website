# DESIGN_SYSTEM.md

The visual and motion grammar of ARIOT. Every UI decision must reference this file. If a value (color, spacing, type, easing, radius) is not in here, **add it here first** before using it in code.

---

## 1. Brand Direction — Premium Dark Robotics

ARIOT's visual language is built on three ideas:

1. **Engineered precision** — micro-grids, tight spacing, monospaced specs, blueprint annotations. The site looks like it was made by engineers who care.
2. **Cinematic depth** — near-black backgrounds with controlled light, soft cyan glows, subtle steel reflections, optional 3D moments. Rooms with atmosphere, not flat panels.
3. **Calm confidence** — large, breathable hero areas; no shouting; restraint over decoration. Premium = quiet.

**One-line aesthetic**: *electric-cyan signal on graphite + brushed steel, lit like a clean industrial workshop at night.*

---

## 2. Color Tokens

All colors are exposed as CSS custom properties on `:root`. Tailwind reads them via the theme config. **Never use raw hex/rgb/hsl in components.**

### 2.1 Background scale

| Token | Hex | Use |
|---|---|---|
| `--bg-base` | `#08090B` | Page background, default canvas |
| `--bg-raised` | `#0E1014` | Card/section background one step above base |
| `--bg-elevated` | `#15181E` | Modals, popovers, hover surfaces |
| `--bg-overlay` | `rgba(8,9,11,0.72)` | Scrim under modals/drawers |
| `--bg-grid` | `rgba(255,255,255,0.04)` | Subtle micro-grid overlays |

### 2.2 Steel neutral scale (foreground + borders)

| Token | Hex | Use |
|---|---|---|
| `--steel-50` | `#F5F7FA` | Pure inverse text on cyan/white surfaces (rare) |
| `--steel-100` | `#E4E8EE` | Primary text on dark |
| `--steel-200` | `#C7CDD6` | Secondary text |
| `--steel-300` | `#A3ABB7` | Tertiary text, muted labels |
| `--steel-400` | `#7C8593` | Placeholder, disabled text |
| `--steel-500` | `#5B6472` | Quiet icons |
| `--steel-600` | `#3F4753` | Strong borders |
| `--steel-700` | `#2A3038` | Default borders, divider |
| `--steel-800` | `#1B1F25` | Subtle borders, raised border |
| `--steel-900` | `#11141A` | Inset shadows, deep wells |

### 2.3 Electric cyan (signature accent)

| Token | Hex | Use |
|---|---|---|
| `--cyan-300` | `#7CE9FF` | Hover/active glow |
| `--cyan-400` | `#3DD8F7` | Default accent (links, focus, primary CTA bg) |
| `--cyan-500` | `#10B6D9` | Pressed accent, deeper accent |
| `--cyan-600` | `#0C8DAA` | Accent on light surfaces (rare) |
| `--cyan-glow` | `0 0 24px rgba(61,216,247,0.45)` | Premium glow shadow utility |
| `--cyan-faint` | `rgba(61,216,247,0.08)` | Tinted backgrounds, chips |

### 2.4 Semantic states

| Token | Hex | Use |
|---|---|---|
| `--success` | `#34D399` | Success surfaces and text |
| `--warning` | `#F5B449` | Warning |
| `--danger` | `#F26B6B` | Errors, destructive actions |
| `--info` | `--cyan-400` | Informational states (alias) |

Each semantic color also has `-bg` (10% alpha tint) and `-border` (30% alpha) helpers.

### 2.5 Contrast rules

- Body text on `--bg-base` uses `--steel-100` (≥ 14:1 contrast).
- Secondary text uses `--steel-200` minimum (≥ 9:1).
- Disabled/placeholder text uses `--steel-400` and is never the only signal.
- Cyan-on-base must use `--cyan-400` or lighter for text (≥ 7:1).
- Never place cyan text on a cyan-tinted background.

---

## 3. Typography

### 3.1 Type families

| Role | Family | Fallback |
|---|---|---|
| Display & UI | **Space Grotesk** | `system-ui, sans-serif` |
| Body | **Inter** | `system-ui, sans-serif` |
| Technical / Specs / Code | **JetBrains Mono** | `ui-monospace, Menlo, monospace` |

All three load via `next/font` with `display: swap`, `preload: true` for the hero subset only, and weight subsetting (display 500/600/700, body 400/500/600, mono 400/500).

### 3.2 Type ramp

| Token | Size / Line-height | Weight | Tracking | Use |
|---|---|---|---|---|
| `--text-display-1` | 80 / 88 | 600 | -0.025em | Hero headline (desktop) |
| `--text-display-2` | 64 / 72 | 600 | -0.02em | Section hero |
| `--text-display-3` | 48 / 56 | 600 | -0.02em | Page title |
| `--text-h1` | 40 / 48 | 600 | -0.015em | Subsection |
| `--text-h2` | 32 / 40 | 600 | -0.01em | Block title |
| `--text-h3` | 24 / 32 | 600 | -0.005em | Card title |
| `--text-h4` | 20 / 28 | 600 | 0 | Small heading |
| `--text-body-lg` | 18 / 28 | 400 | 0 | Lead paragraph |
| `--text-body` | 16 / 24 | 400 | 0 | Default body |
| `--text-body-sm` | 14 / 20 | 400 | 0 | Secondary copy |
| `--text-caption` | 12 / 16 | 500 | 0.04em | UPPERCASE labels, eyebrow |
| `--text-mono-sm` | 13 / 20 | 500 | 0 | Spec table, code |
| `--text-mono-md` | 15 / 24 | 500 | 0 | Inline mono |

Mobile shrinks: display tokens scale to (60/56/40/32/28/24) with the same weights.

### 3.3 Type rules

- One display family role per page (no mixing Space Grotesk + another display).
- Mono is reserved for: spec tables, file paths, code, numeric SKUs/serial numbers, blueprint labels.
- Eyebrows / kickers are `--text-caption`, uppercase, `--cyan-400`, letter-spaced.
- Optical alignment for hero headlines — use `text-balance` and `text-wrap: balance` where supported.
- Body line length: 60–75 characters. Hero subhead: 45–60 characters.

---

## 4. Spacing System

8-pt base scale. Tokens in `rem` (root font-size = 16 px).

| Token | Value | Use |
|---|---|---|
| `--space-0` | 0 | Reset |
| `--space-1` | 0.25rem (4) | Hairline |
| `--space-2` | 0.5rem (8) | Tight inline |
| `--space-3` | 0.75rem (12) | Compact stack |
| `--space-4` | 1rem (16) | Default stack |
| `--space-5` | 1.5rem (24) | Comfortable stack |
| `--space-6` | 2rem (32) | Block separator |
| `--space-7` | 3rem (48) | Section internal |
| `--space-8` | 4rem (64) | Section separator (mobile) |
| `--space-9` | 6rem (96) | Section separator (desktop) |
| `--space-10` | 8rem (128) | Major section break |
| `--space-11` | 12rem (192) | Page-defining break |

### 4.1 Layout constants

- Container max-width: `1280px`.
- Wide-container max-width: `1440px` for hero/marketing only.
- Content max-width (prose): `72ch`.
- Gutter: `--space-5` mobile / `--space-7` desktop.
- Section vertical padding: `--space-9` desktop, `--space-7` mobile.
- Sticky header height: `72px` desktop, `60px` mobile.

### 4.2 Section rhythm

- Every page alternates between `--bg-base` and `--bg-raised` sections (subtle), never two raised sections back-to-back.
- Hero section uses `--bg-base` plus a controlled gradient or 3D scene; never a flat raised panel.
- Vertical padding tokens only; no ad-hoc margins.

---

## 5. Radius, Border, Elevation

| Token | Value | Use |
|---|---|---|
| `--radius-sm` | 6px | Inputs, chips |
| `--radius-md` | 10px | Buttons, small cards |
| `--radius-lg` | 14px | Cards, dialogs |
| `--radius-xl` | 20px | Hero cards, feature panels |
| `--radius-2xl` | 28px | Showcase tiles |
| `--radius-full` | 9999px | Pills, avatars |

### Borders

- Default border: `1px solid var(--steel-700)`.
- Strong border: `1px solid var(--steel-600)`.
- Hairline divider: `1px solid var(--steel-800)`.
- Cyan focus border: `1px solid var(--cyan-400)`.

### Elevation (subtle, never neon-card territory)

| Token | Value |
|---|---|
| `--shadow-1` | `0 1px 2px rgba(0,0,0,0.45)` |
| `--shadow-2` | `0 4px 12px rgba(0,0,0,0.45)` |
| `--shadow-3` | `0 12px 32px rgba(0,0,0,0.55)` |
| `--shadow-cyan` | `0 0 24px rgba(61,216,247,0.35)` |
| `--shadow-inset` | `inset 0 1px 0 rgba(255,255,255,0.04)` |

The `inset` highlight is critical to the "brushed-steel" feel — use it on cards and buttons.

---

## 6. Buttons

Three variants. Each has 5 states: default, hover, active, focus-visible, disabled. Plus a sixth: loading.

### 6.1 Primary — Cyan signal

- Background: `--cyan-400`.
- Text: `--bg-base`.
- Border: `1px solid transparent`.
- Hover: background lifts to `--cyan-300` + `--shadow-cyan`.
- Active: background drops to `--cyan-500`.
- Focus-visible: 2 px `--cyan-300` outline offset 2 px.
- Disabled: 40% opacity, no shadow, no hover.
- Loading: spinner replaces icon; text dims to 70%.

### 6.2 Secondary — Steel ghost

- Background: transparent.
- Text: `--steel-100`.
- Border: `1px solid --steel-600`.
- Hover: background `--bg-elevated`, border `--steel-500`.
- Active: background `--bg-raised`.
- Focus-visible: cyan outline.
- Disabled: 40% opacity.

### 6.3 Tertiary — Inline link

- Background: none.
- Text: `--cyan-400`.
- Hover: text `--cyan-300`, underline (`text-underline-offset: 4px`, decoration cyan).
- Focus-visible: cyan outline rounded.

### 6.4 Sizes

- `sm` — height 32, padding-x 12, `--text-body-sm`.
- `md` — height 40, padding-x 16, `--text-body`.
- `lg` — height 48, padding-x 20, `--text-body-lg`.
- `xl` — height 56, padding-x 24, `--text-body-lg` (hero CTA).

### 6.5 Icon rules

- Icons always paired with `aria-label` or visible text.
- Icon-only buttons must be ≥ 40 px tap target.
- Icon size: 16 px in `sm/md`, 18 px in `lg`, 20 px in `xl`.

---

## 7. Cards

Three card flavors. Mix at most two on a single page.

### 7.1 Steel card (default)

- Background: `--bg-raised`.
- Border: `1px solid --steel-700`.
- Inset highlight: `--shadow-inset`.
- Radius: `--radius-lg`.
- Hover (when interactive): border `--steel-600`, lift `--shadow-2`, subtle cyan ring `--cyan-faint`.

### 7.2 Glass card (sparingly — hero, feature highlights)

- Background: `linear-gradient(180deg, rgba(255,255,255,0.04), rgba(255,255,255,0.01))`.
- Backdrop-filter: `blur(20px) saturate(140%)`.
- Border: `1px solid rgba(255,255,255,0.06)`.
- Radius: `--radius-xl`.

### 7.3 Holo card (premium product showcase only)

- Background: `--bg-raised` with cyan radial wash at 8% alpha behind product image.
- Border: gradient `linear-gradient(135deg, --cyan-400, --steel-700)` 1 px (use `border` + mask trick).
- Subtle moving gradient shimmer on hover (≤ 4 s loop, paused off-screen).

---

## 8. Forms

- Inputs: `--bg-elevated` background, `--steel-700` border, `--steel-100` text, `--steel-400` placeholder.
- Focus: border `--cyan-400`, ring `0 0 0 3px var(--cyan-faint)`.
- Error: border `--danger`, helper text `--danger`.
- Labels: `--text-body-sm`, `--steel-200`, mandatory dot `--cyan-400`.
- Helper text: `--text-caption`, `--steel-300`.
- Inputs have explicit height: `40px sm`, `48px md` (default).
- Multi-step forms (checkout, quote) use a top progress indicator with 3 dots max.
- Validation triggers on blur for first attempt; on change after first error.

---

## 9. Section Layout Rules

Every page is composed of **sections**. Each section has:

1. **An eyebrow** (caption-cyan), 2–4 words.
2. **A title** (display-2 or display-3 size).
3. **A subhead** (body-lg, ≤ 60 chars).
4. **A body** — content area.
5. **A CTA strip** (when relevant).
6. **A separator** — vertical spacing tokens, never `<hr>`.

### 9.1 Allowed section types

- `hero` — large, cinematic, one per page.
- `feature-grid` — 2/3/4-up product or capability cards.
- `feature-stack` — alternating image/text rows.
- `metric-band` — 3–6 large numbers, mono digits, `--cyan-400` highlight.
- `media-showcase` — full-width video or image with overlay.
- `cta-band` — single big CTA centered, on `--bg-raised`.
- `logo-strip` — partner/customer logos at 60% opacity, hover to 100%.
- `testimonial` — large quote, photo, name, role.
- `faq` — accordion of questions.
- `comparison-table` — spec table with mono digits.
- `timeline` — vertical timeline with cyan markers.
- `tabbed-detail` — tabs over a content area (used in product detail).

### 9.2 Don't

- Don't put two `cta-band`s on the same page.
- Don't stack three `feature-grid`s in a row — break with another type.
- Don't use full-bleed media on mobile without a contained fallback.

---

## 10. 3D Section Design Rules

The site uses **at most three** R3F scenes per page (typically one). Each scene must:

- Live in a dedicated client component, dynamically imported with `ssr: false`.
- Have a non-3D fallback (a still hero image or video poster) for users with reduced motion or low-power mode.
- Render only when in the viewport (IntersectionObserver gate around `useFrame`).
- Use camera moves driven by scroll on the hero (parallax-like) and by hover/cursor inside product showcase.
- Lights: 1 key, 1 fill, 1 rim — all baked into the scene file. Real-time only when interaction demands.
- Materials: PBR with a hint of cyan rim light. Avoid emissive overload.
- Always provide a way out: ESC closes any 3D modal, scroll past stops animation.

---

## 11. Animation Grammar

### 11.1 Easing tokens

| Token | Curve |
|---|---|
| `--ease-out-quart` | `cubic-bezier(0.25, 1, 0.5, 1)` |
| `--ease-out-expo` | `cubic-bezier(0.19, 1, 0.22, 1)` |
| `--ease-in-out-cubic` | `cubic-bezier(0.65, 0, 0.35, 1)` |
| `--ease-spring-soft` | spring(stiffness 180, damping 24) |
| `--ease-spring-snap` | spring(stiffness 320, damping 28) |

### 11.2 Duration tokens

| Token | Value |
|---|---|
| `--dur-1` | 120ms (hover, micro) |
| `--dur-2` | 200ms (default UI) |
| `--dur-3` | 320ms (drawer, modal) |
| `--dur-4` | 480ms (section reveal) |
| `--dur-5` | 800ms (hero element) |
| `--dur-6` | 1200ms (cinematic) |

### 11.3 Patterns

- **Hover lift**: `translateY(-2px)` + `shadow-2` over `--dur-2 / --ease-out-quart`.
- **Section reveal**: 16 px y-translate + opacity 0→1 over `--dur-4 / --ease-out-expo`, staggered children at 60 ms intervals (max 6 children).
- **Hero entry**: title fade-up 24 px over `--dur-5`, subhead 100 ms later, CTAs 200 ms later.
- **Drawer/modal**: `translateX(100%)→0` (drawer), opacity + scale 0.96→1 (modal), `--dur-3 / --ease-out-quart`.
- **3D camera dolly**: scroll-driven, `lerp(0.08)` smoothing.

### 11.4 Don't

- Don't animate `width/height/top/left`. Use `transform`.
- Don't auto-loop infinite background motion on mobile.
- Don't stagger more than 6 items — diminishing returns and feels gimmicky.

---

## 12. Iconography & Imagery

- **Icons**: Lucide (default), with custom robotics/IoT glyphs added under `components/icons/` using the same stroke (1.5 px).
- **Illustrations**: blueprint-style line drawings, one accent color (cyan), monoline 1.5 px stroke.
- **Photography**: dim, dramatic, top/side rim lighting in cyan or warm steel; no flat product shots on white backgrounds for hero/feature imagery (those are reserved for spec tables).
- **AI-generated visuals**: see `docs/AI_ASSET_PIPELINE.md`. Hero imagery prefers Seedream + Seedance; product spec sheets prefer real photography or precise renders.

---

## 13. Mobile Design Rules

- Mobile-first sizing for every component.
- Tap target ≥ 44 px (Apple HIG) / 48 px (Material) — we use **48 px** as the floor.
- Sticky bottom CTA on product detail and pricing-aware screens (do not block content).
- Swipe gestures only as enhancement, never as the only path.
- Mobile nav: full-height drawer, large tap targets, primary CTA pinned at bottom.
- Hero on mobile drops 3D in favor of static cinematic image + optional Seedance loop.
- Tables collapse to stacked card layout below 640 px.

---

## 14. Accessibility Rules (WCAG 2.2 AA baseline)

- Color contrast: text 4.5:1 minimum, UI 3:1 minimum.
- Focus-visible on every interactive element — cyan ring, never `outline: none` without replacement.
- Keyboard reachable: tab order matches visual order; skip-to-content link on every page.
- ARIA only when semantic HTML is insufficient; never duplicate.
- Forms: every input has a label (visible or `aria-label`), every error is announced.
- Motion: `prefers-reduced-motion: reduce` disables non-essential animations.
- Media: alt text on every image; captions on every spoken video; transcripts on educational/long videos.
- Live regions on cart updates and form errors.
- Heading order: never skip levels.

---

## 15. Token Implementation (forward-looking note)

When the project is initialized:

- All tokens above land in `app/globals.css` under `:root` (and `[data-theme="light"]` later if needed).
- Tailwind config consumes them through `theme.extend.colors`, `theme.extend.fontSize`, `theme.extend.spacing`, `theme.extend.borderRadius`.
- Components reference Tailwind utilities exclusively. Never inline styles. Never raw hex.
- A `lib/design-tokens.ts` re-exports tokens for TS consumers (charts, R3F scenes, motion configs).

This file is the **only source of truth**. If something visual feels off in code review, ask: *did we add it to `DESIGN_SYSTEM.md` first?* If not, add it here, then ship.
