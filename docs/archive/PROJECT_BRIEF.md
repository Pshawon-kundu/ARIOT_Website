# PROJECT_BRIEF.md

The strategic context for ARIOT. Read this before any branding, copy, or product decision.

---

## 1. Company Overview

**ARIOT** — *Autonomous Robotics and IoT* — is a robotics and connected-device company building autonomous machines and intelligent IoT systems for industry, smart cities, education, and prosumers across Bangladesh and South Asia. The product portfolio spans (target categories, to be filled with concrete SKUs as they are developed):

- **Industrial robotics** — robotic arms, AGVs/AMRs, vision-guided pick-and-place stations.
- **Smart-city and infrastructure IoT** — environmental sensors, energy monitoring, fleet telematics.
- **Smart-building IoT** — gateways, controllers, smart-meter retrofits.
- **Prosumer & education** — drones, dev kits, educational robotics platforms, sensor modules.
- **Custom solutions** — bespoke robotics + IoT integration for enterprise clients (delivered via the quote funnel).

ARIOT positions itself as the regionally rooted, globally credible engineering brand — built in South Asia, designed to a world-class bar.

---

## 2. Brand Positioning

**One-liner**: *Autonomous machines and intelligent systems, engineered for the real world.*

**Pillars**:

1. **Engineered, not assembled.** Real R&D, not rebadged imports.
2. **Regionally rooted.** Designed for South-Asian conditions — power volatility, monsoon climate, mixed-language operators, BDT pricing.
3. **Globally credible.** Documentation, finish, and code quality match international peers.
4. **Open and serviceable.** Long-tail support, downloadable manuals, firmware history, repair-friendly designs.
5. **Premium without arrogance.** Confident voice, never gimmicky, never hype-driven.

**Competitive frame**: visitors should perceive ARIOT alongside names like Boston Dynamics, Universal Robots, Particle, Ubidots, and DJI — adapted to a regional context — and *above* low-effort regional resellers.

---

## 3. Target Audience

### Primary segments

1. **Enterprise & industrial buyers (B2B)** — factory automation managers, smart-city tender bodies, utility operators, large agricultural operators.
   - Decision drivers: reliability, support, compliance, total cost of ownership.
   - Conversion path: Solutions → Case study → Quote request.

2. **System integrators & OEMs** — engineering firms specifying ARIOT modules inside larger projects.
   - Drivers: spec sheets, datasheets, API docs, lead times, partner program.
   - Conversion path: Products → Spec/datasheet download → Quote / partner contact.

3. **Prosumer & SME buyers (B2C)** — independent makers, small businesses, agritech entrepreneurs.
   - Drivers: clear pricing, reviews, fast checkout, in-country delivery.
   - Conversion path: Products → Product detail → Add to cart → Checkout.

4. **Educators & students** — universities, polytechnics, robotics clubs.
   - Drivers: kit pricing, tutorials, community, bulk discounts.
   - Conversion path: Education hub → Product → Cart or quote.

### Secondary segments

- **Press, investors, partners** — looking for credibility signals (about page, leadership, news, certifications).
- **Job seekers** — careers section in a later phase.

### Audience tone calibration

- All audiences read English on the site by default. Bangla bilingual layer is reserved for a later phase but information architecture must allow it (no English baked into routes).

---

## 4. Website Goals

1. **Establish premium credibility** within 5 seconds of landing.
2. **Make products understandable** to both technical and non-technical visitors on the same page.
3. **Capture intent** through three clear conversion paths: quote, purchase, ticket.
4. **Educate the market** through a credible blog / innovation lab.
5. **Service existing customers** with downloadable manuals, firmware, and a ticket system.
6. **Scale operations** with an internal admin dashboard that replaces ad-hoc spreadsheets.

---

## 5. Business Goals

- **Lead volume**: measurable monthly increase in qualified B2B quote requests.
- **Online revenue**: enable direct B2C sales for SKUs that don't require integration.
- **Support deflection**: cut email-only support volume by surfacing self-service docs and tickets.
- **Brand asset**: the website becomes the company's strongest sales asset, used by the team in pitches and proposals.
- **Operational lift**: admin dashboard replaces spreadsheet-driven product, order, and ticket tracking.

---

## 6. Conversion Goals

| Conversion | Surface | Trigger |
|---|---|---|
| **Quote request** | Solutions, Product detail (B2B SKUs), Contact, sticky CTA | "Request a quote" |
| **Purchase** | Product detail (B2C SKUs), Cart, Checkout | "Add to cart" → checkout |
| **Support ticket** | Support hub, Account dashboard | "Open a ticket" |
| **Newsletter / innovation lab** | Footer, Blog, Home | "Subscribe" |
| **Document download** | Product detail (datasheet/manual) | "Download" — gated only when sales-relevant |
| **Account creation** | Checkout, Account, Support | Soft-prompted, never blocking guest cart |

---

## 7. Technical Goals

- **Performance**: Lighthouse mobile ≥ 90 on Performance, Accessibility, Best Practices, SEO. LCP ≤ 2.5 s on a regional 4G profile.
- **Reliability**: zero un-handled errors in production; observability hooks from Phase 1.
- **SEO**: full metadata, sitemap, structured data (Product, Article, Organization, BreadcrumbList).
- **Accessibility**: WCAG 2.2 AA across public pages.
- **Maintainability**: every system has a doc; every doc has an owner.
- **Internationalization-ready**: routes and content models avoid hard-coded language.
- **Security**: server-validated everything; secrets only on the server; rate-limited public endpoints.

---

## 8. Visual Goals

- **Premium dark aesthetic** — near-black/graphite base, brushed-steel neutrals, **electric cyan** signature accent.
- **Cinematic hero moments** — every top-level page has one moment of "wow" (3D, video loop, or large-scale imagery).
- **Engineering precision** — micro-grids, monospaced specs, blueprint-style annotations on technical sections.
- **Calm density** — pages can carry information without feeling crowded; whitespace is intentional, not lazy.
- **Motion as narrative** — animations communicate something (a product capability, a data flow), they are not decoration.
- **Consistency above novelty** — every section visibly belongs to the same product.

---

## 9. Non-Goals

- **No gimmicky AI chatbot** plastered on the homepage. Support is structured (KB + tickets).
- **No dark patterns.** No fake countdown timers, no forced sign-ups before viewing prices.
- **No template look.** The site must not be confusable with a generic Tailwind starter.
- **No lorem ipsum on launch.** Every visible string is real or `[BRACKETED]`.

---

## 10. Success Metrics (post-launch reference)

- LCP, INP, CLS within Core Web Vitals "good" thresholds on regional 4G.
- ≥ 30% reduction in time-to-quote-acknowledgement vs. email-only baseline.
- ≥ 90 Lighthouse on top 5 templates (home, product detail, blog post, support article, checkout).
- Admin team reports the dashboard replaces ≥ 80% of their spreadsheet workflow.
