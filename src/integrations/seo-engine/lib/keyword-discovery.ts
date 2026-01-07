/**
 * SEO Content Engine - Keyword Discovery Engine
 *
 * Discovers trending keywords for Dutch financial advisory topics.
 * Integrates with multiple data sources and manages keyword queue.
 */

import { createClient } from '@supabase/supabase-js';
import { keywordConfig } from '../config';
import type { KeywordIntent, KeywordStatus, Language } from '../types';

// =============================================================================
// Types
// =============================================================================

export interface KeywordDiscoverySource {
  name: string;
  discover(options: DiscoveryOptions): Promise<DiscoveredKeyword[]>;
}

export interface DiscoveryOptions {
  languages?: Language[];
  categories?: string[];
  limit?: number;
}

export interface DiscoveredKeyword {
  keyword: string;
  language: Language;
  volume?: number;
  difficulty?: number;
  sourceData?: Record<string, unknown>;
}

export interface KeywordWithIntent extends DiscoveredKeyword {
  intent: KeywordIntent;
}

export interface KeywordRecord {
  id: string;
  keyword: string;
  language: Language;
  intent: KeywordIntent;
  volume: number;
  difficulty: number;
  discovered_at: string;
  status: KeywordStatus;
  last_used: string | null;
  source: string | null;
  source_data: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
}

export interface KeywordDiscoveryResult {
  discovered: number;
  added: number;
  duplicates: number;
  errors: string[];
}

// =============================================================================
// Intent Classification
// =============================================================================

const TRANSACTIONAL_SIGNALS = [
  // Dutch
  'aanvragen', 'bestellen', 'kopen', 'inhuren', 'offerte', 'prijzen', 'kosten',
  'tarieven', 'adviseur', 'kantoor', 'afspraak', 'consult', 'hulp', 'dienst',
  'laten', 'uitbesteden', 'regelen',
  // English
  'buy', 'hire', 'book', 'order', 'quote', 'price', 'cost', 'service',
  'consultant', 'advisor', 'appointment', 'help', 'get',
];

const LOCAL_SIGNALS = [
  // Dutch cities/regions
  'amsterdam', 'rotterdam', 'den haag', 'utrecht', 'eindhoven', 'tilburg',
  'groningen', 'almere', 'breda', 'nijmegen', 'enschede', 'haarlem',
  'arnhem', 'zaanstad', 'haarlemmermeer', 'zoetermeer', 'zwolle',
  // Generic local terms
  'bij mij in de buurt', 'in de buurt', 'regio', 'lokaal', 'nearby', 'near me',
  'local', 'in my area',
];

const INFORMATIONAL_SIGNALS = [
  // Dutch
  'wat is', 'hoe', 'waarom', 'wanneer', 'uitleg', 'betekenis', 'definitie',
  'gids', 'handleiding', 'tips', 'advies', 'informatie', 'overzicht',
  'verschil', 'vergelijk', 'voorbeeld', 'berekenen', 'calculator',
  // English
  'what is', 'how to', 'why', 'when', 'guide', 'tutorial', 'tips', 'advice',
  'information', 'overview', 'difference', 'compare', 'example', 'calculate',
  'meaning', 'definition', 'explained',
];

/**
 * Classify keyword intent based on signals in the keyword text.
 */
export function classifyIntent(keyword: string): KeywordIntent {
  const lowerKeyword = keyword.toLowerCase();

  // Check for local signals first (most specific)
  for (const signal of LOCAL_SIGNALS) {
    if (lowerKeyword.includes(signal)) {
      return 'local';
    }
  }

  // Check for transactional signals
  for (const signal of TRANSACTIONAL_SIGNALS) {
    if (lowerKeyword.includes(signal)) {
      return 'transactional';
    }
  }

  // Check for informational signals
  for (const signal of INFORMATIONAL_SIGNALS) {
    if (lowerKeyword.includes(signal)) {
      return 'informational';
    }
  }

  // Default to informational for general queries
  return 'informational';
}

// =============================================================================
// Keyword Discovery Service
// =============================================================================

export class KeywordDiscoveryService {
  private sources: Map<string, KeywordDiscoverySource> = new Map();
  private supabaseUrl: string;
  private supabaseKey: string;

  constructor(supabaseUrl: string, supabaseKey: string) {
    this.supabaseUrl = supabaseUrl;
    this.supabaseKey = supabaseKey;
  }

  private getClient() {
    return createClient(this.supabaseUrl, this.supabaseKey);
  }

  // ===========================================================================
  // Source Management
  // ===========================================================================

  registerSource(source: KeywordDiscoverySource): void {
    this.sources.set(source.name, source);
  }

  unregisterSource(name: string): void {
    this.sources.delete(name);
  }

  getRegisteredSources(): string[] {
    return Array.from(this.sources.keys());
  }

  // ===========================================================================
  // Discovery
  // ===========================================================================

  /**
   * Discover keywords from all registered sources.
   */
  async discoverKeywords(options?: DiscoveryOptions): Promise<KeywordDiscoveryResult> {
    const result: KeywordDiscoveryResult = {
      discovered: 0,
      added: 0,
      duplicates: 0,
      errors: [],
    };

    const allKeywords: KeywordWithIntent[] = [];

    // Discover from all sources
    for (const [name, source] of this.sources) {
      try {
        const discovered = await source.discover({
          languages: options?.languages ?? [...keywordConfig.languages],
          categories: options?.categories ?? [...keywordConfig.categories],
          limit: options?.limit,
        });

        result.discovered += discovered.length;

        // Classify intent for each keyword
        for (const kw of discovered) {
          allKeywords.push({
            ...kw,
            intent: classifyIntent(kw.keyword),
          });
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        result.errors.push(`Source ${name}: ${message}`);
      }
    }

    // Store keywords (with deduplication)
    const stored = await this.storeKeywords(allKeywords);
    result.added = stored.added;
    result.duplicates = stored.duplicates;

    return result;
  }

  /**
   * Discover keywords from a specific source.
   */
  async discoverFromSource(
    sourceName: string,
    options?: DiscoveryOptions
  ): Promise<KeywordDiscoveryResult> {
    const source = this.sources.get(sourceName);
    if (!source) {
      return {
        discovered: 0,
        added: 0,
        duplicates: 0,
        errors: [`Source not found: ${sourceName}`],
      };
    }

    try {
      const discovered = await source.discover({
        languages: options?.languages ?? [...keywordConfig.languages],
        categories: options?.categories ?? [...keywordConfig.categories],
        limit: options?.limit,
      });

      const keywordsWithIntent = discovered.map((kw) => ({
        ...kw,
        intent: classifyIntent(kw.keyword),
      }));

      const stored = await this.storeKeywords(keywordsWithIntent);

      return {
        discovered: discovered.length,
        added: stored.added,
        duplicates: stored.duplicates,
        errors: [],
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      return {
        discovered: 0,
        added: 0,
        duplicates: 0,
        errors: [message],
      };
    }
  }

  // ===========================================================================
  // Storage
  // ===========================================================================

  /**
   * Store keywords in database with deduplication.
   */
  private async storeKeywords(
    keywords: KeywordWithIntent[]
  ): Promise<{ added: number; duplicates: number }> {
    const client = this.getClient();
    let added = 0;
    let duplicates = 0;

    for (const kw of keywords) {
      // Check for existing keyword
      const { data: existing } = await client
        .from('seo_keywords')
        .select('id')
        .eq('keyword', kw.keyword)
        .eq('language', kw.language)
        .single();

      if (existing) {
        duplicates++;
        continue;
      }

      // Insert new keyword
      const { error } = await client.from('seo_keywords').insert({
        keyword: kw.keyword,
        language: kw.language,
        intent: kw.intent,
        volume: kw.volume ?? 0,
        difficulty: kw.difficulty ?? 0,
        source: 'discovery',
        source_data: kw.sourceData ?? null,
        status: 'new',
      });

      if (!error) {
        added++;
      }
    }

    return { added, duplicates };
  }

  // ===========================================================================
  // Keyword Queue Management
  // ===========================================================================

  /**
   * Get keywords by status.
   */
  async getKeywordsByStatus(
    status: KeywordStatus,
    options?: { language?: Language; limit?: number; offset?: number }
  ): Promise<KeywordRecord[]> {
    const client = this.getClient();

    let query = client
      .from('seo_keywords')
      .select('*')
      .eq('status', status)
      .order('discovered_at', { ascending: false });

    if (options?.language) {
      query = query.eq('language', options.language);
    }
    if (options?.limit) {
      query = query.limit(options.limit);
    }
    if (options?.offset) {
      query = query.range(options.offset, options.offset + (options.limit ?? 10) - 1);
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(`Failed to get keywords: ${error.message}`);
    }

    return data as KeywordRecord[];
  }

  /**
   * Get the keyword queue (new + approved keywords ready for content).
   */
  async getKeywordQueue(options?: {
    language?: Language;
    limit?: number;
  }): Promise<KeywordRecord[]> {
    const client = this.getClient();

    let query = client
      .from('seo_keywords')
      .select('*')
      .in('status', ['new', 'approved'])
      .order('volume', { ascending: false })
      .order('discovered_at', { ascending: false });

    if (options?.language) {
      query = query.eq('language', options.language);
    }
    if (options?.limit) {
      query = query.limit(options.limit);
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(`Failed to get keyword queue: ${error.message}`);
    }

    return data as KeywordRecord[];
  }

  /**
   * Update keyword status.
   */
  async updateKeywordStatus(
    keywordId: string,
    status: KeywordStatus
  ): Promise<void> {
    const client = this.getClient();

    const updates: Record<string, unknown> = {
      status,
      updated_at: new Date().toISOString(),
    };

    if (status === 'used') {
      updates.last_used = new Date().toISOString();
    }

    const { error } = await client
      .from('seo_keywords')
      .update(updates)
      .eq('id', keywordId);

    if (error) {
      throw new Error(`Failed to update keyword status: ${error.message}`);
    }
  }

  /**
   * Approve a keyword for content generation.
   */
  async approveKeyword(keywordId: string): Promise<void> {
    await this.updateKeywordStatus(keywordId, 'approved');
  }

  /**
   * Reject a keyword.
   */
  async rejectKeyword(keywordId: string): Promise<void> {
    await this.updateKeywordStatus(keywordId, 'rejected');
  }

  /**
   * Mark keyword as used (content generated).
   */
  async markKeywordAsUsed(keywordId: string): Promise<void> {
    await this.updateKeywordStatus(keywordId, 'used');
  }

  /**
   * Get a keyword by ID.
   */
  async getKeyword(keywordId: string): Promise<KeywordRecord | null> {
    const client = this.getClient();

    const { data, error } = await client
      .from('seo_keywords')
      .select('*')
      .eq('id', keywordId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      throw new Error(`Failed to get keyword: ${error.message}`);
    }

    return data as KeywordRecord;
  }

  /**
   * Check if a keyword already exists.
   */
  async keywordExists(keyword: string, language: Language): Promise<boolean> {
    const client = this.getClient();

    const { data } = await client
      .from('seo_keywords')
      .select('id')
      .eq('keyword', keyword)
      .eq('language', language)
      .single();

    return data !== null;
  }

  /**
   * Add a manual keyword.
   */
  async addManualKeyword(
    keyword: string,
    language: Language,
    options?: {
      intent?: KeywordIntent;
      volume?: number;
      difficulty?: number;
    }
  ): Promise<KeywordRecord> {
    const client = this.getClient();

    const intent = options?.intent ?? classifyIntent(keyword);

    const { data, error } = await client
      .from('seo_keywords')
      .insert({
        keyword,
        language,
        intent,
        volume: options?.volume ?? 0,
        difficulty: options?.difficulty ?? 0,
        source: 'manual',
        status: 'new',
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to add keyword: ${error.message}`);
    }

    return data as KeywordRecord;
  }

  /**
   * Expire old keywords that haven't been used.
   */
  async expireOldKeywords(monthsOld: number = 24): Promise<number> {
    const client = this.getClient();
    const cutoffDate = new Date();
    cutoffDate.setMonth(cutoffDate.getMonth() - monthsOld);

    const { data, error } = await client
      .from('seo_keywords')
      .update({ status: 'expired', updated_at: new Date().toISOString() })
      .in('status', ['new', 'approved'])
      .lt('discovered_at', cutoffDate.toISOString())
      .select('id');

    if (error) {
      throw new Error(`Failed to expire keywords: ${error.message}`);
    }

    return data?.length ?? 0;
  }

  // ===========================================================================
  // Statistics
  // ===========================================================================

  /**
   * Get keyword statistics.
   */
  async getStatistics(): Promise<{
    total: number;
    byStatus: Record<KeywordStatus, number>;
    byLanguage: Record<Language, number>;
    byIntent: Record<KeywordIntent, number>;
  }> {
    const client = this.getClient();

    const { data, error } = await client.from('seo_keywords').select('status, language, intent');

    if (error) {
      throw new Error(`Failed to get statistics: ${error.message}`);
    }

    const stats = {
      total: data.length,
      byStatus: { new: 0, approved: 0, in_progress: 0, used: 0, rejected: 0, expired: 0 } as Record<KeywordStatus, number>,
      byLanguage: { nl: 0, en: 0 } as Record<Language, number>,
      byIntent: { informational: 0, transactional: 0, local: 0 } as Record<KeywordIntent, number>,
    };

    for (const row of data) {
      stats.byStatus[row.status as KeywordStatus]++;
      stats.byLanguage[row.language as Language]++;
      stats.byIntent[row.intent as KeywordIntent]++;
    }

    return stats;
  }
}

// =============================================================================
// Manual Keyword Source (for testing and manual additions)
// =============================================================================

export class ManualKeywordSource implements KeywordDiscoverySource {
  name = 'manual';
  private keywords: DiscoveredKeyword[] = [];

  addKeyword(keyword: DiscoveredKeyword): void {
    this.keywords.push(keyword);
  }

  addKeywords(keywords: DiscoveredKeyword[]): void {
    this.keywords.push(...keywords);
  }

  clear(): void {
    this.keywords = [];
  }

  async discover(options: DiscoveryOptions): Promise<DiscoveredKeyword[]> {
    let filtered = [...this.keywords];

    if (options.languages && options.languages.length > 0) {
      filtered = filtered.filter((kw) => options.languages!.includes(kw.language));
    }

    if (options.limit) {
      filtered = filtered.slice(0, options.limit);
    }

    return filtered;
  }
}

// =============================================================================
// Google Trends Source (placeholder - requires implementation)
// =============================================================================

export class GoogleTrendsSource implements KeywordDiscoverySource {
  name = 'google_trends';

  async discover(options: DiscoveryOptions): Promise<DiscoveredKeyword[]> {
    // This is a placeholder implementation.
    // In production, this would:
    // 1. Use the Google Trends API or pytrends library via a Python service
    // 2. Query for trending topics in the specified categories
    // 3. Filter by region (NL for Dutch, NL+GB for English)

    const categories = options.categories ?? keywordConfig.categories;
    const languages = options.languages ?? ['nl'];

    // Generate placeholder keywords from categories
    const keywords: DiscoveredKeyword[] = [];

    for (const category of categories) {
      for (const language of languages) {
        keywords.push({
          keyword: category,
          language,
          volume: Math.floor(Math.random() * 10000),
          difficulty: Math.floor(Math.random() * 100),
          sourceData: { source: 'google_trends', category },
        });

        // Add variations
        if (language === 'nl') {
          keywords.push({
            keyword: `${category} 2025`,
            language,
            volume: Math.floor(Math.random() * 5000),
            difficulty: Math.floor(Math.random() * 80),
            sourceData: { source: 'google_trends', category, variant: 'year' },
          });
        }
      }
    }

    return options.limit ? keywords.slice(0, options.limit) : keywords;
  }
}

// =============================================================================
// Factory Function
// =============================================================================

/**
 * Create a keyword discovery service with default configuration.
 */
export function createKeywordDiscoveryService(
  supabaseUrl: string,
  supabaseKey: string
): KeywordDiscoveryService {
  const service = new KeywordDiscoveryService(supabaseUrl, supabaseKey);

  // Register default sources
  service.registerSource(new GoogleTrendsSource());

  return service;
}
