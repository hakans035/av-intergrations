import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createWebflowClient } from '@/integrations/seo-engine'
import { PublishButton } from './PublishButton'

interface PageProps {
  params: Promise<{ id: string }>
}

async function getPost(id: string) {
  const apiToken = process.env.WEBFLOW_API_TOKEN
  const siteId = process.env.WEBFLOW_SITE_ID
  const collectionId = process.env.WEBFLOW_COLLECTION_ID

  if (!apiToken || !siteId || !collectionId) {
    return null
  }

  try {
    const client = createWebflowClient({
      apiToken,
      siteId,
      collectionId,
    })

    const item = await client.getItem(id)
    if (!item) return null

    const fieldData = item.fieldData as Record<string, unknown>
    return {
      id: item.id,
      title: fieldData['name'] as string || 'Untitled',
      slug: fieldData['slug'] as string || '',
      status: item.isDraft ? 'draft' : 'published',
      language: fieldData['language'] as string || 'Dutch',
      summary: fieldData['post-summary'] as string || '',
      body: fieldData['rich-text'] as string || '',
      keyword: fieldData['source-keyword'] as string || '',
      metaTitle: fieldData['meta-title'] as string || '',
      metaDescription: fieldData['meta-description'] as string || '',
      createdAt: item.createdOn,
      updatedAt: item.lastUpdated,
      isDraft: item.isDraft,
    }
  } catch (error) {
    console.error('Error fetching post:', error)
    return null
  }
}

function formatDate(dateString: string): string {
  return new Intl.DateTimeFormat('nl-NL', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(dateString))
}

export default async function PostDetailPage({ params }: PageProps) {
  const { id } = await params
  const post = await getPost(id)

  if (!post) {
    notFound()
  }

  return (
    <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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

        {/* Header */}
        <div className="mb-8 animate-fade-in-up flex justify-between items-start">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-2xl sm:text-3xl font-bold text-white">{post.title}</h1>
              <span
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  post.status === 'published'
                    ? 'bg-green-500/20 text-green-300'
                    : 'bg-yellow-500/20 text-yellow-300'
                }`}
              >
                {post.status === 'published' ? 'Gepubliceerd' : 'Draft'}
              </span>
            </div>
            <p className="text-sm text-white/60">
              Laatst bijgewerkt: {formatDate(post.updatedAt)}
            </p>
          </div>
          {post.isDraft && (
            <PublishButton postId={post.id} />
          )}
        </div>

        {/* Meta Info */}
        <div className="glass rounded-2xl p-6 mb-6 animate-fade-in-up" style={{ animationDelay: '100ms' }}>
          <h2 className="text-lg font-semibold text-white mb-4">Meta Informatie</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs text-white/50 mb-1">Slug</label>
              <div className="text-white/70">/{post.slug}</div>
            </div>
            <div>
              <label className="block text-xs text-white/50 mb-1">Keyword</label>
              <div className="text-white/70">{post.keyword || '-'}</div>
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs text-white/50 mb-1">Summary</label>
              <div className="text-white/70">{post.summary || '-'}</div>
              {post.summary && (
                <div className="text-xs text-white/40 mt-1">{post.summary.length} tekens</div>
              )}
            </div>
            <div>
              <label className="block text-xs text-white/50 mb-1">Meta Title</label>
              <div className="text-white/70">{post.metaTitle || '-'}</div>
            </div>
            <div>
              <label className="block text-xs text-white/50 mb-1">Meta Description</label>
              <div className="text-white/70">{post.metaDescription || '-'}</div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="glass rounded-2xl p-6 animate-fade-in-up" style={{ animationDelay: '200ms' }}>
          <h2 className="text-lg font-semibold text-white mb-4">Content</h2>
          <div
            className="prose prose-invert prose-sm max-w-none bg-white/5 rounded-xl p-6"
            dangerouslySetInnerHTML={{ __html: post.body }}
          />
        </div>

        {/* Actions */}
        <div className="mt-6 flex justify-end gap-4 animate-fade-in-up" style={{ animationDelay: '300ms' }}>
          <a
            href={`https://ambitionvalley.nl/blog/${post.slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 text-sm font-medium text-white/70 hover:text-white transition-colors flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
            Bekijk op website
          </a>
        </div>
    </main>
  )
}
