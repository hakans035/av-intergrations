/**
 * POST /api/seo-engine/images/generate
 * Generate image via Gemini
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
import { createImageGenerator } from '@/integrations/seo-engine';

const generateImageSchema = z.object({
  topic: z.string(),
  category: z.enum(['hero', 'thumbnail', 'infographic']).default('hero'),
  postSlug: z.string(),
  language: z.enum(['nl', 'en']).optional(),
  contentId: z.string().optional(),
});

export async function POST(request: Request) {
  const logger = createRequestLogger('image_gen');
  logger.log('Image generation started');

  // Auth check
  if (!validateAdminToken(request)) {
    logger.warn('Unauthorized request');
    return unauthorizedResponse();
  }

  // Validate body
  const validation = await validateBody(request, generateImageSchema);
  if (validation.error) {
    logger.warn('Validation failed');
    return validation.error;
  }

  const { topic, category, postSlug, language, contentId } = validation.data;
  logger.log('Request validated', { topic, category, postSlug });

  try {
    // Create image generator
    const generator = createImageGenerator(process.env.GEMINI_API_KEY!);

    // Generate image
    logger.log('Generating image...');
    const image = await generator.generateImage({
      topic,
      category,
      postSlug,
      language,
    });

    logger.log('Image generated successfully', {
      hasUrl: !!image.url,
      category: image.category,
    });
    logger.done('SUCCESS');

    return successResponse({
      imageId: `img_${Date.now()}`,
      contentId,
      image: {
        url: image.url,
        altText: image.altText,
        category: image.category,
        width: image.width,
        height: image.height,
        fileName: image.fileName,
        mimeType: image.mimeType,
      },
      generatedAt: new Date().toISOString(),
    });
  } catch (error) {
    logger.error('Image generation failed', error);
    logger.done('ERROR');
    return serverErrorResponse(
      error instanceof Error ? error.message : 'Image generation failed'
    );
  }
}
