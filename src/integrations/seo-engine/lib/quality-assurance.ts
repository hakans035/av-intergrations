/**
 * SEO Content Engine - Quality Assurance
 *
 * Comprehensive QA checks for content before approval and publication.
 */

import { contentConfig } from '../config';
import type {
  Language,
  ContentType,
  ContentStatus,
  QACheckResult,
  SEOValidationResult,
  ComplianceCheckResult,
} from '../types';
import { ComplianceCheckerService, createComplianceChecker } from './compliance-checker';
import { SEOValidatorService, createSEOValidator, type SEOContent } from './seo-validator';

// =============================================================================
// Types
// =============================================================================

export interface QACheckOptions {
  language: Language;
  contentType?: ContentType;
  contentStatus?: ContentStatus;
  existingSlugs?: string[];
  existingContentHashes?: string[];
  validateLinks?: boolean;
  checkPlagiarism?: boolean;
}

export interface ContentForQA extends SEOContent {
  status?: ContentStatus;
  complianceApproved?: boolean;
  allGatesPassed?: boolean;
}

export interface LinkValidationResult {
  passed: boolean;
  brokenLinks: string[];
  checkedLinks: number;
}

export interface LanguageCheckResult {
  passed: boolean;
  errors: string[];
  warnings: string[];
  spellingErrors: string[];
  grammarIssues: string[];
}

export interface PlagiarismResult {
  passed: boolean;
  similarity: number;
  matches: Array<{ source: string; similarity: number }>;
}

// =============================================================================
// Constants
// =============================================================================

const PLAGIARISM_THRESHOLD = 0.15; // 15% maximum similarity

/** Common Dutch spelling patterns to check */
const DUTCH_SPELLING_PATTERNS = [
  { wrong: /\bword\b/gi, correct: 'wordt', context: 'verb conjugation' },
  { wrong: /\bgeen\s+geen\b/gi, correct: 'geen', context: 'double word' },
  { wrong: /\bde\s+de\b/gi, correct: 'de', context: 'double word' },
  { wrong: /\bhet\s+het\b/gi, correct: 'het', context: 'double word' },
];

/** Common English spelling patterns to check */
const ENGLISH_SPELLING_PATTERNS = [
  { wrong: /\bthe\s+the\b/gi, correct: 'the', context: 'double word' },
  { wrong: /\ba\s+a\b/gi, correct: 'a', context: 'double word' },
  { wrong: /\bto\s+to\b/gi, correct: 'to', context: 'double word' },
];

/** Common grammar issues */
const GRAMMAR_PATTERNS = {
  nl: [
    { pattern: /\balsof\s+zou\b/gi, issue: 'Redundant "zou" after "alsof"' },
    { pattern: /\bdan\s+dan\b/gi, issue: 'Double "dan"' },
  ],
  en: [
    { pattern: /\bshould\s+of\b/gi, issue: 'Use "should have" instead of "should of"' },
    { pattern: /\bcould\s+of\b/gi, issue: 'Use "could have" instead of "could of"' },
    { pattern: /\bwould\s+of\b/gi, issue: 'Use "would have" instead of "would of"' },
    { pattern: /\bits\s+a\s+it's\b/gi, issue: 'Confused "its" and "it\'s"' },
  ],
};

// =============================================================================
// Quality Assurance Service
// =============================================================================

export class QualityAssuranceService {
  private seoValidator: SEOValidatorService;
  private complianceChecker: ComplianceCheckerService;

  constructor(
    seoValidator?: SEOValidatorService,
    complianceChecker?: ComplianceCheckerService
  ) {
    this.seoValidator = seoValidator || createSEOValidator();
    this.complianceChecker = complianceChecker || createComplianceChecker();
  }

  // ===========================================================================
  // Main QA Check Method
  // ===========================================================================

  /**
   * Run all QA checks on content.
   */
  async runChecks(
    content: ContentForQA,
    options: QACheckOptions
  ): Promise<QACheckResult> {
    const blockingErrors: string[] = [];
    const warnings: string[] = [];

    // Run SEO validation
    const seoResult = this.seoValidator.validate(content, {
      language: options.language,
      contentType: options.contentType,
      checkDuplicates: true,
      existingSlugs: options.existingSlugs,
    });

    // Run compliance check
    const complianceResult = this.complianceChecker.checkContent(content.content, {
      language: options.language,
    });

    // Run language correctness check
    const languageResult = this.checkLanguageCorrectness(content.content, options.language);

    // Run link validation if enabled
    let linkResult: LinkValidationResult = { passed: true, brokenLinks: [], checkedLinks: 0 };
    if (options.validateLinks) {
      linkResult = await this.validateLinks(content.content);
    }

    // Run plagiarism check if enabled
    let plagiarismResult: PlagiarismResult = { passed: true, similarity: 0, matches: [] };
    if (options.checkPlagiarism && options.existingContentHashes) {
      plagiarismResult = this.checkPlagiarism(content.content, options.existingContentHashes);
    }

    // Collect blocking errors from SEO
    if (!seoResult.passed) {
      blockingErrors.push(...seoResult.errors);
    }
    warnings.push(...seoResult.warnings);

    // Collect blocking errors from compliance
    const complianceErrors = complianceResult.violations.filter((v) => v.severity === 'error');
    if (complianceErrors.length > 0) {
      blockingErrors.push(...complianceErrors.map((v) => v.message));
    }
    const complianceWarnings = complianceResult.violations.filter((v) => v.severity === 'warning');
    warnings.push(...complianceWarnings.map((v) => v.message));
    warnings.push(...complianceResult.warnings);

    // Collect language errors
    if (!languageResult.passed) {
      blockingErrors.push(...languageResult.errors);
    }
    warnings.push(...languageResult.warnings);

    // Collect link validation errors
    if (!linkResult.passed) {
      blockingErrors.push(`Broken links found: ${linkResult.brokenLinks.join(', ')}`);
    }

    // Collect plagiarism errors
    if (!plagiarismResult.passed) {
      blockingErrors.push(
        `Content similarity too high (${(plagiarismResult.similarity * 100).toFixed(1)}%) - maximum ${PLAGIARISM_THRESHOLD * 100}%`
      );
    }

    // Determine canSubmit (pre-approval checks)
    const canSubmit = this.checkPreApprovalRequirements(content, seoResult, complianceResult, options);

    // Determine canPublish (pre-publish checks)
    const canPublish = this.checkPrePublishRequirements(
      content,
      seoResult,
      complianceResult,
      linkResult,
      plagiarismResult,
      options
    );

    return {
      canSubmit,
      canPublish,
      blockingErrors: [...new Set(blockingErrors)],
      warnings: [...new Set(warnings)],
      checkResults: {
        seo: seoResult,
        compliance: complianceResult,
        languageCorrectness: {
          passed: languageResult.passed,
          errors: languageResult.errors,
        },
        linkValidation: {
          passed: linkResult.passed,
          brokenLinks: linkResult.brokenLinks,
        },
        plagiarism: {
          passed: plagiarismResult.passed,
          similarity: plagiarismResult.similarity,
        },
      },
    };
  }

  // ===========================================================================
  // Pre-Approval Checks
  // ===========================================================================

  /**
   * Check pre-approval requirements.
   */
  private checkPreApprovalRequirements(
    _content: ContentForQA,
    seoResult: SEOValidationResult,
    complianceResult: ComplianceCheckResult,
    options: QACheckOptions
  ): boolean {
    // SEO Title Length <= 60
    if (!seoResult.details.titleLength.valid) {
      return false;
    }

    // SEO Description Length <= 160
    if (!seoResult.details.descriptionLength.valid) {
      return false;
    }

    // Slug Format valid
    if (!seoResult.details.slugFormat.valid) {
      return false;
    }

    // Heading Structure (one H1, min two H2)
    if (!seoResult.details.headingStructure.valid) {
      return false;
    }

    // Internal Links minimum 2
    if (!seoResult.details.internalLinks.valid) {
      return false;
    }

    // External Links from approved domains only
    if (!seoResult.details.externalLinks.valid) {
      return false;
    }

    // Disclaimer Present
    if (!complianceResult.passed) {
      const hasMissingDisclaimer = complianceResult.violations.some(
        (v) => v.type === 'missing_disclaimer' && v.severity === 'error'
      );
      if (hasMissingDisclaimer) {
        return false;
      }
    }

    // Alt Text if Main Image exists
    if (!seoResult.details.imageAltText.valid) {
      return false;
    }

    // Language Field valid
    if (!['nl', 'en'].includes(options.language)) {
      return false;
    }

    return true;
  }

  // ===========================================================================
  // Pre-Publish Checks
  // ===========================================================================

  /**
   * Check pre-publish requirements.
   */
  private checkPrePublishRequirements(
    content: ContentForQA,
    seoResult: SEOValidationResult,
    complianceResult: ComplianceCheckResult,
    linkResult: LinkValidationResult,
    plagiarismResult: PlagiarismResult,
    options: QACheckOptions
  ): boolean {
    // Must pass pre-approval first
    if (!this.checkPreApprovalRequirements(content, seoResult, complianceResult, options)) {
      return false;
    }

    // All Gates Passed (Content Status = approved)
    if (content.status !== 'approved' && content.allGatesPassed !== true) {
      return false;
    }

    // Compliance Sign-off
    if (content.complianceApproved !== true) {
      return false;
    }

    // Link Validation
    if (!linkResult.passed) {
      return false;
    }

    // Plagiarism Check
    if (!plagiarismResult.passed) {
      return false;
    }

    // No duplicate slug+language
    if (options.existingSlugs?.includes(content.slug)) {
      return false;
    }

    return true;
  }

  // ===========================================================================
  // Language Correctness Check
  // ===========================================================================

  /**
   * Check language correctness (spelling and grammar).
   */
  checkLanguageCorrectness(content: string, language: Language): LanguageCheckResult {
    const errors: string[] = [];
    const warnings: string[] = [];
    const spellingErrors: string[] = [];
    const grammarIssues: string[] = [];

    // Strip HTML for text analysis
    const plainText = this.stripHtml(content);

    // Check spelling patterns
    const spellingPatterns = language === 'nl' ? DUTCH_SPELLING_PATTERNS : ENGLISH_SPELLING_PATTERNS;
    for (const pattern of spellingPatterns) {
      const matches = plainText.match(pattern.wrong);
      if (matches) {
        spellingErrors.push(`Found "${matches[0]}" - ${pattern.context}`);
      }
    }

    // Check grammar patterns
    const grammarPatterns = GRAMMAR_PATTERNS[language];
    for (const pattern of grammarPatterns) {
      if (pattern.pattern.test(plainText)) {
        grammarIssues.push(pattern.issue);
      }
    }

    // Check for common issues
    this.checkCommonIssues(plainText, language, warnings);

    // Determine if passed (no critical errors)
    const passed = spellingErrors.length === 0 && grammarIssues.length === 0;

    // Add errors to main errors array if critical
    if (spellingErrors.length > 0) {
      errors.push(`Spelling issues: ${spellingErrors.join('; ')}`);
    }
    if (grammarIssues.length > 0) {
      errors.push(`Grammar issues: ${grammarIssues.join('; ')}`);
    }

    return {
      passed,
      errors,
      warnings,
      spellingErrors,
      grammarIssues,
    };
  }

  /**
   * Check for common writing issues.
   */
  private checkCommonIssues(text: string, language: Language, warnings: string[]): void {
    // Check for very long sentences
    const sentences = text.split(/[.!?]+/).filter((s) => s.trim().length > 0);
    const longSentences = sentences.filter(
      (s) => s.split(/\s+/).length > contentConfig.readability.maxSentenceLength
    );
    if (longSentences.length > 0) {
      warnings.push(
        `${longSentences.length} sentence(s) exceed ${contentConfig.readability.maxSentenceLength} words`
      );
    }

    // Check for passive voice (simplified)
    const passivePatterns = language === 'nl'
      ? [/\bwordt\s+\w+d\b/gi, /\bworden\s+\w+d\b/gi, /\bwerd\s+\w+d\b/gi]
      : [/\bis\s+\w+ed\b/gi, /\bare\s+\w+ed\b/gi, /\bwas\s+\w+ed\b/gi, /\bwere\s+\w+ed\b/gi];

    let passiveCount = 0;
    for (const pattern of passivePatterns) {
      const matches = text.match(pattern);
      if (matches) {
        passiveCount += matches.length;
      }
    }

    const sentenceCount = sentences.length || 1;
    const passivePercent = (passiveCount / sentenceCount) * 100;
    if (passivePercent > contentConfig.readability.maxPassiveVoicePercent) {
      warnings.push(
        `High passive voice usage (${passivePercent.toFixed(0)}%) - aim for less than ${contentConfig.readability.maxPassiveVoicePercent}%`
      );
    }

    // Check for repeated words (consecutive)
    const words = text.toLowerCase().split(/\s+/);
    for (let i = 1; i < words.length; i++) {
      if (words[i] === words[i - 1] && words[i].length > 1) {
        warnings.push(`Repeated word: "${words[i]}"`);
        break; // Only report first occurrence
      }
    }
  }

  // ===========================================================================
  // Link Validation
  // ===========================================================================

  /**
   * Validate all links in content.
   */
  async validateLinks(content: string): Promise<LinkValidationResult> {
    const brokenLinks: string[] = [];

    // Extract all links
    const linkMatches = content.match(/<a[^>]+href=["']([^"']+)["'][^>]*>/gi) || [];
    const links = linkMatches
      .map((link) => {
        const hrefMatch = link.match(/href=["']([^"']+)["']/i);
        return hrefMatch ? hrefMatch[1] : '';
      })
      .filter((link) => link && !link.startsWith('#') && !link.startsWith('mailto:'));

    // Check each link
    for (const link of links) {
      const isValid = await this.checkLink(link);
      if (!isValid) {
        brokenLinks.push(link);
      }
    }

    return {
      passed: brokenLinks.length === 0,
      brokenLinks,
      checkedLinks: links.length,
    };
  }

  /**
   * Check if a single link is valid.
   */
  private async checkLink(url: string): Promise<boolean> {
    // For relative URLs, assume valid (would need base URL to check)
    if (url.startsWith('/')) {
      return true;
    }

    try {
      // Use AbortController for timeout
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 5000);

      const response = await fetch(url, {
        method: 'HEAD',
        signal: controller.signal,
        redirect: 'follow',
      });

      clearTimeout(timeout);
      return response.ok;
    } catch {
      // Network error or timeout
      return false;
    }
  }

  // ===========================================================================
  // Plagiarism Detection
  // ===========================================================================

  /**
   * Check content for plagiarism against existing content.
   */
  checkPlagiarism(content: string, existingHashes: string[]): PlagiarismResult {
    const plainText = this.stripHtml(content);
    const contentHash = this.generateContentHash(plainText);
    const matches: Array<{ source: string; similarity: number }> = [];

    // Compare against existing content hashes
    for (const existingHash of existingHashes) {
      const similarity = this.calculateSimilarity(contentHash, existingHash);
      if (similarity > 0.1) {
        // More than 10% similar
        matches.push({ source: 'existing_content', similarity });
      }
    }

    // Find highest similarity
    const maxSimilarity = matches.length > 0
      ? Math.max(...matches.map((m) => m.similarity))
      : 0;

    return {
      passed: maxSimilarity < PLAGIARISM_THRESHOLD,
      similarity: maxSimilarity,
      matches,
    };
  }

  /**
   * Generate a content hash for comparison.
   */
  generateContentHash(text: string): string {
    // Normalize text
    const normalized = text
      .toLowerCase()
      .replace(/\s+/g, ' ')
      .replace(/[^\w\s]/g, '')
      .trim();

    // Generate n-grams (3-word sequences)
    const words = normalized.split(' ');
    const ngrams: string[] = [];
    for (let i = 0; i < words.length - 2; i++) {
      ngrams.push(`${words[i]} ${words[i + 1]} ${words[i + 2]}`);
    }

    // Create hash from sorted unique n-grams
    return ngrams.sort().join('|');
  }

  /**
   * Calculate similarity between two content hashes.
   */
  private calculateSimilarity(hash1: string, hash2: string): number {
    const ngrams1 = new Set(hash1.split('|'));
    const ngrams2 = new Set(hash2.split('|'));

    if (ngrams1.size === 0 || ngrams2.size === 0) {
      return 0;
    }

    // Calculate Jaccard similarity
    let intersection = 0;
    for (const ngram of ngrams1) {
      if (ngrams2.has(ngram)) {
        intersection++;
      }
    }

    const union = ngrams1.size + ngrams2.size - intersection;
    return union > 0 ? intersection / union : 0;
  }

  // ===========================================================================
  // Pre-Approval Check (Synchronous)
  // ===========================================================================

  /**
   * Quick pre-approval check without async operations.
   */
  checkPreApproval(content: ContentForQA, options: QACheckOptions): {
    canSubmit: boolean;
    errors: string[];
    warnings: string[];
  } {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Run SEO validation
    const seoResult = this.seoValidator.validate(content, {
      language: options.language,
      contentType: options.contentType,
    });

    // Run compliance check
    const complianceResult = this.complianceChecker.checkContent(content.content, {
      language: options.language,
    });

    // Collect errors
    errors.push(...seoResult.errors);
    const complianceErrors = complianceResult.violations
      .filter((v) => v.severity === 'error')
      .map((v) => v.message);
    errors.push(...complianceErrors);

    // Collect warnings
    warnings.push(...seoResult.warnings);
    const complianceWarnings = complianceResult.violations
      .filter((v) => v.severity === 'warning')
      .map((v) => v.message);
    warnings.push(...complianceWarnings);
    warnings.push(...complianceResult.warnings);

    // Check language
    if (!['nl', 'en'].includes(options.language)) {
      errors.push('Invalid language - must be "nl" or "en"');
    }

    return {
      canSubmit: errors.length === 0,
      errors: [...new Set(errors)],
      warnings: [...new Set(warnings)],
    };
  }

  // ===========================================================================
  // Helper Methods
  // ===========================================================================

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

  // ===========================================================================
  // Utility Methods
  // ===========================================================================

  /**
   * Get the SEO validator instance.
   */
  getSEOValidator(): SEOValidatorService {
    return this.seoValidator;
  }

  /**
   * Get the compliance checker instance.
   */
  getComplianceChecker(): ComplianceCheckerService {
    return this.complianceChecker;
  }
}

// =============================================================================
// Factory Function
// =============================================================================

/**
 * Create a quality assurance service.
 */
export function createQualityAssurance(
  seoValidator?: SEOValidatorService,
  complianceChecker?: ComplianceCheckerService
): QualityAssuranceService {
  return new QualityAssuranceService(seoValidator, complianceChecker);
}
