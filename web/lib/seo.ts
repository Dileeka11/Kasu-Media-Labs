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

// Meta/OG description — kept to ~140 chars so it isn't truncated in search
// results (Seobility flags anything over ~1000px / ~155 chars).
export const DEFAULT_DESCRIPTION =
  `${BRAND} is a video production company in ${CITY}, ${COUNTRY} — ` +
  'cinematic commercials, corporate films, brand films and documentaries.';

// Homepage <title>. Kept under ~580px (~55 chars) so search engines don't
// truncate it. "Sri Lanka" lives in the description + structured data instead.
export const HOME_TITLE = `${BRAND} — Video Production Company in ${CITY}`;

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
