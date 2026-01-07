/**
 * POST /api/seo-engine/cron/discover
 * AI-powered keyword discovery that searches the internet for trending topics
 * Schedule: Weekly (Monday 05:00 CET)
 */

import { createServiceClient } from '@/lib/supabase/server';

// Search categories for Dutch financial topics
const SEARCH_CATEGORIES = {
  belasting: [
    'belastingwijzigingen Nederland',
    'nieuwe fiscale regels ondernemers',
    'box 3 nieuws',
    'belastingaangifte tips',
    'BTW wijzigingen',
  ],
  pensioen: [
    'pensioen nieuws Nederland',
    'AOW wijzigingen',
    'pensioen ZZP updates',
    'pensioenopbouw tips',
    'lijfrente nieuws',
  ],
  ondernemer: [
    'ZZP wetgeving nieuws',
    'subsidies MKB',
    'KVK nieuws ondernemers',
    'starten eigen bedrijf',
    'BV oprichten tips',
  ],
  vermogen: [
    'vermogensbelasting updates',
    'beleggen tips',
    'sparen of beleggen',
    'erfbelasting nieuws',
    'estate planning',
  ],
};

interface DiscoveredKeyword {
  keyword: string;
  category: string;
  trending_score: number;
  relevance_score: number;
  competition: 'low' | 'medium' | 'high';
  reasoning: string;
  suggested_angle: string;
}

interface DiscoveryResponse {
  keywords: DiscoveredKeyword[];
  discovery_summary: string;
}

export async function POST(request: Request) {
  const startTime = Date.now();

  // Validate cron secret or admin token
  const cronSecret = request.headers.get('x-vercel-cron-secret');
  const authHeader = request.headers.get('authorization');

  const isValidCron = cronSecret === process.env.CRON_SECRET;
  const isValidAdmin = authHeader === `Bearer ${process.env.ADMIN_API_TOKEN}`;

  if (!isValidCron && !isValidAdmin) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = createServiceClient();

  try {
    // Build comprehensive search prompt
    const allQueries = Object.values(SEARCH_CATEGORIES).flat();
    const currentYear = new Date().getFullYear();

    const prompt = `Je bent een SEO keyword research specialist voor AmbitionValley, een Nederlands financieel adviesbureau.

TAAK: Zoek op het internet naar de meest recente trending topics in de Nederlandse financiële sector. Gebruik je kennis van recente gebeurtenissen en trends.

ZOEK SPECIFIEK NAAR:
${allQueries.map((q) => `- ${q} ${currentYear}`).join('\n')}

FOCUS GEBIEDEN:
- Belastingadvies (Box 3, IB, VPB, BTW, belastingaangifte)
- Pensioenplanning (AOW, lijfrente, FOR, pensioen ZZP)
- Ondernemersadvies (ZZP, BV, fiscale optimalisatie, subsidies)
- Vermogensbeheer (beleggen, sparen, erfbelasting)

SELECTIECRITERIA:
1. TRENDING - Recent in het nieuws of veel gezocht (afgelopen maand)
2. RELEVANT - Past bij financieel/fiscaal advies voor Nederlandse particulieren en ondernemers
3. EVERGREEN POTENTIE - Kan lange tijd relevant blijven
4. INFORMATIEF - Geschikt voor educatieve blogpost (geen directe verkooppraatjes)

UITGESLOTEN (NOOIT selecteren):
- Cryptocurrency, NFT, of speculatieve beleggingen
- Specifieke aandelen of beleggingsadviezen
- Content over andere landen dan Nederland
- Te technische/niche onderwerpen die alleen specialisten begrijpen
- Onderwerpen die al uitgebreid behandeld zijn

Retourneer ALLEEN een JSON object (geen markdown code blocks, geen extra tekst):
{
  "keywords": [
    {
      "keyword": "het keyword of topic (3-6 woorden)",
      "category": "belasting|pensioen|ondernemer|vermogen",
      "trending_score": 8,
      "relevance_score": 9,
      "competition": "low",
      "reasoning": "korte uitleg waarom dit nu relevant is",
      "suggested_angle": "voorgestelde invalshoek voor blogpost"
    }
  ],
  "discovery_summary": "korte samenvatting van de belangrijkste trends die je hebt gevonden"
}

Selecteer precies 7 keywords, gesorteerd op relevantie en trending potentie.`;

    // Call Gemini API directly
    const geminiResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ role: 'user', parts: [{ text: prompt }] }],
          generationConfig: {
            maxOutputTokens: 4096,
            temperature: 0.7,
          },
        }),
      }
    );

    if (!geminiResponse.ok) {
      const errorText = await geminiResponse.text();
      throw new Error(`Gemini API error: ${geminiResponse.status} - ${errorText}`);
    }

    const geminiData = await geminiResponse.json();
    const responseText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!responseText) {
      throw new Error('No content in Gemini response');
    }

    // Parse JSON response (handle potential markdown code blocks)
    let jsonText = responseText;
    const jsonMatch = responseText.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (jsonMatch) {
      jsonText = jsonMatch[1].trim();
    } else {
      // Try to find raw JSON
      const rawJsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (rawJsonMatch) {
        jsonText = rawJsonMatch[0];
      }
    }

    let discoveredKeywords: DiscoveryResponse;
    try {
      discoveredKeywords = JSON.parse(jsonText);
    } catch {
      console.error('Failed to parse AI response:', responseText);
      throw new Error('Invalid AI response format - could not parse JSON');
    }

    if (!discoveredKeywords.keywords || !Array.isArray(discoveredKeywords.keywords)) {
      throw new Error('Invalid AI response - missing keywords array');
    }

    // Check for existing keywords to avoid duplicates
    const { data: existingKeywords } = await supabase
      .from('seo_keyword_queue' as 'event_types')
      .select('keyword')
      .in('status', ['pending', 'in_progress', 'completed']);

    const existingSet = new Set(
      (existingKeywords as unknown as { keyword: string }[] | null)?.map((k) => k.keyword.toLowerCase()) || []
    );

    // Also check existing seo_keywords table for published content
    const { data: publishedKeywords } = await supabase
      .from('seo_keywords')
      .select('keyword')
      .eq('status', 'published');

    const publishedSet = new Set(
      publishedKeywords?.map((k) => k.keyword.toLowerCase()) || []
    );

    // Filter out duplicates
    const newKeywords = discoveredKeywords.keywords.filter((k) => {
      const lowerKeyword = k.keyword.toLowerCase();
      return !existingSet.has(lowerKeyword) && !publishedSet.has(lowerKeyword);
    });

    // Insert new keywords with priority and scheduled dates
    const today = new Date();
    const keywordsToInsert = newKeywords.map((k, index) => ({
      keyword: k.keyword,
      language: 'nl',
      priority: Math.max(1, 10 - k.trending_score), // Higher trending = lower priority number = processed first
      status: 'pending',
      content_type: 'long',
      scheduled_date: new Date(
        today.getTime() + index * 24 * 60 * 60 * 1000
      )
        .toISOString()
        .split('T')[0],
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
      const { error: insertError } = await supabase
        .from('seo_keyword_queue')
        .insert(keywordsToInsert);

      if (insertError) {
        console.error('Error inserting keywords:', insertError);
        throw new Error(`Failed to insert keywords: ${insertError.message}`);
      }
    }

    const durationMs = Date.now() - startTime;

    // Log discovery run
    await supabase.from('seo_discovery_log').insert({
      keywords_found: discoveredKeywords.keywords.length,
      keywords_added: keywordsToInsert.length,
      keywords_skipped:
        discoveredKeywords.keywords.length - keywordsToInsert.length,
      summary: discoveredKeywords.discovery_summary,
      raw_response: discoveredKeywords as unknown as null,
      search_queries_used: allQueries as unknown as null,
      duration_ms: durationMs,
    });

    return Response.json({
      success: true,
      discovered: discoveredKeywords.keywords.length,
      added: keywordsToInsert.length,
      skipped: discoveredKeywords.keywords.length - keywordsToInsert.length,
      summary: discoveredKeywords.discovery_summary,
      keywords: keywordsToInsert.map((k) => ({
        keyword: k.keyword,
        scheduled: k.scheduled_date,
        priority: k.priority,
      })),
      duration_ms: durationMs,
    });
  } catch (error) {
    const durationMs = Date.now() - startTime;

    // Log error
    await supabase.from('seo_discovery_log').insert({
      keywords_found: 0,
      keywords_added: 0,
      keywords_skipped: 0,
      error_message: error instanceof Error ? error.message : 'Unknown error',
      duration_ms: durationMs,
    });

    console.error('Keyword discovery failed:', error);

    return Response.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        duration_ms: durationMs,
      },
      { status: 500 }
    );
  }
}
