'use client'

import { useState } from 'react'

type ModalState = 'form' | 'loading' | 'success' | 'error'

interface ReportModalProps {
  isOpen: boolean
  onClose: () => void
  calculatorType: string
  calculatorData?: {
    inputs: Record<string, unknown>
    results: Record<string, unknown>
  }
}

export function ReportModal({ isOpen, onClose, calculatorType, calculatorData }: ReportModalProps) {
  const [email, setEmail] = useState('')
  const [privacyAccepted, setPrivacyAccepted] = useState(false)
  const [validationError, setValidationError] = useState('')
  const [modalState, setModalState] = useState<ModalState>('form')
  const [serverError, setServerError] = useState('')

  if (!isOpen) return null

  const isValidEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  }

  const canSubmit = email && isValidEmail(email) && privacyAccepted && modalState === 'form'

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setValidationError('')
    setServerError('')

    if (!isValidEmail(email)) {
      setValidationError('Voer een geldig e-mailadres in')
      return
    }

    if (!privacyAccepted) {
      setValidationError('Accepteer de privacy policy om door te gaan')
      return
    }

    // Set loading state
    setModalState('loading')

    try {
      // Call the actual API endpoint
      const response = await fetch('/api/report/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          calculator: calculatorType,
          inputs: calculatorData?.inputs || {},
          results: calculatorData?.results || {},
        }),
      })

      const data = await response.json()

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to send report')
      }

      console.log('Report sent successfully:', { email, calculatorType })

      // Set success state
      setModalState('success')
    } catch (err) {
      // Set error state
      console.error('Report error:', err)
      setModalState('error')
      setServerError(err instanceof Error ? err.message : 'Er is iets misgegaan. Probeer het opnieuw.')
    }
  }

  const handleRetry = () => {
    setModalState('form')
    setServerError('')
  }

  const handleClose = () => {
    // Reset state when closing
    setEmail('')
    setPrivacyAccepted(false)
    setValidationError('')
    setServerError('')
    setModalState('form')
    onClose()
  }

  const handleOverlayClick = (e: React.MouseEvent) => {
    // Don't close during loading
    if (modalState === 'loading') return
    if (e.target === e.currentTarget) {
      handleClose()
    }
  }

  // Success State
  if (modalState === 'success') {
    return (
      <div style={styles.overlay} onClick={handleOverlayClick}>
        <div style={styles.modal}>
          <div style={styles.content}>
            <div style={styles.successIcon}>
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
            </div>
            <h2 style={styles.title}>Uw rapport is verzonden!</h2>
            <p style={styles.subtitle}>
              Controleer uw inbox (en spam folder) voor de e-mail
            </p>
            <button
              onClick={handleClose}
              style={styles.submitButton}
            >
              Sluiten
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Error State
  if (modalState === 'error') {
    return (
      <div style={styles.overlay} onClick={handleOverlayClick}>
        <div style={styles.modal}>
          <button style={styles.closeButton} onClick={handleClose} aria-label="Sluiten">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
          <div style={styles.content}>
            <div style={styles.errorIcon}>
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
            </div>
            <h2 style={styles.title}>Er is iets misgegaan</h2>
            <p style={styles.subtitle}>
              {serverError || 'De server is tijdelijk niet beschikbaar. Probeer het later opnieuw.'}
            </p>
            <button
              onClick={handleRetry}
              style={styles.submitButton}
            >
              Opnieuw proberen
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Loading State or Form State
  return (
    <div style={styles.overlay} onClick={handleOverlayClick}>
      <div style={styles.modal}>
        {modalState !== 'loading' && (
          <button style={styles.closeButton} onClick={handleClose} aria-label="Sluiten">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        )}

        <div style={styles.content}>
          <h2 style={styles.title}>Ontvang uw persoonlijke rapport</h2>
          <p style={styles.subtitle}>
            Vul uw e-mailadres in om een gedetailleerde analyse te ontvangen
          </p>

          <form onSubmit={handleSubmit} style={styles.form}>
            <div style={styles.inputWrapper}>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="uw@email.nl"
                style={styles.input}
                aria-label="E-mailadres"
                disabled={modalState === 'loading'}
              />
            </div>

            {validationError && <p style={styles.error}>{validationError}</p>}

            <label style={{
              ...styles.checkboxLabel,
              ...(modalState === 'loading' ? { opacity: 0.6, pointerEvents: 'none' } : {}),
            }}>
              <input
                type="checkbox"
                checked={privacyAccepted}
                onChange={(e) => setPrivacyAccepted(e.target.checked)}
                style={styles.checkbox}
                disabled={modalState === 'loading'}
              />
              <span>
                Ik ga akkoord met de{' '}
                <a
                  href="https://ambitionvalley.nl/privacy"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={styles.link}
                >
                  privacy policy
                </a>
              </span>
            </label>

            <button
              type="submit"
              disabled={!canSubmit}
              style={{
                ...styles.submitButton,
                ...(canSubmit ? {} : styles.submitButtonDisabled),
              }}
            >
              {modalState === 'loading' ? (
                <span style={styles.loadingContent}>
                  <span style={styles.spinner} />
                  Bezig met versturen...
                </span>
              ) : (
                'Verstuur rapport'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    padding: '20px',
  },
  modal: {
    position: 'relative',
    backgroundColor: '#ffffff',
    borderRadius: '16px',
    padding: '32px',
    maxWidth: '440px',
    width: '100%',
    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
  },
  closeButton: {
    position: 'absolute',
    top: '16px',
    right: '16px',
    background: 'none',
    border: 'none',
    padding: '8px',
    cursor: 'pointer',
    color: '#64748b',
    borderRadius: '8px',
    transition: 'all 200ms ease',
  },
  content: {
    textAlign: 'center',
  },
  title: {
    fontSize: '24px',
    fontWeight: 600,
    color: '#0f172a',
    marginBottom: '8px',
    marginTop: 0,
  },
  subtitle: {
    fontSize: '15px',
    color: '#64748b',
    marginBottom: '24px',
    lineHeight: 1.5,
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  inputWrapper: {
    width: '100%',
  },
  input: {
    width: '100%',
    padding: '14px 16px',
    fontSize: '16px',
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
    outline: 'none',
    transition: 'border-color 200ms ease, box-shadow 200ms ease',
    boxSizing: 'border-box',
  },
  error: {
    color: '#dc2626',
    fontSize: '14px',
    margin: 0,
    textAlign: 'left',
  },
  checkboxLabel: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '10px',
    fontSize: '14px',
    color: '#475569',
    textAlign: 'left',
    cursor: 'pointer',
  },
  checkbox: {
    width: '18px',
    height: '18px',
    marginTop: '2px',
    cursor: 'pointer',
    accentColor: '#307cf1',
  },
  link: {
    color: '#307cf1',
    textDecoration: 'underline',
  },
  submitButton: {
    width: '100%',
    padding: '16px 28px',
    backgroundColor: '#307cf1',
    color: '#ffffff',
    border: '1px solid #307cf1',
    borderRadius: '100px',
    fontSize: '16px',
    fontWeight: 500,
    cursor: 'pointer',
    transition: 'all 200ms ease',
  },
  submitButtonDisabled: {
    backgroundColor: '#94a3b8',
    borderColor: '#94a3b8',
    cursor: 'not-allowed',
  },
  loadingContent: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '10px',
  },
  spinner: {
    width: '18px',
    height: '18px',
    border: '2px solid rgba(255, 255, 255, 0.3)',
    borderTopColor: '#ffffff',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
  },
  successIcon: {
    marginBottom: '16px',
  },
  errorIcon: {
    marginBottom: '16px',
  },
}
