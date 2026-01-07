/**
 * POST /api/seo-engine/content/generate
 * Generate content draft for a keyword
 */

import { z } from 'zod';
import {
  validateBody,
  validateAdminToken,
  unauthorizedResponse,
  successResponse,
  serverErrorResponse,
  createRequestLogger,
} from '../../_shared/utils';
import { createContentGenerator } from '@/integrations/seo-engine';

const generateRequestSchema = z.object({
  keywordId: z.string(),
  keyword: z.string(),
  language: z.enum(['nl', 'en']),
  contentType: z.enum(['short', 'long', 'mixed']).default('long'),
  relatedKeywords: z.array(z.string()).optional(),
  targetAudience: z.string().optional(),
});

export async function POST(request: Request) {
  const logger = createRequestLogger('content_gen');
  logger.log('Content generation started');

  // Auth check
  if (!validateAdminToken(request)) {
    logger.warn('Unauthorized request');
    return unauthorizedResponse();
  }

  // Validate body
  const validation = await validateBody(request, generateRequestSchema);
  if (validation.error) {
    logger.warn('Validation failed');
    return validation.error;
  }

  const { keywordId, keyword, language, contentType, relatedKeywords, targetAudience } = validation.data;
  logger.log('Request validated', { keywordId, keyword, language, contentType });

  try {
    // Create content generator service
    const generator = createContentGenerator(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Build content prompt
    logger.log('Building content prompt...');
    const prompt = generator.buildContentPrompt({
      keyword,
      keywordId,
      language,
      contentType,
      relatedKeywords,
      targetAudience,
    });

    // Note: In production, the actual AI call would be made here using the prompt
    // For now, return the prompt so the caller can make the AI call

    logger.log('Prompt generated successfully');
    logger.done('SUCCESS');

    return successResponse({
      prompt,
      keywordId,
      keyword,
      language,
      contentType,
      message: 'Use the returned prompt to generate content via AI API',
    });
  } catch (error) {
    logger.error('Generation failed', error);
    logger.done('ERROR');
    return serverErrorResponse('Content generation failed');
  }
}
