'use client'

interface CalculatorErrorProps {
  code: string
  message: string
  onRetry?: () => void
}

export function CalculatorError({ code, message, onRetry }: CalculatorErrorProps) {
  return (
    <div style={styles.container}>
      <div style={styles.icon}>!</div>
      <h2 style={styles.title}>Something went wrong</h2>
      <p style={styles.message}>{message}</p>
      <p style={styles.code}>Error code: {code}</p>
      {onRetry && (
        <button onClick={onRetry} style={styles.retryButton}>
          Try Again
        </button>
      )}
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    textAlign: 'center',
    padding: '40px 20px',
    maxWidth: '400px',
    margin: '0 auto',
  },
  icon: {
    width: '48px',
    height: '48px',
    borderRadius: '50%',
    backgroundColor: '#fef2f2',
    color: '#dc2626',
    fontSize: '24px',
    fontWeight: 700,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto 16px',
  },
  title: {
    fontSize: '20px',
    fontWeight: 600,
    color: 'var(--color-text, #333)',
    margin: '0 0 8px',
  },
  message: {
    fontSize: '14px',
    color: 'var(--color-text-muted, #666)',
    margin: '0 0 8px',
  },
  code: {
    fontSize: '12px',
    color: '#999',
    margin: 0,
  },
  retryButton: {
    marginTop: '16px',
    padding: '10px 20px',
    backgroundColor: '#f3f4f6',
    border: '1px solid #e5e7eb',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: 500,
    cursor: 'pointer',
    transition: 'all 200ms ease',
  },
}
