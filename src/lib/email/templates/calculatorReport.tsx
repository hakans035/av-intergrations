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
          <tr>
            <td style={styles.summaryLabel}>Eindkapitaal Beleggen:</td>
            <td style={styles.summaryValue}>{formatCurrency(summary.eindkapitaalBeleggen || 0)}</td>
          </tr>
          <tr>
            <td style={styles.summaryLabel}>Eindkapitaal Sparen:</td>
            <td style={styles.summaryValue}>{formatCurrency(summary.eindkapitaalSparen || 0)}</td>
          </tr>
          <tr>
            <td style={styles.summaryLabel}>Extra rendement:</td>
            <td style={styles.summaryValueGreen}>+{formatCurrency(summary.verschil || 0)}</td>
          </tr>
        </>
      )
    case 'pensioenbeleggen':
      return (
        <>
          <tr>
            <td style={styles.summaryLabel}>Eindkapitaal na {summary.totaleLooptijdJaar} jaar:</td>
            <td style={styles.summaryValue}>{formatCurrency(summary.eindkapitaalNaDoorgroei || 0)}</td>
          </tr>
          <tr>
            <td style={styles.summaryLabel}>Eindkapitaal Sparen:</td>
            <td style={styles.summaryValue}>{formatCurrency(summary.eindkapitaalSparen || 0)}</td>
          </tr>
          <tr>
            <td style={styles.summaryLabel}>Extra rendement:</td>
            <td style={styles.summaryValueGreen}>+{formatCurrency(summary.verschil || 0)}</td>
          </tr>
        </>
      )
    case 'vastgoedbelegging':
      return (
        <>
          <tr>
            <td style={styles.summaryLabel}>Netto Cashflow per Jaar:</td>
            <td style={styles.summaryValue}>{formatCurrency(summary.nettoCashflowPerJaar || 0)}</td>
          </tr>
          <tr>
            <td style={styles.summaryLabel}>ROE (Rendement EV):</td>
            <td style={styles.summaryValue}>{summary.rendementOpEigenVermogen || 0}%</td>
          </tr>
          <tr>
            <td style={styles.summaryLabel}>Eindwaarde Vastgoed:</td>
            <td style={styles.summaryValueGreen}>{formatCurrency(summary.eindwaarde || 0)}</td>
          </tr>
        </>
      )
  }
}

// Inline styles for email compatibility
const styles: Record<string, React.CSSProperties> = {
  body: {
    fontFamily: 'Arial, Helvetica, sans-serif',
    backgroundColor: '#f8fafc',
    margin: 0,
    padding: '20px',
  },
  container: {
    maxWidth: '600px',
    margin: '0 auto',
    backgroundColor: '#ffffff',
    borderRadius: '8px',
    overflow: 'hidden',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
  },
  header: {
    backgroundColor: '#307cf1',
    padding: '30px 40px',
    textAlign: 'center' as const,
  },
  logo: {
    color: '#ffffff',
    fontSize: '24px',
    fontWeight: 'bold',
    margin: 0,
  },
  content: {
    padding: '40px',
  },
  greeting: {
    fontSize: '16px',
    color: '#1e344b',
    marginBottom: '20px',
    lineHeight: '1.6',
  },
  intro: {
    fontSize: '14px',
    color: '#64748b',
    marginBottom: '30px',
    lineHeight: '1.6',
  },
  summaryBox: {
    backgroundColor: '#f8fafc',
    borderRadius: '8px',
    padding: '20px',
    marginBottom: '30px',
  },
  summaryTitle: {
    fontSize: '14px',
    fontWeight: 'bold',
    color: '#1e344b',
    marginBottom: '15px',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.5px',
  },
  summaryTable: {
    width: '100%',
    borderCollapse: 'collapse' as const,
  },
  summaryLabel: {
    fontSize: '14px',
    color: '#64748b',
    padding: '8px 0',
    textAlign: 'left' as const,
  },
  summaryValue: {
    fontSize: '14px',
    fontWeight: 'bold',
    color: '#1e344b',
    padding: '8px 0',
    textAlign: 'right' as const,
  },
  summaryValueGreen: {
    fontSize: '14px',
    fontWeight: 'bold',
    color: '#22c55e',
    padding: '8px 0',
    textAlign: 'right' as const,
  },
  attachment: {
    fontSize: '14px',
    color: '#307cf1',
    marginBottom: '30px',
    padding: '15px',
    backgroundColor: '#eff6ff',
    borderRadius: '8px',
    textAlign: 'center' as const,
  },
  divider: {
    borderTop: '1px solid #e2e8f0',
    margin: '30px 0',
  },
  ctaSection: {
    textAlign: 'center' as const,
    marginBottom: '30px',
  },
  ctaTitle: {
    fontSize: '16px',
    fontWeight: 'bold',
    color: '#1e344b',
    marginBottom: '10px',
  },
  ctaText: {
    fontSize: '14px',
    color: '#64748b',
    marginBottom: '20px',
    lineHeight: '1.6',
  },
  ctaButton: {
    display: 'inline-block',
    padding: '14px 32px',
    backgroundColor: '#307cf1',
    color: '#ffffff',
    textDecoration: 'none',
    borderRadius: '100px',
    fontSize: '14px',
    fontWeight: 'bold',
  },
  signature: {
    fontSize: '14px',
    color: '#64748b',
    lineHeight: '1.6',
  },
  footer: {
    backgroundColor: '#f8fafc',
    padding: '30px 40px',
    textAlign: 'center' as const,
  },
  footerText: {
    fontSize: '12px',
    color: '#64748b',
    marginBottom: '10px',
  },
  footerLink: {
    color: '#307cf1',
    textDecoration: 'none',
  },
  unsubscribe: {
    fontSize: '11px',
    color: '#94a3b8',
    marginTop: '20px',
  },
}

// Email Template Component
export const CalculatorReportEmail: React.FC<CalculatorReportEmailProps> = ({ summary }) => {
  const calculatorTitle = getCalculatorTitle(summary.calculatorType)

  return (
    <html>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>{getEmailSubject(summary.calculatorType)}</title>
      </head>
      <body style={styles.body}>
        <div style={styles.container}>
          {/* Header */}
          <div style={styles.header}>
            <h1 style={styles.logo}>AMBITION VALLEY</h1>
          </div>

          {/* Content */}
          <div style={styles.content}>
            <p style={styles.greeting}>Beste lezer,</p>

            <p style={styles.intro}>
              Bedankt voor het gebruik van onze {calculatorTitle.toLowerCase()}!
              In de bijlage vindt u uw persoonlijke analyse met een gedetailleerd
              overzicht van uw financiele projecties.
            </p>

            {/* Summary Box */}
            <div style={styles.summaryBox}>
              <h2 style={styles.summaryTitle}>Samenvatting</h2>
              <table style={styles.summaryTable}>
                <tbody>
                  {renderSummary(summary)}
                </tbody>
              </table>
            </div>

            {/* Attachment Notice */}
            <div style={styles.attachment}>
              Bekijk het volledige rapport in de bijlage (PDF)
            </div>

            <div style={styles.divider} />

            {/* CTA Section */}
            <div style={styles.ctaSection}>
              <h3 style={styles.ctaTitle}>Wilt u persoonlijk advies?</h3>
              <p style={styles.ctaText}>
                Onze experts helpen u graag met het maken van de juiste financiele keuzes.
              </p>
              <a
                href="https://ambitionvalley.webflow.io/form"
                style={styles.ctaButton}
                target="_blank"
                rel="noopener noreferrer"
              >
                Plan een gratis gesprek
              </a>
            </div>

            <div style={styles.divider} />

            {/* Signature */}
            <div style={styles.signature}>
              <p>Met vriendelijke groet,</p>
              <p><strong>Het Ambition Valley Team</strong></p>
            </div>
          </div>

          {/* Footer */}
          <div style={styles.footer}>
            <p style={styles.footerText}>
              <a href="mailto:info@ambitionvalley.nl" style={styles.footerLink}>
                info@ambitionvalley.nl
              </a>
              {' | '}
              <a href="https://www.ambitionvalley.nl" style={styles.footerLink}>
                www.ambitionvalley.nl
              </a>
            </p>
            <p style={styles.unsubscribe}>
              U ontvangt deze e-mail omdat u een rapport heeft aangevraagd via onze calculator.
            </p>
          </div>
        </div>
      </body>
    </html>
  )
}

export default CalculatorReportEmail
