import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/server'
import { AdminHeader } from '@/components/admin/AdminHeader'
import { SubmissionsTable } from '@/components/admin/SubmissionsTable'

interface SearchParams {
  status?: string
  source?: string
  page?: string
}

async function getSubmissions(searchParams: SearchParams) {
  const supabase = createServiceClient()

  const page = parseInt(searchParams.page || '1', 10)
  const perPage = 25
  const offset = (page - 1) * perPage

  let query = supabase
    .from('form_submissions')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(offset, offset + perPage - 1)

  // Filter by status
  if (searchParams.status && searchParams.status !== 'all') {
    query = query.eq('qualification_result', searchParams.status)
  }

  // Filter by UTM source
  if (searchParams.source && searchParams.source !== 'all') {
    if (searchParams.source === 'direct') {
      query = query.is('utm_source', null)
    } else {
      query = query.eq('utm_source', searchParams.source)
    }
  }

  const { data, count, error } = await query

  if (error) {
    console.error('Error fetching submissions:', error)
    return { submissions: [], total: 0, page, perPage }
  }

  return {
    submissions: data || [],
    total: count || 0,
    page,
    perPage,
  }
}

async function getFilterOptions() {
  const supabase = createServiceClient()

  // Get unique UTM sources
  const { data: sources } = await supabase
    .from('form_submissions')
    .select('utm_source')
    .not('utm_source', 'is', null)

  const uniqueSources = [...new Set(sources?.map(s => s.utm_source).filter(Boolean))]

  return {
    sources: uniqueSources as string[],
  }
}

export default async function SubmissionsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>
}) {
  const supabase = await createClient()

  const { data: { user }, error } = await supabase.auth.getUser()

  if (error || !user) {
    redirect('/admin/login')
  }

  const params = await searchParams
  const [{ submissions, total, page, perPage }, filterOptions] = await Promise.all([
    getSubmissions(params),
    getFilterOptions(),
  ])

  const totalPages = Math.ceil(total / perPage)

  return (
    <>
      <AdminHeader user={user} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8 animate-fade-in-up">
          <h1 className="text-2xl sm:text-3xl font-bold gradient-text">Inzendingen</h1>
          <p className="mt-1 text-sm text-white/60">
            {total} inzendingen gevonden
          </p>
        </div>

        {/* Filters */}
        <div className="glass rounded-2xl p-4 mb-6 animate-fade-in-up" style={{ animationDelay: '100ms' }}>
          <form className="flex flex-wrap gap-4">
            {/* Status Filter */}
            <div>
              <label htmlFor="status" className="block text-xs font-medium text-white/50 mb-1">
                Status
              </label>
              <select
                id="status"
                name="status"
                defaultValue={params.status || 'all'}
                className="block w-40 px-3 py-2.5 bg-white/5 border border-white/20 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-transparent transition-all"
              >
                <option value="all" className="bg-[#1062eb] text-white">Alle statussen</option>
                <option value="qualified" className="bg-[#1062eb] text-white">Gekwalificeerd</option>
                <option value="disqualified" className="bg-[#1062eb] text-white">Niet gekwalificeerd</option>
                <option value="partial" className="bg-[#1062eb] text-white">Gedeeltelijk</option>
              </select>
            </div>

            {/* Source Filter */}
            <div>
              <label htmlFor="source" className="block text-xs font-medium text-white/50 mb-1">
                Bron
              </label>
              <select
                id="source"
                name="source"
                defaultValue={params.source || 'all'}
                className="block w-40 px-3 py-2.5 bg-white/5 border border-white/20 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-transparent transition-all"
              >
                <option value="all" className="bg-[#1062eb] text-white">Alle bronnen</option>
                <option value="direct" className="bg-[#1062eb] text-white">Direct</option>
                {filterOptions.sources.map((source) => (
                  <option key={source} value={source} className="bg-[#1062eb] text-white">
                    {source}
                  </option>
                ))}
              </select>
            </div>

            {/* Apply Button */}
            <div className="flex items-end">
              <button
                type="submit"
                className="px-5 py-2.5 text-sm font-medium text-[#1062eb] bg-white rounded-xl hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 transition-all"
              >
                Toepassen
              </button>
            </div>

            {/* Clear Filters */}
            {(params.status || params.source) && (
              <div className="flex items-end">
                <a
                  href="/admin/submissions"
                  className="px-4 py-2.5 text-sm font-medium text-white/60 hover:text-white transition-colors"
                >
                  Filters wissen
                </a>
              </div>
            )}
          </form>
        </div>

        {/* Table */}
        <div className="animate-fade-in-up" style={{ animationDelay: '200ms' }}>
          <SubmissionsTable submissions={submissions} />
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-6 flex items-center justify-between animate-fade-in-up" style={{ animationDelay: '300ms' }}>
            <p className="text-sm text-white/50">
              Pagina {page} van {totalPages}
            </p>
            <div className="flex gap-2">
              {page > 1 && (
                <a
                  href={`/admin/submissions?page=${page - 1}${params.status ? `&status=${params.status}` : ''}${params.source ? `&source=${params.source}` : ''}`}
                  className="px-4 py-2.5 text-sm font-medium text-white/70 bg-white/5 border border-white/20 rounded-xl hover:bg-white/10 hover:text-white transition-all"
                >
                  ← Vorige
                </a>
              )}
              {page < totalPages && (
                <a
                  href={`/admin/submissions?page=${page + 1}${params.status ? `&status=${params.status}` : ''}${params.source ? `&source=${params.source}` : ''}`}
                  className="px-4 py-2.5 text-sm font-medium text-[#1062eb] bg-white rounded-xl hover:shadow-lg hover:-translate-y-0.5 transition-all"
                >
                  Volgende →
                </a>
              )}
            </div>
          </div>
        )}
      </main>
    </>
  )
}
