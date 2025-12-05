/**
 * Calculator Registry Initialization
 *
 * This file registers all available calculators with the registry.
 * Import this file at app startup to populate the registry.
 */

import { registry } from '../lib/registry'
import { isCalculatorEnabled, getEnabledCalculators, type CalculatorSlug } from '../config/calculators'

// Import calculator configs
import { config as sparenVsBeleggenConfig } from './sparen-vs-beleggen/config'
import { config as pensioenbeleggenConfig } from './pensioenbeleggen/config'

// Map of all calculator configs
const allCalculatorConfigs = {
  'sparen-vs-beleggen': sparenVsBeleggenConfig,
  'pensioenbeleggen': pensioenbeleggenConfig,
}

// Register only enabled calculators
Object.entries(allCalculatorConfigs).forEach(([slug, config]) => {
  if (isCalculatorEnabled(slug)) {
    registry.register(config, slug)
  }
})

// Export registry for convenience
export { registry }

// Export list of enabled calculator slugs (from main config)
export const CALCULATOR_SLUGS = getEnabledCalculators()

export type { CalculatorSlug }
