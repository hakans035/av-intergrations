# Webflow to Next.js Conversion Agent

Convert the exported Webflow website to Next.js pages while keeping the **EXACT SAME DESIGN**.

## Source Location
The Webflow export is located at: `src/backup_public_av/`

## CRITICAL REQUIREMENTS

**THE DESIGN MUST BE PIXEL-PERFECT IDENTICAL TO THE WEBFLOW EXPORT. DO NOT CHANGE ANY:**
- Colors, gradients, or color values
- Font sizes, font weights, font families
- Spacing (padding, margin, gaps)
- Border radius values
- Shadow effects
- Animations and transitions
- Layout structure and positioning
- Image sizes and aspect ratios
- Button styles and hover effects
- Navigation structure
- Footer structure
- All visual elements

## Pages to Convert

### Main Pages
1. `index.html` → `/` (homepage)
2. `1-op-1.html` → `/1-op-1`
3. `boeken.html` → `/boeken`
4. `contact-us.html` → `/contact`
5. `faq.html` → `/faq`
6. `groepsdagen.html` → `/groepsdagen`
7. `ons-team.html` → `/team`
8. `over-ons.html` → `/over-ons`
9. `werkwijze.html` → `/werkwijze`

### Service Pages
Located in `services/` subfolder:
- `aangiftes-and-compliance.html` → `/services/aangiftes-compliance`
- `belastingoptimalisatie.html` → `/services/belastingoptimalisatie`
- `bv-and-holding-voor-ondernemers.html` → `/services/bv-holding`
- `dashboard-and-community.html` → `/services/dashboard-community`
- `financiele-strategie.html` → `/services/financiele-strategie`
- `vermogensopbouw-and-asset-allocatie.html` → `/services/vermogensopbouw`

### Policy Pages
Located in `policies/` subfolder:
- `cookies.html` → `/policies/cookies`
- `privacy-beleid.html` → `/policies/privacy`
- `terms-conditions.html` → `/policies/terms`

### Team Member Pages
Located in `team/` subfolder:
- `hakan-sahingoz.html` → `/team/hakan`
- `ramin.html` → `/team/ramin`

## Assets

### CSS
- Main CSS file: `css/ambitionvalley.webflow.shared.29fc72d90.min.css`
- Copy to: `public/css/webflow.css` or convert to Tailwind/CSS modules

### Images
- Source: `images/` folder (103 images)
- Copy to: `public/images/av/`

### JavaScript
- Source: `js/` folder
- Evaluate which scripts are needed and convert to React/Next.js patterns

## Conversion Strategy

### Step 1: Setup
1. Create the route structure in `src/app/` for the public AV pages
2. Copy all images from `backup_public_av/images/` to `public/images/av/`
3. Copy or convert CSS

### Step 2: Extract Components
Analyze the HTML files and extract reusable components:
- **Navbar** - Navigation header (consistent across all pages)
- **Footer** - Footer section (consistent across all pages)
- **HeroSection** - Hero sections with different content
- **ServiceCard** - Service listing cards
- **TeamCard** - Team member cards
- **FAQAccordion** - FAQ expandable sections
- **CTASection** - Call-to-action sections
- **TestimonialSection** - Client testimonials

### Step 3: Convert Each Page
For each HTML file:
1. Read the HTML structure carefully
2. Extract the unique content
3. Map HTML classes to the CSS styles
4. Convert to React/JSX components
5. Ensure all interactive elements work (dropdowns, accordions, etc.)
6. Test that it looks IDENTICAL to the original

### Step 4: Preserve Styling
**Option A - Keep Webflow CSS:**
- Import the Webflow CSS file globally
- Keep the same class names in JSX

**Option B - Convert to Tailwind:**
- Map each Webflow class to equivalent Tailwind classes
- Create custom CSS for complex styles not available in Tailwind
- Use CSS variables for colors and spacing from original CSS

## Quality Checklist
Before marking a page as complete:
- [ ] Visual comparison shows NO differences from original
- [ ] All images load correctly
- [ ] All links work correctly
- [ ] All animations/transitions work
- [ ] Mobile responsive design works exactly as original
- [ ] Hover effects work as original
- [ ] Navigation dropdown menus work
- [ ] All text content is identical
- [ ] Fonts load correctly
- [ ] Colors are exact matches

## File Structure

```
src/app/
├── (public)/              # Public AV pages group
│   ├── layout.tsx         # Layout with AV navbar/footer
│   ├── page.tsx           # Homepage (index.html)
│   ├── 1-op-1/
│   │   └── page.tsx
│   ├── boeken/
│   │   └── page.tsx
│   ├── contact/
│   │   └── page.tsx
│   ├── faq/
│   │   └── page.tsx
│   ├── groepsdagen/
│   │   └── page.tsx
│   ├── team/
│   │   ├── page.tsx       # Team overview
│   │   ├── hakan/
│   │   │   └── page.tsx
│   │   └── ramin/
│   │       └── page.tsx
│   ├── over-ons/
│   │   └── page.tsx
│   ├── werkwijze/
│   │   └── page.tsx
│   ├── services/
│   │   ├── aangiftes-compliance/
│   │   │   └── page.tsx
│   │   ├── belastingoptimalisatie/
│   │   │   └── page.tsx
│   │   ├── bv-holding/
│   │   │   └── page.tsx
│   │   ├── dashboard-community/
│   │   │   └── page.tsx
│   │   ├── financiele-strategie/
│   │   │   └── page.tsx
│   │   └── vermogensopbouw/
│   │       └── page.tsx
│   └── policies/
│       ├── cookies/
│       │   └── page.tsx
│       ├── privacy/
│       │   └── page.tsx
│       └── terms/
│           └── page.tsx

src/components/av/         # AV-specific components
├── Navbar.tsx
├── Footer.tsx
├── HeroSection.tsx
├── ServiceCard.tsx
├── TeamCard.tsx
├── FAQAccordion.tsx
├── CTASection.tsx
└── ...

public/
├── images/av/            # All Webflow images
└── css/webflow.css       # Webflow CSS (if keeping original)
```

## Commands to Start

```bash
# Copy images
cp -r src/backup_public_av/images/* public/images/av/

# Copy CSS
cp src/backup_public_av/css/*.css public/css/webflow.css
```

## Important Notes

1. **DO NOT SIMPLIFY THE DESIGN** - Keep all visual complexity
2. **DO NOT MODERNIZE** - Keep the exact Webflow aesthetic
3. **DO NOT SKIP DETAILS** - Every shadow, gradient, animation matters
4. **TEST VISUALLY** - Always compare side-by-side with original
5. **MOBILE FIRST** - Ensure responsive breakpoints match exactly

When asked to work on this conversion, always:
1. First read the original HTML file completely
2. Identify all classes and their CSS rules
3. Recreate the exact same visual output
4. Test before moving to the next page
