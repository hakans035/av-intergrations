// ============================================
// PENSIOENBELEGGEN CALCULATOR TYPES
// ============================================

// ============================================
// INPUT TYPES
// ============================================

export interface PensioenbeleggenInput {
  startkapitaal: number           // Initial capital
  maandInleg: number              // Monthly contribution
  inlegPeriodeJaar: number        // Contribution period in years
  jaarlijksRendement: number      // Annual return %
  doorgroeiPeriodeJaar: number    // Growth period without contributions (years)
  spaarrente: number              // Savings interest rate %
}

// ============================================
// OUTPUT TYPES
// ============================================

// Yearly data point for charts/tables
export interface JaarData {
  jaar: number
  fase: 'opbouw' | 'doorgroei'
  totaleInleg: number
  kapitaal: number
  rendement: number
  waardeSparen: number            // Value if saved instead
}

export interface PensioenbeleggenOutput {
  // After contribution period
  totaleInleg: number             // Total contributions
  eindkapitaalNaInleg: number     // Capital after contribution period
  rendementOpbouwfase: number     // Return during contribution phase

  // After growth period
  eindkapitaalNaDoorgroei: number // Final capital after growth period
  extraRendementDoorgroei: number // Additional return during growth phase
  totaalRendement: number         // Total return (both phases)

  // Savings comparison
  eindkapitaalSparen: number      // Final capital if saved
  verschil: number                // Difference between investing and saving

  // Summary
  totaleLooptijdJaar: number      // Total duration in years

  // Yearly data for charts/tables
  jaarData: JaarData[]
}

// ============================================
// DEFAULT VALUES
// ============================================

export const DEFAULT_INPUT: PensioenbeleggenInput = {
  startkapitaal: 10000,
  maandInleg: 500,
  inlegPeriodeJaar: 20,
  jaarlijksRendement: 7,
  doorgroeiPeriodeJaar: 10,
  spaarrente: 1.5,
}
