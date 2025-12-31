/**
 * SEO Content Engine - Configuration
 *
 * Central configuration for the SEO content engine integration.
 */

import type { ContentType, Language } from './types';

// =============================================================================
// Webflow API Configuration
// =============================================================================

export const webflowConfig = {
  /** Base URL for Webflow API v2 */
  baseUrl: 'https://api.webflow.com/v2',

  /** Rate limits */
  rateLimit: {
    requestsPerMinute: 60,
    requestsPerHour: 1000,
    publishPerMinute: 1,
  },

  /** Retry configuration */
  retry: {
    maxRetries: 5,
    initialDelayMs: 1000,
    maxDelayMs: 60000,
    jitterMs: 500,
  },

  /** Bulk operation limits */
  bulk: {
    maxItemsPerRequest: 100,
  },

  /** Required scopes */
  requiredScopes: ['cms:read', 'cms:write', 'assets:read', 'assets:write'],
} as const;

// =============================================================================
// Content Generation Configuration
// =============================================================================

export const contentConfig = {
  /** Word count ranges by content type */
  wordCount: {
    short: { min: 600, max: 900 },
    long: { min: 1500, max: 2500 },
    mixed: { min: 1000, max: 1500 },
  } satisfies Record<ContentType, { min: number; max: number }>,

  /** Default content type */
  defaultContentType: 'mixed' as ContentType,

  /** SEO constraints */
  seo: {
    titleMaxLength: 60,
    descriptionMaxLength: 160,
    slugMaxLength: 75,
    altTextMaxLength: 125,
    minH2Headings: 2,
    minInternalLinks: 2,
    maxInternalLinksPerThousandWords: 5,
    maxExternalLinks: 3,
    maxKeywordDensity: 0.02,
  },

  /** FAQ constraints */
  faq: {
    minQuestions: 3,
    maxQuestions: 7,
    answerMinWords: 40,
    answerMaxWords: 80,
  },

  /** Readability constraints */
  readability: {
    targetFleschDouma: { min: 50, max: 60 },
    maxSentenceLength: 25,
    maxParagraphLength: 100,
    maxPassiveVoicePercent: 15,
  },
} as const;

// =============================================================================
// Image Generation Configuration
// =============================================================================

export const imageConfig = {
  /** Image dimensions by category */
  dimensions: {
    hero: { width: 1200, height: 630, aspectRatio: '1.91:1' },
    thumbnail: { width: 600, height: 400, aspectRatio: '3:2' },
    infographic: { width: 800, height: 1200, aspectRatio: '2:3' },
  },

  /** Maximum file sizes in bytes */
  maxFileSize: {
    hero: 200 * 1024,
    thumbnail: 100 * 1024,
    infographic: 300 * 1024,
  },

  /** Style guidelines */
  style: {
    primaryColor: '#1062eb',
    backgroundColor: '#ffffff',
    accentColors: ['#f0f4ff', '#e5e7eb'],
  },
} as const;

// =============================================================================
// Approval Workflow Configuration
// =============================================================================

export const approvalConfig = {
  /** Maximum revision attempts before escalation */
  maxRevisions: 3,

  /** Approval gates in order */
  gates: ['content_editor', 'compliance_officer', 'publishing_manager'] as const,

  /** Audit log retention in months */
  auditLogRetentionMonths: 36,
} as const;

// =============================================================================
// Keyword Discovery Configuration
// =============================================================================

export const keywordConfig = {
  /** Supported languages */
  languages: ['nl', 'en'] as Language[],

  /** Primary language */
  primaryLanguage: 'nl' as Language,

  /** Keyword retention in months */
  retentionMonths: 24,

  /** Discovery schedule (cron expressions) */
  schedule: {
    daily: '0 6 * * *', // 06:00 CET daily
    weeklyDeep: '0 5 * * 1', // 05:00 CET every Monday
    monthlyReport: '0 6 1 * *', // 06:00 CET first day of month
  },

  /** Focus categories for Dutch financial advisory */
  categories: [
    'belastingadvies',
    'fiscale planning',
    'vermogensadvies',
    'ondernemersaftrek',
    'box 3',
    'belastingaangifte',
    'btw',
    'loonheffing',
    'pensioenopbouw',
  ],
} as const;

// =============================================================================
// Performance Monitoring Configuration
// =============================================================================

export const performanceConfig = {
  /** Data sync schedule */
  syncSchedule: '0 7 * * *', // 07:00 CET daily

  /** Content update triggers */
  updateTriggers: {
    ageMonths: 6,
    trafficDeclinePercent: 20,
  },

  /** Version retention in months */
  versionRetentionMonths: 24,
} as const;

// =============================================================================
// Environment Variables
// =============================================================================

/** Get required environment variable */
export function getEnvVar(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

/** Get optional environment variable with default */
export function getEnvVarOptional(name: string, defaultValue: string): string {
  return process.env[name] || defaultValue;
}

/** Environment variable names */
export const ENV_VARS = {
  WEBFLOW_API_TOKEN: 'WEBFLOW_API_TOKEN',
  WEBFLOW_SITE_ID: 'WEBFLOW_SITE_ID',
  WEBFLOW_COLLECTION_ID: 'WEBFLOW_COLLECTION_ID',
  GEMINI_API_KEY: 'GEMINI_API_KEY',
  GOOGLE_SEARCH_CONSOLE_CREDENTIALS: 'GOOGLE_SEARCH_CONSOLE_CREDENTIALS',
} as const;
