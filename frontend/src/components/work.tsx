import { type CSSProperties } from 'react';
import type { Project } from '../types';

// Shared building blocks for the "Selected work" video grid — used by both the
// home page (a 6-item preview) and the dedicated /work page (the full archive).

export interface ActiveVideo {
  title: string;
  client: string | null;
  duration: string | null;
  thumbnail_url: string | null;
  video_url: string | null;
}

const gradSteep = 'linear-gradient(135deg,#E86FA6,#8354C9 55%,#2B39B8)';
const mono: CSSProperties = { fontFamily: 'var(--ui-font)' };

export function embedUrl(url: string | null): string | null {
  if (!url) return null;
  const vimeo = url.match(/vimeo\.com\/(\d+)/);
  if (vimeo) return `https://player.vimeo.com/video/${vimeo[1]}?autoplay=1`;
  const yt = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]+)/);
  if (yt) return `https://www.youtube.com/embed/${yt[1]}?autoplay=1`;
  return null;
}

// A direct video file we can play in a <video> tag (uploads, or plain .mp4 links).
export function isDirectVideo(url: string | null): boolean {
  if (!url) return false;
  return /\.(mp4|webm|ogg|mov)(\?|#|$)/i.test(url) || url.includes('/storage/');
}

export function Placeholder({ label, style }: { label: string; style?: CSSProperties }) {
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

// One card in the video grid: thumbnail + play overlay, opening the fullscreen player.
export function WorkCard({ project: p, index, onOpen, isMobile }: { project: Project; index: number; onOpen: (p: Project) => void; isMobile: boolean }) {
  return (
    <div className="work-card" onClick={() => onOpen(p)} style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div className="work-card-media" style={{ position: 'relative', aspectRatio: '16 / 9', overflow: 'hidden', clipPath: 'polygon(0 3%, 100% 0, 100% 97%, 0 100%)' }}>
        {p.thumbnail_url ? (
          <div className="work-thumb" style={{ position: 'absolute', inset: 0, background: `url(${p.thumbnail_url}) center/cover no-repeat` }} />
        ) : (
          <Placeholder label={p.category?.name ?? ''} style={{ position: 'absolute', inset: 0 }} />
        )}
        {/* Play overlay — each video opens in the fullscreen cinematic player */}
        <div className="work-card-overlay" style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center', background: 'linear-gradient(180deg, rgba(23,21,58,0) 40%, rgba(23,21,58,.55))', transition: 'background .3s' }}>
          <div className="work-card-play" style={{ width: 62, height: 62, borderRadius: '50%', display: 'grid', placeItems: 'center', background: 'rgba(255,255,255,.14)', backdropFilter: 'blur(6px)', border: '1px solid rgba(255,255,255,.5)' }}>
            <svg width="20" height="22" viewBox="0 0 20 22" fill="#fff" aria-hidden="true"><path d="M0 0l20 11L0 22z" /></svg>
          </div>
        </div>
        {p.duration && (
          <div style={{ position: 'absolute', bottom: 12, right: 12, ...mono, fontSize: 11, letterSpacing: 1, color: '#fff', background: 'rgba(23,21,58,.6)', padding: '4px 9px', borderRadius: 4 }}>{p.duration}</div>
        )}
        <div style={{ position: 'absolute', top: 12, left: 12, ...mono, fontSize: 11, letterSpacing: 1, color: 'rgba(255,255,255,.85)' }}>{String(index + 1).padStart(2, '0')}</div>
      </div>
      <div>
        <div style={{ ...mono, fontSize: 11.5, letterSpacing: 1, textTransform: 'uppercase', color: 'var(--smuted)', marginBottom: 8 }}>{p.category?.name ?? '—'}</div>
        <div style={{ fontFamily: 'var(--ui-font)', fontWeight: 700, fontSize: isMobile ? 24 : 26, letterSpacing: -0.8, textTransform: 'uppercase', lineHeight: 1.08 }}>{p.title}</div>
        {p.client && <div style={{ ...mono, fontSize: 12, letterSpacing: 0.5, color: 'var(--sfaint)', marginTop: 6 }}>{p.client}</div>}
      </div>
    </div>
  );
}

// Fullscreen cinematic player — YouTube/Vimeo embed, direct <video>, or a poster fallback.
export function VideoModal({ active, onClose, isMobile }: { active: ActiveVideo; onClose: () => void; isMobile: boolean }) {
  const embed = embedUrl(active.video_url);
  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, zIndex: 9600, background: 'rgba(6,5,12,.9)', backdropFilter: 'blur(10px)', display: 'grid', placeItems: 'center', padding: isMobile ? 16 : 40 }}>
      <div onClick={(e) => e.stopPropagation()} style={{ width: 'min(1100px,100%)', maxHeight: 'calc(100vh - 80px)', display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 16, marginBottom: 14, color: '#F7F6FB', flex: '0 0 auto' }}>
          <div>
            <div style={{ ...mono, fontSize: 11.5, letterSpacing: 1.5, textTransform: 'uppercase', color: '#C9A8FF', marginBottom: 8 }}>● Now playing</div>
            <div style={{ fontFamily: 'var(--ui-font)', fontWeight: 700, fontSize: 30, letterSpacing: -1, textTransform: 'uppercase', lineHeight: 1 }}>{active.title}</div>
            <div style={{ ...mono, fontSize: 12, letterSpacing: 1, textTransform: 'uppercase', color: '#B4B1C9', marginTop: 6 }}>
              {active.client ?? '—'} — {active.duration ?? '—'}
            </div>
          </div>
          <button onClick={onClose} style={{ width: 44, height: 44, border: '1px solid rgba(255,255,255,.3)', background: 'transparent', color: '#fff', fontSize: 17, display: 'grid', placeItems: 'center', flex: 'none' }}>
            ✕
          </button>
        </div>
        <div style={{ position: 'relative', width: '100%', aspectRatio: '16/9', maxHeight: 'calc(100vh - 170px)', minHeight: 0, background: '#000', border: '1px solid rgba(255,255,255,.14)', overflow: 'hidden' }}>
          {embed ? (
            <iframe src={embed} title={active.title} allow="autoplay; fullscreen" allowFullScreen style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', border: 'none' }} />
          ) : isDirectVideo(active.video_url) ? (
            <video src={active.video_url ?? undefined} controls autoPlay playsInline style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'contain', background: '#000' }} />
          ) : (
            <>
              {active.thumbnail_url ? (
                <div style={{ position: 'absolute', inset: 0, background: `url(${active.thumbnail_url}) center/cover no-repeat` }} />
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
                <span style={{ ...mono, fontSize: 12, color: '#B4B1C9' }}>{active.duration ?? '—'}</span>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
