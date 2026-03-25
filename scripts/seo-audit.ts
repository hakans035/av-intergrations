/**
 * SEO Audit Script — Fetches live HTML pages and identifies issues
 *
 * Checks for:
 * 1. Non-descriptive link content ("click here", "read more", etc.)
 * 2. Missing alt text on images
 * 3. Skipped heading levels (H1 -> H3, H2 -> H4, etc.)
 * 4. Missing meta descriptions
 * 5. Empty headings
 *
 * Usage:
 *   npx tsx scripts/seo-audit.ts
 *   npx tsx scripts/seo-audit.ts --page=/faq        # Audit single page
 *   npx tsx scripts/seo-audit.ts --json              # Output as JSON
 */

const SITE_BASE = 'https://ambitionvalley.nl';

const PAGES = [
  '/',
  '/over-ons',
  '/ons-team',
  '/werkwijze',
  '/contact-us',
  '/blog',
  '/faq',
  '/1-op-1',
  '/groepsdagen',
];

const SINGLE_PAGE = process.argv.find((a) => a.startsWith('--page='))?.split('=')[1];
const JSON_OUTPUT = process.argv.includes('--json');

// ============================================================================
// Types
// ============================================================================

interface Issue {
  page: string;
  type:
    | 'missing-alt'
    | 'non-descriptive-link'
    | 'skipped-heading'
    | 'missing-meta-description'
    | 'empty-heading'
    | 'empty-link';
  severity: 'high' | 'medium' | 'low';
  element: string;
  details: string;
  suggestion: string;
}

// ============================================================================
// Non-descriptive link patterns
// ============================================================================

const NON_DESCRIPTIVE_PATTERNS = [
  /^click\s*here$/i,
  /^here$/i,
  /^read\s*more$/i,
  /^learn\s*more$/i,
  /^more$/i,
  /^link$/i,
  /^lees\s*meer$/i,
  /^klik\s*hier$/i,
  /^meer$/i,
  /^bekijk$/i,
  /^ga\s*naar$/i,
  /^meer\s*info$/i,
  /^meer\s*lezen$/i,
  /^details$/i,
  /^verder$/i,
  /^→$/,
  /^>$/,
  /^\.{2,}$/,
];

// ============================================================================
// Simple HTML Parser (no dependencies)
// ============================================================================

interface HtmlElement {
  tag: string;
  attributes: Record<string, string>;
  textContent: string;
  innerHTML: string;
  outerHTML: string;
}

function parseAttributes(attrString: string): Record<string, string> {
  const attrs: Record<string, string> = {};
  // Match attribute="value", attribute='value', or attribute (boolean)
  const re = /([a-zA-Z_][\w-]*)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|(\S+)))?/g;
  let match;
  while ((match = re.exec(attrString)) !== null) {
    const name = match[1].toLowerCase();
    const value = match[2] ?? match[3] ?? match[4] ?? '';
    attrs[name] = value;
  }
  return attrs;
}

function findElements(html: string, tagName: string): HtmlElement[] {
  const results: HtmlElement[] = [];
  const tagLower = tagName.toLowerCase();

  // Self-closing tags
  const selfClosing = new Set(['img', 'br', 'hr', 'input', 'meta', 'link', 'source']);

  if (selfClosing.has(tagLower)) {
    const re = new RegExp(`<${tagLower}\\b([^>]*?)\\s*\\/?>`, 'gi');
    let match;
    while ((match = re.exec(html)) !== null) {
      results.push({
        tag: tagLower,
        attributes: parseAttributes(match[1]),
        textContent: '',
        innerHTML: '',
        outerHTML: match[0],
      });
    }
    return results;
  }

  // For non-self-closing tags, handle nested tags
  const openRe = new RegExp(`<${tagLower}\\b([^>]*)>`, 'gi');
  let openMatch;

  while ((openMatch = openRe.exec(html)) !== null) {
    const startIdx = openMatch.index + openMatch[0].length;
    let depth = 1;
    let pos = startIdx;

    // Scan for matching close tag
    const scanRe = new RegExp(`<(\\/?)(${tagLower})\\b[^>]*>`, 'gi');
    scanRe.lastIndex = pos;
    let scanMatch;

    while ((scanMatch = scanRe.exec(html)) !== null) {
      if (scanMatch[1] === '/') {
        depth--;
        if (depth === 0) {
          const innerHTML = html.slice(startIdx, scanMatch.index);
          const outerHTML = html.slice(openMatch.index, scanMatch.index + scanMatch[0].length);
          // Strip all tags for text content
          const textContent = innerHTML
            .replace(/<[^>]*>/g, ' ')
            .replace(/\s+/g, ' ')
            .trim();

          results.push({
            tag: tagLower,
            attributes: parseAttributes(openMatch[1]),
            textContent,
            innerHTML,
            outerHTML: outerHTML.slice(0, 200),
          });
          break;
        }
      } else {
        depth++;
      }
    }
  }

  return results;
}

function findAllHeadings(html: string): { level: number; text: string; outerHTML: string }[] {
  const results: { level: number; text: string; outerHTML: string }[] = [];
  const re = /<(h[1-6])\b([^>]*)>([\s\S]*?)<\/\1>/gi;
  let match;

  while ((match = re.exec(html)) !== null) {
    const level = parseInt(match[1][1]);
    const text = match[3]
      .replace(/<[^>]*>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
    results.push({ level, text, outerHTML: match[0].slice(0, 120) });
  }

  return results;
}

function getMetaDescription(html: string): string | null {
  const match = html.match(/<meta\s+[^>]*name\s*=\s*["']description["'][^>]*content\s*=\s*["']([^"']*)["'][^>]*>/i)
    || html.match(/<meta\s+[^>]*content\s*=\s*["']([^"']*)["'][^>]*name\s*=\s*["']description["'][^>]*>/i);
  return match ? match[1].trim() : null;
}

// ============================================================================
// Audit Functions
// ============================================================================

function auditImages(html: string, pagePath: string): Issue[] {
  const issues: Issue[] = [];
  const images = findElements(html, 'img');

  for (const img of images) {
    const alt = img.attributes.alt?.trim() ?? '';
    const src = img.attributes.src || img.attributes['data-src'] || 'unknown';

    // Skip tracking pixels and tiny icons
    const width = parseInt(img.attributes.width || '999');
    const height = parseInt(img.attributes.height || '999');
    if (width <= 1 || height <= 1) continue;

    // Skip SVG data URIs (usually icons)
    if (src.startsWith('data:image/svg')) continue;

    if (!alt) {
      // Check if decorative (role="presentation" or aria-hidden="true")
      if (img.attributes.role === 'presentation' || img.attributes['aria-hidden'] === 'true') continue;

      issues.push({
        page: pagePath,
        type: 'missing-alt',
        severity: 'high',
        element: `<img src="${src.slice(0, 80)}">`,
        details: 'Image has no alt text',
        suggestion: 'Add descriptive alt text in Webflow Designer (select image > Settings > Alt Text)',
      });
    }
  }

  return issues;
}

function auditLinks(html: string, pagePath: string): Issue[] {
  const issues: Issue[] = [];
  const links = findElements(html, 'a');

  for (const link of links) {
    const text = link.textContent.replace(/\s+/g, ' ').trim();
    const href = link.attributes.href || '';
    const ariaLabel = link.attributes['aria-label']?.trim();

    // Check if link wraps an image (common pattern for clickable images)
    const hasImage = /<img\b/i.test(link.innerHTML);
    // Check for SVG icons
    const hasSvg = /<svg\b/i.test(link.innerHTML);

    if (!text && !ariaLabel) {
      if (hasImage) {
        // Image link without alt — already caught by image audit
        continue;
      }
      if (hasSvg) {
        // SVG icon link without label
        issues.push({
          page: pagePath,
          type: 'empty-link',
          severity: 'high',
          element: `<a href="${href.slice(0, 60)}">(icon only)</a>`,
          details: 'Icon link has no accessible text',
          suggestion: 'Add aria-label to the link, e.g., aria-label="LinkedIn"',
        });
        continue;
      }

      issues.push({
        page: pagePath,
        type: 'empty-link',
        severity: 'high',
        element: `<a href="${href.slice(0, 60)}">(empty)</a>`,
        details: 'Link has no text content or aria-label',
        suggestion: 'Add descriptive text or aria-label to the link',
      });
    } else if (text && NON_DESCRIPTIVE_PATTERNS.some((p) => p.test(text))) {
      issues.push({
        page: pagePath,
        type: 'non-descriptive-link',
        severity: 'medium',
        element: `<a href="${href.slice(0, 60)}">${text}</a>`,
        details: `Link text "${text}" is non-descriptive`,
        suggestion: `Replace with descriptive text, e.g., "Bekijk onze werkwijze" instead of "${text}"`,
      });
    }
  }

  return issues;
}

function auditHeadings(html: string, pagePath: string): Issue[] {
  const issues: Issue[] = [];
  const headings = findAllHeadings(html);

  for (let i = 0; i < headings.length; i++) {
    const curr = headings[i];

    // Empty headings
    if (!curr.text) {
      issues.push({
        page: pagePath,
        type: 'empty-heading',
        severity: 'medium',
        element: `<h${curr.level}>(empty)</h${curr.level}>`,
        details: `Empty H${curr.level} heading`,
        suggestion: 'Add text content or change to a non-heading element in Webflow Designer',
      });
    }

    // Skipped levels
    if (i > 0) {
      const prev = headings[i - 1];
      if (curr.level > prev.level + 1) {
        issues.push({
          page: pagePath,
          type: 'skipped-heading',
          severity: 'low',
          element: `<h${curr.level}>${(curr.text || '(empty)').slice(0, 50)}</h${curr.level}>`,
          details: `Heading level skipped: H${prev.level} -> H${curr.level} (expected H${prev.level + 1})`,
          suggestion: `Change from <h${curr.level}> to <h${prev.level + 1}> in Webflow Designer`,
        });
      }
    }
  }

  return issues;
}

function auditMeta(html: string, pagePath: string): Issue[] {
  const description = getMetaDescription(html);
  if (!description) {
    return [
      {
        page: pagePath,
        type: 'missing-meta-description',
        severity: 'high',
        element: '<meta name="description">',
        details: 'Page has no meta description',
        suggestion: 'Add a 120-160 character meta description in Page Settings > SEO',
      },
    ];
  }
  return [];
}

// ============================================================================
// Main
// ============================================================================

async function fetchPage(url: string): Promise<string> {
  const res = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (compatible; AV-SEO-Audit/1.0)',
      Accept: 'text/html',
    },
  });

  if (!res.ok) {
    throw new Error(`HTTP ${res.status} for ${url}`);
  }

  return res.text();
}

async function main() {
  let pagesToAudit = PAGES;

  if (SINGLE_PAGE) {
    const normalized = SINGLE_PAGE.startsWith('/') ? SINGLE_PAGE : `/${SINGLE_PAGE}`;
    pagesToAudit = [normalized];
  }

  if (!JSON_OUTPUT) {
    console.log('='.repeat(65));
    console.log('  Ambition Valley — SEO & Accessibility Audit (Live HTML)');
    console.log('='.repeat(65));
    console.log(`\n  Auditing ${pagesToAudit.length} pages...\n`);
  }

  const allIssues: Issue[] = [];

  for (const pagePath of pagesToAudit) {
    const url = `${SITE_BASE}${pagePath}`;

    if (!JSON_OUTPUT) {
      process.stdout.write(`  Scanning ${pagePath}...`);
    }

    try {
      const html = await fetchPage(url);

      // Strip header/nav and footer to reduce noise from repeated elements
      // But keep the full HTML for meta checks
      allIssues.push(...auditMeta(html, pagePath));

      // For content audits, use the body
      const bodyMatch = html.match(/<body[^>]*>([\s\S]*)<\/body>/i);
      const bodyHtml = bodyMatch ? bodyMatch[1] : html;

      allIssues.push(...auditImages(bodyHtml, pagePath));
      allIssues.push(...auditLinks(bodyHtml, pagePath));
      allIssues.push(...auditHeadings(bodyHtml, pagePath));

      if (!JSON_OUTPUT) console.log(` done`);
    } catch (error) {
      if (!JSON_OUTPUT) {
        console.log(` FAILED: ${error instanceof Error ? error.message : error}`);
      }
    }

    // Small delay to be polite
    await new Promise((r) => setTimeout(r, 300));
  }

  // ========================================================================
  // Output
  // ========================================================================

  if (JSON_OUTPUT) {
    console.log(JSON.stringify(allIssues, null, 2));
    return;
  }

  // Group by severity
  const high = allIssues.filter((i) => i.severity === 'high');
  const medium = allIssues.filter((i) => i.severity === 'medium');
  const low = allIssues.filter((i) => i.severity === 'low');

  console.log('\n' + '='.repeat(65));
  console.log(`  AUDIT RESULTS: ${allIssues.length} issues found`);
  console.log(`  HIGH: ${high.length}  |  MEDIUM: ${medium.length}  |  LOW: ${low.length}`);
  console.log('='.repeat(65));

  // Group by type for summary
  const byType = new Map<string, Issue[]>();
  for (const issue of allIssues) {
    const list = byType.get(issue.type) || [];
    list.push(issue);
    byType.set(issue.type, list);
  }

  for (const [type, issues] of byType) {
    const label =
      {
        'missing-alt': 'MISSING ALT TEXT',
        'non-descriptive-link': 'NON-DESCRIPTIVE LINKS',
        'empty-link': 'EMPTY LINKS (no text)',
        'skipped-heading': 'SKIPPED HEADING LEVELS',
        'missing-meta-description': 'MISSING META DESCRIPTIONS',
        'empty-heading': 'EMPTY HEADINGS',
      }[type] || type;

    console.log(`\n${label} (${issues.length} issues)`);
    console.log('-'.repeat(55));

    // Group by page within type
    const byPage = new Map<string, Issue[]>();
    for (const issue of issues) {
      const list = byPage.get(issue.page) || [];
      list.push(issue);
      byPage.set(issue.page, list);
    }

    for (const [pagePath, pageIssues] of byPage) {
      console.log(`\n  Page: ${pagePath}`);
      for (const issue of pageIssues) {
        const severity = { high: 'HIGH', medium: 'MED ', low: 'LOW ' }[issue.severity];
        console.log(`    [${severity}] ${issue.details}`);
        console.log(`           Element: ${issue.element.slice(0, 80)}`);
        console.log(`           Fix: ${issue.suggestion}`);
      }
    }
  }

  console.log('\n' + '='.repeat(65));
  console.log(`  ${pagesToAudit.length} pages scanned.`);
  console.log('='.repeat(65) + '\n');
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
