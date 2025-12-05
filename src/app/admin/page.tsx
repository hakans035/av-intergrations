import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/server'
import { AdminHeader } from '@/components/admin/AdminHeader'
import { StatsCard } from '@/components/admin/StatsCard'
import { SubmissionsTable } from '@/components/admin/SubmissionsTable'

async function getStats() {
  const supabase = createServiceClient()

  // Get total submissions
  const { count: totalCount } = await supabase
    .from('form_submissions')
    .select('*', { count: 'exact', head: true })

  // Get qualified submissions
  const { count: qualifiedCount } = await supabase
    .from('form_submissions')
    .select('*', { count: 'exact', head: true })
    .eq('qualification_result', 'qualified')

  // Get submissions from last 7 days
  const sevenDaysAgo = new Date()
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

  const { count: recentCount } = await supabase
    .from('form_submissions')
    .select('*', { count: 'exact', head: true })
    .gte('created_at', sevenDaysAgo.toISOString())

  // Get submissions from last 24 hours
  const oneDayAgo = new Date()
  oneDayAgo.setDate(oneDayAgo.getDate() - 1)

  const { count: todayCount } = await supabase
    .from('form_submissions')
    .select('*', { count: 'exact', head: true })
    .gte('created_at', oneDayAgo.toISOString())

  return {
    total: totalCount || 0,
    qualified: qualifiedCount || 0,
    thisWeek: recentCount || 0,
    today: todayCount || 0,
  }
}

async function getRecentSubmissions() {
  const supabase = createServiceClient()

  const { data, error } = await supabase
    .from('form_submissions')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(10)

  if (error) {
    console.error('Error fetching submissions:', error)
    return []
  }

  return data || []
}

export default async function AdminDashboard() {
  const supabase = await createClient()

  const { data: { user }, error } = await supabase.auth.getUser()

  if (error || !user) {
    redirect('/admin/login')
  }

  const [stats, recentSubmissions] = await Promise.all([
    getStats(),
    getRecentSubmissions(),
  ])

  const qualificationRate = stats.total > 0
    ? Math.round((stats.qualified / stats.total) * 100)
    : 0

  return (
    <>
      <AdminHeader user={user} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8 animate-fade-in-up">
          <h1 className="text-2xl sm:text-3xl font-bold gradient-text">Dashboard</h1>
          <p className="mt-1 text-sm text-white/60">
            Overzicht van formulierinzendingen en statistieken
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 animate-fade-in-up" style={{ animationDelay: '100ms' }}>
          <StatsCard
            title="Totaal Inzendingen"
            value={stats.total}
            icon={
              <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            }
          />
          <StatsCard
            title="Gekwalificeerd"
            value={stats.qualified}
            subtitle={`${qualificationRate}% van totaal`}
            icon={
              <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
          />
          <StatsCard
            title="Deze Week"
            value={stats.thisWeek}
            icon={
              <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            }
          />
          <StatsCard
            title="Vandaag"
            value={stats.today}
            icon={
              <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
          />
        </div>

        {/* Recent Submissions */}
        <div className="animate-fade-in-up" style={{ animationDelay: '200ms' }}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white">Recente Inzendingen</h2>
            <a
              href="/admin/submissions"
              className="text-sm font-medium text-white/70 hover:text-white transition-colors"
            >
              Bekijk alles →
            </a>
          </div>
          <SubmissionsTable submissions={recentSubmissions} />
        </div>
      </main>
    </>
  )
}
