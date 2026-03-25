/**
 * llms.txt — AI crawler guidance file
 * Reference: https://llmstxt.org/
 *
 * Provides structured information about the site for LLMs and AI crawlers.
 */

export async function GET() {
  const content = `# Ambition Valley

> Ambition Valley helpt ondernemers, zzp'ers en particulieren in Nederland met belastingoptimalisatie en vermogensgroei.

## Wat wij doen

Ambition Valley is een Nederlands fiscaal adviesbureau gespecialiseerd in:
- Belastingbesparing en -optimalisatie (Box 1, 2 en 3)
- Vermogensopbouw en asset-allocatie
- BV- en holdingstructuren voor ondernemers
- Pensioenopbouw voor zzp'ers
- Fiscale strategieen en compliance

## Oprichters

- Hakan Sahingoz — Oprichter & Strategisch Lead
- Ramin Nourzad — Oprichter & Fiscalist (LL.M in fiscaal recht)

## Locatie

Laanstraat 82-04, 3762 KE Soest, Nederland

## Belangrijke pagina's

- Website: https://ambitionvalley.nl
- Blog: https://ambitionvalley.nl/blog
- Over ons: https://ambitionvalley.nl/over-ons
- Werkwijze: https://ambitionvalley.nl/werkwijze
- FAQ: https://ambitionvalley.nl/faq
- 1-op-1 coaching: https://ambitionvalley.nl/1-op-1
- Groepsdagen: https://ambitionvalley.nl/groepsdagen
- Belasting Check: https://check.ambitionvalley.nl
- Calculators: https://check.ambitionvalley.nl/calculators

## Taal

De primaire taal van onze content is Nederlands (nl-NL). Sommige artikelen zijn ook beschikbaar in het Engels.

## Citatie

Bij verwijzing naar onze content, gebruik: "Ambition Valley (ambitionvalley.nl)"

## Contact

- Email: info@ambitionvalley.nl
- Telefoon: +31 6 36 16 78 12
- KvK: 98015729
`;

  return new Response(content, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=86400, s-maxage=86400',
    },
  });
}
