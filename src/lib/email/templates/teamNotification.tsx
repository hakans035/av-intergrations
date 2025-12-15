/* eslint-disable @next/next/no-head-element */
import React from 'react';

export type NotificationType = 'new_lead' | 'new_booking' | 'booking_cancelled';

export interface TeamNotificationEmailProps {
  type: NotificationType;
  // Lead info
  leadName?: string;
  leadEmail?: string;
  leadPhone?: string;
  qualificationResult?: string;
  // Booking info
  eventTitle?: string;
  eventDate?: string;
  eventTime?: string;
  // Meta
  timestamp: string;
}

export const getTeamNotificationSubject = (type: NotificationType, name?: string): string => {
  switch (type) {
    case 'new_lead':
      return `🎯 Nieuwe Lead: ${name || 'Onbekend'} heeft formulier ingevuld`;
    case 'new_booking':
      return `📅 Nieuwe Boeking: ${name || 'Onbekend'} heeft afspraak gemaakt`;
    case 'booking_cancelled':
      return `❌ Annulering: ${name || 'Onbekend'} heeft afspraak geannuleerd`;
    default:
      return 'Notificatie - Ambition Valley';
  }
};

export const TeamNotificationEmail: React.FC<TeamNotificationEmailProps> = ({
  type,
  leadName,
  leadEmail,
  leadPhone,
  qualificationResult,
  eventTitle,
  eventDate,
  eventTime,
  timestamp,
}) => {
  const displayName = leadName || 'Onbekend';

  const getTypeInfo = () => {
    switch (type) {
      case 'new_lead':
        return {
          title: 'Nieuwe Lead',
          color: '#10b981',
          icon: '🎯',
          description: 'Er is een nieuw formulier ingevuld.',
        };
      case 'new_booking':
        return {
          title: 'Nieuwe Boeking',
          color: '#3b82f6',
          icon: '📅',
          description: 'Er is een nieuwe afspraak gemaakt.',
        };
      case 'booking_cancelled':
        return {
          title: 'Boeking Geannuleerd',
          color: '#ef4444',
          icon: '❌',
          description: 'Een afspraak is geannuleerd.',
        };
      default:
        return {
          title: 'Notificatie',
          color: '#6b7280',
          icon: '📢',
          description: '',
        };
    }
  };

  const typeInfo = getTypeInfo();

  return (
    <html>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>{getTeamNotificationSubject(type, leadName)}</title>
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
                    maxWidth: '500px',
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
                      <td align="center" style={{ backgroundColor: typeInfo.color, padding: '24px' }}>
                        <span style={{ fontSize: '36px' }}>{typeInfo.icon}</span>
                        <h1 style={{ color: '#ffffff', fontSize: '20px', fontWeight: 'bold', margin: '12px 0 0 0' }}>
                          {typeInfo.title}
                        </h1>
                      </td>
                    </tr>

                    {/* Content */}
                    <tr>
                      <td style={{ padding: '24px' }}>
                        <p style={{ fontSize: '14px', color: '#64748b', margin: '0 0 20px 0' }}>
                          {typeInfo.description}
                        </p>

                        {/* Contact Info */}
                        <table role="presentation" cellPadding={0} cellSpacing={0} width="100%" style={{
                          backgroundColor: '#f8fafc',
                          borderRadius: '8px',
                          marginBottom: '16px',
                        }}>
                          <tbody>
                            <tr>
                              <td style={{ padding: '16px' }}>
                                <h3 style={{ fontSize: '14px', fontWeight: 'bold', color: '#1e344b', margin: '0 0 12px 0' }}>
                                  Contact Gegevens
                                </h3>
                                <table role="presentation" cellPadding={0} cellSpacing={0} width="100%">
                                  <tbody>
                                    <tr>
                                      <td style={{ padding: '4px 0', color: '#64748b', fontSize: '13px', width: '80px' }}>Naam:</td>
                                      <td style={{ padding: '4px 0', color: '#1e344b', fontSize: '13px', fontWeight: 'bold' }}>{displayName}</td>
                                    </tr>
                                    {leadEmail && (
                                      <tr>
                                        <td style={{ padding: '4px 0', color: '#64748b', fontSize: '13px' }}>Email:</td>
                                        <td style={{ padding: '4px 0', color: '#1e344b', fontSize: '13px' }}>
                                          <a href={`mailto:${leadEmail}`} style={{ color: '#3b82f6', textDecoration: 'none' }}>{leadEmail}</a>
                                        </td>
                                      </tr>
                                    )}
                                    {leadPhone && (
                                      <tr>
                                        <td style={{ padding: '4px 0', color: '#64748b', fontSize: '13px' }}>Telefoon:</td>
                                        <td style={{ padding: '4px 0', color: '#1e344b', fontSize: '13px' }}>
                                          <a href={`tel:${leadPhone}`} style={{ color: '#3b82f6', textDecoration: 'none' }}>{leadPhone}</a>
                                        </td>
                                      </tr>
                                    )}
                                    {qualificationResult && (
                                      <tr>
                                        <td style={{ padding: '4px 0', color: '#64748b', fontSize: '13px' }}>Status:</td>
                                        <td style={{ padding: '4px 0', fontSize: '13px' }}>
                                          <span style={{
                                            display: 'inline-block',
                                            padding: '2px 8px',
                                            borderRadius: '4px',
                                            backgroundColor: qualificationResult === 'qualified' ? '#dcfce7' : '#fef3c7',
                                            color: qualificationResult === 'qualified' ? '#166534' : '#92400e',
                                            fontWeight: 'bold',
                                          }}>
                                            {qualificationResult === 'qualified' ? 'Gekwalificeerd' : qualificationResult}
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

                        {/* Booking Details (if applicable) */}
                        {(eventTitle || eventDate) && (
                          <table role="presentation" cellPadding={0} cellSpacing={0} width="100%" style={{
                            backgroundColor: '#eff6ff',
                            borderRadius: '8px',
                            marginBottom: '16px',
                          }}>
                            <tbody>
                              <tr>
                                <td style={{ padding: '16px' }}>
                                  <h3 style={{ fontSize: '14px', fontWeight: 'bold', color: '#1e344b', margin: '0 0 12px 0' }}>
                                    Afspraak Details
                                  </h3>
                                  <table role="presentation" cellPadding={0} cellSpacing={0} width="100%">
                                    <tbody>
                                      {eventTitle && (
                                        <tr>
                                          <td style={{ padding: '4px 0', color: '#64748b', fontSize: '13px', width: '80px' }}>Type:</td>
                                          <td style={{ padding: '4px 0', color: '#1e344b', fontSize: '13px', fontWeight: 'bold' }}>{eventTitle}</td>
                                        </tr>
                                      )}
                                      {eventDate && (
                                        <tr>
                                          <td style={{ padding: '4px 0', color: '#64748b', fontSize: '13px' }}>Datum:</td>
                                          <td style={{ padding: '4px 0', color: '#1e344b', fontSize: '13px' }}>{eventDate}</td>
                                        </tr>
                                      )}
                                      {eventTime && (
                                        <tr>
                                          <td style={{ padding: '4px 0', color: '#64748b', fontSize: '13px' }}>Tijd:</td>
                                          <td style={{ padding: '4px 0', color: '#1e344b', fontSize: '13px' }}>{eventTime}</td>
                                        </tr>
                                      )}
                                    </tbody>
                                  </table>
                                </td>
                              </tr>
                            </tbody>
                          </table>
                        )}

                        {/* Admin Link */}
                        <table role="presentation" cellPadding={0} cellSpacing={0} width="100%">
                          <tbody>
                            <tr>
                              <td align="center" style={{ paddingTop: '8px' }}>
                                <a
                                  href="https://check.ambitionvalley.nl/admin"
                                  style={{
                                    display: 'inline-block',
                                    padding: '12px 24px',
                                    backgroundColor: '#1e344b',
                                    color: '#ffffff',
                                    textDecoration: 'none',
                                    borderRadius: '8px',
                                    fontSize: '14px',
                                    fontWeight: 'bold',
                                  }}
                                >
                                  Bekijk in Admin
                                </a>
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </td>
                    </tr>

                    {/* Footer */}
                    <tr>
                      <td align="center" style={{ backgroundColor: '#f8fafc', padding: '16px', borderTop: '1px solid #e2e8f0' }}>
                        <p style={{ fontSize: '12px', color: '#94a3b8', margin: 0 }}>
                          {timestamp}
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

export default TeamNotificationEmail;
