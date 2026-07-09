'use client';

import { useState } from 'react';

export function KLogo({ size = 26, gradient = false }: { size?: number; gradient?: boolean }) {
  return (
    <div
      className="k-logo"
      style={{
        width: size,
        height: Math.round(size * 1.27),
        background: gradient ? 'var(--grad-steep)' : '#fff',
      }}
    />
  );
}

// Renders the brand mark. Prefers the logo uploaded in the admin panel (`src`),
// then /logo-mark.png, then falls back to the vector KLogo shape — so the UI
// never breaks regardless of which assets exist.
export function KLogoImg({ size = 26, gradient = false, src }: { size?: number; gradient?: boolean; src?: string | null }) {
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  const candidate = src || '/logo-mark.png';
  if (candidate === failedSrc) return <KLogo size={size} gradient={gradient} />;
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      key={candidate}
      src={candidate}
      alt="KML Production"
      onError={() => setFailedSrc(candidate)}
      style={{ height: Math.round(size * 1.27), width: 'auto', display: 'block', objectFit: 'contain' }}
    />
  );
}
