'use client'

interface SliderProps {
  label: string
  value: number
  min: number
  max: number
  step?: number
  formatValue?: (value: number) => string
  onChange: (value: number) => void
}

export function Slider({
  label,
  value,
  min,
  max,
  step = 1,
  formatValue,
  onChange,
}: SliderProps) {
  const displayValue = formatValue ? formatValue(value) : String(value)

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <label style={styles.label}>{label}</label>
        <span style={styles.value}>{displayValue}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        style={styles.slider}
      />
      <div style={styles.range}>
        <span>{formatValue ? formatValue(min) : min}</span>
        <span>{formatValue ? formatValue(max) : max}</span>
      </div>
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  label: {
    fontSize: '14px',
    fontWeight: 500,
    color: '#334155',
  },
  value: {
    fontSize: '14px',
    fontWeight: 500,
    color: '#307cf1',
    backgroundColor: '#eff6ff',
    padding: '2px 8px',
    borderRadius: '4px',
  },
  slider: {
    width: '100%',
    height: '8px',
    borderRadius: '4px',
    appearance: 'none',
    background: '#e2e8f0',
    cursor: 'pointer',
    outline: 'none',
  },
  range: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '12px',
    color: '#94a3b8',
  },
}
