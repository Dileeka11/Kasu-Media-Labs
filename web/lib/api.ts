import type { SiteData } from './types';

// Base URL the Next server uses to reach the Laravel API during SSR.
const API_URL = process.env.API_URL ?? 'http://localhost:8000/api';

/**
 * The API can hand back absolute `http://kmlproductions.com/storage/...` URLs
 * for uploaded media (Laravel's asset() built from a non-https APP_URL). On the
 * https site those http images trip Chrome's mixed-content "Not secure" warning,
 * so rewrite our own domain to https here. External http links are left alone.
 */
export function forceHttps<T>(data: T): T {
  if (data == null) return data;
  const json = JSON.stringify(data).replace(
    /http:\/\/(www\.)?kmlproductions\.com/g,
    'https://kmlproductions.com',
  );
  return JSON.parse(json) as T;
}

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
    return forceHttps((await res.json()) as SiteData);
  } catch {
    return null;
  }
}
