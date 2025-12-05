'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { initAutoResize, sendReady } from '@/integrations/calculators/lib/iframe'
import { isCalculatorEnabled } from '@/integrations/calculators/config/calculators'
import type { CalculatorConfig } from '@/integrations/calculators/types/calculator'

const ALL_CALCULATORS = [
  { slug: 'sparen-vs-beleggen', label: 'Sparen vs Beleggen' },
  { slug: 'pensioenbeleggen', label: 'Pensioenbeleggen' },
  { slug: 'vastgoedbelegging', label: 'Vastgoedbelegging' },
] as const

// Filter to only show enabled calculators
const CALCULATORS = ALL_CALCULATORS.filter(calc => isCalculatorEnabled(calc.slug))

type CalculatorSlug = typeof ALL_CALCULATORS[number]['slug']

interface LoadedModule {
  config: CalculatorConfig
  CalculatorUI: React.ComponentType<{
    config: CalculatorConfig
    defaults: Record<string, unknown>
    onCalculate: (input: unknown) => unknown
  }>
  calculate: (input: unknown) => unknown
}

function AllCalculatorsContent() {
  const searchParams = useSearchParams()
  const initialCalc = searchParams.get('calc') as CalculatorSlug | null

  const [activeCalculator, setActiveCalculator] = useState<CalculatorSlug>(
    initialCalc && CALCULATORS.some(c => c.slug === initialCalc)
      ? initialCalc
      : (CALCULATORS[0]?.slug as CalculatorSlug) || 'sparen-vs-beleggen'
  )
  const [module, setModule] = useState<LoadedModule | null>(null)
  const [loading, setLoading] = useState(true)

  // Load calculator module when selection changes
  useEffect(() => {
    async function loadCalculator() {
      setLoading(true)
      try {
        const mod = await import(`@/integrations/calculators/calculators/${activeCalculator}`)
        setModule({
          config: mod.config,
          CalculatorUI: mod.CalculatorUI,
          calculate: mod.calculate,
        })
      } catch (err) {
        console.error('Failed to load calculator:', err)
      } finally {
        setLoading(false)
      }
    }

    loadCalculator()
  }, [activeCalculator])

  useEffect(() => {
    if (!module) return
    const cleanup = initAutoResize()
    sendReady(module.config.slug, module.config.version)
    return cleanup
  }, [module])

  return (
    <div style={styles.container}>
      {/* Calculator Switcher */}
      <div style={styles.switcherWrapper}>
        <div style={styles.switcher}>
          {CALCULATORS.map((calc) => (
            <button
              key={calc.slug}
              onClick={() => setActiveCalculator(calc.slug)}
              style={{
                ...styles.tab,
                ...(activeCalculator === calc.slug ? styles.tabActive : {}),
              }}
            >
              {calc.label}
            </button>
          ))}
        </div>
      </div>

      {/* Calculator Content */}
      <div style={styles.calculatorWrapper}>
        {loading ? (
          <div style={styles.loading}>
            <div style={styles.spinner} />
            <p>Calculator laden...</p>
          </div>
        ) : module ? (
          <module.CalculatorUI
            config={module.config}
            defaults={module.config.defaults}
            onCalculate={module.calculate}
          />
        ) : (
          <div style={styles.error}>Calculator niet gevonden</div>
        )}
      </div>

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}

export default function AllCalculatorsPage() {
  return (
    <Suspense fallback={
      <div style={styles.loading}>
        <div style={styles.spinner} />
        <p>Laden...</p>
      </div>
    }>
      <AllCalculatorsContent />
    </Suspense>
  )
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    width: '100%',
    maxWidth: '1000px',
    margin: '0 auto',
    padding: '20px',
  },
  switcherWrapper: {
    marginBottom: '16px',
  },
  switcher: {
    display: 'flex',
    gap: '12px',
    flexWrap: 'wrap',
  },
  tab: {
    display: 'inline-block',
    padding: '18px 30px',
    fontSize: '18px',
    fontWeight: 400,
    lineHeight: '1.5em',
    letterSpacing: '0.2px',
    color: '#307cf1',
    backgroundColor: 'transparent',
    border: '1px solid #307cf1',
    borderRadius: '100px',
    cursor: 'pointer',
    transition: 'all 300ms ease',
    whiteSpace: 'nowrap',
    textAlign: 'center',
  },
  tabActive: {
    backgroundColor: '#307cf1',
    color: '#ffffff',
  },
  calculatorWrapper: {
    minHeight: '600px',
  },
  loading: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '400px',
    color: '#64748b',
    gap: '16px',
  },
  spinner: {
    width: '40px',
    height: '40px',
    border: '3px solid #e2e8f0',
    borderTopColor: '#307cf1',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
  },
  error: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '400px',
    color: '#dc2626',
    fontSize: '16px',
  },
}
