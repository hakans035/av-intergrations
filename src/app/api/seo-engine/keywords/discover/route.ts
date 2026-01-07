/**
 * POST /api/seo-engine/keywords/discover
 * Trigger keyword discovery
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
import {
  createKeywordDiscoveryService,
  ManualKeywordSource,
  GoogleTrendsSource,
  type DiscoveryOptions,
} from '@/integrations/seo-engine';

const discoverRequestSchema = z.object({
  sources: z.array(z.enum(['manual', 'google_trends'])).optional().default(['manual']),
  languages: z.array(z.enum(['nl', 'en'])).optional(),
  categories: z.array(z.string()).optional(),
  limit: z.number().min(1).max(100).optional(),
  keywords: z.array(z.object({
    keyword: z.string(),
    language: z.enum(['nl', 'en']),
    volume: z.number().optional(),
    difficulty: z.number().optional(),
  })).optional(), // For manual source
});

export async function POST(request: Request) {
  const logger = createRequestLogger('kw_discover');
  logger.log('Keyword discovery started');

  // Auth check
  if (!validateAdminToken(request)) {
    logger.warn('Unauthorized request');
    return unauthorizedResponse();
  }

  // Validate body
  const validation = await validateBody(request, discoverRequestSchema);
  if (validation.error) {
    logger.warn('Validation failed');
    return validation.error;
  }

  const { sources, languages, categories, limit, keywords } = validation.data;
  logger.log('Request validated', { sources, languages, categories, keywordCount: keywords?.length });

  try {
    // Create service with Supabase credentials
    const service = createKeywordDiscoveryService(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Register sources
    if (sources.includes('manual') && keywords && keywords.length > 0) {
      const manualSource = new ManualKeywordSource();
      manualSource.addKeywords(keywords);
      service.registerSource(manualSource);
    }
    if (sources.includes('google_trends')) {
      service.registerSource(new GoogleTrendsSource());
    }

    // Configure discovery options
    const options: DiscoveryOptions = {
      languages: languages as ('nl' | 'en')[] | undefined,
      categories,
      limit,
    };

    // Discover keywords
    logger.log('Discovering keywords...', { registeredSources: service.getRegisteredSources() });
    const result = await service.discoverKeywords(options);

    logger.log('Discovery complete', {
      discovered: result.discovered,
      added: result.added,
      duplicates: result.duplicates,
      errors: result.errors.length,
    });
    logger.done('SUCCESS');

    return successResponse({
      discovered: result.discovered,
      added: result.added,
      duplicates: result.duplicates,
      errors: result.errors,
    });
  } catch (error) {
    logger.error('Discovery failed', error);
    logger.done('ERROR');
    return serverErrorResponse('Keyword discovery failed');
  }
}
