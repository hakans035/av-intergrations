/**
 * Main Calculator Configuration
 *
 * Enable or disable calculators by setting their value to true/false.
 * Disabled calculators will not appear in the app or be accessible via URL.
 */

export const CALCULATOR_CONFIG = {
  // Sparen vs Beleggen Calculator
  'sparen-vs-beleggen': {
    enabled: true,
    order: 1, // Display order (lower = first)
  },

  // Pensioenbeleggen Calculator
  'pensioenbeleggen': {
    enabled: true,
    order: 2,
  },

  // Vastgoedbelegging Calculator
  'vastgoedbelegging': {
    enabled: false,
    order: 3,
  },
} as const

// Helper function to check if calculator is enabled
export function isCalculatorEnabled(slug: string): boolean {
  const config = CALCULATOR_CONFIG[slug as keyof typeof CALCULATOR_CONFIG]
  return config?.enabled ?? false
}

// Get list of enabled calculator slugs (sorted by order)
export function getEnabledCalculators(): string[] {
  return Object.entries(CALCULATOR_CONFIG)
    .filter(([, config]) => config.enabled)
    .sort((a, b) => a[1].order - b[1].order)
    .map(([slug]) => slug)
}

// Type for calculator slugs
export type CalculatorSlug = keyof typeof CALCULATOR_CONFIG
