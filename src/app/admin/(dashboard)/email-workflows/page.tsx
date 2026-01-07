import Link from 'next/link';
import { createServiceClient } from '@/lib/supabase/server';
import { StatsCard } from '@/components/admin/StatsCard';
import { Mail, Send, AlertCircle, Clock, Plus, Play, Pause, Trash2 } from 'lucide-react';

interface EmailWorkflow {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  event_type_id: string | null;
  trigger_type: string;
  trigger_offset_minutes: number;
  email_subject: string;
  email_template: string;
  is_active: boolean;
  created_at: string;
  event_types?: {
    id: string;
    slug: string;
    title: string;
  } | null;
}

interface EmailLog {
  id: string;
  status: string;
  created_at: string | null;
}

async function getWorkflowStats() {
  const supabase = createServiceClient();

  // Get total workflows
  const { count: totalCount } = await supabase
    .from('email_workflows')
    .select('*', { count: 'exact', head: true });

  // Get active workflows
  const { count: activeCount } = await supabase
    .from('email_workflows')
    .select('*', { count: 'exact', head: true })
    .eq('is_active', true);

  // Get sent emails count
  const { count: sentCount } = await supabase
    .from('email_logs')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'sent');

  // Get failed emails count
  const { count: failedCount } = await supabase
    .from('email_logs')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'failed');

  return {
    total: totalCount || 0,
    active: activeCount || 0,
    emailsSent: sentCount || 0,
    emailsFailed: failedCount || 0,
  };
}

async function getWorkflows(): Promise<EmailWorkflow[]> {
  const supabase = createServiceClient();

  const { data, error } = await supabase
    .from('email_workflows')
    .select(`
      *,
      event_types (
        id,
        slug,
        title
      )
    `)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching workflows:', error);
    return [];
  }

  return data as EmailWorkflow[] || [];
}

async function getRecentEmails(): Promise<EmailLog[]> {
  const supabase = createServiceClient();

  const { data, error } = await supabase
    .from('email_logs')
    .select('id, status, created_at')
    .order('created_at', { ascending: false })
    .limit(5);

  if (error) {
    console.error('Error fetching email logs:', error);
    return [];
  }

  return data || [];
}

const triggerTypeLabels: Record<string, string> = {
  booking_confirmed: 'Bij bevestiging',
  booking_cancelled: 'Bij annulering',
  before_event: 'Voor afspraak',
  after_event: 'Na afspraak',
};

const templateLabels: Record<string, string> = {
  booking_confirmation: 'Bevestigingsmail',
  booking_cancellation: 'Annuleringsmail',
  booking_reminder: 'Herinneringsmail',
  intake_follow_up: 'Intake Follow-up',
  traject_follow_up: 'Traject Follow-up',
};

function formatOffset(minutes: number): string {
  if (minutes === 0) return 'Direct';
  const absMinutes = Math.abs(minutes);
  const days = Math.floor(absMinutes / (60 * 24));
  const hours = Math.floor((absMinutes % (60 * 24)) / 60);

  if (days > 0) {
    return `${days} dag${days > 1 ? 'en' : ''}${hours > 0 ? ` ${hours}u` : ''} ${minutes < 0 ? 'ervoor' : 'erna'}`;
  }
  return `${hours} uur ${minutes < 0 ? 'ervoor' : 'erna'}`;
}

export default async function AdminEmailWorkflowsPage() {
  const [stats, workflows, recentEmails] = await Promise.all([
    getWorkflowStats(),
    getWorkflows(),
    getRecentEmails(),
  ]);

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8 flex items-center justify-between animate-fade-in-up">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold gradient-text">Email Workflows</h1>
            <p className="mt-1 text-sm text-white/60">
              Beheer automatische e-mails voor boekingen
            </p>
          </div>
          <Link
            href="/admin/email-workflows/new"
            className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-sm font-medium transition-colors"
          >
            <Plus className="w-4 h-4" />
            Nieuwe Workflow
          </Link>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 animate-fade-in-up" style={{ animationDelay: '100ms' }}>
          <StatsCard
            title="Totaal Workflows"
            value={stats.total}
            icon={<Mail className="w-6 h-6 text-white" />}
          />
          <StatsCard
            title="Actief"
            value={stats.active}
            icon={<Play className="w-6 h-6 text-white" />}
          />
          <StatsCard
            title="E-mails Verzonden"
            value={stats.emailsSent}
            icon={<Send className="w-6 h-6 text-white" />}
          />
          <StatsCard
            title="Mislukt"
            value={stats.emailsFailed}
            icon={<AlertCircle className="w-6 h-6 text-white" />}
          />
        </div>

        {/* Workflows List */}
        <div className="animate-fade-in-up" style={{ animationDelay: '200ms' }}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white">Alle Workflows</h2>
            <Link
              href="/admin/email-logs"
              className="text-sm font-medium text-white/70 hover:text-white transition-colors"
            >
              E-mail Logs →
            </Link>
          </div>

          {workflows.length === 0 ? (
            <div className="glass rounded-2xl p-8 text-center">
              <Mail className="w-12 h-12 text-white/40 mx-auto mb-4" />
              <p className="text-white/60 mb-4">Nog geen email workflows aangemaakt</p>
              <Link
                href="/admin/email-workflows/new"
                className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-sm font-medium transition-colors"
              >
                <Plus className="w-4 h-4" />
                Eerste Workflow Aanmaken
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {workflows.map((workflow) => (
                <Link
                  key={workflow.id}
                  href={`/admin/email-workflows/${workflow.id}`}
                  className="block glass rounded-2xl p-5 hover:bg-white/10 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <h3 className="font-medium text-white">{workflow.name}</h3>
                        <span className={`px-2 py-0.5 rounded-lg text-xs font-medium ${
                          workflow.is_active ? 'bg-green-500/20 text-green-300' : 'bg-gray-500/20 text-gray-400'
                        }`}>
                          {workflow.is_active ? 'Actief' : 'Inactief'}
                        </span>
                      </div>
                      {workflow.description && (
                        <p className="text-sm text-white/50 mt-1">{workflow.description}</p>
                      )}
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-3 text-sm text-white/60">
                        <span className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5" />
                          {triggerTypeLabels[workflow.trigger_type] || workflow.trigger_type}
                          {workflow.trigger_offset_minutes !== 0 && (
                            <span className="text-white/40">({formatOffset(workflow.trigger_offset_minutes)})</span>
                          )}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <Mail className="w-3.5 h-3.5" />
                          {templateLabels[workflow.email_template] || workflow.email_template}
                        </span>
                        {workflow.event_types && (
                          <span className="px-2 py-0.5 bg-white/10 rounded text-xs">
                            {workflow.event_types.title}
                          </span>
                        )}
                        {!workflow.event_type_id && (
                          <span className="px-2 py-0.5 bg-blue-500/20 text-blue-300 rounded text-xs">
                            Alle events
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-white/40">
                      {workflow.is_active ? (
                        <Pause className="w-4 h-4" />
                      ) : (
                        <Play className="w-4 h-4" />
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Recent Email Activity */}
        {recentEmails.length > 0 && (
          <div className="mt-8 animate-fade-in-up" style={{ animationDelay: '300ms' }}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-white">Recente Activiteit</h2>
              <Link
                href="/admin/email-logs"
                className="text-sm font-medium text-white/70 hover:text-white transition-colors"
              >
                Bekijk alles →
              </Link>
            </div>
            <div className="glass rounded-2xl p-4">
              <div className="flex items-center gap-3">
                {recentEmails.map((log) => (
                  <div
                    key={log.id}
                    className={`w-2 h-2 rounded-full ${
                      log.status === 'sent' ? 'bg-green-400' : log.status === 'failed' ? 'bg-red-400' : 'bg-yellow-400'
                    }`}
                    title={`${log.status} - ${log.created_at ? new Date(log.created_at).toLocaleString('nl-NL') : '-'}`}
                  />
                ))}
                <span className="text-sm text-white/50 ml-2">Laatste 5 e-mails</span>
              </div>
            </div>
          </div>
        )}
    </main>
  );
}
