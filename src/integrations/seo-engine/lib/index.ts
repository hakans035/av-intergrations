/**
 * SEO Content Engine - Library
 *
 * Core business logic for the SEO content engine.
 */

// Webflow API Client
export {
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
} from './webflow-api';

// Keyword Discovery Engine
export {
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
} from './keyword-discovery';

// Content Generator
export {
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
} from './content-generator';

// Image Generator
export {
  ImageGeneratorService,
  createImageGenerator,
  createImageGeneratorWithWebflow,
  type ImageGenerationOptions,
  type ImageGenOutput,
  type UploadedImage,
  type ImageGenerationResult,
} from './image-generator';

// Compliance Checker
export {
  ComplianceCheckerService,
  createComplianceChecker,
  type ComplianceCheckOptions,
} from './compliance-checker';

// SEO Validator
export {
  SEOValidatorService,
  createSEOValidator,
  type SEOValidationOptions,
  type SEOContent,
} from './seo-validator';

// Quality Assurance
export {
  QualityAssuranceService,
  createQualityAssurance,
  type QACheckOptions,
  type ContentForQA,
  type LinkValidationResult,
  type LanguageCheckResult,
  type PlagiarismResult,
} from './quality-assurance';

// Approval Workflow
export {
  ApprovalWorkflowService,
  createApprovalWorkflow,
  type Reviewer,
  type ApprovalRequest,
  type ApprovalResult,
  type WorkflowState,
  type StateTransition,
} from './approval-workflow';

// Publishing Workflow
export {
  PublishingWorkflowService,
  createPublishingWorkflow,
  type WorkflowStep,
  type WorkflowItem,
  type RevisionEntry,
  type WorkflowResult,
  type GeneratedDraftData,
  type WebflowSaveResult,
  type PublishResult,
} from './publishing-workflow';

// Performance Monitoring
export {
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
} from './performance-monitoring';
