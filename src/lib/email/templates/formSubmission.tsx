/* eslint-disable @next/next/no-head-element -- Email templates use standard HTML, not Next.js */
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

// Email Template Component - Mobile Optimized
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
        <meta name="x-apple-disable-message-reformatting" />
        <meta name="format-detection" content="telephone=no, address=no, email=no, date=no" />
        <title>{getFormEmailSubject()}</title>
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
            .qualification-box { padding: 16px !important; }
            .cta-button { padding: 16px 24px !important; width: 100% !important; box-sizing: border-box !important; display: block !important; text-align: center !important; }
            .summary-table td { display: block !important; width: 100% !important; text-align: left !important; padding: 8px 0 !important; }
            .summary-question { font-weight: normal !important; color: #64748b !important; padding-bottom: 4px !important; }
            .summary-answer { font-weight: bold !important; color: #1e344b !important; padding-bottom: 16px !important; border-bottom: 1px solid #e2e8f0 !important; }
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
                          Beste {displayName},
                        </p>

                        {/* Intro */}
                        <p style={{
                          fontSize: '15px',
                          color: '#64748b',
                          marginTop: 0,
                          marginBottom: '24px',
                          lineHeight: '1.7',
                        }}>
                          Bedankt voor het invullen van onze vragenlijst! Hieronder vindt u een
                          overzicht van uw antwoorden en informatie over de vervolgstappen.
                        </p>

                        {/* Qualification Status */}
                        <table
                          role="presentation"
                          className="qualification-box"
                          cellPadding={0}
                          cellSpacing={0}
                          width="100%"
                          style={{
                            backgroundColor: '#f0f9ff',
                            borderLeft: '4px solid #307cf1',
                            borderRadius: '0 8px 8px 0',
                            marginBottom: '24px',
                          }}
                        >
                          <tbody>
                            <tr>
                              <td style={{ padding: '20px' }}>
                                <h3 style={{
                                  fontSize: '17px',
                                  fontWeight: 'bold',
                                  color: '#1e344b',
                                  margin: '0 0 8px 0',
                                }}>
                                  {qualification.title}
                                </h3>
                                <p style={{
                                  fontSize: '14px',
                                  color: '#64748b',
                                  margin: 0,
                                  lineHeight: '1.6',
                                }}>
                                  {qualification.message}
                                </p>
                              </td>
                            </tr>
                          </tbody>
                        </table>

                        {/* Answer Summary */}
                        {answerEntries.length > 0 && (
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
                                    Uw Antwoorden
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
                                      {answerEntries.map(([key, { question, answer }], index) => (
                                        <tr
                                          key={key}
                                          style={{
                                            borderBottom: index < answerEntries.length - 1 ? '1px solid #e2e8f0' : 'none',
                                          }}
                                        >
                                          <td
                                            className="summary-question"
                                            style={{
                                              fontSize: '13px',
                                              color: '#64748b',
                                              padding: '12px 8px 12px 0',
                                              verticalAlign: 'top',
                                              width: '55%',
                                              lineHeight: '1.5',
                                            }}
                                          >
                                            {question}
                                          </td>
                                          <td
                                            className="summary-answer"
                                            style={{
                                              fontSize: '13px',
                                              fontWeight: 'bold',
                                              color: '#1e344b',
                                              padding: '12px 0 12px 8px',
                                              verticalAlign: 'top',
                                              textAlign: 'right',
                                              width: '45%',
                                              lineHeight: '1.5',
                                            }}
                                          >
                                            {formatAnswer(answer)}
                                          </td>
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                </td>
                              </tr>
                            </tbody>
                          </table>
                        )}

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
                                  Vragen of opmerkingen?
                                </h3>
                                <p style={{
                                  fontSize: '14px',
                                  color: '#64748b',
                                  margin: '0 0 20px 0',
                                  lineHeight: '1.6',
                                }}>
                                  Onze experts helpen u graag met het maken van de juiste financiële keuzes.
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
                          U ontvangt deze e-mail omdat u onze vragenlijst heeft ingevuld.
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

export default FormSubmissionEmail
