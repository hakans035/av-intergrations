/**
 * SEO Content Engine Integration
 *
 * AI-driven SEO content engine for AmbitionValley.
 * Generates blog content, manages approval workflows, and publishes to Webflow CMS.
 *
 * @module seo-engine
 */

// =============================================================================
// Types
// =============================================================================

export type {
  // Webflow types
  Language,
  ContentStatus,
  SchemaType,
  WebflowFieldSlug,
  WebflowImage,
  BlogPostFieldData,
  WebflowBlogPost,
  // Keyword types
  KeywordIntent,
  KeywordStatus,
  Keyword,
  // Content types
  ContentType,
  ContentDraft,
  ContentRevision,
  // Approval types
  ApprovalGate,
  ApprovalAction,
  ApprovalLog,
  // Compliance types
  ViolationSeverity,
  ComplianceViolation,
  ComplianceCheckResult,
  // SEO types
  SEOValidationResult,
  // QA types
  QACheckResult,
  // Performance types
  PerformanceMetric,
  PerformanceReport,
  // Image types
  ImageCategory,
  GeneratedImage,
} from './types';

export { WEBFLOW_FIELD_SLUGS } from './types';

// =============================================================================
// Configuration
// =============================================================================

export {
  webflowConfig,
  contentConfig,
  imageConfig,
  approvalConfig,
  keywordConfig,
  performanceConfig,
  getEnvVar,
  getEnvVarOptional,
  ENV_VARS,
} from './config';

// =============================================================================
// Constants
// =============================================================================

export {
  SITE_DISCLAIMER,
  POST_DISCLAIMER,
  PROHIBITED_PATTERNS,
  APPROVED_EXTERNAL_DOMAINS,
  TONE_VIOLATIONS,
  QUALIFICATION_PHRASES,
  DEFAULT_AUTHOR,
  ARTICLE_SCHEMA_TEMPLATE,
  FAQ_SCHEMA_TEMPLATE,
  PILLAR_PAGES,
} from './constants';

// =============================================================================
// Validation Schemas (Zod)
// =============================================================================

export {
  // Base type schemas
  languageSchema,
  contentStatusSchema,
  schemaTypeSchema,
  contentTypeSchema,
  keywordIntentSchema,
  keywordStatusSchema,
  approvalGateSchema,
  approvalActionSchema,
  violationSeveritySchema,
  imageCategorySchema,
  // Webflow schemas
  webflowImageSchema,
  blogPostFieldDataSchema,
  webflowBlogPostSchema,
  // Keyword schemas
  keywordSchema,
  keywordCreateSchema,
  keywordUpdateSchema,
  // Content schemas
  contentDraftSchema,
  contentDraftCreateSchema,
  contentRevisionSchema,
  // Approval schemas
  approvalLogSchema,
  approvalLogCreateSchema,
  // Compliance schemas
  complianceViolationSchema,
  complianceCheckResultSchema,
  // SEO schemas
  seoValidationResultSchema,
  // QA schemas
  qaCheckResultSchema,
  // Performance schemas
  performanceMetricSchema,
  performanceReportSchema,
  // Image schemas
  generatedImageSchema,
  // API request schemas
  keywordDiscoverRequestSchema,
  contentGenerateRequestSchema,
  approvalSubmitRequestSchema,
  imageGenerateRequestSchema,
} from './validation';

// =============================================================================
// Library
// =============================================================================

export {
  // Webflow API Client
  WebflowClient,
  WebflowApiError,
  createWebflowClient,
  validateWebhookSignature,
  parseWebhookPayload,
  type WebflowClientConfig,
  type WebflowCollection,
  type WebflowField,
  type WebflowItem,
  type WebflowItemCreate,
  type WebflowItemUpdate,
  type WebflowPagination,
  type WebflowPaginatedResponse,
  type WebflowListOptions,
  type WebflowAsset,
  type WebflowAssetUpload,
  type WebflowError,
  type WebflowApiLog,
  type WebflowWebhookPayload,
  // Keyword Discovery
  KeywordDiscoveryService,
  ManualKeywordSource,
  GoogleTrendsSource,
  createKeywordDiscoveryService,
  classifyIntent,
  type KeywordDiscoverySource,
  type DiscoveryOptions,
  type DiscoveredKeyword,
  type KeywordWithIntent,
  type KeywordRecord,
  type KeywordDiscoveryResult,
  // Content Generator
  ContentGeneratorService,
  createContentGenerator,
  type ContentGenerationOptions,
  type GeneratedContent,
  type FAQ,
  type ContentLink,
  type ContentValidationResult,
  type HeadingStructure,
  type ReadabilityScore,
  type ContentPrompt,
  // Image Generator
  ImageGeneratorService,
  createImageGenerator,
  createImageGeneratorWithWebflow,
  type ImageGenerationOptions,
  type ImageGenOutput,
  type UploadedImage,
  type ImageGenerationResult,
  // Compliance Checker
  ComplianceCheckerService,
  createComplianceChecker,
  type ComplianceCheckOptions,
  // SEO Validator
  SEOValidatorService,
  createSEOValidator,
  type SEOValidationOptions,
  type SEOContent,
  // Quality Assurance
  QualityAssuranceService,
  createQualityAssurance,
  type QACheckOptions,
  type ContentForQA,
  type LinkValidationResult,
  type LanguageCheckResult,
  type PlagiarismResult,
  // Approval Workflow
  ApprovalWorkflowService,
  createApprovalWorkflow,
  type Reviewer,
  type ApprovalRequest,
  type ApprovalResult,
  type WorkflowState,
  type StateTransition,
  // Publishing Workflow
  PublishingWorkflowService,
  createPublishingWorkflow,
  type WorkflowStep,
  type WorkflowItem,
  type RevisionEntry,
  type WorkflowResult,
  type GeneratedDraftData,
  type WebflowSaveResult,
  type PublishResult,
  // Performance Monitoring
  PerformanceMonitoringService,
  createPerformanceMonitoring,
  createMockSearchConsoleSource,
  createMockAnalyticsSource,
  type ReviewCadence,
  type UpdateTriggerReason,
  type UpdateTrigger,
  type ContentVersion,
  type VersionHistory,
  type PerformanceSummary,
  type ReviewReport,
  type SearchConsoleData,
  type AnalyticsData,
  type DataSource,
} from './lib';

// =============================================================================
// Hooks (to be implemented)
// =============================================================================

// export * from './hooks';

// =============================================================================
// Components
// =============================================================================

export {
  // Shared Components
  StatusBadge,
  LanguageSelector,
  ActionButton,
  MetricCard,
  LoadingState,
  LoadingSkeleton,
  TableLoadingSkeleton,
  ErrorState,
  EmptyState,
  ReviewerSelect,
  // Main Components
  KeywordQueue,
  ContentEditor,
  ApprovalWorkflow,
  QAChecklist,
  PerformanceDashboard,
} from './components';
