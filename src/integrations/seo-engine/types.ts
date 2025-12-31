/**
 * SEO Content Engine - Type Definitions
 *
 * This file contains all TypeScript interfaces and types for the SEO content engine.
 * Types are organized by domain: Webflow, Keywords, Content, Approval, Compliance, Performance.
 */

// =============================================================================
// Webflow CMS Types
// =============================================================================

/** Language options for content */
export type Language = 'nl' | 'en';

/** Content status in the approval workflow */
export type ContentStatus = 'draft' | 'pending_review' | 'approved' | 'published' | 'archived';

/** Schema markup type for structured data */
export type SchemaType = 'article' | 'faqpage' | 'article-faq';

/** Webflow CMS field slugs */
export const WEBFLOW_FIELD_SLUGS = {
  NAME: 'name',
  SLUG: 'slug',
  MAIN_IMAGE: 'main-image-2',
  THUMBNAIL_IMAGE: 'thumbnail-image',
  POST_BODY: 'rich-text',
  POST_SUMMARY: 'post-summary',
  FEATURED: 'featured',
  NEXT_POST: 'next-post',
  PREVIOUS_POST: 'previous-post',
  ALT_TEXT: 'alt-text',
  AUTHOR_IMAGE: 'author-image',
  AUTHOR_NAME: 'author-name',
  LANGUAGE: 'language',
  ALTERNATE_LANGUAGE_POST: 'alternate-language-post',
  CONTENT_STATUS: 'content-status',
  SOURCE_KEYWORD: 'source-keyword',
  GENERATION_TIMESTAMP: 'generation-timestamp',
  LAST_REVIEWED_BY: 'last-reviewed-by',
  REVIEW_NOTES: 'review-notes',
  META_TITLE: 'meta-title',
  META_DESCRIPTION: 'meta-description',
  CANONICAL_URL: 'canonical-url',
  SCHEMA_TYPE: 'schema-type',
  THUMBNAIL_ALT_TEXT: 'thumbnail-alt-text',
} as const;

export type WebflowFieldSlug = (typeof WEBFLOW_FIELD_SLUGS)[keyof typeof WEBFLOW_FIELD_SLUGS];

/** Webflow image reference */
export interface WebflowImage {
  fileId: string;
  url: string;
  alt?: string;
}

/** Blog post field data for Webflow CMS */
export interface BlogPostFieldData {
  'name': string;
  'slug': string;
  'main-image-2'?: WebflowImage | null;
  'thumbnail-image'?: WebflowImage | null;
  'rich-text'?: string;
  'post-summary'?: string;
  'featured'?: boolean;
  'next-post'?: string | null;
  'previous-post'?: string | null;
  'alt-text'?: string;
  'author-image'?: WebflowImage | null;
  'author-name'?: string;
  'language': Language;
  'alternate-language-post'?: string | null;
  'content-status': ContentStatus;
  'source-keyword'?: string;
  'generation-timestamp'?: string;
  'last-reviewed-by'?: string;
  'review-notes'?: string;
  'meta-title'?: string;
  'meta-description'?: string;
  'canonical-url'?: string;
  'schema-type'?: SchemaType;
  'thumbnail-alt-text'?: string;
}

/** Webflow CMS item */
export interface WebflowBlogPost {
  id: string;
  cmsLocaleId?: string;
  lastPublished?: string;
  lastUpdated: string;
  createdOn: string;
  isArchived: boolean;
  isDraft: boolean;
  fieldData: BlogPostFieldData;
}

// =============================================================================
// Keyword Types
// =============================================================================

/** Keyword search intent classification */
export type KeywordIntent = 'informational' | 'transactional' | 'local';

/** Keyword status in the discovery queue */
export type KeywordStatus = 'new' | 'approved' | 'in_progress' | 'used' | 'rejected' | 'expired';

/** Discovered keyword */
export interface Keyword {
  id: string;
  keyword: string;
  language: Language;
  intent: KeywordIntent;
  volume: number;
  difficulty: number;
  discoveredAt: string;
  status: KeywordStatus;
  lastUsed?: string;
  createdAt: string;
  updatedAt: string;
}

// =============================================================================
// Content Generation Types
// =============================================================================

/** Content type by length */
export type ContentType = 'short' | 'long' | 'mixed';

/** Content draft */
export interface ContentDraft {
  id: string;
  keywordId: string;
  keyword: string;
  language: Language;
  contentType: ContentType;
  title: string;
  slug: string;
  body: string;
  summary: string;
  metaTitle: string;
  metaDescription: string;
  schemaType: SchemaType;
  status: ContentStatus;
  webflowItemId?: string;
  generatedAt: string;
  createdAt: string;
  updatedAt: string;
}

/** Content revision */
export interface ContentRevision {
  id: string;
  draftId: string;
  version: string;
  changes: string;
  changedBy: string;
  changedAt: string;
}

// =============================================================================
// Approval Workflow Types
// =============================================================================

/** Approval gate in the workflow */
export type ApprovalGate = 'content_editor' | 'compliance_officer' | 'publishing_manager';

/** Action taken at an approval gate */
export type ApprovalAction = 'approve' | 'reject' | 'request_revision' | 'flag_for_legal';

/** Approval log entry */
export interface ApprovalLog {
  id: string;
  draftId: string;
  gate: ApprovalGate;
  action: ApprovalAction;
  reviewerId: string;
  reviewerName: string;
  notes?: string;
  previousStatus: ContentStatus;
  newStatus: ContentStatus;
  createdAt: string;
}

// =============================================================================
// Compliance Types
// =============================================================================

/** Compliance violation severity */
export type ViolationSeverity = 'error' | 'warning';

/** Compliance violation */
export interface ComplianceViolation {
  type: string;
  message: string;
  severity: ViolationSeverity;
  location?: string;
  suggestion?: string;
}

/** Compliance check result */
export interface ComplianceCheckResult {
  passed: boolean;
  violations: ComplianceViolation[];
  warnings: string[];
  suggestions: string[];
  checkedAt: string;
}

// =============================================================================
// SEO Validation Types
// =============================================================================

/** SEO validation result */
export interface SEOValidationResult {
  passed: boolean;
  score: number;
  errors: string[];
  warnings: string[];
  details: {
    titleLength: { value: number; valid: boolean };
    descriptionLength: { value: number; valid: boolean };
    slugFormat: { valid: boolean };
    headingStructure: { valid: boolean; h1Count: number; h2Count: number };
    keywordPresence: { valid: boolean };
    internalLinks: { count: number; valid: boolean };
    externalLinks: { count: number; valid: boolean; invalidDomains: string[] };
    imageAltText: { valid: boolean };
  };
}

// =============================================================================
// Quality Assurance Types
// =============================================================================

/** QA check result */
export interface QACheckResult {
  canSubmit: boolean;
  canPublish: boolean;
  blockingErrors: string[];
  warnings: string[];
  checkResults: {
    seo: SEOValidationResult;
    compliance: ComplianceCheckResult;
    languageCorrectness: { passed: boolean; errors: string[] };
    linkValidation: { passed: boolean; brokenLinks: string[] };
    plagiarism: { passed: boolean; similarity: number };
  };
}

// =============================================================================
// Performance Monitoring Types
// =============================================================================

/** Performance metric for a post */
export interface PerformanceMetric {
  postId: string;
  date: string;
  impressions: number;
  clicks: number;
  position: number;
  ctr: number;
  pageViews: number;
  timeOnPage: number;
  bounceRate: number;
  scrollDepth: number;
  conversions: number;
}

/** Performance report */
export interface PerformanceReport {
  postId: string;
  dateRange: { from: string; to: string };
  metrics: PerformanceMetric[];
  summary: {
    totalImpressions: number;
    totalClicks: number;
    avgPosition: number;
    avgCtr: number;
    trend: 'up' | 'down' | 'stable';
  };
}

// =============================================================================
// Image Generation Types
// =============================================================================

/** Image category */
export type ImageCategory = 'hero' | 'thumbnail' | 'infographic';

/** Generated image */
export interface GeneratedImage {
  url: string;
  altText: string;
  category: ImageCategory;
  width: number;
  height: number;
  assetId?: string;
  generatedAt: string;
}
