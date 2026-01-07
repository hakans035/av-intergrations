'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export function TriggerDiscoveryButton() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null)

  const handleClick = async () => {
    setIsLoading(true)
    setResult(null)

    try {
      const response = await fetch('/api/seo-engine/cron/discover', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_ADMIN_TOKEN || 'admin'}`,
        },
      })

      const data = await response.json()

      if (response.ok) {
        setResult({
          success: true,
          message: `${data.added} nieuwe keywords toegevoegd!`,
        })
        router.refresh()
      } else {
        setResult({
          success: false,
          message: data.error || 'Er is een fout opgetreden',
        })
      }
    } catch {
      setResult({
        success: false,
        message: 'Verbindingsfout',
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="relative">
      <button
        onClick={handleClick}
        disabled={isLoading}
        className="px-4 py-2 bg-purple-500/20 hover:bg-purple-500/30 disabled:bg-purple-500/10 rounded-xl text-sm font-medium text-purple-300 transition-all duration-200 flex items-center gap-2"
      >
        {isLoading ? (
          <>
            <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Zoeken...
          </>
        ) : (
          <>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            Ontdek Keywords
          </>
        )}
      </button>

      {result && (
        <div
          className={`absolute top-full right-0 mt-2 px-4 py-2 rounded-xl text-sm whitespace-nowrap ${
            result.success
              ? 'bg-green-500/20 text-green-300'
              : 'bg-red-500/20 text-red-300'
          }`}
        >
          {result.message}
        </div>
      )}
    </div>
  )
}
