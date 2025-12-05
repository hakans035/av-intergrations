import { notFound } from 'next/navigation'
import { Suspense } from 'react'
import { registry, CalculatorClient, CalculatorLoading } from '@/integrations/calculators'

// Initialize calculators
import '@/integrations/calculators'

interface PageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params
  const entry = registry.get(slug)

  if (!entry) {
    return { title: 'Calculator Not Found' }
  }

  return {
    title: entry.name,
    description: entry.description,
  }
}

export default async function CalculatorPage({ params }: PageProps) {
  const { slug } = await params

  // Check if calculator exists in registry
  const entry = registry.get(slug)

  if (!entry) {
    notFound()
  }

  if (entry.status === 'disabled') {
    notFound()
  }

  // Pass only serializable data to client
  return (
    <Suspense fallback={<CalculatorLoading />}>
      <CalculatorClient slug={slug} />
    </Suspense>
  )
}
