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
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Inzendingen</h1>
          <p className="mt-1 text-sm text-gray-500">
            {total} inzendingen gevonden
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
          <form className="flex flex-wrap gap-4">
            {/* Status Filter */}
            <div>
              <label htmlFor="status" className="block text-xs font-medium text-gray-500 mb-1">
                Status
              </label>
              <select
                id="status"
                name="status"
                defaultValue={params.status || 'all'}
                className="block w-40 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#307cf1] focus:border-transparent"
              >
                <option value="all">Alle statussen</option>
                <option value="qualified">Gekwalificeerd</option>
                <option value="disqualified">Niet gekwalificeerd</option>
                <option value="partial">Gedeeltelijk</option>
              </select>
            </div>

            {/* Source Filter */}
            <div>
              <label htmlFor="source" className="block text-xs font-medium text-gray-500 mb-1">
                Bron
              </label>
              <select
                id="source"
                name="source"
                defaultValue={params.source || 'all'}
                className="block w-40 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#307cf1] focus:border-transparent"
              >
                <option value="all">Alle bronnen</option>
                <option value="direct">Direct</option>
                {filterOptions.sources.map((source) => (
                  <option key={source} value={source}>
                    {source}
                  </option>
                ))}
              </select>
            </div>

            {/* Apply Button */}
            <div className="flex items-end">
              <button
                type="submit"
                className="px-4 py-2 text-sm font-medium text-white bg-[#307cf1] rounded-lg hover:bg-[#2563eb] transition-colors"
              >
                Toepassen
              </button>
            </div>

            {/* Clear Filters */}
            {(params.status || params.source) && (
              <div className="flex items-end">
                <a
                  href="/admin/submissions"
                  className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
                >
                  Filters wissen
                </a>
              </div>
            )}
          </form>
        </div>

        {/* Table */}
        <SubmissionsTable submissions={submissions} />

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-6 flex items-center justify-between">
            <p className="text-sm text-gray-500">
              Pagina {page} van {totalPages}
            </p>
            <div className="flex gap-2">
              {page > 1 && (
                <a
                  href={`/admin/submissions?page=${page - 1}${params.status ? `&status=${params.status}` : ''}${params.source ? `&source=${params.source}` : ''}`}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Vorige
                </a>
              )}
              {page < totalPages && (
                <a
                  href={`/admin/submissions?page=${page + 1}${params.status ? `&status=${params.status}` : ''}${params.source ? `&source=${params.source}` : ''}`}
                  className="px-4 py-2 text-sm font-medium text-white bg-[#307cf1] rounded-lg hover:bg-[#2563eb] transition-colors"
                >
                  Volgende
                </a>
              )}
            </div>
          </div>
        )}
      </main>
    </>
  )
}
