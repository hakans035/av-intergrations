'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { CalculatorError } from './CalculatorError'
import { CalculatorLoading } from './CalculatorLoading'
import { initAutoResize, sendReady } from '../lib/iframe'
import type { CalculatorConfig } from '../types/calculator'

interface CalculatorClientProps {
  slug: string
}

interface LoadedModule {
  config: CalculatorConfig
  CalculatorUI: React.ComponentType<{
    config: CalculatorConfig
    defaults: Record<string, unknown>
    onCalculate: (input: unknown) => unknown
  }>
  calculate: (input: unknown) => unknown
}

export default function CalculatorClient({ slug }: CalculatorClientProps) {
  const searchParams = useSearchParams()
  const [module, setModule] = useState<LoadedModule | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Apply URL params for theming
  const bgColor = searchParams.get('bg')
  const accentColor = searchParams.get('accent')
  const textColor = searchParams.get('text')

  useEffect(() => {
    if (bgColor) {
      document.documentElement.style.setProperty('--color-background', `#${bgColor}`)
    }
    if (accentColor) {
      document.documentElement.style.setProperty('--color-accent', `#${accentColor}`)
    }
    if (textColor) {
      document.documentElement.style.setProperty('--color-text', `#${textColor}`)
    }
  }, [bgColor, accentColor, textColor])

  useEffect(() => {
    // Dynamically import the calculator module on the client
    async function loadCalculator() {
      try {
        const mod = await import(`@/integrations/calculators/calculators/${slug}`)
        setModule({
          config: mod.config,
          CalculatorUI: mod.CalculatorUI,
          calculate: mod.calculate,
        })
      } catch (err) {
        console.error('Failed to load calculator:', err)
        setError('Failed to load calculator')
      }
    }

    loadCalculator()
  }, [slug])

  useEffect(() => {
    if (!module) return

    // Initialize iFrame auto-resize
    const cleanup = initAutoResize()

    // Send ready message to parent
    sendReady(module.config.slug, module.config.version)

    return cleanup
  }, [module])

  if (error) {
    return <CalculatorError code="LOAD_ERROR" message={error} />
  }

  if (!module) {
    return <CalculatorLoading />
  }

  const { config, CalculatorUI, calculate } = module

  return (
    <main>
      <CalculatorUI
        config={config}
        defaults={config.defaults}
        onCalculate={calculate}
      />
    </main>
  )
}
