import { renderToBuffer } from '@react-pdf/renderer'
import { PensioenbeleggenReport, PensioenbeleggenReportData } from './templates/pensioenbeleggen'
import React from 'react'

/**
 * Generate a PDF report for Pensioenbeleggen calculator
 * @param data - The calculator inputs and results
 * @returns Buffer containing the PDF data
 */
export async function generatePensioenbeleggenReport(data: Omit<PensioenbeleggenReportData, 'generatedDate'>): Promise<Buffer> {
  const reportData: PensioenbeleggenReportData = {
    ...data,
    generatedDate: new Date().toLocaleDateString('nl-NL', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }),
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const element = React.createElement(PensioenbeleggenReport, { data: reportData }) as any
  const pdfBuffer = await renderToBuffer(element)

  return pdfBuffer as Buffer
}

/**
 * Format the PDF filename for download
 * @returns Formatted filename string
 */
export function getPensioenbeleggenReportFilename(): string {
  const date = new Date().toISOString().split('T')[0]
  return `pensioenanalyse-ambitionvalley-${date}.pdf`
}

export type { PensioenbeleggenReportData }
