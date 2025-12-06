/* eslint-disable @next/next/no-head-element */
import React from 'react';

export interface InvoiceEmailProps {
  customerName: string;
  invoiceNumber: string;
  invoiceDate: string;
  eventTitle: string;
  eventDate: string;
  lineItems: Array<{
    description: string;
    amount: string;
  }>;
  subtotal: string;
  btwAmount: string;
  btwPercent: number;
  total: string;
  pdfUrl?: string;
  invoiceType: 'deposit' | 'balance' | 'full_payment' | 'refund';
}

export const getInvoiceEmailSubject = (invoiceNumber: string): string => {
  return `Factuur ${invoiceNumber} - Ambition Valley`;
};

const invoiceTypeLabels: Record<string, string> = {
  deposit: 'Aanbetaling',
  balance: 'Restbetaling',
  full_payment: 'Betaling',
  refund: 'Creditnota',
};

export const InvoiceEmail: React.FC<InvoiceEmailProps> = ({
  customerName,
  invoiceNumber,
  invoiceDate,
  eventTitle,
  eventDate,
  lineItems,
  subtotal,
  btwAmount,
  btwPercent,
  total,
  pdfUrl,
  invoiceType,
}) => {
  const displayName = customerName || 'Beste';
  const typeLabel = invoiceTypeLabels[invoiceType] || 'Factuur';

  return (
    <html>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta name="x-apple-disable-message-reformatting" />
        <title>{getInvoiceEmailSubject(invoiceNumber)}</title>
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

                    {/* Invoice Banner */}
                    <tr>
                      <td align="center" style={{ backgroundColor: '#1e40af', padding: '16px 24px' }}>
                        <table role="presentation" cellPadding={0} cellSpacing={0}>
                          <tbody>
                            <tr>
                              <td style={{ paddingRight: '12px' }}>
                                <div style={{
                                  width: '24px',
                                  height: '24px',
                                  borderRadius: '50%',
                                  backgroundColor: 'rgba(255,255,255,0.2)',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  color: '#ffffff',
                                  fontSize: '14px',
                                }}>
                                  📄
                                </div>
                              </td>
                              <td>
                                <span style={{ color: '#ffffff', fontSize: '16px', fontWeight: '600' }}>
                                  {typeLabel} - {invoiceNumber}
                                </span>
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </td>
                    </tr>

                    {/* Main Content */}
                    <tr>
                      <td className="content" style={{ padding: '32px 24px' }}>
                        {/* Greeting */}
                        <p style={{ fontSize: '16px', color: '#1e344b', margin: '0 0 24px 0' }}>
                          Beste {displayName},
                        </p>

                        <p style={{ fontSize: '15px', color: '#475569', lineHeight: '1.6', margin: '0 0 24px 0' }}>
                          Bedankt voor uw {invoiceType === 'refund' ? 'annulering' : 'betaling'}. Hieronder vindt u uw factuur voor {eventTitle}.
                        </p>

                        {/* Invoice Details Box */}
                        <table role="presentation" cellPadding={0} cellSpacing={0} width="100%" style={{
                          backgroundColor: '#f8fafc',
                          borderRadius: '8px',
                          marginBottom: '24px',
                        }}>
                          <tbody>
                            <tr>
                              <td style={{ padding: '20px' }}>
                                {/* Invoice Info */}
                                <table role="presentation" cellPadding={0} cellSpacing={0} width="100%" style={{ marginBottom: '16px' }}>
                                  <tbody>
                                    <tr>
                                      <td style={{ fontSize: '14px', color: '#64748b', paddingBottom: '4px' }}>
                                        Factuurnummer
                                      </td>
                                      <td align="right" style={{ fontSize: '14px', color: '#1e344b', fontWeight: '600', paddingBottom: '4px' }}>
                                        {invoiceNumber}
                                      </td>
                                    </tr>
                                    <tr>
                                      <td style={{ fontSize: '14px', color: '#64748b', paddingBottom: '4px' }}>
                                        Factuurdatum
                                      </td>
                                      <td align="right" style={{ fontSize: '14px', color: '#1e344b', paddingBottom: '4px' }}>
                                        {invoiceDate}
                                      </td>
                                    </tr>
                                    <tr>
                                      <td style={{ fontSize: '14px', color: '#64748b' }}>
                                        Evenement
                                      </td>
                                      <td align="right" style={{ fontSize: '14px', color: '#1e344b' }}>
                                        {eventDate}
                                      </td>
                                    </tr>
                                  </tbody>
                                </table>

                                {/* Divider */}
                                <div style={{ borderTop: '1px solid #e2e8f0', margin: '16px 0' }} />

                                {/* Line Items */}
                                <table role="presentation" cellPadding={0} cellSpacing={0} width="100%">
                                  <tbody>
                                    {lineItems.map((item, index) => (
                                      <tr key={index}>
                                        <td style={{ fontSize: '14px', color: '#1e344b', paddingBottom: '8px' }}>
                                          {item.description}
                                        </td>
                                        <td align="right" style={{ fontSize: '14px', color: '#1e344b', paddingBottom: '8px' }}>
                                          {item.amount}
                                        </td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>

                                {/* Divider */}
                                <div style={{ borderTop: '1px solid #e2e8f0', margin: '16px 0' }} />

                                {/* Totals */}
                                <table role="presentation" cellPadding={0} cellSpacing={0} width="100%">
                                  <tbody>
                                    <tr>
                                      <td style={{ fontSize: '14px', color: '#64748b', paddingBottom: '4px' }}>
                                        Subtotaal (excl. BTW)
                                      </td>
                                      <td align="right" style={{ fontSize: '14px', color: '#1e344b', paddingBottom: '4px' }}>
                                        {subtotal}
                                      </td>
                                    </tr>
                                    <tr>
                                      <td style={{ fontSize: '14px', color: '#64748b', paddingBottom: '8px' }}>
                                        BTW ({btwPercent}%)
                                      </td>
                                      <td align="right" style={{ fontSize: '14px', color: '#1e344b', paddingBottom: '8px' }}>
                                        {btwAmount}
                                      </td>
                                    </tr>
                                    <tr>
                                      <td style={{ fontSize: '16px', color: '#1e344b', fontWeight: '700', paddingTop: '8px', borderTop: '2px solid #307cf1' }}>
                                        Totaal (incl. BTW)
                                      </td>
                                      <td align="right" style={{ fontSize: '16px', color: '#307cf1', fontWeight: '700', paddingTop: '8px', borderTop: '2px solid #307cf1' }}>
                                        {total}
                                      </td>
                                    </tr>
                                  </tbody>
                                </table>
                              </td>
                            </tr>
                          </tbody>
                        </table>

                        {/* Download Button */}
                        {pdfUrl && (
                          <table role="presentation" cellPadding={0} cellSpacing={0} width="100%" style={{ marginBottom: '24px' }}>
                            <tbody>
                              <tr>
                                <td align="center">
                                  <a
                                    href={pdfUrl}
                                    className="cta-button"
                                    style={{
                                      display: 'inline-block',
                                      padding: '14px 28px',
                                      backgroundColor: '#307cf1',
                                      color: '#ffffff',
                                      textDecoration: 'none',
                                      borderRadius: '8px',
                                      fontSize: '15px',
                                      fontWeight: '600',
                                    }}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                  >
                                    Download Factuur (PDF)
                                  </a>
                                </td>
                              </tr>
                            </tbody>
                          </table>
                        )}

                        {/* Footer note */}
                        <p style={{ fontSize: '14px', color: '#64748b', lineHeight: '1.6', margin: '0' }}>
                          Heeft u vragen over deze factuur? Neem dan contact met ons op via info@ambitionvalley.nl.
                        </p>
                      </td>
                    </tr>

                    {/* Footer */}
                    <tr>
                      <td style={{ backgroundColor: '#f8fafc', padding: '24px', borderTop: '1px solid #e2e8f0' }}>
                        <table role="presentation" cellPadding={0} cellSpacing={0} width="100%">
                          <tbody>
                            <tr>
                              <td align="center">
                                <p style={{ fontSize: '13px', color: '#64748b', margin: '0 0 8px 0' }}>
                                  Ambition Valley
                                </p>
                                <p style={{ fontSize: '12px', color: '#94a3b8', margin: '0' }}>
                                  © {new Date().getFullYear()} Ambition Valley. Alle rechten voorbehouden.
                                </p>
                              </td>
                            </tr>
                          </tbody>
                        </table>
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
