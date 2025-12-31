/**
 * Webflow CMS Setup Script
 *
 * Retrieves existing Blog Posts collection fields from Webflow CMS,
 * compares against required schema, and adds missing fields.
 *
 * Usage:
 *   npx tsx scripts/webflow-cms-setup.ts [options]
 *
 * Options:
 *   --dry-run        Show what would be created without making changes
 *   --force          Skip confirmation prompts
 *   --output-types   Path to output generated types file
 *
 * Environment Variables:
 *   WEBFLOW_API_TOKEN     Bearer token with cms:read and cms:write scopes
 *   WEBFLOW_SITE_ID       Site identifier
 *   WEBFLOW_COLLECTION_ID Blog Posts collection identifier
 */

import * as readline from 'readline';

// Configuration
const WEBFLOW_API_BASE = 'https://api.webflow.com/v2';
const RATE_LIMIT_DELAY_MS = 1000;
const MAX_RETRIES = 5;
const INITIAL_RETRY_DELAY_MS = 1000;

// Types
interface WebflowField {
  id: string;
  slug: string;
  displayName: string;
  type: string;
  isRequired: boolean;
  validations?: Record<string, unknown>;
  metadata?: {
    options?: Array<{ id: string; name: string }>;
    collectionId?: string;
  };
}

interface WebflowCollection {
  id: string;
  displayName: string;
  singularName: string;
  slug: string;
  fields: WebflowField[];
}

interface FieldDefinition {
  displayName: string;
  slug: string;
  type: string;
  isRequired: boolean;
  helpText?: string;
  metadata?: {
    options?: Array<{ id: string; name: string }>;
    collectionId?: string;
  };
}

// Required existing fields (for validation)
const EXISTING_FIELDS: FieldDefinition[] = [
  { displayName: 'Name', slug: 'name', type: 'PlainText', isRequired: true },
  { displayName: 'Slug', slug: 'slug', type: 'PlainText', isRequired: true },
  { displayName: 'Main Image', slug: 'main-image', type: 'ImageRef', isRequired: false },
  { displayName: 'Thumbnail image', slug: 'thumbnail-image', type: 'ImageRef', isRequired: false },
  { displayName: 'Post Body', slug: 'post-body', type: 'RichText', isRequired: false },
  { displayName: 'Post Summary', slug: 'post-summary', type: 'PlainText', isRequired: false },
  { displayName: 'Featured?', slug: 'featured', type: 'Bool', isRequired: false },
  { displayName: 'Next Post', slug: 'next-post', type: 'ItemRef', isRequired: false },
  { displayName: 'Previous Post', slug: 'previous-post', type: 'ItemRef', isRequired: false },
  { displayName: 'Alt Text', slug: 'alt-text', type: 'PlainText', isRequired: false },
  { displayName: 'Author Image', slug: 'author-image', type: 'ImageRef', isRequired: false },
  { displayName: 'Author Name', slug: 'author-name', type: 'PlainText', isRequired: false },
];

// New fields to add
const NEW_FIELDS: FieldDefinition[] = [
  {
    displayName: 'Language',
    slug: 'language',
    type: 'Option',
    isRequired: true,
    helpText: 'Content language: Dutch (nl) or English (en)',
    metadata: {
      options: [
        { id: 'nl', name: 'Dutch' },
        { id: 'en', name: 'English' },
      ],
    },
  },
  {
    displayName: 'Alternate Language Post',
    slug: 'alternate-language-post',
    type: 'Reference',
    isRequired: false,
    helpText: 'Reference to the translated version of this post',
    metadata: {
      collectionId: '', // Will be set to current collection ID
    },
  },
  {
    displayName: 'Content Status',
    slug: 'content-status',
    type: 'Option',
    isRequired: true,
    helpText: 'Current status in the approval workflow',
    metadata: {
      options: [
        { id: 'draft', name: 'Draft' },
        { id: 'pending_review', name: 'Pending Review' },
        { id: 'approved', name: 'Approved' },
        { id: 'published', name: 'Published' },
        { id: 'archived', name: 'Archived' },
      ],
    },
  },
  {
    displayName: 'Source Keyword',
    slug: 'source-keyword',
    type: 'PlainText',
    isRequired: false,
    helpText: 'Primary keyword that triggered content creation',
  },
  {
    displayName: 'Generation Timestamp',
    slug: 'generation-timestamp',
    type: 'PlainText',
    isRequired: false,
    helpText: 'ISO 8601 timestamp of content generation',
  },
  {
    displayName: 'Last Reviewed By',
    slug: 'last-reviewed-by',
    type: 'PlainText',
    isRequired: false,
    helpText: 'Reviewer identifier from last approval gate',
  },
  {
    displayName: 'Review Notes',
    slug: 'review-notes',
    type: 'PlainText',
    isRequired: false,
    helpText: 'Comments from reviewers during approval process',
  },
  {
    displayName: 'Meta Title',
    slug: 'meta-title',
    type: 'PlainText',
    isRequired: false,
    helpText: 'Custom SEO title (max 60 characters)',
  },
  {
    displayName: 'Meta Description',
    slug: 'meta-description',
    type: 'PlainText',
    isRequired: false,
    helpText: 'SEO meta description (max 160 characters)',
  },
  {
    displayName: 'Canonical URL',
    slug: 'canonical-url',
    type: 'PlainText',
    isRequired: false,
    helpText: 'Canonical URL if cross-posted',
  },
  {
    displayName: 'Schema Type',
    slug: 'schema-type',
    type: 'Option',
    isRequired: false,
    helpText: 'Primary schema markup type for structured data',
    metadata: {
      options: [
        { id: 'article', name: 'Article' },
        { id: 'faqpage', name: 'FAQPage' },
        { id: 'article-faq', name: 'Article+FAQ' },
      ],
    },
  },
  {
    displayName: 'Thumbnail Alt Text',
    slug: 'thumbnail-alt-text',
    type: 'PlainText',
    isRequired: false,
    helpText: 'Alt text for thumbnail image (max 125 characters)',
  },
];

// Utility functions
function getEnvVar(name: string): string {
  const value = process.env[name];
  if (!value) {
    console.error(`Error: Missing environment variable ${name}`);
    console.error(`\nRequired environment variables:`);
    console.error(`  WEBFLOW_API_TOKEN     - Bearer token with cms:read and cms:write scopes`);
    console.error(`  WEBFLOW_SITE_ID       - Site identifier`);
    console.error(`  WEBFLOW_COLLECTION_ID - Blog Posts collection identifier`);
    process.exit(1);
  }
  return value;
}

function parseArgs(): { dryRun: boolean; force: boolean; outputTypes: string | null } {
  const args = process.argv.slice(2);
  return {
    dryRun: args.includes('--dry-run'),
    force: args.includes('--force'),
    outputTypes: args.find((arg) => arg.startsWith('--output-types='))?.split('=')[1] || null,
  };
}

async function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function confirm(message: string): Promise<boolean> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    rl.question(`${message} (y/N): `, (answer) => {
      rl.close();
      resolve(answer.toLowerCase() === 'y');
    });
  });
}

// API functions
async function webflowRequest<T>(
  endpoint: string,
  options: {
    method?: string;
    body?: unknown;
    token: string;
  },
  retryCount = 0
): Promise<T> {
  const { method = 'GET', body, token } = options;

  const response = await fetch(`${WEBFLOW_API_BASE}${endpoint}`, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  if (response.status === 429) {
    if (retryCount >= MAX_RETRIES) {
      throw new Error('Rate limit exceeded. Maximum retries reached.');
    }
    const delay = INITIAL_RETRY_DELAY_MS * Math.pow(2, retryCount) + Math.random() * 500;
    console.log(`Rate limited. Waiting ${Math.round(delay / 1000)}s before retry...`);
    await sleep(delay);
    return webflowRequest<T>(endpoint, options, retryCount + 1);
  }

  if (!response.ok) {
    const errorBody = await response.text();
    let errorMessage = `API Error ${response.status}: ${response.statusText}`;

    try {
      const errorJson = JSON.parse(errorBody);
      errorMessage = `API Error ${response.status}: ${errorJson.message || errorJson.error || response.statusText}`;
    } catch {
      // Use default error message
    }

    if (response.status === 401) {
      console.error('\nError: Invalid API token');
      console.error('Please ensure your WEBFLOW_API_TOKEN has the following scopes:');
      console.error('  - cms:read');
      console.error('  - cms:write');
    } else if (response.status === 403) {
      console.error('\nError: Insufficient permissions');
      console.error('Required scopes: cms:read, cms:write');
    } else if (response.status === 404) {
      console.error('\nError: Collection not found');
      console.error('Please verify your WEBFLOW_COLLECTION_ID');
    } else if (response.status === 422) {
      console.error('\nValidation Error:');
      console.error(errorBody);
    }

    throw new Error(errorMessage);
  }

  return response.json() as Promise<T>;
}

async function getCollection(collectionId: string, token: string): Promise<WebflowCollection> {
  return webflowRequest<WebflowCollection>(`/collections/${collectionId}`, { token });
}

async function createField(
  collectionId: string,
  field: FieldDefinition,
  token: string
): Promise<WebflowField> {
  const body: Record<string, unknown> = {
    type: field.type,
    displayName: field.displayName,
    slug: field.slug,
    isRequired: field.isRequired,
  };

  if (field.helpText) {
    body.helpText = field.helpText;
  }

  if (field.metadata) {
    body.metadata = field.metadata;
  }

  return webflowRequest<WebflowField>(`/collections/${collectionId}/fields`, {
    method: 'POST',
    body,
    token,
  });
}

// Display functions
function printTable(headers: string[], rows: string[][]): void {
  const colWidths = headers.map((h, i) =>
    Math.max(h.length, ...rows.map((r) => (r[i] || '').length))
  );

  const separator = colWidths.map((w) => '-'.repeat(w + 2)).join('+');
  const formatRow = (row: string[]) =>
    row.map((cell, i) => ` ${(cell || '').padEnd(colWidths[i])} `).join('|');

  console.log(separator);
  console.log(formatRow(headers));
  console.log(separator);
  rows.forEach((row) => console.log(formatRow(row)));
  console.log(separator);
}

function generateTypeScript(fields: WebflowField[]): string {
  const lines: string[] = [
    '/**',
    ' * Auto-generated TypeScript types from Webflow CMS schema',
    ` * Generated: ${new Date().toISOString()}`,
    ' */',
    '',
    '// Field slugs for type-safe access',
    'export const WEBFLOW_FIELD_SLUGS = {',
  ];

  fields.forEach((field) => {
    const constName = field.slug.replace(/-/g, '_').toUpperCase();
    lines.push(`  ${constName}: '${field.slug}',`);
  });

  lines.push('} as const;');
  lines.push('');
  lines.push('export type WebflowFieldSlug = (typeof WEBFLOW_FIELD_SLUGS)[keyof typeof WEBFLOW_FIELD_SLUGS];');
  lines.push('');

  // Generate interface for blog post
  lines.push('// Blog Post item interface');
  lines.push('export interface BlogPostFieldData {');

  fields.forEach((field) => {
    const tsType = mapWebflowTypeToTS(field);
    const optional = field.isRequired ? '' : '?';
    lines.push(`  /** ${field.displayName} */`);
    lines.push(`  '${field.slug}'${optional}: ${tsType};`);
  });

  lines.push('}');
  lines.push('');

  // Generate interface for Webflow item
  lines.push('export interface WebflowBlogPost {');
  lines.push('  id: string;');
  lines.push('  cmsLocaleId?: string;');
  lines.push('  lastPublished?: string;');
  lines.push('  lastUpdated: string;');
  lines.push('  createdOn: string;');
  lines.push('  isArchived: boolean;');
  lines.push('  isDraft: boolean;');
  lines.push('  fieldData: BlogPostFieldData;');
  lines.push('}');

  return lines.join('\n');
}

function mapWebflowTypeToTS(field: WebflowField): string {
  switch (field.type) {
    case 'PlainText':
    case 'RichText':
      return 'string';
    case 'Bool':
      return 'boolean';
    case 'Number':
      return 'number';
    case 'DateTime':
      return 'string';
    case 'ImageRef':
      return '{ fileId: string; url: string; alt?: string } | null';
    case 'ItemRef':
      return 'string | null';
    case 'ItemRefSet':
      return 'string[]';
    case 'Option':
      if (field.metadata?.options) {
        const options = field.metadata.options.map((o) => `'${o.id}'`).join(' | ');
        return options || 'string';
      }
      return 'string';
    default:
      return 'unknown';
  }
}

// Main function
async function main(): Promise<void> {
  console.log('Webflow CMS Setup Script');
  console.log('========================\n');

  // Parse arguments
  const { dryRun, force, outputTypes } = parseArgs();

  if (dryRun) {
    console.log('[DRY RUN MODE - No changes will be made]\n');
  }

  // Get environment variables
  const token = getEnvVar('WEBFLOW_API_TOKEN');
  const siteId = getEnvVar('WEBFLOW_SITE_ID');
  const collectionId = getEnvVar('WEBFLOW_COLLECTION_ID');

  console.log(`Connecting to Webflow API v2...`);
  console.log(`Site ID: ${siteId}`);
  console.log(`Collection ID: ${collectionId}\n`);

  // Get collection details
  console.log('Retrieving existing fields...\n');
  let collection: WebflowCollection;

  try {
    collection = await getCollection(collectionId, token);
  } catch (error) {
    console.error(`Failed to retrieve collection: ${error}`);
    process.exit(1);
  }

  console.log(`Collection: ${collection.displayName} (${collection.singularName})`);
  console.log(`\nExisting Fields (${collection.fields.length} found):\n`);

  // Display existing fields
  const fieldRows = collection.fields.map((f) => [
    f.displayName,
    f.slug,
    f.type,
    f.isRequired ? 'Yes' : 'No',
    f.id,
  ]);

  printTable(['Field Name', 'Slug', 'Type', 'Required', 'Field ID'], fieldRows);

  // Compare against required schema
  console.log('\nComparing against required schema...\n');

  const existingSlugs = new Set(collection.fields.map((f) => f.slug));
  const requiredSlugs = new Set([...EXISTING_FIELDS, ...NEW_FIELDS].map((f) => f.slug));

  // Check for missing required existing fields
  const missingExisting = EXISTING_FIELDS.filter((f) => !existingSlugs.has(f.slug));
  if (missingExisting.length > 0) {
    console.log('Warning: Missing expected existing fields:');
    missingExisting.forEach((f) => console.log(`  - ${f.displayName} (${f.slug})`));
    console.log('');
  }

  // Check for extra fields
  const extraFields = collection.fields.filter((f) => !requiredSlugs.has(f.slug));
  if (extraFields.length > 0) {
    console.log('Note: Additional fields in collection (not in spec):');
    extraFields.forEach((f) => console.log(`  - ${f.displayName} (${f.slug})`));
    console.log('');
  }

  // Identify missing new fields
  const missingNew = NEW_FIELDS.filter((f) => !existingSlugs.has(f.slug));

  if (missingNew.length === 0) {
    console.log('All required new fields already exist.\n');
  } else {
    console.log(`Missing Fields (${missingNew.length} to add):`);
    missingNew.forEach((f) => console.log(`  - ${f.displayName} (${f.type})`));
    console.log('');

    // Check field limit
    const totalAfterAdd = collection.fields.length + missingNew.length;
    if (totalAfterAdd > 60) {
      console.error(`Error: Adding ${missingNew.length} fields would exceed the 60 field limit.`);
      console.error(`Current: ${collection.fields.length}, After: ${totalAfterAdd}`);
      process.exit(1);
    }

    // Confirm before proceeding
    if (!dryRun && !force) {
      const proceed = await confirm(`\nAdd ${missingNew.length} new fields?`);
      if (!proceed) {
        console.log('Aborted.');
        process.exit(0);
      }
    }

    // Add missing fields
    if (!dryRun) {
      console.log('\nAdding missing fields...\n');

      for (let i = 0; i < missingNew.length; i++) {
        const field = missingNew[i];
        process.stdout.write(`[${i + 1}/${missingNew.length}] Creating field: ${field.displayName}...`);

        try {
          // Set collection ID for reference fields
          if ((field.type === 'ItemRef' || field.type === 'Reference') && field.metadata) {
            field.metadata.collectionId = collectionId;
          }

          await createField(collectionId, field, token);
          console.log(' OK');
        } catch (error) {
          console.log(' FAILED');
          console.error(`  Error: ${error}`);
        }

        // Rate limiting delay
        if (i < missingNew.length - 1) {
          await sleep(RATE_LIMIT_DELAY_MS);
        }
      }
    } else {
      console.log('[DRY RUN] Would add the following fields:');
      missingNew.forEach((f) => {
        console.log(`  - ${f.displayName} (${f.type})`);
        if (f.metadata?.options) {
          console.log(`    Options: ${f.metadata.options.map((o) => o.name).join(', ')}`);
        }
      });
    }
  }

  // Refresh collection and generate types
  console.log('\nRefreshing collection data...\n');

  try {
    collection = await getCollection(collectionId, token);
  } catch (error) {
    console.error(`Failed to refresh collection: ${error}`);
    process.exit(1);
  }

  console.log('Setup Complete!');
  console.log(`Total fields: ${collection.fields.length}/60\n`);

  // Generate TypeScript types
  const typeScript = generateTypeScript(collection.fields);

  if (outputTypes) {
    const fs = await import('fs/promises');
    const path = await import('path');

    // Ensure directory exists
    const dir = path.dirname(outputTypes);
    await fs.mkdir(dir, { recursive: true });

    await fs.writeFile(outputTypes, typeScript, 'utf-8');
    console.log(`Generated TypeScript types saved to: ${outputTypes}`);
  } else {
    console.log('Generated TypeScript types:\n');
    console.log('---');
    console.log(typeScript);
    console.log('---');
    console.log('\nTo save to a file, use: --output-types=path/to/types.ts');
  }
}

// Run
main().catch((error) => {
  console.error('Unexpected error:', error);
  process.exit(1);
});
