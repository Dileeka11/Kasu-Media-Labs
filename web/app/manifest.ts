import type { MetadataRoute } from 'next';
import { BRAND, DEFAULT_DESCRIPTION } from '../lib/seo';

export const dynamic = 'force-static';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: BRAND,
    short_name: 'KML',
    description: DEFAULT_DESCRIPTION,
    start_url: '/',
    display: 'standalone',
    background_color: '#0C0A16',
    theme_color: '#0C0A16',
    icons: [
      {
        src: '/favicon.svg',
        sizes: 'any',
        type: 'image/svg+xml',
        purpose: 'any',
      },
    ],
  };
}
