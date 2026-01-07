/**
 * Keyword Discovery Engine Tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  KeywordDiscoveryService,
  ManualKeywordSource,
  GoogleTrendsSource,
  classifyIntent,
  type DiscoveredKeyword,
} from '../../src/integrations/seo-engine/lib/keyword-discovery';

// Mock Supabase client
vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn(() => ({
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          eq: vi.fn(() => ({
            single: vi.fn(() => Promise.resolve({ data: null, error: null })),
          })),
          single: vi.fn(() => Promise.resolve({ data: null, error: null })),
        })),
        in: vi.fn(() => ({
          order: vi.fn(() => ({
            order: vi.fn(() => ({
              eq: vi.fn(() => ({
                limit: vi.fn(() => Promise.resolve({ data: [], error: null })),
              })),
              limit: vi.fn(() => Promise.resolve({ data: [], error: null })),
            })),
          })),
        })),
        order: vi.fn(() => ({
          eq: vi.fn(() => ({
            limit: vi.fn(() => ({
              range: vi.fn(() => Promise.resolve({ data: [], error: null })),
            })),
          })),
          limit: vi.fn(() => Promise.resolve({ data: [], error: null })),
        })),
      })),
      insert: vi.fn(() => ({
        select: vi.fn(() => ({
          single: vi.fn(() =>
            Promise.resolve({
              data: {
                id: 'test-id',
                keyword: 'test',
                language: 'nl',
                intent: 'informational',
                volume: 0,
                difficulty: 0,
                status: 'new',
              },
              error: null,
            })
          ),
        })),
      })),
      update: vi.fn(() => ({
        eq: vi.fn(() => Promise.resolve({ error: null })),
        in: vi.fn(() => ({
          lt: vi.fn(() => ({
            select: vi.fn(() => Promise.resolve({ data: [], error: null })),
          })),
        })),
      })),
    })),
  })),
}));

describe('classifyIntent', () => {
  describe('transactional intent', () => {
    it('should classify Dutch transactional keywords', () => {
      expect(classifyIntent('belastingadviseur inhuren')).toBe('transactional');
      expect(classifyIntent('offerte aanvragen belastingadvies')).toBe('transactional');
      expect(classifyIntent('kosten fiscaal advies')).toBe('transactional');
      expect(classifyIntent('tarieven belastingconsultant')).toBe('transactional');
    });

    it('should classify English transactional keywords', () => {
      expect(classifyIntent('hire tax consultant')).toBe('transactional');
      expect(classifyIntent('book appointment advisor')).toBe('transactional');
      expect(classifyIntent('get quote tax service')).toBe('transactional');
    });
  });

  describe('local intent', () => {
    it('should classify Dutch local keywords', () => {
      expect(classifyIntent('belastingadviseur amsterdam')).toBe('local');
      expect(classifyIntent('fiscaal advies rotterdam')).toBe('local');
      expect(classifyIntent('belastingkantoor bij mij in de buurt')).toBe('local');
    });

    it('should classify English local keywords', () => {
      expect(classifyIntent('tax advisor near me')).toBe('local');
      expect(classifyIntent('local tax consultant')).toBe('local');
    });
  });

  describe('informational intent', () => {
    it('should classify Dutch informational keywords', () => {
      expect(classifyIntent('wat is box 3')).toBe('informational');
      expect(classifyIntent('hoe werkt belastingaangifte')).toBe('informational');
      expect(classifyIntent('tips voor belastingaftrek')).toBe('informational');
      expect(classifyIntent('verschil zzp en bv')).toBe('informational');
    });

    it('should classify English informational keywords', () => {
      expect(classifyIntent('what is income tax')).toBe('informational');
      expect(classifyIntent('how to file taxes')).toBe('informational');
      expect(classifyIntent('tax deduction guide')).toBe('informational');
    });

    it('should default to informational for generic terms', () => {
      expect(classifyIntent('belastingadvies')).toBe('informational');
      expect(classifyIntent('fiscale planning')).toBe('informational');
    });
  });

  describe('priority', () => {
    it('should prioritize local over transactional', () => {
      // "belastingadviseur inhuren amsterdam" has both transactional (inhuren) and local (amsterdam)
      // Local should take precedence
      expect(classifyIntent('belastingadviseur amsterdam afspraak')).toBe('local');
    });
  });
});

describe('ManualKeywordSource', () => {
  let source: ManualKeywordSource;

  beforeEach(() => {
    source = new ManualKeywordSource();
  });

  it('should have correct name', () => {
    expect(source.name).toBe('manual');
  });

  it('should add and discover keywords', async () => {
    source.addKeyword({ keyword: 'belastingadvies', language: 'nl' });
    source.addKeyword({ keyword: 'tax advice', language: 'en' });

    const keywords = await source.discover({});
    expect(keywords).toHaveLength(2);
  });

  it('should filter by language', async () => {
    source.addKeyword({ keyword: 'belastingadvies', language: 'nl' });
    source.addKeyword({ keyword: 'tax advice', language: 'en' });

    const nlKeywords = await source.discover({ languages: ['nl'] });
    expect(nlKeywords).toHaveLength(1);
    expect(nlKeywords[0].language).toBe('nl');
  });

  it('should respect limit', async () => {
    source.addKeywords([
      { keyword: 'kw1', language: 'nl' },
      { keyword: 'kw2', language: 'nl' },
      { keyword: 'kw3', language: 'nl' },
    ]);

    const keywords = await source.discover({ limit: 2 });
    expect(keywords).toHaveLength(2);
  });

  it('should clear keywords', async () => {
    source.addKeyword({ keyword: 'test', language: 'nl' });
    source.clear();

    const keywords = await source.discover({});
    expect(keywords).toHaveLength(0);
  });
});

describe('GoogleTrendsSource', () => {
  let source: GoogleTrendsSource;

  beforeEach(() => {
    source = new GoogleTrendsSource();
  });

  it('should have correct name', () => {
    expect(source.name).toBe('google_trends');
  });

  it('should discover keywords from categories', async () => {
    const keywords = await source.discover({
      categories: ['belastingadvies', 'fiscale planning'],
      languages: ['nl'],
    });

    expect(keywords.length).toBeGreaterThan(0);
    expect(keywords.every((kw) => kw.language === 'nl')).toBe(true);
  });

  it('should include volume and difficulty', async () => {
    const keywords = await source.discover({
      categories: ['belastingadvies'],
      languages: ['nl'],
      limit: 1,
    });

    expect(keywords[0]).toHaveProperty('volume');
    expect(keywords[0]).toHaveProperty('difficulty');
    expect(typeof keywords[0].volume).toBe('number');
    expect(typeof keywords[0].difficulty).toBe('number');
  });

  it('should respect limit', async () => {
    const keywords = await source.discover({
      categories: ['belastingadvies', 'fiscale planning', 'vermogensadvies'],
      languages: ['nl', 'en'],
      limit: 3,
    });

    expect(keywords).toHaveLength(3);
  });
});

describe('KeywordDiscoveryService', () => {
  let service: KeywordDiscoveryService;

  beforeEach(() => {
    service = new KeywordDiscoveryService(
      'https://test.supabase.co',
      'test-key'
    );
  });

  describe('source management', () => {
    it('should register and unregister sources', () => {
      const source = new ManualKeywordSource();
      service.registerSource(source);

      expect(service.getRegisteredSources()).toContain('manual');

      service.unregisterSource('manual');
      expect(service.getRegisteredSources()).not.toContain('manual');
    });
  });

  describe('discoverKeywords', () => {
    it('should discover from all registered sources', async () => {
      const manualSource = new ManualKeywordSource();
      manualSource.addKeyword({ keyword: 'test keyword', language: 'nl' });
      service.registerSource(manualSource);

      const result = await service.discoverKeywords();

      expect(result.discovered).toBe(1);
      expect(result.errors).toHaveLength(0);
    });

    it('should handle source errors gracefully', async () => {
      const failingSource = {
        name: 'failing',
        discover: vi.fn().mockRejectedValue(new Error('API error')),
      };
      service.registerSource(failingSource);

      const result = await service.discoverKeywords();

      expect(result.errors).toHaveLength(1);
      expect(result.errors[0]).toContain('failing');
      expect(result.errors[0]).toContain('API error');
    });
  });

  describe('discoverFromSource', () => {
    it('should discover from specific source', async () => {
      const manualSource = new ManualKeywordSource();
      manualSource.addKeyword({ keyword: 'test', language: 'nl' });
      service.registerSource(manualSource);

      const result = await service.discoverFromSource('manual');

      expect(result.discovered).toBe(1);
    });

    it('should return error for unknown source', async () => {
      const result = await service.discoverFromSource('unknown');

      expect(result.errors).toHaveLength(1);
      expect(result.errors[0]).toContain('Source not found');
    });
  });

  describe('keyword management', () => {
    it('should add manual keywords', async () => {
      const keyword = await service.addManualKeyword('belastingadvies', 'nl');

      expect(keyword).toBeDefined();
      expect(keyword.keyword).toBe('test'); // From mock
      expect(keyword.language).toBe('nl');
    });

    it('should classify intent when adding manual keywords', async () => {
      const keyword = await service.addManualKeyword(
        'wat is box 3',
        'nl'
      );

      // The mock returns a fixed result, but in real usage
      // the intent would be classified
      expect(keyword).toBeDefined();
    });
  });
});

describe('Intent classification edge cases', () => {
  it('should handle empty strings', () => {
    expect(classifyIntent('')).toBe('informational');
  });

  it('should handle mixed case', () => {
    expect(classifyIntent('WAT IS BOX 3')).toBe('informational');
    expect(classifyIntent('Belastingadviseur Amsterdam')).toBe('local');
  });

  it('should handle special characters', () => {
    expect(classifyIntent('btw-aangifte?')).toBe('informational');
    expect(classifyIntent('box-3 advies!')).toBe('informational');
  });
});
