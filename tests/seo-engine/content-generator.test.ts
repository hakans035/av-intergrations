/**
 * Content Generator Tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  ContentGeneratorService,
  createContentGenerator,
} from '../../src/integrations/seo-engine/lib/content-generator';

// Mock Supabase client
vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn(() => ({
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          eq: vi.fn(() => ({
            not: vi.fn(() => ({
              single: vi.fn(() => Promise.resolve({ data: null, error: null })),
            })),
          })),
        })),
      })),
    })),
  })),
}));

describe('ContentGeneratorService', () => {
  let service: ContentGeneratorService;

  beforeEach(() => {
    service = createContentGenerator('https://test.supabase.co', 'test-key');
  });

  describe('buildContentPrompt', () => {
    it('should build prompt for Dutch content', () => {
      const prompt = service.buildContentPrompt({
        keyword: 'belastingadvies',
        keywordId: 'test-id',
        language: 'nl',
        contentType: 'mixed',
      });

      expect(prompt.systemPrompt).toContain('Dutch');
      expect(prompt.userPrompt).toContain('belastingadvies');
      expect(prompt.userPrompt).toContain('1000-1500 words');
    });

    it('should build prompt for English content', () => {
      const prompt = service.buildContentPrompt({
        keyword: 'tax advice',
        keywordId: 'test-id',
        language: 'en',
        contentType: 'long',
      });

      expect(prompt.systemPrompt).toContain('English');
      expect(prompt.userPrompt).toContain('tax advice');
      expect(prompt.userPrompt).toContain('1500-2500 words');
    });

    it('should include related keywords in prompt', () => {
      const prompt = service.buildContentPrompt({
        keyword: 'box 3',
        keywordId: 'test-id',
        language: 'nl',
        relatedKeywords: ['vermogensbelasting', 'spaargeld'],
      });

      expect(prompt.userPrompt).toContain('vermogensbelasting');
      expect(prompt.userPrompt).toContain('spaargeld');
    });

    it('should include target audience in prompt', () => {
      const prompt = service.buildContentPrompt({
        keyword: 'zzp belasting',
        keywordId: 'test-id',
        language: 'nl',
        targetAudience: 'ZZP\'ers en freelancers',
      });

      expect(prompt.userPrompt).toContain('ZZP\'ers en freelancers');
    });
  });

  describe('validateHeadingStructure', () => {
    it('should pass valid heading structure', () => {
      const html = `
        <h2>Introduction</h2>
        <p>Content here</p>
        <h2>Main Section</h2>
        <h3>Subsection</h3>
        <p>More content</p>
        <h2>Conclusion</h2>
      `;

      const errors = service.validateHeadingStructure(html);
      expect(errors).toHaveLength(0);
    });

    it('should detect insufficient H2 headings', () => {
      const html = `
        <h2>Only One Heading</h2>
        <p>Content here</p>
      `;

      const errors = service.validateHeadingStructure(html);
      expect(errors.some((e) => e.includes('H2 headings'))).toBe(true);
    });

    it('should detect skipped heading levels', () => {
      const html = `
        <h2>Section</h2>
        <h4>Skipped H3</h4>
      `;

      const errors = service.validateHeadingStructure(html);
      expect(errors.some((e) => e.includes('Skipped heading level'))).toBe(true);
    });

    it('should detect empty headings', () => {
      const html = `
        <h2></h2>
        <h2>Valid Heading</h2>
      `;

      const errors = service.validateHeadingStructure(html);
      expect(errors.some((e) => e.includes('Empty'))).toBe(true);
    });
  });

  describe('calculateReadability', () => {
    it('should calculate readability metrics', () => {
      const html = `
        <p>Dit is een korte zin. En nog een zin hier. De tekst is eenvoudig te lezen.</p>
        <p>Hier volgt een tweede alinea met meer informatie over het onderwerp.</p>
      `;

      const score = service.calculateReadability(html);

      expect(score).toHaveProperty('fleschDouma');
      expect(score).toHaveProperty('avgSentenceLength');
      expect(score).toHaveProperty('avgParagraphLength');
      expect(score).toHaveProperty('passiveVoicePercent');
      expect(typeof score.fleschDouma).toBe('number');
    });
  });

  describe('validateContent', () => {
    it('should validate complete content', () => {
      const content = {
        title: 'Belastingadvies voor ZZP\'ers',
        slug: 'belastingadvies-zzp',
        body: `
          <p>Belastingadvies is essentieel voor iedere ondernemer. In dit artikel bespreken we de belangrijkste punten.</p>
          <h2>Wat is belastingadvies?</h2>
          <p>Belastingadvies helpt u om uw fiscale positie te optimaliseren.</p>
          <h2>Waarom is het belangrijk?</h2>
          <p>Een goede adviseur kan u veel geld besparen.</p>
          <h2>Conclusie</h2>
          <p>Neem contact op voor meer informatie.</p>
        `,
        summary: 'Belastingadvies is essentieel voor ondernemers.',
        metaTitle: 'Belastingadvies voor ZZP\'ers | Ambition Valley',
        metaDescription: 'Belastingadvies is essentieel voor iedere ondernemer.',
        schemaType: 'article' as const,
        faqs: [],
        wordCount: 50,
        internalLinks: [
          { url: '/diensten', anchorText: 'onze diensten', isExternal: false },
          { url: '/contact', anchorText: 'contact', isExternal: false },
        ],
        externalLinks: [],
      };

      const result = service.validateContent(content, 'belastingadvies');

      expect(result).toHaveProperty('valid');
      expect(result).toHaveProperty('errors');
      expect(result).toHaveProperty('warnings');
    });

    it('should detect keyword not in first paragraph', () => {
      const content = {
        title: 'Test Article',
        slug: 'test-article',
        body: `
          <p>Dit artikel gaat over een ander onderwerp zonder het trefwoord.</p>
          <h2>Section</h2>
          <h2>Another Section</h2>
        `,
        summary: 'Test summary',
        metaTitle: 'Test | Ambition Valley',
        metaDescription: 'Test description',
        schemaType: 'article' as const,
        faqs: [],
        wordCount: 100,
        internalLinks: [],
        externalLinks: [],
      };

      const result = service.validateContent(content, 'belastingadvies');

      expect(result.errors.some((e) => e.includes('keyword not found'))).toBe(true);
    });
  });

  describe('processLinks', () => {
    it('should process internal link placeholders', async () => {
      const html = `
        <p>Lees meer over [INTERNAL_LINK:belastingaangifte:belastingaangifte].</p>
      `;

      const result = await service.processLinks(html, 'nl');

      expect(result.body).not.toContain('[INTERNAL_LINK');
    });

    it('should process external link placeholders for approved domains', async () => {
      const html = `
        <p>Meer informatie op [EXTERNAL_LINK:de Belastingdienst:belastingdienst.nl].</p>
      `;

      const result = await service.processLinks(html, 'nl');

      expect(result.body).toContain('target="_blank"');
      expect(result.body).toContain('rel="noopener noreferrer"');
      expect(result.externalLinks).toHaveLength(1);
    });

    it('should remove external links for unapproved domains', async () => {
      const html = `
        <p>Check [EXTERNAL_LINK:this site:random-site.com].</p>
      `;

      const result = await service.processLinks(html, 'nl');

      expect(result.body).not.toContain('href');
      expect(result.externalLinks).toHaveLength(0);
    });
  });

  describe('checkDuplicateKeyword', () => {
    it('should check for existing content', async () => {
      const result = await service.checkDuplicateKeyword('test keyword', 'nl');

      expect(result).toHaveProperty('exists');
      expect(result.exists).toBe(false);
    });
  });

  describe('calculateContentHash', () => {
    it('should generate consistent hash for same content', () => {
      const content = '<p>This is test content.</p>';

      const hash1 = service.calculateContentHash(content);
      const hash2 = service.calculateContentHash(content);

      expect(hash1).toBe(hash2);
    });

    it('should generate different hash for different content', () => {
      const content1 = '<p>This is test content.</p>';
      const content2 = '<p>This is different content.</p>';

      const hash1 = service.calculateContentHash(content1);
      const hash2 = service.calculateContentHash(content2);

      expect(hash1).not.toBe(hash2);
    });

    it('should normalize whitespace and HTML', () => {
      const content1 = '<p>This is   test</p>';
      const content2 = '<p>This is test</p>';

      const hash1 = service.calculateContentHash(content1);
      const hash2 = service.calculateContentHash(content2);

      expect(hash1).toBe(hash2);
    });
  });
});

describe('createContentGenerator', () => {
  it('should create service instance', () => {
    const service = createContentGenerator('https://test.supabase.co', 'test-key');
    expect(service).toBeInstanceOf(ContentGeneratorService);
  });
});
