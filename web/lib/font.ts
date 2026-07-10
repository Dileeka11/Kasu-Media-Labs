// Central font registry, shared by the admin panel and the public website.
// The chosen font is applied by setting the --ui-font CSS variable, which every
// text element — body, controls, nav, headings and labels alike — consumes via
// globals.css and inline styles, so the selected font applies uniformly across
// the entire site. On the server (SSR) the font is set inline on the site root
// from the admin-chosen value, so there is no flash before hydration.

export const FONT_OPTIONS = [
  { name: 'Manrope', stack: "'Manrope', system-ui, sans-serif" },
  { name: 'Inter', stack: "'Inter', system-ui, sans-serif" },
  { name: 'Poppins', stack: "'Poppins', system-ui, sans-serif" },
  { name: 'Roboto', stack: "'Roboto', system-ui, sans-serif" },
  { name: 'Open Sans', stack: "'Open Sans', system-ui, sans-serif" },
  { name: 'Lato', stack: "'Lato', system-ui, sans-serif" },
  { name: 'Montserrat', stack: "'Montserrat', system-ui, sans-serif" },
  { name: 'Nunito Sans', stack: "'Nunito Sans', system-ui, sans-serif" },
  { name: 'Raleway', stack: "'Raleway', system-ui, sans-serif" },
  { name: 'Work Sans', stack: "'Work Sans', system-ui, sans-serif" },
  { name: 'DM Sans', stack: "'DM Sans', system-ui, sans-serif" },
  { name: 'Plus Jakarta Sans', stack: "'Plus Jakarta Sans', system-ui, sans-serif" },
  { name: 'Sora', stack: "'Sora', system-ui, sans-serif" },
  { name: 'Outfit', stack: "'Outfit', system-ui, sans-serif" },
  { name: 'Rubik', stack: "'Rubik', system-ui, sans-serif" },
  { name: 'IBM Plex Sans', stack: "'IBM Plex Sans', system-ui, sans-serif" },
  { name: 'Space Grotesk', stack: "'Space Grotesk', system-ui, sans-serif" },
  { name: 'Playfair Display', stack: "'Playfair Display', Georgia, serif" },
  { name: 'Lora', stack: "'Lora', Georgia, serif" },
  { name: 'Merriweather', stack: "'Merriweather', Georgia, serif" },
  { name: 'Space Mono', stack: "'Space Mono', ui-monospace, monospace" },
  { name: 'System', stack: "system-ui, -apple-system, 'Segoe UI', sans-serif" },
] as const;

export type FontName = (typeof FONT_OPTIONS)[number]['name'];

const DEFAULT_FONT: FontName = 'Manrope';
const STORAGE_KEY = 'kml_font';

// Google Fonts `css2` family segments (name → the `family=…` part with weights).
// Only the chosen font is fetched at runtime, so a visitor downloads one family
// instead of all 21. The default (Manrope) is loaded eagerly in the layout head.
const GF_SEGMENTS: Record<string, string> = {
  Manrope: 'Manrope:wght@400;500;600;700;800',
  Inter: 'Inter:wght@400;500;600;700',
  Poppins: 'Poppins:wght@400;500;600;700',
  Roboto: 'Roboto:wght@400;500;700',
  'Open Sans': 'Open+Sans:wght@400;500;600;700',
  Lato: 'Lato:wght@400;700',
  Montserrat: 'Montserrat:wght@400;500;600;700',
  'Nunito Sans': 'Nunito+Sans:wght@400;600;700;800',
  Raleway: 'Raleway:wght@400;500;600;700',
  'Work Sans': 'Work+Sans:wght@400;500;600;700',
  'DM Sans': 'DM+Sans:wght@400;500;600;700',
  'Plus Jakarta Sans': 'Plus+Jakarta+Sans:wght@400;500;600;700',
  Sora: 'Sora:wght@400;500;600;700',
  Outfit: 'Outfit:wght@400;500;600;700',
  Rubik: 'Rubik:wght@400;500;600;700',
  'IBM Plex Sans': 'IBM+Plex+Sans:wght@400;500;600;700',
  'Space Grotesk': 'Space+Grotesk:wght@400;500;600;700',
  'Playfair Display': 'Playfair+Display:wght@400;500;600;700',
  Lora: 'Lora:wght@400;500;600;700',
  Merriweather: 'Merriweather:wght@400;700',
  'Space Mono': 'Space+Mono:wght@400;700',
};

export function fontStack(name: string | null | undefined): string {
  return FONT_OPTIONS.find((f) => f.name === name)?.stack ?? FONT_OPTIONS[0].stack;
}

/** Inject the Google Fonts stylesheet for a single family, once. Client-only. */
function loadFontFamily(name: string): void {
  const seg = GF_SEGMENTS[name];
  // Default (and System) are already covered by the eager <link> in the head.
  if (!seg || name === DEFAULT_FONT) return;
  const id = `gf-${name.replace(/\s+/g, '-').toLowerCase()}`;
  if (document.getElementById(id)) return;
  const link = document.createElement('link');
  link.id = id;
  link.rel = 'stylesheet';
  link.href = `https://fonts.googleapis.com/css2?family=${seg}&display=swap`;
  document.head.appendChild(link);
}

/** Apply a font across the public site and remember it for boot. Client-only. */
export function applyFont(name: string): void {
  if (typeof document === 'undefined') return;
  const resolved = FONT_OPTIONS.some((f) => f.name === name) ? name : DEFAULT_FONT;
  loadFontFamily(resolved);
  document.documentElement.style.setProperty('--ui-font', fontStack(resolved));
  try {
    localStorage.setItem(STORAGE_KEY, resolved);
  } catch {
    /* storage unavailable — ignore */
  }
}

/** Preload the studio's last-known font on boot, before the API responds, so a
 *  returning visitor's chosen font swaps in as early as possible. Client-only. */
export function preloadSavedFont(): void {
  if (typeof document === 'undefined') return;
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) loadFontFamily(saved);
  } catch {
    /* storage unavailable — ignore */
  }
}
