import type { CalculatorConfig, CalculatorModule } from '../types/calculator'

/**
 * Registry entry stored in the map
 */
export interface RegistryEntry {
  slug: string
  name: string
  description: string
  version: string
  status: CalculatorConfig['status']
  category: CalculatorConfig['category']
  path: string
}

/**
 * Loaded calculator module with all exports
 */
export interface LoadedCalculator {
  config: CalculatorConfig
  module: CalculatorModule
}

/**
 * Registry query options
 */
export interface RegistryQueryOptions {
  status?: CalculatorConfig['status']
  category?: CalculatorConfig['category']
  tags?: string[]
}

/**
 * Registry statistics
 */
export interface RegistryStats {
  total: number
  active: number
  beta: number
  deprecated: number
  disabled: number
  byCategory: Record<string, number>
}
