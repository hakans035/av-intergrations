import { redirect, notFound } from 'next/navigation';
import Link from 'next/link';
import { createClient, createServiceClient } from '@/lib/supabase/server';
import { AdminHeader } from '@/components/admin/AdminHeader';
import {
  ArrowLeft,
  Download,
  Mail,
  FileText,
  User,
  Calendar,
  CreditCard,
  Receipt,
  ExternalLink,
  XCircle
} from 'lucide-react';

interface Invoice {
  id: string;
  invoice_number: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string | null;
  description: string;
  currency: string;
  line_items: Array<{
    description: string;
    quantity: number;
    unit_price_cents: number;
    total_cents: number;
  }>;
  subtotal_cents: number;
  btw_percent: number;
  btw_amount_cents: number;
  total_cents: number;
  invoice_type: string;
  status: string;
  pdf_url: string | null;
  pdf_path: string | null;
  stripe_pdf_url: string | null;
  stripe_invoice_id: string | null;
  stripe_payment_intent_id: string | null;
  invoice_date: string;
  paid_at: string | null;
  created_at: string;
  bookings?: {
    id: string;
    start_time: string;
    end_time: string;
    customer_name: string;
    customer_email: string;
    status: string;
    event_types: {
      title: string;
      slug: string;
      duration_minutes: number;
    } | null;
  } | null;
}

async function getInvoice(id: string): Promise<Invoice | null> {
  const supabase = createServiceClient();

  const { data, error } = await supabase
    .from('invoices')
    .select(`
      *,
      bookings (
        id,
        start_time,
        end_time,
        customer_name,
        customer_email,
        status,
        event_types (
          title,
          slug,
          duration_minutes
        )
      )
    `)
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching invoice:', error);
    return null;
  }

  return data as unknown as Invoice;
}

function formatPrice(cents: number): string {
  return new Intl.NumberFormat('nl-NL', {
    style: 'currency',
    currency: 'EUR',
  }).format(cents / 100);
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('nl-NL', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

function formatDateTime(dateString: string): string {
  return new Date(dateString).toLocaleDateString('nl-NL', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

const statusLabels: Record<string, { label: string; color: string }> = {
  paid: { label: 'Betaald', color: 'bg-green-500/20 text-green-300 border-green-500/30' },
  draft: { label: 'Concept', color: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30' },
  voided: { label: 'Geannuleerd', color: 'bg-red-500/20 text-red-300 border-red-500/30' },
  refunded: { label: 'Terugbetaald', color: 'bg-gray-500/20 text-gray-400 border-gray-500/30' },
};

const typeLabels: Record<string, string> = {
  deposit: 'Aanbetaling (50%)',
  balance: 'Restbetaling (50%)',
  full_payment: 'Volledige betaling',
  refund: 'Creditnota',
};

export default async function AdminInvoiceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) {
    redirect('/admin/login');
  }

  const { id } = await params;
  const invoice = await getInvoice(id);

  if (!invoice) {
    notFound();
  }

  const statusInfo = statusLabels[invoice.status] || statusLabels.draft;

  return (
    <>
      <AdminHeader user={user} />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Link */}
        <div className="mb-6 animate-fade-in-up">
          <Link
            href="/admin/invoices"
            className="inline-flex items-center gap-2 text-white/60 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Terug naar facturen</span>
          </Link>
        </div>

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8 animate-fade-in-up" style={{ animationDelay: '50ms' }}>
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-2xl sm:text-3xl font-bold text-white">
                {invoice.invoice_number}
              </h1>
              <span className={`px-3 py-1 rounded-lg text-sm font-medium border ${statusInfo.color}`}>
                {statusInfo.label}
              </span>
            </div>
            <p className="text-white/60">
              {typeLabels[invoice.invoice_type] || invoice.invoice_type}
            </p>
          </div>

          <div className="flex items-center gap-2">
            {(invoice.pdf_url || invoice.pdf_path) && (
              <a
                href={`/api/admin/invoices/${invoice.id}/download`}
                className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-colors"
              >
                <Download className="w-4 h-4" />
                <span>Download PDF</span>
              </a>
            )}
            <form action={`/api/admin/invoices/${invoice.id}/resend`} method="POST">
              <button
                type="submit"
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 rounded-xl transition-colors"
              >
                <Mail className="w-4 h-4" />
                <span>Verstuur opnieuw</span>
              </button>
            </form>
            {invoice.status === 'paid' && (
              <form action={`/api/admin/invoices/${invoice.id}`} method="POST">
                <input type="hidden" name="_method" value="PATCH" />
                <input type="hidden" name="status" value="voided" />
                <button
                  type="submit"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-300 rounded-xl transition-colors"
                  onClick={(e) => {
                    if (!confirm('Weet je zeker dat je deze factuur wilt annuleren?')) {
                      e.preventDefault();
                    }
                  }}
                >
                  <XCircle className="w-4 h-4" />
                  <span>Annuleren</span>
                </button>
              </form>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Line Items */}
            <div className="glass rounded-2xl p-6 animate-fade-in-up" style={{ animationDelay: '100ms' }}>
              <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5 text-white/60" />
                Factuurregels
              </h2>

              <div className="space-y-3">
                {invoice.line_items.map((item, index) => (
                  <div
                    key={index}
                    className="flex justify-between items-start py-3 border-b border-white/10 last:border-0"
                  >
                    <div className="flex-1">
                      <p className="text-white font-medium">{item.description}</p>
                      <p className="text-sm text-white/50">
                        {item.quantity} x {formatPrice(item.unit_price_cents)}
                      </p>
                    </div>
                    <p className="text-white font-medium">
                      {formatPrice(item.total_cents)}
                    </p>
                  </div>
                ))}
              </div>

              {/* Totals */}
              <div className="mt-6 pt-4 border-t border-white/10 space-y-2">
                <div className="flex justify-between text-white/70">
                  <span>Subtotaal (excl. BTW)</span>
                  <span>{formatPrice(invoice.subtotal_cents)}</span>
                </div>
                <div className="flex justify-between text-white/70">
                  <span>BTW ({invoice.btw_percent}%)</span>
                  <span>{formatPrice(invoice.btw_amount_cents)}</span>
                </div>
                <div className="flex justify-between text-white text-lg font-bold pt-2 border-t border-white/10">
                  <span>Totaal</span>
                  <span className="gradient-text">{formatPrice(invoice.total_cents)}</span>
                </div>
              </div>
            </div>

            {/* Booking Details */}
            {invoice.bookings && (
              <div className="glass rounded-2xl p-6 animate-fade-in-up" style={{ animationDelay: '150ms' }}>
                <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-white/60" />
                  Gekoppelde boeking
                </h2>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-white/60">Evenement</span>
                    <span className="text-white">{invoice.bookings.event_types?.title || '-'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-white/60">Datum & tijd</span>
                    <span className="text-white">{formatDateTime(invoice.bookings.start_time)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-white/60">Duur</span>
                    <span className="text-white">{invoice.bookings.event_types?.duration_minutes || '-'} minuten</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-white/60">Status</span>
                    <span className="text-white capitalize">{invoice.bookings.status}</span>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-white/10">
                  <Link
                    href={`/admin/booking/${invoice.bookings.id}`}
                    className="inline-flex items-center gap-2 text-blue-400 hover:text-blue-300 transition-colors"
                  >
                    <span>Bekijk boeking</span>
                    <ExternalLink className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Customer Info */}
            <div className="glass rounded-2xl p-6 animate-fade-in-up" style={{ animationDelay: '200ms' }}>
              <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <User className="w-5 h-5 text-white/60" />
                Klantgegevens
              </h2>

              <div className="space-y-3">
                <div>
                  <p className="text-sm text-white/50">Naam</p>
                  <p className="text-white">{invoice.customer_name}</p>
                </div>
                <div>
                  <p className="text-sm text-white/50">E-mail</p>
                  <a
                    href={`mailto:${invoice.customer_email}`}
                    className="text-blue-400 hover:text-blue-300 transition-colors"
                  >
                    {invoice.customer_email}
                  </a>
                </div>
                {invoice.customer_phone && (
                  <div>
                    <p className="text-sm text-white/50">Telefoon</p>
                    <a
                      href={`tel:${invoice.customer_phone}`}
                      className="text-blue-400 hover:text-blue-300 transition-colors"
                    >
                      {invoice.customer_phone}
                    </a>
                  </div>
                )}
              </div>
            </div>

            {/* Payment Info */}
            <div className="glass rounded-2xl p-6 animate-fade-in-up" style={{ animationDelay: '250ms' }}>
              <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-white/60" />
                Betalingsgegevens
              </h2>

              <div className="space-y-3">
                <div>
                  <p className="text-sm text-white/50">Factuurdatum</p>
                  <p className="text-white">{formatDate(invoice.invoice_date)}</p>
                </div>
                {invoice.paid_at && (
                  <div>
                    <p className="text-sm text-white/50">Betaald op</p>
                    <p className="text-white">{formatDate(invoice.paid_at)}</p>
                  </div>
                )}
                {invoice.stripe_invoice_id && (
                  <div>
                    <p className="text-sm text-white/50">Stripe Invoice</p>
                    <a
                      href={`https://dashboard.stripe.com/invoices/${invoice.stripe_invoice_id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-blue-400 hover:text-blue-300 transition-colors text-sm"
                    >
                      <span>{invoice.stripe_invoice_id.slice(0, 20)}...</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                )}
              </div>
            </div>

            {/* Metadata */}
            <div className="glass rounded-2xl p-6 animate-fade-in-up" style={{ animationDelay: '300ms' }}>
              <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Receipt className="w-5 h-5 text-white/60" />
                Details
              </h2>

              <div className="space-y-3 text-sm">
                <div>
                  <p className="text-white/50">Factuur ID</p>
                  <p className="text-white font-mono text-xs">{invoice.id}</p>
                </div>
                <div>
                  <p className="text-white/50">Aangemaakt</p>
                  <p className="text-white">{formatDateTime(invoice.created_at)}</p>
                </div>
                <div>
                  <p className="text-white/50">Beschrijving</p>
                  <p className="text-white">{invoice.description}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
