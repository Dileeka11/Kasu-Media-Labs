'use client';

import { useEffect, useMemo, useState, type CSSProperties } from 'react';
import Link from 'next/link';
import type { Project, SiteData } from '../lib/types';
import { KLogoImg } from './ui';
import { WorkCard, VideoModal, type ActiveVideo } from './work';
import { applyFont, fontStack } from '../lib/font';
import { useIsMobile, useIsTablet } from '../lib/useMediaQuery';

// The full "Selected work" archive — every project, reached from the home
// page's "View all work" button. Reuses the same card + player as the home grid.
const API = (process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000/api') as string;

export default function WorkClient({ initialData }: { initialData: SiteData | null }) {
  const [data, setData] = useState<SiteData | null>(initialData);
  const isMobile = useIsMobile();
  const isTablet = useIsTablet();
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [filter, setFilter] = useState('All');
  const [activeVideo, setActiveVideo] = useState<ActiveVideo | null>(null);

  useEffect(() => {
    if (localStorage.getItem('kml_theme') === 'dark') setTheme('dark');
  }, []);

  // Refresh from the live API (static export is baked at build time).
  useEffect(() => {
    let alive = true;
    fetch(`${API}/public/site`, { headers: { Accept: 'application/json' } })
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => { if (alive && d) setData(d as SiteData); })
      .catch(() => {});
    return () => { alive = false; };
  }, []);

  useEffect(() => {
    if (data) applyFont(data.font);
  }, [data]);

  useEffect(() => {
    localStorage.setItem('kml_theme', theme);
  }, [theme]);

  // Fade the cards in as they enter the viewport, re-wiring when data/filter change.
  useEffect(() => {
    const els = Array.from(document.querySelectorAll<HTMLElement>('.reveal, .reveal-stagger'));
    if (!('IntersectionObserver' in window) || !els.length) {
      els.forEach((el) => el.classList.add('in'));
      return;
    }
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && (e.target.classList.add('in'), io.unobserve(e.target))),
      { threshold: 0.1, rootMargin: '0px 0px -6% 0px' },
    );
    els.forEach((el) => !el.classList.contains('in') && io.observe(el));
    return () => io.disconnect();
  }, [data, filter]);

  const projects = useMemo(() => data?.projects ?? [], [data]);
  const cats = useMemo(() => ['All', ...(data?.categories.map((c) => c.name) ?? [])], [data]);
  const filtered = filter === 'All' ? projects : projects.filter((p) => p.category?.name === filter);

  const mono: CSSProperties = { fontFamily: 'var(--ui-font)' };
  const secPad = isMobile ? '114px 20px 64px' : '154px 40px 96px';
  const rootStyle = { '--ui-font': fontStack(data?.font) } as CSSProperties;

  const openVideo = (p: Project) =>
    setActiveVideo({ title: p.title, client: p.client, duration: p.duration, thumbnail_url: p.thumbnail_url, video_url: p.video_url });

  return (
    <div className={`site-root${theme === 'dark' ? ' dark' : ''}`} style={rootStyle}>
      {/* Header — logo home link + back-to-home + theme toggle */}
      <nav className="site-nav scrolled">
        <Link href="/" style={{ display: 'flex', alignItems: 'center', textDecoration: 'none' }}>
          <KLogoImg gradient size={46} src={data?.logo_url} />
        </Link>
        <div style={{ display: isMobile ? 'none' : 'flex', ...mono, fontSize: 12.5, letterSpacing: 1, textTransform: 'uppercase' }}>
          <Link href="/" style={{ color: 'var(--navfg)', textDecoration: 'none' }}>← Back to home</Link>
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 14 }}>
          <button
            onClick={() => setTheme((t) => (t === 'dark' ? 'light' : 'dark'))}
            title="Toggle theme"
            style={{ width: 40, height: 40, borderRadius: '50%', border: '1px solid var(--navfg)', background: 'transparent', fontSize: 16, color: 'var(--navfg)', display: 'grid', placeItems: 'center', flex: 'none' }}
          >
            {theme === 'dark' ? '☀' : '☾'}
          </button>
        </div>
      </nav>

      <section>
        <div style={{ maxWidth: 1360, margin: '0 auto', padding: secPad }}>
          <div className="reveal" style={{ marginBottom: isMobile ? 8 : 20 }}>
            <div className="site-kicker" style={{ marginBottom: 14 }}>( Selected work )</div>
            <h2 className="site-h2" style={{ margin: 0 }}>Our work speaks for itself</h2>
            <p style={{ fontSize: 17, lineHeight: 1.7, color: 'var(--smuted)', margin: '20px 0 0', maxWidth: 560 }}>
              Every project we&apos;ve shot, edited, and delivered — commercials, corporate films, documentaries, and social content.
            </p>
          </div>

          {/* Category filter */}
          <div className="reveal" style={{ display: 'flex', gap: 22, flexWrap: 'wrap', margin: isMobile ? '28px 0 6px' : '40px 0 10px' }}>
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

          {/* Full video grid */}
          <div
            className="reveal-stagger"
            style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : isTablet ? 'repeat(2,1fr)' : 'repeat(3,1fr)', gap: isMobile ? 20 : 26, marginTop: 26 }}
          >
            {filtered.map((p, i) => (
              <WorkCard key={p.id} project={p} index={i} onOpen={openVideo} isMobile={isMobile} />
            ))}
            {filtered.length === 0 && (
              <div style={{ gridColumn: '1 / -1', padding: '40px 0', color: 'var(--sfaint)', ...mono, fontSize: 12, letterSpacing: 1.5, textTransform: 'uppercase' }}>
                No projects in this category yet.
              </div>
            )}
          </div>

          <div className="reveal" style={{ display: 'flex', justifyContent: 'center', marginTop: isMobile ? 48 : 64 }}>
            <Link href="/" className="site-btn-outline" style={{ ...mono, fontSize: 13, letterSpacing: 1.5, textTransform: 'uppercase', textDecoration: 'none', color: 'var(--sink)', padding: '16px 40px', border: '1px solid var(--sline-25)', clipPath: 'polygon(0 0,calc(100% - 10px) 0,100% 10px,100% 100%,0 100%)' }}>
              ← Back to home
            </Link>
          </div>
        </div>
      </section>

      {activeVideo && <VideoModal active={activeVideo} onClose={() => setActiveVideo(null)} isMobile={isMobile} />}
    </div>
  );
}
