import { ImageResponse } from 'next/og';
import { BRAND, CITY, COUNTRY } from '../lib/seo';

// Branded 1200×630 social-share card, generated once at build time (compatible
// with `output: 'export'`). Applies to every page's og:image + twitter:image.
// Required so the image is baked to a static file under `output: 'export'`.
export const dynamic = 'force-static';

export const alt = `${BRAND} — Video Production Company in ${CITY}, ${COUNTRY}`;
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: '80px',
          background: '#0C0A16',
          color: '#F7F6FB',
          fontFamily: 'sans-serif',
        }}
      >
        {/* Accent bar in the brand gradient */}
        <div
          style={{
            width: 120,
            height: 12,
            borderRadius: 6,
            background: 'linear-gradient(115deg,#E86FA6,#8354C9 50%,#2B39B8)',
            marginBottom: 44,
          }}
        />
        <div
          style={{
            fontSize: 96,
            fontWeight: 800,
            letterSpacing: -3,
            lineHeight: 1,
            textTransform: 'uppercase',
          }}
        >
          {BRAND}
        </div>
        <div
          style={{
            display: 'flex',
            fontSize: 40,
            fontWeight: 600,
            color: '#CFCDE0',
            marginTop: 28,
          }}
        >
          Video Production Company
        </div>
        <div
          style={{
            display: 'flex',
            fontSize: 30,
            color: '#9C99B8',
            marginTop: 14,
            letterSpacing: 2,
            textTransform: 'uppercase',
          }}
        >
          {CITY}, {COUNTRY}
        </div>
      </div>
    ),
    { ...size },
  );
}
