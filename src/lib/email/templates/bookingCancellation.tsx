/* eslint-disable @next/next/no-head-element */
import React from 'react';

export interface BookingCancellationEmailProps {
  customerName: string;
  eventTitle: string;
  eventDate: string;
  eventTime: string;
}

export const getBookingCancellationSubject = (): string => {
  return 'Annulering bevestigd - Ambition Valley';
};

export const BookingCancellationEmail: React.FC<BookingCancellationEmailProps> = ({
  customerName,
  eventTitle,
  eventDate,
  eventTime,
}) => {
  const displayName = customerName || 'Beste';

  return (
    <html>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>{getBookingCancellationSubject()}</title>
        <style dangerouslySetInnerHTML={{ __html: `
          @media only screen and (max-width: 600px) {
            .container { width: 100% !important; }
            .content { padding: 24px 16px !important; }
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

                    {/* Cancellation Banner */}
                    <tr>
                      <td align="center" style={{ backgroundColor: '#6b7280', padding: '16px 24px' }}>
                        <span style={{ color: '#ffffff', fontSize: '16px', fontWeight: 'bold' }}>
                          Boeking Geannuleerd
                        </span>
                      </td>
                    </tr>

                    {/* Content */}
                    <tr>
                      <td className="content" style={{ padding: '32px 28px' }}>
                        <p style={{ fontSize: '16px', color: '#1e344b', marginTop: 0, marginBottom: '16px' }}>
                          Beste {displayName},
                        </p>

                        <p style={{ fontSize: '15px', color: '#64748b', marginBottom: '24px', lineHeight: '1.7' }}>
                          Uw boeking voor <strong>{eventTitle}</strong> is succesvol geannuleerd.
                        </p>

                        {/* Cancelled Booking Details */}
                        <table
                          role="presentation"
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
                                <h4 style={{ fontSize: '13px', fontWeight: 'bold', color: '#1e344b', margin: '0 0 12px 0', textTransform: 'uppercase' }}>
                                  Geannuleerde Afspraak
                                </h4>
                                <table role="presentation" cellPadding={0} cellSpacing={0} width="100%">
                                  <tbody>
                                    <tr>
                                      <td style={{ fontSize: '14px', color: '#64748b', padding: '4px 0', textDecoration: 'line-through' }}>
                                        {eventTitle}
                                      </td>
                                    </tr>
                                    <tr>
                                      <td style={{ fontSize: '14px', color: '#64748b', padding: '4px 0', textDecoration: 'line-through' }}>
                                        {eventDate} om {eventTime}
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

                        {/* Rebook CTA */}
                        <table role="presentation" cellPadding={0} cellSpacing={0} width="100%">
                          <tbody>
                            <tr>
                              <td align="center" style={{ paddingBottom: '24px' }}>
                                <p style={{ fontSize: '14px', color: '#64748b', margin: '0 0 16px 0' }}>
                                  Wilt u een nieuwe afspraak maken?
                                </p>
                                <a
                                  href="https://ambitionvalley.nl/booking"
                                  style={{
                                    display: 'inline-block',
                                    padding: '14px 28px',
                                    backgroundColor: '#307cf1',
                                    color: '#ffffff',
                                    textDecoration: 'none',
                                    borderRadius: '100px',
                                    fontSize: '14px',
                                    fontWeight: 'bold',
                                  }}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                >
                                  Nieuwe Afspraak Boeken
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
                        <p style={{ fontSize: '13px', color: '#64748b', margin: 0 }}>
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

export default BookingCancellationEmail;
