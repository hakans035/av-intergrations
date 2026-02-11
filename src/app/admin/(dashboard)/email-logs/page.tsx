export const dynamic = 'force-dynamic';

import Link from 'next/link';
import { createServiceClient } from '@/lib/supabase/server';
import { Mail, CheckCircle, XCircle, Clock, ArrowLeft } from 'lucide-react';

interface EmailLog {
  id: string;
  booking_id: string | null;
  workflow_id: string | null;
  recipient_email: string;
  email_subject: string;
  status: 'pending' | 'sent' | 'failed';
  resend_message_id: string | null;
  error_message: string | null;
  sent_at: string | null;
  created_at: string;
  bookings?: {
    id: string;
    customer_name: string;
    customer_email: string;
    start_time: string;
    status: string;
  } | null;
  email_workflows?: {
    id: string;
    name: string;
    slug: string;
    trigger_type: string;
  } | null;
}

async function getEmailLogs(): Promise<EmailLog[]> {
  const supabase = createServiceClient();

  const { data, error } = await supabase
    .from('email_logs')
    .select(`
      *,
      bookings (
        id,
        customer_name,
        customer_email,
        start_time,
        status
      ),
      email_workflows (
        id,
        name,
        slug,
        trigger_type
      )
    `)
    .order('created_at', { ascending: false })
    .limit(100);

  if (error) {
    console.error('Error fetching email logs:', error);
    return [];
  }

  return data as EmailLog[] || [];
}

const statusConfig: Record<string, { color: string; icon: React.ReactNode; label: string }> = {
  sent: {
    color: 'bg-green-500/20 text-green-300',
    icon: <CheckCircle className="w-4 h-4" />,
    label: 'Verzonden',
  },
  failed: {
    color: 'bg-red-500/20 text-red-300',
    icon: <XCircle className="w-4 h-4" />,
    label: 'Mislukt',
  },
  pending: {
    color: 'bg-yellow-500/20 text-yellow-300',
    icon: <Clock className="w-4 h-4" />,
    label: 'In behandeling',
  },
};

const triggerTypeLabels: Record<string, string> = {
  booking_confirmed: 'Bevestiging',
  booking_cancelled: 'Annulering',
  before_event: 'Herinnering',
  after_event: 'Follow-up',
};

export default async function AdminEmailLogsPage() {
  const logs = await getEmailLogs();

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8 animate-fade-in-up">
          <Link
            href="/admin/email-workflows"
            className="inline-flex items-center gap-2 text-white/60 hover:text-white transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Terug naar workflows
          </Link>
          <h1 className="text-2xl sm:text-3xl font-bold gradient-text">E-mail Logs</h1>
          <p className="mt-1 text-sm text-white/60">
            Overzicht van alle verzonden e-mails
          </p>
        </div>

        {/* Stats Summary */}
        <div className="grid grid-cols-3 gap-4 mb-8 animate-fade-in-up" style={{ animationDelay: '100ms' }}>
          <div className="glass rounded-xl p-4 text-center">
            <p className="text-2xl font-bold text-green-300">
              {logs.filter(l => l.status === 'sent').length}
            </p>
            <p className="text-sm text-white/60">Verzonden</p>
          </div>
          <div className="glass rounded-xl p-4 text-center">
            <p className="text-2xl font-bold text-red-300">
              {logs.filter(l => l.status === 'failed').length}
            </p>
            <p className="text-sm text-white/60">Mislukt</p>
          </div>
          <div className="glass rounded-xl p-4 text-center">
            <p className="text-2xl font-bold text-yellow-300">
              {logs.filter(l => l.status === 'pending').length}
            </p>
            <p className="text-sm text-white/60">In behandeling</p>
          </div>
        </div>

        {/* Logs Table */}
        <div className="glass rounded-2xl overflow-hidden animate-fade-in-up" style={{ animationDelay: '200ms' }}>
          {logs.length === 0 ? (
            <div className="p-8 text-center">
              <Mail className="w-12 h-12 text-white/40 mx-auto mb-4" />
              <p className="text-white/60">Nog geen e-mails verzonden</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left py-3 px-4 text-sm font-medium text-white/60">Status</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-white/60">Ontvanger</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-white/60">Onderwerp</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-white/60">Workflow</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-white/60">Datum</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map((log) => {
                    const status = statusConfig[log.status] || statusConfig.pending;
                    return (
                      <tr key={log.id} className="border-b border-white/5 hover:bg-white/5">
                        <td className="py-3 px-4">
                          <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs font-medium ${status.color}`}>
                            {status.icon}
                            {status.label}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <div>
                            <p className="text-sm text-white">{log.recipient_email}</p>
                            {log.bookings && (
                              <p className="text-xs text-white/50">{log.bookings.customer_name}</p>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <p className="text-sm text-white/80 max-w-xs truncate">{log.email_subject}</p>
                          {log.error_message && (
                            <p className="text-xs text-red-400 mt-1">{log.error_message}</p>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          {log.email_workflows ? (
                            <div>
                              <p className="text-sm text-white/80">{log.email_workflows.name}</p>
                              <p className="text-xs text-white/50">
                                {triggerTypeLabels[log.email_workflows.trigger_type] || log.email_workflows.trigger_type}
                              </p>
                            </div>
                          ) : (
                            <span className="text-sm text-white/50">-</span>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          <p className="text-sm text-white/80">
                            {new Date(log.created_at).toLocaleDateString('nl-NL', {
                              day: 'numeric',
                              month: 'short',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </p>
                          {log.sent_at && (
                            <p className="text-xs text-white/50">
                              Verzonden: {new Date(log.sent_at).toLocaleTimeString('nl-NL', {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </p>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
    </main>
  );
}
