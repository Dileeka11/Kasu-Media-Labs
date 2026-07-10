import { useRef } from 'react';
import { useOutletContext } from 'react-router-dom';
import type { Settings as SettingsData } from '../../types';
import { ProgressBar } from '../../components/ui';

interface SettingsContext {
  settings: SettingsData;
  saved: boolean;
  busy: boolean;
  mediaPct: Partial<Record<'logo' | 'hero_video' | 'about_image', number>>;
  saveWith: (patch: Partial<SettingsData>) => Promise<void>;
  uploadMedia: (field: 'logo' | 'hero_video' | 'about_image', file: File) => Promise<void>;
  clearMedia: (field: 'logo' | 'hero_video' | 'about_image') => Promise<void>;
  setLocal: (patch: Partial<SettingsData>) => void;
}

const cardStyle = { padding: 26 } as const;
const h3Style = { fontWeight: 600, fontSize: 17, margin: '0 0 6px' } as const;

export default function SettingsAbout() {
  const { settings: s, saved, busy, mediaPct, saveWith, uploadMedia, clearMedia, setLocal } =
    useOutletContext<SettingsContext>();
  const imageInput = useRef<HTMLInputElement>(null);
  const features = s.about_features ?? [];

  const savedTag = saved && (
    <span style={{ fontFamily: 'var(--ui-font)', fontSize: 12, color: 'var(--green)', fontWeight: 700 }}>✓ Saved</span>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* IMAGE */}
      <div className="k-card" style={cardStyle}>
        <h3 className="k-h" style={h3Style}>About section image</h3>
        <div style={{ fontSize: 13, color: 'var(--ink-3)', marginBottom: 20 }}>
          The photo shown beside the “About the studio” text on the homepage (behind-the-scenes / crew on set). JPG or PNG, max 8&nbsp;MB.
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ width: 168, height: 100, borderRadius: 10, border: '1px solid var(--border)', background: 'var(--bg)', display: 'grid', placeItems: 'center', overflow: 'hidden', flex: 'none' }}>
            {s.about_image_url ? (
              <img src={s.about_image_url} alt="about" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <span style={{ fontSize: 11, color: 'var(--ink-3)' }}>No image</span>
            )}
          </div>
          <input ref={imageInput} type="file" accept="image/*" hidden onChange={(e) => e.target.files?.[0] && void uploadMedia('about_image', e.target.files[0])} />
          <button className="k-btn-outline" onClick={() => imageInput.current?.click()}>Upload image</button>
          {s.about_image_url && <button className="k-btn-outline" onClick={() => void clearMedia('about_image')} style={{ color: 'var(--red)' }}>Remove</button>}
        </div>
        <ProgressBar value={mediaPct.about_image} label="Uploading image" />
      </div>

      {/* COPY */}
      <div className="k-card" style={cardStyle}>
        <h3 className="k-h" style={{ ...h3Style, margin: '0 0 20px' }}>About text</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label className="k-label">Kicker (small label above the heading)</label>
            <input className="k-input" value={s.about_kicker ?? ''} onChange={(e) => setLocal({ about_kicker: e.target.value })} />
          </div>
          <div>
            <label className="k-label">Heading</label>
            <input className="k-input" value={s.about_heading ?? ''} onChange={(e) => setLocal({ about_heading: e.target.value })} />
          </div>
          <div>
            <label className="k-label">First paragraph</label>
            <textarea className="k-input" value={s.about_body1 ?? ''} onChange={(e) => setLocal({ about_body1: e.target.value })} style={{ height: 120, resize: 'vertical' }} />
          </div>
          <div>
            <label className="k-label">Second paragraph</label>
            <textarea className="k-input" value={s.about_body2 ?? ''} onChange={(e) => setLocal({ about_body2: e.target.value })} style={{ height: 96, resize: 'vertical' }} />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <button className="k-btn-grad" onClick={() => void saveWith({ about_kicker: s.about_kicker, about_heading: s.about_heading, about_body1: s.about_body1, about_body2: s.about_body2 })} disabled={busy}>
              {busy ? 'Saving…' : 'Save about text'}
            </button>
            {savedTag}
          </div>
        </div>
      </div>

      {/* FEATURE PILLS */}
      <div className="k-card" style={cardStyle}>
        <h3 className="k-h" style={{ ...h3Style, margin: '0 0 6px' }}>Feature list</h3>
        <p className="k-label" style={{ margin: '0 0 16px' }}>The four highlights shown in the grid beside the text. Keep each one short.</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {features.map((f, i) => (
            <div key={i} style={{ display: 'flex', gap: 10 }}>
              <input className="k-input" placeholder="Creative Strategy" value={f} onChange={(e) => setLocal({ about_features: features.map((x, j) => (j === i ? e.target.value : x)) })} />
              <button className="k-btn-outline" onClick={() => setLocal({ about_features: features.filter((_, j) => j !== i) })} style={{ color: 'var(--red)' }}>✕</button>
            </div>
          ))}
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginTop: 4 }}>
            <button className="k-btn-outline" onClick={() => setLocal({ about_features: [...features, ''] })} disabled={features.length >= 8}>+ Add item</button>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginTop: 10 }}>
            <button className="k-btn-grad" onClick={() => void saveWith({ about_features: features })} disabled={busy}>{busy ? 'Saving…' : 'Save feature list'}</button>
            {savedTag}
          </div>
        </div>
      </div>
    </div>
  );
}
