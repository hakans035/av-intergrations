import Link from 'next/link'
import { StatsCard } from '@/components/admin/StatsCard'
import { createWebflowClient } from '@/integrations/seo-engine'

async function getWebflowPosts() {
  const apiToken = process.env.WEBFLOW_API_TOKEN
  const siteId = process.env.WEBFLOW_SITE_ID
  const collectionId = process.env.WEBFLOW_COLLECTION_ID

  if (!apiToken || !siteId || !collectionId) {
    console.error('Missing Webflow environment variables')
    return { posts: [], stats: { total: 0, drafts: 0, published: 0 } }
  }

  try {
    const client = createWebflowClient({
      apiToken,
      siteId,
      collectionId,
    })

    const response = await client.listItems({ limit: 100 })
    const posts = response.items.map((item) => {
      const fieldData = item.fieldData as Record<string, unknown>
      return {
        id: item.id,
        title: fieldData['name'] as string || 'Untitled',
        slug: fieldData['slug'] as string || '',
        status: item.isDraft ? 'draft' : 'published',
        language: fieldData['language'] as string || 'Dutch',
        summary: fieldData['post-summary'] as string || '',
        keyword: fieldData['source-keyword'] as string || '',
        createdAt: item.createdOn,
        updatedAt: item.lastUpdated,
      }
    })

    // Sort by updatedAt descending
    posts.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())

    const stats = {
      total: posts.length,
      drafts: posts.filter(p => p.status === 'draft').length,
      published: posts.filter(p => p.status === 'published').length,
    }

    return { posts, stats }
  } catch (error) {
    console.error('Error fetching Webflow posts:', error)
    return { posts: [], stats: { total: 0, drafts: 0, published: 0 } }
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

export default async function SEOEnginePage() {
  const { posts, stats } = await getWebflowPosts()

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8 animate-fade-in-up flex justify-between items-start">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold gradient-text">SEO Content Engine</h1>
            <p className="mt-1 text-sm text-white/60">
              Beheer en genereer blog posts voor Webflow
            </p>
          </div>
          <a
            href="/admin/seo-engine/generate"
            className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-xl text-sm font-medium text-white transition-all duration-200 flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Nieuwe Post
          </a>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 animate-fade-in-up" style={{ animationDelay: '100ms' }}>
          <StatsCard
            title="Totaal Posts"
            value={stats.total}
            icon={
              <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
              </svg>
            }
          />
          <StatsCard
            title="Drafts"
            value={stats.drafts}
            subtitle="Wacht op review"
            icon={
              <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            }
          />
          <StatsCard
            title="Gepubliceerd"
            value={stats.published}
            subtitle="Live op website"
            icon={
              <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
          />
        </div>

        {/* Posts Table */}
        <div className="animate-fade-in-up" style={{ animationDelay: '200ms' }}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white">Blog Posts</h2>
          </div>

          <div className="glass rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="px-6 py-4 text-left text-xs font-medium text-white/50 uppercase tracking-wider">
                      Titel
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-white/50 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-white/50 uppercase tracking-wider">
                      Keyword
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-white/50 uppercase tracking-wider">
                      Laatst Bijgewerkt
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-medium text-white/50 uppercase tracking-wider">
                      Acties
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {posts.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center text-white/50">
                        Geen posts gevonden. Klik op &quot;Nieuwe Post&quot; om te beginnen.
                      </td>
                    </tr>
                  ) : (
                    posts.map((post) => (
                      <tr key={post.id} className="hover:bg-white/5 transition-colors">
                        <td className="px-6 py-4">
                          <div>
                            <div className="text-sm font-medium text-white">{post.title}</div>
                            <div className="text-xs text-white/50">/{post.slug}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              post.status === 'published'
                                ? 'bg-green-500/20 text-green-300'
                                : 'bg-yellow-500/20 text-yellow-300'
                            }`}
                          >
                            {post.status === 'published' ? 'Gepubliceerd' : 'Draft'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-white/70">
                          {post.keyword || '-'}
                        </td>
                        <td className="px-6 py-4 text-sm text-white/50">
                          {formatDate(post.updatedAt)}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <a
                              href={`/admin/seo-engine/${post.id}`}
                              className="px-3 py-1.5 text-xs font-medium text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-all"
                            >
                              Bekijken
                            </a>
                            {post.status === 'draft' && (
                              <button
                                className="px-3 py-1.5 text-xs font-medium bg-green-500/20 text-green-300 hover:bg-green-500/30 rounded-lg transition-all"
                              >
                                Publiceren
                              </button>
                            )}
                          </div>
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
