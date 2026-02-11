export const dynamic = 'force-dynamic';

import Link from 'next/link'
import { createServiceClient } from '@/lib/supabase/server'
import { StatsCard } from '@/components/admin/StatsCard'
import { TriggerDiscoveryButton } from './TriggerDiscoveryButton'
import { SEONavDropdown } from '@/components/admin'

/* eslint-disable @typescript-eslint/no-explicit-any */

interface KeywordQueueItem {
  id: string
  keyword: string
  language: string
  priority: number
  status: string
  scheduled_date: string | null
  content_type: string
  metadata: {
    category?: string
    trending_score?: number
    relevance_score?: number
    reasoning?: string
    suggested_angle?: string
  }
  created_at: string
  processed_at: string | null
  webflow_item_id: string | null
  error_message: string | null
}

interface DiscoveryLogItem {
  id: string
  keywords_found: number
  keywords_added: number
  keywords_skipped: number
  summary: string | null
  error_message: string | null
  duration_ms: number | null
  created_at: string
}

async function getQueueData() {
  const supabase = createServiceClient()

  // Get queue items (use 'as any' until migration is run and types are regenerated)
  const { data: queueItems } = await supabase
    .from('seo_keyword_queue' as any)
    .select('*')
    .order('priority', { ascending: true })
    .order('created_at', { ascending: true })
    .limit(50)

  // Get recent discovery logs
  const { data: discoveryLogs } = await supabase
    .from('seo_discovery_log' as any)
    .select('*')
    .order('created_at', { ascending: false })
    .limit(5)

  // Get stats
  const items = (queueItems || []) as unknown as KeywordQueueItem[]
  const pending = items.filter(i => i.status === 'pending').length
  const completed = items.filter(i => i.status === 'completed').length
  const failed = items.filter(i => i.status === 'failed').length

  return {
    queueItems: (queueItems || []) as unknown as KeywordQueueItem[],
    discoveryLogs: (discoveryLogs || []) as unknown as DiscoveryLogItem[],
    stats: { pending, completed, failed, total: queueItems?.length || 0 }
  }
}

function formatDate(dateString: string): string {
  return new Intl.DateTimeFormat('nl-NL', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(dateString))
}

function getStatusBadge(status: string) {
  const styles: Record<string, string> = {
    pending: 'bg-yellow-500/20 text-yellow-300',
    in_progress: 'bg-blue-500/20 text-blue-300',
    completed: 'bg-green-500/20 text-green-300',
    failed: 'bg-red-500/20 text-red-300',
    skipped: 'bg-gray-500/20 text-gray-300',
  }

  const labels: Record<string, string> = {
    pending: 'Wachtend',
    in_progress: 'Bezig',
    completed: 'Voltooid',
    failed: 'Mislukt',
    skipped: 'Overgeslagen',
  }

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[status] || styles.pending}`}>
      {labels[status] || status}
    </span>
  )
}

export default async function QueuePage() {
  const { queueItems, discoveryLogs, stats } = await getQueueData()

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Back Button */}
      <div className="mb-6">
        <Link
          href="/admin/seo-engine"
          className="inline-flex items-center text-sm text-white/60 hover:text-white transition-colors"
        >
          <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Terug naar overzicht
        </Link>
      </div>

        {/* Page Header */}
        <div className="mb-8 animate-fade-in-up flex justify-between items-start">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold gradient-text">Keyword Queue</h1>
            <p className="mt-1 text-sm text-white/60">
              Automatisch ontdekte keywords voor blog generatie
            </p>
          </div>
          <div className="flex gap-3">
            <TriggerDiscoveryButton />
            <SEONavDropdown />
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8 animate-fade-in-up" style={{ animationDelay: '100ms' }}>
          <StatsCard
            title="Wachtend"
            value={stats.pending}
            subtitle="Keywords in queue"
            icon={
              <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
          />
          <StatsCard
            title="Voltooid"
            value={stats.completed}
            subtitle="Blogs gegenereerd"
            icon={
              <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
          />
          <StatsCard
            title="Mislukt"
            value={stats.failed}
            subtitle="Fouten opgetreden"
            icon={
              <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
          />
          <StatsCard
            title="Totaal"
            value={stats.total}
            subtitle="Keywords in database"
            icon={
              <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
              </svg>
            }
          />
        </div>

        {/* Recent Discovery Runs */}
        <div className="mb-8 animate-fade-in-up" style={{ animationDelay: '200ms' }}>
          <h2 className="text-lg font-semibold text-white mb-4">Recente Discovery Runs</h2>
          <div className="glass rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="px-6 py-4 text-left text-xs font-medium text-white/50 uppercase tracking-wider">
                      Datum
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-white/50 uppercase tracking-wider">
                      Gevonden
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-white/50 uppercase tracking-wider">
                      Toegevoegd
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-white/50 uppercase tracking-wider">
                      Samenvatting
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-white/50 uppercase tracking-wider">
                      Duur
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {discoveryLogs.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center text-white/50">
                        Nog geen discovery runs uitgevoerd. Klik op &quot;Ontdek Keywords&quot; om te starten.
                      </td>
                    </tr>
                  ) : (
                    discoveryLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-white/5 transition-colors">
                        <td className="px-6 py-4 text-sm text-white/70">
                          {formatDate(log.created_at)}
                        </td>
                        <td className="px-6 py-4 text-sm text-white">
                          {log.keywords_found}
                        </td>
                        <td className="px-6 py-4 text-sm text-green-300">
                          +{log.keywords_added}
                        </td>
                        <td className="px-6 py-4 text-sm text-white/70 max-w-xs truncate">
                          {log.error_message ? (
                            <span className="text-red-300">{log.error_message}</span>
                          ) : (
                            log.summary || '-'
                          )}
                        </td>
                        <td className="px-6 py-4 text-sm text-white/50">
                          {log.duration_ms ? `${(log.duration_ms / 1000).toFixed(1)}s` : '-'}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Keyword Queue Table */}
        <div className="animate-fade-in-up" style={{ animationDelay: '300ms' }}>
          <h2 className="text-lg font-semibold text-white mb-4">Keyword Queue</h2>
          <div className="glass rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="px-6 py-4 text-left text-xs font-medium text-white/50 uppercase tracking-wider">
                      Keyword
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-white/50 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-white/50 uppercase tracking-wider">
                      Categorie
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-white/50 uppercase tracking-wider">
                      Score
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-white/50 uppercase tracking-wider">
                      Gepland
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-medium text-white/50 uppercase tracking-wider">
                      Acties
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {queueItems.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center text-white/50">
                        Geen keywords in queue. Klik op &quot;Ontdek Keywords&quot; om te starten.
                      </td>
                    </tr>
                  ) : (
                    queueItems.map((item) => (
                      <tr key={item.id} className="hover:bg-white/5 transition-colors">
                        <td className="px-6 py-4">
                          <div>
                            <div className="text-sm font-medium text-white">{item.keyword}</div>
                            {item.metadata?.suggested_angle && (
                              <div className="text-xs text-white/50 mt-1 max-w-xs truncate">
                                {item.metadata.suggested_angle}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          {getStatusBadge(item.status)}
                          {item.error_message && (
                            <div className="text-xs text-red-300 mt-1 max-w-[150px] truncate" title={item.error_message}>
                              {item.error_message}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 text-sm text-white/70 capitalize">
                          {item.metadata?.category || '-'}
                        </td>
                        <td className="px-6 py-4">
                          {item.metadata?.trending_score && (
                            <div className="flex items-center gap-2">
                              <div className="w-16 h-2 bg-white/10 rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-gradient-to-r from-yellow-500 to-green-500 rounded-full"
                                  style={{ width: `${item.metadata.trending_score * 10}%` }}
                                />
                              </div>
                              <span className="text-xs text-white/50">{item.metadata.trending_score}/10</span>
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 text-sm text-white/50">
                          {item.scheduled_date || '-'}
                        </td>
                        <td className="px-6 py-4 text-right">
                          {item.webflow_item_id && (
                            <a
                              href={`/admin/seo-engine/${item.webflow_item_id}`}
                              className="px-3 py-1.5 text-xs font-medium text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-all"
                            >
                              Bekijk Post
                            </a>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
    </main>
  )
}
