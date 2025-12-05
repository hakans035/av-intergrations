import type { PensioenbeleggenInput, PensioenbeleggenOutput, JaarData } from './types'

/**
 * Calculate pension investment growth through two phases:
 * 1. Contribution phase (opbouwfase) - monthly contributions + compound growth
 * 2. Growth phase (doorgroeifase) - compound growth without contributions
 */
export function calculate(input: PensioenbeleggenInput): PensioenbeleggenOutput {
  const {
    startkapitaal,
    maandInleg,
    inlegPeriodeJaar,
    jaarlijksRendement,
    doorgroeiPeriodeJaar,
    spaarrente = 1.5,  // Default fallback
  } = input

  // Convert annual return to monthly return
  const monthlyReturn = Math.pow(1 + jaarlijksRendement / 100, 1 / 12) - 1
  const monthlySavingsReturn = Math.pow(1 + (spaarrente || 1.5) / 100, 1 / 12) - 1

  // Calculate contribution months and growth months
  const contributionMonths = inlegPeriodeJaar * 12
  const growthMonths = doorgroeiPeriodeJaar * 12

  // Track yearly data
  const jaarData: JaarData[] = []

  // Add year 0
  jaarData.push({
    jaar: 0,
    fase: 'opbouw',
    totaleInleg: startkapitaal,
    kapitaal: startkapitaal,
    rendement: 0,
    waardeSparen: startkapitaal,
  })

  // Phase 1: Contribution period (opbouwfase)
  let balance = startkapitaal
  let savingsBalance = startkapitaal
  for (let month = 1; month <= contributionMonths; month++) {
    balance = balance * (1 + monthlyReturn)
    balance += maandInleg
    savingsBalance = savingsBalance * (1 + monthlySavingsReturn)
    savingsBalance += maandInleg

    // Store yearly data
    if (month % 12 === 0) {
      const jaar = month / 12
      const inlegTotNu = startkapitaal + maandInleg * month
      jaarData.push({
        jaar,
        fase: 'opbouw',
        totaleInleg: Math.round(inlegTotNu * 100) / 100,
        kapitaal: Math.round(balance * 100) / 100,
        rendement: Math.round((balance - inlegTotNu) * 100) / 100,
        waardeSparen: Math.round(savingsBalance * 100) / 100,
      })
    }
  }

  const eindkapitaalNaInleg = balance
  const totaleInleg = startkapitaal + maandInleg * contributionMonths
  const rendementOpbouwfase = eindkapitaalNaInleg - totaleInleg

  // Phase 2: Growth period without contributions (doorgroeifase)
  for (let month = 1; month <= growthMonths; month++) {
    balance = balance * (1 + monthlyReturn)
    savingsBalance = savingsBalance * (1 + monthlySavingsReturn)

    // Store yearly data
    if (month % 12 === 0) {
      const jaar = inlegPeriodeJaar + (month / 12)
      jaarData.push({
        jaar,
        fase: 'doorgroei',
        totaleInleg: Math.round(totaleInleg * 100) / 100,
        kapitaal: Math.round(balance * 100) / 100,
        rendement: Math.round((balance - totaleInleg) * 100) / 100,
        waardeSparen: Math.round(savingsBalance * 100) / 100,
      })
    }
  }

  const eindkapitaalNaDoorgroei = balance
  const eindkapitaalSparen = savingsBalance
  const extraRendementDoorgroei = eindkapitaalNaDoorgroei - eindkapitaalNaInleg
  const totaalRendement = eindkapitaalNaDoorgroei - totaleInleg
  const verschil = eindkapitaalNaDoorgroei - eindkapitaalSparen

  return {
    // After contribution period
    totaleInleg: Math.round(totaleInleg * 100) / 100,
    eindkapitaalNaInleg: Math.round(eindkapitaalNaInleg * 100) / 100,
    rendementOpbouwfase: Math.round(rendementOpbouwfase * 100) / 100,

    // After growth period
    eindkapitaalNaDoorgroei: Math.round(eindkapitaalNaDoorgroei * 100) / 100,
    extraRendementDoorgroei: Math.round(extraRendementDoorgroei * 100) / 100,
    totaalRendement: Math.round(totaalRendement * 100) / 100,

    // Savings comparison
    eindkapitaalSparen: Math.round(eindkapitaalSparen * 100) / 100,
    verschil: Math.round(verschil * 100) / 100,

    // Summary
    totaleLooptijdJaar: inlegPeriodeJaar + doorgroeiPeriodeJaar,

    // Yearly data
    jaarData,
  }
}
