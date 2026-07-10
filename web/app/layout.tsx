import type { Metadata } from 'next';
import './globals.css';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';

// Only the default font is loaded eagerly here. Whichever font the studio has
// chosen in the admin panel is fetched on demand at runtime (lib/font.ts), so a
// visitor downloads one family instead of all 21 — a big first-paint win.
const FONTS_HREF =
  'https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&display=swap';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'KML Production — Video Production House',
    template: '%s — KML Production',
  },
  description:
    'Full-service video production house. Cinematic commercials, corporate films, product videos, and documentaries — from concept to final delivery.',
  icons: { icon: '/favicon.svg' },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link href={FONTS_HREF} rel="stylesheet" />
      </head>
      <body>{children}</body>
    </html>
  );
}
