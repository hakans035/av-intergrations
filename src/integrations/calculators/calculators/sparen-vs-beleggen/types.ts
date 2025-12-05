// Risk profiles for investing
export type RisicoProfiel =
  | 'zeer-defensief'
  | 'defensief'
  | 'neutraal'
  | 'offensief'
  | 'zeer-offensief'
  | 'custom'

// Risk profile configuration
export const RISICO_PROFIELEN: Record<Exclude<RisicoProfiel, 'custom'>, { label: string; rendement: number }> = {
  'zeer-defensief': { label: 'Zeer Defensief', rendement: 2.5 },
  'defensief': { label: 'Defensief', rendement: 4 },
  'neutraal': { label: 'Neutraal', rendement: 6 },
  'offensief': { label: 'Offensief', rendement: 8 },
  'zeer-offensief': { label: 'Zeer Offensief', rendement: 10 },
}

// Input for the calculator
export interface SparenVsBeleggenInput {
  startkapitaal: number        // Initial capital (e.g., 10000)
  maandInleg: number           // Monthly deposit (e.g., 830)
  spaarrente: number           // Savings interest rate in % (e.g., 1.5)
  beleggingsRendement: number  // Investment return in % (e.g., 8)
  looptijdJaar: number         // Duration in years (e.g., 15)
}

// Monthly data point for charts/tables
export interface MaandData {
  maand: number
  waardeSparen: number
  waardeBeleggen: number
}

// Yearly data point for charts/tables
export interface JaarData {
  jaar: number
  waardeSparen: number
  waardeBeleggen: number
  totaleInleg: number
  renteSparen: number
  rendementBeleggen: number
}

// Output from the calculator
export interface SparenVsBeleggenOutput {
  // Final values
  eindkapitaalSparen: number
  eindkapitaalBeleggen: number
  verschil: number

  // Breakdown
  totaleInleg: number
  renteOpbrengstSparen: number
  rendementOpbrengstBeleggen: number

  // Monthly data for optional chart/table
  maandData: MaandData[]

  // Yearly data for charts/tables
  jaarData: JaarData[]
}
