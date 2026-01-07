'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface Props {
  draftId: string
}

export function PublishToWebflowButton({ draftId }: Props) {
  const router = useRouter()
  const [isPublishing, setIsPublishing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handlePublish = async () => {
    if (!confirm('Weet je zeker dat je deze blog wilt publiceren naar Webflow?')) {
      return
    }

    setIsPublishing(true)
    setError(null)

    try {
      const response = await fetch(`/api/seo-engine/drafts/${draftId}/publish`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_ADMIN_TOKEN || 'admin'}`,
        },
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Publiceren mislukt')
      }

      // Refresh the page to show updated status
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Publiceren mislukt')
    } finally {
      setIsPublishing(false)
    }
  }

  return (
    <div className="relative">
      <button
        onClick={handlePublish}
        disabled={isPublishing}
        className="px-6 py-3 bg-green-500/20 hover:bg-green-500/30 disabled:bg-green-500/10 disabled:cursor-not-allowed rounded-xl text-sm font-medium text-green-300 transition-all duration-200 flex items-center gap-2"
      >
        {isPublishing ? (
          <>
            <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Publiceren...
          </>
        ) : (
          <>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
            </svg>
            Publiceren naar Webflow
          </>
        )}
      </button>

      {error && (
        <div className="absolute top-full right-0 mt-2 px-4 py-2 rounded-xl text-sm whitespace-nowrap bg-red-500/20 text-red-300">
          {error}
        </div>
      )}
    </div>
  )
}
