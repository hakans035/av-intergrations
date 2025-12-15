/* eslint-disable @next/next/no-head-element */
import React from 'react';

export interface LeadFollowUpEmailProps {
  name: string;
  bookingUrl: string;
}

export const getLeadFollowUpSubject = (name: string): string => {
  return `${name}, heb je nog vragen over je besparingspotentieel?`;
};

export const LeadFollowUpEmail: React.FC<LeadFollowUpEmailProps> = ({
  name,
  bookingUrl,
}) => {
  const displayName = name || 'daar';

  return (
    <html>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>{getLeadFollowUpSubject(name)}</title>
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
                      <td align="center" style={{ backgroundColor: '#1e344b', padding: '32px 24px' }}>
                        <img
                          src="https://check.ambitionvalley.nl/logo-white.png"
                          alt="Ambition Valley"
                          width="180"
                          style={{ display: 'block' }}
                        />
                      </td>
                    </tr>

                    {/* Content */}
                    <tr>
                      <td style={{ padding: '32px 24px' }}>
                        <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: '#1e344b', margin: '0 0 16px 0' }}>
                          Hallo {displayName},
                        </h1>

                        <p style={{ fontSize: '16px', color: '#64748b', lineHeight: '1.6', margin: '0 0 20px 0' }}>
                          Bedankt voor het invullen van onze besparingscheck! We zagen dat je nog geen afspraak hebt ingepland.
                        </p>

                        <p style={{ fontSize: '16px', color: '#64748b', lineHeight: '1.6', margin: '0 0 20px 0' }}>
                          Tijdens een gratis intake gesprek bespreken we jouw situatie en laten we zien hoeveel je kunt besparen op je vaste lasten.
                        </p>

                        {/* Benefits */}
                        <table role="presentation" cellPadding={0} cellSpacing={0} width="100%" style={{
                          backgroundColor: '#f0fdf4',
                          borderRadius: '8px',
                          marginBottom: '24px',
                        }}>
                          <tbody>
                            <tr>
                              <td style={{ padding: '20px' }}>
                                <h3 style={{ fontSize: '14px', fontWeight: 'bold', color: '#166534', margin: '0 0 12px 0' }}>
                                  Dit krijg je tijdens het gesprek:
                                </h3>
                                <table role="presentation" cellPadding={0} cellSpacing={0}>
                                  <tbody>
                                    <tr>
                                      <td style={{ padding: '4px 0', fontSize: '14px', color: '#166534' }}>
                                        <span style={{ marginRight: '8px' }}>&#10003;</span>
                                        Persoonlijke analyse van je besparingspotentieel
                                      </td>
                                    </tr>
                                    <tr>
                                      <td style={{ padding: '4px 0', fontSize: '14px', color: '#166534' }}>
                                        <span style={{ marginRight: '8px' }}>&#10003;</span>
                                        Concrete tips voor lagere vaste lasten
                                      </td>
                                    </tr>
                                    <tr>
                                      <td style={{ padding: '4px 0', fontSize: '14px', color: '#166534' }}>
                                        <span style={{ marginRight: '8px' }}>&#10003;</span>
                                        Vrijblijvend en 100% gratis
                                      </td>
                                    </tr>
                                  </tbody>
                                </table>
                              </td>
                            </tr>
                          </tbody>
                        </table>

                        {/* CTA Button */}
                        <table role="presentation" cellPadding={0} cellSpacing={0} width="100%">
                          <tbody>
                            <tr>
                              <td align="center">
                                <a
                                  href={bookingUrl}
                                  style={{
                                    display: 'inline-block',
                                    padding: '16px 32px',
                                    backgroundColor: '#1062eb',
                                    color: '#ffffff',
                                    textDecoration: 'none',
                                    borderRadius: '8px',
                                    fontSize: '16px',
                                    fontWeight: 'bold',
                                  }}
                                >
                                  Plan je gratis gesprek
                                </a>
                              </td>
                            </tr>
                          </tbody>
                        </table>

                        <p style={{ fontSize: '14px', color: '#94a3b8', textAlign: 'center', margin: '16px 0 0 0' }}>
                          Het kost slechts 15 minuten en kan je duizenden euro&apos;s besparen!
                        </p>
                      </td>
                    </tr>

                    {/* Contact Section */}
                    <tr>
                      <td style={{ padding: '0 24px 24px 24px' }}>
                        <table role="presentation" cellPadding={0} cellSpacing={0} width="100%" style={{
                          backgroundColor: '#f8fafc',
                          borderRadius: '8px',
                        }}>
                          <tbody>
                            <tr>
                              <td style={{ padding: '16px' }}>
                                <p style={{ fontSize: '14px', color: '#64748b', margin: '0 0 8px 0' }}>
                                  <strong>Heb je vragen?</strong>
                                </p>
                                <p style={{ fontSize: '14px', color: '#64748b', margin: 0 }}>
                                  Neem gerust contact op via{' '}
                                  <a href="mailto:info@ambitionvalley.nl" style={{ color: '#1062eb', textDecoration: 'none' }}>
                                    info@ambitionvalley.nl
                                  </a>
                                </p>
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </td>
                    </tr>

                    {/* Footer */}
                    <tr>
                      <td align="center" style={{ backgroundColor: '#f8fafc', padding: '20px', borderTop: '1px solid #e2e8f0' }}>
                        <p style={{ fontSize: '12px', color: '#94a3b8', margin: '0 0 8px 0' }}>
                          Ambition Valley - Jouw partner in financiele optimalisatie
                        </p>
                        <p style={{ fontSize: '11px', color: '#cbd5e1', margin: 0 }}>
                          Je ontvangt deze e-mail omdat je onze besparingscheck hebt ingevuld.
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

export default LeadFollowUpEmail;
