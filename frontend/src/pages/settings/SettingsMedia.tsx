import { useRef } from 'react';
import { useOutletContext } from 'react-router-dom';
import type { Settings as SettingsData } from '../../types';
import { ProgressBar } from '../../components/ui';

interface SettingsContext {
  settings: SettingsData;
  saved: boolean;
  busy: boolean;
  mediaPct: Partial<Record<'logo' | 'hero_video', number>>;
  saveWith: (patch: Partial<SettingsData>) => Promise<void>;
  uploadMedia: (field: 'logo' | 'hero_video', file: File) => Promise<void>;
  clearMedia: (field: 'logo' | 'hero_video') => Promise<void>;
  setLocal: (patch: Partial<SettingsData>) => void;
}

const cardStyle = { padding: 26 } as const;
const h3Style = { fontWeight: 600, fontSize: 17, margin: '0 0 6px' } as const;

export default function SettingsMedia() {
  const { settings: s, saved, busy, mediaPct, saveWith, uploadMedia, clearMedia, setLocal } = useOutletContext<SettingsContext>();
  const logoInput = useRef<HTMLInputElement>(null);
  const videoInput = useRef<HTMLInputElement>(null);

  const savedTag = saved && (
    <span style={{ fontFamily: 'var(--ui-font)', fontSize: 12, color: 'var(--green)', fontWeight: 700 }}>✓ Saved</span>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* BRAND & MEDIA */}
      <div className="k-card" style={cardStyle}>
        <h3 className="k-h" style={h3Style}>Brand &amp; media</h3>
        <div style={{ fontSize: 13, color: 'var(--ink-3)', marginBottom: 20 }}>
          Logo shows in the site header &amp; footer. The hero video autoplays behind the homepage headline (muted, looping).
        </div>

        {/* Logo */}
        <label className="k-label">Logo mark (PNG, transparent)</label>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, margin: '8px 0 22px' }}>
          <div style={{ width: 64, height: 64, borderRadius: 10, border: '1px solid var(--border)', background: 'var(--bg)', display: 'grid', placeItems: 'center', overflow: 'hidden', flex: 'none' }}>
            {s.logo_url ? <img src={s.logo_url} alt="logo" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} /> : <span style={{ fontSize: 11, color: 'var(--ink-3)' }}>No logo</span>}
          </div>
          <input ref={logoInput} type="file" accept="image/*" hidden onChange={(e) => e.target.files?.[0] && void uploadMedia('logo', e.target.files[0])} />
          <button className="k-btn-outline" onClick={() => logoInput.current?.click()}>Upload logo</button>
          {s.logo_url && <button className="k-btn-outline" onClick={() => void clearMedia('logo')} style={{ color: 'var(--red)' }}>Remove</button>}
        </div>
        <ProgressBar value={mediaPct.logo} label="Uploading logo" />

        {/* Hero video */}
        <label className="k-label">Hero background video (MP4 / WebM, max 50 MB)</label>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginTop: 8 }}>
          <div style={{ width: 114, height: 64, borderRadius: 10, border: '1px solid var(--border)', background: '#0C0A16', display: 'grid', placeItems: 'center', overflow: 'hidden', flex: 'none' }}>
            {s.hero_video_url ? (
              <video src={s.hero_video_url} muted loop autoPlay playsInline style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <span style={{ fontSize: 11, color: '#8B88A6' }}>No video</span>
            )}
          </div>
          <input ref={videoInput} type="file" accept="video/mp4,video/webm,video/quicktime" hidden onChange={(e) => e.target.files?.[0] && void uploadMedia('hero_video', e.target.files[0])} />
          <button className="k-btn-outline" onClick={() => videoInput.current?.click()}>Upload video</button>
          {s.hero_video_url && <button className="k-btn-outline" onClick={() => void clearMedia('hero_video')} style={{ color: 'var(--red)' }}>Remove</button>}
        </div>
        <ProgressBar value={mediaPct.hero_video} label="Uploading video" />

        {/* Showreel */}
        <label className="k-label" style={{ marginTop: 24 }}>Showreel video link (the “Watch Showreel” button)</label>
        <div style={{ fontSize: 12.5, color: 'var(--ink-3)', margin: '4px 0 10px' }}>
          Paste a YouTube, Vimeo, or direct .mp4 link. Plays fullscreen when visitors click “Watch Showreel”. Leave blank to use your most-viewed project.
        </div>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <input className="k-input" placeholder="https://youtube.com/watch?v=…" value={s.showreel_url ?? ''} onChange={(e) => setLocal({ showreel_url: e.target.value })} style={{ flex: 1 }} />
          <button className="k-btn-grad" onClick={() => void saveWith({ showreel_url: s.showreel_url })} disabled={busy}>{busy ? 'Saving…' : 'Save'}</button>
        </div>
        {savedTag}
      </div>
    </div>
  );
}
