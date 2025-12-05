import type { SparenVsBeleggenInput, SparenVsBeleggenOutput, MaandData, JaarData } from './types'

/**
 * Calculate savings vs investing comparison
 *
 * Monthly simulation formula:
 * value = previous_value * (1 + monthly_rate) + monthly_deposit
 *
 * Where:
 *   monthly_rate = annual_rate / 12
 */
export function calculate(input: SparenVsBeleggenInput): SparenVsBeleggenOutput {
  const {
    startkapitaal,
    maandInleg,
    spaarrente,
    beleggingsRendement,
    looptijdJaar,
  } = input

  // Convert annual rates to monthly
  const maandRenteSparen = spaarrente / 100 / 12
  const maandRendementBeleggen = beleggingsRendement / 100 / 12

  // Total months
  const totaalMaanden = looptijdJaar * 12

  // Track monthly values
  const maandData: MaandData[] = []
  const jaarData: JaarData[] = []

  let waardeSparen = startkapitaal
  let waardeBeleggen = startkapitaal

  // Add year 0 (starting point)
  jaarData.push({
    jaar: 0,
    waardeSparen: startkapitaal,
    waardeBeleggen: startkapitaal,
    totaleInleg: startkapitaal,
    renteSparen: 0,
    rendementBeleggen: 0,
  })

  // Month-by-month simulation
  for (let maand = 1; maand <= totaalMaanden; maand++) {
    // Apply interest/return, then add monthly deposit
    waardeSparen = waardeSparen * (1 + maandRenteSparen) + maandInleg
    waardeBeleggen = waardeBeleggen * (1 + maandRendementBeleggen) + maandInleg

    // Store monthly data (optionally only store yearly snapshots for performance)
    if (maand % 12 === 0 || maand === totaalMaanden) {
      maandData.push({
        maand,
        waardeSparen: Math.round(waardeSparen * 100) / 100,
        waardeBeleggen: Math.round(waardeBeleggen * 100) / 100,
      })

      // Store yearly data
      const jaar = Math.ceil(maand / 12)
      const inlegTotNu = startkapitaal + maandInleg * maand
      jaarData.push({
        jaar,
        waardeSparen: Math.round(waardeSparen * 100) / 100,
        waardeBeleggen: Math.round(waardeBeleggen * 100) / 100,
        totaleInleg: Math.round(inlegTotNu * 100) / 100,
        renteSparen: Math.round((waardeSparen - inlegTotNu) * 100) / 100,
        rendementBeleggen: Math.round((waardeBeleggen - inlegTotNu) * 100) / 100,
      })
    }
  }

  // Calculate totals
  const totaleInleg = startkapitaal + maandInleg * totaalMaanden
  const eindkapitaalSparen = Math.round(waardeSparen * 100) / 100
  const eindkapitaalBeleggen = Math.round(waardeBeleggen * 100) / 100

  return {
    eindkapitaalSparen,
    eindkapitaalBeleggen,
    verschil: Math.round((eindkapitaalBeleggen - eindkapitaalSparen) * 100) / 100,
    totaleInleg: Math.round(totaleInleg * 100) / 100,
    renteOpbrengstSparen: Math.round((eindkapitaalSparen - totaleInleg) * 100) / 100,
    rendementOpbrengstBeleggen: Math.round((eindkapitaalBeleggen - totaleInleg) * 100) / 100,
    maandData,
    jaarData,
  }
}
