/**
 * SEO Content Engine - SEO Validator
 *
 * Validates all on-page SEO elements for blog content.
 */

import { contentConfig } from '../config';
import { APPROVED_EXTERNAL_DOMAINS } from '../constants';
import type { Language, SEOValidationResult, ContentType } from '../types';

// =============================================================================
// Types
// =============================================================================

export interface SEOValidationOptions {
  language: Language;
  contentType?: ContentType;
  checkDuplicates?: boolean;
  existingTitles?: string[];
  existingDescriptions?: string[];
  existingSlugs?: string[];
}

export interface SEOContent {
  title: string;
  description: string;
  slug: string;
  content: string;
  keyword: string;
  mainImage?: { url: string; alt?: string } | null;
  thumbnail?: { url: string; alt?: string } | null;
  schemaMarkup?: string | null;
  alternateLanguageSlug?: string | null;
}

// =============================================================================
// Constants
// =============================================================================

const { seo } = contentConfig;

const BRAND_SUFFIX = '| AmbitionValley';

/** Stop words to avoid in slugs */
const STOP_WORDS = {
  nl: ['de', 'het', 'een', 'van', 'en', 'in', 'op', 'te', 'aan', 'voor', 'met', 'naar', 'om', 'bij'],
  en: ['the', 'a', 'an', 'of', 'and', 'in', 'on', 'to', 'at', 'for', 'with', 'by', 'about', 'as'],
};

// =============================================================================
// SEO Validator Service
// =============================================================================

export class SEOValidatorService {
  // ===========================================================================
  // Main Validation Method
  // ===========================================================================

  /**
   * Run all SEO validations on content.
   */
  validate(content: SEOContent, options: SEOValidationOptions): SEOValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Run all validations
    const titleResult = this.validateTitle(content.title, content.keyword, options);
    const descriptionResult = this.validateDescription(content.description, content.keyword, options);
    const slugResult = this.validateSlug(content.slug, content.keyword, options);
    const headingResult = this.validateHeadingStructure(content.content, content.keyword);
    const contentResult = this.validateContent(content.content, content.keyword, options);
    const imageResult = this.validateImages(content.mainImage, content.thumbnail);
    const schemaResult = this.validateSchema(content.schemaMarkup, content.content);
    const hreflangResult = this.validateHreflang(content.alternateLanguageSlug, options);

    // Collect errors and warnings
    errors.push(...titleResult.errors);
    errors.push(...descriptionResult.errors);
    errors.push(...slugResult.errors);
    errors.push(...headingResult.errors);
    errors.push(...contentResult.errors);
    errors.push(...imageResult.errors);
    errors.push(...schemaResult.errors);
    errors.push(...hreflangResult.errors);

    warnings.push(...titleResult.warnings);
    warnings.push(...descriptionResult.warnings);
    warnings.push(...slugResult.warnings);
    warnings.push(...headingResult.warnings);
    warnings.push(...contentResult.warnings);
    warnings.push(...imageResult.warnings);
    warnings.push(...schemaResult.warnings);
    warnings.push(...hreflangResult.warnings);

    // Calculate score
    const score = this.calculateScore(
      titleResult,
      descriptionResult,
      slugResult,
      headingResult,
      contentResult,
      imageResult,
      schemaResult,
      hreflangResult
    );

    return {
      passed: errors.length === 0,
      score,
      errors,
      warnings,
      details: {
        titleLength: { value: content.title.length, valid: titleResult.valid },
        descriptionLength: { value: content.description.length, valid: descriptionResult.valid },
        slugFormat: { valid: slugResult.valid },
        headingStructure: {
          valid: headingResult.valid,
          h1Count: headingResult.h1Count,
          h2Count: headingResult.h2Count,
        },
        keywordPresence: { valid: contentResult.keywordValid },
        internalLinks: { count: contentResult.internalLinkCount, valid: contentResult.internalLinksValid },
        externalLinks: {
          count: contentResult.externalLinkCount,
          valid: contentResult.externalLinksValid,
          invalidDomains: contentResult.invalidDomains,
        },
        imageAltText: { valid: imageResult.valid },
      },
    };
  }

  // ===========================================================================
  // Title Validation
  // ===========================================================================

  /**
   * Validate meta title.
   */
  validateTitle(
    title: string,
    keyword: string,
    options: SEOValidationOptions
  ): { valid: boolean; errors: string[]; warnings: string[] } {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Check length
    if (title.length > seo.titleMaxLength) {
      errors.push(
        `Title exceeds ${seo.titleMaxLength} characters (${title.length} chars)`
      );
    }

    // Check if empty
    if (!title.trim()) {
      errors.push('Title is required');
      return { valid: false, errors, warnings };
    }

    // Check brand suffix
    if (!title.endsWith(BRAND_SUFFIX)) {
      warnings.push(`Title should end with "${BRAND_SUFFIX}"`);
    }

    // Check keyword in first 40 characters
    const keywordLower = keyword.toLowerCase();
    const first40 = title.substring(0, 40).toLowerCase();
    if (!first40.includes(keywordLower)) {
      warnings.push('Primary keyword should appear within first 40 characters of title');
    }

    // Check for duplicates
    if (options.checkDuplicates && options.existingTitles) {
      const titleLower = title.toLowerCase();
      if (options.existingTitles.some((t) => t.toLowerCase() === titleLower)) {
        errors.push('Duplicate title - this title already exists on the site');
      }
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
    };
  }

  // ===========================================================================
  // Description Validation
  // ===========================================================================

  /**
   * Validate meta description.
   */
  validateDescription(
    description: string,
    keyword: string,
    options: SEOValidationOptions
  ): { valid: boolean; errors: string[]; warnings: string[] } {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Check length
    if (description.length > seo.descriptionMaxLength) {
      errors.push(
        `Description exceeds ${seo.descriptionMaxLength} characters (${description.length} chars)`
      );
    }

    // Check if empty
    if (!description.trim()) {
      errors.push('Meta description is required');
      return { valid: false, errors, warnings };
    }

    // Check minimum length
    if (description.length < 70) {
      warnings.push('Description is short - aim for 120-160 characters for better CTR');
    }

    // Check keyword presence
    if (!description.toLowerCase().includes(keyword.toLowerCase())) {
      warnings.push('Primary keyword not found in meta description');
    }

    // Check for call to action indicators
    const ctaIndicators = options.language === 'nl'
      ? ['ontdek', 'leer', 'lees', 'bekijk', 'bereken', 'vraag', 'start', 'krijg']
      : ['discover', 'learn', 'read', 'view', 'calculate', 'get', 'start', 'find'];

    const hasCta = ctaIndicators.some((cta) =>
      description.toLowerCase().includes(cta.toLowerCase())
    );

    if (!hasCta) {
      warnings.push('Consider adding a call-to-action in meta description');
    }

    // Check for duplicates
    if (options.checkDuplicates && options.existingDescriptions) {
      const descLower = description.toLowerCase();
      if (options.existingDescriptions.some((d) => d.toLowerCase() === descLower)) {
        errors.push('Duplicate description - this description already exists on the site');
      }
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
    };
  }

  // ===========================================================================
  // Slug Validation
  // ===========================================================================

  /**
   * Validate URL slug.
   */
  validateSlug(
    slug: string,
    keyword: string,
    options: SEOValidationOptions
  ): { valid: boolean; errors: string[]; warnings: string[] } {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Check length
    if (slug.length > seo.slugMaxLength) {
      errors.push(`Slug exceeds ${seo.slugMaxLength} characters (${slug.length} chars)`);
    }

    // Check if empty
    if (!slug.trim()) {
      errors.push('URL slug is required');
      return { valid: false, errors, warnings };
    }

    // Check lowercase
    if (slug !== slug.toLowerCase()) {
      errors.push('Slug must be lowercase');
    }

    // Check for valid characters (letters, numbers, hyphens)
    if (!/^[a-z0-9-]+$/.test(slug)) {
      errors.push('Slug should only contain lowercase letters, numbers, and hyphens');
    }

    // Check for consecutive hyphens
    if (/--/.test(slug)) {
      errors.push('Slug should not contain consecutive hyphens');
    }

    // Check for leading/trailing hyphens
    if (slug.startsWith('-') || slug.endsWith('-')) {
      errors.push('Slug should not start or end with a hyphen');
    }

    // Check for stop words
    const stopWords = STOP_WORDS[options.language] || [];
    if (stopWords.length > 0) {
      const slugWords = slug.split('-');
      const usedStopWords = slugWords.filter((word) => stopWords.includes(word));
      if (usedStopWords.length > 0) {
        warnings.push(`Consider removing stop words from slug: ${usedStopWords.join(', ')}`);
      }
    }

    // Check keyword presence
    const keywordSlug = this.slugify(keyword);
    const keywordWords = keywordSlug.split('-');
    const hasKeyword = keywordWords.some((word) => slug.includes(word));
    if (!hasKeyword) {
      warnings.push('Primary keyword not found in URL slug');
    }

    // Check for dates (unless time-sensitive)
    if (/\d{4}/.test(slug)) {
      warnings.push('Avoid dates in slugs unless content is time-sensitive');
    }

    // Check for duplicates
    if (options.checkDuplicates && options.existingSlugs) {
      if (options.existingSlugs.includes(slug)) {
        errors.push('Duplicate slug - this URL already exists');
      }
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
    };
  }

  // ===========================================================================
  // Heading Structure Validation
  // ===========================================================================

  /**
   * Validate heading structure.
   */
  validateHeadingStructure(
    content: string,
    keyword: string
  ): { valid: boolean; errors: string[]; warnings: string[]; h1Count: number; h2Count: number } {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Count headings
    const h1Matches = content.match(/<h1[^>]*>(.*?)<\/h1>/gi) || [];
    const h2Matches = content.match(/<h2[^>]*>(.*?)<\/h2>/gi) || [];
    const h3Matches = content.match(/<h3[^>]*>(.*?)<\/h3>/gi) || [];
    const h4Matches = content.match(/<h4[^>]*>(.*?)<\/h4>/gi) || [];

    const h1Count = h1Matches.length;
    const h2Count = h2Matches.length;
    const h3Count = h3Matches.length;
    const h4Count = h4Matches.length;

    // Check exactly one H1
    if (h1Count === 0) {
      errors.push('Content must have exactly one H1 heading');
    } else if (h1Count > 1) {
      errors.push(`Content has ${h1Count} H1 headings - should have exactly one`);
    }

    // Check minimum H2 headings
    if (h2Count < seo.minH2Headings) {
      warnings.push(
        `Content has ${h2Count} H2 headings - recommend at least ${seo.minH2Headings}`
      );
    }

    // Check for skipped heading levels
    if (h1Count === 0 && (h2Count > 0 || h3Count > 0)) {
      errors.push('Missing H1 - headings should not skip levels');
    }
    if (h2Count === 0 && h3Count > 0) {
      errors.push('H3 used without H2 - headings should not skip levels');
    }
    if (h3Count === 0 && h4Count > 0) {
      warnings.push('H4 used without H3 - consider using proper heading hierarchy');
    }

    // Check keyword in H1
    if (h1Count > 0 && h1Matches[0]) {
      const h1Text = this.extractText(h1Matches[0]);
      if (!h1Text.toLowerCase().includes(keyword.toLowerCase())) {
        warnings.push('Primary keyword not found in H1 heading');
      }
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
      h1Count,
      h2Count,
    };
  }

  // ===========================================================================
  // Content Validation
  // ===========================================================================

  /**
   * Validate content for SEO requirements.
   */
  validateContent(
    content: string,
    keyword: string,
    options: SEOValidationOptions
  ): {
    valid: boolean;
    errors: string[];
    warnings: string[];
    keywordValid: boolean;
    internalLinksValid: boolean;
    externalLinksValid: boolean;
    internalLinkCount: number;
    externalLinkCount: number;
    invalidDomains: string[];
  } {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Extract plain text for analysis
    const plainText = this.stripHtml(content);
    const words = plainText.split(/\s+/).filter((w) => w.length > 0);
    const wordCount = words.length;

    // Check minimum word count
    const contentType = options.contentType || 'mixed';
    const minWords = contentConfig.wordCount[contentType].min;
    if (wordCount < minWords) {
      warnings.push(`Content has ${wordCount} words - minimum ${minWords} recommended for ${contentType} content`);
    }

    // Check keyword in first 100 words
    const first100Words = words.slice(0, 100).join(' ').toLowerCase();
    const keywordInFirst100 = first100Words.includes(keyword.toLowerCase());
    if (!keywordInFirst100) {
      warnings.push('Primary keyword should appear in first 100 words');
    }

    // Check keyword density
    const keywordLower = keyword.toLowerCase();
    const keywordCount = (plainText.toLowerCase().match(new RegExp(keywordLower, 'g')) || []).length;
    const density = wordCount > 0 ? keywordCount / wordCount : 0;

    if (density < 0.01) {
      warnings.push(`Keyword density is low (${(density * 100).toFixed(1)}%) - aim for 1-2%`);
    } else if (density > seo.maxKeywordDensity) {
      warnings.push(`Keyword density is high (${(density * 100).toFixed(1)}%) - may appear as keyword stuffing`);
    }

    // Extract links
    const linkMatches = content.match(/<a[^>]+href=["']([^"']+)["'][^>]*>/gi) || [];
    const links = linkMatches.map((link) => {
      const hrefMatch = link.match(/href=["']([^"']+)["']/i);
      return hrefMatch ? hrefMatch[1] : '';
    }).filter(Boolean);

    // Categorize links
    const internalLinks: string[] = [];
    const externalLinks: string[] = [];
    const invalidDomains: string[] = [];

    for (const link of links) {
      if (this.isInternalLink(link)) {
        internalLinks.push(link);
      } else {
        externalLinks.push(link);
        const domain = this.extractDomain(link);
        if (domain && !this.isApprovedDomain(domain)) {
          invalidDomains.push(domain);
        }
      }
    }

    // Check internal links
    const internalLinksValid = internalLinks.length >= seo.minInternalLinks;
    if (!internalLinksValid) {
      warnings.push(
        `Content has ${internalLinks.length} internal links - recommend at least ${seo.minInternalLinks}`
      );
    }

    // Check external links
    const externalLinksValid = invalidDomains.length === 0;
    if (!externalLinksValid) {
      errors.push(`External links to unapproved domains: ${[...new Set(invalidDomains)].join(', ')}`);
    }

    // Check for too many external links
    if (externalLinks.length > seo.maxExternalLinks) {
      warnings.push(
        `Content has ${externalLinks.length} external links - limit to ${seo.maxExternalLinks}`
      );
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
      keywordValid: keywordInFirst100 && density >= 0.01 && density <= seo.maxKeywordDensity,
      internalLinksValid,
      externalLinksValid,
      internalLinkCount: internalLinks.length,
      externalLinkCount: externalLinks.length,
      invalidDomains: [...new Set(invalidDomains)],
    };
  }

  // ===========================================================================
  // Image Validation
  // ===========================================================================

  /**
   * Validate images and alt text.
   */
  validateImages(
    mainImage?: { url: string; alt?: string } | null,
    thumbnail?: { url: string; alt?: string } | null
  ): { valid: boolean; errors: string[]; warnings: string[] } {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Check main image
    if (!mainImage?.url) {
      warnings.push('Main image is missing - recommended for social sharing');
    } else if (!mainImage.alt) {
      errors.push('Main image is missing alt text');
    } else if (mainImage.alt.length > seo.altTextMaxLength) {
      errors.push(
        `Main image alt text exceeds ${seo.altTextMaxLength} characters (${mainImage.alt.length} chars)`
      );
    }

    // Check thumbnail
    if (thumbnail?.url && !thumbnail.alt) {
      errors.push('Thumbnail is missing alt text');
    } else if (thumbnail?.alt && thumbnail.alt.length > seo.altTextMaxLength) {
      errors.push(
        `Thumbnail alt text exceeds ${seo.altTextMaxLength} characters (${thumbnail.alt.length} chars)`
      );
    }

    // Check alt text quality (basic checks)
    if (mainImage?.alt) {
      if (mainImage.alt.toLowerCase().startsWith('image of')) {
        warnings.push('Alt text should not start with "image of" - be descriptive');
      }
      if (mainImage.alt.length < 10) {
        warnings.push('Alt text is very short - provide more descriptive text');
      }
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
    };
  }

  // ===========================================================================
  // Schema Validation
  // ===========================================================================

  /**
   * Validate schema markup.
   */
  validateSchema(
    schemaMarkup?: string | null,
    content?: string
  ): { valid: boolean; errors: string[]; warnings: string[] } {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Check if schema exists
    if (!schemaMarkup) {
      errors.push('Article schema markup is required');
      return { valid: false, errors, warnings };
    }

    // Try to parse JSON-LD
    let schema: unknown;
    try {
      schema = JSON.parse(schemaMarkup);
    } catch {
      errors.push('Schema markup is not valid JSON');
      return { valid: false, errors, warnings };
    }

    // Check if it's an object
    if (typeof schema !== 'object' || schema === null) {
      errors.push('Schema markup must be a JSON object');
      return { valid: false, errors, warnings };
    }

    const schemaObj = schema as Record<string, unknown>;

    // Check for required Article schema properties
    if (schemaObj['@type'] !== 'Article' && schemaObj['@type'] !== 'BlogPosting') {
      if (!Array.isArray(schemaObj['@graph'])) {
        errors.push('Schema must be Article or BlogPosting type');
      }
    }

    if (!schemaObj['@context'] && !schemaObj['@graph']) {
      errors.push('Schema must include @context');
    }

    // Check for FAQ schema if FAQ section exists
    if (content) {
      const hasFaqSection = /<h[2-3][^>]*>.*(?:FAQ|Veelgestelde\s+vragen|Frequently\s+Asked).*<\/h[2-3]>/i.test(content);

      if (hasFaqSection) {
        const schemaString = JSON.stringify(schema);
        if (!schemaString.includes('FAQPage')) {
          warnings.push('Content has FAQ section but no FAQPage schema');
        }
      }
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
    };
  }

  // ===========================================================================
  // Hreflang Validation
  // ===========================================================================

  /**
   * Validate hreflang/alternate language setup.
   */
  validateHreflang(
    alternateLanguageSlug?: string | null,
    options?: SEOValidationOptions
  ): { valid: boolean; errors: string[]; warnings: string[] } {
    const errors: string[] = [];
    const warnings: string[] = [];

    // If alternate language is set, warn to verify it exists
    if (alternateLanguageSlug) {
      // Check slug format
      if (alternateLanguageSlug.includes(' ')) {
        errors.push('Alternate language slug should not contain spaces');
      }

      // Provide reminder to verify
      warnings.push(
        'Verify that alternate language post exists before publishing'
      );
    } else {
      // No alternate set
      if (options?.language) {
        warnings.push(
          `No alternate language version linked - consider creating ${options.language === 'nl' ? 'English' : 'Dutch'} version`
        );
      }
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
    };
  }

  // ===========================================================================
  // Score Calculation
  // ===========================================================================

  /**
   * Calculate overall SEO score.
   */
  private calculateScore(
    titleResult: { valid: boolean; errors: string[]; warnings: string[] },
    descriptionResult: { valid: boolean; errors: string[]; warnings: string[] },
    slugResult: { valid: boolean; errors: string[]; warnings: string[] },
    headingResult: { valid: boolean; errors: string[]; warnings: string[] },
    contentResult: { valid: boolean; errors: string[]; warnings: string[] },
    imageResult: { valid: boolean; errors: string[]; warnings: string[] },
    schemaResult: { valid: boolean; errors: string[]; warnings: string[] },
    hreflangResult: { valid: boolean; errors: string[]; warnings: string[] }
  ): number {
    let score = 100;

    // Weight factors for each category
    const weights = {
      title: 15,
      description: 10,
      slug: 10,
      headings: 15,
      content: 25,
      images: 10,
      schema: 10,
      hreflang: 5,
    };

    // Deduct points for errors (full weight) and warnings (half weight)
    const deduct = (
      result: { errors: string[]; warnings: string[] },
      weight: number
    ): number => {
      const errorDeduction = result.errors.length > 0 ? weight : 0;
      const warningDeduction = result.warnings.length > 0 ? weight * 0.5 : 0;
      return Math.min(errorDeduction + warningDeduction, weight);
    };

    score -= deduct(titleResult, weights.title);
    score -= deduct(descriptionResult, weights.description);
    score -= deduct(slugResult, weights.slug);
    score -= deduct(headingResult, weights.headings);
    score -= deduct(contentResult, weights.content);
    score -= deduct(imageResult, weights.images);
    score -= deduct(schemaResult, weights.schema);
    score -= deduct(hreflangResult, weights.hreflang);

    return Math.max(0, Math.round(score));
  }

  // ===========================================================================
  // Helper Methods
  // ===========================================================================

  /**
   * Convert text to URL-friendly slug.
   */
  private slugify(text: string): string {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
  }

  /**
   * Strip HTML tags from content.
   */
  private stripHtml(html: string): string {
    return html
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  /**
   * Extract text from HTML element.
   */
  private extractText(html: string): string {
    return html.replace(/<[^>]+>/g, '').trim();
  }

  /**
   * Check if link is internal.
   */
  private isInternalLink(url: string): boolean {
    if (url.startsWith('/') || url.startsWith('#')) {
      return true;
    }
    try {
      const parsed = new URL(url);
      return parsed.hostname.includes('ambitionvalley');
    } catch {
      return true; // Assume relative URL
    }
  }

  /**
   * Extract domain from URL.
   */
  private extractDomain(url: string): string | null {
    try {
      const parsed = new URL(url);
      return parsed.hostname.replace(/^www\./, '');
    } catch {
      return null;
    }
  }

  /**
   * Check if domain is in approved list.
   */
  private isApprovedDomain(domain: string): boolean {
    return APPROVED_EXTERNAL_DOMAINS.some(
      (approved) => domain === approved || domain.endsWith(`.${approved}`)
    );
  }

  // ===========================================================================
  // Utility Methods
  // ===========================================================================

  /**
   * Generate SEO-friendly title with brand.
   */
  generateTitle(baseTitle: string): string {
    const maxBaseLength = seo.titleMaxLength - BRAND_SUFFIX.length - 1;
    const truncated =
      baseTitle.length > maxBaseLength
        ? baseTitle.substring(0, maxBaseLength - 3) + '...'
        : baseTitle;
    return `${truncated} ${BRAND_SUFFIX}`;
  }

  /**
   * Generate SEO-friendly slug from title.
   */
  generateSlug(title: string, language: Language): string {
    const stopWords = STOP_WORDS[language];

    let slug = title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .trim();

    // Remove stop words
    const words = slug.split(/\s+/);
    const filteredWords = words.filter((word) => !stopWords.includes(word));

    slug = filteredWords.join('-').replace(/-+/g, '-');

    // Truncate if needed
    if (slug.length > seo.slugMaxLength) {
      slug = slug.substring(0, seo.slugMaxLength).replace(/-+$/, '');
    }

    return slug;
  }

  /**
   * Get list of approved external domains.
   */
  getApprovedDomains(): readonly string[] {
    return APPROVED_EXTERNAL_DOMAINS;
  }
}

// =============================================================================
// Factory Function
// =============================================================================

/**
 * Create an SEO validator service.
 */
export function createSEOValidator(): SEOValidatorService {
  return new SEOValidatorService();
}
