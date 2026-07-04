import { useEffect, useMemo, useRef, useState, type CSSProperties, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import type { Category, Project, Socials, Stat, ClientItem, Testimonial } from '../types';
import { KLogoImg } from '../components/ui';
import { applyFont } from '../font';

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
  projects: Project[];
  categories: Category[];
}

interface ActiveVideo {
  title: string;
  client: string | null;
  duration: string | null;
  thumbnail_url: string | null;
  video_url: string | null;
}

const grad = 'linear-gradient(115deg,#E86FA6,#8354C9 50%,#2B39B8)';
const gradSteep = 'linear-gradient(135deg,#E86FA6,#8354C9 55%,#2B39B8)';

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

const equipment = ['Cinema Cameras', 'Professional Lighting', 'Aerial Drones', 'Gimbal Stabilizers', 'Sound Equipment', 'Full Studio Setup'];
const defaultClients = ['NOVA', 'Atlas Group', 'Vertex', 'LUMEN', 'Skyline', 'Orbit Media', 'Frameworks', 'Meridian'];
const tickerItems = ['Commercials', 'Corporate Films', 'Product Videos', 'Drone Cinematography', 'Documentaries', 'Motion Graphics'];
const navLinks = [
  ['Work', '#work'],
  ['Services', '#services'],
  ['About', '#about'],
  ['Process', '#process'],
  ['Contact', '#contact'],
] as const;

const heroSlides: CSSProperties[] = [
  { background: 'radial-gradient(900px 600px at 30% 40%,rgba(131,84,201,.55),transparent 65%),radial-gradient(700px 500px at 75% 70%,rgba(43,57,184,.45),transparent 60%),#0C0A16' },
  { background: 'radial-gradient(900px 600px at 70% 30%,rgba(232,111,166,.4),transparent 60%),radial-gradient(800px 600px at 25% 75%,rgba(43,57,184,.5),transparent 60%),#0D0A18' },
  { background: 'radial-gradient(1000px 700px at 50% 60%,rgba(124,137,255,.35),transparent 65%),radial-gradient(600px 500px at 85% 25%,rgba(131,84,201,.45),transparent 55%),#0B0914' },
];

function embedUrl(url: string | null): string | null {
  if (!url) return null;
  const vimeo = url.match(/vimeo\.com\/(\d+)/);
  if (vimeo) return `https://player.vimeo.com/video/${vimeo[1]}?autoplay=1`;
  const yt = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]+)/);
  if (yt) return `https://www.youtube.com/embed/${yt[1]}?autoplay=1`;
  return null;
}

// A direct video file we can play in a <video> tag (uploads, or plain .mp4 links).
function isDirectVideo(url: string | null): boolean {
  if (!url) return false;
  return /\.(mp4|webm|ogg|mov)(\?|#|$)/i.test(url) || url.includes('/storage/');
}

function Placeholder({ label, style }: { label: string; style?: CSSProperties }) {
  return (
    <div
      style={{
        background: 'var(--ssurface-3)',
        display: 'grid',
        placeItems: 'center',
        color: 'var(--sfaint)',
        fontFamily: 'var(--ui-font)',
        fontSize: 11.5,
        letterSpacing: 1.5,
        textTransform: 'uppercase',
        textAlign: 'center',
        padding: 16,
        ...style,
      }}
    >
      {label}
    </div>
  );
}

export default function Site() {
  const [theme, setTheme] = useState<'light' | 'dark'>(() => (localStorage.getItem('kml_theme') === 'dark' ? 'dark' : 'light'));
  const [scrolled, setScrolled] = useState(false);
  const [data, setData] = useState<SiteData | null>(null);
  const [filter, setFilter] = useState('All');
  const [activeVideo, setActiveVideo] = useState<ActiveVideo | null>(null);
  const [form, setForm] = useState({ name: '', email: '', company: '', type: '', budget: '', message: '' });
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState('');
  const contactRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 80);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    void axios.get<SiteData>(`${API}/public/site`).then((res) => {
      setData(res.data);
      applyFont(res.data.font); // match the studio font chosen in admin Settings
    });
  }, []);

  useEffect(() => {
    localStorage.setItem('kml_theme', theme);
  }, [theme]);

  const projects = useMemo(() => data?.projects ?? [], [data]);
  const cats = useMemo(() => ['All', ...(data?.categories.map((c) => c.name) ?? [])], [data]);
  const filtered = filter === 'All' ? projects : projects.filter((p) => p.category?.name === filter);
  const films = projects.filter((p) => p.status === 'published');
  const featured = films.length ? [...films].sort((a, b) => b.views - a.views)[0] : null;
  const gridFilms = films.filter((p) => p.id !== featured?.id).slice(0, 6);

  // Admin-managed content, falling back to defaults until the studio fills it in.
  const heroKicker = data?.hero_kicker || 'Full-Service Video Production House';
  const heroHeadline = data?.hero_headline || 'We Create Videos That Move People';
  const heroSub = data?.hero_subheadline || 'From concept to final delivery — cinematic stories for brands, businesses, and creators.';
  const heroWords = heroHeadline.trim().split(/\s+/);
  const heroHead = heroWords.slice(0, -2).join(' ');
  const heroTail = heroWords.slice(-2).join(' ');
  const clientList = data?.clients?.length ? data.clients.map((c) => c.name).filter(Boolean) : defaultClients;
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
  const embed = activeVideo ? embedUrl(activeVideo.video_url) : null;

  return (
    <div className={`site-root${theme === 'dark' ? ' dark' : ''}`}>
      {/* TOP BAR */}
      <nav className={`site-nav${scrolled ? ' scrolled' : ''}`}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <KLogoImg gradient size={46} src={data?.logo_url} />
        </div>
        <div style={{ display: 'flex', gap: 30, ...mono, fontSize: 12.5, letterSpacing: 1, textTransform: 'uppercase' }}>
          {navLinks.map(([label, href]) => (
            <a key={label} href={href} style={{ color: 'var(--navfg)', textDecoration: 'none' }}>
              {label}
            </a>
          ))}
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 14 }}>
          <button
            onClick={() => setTheme((t) => (t === 'dark' ? 'light' : 'dark'))}
            title="Toggle theme"
            style={{ width: 40, height: 40, borderRadius: '50%', border: '1px solid var(--navfg)', background: 'transparent', fontSize: 16, color: 'var(--navfg)', display: 'grid', placeItems: 'center' }}
          >
            {theme === 'dark' ? '☀' : '☾'}
          </button>
          <button
            onClick={scrollToContact}
            className="clip-btn"
            style={{ padding: '12px 22px', background: grad, border: 'none', color: '#fff', ...mono, fontSize: 12, letterSpacing: 1, textTransform: 'uppercase' }}
          >
            Start a Project
          </button>
        </div>
      </nav>

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

        <div style={{ position: 'relative', zIndex: 3, width: '100%', maxWidth: 1360, margin: '0 auto', padding: '76px 40px 0', color: '#F7F6FB' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10, padding: '8px 15px', border: '1px solid rgba(255,255,255,.24)', borderRadius: 100, ...mono, fontSize: 11.5, letterSpacing: 2, textTransform: 'uppercase', color: '#EDEBF6', marginBottom: 30 }}>
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#E86FA6', boxShadow: '0 0 12px #E86FA6', animation: 'kmlbob 2.4s ease-in-out infinite' }} />
            {heroKicker}
          </div>
          <h1 style={{ fontFamily: 'var(--ui-font)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: -3, lineHeight: 0.9, margin: 0, fontSize: 'clamp(56px,8.4vw,116px)', maxWidth: '14ch', textShadow: hasHeroVideo ? '0 2px 30px rgba(6,5,12,.6)' : undefined }}>
            {heroHead && <>{heroHead} </>}
            <span style={{ background: 'linear-gradient(100deg,#F49AC1,#B48BEB 45%,#7C89FF)', WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent', filter: hasHeroVideo ? 'drop-shadow(0 2px 18px rgba(6,5,12,.55))' : undefined }}>{heroTail}</span>
          </h1>
          <p style={{ fontSize: 19, lineHeight: 1.6, color: '#CFCDE0', maxWidth: 520, margin: '30px 0 0', textShadow: hasHeroVideo ? '0 1px 16px rgba(6,5,12,.7)' : undefined }}>
            {heroSub}
          </p>
          <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', alignItems: 'center', marginTop: 40 }}>
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

        <div style={{ position: 'absolute', zIndex: 3, left: 40, right: 40, bottom: 30, display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 20, color: '#CFCDE0', ...mono, fontSize: 11.5, letterSpacing: 1.5, textTransform: 'uppercase', pointerEvents: 'none' }}>
          <span>● REC — SHOWREEL 2026 · 4K / 24FPS</span>
          <span style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
            Scroll
            <span style={{ width: 1, height: 32, background: 'linear-gradient(#8354C9,transparent)' }} />
          </span>
          <span>EST. 2019 — 250+ PROJECTS</span>
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
      <section style={{ maxWidth: 1360, margin: '0 auto', padding: '56px 40px 60px' }}>
        <div style={{ textAlign: 'center', marginBottom: 30 }}>
          <div className="site-kicker" style={{ marginBottom: 12 }}>( Trusted by brands &amp; creators )</div>
          <h2 style={{ fontFamily: 'var(--ui-font)', fontWeight: 700, fontSize: 30, letterSpacing: -1, margin: 0 }}>Trusted by brands &amp; creators</h2>
        </div>
        <div className="logo-slider">
          <div className="logo-slider-track">
            {[...clientList, ...clientList].map((c, i) => (
              <span
                key={i}
                style={{ fontFamily: 'var(--ui-font)', fontWeight: 700, fontSize: 22, color: 'var(--smuted)', letterSpacing: 0.5, whiteSpace: 'nowrap', padding: '0 34px', opacity: 0.75 }}
              >
                {c}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ABOUT */}
      <section id="about" style={{ borderTop: '1px solid var(--sline-16)', scrollMarginTop: 76 }}>
        <div style={{ maxWidth: 1360, margin: '0 auto', padding: '96px 40px', display: 'grid', gridTemplateColumns: '.9fr 1.4fr', gap: 70 }}>
          <div>
            <div className="site-kicker" style={{ marginBottom: 26 }}>( 01 — About the studio )</div>
            <Placeholder label="Behind-the-scenes / crew on set" style={{ width: '100%', height: 420, clipPath: 'polygon(0 2%, 100% 0, 98% 98%, 3% 100%)' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', ...mono, fontSize: 11.5, letterSpacing: 1.5, color: 'var(--sfaint)', textTransform: 'uppercase', marginTop: 12 }}>
              <span>ON SET — DAY 14</span>
              <span>F2.8 / 24FPS</span>
            </div>
          </div>
          <div>
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
            <div style={{ display: 'flex', gap: 56, marginTop: 44 }}>
              {statList.map((st) => (
                <div key={st.label}>
                  <div style={{ fontFamily: 'var(--ui-font)', fontWeight: 700, fontSize: 46, lineHeight: 1, letterSpacing: -1 }}>{st.value}</div>
                  <div style={{ ...mono, fontSize: 11.5, letterSpacing: 1.5, textTransform: 'uppercase', color: 'var(--sfaint)', marginTop: 8 }}>{st.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* SERVICES */}
      <section id="services" style={{ borderTop: '1px solid var(--sline-16)', background: 'var(--ssurface)', scrollMarginTop: 76 }}>
        <div style={{ maxWidth: 1360, margin: '0 auto', padding: '96px 40px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 60, flexWrap: 'wrap', gap: 16 }}>
            <div className="site-kicker">( 02 — What we do )</div>
            <h2 className="site-h2">End-to-end production</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)' }}>
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
        <div style={{ maxWidth: 1360, margin: '0 auto', padding: '96px 40px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', flexWrap: 'wrap', gap: 18, marginBottom: 20 }}>
            <div>
              <div className="site-kicker" style={{ marginBottom: 14 }}>( 03 — Selected work )</div>
              <h2 className="site-h2">Our work speaks for itself</h2>
            </div>
            <div style={{ display: 'flex', gap: 22, flexWrap: 'wrap' }}>
              {cats.map((c) => (
                <button
                  key={c}
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
          <div style={{ borderTop: '1px solid var(--sline-2)' }}>
            {filtered.map((p, i) => (
              <div
                key={p.id}
                className="work-row"
                onClick={() => openVideo(p)}
                style={{ display: 'grid', gridTemplateColumns: '80px 1fr 210px 190px', gap: 30, alignItems: 'center', padding: '26px 0', cursor: 'pointer' }}
              >
                <div style={{ ...mono, fontSize: 14, color: 'var(--sfaint)' }}>{String(i + 1).padStart(2, '0')}</div>
                <div>
                  <div style={{ fontFamily: 'var(--ui-font)', fontWeight: 700, fontSize: 34, letterSpacing: -1, textTransform: 'uppercase', lineHeight: 1.05 }}>{p.title}</div>
                  <div style={{ ...mono, fontSize: 12, letterSpacing: 1, textTransform: 'uppercase', color: 'var(--sfaint)', marginTop: 8 }}>
                    {p.client ?? '—'} — {p.duration ?? '—'}
                  </div>
                </div>
                <div style={{ ...mono, fontSize: 12, letterSpacing: 1, textTransform: 'uppercase', color: 'var(--smuted)', textAlign: 'right' }}>{p.category?.name}</div>
                {p.thumbnail_url ? (
                  <div style={{ width: 190, height: 110, justifySelf: 'end', clipPath: 'polygon(0 4%, 100% 0, 97% 100%, 2% 96%)', background: `url(${p.thumbnail_url}) center/cover no-repeat` }} />
                ) : (
                  <Placeholder label={p.category?.name ?? ''} style={{ width: 190, height: 110, justifySelf: 'end', clipPath: 'polygon(0 4%, 100% 0, 97% 100%, 2% 96%)' }} />
                )}
              </div>
            ))}
            {filtered.length === 0 && <div style={{ padding: '40px 0', color: 'var(--sfaint)', ...mono, fontSize: 12, letterSpacing: 1.5, textTransform: 'uppercase' }}>No projects in this category yet.</div>}
          </div>
        </div>
      </section>

      {/* FILMS & ANIMATIONS */}
      <section style={{ borderTop: '1px solid var(--sline-16)', background: '#0C0A16', color: '#F7F6FB' }}>
        <div style={{ maxWidth: 1360, margin: '0 auto', padding: '96px 40px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', flexWrap: 'wrap', gap: 16, marginBottom: 44 }}>
            <div className="site-kicker" style={{ color: '#C9A8FF' }}>( 04 — Films &amp; animations )</div>
            <h2 className="site-h2">Motion that sells the space</h2>
          </div>

          {featured && (
            <div onClick={() => openVideo(featured)} style={{ position: 'relative', borderRadius: 4, overflow: 'hidden', cursor: 'pointer', marginBottom: 20, aspectRatio: '21/9' }}>
              {featured.thumbnail_url ? (
                <div style={{ position: 'absolute', inset: 0, background: `url(${featured.thumbnail_url}) center/cover no-repeat` }} />
              ) : (
                <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(1000px 500px at 40% 50%,rgba(131,84,201,.5),transparent 65%),#141021' }} />
              )}
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(90deg,rgba(12,10,22,.85),rgba(12,10,22,.15) 60%,rgba(12,10,22,.55))', pointerEvents: 'none' }} />
              <div style={{ position: 'absolute', left: 44, bottom: 40, right: 44, pointerEvents: 'none', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 20, flexWrap: 'wrap' }}>
                <div>
                  <div style={{ ...mono, fontSize: 11.5, letterSpacing: 1.5, textTransform: 'uppercase', color: '#C9A8FF', marginBottom: 12 }}>● Now playing — Featured</div>
                  <div style={{ fontFamily: 'var(--ui-font)', fontWeight: 700, fontSize: 44, letterSpacing: -1.4, textTransform: 'uppercase', lineHeight: 1 }}>{featured.title}</div>
                  <div style={{ ...mono, fontSize: 12.5, letterSpacing: 1, textTransform: 'uppercase', color: '#B4B1C9', marginTop: 8 }}>
                    {featured.client ?? '—'} — {featured.duration ?? '—'}
                  </div>
                </div>
                <div style={{ display: 'grid', placeItems: 'center', width: 74, height: 74, borderRadius: '50%', background: gradSteep, flex: 'none', boxShadow: '0 12px 40px rgba(131,84,201,.5)' }}>
                  <span style={{ borderLeft: '22px solid #fff', borderTop: '13px solid transparent', borderBottom: '13px solid transparent', marginLeft: 5 }} />
                </div>
              </div>
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 20 }}>
            {gridFilms.map((v) => (
              <div key={v.id} onClick={() => openVideo(v)} style={{ position: 'relative', borderRadius: 4, overflow: 'hidden', cursor: 'pointer', aspectRatio: '16/9' }}>
                {v.thumbnail_url ? (
                  <div style={{ position: 'absolute', inset: 0, background: `url(${v.thumbnail_url}) center/cover no-repeat` }} />
                ) : (
                  <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(500px 300px at 50% 50%,rgba(43,57,184,.45),transparent 70%),#151126' }} />
                )}
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(0deg,rgba(12,10,22,.9),rgba(12,10,22,.05) 60%)', pointerEvents: 'none' }} />
                <div style={{ position: 'absolute', top: 14, right: 14, ...mono, fontSize: 11, letterSpacing: 1, color: '#fff', background: 'rgba(12,10,22,.6)', backdropFilter: 'blur(6px)', padding: '4px 9px', borderRadius: 100, pointerEvents: 'none' }}>
                  {v.duration ?? '—'}
                </div>
                <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', display: 'grid', placeItems: 'center', width: 52, height: 52, borderRadius: '50%', background: 'rgba(255,255,255,.14)', border: '1px solid rgba(255,255,255,.5)', backdropFilter: 'blur(4px)', pointerEvents: 'none' }}>
                  <span style={{ borderLeft: '15px solid #fff', borderTop: '9px solid transparent', borderBottom: '9px solid transparent', marginLeft: 4 }} />
                </div>
                <div style={{ position: 'absolute', left: 16, bottom: 14, right: 16, pointerEvents: 'none' }}>
                  <div style={{ fontFamily: 'var(--ui-font)', fontWeight: 600, fontSize: 19, textTransform: 'uppercase', lineHeight: 1.05 }}>{v.title}</div>
                  <div style={{ ...mono, fontSize: 11, letterSpacing: 1, textTransform: 'uppercase', color: '#B4B1C9', marginTop: 5 }}>{v.client ?? '—'}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PROCESS */}
      <section id="process" style={{ borderTop: '1px solid var(--sline-16)', background: '#17153A', color: '#F7F6FB', scrollMarginTop: 76 }}>
        <div style={{ maxWidth: 1360, margin: '0 auto', padding: '96px 40px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 70, flexWrap: 'wrap', gap: 16 }}>
            <div className="site-kicker" style={{ color: '#E86FA6' }}>( 05 — How we work )</div>
            <h2 className="site-h2">Our production process</h2>
          </div>
          <div style={{ position: 'relative', height: 4, background: 'rgba(247,246,251,.14)', marginBottom: 40 }}>
            <div style={{ position: 'absolute', inset: 0, width: '72%', background: 'linear-gradient(90deg,#E86FA6,#8354C9,#2B39B8)' }} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: 26 }}>
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
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '110px 40px', textAlign: 'center' }}>
          <div className="site-kicker" style={{ marginBottom: 34 }}>( 06 — What clients say )</div>
          <p style={{ fontFamily: 'var(--ui-font)', fontWeight: 600, fontSize: 40, lineHeight: 1.25, letterSpacing: -1, margin: '0 0 36px' }}>
            “{lead.q}”
          </p>
          <div style={{ ...mono, fontSize: 12.5, letterSpacing: 1.5, textTransform: 'uppercase', color: 'var(--smuted)' }}>{lead.a}{lead.r ? ` — ${lead.r}` : ''}</div>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 40, marginTop: 60, paddingTop: 44, borderTop: '1px solid var(--sline-12)' }}>
            {quoteList.map((t, i) => (
              <div key={i} style={{ maxWidth: 280, textAlign: 'left' }}>
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
        <div style={{ maxWidth: 1360, margin: '0 auto', padding: '96px 40px', display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 70, alignItems: 'center' }}>
          <div>
            <div className="site-kicker" style={{ marginBottom: 20 }}>( 07 — The gear )</div>
            <h2 className="site-h2" style={{ fontSize: 48, letterSpacing: -1.6, lineHeight: 1, margin: '0 0 22px' }}>Professional gear. Professional results.</h2>
            <p style={{ fontSize: 17, lineHeight: 1.7, color: 'var(--smuted)', margin: '0 0 36px', maxWidth: 520 }}>
              We shoot on cinema-grade equipment and light every frame with intent — so your story looks as premium as your brand.
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
              {equipment.map((e) => (
                <span key={e} style={{ padding: '11px 18px', border: '1px solid var(--sline-25)', ...mono, fontSize: 12.5, letterSpacing: 1, textTransform: 'uppercase', color: 'var(--sink)', clipPath: 'polygon(0 0,calc(100% - 10px) 0,100% 10px,100% 100%,0 100%)' }}>
                  {e}
                </span>
              ))}
            </div>
          </div>
          <div>
            <Placeholder label="Studio / camera rig photo" style={{ width: '100%', height: 400, clipPath: 'polygon(2% 0, 100% 2%, 98% 100%, 0 97%)' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', ...mono, fontSize: 11.5, letterSpacing: 1.5, color: 'var(--sfaint)', textTransform: 'uppercase', marginTop: 12 }}>
              <span>STAGE A — RIG 02</span>
              <span>8K RAW</span>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ borderTop: '1px solid var(--sline-16)', padding: '80px 40px' }}>
        <div style={{ maxWidth: 1360, margin: '0 auto', background: 'linear-gradient(115deg,#E86FA6,#8354C9 45%,#2B39B8)', clipPath: 'polygon(0 6%, 100% 0, 100% 94%, 0 100%)', padding: '110px 60px', textAlign: 'center', color: '#fff' }}>
          <h2 style={{ fontFamily: 'var(--ui-font)', fontWeight: 700, fontSize: 64, letterSpacing: -2, textTransform: 'uppercase', lineHeight: 0.98, margin: '0 0 20px' }}>Let's create something amazing</h2>
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
        <div style={{ maxWidth: 1360, margin: '0 auto', padding: '96px 40px', display: 'grid', gridTemplateColumns: '1fr 1.3fr', gap: 80 }}>
          <div>
            <div className="site-kicker" style={{ marginBottom: 20 }}>( 08 — Get in touch )</div>
            <h2 className="site-h2" style={{ fontSize: 48, letterSpacing: -1.6, lineHeight: 1, margin: '0 0 40px' }}>Start the conversation</h2>
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
                    <a key={so} href={href} target="_blank" rel="noreferrer" style={{ ...base, cursor: 'pointer' }}>
                      {so}
                    </a>
                  ) : (
                    <div key={so} style={{ ...base, opacity: 0.4 }}>{so}</div>
                  );
                })}
              </div>
            </div>
          </div>
          <form onSubmit={(e) => void submit(e)}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '26px 30px' }}>
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
      <footer style={{ borderTop: '1px solid var(--sline-2)', background: 'var(--ssurface)' }}>
        <div style={{ maxWidth: 1360, margin: '0 auto', padding: '44px 40px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 22 }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <KLogoImg gradient size={38} src={data?.logo_url} />
          </div>
          <div style={{ display: 'flex', gap: 26, ...mono, fontSize: 12, letterSpacing: 1, textTransform: 'uppercase' }}>
            {[
              ['Home', '#'],
              ['Work', '#work'],
              ['Services', '#services'],
              ['About', '#about'],
              ['Contact', '#contact'],
            ].map(([l, h]) => (
              <a key={l} href={h} style={{ color: 'var(--smuted)', textDecoration: 'none' }}>
                {l}
              </a>
            ))}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
            <Link to="/admin" style={{ ...mono, fontSize: 11.5, letterSpacing: 1, textTransform: 'uppercase', color: 'var(--sfaint)', textDecoration: 'none' }}>
              Admin Login ↗
            </Link>
            <div style={{ ...mono, fontSize: 11.5, color: 'var(--sfaint)' }}>© 2026 KML PRODUCTION</div>
          </div>
        </div>
      </footer>

      {/* VIDEO LIGHTBOX */}
      {activeVideo && (
        <div onClick={() => setActiveVideo(null)} style={{ position: 'fixed', inset: 0, zIndex: 9600, background: 'rgba(6,5,12,.9)', backdropFilter: 'blur(10px)', display: 'grid', placeItems: 'center', padding: 40 }}>
          <div onClick={(e) => e.stopPropagation()} style={{ width: 'min(1100px,100%)', maxHeight: 'calc(100vh - 80px)', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 16, marginBottom: 14, color: '#F7F6FB', flex: '0 0 auto' }}>
              <div>
                <div style={{ ...mono, fontSize: 11.5, letterSpacing: 1.5, textTransform: 'uppercase', color: '#C9A8FF', marginBottom: 8 }}>● Now playing</div>
                <div style={{ fontFamily: 'var(--ui-font)', fontWeight: 700, fontSize: 30, letterSpacing: -1, textTransform: 'uppercase', lineHeight: 1 }}>{activeVideo.title}</div>
                <div style={{ ...mono, fontSize: 12, letterSpacing: 1, textTransform: 'uppercase', color: '#B4B1C9', marginTop: 6 }}>
                  {activeVideo.client ?? '—'} — {activeVideo.duration ?? '—'}
                </div>
              </div>
              <button onClick={() => setActiveVideo(null)} style={{ width: 44, height: 44, border: '1px solid rgba(255,255,255,.3)', background: 'transparent', color: '#fff', fontSize: 17, display: 'grid', placeItems: 'center', flex: 'none' }}>
                ✕
              </button>
            </div>
            <div style={{ position: 'relative', width: '100%', aspectRatio: '16/9', maxHeight: 'calc(100vh - 170px)', minHeight: 0, background: '#000', border: '1px solid rgba(255,255,255,.14)', overflow: 'hidden' }}>
              {embed ? (
                <iframe src={embed} title={activeVideo.title} allow="autoplay; fullscreen" allowFullScreen style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', border: 'none' }} />
              ) : isDirectVideo(activeVideo.video_url) ? (
                <video src={activeVideo.video_url ?? undefined} controls autoPlay playsInline style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'contain', background: '#000' }} />
              ) : (
                <>
                  {activeVideo.thumbnail_url ? (
                    <div style={{ position: 'absolute', inset: 0, background: `url(${activeVideo.thumbnail_url}) center/cover no-repeat` }} />
                  ) : (
                    <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(800px 500px at 50% 45%,rgba(131,84,201,.4),transparent 70%),#0B0914' }} />
                  )}
                  <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at 50% 45%,rgba(0,0,0,.15),rgba(0,0,0,.55))', pointerEvents: 'none' }} />
                  <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', display: 'grid', placeItems: 'center', width: 88, height: 88, borderRadius: '50%', background: gradSteep, boxShadow: '0 16px 50px rgba(131,84,201,.6)', pointerEvents: 'none' }}>
                    <span style={{ borderLeft: '26px solid #fff', borderTop: '16px solid transparent', borderBottom: '16px solid transparent', marginLeft: 6 }} />
                  </div>
                  <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 14, background: 'linear-gradient(0deg,rgba(0,0,0,.7),transparent)', pointerEvents: 'none' }}>
                    <span style={{ ...mono, fontSize: 12, color: '#fff' }}>00:00</span>
                    <div style={{ flex: 1, height: 4, borderRadius: 100, background: 'rgba(255,255,255,.25)', overflow: 'hidden' }}>
                      <div style={{ width: '18%', height: '100%', background: 'linear-gradient(90deg,#E86FA6,#2B39B8)' }} />
                    </div>
                    <span style={{ ...mono, fontSize: 12, color: '#B4B1C9' }}>{activeVideo.duration ?? '—'}</span>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
