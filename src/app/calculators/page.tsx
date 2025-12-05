import { redirect } from 'next/navigation'
import { getEnabledCalculators } from '@/integrations/calculators'

export default function CalculatorsPage() {
  const enabledCalculators = getEnabledCalculators()

  if (enabledCalculators.length > 0) {
    // Redirect to first enabled calculator
    redirect(`/calculators/${enabledCalculators[0]}`)
  }

  return (
    <div style={{ padding: '40px 20px', textAlign: 'center' }}>
      <h1>No calculators available</h1>
      <p>Please check the calculator configuration.</p>
    </div>
  )
}
