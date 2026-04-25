# AI_ASSET_PIPELINE.md

How ARIOT uses **Seedream** (image) and **Seedance** (video) to produce premium, on-brand visuals at scale. This file is the source of truth for prompts, naming, aspect ratios, optimization, storage, and reproducibility.

---

## 1. Principles

1. **AI is a tool, not a shortcut.** Every asset is reviewed by a human before commit. AI never replaces engineering precision (real product photography wins for spec sheets); AI excels at hero atmosphere, conceptual diagrams, ambient loops.
2. **Brand consistency over novelty.** Every asset must look like it belongs to the same site. Codify that consistency via a small set of **prompt presets** under `content/ai-prompts/_presets.json`.
3. **Reproducibility.** Every committed asset has a sibling JSON in `content/ai-prompts/<asset-name>.json` containing prompt, negative prompt, seed, model/version, and timestamp. Anyone should be able to regenerate.
4. **No AI-generated text** ships without a human edit.
5. **Performance non-negotiable.** No matter how beautiful, an asset that breaks the page-weight budget gets re-encoded or replaced.

---

## 2. Where AI assets are used vs. where they are not

| Surface | AI? | Tool | Notes |
|---|---|---|---|
| Home hero background | Yes | Seedance loop OR R3F scene | If Seedance: 8 s loop, poster image, dark cinematic |
| Section accent imagery | Yes | Seedream | abstract robotic / IoT compositions |
| Solutions hero | Yes | Seedream | industry-specific scene (warehouse, farm, city) |
| Blog covers | Yes | Seedream | one consistent style — see Preset A |
| OG images (default) | Programmatic | `next/og` | rendered with design tokens — not AI |
| Product hero shots | Mixed | Real photo or precision render | AI only for non-existent prototypes; flagged as `[CONCEPT]` |
| Spec/technical diagrams | **No** | Hand-drawn line art or precise SVG | accuracy required |
| Manuals / setup imagery | **No** | Real photo or precise render | accuracy required |
| Support article inline | Sometimes | Seedream for conceptual; real screenshots otherwise | |
| Team photos | **No** | Real photography only | |
| Testimonials | **No** | Real customer photo + quote | trust matters |

---

## 3. Seedream (image) usage

### 3.1 Use cases

- Home hero (alternative to R3F or in tandem as poster).
- Solution / industry hero illustrations.
- Blog post covers (one preset for series consistency).
- Section accents (conceptual robotics + IoT moods).
- Concept renders for prototype products (clearly badged `[CONCEPT]` in copy).
- Background textures (subtle micro-grids, brushed-steel surfaces) — used at low opacity.

### 3.2 Brand prompt presets

Keep three master presets, named and version-controlled in `content/ai-prompts/_presets.json`. Every asset prompt **extends** a preset — never starts from scratch.

**Preset A — Cinematic Robotics (Hero)**
- Mood: dim industrial workshop at night; dramatic top-side rim lighting; cool cyan accents on graphite metals; thin volumetric fog; razor-sharp focus on subject.
- Avoid: cartoon, plasticky, flat lighting, oversaturated colors, neon overload, text, watermarks, hands clipping, generic stock-photo people.

**Preset B — Conceptual IoT (Editorial)**
- Mood: clean, editorial, minimal; small device on dark surface with hairline grid; one dramatic cyan light source; long shadow; technical-blueprint feel.
- Avoid: clutter, bright daylight, white background, multiple competing colors.

**Preset C — Industry Scene (Wide)**
- Mood: real-world deployment context — warehouse, farm at dusk, city utility, classroom — with a single ARIOT product subtly integrated; cinematic color grade; cyan signal lights as the only saturated cue.
- Avoid: branded products from other companies, identifiable logos, faces close-up (privacy + trust).

### 3.3 Aspect ratios

| Aspect | Where | Pixel target |
|---|---|---|
| 21:9 | Cinematic hero | 2520 × 1080 |
| 16:9 | Default landscape (blog covers, section accents) | 1920 × 1080 |
| 4:5 | Portrait blog cover, mobile hero | 1080 × 1350 |
| 1:1 | Card thumbnail | 1080 × 1080 |
| 9:16 | Mobile-vertical accent | 1080 × 1920 |

Always generate at the native target — never upscale for hero use.

### 3.4 Output formats

- Master saved as PNG or high-quality JPG at native resolution in `content/ai-source/<asset-name>/master.<ext>` (gitignored — large).
- Site-ready exports: AVIF (primary) + WebP (fallback). PNG/JPG only when transparency or specific compatibility demands it.
- `next/image` handles responsive variants at runtime; prepare master at the largest target.

### 3.5 File budgets

| Asset class | Sign-off resolution | Max file size |
|---|---|---|
| Hero (21:9) | 2520 × 1080 | 350 KB AVIF |
| Section accent (16:9) | 1920 × 1080 | 250 KB AVIF |
| Blog cover (16:9) | 1600 × 900 | 180 KB AVIF |
| Product render (1:1) | 1200 × 1200 | 220 KB AVIF |
| Mobile hero (4:5) | 1080 × 1350 | 220 KB AVIF |

Larger than budget → re-encode (squoosh, cwebp, avifenc) before commit.

---

## 4. Seedance (video) usage

### 4.1 Use cases

- Home hero ambient loop (when not using R3F).
- Solutions hero ambient context.
- Product detail explainer loops (8–12 s).
- Section accents (silent, looped micro-clips).
- Blog feature embed (when relevant; rare).

### 4.2 Style discipline

- Camera moves slow (≤ 0.6 m/s simulated). No jitter, no whip pans.
- Cinematic color grade matches Seedream presets — graphite + cyan accents.
- Subjects move naturally; mechanical parts respect physics; no impossible deformations.
- No text overlays inside the video — text is overlaid in HTML.
- Loop seamless: end frame = start frame.

### 4.3 Aspect ratios

| Aspect | Where |
|---|---|
| 21:9 | Hero loop (desktop) |
| 16:9 | Section / product loop |
| 9:16 | Mobile vertical accent |
| 1:1 | Mobile hero fallback |

### 4.4 Output formats

- **Primary**: MP4 (H.264, yuv420p) for broad compatibility.
- **Modern**: WebM (AV1) for browsers that support it — set as `<source type="video/webm">` first.
- **Poster**: AVIF/WebP frame extracted from second 0.5 (avoids first-frame flicker).
- Always set `muted`, `loop`, `playsInline`, `autoplay` only when muted, and `preload="metadata"`.

### 4.5 File budgets

| Asset class | Length | Resolution | Max size (combined H.264 + AV1) |
|---|---|---|---|
| Hero loop (21:9) | 6–10 s | 1920 × 824 | 1.8 MB |
| Section loop (16:9) | 4–8 s | 1280 × 720 | 1.2 MB |
| Product explainer (16:9) | 10–15 s | 1280 × 720 | 2.4 MB |
| Mobile vertical (9:16) | 4–8 s | 720 × 1280 | 1.2 MB |

Run through `ffmpeg` with two-pass + CRF tuning until under budget.

---

## 5. Naming convention

Every asset uses this exact pattern:

```
<area>-<subject>-<variant>-<aspect>.<ext>
```

- **`<area>`**: top-level surface — `home`, `products`, `solutions`, `blog`, `support`, `about`, `og`, `shared`.
- **`<subject>`**: subject — `hero`, `factory-arm`, `farm-drone`, `iot-gateway`, `lab-portrait`.
- **`<variant>`**: variant index or descriptor — `01`, `02`, `dark`, `wide`, `night`.
- **`<aspect>`**: aspect descriptor — `21x9`, `16x9`, `4x5`, `1x1`, `9x16`.
- **`<ext>`**: `avif`, `webp`, `mp4`, `webm`, `jpg` (rare).

**Examples**

```
home-hero-robotic-arm-01-21x9.avif
home-hero-robotic-arm-01-21x9.mp4
home-hero-robotic-arm-01-21x9.webm
home-hero-robotic-arm-01-poster-21x9.avif
solutions-smart-factory-01-16x9.avif
products-precision-arm-px3-explainer-16x9.mp4
blog-iot-in-bd-feature-01-16x9.avif
```

Lowercase, kebab-case, ASCII only. No spaces, no underscores.

---

## 6. Storage layout

### 6.1 Public, ship-with-deploy assets (`public/media/`)

```
public/
└── media/
    ├── home/
    │   ├── home-hero-robotic-arm-01-21x9.avif
    │   ├── home-hero-robotic-arm-01-21x9.webp
    │   ├── home-hero-robotic-arm-01-21x9.mp4
    │   ├── home-hero-robotic-arm-01-21x9.webm
    │   └── home-hero-robotic-arm-01-poster-21x9.avif
    ├── products/
    │   └── precision-arm-px3/
    │       ├── products-precision-arm-px3-hero-1x1.avif
    │       └── products-precision-arm-px3-explainer-16x9.mp4
    ├── solutions/
    │   └── smart-factory/
    ├── blog/
    │   └── iot-in-bd/
    └── support/
        └── (rare; KB images usually live in DB-backed media library)
```

### 6.2 Admin-uploaded assets (Phase 2+)

- Stored in S3-compatible bucket via `server/storage/`.
- Public assets served via CDN URL recorded in `MediaAsset.cdnUrl`.
- Private assets (firmware, customer-only manuals) served via short-lived signed URLs.

### 6.3 Source masters (NOT committed)

- Live under `content/ai-source/<asset-name>/` (this folder is gitignored).
- Used to re-export at any time without regenerating from the AI tool.
- Backed up to a private bucket after any major asset session.

### 6.4 Prompt + seed records (committed)

```
content/
└── ai-prompts/
    ├── _presets.json
    ├── home-hero-robotic-arm-01.json
    ├── solutions-smart-factory-01.json
    └── blog-iot-in-bd-feature-01.json
```

Each JSON:

```json
{
  "tool": "SEEDREAM",
  "preset": "A",
  "prompt": "<full prompt>",
  "negativePrompt": "<full negative prompt>",
  "seed": "1234567890",
  "params": { "model": "<model+version>", "steps": 30, "guidance": 6.5 },
  "aspect": "21x9",
  "output": "public/media/home/home-hero-robotic-arm-01-21x9.avif",
  "approvedBy": "[REVIEWER]",
  "approvedAt": "2026-04-25T15:00:00Z"
}
```

For Seedance, add `lengthSeconds`, `fps`, `motionPrompt`.

---

## 7. Optimization workflow

For every committed image:

1. Generate / receive master at native target resolution.
2. Run perceptual sharpen if needed (≤ 0.3 amount).
3. Encode AVIF (`avifenc -q 50`) → check size.
4. Encode WebP (`cwebp -q 80`) → check size.
5. If either exceeds budget, lower quality 5 points until under.
6. Verify visual quality at 1×, 2×, and on a real device.
7. Commit AVIF + WebP + (optional) JPG fallback.
8. Add the prompt JSON.

For every committed video:

1. Trim to target length, ensure seamless loop.
2. Encode H.264 two-pass (`-b:v` tuned to target size) → MP4.
3. Encode AV1 two-pass → WebM.
4. Extract poster from second 0.5 → AVIF/WebP.
5. Verify autoplay-muted-looped behavior on mobile (iOS Safari + Android Chrome).
6. Commit MP4 + WebM + poster.
7. Add the prompt JSON (Seedance).

---

## 8. Accessibility

- Every image element gets meaningful `alt` text — never `alt=""` for content images. Decorative-only images use `alt=""` *and* `role="presentation"`.
- Every video has a poster, plays muted, has captions when speech is present.
- Provide a non-animated fallback (poster) for users with `prefers-reduced-motion: reduce`.

---

## 9. Review & sign-off

Before any AI asset hits `main`:

- A human reviewer confirms: brand-consistent, no spelling artifacts, no third-party logos, no people whose likeness rights aren't cleared, no biased imagery.
- File budget verified.
- Prompt + seed JSON committed alongside.
- Image alt text or video caption written and committed.
- The asset is referenced from a real component (no orphans in `public/`).

---

## 10. Future enhancements

- Variant pyramid generator script: takes a master and emits AVIF/WebP at 240/480/720/1080/1440/2160 widths to a CDN bucket.
- Automated visual diff: compare new hero asset against the previous to flag drift from preset style.
- Per-locale prompt overrides once Bangla bilingual content lands.
