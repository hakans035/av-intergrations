// Components
export { default as CalculatorClient } from './components/CalculatorClient'
export { CalculatorError } from './components/CalculatorError'
export { CalculatorShell } from './components/CalculatorShell'
export { CalculatorLoading } from './components/CalculatorLoading'
export { ReportModal } from './components/ReportModal'

// Registry
export { registry } from './lib/registry'
export { getEnabledCalculators, isCalculatorEnabled } from './config/calculators'

// Types
export type { CalculatorConfig, CalculatorModule, CalculatorUIProps } from './types/calculator'
export type { CalculatorSlug } from './calculators'

// Initialize calculators (registers enabled calculators with registry)
import './calculators'
