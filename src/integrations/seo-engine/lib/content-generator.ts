/**
 * SEO Content Engine - Content Generator
 *
 * AI-powered content generation with SEO optimization and compliance rules.
 */

import { createClient } from '@supabase/supabase-js';
import { contentConfig } from '../config';
import { APPROVED_EXTERNAL_DOMAINS, DUTCH_ACRONYMS, PILLAR_PAGES } from '../constants';
import type { ContentType, Language, SchemaType } from '../types';

// =============================================================================
// Types
// =============================================================================

export interface ContentGenerationOptions {
  keyword: string;
  keywordId: string;
  language: Language;
  contentType?: ContentType;
  relatedKeywords?: string[];
  targetAudience?: string;
}

export interface GeneratedContent {
  title: string;
  slug: string;
  body: string;
  summary: string;
  metaTitle: string;
  metaDescription: string;
  schemaType: SchemaType;
  faqs: FAQ[];
  wordCount: number;
  internalLinks: ContentLink[];
  externalLinks: ContentLink[];
}

export interface FAQ {
  question: string;
  answer: string;
}

export interface ContentLink {
  url: string;
  anchorText: string;
  isExternal: boolean;
}

export interface ContentValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

export interface HeadingStructure {
  level: number;
  text: string;
  position: number;
}

export interface ReadabilityScore {
  fleschDouma: number;
  avgSentenceLength: number;
  avgParagraphLength: number;
  passiveVoicePercent: number;
  valid: boolean;
  issues: string[];
}

export interface ContentPrompt {
  systemPrompt: string;
  userPrompt: string;
}

// =============================================================================
// Content Generator Service
// =============================================================================

export class ContentGeneratorService {
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
  // Content Generation
  // ===========================================================================

  /**
   * Generate content for a keyword.
   * This method builds the prompt and validates the result.
   * The actual AI call should be made by the caller using the returned prompt.
   */
  buildContentPrompt(options: ContentGenerationOptions): ContentPrompt {
    const contentType = options.contentType ?? contentConfig.defaultContentType;
    const wordRange = contentConfig.wordCount[contentType];

    const systemPrompt = this.buildSystemPrompt(options.language);
    const userPrompt = this.buildUserPrompt(options, wordRange);

    return { systemPrompt, userPrompt };
  }

  private buildSystemPrompt(language: Language): string {
    const langName = language === 'nl' ? 'Dutch' : 'English';

    return `You are an expert SEO content writer specializing in Dutch financial advisory topics.

LANGUAGE: Write all content in ${langName}.

ROLE: You write for a Dutch tax and financial advisory firm. Your content helps individuals and businesses understand complex financial topics.

TONE: Professional yet accessible. Explain technical terms when first used. Avoid jargon where simpler words work.

COMPLIANCE RULES:
- Never guarantee specific outcomes or returns
- Do not make promises about tax savings amounts
- Use qualifying language: "may", "could", "typically", "in many cases"
- Reference official sources (Belastingdienst, Rijksoverheid) where appropriate
- MANDATORY: End EVERY article with this exact disclaimer in italics:
  <p><em>Disclaimer: Dit artikel is uitsluitend bedoeld ter informatie en vormt geen persoonlijk financieel, fiscaal of juridisch advies. Fiscale regels en wetgeving kunnen wijzigen. De waarde van beleggingen kan fluctueren en u kunt uw inleg verliezen. Raadpleeg voor uw specifieke situatie altijd een gekwalificeerd financieel adviseur of fiscalist.</em></p>

FORMATTING RULES (Webflow Rich Text compatible):
- Use ONLY these HTML tags: h2, h3, h4, h5, h6, p, blockquote, a, strong, em
- IMPORTANT: Do NOT use ul, ol, or li tags - Webflow API does not support lists properly
- Instead of bullet lists, use multiple short paragraphs with bold intro text:
  <p><strong>Item one:</strong> Description of the first item.</p>
  <p><strong>Item two:</strong> Description of the second item.</p>
- Instead of numbered lists/steps, use h3 subheadings:
  <h3>Stap 1: Bereken je jaarruimte</h3>
  <p>Description of the first step.</p>
  <h3>Stap 2: Kies een pensioenproduct</h3>
  <p>Description of the second step.</p>
- NEVER use: div, span, table, br, hr, ul, ol, li tags
- Keep paragraphs under 100 words
- Keep sentences under 25 words on average

HEADER FORMATTING RULES (Dutch):
- Use SENTENCE CASE for all headers (only capitalize first word and proper nouns)
  CORRECT: "De noodzaak van pensioenopbouw voor ondernemers"
  WRONG: "De Noodzaak Van Pensioenopbouw Voor Ondernemers"
- Keep headers SHORT and punchy (max 6-8 words)
  CORRECT: "Fiscale voordelen"
  WRONG: "Fiscale Voordelen: Jaarruimte En Reserveringsruimte"
- Always write these acronyms in UPPERCASE: ZZP, AOW, FOR, BTW, BV, IB, KVK, UWV
  CORRECT: "ZZP'er", "ZZP", "voor ZZP'ers", "de AOW-leeftijd"
  WRONG: "Zzp'er", "Zzp", "voor Zzp'ers", "de Aow-leeftijd"

SEO RULES:
- Include the primary keyword naturally in the first 100 words
- Use keyword variations throughout the content
- Include descriptive anchor text for links (never "click here")
- Structure content for featured snippets where appropriate

OUTPUT RULES:
- Return ONLY the HTML content, no introduction or explanation
- Do NOT wrap the content in markdown code fences
- Start directly with the first HTML tag (e.g., <p> or <h2>)
- End with the last HTML closing tag
- No text before or after the HTML content`;
  }

  private buildUserPrompt(
    options: ContentGenerationOptions,
    wordRange: { min: number; max: number }
  ): string {
    const { keyword, language, relatedKeywords, targetAudience } = options;
    const langName = language === 'nl' ? 'Dutch' : 'English';

    let prompt = `Write a comprehensive blog post about "${keyword}" in ${langName}.

REQUIREMENTS:
- Word count: ${wordRange.min}-${wordRange.max} words
- Include the keyword "${keyword}" in the first 100 words
- Use at least 2 H2 headings
- Include a conclusion section with H2
- Add 3-5 FAQ questions and answers at the end (before conclusion)

STRUCTURE:
1. Opening paragraph (include keyword)
2. Main content with H2 sections
3. FAQ section (3-5 questions as H3, answers as paragraphs, 40-80 words each)
4. Conclusion (H2)

HEADER EXAMPLES (correct Dutch formatting - sentence case, short, acronyms uppercase):
- H2: "Waarom pensioenopbouw belangrijk is"
- H2: "Fiscale voordelen voor ZZP'ers"
- H2: "De belangrijkste aftrekposten"
- H3: "Stap 1: Bereken je jaarruimte"
- H3: "Wat is de AOW-leeftijd?"
- H3: "Hoe werkt de FOR?"

OUTPUT FORMAT:
- Return ONLY raw HTML content with proper heading tags (h2, h3)
- Do NOT include the h1 tag - that will be added separately
- Do NOT add any introduction, explanation, or commentary
- Do NOT wrap in markdown code fences (\`\`\`html or \`\`\`)
- Start your response directly with the first <p> or <h2> tag
- Include placeholder markers for links:
  - [INTERNAL_LINK:anchor text:topic] for internal links
  - [EXTERNAL_LINK:anchor text:domain] for external links to approved sources`;

    if (relatedKeywords?.length) {
      prompt += `\n\nRELATED KEYWORDS to include naturally: ${relatedKeywords.join(', ')}`;
    }

    if (targetAudience) {
      prompt += `\n\nTARGET AUDIENCE: ${targetAudience}`;
    }

    return prompt;
  }

  // ===========================================================================
  // Content Processing
  // ===========================================================================

  /**
   * Process AI-generated content: validate, add links, extract metadata.
   */
  async processGeneratedContent(
    rawContent: string,
    options: ContentGenerationOptions
  ): Promise<GeneratedContent> {
    const { keyword, language } = options;
    const contentType = options.contentType ?? contentConfig.defaultContentType;

    // Clean the raw AI response first
    const cleanedContent = this.cleanRawContent(rawContent);

    // Generate slug from keyword
    const slug = this.generateSlug(keyword);

    // Extract and validate structure
    const _headings = this.extractHeadings(cleanedContent);
    const faqs = this.extractFAQs(cleanedContent);

    // Process links
    const { body, internalLinks, externalLinks } = await this.processLinks(
      cleanedContent,
      language
    );

    // Generate metadata
    const title = this.generateTitle(keyword, language);
    const summary = this.generateSummary(body, keyword);
    const metaTitle = this.generateMetaTitle(title);
    const metaDescription = this.generateMetaDescription(summary, keyword);

    // Determine schema type
    const schemaType = this.determineSchemaType(faqs.length, contentType);

    // Count words
    const wordCount = this.countWords(body);

    return {
      title,
      slug,
      body,
      summary,
      metaTitle,
      metaDescription,
      schemaType,
      faqs,
      wordCount,
      internalLinks,
      externalLinks,
    };
  }

  /**
   * Clean raw AI-generated content by removing preamble, code fences, and formatting issues.
   */
  private cleanRawContent(rawContent: string): string {
    let content = rawContent;

    // Remove markdown code fences (```html and ```)
    content = content.replace(/```html\s*/gi, '');
    content = content.replace(/```\s*$/gm, '');
    content = content.replace(/```/g, '');

    // Remove common AI preamble patterns (Dutch and English)
    const preamblePatterns = [
      /^.*?(?:hier is|here is|hieronder|below|dit is|this is)[^<]*(?=<)/i,
      /^.*?(?:geschreven volgens|written according|opgemaakt|formatted)[^<]*(?=<)/i,
      /^.*?(?:SEO|geoptimaliseerd|optimized|compliance)[^<]*(?=<)/i,
    ];

    for (const pattern of preamblePatterns) {
      content = content.replace(pattern, '');
    }

    // Extract only the HTML content (from first tag to last closing tag)
    const htmlMatch = content.match(/(<(?:p|h[1-6]|div|ul|ol|section|article)[\s\S]*<\/(?:p|h[1-6]|div|ul|ol|section|article)>)/i);
    if (htmlMatch) {
      content = htmlMatch[1];
    }

    // Clean up whitespace
    content = content.trim();

    // Remove any remaining non-HTML text at the beginning
    const firstTagIndex = content.search(/<[a-z]/i);
    if (firstTagIndex > 0) {
      content = content.substring(firstTagIndex);
    }

    // Remove any text after the last closing tag
    const closingTags = ['</p>', '</h2>', '</h3>', '</h4>', '</h5>', '</h6>', '</div>', '</ul>', '</ol>', '</section>', '</article>'];
    let lastTagEnd = -1;
    for (const tag of closingTags) {
      const idx = content.lastIndexOf(tag);
      if (idx > lastTagEnd) {
        lastTagEnd = idx + tag.length;
      }
    }
    if (lastTagEnd > 0 && lastTagEnd < content.length) {
      content = content.substring(0, lastTagEnd);
    }

    // Sanitize for Webflow Rich Text compatibility
    content = this.sanitizeForWebflow(content);

    // Normalize headers to sentence case and fix acronyms
    content = this.normalizeHeaders(content);

    return content.trim();
  }

  /**
   * Sanitize HTML content for Webflow Rich Text compatibility.
   * Webflow API does NOT support lists (ul, ol, li) - they appear as blank lines.
   * Only supports: h1-h6, p, blockquote, a, strong, em, img
   */
  private sanitizeForWebflow(html: string): string {
    let content = html;

    // Remove unsupported tags but keep their content
    const unsupportedTags = ['div', 'span', 'section', 'article', 'header', 'footer', 'nav', 'aside', 'main', 'table', 'tr', 'td', 'th', 'thead', 'tbody'];
    for (const tag of unsupportedTags) {
      content = content.replace(new RegExp(`<${tag}[^>]*>`, 'gi'), '');
      content = content.replace(new RegExp(`</${tag}>`, 'gi'), '');
    }

    // Convert list items to paragraphs (Webflow API doesn't support lists)
    // First, extract content from li tags and wrap in p tags
    content = content.replace(/<li[^>]*>([\s\S]*?)<\/li>/gi, '<p>• $1</p>');

    // Remove ul/ol wrapper tags
    content = content.replace(/<\/?ul[^>]*>/gi, '');
    content = content.replace(/<\/?ol[^>]*>/gi, '');

    // Replace <br> and <br/> with space
    content = content.replace(/<br\s*\/?>/gi, ' ');

    // Remove <hr> tags
    content = content.replace(/<hr\s*\/?>/gi, '');

    // Clean up empty paragraphs
    content = content.replace(/<p>\s*<\/p>/gi, '');
    content = content.replace(/<p>•\s*<\/p>/gi, '');

    // Normalize whitespace within text (but preserve tag structure)
    content = content.replace(/\s{2,}/g, ' ');

    return content.trim();
  }

  /**
   * Normalize headers to use sentence case and correct Dutch acronyms.
   * Ensures consistent formatting across all generated content.
   */
  private normalizeHeaders(html: string): string {
    // Fix headers: h2, h3, h4, h5, h6 (not h1 - that's added separately)
    return html.replace(/<(h[2-6])>([^<]+)<\/\1>/gi, (match, tag, text) => {
      let normalized = text.trim();

      // Convert to sentence case (lowercase everything first)
      normalized = normalized.toLowerCase();
      // Capitalize first character
      normalized = normalized.charAt(0).toUpperCase() + normalized.slice(1);

      // Fix Dutch acronyms - make ONLY the acronym part uppercase, not suffixes
      for (const acronym of DUTCH_ACRONYMS) {
        // Match acronym with optional suffixes like 'er, 'ers, -leeftijd
        // Capture groups: (acronym)(suffix)
        const regex = new RegExp(`\\b(${acronym})([''][a-z]*|-[a-z]+)?\\b`, 'gi');
        normalized = normalized.replace(regex, (_m: string, acr: string, suffix: string | undefined) => {
          return acr.toUpperCase() + (suffix || '');
        });
      }

      return `<${tag}>${normalized}</${tag}>`;
    });
  }

  // ===========================================================================
  // Validation
  // ===========================================================================

  /**
   * Validate generated content against all rules.
   */
  validateContent(content: GeneratedContent, keyword: string): ContentValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Word count validation
    const { min, max } = this.getWordCountRange(content.wordCount);
    if (content.wordCount < min) {
      errors.push(`Word count ${content.wordCount} is below minimum ${min}`);
    }
    if (content.wordCount > max) {
      warnings.push(`Word count ${content.wordCount} exceeds maximum ${max}`);
    }

    // Heading structure validation
    const headingErrors = this.validateHeadingStructure(content.body);
    errors.push(...headingErrors);

    // Keyword presence validation
    if (!this.keywordInFirstParagraph(content.body, keyword)) {
      errors.push('Primary keyword not found in first 100 words');
    }

    // Keyword density check
    const density = this.calculateKeywordDensity(content.body, keyword);
    if (density > contentConfig.seo.maxKeywordDensity) {
      errors.push(`Keyword density ${(density * 100).toFixed(1)}% exceeds maximum 2%`);
    }

    // Internal links validation
    if (content.internalLinks.length < contentConfig.seo.minInternalLinks) {
      warnings.push(`Only ${content.internalLinks.length} internal links, minimum is ${contentConfig.seo.minInternalLinks}`);
    }

    // External links validation
    if (content.externalLinks.length > contentConfig.seo.maxExternalLinks) {
      errors.push(`${content.externalLinks.length} external links exceed maximum ${contentConfig.seo.maxExternalLinks}`);
    }

    // FAQ validation
    if (content.faqs.length < contentConfig.faq.minQuestions) {
      warnings.push(`Only ${content.faqs.length} FAQs, minimum is ${contentConfig.faq.minQuestions}`);
    }
    if (content.faqs.length > contentConfig.faq.maxQuestions) {
      warnings.push(`${content.faqs.length} FAQs exceed maximum ${contentConfig.faq.maxQuestions}`);
    }

    // Meta validation
    if (content.metaTitle.length > contentConfig.seo.titleMaxLength) {
      errors.push(`Meta title ${content.metaTitle.length} chars exceeds ${contentConfig.seo.titleMaxLength}`);
    }
    if (content.metaDescription.length > contentConfig.seo.descriptionMaxLength) {
      errors.push(`Meta description ${content.metaDescription.length} chars exceeds ${contentConfig.seo.descriptionMaxLength}`);
    }

    // Summary validation - STRICT 140 character limit
    if (content.summary.length > contentConfig.seo.summaryMaxLength) {
      errors.push(`CRITICAL: Summary ${content.summary.length} chars exceeds strict limit of ${contentConfig.seo.summaryMaxLength}`);
    }

    // Banned patterns check
    const bannedPatterns = this.checkBannedPatterns(content.body);
    errors.push(...bannedPatterns);

    return {
      valid: errors.length === 0,
      errors,
      warnings,
    };
  }

  /**
   * Validate heading structure.
   */
  validateHeadingStructure(html: string): string[] {
    const errors: string[] = [];
    const headings = this.extractHeadings(html);

    // Check for minimum H2s
    const h2Count = headings.filter((h) => h.level === 2).length;
    if (h2Count < contentConfig.seo.minH2Headings) {
      errors.push(`Only ${h2Count} H2 headings, minimum is ${contentConfig.seo.minH2Headings}`);
    }

    // Check for skipped levels
    let prevLevel = 1; // Start after H1
    for (const heading of headings) {
      if (heading.level > prevLevel + 1) {
        errors.push(`Skipped heading level: H${prevLevel} to H${heading.level}`);
      }
      prevLevel = heading.level;
    }

    // Check for empty headings
    for (const heading of headings) {
      if (!heading.text.trim()) {
        errors.push(`Empty H${heading.level} heading found`);
      }
    }

    return errors;
  }

  /**
   * Calculate readability score.
   */
  calculateReadability(html: string): ReadabilityScore {
    const text = this.stripHtml(html);
    const sentences = this.extractSentences(text);
    const paragraphs = this.extractParagraphs(html);
    const words = text.split(/\s+/).filter((w) => w.length > 0);

    const avgSentenceLength = words.length / Math.max(sentences.length, 1);
    const avgParagraphLength = words.length / Math.max(paragraphs.length, 1);
    const passiveVoicePercent = this.estimatePassiveVoice(text);

    // Flesch-Douma score (Dutch adaptation of Flesch Reading Ease)
    const syllables = this.countSyllables(text);
    const fleschDouma = 206.835 - 1.015 * avgSentenceLength - 84.6 * (syllables / words.length);

    const issues: string[] = [];
    const { targetFleschDouma, maxSentenceLength, maxParagraphLength, maxPassiveVoicePercent } =
      contentConfig.readability;

    if (fleschDouma < targetFleschDouma.min || fleschDouma > targetFleschDouma.max) {
      issues.push(`Flesch-Douma score ${fleschDouma.toFixed(1)} outside target range ${targetFleschDouma.min}-${targetFleschDouma.max}`);
    }
    if (avgSentenceLength > maxSentenceLength) {
      issues.push(`Average sentence length ${avgSentenceLength.toFixed(1)} exceeds ${maxSentenceLength} words`);
    }
    if (avgParagraphLength > maxParagraphLength) {
      issues.push(`Average paragraph length ${avgParagraphLength.toFixed(1)} exceeds ${maxParagraphLength} words`);
    }
    if (passiveVoicePercent > maxPassiveVoicePercent) {
      issues.push(`Passive voice ${passiveVoicePercent.toFixed(1)}% exceeds ${maxPassiveVoicePercent}%`);
    }

    return {
      fleschDouma,
      avgSentenceLength,
      avgParagraphLength,
      passiveVoicePercent,
      valid: issues.length === 0,
      issues,
    };
  }

  // ===========================================================================
  // Duplicate Detection
  // ===========================================================================

  /**
   * Check if content for this keyword already exists.
   */
  async checkDuplicateKeyword(
    keyword: string,
    language: Language
  ): Promise<{ exists: boolean; draftId?: string }> {
    const client = this.getClient();

    const { data } = await client
      .from('seo_content_drafts')
      .select('id')
      .eq('keyword', keyword)
      .eq('language', language)
      .not('status', 'eq', 'archived')
      .single();

    return {
      exists: data !== null,
      draftId: data?.id,
    };
  }

  /**
   * Calculate content similarity using simple hash comparison.
   */
  calculateContentHash(content: string): string {
    const normalized = content
      .toLowerCase()
      .replace(/\s+/g, ' ')
      .replace(/<[^>]+>/g, '')
      .trim();

    // Simple hash for comparison
    let hash = 0;
    for (let i = 0; i < normalized.length; i++) {
      const char = normalized.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash;
    }
    return hash.toString(16);
  }

  // ===========================================================================
  // Link Processing
  // ===========================================================================

  /**
   * Process link placeholders in content.
   */
  async processLinks(
    html: string,
    language: Language
  ): Promise<{
    body: string;
    internalLinks: ContentLink[];
    externalLinks: ContentLink[];
  }> {
    const internalLinks: ContentLink[] = [];
    const externalLinks: ContentLink[] = [];
    let processedHtml = html;

    // Process internal links
    const internalPattern = /\[INTERNAL_LINK:([^:]+):([^\]]+)\]/g;
    processedHtml = processedHtml.replace(internalPattern, (match, anchor, topic) => {
      const url = this.findInternalLink(topic, language);
      if (url) {
        internalLinks.push({ url, anchorText: anchor, isExternal: false });
        return `<a href="${url}">${anchor}</a>`;
      }
      return anchor; // Just return anchor text if no link found
    });

    // Process external links
    const externalPattern = /\[EXTERNAL_LINK:([^:]+):([^\]]+)\]/g;
    processedHtml = processedHtml.replace(externalPattern, (match, anchor, domain) => {
      if (this.isApprovedDomain(domain)) {
        const url = `https://${domain}`;
        externalLinks.push({ url, anchorText: anchor, isExternal: true });
        return `<a href="${url}" target="_blank" rel="noopener noreferrer">${anchor}</a>`;
      }
      return anchor; // Just return anchor text if domain not approved
    });

    return { body: processedHtml, internalLinks, externalLinks };
  }

  /**
   * Find internal link URL for a topic.
   */
  private findInternalLink(topic: string, _language: Language): string | null {
    const normalizedTopic = topic.toLowerCase().trim();

    // Check pillar pages first
    for (const pillar of PILLAR_PAGES) {
      if (pillar.keyword.toLowerCase().includes(normalizedTopic) ||
          normalizedTopic.includes(pillar.keyword.toLowerCase())) {
        return pillar.slug;
      }
    }

    // Could extend to check existing posts in database
    return null;
  }

  /**
   * Check if domain is approved for external linking.
   */
  private isApprovedDomain(domain: string): boolean {
    const normalizedDomain = domain.toLowerCase().replace(/^www\./, '');
    return APPROVED_EXTERNAL_DOMAINS.some(
      (approved) => normalizedDomain === approved || normalizedDomain.endsWith(`.${approved}`)
    );
  }

  // ===========================================================================
  // Helper Methods
  // ===========================================================================

  private generateSlug(keyword: string): string {
    return keyword
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .substring(0, contentConfig.seo.slugMaxLength);
  }

  private generateTitle(keyword: string, _language: Language): string {
    // Sentence case: capitalize first word only, plus acronyms
    const words = keyword.toLowerCase().split(' ');
    const title = words
      .map((word, index) => {
        // Check if word (without punctuation) is an acronym
        const baseWord = word.replace(/[^a-z]/g, '');
        if (DUTCH_ACRONYMS.includes(baseWord as typeof DUTCH_ACRONYMS[number])) {
          // Preserve punctuation like 'ers in ZZP'ers
          return word.toUpperCase();
        }
        // Capitalize first word only (sentence case)
        if (index === 0) {
          return word.charAt(0).toUpperCase() + word.slice(1);
        }
        return word;
      })
      .join(' ');

    return title.substring(0, contentConfig.seo.titleMaxLength);
  }

  /**
   * Generate post summary.
   * STRICT LIMIT: 140 characters maximum - NEVER exceed this!
   */
  private generateSummary(body: string, keyword: string): string {
    // STRICT: 140 characters max - this is a hard limit that must NEVER be exceeded
    const MAX_LENGTH = contentConfig.seo.summaryMaxLength; // 140

    const text = this.stripHtml(body);
    const sentences = this.extractSentences(text);

    // Find sentences containing the keyword
    const relevantSentences = sentences.filter((s) =>
      s.toLowerCase().includes(keyword.toLowerCase())
    );

    // Start with first relevant sentence, or first sentence if none contain keyword
    const sourceSentences = relevantSentences.length > 0 ? relevantSentences : sentences;

    // Build summary within strict character limit
    let summary = '';
    for (const sentence of sourceSentences) {
      const trimmedSentence = sentence.trim();
      if (!trimmedSentence) continue;

      if (trimmedSentence.length <= MAX_LENGTH) {
        summary = trimmedSentence;
      } else {
        // Truncate at word boundary, leaving room for "..."
        const truncated = trimmedSentence.substring(0, MAX_LENGTH - 3);
        const lastSpace = truncated.lastIndexOf(' ');
        summary = (lastSpace > 50 ? truncated.substring(0, lastSpace) : truncated) + '...';
      }
      break;
    }

    // FINAL SAFETY CHECK: Ensure we NEVER exceed 140 characters
    if (summary.length > MAX_LENGTH) {
      summary = summary.substring(0, MAX_LENGTH - 3) + '...';
    }

    return summary.substring(0, MAX_LENGTH);
  }

  private generateMetaTitle(title: string): string {
    const suffix = ' | Ambition Valley';
    const maxTitleLength = contentConfig.seo.titleMaxLength - suffix.length;
    return title.substring(0, maxTitleLength) + suffix;
  }

  private generateMetaDescription(summary: string, keyword: string): string {
    let description = summary;

    // Ensure keyword is in description
    if (!description.toLowerCase().includes(keyword.toLowerCase())) {
      description = `${keyword}: ${description}`;
    }

    return description.substring(0, contentConfig.seo.descriptionMaxLength);
  }

  private determineSchemaType(faqCount: number, _contentType: ContentType): SchemaType {
    if (faqCount >= 3) {
      return 'article-faq';
    }
    return 'article';
  }

  private countWords(html: string): number {
    const text = this.stripHtml(html);
    return text.split(/\s+/).filter((w) => w.length > 0).length;
  }

  private stripHtml(html: string): string {
    return html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
  }

  private extractHeadings(html: string): HeadingStructure[] {
    const headings: HeadingStructure[] = [];
    const pattern = /<h([2-6])>([^<]*)<\/h\1>/gi;
    let match;
    let position = 0;

    while ((match = pattern.exec(html)) !== null) {
      headings.push({
        level: parseInt(match[1], 10),
        text: match[2].trim(),
        position: position++,
      });
    }

    return headings;
  }

  private extractFAQs(html: string): FAQ[] {
    const faqs: FAQ[] = [];
    // Look for H3 questions followed by paragraphs
    const pattern = /<h3>([^<]*\?)<\/h3>\s*<p>([^<]+)<\/p>/gi;
    let match;

    while ((match = pattern.exec(html)) !== null) {
      faqs.push({
        question: match[1].trim(),
        answer: match[2].trim(),
      });
    }

    return faqs;
  }

  private extractSentences(text: string): string[] {
    return text
      .split(/[.!?]+/)
      .map((s) => s.trim())
      .filter((s) => s.length > 0);
  }

  private extractParagraphs(html: string): string[] {
    const matches = html.match(/<p>([^<]+)<\/p>/gi) || [];
    return matches.map((p) => this.stripHtml(p));
  }

  private keywordInFirstParagraph(html: string, keyword: string): boolean {
    const firstParagraph = html.match(/<p>([^<]+)<\/p>/i);
    if (!firstParagraph) return false;

    const text = this.stripHtml(firstParagraph[1]);
    const words = text.split(/\s+/).slice(0, 100).join(' ');
    return words.toLowerCase().includes(keyword.toLowerCase());
  }

  private calculateKeywordDensity(html: string, keyword: string): number {
    const text = this.stripHtml(html).toLowerCase();
    const words = text.split(/\s+/);
    const keywordWords = keyword.toLowerCase().split(/\s+/);
    const keywordPhrase = keywordWords.join(' ');

    let count = 0;
    for (let i = 0; i <= words.length - keywordWords.length; i++) {
      const phrase = words.slice(i, i + keywordWords.length).join(' ');
      if (phrase === keywordPhrase) count++;
    }

    return count / words.length;
  }

  private checkBannedPatterns(html: string): string[] {
    const errors: string[] = [];
    const text = this.stripHtml(html);

    // Check for placeholder text
    const placeholders = ['lorem ipsum', 'todo', 'xxx', '[insert', '{insert'];
    for (const placeholder of placeholders) {
      if (text.toLowerCase().includes(placeholder)) {
        errors.push(`Placeholder text found: "${placeholder}"`);
      }
    }

    // Check for plain URLs (not in href)
    const plainUrlPattern = /(?<!href=["'])(https?:\/\/[^\s<>"]+)/gi;
    if (plainUrlPattern.test(html)) {
      errors.push('Plain text URL found - should be wrapped in anchor tag');
    }

    // Check for duplicate paragraphs
    const paragraphs = this.extractParagraphs(html);
    const seen = new Set<string>();
    for (const p of paragraphs) {
      const normalized = p.toLowerCase().trim();
      if (normalized.length > 50 && seen.has(normalized)) {
        errors.push('Duplicate paragraph found');
        break;
      }
      seen.add(normalized);
    }

    return errors;
  }

  private countSyllables(text: string): number {
    // Simplified syllable counting for Dutch/English
    const words = text.toLowerCase().split(/\s+/);
    let count = 0;

    for (const word of words) {
      // Count vowel groups
      const vowelGroups = word.match(/[aeiouyàáâäèéêëìíîïòóôöùúûü]+/gi) || [];
      count += Math.max(vowelGroups.length, 1);
    }

    return count;
  }

  private estimatePassiveVoice(text: string): number {
    // Dutch passive indicators: "wordt", "werden", "is gemaakt", "zijn gemaakt"
    // English passive indicators: "is/are/was/were + past participle"
    const passivePatterns = [
      /\b(wordt|worden|werd|werden)\b/gi,
      /\b(is|are|was|were)\s+\w+ed\b/gi,
      /\b(is|wordt)\s+ge\w+d\b/gi,
    ];

    const sentences = this.extractSentences(text);
    let passiveCount = 0;

    for (const sentence of sentences) {
      for (const pattern of passivePatterns) {
        if (pattern.test(sentence)) {
          passiveCount++;
          break;
        }
      }
    }

    return (passiveCount / Math.max(sentences.length, 1)) * 100;
  }

  private getWordCountRange(wordCount: number): { min: number; max: number } {
    // Determine which content type this word count fits
    for (const [_type, range] of Object.entries(contentConfig.wordCount)) {
      if (wordCount >= range.min - 100 && wordCount <= range.max + 100) {
        return range;
      }
    }
    return contentConfig.wordCount.mixed;
  }
}

// =============================================================================
// Factory Function
// =============================================================================

export function createContentGenerator(
  supabaseUrl: string,
  supabaseKey: string
): ContentGeneratorService {
  return new ContentGeneratorService(supabaseUrl, supabaseKey);
}
