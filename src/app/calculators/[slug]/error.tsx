'use client'

import { useEffect } from 'react'
import { CalculatorError } from '@/integrations/calculators'
import { sendError } from '@/integrations/calculators/lib/iframe'

interface ErrorProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function Error({ error, reset }: ErrorProps) {
  useEffect(() => {
    // Report error to parent iframe
    sendError('RENDER_ERROR', error.message, true)

    // Log error for debugging
    console.error('[Calculator Error]', error)
  }, [error])

  return (
    <CalculatorError
      code={error.digest || 'UNKNOWN'}
      message="Failed to load calculator. Please try again."
      onRetry={reset}
    />
  )
}
