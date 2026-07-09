import type { SiteData } from './types';

// Base URL the Next server uses to reach the Laravel API during SSR.
const API_URL = process.env.API_URL ?? 'http://localhost:8000/api';

/**
 * Fetch the full public site payload on the server. Revalidated periodically so
 * content edited in the admin panel appears without a redeploy, while every
 * request still gets fully server-rendered HTML (good for SEO).
 *
 * Returns null if the API is unreachable so pages can render with sane defaults
 * instead of crashing the build/request.
 */
export async function getSiteData(): Promise<SiteData | null> {
  try {
    const res = await fetch(`${API_URL}/public/site`, {
      headers: { Accept: 'application/json' },
      next: { revalidate: 60 },
    });
    if (!res.ok) return null;
    return (await res.json()) as SiteData;
  } catch {
    return null;
  }
}
