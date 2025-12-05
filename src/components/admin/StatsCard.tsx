interface StatsCardProps {
  title: string
  value: string | number
  subtitle?: string
  trend?: {
    value: number
    isPositive: boolean
  }
  icon?: React.ReactNode
}

export function StatsCard({ title, value, subtitle, trend, icon }: StatsCardProps) {
  return (
    <div className="glass rounded-2xl p-6 hover:bg-white/[0.15] transition-all duration-300">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-white/60">{title}</p>
          <p className="mt-2 text-4xl font-bold text-white">{value}</p>
          {subtitle && (
            <p className="mt-1 text-sm text-white/50">{subtitle}</p>
          )}
          {trend && (
            <p className={`mt-2 text-sm font-medium ${trend.isPositive ? 'text-green-400' : 'text-red-400'}`}>
              {trend.isPositive ? '+' : ''}{trend.value}% vs vorige week
            </p>
          )}
        </div>
        {icon && (
          <div className="p-3 bg-white/10 rounded-xl">
            {icon}
          </div>
        )}
      </div>
    </div>
  )
}
