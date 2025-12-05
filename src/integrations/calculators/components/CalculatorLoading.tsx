export function CalculatorLoading() {
  return (
    <div style={styles.container}>
      <div style={styles.skeleton} />
      <div style={styles.skeleton} />
      <div style={styles.skeleton} />
      <div style={{ ...styles.skeleton, ...styles.skeletonButton }} />
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    padding: '20px 0',
  },
  skeleton: {
    height: '56px',
    borderRadius: '8px',
    backgroundColor: '#f3f4f6',
    animation: 'pulse 1.5s ease-in-out infinite',
  },
  skeletonButton: {
    height: '48px',
    marginTop: '8px',
  },
}
