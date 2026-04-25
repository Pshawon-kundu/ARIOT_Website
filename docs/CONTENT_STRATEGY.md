# CONTENT_STRATEGY.md

How ARIOT writes for the web. Voice, copy direction by surface, blog topic strategy, SEO seed keywords, support content structure, trust-building patterns, and a CTA library. Pair with `docs/PAGE_BLUEPRINTS.md` (where copy goes) and `docs/PROJECT_BRIEF.md` (why we say what we say).

---

## 1. Brand Voice

ARIOT speaks like an engineer who has built the thing they're describing — confident, precise, generous with detail, never gimmicky.

### Voice attributes

- **Confident, not arrogant.** State capability matter-of-factly. Avoid hype words.
- **Technical, not jargony.** Use accurate terms; explain them once when needed.
- **Human, not corporate.** Short sentences. First-person plural ("we") for the company, second-person ("you") for the reader.
- **Regionally proud, globally credible.** Reference the South Asian context honestly without pandering. Compare against world-class peers.
- **Calm.** No exclamation marks except in genuinely surprising moments. No `🚀`. No "in today's fast-paced world."

### Voice examples

| Avoid | Prefer |
|---|---|
| "Revolutionary AI-powered robotic solutions for the future of industry!" | "A robotic arm engineered for precision pick-and-place at production speed." |
| "We leverage cutting-edge IoT to transform your business." | "We connect machines and sensors so your team gets answers, not raw data." |
| "Best-in-class performance with seamless integration." | "Sub-millimeter repeatability. Standard Modbus and MQTT out of the box." |
| "Get started in minutes!" | "Most teams have a sensor reporting in under an hour." |

### Words we use sparingly

- *"Solution"* — only when accurate. Otherwise: product, system, platform.
- *"Innovative"* — almost never. Show, don't tell.
- *"Empower"*, *"unlock"*, *"transform"* — replace with concrete verbs (*let*, *make possible*, *cut*, *speed up*).
- *"World-class"* — only with evidence (certification, benchmark).

### Words we own (when accurate)

- *Engineered.* (We engineer; we don't assemble.)
- *Autonomous.* (Reserved for actually-autonomous behavior, not branded).
- *Connected.* (For IoT context.)
- *Field-tested.* (Only with a deployment to back it.)
- *Servicable.* (Long-tail support is a positioning lever.)

---

## 2. Bilingual readiness

- All copy is authored in English first.
- Information architecture and components are language-agnostic — no English baked into routes or images-with-text.
- A future Bangla translation phase will reuse the same content models and add a `[locale]` segment. Until then, Bangla copy lives only in the `[BRACKETED]` notes for high-traffic surfaces (home hero, product detail buy box, support article CTA), to be translated by a native speaker.

---

## 3. Surface-by-surface copy direction

### 3.1 Home

- **Hero headline (display-1)**: 5–9 words. Outcome-led, not feature-led.
  - Bracketed seed: `[We engineer the machines and systems that run on autonomy.]`
- **Hero subhead (body-lg)**: 16–22 words. Clarify the *what* and the *for whom*.
  - Seed: `[Robotic arms, autonomous platforms, and connected sensors — designed in Bangladesh, deployed across South Asia.]`
- **Hero CTAs**: primary "Explore products" / "View products". Secondary "Request a quote".
- **Trust strip eyebrow**: `[TRUSTED BY TEAMS BUILDING THE NEXT WAVE OF INDUSTRY]` (replace with reality).
- **Section eyebrows**: 2–4 words, uppercase, cyan. Examples: `WHAT WE BUILD`, `INDUSTRIES WE SERVE`, `WHY ARIOT`, `FROM THE LAB`.
- **Metric band**: short labels (`Years building`, `Active deployments`, `Regional offices`, `Avg. support response`). Numbers are mono and bracketed until real.

### 3.2 Products (catalog)

- **Page title**: "All products".
- **Subhead**: positioning sentence — what range of products, who they're for.
  - Seed: `[Industrial robots, IoT systems, and educational kits — engineered for the South Asian context.]`
- **Filter labels**: short and consistent (Category, Use case, Connectivity, Price, Availability).
- **Empty state**: when no results — `[No matches yet. Try a broader filter, or request a custom build.]`

### 3.3 Product detail

- **Tagline (≤ 14 words)**: outcome + standout spec.
  - Pattern: `<Verb> <outcome> with <standout spec>.`
  - Seed: `[Pick and place at 60 cycles per minute with sub-millimeter repeatability.]`
- **Highlights (3–5 bullets)**: scannable benefit + spec.
- **Spec table**: monospaced values, grouped by Mechanical / Electrical / Connectivity / Environmental / Software.
- **Buy box**:
  - In-stock: "In stock — ships from [CITY] in [N] business days."
  - Backorder: "On backorder — expected to ship by [DATE]."
  - Made-to-order: "Made to order — typical lead time [N] weeks."
- **CTA microcopy**:
  - B2C: "Add to cart".
  - B2B: "Request a quote".
  - Hybrid: both, B2C primary on stock-bearing variants.
- **Downloads**: label as "Datasheet (PDF, 2.4 MB)" — always include format and size.

### 3.4 Solutions

- **Hero**: industry name eyebrow, outcome-led headline.
  - Seed: `[Cut warehouse pick-time by [X]%.]`
- **The problem**: 2–3 short paragraphs. Real pain points; cite credible source when stating numbers.
- **Our approach**: 3 steps maximum. Active voice. ("We deploy", "We integrate", "We monitor".)
- **Tech chips**: product names + protocols.
- **Case study**: real customer or `[BRACKETED]`. Outcome metric over flowery praise.

### 3.5 About

- **Manifesto**: ≤ 240 characters in the hero. The thing the company exists to do.
  - Seed: `[We build the machines and systems that let South Asia automate on its own terms.]`
- **Story timeline**: years + 1-line milestones.
- **Team**: name, role, 1-line bio. Photos are real (no AI portraits).
- **Manufacturing & quality**: what we do in-house, what certifications we hold, what we test against.

### 3.6 Contact + Quote

- **Contact channels**: clear use cases per channel (Sales / Support / Press). Response SLA stated, not implied.
- **Quote form intro**: warm but brief. `[Tell us about your project. We'll respond within [SLA] with the right engineer.]`
- **Form labels**: short ("Industry", "Use case", "Timeline"). Helper text only when truly needed.
- **Confirmation**: thank by name, give the quote ID, set expectation ("An engineer will be in touch within [SLA]"), suggest next read.

### 3.7 Cart + Checkout

- **Cart empty state**: `[Your cart is empty. Browse featured products to get started.]`
- **Order summary labels**: "Subtotal", "Shipping", "Tax (VAT)", "Discount", "Total".
- **Currency switcher**: BDT / USD pill at top-right; persisted across sessions.
- **Checkout micro-copy**:
  - "Where should we ship this?" not "Shipping address".
  - "How would you like to pay?" not "Payment method".
  - "Review and place order" — final CTA.
- **Errors**: human, specific, recoverable. `[That postcode looks off — could you double-check?]`

### 3.8 Support

- **Hub headline**: `[Help, fast.]` — one line.
- **Search placeholder**: "Search manuals, articles, firmware…".
- **Article voice**: imperative for steps; second-person for explanations.
- **"Was this helpful?"** options: "Yes" / "Not really" + optional comment.

---

## 4. Blog / Innovation Lab

### 4.1 Categories (target)

- **Robotics R&D** — internal builds, lab notes, control theory deep-dives.
- **IoT in Bangladesh / South Asia** — regional context, deployments, infrastructure realities.
- **Smart Industry** — vertical case studies (factory, agriculture, energy, smart city).
- **Build Logs** — chronicles of in-progress products and field deployments.
- **Tutorials** — how-to content using ARIOT products and broader robotics/IoT tooling.
- **Engineering Notes** — short-form learnings (failure modes, debugging stories, decisions).

### 4.2 Post types

- **Long-form feature** (1500–2500 words) — flagship pieces with custom imagery.
- **Build log** (800–1500 words) — narrative, image-heavy, dated.
- **Tutorial** (600–1500 words) — step-led, code-heavy where relevant.
- **Engineering note** (300–700 words) — focused observation.
- **Case study** (lives under blog as "feature") — problem, approach, outcome metric.

### 4.3 Editorial principles

- One concrete reader takeaway per post — stated in the intro and revisited at the end.
- Real screenshots, real graphs, real diagrams. Generated imagery is for hero/atmosphere, never for technical evidence.
- Cite sources for any statistic. Link primary sources, not aggregators.
- Code blocks with copy buttons. Specify language and version. Show the file path when relevant.
- Internal links to product pages and other posts (always relevant, never stuffed).

---

## 5. SEO seed topics

Initial cluster of high-value queries to target. Refine quarterly with real data.

### 5.1 Brand cluster

- `ARIOT robotics`
- `ARIOT bangladesh`
- `ARIOT IoT`
- `[product name]` (per SKU)

### 5.2 Category cluster

- `robotics company bangladesh`
- `iot company bangladesh`
- `industrial robotics south asia`
- `smart factory bangladesh`
- `iot solutions bangladesh`
- `robotic arm price in bangladesh`
- `iot gateway bangladesh`
- `lorawan gateway bangladesh`
- `agriculture iot south asia`

### 5.3 Educational long-tail (blog)

- `how to integrate mqtt with [common platform]`
- `best practices industrial wifi bangladesh`
- `iot deployment power reliability south asia`
- `[product] vs [competitor product]`
- `setting up [protocol] sensor network`

### 5.4 Solution-led (industries)

- `automate warehouse picking bangladesh`
- `smart irrigation system south asia`
- `energy monitoring factory bangladesh`
- `smart city infrastructure dhaka`

### 5.5 Support long-tail

- `[product] manual`
- `[product] firmware`
- `[product] not connecting wifi`
- `[product] error [code]`

### 5.6 SEO authoring rules

- Target one primary keyword per page; 2–3 supporting variants.
- Include the keyword in: H1, first 100 words, at least one H2, the slug, the meta title and description.
- Never sacrifice voice for keyword stuffing — readability first.
- Internal links: every blog post links to ≥ 1 product/solution page; every product page links to ≥ 1 supporting blog post when available.

---

## 6. Support content structure

### 6.1 Categories (top level)

- Getting started
- Setup & install
- Connectivity (Wi-Fi / 4G / LoRaWAN / Zigbee)
- Firmware & updates
- Troubleshooting
- Warranty, returns, and shipping
- Account & orders

### 6.2 Article anatomy

1. **Title** — clear problem or task. ("Connect [product] to a 2.4 GHz Wi-Fi network".)
2. **Applies to** — chips listing affected products.
3. **TL;DR** — 1–3 sentence summary.
4. **Steps** — numbered, imperative. Screenshots where helpful.
5. **Verify it worked** — what success looks like.
6. **Still stuck?** — link to relevant article + ticket CTA.
7. **Related** — 3–5 links.

### 6.3 Tone

- Imperative for steps.
- Second-person for explanations.
- Use the customer's likely vocabulary, then the precise term once. ("the gateway — also called the LNS for LoRaWAN networks").

---

## 7. Trust-building copy

### 7.1 Where trust must be reinforced

- Hero (one-liner of credibility, not bragging).
- Buy box (warranty, return policy, ships-from location).
- Quote / contact pages (response SLA, what happens next).
- Footer (certifications, payment-provider logos, address).
- About page (manufacturing, QA, certifications, leadership).

### 7.2 Trust patterns

- **Names + numbers, not adjectives.** Replace "world-class quality" with "Each unit passes a 38-point QA checklist before shipping."
- **Show the room.** Real photo of the lab, the workshop, the team — not stock imagery.
- **Time-bound promises.** "We respond within 1 business day" beats "fast support."
- **Receipts.** Logos of real customers/partners (with permission). Real outcome metrics in case studies.
- **Public docs.** Link to PDFs of certifications, warranty terms, and shipping policies — don't bury them.

### 7.3 Trust microcopy library

- `Free shipping within Bangladesh on orders over [BDT N].`
- `Ships from Dhaka in [N] business days.`
- `[N]-year warranty on all hardware.`
- `Returns accepted within 14 days for unopened items.`
- `We respond to quote requests within 1 business day.`
- `Secure checkout. We never store your card details.`

---

## 8. CTA library

### 8.1 Primary actions (verb + object)

- "Explore products"
- "View product"
- "Add to cart"
- "Proceed to checkout"
- "Place order"
- "Request a quote"
- "Discuss your project"
- "Talk to sales"
- "Open a ticket"
- "Email support"
- "Subscribe"
- "Download datasheet"
- "Read the case study"
- "See it in action"

### 8.2 Secondary / soft

- "Learn more"
- "See specs"
- "Compare"
- "Save for later"
- "Browse featured products"
- "Read the next post"

### 8.3 Microcopy on submit

- Loading: "Sending…", "Placing order…", "Adding…"
- Success: "Quote sent. We'll be in touch.", "Order placed. Check your email.", "Subscribed. Welcome aboard."
- Error: specific and recoverable. Never "Something went wrong."

### 8.4 CTA rules

- One primary CTA per section. Two CTAs per hero maximum.
- Always paired: primary action + low-commitment alternative ("Browse products" / "See specs").
- Buttons say what will happen, not what to do — `Place order`, not `Submit`.

---

## 9. Editorial workflow (when content team comes online)

1. **Brief** — author drafts a 3-line brief (intent, audience, outcome).
2. **Outline** — H1 + H2s before writing prose.
3. **Draft** — first pass at full length.
4. **Edit** — second pass for voice, accuracy, links, SEO.
5. **Review** — engineering review for any technical claim.
6. **Publish** — admin schedules; revalidation kicks in.
7. **Post-publish** — share, internal-link, monitor for 30 days.

---

## 10. Anti-patterns

- Lorem ipsum on any committed page.
- Headline that could appear on any other company's site (the swap test).
- Stat with no source or `[BRACKETED]` placeholder when stats are claimed as real.
- Stock photo of laughing people in suits.
- Buzzword stack ("synergistic, AI-powered, blockchain-enabled").
- Form with more than 7 visible fields (use multi-step).
- Modal popup before the user has done anything.
- Cookie banner that hides the page.
