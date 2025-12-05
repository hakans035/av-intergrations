'use client'

import { forwardRef, InputHTMLAttributes } from 'react'

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  helpText?: string
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helpText, id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-')

    return (
      <div style={styles.container}>
        {label && (
          <label htmlFor={inputId} style={styles.label}>
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          style={{
            ...styles.input,
            ...(error ? styles.inputError : {}),
          }}
          aria-invalid={!!error}
          aria-describedby={
            error ? `${inputId}-error` : helpText ? `${inputId}-help` : undefined
          }
          {...props}
        />
        {error && (
          <span id={`${inputId}-error`} style={styles.error} role="alert">
            {error}
          </span>
        )}
        {helpText && !error && (
          <span id={`${inputId}-help`} style={styles.helpText}>
            {helpText}
          </span>
        )}
      </div>
    )
  }
)

Input.displayName = 'Input'

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  label: {
    fontSize: '14px',
    fontWeight: 500,
    color: '#0a1d31',
  },
  input: {
    padding: '12px 14px',
    fontSize: '16px',
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
    outline: 'none',
    transition: 'border-color 0.2s, box-shadow 0.2s',
    backgroundColor: '#ffffff',
    color: '#0a1d31',
    width: '100%',
    boxSizing: 'border-box',
    fontFamily: 'inherit',
  },
  inputError: {
    borderColor: '#dc2626',
  },
  error: {
    fontSize: '12px',
    color: '#dc2626',
  },
  helpText: {
    fontSize: '12px',
    color: '#afafaf',
  },
}
