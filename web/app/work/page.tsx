import type { Metadata } from 'next';
import { getSiteData } from '../../lib/api';
import WorkClient from '../../components/WorkClient';
import { BRAND, CITY, COUNTRY, SITE_URL } from '../../lib/seo';

export async function generateMetadata(): Promise<Metadata> {
  const data = await getSiteData();
  const studio = data?.studio_name || BRAND;
  const count = data?.projects?.length ?? 0;
  const title = `Our Work — Video Production Portfolio${count ? ` (${count} Projects)` : ''}`;
  const description =
    `Explore ${studio}'s video production portfolio in ${CITY}, ${COUNTRY}` +
    `${count ? ` — ${count} projects` : ''}: commercials, corporate films, product videos, ` +
    'brand films, documentaries and social content.';
  return {
    title,
    description,
    keywords: [
      'video production portfolio Sri Lanka',
      'video production showreel Colombo',
      'commercial video examples',
      'corporate film portfolio',
      'KML Productions work',
    ],
    alternates: { canonical: '/work' },
    openGraph: {
      type: 'website',
      url: `${SITE_URL}/work`,
      siteName: studio,
      title: `Our Work — ${studio}`,
      description,
    },
    twitter: {
      card: 'summary_large_image',
      title: `Our Work — ${studio}`,
      description,
    },
  };
}

export default async function WorkPage() {
  const data = await getSiteData();
  const studio = data?.studio_name || BRAND;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'CollectionPage',
        '@id': `${SITE_URL}/work/#webpage`,
        url: `${SITE_URL}/work`,
        name: `Our Work — ${studio}`,
        description: `The full ${studio} video production portfolio: commercials, corporate films, documentaries and social content.`,
        isPartOf: { '@id': `${SITE_URL}/#website` },
        inLanguage: 'en',
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: `${SITE_URL}/` },
          { '@type': 'ListItem', position: 2, name: 'Our Work', item: `${SITE_URL}/work` },
        ],
      },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <WorkClient initialData={data} />
    </>
  );
}
