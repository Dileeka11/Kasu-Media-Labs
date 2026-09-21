// Central SEO constants so titles, descriptions, keywords and structured data
// stay consistent across every page. Content-level copy still comes from the
// admin panel (SiteData); these are the fixed, brand/location-level defaults
// used for meta tags and JSON-LD.

export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';

// Official public brand (matches the domain kmlproductions.com).
export const BRAND = 'KML Productions';

// Primary market — drives local-SEO copy and structured-data service area.
export const CITY = 'Colombo';
export const COUNTRY = 'Sri Lanka';
export const LOCALE = 'en_LK';

// Default share/OG description used when the admin panel has no custom copy.
export const DEFAULT_DESCRIPTION =
  `${BRAND} is a full-service video production company in ${CITY}, ${COUNTRY} — ` +
  'cinematic commercials, corporate films, product videos, brand films, ' +
  'documentaries and social content, from concept to final delivery.';

// Site-wide keyword set. Google largely ignores the meta keywords tag, but Bing
// and other engines still read it, and this doubles as the documented keyword
// strategy the on-page copy and headings target.
export const KEYWORDS: string[] = [
  // Brand
  'KML Productions',
  'KML Productions Sri Lanka',
  'KML Productions Colombo',
  // Core service + location
  'video production company Sri Lanka',
  'video production company in Colombo',
  'video production house Colombo',
  'production house Sri Lanka',
  'corporate video production Sri Lanka',
  'commercial video production Colombo',
  'TV commercial production Sri Lanka',
  'advertising film production Colombo',
  // Service-specific
  'cinematic video production',
  'corporate films Sri Lanka',
  'product video production',
  'brand films Sri Lanka',
  'documentary film production Sri Lanka',
  'social media video production',
  'drone videography Sri Lanka',
  'aerial cinematography Colombo',
  'motion graphics Sri Lanka',
  'video editing and post-production Colombo',
  'color grading services Sri Lanka',
  'event videography Colombo',
  'explainer video production',
  // Intent / long-tail
  'professional video production services Colombo',
  'best video production company in Sri Lanka',
  'hire a videographer in Colombo',
];
