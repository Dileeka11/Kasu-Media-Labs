import { useState, type CSSProperties, type ReactNode } from 'react';
import type { ProjectStatus, Role } from '../types';

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
  // Track the exact URL that failed (not just a boolean) so that when `src`
  // later changes — e.g. the uploaded logo arrives after the initial render —
  // we re-attempt it instead of staying stuck on the vector fallback.
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  const candidate = src || '/logo-mark.png';
  if (candidate === failedSrc) return <KLogo size={size} gradient={gradient} />;
  return (
    <img
      key={candidate}
      src={candidate}
      alt="KML Production"
      onError={() => setFailedSrc(candidate)}
      style={{ height: Math.round(size * 1.27), width: 'auto', display: 'block', objectFit: 'contain' }}
    />
  );
}

export const statusColors: Record<ProjectStatus, string> = {
  published: '#1B8A5A',
  draft: '#8B88A6',
  review: '#B8791E',
};

export function StatusPill({ status }: { status: ProjectStatus }) {
  const c = statusColors[status];
  return (
    <span className="k-pill" style={{ color: c, background: c + '14', border: `1px solid ${c}55`, textTransform: 'capitalize' }}>
      {status}
    </span>
  );
}

export const roleColors: Record<Role, string> = {
  owner: '#E86FA6',
  editor: '#8354C9',
  producer: '#2B39B8',
  viewer: '#8B88A6',
};

export function RolePill({ role }: { role: Role }) {
  const c = roleColors[role];
  return (
    <span className="k-pill" style={{ color: c, background: c + '18', border: `1px solid ${c}66`, textTransform: 'capitalize' }}>
      {role}
    </span>
  );
}

export function initials(name: string): string {
  return name
    .split(' ')
    .map((x) => x[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

export function fmtViews(n: number): string {
  if (!n) return '—';
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(2) + 'M';
  if (n >= 1_000) return (n / 1_000).toFixed(1) + 'K';
  return String(n);
}

export function fmtDate(d: string | null): string {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: '2-digit' });
}

export function relTime(iso: string | null): string {
  if (!iso) return '—';
  const mins = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (mins < 5) return 'Online now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 2) return 'Yesterday';
  return `${days}d ago`;
}

export function relTimeShort(iso: string): string {
  const mins = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (mins < 60) return `${Math.max(mins, 1)}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

export function Modal({
  title,
  onClose,
  children,
  footer,
  width = 560,
}: {
  title: string;
  onClose: () => void;
  children: ReactNode;
  footer?: ReactNode;
  width?: number;
}) {
  return (
    <div
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9500,
        background: 'rgba(23,21,58,.4)',
        backdropFilter: 'blur(5px)',
        display: 'grid',
        placeItems: 'center',
        padding: 24,
      }}
    >
      <div
        className="kadmin-scroll"
        style={{
          width,
          maxWidth: '100%',
          maxHeight: '88vh',
          overflow: 'auto',
          background: '#fff',
          border: '1px solid rgba(23,21,58,.18)',
          borderRadius: 6,
          boxShadow: '0 30px 80px rgba(23,21,58,.3)',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '22px 26px',
            borderBottom: '1px solid rgba(23,21,58,.12)',
          }}
        >
          <h3 className="k-h" style={{ fontSize: 19 }}>{title}</h3>
          <button className="k-icon-btn" style={{ width: 32, height: 32, fontSize: 15 }} onClick={onClose} aria-label="Close">
            ✕
          </button>
        </div>
        <div style={{ padding: 26, display: 'flex', flexDirection: 'column', gap: 18 }}>{children}</div>
        {footer && (
          <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', padding: '20px 26px', borderTop: '1px solid rgba(23,21,58,.12)' }}>
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}

export function Toggle({ on, onChange }: { on: boolean; onChange: (v: boolean) => void }) {
  return (
    <button type="button" className={`k-toggle${on ? ' on' : ''}`} onClick={() => onChange(!on)} aria-pressed={on}>
      <div className="knob" />
    </button>
  );
}

export function ErrorBox({ children, style }: { children: ReactNode; style?: CSSProperties }) {
  return (
    <div
      style={{
        padding: '11px 14px',
        background: 'rgba(232,111,138,.12)',
        border: '1px solid rgba(232,111,138,.4)',
        borderRadius: 4,
        color: '#C24A6E',
        fontSize: 13,
        ...style,
      }}
    >
      {children}
    </div>
  );
}

/**
 * Slim upload progress bar. Render only while an upload is in flight
 * (i.e. `value` is a number 0–100); pass `null`/`undefined` to hide it.
 */
export function ProgressBar({ value, label }: { value: number | null | undefined; label?: string }) {
  if (value == null) return null;
  const pct = Math.max(0, Math.min(100, Math.round(value)));
  return (
    <div style={{ marginTop: 8 }}>
      <div
        style={{
          height: 6,
          borderRadius: 100,
          background: 'rgba(23,21,58,.12)',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            width: `${pct}%`,
            height: '100%',
            background: 'var(--grad)',
            borderRadius: 100,
            transition: 'width .2s ease',
          }}
        />
      </div>
      <div className="k-mono" style={{ marginTop: 5, fontSize: 10 }}>
        {label ?? 'Uploading'} — {pct}%
      </div>
    </div>
  );
}
