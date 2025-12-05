import React from 'react'

export interface FormSubmissionEmailProps {
  name: string
  email: string
  qualificationResult: 'qualified' | 'disqualified' | 'partial'
  formId: string
  answers: Record<string, { question: string; answer: string | string[] }>
}

// Get email subject
export const getFormEmailSubject = (): string => {
  return 'Bedankt voor uw aanvraag - Ambition Valley'
}

// Get qualification message based on result
const getQualificationMessage = (result: FormSubmissionEmailProps['qualificationResult']): {
  title: string
  message: string
} => {
  switch (result) {
    case 'qualified':
      return {
        title: 'Goed nieuws!',
        message: 'Op basis van uw antwoorden lijkt u in aanmerking te komen voor ons adviestraject. We nemen binnen 24 uur contact met u op om de volgende stappen te bespreken.',
      }
    case 'partial':
      return {
        title: 'Bedankt voor uw interesse',
        message: 'We hebben uw aanvraag ontvangen. Vul uw gegevens aan voor een volledig advies op maat.',
      }
    case 'disqualified':
      return {
        title: 'Bedankt voor uw interesse',
        message: 'Op basis van uw antwoorden hebben we alternatieve opties die beter bij uw situatie passen. Bekijk onze groepsdagen voor praktische tips en inzichten.',
      }
  }
}

// Format answer for display
const formatAnswer = (answer: string | string[]): string => {
  if (Array.isArray(answer)) {
    return answer.join(', ')
  }
  if (answer === 'yes') return 'Ja'
  if (answer === 'no') return 'Nee'
  return answer
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
  qualificationBox: {
    backgroundColor: '#f0f9ff',
    borderLeft: '4px solid #307cf1',
    borderRadius: '0 8px 8px 0',
    padding: '20px',
    marginBottom: '30px',
  },
  qualificationTitle: {
    fontSize: '16px',
    fontWeight: 'bold',
    color: '#1e344b',
    marginBottom: '10px',
    marginTop: 0,
  },
  qualificationMessage: {
    fontSize: '14px',
    color: '#64748b',
    margin: 0,
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
    marginTop: 0,
    textTransform: 'uppercase' as const,
    letterSpacing: '0.5px',
  },
  summaryTable: {
    width: '100%',
    borderCollapse: 'collapse' as const,
  },
  summaryRow: {
    borderBottom: '1px solid #e2e8f0',
  },
  summaryQuestion: {
    fontSize: '13px',
    color: '#64748b',
    padding: '12px 0',
    textAlign: 'left' as const,
    verticalAlign: 'top' as const,
    width: '50%',
  },
  summaryAnswer: {
    fontSize: '13px',
    fontWeight: 'bold',
    color: '#1e344b',
    padding: '12px 0',
    textAlign: 'right' as const,
    verticalAlign: 'top' as const,
    width: '50%',
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
export const FormSubmissionEmail: React.FC<FormSubmissionEmailProps> = ({
  name,
  qualificationResult,
  answers,
}) => {
  const qualification = getQualificationMessage(qualificationResult)
  const displayName = name || 'Beste lezer'
  const answerEntries = Object.entries(answers)

  return (
    <html>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>{getFormEmailSubject()}</title>
      </head>
      <body style={styles.body}>
        <div style={styles.container}>
          {/* Header */}
          <div style={styles.header}>
            <h1 style={styles.logo}>AMBITION VALLEY</h1>
          </div>

          {/* Content */}
          <div style={styles.content}>
            <p style={styles.greeting}>Beste {displayName},</p>

            <p style={styles.intro}>
              Bedankt voor het invullen van onze vragenlijst! Hieronder vindt u een
              overzicht van uw antwoorden en informatie over de vervolgstappen.
            </p>

            {/* Qualification Status */}
            <div style={styles.qualificationBox}>
              <h3 style={styles.qualificationTitle}>{qualification.title}</h3>
              <p style={styles.qualificationMessage}>{qualification.message}</p>
            </div>

            {/* Answer Summary */}
            {answerEntries.length > 0 && (
              <div style={styles.summaryBox}>
                <h2 style={styles.summaryTitle}>Uw Antwoorden</h2>
                <table style={styles.summaryTable}>
                  <tbody>
                    {answerEntries.map(([key, { question, answer }]) => (
                      <tr key={key} style={styles.summaryRow}>
                        <td style={styles.summaryQuestion}>{question}</td>
                        <td style={styles.summaryAnswer}>{formatAnswer(answer)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <div style={styles.divider} />

            {/* CTA Section */}
            <div style={styles.ctaSection}>
              <h3 style={styles.ctaTitle}>Vragen of opmerkingen?</h3>
              <p style={styles.ctaText}>
                Onze experts helpen u graag met het maken van de juiste financiële keuzes.
              </p>
              <a
                href="https://ambitionvalley.nl/boeken"
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
              U ontvangt deze e-mail omdat u onze vragenlijst heeft ingevuld.
            </p>
          </div>
        </div>
      </body>
    </html>
  )
}

export default FormSubmissionEmail
