import Script from 'next/script';

interface ArticleSchemaProps {
  headline: string;
  description: string;
  slug: string;
  datePublished: string;
  dateModified: string;
  authorName: string;
  authorUrl?: string;
  imageUrl?: string;
  imageAlt?: string;
  language?: 'nl' | 'en';
}

export function ArticleSchema({
  headline,
  description,
  slug,
  datePublished,
  dateModified,
  authorName,
  authorUrl,
  imageUrl,
  imageAlt,
  language = 'nl',
}: ArticleSchemaProps) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline,
    description,
    url: `https://ambitionvalley.nl/blog-posts/${slug}`,
    inLanguage: language === 'nl' ? 'nl-NL' : 'en-US',
    datePublished,
    dateModified,
    author: {
      '@type': 'Person',
      name: authorName,
      ...(authorUrl && { url: authorUrl }),
    },
    publisher: {
      '@type': 'Organization',
      name: 'Ambition Valley',
      url: 'https://ambitionvalley.nl',
      logo: {
        '@type': 'ImageObject',
        url: 'https://ambitionvalley.nl/logo.png',
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `https://ambitionvalley.nl/blog-posts/${slug}`,
    },
    ...(imageUrl && {
      image: {
        '@type': 'ImageObject',
        url: imageUrl,
        ...(imageAlt && { caption: imageAlt }),
      },
    }),
  };

  return (
    <Script
      id={`article-schema-${slug}`}
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
