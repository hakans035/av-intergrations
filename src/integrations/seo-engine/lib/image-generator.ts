/**
 * SEO Content Engine - Image Generator
 *
 * Gemini-powered image generation with corporate style guidelines.
 */

import { imageConfig } from '../config';
import type { ImageCategory } from '../types';
import { createWebflowClient, type WebflowAsset } from './webflow-api';

// =============================================================================
// Types
// =============================================================================

export interface ImageGenerationOptions {
  topic: string;
  category: ImageCategory;
  postSlug: string;
  language?: 'nl' | 'en';
}

export interface ImageGenOutput {
  url: string;
  altText: string;
  category: ImageCategory;
  width: number;
  height: number;
  fileName: string;
  mimeType: string;
  base64Data?: string;
}

export interface UploadedImage extends ImageGenOutput {
  assetId: string;
  webflowUrl: string;
}

export interface ImageGenerationResult {
  success: boolean;
  image?: UploadedImage;
  error?: string;
}

// =============================================================================
// Constants
// =============================================================================

const STYLE_GUIDELINES = {
  colors: {
    primary: '#1062eb',
    secondary: '#ffffff',
    accent: ['#f0f4ff', '#e5e7eb'],
  },
  style: 'Clean, minimalist, modern corporate design',
  include: 'Abstract geometric shapes, subtle financial iconography (charts, graphs, documents)',
  exclude: 'Human faces, realistic people, text, words, letters, numbers, watermarks, logos, cluttered backgrounds, dark colors, red warning colors, stock photo style, clipart, cartoons, 3D renders, photorealistic',
  background: 'Clean white or subtle light gradient',
};

const NEGATIVE_PROMPT = 'human faces, realistic people, text, words, letters, numbers, watermarks, logos, cluttered backgrounds, dark colors, red warning colors, stock photo style, clipart, cartoons, 3D renders, photorealistic';

const CATEGORY_DESCRIPTIONS: Record<ImageCategory, string> = {
  hero: 'wide banner image for the top of a blog post',
  thumbnail: 'small preview image for article listings',
  infographic: 'tall vertical image explaining a concept',
};

// =============================================================================
// Image Generator Service
// =============================================================================

export class ImageGeneratorService {
  private apiKey: string;
  private webflowClient: ReturnType<typeof createWebflowClient> | null = null;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  /**
   * Set Webflow client for asset uploads.
   */
  setWebflowClient(client: ReturnType<typeof createWebflowClient>): void {
    this.webflowClient = client;
  }

  // ===========================================================================
  // Prompt Building
  // ===========================================================================

  /**
   * Build the image generation prompt.
   */
  buildPrompt(options: ImageGenerationOptions): string {
    const { topic, category } = options;
    const dimensions = imageConfig.dimensions[category];
    const categoryDesc = CATEGORY_DESCRIPTIONS[category];

    return `Create a professional, corporate illustration for a financial advisory blog post about ${topic}.

Style: ${STYLE_GUIDELINES.style}
Color palette: Professional blues (${STYLE_GUIDELINES.colors.primary}), white, light grays.
Include: ${STYLE_GUIDELINES.include}
Exclude: ${STYLE_GUIDELINES.exclude}
Background: ${STYLE_GUIDELINES.background}
Purpose: ${categoryDesc}
Dimensions: ${dimensions.width}x${dimensions.height}px (aspect ratio ${dimensions.aspectRatio})

This image should convey professionalism and trust, suitable for a Dutch financial advisory firm's blog.`;
  }

  /**
   * Get the negative prompt.
   */
  getNegativePrompt(): string {
    return NEGATIVE_PROMPT;
  }

  // ===========================================================================
  // Image Generation
  // ===========================================================================

  /**
   * Generate an image using Gemini 3 Pro Image API (2025).
   * Model: gemini-3-pro-image-preview (Nano Banana Pro)
   * Docs: https://ai.google.dev/gemini-api/docs/image-generation
   */
  async generateImage(options: ImageGenerationOptions): Promise<ImageGenOutput> {
    const prompt = this.buildPrompt(options);
    const dimensions = imageConfig.dimensions[options.category];
    const aspectRatio = this.getAspectRatioParam(options.category);

    try {
      // Call Gemini 3 Pro Image API (Nano Banana Pro)
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-pro-image-preview:generateContent?key=${this.apiKey}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text: prompt,
                  },
                ],
              },
            ],
            generationConfig: {
              responseModalities: ['TEXT', 'IMAGE'],
              imageConfig: {
                aspectRatio: aspectRatio,
                imageSize: '2K',
              },
            },
          }),
        }
      );

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`Gemini API error: ${response.status} - ${error}`);
      }

      const data = await response.json();

      // Extract image from response - Gemini returns images in inlineData
      const imagePart = data.candidates?.[0]?.content?.parts?.find(
        (part: { inlineData?: { mimeType: string; data: string } }) =>
          part.inlineData?.mimeType?.startsWith('image/')
      );

      if (!imagePart?.inlineData) {
        throw new Error('No image data in Gemini response');
      }

      const base64Data = imagePart.inlineData.data;
      const mimeType = imagePart.inlineData.mimeType || 'image/png';
      const fileName = this.generateFileName(options);
      const altText = this.generateAltText(options);

      return {
        url: `data:${mimeType};base64,${base64Data}`,
        altText,
        category: options.category,
        width: dimensions.width,
        height: dimensions.height,
        fileName,
        mimeType,
        base64Data,
      };
    } catch (error) {
      throw new Error(
        `Image generation failed: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  /**
   * Generate image using Gemini 2.5 Flash (fallback).
   * Model: gemini-2.5-flash
   * Docs: https://ai.google.dev/gemini-api/docs/image-generation
   */
  async generateImageWithGeminiFlash(options: ImageGenerationOptions): Promise<ImageGenOutput> {
    const prompt = this.buildPrompt(options);
    const dimensions = imageConfig.dimensions[options.category];
    const aspectRatio = this.getAspectRatioParam(options.category);

    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${this.apiKey}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text: `Generate an image: ${prompt}\n\nNegative prompt (do NOT include): ${NEGATIVE_PROMPT}`,
                  },
                ],
              },
            ],
            generationConfig: {
              responseModalities: ['TEXT', 'IMAGE'],
              imageConfig: {
                aspectRatio: aspectRatio,
              },
            },
          }),
        }
      );

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`Gemini API error: ${response.status} - ${error}`);
      }

      const data = await response.json();

      // Extract image from response
      const imagePart = data.candidates?.[0]?.content?.parts?.find(
        (part: { inlineData?: { mimeType: string; data: string } }) => part.inlineData?.mimeType?.startsWith('image/')
      );

      if (!imagePart?.inlineData) {
        throw new Error('No image data in Gemini response');
      }

      const base64Data = imagePart.inlineData.data;
      const mimeType = imagePart.inlineData.mimeType || 'image/png';
      const fileName = this.generateFileName(options);
      const altText = this.generateAltText(options);

      return {
        url: `data:${mimeType};base64,${base64Data}`,
        altText,
        category: options.category,
        width: dimensions.width,
        height: dimensions.height,
        fileName,
        mimeType,
        base64Data,
      };
    } catch (error) {
      throw new Error(
        `Image generation failed: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  // ===========================================================================
  // Alt Text Generation
  // ===========================================================================

  /**
   * Generate alt text for an image.
   */
  generateAltText(options: ImageGenerationOptions): string {
    const { topic, category } = options;
    const categoryDesc = this.getCategoryAltDescription(category);

    // Format: "{Description} illustrating {topic}"
    let altText = `${categoryDesc} illustrating ${topic}`;

    // Truncate to 125 characters max
    if (altText.length > 125) {
      altText = altText.substring(0, 122) + '...';
    }

    return altText;
  }

  /**
   * Generate alt text using AI for more descriptive output.
   * Model: gemini-3-pro-preview
   */
  async generateAltTextWithAI(
    options: ImageGenerationOptions,
    imageDescription?: string
  ): Promise<string> {
    const { topic } = options;

    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-pro-preview:generateContent?key=${this.apiKey}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text: `Generate a concise alt text for an image about "${topic}" for a financial advisory blog.
${imageDescription ? `Image shows: ${imageDescription}` : ''}

Requirements:
- Maximum 125 characters
- Describe the visual content
- Include the topic context
- Format: descriptive text illustrating the topic
- Do not start with "Image of" or "Picture of"

Return only the alt text, nothing else.`,
                  },
                ],
              },
            ],
            generationConfig: {
              maxOutputTokens: 50,
              temperature: 0.3,
            },
          }),
        }
      );

      if (!response.ok) {
        // Fallback to simple alt text
        return this.generateAltText(options);
      }

      const data = await response.json();
      const altText = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();

      if (!altText) {
        return this.generateAltText(options);
      }

      // Ensure max length
      return altText.length > 125 ? altText.substring(0, 122) + '...' : altText;
    } catch {
      return this.generateAltText(options);
    }
  }

  // ===========================================================================
  // Upload to Webflow
  // ===========================================================================

  /**
   * Compress image using sharp for optimal web delivery.
   * Converts to WebP format with quality optimization.
   * Target: < 4MB for Webflow asset upload limit.
   */
  async compressImage(
    buffer: Buffer,
    maxWidth: number = 1920,
    quality: number = 80
  ): Promise<{ data: Buffer; format: string }> {
    const sharp = (await import('sharp')).default;

    // Get image metadata to determine if resizing is needed
    const metadata = await sharp(buffer).metadata();
    const originalSize = buffer.length;

    let pipeline = sharp(buffer);

    // Resize if wider than maxWidth while maintaining aspect ratio
    if (metadata.width && metadata.width > maxWidth) {
      pipeline = pipeline.resize(maxWidth, null, {
        withoutEnlargement: true,
        fit: 'inside',
      });
    }

    // Convert to WebP with quality optimization
    let compressedBuffer = await pipeline
      .webp({ quality, effort: 6 })
      .toBuffer();

    // If still too large (> 4MB), reduce quality further
    let currentQuality = quality;
    while (compressedBuffer.length > 4 * 1024 * 1024 && currentQuality > 30) {
      currentQuality -= 10;
      compressedBuffer = await sharp(buffer)
        .resize(maxWidth, null, { withoutEnlargement: true, fit: 'inside' })
        .webp({ quality: currentQuality, effort: 6 })
        .toBuffer();
    }

    console.log(
      `[Image Compression] ${(originalSize / 1024).toFixed(0)}KB -> ${(compressedBuffer.length / 1024).toFixed(0)}KB (${((1 - compressedBuffer.length / originalSize) * 100).toFixed(0)}% reduction)`
    );

    return { data: compressedBuffer, format: 'webp' };
  }

  /**
   * Upload generated image to Webflow assets.
   */
  async uploadToWebflow(image: ImageGenOutput, siteId?: string): Promise<UploadedImage> {
    if (!this.webflowClient) {
      throw new Error('Webflow client not configured. Call setWebflowClient() first.');
    }

    if (!image.base64Data) {
      throw new Error('No image data to upload');
    }

    // Convert base64 to buffer
    const originalBuffer = Buffer.from(image.base64Data, 'base64');

    // Compress the image
    const { data: compressedBuffer } = await this.compressImage(originalBuffer);

    // Convert filename to WebP
    const webpFileName = image.fileName.replace(/\.(png|jpg|jpeg)$/i, '.webp');

    try {
      const asset: WebflowAsset = await this.webflowClient.uploadAsset(
        {
          fileName: webpFileName,
          fileData: compressedBuffer,
        },
        siteId
      );

      return {
        ...image,
        fileName: webpFileName,
        assetId: asset.id,
        webflowUrl: asset.url,
        url: asset.url,
      };
    } catch (error) {
      throw new Error(
        `Failed to upload to Webflow: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  // ===========================================================================
  // Full Generation Flow
  // ===========================================================================

  /**
   * Generate and upload an image in one call.
   */
  async generateAndUpload(
    options: ImageGenerationOptions,
    siteId?: string
  ): Promise<ImageGenerationResult> {
    try {
      // Try Imagen first, fallback to Gemini Flash
      let image: ImageGenOutput;
      try {
        image = await this.generateImage(options);
      } catch {
        // Fallback to Gemini Flash for image generation
        image = await this.generateImageWithGeminiFlash(options);
      }

      // Generate better alt text with AI
      const altText = await this.generateAltTextWithAI(options);
      image.altText = altText;

      // Upload to Webflow if client is configured
      if (this.webflowClient) {
        const uploaded = await this.uploadToWebflow(image, siteId);
        return { success: true, image: uploaded };
      }

      return {
        success: true,
        image: { ...image, assetId: '', webflowUrl: '' },
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  /**
   * Generate all images for a blog post (hero + thumbnail).
   */
  async generatePostImages(
    topic: string,
    postSlug: string,
    language: 'nl' | 'en' = 'nl',
    siteId?: string
  ): Promise<{
    hero?: ImageGenerationResult;
    thumbnail?: ImageGenerationResult;
  }> {
    const heroResult = await this.generateAndUpload(
      { topic, category: 'hero', postSlug, language },
      siteId
    );

    const thumbnailResult = await this.generateAndUpload(
      { topic, category: 'thumbnail', postSlug, language },
      siteId
    );

    return {
      hero: heroResult,
      thumbnail: thumbnailResult,
    };
  }

  // ===========================================================================
  // Helper Methods
  // ===========================================================================

  /**
   * Generate filename following naming convention.
   */
  private generateFileName(options: ImageGenerationOptions): string {
    const { postSlug, category } = options;
    const timestamp = Date.now();
    return `${postSlug}-${category}-${timestamp}.png`;
  }

  /**
   * Get aspect ratio parameter for Gemini API.
   */
  private getAspectRatioParam(category: ImageCategory): string {
    const ratios: Record<ImageCategory, string> = {
      hero: '16:9', // Closest to 1.91:1
      thumbnail: '3:2',
      infographic: '2:3',
    };
    return ratios[category];
  }

  /**
   * Get category description for alt text.
   */
  private getCategoryAltDescription(category: ImageCategory): string {
    const descriptions: Record<ImageCategory, string> = {
      hero: 'Professional corporate banner',
      thumbnail: 'Article preview image',
      infographic: 'Informational diagram',
    };
    return descriptions[category];
  }
}

// =============================================================================
// Factory Function
// =============================================================================

/**
 * Create an image generator service.
 */
export function createImageGenerator(apiKey: string): ImageGeneratorService {
  return new ImageGeneratorService(apiKey);
}

/**
 * Create an image generator with Webflow integration.
 */
export function createImageGeneratorWithWebflow(
  geminiApiKey: string,
  webflowClient: ReturnType<typeof createWebflowClient>
): ImageGeneratorService {
  const service = new ImageGeneratorService(geminiApiKey);
  service.setWebflowClient(webflowClient);
  return service;
}
