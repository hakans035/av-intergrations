import type { CalculatorConfig } from '../../types/calculator'
import { DEFAULT_INPUT } from './types'

export const config: CalculatorConfig = {
  slug: 'pensioenbeleggen',
  name: 'Pensioenbeleggen',
  description: 'Bereken het effect van beleggen voor pensioen met opbouw- en doorgroeifase',
  version: '1.0.0',
  status: 'active',
  category: 'retirement',
  tags: ['pensioen', 'beleggen', 'rendement', 'opbouw', 'doorgroeien'],
  icon: 'piggy-bank',
  defaults: DEFAULT_INPUT as unknown as Record<string, unknown>,
  features: {
    charts: false,
    exportPdf: false,
  },
  seo: {
    title: 'Pensioenbeleggen Calculator | Bereken uw Pensioenkapitaal',
    description:
      'Bereken wat uw pensioenkapitaal wordt met beleggen. Zie het effect van de opbouwfase en doorgroeifase.',
    keywords: ['pensioen calculator', 'pensioenbeleggen', 'pensioenkapitaal', 'rendement pensioen'],
  },
}
