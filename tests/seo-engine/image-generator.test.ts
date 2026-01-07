/**
 * Image Generator Tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  ImageGeneratorService,
  createImageGenerator,
  createImageGeneratorWithWebflow,
} from '../../src/integrations/seo-engine/lib/image-generator';

// Mock fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('ImageGeneratorService', () => {
  let service: ImageGeneratorService;

  beforeEach(() => {
    service = createImageGenerator('test-api-key');
    mockFetch.mockReset();
  });

  describe('buildPrompt', () => {
    it('should build prompt for hero image', () => {
      const prompt = service.buildPrompt({
        topic: 'belastingadvies',
        category: 'hero',
        postSlug: 'belastingadvies-2024',
      });

      expect(prompt).toContain('belastingadvies');
      expect(prompt).toContain('1200x630');
      expect(prompt).toContain('#1062eb');
      expect(prompt).toContain('banner');
    });

    it('should build prompt for thumbnail image', () => {
      const prompt = service.buildPrompt({
        topic: 'box 3 belasting',
        category: 'thumbnail',
        postSlug: 'box-3-belasting',
      });

      expect(prompt).toContain('box 3 belasting');
      expect(prompt).toContain('600x400');
      expect(prompt).toContain('preview');
    });

    it('should build prompt for infographic', () => {
      const prompt = service.buildPrompt({
        topic: 'btw aangifte',
        category: 'infographic',
        postSlug: 'btw-aangifte-guide',
      });

      expect(prompt).toContain('btw aangifte');
      expect(prompt).toContain('800x1200');
      expect(prompt).toContain('concept');
    });

    it('should include style guidelines', () => {
      const prompt = service.buildPrompt({
        topic: 'test',
        category: 'hero',
        postSlug: 'test',
      });

      expect(prompt).toContain('Clean, minimalist');
      expect(prompt).toContain('Professional blues');
      expect(prompt).toContain('Abstract geometric');
    });
  });

  describe('getNegativePrompt', () => {
    it('should return negative prompt with excluded elements', () => {
      const negativePrompt = service.getNegativePrompt();

      expect(negativePrompt).toContain('human faces');
      expect(negativePrompt).toContain('text');
      expect(negativePrompt).toContain('watermarks');
      expect(negativePrompt).toContain('clipart');
      expect(negativePrompt).toContain('3D renders');
    });
  });

  describe('generateAltText', () => {
    it('should generate alt text for hero image', () => {
      const altText = service.generateAltText({
        topic: 'belastingaangifte 2024',
        category: 'hero',
        postSlug: 'belastingaangifte-2024',
      });

      expect(altText).toContain('banner');
      expect(altText).toContain('belastingaangifte 2024');
      expect(altText.length).toBeLessThanOrEqual(125);
    });

    it('should generate alt text for thumbnail', () => {
      const altText = service.generateAltText({
        topic: 'zzp belasting',
        category: 'thumbnail',
        postSlug: 'zzp-belasting',
      });

      expect(altText).toContain('preview');
      expect(altText).toContain('zzp belasting');
    });

    it('should generate alt text for infographic', () => {
      const altText = service.generateAltText({
        topic: 'btw tarieven',
        category: 'infographic',
        postSlug: 'btw-tarieven',
      });

      expect(altText).toContain('diagram');
      expect(altText).toContain('btw tarieven');
    });

    it('should truncate long alt text to 125 characters', () => {
      const altText = service.generateAltText({
        topic: 'Dit is een zeer lange titel over belastingadvies voor zelfstandige professionals in Nederland die hulp nodig hebben',
        category: 'hero',
        postSlug: 'lange-titel',
      });

      expect(altText.length).toBeLessThanOrEqual(125);
      expect(altText).toMatch(/\.\.\.$/);
    });
  });

  describe('generateImage', () => {
    it('should call Gemini API with correct parameters', async () => {
      const mockImageData = 'base64ImageData';
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            predictions: [{ bytesBase64Encoded: mockImageData }],
          }),
      });

      const result = await service.generateImage({
        topic: 'test topic',
        category: 'hero',
        postSlug: 'test-post',
      });

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('imagen-3.0-generate-002'),
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        })
      );

      expect(result.base64Data).toBe(mockImageData);
      expect(result.category).toBe('hero');
      expect(result.width).toBe(1200);
      expect(result.height).toBe(630);
    });

    it('should throw error on API failure', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        text: () => Promise.resolve('Internal Server Error'),
      });

      await expect(
        service.generateImage({
          topic: 'test',
          category: 'hero',
          postSlug: 'test',
        })
      ).rejects.toThrow('Gemini API error');
    });

    it('should throw error when no image in response', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ predictions: [] }),
      });

      await expect(
        service.generateImage({
          topic: 'test',
          category: 'hero',
          postSlug: 'test',
        })
      ).rejects.toThrow('No image data');
    });
  });

  describe('generateImageWithGeminiFlash', () => {
    it('should call Gemini Flash API as fallback', async () => {
      const mockImageData = 'base64FlashImageData';
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            candidates: [
              {
                content: {
                  parts: [
                    {
                      inlineData: {
                        mimeType: 'image/png',
                        data: mockImageData,
                      },
                    },
                  ],
                },
              },
            ],
          }),
      });

      const result = await service.generateImageWithGeminiFlash({
        topic: 'test topic',
        category: 'thumbnail',
        postSlug: 'test-post',
      });

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('gemini-2.0-flash'),
        expect.any(Object)
      );

      expect(result.base64Data).toBe(mockImageData);
      expect(result.category).toBe('thumbnail');
    });
  });

  describe('generateAltTextWithAI', () => {
    it('should generate AI-powered alt text', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            candidates: [
              {
                content: {
                  parts: [{ text: 'Modern corporate chart showing tax planning strategies' }],
                },
              },
            ],
          }),
      });

      const altText = await service.generateAltTextWithAI({
        topic: 'fiscale planning',
        category: 'hero',
        postSlug: 'fiscale-planning',
      });

      expect(altText).toBe('Modern corporate chart showing tax planning strategies');
    });

    it('should fallback to simple alt text on API error', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
      });

      const altText = await service.generateAltTextWithAI({
        topic: 'test topic',
        category: 'hero',
        postSlug: 'test',
      });

      expect(altText).toContain('test topic');
    });
  });

  describe('uploadToWebflow', () => {
    it('should throw error when Webflow client not configured', async () => {
      const image = {
        url: 'data:image/png;base64,test',
        altText: 'Test image',
        category: 'hero' as const,
        width: 1200,
        height: 630,
        fileName: 'test.png',
        mimeType: 'image/png',
        base64Data: 'testdata',
      };

      await expect(service.uploadToWebflow(image)).rejects.toThrow(
        'Webflow client not configured'
      );
    });

    it('should throw error when no image data', async () => {
      const mockWebflowClient = {
        uploadAsset: vi.fn(),
      };
      service.setWebflowClient(mockWebflowClient as any);

      const image = {
        url: 'data:image/png;base64,test',
        altText: 'Test image',
        category: 'hero' as const,
        width: 1200,
        height: 630,
        fileName: 'test.png',
        mimeType: 'image/png',
        // No base64Data
      };

      await expect(service.uploadToWebflow(image)).rejects.toThrow('No image data');
    });
  });

  describe('generateAndUpload', () => {
    it('should generate and return result without upload when no Webflow client', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            predictions: [{ bytesBase64Encoded: 'testdata' }],
          }),
      });

      // Mock alt text generation
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            candidates: [{ content: { parts: [{ text: 'Alt text' }] } }],
          }),
      });

      const result = await service.generateAndUpload({
        topic: 'test',
        category: 'hero',
        postSlug: 'test',
      });

      expect(result.success).toBe(true);
      expect(result.image).toBeDefined();
      expect(result.image?.assetId).toBe('');
    });

    it('should return error result on failure', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        text: () => Promise.resolve('Error'),
      });

      // Fallback also fails
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        text: () => Promise.resolve('Error'),
      });

      const result = await service.generateAndUpload({
        topic: 'test',
        category: 'hero',
        postSlug: 'test',
      });

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });
  });

  describe('generatePostImages', () => {
    it('should generate both hero and thumbnail images', async () => {
      // Hero image
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            predictions: [{ bytesBase64Encoded: 'herodata' }],
          }),
      });
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            candidates: [{ content: { parts: [{ text: 'Hero alt' }] } }],
          }),
      });

      // Thumbnail image
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            predictions: [{ bytesBase64Encoded: 'thumbdata' }],
          }),
      });
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            candidates: [{ content: { parts: [{ text: 'Thumb alt' }] } }],
          }),
      });

      const result = await service.generatePostImages('test topic', 'test-slug');

      expect(result.hero?.success).toBe(true);
      expect(result.thumbnail?.success).toBe(true);
    });
  });
});

describe('Factory Functions', () => {
  it('should create image generator', () => {
    const service = createImageGenerator('test-key');
    expect(service).toBeInstanceOf(ImageGeneratorService);
  });

  it('should create image generator with Webflow client', () => {
    const mockWebflowClient = { uploadAsset: vi.fn() };
    const service = createImageGeneratorWithWebflow('test-key', mockWebflowClient as any);
    expect(service).toBeInstanceOf(ImageGeneratorService);
  });
});
