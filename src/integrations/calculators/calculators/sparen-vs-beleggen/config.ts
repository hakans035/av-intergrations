import type { CalculatorConfig } from '../../types/calculator'

export const config: CalculatorConfig = {
  slug: 'sparen-vs-beleggen',
  name: 'Sparen vs Beleggen',
  description: 'Vergelijk het eindkapitaal van sparen versus beleggen over tijd',
  version: '1.0.0',
  status: 'active',
  category: 'investments',
  tags: ['sparen', 'beleggen', 'investeren', 'vergelijken', 'rendement'],
  icon: 'trending-up',
  defaults: {
    startkapitaal: 10000,
    maandInleg: 830,
    spaarrente: 1.5,
    beleggingsRendement: 8,
    looptijdJaar: 15,
    risicoProfiel: 'offensief',
  },
  features: {
    charts: false,
    exportPdf: false,
  },
  seo: {
    title: 'Sparen vs Beleggen Calculator | Vergelijk je Vermogensgroei',
    description:
      'Bereken en vergelijk het eindkapitaal van sparen versus beleggen. Kies je risicoprofiel en zie het verschil over tijd.',
    keywords: ['sparen vs beleggen', 'beleggingscalculator', 'vermogensgroei', 'rendement berekenen'],
  },
}
