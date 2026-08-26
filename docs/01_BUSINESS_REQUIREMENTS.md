# 01_BUSINESS_REQUIREMENTS.md

Detailed business requirements for ARIOT Technologies website — aligned with R&D stage reality.

---

## 1. Business Context

### Current Reality (2026)

**Company Stage**: Research & Development — Pre-Commercial  
**Primary Product**: Autonomous industrial floor cleaning robot (prototype stage)  
**Commercial Status**: NOT available for purchase  
**Revenue**: Pre-revenue (R&D funded)  
**Team Size**: Small engineering team  
**Market**: Bangladesh + South Asia (future)

### Strategic Objectives

1. **Establish credibility** for fundraising conversations
2. **Build brand awareness** in robotics/IoT ecosystem
3. **Generate pipeline** for future commercial launch
4. **Showcase engineering capability** without exposing IP
5. **Create scalable foundation** for future business lines

---

## 2. Business Requirements by Stakeholder

### 2.1 Founders / Leadership

**Requirements**:
- Professional web presence for investor due diligence
- Honest representation of R&D stage (no false availability claims)
- Showcase engineering depth without revealing confidential IP
- Foundation ready to scale with business growth
- Premium brand positioning matching global standards

**Success Metrics**:
- Investor feedback on professionalism
- Partnership inquiry quality
- Press mentions citing website
- Time-to-launch for future business lines

---

### 2.2 Investors (Current & Prospective)

**Requirements**:
- Clear company vision and mission
- Evidence of engineering capability
- Transparent R&D stage communication
- Market understanding (regional context)
- Credible team presentation

**What They Need to See**:
- About page with founder/team background
- Technical blog showing real R&D progress
- Clear product vision (without overpromising)
- Engineering-first positioning
- Professional design quality

**Red Flags to Avoid**:
- Vaporware appearance (no substance)
- False availability claims
- Amateur design quality
- Lack of technical depth
- Unrealistic timelines or promises

---

### 2.3 Future Enterprise Customers (Pipeline)

**Requirements**:
- Understand what ARIOT is building
- See engineering capability
- Request quotes for future projects
- Access technical specifications (when available)
- Contact sales/partnership team

**Conversion Path**:
1. Discover via search/referral
2. Learn about autonomous robot R&D
3. Explore solutions page
4. Submit quote request for future consideration
5. Enter sales pipeline

**Content Needs**:
- Robot capability overview (high-level)
- Target use cases and industries
- Quote request form
- Contact information
- Future product roadmap (general)

---

### 2.4 Engineering Community

**Requirements**:
- Technical blog with R&D updates
- Behind-the-scenes engineering content
- Workspace information (when available)
- Newsletter for updates
- Community engagement

**Conversion Path**:
1. Discover via social media / tech communities
2. Read blog posts
3. Subscribe to newsletter
4. Inquire about future workspace
5. Become brand advocates

**Content Needs**:
- Technical blog posts (weekly/bi-weekly)
- R&D progress updates
- Engineering challenges & solutions
- Workspace preview content
- Newsletter signup

---

### 2.5 Press & Media

**Requirements**:
- Company background and story
- Founder profiles
- Press kit (logos, photos, fact sheet)
- Recent news and milestones
- Media contact information

**Content Needs**:
- Press-ready About page
- High-resolution brand assets
- Fact sheet (company stats, milestones)
- Press contact form
- Recent press mentions (when available)

---

## 3. Functional Requirements by Phase

### Phase 1 (Current) — Premium Public Website

#### 3.1 Content Management

**Requirements**:
- Static content managed via code (no CMS yet)
- Product data in TypeScript files
- Blog posts via MDX or static files
- Easy content updates by engineering team

**Out of Scope** (Phase 2):
- Database-backed CMS
- Non-technical content editor
- Admin dashboard

---

#### 3.2 Product Presentation

**Requirements**:
- **Robot page** presenting R&D project (NOT commercial product)
  - High-level capability overview
  - Target applications
  - Clear "Prototype Stage" messaging
  - Quote request CTA (for future commercial inquiries)
  - NO pricing, NO "Add to Cart", NO shipping info

- **Future products** (Workspace, Store, IoT)
  - "Coming Soon" status
  - Vision and concept
  - Inquiry/waitlist forms
  - NO false availability

**Content Requirements**:
- All product descriptions honest about stage
- No confidential technical details (algorithms, navigation, hardware specifics)
- Marketing-appropriate technical depth
- Professional photography/renders (AI-generated where appropriate)

---

#### 3.3 Lead Capture

**Requirements**:

**Quote Request Form** (Primary B2B Conversion)
- Fields: Name, Email, Company, Phone, Project Description, Industry, Timeline, Budget Range, Preferred Contact Method
- Zod validation
- Email delivery to sales team
- Confirmation email to user
- NO CRM integration yet (Phase 2)

**Contact Form** (General Inquiries)
- Fields: Name, Email, Subject, Message
- Zod validation
- Email delivery to info@ariot email
- Confirmation email to user

**Newsletter Subscription**
- Field: Email only
- Zod validation
- Email service integration (Resend/Mailchimp)
- Confirmation email

**Workspace Waitlist** (Future)
- Fields: Name, Email, Intended Use, Expected Start Date
- Email delivery
- "Coming Soon" context

---

#### 3.4 SEO & Discoverability

**Requirements**:
- Dynamic sitemap.xml generation
- Robots.txt configuration
- JSON-LD structured data (Organization, WebSite, Article, Product)
- OpenGraph meta tags for all pages
- Twitter Card meta tags
- Dynamic OG image generation
- Canonical URLs
- XML sitemap submission to Google Search Console

**Target Keywords** (Bangladesh Market):
- "robotics company bangladesh"
- "autonomous robots bangladesh"
- "iot solutions bangladesh"
- "industrial automation bangladesh"
- "robotics workspace dhaka"
- "robotics engineering bangladesh"

**Content SEO**:
- Blog posts optimized for long-tail keywords
- Technical content for "how to" queries
- Local SEO for Dhaka/Bangladesh

---

#### 3.5 Performance Requirements

**Requirements**:
- Lighthouse mobile score ≥ 90
- Core Web Vitals targets:
  - LCP (Largest Contentful Paint) ≤ 2.5s on 4G
  - FID (First Input Delay) ≤ 100ms
  - CLS (Cumulative Layout Shift) ≤ 0.1
- Time to Interactive ≤ 3.5s on mobile
- First Contentful Paint ≤ 1.8s

**Optimization Strategies**:
- Image optimization (AVIF/WebP, lazy loading)
- Font subsetting and preloading
- Code splitting and lazy loading
- CDN for static assets (Phase 2)
- Caching strategy (ISR in Phase 2)

---

#### 3.6 Accessibility Requirements

**Requirements**:
- WCAG 2.2 Level AA compliance
- Keyboard navigation support
- Screen reader compatibility
- Focus visible indicators
- Semantic HTML structure
- Alt text for all images
- Color contrast ≥ 4.5:1 for body text
- Color contrast ≥ 3:1 for large text/UI
- Skip links for keyboard navigation

**Testing**:
- axe-core DevTools scan (zero violations)
- Keyboard navigation manual test
- Screen reader test (NVDA/JAWS)
- Color contrast verification

---

#### 3.7 Analytics & Tracking

**Requirements**:
- Vercel Analytics (Core Web Vitals)
- Plausible Analytics (privacy-friendly, no cookies)
- Event tracking:
  - Quote form submissions
  - Contact form submissions
  - Newsletter signups
  - Product page views
  - Blog post reads
  - CTA clicks

**Out of Scope**:
- Google Analytics (privacy concerns)
- Facebook Pixel / ad tracking
- Session recording
- Heatmaps (defer to Phase 2+)

---

#### 3.8 Email Delivery

**Requirements**:
- Transactional email service (Resend)
- Email templates matching design system
- Emails delivered:
  - Quote request → sales team + user confirmation
  - Contact form → info@ + user confirmation
  - Newsletter signup → welcome email
- SPF/DKIM/DMARC configuration
- Email deliverability monitoring

---

#### 3.9 Security Requirements

**Requirements**:
- HTTPS only (SSL certificate)
- Security headers:
  - HSTS (Strict-Transport-Security)
  - X-Content-Type-Options: nosniff
  - X-Frame-Options: DENY
  - Referrer-Policy: strict-origin-when-cross-origin
- Rate limiting on form endpoints (10 req/min per IP)
- CSRF protection (Next.js Server Actions built-in)
- Input validation (Zod at every boundary)
- No secrets in client bundles
- Environment variable validation

**Out of Scope** (Phase 3):
- User authentication
- Payment processing security
- PCI compliance

---

### Phase 2 — CMS & Admin Dashboard

**Deferred Requirements**:
- Prisma database schema
- Admin authentication (Auth.js / Clerk)
- RBAC (super_admin, content_admin)
- Product CRUD interface
- Blog post CRUD interface
- Media library
- Admin audit log
- On-demand revalidation

**Reason for Deferral**: No active content team yet; engineering team can manage static content in Phase 1.

---

### Phase 3 — E-commerce

**Deferred Requirements**:
- Shopping cart
- Checkout flow
- Payment integration (bKash, Nagad, SSLCommerz)
- Customer accounts
- Order management
- Inventory management
- Shipping integration
- Tax calculation

**Reason for Deferral**: No commercial products available yet; robot is R&D stage.

---

### Phase 4 — Support & Ticketing

**Deferred Requirements**:
- Support ticket system
- Customer portal
- Ticket assignment and SLAs
- Knowledge base CMS
- Search functionality

**Reason for Deferral**: No active customers yet; static KB sufficient for Phase 1.

---

### Phase 5 — IoT & Device Features

**Deferred Requirements**:
- Device telemetry dashboard
- Firmware OTA updates
- Remote diagnostics
- Fleet management
- API for device integration

**Reason for Deferral**: No commercial IoT products deployed yet.

---

## 4. Non-Functional Requirements

### 4.1 Brand & Design

**Requirements**:
- Premium design quality matching global brands (Apple, Stripe, Linear, Vercel)
- Minimal, clean aesthetic
- White background with large whitespace
- Engineering-focused (not consumer gadget style)
- No unnecessary animations or cyberpunk style
- Consistent design system across all pages

**Design Philosophy**:
- Form follows function
- Clarity over cleverness
- Confidence without arrogance
- Technical without jargon

---

### 4.2 Content Quality

**Requirements**:
- All copy professionally written (no lorem ipsum)
- `[BRACKETED_PLACEHOLDERS]` for pending content
- Honest R&D stage communication
- No false availability or capability claims
- Technical accuracy in all product descriptions
- No confidential IP exposure

**Content Review Process**:
- Founder approval for About, Robot, Vision content
- Engineering review for technical blog posts
- Legal review for Terms, Privacy (before publish)

---

### 4.3 Scalability

**Requirements**:
- Architecture supports future business lines
- Component library reusable for new features
- Design system tokens for easy theming
- Database schema planned (Phase 2)
- Authentication ready to add (Phase 2)
- Cart/checkout architecture planned (Phase 3)

**Growth Projections**:
- Phase 1: 100-500 monthly visitors (early stage)
- Phase 2: 1,000-5,000 monthly visitors (commercial launch)
- Phase 3: 10,000+ monthly visitors (e-commerce active)

---

### 4.4 Maintainability

**Requirements**:
- TypeScript strict mode (zero `any` types)
- ESLint passing with zero warnings
- Prettier formatting enforced
- Component documentation (TSDoc for complex components)
- Git commit conventions (Conventional Commits)
- Clean git history

**Code Quality Gates**:
- Type check passing (`pnpm typecheck`)
- Lint passing (`pnpm lint`)
- Build succeeding (`pnpm build`)
- No console errors in production

---

### 4.5 Deployment

**Requirements**:
- Vercel deployment (recommended)
- Preview deployments for all branches
- Production deployment on merge to `main`
- Environment variables managed securely
- Database connection (Phase 2)
- CDN for static assets (Phase 2)

**Deployment Checklist**:
- Environment variables configured
- Domain DNS configured
- SSL certificate active
- Analytics configured
- Email service configured
- Error monitoring (Sentry recommended, Phase 2)

---

## 5. Content Requirements by Page

### 5.1 Homepage

**Requirements**:
- Hero section with 3D scene or premium video (cinematic moment)
- Company mission statement
- R&D focus section (autonomous robot)
- Future business lines preview (workspace, store, IoT)
- Engineering depth signal (blog preview, tech stats)
- Social proof (press mentions, partnerships when available)
- Newsletter CTA
- Quote request CTA

**Content Blocks** (8 sections):
1. Hero (3D/video + headline + CTA)
2. Mission (company vision)
3. R&D Focus (robot overview)
4. Engineering Depth (technical capability)
5. Future Vision (workspace, store, IoT)
6. Blog Preview (latest 3 posts)
7. Metrics (engineering stats)
8. CTA Band (quote request)

---

### 5.2 Robot/Product Page

**Requirements**:
- Clear "Prototype Stage / R&D Project" messaging
- High-level capability overview (NO confidential details)
- Target applications and use cases
- Technical specifications (public-safe details only)
- Professional renders or AI-generated visuals
- Quote request CTA (for future commercial inquiries)
- NO pricing, NO "Add to Cart", NO availability date

**Content Sections**:
1. Hero (robot image + "R&D Project" badge)
2. Overview (what it does, why it matters)
3. Target Applications (industries, use cases)
4. Technical Approach (high-level, no IP)
5. R&D Progress (milestones without dates)
6. Quote Request CTA

---

### 5.3 Workspace Page

**Requirements**:
- "Coming Soon" status clear
- Vision for engineering co-working lab
- Planned facilities list (workbench, soldering, 3D printer, etc.)
- Target users (students, startups, engineers)
- Waitlist signup form
- NO pricing, NO availability date

---

### 5.4 Store Page

**Requirements**:
- "Coming Soon" status clear
- Vision for component/equipment shop
- Target product categories
- Newsletter signup for launch updates
- NO product catalog yet

---

### 5.5 About Page

**Requirements**:
- Company mission and vision
- Founder profiles (when ready)
- Team overview (or "small engineering team" placeholder)
- Engineering philosophy
- R&D stage transparency
- Timeline (general milestones, no dates)
- Contact information

**Content Sections**:
1. Mission & Vision
2. Team (founders + key members or placeholder)
3. Engineering Approach
4. R&D Stage Honesty
5. Future Roadmap (general)
6. Contact CTA

---

### 5.6 Blog

**Requirements**:
- Technical blog focused on R&D updates
- Target frequency: 1-2 posts per month (realistic for small team)
- Content types:
  - Engineering challenges & solutions
  - R&D progress updates
  - Industry insights
  - Technical tutorials
  - Behind-the-scenes
- SEO-optimized for long-tail keywords
- Social sharing enabled

---

### 5.7 Support/Resources

**Requirements**:
- Knowledge base (static articles in Phase 1)
- FAQ section
- Manuals (when products launch)
- Firmware downloads (when products launch)
- Contact support CTA
- NO ticket system yet (Phase 4)

---

### 5.8 Legal Pages

**Requirements** (All required for Phase 1 launch):
1. **Privacy Policy**
   - Data collection disclosure (analytics, forms)
   - Email storage and use
   - Third-party services (Vercel, Resend, Plausible)
   - User rights (GDPR-ready even for BD market)

2. **Terms of Service**
   - Website use terms
   - Intellectual property
   - Disclaimer of warranties (R&D stage)
   - Limitation of liability

3. **Cookie Policy**
   - Analytics cookies (Plausible is cookie-free, note this)
   - No tracking/advertising cookies

4. **Warranty Policy** (placeholder for future products)
   - "Not applicable — no commercial products yet"
   - Framework for future warranty terms

5. **Shipping & Returns** (placeholder for future e-commerce)
   - "Not applicable — no e-commerce yet"
   - Framework for future shipping/return policy

---

## 6. Technical Stack Requirements

### Frontend
- ✅ Next.js 16+ (App Router)
- ✅ React 19+
- ✅ TypeScript (strict mode)
- ✅ Tailwind CSS v4
- ✅ Motion (Framer Motion successor)
- ❌ React Three Fiber (for 3D hero) — **TO BE ADDED**

### Forms & Validation
- ✅ React Hook Form
- ✅ Zod validation

### Backend (Phase 1)
- ❌ Prisma (deferred to Phase 2)
- ❌ PostgreSQL (deferred to Phase 2)
- ❌ Resend (email delivery) — **TO BE ADDED**

### Deployment & Infrastructure
- Vercel (recommended)
- Vercel Analytics
- Plausible Analytics
- Domain + SSL

---

## 7. Success Criteria by Phase

### Phase 1 Success Criteria

**Technical**:
- [ ] Lighthouse mobile ≥90 on 5 key pages
- [ ] LCP ≤2.5s on 4G (WebPageTest from regional location)
- [ ] WCAG 2.2 AA passes axe-core
- [ ] Zero TypeScript errors
- [ ] Zero ESLint warnings
- [ ] Build succeeds
- [ ] All forms deliver email end-to-end

**Content**:
- [ ] No lorem ipsum (only `[BRACKETED]` placeholders)
- [ ] Robot page clearly states "R&D / Prototype Stage"
- [ ] All future business lines marked "Coming Soon"
- [ ] At least 3 blog posts published
- [ ] Legal pages complete (privacy, terms, cookies)

**Design**:
- [ ] Consistent design system across all pages
- [ ] Premium visual quality (founder approval)
- [ ] 3D hero scene or equivalent cinematic moment
- [ ] Mobile responsive on all pages
- [ ] Focus states visible for keyboard navigation

**Business**:
- [ ] Quote form working end-to-end
- [ ] Contact form working end-to-end
- [ ] Newsletter signup working
- [ ] Analytics tracking configured
- [ ] Founder approval for public launch

---

## 8. Launch Checklist

### Pre-Launch

**Technical**:
- [ ] Domain purchased and DNS configured
- [ ] SSL certificate active
- [ ] Email service configured (Resend + SPF/DKIM/DMARC)
- [ ] Analytics configured (Vercel + Plausible)
- [ ] Error monitoring (Sentry recommended)
- [ ] Sitemap submitted to Google Search Console
- [ ] Performance audit passed (Lighthouse ≥90)
- [ ] Accessibility audit passed (axe-core zero violations)
- [ ] Cross-browser testing (Chrome, Firefox, Safari, Edge)
- [ ] Mobile device testing (iOS Safari, Android Chrome)

**Content**:
- [ ] All pages reviewed and approved
- [ ] Legal pages reviewed by founder/advisor
- [ ] All images optimized and have alt text
- [ ] All links tested and working
- [ ] 404 page tested
- [ ] Error page tested

**Business**:
- [ ] Quote form tested end-to-end (email delivery confirmed)
- [ ] Contact form tested end-to-end
- [ ] Newsletter signup tested
- [ ] Email templates reviewed and tested
- [ ] Social media accounts created (LinkedIn, Twitter/X)
- [ ] Press kit prepared (if launching with PR)

### Post-Launch

**Week 1**:
- [ ] Monitor analytics daily
- [ ] Monitor form submissions
- [ ] Monitor error logs
- [ ] Fix any critical bugs
- [ ] Respond to all quote/contact requests within 24h

**Month 1**:
- [ ] Publish 2 blog posts
- [ ] Monitor SEO rankings
- [ ] Collect user feedback
- [ ] Plan content calendar for Month 2-3
- [ ] Review analytics and iterate

---

## 9. Out of Scope (Explicitly Deferred)

### Phase 2+ (Do NOT build in Phase 1)

❌ Database + Prisma schema  
❌ Admin dashboard  
❌ CMS for content management  
❌ User authentication  
❌ Shopping cart  
❌ Checkout flow  
❌ Payment integration  
❌ Customer accounts  
❌ Order management  
❌ Support ticketing  
❌ IoT device dashboard  
❌ Firmware OTA updates  
❌ Multi-language (Bangla translation)  
❌ CDN setup  
❌ Advanced caching (ISR)  

**Reason**: These features require commercial products, active customers, or content team — none exist at R&D stage.

---

## 10. Risks & Mitigations

### Risk: Perceived as Vaporware

**Likelihood**: Medium  
**Impact**: High (damages credibility)

**Mitigation**:
- Honest "R&D / Prototype Stage" messaging
- Technical blog showing real engineering work
- Behind-the-scenes content
- No false availability claims
- No unrealistic timelines

---

### Risk: IP Exposure

**Likelihood**: Low (if guidelines followed)  
**Impact**: Critical (competitive disadvantage)

**Mitigation**:
- High-level product descriptions only
- No algorithm, navigation, or hardware details
- No internal roadmap or timelines
- Founder review of all robot-related content
- Marketing-appropriate technical depth

---

### Risk: Overbuilt for Current Stage

**Likelihood**: Medium  
**Impact**: Medium (wasted time/money)

**Mitigation**:
- Strict Phase 1 scope adherence
- No database work until Phase 2
- No e-commerce until Phase 3
- Regular scope reviews with founder

---

### Risk: Low Traffic / No Pipeline

**Likelihood**: Medium (early stage)  
**Impact**: Low (expected for R&D stage)

**Mitigation**:
- SEO optimization from Day 1
- Content marketing via blog
- Social media presence
- Press outreach (if budget allows)
- Patience (website is long-term asset)

---

**Last Updated**: 2026-07-02  
**Stage**: R&D / Pre-Commercial  
**Next Review**: Phase 1 completion or when transitioning to commercial stage
