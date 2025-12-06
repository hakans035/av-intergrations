/* eslint-disable @next/next/no-head-element */
import React from 'react';

export interface BookingReminderEmailProps {
  customerName: string;
  eventTitle: string;
  eventDate: string;
  eventTime: string;
  duration: number;
  locationType: 'online' | 'on_location' | 'hybrid';
  locationAddress?: string;
  meetingUrl?: string;
  daysUntil: number;
  cancellationUrl: string;
}

export const getBookingReminderSubject = (eventTitle: string, daysUntil: number): string => {
  if (daysUntil === 0) {
    return `Vandaag: ${eventTitle} - Ambition Valley`;
  } else if (daysUntil === 1) {
    return `Morgen: ${eventTitle} - Ambition Valley`;
  }
  return `Herinnering: ${eventTitle} over ${daysUntil} dagen - Ambition Valley`;
};

export const BookingReminderEmail: React.FC<BookingReminderEmailProps> = ({
  customerName,
  eventTitle,
  eventDate,
  eventTime,
  duration,
  locationType,
  locationAddress,
  meetingUrl,
  daysUntil,
  cancellationUrl,
}) => {
  const displayName = customerName || 'Beste';
  const isOnline = locationType === 'online' || locationType === 'hybrid';
  const isOnLocation = locationType === 'on_location' || locationType === 'hybrid';

  const reminderText = daysUntil === 0
    ? 'Vandaag is het zover!'
    : daysUntil === 1
    ? 'Morgen is het zover!'
    : `Nog ${daysUntil} dagen tot uw afspraak`;

  return (
    <html>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta name="x-apple-disable-message-reformatting" />
        <title>{getBookingReminderSubject(eventTitle, daysUntil)}</title>
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

                    {/* Reminder Banner */}
                    <tr>
                      <td align="center" style={{ backgroundColor: '#f59e0b', padding: '16px 24px' }}>
                        <table role="presentation" cellPadding={0} cellSpacing={0}>
                          <tbody>
                            <tr>
                              <td style={{ paddingRight: '12px' }}>
                                <span style={{ fontSize: '24px' }}>⏰</span>
                              </td>
                              <td>
                                <span style={{ color: '#ffffff', fontSize: '16px', fontWeight: 'bold' }}>
                                  {reminderText}
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
                          Dit is een herinnering voor uw aankomende afspraak bij Ambition Valley.
                        </p>

                        {/* Booking Details Box */}
                        <table
                          role="presentation"
                          cellPadding={0}
                          cellSpacing={0}
                          width="100%"
                          style={{
                            backgroundColor: '#fef3c7',
                            borderLeft: '4px solid #f59e0b',
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

                        {/* Tips */}
                        <table
                          role="presentation"
                          cellPadding={0}
                          cellSpacing={0}
                          width="100%"
                          style={{
                            backgroundColor: '#f0f9ff',
                            borderRadius: '8px',
                            marginBottom: '24px',
                          }}
                        >
                          <tbody>
                            <tr>
                              <td style={{ padding: '20px' }}>
                                <h4 style={{ fontSize: '14px', fontWeight: 'bold', color: '#1e344b', margin: '0 0 12px 0' }}>
                                  💡 Voorbereiding
                                </h4>
                                <ul style={{ margin: 0, paddingLeft: '20px', color: '#64748b', fontSize: '14px', lineHeight: '1.8' }}>
                                  <li>Zorg voor een rustige omgeving</li>
                                  <li>Test uw internetverbinding en audio</li>
                                  <li>Houd relevante documenten bij de hand</li>
                                </ul>
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

                        {/* Cancellation Link */}
                        <table role="presentation" cellPadding={0} cellSpacing={0} width="100%">
                          <tbody>
                            <tr>
                              <td align="center" style={{ paddingBottom: '24px' }}>
                                <p style={{ fontSize: '14px', color: '#64748b', margin: '0 0 8px 0' }}>
                                  Kunt u toch niet komen?
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
                                <p style={{ margin: '0 0 4px 0' }}>Tot snel!</p>
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
                        {/* Spam folder notice */}
                        <table
                          role="presentation"
                          cellPadding={0}
                          cellSpacing={0}
                          width="100%"
                          style={{
                            backgroundColor: '#fef3c7',
                            borderRadius: '8px',
                            marginBottom: '16px',
                          }}
                        >
                          <tbody>
                            <tr>
                              <td style={{ padding: '12px 16px' }}>
                                <p style={{ fontSize: '12px', color: '#92400e', margin: 0, lineHeight: '1.5' }}>
                                  <strong>Tip:</strong> Voeg <em>notifications@ambitionvalley.nl</em> toe aan uw contacten zodat onze e-mails altijd in uw inbox terechtkomen.
                                </p>
                              </td>
                            </tr>
                          </tbody>
                        </table>
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

export default BookingReminderEmail;
