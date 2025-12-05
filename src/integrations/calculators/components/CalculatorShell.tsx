'use client'

import { useEffect, ReactNode } from 'react'
import { useSearchParams } from 'next/navigation'
import { initAutoResize, sendReady } from '../lib/iframe'
import type { CalculatorConfig } from '../types/calculator'

interface CalculatorShellProps {
  config: CalculatorConfig
  children: ReactNode
}

export function CalculatorShell({ config, children }: CalculatorShellProps) {
  const searchParams = useSearchParams()

  // Apply URL params for theming
  const bgColor = searchParams.get('bg')
  const accentColor = searchParams.get('accent')
  const textColor = searchParams.get('text')

  useEffect(() => {
    // Apply custom colors from URL params
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
    // Initialize iFrame auto-resize
    const cleanup = initAutoResize()

    // Send ready message to parent
    sendReady(config.slug, config.version)

    return cleanup
  }, [config.slug, config.version])

  return (
    <div style={styles.shell}>
      <header style={styles.header}>
        <h1 style={styles.title}>{config.name}</h1>
        {config.status === 'beta' && <span style={styles.badge}>Beta</span>}
      </header>
      <main style={styles.content}>{children}</main>
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  shell: {
    width: '100%',
    maxWidth: '500px',
    margin: '0 auto',
    padding: '20px 16px',
    minHeight: '100vh',
    boxSizing: 'border-box',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginBottom: '24px',
  },
  title: {
    fontSize: 'clamp(18px, 5vw, 24px)',
    fontWeight: 700,
    margin: 0,
    color: 'var(--color-text, #333)',
  },
  badge: {
    fontSize: '11px',
    fontWeight: 600,
    padding: '2px 8px',
    borderRadius: '4px',
    backgroundColor: '#fef3c7',
    color: '#92400e',
    textTransform: 'uppercase',
  },
  content: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
}
