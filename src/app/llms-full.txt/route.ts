/**
 * llms-full.txt — Complete content index for AI crawlers
 *
 * Dynamically generates a full content index from Webflow CMS,
 * listing all published blog posts with titles, URLs, and summaries.
 */

import { createWebflowClient } from '@/integrations/seo-engine';

interface BlogFieldData {
  name: string;
  slug: string;
  'post-summary'?: string;
  'meta-description'?: string;
  language?: string;
  'source-keyword'?: string;
}

export async function GET() {
  let blogSection = '';

  try {
    if (process.env.WEBFLOW_API_TOKEN && process.env.WEBFLOW_COLLECTION_ID) {
      const client = createWebflowClient({
        apiToken: process.env.WEBFLOW_API_TOKEN,
        siteId: process.env.WEBFLOW_SITE_ID || '',
        collectionId: process.env.WEBFLOW_COLLECTION_ID,
      });

      const allItems: { fieldData: BlogFieldData }[] = [];
      let offset = 0;
      const limit = 100;

      while (true) {
        const response = await client.listItems<BlogFieldData>({ limit, offset });
        allItems.push(...response.items.filter(item => !item.isDraft && !item.isArchived));
        if (response.items.length < limit) break;
        offset += limit;
      }

      if (allItems.length > 0) {
        blogSection = `\n## Blog Artikelen (${allItems.length} gepubliceerd)\n\n`;
        for (const item of allItems) {
          const { name, slug } = item.fieldData;
          const summary = item.fieldData['post-summary'] || item.fieldData['meta-description'] || '';
          const language = item.fieldData.language || 'Dutch';
          blogSection += `### ${name}\n`;
          blogSection += `- URL: https://ambitionvalley.nl/blog-posts/${slug}\n`;
          if (summary) blogSection += `- Samenvatting: ${summary}\n`;
          blogSection += `- Taal: ${language}\n`;
          blogSection += `\n`;
        }
      }
    }
  } catch (error) {
    console.error('Failed to fetch blog posts for llms-full.txt:', error);
    blogSection = '\n## Blog Artikelen\n\nKon niet worden geladen. Bezoek https://ambitionvalley.nl/blog voor actuele artikelen.\n';
  }

  const content = `# Ambition Valley — Volledig Contentoverzicht

> Ambition Valley helpt ondernemers, zzp'ers en particulieren in Nederland met belastingoptimalisatie en vermogensgroei.

## Bedrijfsinformatie

- Naam: Ambition Valley VOF
- Oprichters: Hakan Sahingoz (Strategisch Lead), Ramin Nourzad (Fiscalist LL.M)
- Adres: Laanstraat 82-04, 3762 KE Soest, Nederland
- KvK: 98015729
- BTW: NL86832557B01
- Email: info@ambitionvalley.nl
- Telefoon: +31 6 36 16 78 12

## Expertise

- Belastingoptimalisatie (Box 1, 2, 3)
- Vermogensopbouw & asset-allocatie
- BV- en holdingstructuren
- Pensioenopbouw voor zzp'ers
- Fiscale compliance en aangiften
- Dashboard & community voor klanten

## Diensten

### 1-op-1 Trajecten
- URL: https://ambitionvalley.nl/1-op-1
- Drie pakketten: Financieel Fundament (€995), Private Wealth (€2.250), Ambition Wealth Circle (€3.500)
- Inclusief 100% terugverdiengarantie

### Groepsdagen
- URL: https://ambitionvalley.nl/groepsdagen
- Groepsgewijze sessies over belastingbesparing, vermogensopbouw en BV-structuren

## Pagina's

| Pagina | URL |
|--------|-----|
| Homepage | https://ambitionvalley.nl |
| Over ons | https://ambitionvalley.nl/over-ons |
| Ons Team | https://ambitionvalley.nl/ons-team |
| Werkwijze | https://ambitionvalley.nl/werkwijze |
| FAQ | https://ambitionvalley.nl/faq |
| 1-op-1 | https://ambitionvalley.nl/1-op-1 |
| Groepsdagen | https://ambitionvalley.nl/groepsdagen |
| Blog | https://ambitionvalley.nl/blog |
| Contact | https://ambitionvalley.nl/contact-us |
| Belasting Check | https://check.ambitionvalley.nl |
| Sparen vs Beleggen Calculator | https://check.ambitionvalley.nl/calculators/sparen-vs-beleggen |
| Pensioenbeleggen Calculator | https://check.ambitionvalley.nl/calculators/pensioenbeleggen |

## Team

### Hakan Sahingoz
- Rol: Oprichter & Strategisch Lead
- URL: https://ambitionvalley.nl/team/hakan-sahingoz
- Email: hakan@ambitionvalley.nl

### Ramin Nourzad
- Rol: Oprichter & Fiscalist (LL.M)
- URL: https://ambitionvalley.nl/team/ramin
- Email: ramin@ambitionvalley.nl
- Opleiding: Master fiscaal recht (LL.M)
${blogSection}
## Citatie

Bij verwijzing naar onze content, gebruik: "Ambition Valley (ambitionvalley.nl)"

## Taal

De primaire taal is Nederlands (nl-NL). Sommige artikelen zijn ook beschikbaar in het Engels.
`;

  return new Response(content, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  });
}
