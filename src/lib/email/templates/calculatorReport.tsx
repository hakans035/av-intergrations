/* eslint-disable @next/next/no-head-element -- Email templates use standard HTML, not Next.js */
import React from 'react'

// Types for email data
export type CalculatorType = 'sparen-vs-beleggen' | 'pensioenbeleggen' | 'vastgoedbelegging'

export interface EmailSummaryData {
  calculatorType: CalculatorType
  // Sparen vs Beleggen
  eindkapitaalBeleggen?: number
  eindkapitaalSparen?: number
  verschil?: number
  // Pensioenbeleggen
  eindkapitaalNaDoorgroei?: number
  totaleLooptijdJaar?: number
  // Vastgoedbelegging
  nettoCashflowPerJaar?: number
  rendementOpEigenVermogen?: number
  eindwaarde?: number
}

export interface CalculatorReportEmailProps {
  summary: EmailSummaryData
}

// Format currency
const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('nl-NL', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value)
}

// Get email subject based on calculator type
export const getEmailSubject = (calculatorType: CalculatorType): string => {
  const subjects: Record<CalculatorType, string> = {
    'sparen-vs-beleggen': 'Uw persoonlijke beleggingsanalyse - Ambition Valley',
    'pensioenbeleggen': 'Uw persoonlijke pensioenanalyse - Ambition Valley',
    'vastgoedbelegging': 'Uw persoonlijke vastgoedanalyse - Ambition Valley',
  }
  return subjects[calculatorType]
}

// Get calculator title
const getCalculatorTitle = (calculatorType: CalculatorType): string => {
  const titles: Record<CalculatorType, string> = {
    'sparen-vs-beleggen': 'Sparen vs Beleggen Analyse',
    'pensioenbeleggen': 'Pensioenbeleggen Analyse',
    'vastgoedbelegging': 'Vastgoedbelegging Analyse',
  }
  return titles[calculatorType]
}

// Render summary based on calculator type
const renderSummary = (summary: EmailSummaryData): React.ReactNode => {
  switch (summary.calculatorType) {
    case 'sparen-vs-beleggen':
      return (
        <>
          <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
            <td
              className="summary-label"
              style={{
                fontSize: '14px',
                color: '#64748b',
                padding: '12px 8px 12px 0',
                verticalAlign: 'top',
                width: '55%',
                lineHeight: '1.5',
              }}
            >
              Eindkapitaal Beleggen:
            </td>
            <td
              className="summary-value"
              style={{
                fontSize: '14px',
                fontWeight: 'bold',
                color: '#1e344b',
                padding: '12px 0 12px 8px',
                verticalAlign: 'top',
                textAlign: 'right',
                width: '45%',
                lineHeight: '1.5',
              }}
            >
              {formatCurrency(summary.eindkapitaalBeleggen || 0)}
            </td>
          </tr>
          <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
            <td
              className="summary-label"
              style={{
                fontSize: '14px',
                color: '#64748b',
                padding: '12px 8px 12px 0',
                verticalAlign: 'top',
                width: '55%',
                lineHeight: '1.5',
              }}
            >
              Eindkapitaal Sparen:
            </td>
            <td
              className="summary-value"
              style={{
                fontSize: '14px',
                fontWeight: 'bold',
                color: '#1e344b',
                padding: '12px 0 12px 8px',
                verticalAlign: 'top',
                textAlign: 'right',
                width: '45%',
                lineHeight: '1.5',
              }}
            >
              {formatCurrency(summary.eindkapitaalSparen || 0)}
            </td>
          </tr>
          <tr>
            <td
              className="summary-label"
              style={{
                fontSize: '14px',
                color: '#64748b',
                padding: '12px 8px 12px 0',
                verticalAlign: 'top',
                width: '55%',
                lineHeight: '1.5',
              }}
            >
              Extra rendement:
            </td>
            <td
              className="summary-value-green"
              style={{
                fontSize: '14px',
                fontWeight: 'bold',
                color: '#22c55e',
                padding: '12px 0 12px 8px',
                verticalAlign: 'top',
                textAlign: 'right',
                width: '45%',
                lineHeight: '1.5',
              }}
            >
              +{formatCurrency(summary.verschil || 0)}
            </td>
          </tr>
        </>
      )
    case 'pensioenbeleggen':
      return (
        <>
          <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
            <td
              className="summary-label"
              style={{
                fontSize: '14px',
                color: '#64748b',
                padding: '12px 8px 12px 0',
                verticalAlign: 'top',
                width: '55%',
                lineHeight: '1.5',
              }}
            >
              Eindkapitaal na {summary.totaleLooptijdJaar} jaar:
            </td>
            <td
              className="summary-value"
              style={{
                fontSize: '14px',
                fontWeight: 'bold',
                color: '#1e344b',
                padding: '12px 0 12px 8px',
                verticalAlign: 'top',
                textAlign: 'right',
                width: '45%',
                lineHeight: '1.5',
              }}
            >
              {formatCurrency(summary.eindkapitaalNaDoorgroei || 0)}
            </td>
          </tr>
          <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
            <td
              className="summary-label"
              style={{
                fontSize: '14px',
                color: '#64748b',
                padding: '12px 8px 12px 0',
                verticalAlign: 'top',
                width: '55%',
                lineHeight: '1.5',
              }}
            >
              Eindkapitaal Sparen:
            </td>
            <td
              className="summary-value"
              style={{
                fontSize: '14px',
                fontWeight: 'bold',
                color: '#1e344b',
                padding: '12px 0 12px 8px',
                verticalAlign: 'top',
                textAlign: 'right',
                width: '45%',
                lineHeight: '1.5',
              }}
            >
              {formatCurrency(summary.eindkapitaalSparen || 0)}
            </td>
          </tr>
          <tr>
            <td
              className="summary-label"
              style={{
                fontSize: '14px',
                color: '#64748b',
                padding: '12px 8px 12px 0',
                verticalAlign: 'top',
                width: '55%',
                lineHeight: '1.5',
              }}
            >
              Extra rendement:
            </td>
            <td
              className="summary-value-green"
              style={{
                fontSize: '14px',
                fontWeight: 'bold',
                color: '#22c55e',
                padding: '12px 0 12px 8px',
                verticalAlign: 'top',
                textAlign: 'right',
                width: '45%',
                lineHeight: '1.5',
              }}
            >
              +{formatCurrency(summary.verschil || 0)}
            </td>
          </tr>
        </>
      )
    case 'vastgoedbelegging':
      return (
        <>
          <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
            <td
              className="summary-label"
              style={{
                fontSize: '14px',
                color: '#64748b',
                padding: '12px 8px 12px 0',
                verticalAlign: 'top',
                width: '55%',
                lineHeight: '1.5',
              }}
            >
              Netto Cashflow per Jaar:
            </td>
            <td
              className="summary-value"
              style={{
                fontSize: '14px',
                fontWeight: 'bold',
                color: '#1e344b',
                padding: '12px 0 12px 8px',
                verticalAlign: 'top',
                textAlign: 'right',
                width: '45%',
                lineHeight: '1.5',
              }}
            >
              {formatCurrency(summary.nettoCashflowPerJaar || 0)}
            </td>
          </tr>
          <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
            <td
              className="summary-label"
              style={{
                fontSize: '14px',
                color: '#64748b',
                padding: '12px 8px 12px 0',
                verticalAlign: 'top',
                width: '55%',
                lineHeight: '1.5',
              }}
            >
              ROE (Rendement EV):
            </td>
            <td
              className="summary-value"
              style={{
                fontSize: '14px',
                fontWeight: 'bold',
                color: '#1e344b',
                padding: '12px 0 12px 8px',
                verticalAlign: 'top',
                textAlign: 'right',
                width: '45%',
                lineHeight: '1.5',
              }}
            >
              {summary.rendementOpEigenVermogen || 0}%
            </td>
          </tr>
          <tr>
            <td
              className="summary-label"
              style={{
                fontSize: '14px',
                color: '#64748b',
                padding: '12px 8px 12px 0',
                verticalAlign: 'top',
                width: '55%',
                lineHeight: '1.5',
              }}
            >
              Eindwaarde Vastgoed:
            </td>
            <td
              className="summary-value-green"
              style={{
                fontSize: '14px',
                fontWeight: 'bold',
                color: '#22c55e',
                padding: '12px 0 12px 8px',
                verticalAlign: 'top',
                textAlign: 'right',
                width: '45%',
                lineHeight: '1.5',
              }}
            >
              {formatCurrency(summary.eindwaarde || 0)}
            </td>
          </tr>
        </>
      )
  }
}

// Email Template Component - Mobile Optimized
export const CalculatorReportEmail: React.FC<CalculatorReportEmailProps> = ({ summary }) => {
  const calculatorTitle = getCalculatorTitle(summary.calculatorType)

  return (
    <html>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta name="x-apple-disable-message-reformatting" />
        <meta name="format-detection" content="telephone=no, address=no, email=no, date=no" />
        <title>{getEmailSubject(summary.calculatorType)}</title>
        <style dangerouslySetInnerHTML={{ __html: `
          /* Reset styles */
          body, table, td, p, a, li, blockquote { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
          table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
          img { -ms-interpolation-mode: bicubic; border: 0; height: auto; line-height: 100%; outline: none; text-decoration: none; }

          /* Mobile styles */
          @media only screen and (max-width: 600px) {
            .container { width: 100% !important; max-width: 100% !important; }
            .content { padding: 24px 16px !important; }
            .header { padding: 20px 16px !important; }
            .footer { padding: 20px 16px !important; }
            .summary-box { padding: 16px !important; }
            .attachment-box { padding: 12px !important; }
            .cta-button { padding: 16px 24px !important; width: 100% !important; box-sizing: border-box !important; display: block !important; text-align: center !important; }
            .summary-table td { display: block !important; width: 100% !important; text-align: left !important; padding: 8px 0 !important; }
            .summary-label { font-weight: normal !important; color: #64748b !important; padding-bottom: 4px !important; }
            .summary-value, .summary-value-green { font-weight: bold !important; padding-bottom: 16px !important; border-bottom: 1px solid #e2e8f0 !important; }
            .logo { font-size: 20px !important; }
            .greeting { font-size: 15px !important; }
          }
        `}} />
      </head>
      <body style={{
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
        backgroundColor: '#f8fafc',
        margin: 0,
        padding: '16px',
        WebkitTextSizeAdjust: '100%',
      }}>
        {/* Wrapper table for Outlook */}
        <table role="presentation" cellPadding={0} cellSpacing={0} width="100%" style={{ backgroundColor: '#f8fafc' }}>
          <tbody>
            <tr>
              <td align="center" style={{ padding: '16px 0' }}>
                {/* Main container */}
                <table
                  role="presentation"
                  className="container"
                  cellPadding={0}
                  cellSpacing={0}
                  style={{
                    maxWidth: '600px',
                    width: '100%',
                    backgroundColor: '#ffffff',
                    borderRadius: '12px',
                    overflow: 'hidden',
                    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.07)',
                  }}
                >
                  <tbody>
                    {/* Header */}
                    <tr>
                      <td
                        className="header"
                        align="center"
                        style={{
                          backgroundColor: '#307cf1',
                          padding: '28px 24px',
                        }}
                      >
                        <h1
                          className="logo"
                          style={{
                            color: '#ffffff',
                            fontSize: '22px',
                            fontWeight: 'bold',
                            margin: 0,
                            letterSpacing: '0.5px',
                          }}
                        >
                          AMBITION VALLEY
                        </h1>
                      </td>
                    </tr>

                    {/* Content */}
                    <tr>
                      <td className="content" style={{ padding: '32px 28px' }}>
                        {/* Greeting */}
                        <p
                          className="greeting"
                          style={{
                            fontSize: '16px',
                            color: '#1e344b',
                            marginTop: 0,
                            marginBottom: '16px',
                            lineHeight: '1.6',
                          }}
                        >
                          Beste lezer,
                        </p>

                        {/* Intro */}
                        <p style={{
                          fontSize: '15px',
                          color: '#64748b',
                          marginTop: 0,
                          marginBottom: '24px',
                          lineHeight: '1.7',
                        }}>
                          Bedankt voor het gebruik van onze {calculatorTitle.toLowerCase()}!
                          In de bijlage vindt u uw persoonlijke analyse met een gedetailleerd
                          overzicht van uw financiele projecties.
                        </p>

                        {/* Summary Box */}
                        <table
                          role="presentation"
                          className="summary-box"
                          cellPadding={0}
                          cellSpacing={0}
                          width="100%"
                          style={{
                            backgroundColor: '#f8fafc',
                            borderRadius: '8px',
                            marginBottom: '24px',
                          }}
                        >
                          <tbody>
                            <tr>
                              <td style={{ padding: '20px' }}>
                                <h2 style={{
                                  fontSize: '13px',
                                  fontWeight: 'bold',
                                  color: '#1e344b',
                                  marginTop: 0,
                                  marginBottom: '16px',
                                  textTransform: 'uppercase',
                                  letterSpacing: '0.5px',
                                }}>
                                  Samenvatting
                                </h2>
                                <table
                                  role="presentation"
                                  className="summary-table"
                                  cellPadding={0}
                                  cellSpacing={0}
                                  width="100%"
                                  style={{ borderCollapse: 'collapse' }}
                                >
                                  <tbody>
                                    {renderSummary(summary)}
                                  </tbody>
                                </table>
                              </td>
                            </tr>
                          </tbody>
                        </table>

                        {/* Attachment Notice */}
                        <table
                          role="presentation"
                          className="attachment-box"
                          cellPadding={0}
                          cellSpacing={0}
                          width="100%"
                          style={{
                            backgroundColor: '#eff6ff',
                            borderRadius: '8px',
                            marginBottom: '24px',
                          }}
                        >
                          <tbody>
                            <tr>
                              <td align="center" style={{ padding: '16px' }}>
                                <p style={{
                                  fontSize: '14px',
                                  color: '#307cf1',
                                  margin: 0,
                                  fontWeight: '500',
                                }}>
                                  Bekijk het volledige rapport in de bijlage (PDF)
                                </p>
                              </td>
                            </tr>
                          </tbody>
                        </table>

                        {/* Divider */}
                        <table role="presentation" cellPadding={0} cellSpacing={0} width="100%">
                          <tbody>
                            <tr>
                              <td style={{ borderTop: '1px solid #e2e8f0', padding: '16px 0' }} />
                            </tr>
                          </tbody>
                        </table>

                        {/* CTA Section */}
                        <table role="presentation" cellPadding={0} cellSpacing={0} width="100%">
                          <tbody>
                            <tr>
                              <td align="center" style={{ paddingBottom: '24px' }}>
                                <h3 style={{
                                  fontSize: '17px',
                                  fontWeight: 'bold',
                                  color: '#1e344b',
                                  margin: '0 0 8px 0',
                                }}>
                                  Wilt u persoonlijk advies?
                                </h3>
                                <p style={{
                                  fontSize: '14px',
                                  color: '#64748b',
                                  margin: '0 0 20px 0',
                                  lineHeight: '1.6',
                                }}>
                                  Onze experts helpen u graag met het maken van de juiste financiele keuzes.
                                </p>
                                <a
                                  href="https://check.ambitionvalley.nl/booking"
                                  className="cta-button"
                                  style={{
                                    display: 'inline-block',
                                    padding: '16px 32px',
                                    backgroundColor: '#307cf1',
                                    color: '#ffffff',
                                    textDecoration: 'none',
                                    borderRadius: '100px',
                                    fontSize: '15px',
                                    fontWeight: 'bold',
                                    textAlign: 'center',
                                    minWidth: '200px',
                                  }}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                >
                                  Plan een gratis gesprek
                                </a>
                              </td>
                            </tr>
                          </tbody>
                        </table>

                        {/* Divider */}
                        <table role="presentation" cellPadding={0} cellSpacing={0} width="100%">
                          <tbody>
                            <tr>
                              <td style={{ borderTop: '1px solid #e2e8f0', padding: '16px 0' }} />
                            </tr>
                          </tbody>
                        </table>

                        {/* Signature */}
                        <table role="presentation" cellPadding={0} cellSpacing={0} width="100%">
                          <tbody>
                            <tr>
                              <td style={{
                                fontSize: '14px',
                                color: '#64748b',
                                lineHeight: '1.6',
                              }}>
                                <p style={{ margin: '0 0 4px 0' }}>Met vriendelijke groet,</p>
                                <p style={{ margin: 0, fontWeight: 'bold', color: '#1e344b' }}>Het Ambition Valley Team</p>
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </td>
                    </tr>

                    {/* Footer */}
                    <tr>
                      <td
                        className="footer"
                        align="center"
                        style={{
                          backgroundColor: '#f8fafc',
                          padding: '24px 28px',
                          borderTop: '1px solid #e2e8f0',
                        }}
                      >
                        <p style={{
                          fontSize: '13px',
                          color: '#64748b',
                          margin: '0 0 8px 0',
                        }}>
                          <a href="mailto:info@ambitionvalley.nl" style={{ color: '#307cf1', textDecoration: 'none' }}>
                            info@ambitionvalley.nl
                          </a>
                          <span style={{ margin: '0 8px', color: '#cbd5e1' }}>|</span>
                          <a href="https://www.ambitionvalley.nl" style={{ color: '#307cf1', textDecoration: 'none' }}>
                            www.ambitionvalley.nl
                          </a>
                        </p>
                        <p style={{
                          fontSize: '11px',
                          color: '#94a3b8',
                          margin: 0,
                          lineHeight: '1.5',
                        }}>
                          U ontvangt deze e-mail omdat u een rapport heeft aangevraagd via onze calculator.
                        </p>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </td>
            </tr>
          </tbody>
        </table>
      </body>
    </html>
  )
}

export default CalculatorReportEmail
