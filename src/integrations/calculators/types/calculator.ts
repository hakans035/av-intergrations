import { z } from 'zod'

// Calculator Status
export type CalculatorStatus = 'active' | 'beta' | 'deprecated' | 'disabled'

// Calculator Category
export type CalculatorCategory =
  | 'loans'
  | 'investments'
  | 'savings'
  | 'retirement'
  | 'real-estate'
  | 'business'
  | 'other'

// Calculator Configuration
export interface CalculatorConfig {
  slug: string
  name: string
  description: string
  version: string
  status: CalculatorStatus
  category: CalculatorCategory
  tags?: string[]
  icon?: string
  defaults: Record<string, unknown>
  features?: {
    charts?: boolean
    exportPdf?: boolean
    amortizationTable?: boolean
  }
  seo?: {
    title?: string
    description?: string
    keywords?: string[]
  }
}

// Calculator Module - What each calculator must export
export interface CalculatorModule<TInput = unknown, TOutput = unknown> {
  config: CalculatorConfig
  inputSchema: z.ZodSchema<TInput>
  outputSchema: z.ZodSchema<TOutput>
  calculate: (input: TInput) => TOutput
  CalculatorUI: React.ComponentType<CalculatorUIProps<TInput, TOutput>>
}

// Props passed to calculator UI
export interface CalculatorUIProps<TInput = unknown, TOutput = unknown> {
  config: CalculatorConfig
  defaults: TInput
  onCalculate: (input: TInput) => TOutput
}

// Registry Entry
export interface RegistryEntry {
  slug: string
  name: string
  description: string
  version: string
  status: CalculatorStatus
  category: CalculatorCategory
  path: string
}

// Calculation Result wrapper
export interface CalculationResult<T> {
  success: boolean
  data?: T
  error?: {
    code: string
    message: string
  }
}
