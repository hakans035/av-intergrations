import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createServiceClient } from '@/lib/supabase/server'
import { PublishToWebflowButton } from './PublishToWebflowButton'
import { SEONavDropdown } from '../../SEONavDropdown'

/* eslint-disable @typescript-eslint/no-explicit-any */

interface PageProps {
  params: Promise<{ id: string }>
}

interface ContentDraft {
  id: string
  keyword: string
  title: string
  slug: string
  body: string
  summary: string | null
  meta_title: string | null
  meta_description: string | null
  status: string
  language: string
  content_type: string
  schema_type: string | null
  webflow_item_id: string | null
  created_at: string
  published_at: string | null
}

async function getDraft(id: string) {
  const supabase = createServiceClient()

  const { data: draft, error } = await supabase
    .from('seo_content_drafts' as any)
    .select('*')
    .eq('id', id)
    .single()

  if (error || !draft) {
    return null
  }

  return draft as unknown as ContentDraft
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
    default:
      return status
  }
}

export default async function DraftDetailPage({ params }: PageProps) {
  const { id } = await params
  const draft = await getDraft(id)

  if (!draft) {
    notFound()
  }

  const isPublished = draft.status === 'published'

  return (
    <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Back Button */}
      <div className="mb-6">
        <Link
          href="/admin/seo-engine/drafts"
          className="inline-flex items-center text-sm text-white/60 hover:text-white transition-colors"
        >
          <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Terug naar drafts
        </Link>
      </div>

      {/* Header */}
      <div className="mb-8 animate-fade-in-up flex justify-between items-start">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-2xl sm:text-3xl font-bold text-white">{draft.title}</h1>
            <span className={`text-xs px-2 py-1 rounded-full ${getStatusBadge(draft.status)}`}>
              {getStatusLabel(draft.status)}
            </span>
          </div>
          <p className="text-sm text-white/60">
            Keyword: {draft.keyword} • {draft.language === 'nl' ? 'Nederlands' : 'Engels'}
          </p>
        </div>
        <div className="flex gap-3">
          {!isPublished && (
            <PublishToWebflowButton draftId={draft.id} />
          )}
          <SEONavDropdown />
        </div>
      </div>

      {/* Meta Info */}
      <div className="glass rounded-2xl p-6 mb-6 animate-fade-in-up" style={{ animationDelay: '100ms' }}>
        <h2 className="text-lg font-semibold text-white mb-4">Meta Informatie</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-white/50 mb-1">Meta Titel</label>
            <div className="text-white">{draft.meta_title || draft.title}</div>
          </div>
          <div>
            <label className="block text-xs text-white/50 mb-1">Slug</label>
            <div className="text-white/70">/{draft.slug}</div>
          </div>
          <div className="md:col-span-2">
            <label className="block text-xs text-white/50 mb-1">Meta Beschrijving</label>
            <div className="text-white/70">{draft.meta_description || 'Niet ingesteld'}</div>
          </div>
          <div className="md:col-span-2">
            <label className="block text-xs text-white/50 mb-1">Samenvatting</label>
            <div className="text-white/70">{draft.summary || 'Niet ingesteld'}</div>
          </div>
        </div>
      </div>

      {/* Content Preview */}
      <div className="glass rounded-2xl p-6 mb-6 animate-fade-in-up" style={{ animationDelay: '200ms' }}>
        <h2 className="text-lg font-semibold text-white mb-4">Content</h2>
        <div
          className="prose prose-invert prose-sm max-w-none bg-white/5 rounded-xl p-6 max-h-[600px] overflow-y-auto"
          dangerouslySetInnerHTML={{ __html: draft.body }}
        />
      </div>

      {/* Timestamps */}
      <div className="glass rounded-2xl p-6 animate-fade-in-up" style={{ animationDelay: '300ms' }}>
        <h2 className="text-lg font-semibold text-white mb-4">Details</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div>
            <label className="block text-xs text-white/50 mb-1">Aangemaakt</label>
            <div className="text-white/70">
              {new Date(draft.created_at).toLocaleString('nl-NL', {
                dateStyle: 'long',
                timeStyle: 'short',
              })}
            </div>
          </div>
          {draft.published_at && (
            <div>
              <label className="block text-xs text-white/50 mb-1">Gepubliceerd</label>
              <div className="text-green-400">
                {new Date(draft.published_at).toLocaleString('nl-NL', {
                  dateStyle: 'long',
                  timeStyle: 'short',
                })}
              </div>
            </div>
          )}
          {draft.webflow_item_id && (
            <div>
              <label className="block text-xs text-white/50 mb-1">Webflow ID</label>
              <div className="text-white/70 font-mono text-xs">{draft.webflow_item_id}</div>
            </div>
          )}
        </div>
      </div>
    </main>
  )
}
