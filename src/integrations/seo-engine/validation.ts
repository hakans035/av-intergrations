/**
 * SEO Content Engine - Validation Schemas
 *
 * Zod schemas for runtime validation of all data structures.
 */

import { z } from 'zod';

// =============================================================================
// Base Types
// =============================================================================

export const languageSchema = z.enum(['nl', 'en']);

export const contentStatusSchema = z.enum([
  'draft',
  'pending_review',
  'approved',
  'published',
  'archived',
]);

export const schemaTypeSchema = z.enum(['article', 'faqpage', 'article-faq']);

export const contentTypeSchema = z.enum(['short', 'long', 'mixed']);

export const keywordIntentSchema = z.enum(['informational', 'transactional', 'local']);

export const keywordStatusSchema = z.enum([
  'new',
  'approved',
  'in_progress',
  'used',
  'rejected',
  'expired',
]);

export const approvalGateSchema = z.enum([
  'content_editor',
  'compliance_officer',
  'publishing_manager',
]);

export const approvalActionSchema = z.enum([
  'approve',
  'reject',
  'request_revision',
  'flag_for_legal',
]);

export const violationSeveritySchema = z.enum(['error', 'warning']);

export const imageCategorySchema = z.enum(['hero', 'thumbnail', 'infographic']);

// =============================================================================
// Webflow CMS Schemas
// =============================================================================

export const webflowImageSchema = z.object({
  fileId: z.string(),
  url: z.string().url(),
  alt: z.string().optional(),
});

export const blogPostFieldDataSchema = z.object({
  name: z.string().min(1).max(60),
  slug: z.string().min(1).max(75).regex(/^[a-z0-9-]+$/),
  'main-image-2': webflowImageSchema.nullable().optional(),
  'thumbnail-image': webflowImageSchema.nullable().optional(),
  'rich-text': z.string().optional(),
  'post-summary': z.string().max(160).optional(),
  featured: z.boolean().optional(),
  'next-post': z.string().nullable().optional(),
  'previous-post': z.string().nullable().optional(),
  'alt-text': z.string().max(125).optional(),
  'author-image': webflowImageSchema.nullable().optional(),
  'author-name': z.string().optional(),
  language: languageSchema,
  'alternate-language-post': z.string().nullable().optional(),
  'content-status': contentStatusSchema,
  'source-keyword': z.string().optional(),
  'generation-timestamp': z.string().datetime().optional(),
  'last-reviewed-by': z.string().optional(),
  'review-notes': z.string().optional(),
  'meta-title': z.string().max(60).optional(),
  'meta-description': z.string().max(160).optional(),
  'canonical-url': z.string().url().optional().or(z.literal('')),
  'schema-type': schemaTypeSchema.optional(),
  'thumbnail-alt-text': z.string().max(125).optional(),
});

export const webflowBlogPostSchema = z.object({
  id: z.string(),
  cmsLocaleId: z.string().optional(),
  lastPublished: z.string().datetime().optional(),
  lastUpdated: z.string().datetime(),
  createdOn: z.string().datetime(),
  isArchived: z.boolean(),
  isDraft: z.boolean(),
  fieldData: blogPostFieldDataSchema,
});

// =============================================================================
// Keyword Schemas
// =============================================================================

export const keywordSchema = z.object({
  id: z.string(),
  keyword: z.string().min(1),
  language: languageSchema,
  intent: keywordIntentSchema,
  volume: z.number().int().min(0),
  difficulty: z.number().min(0).max(100),
  discoveredAt: z.string().datetime(),
  status: keywordStatusSchema,
  lastUsed: z.string().datetime().optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export const keywordCreateSchema = keywordSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const keywordUpdateSchema = keywordSchema.partial().omit({
  id: true,
  createdAt: true,
});

// =============================================================================
// Content Schemas
// =============================================================================

export const contentDraftSchema = z.object({
  id: z.string(),
  keywordId: z.string(),
  keyword: z.string(),
  language: languageSchema,
  contentType: contentTypeSchema,
  title: z.string().min(1).max(60),
  slug: z.string().min(1).max(75).regex(/^[a-z0-9-]+$/),
  body: z.string().min(1),
  summary: z.string().max(160),
  metaTitle: z.string().max(60),
  metaDescription: z.string().max(160),
  schemaType: schemaTypeSchema,
  status: contentStatusSchema,
  webflowItemId: z.string().optional(),
  generatedAt: z.string().datetime(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export const contentDraftCreateSchema = contentDraftSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const contentRevisionSchema = z.object({
  id: z.string(),
  draftId: z.string(),
  version: z.string().regex(/^v\d+\.\d+$/),
  changes: z.string(),
  changedBy: z.string(),
  changedAt: z.string().datetime(),
});

// =============================================================================
// Approval Schemas
// =============================================================================

export const approvalLogSchema = z.object({
  id: z.string(),
  draftId: z.string(),
  gate: approvalGateSchema,
  action: approvalActionSchema,
  reviewerId: z.string(),
  reviewerName: z.string(),
  notes: z.string().optional(),
  previousStatus: contentStatusSchema,
  newStatus: contentStatusSchema,
  createdAt: z.string().datetime(),
});

export const approvalLogCreateSchema = approvalLogSchema.omit({
  id: true,
  createdAt: true,
});

// =============================================================================
// Compliance Schemas
// =============================================================================

export const complianceViolationSchema = z.object({
  type: z.string(),
  message: z.string(),
  severity: violationSeveritySchema,
  location: z.string().optional(),
  suggestion: z.string().optional(),
});

export const complianceCheckResultSchema = z.object({
  passed: z.boolean(),
  violations: z.array(complianceViolationSchema),
  warnings: z.array(z.string()),
  suggestions: z.array(z.string()),
  checkedAt: z.string().datetime(),
});

// =============================================================================
// SEO Validation Schemas
// =============================================================================

export const seoValidationResultSchema = z.object({
  passed: z.boolean(),
  score: z.number().min(0).max(100),
  errors: z.array(z.string()),
  warnings: z.array(z.string()),
  details: z.object({
    titleLength: z.object({ value: z.number(), valid: z.boolean() }),
    descriptionLength: z.object({ value: z.number(), valid: z.boolean() }),
    slugFormat: z.object({ valid: z.boolean() }),
    headingStructure: z.object({
      valid: z.boolean(),
      h1Count: z.number(),
      h2Count: z.number(),
    }),
    keywordPresence: z.object({ valid: z.boolean() }),
    internalLinks: z.object({ count: z.number(), valid: z.boolean() }),
    externalLinks: z.object({
      count: z.number(),
      valid: z.boolean(),
      invalidDomains: z.array(z.string()),
    }),
    imageAltText: z.object({ valid: z.boolean() }),
  }),
});

// =============================================================================
// QA Schemas
// =============================================================================

export const qaCheckResultSchema = z.object({
  canSubmit: z.boolean(),
  canPublish: z.boolean(),
  blockingErrors: z.array(z.string()),
  warnings: z.array(z.string()),
  checkResults: z.object({
    seo: seoValidationResultSchema,
    compliance: complianceCheckResultSchema,
    languageCorrectness: z.object({
      passed: z.boolean(),
      errors: z.array(z.string()),
    }),
    linkValidation: z.object({
      passed: z.boolean(),
      brokenLinks: z.array(z.string()),
    }),
    plagiarism: z.object({
      passed: z.boolean(),
      similarity: z.number().min(0).max(100),
    }),
  }),
});

// =============================================================================
// Performance Schemas
// =============================================================================

export const performanceMetricSchema = z.object({
  postId: z.string(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  impressions: z.number().int().min(0),
  clicks: z.number().int().min(0),
  position: z.number().min(0),
  ctr: z.number().min(0).max(100),
  pageViews: z.number().int().min(0),
  timeOnPage: z.number().min(0),
  bounceRate: z.number().min(0).max(100),
  scrollDepth: z.number().min(0).max(100),
  conversions: z.number().int().min(0),
});

export const performanceReportSchema = z.object({
  postId: z.string(),
  dateRange: z.object({
    from: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    to: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  }),
  metrics: z.array(performanceMetricSchema),
  summary: z.object({
    totalImpressions: z.number().int().min(0),
    totalClicks: z.number().int().min(0),
    avgPosition: z.number().min(0),
    avgCtr: z.number().min(0).max(100),
    trend: z.enum(['up', 'down', 'stable']),
  }),
});

// =============================================================================
// Image Generation Schemas
// =============================================================================

export const generatedImageSchema = z.object({
  url: z.string().url(),
  altText: z.string().max(125),
  category: imageCategorySchema,
  width: z.number().int().positive(),
  height: z.number().int().positive(),
  assetId: z.string().optional(),
  generatedAt: z.string().datetime(),
});

// =============================================================================
// API Request/Response Schemas
// =============================================================================

export const keywordDiscoverRequestSchema = z.object({
  sources: z.array(z.string()).optional(),
  languages: z.array(languageSchema).optional(),
});

export const contentGenerateRequestSchema = z.object({
  keywordId: z.string(),
  contentType: contentTypeSchema.optional(),
});

export const approvalSubmitRequestSchema = z.object({
  action: approvalActionSchema,
  notes: z.string().optional(),
});

export const imageGenerateRequestSchema = z.object({
  topic: z.string().min(1),
  category: imageCategorySchema,
  postSlug: z.string(),
});

// =============================================================================
// Type Exports (inferred from schemas)
// =============================================================================

export type LanguageSchema = z.infer<typeof languageSchema>;
export type ContentStatusSchema = z.infer<typeof contentStatusSchema>;
export type SchemaTypeSchema = z.infer<typeof schemaTypeSchema>;
export type ContentTypeSchema = z.infer<typeof contentTypeSchema>;
export type KeywordIntentSchema = z.infer<typeof keywordIntentSchema>;
export type KeywordStatusSchema = z.infer<typeof keywordStatusSchema>;
export type ApprovalGateSchema = z.infer<typeof approvalGateSchema>;
export type ApprovalActionSchema = z.infer<typeof approvalActionSchema>;
export type ImageCategorySchema = z.infer<typeof imageCategorySchema>;

export type BlogPostFieldDataSchema = z.infer<typeof blogPostFieldDataSchema>;
export type WebflowBlogPostSchema = z.infer<typeof webflowBlogPostSchema>;
export type KeywordSchemaType = z.infer<typeof keywordSchema>;
export type ContentDraftSchemaType = z.infer<typeof contentDraftSchema>;
export type ApprovalLogSchemaType = z.infer<typeof approvalLogSchema>;
export type ComplianceCheckResultSchemaType = z.infer<typeof complianceCheckResultSchema>;
export type SEOValidationResultSchemaType = z.infer<typeof seoValidationResultSchema>;
export type QACheckResultSchemaType = z.infer<typeof qaCheckResultSchema>;
export type PerformanceMetricSchemaType = z.infer<typeof performanceMetricSchema>;
export type GeneratedImageSchemaType = z.infer<typeof generatedImageSchema>;
