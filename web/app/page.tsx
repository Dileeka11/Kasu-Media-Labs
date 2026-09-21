import type { Metadata } from 'next';
import { getSiteData } from '../lib/api';
import SiteClient from '../components/SiteClient';
import { BRAND, CITY, COUNTRY, DEFAULT_DESCRIPTION, HOME_TITLE, KEYWORDS, SITE_URL } from '../lib/seo';

export async function generateMetadata(): Promise<Metadata> {
  // A fixed, concise description keeps the meta description within the search
  // snippet limit — the admin hero copy is long marketing prose, unsuitable
  // as a meta description (it was being truncated by search engines).
  const description = DEFAULT_DESCRIPTION;

  return {
    // Absolute title so the keyword-rich homepage title isn't wrapped by the
    // "%s — KML Productions" template.
    title: { absolute: HOME_TITLE },
    description,
    keywords: KEYWORDS,
    alternates: { canonical: '/' },
    openGraph: {
      type: 'website',
      url: SITE_URL,
      siteName: BRAND,
      title: HOME_TITLE,
      description,
    },
    twitter: {
      card: 'summary_large_image',
      title: HOME_TITLE,
      description,
    },
  };
}

export default async function HomePage() {
  const data = await getSiteData();

  const studio = data?.studio_name || BRAND;
  const description = data?.hero_subheadline || DEFAULT_DESCRIPTION;
  const sameAs = data?.socials ? Object.values(data.socials).filter(Boolean) : [];
  const services = [
    'Commercial & TV Ad Production',
    'Corporate Video Production',
    'Product Videos',
    'Brand Films',
    'Documentary Production',
    'Social Media Video Content',
    'Drone & Aerial Cinematography',
    'Video Editing & Post-Production',
    'Color Grading',
    'Motion Graphics & Visual Effects',
  ];

  // Structured data so search engines understand the business, its location and
  // the services it offers — the foundation for local + rich-result SEO.
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        // ProfessionalService is a subtype of LocalBusiness → covers both the
        // company entity and local-SEO signals in one node.
        '@type': ['Organization', 'ProfessionalService'],
        '@id': `${SITE_URL}/#organization`,
        name: studio,
        alternateName: 'KML Productions',
        url: SITE_URL,
        description: DEFAULT_DESCRIPTION,
        ...(data?.logo_url
          ? { logo: { '@type': 'ImageObject', url: data.logo_url }, image: data.logo_url }
          : {}),
        ...(data?.contact_email ? { email: data.contact_email } : {}),
        ...(data?.phone ? { telephone: data.phone } : {}),
        address: {
          '@type': 'PostalAddress',
          ...(data?.address ? { streetAddress: data.address } : {}),
          addressLocality: CITY,
          addressCountry: 'LK',
        },
        areaServed: [
          { '@type': 'Country', name: COUNTRY },
          { '@type': 'City', name: CITY },
        ],
        knowsAbout: [
          'Video Production',
          'Cinematography',
          'Corporate Video',
          'Commercial Production',
          'Documentary Film',
          'Video Editing',
          'Color Grading',
          'Motion Graphics',
        ],
        hasOfferCatalog: {
          '@type': 'OfferCatalog',
          name: 'Video Production Services',
          itemListElement: services.map((s) => ({
            '@type': 'Offer',
            itemOffered: { '@type': 'Service', name: s },
          })),
        },
        ...(sameAs.length ? { sameAs } : {}),
      },
      {
        '@type': 'WebSite',
        '@id': `${SITE_URL}/#website`,
        name: studio,
        url: SITE_URL,
        inLanguage: 'en',
        publisher: { '@id': `${SITE_URL}/#organization` },
      },
      {
        '@type': 'WebPage',
        '@id': `${SITE_URL}/#webpage`,
        url: `${SITE_URL}/`,
        name: `${studio} — Video Production Company in ${CITY}, ${COUNTRY}`,
        description,
        isPartOf: { '@id': `${SITE_URL}/#website` },
        about: { '@id': `${SITE_URL}/#organization` },
        inLanguage: 'en',
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: `${SITE_URL}/` },
        ],
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
