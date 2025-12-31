/**
 * SEO Content Engine - Constants
 *
 * Static constants including disclaimers, compliance rules, and approved domains.
 */

// =============================================================================
// Disclaimers
// =============================================================================

/** Site-wide disclaimer (footer) */
export const SITE_DISCLAIMER = {
  nl: `De informatie op deze website is uitsluitend bedoeld voor algemene informatieve doeleinden en vormt geen persoonlijk financieel, fiscaal of juridisch advies. AmbitionValley is geen financiele instelling en verricht geen financiele transacties. Raadpleeg altijd een gekwalificeerde adviseur voordat u financiele beslissingen neemt.`,
  en: `The information on this website is intended for general informational purposes only and does not constitute personal financial, tax, or legal advice. AmbitionValley is not a financial institution and does not perform financial transactions. Always consult a qualified advisor before making financial decisions.`,
} as const;

/** Per-post disclaimer (end of article) */
export const POST_DISCLAIMER = {
  nl: `Disclaimer: Dit artikel is uitsluitend bedoeld ter informatie en vormt geen persoonlijk advies. De genoemde bedragen, regelingen en percentages kunnen wijzigen. Raadpleeg een gekwalificeerde adviseur voor uw specifieke situatie.`,
  en: `Disclaimer: This article is for informational purposes only and does not constitute personal advice. The amounts, regulations, and percentages mentioned are subject to change. Consult a qualified advisor for your specific situation.`,
} as const;

// =============================================================================
// Prohibited Claims Patterns
// =============================================================================

/** Patterns that must be blocked during content generation */
export const PROHIBITED_PATTERNS = {
  /** Guaranteed returns or savings */
  guaranteedReturns: [
    /gegarandeerde?\s+besparing/gi,
    /guaranteed\s+savings?/gi,
    /gegarandeerd\s+rendement/gi,
    /guaranteed\s+returns?/gi,
  ],

  /** Specific promises without qualification */
  unqualifiedPromises: [
    /u\s+bespaart\s+exact\s+\d/gi,
    /you\s+will\s+save\s+exactly\s+\d/gi,
    /altijd\s+\d+%\s+besparing/gi,
  ],

  /** Investment recommendations */
  investmentAdvice: [
    /investeer\s+in/gi,
    /invest\s+in/gi,
    /buy\s+this\s+stock/gi,
    /koop\s+deze\s+aandelen/gi,
  ],

  /** Urgency language */
  urgency: [
    /nu\s+handelen/gi,
    /act\s+now/gi,
    /limited\s+time/gi,
    /beperkte\s+tijd/gi,
    /alleen\s+vandaag/gi,
    /today\s+only/gi,
  ],

  /** Absolute statements about tax law */
  absoluteStatements: [
    /altijd\s+aftrekbaar/gi,
    /always\s+(allowed|deductible)/gi,
    /nooit\s+belasting/gi,
    /never\s+pay\s+tax/gi,
  ],

  /** Superiority claims */
  superiorityClaims: [
    /de\s+beste\s+adviseur/gi,
    /the\s+best\s+advisor/gi,
    /nummer\s+1\s+in/gi,
    /number\s+1\s+in/gi,
  ],

  /** Unqualified expertise */
  unqualifiedExpertise: [
    /wij\s+zijn\s+de\s+beste/gi,
    /we\s+are\s+the\s+best/gi,
    /onze\s+experts\s+garanderen/gi,
  ],

  /** Crypto and speculative investments */
  speculative: [
    /cryptocurrency/gi,
    /bitcoin/gi,
    /crypto\s+investering/gi,
    /nft/gi,
    /meme\s+stock/gi,
  ],
} as const;

// =============================================================================
// Approved External Domains
// =============================================================================

/** Domains allowed for external links */
export const APPROVED_EXTERNAL_DOMAINS = [
  'belastingdienst.nl',
  'rijksoverheid.nl',
  'kvk.nl',
  'cbs.nl',
  'nibud.nl',
  'afm.nl',
  'dnb.nl',
] as const;

// =============================================================================
// Tone Restrictions
// =============================================================================

/** Patterns that violate tone restrictions */
export const TONE_VIOLATIONS = {
  /** Exclamation marks (except in quotes) */
  exclamationMarks: /(?<!["'])[^"']*!(?!["'])/g,

  /** Rhetorical questions in headlines */
  rhetoricalQuestionsInHeadlines: /<h[1-6][^>]*>.*\?.*<\/h[1-6]>/gi,

  /** First-person plural implying partnership */
  firstPersonPartnership: [
    /wij\s+helpen\s+u/gi,
    /we\s+help\s+you/gi,
    /samen\s+besparen/gi,
    /together\s+we\s+save/gi,
  ],

  /** Emotional appeals */
  emotionalAppeals: [
    /maak\s+je\s+geen\s+zorgen/gi,
    /don't\s+worry/gi,
    /wees\s+niet\s+bang/gi,
    /don't\s+be\s+afraid/gi,
  ],
} as const;

// =============================================================================
// Risk Control Phrases
// =============================================================================

/** Required qualification phrases for tax-related content */
export const QUALIFICATION_PHRASES = {
  nl: [
    'volgens de huidige regelgeving',
    'onder voorbehoud van wijzigingen',
    'raadpleeg een adviseur',
    'afhankelijk van uw situatie',
  ],
  en: [
    'according to current regulations',
    'subject to change',
    'consult an advisor',
    'depending on your situation',
  ],
} as const;

// =============================================================================
// Author Configuration
// =============================================================================

/** Default author for generated content */
export const DEFAULT_AUTHOR = {
  name: 'AmbitionValley Redactie',
  image: null, // Set to asset ID when available
} as const;

// =============================================================================
// Schema Markup Templates
// =============================================================================

/** Article schema template */
export const ARTICLE_SCHEMA_TEMPLATE = {
  '@context': 'https://schema.org',
  '@type': 'Article',
  publisher: {
    '@type': 'Organization',
    name: 'AmbitionValley',
    logo: {
      '@type': 'ImageObject',
      url: 'https://ambitionvalley.nl/logo.png',
    },
  },
} as const;

/** FAQ schema template */
export const FAQ_SCHEMA_TEMPLATE = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
} as const;

// =============================================================================
// Pillar Pages for Internal Linking
// =============================================================================

/** Pillar pages for internal linking */
export const PILLAR_PAGES = [
  { slug: '/diensten/belastingadvies', keyword: 'belastingadvies' },
  { slug: '/diensten/fiscale-planning', keyword: 'fiscale planning' },
  { slug: '/diensten/vermogensadvies', keyword: 'vermogensadvies' },
  { slug: '/diensten/ondernemersadvies', keyword: 'ondernemer' },
] as const;
