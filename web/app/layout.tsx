import type { Metadata, Viewport } from 'next';
import './globals.css';
import ViewTracker from '../components/ViewTracker';
import { BRAND, CITY, COUNTRY, DEFAULT_DESCRIPTION, KEYWORDS, LOCALE, SITE_URL } from '../lib/seo';

// Only the default font is loaded eagerly here. Whichever font the studio has
// chosen in the admin panel is fetched on demand at runtime (lib/font.ts), so a
// visitor downloads one family instead of all 21 — a big first-paint win.
const FONTS_HREF =
  'https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&display=swap';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${BRAND} — Video Production Company in ${CITY}, ${COUNTRY}`,
    template: `%s — ${BRAND}`,
  },
  description: DEFAULT_DESCRIPTION,
  keywords: KEYWORDS,
  applicationName: BRAND,
  authors: [{ name: BRAND, url: SITE_URL }],
  creator: BRAND,
  publisher: BRAND,
  category: 'Video Production',
  // Stop mobile browsers auto-linking phone/address in body copy as generic
  // links (keeps the real, intentional contact links authoritative).
  formatDetection: { telephone: false, address: false, email: false },
  icons: {
    icon: [{ url: '/favicon.svg', type: 'image/svg+xml' }],
    apple: '/favicon.svg',
  },
  manifest: '/manifest.webmanifest',
  alternates: { canonical: '/' },
  openGraph: {
    type: 'website',
    locale: LOCALE,
    url: SITE_URL,
    siteName: BRAND,
    title: `${BRAND} — Video Production Company in ${CITY}, ${COUNTRY}`,
    description: DEFAULT_DESCRIPTION,
  },
  twitter: {
    card: 'summary_large_image',
    title: `${BRAND} — Video Production Company in ${CITY}, ${COUNTRY}`,
    description: DEFAULT_DESCRIPTION,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-video-preview': -1,
      'max-snippet': -1,
    },
  },
  appleWebApp: { capable: true, title: BRAND, statusBarStyle: 'black-translucent' },
};

export const viewport: Viewport = {
  themeColor: '#0C0A16',
  colorScheme: 'light dark',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link href={FONTS_HREF} rel="stylesheet" />
      </head>
      <body>
        <ViewTracker />
        {children}
      </body>
    </html>
  );
}
