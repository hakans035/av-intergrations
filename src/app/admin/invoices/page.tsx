import { redirect } from 'next/navigation';
import Link from 'next/link';
import { createClient, createServiceClient } from '@/lib/supabase/server';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { StatsCard } from '@/components/admin/StatsCard';
import { FileText, DollarSign, Receipt, Calendar, Download, Mail } from 'lucide-react';

interface Invoice {
  id: string;
  invoice_number: string;
  customer_name: string;
  customer_email: string;
  total_cents: number;
  btw_amount_cents: number;
  subtotal_cents: number;
  invoice_type: string;
  status: string;
  invoice_date: string;
  pdf_url: string | null;
  bookings?: {
    id: string;
    start_time: string;
    event_types: {
      title: string;
      slug: string;
    } | null;
  } | null;
}

async function getInvoiceStats() {
  const supabase = createServiceClient();

  const { data: invoices } = await supabase
    .from('invoices')
    .select('total_cents, btw_amount_cents, status, invoice_date');

  const stats = {
    total: invoices?.length || 0,
    totalRevenue: 0,
    totalBTW: 0,
    thisMonth: 0,
  };

  if (invoices) {
    const now = new Date();
    const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    for (const inv of invoices) {
      if (inv.status === 'paid') {
        stats.totalRevenue += inv.total_cents || 0;
        stats.totalBTW += inv.btw_amount_cents || 0;

        const invoiceDate = new Date(inv.invoice_date);
        if (invoiceDate >= thisMonthStart) {
          stats.thisMonth++;
        }
      }
    }
  }

  return stats;
}

async function getInvoices(): Promise<Invoice[]> {
  const supabase = createServiceClient();

  const { data, error } = await supabase
    .from('invoices')
    .select(`
      *,
      bookings (
        id,
        start_time,
        event_types (
          title,
          slug
        )
      )
    `)
    .order('created_at', { ascending: false })
    .limit(100);

  if (error) {
    console.error('Error fetching invoices:', error);
    return [];
  }

  return data as Invoice[] || [];
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
    month: 'short',
    day: 'numeric',
  });
}

const statusLabels: Record<string, { label: string; color: string }> = {
  paid: { label: 'Betaald', color: 'bg-green-500/20 text-green-300' },
  draft: { label: 'Concept', color: 'bg-yellow-500/20 text-yellow-300' },
  voided: { label: 'Geannuleerd', color: 'bg-red-500/20 text-red-300' },
  refunded: { label: 'Terugbetaald', color: 'bg-gray-500/20 text-gray-400' },
};

const typeLabels: Record<string, string> = {
  deposit: 'Aanbetaling',
  balance: 'Restbetaling',
  full_payment: 'Volledige betaling',
  refund: 'Creditnota',
};

export default async function AdminInvoicesPage() {
  const supabase = await createClient();

  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) {
    redirect('/admin/login');
  }

  const [stats, invoices] = await Promise.all([
    getInvoiceStats(),
    getInvoices(),
  ]);

  return (
    <>
      <AdminHeader user={user} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8 animate-fade-in-up">
          <h1 className="text-2xl sm:text-3xl font-bold gradient-text">Facturen</h1>
          <p className="mt-1 text-sm text-white/60">
            Overzicht van alle facturen
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 animate-fade-in-up" style={{ animationDelay: '100ms' }}>
          <StatsCard
            title="Totaal Facturen"
            value={stats.total}
            icon={<FileText className="w-6 h-6 text-white" />}
          />
          <StatsCard
            title="Omzet (incl. BTW)"
            value={formatPrice(stats.totalRevenue)}
            icon={<DollarSign className="w-6 h-6 text-white" />}
          />
          <StatsCard
            title="BTW Geïnd"
            value={formatPrice(stats.totalBTW)}
            icon={<Receipt className="w-6 h-6 text-white" />}
          />
          <StatsCard
            title="Deze Maand"
            value={stats.thisMonth}
            icon={<Calendar className="w-6 h-6 text-white" />}
          />
        </div>

        {/* Invoices Table */}
        <div className="animate-fade-in-up" style={{ animationDelay: '200ms' }}>
          <h2 className="text-lg font-semibold text-white mb-4">Alle Facturen</h2>

          {invoices.length === 0 ? (
            <div className="glass rounded-2xl p-8 text-center">
              <FileText className="w-12 h-12 text-white/40 mx-auto mb-4" />
              <p className="text-white/60">Nog geen facturen aangemaakt</p>
            </div>
          ) : (
            <div className="glass rounded-2xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/10">
                      <th className="text-left text-sm font-medium text-white/60 px-6 py-4">Factuurnr.</th>
                      <th className="text-left text-sm font-medium text-white/60 px-6 py-4">Klant</th>
                      <th className="text-left text-sm font-medium text-white/60 px-6 py-4">Evenement</th>
                      <th className="text-left text-sm font-medium text-white/60 px-6 py-4">Type</th>
                      <th className="text-right text-sm font-medium text-white/60 px-6 py-4">Bedrag</th>
                      <th className="text-left text-sm font-medium text-white/60 px-6 py-4">Status</th>
                      <th className="text-left text-sm font-medium text-white/60 px-6 py-4">Datum</th>
                      <th className="text-right text-sm font-medium text-white/60 px-6 py-4">Acties</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {invoices.map((invoice) => {
                      const statusInfo = statusLabels[invoice.status] || statusLabels.draft;
                      return (
                        <tr
                          key={invoice.id}
                          className="hover:bg-white/5 transition-colors"
                        >
                          <td className="px-6 py-4">
                            <Link
                              href={`/admin/invoices/${invoice.id}`}
                              className="font-medium text-white hover:text-blue-400 transition-colors"
                            >
                              {invoice.invoice_number}
                            </Link>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-white">{invoice.customer_name}</div>
                            <div className="text-xs text-white/50">{invoice.customer_email}</div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-white/70">
                              {invoice.bookings?.event_types?.title || '-'}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-sm text-white/70">
                              {typeLabels[invoice.invoice_type] || invoice.invoice_type}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="text-sm font-medium text-white">
                              {formatPrice(invoice.total_cents)}
                            </div>
                            <div className="text-xs text-white/40">
                              BTW: {formatPrice(invoice.btw_amount_cents)}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`px-2 py-1 rounded-lg text-xs font-medium ${statusInfo.color}`}>
                              {statusInfo.label}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-white/70">
                            {formatDate(invoice.invoice_date)}
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center justify-end gap-2">
                              {invoice.pdf_url && (
                                <a
                                  href={`/api/admin/invoices/${invoice.id}/download`}
                                  className="p-2 text-white/40 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                                  title="Download PDF"
                                >
                                  <Download className="w-4 h-4" />
                                </a>
                              )}
                              <form action={`/api/admin/invoices/${invoice.id}/resend`} method="POST">
                                <button
                                  type="submit"
                                  className="p-2 text-white/40 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                                  title="Verstuur opnieuw"
                                >
                                  <Mail className="w-4 h-4" />
                                </button>
                              </form>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </main>
    </>
  );
}
