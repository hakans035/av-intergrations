# Task 06: Gemini Image Generation

## Reference

See `docs/seo-content-engine-requirements.md`:
- Section 8: Gemini Image Generation Requirements

## Objective

Implement image generation using Gemini API with corporate style guidelines.

## Requirements

### Image Categories

| Category | Dimensions | Aspect Ratio |
|----------|------------|--------------|
| Hero | 1200x630px | 1.91:1 |
| Thumbnail | 600x400px | 3:2 |
| Infographic | 800x1200px | 2:3 |

### Resolution Targets

- Hero: min 1200x630, max 2400x1260
- Thumbnail: exactly 600x400
- Infographic: min 800x1200
- Output: PNG, convert to WebP for storage

### Style Guidelines

- Color palette: Brand blues (#1062eb), white, light grays
- Style: Clean, minimalist, professional
- No people faces
- Abstract geometric patterns acceptable
- Icons and simple illustrations preferred
- No text in images
- White or light gradient backgrounds

### Prompt Template

```
Create a professional, corporate illustration for a financial advisory blog post about {topic}.
Style: Clean, minimalist, modern corporate design.
Color palette: Professional blues (#1062eb), white, light grays.
Include: Abstract geometric shapes, subtle financial iconography (charts, graphs, documents).
Exclude: Human faces, text, words, letters, numbers, watermarks, logos, cluttered backgrounds, dark colors, red warning colors, stock photo style, clipart, cartoons, 3D renders, photorealistic
Background: Clean white or subtle light gradient.
Purpose: {hero|thumbnail|infographic}
```

### Negative Prompts

Always include:
```
human faces, realistic people, text, words, letters, numbers, watermarks, logos, cluttered backgrounds, dark colors, red warning colors, stock photo style, clipart, cartoons, 3D renders, photorealistic
```

### Alt Text Generation

- Generate immediately after image creation
- Describe visual content accurately
- Include topic context
- Format: "{Description} illustrating {topic}"
- Maximum 125 characters

### Storage

- Upload to Webflow Assets via API
- Naming: {slug}-{category}-{timestamp}.webp
- Maintain mapping between post Slug and images
- Archive original PNG for regeneration

### Association

- Upload Main Image, get asset ID
- Set Main Image field to asset reference
- Upload Thumbnail, get asset ID
- Set Thumbnail image field to asset reference
- Populate Alt Text and Thumbnail Alt Text fields

## Acceptance Criteria

- [ ] Gemini API integration implemented
- [ ] All image categories supported
- [ ] Style guidelines enforced via prompts
- [ ] Negative prompts included
- [ ] Alt text generation working
- [ ] Image compression to WebP
- [ ] Webflow asset upload working
- [ ] Asset-to-post association working
- [ ] Naming convention enforced
- [ ] Unit tests for image generation

## Dependencies

- Task 02: Types and Configuration
- Task 03: Webflow API Client

## Estimated Effort

Medium
