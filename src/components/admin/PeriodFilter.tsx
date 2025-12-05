'use client'

import { useRouter, useSearchParams } from 'next/navigation'

interface PeriodFilterProps {
  currentPeriod: string
}

export function PeriodFilter({ currentPeriod }: PeriodFilterProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newPeriod = e.target.value
    const params = new URLSearchParams(searchParams.toString())
    params.set('period', newPeriod)
    router.push(`/admin/results?${params.toString()}`)
  }

  return (
    <select
      name="period"
      value={currentPeriod}
      onChange={handleChange}
      className="block px-4 py-2.5 bg-white/5 border border-white/20 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-transparent transition-all cursor-pointer"
    >
      <option value="all" className="bg-[#1062eb] text-white">Alle tijd</option>
      <option value="7days" className="bg-[#1062eb] text-white">Afgelopen 7 dagen</option>
      <option value="30days" className="bg-[#1062eb] text-white">Afgelopen 30 dagen</option>
      <option value="90days" className="bg-[#1062eb] text-white">Afgelopen 90 dagen</option>
    </select>
  )
}
