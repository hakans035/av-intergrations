'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface PublishButtonProps {
  postId: string
}

export function PublishButton({ postId }: PublishButtonProps) {
  const router = useRouter()
  const [isPublishing, setIsPublishing] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  const handlePublish = async () => {
    setIsPublishing(true)

    try {
      const response = await fetch(`/api/seo-engine/content/${postId}/publish`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_ADMIN_TOKEN || 'admin'}`,
        },
      })

      if (!response.ok) {
        throw new Error('Failed to publish')
      }

      // Refresh the page to show updated status
      router.refresh()
      setShowConfirm(false)
    } catch (error) {
      console.error('Publish error:', error)
      alert('Publiceren mislukt. Probeer het opnieuw.')
    } finally {
      setIsPublishing(false)
    }
  }

  if (showConfirm) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-sm text-white/60">Weet je het zeker?</span>
        <button
          onClick={handlePublish}
          disabled={isPublishing}
          className="px-4 py-2 bg-green-500/20 hover:bg-green-500/30 disabled:bg-green-500/10 rounded-xl text-sm font-medium text-green-300 transition-all duration-200"
        >
          {isPublishing ? 'Publiceren...' : 'Ja, publiceren'}
        </button>
        <button
          onClick={() => setShowConfirm(false)}
          className="px-4 py-2 text-sm font-medium text-white/70 hover:text-white transition-colors"
        >
          Annuleren
        </button>
      </div>
    )
  }

  return (
    <button
      onClick={() => setShowConfirm(true)}
      className="px-4 py-2 bg-green-500/20 hover:bg-green-500/30 rounded-xl text-sm font-medium text-green-300 transition-all duration-200 flex items-center gap-2"
    >
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
      </svg>
      Publiceren
    </button>
  )
}
