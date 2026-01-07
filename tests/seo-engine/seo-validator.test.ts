/**
 * SEO Validator Tests
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  SEOValidatorService,
  createSEOValidator,
  type SEOContent,
} from '../../src/integrations/seo-engine/lib/seo-validator';

describe('SEOValidatorService', () => {
  let validator: SEOValidatorService;

  beforeEach(() => {
    validator = createSEOValidator();
  });

  describe('validate', () => {
    it('should pass valid content', () => {
      const content: SEOContent = {
        title: 'Belastingadvies voor Ondernemers | AmbitionValley',
        description: 'Ontdek hoe belastingadvies u kan helpen met fiscale optimalisatie. Leer over aftrekposten en belastingvoordelen voor ondernemers.',
        slug: 'belastingadvies-ondernemers',
        keyword: 'belastingadvies',
        content: `
          <h1>Belastingadvies voor Ondernemers</h1>
          <p>Belastingadvies is essentieel voor elke ondernemer die zijn fiscale positie wil optimaliseren.</p>
          <h2>Waarom Belastingadvies?</h2>
          <p>Professioneel belastingadvies helpt u om alle mogelijke aftrekposten te benutten.</p>
          <a href="/diensten/fiscale-planning">Lees meer over fiscale planning</a>
          <h2>Belangrijke Aftrekposten</h2>
          <p>Er zijn vele aftrekposten beschikbaar voor ondernemers, afhankelijk van uw situatie.</p>
          <a href="/contact">Neem contact op</a>
          <a href="https://belastingdienst.nl/ondernemers">Belastingdienst informatie</a>
        `,
        mainImage: { url: 'https://example.com/image.jpg', alt: 'Professioneel belastingadvies voor ondernemers' },
        schemaMarkup: JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'Article',
          headline: 'Belastingadvies voor Ondernemers',
        }),
      };

      const result = validator.validate(content, { language: 'nl' });

      expect(result.passed).toBe(true);
      expect(result.errors).toHaveLength(0);
      expect(result.score).toBeGreaterThan(50);
    });

    it('should fail content with multiple errors', () => {
      const content: SEOContent = {
        title: '',
        description: '',
        slug: '',
        keyword: 'test',
        content: '<p>Short content without headings.</p>',
        schemaMarkup: null,
      };

      const result = validator.validate(content, { language: 'nl' });

      expect(result.passed).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.score).toBeLessThan(50);
    });
  });

  describe('validateTitle', () => {
    it('should pass valid title', () => {
      const result = validator.validateTitle(
        'Belastingadvies Tips | AmbitionValley',
        'belastingadvies',
        { language: 'nl' }
      );

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should error on title exceeding max length', () => {
      const longTitle = 'A'.repeat(70) + ' | AmbitionValley';
      const result = validator.validateTitle(longTitle, 'test', { language: 'nl' });

      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.includes('60 characters'))).toBe(true);
    });

    it('should error on empty title', () => {
      const result = validator.validateTitle('', 'test', { language: 'nl' });

      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.includes('required'))).toBe(true);
    });

    it('should warn if brand suffix missing', () => {
      const result = validator.validateTitle(
        'Belastingadvies Tips',
        'belastingadvies',
        { language: 'nl' }
      );

      expect(result.warnings.some((w) => w.includes('AmbitionValley'))).toBe(true);
    });

    it('should warn if keyword not in first 40 characters', () => {
      const result = validator.validateTitle(
        'Tips voor Ondernemers over Belastingadvies | AmbitionValley',
        'belastingadvies',
        { language: 'nl' }
      );

      expect(result.warnings.some((w) => w.includes('first 40'))).toBe(true);
    });

    it('should detect duplicate titles', () => {
      const result = validator.validateTitle(
        'Test Title | AmbitionValley',
        'test',
        { language: 'nl', checkDuplicates: true, existingTitles: ['Test Title | AmbitionValley'] }
      );

      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.includes('Duplicate'))).toBe(true);
    });
  });

  describe('validateDescription', () => {
    it('should pass valid description', () => {
      const result = validator.validateDescription(
        'Ontdek hoe belastingadvies u kan helpen met fiscale optimalisatie voor uw onderneming.',
        'belastingadvies',
        { language: 'nl' }
      );

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should error on description exceeding max length', () => {
      const longDesc = 'A'.repeat(170);
      const result = validator.validateDescription(longDesc, 'test', { language: 'nl' });

      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.includes('160 characters'))).toBe(true);
    });

    it('should error on empty description', () => {
      const result = validator.validateDescription('', 'test', { language: 'nl' });

      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.includes('required'))).toBe(true);
    });

    it('should warn on short description', () => {
      const result = validator.validateDescription(
        'Short description about belastingadvies.',
        'belastingadvies',
        { language: 'nl' }
      );

      expect(result.warnings.some((w) => w.includes('short'))).toBe(true);
    });

    it('should warn if keyword missing', () => {
      const result = validator.validateDescription(
        'Ontdek hoe fiscale optimalisatie u kan helpen met uw onderneming.',
        'belastingadvies',
        { language: 'nl' }
      );

      expect(result.warnings.some((w) => w.includes('keyword'))).toBe(true);
    });

    it('should warn if no CTA', () => {
      const result = validator.validateDescription(
        'Belastingadvies is belangrijk voor ondernemers die hun fiscale positie willen verbeteren.',
        'belastingadvies',
        { language: 'nl' }
      );

      expect(result.warnings.some((w) => w.includes('call-to-action'))).toBe(true);
    });
  });

  describe('validateSlug', () => {
    it('should pass valid slug', () => {
      const result = validator.validateSlug(
        'belastingadvies-ondernemers',
        'belastingadvies',
        { language: 'nl' }
      );

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should error on slug exceeding max length', () => {
      const longSlug = 'a-'.repeat(40);
      const result = validator.validateSlug(longSlug, 'test', { language: 'nl' });

      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.includes('75 characters'))).toBe(true);
    });

    it('should error on uppercase letters', () => {
      const result = validator.validateSlug(
        'Belastingadvies-Ondernemers',
        'belastingadvies',
        { language: 'nl' }
      );

      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.includes('lowercase'))).toBe(true);
    });

    it('should error on invalid characters', () => {
      const result = validator.validateSlug(
        'belasting_advies@ondernemers',
        'belastingadvies',
        { language: 'nl' }
      );

      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.includes('letters, numbers, and hyphens'))).toBe(true);
    });

    it('should error on consecutive hyphens', () => {
      const result = validator.validateSlug(
        'belastingadvies--ondernemers',
        'belastingadvies',
        { language: 'nl' }
      );

      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.includes('consecutive hyphens'))).toBe(true);
    });

    it('should error on leading/trailing hyphens', () => {
      const result1 = validator.validateSlug('-belastingadvies', 'test', { language: 'nl' });
      const result2 = validator.validateSlug('belastingadvies-', 'test', { language: 'nl' });

      expect(result1.valid).toBe(false);
      expect(result2.valid).toBe(false);
    });

    it('should warn about stop words', () => {
      const result = validator.validateSlug(
        'de-beste-belastingadvies-van-nederland',
        'belastingadvies',
        { language: 'nl' }
      );

      expect(result.warnings.some((w) => w.includes('stop words'))).toBe(true);
    });

    it('should warn about dates', () => {
      const result = validator.validateSlug(
        'belastingadvies-2024',
        'belastingadvies',
        { language: 'nl' }
      );

      expect(result.warnings.some((w) => w.includes('dates'))).toBe(true);
    });
  });

  describe('validateHeadingStructure', () => {
    it('should pass valid heading structure', () => {
      const content = `
        <h1>Main Heading with belastingadvies</h1>
        <h2>First Section</h2>
        <p>Content</p>
        <h2>Second Section</h2>
        <p>More content</p>
      `;
      const result = validator.validateHeadingStructure(content, 'belastingadvies');

      expect(result.valid).toBe(true);
      expect(result.h1Count).toBe(1);
      expect(result.h2Count).toBe(2);
    });

    it('should error on missing H1', () => {
      const content = '<h2>Section</h2><p>Content</p>';
      const result = validator.validateHeadingStructure(content, 'test');

      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.includes('exactly one H1'))).toBe(true);
    });

    it('should error on multiple H1s', () => {
      const content = '<h1>First</h1><h1>Second</h1><h2>Section</h2>';
      const result = validator.validateHeadingStructure(content, 'test');

      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.includes('2 H1 headings'))).toBe(true);
    });

    it('should warn on insufficient H2s', () => {
      const content = '<h1>Main</h1><h2>Only One</h2><p>Content</p>';
      const result = validator.validateHeadingStructure(content, 'test');

      expect(result.warnings.some((w) => w.includes('H2 headings'))).toBe(true);
    });

    it('should error on skipped heading levels', () => {
      const content = '<h1>Main</h1><h3>Skipped H2</h3><p>Content</p>';
      const result = validator.validateHeadingStructure(content, 'test');

      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.includes('skip levels'))).toBe(true);
    });

    it('should warn if keyword not in H1', () => {
      const content = '<h1>Main Heading</h1><h2>Section</h2><h2>Another</h2>';
      const result = validator.validateHeadingStructure(content, 'belastingadvies');

      expect(result.warnings.some((w) => w.includes('keyword not found in H1'))).toBe(true);
    });
  });

  describe('validateContent', () => {
    it('should pass valid content', () => {
      const content = `
        <p>Belastingadvies is essentieel voor ondernemers. ${' word'.repeat(100)}</p>
        <a href="/diensten/fiscale-planning">Internal link 1</a>
        <a href="/contact">Internal link 2</a>
        <a href="https://belastingdienst.nl">External link</a>
      `;
      const result = validator.validateContent(content, 'belastingadvies', { language: 'nl', contentType: 'short' });

      expect(result.valid).toBe(true);
      expect(result.internalLinksValid).toBe(true);
      expect(result.externalLinksValid).toBe(true);
    });

    it('should warn on low word count', () => {
      const content = '<p>Short content about belastingadvies.</p>';
      const result = validator.validateContent(content, 'belastingadvies', { language: 'nl', contentType: 'long' });

      expect(result.warnings.some((w) => w.includes('words'))).toBe(true);
    });

    it('should warn if keyword not in first 100 words', () => {
      const content = `<p>${'word '.repeat(110)}belastingadvies</p>`;
      const result = validator.validateContent(content, 'belastingadvies', { language: 'nl' });

      expect(result.warnings.some((w) => w.includes('first 100 words'))).toBe(true);
    });

    it('should warn on insufficient internal links', () => {
      const content = `
        <p>Belastingadvies content ${' word'.repeat(100)}</p>
        <a href="/contact">Only one internal link</a>
      `;
      const result = validator.validateContent(content, 'belastingadvies', { language: 'nl' });

      expect(result.internalLinksValid).toBe(false);
      expect(result.warnings.some((w) => w.includes('internal links'))).toBe(true);
    });

    it('should error on unapproved external domains', () => {
      const content = `
        <p>Belastingadvies content ${' word'.repeat(100)}</p>
        <a href="/link1">Internal 1</a>
        <a href="/link2">Internal 2</a>
        <a href="https://spam-site.com">Bad external</a>
      `;
      const result = validator.validateContent(content, 'belastingadvies', { language: 'nl' });

      expect(result.externalLinksValid).toBe(false);
      expect(result.invalidDomains).toContain('spam-site.com');
      expect(result.errors.some((e) => e.includes('unapproved domains'))).toBe(true);
    });

    it('should pass approved external domains', () => {
      const content = `
        <p>Belastingadvies content ${' word'.repeat(100)}</p>
        <a href="/link1">Internal 1</a>
        <a href="/link2">Internal 2</a>
        <a href="https://belastingdienst.nl/info">Belastingdienst</a>
        <a href="https://rijksoverheid.nl/onderwerpen">Rijksoverheid</a>
      `;
      const result = validator.validateContent(content, 'belastingadvies', { language: 'nl' });

      expect(result.externalLinksValid).toBe(true);
      expect(result.invalidDomains).toHaveLength(0);
    });
  });

  describe('validateImages', () => {
    it('should pass valid images', () => {
      const result = validator.validateImages(
        { url: 'https://example.com/main.jpg', alt: 'Descriptive alt text for main image' },
        { url: 'https://example.com/thumb.jpg', alt: 'Thumbnail description' }
      );

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should warn on missing main image', () => {
      const result = validator.validateImages(null, null);

      expect(result.warnings.some((w) => w.includes('Main image is missing'))).toBe(true);
    });

    it('should error on missing alt text for main image', () => {
      const result = validator.validateImages(
        { url: 'https://example.com/main.jpg' },
        null
      );

      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.includes('missing alt text'))).toBe(true);
    });

    it('should error on alt text exceeding max length', () => {
      const result = validator.validateImages(
        { url: 'https://example.com/main.jpg', alt: 'A'.repeat(130) },
        null
      );

      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.includes('125 characters'))).toBe(true);
    });

    it('should warn on alt text starting with "image of"', () => {
      const result = validator.validateImages(
        { url: 'https://example.com/main.jpg', alt: 'Image of a business meeting' },
        null
      );

      expect(result.warnings.some((w) => w.includes('image of'))).toBe(true);
    });
  });

  describe('validateSchema', () => {
    it('should pass valid Article schema', () => {
      const schema = JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: 'Test Article',
      });
      const result = validator.validateSchema(schema);

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should pass valid BlogPosting schema', () => {
      const schema = JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'BlogPosting',
        headline: 'Test Post',
      });
      const result = validator.validateSchema(schema);

      expect(result.valid).toBe(true);
    });

    it('should error on missing schema', () => {
      const result = validator.validateSchema(null);

      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.includes('required'))).toBe(true);
    });

    it('should error on invalid JSON', () => {
      const result = validator.validateSchema('not valid json');

      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.includes('valid JSON'))).toBe(true);
    });

    it('should error on wrong schema type', () => {
      const schema = JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'Product',
        name: 'Test',
      });
      const result = validator.validateSchema(schema);

      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.includes('Article'))).toBe(true);
    });

    it('should warn if FAQ section exists but no FAQPage schema', () => {
      const schema = JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'Article',
      });
      const content = '<h2>Veelgestelde vragen</h2><p>FAQ content</p>';
      const result = validator.validateSchema(schema, content);

      expect(result.warnings.some((w) => w.includes('FAQPage'))).toBe(true);
    });
  });

  describe('validateHreflang', () => {
    it('should pass with no alternate language', () => {
      const result = validator.validateHreflang(null, { language: 'nl' });

      expect(result.valid).toBe(true);
      expect(result.warnings.some((w) => w.includes('English'))).toBe(true);
    });

    it('should warn to verify alternate exists', () => {
      const result = validator.validateHreflang('belastingadvies-en', { language: 'nl' });

      expect(result.valid).toBe(true);
      expect(result.warnings.some((w) => w.includes('Verify'))).toBe(true);
    });

    it('should error on spaces in alternate slug', () => {
      const result = validator.validateHreflang('belasting advies', { language: 'nl' });

      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.includes('spaces'))).toBe(true);
    });
  });

  describe('utility methods', () => {
    it('should generate title with brand', () => {
      const title = validator.generateTitle('Belastingadvies voor Ondernemers');
      expect(title).toBe('Belastingadvies voor Ondernemers | AmbitionValley');
    });

    it('should truncate long titles', () => {
      const longTitle = 'A'.repeat(50);
      const title = validator.generateTitle(longTitle);
      expect(title.length).toBeLessThanOrEqual(60);
      expect(title.endsWith('| AmbitionValley')).toBe(true);
    });

    it('should generate SEO-friendly slug', () => {
      const slug = validator.generateSlug('Belastingadvies voor Ondernemers', 'nl');
      expect(slug).toBe('belastingadvies-ondernemers');
      expect(slug).not.toContain('voor');
    });

    it('should return approved domains', () => {
      const domains = validator.getApprovedDomains();
      expect(domains).toContain('belastingdienst.nl');
      expect(domains).toContain('rijksoverheid.nl');
    });
  });
});

describe('createSEOValidator', () => {
  it('should create validator instance', () => {
    const validator = createSEOValidator();
    expect(validator).toBeInstanceOf(SEOValidatorService);
  });
});
