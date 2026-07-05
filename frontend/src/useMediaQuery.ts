import { useEffect, useState } from 'react';

/**
 * Subscribe to a CSS media query and re-render when it changes.
 * SSR-safe (returns false until mounted).
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(() =>
    typeof window !== 'undefined' && 'matchMedia' in window ? window.matchMedia(query).matches : false,
  );

  useEffect(() => {
    if (typeof window === 'undefined' || !('matchMedia' in window)) return;
    const mql = window.matchMedia(query);
    const onChange = () => setMatches(mql.matches);
    onChange();
    mql.addEventListener('change', onChange);
    return () => mql.removeEventListener('change', onChange);
  }, [query]);

  return matches;
}

/** Phones and small tablets (portrait). */
export function useIsMobile(): boolean {
  return useMediaQuery('(max-width: 768px)');
}

/** Tablets / narrow laptops — used to relax multi-column layouts. */
export function useIsTablet(): boolean {
  return useMediaQuery('(max-width: 1024px)');
}
