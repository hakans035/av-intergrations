/* eslint-disable @next/next/no-head-element */
import React from 'react';

export interface IntakeFollowUpEmailProps {
  customerName: string;
  eventTitle: string;
  trajectenUrl: string;
}

export const getIntakeFollowUpSubject = (): string => {
  return 'Bedankt voor je intake - Ontdek jouw vervolgstappen | Ambition Valley';
};

export const IntakeFollowUpEmail: React.FC<IntakeFollowUpEmailProps> = ({
  customerName,
  trajectenUrl,
}) => {
  const displayName = customerName || 'Beste';

  return (
    <html>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta name="x-apple-disable-message-reformatting" />
        <title>{getIntakeFollowUpSubject()}</title>
        <style dangerouslySetInnerHTML={{ __html: `
          body, table, td, p, a, li, blockquote { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
          @media only screen and (max-width: 600px) {
            .container { width: 100% !important; }
            .content { padding: 24px 16px !important; }
            .cta-button { width: 100% !important; box-sizing: border-box !important; }
          }
        `}} />
      </head>
      <body style={{
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif',
        backgroundColor: '#f8fafc',
        margin: 0,
        padding: '16px',
      }}>
        <table role="presentation" cellPadding={0} cellSpacing={0} width="100%" style={{ backgroundColor: '#f8fafc' }}>
          <tbody>
            <tr>
              <td align="center" style={{ padding: '16px 0' }}>
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
                      <td align="center" style={{ backgroundColor: '#307cf1', padding: '28px 24px' }}>
                        <h1 style={{ color: '#ffffff', fontSize: '22px', fontWeight: 'bold', margin: 0 }}>
                          AMBITION VALLEY
                        </h1>
                      </td>
                    </tr>

                    {/* Thank You Banner */}
                    <tr>
                      <td align="center" style={{ backgroundColor: '#10b981', padding: '16px 24px' }}>
                        <table role="presentation" cellPadding={0} cellSpacing={0}>
                          <tbody>
                            <tr>
                              <td style={{ paddingRight: '12px' }}>
                                <span style={{ fontSize: '24px' }}>🎉</span>
                              </td>
                              <td>
                                <span style={{ color: '#ffffff', fontSize: '16px', fontWeight: 'bold' }}>
                                  Bedankt voor je intake gesprek!
                                </span>
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </td>
                    </tr>

                    {/* Content */}
                    <tr>
                      <td className="content" style={{ padding: '32px 28px' }}>
                        {/* Greeting */}
                        <p style={{ fontSize: '16px', color: '#1e344b', marginTop: 0, marginBottom: '16px' }}>
                          Beste {displayName},
                        </p>

                        <p style={{ fontSize: '15px', color: '#64748b', marginBottom: '24px', lineHeight: '1.7' }}>
                          Bedankt voor het fijne gesprek vandaag! We hebben besproken hoe je jouw financiële situatie
                          kunt optimaliseren en welke stappen je kunt zetten om je doelen te bereiken.
                        </p>

                        {/* Key Takeaways Box */}
                        <table
                          role="presentation"
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
                                <h3 style={{ fontSize: '17px', fontWeight: 'bold', color: '#1e344b', margin: '0 0 12px 0' }}>
                                  💡 Volgende stappen
                                </h3>
                                <ul style={{ margin: 0, paddingLeft: '20px', color: '#64748b', fontSize: '14px', lineHeight: '2' }}>
                                  <li>Bekijk de beschikbare trajecten die passen bij jouw situatie</li>
                                  <li>Kies het traject dat het beste aansluit bij je doelen</li>
                                  <li>Plan je eerste sessie en begin aan je financiële transformatie</li>
                                </ul>
                              </td>
                            </tr>
                          </tbody>
                        </table>

                        <p style={{ fontSize: '15px', color: '#64748b', marginBottom: '24px', lineHeight: '1.7' }}>
                          Klaar om de volgende stap te zetten? Bekijk hieronder welke trajecten we aanbieden
                          en kies degene die het beste bij jou past.
                        </p>

                        {/* CTA Button */}
                        <table role="presentation" cellPadding={0} cellSpacing={0} width="100%">
                          <tbody>
                            <tr>
                              <td align="center" style={{ paddingBottom: '24px' }}>
                                <a
                                  href={trajectenUrl}
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
                                  }}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                >
                                  Bekijk Beschikbare Trajecten
                                </a>
                              </td>
                            </tr>
                          </tbody>
                        </table>

                        {/* Trajecten Overview */}
                        <table
                          role="presentation"
                          cellPadding={0}
                          cellSpacing={0}
                          width="100%"
                          style={{
                            backgroundColor: '#fafafa',
                            borderRadius: '8px',
                            marginBottom: '24px',
                          }}
                        >
                          <tbody>
                            <tr>
                              <td style={{ padding: '20px' }}>
                                <h4 style={{ fontSize: '14px', fontWeight: 'bold', color: '#1e344b', margin: '0 0 16px 0' }}>
                                  📋 Onze Trajecten
                                </h4>

                                <table role="presentation" cellPadding={0} cellSpacing={0} width="100%">
                                  <tbody>
                                    <tr>
                                      <td style={{ padding: '8px 0', borderBottom: '1px solid #e5e7eb' }}>
                                        <strong style={{ color: '#1e344b', fontSize: '14px' }}>Financieel Fundament</strong>
                                        <p style={{ margin: '4px 0 0 0', color: '#64748b', fontSize: '13px' }}>
                                          Diepgaand fiscaal & financieel consult met concrete quick wins
                                        </p>
                                      </td>
                                    </tr>
                                    <tr>
                                      <td style={{ padding: '8px 0', borderBottom: '1px solid #e5e7eb' }}>
                                        <strong style={{ color: '#1e344b', fontSize: '14px' }}>Private Wealth</strong>
                                        <p style={{ margin: '4px 0 0 0', color: '#64748b', fontSize: '13px' }}>
                                          Exclusief 1-op-1 masterconsult met persoonlijk financieel plan
                                        </p>
                                      </td>
                                    </tr>
                                    <tr>
                                      <td style={{ padding: '8px 0' }}>
                                        <strong style={{ color: '#1e344b', fontSize: '14px' }}>Ambition Wealth Circle</strong>
                                        <p style={{ margin: '4px 0 0 0', color: '#64748b', fontSize: '13px' }}>
                                          Groepssessies met gelijkgestemde ondernemers
                                        </p>
                                      </td>
                                    </tr>
                                  </tbody>
                                </table>
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

                        {/* Questions Section */}
                        <table role="presentation" cellPadding={0} cellSpacing={0} width="100%">
                          <tbody>
                            <tr>
                              <td align="center" style={{ paddingBottom: '24px' }}>
                                <p style={{ fontSize: '14px', color: '#64748b', margin: '0 0 8px 0' }}>
                                  Heb je nog vragen naar aanleiding van het gesprek?
                                </p>
                                <a
                                  href="mailto:info@ambitionvalley.nl"
                                  style={{ color: '#307cf1', fontSize: '14px', textDecoration: 'underline' }}
                                >
                                  Neem gerust contact met ons op
                                </a>
                              </td>
                            </tr>
                          </tbody>
                        </table>

                        {/* Signature */}
                        <table role="presentation" cellPadding={0} cellSpacing={0} width="100%">
                          <tbody>
                            <tr>
                              <td style={{ fontSize: '14px', color: '#64748b', lineHeight: '1.6' }}>
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
                      <td align="center" style={{ backgroundColor: '#f8fafc', padding: '24px 28px', borderTop: '1px solid #e2e8f0' }}>
                        <p style={{ fontSize: '13px', color: '#64748b', margin: '0 0 8px 0' }}>
                          <a href="mailto:info@ambitionvalley.nl" style={{ color: '#307cf1', textDecoration: 'none' }}>
                            info@ambitionvalley.nl
                          </a>
                          <span style={{ margin: '0 8px', color: '#cbd5e1' }}>|</span>
                          <a href="https://www.ambitionvalley.nl" style={{ color: '#307cf1', textDecoration: 'none' }}>
                            www.ambitionvalley.nl
                          </a>
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
  );
};

export default IntakeFollowUpEmail;
