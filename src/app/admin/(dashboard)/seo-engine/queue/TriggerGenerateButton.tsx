'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export function TriggerGenerateButton() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<{ success: boolean; message: string; url?: string } | null>(null)

  const handleClick = async () => {
    setIsLoading(true)
    setResult(null)

    try {
      const response = await fetch('/api/seo-engine/cron/generate', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_ADMIN_TOKEN || 'admin'}`,
        },
      })

      const data = await response.json()

      if (response.ok) {
        if (data.generated) {
          setResult({
            success: true,
            message: `"${data.title}" gegenereerd!`,
            url: data.adminUrl,
          })
        } else {
          setResult({
            success: true,
            message: 'Geen keywords in queue',
          })
        }
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
        className="px-4 py-2 bg-green-500/20 hover:bg-green-500/30 disabled:bg-green-500/10 rounded-xl text-sm font-medium text-green-300 transition-all duration-200 flex items-center gap-2"
      >
        {isLoading ? (
          <>
            <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Genereren...
          </>
        ) : (
          <>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            Genereer Nu
          </>
        )}
      </button>

      {result && (
        <div
          className={`absolute top-full right-0 mt-2 px-4 py-2 rounded-xl text-sm max-w-xs ${
            result.success
              ? 'bg-green-500/20 text-green-300'
              : 'bg-red-500/20 text-red-300'
          }`}
        >
          <div>{result.message}</div>
          {result.url && (
            <a
              href={result.url}
              className="text-xs text-green-400 hover:underline mt-1 block"
            >
              Bekijk post
            </a>
          )}
        </div>
      )}
    </div>
  )
}
