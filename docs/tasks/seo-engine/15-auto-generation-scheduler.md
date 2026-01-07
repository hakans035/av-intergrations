# Auto-Generation Scheduler met AI Keyword Discovery & Email Notificaties

Dit document beschrijft de implementatie van:
1. **AI-powered keyword discovery** - Automatisch trending topics vinden via internet search
2. **Dagelijkse blog generatie** - Content genereren op basis van ontdekte keywords
3. **Email notificaties** - Admins op de hoogte stellen voor review en publicatie

---

## 1. Overzicht

### Doel

Een volledig geautomatiseerd SEO content systeem dat:
- **Wekelijks** trending keywords ontdekt in de Nederlandse financiële sector via AI + web search
- **Dagelijks** een blog post genereert op basis van de beste keywords
- **Direct** een email stuurt naar admins met review link
- **Nul handmatige input** vereist (behalve goedkeuring)

### Volledige Flow Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    VOLLEDIG GEAUTOMATISEERDE SEO PIPELINE                    │
└─────────────────────────────────────────────────────────────────────────────┘

FASE 1: KEYWORD DISCOVERY (Wekelijks - Maandag 05:00 CET)
═══════════════════════════════════════════════════════════

    ┌──────────────────┐
    │  Vercel Cron     │
    │  Maandag 05:00   │
    └────────┬─────────┘
             │
             ▼
    ┌──────────────────┐
    │  /api/seo-engine │
    │  /cron/discover  │
    └────────┬─────────┘
             │
             ▼
    ┌──────────────────────────────────────────────────────────┐
    │                   AI KEYWORD AGENT                        │
    │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐       │
    │  │ Web Search  │  │ Trend APIs  │  │ News Sites  │       │
    │  │ (Google)    │  │ (optional)  │  │ (NL Finance)│       │
    │  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘       │
    │         │                │                │               │
    │         └────────────────┴────────────────┘               │
    │                          │                                │
    │                          ▼                                │
    │         ┌────────────────────────────────┐               │
    │         │  Gemini AI Analyseert:         │               │
    │         │  • Trending topics             │               │
    │         │  • Search volume indicatie     │               │
    │         │  • Relevantie voor AV          │               │
    │         │  • Concurrentie analyse        │               │
    │         └────────────────┬───────────────┘               │
    └──────────────────────────┼───────────────────────────────┘
                               │
                               ▼
                  ┌─────────────────────────┐
                  │  5-10 Keywords opslaan  │
                  │  in Supabase Queue      │
                  │  (priority + scheduled) │
                  └─────────────────────────┘


FASE 2: CONTENT GENERATIE (Dagelijks - 06:00 CET)
═══════════════════════════════════════════════════

    ┌──────────────┐
    │  06:00 CET   │
    │  Vercel Cron │
    └──────┬───────┘
           │
           ▼
    ┌──────────────────┐
    │  /api/seo-engine │
    │  /cron/generate  │
    └──────┬───────────┘
           │
           ▼
    ┌──────────────────┐     ┌─────────────────┐
    │  Keyword Queue   │────▶│  Pak hoogste    │
    │  (Supabase)      │     │  prioriteit     │
    └──────────────────┘     └────────┬────────┘
                                      │
                                      ▼
                             ┌─────────────────┐
                             │  Genereer       │
                             │  Content (AI)   │
                             └────────┬────────┘
                                      │
                                      ▼
                             ┌─────────────────┐
                             │  Sla op als     │
                             │  Draft (Webflow)│
                             └────────┬────────┘
                                      │
                                      ▼
                             ┌─────────────────┐
                             │  Email naar     │
                             │  Admin(s)       │
                             └────────┬────────┘
                                      │
                                      ▼
                             ┌─────────────────┐
                             │  Admin Review   │
                             │  ✓ Publiceren   │
                             │  ✗ Afwijzen     │
                             └─────────────────┘
```

---

## 2. AI Keyword Discovery Engine

### 2.1 Hoe het werkt

De AI Keyword Discovery Engine zoekt automatisch naar trending topics in de Nederlandse financiële sector door:

1. **Web Search** - Zoekt naar recente artikelen, nieuws en trends
2. **AI Analyse** - Gemini analyseert de resultaten en selecteert relevante keywords
3. **Prioritering** - Keywords worden gescoord op relevantie, trending score en concurrentie
4. **Queue Vulling** - Top keywords worden automatisch aan de queue toegevoegd

### 2.2 Search Queries

De AI zoekt op het internet met queries zoals:

```
Categorie: Belastingen
├── "belastingwijzigingen 2026 Nederland"
├── "nieuwe belastingregels ondernemers"
├── "fiscale tips ZZP 2026"
└── "belastingdienst nieuws"

Categorie: Pensioen
├── "pensioenwijzigingen Nederland 2026"
├── "pensioen ZZP nieuws"
├── "AOW leeftijd update"
└── "pensioenopbouw tips"

Categorie: Ondernemers
├── "subsidies ondernemers 2026"
├── "nieuwe regels MKB"
├── "ZZP wetgeving nieuws"
└── "KVK updates ondernemers"

Categorie: Vermogen
├── "beleggen tips 2026"
├── "box 3 nieuws"
├── "vermogensbelasting wijzigingen"
└── "sparen vs beleggen"
```

### 2.3 AI Analyse Prompt

```
Je bent een SEO keyword research specialist voor AmbitionValley, een Nederlands
financieel adviesbureau. Analyseer de volgende zoekresultaten en nieuwsartikelen.

FOCUS GEBIEDEN:
- Belastingadvies (Box 3, IB, VPB, BTW)
- Pensioenplanning (AOW, lijfrente, FOR)
- Ondernemersadvies (ZZP, BV, fiscale optimalisatie)
- Vermogensbeheer (beleggen, estate planning)

SELECTIECRITERIA:
1. Trending - Recent in het nieuws of veel gezocht
2. Relevant - Past bij AmbitionValley's expertise
3. Evergreen potentie - Kan lange tijd relevant blijven
4. Lage concurrentie - Niet te veel bestaande content
5. Informatief - Geschikt voor educatieve content (geen sales)

UITGESLOTEN:
- Cryptocurrency/NFT content
- Specifieke beleggingsadviezen
- Content over andere landen
- Te technische/niche onderwerpen

Retourneer JSON array met 5-10 keywords:
{
  "keywords": [
    {
      "keyword": "pensioenopbouw ZZP 2026",
      "category": "pensioen",
      "trending_score": 8,  // 1-10
      "relevance_score": 9, // 1-10
      "competition": "low", // low, medium, high
      "reasoning": "Nieuwe pensioenwetgeving voor ZZP'ers is actueel topic",
      "suggested_angle": "Praktische gids voor pensioenopbouw als ZZP'er"
    }
  ]
}
```

### 2.4 Bronnen voor Web Search

| Bron | Doel | Methode |
|------|------|---------|
| Google Search | Algemene trending topics | Web Search API |
| nu.nl/economie | Nederlands financieel nieuws | Web Fetch |
| rtlnieuws.nl/economie | Business nieuws | Web Fetch |
| belastingdienst.nl | Officiële updates | Web Fetch |
| kvk.nl/nieuws | Ondernemers nieuws | Web Fetch |
| rijksoverheid.nl | Beleidswijzigingen | Web Fetch |

### 2.5 Cron Endpoint: Keyword Discovery

**Route:** `POST /api/seo-engine/cron/discover`

**Schedule:** Elke maandag om 05:00 CET

```typescript
import { GoogleGenerativeAI } from '@google/generative-ai';

const SEARCH_QUERIES = [
  // Belastingen
  'belastingwijzigingen Nederland 2026',
  'nieuwe fiscale regels ondernemers',
  'box 3 nieuws',
  // Pensioen
  'pensioen nieuws Nederland',
  'AOW wijzigingen',
  'pensioen ZZP updates',
  // Ondernemers
  'ZZP wetgeving nieuws',
  'subsidies MKB 2026',
  'KVK nieuws ondernemers',
  // Vermogen
  'vermogensbelasting updates',
  'beleggen tips',
];

const NEWS_SOURCES = [
  { url: 'https://www.nu.nl/economie', name: 'NU.nl Economie' },
  { url: 'https://www.rtlnieuws.nl/economie', name: 'RTL Economie' },
  { url: 'https://www.rijksoverheid.nl/onderwerpen/belastingplan', name: 'Rijksoverheid' },
];

export async function POST(request: Request) {
  // 1. Valideer cron secret
  const cronSecret = request.headers.get('x-vercel-cron-secret');
  if (cronSecret !== process.env.CRON_SECRET) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // 2. Verzamel data van web search
  const searchResults = await Promise.all(
    SEARCH_QUERIES.map(async (query) => {
      const response = await fetch(
        `https://www.googleapis.com/customsearch/v1?key=${process.env.GOOGLE_SEARCH_API_KEY}&cx=${process.env.GOOGLE_SEARCH_CX}&q=${encodeURIComponent(query)}&num=5&dateRestrict=m1`
      );
      const data = await response.json();
      return {
        query,
        results: data.items?.map((item: any) => ({
          title: item.title,
          snippet: item.snippet,
          link: item.link,
        })) || [],
      };
    })
  );

  // 3. Fetch nieuws bronnen
  const newsContent = await Promise.all(
    NEWS_SOURCES.map(async (source) => {
      try {
        const response = await fetch(source.url);
        const html = await response.text();
        // Extract headlines (simplified - use proper HTML parser in production)
        const headlines = html.match(/<h[1-3][^>]*>([^<]+)<\/h[1-3]>/gi) || [];
        return {
          source: source.name,
          headlines: headlines.slice(0, 10).map(h => h.replace(/<[^>]+>/g, '')),
        };
      } catch {
        return { source: source.name, headlines: [] };
      }
    })
  );

  // 4. AI analyseren met Gemini
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

  const prompt = `
Je bent een SEO keyword research specialist voor AmbitionValley, een Nederlands
financieel adviesbureau.

Hier zijn recente zoekresultaten en nieuwskoppen uit Nederlandse bronnen:

ZOEKRESULTATEN:
${JSON.stringify(searchResults, null, 2)}

NIEUWS HEADLINES:
${JSON.stringify(newsContent, null, 2)}

Analyseer deze data en selecteer 7 trending keywords/topics die:
1. Actueel en trending zijn (recent in het nieuws)
2. Relevant zijn voor financieel/fiscaal advies
3. Geschikt zijn voor een educatieve blogpost
4. NIET over crypto, specifieke aandelen, of buitenlandse markten gaan

Retourneer ALLEEN een JSON object (geen markdown):
{
  "keywords": [
    {
      "keyword": "het keyword of topic",
      "category": "belasting|pensioen|ondernemer|vermogen",
      "trending_score": 8,
      "relevance_score": 9,
      "competition": "low|medium|high",
      "reasoning": "waarom dit keyword relevant is",
      "suggested_angle": "voorgestelde invalshoek voor blogpost"
    }
  ],
  "discovery_summary": "korte samenvatting van de gevonden trends"
}
`;

  const result = await model.generateContent(prompt);
  const responseText = result.response.text();

  // Parse JSON response
  const jsonMatch = responseText.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error('Invalid AI response format');
  }

  const discoveredKeywords = JSON.parse(jsonMatch[0]);

  // 5. Opslaan in database
  const supabase = await createClient();

  // Check voor bestaande keywords om duplicaten te voorkomen
  const { data: existingKeywords } = await supabase
    .from('seo_keyword_queue')
    .select('keyword')
    .in('status', ['pending', 'in_progress', 'completed']);

  const existingSet = new Set(existingKeywords?.map(k => k.keyword.toLowerCase()) || []);

  const newKeywords = discoveredKeywords.keywords.filter(
    (k: any) => !existingSet.has(k.keyword.toLowerCase())
  );

  // Insert nieuwe keywords met priority en scheduled dates
  const today = new Date();
  const keywordsToInsert = newKeywords.map((k: any, index: number) => ({
    keyword: k.keyword,
    language: 'nl',
    priority: 10 - k.trending_score, // Hogere trending = lagere priority number = eerder verwerkt
    status: 'pending',
    content_type: 'long',
    scheduled_date: new Date(today.getTime() + (index * 24 * 60 * 60 * 1000)).toISOString().split('T')[0],
    metadata: {
      category: k.category,
      trending_score: k.trending_score,
      relevance_score: k.relevance_score,
      competition: k.competition,
      reasoning: k.reasoning,
      suggested_angle: k.suggested_angle,
      discovered_at: new Date().toISOString(),
    },
  }));

  if (keywordsToInsert.length > 0) {
    await supabase.from('seo_keyword_queue').insert(keywordsToInsert);
  }

  // 6. Log discovery run
  await supabase.from('seo_discovery_log').insert({
    keywords_found: discoveredKeywords.keywords.length,
    keywords_added: keywordsToInsert.length,
    keywords_skipped: discoveredKeywords.keywords.length - keywordsToInsert.length,
    summary: discoveredKeywords.discovery_summary,
    raw_response: discoveredKeywords,
  });

  return Response.json({
    success: true,
    discovered: discoveredKeywords.keywords.length,
    added: keywordsToInsert.length,
    skipped: discoveredKeywords.keywords.length - keywordsToInsert.length,
    summary: discoveredKeywords.discovery_summary,
  });
}
```

### 2.6 Alternatief: Gemini met Grounding (Google Search)

Gemini 1.5 heeft ingebouwde "grounding" met Google Search, waardoor je geen aparte Search API nodig hebt:

```typescript
const model = genAI.getGenerativeModel({
  model: 'gemini-1.5-flash',
  tools: [{ googleSearch: {} }], // Enable Google Search grounding
});

const prompt = `
Zoek op het internet naar de meest recente trending topics in de Nederlandse
financiële sector. Focus op:
- Belastingnieuws en wijzigingen
- Pensioenregelingen updates
- ZZP en ondernemers nieuws
- Vermogensbelasting ontwikkelingen

Zoek naar artikelen van de afgelopen week en selecteer 7 keywords die
geschikt zijn voor een educatieve blogpost.
`;

const result = await model.generateContent(prompt);
// Gemini zoekt automatisch op internet en baseert antwoord op recente bronnen
```

---

## 3. Componenten

### 3.1 Keyword Queue (Supabase)

Database tabel voor het beheren van keywords die gegenereerd moeten worden.

**Tabel: `seo_keyword_queue`**

| Kolom | Type | Beschrijving |
|-------|------|--------------|
| id | uuid | Primary key |
| keyword | text | Het keyword/onderwerp |
| language | text | "nl" of "en" |
| priority | int | 1 = hoogste prioriteit |
| status | text | "pending", "in_progress", "completed", "failed" |
| scheduled_date | date | Geplande datum voor generatie (nullable) |
| created_at | timestamp | Aanmaakdatum |
| processed_at | timestamp | Wanneer verwerkt (nullable) |
| webflow_item_id | text | Resulterende Webflow item ID (nullable) |
| error_message | text | Foutmelding indien mislukt (nullable) |

**Status Flow:**
```
pending → in_progress → completed
                     ↘ failed
```

### 2.2 Cron Endpoint

**Route:** `POST /api/seo-engine/cron/generate`

**Beveiliging:**
- Vercel Cron secret header validatie
- Of ADMIN_API_TOKEN voor handmatige triggers

**Logica:**
1. Haal volgende pending keyword op (laagste priority, oudste scheduled_date)
2. Markeer als "in_progress"
3. Genereer content via bestaande content generator
4. Sla op in Webflow als draft
5. Markeer keyword als "completed" met webflow_item_id
6. Stuur email notificatie
7. Bij fout: markeer als "failed" met error_message

### 2.3 Email Template

**Onderwerp:** `Nieuwe blog post ter review: {title}`

**Inhoud:**
- Post titel
- Keyword gebruikt
- Korte samenvatting (eerste 200 karakters)
- Direct link naar admin review pagina
- Datum/tijd van generatie

### 2.4 Vercel Cron Configuratie

**vercel.json:**
```json
{
  "crons": [
    {
      "path": "/api/seo-engine/cron/generate",
      "schedule": "0 5 * * *"
    }
  ]
}
```

*Note: 5:00 UTC = 6:00 CET (wintertijd) / 7:00 CEST (zomertijd)*

---

## 3. Database Migratie

Toevoegen aan `supabase/migrations/20251205140351_initial_schema.sql`:

```sql
-- =============================================================================
-- SEO Keyword Queue
-- =============================================================================

CREATE TABLE IF NOT EXISTS seo_keyword_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  keyword TEXT NOT NULL,
  language TEXT NOT NULL DEFAULT 'nl' CHECK (language IN ('nl', 'en')),
  priority INT NOT NULL DEFAULT 10,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'failed', 'skipped')),
  scheduled_date DATE,
  content_type TEXT DEFAULT 'long' CHECK (content_type IN ('short', 'long', 'mixed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  processed_at TIMESTAMPTZ,
  webflow_item_id TEXT,
  error_message TEXT,
  retry_count INT DEFAULT 0,
  created_by UUID REFERENCES auth.users(id),
  UNIQUE(keyword, language)
);

-- Index voor efficiente queries
CREATE INDEX idx_keyword_queue_status ON seo_keyword_queue(status);
CREATE INDEX idx_keyword_queue_scheduled ON seo_keyword_queue(scheduled_date) WHERE status = 'pending';
CREATE INDEX idx_keyword_queue_priority ON seo_keyword_queue(priority, created_at) WHERE status = 'pending';

-- RLS Policies
ALTER TABLE seo_keyword_queue ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage keyword queue"
  ON seo_keyword_queue
  FOR ALL
  USING (auth.uid() IN (SELECT id FROM auth.users WHERE email LIKE '%@ambitionvalley.nl'))
  WITH CHECK (auth.uid() IN (SELECT id FROM auth.users WHERE email LIKE '%@ambitionvalley.nl'));

-- Service role heeft volledige toegang (voor cron jobs)
CREATE POLICY "Service role full access"
  ON seo_keyword_queue
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- =============================================================================
-- SEO Generation Log
-- =============================================================================

CREATE TABLE IF NOT EXISTS seo_generation_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  keyword_queue_id UUID REFERENCES seo_keyword_queue(id),
  webflow_item_id TEXT,
  title TEXT,
  slug TEXT,
  status TEXT NOT NULL CHECK (status IN ('started', 'content_generated', 'saved_to_webflow', 'email_sent', 'completed', 'failed')),
  duration_ms INT,
  error_message TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_generation_log_keyword ON seo_generation_log(keyword_queue_id);
CREATE INDEX idx_generation_log_created ON seo_generation_log(created_at DESC);

-- =============================================================================
-- Admin Notification Settings
-- =============================================================================

CREATE TABLE IF NOT EXISTS seo_notification_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  email TEXT NOT NULL,
  notify_on_generation BOOLEAN DEFAULT true,
  notify_on_publish BOOLEAN DEFAULT true,
  notify_on_error BOOLEAN DEFAULT true,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX idx_notification_email ON seo_notification_settings(email) WHERE is_active = true;

-- =============================================================================
-- SEO Discovery Log (voor AI keyword discovery runs)
-- =============================================================================

CREATE TABLE IF NOT EXISTS seo_discovery_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  keywords_found INT NOT NULL DEFAULT 0,
  keywords_added INT NOT NULL DEFAULT 0,
  keywords_skipped INT NOT NULL DEFAULT 0,
  summary TEXT,
  raw_response JSONB,
  search_queries_used JSONB,
  news_sources_checked JSONB,
  error_message TEXT,
  duration_ms INT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_discovery_log_created ON seo_discovery_log(created_at DESC);
```

**Let op:** De `seo_keyword_queue` tabel heeft nu ook een `metadata` JSONB kolom nodig:

```sql
-- Voeg metadata kolom toe aan keyword queue
ALTER TABLE seo_keyword_queue ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}';
```

---

## 4. API Routes

### 4.1 Cron Generate Endpoint

**File:** `src/app/api/seo-engine/cron/generate/route.ts`

```typescript
import { createClient } from '@/lib/supabase/server';
import { createWebflowClient, createContentGenerator } from '@/integrations/seo-engine';
import { sendNewPostNotification } from '@/lib/email/seo-notifications';

export async function POST(request: Request) {
  // 1. Valideer Vercel Cron of Admin token
  const authHeader = request.headers.get('authorization');
  const cronSecret = request.headers.get('x-vercel-cron-secret');

  if (cronSecret !== process.env.CRON_SECRET &&
      authHeader !== `Bearer ${process.env.ADMIN_API_TOKEN}`) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = await createClient();

  // 2. Haal volgende pending keyword
  const { data: keyword, error } = await supabase
    .from('seo_keyword_queue')
    .select('*')
    .eq('status', 'pending')
    .lte('scheduled_date', new Date().toISOString().split('T')[0])
    .order('priority', { ascending: true })
    .order('created_at', { ascending: true })
    .limit(1)
    .single();

  if (error || !keyword) {
    return Response.json({
      message: 'No keywords pending',
      generated: false
    });
  }

  // 3. Markeer als in_progress
  await supabase
    .from('seo_keyword_queue')
    .update({ status: 'in_progress' })
    .eq('id', keyword.id);

  try {
    // 4. Genereer content
    const generator = createContentGenerator();
    const content = await generator.generate({
      keyword: keyword.keyword,
      language: keyword.language,
      contentType: keyword.content_type || 'long',
    });

    // 5. Sla op in Webflow
    const webflowClient = createWebflowClient({
      apiToken: process.env.WEBFLOW_API_TOKEN!,
      siteId: process.env.WEBFLOW_SITE_ID!,
      collectionId: process.env.WEBFLOW_COLLECTION_ID!,
    });

    const item = await webflowClient.createItem({
      fieldData: {
        name: content.title,
        slug: content.slug,
        'post-summary': content.summary,
        'rich-text': content.body,
        'meta-title': content.metaTitle,
        'meta-description': content.metaDescription,
        'source-keyword': keyword.keyword,
        language: keyword.language === 'nl' ? 'Dutch' : 'English',
      },
      isDraft: true,
    });

    // 6. Update keyword status
    await supabase
      .from('seo_keyword_queue')
      .update({
        status: 'completed',
        processed_at: new Date().toISOString(),
        webflow_item_id: item.id,
      })
      .eq('id', keyword.id);

    // 7. Stuur email notificatie
    await sendNewPostNotification({
      title: content.title,
      keyword: keyword.keyword,
      summary: content.summary.substring(0, 200),
      adminUrl: `${process.env.NEXT_PUBLIC_APP_URL}/admin/seo-engine/${item.id}`,
      generatedAt: new Date().toISOString(),
    });

    // 8. Log success
    await supabase.from('seo_generation_log').insert({
      keyword_queue_id: keyword.id,
      webflow_item_id: item.id,
      title: content.title,
      slug: content.slug,
      status: 'completed',
    });

    return Response.json({
      message: 'Content generated successfully',
      generated: true,
      itemId: item.id,
      title: content.title,
    });

  } catch (error) {
    // Log error
    await supabase
      .from('seo_keyword_queue')
      .update({
        status: 'failed',
        error_message: error instanceof Error ? error.message : 'Unknown error',
        retry_count: keyword.retry_count + 1,
      })
      .eq('id', keyword.id);

    await supabase.from('seo_generation_log').insert({
      keyword_queue_id: keyword.id,
      status: 'failed',
      error_message: error instanceof Error ? error.message : 'Unknown error',
    });

    throw error;
  }
}
```

### 4.2 Keyword Queue Management

**File:** `src/app/api/seo-engine/keywords/queue/route.ts`

```typescript
// GET - Lijst alle keywords in queue
// POST - Voeg nieuw keyword toe
// PATCH - Update keyword (priority, scheduled_date)
// DELETE - Verwijder keyword uit queue
```

---

## 5. Email Templates

### 5.1 Nieuwe Post Notificatie

**File:** `src/lib/email/templates/seo-new-post.tsx`

```tsx
import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Text,
} from '@react-email/components';

interface NewPostEmailProps {
  title: string;
  keyword: string;
  summary: string;
  adminUrl: string;
  generatedAt: string;
}

export function NewPostEmail({ title, keyword, summary, adminUrl, generatedAt }: NewPostEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Nieuwe blog post gegenereerd: {title}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>Nieuwe Blog Post</Heading>

          <Text style={text}>
            Er is een nieuwe blog post gegenereerd die wacht op jouw goedkeuring.
          </Text>

          <Section style={infoBox}>
            <Text style={label}>Titel</Text>
            <Text style={value}>{title}</Text>

            <Text style={label}>Keyword</Text>
            <Text style={value}>{keyword}</Text>

            <Text style={label}>Samenvatting</Text>
            <Text style={value}>{summary}...</Text>

            <Text style={label}>Gegenereerd op</Text>
            <Text style={value}>
              {new Date(generatedAt).toLocaleString('nl-NL', {
                dateStyle: 'long',
                timeStyle: 'short',
              })}
            </Text>
          </Section>

          <Section style={buttonContainer}>
            <Button style={button} href={adminUrl}>
              Review & Publiceren
            </Button>
          </Section>

          <Text style={footer}>
            Dit is een automatische notificatie van de AmbitionValley SEO Content Engine.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

const main = { backgroundColor: '#0a0a0a', padding: '40px 0' };
const container = { backgroundColor: '#1a1a1a', borderRadius: '16px', padding: '40px', maxWidth: '600px', margin: '0 auto' };
const h1 = { color: '#ffffff', fontSize: '24px', fontWeight: 'bold', marginBottom: '24px' };
const text = { color: '#a0a0a0', fontSize: '16px', lineHeight: '24px' };
const infoBox = { backgroundColor: '#2a2a2a', borderRadius: '12px', padding: '24px', marginTop: '24px' };
const label = { color: '#666666', fontSize: '12px', textTransform: 'uppercase' as const, marginBottom: '4px' };
const value = { color: '#ffffff', fontSize: '16px', marginTop: '0', marginBottom: '16px' };
const buttonContainer = { marginTop: '32px', textAlign: 'center' as const };
const button = { backgroundColor: '#22c55e', color: '#ffffff', padding: '12px 24px', borderRadius: '8px', textDecoration: 'none', fontWeight: 'bold' };
const footer = { color: '#666666', fontSize: '12px', marginTop: '32px', textAlign: 'center' as const };
```

### 5.2 Email Verzend Functie

**File:** `src/lib/email/seo-notifications.ts`

```typescript
import { Resend } from 'resend';
import { NewPostEmail } from './templates/seo-new-post';

const resend = new Resend(process.env.RESEND_API_KEY);

interface SendNewPostNotificationParams {
  title: string;
  keyword: string;
  summary: string;
  adminUrl: string;
  generatedAt: string;
}

export async function sendNewPostNotification(params: SendNewPostNotificationParams) {
  // Haal admin emails op uit database of gebruik fallback
  const adminEmails = process.env.SEO_ADMIN_EMAILS?.split(',') || ['admin@ambitionvalley.nl'];

  await resend.emails.send({
    from: 'SEO Engine <seo@ambitionvalley.nl>',
    to: adminEmails,
    subject: `Nieuwe blog post ter review: ${params.title}`,
    react: NewPostEmail(params),
  });
}

export async function sendGenerationErrorNotification(params: {
  keyword: string;
  error: string;
}) {
  const adminEmails = process.env.SEO_ADMIN_EMAILS?.split(',') || ['admin@ambitionvalley.nl'];

  await resend.emails.send({
    from: 'SEO Engine <seo@ambitionvalley.nl>',
    to: adminEmails,
    subject: `[FOUT] Blog generatie mislukt: ${params.keyword}`,
    text: `De blog generatie voor keyword "${params.keyword}" is mislukt.\n\nFoutmelding: ${params.error}`,
  });
}
```

---

## 6. Admin UI voor Keyword Queue

### 6.1 Queue Management Pagina

**File:** `src/app/admin/seo-engine/queue/page.tsx`

Features:
- Overzicht van alle keywords in queue
- Status filters (pending, completed, failed)
- Keywords toevoegen (handmatig of bulk import)
- Priority aanpassen via drag & drop
- Scheduled date instellen
- Keywords verwijderen

### 6.2 Queue Statistieken

Dashboard widgets:
- Aantal pending keywords
- Aantal gegenereerde posts deze week/maand
- Foutpercentage
- Volgende geplande generatie

---

## 7. Configuratie

### 7.1 Environment Variables

Toevoegen aan `.env.local`:

```env
# Vercel Cron Secret (genereer met: openssl rand -hex 32)
CRON_SECRET=your-cron-secret-here

# Admin emails voor notificaties (comma-separated)
SEO_ADMIN_EMAILS=admin@ambitionvalley.nl,team@ambitionvalley.nl

# App URL voor admin links in emails
NEXT_PUBLIC_APP_URL=https://app.ambitionvalley.nl
```

### 7.2 Vercel Cron Setup

**vercel.json:**

```json
{
  "crons": [
    {
      "path": "/api/seo-engine/cron/discover",
      "schedule": "0 4 * * 1"
    },
    {
      "path": "/api/seo-engine/cron/generate",
      "schedule": "0 5 * * *"
    }
  ]
}
```

**Cron Schedule Uitleg:**

| Cron | Schedule | Beschrijving |
|------|----------|--------------|
| `/cron/discover` | `0 4 * * 1` | Elke maandag 05:00 CET - Zoekt nieuwe keywords |
| `/cron/generate` | `0 5 * * *` | Elke dag 06:00 CET - Genereert blog post |

**Alternatieve Schedules:**

```
Discovery (keyword zoeken):
├── 0 4 * * 1      → Wekelijks (maandag 05:00 CET)
├── 0 4 * * 1,4    → 2x per week (ma + do)
└── 0 4 1,15 * *   → 2x per maand (1e en 15e)

Generation (blog maken):
├── 0 5 * * *      → Dagelijks 06:00 CET
├── 0 5 * * 1-5    → Alleen werkdagen
└── 0 5 * * 1,3,5  → Ma, wo, vr
```

---

## 8. Monitoring & Logging

### 8.1 Generation Log

De `seo_generation_log` tabel houdt bij:
- Wanneer content is gegenereerd
- Hoelang het duurde
- Of het succesvol was
- Eventuele fouten

### 8.2 Alerts

Automatische alerts bij:
- 3+ opeenvolgende mislukte generaties
- Queue is leeg (geen pending keywords)
- Webflow API fouten

---

## 9. Implementatie Volgorde

### Fase 1: Database (1-2 uur)
1. [ ] Voeg tabellen toe aan migratie (`seo_keyword_queue`, `seo_generation_log`, `seo_discovery_log`)
2. [ ] Run migratie lokaal
3. [ ] Push naar remote Supabase
4. [ ] Genereer TypeScript types

### Fase 2: AI Keyword Discovery (3-4 uur)
1. [ ] Maak `/api/seo-engine/cron/discover` route
2. [ ] Implementeer web search queries
3. [ ] Integreer Gemini AI voor analyse
4. [ ] Keyword scoring en prioritering
5. [ ] Opslaan in database queue
6. [ ] Test met handmatige trigger

### Fase 3: Content Generation Cron (2-3 uur)
1. [ ] Maak `/api/seo-engine/cron/generate` route
2. [ ] Implementeer keyword selectie uit queue
3. [ ] Integreer met bestaande content generator
4. [ ] Sla resultaat op in Webflow als draft
5. [ ] Update keyword status in queue

### Fase 4: Email Notificaties (1-2 uur)
1. [ ] Maak email template met React Email
2. [ ] Implementeer verzend functie met Resend
3. [ ] Voeg error notificaties toe
4. [ ] Test email delivery

### Fase 5: Admin UI Updates (2-3 uur)
1. [ ] Queue overzicht pagina (`/admin/seo-engine/queue`)
2. [ ] Discovery log viewer
3. [ ] Handmatige discovery trigger button
4. [ ] Keyword priority management

### Fase 6: Vercel Cron & Deploy (1 uur)
1. [ ] Configureer vercel.json met beide crons
2. [ ] Voeg CRON_SECRET toe aan Vercel env
3. [ ] Deploy naar productie
4. [ ] Test cron endpoints
5. [ ] Monitor eerste runs

---

## 10. Toekomstige Uitbreidingen

### Volgende Fase
- [ ] Google Search Console integratie voor keyword performance
- [ ] Automatische republishing van underperforming content
- [ ] A/B test titels met meerdere varianten
- [ ] Scheduled publishing (automatisch publiceren na X dagen als draft)
- [ ] Multi-language support (Engels naast Nederlands)

### Geavanceerde Features
- [ ] Competitor keyword monitoring
- [ ] Slack/Discord notificaties naast email
- [ ] Performance-based keyword prioritering (keywords die goed presteren krijgen meer follow-up)
- [ ] Automatische interne linking suggesties
- [ ] Content refresh scheduler (oude posts updaten)

---

## 11. Architectuur Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           VOLLEDIGE ARCHITECTUUR                             │
└─────────────────────────────────────────────────────────────────────────────┘

                              ┌─────────────────┐
                              │   VERCEL CRON   │
                              └────────┬────────┘
                                       │
                    ┌──────────────────┼──────────────────┐
                    │                  │                  │
                    ▼                  ▼                  ▼
           ┌────────────────┐ ┌────────────────┐ ┌────────────────┐
           │ /cron/discover │ │ /cron/generate │ │ /cron/cleanup  │
           │ (wekelijks)    │ │ (dagelijks)    │ │ (maandelijks)  │
           └───────┬────────┘ └───────┬────────┘ └───────┬────────┘
                   │                  │                  │
                   ▼                  ▼                  ▼
    ┌──────────────────────────────────────────────────────────────┐
    │                         SUPABASE                              │
    │  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐          │
    │  │keyword_queue │ │generation_log│ │discovery_log │          │
    │  └──────────────┘ └──────────────┘ └──────────────┘          │
    └──────────────────────────────────────────────────────────────┘
                   │                  │
                   │                  ▼
                   │         ┌────────────────┐
                   │         │    WEBFLOW     │
                   │         │   (CMS API)    │
                   │         └───────┬────────┘
                   │                 │
                   ▼                 ▼
    ┌──────────────────────────────────────────────────────────────┐
    │                          RESEND                               │
    │                    (Email Notificaties)                       │
    └──────────────────────────────────────────────────────────────┘
                                 │
                                 ▼
    ┌──────────────────────────────────────────────────────────────┐
    │                      ADMIN DASHBOARD                          │
    │  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐          │
    │  │ /seo-engine  │ │ /seo-engine/ │ │ /seo-engine/ │          │
    │  │ (overzicht)  │ │ queue        │ │ [id] (detail)│          │
    │  └──────────────┘ └──────────────┘ └──────────────┘          │
    └──────────────────────────────────────────────────────────────┘

EXTERNE SERVICES:
├── Google Search API (of Gemini Grounding) - Keyword discovery
├── Gemini AI - Content analyse en generatie
├── Webflow API v2 - CMS management
└── Resend - Email delivery
```

---

## 12. Samenvatting

| Functie | Automatisch | Frequentie | Output |
|---------|-------------|------------|--------|
| Keyword Discovery | ✅ | Wekelijks | 5-10 nieuwe keywords in queue |
| Content Generatie | ✅ | Dagelijks | 1 blog post als draft in Webflow |
| Email Notificatie | ✅ | Na elke generatie | Email naar admins |
| Review & Publish | ❌ | Handmatig | Admin keurt goed en publiceert |

**Resultaat:** Elke week worden automatisch trending keywords ontdekt, elke dag wordt een blog gegenereerd, en admins krijgen een email om te reviewen en publiceren. Geen handmatige input nodig behalve de finale goedkeuring.
