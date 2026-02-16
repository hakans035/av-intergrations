/* eslint-disable @next/next/no-head-element */
import React from 'react';

export interface BookingConfirmationEmailProps {
  customerName: string;
  eventTitle: string;
  eventDate: string;
  eventTime: string;
  duration: number;
  locationType: 'online' | 'on_location' | 'hybrid';
  locationAddress?: string;
  meetingUrl?: string;
  bookingId: string;
  cancellationUrl: string;
  onboardingFormUrl?: string;
}

export const getBookingConfirmationSubject = (eventTitle: string): string => {
  return `Bevestiging: ${eventTitle} - Ambition Valley`;
};

export const BookingConfirmationEmail: React.FC<BookingConfirmationEmailProps> = ({
  customerName,
  eventTitle,
  eventDate,
  eventTime,
  duration,
  locationType,
  locationAddress,
  meetingUrl,
  cancellationUrl,
  onboardingFormUrl,
}) => {
  const displayName = customerName || 'Beste';
  const isOnline = locationType === 'online' || locationType === 'hybrid';
  const isOnLocation = locationType === 'on_location' || locationType === 'hybrid';

  return (
    <html>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta name="x-apple-disable-message-reformatting" />
        <title>{getBookingConfirmationSubject(eventTitle)}</title>
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

                    {/* Success Banner */}
                    <tr>
                      <td align="center" style={{ backgroundColor: '#10b981', padding: '16px 24px' }}>
                        <table role="presentation" cellPadding={0} cellSpacing={0}>
                          <tbody>
                            <tr>
                              <td valign="middle" style={{ paddingRight: '12px' }}>
                                <table role="presentation" cellPadding={0} cellSpacing={0} style={{
                                  width: '28px',
                                  height: '28px',
                                  backgroundColor: '#ffffff',
                                  borderRadius: '50%',
                                }}>
                                  <tbody>
                                    <tr>
                                      <td align="center" valign="middle" style={{
                                        color: '#10b981',
                                        fontSize: '18px',
                                        fontWeight: 'bold',
                                        lineHeight: '28px',
                                      }}>
                                        ✓
                                      </td>
                                    </tr>
                                  </tbody>
                                </table>
                              </td>
                              <td valign="middle">
                                <span style={{ color: '#ffffff', fontSize: '16px', fontWeight: 'bold' }}>
                                  Boeking Bevestigd
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
                          {onboardingFormUrl
                            ? <>Uw boeking voor de Onboardingscall voor het <strong>{eventTitle}</strong> traject is bevestigd. Hieronder vindt u alle details.</>
                            : <>Uw boeking voor <strong>{eventTitle}</strong> is bevestigd. Hieronder vindt u alle details.</>
                          }
                        </p>

                        {/* Booking Details Box */}
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
                                <h3 style={{ fontSize: '17px', fontWeight: 'bold', color: '#1e344b', margin: '0 0 16px 0' }}>
                                  {eventTitle}
                                </h3>

                                <table role="presentation" cellPadding={0} cellSpacing={0} width="100%">
                                  <tbody>
                                    <tr>
                                      <td style={{ padding: '8px 0' }}>
                                        <span style={{ color: '#64748b', fontSize: '14px' }}>📅 Datum:</span>
                                        <span style={{ color: '#1e344b', fontSize: '14px', fontWeight: 'bold', marginLeft: '8px' }}>
                                          {eventDate}
                                        </span>
                                      </td>
                                    </tr>
                                    <tr>
                                      <td style={{ padding: '8px 0' }}>
                                        <span style={{ color: '#64748b', fontSize: '14px' }}>🕐 Tijd:</span>
                                        <span style={{ color: '#1e344b', fontSize: '14px', fontWeight: 'bold', marginLeft: '8px' }}>
                                          {eventTime} ({duration} minuten)
                                        </span>
                                      </td>
                                    </tr>
                                    {isOnLocation && locationAddress && (
                                      <tr>
                                        <td style={{ padding: '8px 0' }}>
                                          <span style={{ color: '#64748b', fontSize: '14px' }}>📍 Locatie:</span>
                                          <span style={{ color: '#1e344b', fontSize: '14px', fontWeight: 'bold', marginLeft: '8px' }}>
                                            {locationAddress}
                                          </span>
                                        </td>
                                      </tr>
                                    )}
                                    {isOnline && (
                                      <tr>
                                        <td style={{ padding: '8px 0' }}>
                                          <span style={{ color: '#64748b', fontSize: '14px' }}>💻 Online via:</span>
                                          <span style={{ color: '#1e344b', fontSize: '14px', fontWeight: 'bold', marginLeft: '8px' }}>
                                            Microsoft Teams
                                          </span>
                                        </td>
                                      </tr>
                                    )}
                                  </tbody>
                                </table>
                              </td>
                            </tr>
                          </tbody>
                        </table>

                        {/* Meeting Link Button */}
                        {isOnline && meetingUrl && (
                          <table role="presentation" cellPadding={0} cellSpacing={0} width="100%">
                            <tbody>
                              <tr>
                                <td align="center" style={{ paddingBottom: '24px' }}>
                                  <a
                                    href={meetingUrl}
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
                                    Deelnemen aan Meeting
                                  </a>
                                </td>
                              </tr>
                            </tbody>
                          </table>
                        )}

                        {/* Onboarding Form - Only for traject bookings */}
                        {onboardingFormUrl && (
                          <table
                            role="presentation"
                            cellPadding={0}
                            cellSpacing={0}
                            width="100%"
                            style={{
                              backgroundColor: '#f0fdf4',
                              borderLeft: '4px solid #22c55e',
                              borderRadius: '0 8px 8px 0',
                              marginBottom: '24px',
                            }}
                          >
                            <tbody>
                              <tr>
                                <td style={{ padding: '16px 20px' }}>
                                  <p style={{ fontSize: '14px', color: '#166534', margin: '0 0 12px 0', lineHeight: '1.6' }}>
                                    <strong>Onboardingsformulier:</strong> Download het formulier, vul het in en stuur het terug
                                    naar <a href="mailto:ramin@ambitionvalley.nl" style={{ color: '#166534', fontWeight: 'bold' }}>ramin@ambitionvalley.nl</a> v&oacute;&oacute;r de sessie.
                                  </p>
                                  <a
                                    href={onboardingFormUrl}
                                    style={{
                                      display: 'inline-block',
                                      padding: '10px 20px',
                                      backgroundColor: '#22c55e',
                                      color: '#ffffff',
                                      textDecoration: 'none',
                                      borderRadius: '8px',
                                      fontSize: '14px',
                                      fontWeight: 'bold',
                                    }}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                  >
                                    Download Onboardingsformulier
                                  </a>
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

                        {/* Cancellation Link */}
                        <table role="presentation" cellPadding={0} cellSpacing={0} width="100%">
                          <tbody>
                            <tr>
                              <td align="center" style={{ paddingBottom: '24px' }}>
                                <p style={{ fontSize: '14px', color: '#64748b', margin: '0 0 8px 0' }}>
                                  Kunt u niet komen?
                                </p>
                                <a
                                  href={cancellationUrl}
                                  style={{ color: '#ef4444', fontSize: '14px', textDecoration: 'underline' }}
                                >
                                  Afspraak annuleren
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

export default BookingConfirmationEmail;
