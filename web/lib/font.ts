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

export function fontStack(name: string | null | undefined): string {
  return FONT_OPTIONS.find((f) => f.name === name)?.stack ?? FONT_OPTIONS[0].stack;
}

/** Apply a font across the public site and remember it for boot. Client-only. */
export function applyFont(name: string): void {
  if (typeof document === 'undefined') return;
  const resolved = FONT_OPTIONS.some((f) => f.name === name) ? name : DEFAULT_FONT;
  document.documentElement.style.setProperty('--ui-font', fontStack(resolved));
  try {
    localStorage.setItem(STORAGE_KEY, resolved);
  } catch {
    /* storage unavailable — ignore */
  }
}
