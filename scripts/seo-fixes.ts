/**
 * SEO Fixes Script — Automated via Webflow API
 *
 * Fixes page titles, adds meta descriptions, updates blog post fields,
 * and injects schema markup.
 *
 * Usage:
 *   npx tsx scripts/seo-fixes.ts --dry-run     # Preview changes only
 *   npx tsx scripts/seo-fixes.ts               # Apply changes
 *   npx tsx scripts/seo-fixes.ts --publish     # Apply + publish site
 */

import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

// Inline Webflow API client to avoid import issues with tsx
const BASE_URL = 'https://api.webflow.com/v2';
// Use full-scope token for pages/custom code, fall back to CMS token
const API_TOKEN = process.env.WEBFLOW_API_TOKEN_FULL || process.env.WEBFLOW_API_TOKEN!;
const CMS_TOKEN = process.env.WEBFLOW_API_TOKEN!;
const SITE_ID = process.env.WEBFLOW_SITE_ID!;
const COLLECTION_ID = process.env.WEBFLOW_COLLECTION_ID!;

if (!API_TOKEN || !SITE_ID) {
  console.error('Missing WEBFLOW_API_TOKEN or WEBFLOW_SITE_ID in environment');
  process.exit(1);
}

const DRY_RUN = process.argv.includes('--dry-run');
const PUBLISH = process.argv.includes('--publish');

let requestCount = 0;

async function apiWithToken<T>(token: string, method: string, endpoint: string, body?: unknown): Promise<T> {
  requestCount++;
  if (requestCount % 50 === 0) {
    console.log('  ⏳ Rate limit pause...');
    await new Promise((r) => setTimeout(r, 5000));
  }

  const res = await fetch(`${BASE_URL}${endpoint}`, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  const text = await res.text();
  if (!res.ok) {
    throw new Error(`API ${method} ${endpoint}: ${res.status} ${text}`);
  }
  return text ? JSON.parse(text) : undefined;
}

async function api<T>(method: string, endpoint: string, body?: unknown): Promise<T> {
  return apiWithToken<T>(API_TOKEN, method, endpoint, body);
}

async function cmsApi<T>(method: string, endpoint: string, body?: unknown): Promise<T> {
  return apiWithToken<T>(CMS_TOKEN, method, endpoint, body);
}

// ============================================================================
// Types
// ============================================================================

interface Page {
  id: string;
  title: string;
  slug: string;
  seo?: { title?: string; description?: string };
  openGraph?: { title?: string; description?: string };
}

interface BlogItem {
  id: string;
  isDraft: boolean;
  isArchived: boolean;
  fieldData: {
    name: string;
    slug: string;
    'post-summary'?: string;
    'meta-title'?: string;
    'meta-description'?: string;
    'alt-text'?: string;
    'thumbnail-alt-text'?: string;
    'author-name'?: string;
    'main-image-2'?: { url?: string; alt?: string };
    'thumbnail-image'?: { url?: string; alt?: string };
  };
}

// ============================================================================
// Page Title & Meta Description Fixes
// ============================================================================

// Map of page slugs to correct SEO titles and meta descriptions
const PAGE_SEO_FIXES: Record<string, { title: string; description: string }> = {
  // Team pages — remove "Accountant"
  'hakan-sahingoz': {
    title: 'Hakan Sahingoz - Oprichter & Strategisch Lead | Ambition Valley',
    description:
      'Maak kennis met Hakan Sahingoz, oprichter en strategisch lead bij Ambition Valley. Specialist in financiele strategie en vermogensgroei.',
  },
  ramin: {
    title: 'Ramin Nourzad - Oprichter & Fiscalist (LL.M) | Ambition Valley',
    description:
      'Maak kennis met Ramin Nourzad, oprichter en fiscalist (LL.M) bij Ambition Valley. Universitair opgeleid in fiscaal recht.',
  },
  // Service pages — remove "Accountant" and add real descriptions
  'financiele-strategie': {
    title: 'Financiele Strategie | Ambition Valley',
    description:
      'Persoonlijke financiele strategie voor ondernemers en zzp\'ers. Van belastingbesparing tot vermogensopbouw met een plan dat werkt.',
  },
  belastingoptimalisatie: {
    title: 'Belastingoptimalisatie | Ambition Valley',
    description:
      'Bespaar belasting met slimme fiscale strategieen. Box 1, 2 en 3 optimalisatie voor ondernemers, zzp\'ers en particulieren.',
  },
  'vermogensopbouw-and-asset-allocatie': {
    title: 'Vermogensopbouw & Asset-Allocatie | Ambition Valley',
    description:
      'Laat je vermogen groeien met een doordachte asset-allocatie strategie. Van sparen naar beleggen, van werken naar financiele vrijheid.',
  },
  'bv-and-holding-voor-ondernemers': {
    title: 'BV & Holding voor Ondernemers | Ambition Valley',
    description:
      'Ontdek of een BV- of holdingstructuur voordelig is voor jou. Fiscale optimalisatie en vermogensbescherming voor ondernemers.',
  },
  'dashboard-and-community': {
    title: 'Dashboard & Community | Ambition Valley',
    description:
      'Krijg inzicht in je financien met ons persoonlijk dashboard. Sluit je aan bij een community van ambitieuze ondernemers.',
  },
  'aangiftes-and-compliance': {
    title: 'Aangiftes & Compliance | Ambition Valley',
    description:
      'Correcte belastingaangiftes en fiscale compliance. Altijd up-to-date met de laatste regelgeving en zonder zorgen.',
  },
  // Main pages — add missing meta descriptions
  'over-ons': {
    title: 'Over Ons | Ambition Valley',
    description:
      'Leer het team achter Ambition Valley kennen. Universitair opgeleide fiscalisten die je helpen belasting te besparen en vermogen op te bouwen.',
  },
  'ons-team': {
    title: 'Ons Team | Ambition Valley',
    description:
      'Maak kennis met Hakan Sahingoz en Ramin Nourzad — de oprichters van Ambition Valley. Strategie en fiscale expertise onder een dak.',
  },
  werkwijze: {
    title: 'Onze Werkwijze: Van Intake tot Resultaat | Ambition Valley',
    description:
      'Ontdek hoe Ambition Valley werkt: van intake en analyse tot strategie en implementatie. Persoonlijk, resultaatgericht en transparant.',
  },
  faq: {
    title: 'FAQ: Veelgestelde Vragen | Ambition Valley',
    description:
      'Veelgestelde vragen over Ambition Valley. Alles over onze pakketten, werkwijze, garantie en fiscale begeleiding.',
  },
  '1-op-1': {
    title: '1-op-1 Begeleiding | Ambition Valley',
    description:
      'Persoonlijke 1-op-1 begeleiding bij belastingoptimalisatie en vermogensgroei. Drie pakketten met 100% terugverdiengarantie.',
  },
  groepsdagen: {
    title: 'Groepsdagen | Ambition Valley',
    description:
      'Leer in groepsverband over belastingbesparing, vermogensopbouw en BV-structuren. Praktisch, betaalbaar en resultaatgericht.',
  },
  'contact-us': {
    title: 'Contact | Ambition Valley',
    description:
      'Neem contact op met Ambition Valley. Plan een gratis intake of stel je vraag via e-mail, telefoon of WhatsApp.',
  },
  blog: {
    title: 'Blog: Fiscale Tips & Vermogensgroei | Ambition Valley',
    description:
      'Praktische artikelen over belastingbesparing, vermogensgroei en fiscale tips voor ondernemers en zzp\'ers. Helder en toepasbaar.',
  },
  pricing: {
    title: 'Pakketten & Prijzen | Ambition Valley',
    description:
      'Bekijk de pakketten en prijzen van Ambition Valley. Vanaf EUR 995 met 100% terugverdiengarantie.',
  },
};

async function fixPageSeo() {
  console.log('\n📄 PHASE 1: Fixing page SEO titles & meta descriptions...\n');

  const response = await api<{ pages: Page[] }>('GET', `/sites/${SITE_ID}/pages?limit=100`);
  const pages = response.pages;
  console.log(`  Found ${pages.length} pages\n`);

  let fixCount = 0;

  for (const page of pages) {
    const fix = PAGE_SEO_FIXES[page.slug];
    if (!fix) continue;

    const currentTitle = page.seo?.title || page.title;
    const currentDesc = page.seo?.description || '';
    const needsTitleFix = currentTitle !== fix.title;
    const needsDescFix = currentDesc !== fix.description;

    if (!needsTitleFix && !needsDescFix) {
      console.log(`  ✅ ${page.slug} — already correct`);
      continue;
    }

    console.log(`  🔧 ${page.slug}`);
    if (needsTitleFix) {
      console.log(`     Title: "${currentTitle}" → "${fix.title}"`);
    }
    if (needsDescFix) {
      console.log(`     Description: "${currentDesc.slice(0, 50)}..." → "${fix.description.slice(0, 50)}..."`);
    }

    if (!DRY_RUN) {
      try {
        await api('PUT', `/pages/${page.id}`, {
          seo: {
            title: fix.title,
            description: fix.description,
          },
          openGraph: {
            title: fix.title,
            titleCopied: false,
            description: fix.description,
            descriptionCopied: false,
          },
        });
        console.log(`     ✅ Updated`);
      } catch (error) {
        const msg = error instanceof Error ? error.message : String(error);
        if (msg.includes('404') || msg.includes('RouteNotFound')) {
          console.log(`     ⚠️  Pages API not available (needs pages:write scope). Do this in Webflow Designer.`);
        } else {
          console.log(`     ❌ Failed: ${msg}`);
        }
      }
    } else {
      console.log(`     ⏭️  Dry run — skipped`);
    }
    fixCount++;
  }

  console.log(`\n  📊 ${fixCount} pages ${DRY_RUN ? 'would be' : ''} updated`);
}

// ============================================================================
// Blog Post Fixes (alt text, author)
// ============================================================================

async function fixBlogPosts() {
  console.log('\n📝 PHASE 2: Fixing blog post fields (alt text, author)...\n');

  if (!COLLECTION_ID) {
    console.log('  ⚠️  WEBFLOW_COLLECTION_ID not set — skipping blog fixes');
    return;
  }

  // Fetch all blog items
  const allItems: BlogItem[] = [];
  let offset = 0;

  while (true) {
    const response = await cmsApi<{ items: BlogItem[]; pagination: { total: number } }>(
      'GET',
      `/collections/${COLLECTION_ID}/items?limit=100&offset=${offset}`
    );
    allItems.push(...response.items);
    if (response.items.length < 100) break;
    offset += 100;
  }

  console.log(`  Found ${allItems.length} blog items\n`);

  const updates: Array<{ id: string; fieldData: Record<string, unknown> }> = [];

  for (const item of allItems) {
    const changes: Record<string, unknown> = {};
    const fd = item.fieldData;

    // Fix alt text — replace generic "Blog Img" with descriptive text
    const currentAlt = fd['alt-text'] || '';
    if (!currentAlt || currentAlt === 'Blog Img' || currentAlt === 'blog img') {
      changes['alt-text'] = `Illustratie bij ${fd.name}`;
    }

    // Fix thumbnail alt text
    const currentThumbAlt = fd['thumbnail-alt-text'] || '';
    if (!currentThumbAlt || currentThumbAlt === 'Blog Img' || currentThumbAlt === 'blog img') {
      changes['thumbnail-alt-text'] = `Thumbnail ${fd.name}`;
    }

    // Add author if missing
    if (!fd['author-name']) {
      changes['author-name'] = 'Ramin Nourzad';
    }

    // Add meta title if missing
    if (!fd['meta-title'] && fd.name) {
      const metaTitle = fd.name.length > 60 ? fd.name.slice(0, 57) + '...' : fd.name;
      changes['meta-title'] = metaTitle;
    }

    // Add meta description if missing
    if (!fd['meta-description'] && fd['post-summary']) {
      changes['meta-description'] = fd['post-summary'].slice(0, 160);
    }

    if (Object.keys(changes).length > 0) {
      console.log(`  🔧 "${fd.name}"`);
      for (const [key, val] of Object.entries(changes)) {
        console.log(`     ${key}: "${String(val).slice(0, 60)}${String(val).length > 60 ? '...' : ''}"`);
      }
      updates.push({ id: item.id, fieldData: changes });
    } else {
      console.log(`  ✅ "${fd.name}" — already correct`);
    }
  }

  if (updates.length > 0 && !DRY_RUN) {
    console.log(`\n  Applying ${updates.length} blog post updates...`);
    // Batch update (max 100 per request)
    for (let i = 0; i < updates.length; i += 100) {
      const batch = updates.slice(i, i + 100);
      await cmsApi('PATCH', `/collections/${COLLECTION_ID}/items`, { items: batch });
    }
    console.log('  ✅ Blog posts updated');

    // Publish updated items to live
    const itemIds = updates.map((u) => u.id);
    console.log(`  Publishing ${itemIds.length} items to live...`);
    await cmsApi('POST', `/collections/${COLLECTION_ID}/items/publish`, { itemIds });
    console.log('  ✅ Published to live');
  } else if (DRY_RUN) {
    console.log(`\n  ⏭️  Dry run — ${updates.length} posts would be updated`);
  } else {
    console.log('\n  ✅ All blog posts already correct');
  }
}

// ============================================================================
// FAQ Schema Injection via Custom Code
// ============================================================================

const FAQ_ITEMS = [
  {
    question: 'Wat levert Ambition Valley mij concreet op?',
    answer:
      'Onze klanten besparen gemiddeld EUR 3.000 tot EUR 15.000 per jaar aan belasting. Daarnaast krijg je een persoonlijke vermogensstrategie, toegang tot ons dashboard en begeleiding bij de uitvoering.',
  },
  {
    question: 'Is dit geschikt voor zzp\'ers, ondernemers en particulieren?',
    answer:
      'Ja. Wij werken met zzp\'ers, mkb-ondernemers, DGA\'s en particulieren met vermogen. Elk traject wordt afgestemd op jouw specifieke situatie.',
  },
  {
    question: 'Hoe werkt de 100% terugverdiengarantie?',
    answer:
      'Als je ons plan volgt en binnen 12 maanden je investering niet terugverdient, begeleiden wij je gratis verder totdat je dat wel bereikt.',
  },
  {
    question: 'Wat kost het en welke pakketten zijn er?',
    answer:
      'Wij bieden drie pakketten: Financieel Fundament (EUR 995), Private Wealth (EUR 2.250) en Ambition Wealth Circle (EUR 3.500). Alle prijzen zijn exclusief btw.',
  },
  {
    question: 'Hoe verschilt Ambition Valley van een boekhouder of accountant?',
    answer:
      'Wij gaan verder dan aangiftes. Wij bouwen een complete financiele strategie met belastingoptimalisatie, vermogensopbouw en persoonlijke begeleiding.',
  },
  {
    question: 'Wie zitten er achter Ambition Valley?',
    answer:
      'Ambition Valley is opgericht door Hakan Sahingoz (Strategisch Lead) en Ramin Nourzad (Fiscalist, LL.M in fiscaal recht).',
  },
  {
    question: 'Wat heb ik nodig om te starten?',
    answer:
      'Je begint met een gratis intake. Daarin bespreken we je situatie, doelen en mogelijkheden. Na de intake ontvang je een persoonlijk advies.',
  },
  {
    question: 'Hoe weet ik of mijn gegevens veilig zijn?',
    answer:
      'Wij werken volledig AVG/GDPR-compliant. Je gegevens worden versleuteld opgeslagen en nooit gedeeld met derden zonder jouw toestemming.',
  },
  {
    question: 'Kan ik tussentijds opzeggen?',
    answer:
      'Ja, je kunt altijd opzeggen. Wij geloven in onze waarde en werken liever met klanten die er vrijwillig voor kiezen.',
  },
  {
    question: 'Bieden jullie ook doorlopende begeleiding?',
    answer:
      'Ja. Na afronding van je traject kun je gebruik blijven maken van ons dashboard en onze community. Bij de Premium pakketten is doorlopende begeleiding inbegrepen.',
  },
  {
    question: 'Werken jullie met een no cure, no pay model?',
    answer:
      'Nee, maar wij bieden wel een 100% terugverdiengarantie. Je betaalt vooraf en wij garanderen dat je je investering terugverdient.',
  },
  {
    question: 'Hoe lang duurt een traject gemiddeld?',
    answer:
      'Dat hangt af van je situatie en pakket. Een basistraject duurt gemiddeld 4-8 weken, een uitgebreid traject 3-6 maanden.',
  },
];

async function injectFaqSchema() {
  console.log('\n🏗️  PHASE 3: Injecting FAQ schema markup...\n');

  // Find the FAQ page
  const response = await api<{ pages: Page[] }>('GET', `/sites/${SITE_ID}/pages?limit=100`);
  const faqPage = response.pages.find((p) => p.slug === 'faq');

  if (!faqPage) {
    console.log('  ⚠️  FAQ page not found — skipping');
    return;
  }

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: FAQ_ITEMS.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    })),
  };

  const scriptContent = `<script type="application/ld+json">${JSON.stringify(faqSchema)}</script>`;

  console.log(`  Found FAQ page: ${faqPage.slug} (${faqPage.id})`);
  console.log(`  Schema has ${FAQ_ITEMS.length} FAQ items`);

  if (!DRY_RUN) {
    // Register the inline script
    try {
      const registered = await api<{ id: string }>('POST', `/sites/${SITE_ID}/registered_scripts/inline`, {
        displayName: 'FAQ Schema Markup',
        sourceCode: scriptContent,
        version: '1.0.0',
        canCopy: false,
      });

      // Apply to FAQ page
      await api('PUT', `/pages/${faqPage.id}/custom_code`, {
        scripts: [{ id: registered.id, location: 'header', version: '1.0.0' }],
      });

      console.log(`  ✅ FAQ schema injected`);
    } catch (error) {
      console.error(`  ❌ Failed to inject FAQ schema:`, error);
      console.log('  💡 You may need to add the FAQ schema manually in Webflow Custom Code settings');
    }
  } else {
    console.log(`  ⏭️  Dry run — would inject FAQ schema`);
  }
}

// ============================================================================
// LocalBusiness Schema Injection
// ============================================================================

async function injectLocalBusinessSchema() {
  console.log('\n🏢 PHASE 4: Injecting LocalBusiness schema...\n');

  const response = await api<{ pages: Page[] }>('GET', `/sites/${SITE_ID}/pages?limit=100`);
  const contactPage = response.pages.find((p) => p.slug === 'contact-us');

  if (!contactPage) {
    console.log('  ⚠️  Contact page not found — skipping');
    return;
  }

  const localBusinessSchema = {
    '@context': 'https://schema.org',
    '@type': 'ProfessionalService',
    name: 'Ambition Valley',
    legalName: 'Ambition Valley VOF',
    url: 'https://ambitionvalley.nl',
    telephone: '+31636167812',
    email: 'info@ambitionvalley.nl',
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'Laanstraat 82-04',
      addressLocality: 'Soest',
      postalCode: '3762 KE',
      addressCountry: 'NL',
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: 52.1731,
      longitude: 5.2922,
    },
    openingHoursSpecification: {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
      opens: '09:00',
      closes: '17:00',
    },
    areaServed: 'NL',
    priceRange: '€€',
    knowsAbout: [
      'Belastingoptimalisatie',
      'Vermogensgroei',
      'Fiscale strategie',
      'BV en holding structuren',
      'ZZP pensioenopbouw',
    ],
  };

  const scriptContent = `<script type="application/ld+json">${JSON.stringify(localBusinessSchema)}</script>`;

  console.log(`  Found contact page: ${contactPage.slug} (${contactPage.id})`);

  if (!DRY_RUN) {
    try {
      const registered = await api<{ id: string }>('POST', `/sites/${SITE_ID}/registered_scripts/inline`, {
        displayName: 'LocalBusiness Schema',
        sourceCode: scriptContent,
        version: '1.0.0',
        canCopy: false,
      });

      await api('PUT', `/pages/${contactPage.id}/custom_code`, {
        scripts: [{ id: registered.id, location: 'header', version: '1.0.0' }],
      });

      console.log(`  ✅ LocalBusiness schema injected`);
    } catch (error) {
      console.error(`  ❌ Failed to inject LocalBusiness schema:`, error);
      console.log('  💡 You may need to add the schema manually in Webflow Custom Code settings');
    }
  } else {
    console.log(`  ⏭️  Dry run — would inject LocalBusiness schema`);
  }
}

// ============================================================================
// Publish Site
// ============================================================================

async function publishSite() {
  if (!PUBLISH) return;

  console.log('\n🚀 PHASE 5: Publishing site...\n');

  if (!DRY_RUN) {
    await api('POST', `/sites/${SITE_ID}/publish`, {
      publishToWebflowSubdomain: true,
    });
    console.log('  ✅ Site published');
  } else {
    console.log('  ⏭️  Dry run — would publish site');
  }
}

// ============================================================================
// Main
// ============================================================================

async function main() {
  console.log('='.repeat(60));
  console.log('  Ambition Valley — SEO Fixes via Webflow API');
  console.log('='.repeat(60));

  if (DRY_RUN) {
    console.log('\n  🏃 DRY RUN MODE — no changes will be made\n');
  }

  try {
    await fixPageSeo();
    await fixBlogPosts();
    await injectFaqSchema();
    await injectLocalBusinessSchema();
    await publishSite();

    console.log('\n' + '='.repeat(60));
    console.log(`  Done! ${requestCount} API requests made.`);
    if (DRY_RUN) {
      console.log('  Run without --dry-run to apply changes.');
    }
    if (!PUBLISH && !DRY_RUN) {
      console.log('  Run with --publish to also publish the site.');
    }
    console.log('='.repeat(60) + '\n');
  } catch (error) {
    console.error('\n❌ Error:', error);
    process.exit(1);
  }
}

main();
