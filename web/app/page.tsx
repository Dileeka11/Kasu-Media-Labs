import type { Metadata } from 'next';
import { getSiteData } from '../lib/api';
import SiteClient from '../components/SiteClient';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';

export async function generateMetadata(): Promise<Metadata> {
  const data = await getSiteData();
  const studio = data?.studio_name || 'KML Production';
  const kicker = data?.hero_kicker || 'Full-Service Video Production House';
  const headline = data?.hero_headline || 'We Create Videos That Move People';
  const description =
    data?.hero_subheadline ||
    `${studio} — ${kicker}. Cinematic commercials, corporate films, product videos, and documentaries, from concept to final delivery.`;
  const title = `${studio} — ${kicker}`;
  const image = data?.logo_url || `${SITE_URL}/favicon.svg`;

  return {
    title,
    description,
    alternates: { canonical: '/' },
    openGraph: {
      type: 'website',
      url: SITE_URL,
      siteName: studio,
      title: `${studio} — ${headline}`,
      description,
      images: [image],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${studio} — ${headline}`,
      description,
      images: [image],
    },
  };
}

export default async function HomePage() {
  const data = await getSiteData();

  const studio = data?.studio_name || 'KML Production';
  const sameAs = data?.socials ? Object.values(data.socials).filter(Boolean) : [];

  // Structured data so search engines understand the business.
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        name: studio,
        url: SITE_URL,
        ...(data?.logo_url ? { logo: data.logo_url } : {}),
        ...(data?.contact_email
          ? { contactPoint: { '@type': 'ContactPoint', contactType: 'sales', email: data.contact_email, ...(data.phone ? { telephone: data.phone } : {}) } }
          : {}),
        ...(sameAs.length ? { sameAs } : {}),
      },
      {
        '@type': 'WebSite',
        name: studio,
        url: SITE_URL,
      },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <SiteClient initialData={data} />
    </>
  );
}
