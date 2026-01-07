import Link from 'next/link'
import { createServiceClient } from '@/lib/supabase/server'

/* eslint-disable @typescript-eslint/no-explicit-any */

interface ContentDraft {
  id: string
  keyword: string
  title: string
  slug: string
  summary: string | null
  status: string
  language: string
  created_at: string
  published_at: string | null
  webflow_item_id: string | null
}

async function getDrafts() {
  const supabase = createServiceClient()

  const { data: drafts, error } = await supabase
    .from('seo_content_drafts' as any)
    .select('*')
    .order('created_at', { ascending: false })
    .limit(50)

  if (error) {
    console.error('Error fetching drafts:', error)
    return []
  }

  return (drafts || []) as ContentDraft[]
}

function getStatusBadge(status: string) {
  switch (status) {
    case 'draft':
      return 'bg-gray-500/20 text-gray-300'
    case 'pending_review':
      return 'bg-yellow-500/20 text-yellow-300'
    case 'approved':
      return 'bg-blue-500/20 text-blue-300'
    case 'published':
      return 'bg-green-500/20 text-green-300'
    case 'archived':
      return 'bg-red-500/20 text-red-300'
    default:
      return 'bg-white/10 text-white/60'
  }
}

function getStatusLabel(status: string) {
  switch (status) {
    case 'draft':
      return 'Concept'
    case 'pending_review':
      return 'Te reviewen'
    case 'approved':
      return 'Goedgekeurd'
    case 'published':
      return 'Gepubliceerd'
    case 'archived':
      return 'Gearchiveerd'
    default:
      return status
  }
}

export default async function DraftsPage() {
  const drafts = await getDrafts()

  const pendingCount = drafts.filter(d => d.status === 'pending_review').length
  const publishedCount = drafts.filter(d => d.status === 'published').length

  return (
    <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
      <div className="mb-8 animate-fade-in-up">
        <h1 className="text-2xl sm:text-3xl font-bold gradient-text">Blog Drafts</h1>
        <p className="mt-1 text-sm text-white/60">
          Review en publiceer gegenereerde blog posts
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="glass rounded-xl p-4">
          <div className="text-2xl font-bold text-yellow-400">{pendingCount}</div>
          <div className="text-sm text-white/60">Te reviewen</div>
        </div>
        <div className="glass rounded-xl p-4">
          <div className="text-2xl font-bold text-green-400">{publishedCount}</div>
          <div className="text-sm text-white/60">Gepubliceerd</div>
        </div>
        <div className="glass rounded-xl p-4">
          <div className="text-2xl font-bold text-white">{drafts.length}</div>
          <div className="text-sm text-white/60">Totaal</div>
        </div>
      </div>

      {/* Drafts List */}
      <div className="glass rounded-2xl overflow-hidden">
        {drafts.length === 0 ? (
          <div className="p-8 text-center text-white/50">
            Geen drafts gevonden
          </div>
        ) : (
          <div className="divide-y divide-white/10">
            {drafts.map((draft) => (
              <Link
                key={draft.id}
                href={`/admin/seo-engine/drafts/${draft.id}`}
                className="block p-4 hover:bg-white/5 transition-colors"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-medium text-white truncate">{draft.title}</h3>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${getStatusBadge(draft.status)}`}>
                        {getStatusLabel(draft.status)}
                      </span>
                    </div>
                    <p className="text-sm text-white/50 truncate">
                      Keyword: {draft.keyword}
                    </p>
                    {draft.summary && (
                      <p className="text-sm text-white/40 mt-1 line-clamp-2">
                        {draft.summary}
                      </p>
                    )}
                  </div>
                  <div className="text-right text-xs text-white/40 shrink-0">
                    <div>{new Date(draft.created_at).toLocaleDateString('nl-NL')}</div>
                    {draft.published_at && (
                      <div className="text-green-400">
                        Gepubliceerd: {new Date(draft.published_at).toLocaleDateString('nl-NL')}
                      </div>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
