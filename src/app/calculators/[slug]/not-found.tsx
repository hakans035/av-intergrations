import { CalculatorError } from '@/integrations/calculators'

export default function NotFound() {
  return (
    <CalculatorError
      code="NOT_FOUND"
      message="This calculator does not exist or is currently unavailable."
    />
  )
}
