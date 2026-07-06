import { useEffect, useMemo, useRef, useState, type CSSProperties, type FormEvent, type ReactElement } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import type { Category, Project, Socials, Stat, ClientItem, Testimonial } from '../types';
import { KLogoImg } from '../components/ui';
import { WorkCard, VideoModal, Placeholder, type ActiveVideo } from '../components/work';
import { applyFont } from '../font';
import { useIsMobile, useIsTablet } from '../useMediaQuery';

const API = (import.meta.env.VITE_API_URL ?? 'http://localhost:8000/api') as string;

interface SiteData {
  studio_name: string;
  contact_email: string;
  font: string;
  logo_url: string | null;
  hero_video_url: string | null;
  showreel_url: string | null;
  hero_kicker: string | null;
  hero_headline: string | null;
  hero_subheadline: string | null;
  phone: string | null;
  address: string | null;
  socials: Socials | null;
  stats: Stat[] | null;
  clients: ClientItem[] | null;
  testimonials: Testimonial[] | null;
  ticker_items: string[] | null;
  projects: Project[];
  categories: Category[];
}

const grad = 'linear-gradient(115deg,#E86FA6,#8354C9 50%,#2B39B8)';

const services = [
  { phase: '01', tag: 'Pre-Production', items: ['Concept & Creative Development', 'Scriptwriting', 'Storyboarding', 'Location Scouting', 'Casting', 'Production Planning'] },
  { phase: '02', tag: 'Production', items: ['Commercial Filming', 'Corporate Videos', 'Interviews', 'Product Videos', 'Event Coverage', 'Drone Cinematography'] },
  { phase: '03', tag: 'Post-Production', items: ['Video Editing', 'Color Grading', 'Motion Graphics', 'Visual Effects', 'Sound Design', 'Delivery for Web / TV / Social'] },
];

const processSteps = [
  { n: '01', tc: '00:00', t: 'Discover', d: 'We understand your brand, goals, and audience.' },
  { n: '02', tc: '00:12', t: 'Plan', d: 'We develop the concept, script, and production plan.' },
  { n: '03', tc: '00:24', t: 'Produce', d: 'Professional filming using cinema-grade equipment.' },
  { n: '04', tc: '00:38', t: 'Edit', d: 'Editing, color grading, motion graphics, sound design.' },
  { n: '05', tc: '00:52', t: 'Deliver', d: 'Final optimized videos ready for every platform.' },
];

// Fallbacks used only until the studio fills these in from the admin panel.
const defaultTestimonials = [
  { q: 'The team transformed our idea into an incredible commercial. The production quality was outstanding.', a: 'Sarah Lin', r: 'Brand Manager, Aether' },
  { q: 'Their storytelling and cinematic quality elevated our brand far beyond what we imagined.', a: 'Marcus Reed', r: 'CMO, Vertex' },
  { q: 'From concept to delivery, flawless execution. We book them for every campaign now.', a: 'Dana Okoye', r: 'Head of Marketing, Lumen' },
];
const defaultStats = [
  { value: '250+', label: 'Projects delivered' },
  { value: '7 yrs', label: 'In production' },
  { value: '40+', label: 'Brands served' },
];

const objectives = [
  { n: '01', t: 'Deliver High-Quality Productions', d: 'Produce professional, cinematic videos that meet international production standards.' },
  { n: '02', t: 'Support Brand Storytelling', d: 'Help businesses communicate their identity and message through impactful visual content.' },
  { n: '03', t: 'Provide End-to-End Services', d: 'Concept development, filming, editing, and post-production under one roof.' },
  { n: '04', t: 'Innovate with Technology', d: 'Use the latest cameras, drones, editing tools, and visual effects to elevate quality.' },
  { n: '05', t: 'Build Long-Term Relationships', d: 'Establish trusted partnerships with brands, agencies, and organizations.' },
  { n: '06', t: 'Create Engaging Digital Content', d: 'Videos optimized for social media, marketing campaigns, and digital platforms.' },
];

const equipment = ['Cinema Cameras', 'Professional Lighting', 'Aerial Drones', 'Gimbal Stabilizers', 'Sound Equipment', 'Full Studio Setup'];
const defaultClients = ['NOVA', 'Atlas Group', 'Vertex', 'LUMEN', 'Skyline', 'Orbit Media', 'Frameworks', 'Meridian'];
// Fallback used only until the studio fills the ticker in from the admin panel.
const defaultTickerItems = ['Commercials', 'Corporate Films', 'Product Videos', 'Drone Cinematography', 'Documentaries', 'Motion Graphics'];
const navLinks = [
  ['Work', '#work'],
  ['Services', '#services'],
  ['About', '#about'],
  ['Process', '#process'],
  ['Contact', '#contact'],
] as const;

// Real brand icons for the social links, keyed by the Socials field name.
const socialIcons: Record<string, ReactElement> = {
  instagram: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.051.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z"/>
    </svg>
  ),
  youtube: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
    </svg>
  ),
  vimeo: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M23.977 6.416c-.105 2.338-1.739 5.543-4.894 9.609-3.268 4.247-6.026 6.37-8.29 6.37-1.409 0-2.578-1.294-3.553-3.881L5.322 11.4C4.603 8.816 3.834 7.522 3.01 7.522c-.179 0-.806.378-1.881 1.132L0 7.197c1.185-1.044 2.351-2.084 3.501-3.128C5.08 2.701 6.266 1.984 7.055 1.91c1.867-.18 3.016 1.1 3.447 3.838.465 2.953.789 4.789.971 5.507.539 2.45 1.131 3.674 1.776 3.674.502 0 1.256-.796 2.265-2.385 1.004-1.589 1.54-2.797 1.612-3.628.144-1.371-.395-2.061-1.614-2.061-.574 0-1.167.121-1.777.391 1.186-3.868 3.434-5.757 6.762-5.637 2.502.06 3.678 1.664 3.554 4.804z"/>
    </svg>
  ),
  linkedin: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
    </svg>
  ),
};

const heroSlides: CSSProperties[] = [
  { background: 'radial-gradient(900px 600px at 30% 40%,rgba(131,84,201,.55),transparent 65%),radial-gradient(700px 500px at 75% 70%,rgba(43,57,184,.45),transparent 60%),#0C0A16' },
  { background: 'radial-gradient(900px 600px at 70% 30%,rgba(232,111,166,.4),transparent 60%),radial-gradient(800px 600px at 25% 75%,rgba(43,57,184,.5),transparent 60%),#0D0A18' },
  { background: 'radial-gradient(1000px 700px at 50% 60%,rgba(124,137,255,.35),transparent 65%),radial-gradient(600px 500px at 85% 25%,rgba(131,84,201,.45),transparent 55%),#0B0914' },
];

// Counts up from 0 to the number inside `value` when it scrolls into view,
// preserving any prefix/suffix (e.g. "250+", "7 yrs").
function Counter({ value }: { value: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [display, setDisplay] = useState('');
  useEffect(() => {
    const el = ref.current;
    const m = value.match(/^([^\d]*)([\d,]+)(.*)$/);
    if (!el || !m || typeof IntersectionObserver === 'undefined') {
      setDisplay(value);
      return;
    }
    const [, prefix, digits, suffix] = m;
    const target = parseInt(digits.replace(/,/g, ''), 10);
    setDisplay(prefix + '0' + suffix);
    let raf = 0;
    const io = new IntersectionObserver(
      (entries) => {
        if (!entries[0].isIntersecting) return;
        io.disconnect();
        const dur = 1500;
        const start = performance.now();
        const tick = (now: number) => {
          const p = Math.min(1, (now - start) / dur);
          const eased = 1 - Math.pow(1 - p, 3);
          setDisplay(prefix + Math.round(target * eased).toLocaleString() + suffix);
          if (p < 1) raf = requestAnimationFrame(tick);
        };
        raf = requestAnimationFrame(tick);
      },
      { threshold: 0, rootMargin: '0px 0px -60px 0px' },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [value]);
  return <span ref={ref}>{display || value}</span>;
}

export default function Site() {
  const isMobile = useIsMobile();
  const isTablet = useIsTablet();
  const [menuOpen, setMenuOpen] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>(() => (localStorage.getItem('kml_theme') === 'dark' ? 'dark' : 'light'));
  const [scrolled, setScrolled] = useState(false);
  const [data, setData] = useState<SiteData | null>(null);
  const [filter, setFilter] = useState('All');
  const [activeVideo, setActiveVideo] = useState<ActiveVideo | null>(null);
  const [form, setForm] = useState({ name: '', email: '', company: '', type: '', budget: '', message: '' });
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState('');
  const [dataReady, setDataReady] = useState(false);
  const [minElapsed, setMinElapsed] = useState(false);
  const [loaderGone, setLoaderGone] = useState(false);
  // Remember the uploaded logo so the preloader (which renders before the API
  // responds) can show the real brand mark instantly on repeat visits.
  const [logoSrc, setLogoSrc] = useState<string | null>(() => localStorage.getItem('kml_logo'));
  const contactRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 80);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    void axios
      .get<SiteData>(`${API}/public/site`)
      .then((res) => {
        setData(res.data);
        applyFont(res.data.font); // match the studio font chosen in admin Settings
        if (res.data.logo_url) {
          setLogoSrc(res.data.logo_url);
          localStorage.setItem('kml_logo', res.data.logo_url); // cache for the next visit's preloader
        } else {
          localStorage.removeItem('kml_logo');
        }
      })
      .finally(() => setDataReady(true)); // hide the loader even if the request fails (defaults kick in)
  }, []);

  // Keep the browser-tab favicon + title in sync with the studio's brand.
  // Seed from the cached logo on first paint so the tab icon never flashes the
  // default, then refresh once the live site data arrives.
  useEffect(() => {
    const url = data?.logo_url || localStorage.getItem('kml_logo');
    if (url) {
      let link = document.querySelector<HTMLLinkElement>('link[rel="icon"]');
      if (!link) {
        link = document.createElement('link');
        link.rel = 'icon';
        document.head.appendChild(link);
      }
      link.removeAttribute('type'); // let the browser infer png/svg/… from the file
      link.href = url;
    }
    if (data?.studio_name) document.title = `${data.studio_name} — Video Production`;
  }, [data?.logo_url, data?.studio_name]);

  // Preloader timing: keep it on screen for at least a beat so it never flashes,
  // then fade out once the site data has arrived, then drop it from the DOM.
  useEffect(() => {
    const t = setTimeout(() => setMinElapsed(true), 900);
    return () => clearTimeout(t);
  }, []);
  const loaderHidden = dataReady && minElapsed;
  useEffect(() => {
    if (!loaderHidden) return;
    const t = setTimeout(() => setLoaderGone(true), 550);
    return () => clearTimeout(t);
  }, [loaderHidden]);

  useEffect(() => {
    localStorage.setItem('kml_theme', theme);
  }, [theme]);

  // Scroll-reveal: fade/rise elements in as they enter the viewport. Re-runs
  // when `data` arrives so late-rendered sections (work rows, films) get wired.
  useEffect(() => {
    const els = Array.from(document.querySelectorAll<HTMLElement>('.reveal, .reveal-stagger'));
    if (!('IntersectionObserver' in window) || !els.length) {
      els.forEach((el) => el.classList.add('in'));
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('in');
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -8% 0px' },
    );
    els.forEach((el) => {
      if (el.classList.contains('in')) return;
      io.observe(el);
    });
    return () => io.disconnect();
  }, [data, filter]);

  const projects = useMemo(() => data?.projects ?? [], [data]);
  const cats = useMemo(() => ['All', ...(data?.categories.map((c) => c.name) ?? [])], [data]);
  const filtered = filter === 'All' ? projects : projects.filter((p) => p.category?.name === filter);
  const films = projects.filter((p) => p.status === 'published');
  const featured = films.length ? [...films].sort((a, b) => b.views - a.views)[0] : null;

  // Admin-managed content, falling back to defaults until the studio fills it in.
  const tickerItems = data?.ticker_items?.length ? data.ticker_items : defaultTickerItems;
  const heroKicker = data?.hero_kicker || 'Full-Service Video Production House';
  const heroHeadline = data?.hero_headline || 'We Create Videos That Move People';
  const heroSub = data?.hero_subheadline || 'From concept to final delivery — cinematic stories for brands, businesses, and creators.';
  const heroWords = heroHeadline.trim().split(/\s+/);
  const heroHead = heroWords.slice(0, -2).join(' ');
  const heroTail = heroWords.slice(-2).join(' ');
  const clientList: ClientItem[] = data?.clients?.length
    ? data.clients.filter((c) => c.name || c.logo)
    : defaultClients.map((name) => ({ name }));
  const statList = data?.stats?.length ? data.stats : defaultStats;
  const quoteList = data?.testimonials?.length ? data.testimonials.map((t) => ({ q: t.quote, a: t.author, r: t.role })) : defaultTestimonials;
  const lead = quoteList[0];
  const hasHeroVideo = !!data?.hero_video_url;
  const phone = data?.phone || '+1 (555) 019-2847';
  const address = data?.address || 'Bay 12, Riverside Media Park';
  const socials: [string, keyof Socials][] = [
    ['IG', 'instagram'],
    ['YT', 'youtube'],
    ['VM', 'vimeo'],
    ['IN', 'linkedin'],
  ];

  const openVideo = (p: Project) =>
    setActiveVideo({ title: p.title, client: p.client, duration: p.duration, thumbnail_url: p.thumbnail_url, video_url: p.video_url });

  // "Watch Showreel": prefer the admin showreel link, then the most-viewed
  // project, then the hero background video — so the button always plays something.
  const showreelSrc = data?.showreel_url || featured?.video_url || data?.hero_video_url || null;
  const openShowreel = () => {
    if (data?.showreel_url) {
      setActiveVideo({ title: 'Showreel', client: data.studio_name ?? null, duration: null, thumbnail_url: featured?.thumbnail_url ?? null, video_url: data.showreel_url });
    } else if (featured) {
      openVideo(featured);
    } else if (data?.hero_video_url) {
      setActiveVideo({ title: 'Showreel', client: data.studio_name ?? null, duration: null, thumbnail_url: null, video_url: data.hero_video_url });
    }
  };

  const scrollToContact = () => contactRef.current?.scrollIntoView({ behavior: 'smooth' });

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setSending(true);
    setSent('');
    try {
      await axios.post(`${API}/public/inquiries`, form);
      setSent('Message sent — we will get back to you shortly.');
      setForm({ name: '', email: '', company: '', type: '', budget: '', message: '' });
    } catch {
      setSent('Something went wrong. Please try again or email us directly.');
    } finally {
      setSending(false);
    }
  };

  const mono: CSSProperties = { fontFamily: 'var(--ui-font)' };

  // Responsive helpers — collapse multi-column layouts and shrink section
  // padding on small screens. `secPad` is the standard section padding.
  const secPad = isMobile ? '64px 20px' : '96px 40px';
  const stack = (desktop: string) => (isMobile ? '1fr' : desktop);


  return (
    <div className={`site-root${theme === 'dark' ? ' dark' : ''}`}>
      {/* PAGE PRELOADER */}
      {!loaderGone && (
        <div className={`kml-preloader${loaderHidden ? ' hide' : ''}`}>
          <div className="kml-preloader-inner">
            <div className="kml-spinner">
              <img className="kml-preload-logo" src={data?.logo_url || logoSrc || '/favicon.svg'} alt={data?.studio_name || 'KML Production'} />
            </div>
            <div className="kml-preload-bar">
              <span />
            </div>
            <div className="kml-preload-label">{data?.studio_name || 'KML Production'}</div>
          </div>
        </div>
      )}

      {/* TOP BAR */}
      <nav className={`site-nav${scrolled ? ' scrolled' : ''}`}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <KLogoImg gradient size={46} src={data?.logo_url} />
        </div>
        <div style={{ display: isMobile ? 'none' : 'flex', gap: 30, ...mono, fontSize: 12.5, letterSpacing: 1, textTransform: 'uppercase' }}>
          {navLinks.map(([label, href]) => (
            <a key={label} href={href} style={{ color: 'var(--navfg)', textDecoration: 'none' }}>
              {label}
            </a>
          ))}
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: isMobile ? 10 : 14 }}>
          <button
            onClick={() => setTheme((t) => (t === 'dark' ? 'light' : 'dark'))}
            title="Toggle theme"
            style={{ width: 40, height: 40, borderRadius: '50%', border: '1px solid var(--navfg)', background: 'transparent', fontSize: 16, color: 'var(--navfg)', display: 'grid', placeItems: 'center', flex: 'none' }}
          >
            {theme === 'dark' ? '☀' : '☾'}
          </button>
          {isMobile ? (
            <button
              onClick={() => setMenuOpen(true)}
              aria-label="Open menu"
              style={{ width: 42, height: 42, borderRadius: 8, border: '1px solid var(--navfg)', background: 'transparent', fontSize: 20, color: 'var(--navfg)', display: 'grid', placeItems: 'center', flex: 'none' }}
            >
              ☰
            </button>
          ) : (
            <button
              onClick={scrollToContact}
              className="clip-btn"
              style={{ padding: '12px 22px', background: grad, border: 'none', color: '#fff', ...mono, fontSize: 12, letterSpacing: 1, textTransform: 'uppercase' }}
            >
              Start a Project
            </button>
          )}
        </div>
      </nav>

      {/* MOBILE MENU OVERLAY */}
      {menuOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9000,
            background: 'rgba(8,6,14,.96)',
            backdropFilter: 'blur(10px)',
            display: 'flex',
            flexDirection: 'column',
            padding: '22px 24px',
            color: '#F7F6FB',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <KLogoImg gradient size={44} src={data?.logo_url} />
            <button
              onClick={() => setMenuOpen(false)}
              aria-label="Close menu"
              style={{ width: 44, height: 44, borderRadius: 8, border: '1px solid rgba(255,255,255,.3)', background: 'transparent', fontSize: 20, color: '#fff', display: 'grid', placeItems: 'center' }}
            >
              ✕
            </button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 40, flex: 1 }}>
            {navLinks.map(([label, href]) => (
              <a
                key={label}
                href={href}
                onClick={() => setMenuOpen(false)}
                style={{ ...mono, fontSize: 26, fontWeight: 700, letterSpacing: -0.5, textTransform: 'uppercase', color: '#F7F6FB', textDecoration: 'none', padding: '14px 0', borderBottom: '1px solid rgba(255,255,255,.1)' }}
              >
                {label}
              </a>
            ))}
          </div>
          <button
            onClick={() => {
              setMenuOpen(false);
              scrollToContact();
            }}
            className="clip-btn-lg"
            style={{ padding: '17px 26px', background: grad, border: 'none', color: '#fff', ...mono, fontSize: 13, letterSpacing: 1, textTransform: 'uppercase' }}
          >
            Start a Project
          </button>
        </div>
      )}

      {/* HERO */}
      <section style={{ position: 'relative', height: '100vh', minHeight: 640, marginTop: -76, overflow: 'hidden', display: 'flex', alignItems: 'center' }}>
        <div style={{ position: 'absolute', inset: 0, zIndex: 0, background: '#0C0A16' }}>
          {heroSlides.map((bg, i) => (
            <div key={i} style={{ position: 'absolute', inset: 0, animation: `kmlfade 21s infinite ${i * 7}s, kmlkb 21s infinite ${i * 7}s`, ...bg }} />
          ))}
        </div>
        {/* Autoplay showreel background — uses the video uploaded in the admin
            panel, then /hero.mp4, else the gradient above simply shows through. */}
        <video
          key={data?.hero_video_url ?? 'static'}
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          poster={featured?.thumbnail_url ?? undefined}
          onError={(e) => {
            e.currentTarget.style.display = 'none';
          }}
          style={{ position: 'absolute', inset: 0, zIndex: 1, width: '100%', height: '100%', objectFit: 'cover', filter: 'contrast(1.08) saturate(1.12)' }}
        >
          {data?.hero_video_url ? (
            <source src={data.hero_video_url} />
          ) : (
            <>
              <source src="/hero.mp4" type="video/mp4" />
              <source src="/hero.webm" type="video/webm" />
            </>
          )}
        </video>
        {/* Legibility scrim. Over a real video: darken only the left text column
            and let the footage stay clear on the right. Over the gradient
            fallback: keep the original even wash. */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            zIndex: 2,
            background: hasHeroVideo
              ? 'linear-gradient(90deg,rgba(8,6,14,.90) 0%,rgba(8,6,14,.74) 32%,rgba(8,6,14,.34) 56%,rgba(8,6,14,0) 74%)'
              : 'linear-gradient(105deg,rgba(8,6,14,.92) 0%,rgba(8,6,14,.62) 42%,rgba(8,6,14,.28) 100%)',
            pointerEvents: 'none',
          }}
        />
        <div
          style={{
            position: 'absolute',
            inset: 0,
            zIndex: 2,
            background: hasHeroVideo
              ? 'linear-gradient(0deg,rgba(8,6,14,.82),rgba(8,6,14,0) 32%)'
              : 'linear-gradient(0deg,rgba(8,6,14,.95),rgba(8,6,14,0) 45%)',
            pointerEvents: 'none',
          }}
        />

        <div style={{ position: 'relative', zIndex: 3, width: '100%', maxWidth: 1360, margin: '0 auto', padding: isMobile ? '76px 20px 0' : '76px 40px 0', color: '#F7F6FB' }}>
          <div className="hero-in hero-in-1" style={{ display: 'inline-flex', alignItems: 'center', gap: 10, padding: '8px 15px', border: '1px solid rgba(255,255,255,.24)', borderRadius: 100, ...mono, fontSize: 11.5, letterSpacing: 2, textTransform: 'uppercase', color: '#EDEBF6', marginBottom: 30 }}>
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#E86FA6', boxShadow: '0 0 12px #E86FA6', animation: 'kmlbob 2.4s ease-in-out infinite' }} />
            {heroKicker}
          </div>
          <h1 className="hero-in hero-in-2" style={{ fontFamily: 'var(--ui-font)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: isMobile ? -1.5 : -3, lineHeight: 0.92, margin: 0, fontSize: 'clamp(38px,8.4vw,116px)', maxWidth: '14ch', textShadow: hasHeroVideo ? '0 2px 30px rgba(6,5,12,.6)' : undefined }}>
            {heroHead && <>{heroHead} </>}
            <span className="grad-text-anim" style={{ background: 'linear-gradient(100deg,#F49AC1,#B48BEB 35%,#7C89FF 65%,#F49AC1)', WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent', filter: hasHeroVideo ? 'drop-shadow(0 2px 18px rgba(6,5,12,.55))' : undefined }}>{heroTail}</span>
          </h1>
          <p className="hero-in hero-in-3" style={{ fontSize: 19, lineHeight: 1.6, color: '#CFCDE0', maxWidth: 520, margin: '30px 0 0', textShadow: hasHeroVideo ? '0 1px 16px rgba(6,5,12,.7)' : undefined }}>
            {heroSub}
          </p>
          <div className="hero-in hero-in-4" style={{ display: 'flex', gap: 14, flexWrap: 'wrap', alignItems: 'center', marginTop: 40 }}>
            <button
              onClick={showreelSrc ? openShowreel : scrollToContact}
              className="clip-btn-lg"
              style={{ display: 'inline-flex', alignItems: 'center', gap: 12, padding: '16px 26px 16px 18px', background: grad, border: 'none', color: '#fff', ...mono, fontSize: 13, letterSpacing: 1, textTransform: 'uppercase', cursor: 'pointer' }}
            >
              <span style={{ display: 'grid', placeItems: 'center', width: 26, height: 26, borderRadius: '50%', background: 'rgba(255,255,255,.22)' }}>
                <span style={{ borderLeft: '9px solid #fff', borderTop: '6px solid transparent', borderBottom: '6px solid transparent', marginLeft: 2 }} />
              </span>
              Watch Showreel
            </button>
            <button
              onClick={scrollToContact}
              style={{ padding: '16px 26px', background: 'rgba(255,255,255,.08)', border: '1px solid rgba(255,255,255,.32)', color: '#fff', ...mono, fontSize: 13, letterSpacing: 1, textTransform: 'uppercase', backdropFilter: 'blur(8px)' }}
            >
              Start Your Project
            </button>
          </div>
        </div>

        <div style={{ position: 'absolute', zIndex: 3, left: 40, right: 40, bottom: 30, display: isMobile ? 'none' : 'flex', alignItems: 'flex-end', justifyContent: 'center', gap: 20, color: '#CFCDE0', ...mono, fontSize: 11.5, letterSpacing: 1.5, textTransform: 'uppercase', pointerEvents: 'none' }}>
          <span style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
            Scroll
            <span style={{ position: 'relative', width: 1, height: 32, background: 'linear-gradient(#8354C9,transparent)', overflow: 'hidden' }}>
              <span style={{ position: 'absolute', top: 0, left: -1.5, width: 4, height: 4, borderRadius: '50%', background: '#E86FA6', boxShadow: '0 0 8px #E86FA6', animation: 'kmlscroll 1.8s ease-in-out infinite' }} />
            </span>
          </span>
        </div>
      </section>

      {/* TICKER */}
      <div style={{ marginTop: 70, borderTop: '1px solid var(--sline-16)', borderBottom: '1px solid var(--sline-16)', overflow: 'hidden', padding: '16px 0', background: 'var(--ssurface)' }}>
        <div style={{ display: 'flex', width: 'max-content', animation: 'kmlticker 30s linear infinite' }}>
          {[...tickerItems, ...tickerItems].map((t, i) => (
            <span key={i} style={{ fontFamily: 'var(--ui-font)', fontWeight: 600, fontSize: 20, textTransform: 'uppercase', letterSpacing: 1, whiteSpace: 'nowrap', paddingRight: 18 }}>
              {t}
              <span style={{ color: '#8354C9', paddingLeft: 18 }}>✦</span>
            </span>
          ))}
        </div>
      </div>

      {/* CLIENTS */}
      <section style={{ maxWidth: 1360, margin: '0 auto', padding: isMobile ? '48px 20px' : '56px 40px 60px' }}>
        <div className="reveal" style={{ textAlign: 'center', marginBottom: 30 }}>
          <div className="site-kicker" style={{ marginBottom: 12 }}>( Trusted by brands &amp; creators )</div>
          <h2 style={{ fontFamily: 'var(--ui-font)', fontWeight: 700, fontSize: 30, letterSpacing: -1, margin: 0 }}>Trusted by brands &amp; creators</h2>
        </div>
        <div className="logo-slider">
          <div className="logo-slider-track">
            {[...clientList, ...clientList].map((c, i) =>
              c.logo ? (
                <span key={i} style={{ display: 'inline-flex', alignItems: 'center', padding: '0 34px' }}>
                  <img
                    className="client-logo"
                    src={c.logo}
                    alt={c.name || 'Client logo'}
                    style={{ height: 40, maxWidth: 150, objectFit: 'contain', display: 'block' }}
                  />
                </span>
              ) : (
                <span
                  key={i}
                  style={{ fontFamily: 'var(--ui-font)', fontWeight: 700, fontSize: 22, color: 'var(--smuted)', letterSpacing: 0.5, whiteSpace: 'nowrap', padding: '0 34px', opacity: 0.75 }}
                >
                  {c.name}
                </span>
              ),
            )}
          </div>
        </div>
      </section>

      {/* ABOUT */}
      <section id="about" style={{ borderTop: '1px solid var(--sline-16)', scrollMarginTop: 76 }}>
        <div style={{ maxWidth: 1360, margin: '0 auto', padding: secPad, display: 'grid', gridTemplateColumns: stack('.9fr 1.4fr'), gap: isMobile ? 40 : 70 }}>
          <div className="reveal reveal-l">
            <div className="site-kicker" style={{ marginBottom: 26 }}>( About the studio )</div>
            <Placeholder label="Behind-the-scenes / crew on set" style={{ width: '100%', height: 420, clipPath: 'polygon(0 2%, 100% 0, 98% 98%, 3% 100%)' }} />
          </div>
          <div className="reveal reveal-r" style={{ transitionDelay: '0.12s' }}>
            <h2 className="site-h2" style={{ lineHeight: 1, margin: '0 0 30px' }}>Storytelling meets cinematic craft</h2>
            <p style={{ fontSize: 17.5, lineHeight: 1.75, color: 'var(--smuted)', margin: '0 0 16px', maxWidth: 620 }}>
              We are a full-service video production company dedicated to creating powerful visual stories. From concept development to post-production, our team combines creativity, strategy, and cutting-edge technology to produce high-quality content for brands, businesses, and creators.
            </p>
            <p style={{ fontSize: 17.5, lineHeight: 1.75, color: 'var(--smuted)', margin: '0 0 42px', maxWidth: 620 }}>
              Whether it's a commercial, corporate film, social content, or documentary — we bring your story to life with cinematic precision.
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', borderTop: '1px solid var(--sline-16)', borderLeft: '1px solid var(--sline-16)' }}>
              {['Creative Strategy', 'Professional Film Crew', 'High-End Equipment', 'End-to-End Production'].map((h) => (
                <div key={h} style={{ padding: '20px 22px', borderRight: '1px solid var(--sline-16)', borderBottom: '1px solid var(--sline-16)', display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span style={{ width: 9, height: 9, background: 'linear-gradient(135deg,#E86FA6,#2B39B8)', clipPath: 'polygon(50% 0,100% 50%,50% 100%,0 50%)', flex: 'none' }} />
                  <span style={{ fontWeight: 700, fontSize: 15 }}>{h}</span>
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: isMobile ? 28 : 56, marginTop: 44 }}>
              {statList.map((st) => (
                <div key={st.label}>
                  <div style={{ fontFamily: 'var(--ui-font)', fontWeight: 700, fontSize: 46, lineHeight: 1, letterSpacing: -1 }}><Counter value={st.value} /></div>
                  <div style={{ ...mono, fontSize: 11.5, letterSpacing: 1.5, textTransform: 'uppercase', color: 'var(--sfaint)', marginTop: 8 }}>{st.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* VISION / MISSION / OBJECTIVES */}
      <section style={{ position: 'relative', borderTop: '1px solid var(--sline-16)', background: '#0C0A16', color: '#F7F6FB', overflow: 'hidden' }}>
        <div className="kml-blob" style={{ top: '-8%', right: '-4%', width: 400, height: 400, background: 'rgba(232,111,166,.35)' }} />
        <div className="kml-blob" style={{ bottom: '-10%', left: '-4%', width: 420, height: 420, background: 'rgba(43,57,184,.42)', animationDelay: '-7s' }} />
        <div style={{ position: 'relative', maxWidth: 1360, margin: '0 auto', padding: secPad }}>
          <div className="reveal" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', flexWrap: 'wrap', gap: 16, marginBottom: 60 }}>
            <div className="site-kicker" style={{ color: '#C9A8FF' }}>( Why we exist )</div>
            <h2 className="site-h2">Vision, mission &amp; objectives</h2>
          </div>

          <div className="reveal-stagger" style={{ display: 'grid', gridTemplateColumns: stack('1fr 1fr'), gap: 20, marginBottom: 20 }}>
            <div style={{ padding: '40px 42px', border: '1px solid rgba(247,246,251,.14)', background: 'rgba(247,246,251,.03)', clipPath: 'polygon(0 3%, 100% 0, 98% 100%, 2% 97%)' }}>
              <div style={{ ...mono, fontSize: 11.5, letterSpacing: 1.5, textTransform: 'uppercase', color: '#E86FA6', marginBottom: 18 }}>◎ Vision</div>
              <p style={{ fontSize: 20, lineHeight: 1.55, color: '#E7E5F2', margin: 0, fontWeight: 500 }}>
                To become a leading video production company recognized for creating powerful visual stories that inspire audiences, elevate brands, and set new standards in creative filmmaking.
              </p>
            </div>
            <div style={{ padding: '40px 42px', border: '1px solid rgba(247,246,251,.14)', background: 'rgba(247,246,251,.03)', clipPath: 'polygon(2% 0, 100% 3%, 100% 97%, 0 100%)' }}>
              <div style={{ ...mono, fontSize: 11.5, letterSpacing: 1.5, textTransform: 'uppercase', color: '#7C89FF', marginBottom: 18 }}>▲ Mission</div>
              <p style={{ fontSize: 20, lineHeight: 1.55, color: '#E7E5F2', margin: 0, fontWeight: 500 }}>
                To deliver high-quality, cinematic video productions by combining creativity, technology, and strategic storytelling — helping brands, businesses, and creators communicate messages that engage, inform, and inspire.
              </p>
            </div>
          </div>

          <div className="reveal-stagger" style={{ display: 'grid', gridTemplateColumns: stack('repeat(3,1fr)') }}>
            {objectives.map((o) => (
              <div key={o.n} style={{ borderTop: '1px solid rgba(247,246,251,.14)', borderLeft: '1px solid rgba(247,246,251,.14)', padding: '30px 30px 34px' }}>
                <div style={{ fontFamily: 'var(--ui-font)', fontWeight: 700, fontSize: 40, lineHeight: 1, letterSpacing: -1, background: 'linear-gradient(120deg,#E86FA6,#8354C9 55%,#2B39B8)', WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent', marginBottom: 16 }}>
                  {o.n}
                </div>
                <h3 style={{ fontFamily: 'var(--ui-font)', fontWeight: 600, fontSize: 20, letterSpacing: -0.3, margin: '0 0 12px' }}>{o.t}</h3>
                <p style={{ fontSize: 14.5, lineHeight: 1.6, color: '#B4B1C9', margin: 0 }}>{o.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SERVICES */}
      <section id="services" style={{ borderTop: '1px solid var(--sline-16)', background: 'var(--ssurface)', scrollMarginTop: 76 }}>
        <div style={{ maxWidth: 1360, margin: '0 auto', padding: secPad }}>
          <div className="reveal" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 60, flexWrap: 'wrap', gap: 16 }}>
            <div className="site-kicker">( What we do )</div>
            <h2 className="site-h2">End-to-end production</h2>
          </div>
          <div className="reveal-stagger" style={{ display: 'grid', gridTemplateColumns: stack('repeat(3,1fr)') }}>
            {services.map((s) => (
              <div key={s.phase} style={{ borderLeft: '1px solid var(--sline-16)', padding: '6px 34px 10px' }}>
                <div style={{ fontFamily: 'var(--ui-font)', fontWeight: 700, fontSize: 70, lineHeight: 1, letterSpacing: -2, background: 'linear-gradient(120deg,#E86FA6,#8354C9 55%,#2B39B8)', WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent', marginBottom: 16 }}>
                  {s.phase}
                </div>
                <h3 style={{ fontFamily: 'var(--ui-font)', fontWeight: 600, fontSize: 24, textTransform: 'uppercase', letterSpacing: -0.3, margin: '0 0 24px' }}>{s.tag}</h3>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  {s.items.map((it) => (
                    <div key={it} style={{ fontSize: 15, color: 'var(--smuted)', padding: '11px 0', borderTop: '1px solid var(--sline-1)' }}>
                      {it}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* WORK INDEX */}
      <section id="work" style={{ borderTop: '1px solid var(--sline-16)', scrollMarginTop: 76 }}>
        <div style={{ maxWidth: 1360, margin: '0 auto', padding: secPad }}>
          <div className="reveal" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', flexWrap: 'wrap', gap: 18, marginBottom: 20 }}>
            <div>
              <div className="site-kicker" style={{ marginBottom: 14 }}>( Selected work )</div>
              <h2 className="site-h2">Our work speaks for itself</h2>
            </div>
            <div style={{ display: 'flex', gap: 22, flexWrap: 'wrap' }}>
              {cats.map((c) => (
                <button
                  key={c}
                  className="cat-tab"
                  onClick={() => setFilter(c)}
                  style={{
                    padding: '8px 2px',
                    cursor: 'pointer',
                    ...mono,
                    fontSize: 12.5,
                    letterSpacing: 1,
                    textTransform: 'uppercase',
                    border: 'none',
                    background: 'transparent',
                    color: c === filter ? 'var(--sink)' : 'var(--sfaint)',
                    fontWeight: c === filter ? 700 : 400,
                    boxShadow: c === filter ? 'inset 0 -2px 0 #8354C9' : 'none',
                  }}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>
          <div
            className="reveal-stagger"
            style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : isTablet ? 'repeat(2,1fr)' : 'repeat(3,1fr)', gap: isMobile ? 20 : 26, marginTop: 26 }}
          >
            {/* Home preview shows the first 6 only — the full archive lives at /work. */}
            {filtered.slice(0, 6).map((p, i) => (
              <WorkCard key={p.id} project={p} index={i} onOpen={openVideo} isMobile={isMobile} />
            ))}
            {filtered.length === 0 && <div style={{ gridColumn: '1 / -1', padding: '40px 0', color: 'var(--sfaint)', ...mono, fontSize: 12, letterSpacing: 1.5, textTransform: 'uppercase' }}>No projects in this category yet.</div>}
          </div>
          {filtered.length > 6 && (
            <div className="reveal" style={{ display: 'flex', justifyContent: 'center', marginTop: isMobile ? 40 : 56 }}>
              <Link to="/work" className="site-btn-outline" style={{ ...mono, fontSize: 13, letterSpacing: 1.5, textTransform: 'uppercase', textDecoration: 'none', color: 'var(--sink)', padding: '16px 40px', border: '1px solid var(--sline-25)', clipPath: 'polygon(0 0,calc(100% - 10px) 0,100% 10px,100% 100%,0 100%)' }}>
                View all work →
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* PROCESS */}
      <section id="process" style={{ position: 'relative', borderTop: '1px solid var(--sline-16)', background: '#17153A', color: '#F7F6FB', scrollMarginTop: 76, overflow: 'hidden' }}>
        <div className="kml-blob" style={{ top: '10%', right: '-5%', width: 360, height: 360, background: 'rgba(232,111,166,.35)' }} />
        <div className="kml-blob" style={{ bottom: '-10%', left: '-4%', width: 400, height: 400, background: 'rgba(131,84,201,.4)', animationDelay: '-8s' }} />
        <div style={{ position: 'relative', maxWidth: 1360, margin: '0 auto', padding: secPad }}>
          <div className="reveal" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 70, flexWrap: 'wrap', gap: 16 }}>
            <div className="site-kicker" style={{ color: '#E86FA6' }}>( How we work )</div>
            <h2 className="site-h2">Our production process</h2>
          </div>
          <div className="reveal" style={{ position: 'relative', height: 4, background: 'rgba(247,246,251,.14)', marginBottom: 40 }}>
            <div className="proc-bar-fill" style={{ position: 'absolute', top: 0, bottom: 0, left: 0, background: 'linear-gradient(90deg,#E86FA6,#8354C9,#2B39B8)' }} />
          </div>
          <div className="reveal-stagger" style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr 1fr' : isTablet ? 'repeat(3,1fr)' : 'repeat(5,1fr)', gap: 26 }}>
            {processSteps.map((s) => (
              <div key={s.n}>
                <div style={{ ...mono, fontSize: 12, letterSpacing: 1.5, color: '#85829B', marginBottom: 14 }}>TC {s.tc}:00</div>
                <h4 style={{ fontFamily: 'var(--ui-font)', fontWeight: 700, fontSize: 24, textTransform: 'uppercase', margin: '0 0 12px' }}>
                  {s.n} — {s.t}
                </h4>
                <p style={{ fontSize: 14.5, lineHeight: 1.6, color: '#B4B1C9', margin: 0 }}>{s.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIAL */}
      <section style={{ borderTop: '1px solid var(--sline-16)' }}>
        <div className="reveal" style={{ maxWidth: 1100, margin: '0 auto', padding: isMobile ? '72px 20px' : '110px 40px', textAlign: 'center' }}>
          <div className="site-kicker" style={{ marginBottom: 34 }}>( What clients say )</div>
          <p style={{ fontFamily: 'var(--ui-font)', fontWeight: 600, fontSize: 'clamp(24px,4vw,40px)', lineHeight: 1.25, letterSpacing: -1, margin: '0 0 36px' }}>
            “{lead.q}”
          </p>
          <div style={{ ...mono, fontSize: 12.5, letterSpacing: 1.5, textTransform: 'uppercase', color: 'var(--smuted)' }}>{lead.a}{lead.r ? ` — ${lead.r}` : ''}</div>
          <div className="reveal-stagger" style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', alignItems: isMobile ? 'center' : 'flex-start', justifyContent: 'center', gap: 40, marginTop: 60, paddingTop: 44, borderTop: '1px solid var(--sline-12)' }}>
            {quoteList.map((t, i) => (
              <div key={i} className="quote-card" style={{ maxWidth: 280, textAlign: 'left' }}>
                <p style={{ fontSize: 14, lineHeight: 1.6, color: 'var(--smuted)', margin: '0 0 12px' }}>“{t.q}”</p>
                <div style={{ ...mono, fontSize: 11, letterSpacing: 1, textTransform: 'uppercase', color: 'var(--sfaint)' }}>
                  {t.a}{t.r ? ` — ${t.r}` : ''}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* GEAR */}
      <section style={{ borderTop: '1px solid var(--sline-16)', background: 'var(--ssurface)' }}>
        <div style={{ maxWidth: 1360, margin: '0 auto', padding: secPad, display: 'grid', gridTemplateColumns: stack('1.2fr 1fr'), gap: isMobile ? 40 : 70, alignItems: 'center' }}>
          <div className="reveal reveal-l">
            <div className="site-kicker" style={{ marginBottom: 20 }}>( The gear )</div>
            <h2 className="site-h2" style={{ fontSize: isMobile ? 30 : 48, letterSpacing: -1.6, lineHeight: 1, margin: '0 0 22px' }}>Professional gear. Professional results.</h2>
            <p style={{ fontSize: 17, lineHeight: 1.7, color: 'var(--smuted)', margin: '0 0 36px', maxWidth: 520 }}>
              We shoot on cinema-grade equipment and light every frame with intent — so your story looks as premium as your brand.
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
              {equipment.map((e) => (
                <span key={e} className="gear-pill" style={{ padding: '11px 18px', border: '1px solid var(--sline-25)', ...mono, fontSize: 12.5, letterSpacing: 1, textTransform: 'uppercase', color: 'var(--sink)', clipPath: 'polygon(0 0,calc(100% - 10px) 0,100% 10px,100% 100%,0 100%)' }}>
                  {e}
                </span>
              ))}
            </div>
          </div>
          <div className="reveal reveal-r" style={{ transitionDelay: '0.12s' }}>
            <Placeholder label="Studio / camera rig photo" style={{ width: '100%', height: 400, clipPath: 'polygon(2% 0, 100% 2%, 98% 100%, 0 97%)' }} />
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ borderTop: '1px solid var(--sline-16)', padding: isMobile ? '48px 20px' : '80px 40px' }}>
        <div className="reveal reveal-scale cta-grad" style={{ maxWidth: 1360, margin: '0 auto', background: 'linear-gradient(115deg,#E86FA6,#8354C9 45%,#2B39B8)', clipPath: 'polygon(0 6%, 100% 0, 100% 94%, 0 100%)', padding: isMobile ? '64px 24px' : '110px 60px', textAlign: 'center', color: '#fff' }}>
          <h2 style={{ fontFamily: 'var(--ui-font)', fontWeight: 700, fontSize: 'clamp(32px,6vw,64px)', letterSpacing: -2, textTransform: 'uppercase', lineHeight: 0.98, margin: '0 0 20px' }}>Let's create something amazing</h2>
          <p style={{ fontSize: 18, margin: '0 0 40px', opacity: 0.92 }}>Have a project in mind? Let's bring your vision to life.</p>
          <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button onClick={scrollToContact} className="clip-btn-lg" style={{ padding: '17px 30px', background: 'var(--sink)', border: 'none', color: 'var(--sbg)', ...mono, fontSize: 13, letterSpacing: 1, textTransform: 'uppercase' }}>
              Start Your Project
            </button>
            <button onClick={scrollToContact} style={{ padding: '17px 30px', background: 'rgba(255,255,255,.16)', border: '1px solid rgba(255,255,255,.6)', color: '#fff', ...mono, fontSize: 13, letterSpacing: 1, textTransform: 'uppercase' }}>
              Book a Call
            </button>
          </div>
        </div>
      </section>

      {/* CONTACT */}
      <section id="contact" ref={contactRef} style={{ borderTop: '1px solid var(--sline-16)', scrollMarginTop: 76 }}>
        <div style={{ maxWidth: 1360, margin: '0 auto', padding: secPad, display: 'grid', gridTemplateColumns: stack('1fr 1.3fr'), gap: isMobile ? 44 : 80 }}>
          <div className="reveal reveal-l">
            <div className="site-kicker" style={{ marginBottom: 20 }}>( Get in touch )</div>
            <h2 className="site-h2" style={{ fontSize: isMobile ? 30 : 48, letterSpacing: -1.6, lineHeight: 1, margin: '0 0 40px' }}>Start the conversation</h2>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {[
                ['Phone', phone],
                ['Email', data?.contact_email ?? 'hello@kmlproduction.com'],
                ['Studio', address],
              ].map(([k, v]) => (
                <div key={k} style={{ padding: '18px 0', borderTop: '1px solid var(--sline-14)', display: 'flex', justifyContent: 'space-between', gap: 20 }}>
                  <span style={{ ...mono, fontSize: 11.5, letterSpacing: 1.5, textTransform: 'uppercase', color: 'var(--sfaint)' }}>{k}</span>
                  <span style={{ fontWeight: 700, fontSize: 15.5 }}>{v}</span>
                </div>
              ))}
              <div style={{ display: 'flex', gap: 10, padding: '22px 0', borderTop: '1px solid var(--sline-14)' }}>
                {socials.map(([so, key]) => {
                  const href = data?.socials?.[key];
                  const base: CSSProperties = { width: 42, height: 42, display: 'grid', placeItems: 'center', border: '1px solid var(--sline-25)', ...mono, fontSize: 11, fontWeight: 700, color: 'var(--sink)', textDecoration: 'none' };
                  return href ? (
                    <a key={so} href={href} target="_blank" rel="noreferrer" aria-label={key} style={{ ...base, cursor: 'pointer' }}>
                      {socialIcons[key] ?? so}
                    </a>
                  ) : (
                    <div key={so} style={{ ...base, opacity: 0.4 }}>{socialIcons[key] ?? so}</div>
                  );
                })}
              </div>
            </div>
          </div>
          <form className="reveal reveal-r" style={{ transitionDelay: '0.12s' }} onSubmit={(e) => void submit(e)}>
            <div style={{ display: 'grid', gridTemplateColumns: stack('1fr 1fr'), gap: '26px 30px' }}>
              <div>
                <label className="k-label" style={{ marginBottom: 10, color: 'var(--sfaint)' }}>Name</label>
                <input className="site-input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Your name" required />
              </div>
              <div>
                <label className="k-label" style={{ marginBottom: 10, color: 'var(--sfaint)' }}>Email</label>
                <input className="site-input" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="you@company.com" required />
              </div>
              <div>
                <label className="k-label" style={{ marginBottom: 10, color: 'var(--sfaint)' }}>Company</label>
                <input className="site-input" value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} placeholder="Company name" />
              </div>
              <div>
                <label className="k-label" style={{ marginBottom: 10, color: 'var(--sfaint)' }}>Project Type</label>
                <input className="site-input" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} placeholder="Commercial, Corporate…" />
              </div>
              <div style={{ gridColumn: 'span 2' }}>
                <label className="k-label" style={{ marginBottom: 10, color: 'var(--sfaint)' }}>Budget Range</label>
                <select className="site-input" value={form.budget} onChange={(e) => setForm({ ...form, budget: e.target.value })} style={{ color: form.budget ? 'var(--sink)' : 'var(--sfaint)' }}>
                  <option value="">Select a range</option>
                  <option>$5k–10k</option>
                  <option>$10k–25k</option>
                  <option>$25k–50k</option>
                  <option>$50k+</option>
                </select>
              </div>
              <div style={{ gridColumn: 'span 2' }}>
                <label className="k-label" style={{ marginBottom: 10, color: 'var(--sfaint)' }}>Message</label>
                <textarea className="site-input" value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} placeholder="Tell us about your project…" required style={{ height: 104, resize: 'vertical' }} />
              </div>
            </div>
            {sent && <div style={{ marginTop: 20, ...mono, fontSize: 12, letterSpacing: 1, textTransform: 'uppercase', color: sent.startsWith('Message') ? '#1B8A5A' : '#C24A6E' }}>{sent}</div>}
            <button type="submit" disabled={sending} className="clip-btn-lg" style={{ marginTop: 36, padding: '17px 34px', background: 'var(--sink)', border: 'none', color: 'var(--sbg)', ...mono, fontSize: 13, letterSpacing: 1, textTransform: 'uppercase', opacity: sending ? 0.6 : 1 }}>
              {sending ? 'Sending…' : 'Send Message →'}
            </button>
          </form>
        </div>
      </section>

      {/* FOOTER */}
      <footer
        style={{
          position: 'relative',
          background:
            'radial-gradient(1200px 620px at 16% -12%,rgba(131,84,201,.32),transparent 60%),radial-gradient(1000px 540px at 88% 18%,rgba(43,57,184,.26),transparent 62%),#0A0813',
          color: '#F4F3FA',
        }}
      >
        {/* Animated wave transition rising from the page into the footer */}
        <div className="foot-waves-container" aria-hidden>
          <svg className="foot-waves" xmlns="http://www.w3.org/2000/svg" viewBox="0 24 150 28" preserveAspectRatio="none" shapeRendering="auto">
            <defs>
              <path id="foot-wave" d="M-160 44c30 0 58-18 88-18s58 18 88 18 58-18 88-18 58 18 88 18v44h-352z" />
            </defs>
            <g className="foot-parallax">
              <use href="#foot-wave" x="48" y="0" fill="rgba(131,84,201,0.20)" />
              <use href="#foot-wave" x="48" y="3" fill="rgba(232,111,166,0.32)" />
              <use href="#foot-wave" x="48" y="5" fill="rgba(43,57,184,0.55)" />
              <use href="#foot-wave" x="48" y="7" fill="#0A0813" />
            </g>
          </svg>
        </div>

        {/* Clipped stage for ambient glows + content */}
        <div style={{ position: 'relative', overflow: 'hidden' }}>
          {/* Ambient drifting glows */}
          <div className="kml-blob" aria-hidden style={{ width: 460, height: 460, left: '-9%', top: '-14%', background: 'radial-gradient(circle,rgba(232,111,166,.5),transparent 70%)' }} />
          <div className="kml-blob" aria-hidden style={{ width: 540, height: 540, right: '-11%', bottom: '-20%', background: 'radial-gradient(circle,rgba(43,57,184,.5),transparent 70%)', animationDelay: '-7s' }} />

          <div style={{ position: 'relative', zIndex: 2, maxWidth: 1360, margin: '0 auto', padding: isMobile ? '26px 20px 30px' : '44px 40px 40px' }}>
          {/* Status pill */}
          <div className="reveal" style={{ marginBottom: isMobile ? 26 : 40 }}>
            <span className="foot-rec" style={{ ...mono, fontSize: 11.5, letterSpacing: 1.5, textTransform: 'uppercase', color: '#C9A8FF' }}>
              Available for new projects — {new Date().getFullYear()}
            </span>
          </div>

          {/* Columns */}
          <div
            className="reveal-stagger"
            style={{
              display: 'grid',
              gridTemplateColumns: isMobile ? '1fr' : isTablet ? '1fr 1fr' : '1.7fr 1fr 1fr 1.3fr',
              gap: isMobile ? 34 : 48,
              borderTop: '1px solid rgba(255,255,255,.12)',
              paddingTop: isMobile ? 32 : 48,
            }}
          >
            {/* Brand */}
            <div>
              <KLogoImg gradient size={40} src={data?.logo_url} />
              <p style={{ margin: '18px 0 22px', maxWidth: 300, fontSize: 14, lineHeight: 1.7, color: '#B4B1C9' }}>
                {data?.studio_name ?? 'KML Production'} — cinematic video production, from first concept to final cut.
              </p>
              <div style={{ display: 'flex', gap: 10 }}>
                {socials.map(([so, key]) => {
                  const href = data?.socials?.[key];
                  return href ? (
                    <a key={so} className="foot-soc" href={href} target="_blank" rel="noreferrer" aria-label={key} style={{ ...mono, fontSize: 11, fontWeight: 700 }}>
                      <span>{socialIcons[key] ?? so}</span>
                    </a>
                  ) : (
                    <span key={so} className="foot-soc foot-soc--off" style={{ ...mono, fontSize: 11, fontWeight: 700 }}>
                      <span>{socialIcons[key] ?? so}</span>
                    </span>
                  );
                })}
              </div>
            </div>

            {/* Explore */}
            <div>
              <div style={{ ...mono, fontSize: 11, letterSpacing: 1.5, textTransform: 'uppercase', color: '#7C7A93', marginBottom: 18 }}>Explore</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 13, alignItems: 'flex-start' }}>
                {navLinks.map(([l, h]) => (
                  <a key={l} className="foot-link" href={h} style={{ fontSize: 14.5 }}>{l}</a>
                ))}
              </div>
            </div>

            {/* Services */}
            <div>
              <div style={{ ...mono, fontSize: 11, letterSpacing: 1.5, textTransform: 'uppercase', color: '#7C7A93', marginBottom: 18 }}>Services</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 13, alignItems: 'flex-start' }}>
                {services.map((s) => (
                  <a key={s.tag} className="foot-link" href="#services" style={{ fontSize: 14.5 }}>{s.tag}</a>
                ))}
              </div>
            </div>

            {/* Contact */}
            <div>
              <div style={{ ...mono, fontSize: 11, letterSpacing: 1.5, textTransform: 'uppercase', color: '#7C7A93', marginBottom: 18 }}>Get in touch</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14, alignItems: 'flex-start' }}>
                <a className="foot-link" href={`mailto:${data?.contact_email ?? 'hello@kmlproduction.com'}`} style={{ fontSize: 14.5 }}>
                  {data?.contact_email ?? 'hello@kmlproduction.com'}
                </a>
                <a className="foot-link" href={`tel:${phone.replace(/[^\d+]/g, '')}`} style={{ fontSize: 14.5 }}>{phone}</a>
                <div style={{ fontSize: 14, lineHeight: 1.6, color: '#B4B1C9', maxWidth: 220 }}>{address}</div>
              </div>
            </div>
          </div>

          {/* Bottom bar */}
          <div
            className="reveal"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: 16,
              marginTop: isMobile ? 34 : 54,
              paddingTop: 24,
              borderTop: '1px solid rgba(255,255,255,.1)',
              ...mono,
              fontSize: 11.5,
              letterSpacing: 0.5,
              color: '#7C7A93',
            }}
          >
            <div>© {new Date().getFullYear()} {(data?.studio_name ?? 'KML Production').toUpperCase()}. All rights reserved.</div>
            <a
              href="#top"
              onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
              className="foot-top"
              style={{ ...mono, fontSize: 11.5, letterSpacing: 1, textTransform: 'uppercase', color: '#B4B1C9', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 8 }}
            >
              Back to top <span className="foot-top-arrow">↑</span>
            </a>
          </div>
          </div>
        </div>
      </footer>

      {/* VIDEO LIGHTBOX */}
      {activeVideo && <VideoModal active={activeVideo} onClose={() => setActiveVideo(null)} isMobile={isMobile} />}
    </div>
  );
}
