# AI_ASSET_REQUIREMENTS.md

Every Seedream/Seedance asset slot the ARIOT site needs across Phase 1 marketing surfaces and Phase 2+ ecommerce/account/admin surfaces, with full direction (style, camera, lighting, mood, aspect, resolution, format), production-priority tiers, optimization rules, and a final folder structure.

This is the **what** companion to `docs/AI_ASSET_PIPELINE.md` (the **how**). Cross-references throughout point at `docs/AI_ASSET_PIPELINE.md`, `docs/DESIGN_SYSTEM.md`, `docs/PAGE_BLUEPRINTS.md`, and `docs/CONTENT_STRATEGY.md`. No prompts are written here — prompts live next to each generated asset under `content/ai-prompts/<asset-name>.json` per `AI_ASSET_PIPELINE §6.4`.

---

## 0. How to read this document

- **Asset ID** follows the pipeline-mandated pattern `<area>-<subject>-<variant>-<aspect>.<ext>` (kebab-case, ASCII, lowercase). See `docs/AI_ASSET_PIPELINE.md §5`.
- **Tool** column: `SEEDREAM` (image), `SEEDANCE` (video), or `REAL` (real photo / programmatic) when AI is explicitly disallowed by the pipeline (team photos, spec diagrams, manuals, OG, testimonials).
- **Preset** column references the three master presets defined in `AI_ASSET_PIPELINE §3.2`:
  - **A — Cinematic Robotics (Hero)** — dim industrial workshop, top/side rim, cyan accents on graphite, volumetric fog.
  - **B — Conceptual IoT (Editorial)** — clean editorial dark surface, hairline grid, single dramatic cyan light, long shadow.
  - **C — Industry Scene (Wide)** — real-world deployment context with a single ARIOT product subtly integrated.
- **Aspect / pixel target** rows obey the table in `AI_ASSET_PIPELINE §3.3`. We never upscale for hero use.
- Every committed asset must ship with: AVIF + WebP exports (images), MP4 (H.264) + WebM (AV1) + AVIF poster (videos), prompt/seed JSON sibling, and meaningful `alt` text.

---

## 1. Homepage assets — `/`

The homepage already implements (see `app/(marketing)/page.tsx`): hero, capability strip, 4-card product preview, 5-card solutions grid, 3-row engineering pillars feature-stack, metric band, 3-card blog teasers, final CTA band. Each visual slot maps to an asset family below.

### 1.1 Hero (image + video pair)

| ID | Tool | Preset | Aspect | Pixel target | Output | Style | Camera | Lighting | Mood |
|---|---|---|---|---|---|---|---|---|---|
| `home-hero-cinematic-arm-01-21x9` | SEEDREAM | A | 21:9 | 2520 × 1080 | AVIF + WebP | Hero still — 6-axis robotic arm mid-motion in a dim workshop, a single cyan signal LED flaring on the wrist, brushed-steel gantry behind | 35 mm equiv, ¾ angle, slight low-angle for authority | Top-back rim in cool cyan (`--cyan-400`), warm fill at 25% from camera-left, volumetric fog catching the rim | Graphite + brushed steel; only saturated cue is cyan signal; deep `--bg-base` shadows |
| `home-hero-cinematic-arm-01-21x9` | SEEDANCE | A | 21:9 | 1920 × 824 | MP4 (H.264) + WebM (AV1) | 8 s seamless loop — same scene, arm completes one slow pick-and-place arc, end frame = start frame; cyan LED breathes once | Slow dolly forward 0.4 m/s, no whip pans | Match still — animate fog drift only | Same as still |
| `home-hero-cinematic-arm-01-poster-21x9` | SEEDANCE (extracted) | A | 21:9 | 1920 × 824 | AVIF | Frame extracted from second 0.5 of the loop | — | — | — |
| `home-hero-cinematic-arm-01-9x16` | SEEDREAM | A | 9:16 | 1080 × 1920 | AVIF + WebP | Mobile vertical of the same scene, recomposed; arm fills upper third, brushed-steel floor anchors lower third | Same lens, taller crop | Same | Same |

Notes:
- Hero is the single biggest brand statement. Per `AGENTS.md §6`, no R3F yet, so the hero stays as still + Seedance loop until the R3F replacement lands.
- Mobile drops the loop in favor of the still + 9:16 variant per `DESIGN_SYSTEM §13`.

### 1.2 Capability strip background (optional ambient)

| ID | Tool | Preset | Aspect | Pixel target | Output | Style | Camera | Lighting | Mood |
|---|---|---|---|---|---|---|---|---|---|
| `home-trust-strip-bg-01-16x9` | SEEDREAM | B | 16:9 | 1920 × 1080 | AVIF + WebP | Hairline brushed-steel surface with ultra-subtle micro-grid, used at 8% opacity behind capability labels | Top-down macro | Single cyan grazing light, 30° from horizontal | Almost-black; cyan only as a 4% wash |

This asset is optional — current implementation uses `LogoStrip` text-only.

### 1.3 Product showcase preview tiles (4 cards, 1:1)

The four `FeatureCard` tiles in `_home-content.PRODUCTS` need a square ambient image behind/above each icon.

| ID | Tool | Preset | Aspect | Pixel target | Output | Subject |
|---|---|---|---|---|---|---|
| `home-product-floor-robot-01-1x1` | SEEDREAM | B | 1:1 | 1080 × 1080 | AVIF + WebP | Low puck-form floor robot, single cyan status ring, rim-lit on dark tile floor with vanishing micro-grid |
| `home-product-safety-device-01-1x1` | SEEDREAM | B | 1:1 | 1080 × 1080 | AVIF + WebP | Wall-mounted safety node, satin-white front bezel, cyan LED ring, blueprint annotation hairlines around device |
| `home-product-appliance-control-01-1x1` | SEEDREAM | B | 1:1 | 1080 × 1080 | AVIF + WebP | Compact in-wall controller module beside a translucent energy-readout card, cyan trace lines suggesting current flow |
| `home-product-custom-rd-01-1x1` | SEEDREAM | B | 1:1 | 1080 × 1080 | AVIF + WebP | Open lab bench: PCB mid-assembly, oscilloscope trace cyan-on-black, neat cable management |

All four use **Preset B** so they read as a coherent editorial set — the visual hint is "engineered object on dark editorial surface" repeated four times.

### 1.4 Solutions visuals (5 cards on home, 1:1)

Same surface logic — square tiles, cyan signal, dark base. Maps 1-to-1 with `_home-content.SOLUTIONS`. These tiles are reused at smaller sizes on the solutions index until each gets its own scene (§3).

| ID | Tool | Preset | Aspect | Pixel target | Subject |
|---|---|---|---|---|---|
| `home-solution-homes-01-1x1` | SEEDREAM | B | 1:1 | 1080 × 1080 | Living-room corner at night, soft cyan LED on a wall-mounted device, no people |
| `home-solution-offices-01-1x1` | SEEDREAM | B | 1:1 | 1080 × 1080 | Empty SME office desk, cyan air-quality reading visible on small puck device |
| `home-solution-institutions-01-1x1` | SEEDREAM | B | 1:1 | 1080 × 1080 | Robotics lab tabletop, neatly arranged controller + sensor modules, cyan annotation arrows |
| `home-solution-industries-01-1x1` | SEEDREAM | B | 1:1 | 1080 × 1080 | Small-batch production cell at dusk, conveyor + sensor station, cyan beacon |
| `home-solution-custom-01-1x1` | SEEDREAM | B | 1:1 | 1080 × 1080 | Whiteboard with crisp engineering sketch + a single PCB on the desk, cyan marker accents |

### 1.5 Engineering pillars visuals (3 stack rows, 16:9)

Each `FeatureStack` row needs a media tile sized to a wide-format card.

| ID | Tool | Preset | Aspect | Pixel target | Subject |
|---|---|---|---|---|---|
| `home-engineering-navigation-01-16x9` | SEEDREAM | A | 16:9 | 1920 × 1080 | Top-down floor plan of a real room with a robot path traced in cyan, raised obstacles, top-side rim light |
| `home-engineering-embedded-01-16x9` | SEEDREAM | B | 16:9 | 1920 × 1080 | Macro PCB shot, ICs labeled with hairline blueprint callouts, cyan trace highlighted, shallow DoF |
| `home-engineering-iot-01-16x9` | SEEDREAM | C | 16:9 | 1920 × 1080 | Wide composition: small device on table foreground, distant workshop bokeh, cyan link-status arc connecting to off-frame infrastructure |

### 1.6 Blog teaser thumbnails (3 cards, 16:9)

Same look as the homepage's `BLOG_TEASERS`. Generated with the **blog Preset A variant** (see §5) so the homepage previews and the actual blog covers stay visually unified.

| ID | Tool | Preset | Aspect | Pixel target | Subject |
|---|---|---|---|---|---|
| `home-blog-rd-01-16x9` | SEEDREAM | A | 16:9 | 1920 × 1080 | Lab-floor close-up — robot arm joint with engineering tape and hand-written annotation, cyan rim |
| `home-blog-iot-bd-01-16x9` | SEEDREAM | C | 16:9 | 1920 × 1080 | South-Asian rooftop antenna installation at dusk, cyan signal beacon, wide cinematic |
| `home-blog-tutorials-01-16x9` | SEEDREAM | B | 16:9 | 1920 × 1080 | Editorial flat-lay: notebook, tools, microcontroller dev kit, cyan grid undertone |

### 1.7 CTA band backgrounds

The final CTA band (`<CtaBand>`) currently uses tokens only. A subtle ambient asset gives the band its premium hero closer.

| ID | Tool | Preset | Aspect | Pixel target | Subject |
|---|---|---|---|---|---|
| `home-cta-final-bg-01-21x9` | SEEDREAM | A | 21:9 | 2520 × 1080 | Wide ambient — lab horizon line at night, cyan glow recedes into fog, used at 35–50% opacity behind text |

Optional sister asset:
| `home-cta-final-bg-01-9x16` | SEEDREAM | A | 9:16 | 1080 × 1920 | Mobile vertical of the same composition |

---

## 2. Product page assets — `/products` and `/products/[slug]`

Catalog page needs minimal media (it's filter-driven). Each detail page gets a **full kit**. The 6 placeholders live in `app/(marketing)/products/_data.ts`.

### 2.0 Catalog index (`/products`)

| ID | Tool | Preset | Aspect | Pixel target | Subject |
|---|---|---|---|---|---|
| `products-index-hero-bg-01-21x9` | SEEDREAM | A | 21:9 | 2520 × 1080 | Wide ambient — receding shelves of devices in shallow rim light, used at low opacity |
| `products-index-hero-loop-01-16x9` | SEEDANCE | A | 16:9 | 1280 × 720 | Optional 6 s parallax loop of the same shelf scene, very slow lateral dolly |

### 2.1 Per-product asset kit (template applied to each of 6 SKUs)

Every product detail page gets the following ten asset slots (full kit, no exceptions). Names follow `products-<slug>-<role>-<variant>-<aspect>.<ext>`.

| Role | Description | Aspect | Pixel target | Tool | Preset |
|---|---|---|---|---|---|
| `hero` | Primary gallery hero — single product, dramatic studio lighting | 4:5 | 1080 × 1350 | SEEDREAM | A |
| `hero-wide` | Wide hero variant for `tabbed-detail` overview tab | 21:9 | 2520 × 1080 | SEEDREAM | A |
| `front` | Pure front orthographic-style render | 1:1 | 1200 × 1200 | SEEDREAM | B |
| `side` | Side profile render | 1:1 | 1200 × 1200 | SEEDREAM | B |
| `top` | Top-down render | 1:1 | 1200 × 1200 | SEEDREAM | B |
| `iso` | ¾ isometric render | 1:1 | 1200 × 1200 | SEEDREAM | B |
| `feature-XX` | 2–3 feature closeups (LiDAR turret, mounting plate, port detail, etc.) | 16:9 | 1920 × 1080 | SEEDREAM | A or B |
| `app-mockup` | Companion-app screen mocked into a phone frame on a dark surface | 9:19.5 | 1080 × 2340 (in 16:9 stage) | SEEDREAM (composited) | B |
| `exploded` | Exploded-view render with cyan annotation arrows + monospace labels | 16:9 | 1920 × 1080 | SEEDREAM | A |
| `loop` | Seedance product loop for the gallery video tab | 16:9 | 1280 × 720 | SEEDANCE | A |
| `loop-poster` | Poster extracted from the loop | 16:9 | 1280 × 720 | SEEDANCE (extracted) | — |

Per-product specifics below.

### 2.2 Product 1 — `autonomous-floor-cleaning-robot`

Concept SKU. All renders are flagged `[CONCEPT]` per `AI_ASSET_PIPELINE §2` until real prototype photography exists.

| ID | Role | Camera | Lighting | Mood |
|---|---|---|---|---|
| `products-floor-robot-hero-01-4x5` | hero | Low ¾, 28 mm | Cool top rim + warm fill | Robot on dark hardwood, cyan LiDAR halo |
| `products-floor-robot-hero-wide-01-21x9` | hero-wide | 35 mm wide | Same | Cinematic wide of the puck on a long corridor |
| `products-floor-robot-front-01-1x1` | front | Orthographic | Even soft + cyan rim | LiDAR turret centered |
| `products-floor-robot-side-01-1x1` | side | Orthographic | Same | Wheels + bumper visible |
| `products-floor-robot-top-01-1x1` | top | Orthographic | Top-down soft + cyan ring | Dock connectors visible |
| `products-floor-robot-iso-01-1x1` | iso | ¾ iso | Same | Studio dark |
| `products-floor-robot-feature-lidar-01-16x9` | feature | Macro | Cyan rim on turret | LiDAR module closeup |
| `products-floor-robot-feature-dock-01-16x9` | feature | Macro | Warm + cyan | Dock contact pads |
| `products-floor-robot-feature-noise-01-16x9` | feature | Macro | Editorial soft | Acoustic foam intake detail |
| `products-floor-robot-app-mockup-01-16x9` | app-mockup | Phone tilted on dark surface | Soft top + cyan tint | App room-map screen + schedule chips |
| `products-floor-robot-exploded-01-16x9` | exploded | ¾ iso, blueprint overlay | Even diffuse + cyan annotations | Modules separated with cyan arrows |
| `products-floor-robot-loop-01-16x9` | loop | Slow dolly around the moving robot | Match hero | 10 s seamless |
| `products-floor-robot-loop-01-poster-16x9` | loop-poster | Extracted | — | — |

### 2.3 Product 2 — `iot-home-safety-device`

Pilot stage. Wall-mounted disk-form device.

| ID | Role | Direction |
|---|---|---|
| `products-safety-device-hero-01-4x5` | hero | ¾ wall-mounted, soft top rim, cyan LED ring lit |
| `products-safety-device-hero-wide-01-21x9` | hero-wide | Wide context: hallway with the device on a wall, dim cyan |
| `products-safety-device-front-01-1x1` | front | Orthographic, LED ring centered |
| `products-safety-device-side-01-1x1` | side | Orthographic, mounting depth visible |
| `products-safety-device-top-01-1x1` | top | Top-down, vent geometry |
| `products-safety-device-iso-01-1x1` | iso | ¾ iso, satin-white front + graphite ring |
| `products-safety-device-feature-smoke-01-16x9` | feature | Macro mesh sensor closeup |
| `products-safety-device-feature-gas-01-16x9` | feature | Macro gas-sensor port |
| `products-safety-device-feature-siren-01-16x9` | feature | Macro buzzer + vent geometry, cyan trim |
| `products-safety-device-app-mockup-01-16x9` | app-mockup | Alert screen on phone, cyan alert chip |
| `products-safety-device-exploded-01-16x9` | exploded | Disk separated into front bezel, sensor board, back plate, with annotations |
| `products-safety-device-loop-01-16x9` | loop | Camera arcs slowly around the device while LED ring breathes once |
| `products-safety-device-loop-01-poster-16x9` | loop-poster | Extracted |

### 2.4 Product 3 — `smart-appliance-control`

Early prototype. In-wall module + small hub variant.

| ID | Role | Direction |
|---|---|---|
| `products-appliance-control-hero-01-4x5` | hero | Module installed in a switch plate, cyan power dot |
| `products-appliance-control-hero-wide-01-21x9` | hero-wide | Wide context: kitchen counter at night, controller flush in wall |
| `products-appliance-control-front-01-1x1` | front | Plate-on, controller centered |
| `products-appliance-control-side-01-1x1` | side | Profile depth, terminal block visible |
| `products-appliance-control-top-01-1x1` | top | Top-down, mounting holes |
| `products-appliance-control-iso-01-1x1` | iso | ¾ iso, two unit variants side-by-side |
| `products-appliance-control-feature-relay-01-16x9` | feature | Macro relay block with cyan signal trace |
| `products-appliance-control-feature-meter-01-16x9` | feature | Macro current sensor coil |
| `products-appliance-control-feature-override-01-16x9` | feature | Macro local manual override toggle |
| `products-appliance-control-app-mockup-01-16x9` | app-mockup | Schedule + energy-graph screen on phone |
| `products-appliance-control-exploded-01-16x9` | exploded | Plate, PCB, terminal block, enclosure separated |
| `products-appliance-control-loop-01-16x9` | loop | Slow rotate, energy graph animates on companion phone |
| `products-appliance-control-loop-01-poster-16x9` | loop-poster | Extracted |

### 2.5 Product 4 — `education-robotics-kit`

Planned. Modular kit with multiple parts.

| ID | Role | Direction |
|---|---|---|
| `products-education-kit-hero-01-4x5` | hero | Top-down hero of all kit modules laid out neatly on dark felt with cyan grid |
| `products-education-kit-hero-wide-01-21x9` | hero-wide | Wide flat-lay variant |
| `products-education-kit-front-01-1x1` | front | Controller front view |
| `products-education-kit-side-01-1x1` | side | Controller side, ports visible |
| `products-education-kit-top-01-1x1` | top | Top-down of just the controller |
| `products-education-kit-iso-01-1x1` | iso | ¾ iso of the assembled training robot |
| `products-education-kit-feature-controller-01-16x9` | feature | Controller closeup with port labels |
| `products-education-kit-feature-modules-01-16x9` | feature | Sensor + motor modules row |
| `products-education-kit-feature-curriculum-01-16x9` | feature | Module + lab booklet, blueprint vibe |
| `products-education-kit-app-mockup-01-16x9` | app-mockup | Lesson IDE screen on a tablet |
| `products-education-kit-exploded-01-16x9` | exploded | Modules separated with cyan annotation lines |
| `products-education-kit-loop-01-16x9` | loop | Hands-free build sequence: modules click into place via micro time-lapse |
| `products-education-kit-loop-01-poster-16x9` | loop-poster | Extracted |

### 2.6 Product 5 — `iot-gateway-node`

Custom-quote SKU. Small enclosure with antennas.

| ID | Role | Direction |
|---|---|---|
| `products-iot-gateway-hero-01-4x5` | hero | Wall/DIN-mounted enclosure with two antennas, cyan link LED |
| `products-iot-gateway-hero-wide-01-21x9` | hero-wide | Wide context: utility cabinet, cabling neat |
| `products-iot-gateway-front-01-1x1` | front | Front face with status LEDs |
| `products-iot-gateway-side-01-1x1` | side | DIN clip detail |
| `products-iot-gateway-top-01-1x1` | top | Top with antenna stubs |
| `products-iot-gateway-iso-01-1x1` | iso | ¾ iso |
| `products-iot-gateway-feature-buffer-01-16x9` | feature | Macro PCB with cyan trace highlighting telemetry path |
| `products-iot-gateway-feature-protocols-01-16x9` | feature | Editorial overlay: MQTT/HTTPS labels with cyan link |
| `products-iot-gateway-feature-environment-01-16x9` | feature | Closeup of IP-rated gasket detail |
| `products-iot-gateway-app-mockup-01-16x9` | app-mockup | Diagnostics dashboard mock — device list, throughput chart, alert chip |
| `products-iot-gateway-exploded-01-16x9` | exploded | Enclosure shell, board, antenna assembly separated |
| `products-iot-gateway-loop-01-16x9` | loop | Cyan signal pulses traveling across PCB traces |
| `products-iot-gateway-loop-01-poster-16x9` | loop-poster | Extracted |

### 2.7 Product 6 — `custom-embedded-controller`

Engineering-service SKU. Visual emphasis is process + capability, not a single object.

| ID | Role | Direction |
|---|---|---|
| `products-custom-embedded-hero-01-4x5` | hero | Editorial bench: bare PCB, scope probe in frame, cyan trace on screen |
| `products-custom-embedded-hero-wide-01-21x9` | hero-wide | Wide bench shot — multiple boards, soldering station, blueprint paper |
| `products-custom-embedded-front-01-1x1` | front | A representative custom controller, front view, badged `[CONCEPT]` |
| `products-custom-embedded-side-01-1x1` | side | Profile with connectors |
| `products-custom-embedded-top-01-1x1` | top | Top of board with component callouts |
| `products-custom-embedded-iso-01-1x1` | iso | ¾ iso of the same board |
| `products-custom-embedded-feature-prototype-01-16x9` | feature | Hand-soldered jumpers under microscope, cyan probe glow |
| `products-custom-embedded-feature-firmware-01-16x9` | feature | Editor + serial logs on a dark screen, monospace |
| `products-custom-embedded-feature-enclosure-01-16x9` | feature | 3D-printed enclosure halves with mounting bosses |
| `products-custom-embedded-app-mockup-01-16x9` | app-mockup | Internal admin / diagnostics mock for the engagement |
| `products-custom-embedded-exploded-01-16x9` | exploded | Enclosure + PCB stack-up + cabling separated |
| `products-custom-embedded-loop-01-16x9` | loop | Time-lapse of probe moving across the board, cyan annotation drawing in |
| `products-custom-embedded-loop-01-poster-16x9` | loop-poster | Extracted |

### 2.8 Universal product-page rules

- **Realism over flair.** Spec-table and "in the box" imagery is **not AI** — it must be real photography or precise CAD render once prototypes exist (`AI_ASSET_PIPELINE §2`).
- **Concept badge is mandatory** until a physical unit exists. Keep the `[CONCEPT]` chip visible in copy, not painted into the image.
- **App-mockup screens** are composed from real UI screenshots in dark mode whenever possible; AI is acceptable only for the device-frame and reflection layer.
- All products carry the **same lighting key**: top-back cyan rim + warm 25% fill at camera-left + deep `--bg-base` shadow floor.

---

## 3. Solutions page assets — `/solutions` (and future `/solutions/:slug`)

The solutions index renders 6 industry cards plus a 5-step engagement timeline plus a case-study showcase. The four scenes named in `PAGE_BLUEPRINTS §4` map to four of those cards. We deliver all six for parity, plus the index hero and the case-study video.

### 3.1 Solutions index hero

| ID | Tool | Preset | Aspect | Pixel target | Direction |
|---|---|---|---|---|---|
| `solutions-index-hero-01-21x9` | SEEDREAM | C | 21:9 | 2520 × 1080 | Wide montage — silhouettes of a home corner, an office desk, a lab table, a small factory cell merging across the frame; single cyan throughline |
| `solutions-index-hero-loop-01-16x9` | SEEDANCE | C | 16:9 | 1280 × 720 | Optional 8 s loop — same composition with a slow horizontal dolly across the four scenes |

### 3.2 Industry scenes (4 named + 2 extras already on page)

All scenes use **Preset C** so the solutions row reads as one cohesive set. No identifiable people close-up; if humans appear, they are silhouetted or back-of-head.

| ID | Aspect | Pixel target | Camera | Lighting | Color/mood |
|---|---|---|---|---|---|
| `solutions-homes-scene-01-16x9` | 16:9 | 1920 × 1080 | 35 mm, ¾, slight low | Warm practical lamp + cyan device LED | Living room corner at night; wall-mounted ARIOT safety device subtly placed; calm |
| `solutions-offices-scene-01-16x9` | 16:9 | 1920 × 1080 | 28 mm wide | Daylight diffused through blinds + cyan air-quality LED | Empty SME office at dawn; small puck device on desk; clean, optimistic |
| `solutions-institutions-scene-01-16x9` | 16:9 | 1920 × 1080 | 35 mm, top-side | Cool overhead workshop + cyan annotations | University robotics lab; education kit in the foreground; neat, confident |
| `solutions-industries-scene-01-16x9` | 16:9 | 1920 × 1080 | 24 mm wide, low | Mixed practical + cyan beacon | Small-batch production cell at dusk; conveyor + sensor station; honest, gritty premium |
| `solutions-energy-scene-01-16x9` | 16:9 | 1920 × 1080 | 35 mm, ¾ | Practical industrial + cyan link arc | Substation control room with field gateway; cabinet + diagnostics screen |
| `solutions-custom-rd-scene-01-16x9` | 16:9 | 1920 × 1080 | 35 mm, top-side | Editorial soft + cyan marker accent | Whiteboard with crisp engineering sketch + a single PCB; collaborative |

### 3.3 Approach + timeline visuals (optional accents)

| ID | Tool | Aspect | Pixel target | Direction |
|---|---|---|---|---|
| `solutions-approach-blueprint-01-16x9` | SEEDREAM (Preset B) | 16:9 | 1920 × 1080 | Blueprint-style line illustration of the 3-step approach (Field → System → Support), cyan strokes on graphite |
| `solutions-timeline-bg-01-21x9` | SEEDREAM (Preset A) | 21:9 | 2520 × 1080 | Subtle ambient backdrop for the 5-step timeline, used at low opacity |

### 3.4 Case-study showcase

The page already has a `[MEDIA SHOWCASE PLACEHOLDER]` slot.

| ID | Tool | Aspect | Output | Direction |
|---|---|---|---|---|
| `solutions-case-study-feature-01-16x9` | SEEDANCE (C) | 16:9 | MP4 + WebM, 12 s | Documentary-feel composite — site, device, dashboard, outcome metric overlay (text added in HTML, not video) |
| `solutions-case-study-feature-01-poster-16x9` | extracted | 16:9 | AVIF | Frame at second 0.5 |

---

## 4. About page assets — `/about`

The about page implements: hero with `[LAB PHOTO PLACEHOLDER]` glass card, manifesto, metrics, story timeline, focus areas, **team grid with placeholder cards**, partners strip, press card, CTA. Per `AI_ASSET_PIPELINE §2` and `CONTENT_STRATEGY §3.5`, **team photos are real** — never AI. AI fills the lab/manufacturing/context slots.

### 4.1 Hero lab visual

| ID | Tool | Preset | Aspect | Pixel target | Direction |
|---|---|---|---|---|---|
| `about-hero-lab-01-4x3` | SEEDREAM | A | 4:3 | 1600 × 1200 | Workshop interior at night — long bench, oscilloscopes glowing cyan, neat tools rack, no people; lived-in not staged |
| `about-hero-lab-01-21x9` | SEEDREAM | A | 21:9 | 2520 × 1080 | Optional wide variant if hero layout shifts to full-bleed |

### 4.2 Manufacturing & quality showcase

| ID | Tool | Preset | Aspect | Pixel target | Direction |
|---|---|---|---|---|---|
| `about-manufacturing-01-16x9` | SEEDREAM | A | 16:9 | 1920 × 1080 | Inspection station — gloved hands tightening a fixture (back-of-hand only), cyan inspection lamp, brushed-steel table |
| `about-manufacturing-loop-01-16x9` | SEEDANCE | A | 16:9 | 1280 × 720 | Optional 8 s loop — inspection stage rotates a unit slowly under the lamp |

### 4.3 Bangladesh / South Asia positioning visuals

These visuals communicate regional identity without leaning into clichés. They go on the about page and are reused in blog covers and the home `home-blog-iot-bd-01-16x9` slot.

| ID | Tool | Preset | Aspect | Pixel target | Direction |
|---|---|---|---|---|---|
| `about-bd-context-skyline-01-16x9` | SEEDREAM | C | 16:9 | 1920 × 1080 | Dhaka skyline at dusk through a workshop window, ARIOT device silhouetted on the sill — the geography is the backdrop, not the subject |
| `about-bd-context-rural-01-16x9` | SEEDREAM | C | 16:9 | 1920 × 1080 | Rural rooftop antenna against soft horizon — IoT in real regional conditions; respectful, no caricature |
| `about-bd-context-workshop-01-4x5` | SEEDREAM | A | 4:5 | 1080 × 1350 | Portrait crop of the same workshop environment — used on mobile + portrait cards |

### 4.4 Team direction (NOT AI)

For every team grid card and leadership portrait the rule is the same:

- **Real photography only.** No AI portraits. (`AI_ASSET_PIPELINE §2` table, `CONTENT_STRATEGY §3.5`.)
- **Studio direction**: half-body, ¾ angle, near-black backdrop, cool key + warm fill, subject in graphite/dark steel-friendly clothing, neutral expression, 4:5 portrait, 1200 × 1500 px master, AVIF + WebP outputs.
- **Naming**: `team-<firstname-lastname>-portrait-01-4x5.avif` (real-photo namespace, not Seedream).
- **Decorative behind-portrait textures** may use Seedream Preset B at low opacity if desired.

### 4.5 Partners / certifications

- **Logo lockups are NOT AI.** They are real partner logos rendered at consistent height (`docs/DESIGN_SYSTEM §12`).
- A single Seedream ambient `about-press-bg-01-21x9` (Preset A, 21:9, 2520 × 1080) may sit behind the press section at low opacity.

---

## 5. Blog / Innovation Lab assets — `/blog` and `/blog/:slug`

The blog implements: hero featured-post slot, category strip, 4-card latest grid, build-log feature (with `[BUILD LOG MEDIA PLACEHOLDER]`), newsletter band. Per `CONTENT_STRATEGY §4.3`, **technical evidence imagery (graphs, screenshots, diagrams) is never AI** — AI is for hero atmosphere only.

### 5.1 Thumbnail system

A single visual language across all blog covers prevents the "different vendor every post" feel.

- **Aspect**: 16:9 master at 1920 × 1080. A 4:5 mobile-portrait crop master is generated for each cover.
- **Composition rule (the "ARIOT cover grid")**:
  - **Subject** in the **left third**, eyebrow-readable depth.
  - **Negative space** in the **right two-thirds** so the title overlay reads cleanly at the design-system display sizes.
  - **One single cyan signal element** per cover (LED, trace, label).
  - **No text painted into the image** — title is HTML.
  - **Consistent dark base** (`--bg-base` mood).
- **Preset use**:
  - **Robotics R&D / Build Logs** → Preset A (cinematic hero).
  - **IoT in Bangladesh / Smart Industry** → Preset C (industry scene wide).
  - **Tutorials / Engineering Notes** → Preset B (editorial conceptual).
- **Why it stays cheap-AI-proof**: one preset per category, single cyan element, deliberate negative space, never the "neon swoosh on dark" look.

### 5.2 Category cover masters (six covers seed the system)

| ID | Aspect | Pixel target | Preset | Subject |
|---|---|---|---|---|
| `blog-cover-rd-01-16x9` | 16:9 | 1920 × 1080 | A | Lab joint closeup, cyan rim |
| `blog-cover-iot-bd-01-16x9` | 16:9 | 1920 × 1080 | C | South-Asian rooftop antenna at dusk |
| `blog-cover-industry-01-16x9` | 16:9 | 1920 × 1080 | C | Small factory cell with sensor station |
| `blog-cover-build-log-01-16x9` | 16:9 | 1920 × 1080 | A | Bench with PCB mid-build |
| `blog-cover-tutorial-01-16x9` | 16:9 | 1920 × 1080 | B | Editorial flat-lay — notebook + dev board |
| `blog-cover-eng-note-01-16x9` | 16:9 | 1920 × 1080 | B | Macro IC closeup |

Each gets a 4:5 sister at 1080 × 1350 for portrait card uses (`blog-cover-<topic>-01-4x5`).

### 5.3 Featured-hero slot

| ID | Tool | Preset | Aspect | Pixel target | Direction |
|---|---|---|---|---|---|
| `blog-feature-hero-01-21x9` | SEEDREAM | A | 21:9 | 2520 × 1080 | Premium full-bleed cover swap-in for the featured post; rotates per-feature |

### 5.4 Build-log innovation slot

| ID | Tool | Preset | Aspect | Output | Direction |
|---|---|---|---|---|---|
| `blog-build-log-feature-01-16x9` | SEEDANCE | A | 16:9 | MP4 + WebM, 8 s loop | Slow time-lapse of a workbench session; muted, looped; replaces the current `[BUILD LOG MEDIA PLACEHOLDER]` |
| `blog-build-log-feature-01-poster-16x9` | extracted | 16:9 | AVIF | Frame at 0.5 s |

### 5.5 Newsletter band background (optional)

| ID | Tool | Preset | Aspect | Pixel target | Direction |
|---|---|---|---|---|---|
| `blog-newsletter-bg-01-21x9` | SEEDREAM | A | 21:9 | 2520 × 1080 | Ambient cyan radial, low opacity, sits behind the existing radial-gradient overlay if we want extra atmosphere |

---

## 6. Video asset requirements (Seedance)

Pulled out for clarity even though some assets above are videos. All videos obey `AI_ASSET_PIPELINE §4`: slow camera ≤ 0.6 m/s simulated, no whip pans, seamless loop, no in-video text, MP4 (H.264) + WebM (AV1) + AVIF poster, autoplay-muted-loop-playsinline only.

### 6.1 Homepage cinematic loop

| ID | Aspect | Pixel target | Length | Direction |
|---|---|---|---|---|
| `home-hero-cinematic-arm-01-21x9.mp4/.webm` | 21:9 | 1920 × 824 | 8 s | Slow forward dolly; cyan signal LED breathes once; end frame = start frame; seamless |
| `home-hero-cinematic-arm-01-poster-21x9.avif` | 21:9 | 1920 × 824 | — | Poster at 0.5 s |
| Mobile fallback: `home-hero-cinematic-arm-01-9x16.mp4/.webm` | 9:16 | 720 × 1280 | 8 s | Vertical recompose |

### 6.2 Product showcase videos (one per SKU, 6 total)

For each product slug, the `loop` row in §2.1 ships as Seedance.

| Subject ID | Length | Aspect | Direction |
|---|---|---|---|
| `products-floor-robot-loop-01-16x9` | 10 s | 16:9 | Slow dolly while the puck completes one cleaning arc |
| `products-safety-device-loop-01-16x9` | 8 s | 16:9 | Camera arcs around the disc; LED ring breathes once |
| `products-appliance-control-loop-01-16x9` | 10 s | 16:9 | Slow rotate; companion phone graph ticks |
| `products-education-kit-loop-01-16x9` | 12 s | 16:9 | Modules click into place via micro time-lapse |
| `products-iot-gateway-loop-01-16x9` | 10 s | 16:9 | Cyan pulses traverse PCB traces |
| `products-custom-embedded-loop-01-16x9` | 12 s | 16:9 | Probe moves across a bare board with cyan annotation drawing in |

### 6.3 IoT dashboard motion clips

These animate **real** product UI captures (not AI), but live in the same loop pipeline. Used on solutions/industry pages and product pages with a "see it in action" slot.

| ID | Aspect | Length | Direction |
|---|---|---|---|
| `shared-dashboard-iot-overview-01-16x9` | 16:9 | 8 s | Real screen capture of the IoT dashboard; low motion (graph tick + alert arrival) |
| `shared-dashboard-fleet-status-01-16x9` | 16:9 | 8 s | Fleet view with status chips updating |
| `shared-dashboard-alert-flow-01-16x9` | 16:9 | 8 s | Single alert lifecycle: device → notification → resolution |

### 6.4 Engineering / process clips

| ID | Aspect | Length | Direction |
|---|---|---|---|
| `about-process-pcb-soldering-01-16x9` | 16:9 | 10 s | Macro hands-free time-lapse of a PCB being populated |
| `about-process-inspection-01-16x9` | 16:9 | 8 s | Inspection lamp passes over a unit on a fixture |
| `about-process-assembly-01-16x9` | 16:9 | 10 s | Final assembly stage |

### 6.5 Per-asset video required spec

Every video asset above must declare:

| Field | Default |
|---|---|
| Codec primary | H.264 yuv420p (MP4) |
| Codec modern | AV1 (WebM) preferred via `<source type="video/webm">` first |
| Audio | None (mute by spec) |
| Length | 6–12 s, seamless loop |
| FPS | 30 (24 acceptable for cinematic hero) |
| Poster | AVIF extracted from second 0.5 |
| Reduced-motion fallback | Poster only — no playback |
| Max combined size | Per `AI_ASSET_PIPELINE §4.5`: hero ≤ 1.8 MB, section ≤ 1.2 MB, product explainer ≤ 2.4 MB, mobile vertical ≤ 1.2 MB |

---

## 7. Global visual language rules

This section is the "what makes ARIOT visuals feel like ARIOT" checklist. Every asset reviewer applies it before sign-off.

### 7.1 Material language

- **Graphite + brushed steel** as the dominant material palette. Surfaces show fine grain or hairline texture, never flat plastic.
- **Satin-white** is allowed only for safety/consumer devices and only as a front bezel — never as a hero background.
- **Glass / acrylic** elements use a low-contrast tint with subtle internal reflection (not a mirror).
- **Cables and gaskets** must look like the real thing — service-grade silicone, woven cable wrap — never glossy CGI rubber.

### 7.2 Lens style

- **Real focal lengths**: 28 mm wide for context, 35 mm for hero, 50–85 mm for product portraits, 100 mm+ macro for closeups. No extreme fisheye or tilt-shift unless intentional editorial.
- **Aperture**: f/2.8 hero feel, f/5.6–f/8 for spec-style renders. Avoid background-bokeh overload.
- **Sensor look**: simulate full-frame; mild vignette OK, never heavy.

### 7.3 Depth of field

- **Hero**: shallow but readable — subject sharp, background soft enough to disappear.
- **Spec / angle renders**: deep — every spec-relevant feature in focus.
- **Editorial closeups**: very shallow, single feature in tack-sharp focus.

### 7.4 Contrast

- **Black point** anchored at `--bg-base` (`#08090B`) — never crush to pure black, never raise to gray.
- **White point** rarely above `--steel-100` — leave headroom so cyan reads as the brightest pixel.
- Avoid HDR-overcooked highlights — premium reads as restraint.

### 7.5 Texture realism

- Brushed-steel grain, fine dust on machined surfaces, micro-fingerprints on satin plastic where realistic.
- **No plastic CGI sheen.** That's the #1 cheap-AI tell.
- **No melted geometry.** Edges are crisp; bevels are deliberate.

### 7.6 Robotics aesthetic

- One **cyan signal element** per frame is the signature. More than one and the brand starts shouting.
- Mechanical parts respect physics (cable bend radius, joint articulation, mass).
- Sensor turrets, antennas, and indicator LEDs are **functional-looking**, not decorative.
- Annotation overlays use **monospace labels** with hairline cyan leader lines (matches `JetBrains Mono` token in `DESIGN_SYSTEM §3.1`).

### 7.7 How to avoid the "cheap AI" look

A reviewer rejects an asset if any of these appear:

1. Six-fingered or melted hands. Any visible hand → reject and recompose without hands or use back-of-hand only.
2. Garbled text, fake logos, fake brand names painted into the image.
3. Plastic toy sheen, oversaturated cyan/magenta neon.
4. Generic "futuristic city, blue glow" stock vibe.
5. Identical face stock-portrait energy. (Solution: real photo, period.)
6. Random floating particles / glow orbs without a physical source.
7. Symmetry that looks suspicious — repeated identical components, mirrored cabling.
8. Wrong scale — gigantic LEDs, tiny screws, inconsistent grain across surfaces.
9. Lens flares from impossible positions.
10. Too many colors. ARIOT is graphite + steel + cyan. Period.

---

## 8. Asset production priority

Three waves. Each wave is gated by what the site actually shows now versus what unlocks new pages.

### 8.1 Wave 1 — Critical (ship first)

These assets unblock the homepage and the first product detail page enough to give the site its premium first impression.

| Order | Asset family | Purpose |
|---|---|---|
| 1 | `home-hero-cinematic-arm-01-21x9` (still + loop + poster + 9:16) | The single most-visible visual on the site |
| 2 | `home-solution-*` 1:1 set (5 tiles) | Populates homepage solutions row + reused on solutions index |
| 3 | `home-product-*` 1:1 set (4 tiles) | Populates homepage product preview |
| 4 | `home-engineering-*` 16:9 set (3 tiles) | Anchors the engineering credibility section |
| 5 | `home-blog-*` 16:9 set (3 tiles) | Closes the homepage with content credibility |
| 6 | `home-cta-final-bg-01-21x9` | Closes the homepage hero rhythm |
| 7 | `products-floor-robot-*` full kit | First product page becomes premium-grade |
| 8 | `products-safety-device-*` full kit | Second product page (closest to pilot) |
| 9 | `solutions-homes/offices/institutions/industries-scene-01-16x9` (4 scenes) | Solutions index becomes real |
| 10 | `about-hero-lab-01-4x3` | About hero stops looking placeholder |

### 8.2 Wave 2 — Important (ship second)

These elevate the site from "looks great on the homepage" to "feels uniformly premium across all surfaces."

| Order | Asset family | Purpose |
|---|---|---|
| 11 | `products-appliance-control-*` full kit | Third product page |
| 12 | `products-education-kit-*` full kit | Fourth product page |
| 13 | `products-iot-gateway-*` full kit | Fifth product page |
| 14 | `products-custom-embedded-*` full kit | Sixth product page |
| 15 | `solutions-energy-scene-01-16x9` + `solutions-custom-rd-scene-01-16x9` | Remaining two solutions cards |
| 16 | `solutions-case-study-feature-01-16x9` (video) + poster | Case study slot |
| 17 | `blog-cover-*` 16:9 set (six category masters) + 4:5 sisters | Blog feels editorial |
| 18 | `blog-feature-hero-01-21x9` | Blog featured slot |
| 19 | `blog-build-log-feature-01-16x9` (video) + poster | Innovation lab slot |
| 20 | `about-bd-context-*` set | Regional positioning |
| 21 | `about-manufacturing-01-16x9` (+ optional loop) | Trust + capability |
| 22 | `solutions-index-hero-01-21x9` | Solutions index hero |
| 23 | `products-index-hero-bg-01-21x9` | Catalog hero ambient |

### 8.3 Wave 3 — Optional cinematic + Phase 2+ sketches

Optional elevation passes and forward-looking slots that `AGENTS.md` flags as Phase 2+. The pipeline is ready for them but they are not blocking.

| Order | Asset family | Purpose |
|---|---|---|
| 24 | `solutions-index-hero-loop-01-16x9` | Solutions index loop |
| 25 | `products-index-hero-loop-01-16x9` | Catalog page loop |
| 26 | `home-trust-strip-bg-01-16x9` | Optional ambient |
| 27 | `solutions-approach-blueprint-01-16x9` + `solutions-timeline-bg-01-21x9` | Solutions accents |
| 28 | `about-press-bg-01-21x9` + `blog-newsletter-bg-01-21x9` | Optional ambients |
| 29 | `shared-dashboard-*` (3 IoT dashboard motion clips) | "See it in action" slots — dependent on real product UI |
| 30 | `about-process-*` (3 engineering/process clips) | About-page premium moments |
| 31 | **Phase 2+** `cart-empty-illustration-01-1x1` + `checkout-trust-strip-01-16x9` + `account-shell-bg-01-21x9` | Ahead-of-time sketches |
| 32 | **Phase 2+** `admin-login-bg-01-21x9` + `admin-empty-state-illustration-01-1x1` | Admin shell media |
| 33 | **Phase 2+** OG defaults (`og-default-01-1200x630`, `og-product-01-1200x630`, `og-blog-01-1200x630`) | **Programmatic via `next/og`, NOT Seedream** per `AI_ASSET_PIPELINE §2` |

---

## 9. Optimization guidance

### 9.1 Image (AVIF + WebP) strategy

- **AVIF primary** at `q≈50`. **WebP fallback** at `q≈80`. PNG/JPG only when transparency or specific compatibility demands.
- **Master** lives gitignored under `content/ai-source/<asset-name>/master.<ext>` at native target resolution.
- **Site-ready exports** live under `public/media/<area>/<asset-id>.<ext>`.
- **Variant pyramid** (future automation): 240 / 480 / 720 / 1080 / 1440 / 2160 widths through a CDN bucket. For now, `next/image` handles responsive variants at runtime.
- **Per-class budgets** (must not be exceeded, re-encode otherwise):

| Class | Sign-off resolution | Max AVIF |
|---|---|---|
| Hero (21:9) | 2520 × 1080 | 350 KB |
| Section accent (16:9) | 1920 × 1080 | 250 KB |
| Blog cover (16:9) | 1600 × 900 | 180 KB |
| Product render (1:1) | 1200 × 1200 | 220 KB |
| Mobile hero (4:5) | 1080 × 1350 | 220 KB |

### 9.2 Video compression guidance

- **Two-pass H.264** (yuv420p) tuned to the MP4 budget.
- **Two-pass AV1** for WebM, set as `<source type="video/webm">` **first** so capable browsers pick it up.
- **Audio**: stripped — every loop is silent.
- **Length**: 6–12 s; longer clips justified only for product explainers (≤ 15 s).
- **Combined budget** per class (`AI_ASSET_PIPELINE §4.5`):

| Class | Length | Resolution | Max combined size |
|---|---|---|---|
| Hero loop (21:9) | 6–10 s | 1920 × 824 | 1.8 MB |
| Section loop (16:9) | 4–8 s | 1280 × 720 | 1.2 MB |
| Product explainer (16:9) | 10–15 s | 1280 × 720 | 2.4 MB |
| Mobile vertical (9:16) | 4–8 s | 720 × 1280 | 1.2 MB |

### 9.3 Lazy-loading strategy

- **Above-the-fold hero**: `<Image priority>` (or `<video>` with `preload="metadata"`) so it's the LCP candidate. No lazy load.
- **All other images**: `<Image>` defaults — native lazy with `decoding="async"`.
- **All other videos**: `preload="metadata"`, `IntersectionObserver` gate around `play()` so off-screen videos never start.
- **Background videos**: pause on `visibilitychange` and on off-screen.
- **3D scenes** (when they land): dynamic import `ssr: false` + `Suspense` skeleton; never load above-the-fold on mobile.

### 9.4 Poster image guidance

- **Every video has a poster.** Posters are AVIF, extracted from second 0.5 to avoid first-frame flicker.
- **Reduced-motion fallback** is the poster only — never auto-play under `prefers-reduced-motion: reduce`.
- **Aspect** of the poster matches the video exactly so layout doesn't shift on swap.

---

## 10. Recommended asset folder structure

This extends `AI_ASSET_PIPELINE §6` with the per-product subfolders, the per-shared bucket, and the per-area Phase 2+ slots. All paths are repo-relative.

```
public/
└── media/
    ├── home/
    │   ├── home-hero-cinematic-arm-01-21x9.avif
    │   ├── home-hero-cinematic-arm-01-21x9.webp
    │   ├── home-hero-cinematic-arm-01-21x9.mp4
    │   ├── home-hero-cinematic-arm-01-21x9.webm
    │   ├── home-hero-cinematic-arm-01-poster-21x9.avif
    │   ├── home-hero-cinematic-arm-01-9x16.avif
    │   ├── home-hero-cinematic-arm-01-9x16.webp
    │   ├── home-product-floor-robot-01-1x1.avif
    │   ├── home-product-safety-device-01-1x1.avif
    │   ├── home-product-appliance-control-01-1x1.avif
    │   ├── home-product-custom-rd-01-1x1.avif
    │   ├── home-solution-{homes,offices,institutions,industries,custom}-01-1x1.{avif,webp}
    │   ├── home-engineering-{navigation,embedded,iot}-01-16x9.{avif,webp}
    │   ├── home-blog-{rd,iot-bd,tutorials}-01-16x9.{avif,webp}
    │   ├── home-cta-final-bg-01-21x9.{avif,webp}
    │   └── home-trust-strip-bg-01-16x9.{avif,webp}
    │
    ├── products/
    │   ├── _index/
    │   │   └── products-index-hero-bg-01-21x9.{avif,webp}
    │   ├── autonomous-floor-cleaning-robot/
    │   │   ├── products-floor-robot-hero-01-4x5.{avif,webp}
    │   │   ├── products-floor-robot-hero-wide-01-21x9.{avif,webp}
    │   │   ├── products-floor-robot-{front,side,top,iso}-01-1x1.{avif,webp}
    │   │   ├── products-floor-robot-feature-{lidar,dock,noise}-01-16x9.{avif,webp}
    │   │   ├── products-floor-robot-app-mockup-01-16x9.{avif,webp}
    │   │   ├── products-floor-robot-exploded-01-16x9.{avif,webp}
    │   │   ├── products-floor-robot-loop-01-16x9.{mp4,webm}
    │   │   └── products-floor-robot-loop-01-poster-16x9.avif
    │   ├── iot-home-safety-device/
    │   │   └── … (same kit pattern)
    │   ├── smart-appliance-control/
    │   ├── education-robotics-kit/
    │   ├── iot-gateway-node/
    │   └── custom-embedded-controller/
    │
    ├── solutions/
    │   ├── solutions-index-hero-01-21x9.{avif,webp}
    │   ├── solutions-index-hero-loop-01-16x9.{mp4,webm}
    │   ├── solutions-{homes,offices,institutions,industries,energy,custom-rd}-scene-01-16x9.{avif,webp}
    │   ├── solutions-approach-blueprint-01-16x9.{avif,webp}
    │   ├── solutions-timeline-bg-01-21x9.{avif,webp}
    │   ├── solutions-case-study-feature-01-16x9.{mp4,webm}
    │   └── solutions-case-study-feature-01-poster-16x9.avif
    │
    ├── about/
    │   ├── about-hero-lab-01-4x3.{avif,webp}
    │   ├── about-hero-lab-01-21x9.{avif,webp}
    │   ├── about-manufacturing-01-16x9.{avif,webp}
    │   ├── about-manufacturing-loop-01-16x9.{mp4,webm}
    │   ├── about-bd-context-{skyline,rural}-01-16x9.{avif,webp}
    │   ├── about-bd-context-workshop-01-4x5.{avif,webp}
    │   ├── about-process-{pcb-soldering,inspection,assembly}-01-16x9.{mp4,webm}
    │   └── about-press-bg-01-21x9.{avif,webp}
    │
    ├── blog/
    │   ├── blog-feature-hero-01-21x9.{avif,webp}
    │   ├── blog-cover-{rd,iot-bd,industry,build-log,tutorial,eng-note}-01-16x9.{avif,webp}
    │   ├── blog-cover-{rd,iot-bd,industry,build-log,tutorial,eng-note}-01-4x5.{avif,webp}
    │   ├── blog-build-log-feature-01-16x9.{mp4,webm}
    │   ├── blog-build-log-feature-01-poster-16x9.avif
    │   └── blog-newsletter-bg-01-21x9.{avif,webp}
    │
    ├── support/
    │   └── (rare; KB images mostly DB-backed)
    │
    ├── shared/
    │   └── shared-dashboard-{iot-overview,fleet-status,alert-flow}-01-16x9.{mp4,webm}
    │
    ├── team/
    │   └── team-<firstname-lastname>-portrait-01-4x5.{avif,webp}    ← real photos, NOT AI
    │
    ├── account/                                                     ← Phase 2+ sketches
    │   └── account-shell-bg-01-21x9.{avif,webp}
    │
    ├── cart-checkout/                                               ← Phase 2+ sketches
    │   ├── cart-empty-illustration-01-1x1.{avif,webp}
    │   └── checkout-trust-strip-01-16x9.{avif,webp}
    │
    ├── admin/                                                       ← Phase 2+ sketches
    │   ├── admin-login-bg-01-21x9.{avif,webp}
    │   └── admin-empty-state-illustration-01-1x1.{avif,webp}
    │
    └── og/                                                          ← Programmatic via next/og
        └── (generated at runtime, not committed)

content/
├── ai-prompts/                          ← committed
│   ├── _presets.json                    ← Preset A / B / C definitions
│   ├── home-hero-cinematic-arm-01.json
│   ├── products-floor-robot-hero-01.json
│   ├── solutions-homes-scene-01.json
│   ├── blog-cover-rd-01.json
│   └── …                                ← one JSON per generated asset
└── ai-source/                           ← gitignored masters
    └── <asset-name>/master.<ext>
```

Conventions reaffirmed: lowercase + kebab-case + ASCII; one prompt JSON per asset; gitignored masters; AVIF + WebP exports for every image; MP4 + WebM + AVIF poster for every video.

---

## 11. Top 10 highest-priority assets to generate first

The shortlist below is what to produce first to make the site instantly look like the $20K+ studio brand it claims to be. Each entry covers an asset **family** (still + loop + poster + mobile when applicable). Prompts are not written here — they live with each asset under `content/ai-prompts/<asset-name>.json`.

1. **`home-hero-cinematic-arm-01-21x9`** — still + 8 s loop + AVIF poster + 9:16 mobile variant. Single biggest brand surface; this is the LCP and the first impression. Preset A.
2. **`home-solution-{homes,offices,institutions,industries,custom}-01-1x1`** (5 tiles) — Preset B square set. Populates the homepage solutions row and is reused at small sizes on the solutions index.
3. **`home-product-{floor-robot,safety-device,appliance-control,custom-rd}-01-1x1`** (4 tiles) — Preset B square set behind product preview cards.
4. **`home-engineering-{navigation,embedded,iot}-01-16x9`** (3 wides) — anchors the credibility-defining engineering pillars.
5. **`products-floor-robot-hero-01-4x5`** (+ `hero-wide-01-21x9` + `iso-01-1x1`) — first product detail page becomes premium; this SKU is the lead concept.
6. **`products-safety-device-hero-01-4x5`** (+ `hero-wide-01-21x9` + `iso-01-1x1`) — second product page (closest to pilot).
7. **`solutions-homes-scene-01-16x9`** + **`solutions-offices-scene-01-16x9`** (Preset C pair) — solutions index gets the four named scenes, starting with the two most-visited.
8. **`solutions-institutions-scene-01-16x9`** + **`solutions-industries-scene-01-16x9`** (Preset C pair) — completes the four-scene set.
9. **`about-hero-lab-01-4x3`** — replaces the `[LAB PHOTO PLACEHOLDER]` glass card; first signal that ARIOT is a real engineering shop.
10. **`blog-cover-{rd,iot-bd,tutorial}-01-16x9`** (3 covers, one per top-priority category) — establishes the blog cover system so any future post inherits the look without bespoke direction.

These ten unlock: (a) a fully premium homepage, (b) two premium product detail pages, (c) the entire solutions index, (d) a credible about hero, and (e) a reusable blog cover system. Everything else is additive elevation.
