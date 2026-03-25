# SEO 2026 Implementation To-Do List

> Prioritized, actionable tasks based on the [SEO 2026 Guide](./SEO-2026-GUIDE.md) and a full audit of [ambitionvalley.nl](https://ambitionvalley.nl).
>
> **Where**: Tasks marked `[Webflow]` must be done in the Webflow Designer/CMS. Tasks marked `[Code]` are done in this codebase (check.ambitionvalley.nl / SEO engine). Tasks marked `[Both]` require changes in both places.

---

## Legend

- **Priority**: P0 (critical — do immediately), P1 (high impact), P2 (medium), P3 (nice to have)
- **Effort**: S (small, <2h), M (medium, 2-8h), L (large, 1-3 days), XL (extra large, 3+ days)
- **Status**: `[ ]` todo, `[x]` done, `[-]` skipped

---

## Phase 0: Critical Fixes — Trust & Credibility Damage (Week 1)

> These issues actively harm SEO, trust, and potentially legal standing. Fix before anything else.

### 0.1 Remove Harmful Content

- [x] **P0 / S** `[Webflow]` — Delete or noindex the fake testimonials page (`/testimonials`)
  - Contains obvious placeholder names: "Nansi Links", "Robert Ban", "Olga Fox", "Bob Links", etc.
  - Generic text about "accounting website" — not AmbitionValley-specific
  - **Fake reviews destroy E-E-A-T trust and may violate Dutch consumer protection law**
  - Action: Delete the page entirely or set to `noindex, nofollow` in Webflow page settings

- [x] **P0 / M** `[Webflow]` — Remove or noindex all 25+ template/junk pages
  - These Webflow template leftovers are indexed and diluting site quality:

  | Pages to Remove/Noindex | URLs |
  |------------------------|------|
  | Shop & products | `/shop`, `/product/black-pen`, `/product/computer-mouse`, `/product/glasses`, `/product/mouse-pad`, `/product/notebook`, `/product/set-of-wood` |
  | Categories | `/category/accessories`, `/category/office` |
  | Checkout | `/checkout`, `/paypal-checkout`, `/order-confirmation` |
  | Templates | `/templates/changelog`, `/templates/licensing`, `/templates/style-guide` |
  | Portfolio/Projects | `/portfolio`, `/projects/analysis`, `/projects/diversification-strategies`, `/projects/dynamic-wealth`, `/projects/metrics`, `/projects/navigating-market-volatility`, `/projects/strategies` |
  | Other | `/coming-soon`, `/search` |

  - For each: Webflow Page Settings → SEO → uncheck "Index" or add `<meta name="robots" content="noindex, nofollow">`
  - Better yet: delete the pages entirely if they serve no purpose
  - Also noindex utility pages: `/bedankt/*`, `/betaling/*`, `/form`

### 0.2 Fix Incorrect/Misleading Content

- [x] **P0 / S** `[Webflow]` — Fix all page titles containing "Accountant" *(done via API script)*
  - **AmbitionValley is NOT an accounting firm** — this is misleading to users and Google
  - Pages affected:
    - `/team/hakan-sahingoz` → Change "Hakan Sahingoz - Accountant" to "Hakan Sahingoz - Oprichter & Strategisch Lead"
    - `/team/ramin` → Change "Ramin Nourzad - Accountant" to "Ramin Nourzad - Oprichter & Fiscalist (LL.M)"
    - `/services/financiele-strategie` → Change "... - Accountant" to "Financiele Strategie | Ambition Valley"
    - `/services/belastingoptimalisatie` → Change "... - Accountant" to "Belastingoptimalisatie | Ambition Valley"
    - `/services/vermogensopbouw-and-asset-allocatie` → Change title accordingly
    - `/services/bv-and-holding-voor-ondernemers` → Change title accordingly
    - `/services/dashboard-and-community` → Change title accordingly
    - `/services/aangiftes-and-compliance` → Change title accordingly

- [ ] **P0 / M** `[Webflow]` — Fix service pages with mismatched template content
  - `/services/vermogensopbouw-and-asset-allocatie` has payroll processing text
  - `/services/bv-and-holding-voor-ondernemers` has bookkeeping text
  - `/services/aangiftes-and-compliance` has auditing text
  - All service pages show "Customized Solutions: 95 / Auditing: 98" metrics (template placeholder)
  - Currency shows **USD** instead of **EUR** on multiple pages
  - **Action**: Rewrite each service page with actual, unique content matching the service described

- [ ] **P0 / S** `[Webflow]` — Fix Google Maps on contact page (`/contact-us`)
  - Currently points to **New Jersey, USA** — must be **Laanstraat 82-04, 3762 KE Soest, Nederland**
  - Replace the map embed with the correct Google Maps coordinates

- [ ] **P0 / S** `[Webflow]` — Fix phone number inconsistency
  - Contact page shows `+31 6 12 34 56 78` (placeholder!)
  - Other pages show `+31 6 36 16 78 12` (real number)
  - Standardize to the real number across all pages

- [ ] **P0 / S** `[Webflow]` — Fix broken Instagram link in footer
  - Currently links to `instagram.com` (root) instead of the actual AmbitionValley profile
  - Update to correct Instagram profile URL

- [ ] **P0 / S** `[Webflow]` — Fix LinkedIn link in footer
  - Currently links to Ramin's personal profile, not a company page
  - Create a LinkedIn company page for Ambition Valley and link to that

- [ ] **P1 / S** `[Webflow]` — Fix spelling errors in Dutch content
  - Homepage: "redement" → "rendement"
  - Review all pages for similar typos
  - Spelling errors hurt trust signals (E-E-A-T)

- [ ] **P1 / S** `[Webflow]` — Update copyright year
  - Footer shows "© 2025" — update to "© 2025-2026" or "© 2026"

---

## Phase 1: Meta Tags & Basic SEO Hygiene (Week 1-2)

> Almost every page is missing meta descriptions. This is the lowest-effort, highest-impact fix.

### 1.1 Add Meta Descriptions to All Pages

- [x] **P0 / M** `[Webflow]` — Add unique meta descriptions to all pages *(done via API script for werkwijze, over-ons, 1-op-1; others already had them)*
  - In Webflow: Page Settings → SEO Settings → Meta Description
  - Target: 120-160 characters, include primary keyword, compelling CTA

  | Page | Suggested Meta Description (NL) |
  |------|-------------------------------|
  | `/over-ons` | "Leer het team achter Ambition Valley kennen. Universitair opgeleide fiscalisten die je helpen belasting te besparen en vermogen op te bouwen." |
  | `/ons-team` | "Maak kennis met Hakan Sahingoz en Ramin Nourzad — de oprichters van Ambition Valley. Strategie en fiscale expertise onder een dak." |
  | `/werkwijze` | "Ontdek hoe Ambition Valley werkt: van intake en analyse tot strategie en implementatie. Persoonlijk, resultaatgericht en transparant." |
  | `/faq` | "Veelgestelde vragen over Ambition Valley. Alles over onze pakketten, werkwijze, garantie en fiscale begeleiding." |
  | `/1-op-1` | "Persoonlijke 1-op-1 begeleiding bij belastingoptimalisatie en vermogensgroei. Drie pakketten met 100% terugverdiengarantie." |
  | `/groepsdagen` | "Leer in groepsverband over belastingbesparing, vermogensopbouw en BV-structuren. Praktisch, betaalbaar en resultaatgericht." |
  | `/contact-us` | "Neem contact op met Ambition Valley. Plan een gratis intake of stel je vraag via e-mail, telefoon of WhatsApp." |
  | `/blog` | "Praktische artikelen over belastingbesparing, vermogensgroei en fiscale tips voor ondernemers en zzp'ers. Helder en toepasbaar." |
  | `/pricing` | "Bekijk de pakketten en prijzen van Ambition Valley. Vanaf €995 met 100% terugverdiengarantie." |
  | Each blog post | Write unique descriptions per post using the post summary (max 160 chars) |
  | Each service page | Write unique descriptions matching the actual service content |

### 1.2 Fix Page Titles

- [ ] **P0 / S** `[Webflow]` — Optimize page titles for primary keywords
  - Follow pattern: `[Primary Keyword] | Ambition Valley`
  - Current titles are mostly just "Page Name | Ambition Valley" — add keywords

  | Page | Current Title | Suggested Title |
  |------|---------------|----------------|
  | `/` | "Ambition Valley" | "Belastingbesparing & Vermogensgroei | Ambition Valley" |
  | `/over-ons` | "Over ons \| Ambition Valley" | OK (keep) |
  | `/werkwijze` | "Hoe wij werken \| Ambition Valley" | "Onze Werkwijze: Van Intake tot Resultaat \| Ambition Valley" |
  | `/faq` | "Veelgestelde vragen \| Ambition Valley" | "FAQ: Veelgestelde Vragen \| Ambition Valley" |
  | `/blog` | "Ons Blog" | "Blog: Fiscale Tips & Vermogensgroei \| Ambition Valley" |

### 1.3 Fix Image Alt Text

- [x] **P0 / M** `[Webflow]` — Add descriptive alt text to all blog images *(done via API — all 10 posts updated with descriptive alt text + author name)*
  - **All blog images use "Blog Img"** — this is terrible for SEO and accessibility
  - Replace with descriptive text: "Overzicht Box 3 vermogensbelasting wijzigingen 2026"
  - **All logo/icon images use "icon" or empty** — add context: "Ambition Valley logo", "Belastingbesparing icoon"
  - **Team photos**: "Hakan Sahingoz - Oprichter Ambition Valley", "Ramin Nourzad - Fiscalist LL.M"
  - Alt text max: 125 characters, include relevant keywords naturally

---

## Phase 2: Structured Data & Schema Markup (Week 2-3)

> No structured data exists on the Webflow site beyond basic Organization schema on check.ambitionvalley.nl. This is the biggest missed opportunity for rich results (35% higher CTR).

### 2.1 Webflow Site Schema (via Custom Code)

- [ ] **P0 / M** `[Webflow]` — Add `FAQPage` schema to `/faq` page
  - Webflow: Page Settings → Custom Code → Before `</body>`
  - Inject JSON-LD with all 12 FAQ questions and answers
  - This is a **huge missed opportunity** — FAQ schema drives rich snippets in Google
  - Also add FAQ schema to FAQ sections on `/1-op-1` and `/groepsdagen`

- [ ] **P0 / M** `[Webflow]` — Add `Article` schema to all blog posts
  - Use Webflow CMS embed or custom code in blog post template
  - Fields: headline, description, author (Person), datePublished, dateModified, image, publisher
  - Pull dynamic values from CMS fields

- [ ] **P1 / S** `[Webflow]` — Add `LocalBusiness` schema to contact page and homepage
  - JSON-LD with: name, address (Laanstraat 82-04, Soest), phone, email, openingHours, geo coordinates
  - Ensure NAP matches Google Business Profile exactly

- [ ] **P1 / S** `[Webflow]` — Add `Person` schema to team pages
  - `/team/hakan-sahingoz`: name, jobTitle, worksFor, url, sameAs (LinkedIn)
  - `/team/ramin`: name, jobTitle (Fiscalist LL.M), worksFor, url, sameAs (LinkedIn, Instagram)

- [ ] **P1 / S** `[Webflow]` — Add `BreadcrumbList` schema
  - Blog posts: Home → Blog → [Post Title]
  - Service pages: Home → Services → [Service Name]
  - Team pages: Home → Ons Team → [Person Name]

- [ ] **P1 / S** `[Webflow]` — Add `Service` schema to service pages
  - Each service page: serviceType, provider (Organization), areaServed, description

- [ ] **P2 / S** `[Webflow]` — Add `PriceSpecification` schema to pricing page
  - Three packages with prices, currency (EUR), eligibility

### 2.2 check.ambitionvalley.nl Schema

- [x] **P1 / S** `[Code]` — Enhance existing Organization schema
  - File: `src/components/seo/StructuredData.tsx`
  - Added: legalName, foundingDate, founders (Person), address (PostalAddress), contactPoint with phone/email, sameAs, knowsAbout

- [x] **P1 / S** `[Code]` — Add Article/FAQ/Breadcrumb schema components
  - File: `src/components/seo/ArticleSchema.tsx` — Reusable Article JSON-LD
  - File: `src/components/seo/FAQSchema.tsx` — Reusable FAQPage JSON-LD
  - File: `src/components/seo/BreadcrumbSchema.tsx` — Reusable BreadcrumbList JSON-LD

### 2.3 Schema in Content Generator

- [ ] **P1 / S** `[Code]` — Add schema validation to SEO validator
  - File: `src/integrations/seo-engine/lib/seo-validator.ts`
  - Validate JSON-LD structure before publishing to Webflow
  - Check required fields per schema type (Article, FAQ)
  - Flag missing author, date, or image data

---

## Phase 3: Webflow Site Content Improvements (Week 2-4)

> Fix content quality issues found during the audit.

### 3.1 Service Pages Overhaul

- [ ] **P0 / L** `[Webflow]` — Rewrite all 6 service detail pages with unique, relevant content
  - Each page needs: 400-800 words of unique content specific to that service
  - Remove all template/placeholder content (payroll, bookkeeping, auditing text)
  - Remove "Customized Solutions: 95 / Auditing: 98" metrics from all pages
  - Fix currency from USD to EUR where applicable
  - Include: what the service involves, who it's for, expected outcomes, process
  - Add internal links to related blog posts
  - Pages:
    - `/services/financiele-strategie`
    - `/services/belastingoptimalisatie`
    - `/services/vermogensopbouw-and-asset-allocatie`
    - `/services/bv-and-holding-voor-ondernemers`
    - `/services/dashboard-and-community`
    - `/services/aangiftes-and-compliance`

### 3.2 Team Pages Enhancement

- [ ] **P1 / M** `[Webflow]` — Expand team member bios for E-E-A-T
  - `/team/hakan-sahingoz`:
    - Add detailed bio: background, experience, qualifications, expertise areas
    - Add LinkedIn URL
    - Fix heading hierarchy (currently uses H6 for names)
  - `/team/ramin`:
    - Expand bio with LL.M details, tax law experience, government/advisory background
    - Already has LinkedIn and Instagram — verify links work

- [ ] **P1 / S** `[Webflow]` — Add credentials/certifications to team pages
  - Ramin: LL.M in fiscaal recht, relevant certifications
  - Hakan: relevant business/strategy credentials
  - These are critical E-E-A-T signals

### 3.3 Content Duplication

- [ ] **P1 / M** `[Webflow]` — Deduplicate repeated sections across pages
  - Testimonials appear identically on: homepage, `/over-ons`, `/1-op-1`, `/groepsdagen`
  - 3-step process appears identically on: homepage, `/over-ons`
  - **Action**: Keep testimonials on homepage + one other page. Use different testimonials on different pages, or vary the presentation.
  - The same 4 testimonials (Jeroen M., Fatima E., Bart v. D., Nadia K.) appear on both `/1-op-1` and `/groepsdagen` — differentiate

### 3.4 Blog Content Issues

- [ ] **P1 / M** `[Webflow]` — Address keyword cannibalization in blog
  - **3 articles overlap on "Box 3 belasting 2026"**:
    - "Box 3 vermogensbelasting wijzigingen 2026" (Feb 23)
    - "Box 3 belasting 2026 veranderingen" (Feb 16)
    - "Box 3 belastingheffing 2026 wijzigingen" (Jan 7)
  - **4 articles overlap on "ZZP pensioen 2026"**:
    - "ZZP pensioenopbouw 2026 regels" (Feb 20)
    - "Pensioen ZZP oudedagsreserve 2026" (Feb 18)
    - "Pensioen ZZP opbouwen na wetswijzigingen" (Feb 17)
    - "Pensioen ZZP 2026 nieuwe regels" (Feb 16)
  - **Action**: Consolidate overlapping posts into comprehensive pillar articles. Redirect old URLs to the consolidated version with 301 redirects.

- [x] **P1 / S** `[Webflow]` — Add author attribution to all blog posts *(author-name field set to "Ramin Nourzad" via API on all 10 posts)*
  - Still need to display author info visually in blog post template in Webflow Designer

- [ ] **P1 / S** `[Webflow]` — Add publication dates to blog index page
  - Currently `/blog` shows no dates — users and Google can't assess freshness
  - Add date display to blog card components

- [ ] **P2 / S** `[Webflow]` — Add blog categories/tags
  - Create a "Blog Category" collection in Webflow CMS
  - Categories: Belastingtips, Vermogensgroei, ZZP, BV & Holding, Box 3, Pensioen
  - Display on blog index for filtering
  - Helps with topic cluster strategy

- [ ] **P2 / S** `[Webflow]` — Add "Related Posts" section using intelligent matching
  - Currently shows recent posts — should show topically related posts
  - Use Webflow CMS reference field or conditional visibility

- [ ] **P2 / S** `[Webflow]` — Add table of contents to long blog posts
  - Posts are 1,300-2,400 words — TOC improves UX and generates jump links
  - Can be done with Webflow custom code or a rich text component

### 3.5 Social Proof Enhancement

- [ ] **P1 / M** `[Webflow]` — Audit brand logos on check.ambitionvalley.nl
  - Currently shows Belastingdienst, Knab, Deloitte, Rabobank, KPMG logos as "social proof"
  - If there's no actual partnership, this is **misleading** and potentially illegal
  - **Action**: Either remove logos or add clear context (e.g., "Onze klanten werken bij:" or "Kennis van:")

---

## Phase 4: AI Crawler Access & GEO Foundation (Week 2-3)

> Critical for appearing in AI Overviews, ChatGPT, and Perplexity.

### 4.1 Webflow robots.txt

- [ ] **P0 / S** `[Webflow]` — Update Webflow robots.txt for AI crawlers
  - Webflow Site Settings → SEO → Custom robots.txt rules
  - Add rules to explicitly allow: GPTBot, ClaudeBot, PerplexityBot, Applebot-Extended
  - Keep blocking `/admin/` paths

### 4.2 check.ambitionvalley.nl (Code)

- [x] **P0 / S** `[Code]` — Update robots.txt to allow AI crawlers
  - File: `src/app/robots.ts`
  - Added explicit allow rules for GPTBot, ClaudeBot, PerplexityBot, Applebot-Extended
  - Kept existing disallow for `/api/` and `/admin/`

- [x] **P0 / S** `[Code]` — Create `llms.txt` file
  - File: `src/app/llms.txt/route.ts`
  - Content: site description, content topics, key pages, team info, citation format
  - Reference: https://llmstxt.org/

- [x] **P1 / S** `[Code]` — Create `llms-full.txt` with content index
  - File: `src/app/llms-full.txt/route.ts`
  - Auto-generates from Webflow CMS: all published blog slugs, titles, summaries
  - Updates dynamically on each request (1h cache)

### 4.3 Sitemap Fixes

- [ ] **P0 / M** `[Webflow]` — Clean up Webflow sitemap
  - Remove all 25+ template/junk pages from sitemap (by noindexing or deleting them)
  - Ensure all real pages are included
  - Add `lastmod` dates to sitemap entries (Webflow does this automatically when pages are updated)
  - Current sitemap has 78 URLs but ~30 are junk

- [x] **P1 / M** `[Code]` — Expand check.ambitionvalley.nl sitemap
  - File: `src/app/sitemap.ts`
  - Added: calculator pages (sparen-vs-beleggen, pensioenbeleggen), all published blog posts via Webflow API
  - Includes `lastModified` dates from Webflow `lastUpdated` field

---

## Phase 5: Content Generator & E-E-A-T Optimization (Week 3-5)

> Improve the SEO engine to produce content aligned with 2026 best practices.

### 5.1 Content Structure for GEO

- [ ] **P0 / L** `[Code]` — Update content generator for AI citation optimization
  - File: `src/integrations/seo-engine/lib/content-generator.ts`
  - **Lead with direct answers**: First paragraph must answer the target query directly (44.2% of LLM citations come from the intro)
  - **Add "Samenvatting" / Key Takeaways block**: 3-5 bullet points at top of each post
  - **Clean heading hierarchy**: Ensure H2/H3 structure clearly signals passage topics
  - **Structured lists and tables**: AI engines extract these more easily
  - **FAQ section**: Already generated — ensure always included and well-structured
  - **Definition paragraphs**: 40-60 words directly answering "What is X?" for target keywords (featured snippet optimization)

- [ ] **P1 / M** `[Code]` — Improve internal linking in content generator
  - File: `src/integrations/seo-engine/lib/content-generator.ts`
  - Fetch existing published posts from Supabase/Webflow to find link targets
  - Build topic cluster awareness: link to related posts in the same cluster
  - Increase minimum internal links from 2 to 3
  - Use contextual anchor text matching target post's keyword

- [ ] **P1 / M** `[Code]` — Add keyword cannibalization detection
  - File: `src/integrations/seo-engine/lib/keyword-discovery.ts`
  - Before generating new content, check for existing posts targeting similar keywords
  - Flag potential cannibalization in admin panel
  - Suggest consolidation or differentiation strategies

### 5.2 Author & E-E-A-T System

- [ ] **P1 / M** `[Code]` — Create author management system
  - Add `seo_authors` table to migration file
  - Fields: id, name, slug, bio_nl, bio_en, avatar_url, credentials, linkedin_url, expertise_areas, experience_description
  - Admin panel page: `/admin/seo-engine/authors`
  - Pre-populate with Hakan and Ramin's data

- [ ] **P1 / M** `[Code]` — Integrate author data into content publishing
  - When publishing to Webflow, populate `author-name` field from `seo_authors` table
  - Include author in Article schema generation
  - Display author info in admin draft preview

### 5.3 Content Freshness System

- [ ] **P1 / L** `[Code]` — Build content refresh detection
  - File: `src/integrations/seo-engine/lib/content-refresh.ts`
  - Flag posts older than 6 months for review
  - Flag posts with declining performance metrics
  - Admin dashboard widget: "Content needing refresh" with priority sorting
  - Cron route: `POST /api/seo-engine/cron/refresh-check`

---

## Phase 6: Technical SEO & Performance (Week 3-5)

### 6.1 Core Web Vitals (check.ambitionvalley.nl)

- [ ] **P1 / M** `[Code]` — Optimize LCP
  - Add `priority` and `loading="eager"` to above-the-fold images
  - Preload critical fonts
  - Check for render-blocking CSS/JS
  - Target: LCP < 2.5s

- [ ] **P1 / M** `[Code]` — Optimize INP
  - Profile interactive elements (form wizard, calculators)
  - Use `React.startTransition` for non-urgent state updates
  - Debounce heavy event handlers
  - Target: INP < 200ms

- [ ] **P1 / M** `[Code]` — Image optimization
  - Verify `next.config.ts` has `images.formats: ['image/avif', 'image/webp']`
  - Add `sizes` attribute to all `<Image>` components
  - Ensure all images use Next.js `<Image>` component (not plain `<img>`)

### 6.2 Webflow Performance

- [ ] **P1 / M** `[Webflow]` — Reduce font loading
  - Currently loading **5 font families**: Lato, Open Sans, Droid Sans, Inter, Kanit
  - Consolidate to 1-2 font families maximum
  - Remove unused fonts from Webflow project settings
  - Each font family adds ~100-300ms to load time

- [ ] **P1 / S** `[Webflow]` — Optimize hero images
  - Ensure hero images are compressed and appropriately sized
  - Use Webflow's built-in responsive images feature
  - Add explicit dimensions to prevent CLS

### 6.3 Local SEO

- [ ] **P1 / S** `[Both]` — NAP consistency audit
  - Standardize across all locations:
    - **Name**: Ambition Valley
    - **Address**: Laanstraat 82-04, 3762 KE Soest, Nederland
    - **Phone**: +31 6 36 16 78 12
    - **Email**: info@ambitionvalley.nl
  - Verify Google Business Profile matches exactly
  - Fix the placeholder phone number on `/contact-us`

---

## Phase 7: Open Graph & Social (Week 4-5)

### 7.1 Open Graph Tags

- [ ] **P1 / M** `[Webflow]` — Add OG tags to all pages
  - Webflow: Page Settings → Open Graph Settings
  - Set: og:title, og:description, og:image for every page
  - Blog posts: use hero image as og:image, meta title as og:title
  - Ensure og:locale = `nl_NL`

- [ ] **P1 / S** `[Webflow]` — Add social sharing functionality to blog posts
  - Add share buttons: LinkedIn, WhatsApp, X/Twitter, Email
  - Can use Webflow embed with share URL patterns
  - WhatsApp is especially important for Dutch audience

### 7.2 Social Media Fixes

- [ ] **P0 / S** `[External]` — Create LinkedIn company page for Ambition Valley
  - Currently links to Ramin's personal profile
  - Create official company page and link from website

- [ ] **P0 / S** `[External]` — Set up proper Instagram profile
  - Create/find the actual Instagram handle
  - Update footer link from broken `instagram.com` root URL

- [ ] **P2 / M** `[External]` — Consider YouTube channel for video SEO
  - 25% of Google results include video snippets
  - Create explainer videos for: Box 3, ZZP pensioen, BV oprichten
  - Embed in relevant blog posts
  - Add VideoObject schema when embedded

---

## Phase 8: Content Distribution & RSS (Week 5-6)

- [ ] **P1 / S** `[Code]` — Create RSS feed for blog posts
  - File: `src/app/feed.xml/route.ts`
  - Fetch published posts from Webflow CMS
  - Include: title, description, link, pubDate, author, category
  - Helps with content distribution and AI crawling

- [ ] **P2 / S** `[Code]` — Generate social media snippets from blog content
  - File: `src/integrations/seo-engine/lib/social-snippets.ts`
  - Auto-generate: LinkedIn post, Twitter thread outline, key quotes
  - Display in admin panel alongside each published post
  - COPE framework: Create Once, Publish Everywhere

---

## Phase 9: Topic Clusters & Pillar Pages (Week 5-7)

### 9.1 Topic Cluster Architecture

- [ ] **P1 / L** `[Code]` — Build topic cluster management system
  - Add `seo_topic_clusters` table: cluster_name, pillar_page_url, language
  - Add `seo_cluster_posts` junction table: cluster_id, post_id, relationship
  - Admin panel: manage clusters, assign posts, visualize coverage gaps
  - Suggested clusters based on current blog content:
    - **Box 3 Belasting** (pillar + 2-3 supporting articles — consolidate from current 3)
    - **ZZP Pensioen** (pillar + 2-3 supporting — consolidate from current 4)
    - **Fiscale Regels Ondernemers** (pillar + supporting)
    - **Subsidies MKB** (pillar + supporting)
    - **Vermogensopbouw** (pillar + supporting)

- [ ] **P1 / M** `[Webflow]` — Create pillar pages for main topic clusters
  - Comprehensive, 2,500+ word pages covering entire topic areas
  - Hub-and-spoke internal linking to all supporting posts
  - Regular updates when new supporting content is published

### 9.2 Content Gap Analysis

- [ ] **P1 / M** `[Code]` — Build content gap detection
  - Compare planned topic clusters with existing content
  - Identify subtopics with no coverage
  - Auto-suggest keywords to fill gaps
  - Display in admin panel as "Content Opportunities"

---

## Phase 10: Performance Monitoring & Analytics (Week 6-8)

### 10.1 Search Console Integration

- [ ] **P1 / L** `[Code]` — Complete Google Search Console API integration
  - File: `src/integrations/seo-engine/lib/performance-monitoring.ts` (framework exists)
  - Implement actual API calls: impressions, clicks, CTR, average position per page
  - Store in `seo_performance_metrics` table
  - Cron: `POST /api/seo-engine/cron/sync-metrics`

- [ ] **P1 / M** `[Code]` — Build performance dashboard
  - Route: `/admin/seo-engine/performance`
  - Show: top posts, declining posts, CTR trends, position changes
  - Highlight underperformers (candidates for refresh)

### 10.2 SEO Health Dashboard

- [ ] **P2 / L** `[Code]` — Build comprehensive SEO health overview
  - Route: `/admin/seo-engine/health`
  - Sections: CWV status, content freshness, schema validation, link health
  - Automated weekly email report

### 10.3 AI Citation Tracking

- [ ] **P3 / L** `[Code]` — Build AI citation monitoring
  - Track brand mentions in ChatGPT, Perplexity, Google AI Overviews
  - Table: `seo_ai_citations` (source, query, cited_url, timestamp)
  - Admin widget: "AI Citations This Month"

---

## Implementation Priority Summary

### Immediately (Week 1) — Fix Trust-Breaking Issues
| # | Task | Effort | Where |
|---|------|--------|-------|
| 1 | Delete fake testimonials page | S | Webflow |
| 2 | Remove/noindex 25+ template pages | M | Webflow |
| 3 | Fix "Accountant" in all page titles | S | Webflow |
| 4 | Fix Google Maps (New Jersey → Soest) | S | Webflow |
| 5 | Fix placeholder phone number | S | Webflow |
| 6 | Fix broken Instagram link | S | Webflow |
| 7 | Fix service page template content | M | Webflow |

### Week 2 — SEO Foundations
| # | Task | Effort | Where |
|---|------|--------|-------|
| 8 | Add meta descriptions to ALL pages | M | Webflow |
| 9 | Fix all image alt text (especially blog) | M | Webflow |
| 10 | Add FAQ schema to /faq page | M | Webflow |
| 11 | Add Article schema to blog posts | M | Webflow |
| 12 | Update robots.txt for AI crawlers | S | Both |
| 13 | Create llms.txt | S | Code |
| 14 | Clean up Webflow sitemap | M | Webflow |

### Week 3-4 — Content & Authority
| # | Task | Effort | Where |
|---|------|--------|-------|
| 15 | Rewrite service pages with real content | L | Webflow |
| 16 | Expand team member bios | M | Webflow |
| 17 | Add author attribution to blog posts | S | Webflow |
| 18 | Consolidate overlapping blog posts | M | Webflow |
| 19 | Add OG tags to all pages | M | Webflow |
| 20 | Create LinkedIn company page | S | External |
| 21 | Reduce to 1-2 font families | M | Webflow |
| 22 | Update content generator for GEO | L | Code |

### Week 5-8 — Systems & Scale
| # | Task | Effort | Where |
|---|------|--------|-------|
| 23 | Author management system | M | Code |
| 24 | Content freshness system | L | Code |
| 25 | Keyword cannibalization detection | M | Code |
| 26 | Topic cluster architecture | L | Code |
| 27 | Search Console integration | L | Code |
| 28 | Performance dashboard | M | Code |
| 29 | RSS feed | S | Code |
| 30 | Social snippet generator | S | Code |

---

## Notes

- All database changes go in: `supabase/migrations/20251205140351_initial_schema.sql`
- Do NOT create new migration files
- Post summary max: **140 characters** (strict Webflow limit)
- All content must pass compliance checker before publishing
- Deploy only when explicitly instructed
- **Webflow tasks** must be done manually in the Webflow Designer — they cannot be automated via this codebase
- The Webflow Data API can be used to update CMS items (blog posts) but NOT page settings, custom code, or design elements
