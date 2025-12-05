import Script from 'next/script';

interface StructuredDataProps {
  type?: 'WebApplication' | 'Organization';
}

export function StructuredData({ type = 'WebApplication' }: StructuredDataProps) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://check.ambitionvalley.nl';

  const webApplicationSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'Ambition Valley Belasting Check',
    description: 'Gratis 2-minuten check om te zien hoeveel belasting je kunt besparen',
    url: baseUrl,
    applicationCategory: 'FinanceApplication',
    operatingSystem: 'All',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'EUR',
    },
    provider: {
      '@type': 'Organization',
      name: 'Ambition Valley',
      url: 'https://ambitionvalley.nl',
    },
  };

  const organizationSchema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Ambition Valley',
    url: 'https://ambitionvalley.nl',
    logo: 'https://ambitionvalley.nl/logo.png',
    sameAs: [
      'https://www.linkedin.com/company/ambitionvalley',
    ],
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'customer service',
      availableLanguage: 'Dutch',
    },
  };

  const schema = type === 'Organization' ? organizationSchema : webApplicationSchema;

  return (
    <Script
      id={`structured-data-${type.toLowerCase()}`}
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
