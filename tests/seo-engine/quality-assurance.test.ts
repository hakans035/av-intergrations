/**
 * Quality Assurance Tests
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  QualityAssuranceService,
  createQualityAssurance,
  type ContentForQA,
} from '../../src/integrations/seo-engine/lib/quality-assurance';
import { POST_DISCLAIMER } from '../../src/integrations/seo-engine/constants';

describe('QualityAssuranceService', () => {
  let qa: QualityAssuranceService;

  beforeEach(() => {
    qa = createQualityAssurance();
  });

  describe('runChecks', () => {
    it('should pass valid content', async () => {
      const content: ContentForQA = {
        title: 'Belastingadvies voor Ondernemers | AmbitionValley',
        description: 'Ontdek hoe belastingadvies u kan helpen met fiscale optimalisatie voor uw onderneming.',
        slug: 'belastingadvies-ondernemers',
        keyword: 'belastingadvies',
        content: `
          <h1>Belastingadvies voor Ondernemers</h1>
          <p>Belastingadvies is essentieel voor elke ondernemer, volgens de huidige regelgeving.</p>
          <h2>Waarom Belastingadvies?</h2>
          <p>Professioneel belastingadvies helpt u om alle mogelijke aftrekposten te benutten.</p>
          <a href="/diensten/fiscale-planning">Lees meer over fiscale planning</a>
          <h2>Belangrijke Aftrekposten</h2>
          <p>Er zijn vele aftrekposten beschikbaar voor ondernemers.</p>
          <a href="/contact">Neem contact op</a>
          <a href="https://belastingdienst.nl/ondernemers">Belastingdienst informatie</a>
          <p><em>${POST_DISCLAIMER.nl}</em></p>
        `,
        mainImage: { url: 'https://example.com/image.jpg', alt: 'Belastingadvies illustratie' },
        schemaMarkup: JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'Article',
          headline: 'Belastingadvies voor Ondernemers',
        }),
        status: 'approved',
        complianceApproved: true,
        allGatesPassed: true,
      };

      const result = await qa.runChecks(content, { language: 'nl' });

      expect(result.canSubmit).toBe(true);
      expect(result.blockingErrors).toHaveLength(0);
    });

    it('should fail content with blocking errors', async () => {
      const content: ContentForQA = {
        title: '',
        description: '',
        slug: '',
        keyword: 'test',
        content: '<p>Short content</p>',
      };

      const result = await qa.runChecks(content, { language: 'nl' });

      expect(result.canSubmit).toBe(false);
      expect(result.blockingErrors.length).toBeGreaterThan(0);
    });

    it('should include SEO check results', async () => {
      const content: ContentForQA = {
        title: 'Test Title | AmbitionValley',
        description: 'Test description for the article about testing.',
        slug: 'test-article',
        keyword: 'test',
        content: `
          <h1>Test Article</h1>
          <p>Test content about testing.</p>
          <h2>Section 1</h2>
          <p>More content.</p>
          <h2>Section 2</h2>
          <p>Even more content.</p>
          <a href="/link1">Link 1</a>
          <a href="/link2">Link 2</a>
          <p><em>${POST_DISCLAIMER.nl}</em></p>
        `,
        mainImage: { url: 'https://example.com/image.jpg', alt: 'Test image' },
        schemaMarkup: JSON.stringify({ '@context': 'https://schema.org', '@type': 'Article' }),
      };

      const result = await qa.runChecks(content, { language: 'nl' });

      expect(result.checkResults.seo).toBeDefined();
      expect(result.checkResults.seo.details).toBeDefined();
    });

    it('should include compliance check results', async () => {
      const content: ContentForQA = {
        title: 'Test | AmbitionValley',
        description: 'Test description.',
        slug: 'test',
        keyword: 'test',
        content: `<h1>Test</h1><h2>A</h2><h2>B</h2><a href="/a">a</a><a href="/b">b</a><p><em>${POST_DISCLAIMER.nl}</em></p>`,
        mainImage: { url: 'x', alt: 'x' },
        schemaMarkup: '{"@context":"https://schema.org","@type":"Article"}',
      };

      const result = await qa.runChecks(content, { language: 'nl' });

      expect(result.checkResults.compliance).toBeDefined();
      expect(result.checkResults.compliance.passed).toBeDefined();
    });
  });

  describe('checkPreApproval', () => {
    it('should pass valid pre-approval content', () => {
      const content: ContentForQA = {
        title: 'Belastingadvies Tips | AmbitionValley',
        description: 'Ontdek de beste belastingadvies tips voor ondernemers in Nederland.',
        slug: 'belastingadvies-tips',
        keyword: 'belastingadvies',
        content: `
          <h1>Belastingadvies Tips</h1>
          <p>Belastingadvies helpt ondernemers, volgens de huidige regelgeving.</p>
          <h2>Tip 1</h2>
          <p>Eerste tip content.</p>
          <h2>Tip 2</h2>
          <p>Tweede tip content.</p>
          <a href="/diensten">Onze diensten</a>
          <a href="/contact">Contact</a>
          <p><em>${POST_DISCLAIMER.nl}</em></p>
        `,
        mainImage: { url: 'https://example.com/img.jpg', alt: 'Belastingadvies tips afbeelding' },
        schemaMarkup: JSON.stringify({ '@context': 'https://schema.org', '@type': 'Article' }),
      };

      const result = qa.checkPreApproval(content, { language: 'nl' });

      expect(result.canSubmit).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should fail with missing title', () => {
      const content: ContentForQA = {
        title: '',
        description: 'Valid description here.',
        slug: 'test-slug',
        keyword: 'test',
        content: '<h1>Test</h1><h2>A</h2><h2>B</h2><a href="/a">a</a><a href="/b">b</a>',
        schemaMarkup: '{"@context":"https://schema.org","@type":"Article"}',
      };

      const result = qa.checkPreApproval(content, { language: 'nl' });

      expect(result.canSubmit).toBe(false);
      expect(result.errors.some((e) => e.includes('Title') || e.includes('required'))).toBe(true);
    });

    it('should fail with invalid language', () => {
      const content: ContentForQA = {
        title: 'Test | AmbitionValley',
        description: 'Test description.',
        slug: 'test',
        keyword: 'test',
        content: '<h1>Test</h1><h2>A</h2><h2>B</h2><a href="/a">a</a><a href="/b">b</a>',
        schemaMarkup: '{"@context":"https://schema.org","@type":"Article"}',
      };

      const result = qa.checkPreApproval(content, { language: 'fr' as 'nl' });

      expect(result.canSubmit).toBe(false);
      expect(result.errors.some((e) => e.includes('language'))).toBe(true);
    });
  });

  describe('checkLanguageCorrectness', () => {
    it('should pass clean Dutch text', () => {
      const content = 'Dit is een correcte Nederlandse tekst zonder fouten.';
      const result = qa.checkLanguageCorrectness(content, 'nl');

      expect(result.passed).toBe(true);
      expect(result.spellingErrors).toHaveLength(0);
      expect(result.grammarIssues).toHaveLength(0);
    });

    it('should pass clean English text', () => {
      const content = 'This is a correct English text without errors.';
      const result = qa.checkLanguageCorrectness(content, 'en');

      expect(result.passed).toBe(true);
      expect(result.spellingErrors).toHaveLength(0);
      expect(result.grammarIssues).toHaveLength(0);
    });

    it('should detect Dutch double words', () => {
      const content = 'Dit is de de tekst met een fout.';
      const result = qa.checkLanguageCorrectness(content, 'nl');

      expect(result.passed).toBe(false);
      expect(result.spellingErrors.length).toBeGreaterThan(0);
    });

    it('should detect English double words', () => {
      const content = 'This is the the text with an error.';
      const result = qa.checkLanguageCorrectness(content, 'en');

      expect(result.passed).toBe(false);
      expect(result.spellingErrors.length).toBeGreaterThan(0);
    });

    it('should detect English grammar issues', () => {
      const content = 'You should of done this earlier.';
      const result = qa.checkLanguageCorrectness(content, 'en');

      expect(result.passed).toBe(false);
      expect(result.grammarIssues.some((i) => i.includes('should have'))).toBe(true);
    });

    it('should warn about long sentences', () => {
      const longSentence = 'This ' + 'is a very '.repeat(10) + 'long sentence that exceeds the maximum.';
      const result = qa.checkLanguageCorrectness(longSentence, 'en');

      expect(result.warnings.some((w) => w.includes('sentence'))).toBe(true);
    });

    it('should warn about repeated consecutive words', () => {
      const content = 'This is is a test.';
      const result = qa.checkLanguageCorrectness(content, 'en');

      expect(result.warnings.some((w) => w.includes('Repeated'))).toBe(true);
    });
  });

  describe('validateLinks', () => {
    beforeEach(() => {
      // Mock fetch for link validation
      vi.stubGlobal('fetch', vi.fn());
    });

    it('should pass with no links', async () => {
      const content = '<p>Content without links.</p>';
      const result = await qa.validateLinks(content);

      expect(result.passed).toBe(true);
      expect(result.brokenLinks).toHaveLength(0);
      expect(result.checkedLinks).toBe(0);
    });

    it('should pass relative links without checking', async () => {
      const content = '<a href="/internal-page">Internal Link</a>';
      const result = await qa.validateLinks(content);

      expect(result.passed).toBe(true);
      expect(result.checkedLinks).toBe(1);
    });

    it('should detect broken external links', async () => {
      vi.mocked(fetch).mockRejectedValue(new Error('Network error'));

      const content = '<a href="https://broken-link.example.com">Broken</a>';
      const result = await qa.validateLinks(content);

      expect(result.passed).toBe(false);
      expect(result.brokenLinks).toContain('https://broken-link.example.com');
    });

    it('should pass working external links', async () => {
      vi.mocked(fetch).mockResolvedValue({ ok: true } as Response);

      const content = '<a href="https://working-link.example.com">Working</a>';
      const result = await qa.validateLinks(content);

      expect(result.passed).toBe(true);
      expect(result.brokenLinks).toHaveLength(0);
    });

    it('should skip mailto and anchor links', async () => {
      const content = `
        <a href="mailto:test@example.com">Email</a>
        <a href="#section">Anchor</a>
      `;
      const result = await qa.validateLinks(content);

      expect(result.checkedLinks).toBe(0);
    });
  });

  describe('checkPlagiarism', () => {
    it('should pass unique content', () => {
      const content = 'This is completely unique content that has never been written before.';
      const existingHashes = [
        qa.generateContentHash('Some completely different content about other topics.'),
      ];

      const result = qa.checkPlagiarism(content, existingHashes);

      expect(result.passed).toBe(true);
      expect(result.similarity).toBeLessThan(0.15);
    });

    it('should detect similar content', () => {
      const originalContent = 'Belastingadvies is belangrijk voor ondernemers. Dit helpt met fiscale optimalisatie.';
      const similarContent = 'Belastingadvies is belangrijk voor ondernemers. Dit helpt met fiscale planning.';
      const existingHashes = [qa.generateContentHash(originalContent)];

      const result = qa.checkPlagiarism(similarContent, existingHashes);

      expect(result.similarity).toBeGreaterThan(0);
    });

    it('should detect exact duplicate', () => {
      const content = 'Dit is exact dezelfde tekst die al eerder is gebruikt in een ander artikel.';
      const existingHashes = [qa.generateContentHash(content)];

      const result = qa.checkPlagiarism(content, existingHashes);

      expect(result.passed).toBe(false);
      expect(result.similarity).toBeGreaterThanOrEqual(0.15);
    });

    it('should pass with no existing content', () => {
      const content = 'Brand new content.';
      const result = qa.checkPlagiarism(content, []);

      expect(result.passed).toBe(true);
      expect(result.similarity).toBe(0);
    });
  });

  describe('generateContentHash', () => {
    it('should generate consistent hash', () => {
      const content = 'This is a test content for hashing.';
      const hash1 = qa.generateContentHash(content);
      const hash2 = qa.generateContentHash(content);

      expect(hash1).toBe(hash2);
    });

    it('should normalize whitespace', () => {
      const content1 = 'This   is    a   test.';
      const content2 = 'This is a test.';

      const hash1 = qa.generateContentHash(content1);
      const hash2 = qa.generateContentHash(content2);

      expect(hash1).toBe(hash2);
    });

    it('should be case-insensitive', () => {
      const content1 = 'This Is A Test.';
      const content2 = 'this is a test.';

      const hash1 = qa.generateContentHash(content1);
      const hash2 = qa.generateContentHash(content2);

      expect(hash1).toBe(hash2);
    });

    it('should ignore punctuation', () => {
      const content1 = 'This is a test!';
      const content2 = 'This is a test';

      const hash1 = qa.generateContentHash(content1);
      const hash2 = qa.generateContentHash(content2);

      expect(hash1).toBe(hash2);
    });
  });

  describe('pre-publish checks', () => {
    it('should require approved status for publishing', async () => {
      const content: ContentForQA = {
        title: 'Test | AmbitionValley',
        description: 'Ontdek test informatie voor ondernemers.',
        slug: 'test',
        keyword: 'test',
        content: `
          <h1>Test</h1>
          <p>Test content here, volgens de huidige regelgeving.</p>
          <h2>Section A</h2>
          <p>More content.</p>
          <h2>Section B</h2>
          <p>Even more.</p>
          <a href="/a">Link A</a>
          <a href="/b">Link B</a>
          <p><em>${POST_DISCLAIMER.nl}</em></p>
        `,
        mainImage: { url: 'x', alt: 'Test image description' },
        schemaMarkup: '{"@context":"https://schema.org","@type":"Article"}',
        status: 'draft', // Not approved
        complianceApproved: false,
      };

      const result = await qa.runChecks(content, { language: 'nl' });

      expect(result.canPublish).toBe(false);
    });

    it('should require compliance approval for publishing', async () => {
      const content: ContentForQA = {
        title: 'Test | AmbitionValley',
        description: 'Ontdek test informatie voor ondernemers.',
        slug: 'test',
        keyword: 'test',
        content: `
          <h1>Test</h1>
          <p>Test content here.</p>
          <h2>Section A</h2>
          <p>More.</p>
          <h2>Section B</h2>
          <p>More.</p>
          <a href="/a">A</a>
          <a href="/b">B</a>
          <p><em>${POST_DISCLAIMER.nl}</em></p>
        `,
        mainImage: { url: 'x', alt: 'Test image' },
        schemaMarkup: '{"@context":"https://schema.org","@type":"Article"}',
        status: 'approved',
        complianceApproved: false, // Not approved
        allGatesPassed: true,
      };

      const result = await qa.runChecks(content, { language: 'nl' });

      expect(result.canPublish).toBe(false);
    });

    it('should allow publishing when all requirements met', async () => {
      vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true }));

      const content: ContentForQA = {
        title: 'Belastingadvies Guide | AmbitionValley',
        description: 'Ontdek belastingadvies tips voor ondernemers in Nederland.',
        slug: 'belastingadvies-guide',
        keyword: 'belastingadvies',
        content: `
          <h1>Belastingadvies Guide</h1>
          <p>Belastingadvies is belangrijk, volgens de huidige regelgeving.</p>
          <h2>Section A</h2>
          <p>Content section A.</p>
          <h2>Section B</h2>
          <p>Content section B.</p>
          <a href="/diensten">Diensten</a>
          <a href="/contact">Contact</a>
          <p><em>${POST_DISCLAIMER.nl}</em></p>
        `,
        mainImage: { url: 'https://example.com/img.jpg', alt: 'Belastingadvies guide illustration' },
        schemaMarkup: JSON.stringify({ '@context': 'https://schema.org', '@type': 'Article' }),
        status: 'approved',
        complianceApproved: true,
        allGatesPassed: true,
      };

      const result = await qa.runChecks(content, {
        language: 'nl',
        validateLinks: true,
        checkPlagiarism: true,
        existingContentHashes: [],
      });

      expect(result.canPublish).toBe(true);
    });
  });

  describe('utility methods', () => {
    it('should return SEO validator instance', () => {
      const seoValidator = qa.getSEOValidator();
      expect(seoValidator).toBeDefined();
    });

    it('should return compliance checker instance', () => {
      const complianceChecker = qa.getComplianceChecker();
      expect(complianceChecker).toBeDefined();
    });
  });
});

describe('createQualityAssurance', () => {
  it('should create QA service instance', () => {
    const qa = createQualityAssurance();
    expect(qa).toBeInstanceOf(QualityAssuranceService);
  });

  it('should accept custom validators', () => {
    const customSEO = createQualityAssurance().getSEOValidator();
    const customCompliance = createQualityAssurance().getComplianceChecker();

    const qa = createQualityAssurance(customSEO, customCompliance);
    expect(qa).toBeInstanceOf(QualityAssuranceService);
  });
});
