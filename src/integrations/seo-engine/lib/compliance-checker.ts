/**
 * SEO Content Engine - Compliance Checker
 *
 * Validates financial content for regulatory compliance and brand safety.
 */

import {
  SITE_DISCLAIMER,
  POST_DISCLAIMER,
  PROHIBITED_PATTERNS,
  TONE_VIOLATIONS,
  QUALIFICATION_PHRASES,
} from '../constants';
import type { Language, ComplianceViolation, ComplianceCheckResult } from '../types';

// =============================================================================
// Types
// =============================================================================

export interface ComplianceCheckOptions {
  language: Language;
  checkDisclaimer?: boolean;
  checkProhibitedClaims?: boolean;
  checkTone?: boolean;
  checkRiskControls?: boolean;
}

// =============================================================================
// Compliance Checker Service
// =============================================================================

export class ComplianceCheckerService {
  // ===========================================================================
  // Main Check Method
  // ===========================================================================

  /**
   * Run all compliance checks on content.
   */
  checkContent(
    content: string,
    options: ComplianceCheckOptions
  ): ComplianceCheckResult {
    const violations: ComplianceViolation[] = [];
    const warnings: string[] = [];
    const suggestions: string[] = [];

    const {
      language,
      checkDisclaimer = true,
      checkProhibitedClaims = true,
      checkTone = true,
      checkRiskControls = true,
    } = options;

    // Run checks
    if (checkDisclaimer) {
      const disclaimerResult = this.checkDisclaimer(content, language);
      violations.push(...disclaimerResult.violations);
      warnings.push(...disclaimerResult.warnings);
      suggestions.push(...disclaimerResult.suggestions);
    }

    if (checkProhibitedClaims) {
      const claimsResult = this.checkProhibitedClaims(content);
      violations.push(...claimsResult.violations);
      warnings.push(...claimsResult.warnings);
      suggestions.push(...claimsResult.suggestions);
    }

    if (checkTone) {
      const toneResult = this.checkTone(content);
      violations.push(...toneResult.violations);
      warnings.push(...toneResult.warnings);
      suggestions.push(...toneResult.suggestions);
    }

    if (checkRiskControls) {
      const riskResult = this.checkRiskControls(content, language);
      violations.push(...riskResult.violations);
      warnings.push(...riskResult.warnings);
      suggestions.push(...riskResult.suggestions);
    }

    // Determine if passed (no error-level violations)
    const hasErrors = violations.some((v) => v.severity === 'error');

    return {
      passed: !hasErrors,
      violations,
      warnings: [...new Set(warnings)], // Deduplicate
      suggestions: [...new Set(suggestions)],
      checkedAt: new Date().toISOString(),
    };
  }

  // ===========================================================================
  // Disclaimer Checks
  // ===========================================================================

  /**
   * Check for required disclaimers.
   */
  checkDisclaimer(
    content: string,
    language: Language
  ): { violations: ComplianceViolation[]; warnings: string[]; suggestions: string[] } {
    const violations: ComplianceViolation[] = [];
    const warnings: string[] = [];
    const suggestions: string[] = [];

    // Handle invalid language
    const validLanguage = language === 'nl' || language === 'en' ? language : 'nl';
    const postDisclaimer = POST_DISCLAIMER[validLanguage];

    // Check for post disclaimer at end of content
    const contentLower = content.toLowerCase();
    const disclaimerLower = postDisclaimer.toLowerCase();

    // Check if disclaimer is present (allow for minor variations)
    const hasDisclaimer = this.fuzzyMatch(contentLower, disclaimerLower, 0.8);

    if (!hasDisclaimer) {
      violations.push({
        type: 'missing_disclaimer',
        message: validLanguage === 'nl'
          ? 'Verplichte disclaimer ontbreekt aan het einde van het artikel'
          : 'Required disclaimer missing at end of article',
        severity: 'error',
        location: 'end of content',
        suggestion: validLanguage === 'nl'
          ? `Voeg de volgende disclaimer toe: "${postDisclaimer}"`
          : `Add the following disclaimer: "${postDisclaimer}"`,
      });
    }

    // Check disclaimer position (should be near the end)
    if (hasDisclaimer) {
      const disclaimerPos = contentLower.lastIndexOf('disclaimer');
      const contentLength = content.length;
      if (disclaimerPos > 0 && disclaimerPos < contentLength * 0.7) {
        warnings.push(
          validLanguage === 'nl'
            ? 'Disclaimer staat niet aan het einde van het artikel'
            : 'Disclaimer is not at the end of the article'
        );
      }
    }

    return { violations, warnings, suggestions };
  }

  // ===========================================================================
  // Prohibited Claims Checks
  // ===========================================================================

  /**
   * Check for prohibited claims and language.
   */
  checkProhibitedClaims(
    content: string
  ): { violations: ComplianceViolation[]; warnings: string[]; suggestions: string[] } {
    const violations: ComplianceViolation[] = [];
    const warnings: string[] = [];
    const suggestions: string[] = [];

    // Check guaranteed returns
    for (const pattern of PROHIBITED_PATTERNS.guaranteedReturns) {
      const match = content.match(pattern);
      if (match) {
        violations.push({
          type: 'guaranteed_returns',
          message: `Prohibited claim detected: "${match[0]}"`,
          severity: 'error',
          location: this.findLocation(content, match[0]),
          suggestion: 'Remove or rephrase to avoid guaranteeing specific returns or savings',
        });
      }
    }

    // Check unqualified promises
    for (const pattern of PROHIBITED_PATTERNS.unqualifiedPromises) {
      const match = content.match(pattern);
      if (match) {
        violations.push({
          type: 'unqualified_promise',
          message: `Unqualified promise detected: "${match[0]}"`,
          severity: 'error',
          location: this.findLocation(content, match[0]),
          suggestion: 'Add qualification phrases like "may", "could", or "typically"',
        });
      }
    }

    // Check investment advice
    for (const pattern of PROHIBITED_PATTERNS.investmentAdvice) {
      const match = content.match(pattern);
      if (match) {
        violations.push({
          type: 'investment_advice',
          message: `Investment recommendation detected: "${match[0]}"`,
          severity: 'error',
          location: this.findLocation(content, match[0]),
          suggestion: 'Remove investment recommendations - this is not permitted without proper licensing',
        });
      }
    }

    // Check urgency language
    for (const pattern of PROHIBITED_PATTERNS.urgency) {
      const match = content.match(pattern);
      if (match) {
        violations.push({
          type: 'urgency_language',
          message: `Urgency language detected: "${match[0]}"`,
          severity: 'warning',
          location: this.findLocation(content, match[0]),
          suggestion: 'Remove urgency-creating language to maintain professional tone',
        });
      }
    }

    // Check absolute statements
    for (const pattern of PROHIBITED_PATTERNS.absoluteStatements) {
      const match = content.match(pattern);
      if (match) {
        violations.push({
          type: 'absolute_statement',
          message: `Absolute statement about tax law: "${match[0]}"`,
          severity: 'error',
          location: this.findLocation(content, match[0]),
          suggestion: 'Add qualification - tax rules may vary based on circumstances',
        });
      }
    }

    // Check superiority claims
    for (const pattern of PROHIBITED_PATTERNS.superiorityClaims) {
      const match = content.match(pattern);
      if (match) {
        violations.push({
          type: 'superiority_claim',
          message: `Superiority claim detected: "${match[0]}"`,
          severity: 'warning',
          location: this.findLocation(content, match[0]),
          suggestion: 'Remove or substantiate superiority claims',
        });
      }
    }

    // Check unqualified expertise
    for (const pattern of PROHIBITED_PATTERNS.unqualifiedExpertise) {
      const match = content.match(pattern);
      if (match) {
        violations.push({
          type: 'unqualified_expertise',
          message: `Unqualified expertise claim: "${match[0]}"`,
          severity: 'warning',
          location: this.findLocation(content, match[0]),
          suggestion: 'Remove or provide evidence for expertise claims',
        });
      }
    }

    // Check speculative content
    for (const pattern of PROHIBITED_PATTERNS.speculative) {
      const match = content.match(pattern);
      if (match) {
        violations.push({
          type: 'speculative_content',
          message: `Speculative investment content: "${match[0]}"`,
          severity: 'error',
          location: this.findLocation(content, match[0]),
          suggestion: 'Remove cryptocurrency and speculative investment content',
        });
      }
    }

    return { violations, warnings, suggestions };
  }

  // ===========================================================================
  // Tone Checks
  // ===========================================================================

  /**
   * Check for tone violations.
   */
  checkTone(
    content: string
  ): { violations: ComplianceViolation[]; warnings: string[]; suggestions: string[] } {
    const violations: ComplianceViolation[] = [];
    const warnings: string[] = [];
    const suggestions: string[] = [];

    // Check exclamation marks (outside of quotes)
    const exclamationPattern = TONE_VIOLATIONS.exclamationMarks;
    const exclamationMatches = content.match(exclamationPattern);
    if (exclamationMatches && exclamationMatches.length > 0) {
      // Filter out those within quotes
      const outsideQuotes = exclamationMatches.filter((m) => {
        const pos = content.indexOf(m);
        const before = content.substring(0, pos);
        const quoteCount = (before.match(/["']/g) || []).length;
        return quoteCount % 2 === 0; // Even = outside quotes
      });

      if (outsideQuotes.length > 0) {
        violations.push({
          type: 'exclamation_marks',
          message: `Exclamation marks found outside quotes (${outsideQuotes.length} occurrence(s))`,
          severity: 'warning',
          suggestion: 'Remove exclamation marks to maintain professional tone',
        });
      }
    }

    // Check rhetorical questions in headlines
    const rhetoricalPattern = TONE_VIOLATIONS.rhetoricalQuestionsInHeadlines;
    if (rhetoricalPattern.test(content)) {
      violations.push({
        type: 'rhetorical_question',
        message: 'Rhetorical question found in headline',
        severity: 'warning',
        suggestion: 'Rephrase headlines as statements rather than questions',
      });
    }

    // Check first-person partnership language
    for (const pattern of TONE_VIOLATIONS.firstPersonPartnership) {
      if (pattern.test(content)) {
        violations.push({
          type: 'first_person_partnership',
          message: 'First-person plural implying partnership detected',
          severity: 'warning',
          suggestion: 'Use neutral language instead of implying partnership with reader',
        });
        break;
      }
    }

    // Check emotional appeals
    for (const pattern of TONE_VIOLATIONS.emotionalAppeals) {
      if (pattern.test(content)) {
        violations.push({
          type: 'emotional_appeal',
          message: 'Emotional appeal or fear-based messaging detected',
          severity: 'warning',
          suggestion: 'Remove emotional appeals and maintain factual, informative tone',
        });
        break;
      }
    }

    // Check for superlatives without substantiation
    const superlatives = this.findSuperlatives(content);
    if (superlatives.length > 0) {
      warnings.push(
        `Found ${superlatives.length} superlative(s) that may need substantiation: ${superlatives.slice(0, 3).join(', ')}`
      );
      suggestions.push('Review superlatives and add supporting evidence where needed');
    }

    return { violations, warnings, suggestions };
  }

  // ===========================================================================
  // Risk Control Checks
  // ===========================================================================

  /**
   * Check risk controls and qualification phrases.
   */
  checkRiskControls(
    content: string,
    language: Language
  ): { violations: ComplianceViolation[]; warnings: string[]; suggestions: string[] } {
    const violations: ComplianceViolation[] = [];
    const warnings: string[] = [];
    const suggestions: string[] = [];

    const contentLower = content.toLowerCase();
    const qualificationPhrases = QUALIFICATION_PHRASES[language];

    // Check if content mentions tax figures
    const hasTaxFigures = /(\d+[.,]?\d*\s*(%|euro|procent)|€\s*\d+[.,]?\d*)/gi.test(content);

    if (hasTaxFigures) {
      // Check for year reference
      const hasYearReference = /20\d{2}/.test(content);
      if (!hasYearReference) {
        warnings.push(
          language === 'nl'
            ? 'Belastingbedragen zonder jaartal referentie'
            : 'Tax figures without year reference'
        );
        suggestions.push(
          language === 'nl'
            ? 'Voeg het relevante belastingjaar toe bij bedragen'
            : 'Add the relevant tax year when mentioning figures'
        );
      }

      // Check for source reference
      const hasSourceReference =
        /belastingdienst|rijksoverheid|overheid|bron|source/gi.test(content);
      if (!hasSourceReference) {
        warnings.push(
          language === 'nl'
            ? 'Belastingbedragen zonder bronvermelding'
            : 'Tax figures without source reference'
        );
        suggestions.push(
          language === 'nl'
            ? 'Verwijs naar officiële bronnen zoals Belastingdienst.nl'
            : 'Reference official sources like government websites'
        );
      }
    }

    // Check for qualification phrases in tax law statements
    const taxLawIndicators = language === 'nl'
      ? ['belastingregel', 'fiscale regel', 'wettelijk', 'verplicht', 'moet u', 'dient u']
      : ['tax rule', 'tax law', 'legally', 'required', 'must', 'shall'];

    const hasTaxLawStatement = taxLawIndicators.some((indicator) =>
      contentLower.includes(indicator.toLowerCase())
    );

    if (hasTaxLawStatement) {
      const hasQualification = qualificationPhrases.some((phrase) =>
        contentLower.includes(phrase.toLowerCase())
      );

      if (!hasQualification) {
        violations.push({
          type: 'missing_qualification',
          message: language === 'nl'
            ? 'Belastingregelgeving genoemd zonder kwalificerende zinnen'
            : 'Tax law statements without qualification phrases',
          severity: 'warning',
          suggestion: language === 'nl'
            ? `Voeg kwalificerende zinnen toe zoals: "${qualificationPhrases.join('", "')}"`
            : `Add qualification phrases such as: "${qualificationPhrases.join('", "')}"`,
        });
      }
    }

    // Check for optimization content
    const optimizationIndicators = language === 'nl'
      ? ['optimalisatie', 'besparen', 'vermijden', 'ontwijken', 'minimaliseren']
      : ['optimization', 'save', 'avoid', 'minimize', 'reduce'];

    const hasOptimizationContent = optimizationIndicators.some((indicator) =>
      contentLower.includes(indicator.toLowerCase())
    );

    if (hasOptimizationContent) {
      // Check for legal boundary clarification
      const legalBoundaryIndicators = language === 'nl'
        ? ['legaal', 'wettelijk toegestaan', 'binnen de wet', 'conform']
        : ['legal', 'lawful', 'within the law', 'compliant'];

      const hasLegalClarification = legalBoundaryIndicators.some((indicator) =>
        contentLower.includes(indicator.toLowerCase())
      );

      if (!hasLegalClarification) {
        warnings.push(
          language === 'nl'
            ? 'Optimalisatie-inhoud zonder vermelding van wettelijke grenzen'
            : 'Optimization content without legal boundary clarification'
        );
        suggestions.push(
          language === 'nl'
            ? 'Verduidelijk dat het gaat om legale optimalisatie binnen wettelijke kaders'
            : 'Clarify that optimization is legal and within regulatory boundaries'
        );
      }
    }

    return { violations, warnings, suggestions };
  }

  // ===========================================================================
  // Helper Methods
  // ===========================================================================

  /**
   * Find approximate location of text in content.
   */
  private findLocation(content: string, text: string): string {
    const index = content.toLowerCase().indexOf(text.toLowerCase());
    if (index === -1) return 'unknown';

    // Count paragraphs before this point
    const before = content.substring(0, index);
    const paragraphs = (before.match(/<\/p>/gi) || []).length + 1;

    return `paragraph ${paragraphs}`;
  }

  /**
   * Fuzzy match two strings (simple similarity check).
   */
  private fuzzyMatch(str1: string, str2: string, threshold: number): boolean {
    // Normalize strings
    const norm1 = str1.replace(/\s+/g, ' ').trim().toLowerCase();
    const norm2 = str2.replace(/\s+/g, ' ').trim().toLowerCase();

    // Check if the disclaimer text (or significant portion) is contained
    if (norm1.includes(norm2) || norm2.includes(norm1)) {
      return true;
    }

    // Check specific key phrases from the disclaimer (must be multi-word phrases)
    const keyPhrases = [
      'disclaimer: dit artikel',
      'disclaimer: this article',
      'uitsluitend bedoeld ter informatie',
      'for informational purposes only',
      'geen persoonlijk advies',
      'does not constitute personal advice',
      'raadpleeg een gekwalificeerde adviseur',
      'consult a qualified advisor',
    ];

    for (const phrase of keyPhrases) {
      if (norm1.includes(phrase.toLowerCase())) {
        return true;
      }
    }

    // Check word overlap as fallback - need significant overlap
    const words2 = norm2.split(' ').filter(w => w.length > 3);
    if (words2.length === 0) return false;

    let matchCount = 0;
    for (const word of words2) {
      if (norm1.includes(word)) {
        matchCount++;
      }
    }

    return matchCount / words2.length >= threshold;
  }

  /**
   * Find superlatives in content.
   */
  private findSuperlatives(content: string): string[] {
    const superlatives: string[] = [];

    // Dutch superlatives
    const dutchPatterns = [
      /\b(beste|grootste|kleinste|hoogste|laagste|meeste|minste|snelste|langzaamste)\b/gi,
      /\b(allereerste|allerbeste|allergrootste)\b/gi,
    ];

    // English superlatives
    const englishPatterns = [
      /\b(best|biggest|smallest|highest|lowest|most|least|fastest|slowest)\b/gi,
      /\b(very best|absolute best)\b/gi,
    ];

    for (const pattern of [...dutchPatterns, ...englishPatterns]) {
      const matches = content.match(pattern);
      if (matches) {
        superlatives.push(...matches);
      }
    }

    return [...new Set(superlatives)];
  }

  // ===========================================================================
  // Utility Methods
  // ===========================================================================

  /**
   * Get the required disclaimer for a language.
   */
  getPostDisclaimer(language: Language): string {
    return POST_DISCLAIMER[language];
  }

  /**
   * Get the site-wide disclaimer for a language.
   */
  getSiteDisclaimer(language: Language): string {
    return SITE_DISCLAIMER[language];
  }

  /**
   * Check if content contains disclaimer.
   */
  hasDisclaimer(content: string, language: Language): boolean {
    const disclaimer = POST_DISCLAIMER[language].toLowerCase();
    const contentLower = content.toLowerCase();
    return this.fuzzyMatch(contentLower, disclaimer, 0.7);
  }

  /**
   * Add disclaimer to content if missing.
   */
  ensureDisclaimer(content: string, language: Language): string {
    if (this.hasDisclaimer(content, language)) {
      return content;
    }

    const disclaimer = POST_DISCLAIMER[language];
    return `${content}\n\n<p><em>${disclaimer}</em></p>`;
  }
}

// =============================================================================
// Factory Function
// =============================================================================

/**
 * Create a compliance checker service.
 */
export function createComplianceChecker(): ComplianceCheckerService {
  return new ComplianceCheckerService();
}
