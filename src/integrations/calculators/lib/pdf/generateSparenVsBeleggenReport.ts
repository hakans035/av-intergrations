import { renderToBuffer } from '@react-pdf/renderer'
import { SparenVsBeleggenReport, SparenVsBeleggenReportData } from './templates/sparen-vs-beleggen'
import React from 'react'

/**
 * Generate a PDF report for Sparen vs Beleggen calculator
 * @param data - The calculator inputs and results
 * @returns Buffer containing the PDF data
 */
export async function generateSparenVsBeleggenReport(data: Omit<SparenVsBeleggenReportData, 'generatedDate'>): Promise<Buffer> {
  const reportData: SparenVsBeleggenReportData = {
    ...data,
    generatedDate: new Date().toLocaleDateString('nl-NL', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }),
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const element = React.createElement(SparenVsBeleggenReport, { data: reportData }) as any
  const pdfBuffer = await renderToBuffer(element)

  return pdfBuffer as Buffer
}

/**
 * Format the PDF filename for download
 * @returns Formatted filename string
 */
export function getSparenVsBeleggenReportFilename(): string {
  const date = new Date().toISOString().split('T')[0]
  return `beleggingsanalyse-ambitionvalley-${date}.pdf`
}

export type { SparenVsBeleggenReportData }
