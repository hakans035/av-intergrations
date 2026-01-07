export default function AdminLoading() {
  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Page title skeleton */}
      <div className="mb-8">
        <div className="h-8 w-48 bg-white/10 rounded animate-pulse mb-2" />
        <div className="h-4 w-72 bg-white/10 rounded animate-pulse" />
      </div>

      {/* Stats skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="glass rounded-2xl p-6">
            <div className="h-4 w-24 bg-white/10 rounded animate-pulse mb-3" />
            <div className="h-8 w-16 bg-white/10 rounded animate-pulse" />
          </div>
        ))}
      </div>

      {/* Table skeleton */}
      <div className="glass rounded-2xl p-6">
        <div className="h-5 w-40 bg-white/10 rounded animate-pulse mb-4" />
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-12 bg-white/10 rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    </main>
  )
}
