'use client';

import { useEffect } from 'react';

/**
 * Drop this component anywhere in a page/layout and it will fire a
 * single POST to the backend whenever a real visitor loads the page.
 * Runs only in the browser (client component) so SSR/bots are never counted.
 */
export default function ViewTracker() {
  useEffect(() => {
    // Use absolute URL — static export doesn't handle relative /api paths
    const apiBase =
      process.env.NEXT_PUBLIC_API_URL && process.env.NEXT_PUBLIC_API_URL.startsWith('http')
        ? process.env.NEXT_PUBLIC_API_URL
        : 'https://kmlproductions.com/api';

    fetch(`${apiBase}/public/track-view`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    }).catch(() => {
      // Silent fail — tracking should never break the UI
    });
  }, []);

  return null;
}
