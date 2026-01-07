import { config } from 'dotenv';
import path from 'path';
config({ path: path.resolve(process.cwd(), '.env.local') });

import { createWebflowClient } from '../src/integrations/seo-engine';

const slug = process.argv[2];

async function main() {
  if (!slug) {
    console.log('Usage: npx tsx scripts/get-post-content.ts <slug>');
    process.exit(1);
  }

  const client = createWebflowClient({
    apiToken: process.env.WEBFLOW_API_TOKEN!,
    siteId: process.env.WEBFLOW_SITE_ID!,
    collectionId: process.env.WEBFLOW_COLLECTION_ID!,
  });

  const response = await client.listItems({ limit: 100 });
  const post = response.items.find(item =>
    (item.fieldData as Record<string, unknown>).slug === slug
  );

  if (post) {
    const richText = (post.fieldData as Record<string, unknown>)['rich-text'] as string;
    console.log(richText);
  } else {
    console.log('Post not found');
  }
}

main();
