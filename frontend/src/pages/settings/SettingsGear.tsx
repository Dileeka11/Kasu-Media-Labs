import { useRef } from 'react';
import { useOutletContext } from 'react-router-dom';
import type { Settings as SettingsData } from '../../types';
import { ProgressBar } from '../../components/ui';

interface SettingsContext {
  settings: SettingsData;
  saved: boolean;
  busy: boolean;
  mediaPct: Partial<Record<'logo' | 'hero_video' | 'about_image' | 'gear_image', number>>;
  saveWith: (patch: Partial<SettingsData>) => Promise<void>;
  uploadMedia: (field: 'logo' | 'hero_video' | 'about_image' | 'gear_image', file: File) => Promise<void>;
  clearMedia: (field: 'logo' | 'hero_video' | 'about_image' | 'gear_image') => Promise<void>;
  setLocal: (patch: Partial<SettingsData>) => void;
}

const cardStyle = { padding: 26 } as const;
const h3Style = { fontWeight: 600, fontSize: 17, margin: '0 0 6px' } as const;

export default function SettingsGear() {
  const { settings: s, saved, busy, mediaPct, saveWith, uploadMedia, clearMedia, setLocal } =
    useOutletContext<SettingsContext>();
  const imageInput = useRef<HTMLInputElement>(null);
  const items = s.gear_items ?? [];

  const savedTag = saved && (
    <span style={{ fontFamily: 'var(--ui-font)', fontSize: 12, color: 'var(--green)', fontWeight: 700 }}>✓ Saved</span>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* IMAGE */}
      <div className="k-card" style={cardStyle}>
        <h3 className="k-h" style={h3Style}>Gear section image</h3>
        <div style={{ fontSize: 13, color: 'var(--ink-3)', marginBottom: 20 }}>
          The photo shown beside the “Professional gear” text on the homepage (studio / camera rig). JPG or PNG, max 8&nbsp;MB.
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ width: 168, height: 100, borderRadius: 10, border: '1px solid var(--border)', background: 'var(--bg)', display: 'grid', placeItems: 'center', overflow: 'hidden', flex: 'none' }}>
            {s.gear_image_url ? (
              <img src={s.gear_image_url} alt="gear" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <span style={{ fontSize: 11, color: 'var(--ink-3)' }}>No image</span>
            )}
          </div>
          <input ref={imageInput} type="file" accept="image/*" hidden onChange={(e) => e.target.files?.[0] && void uploadMedia('gear_image', e.target.files[0])} />
          <button className="k-btn-outline" onClick={() => imageInput.current?.click()}>Upload image</button>
          {s.gear_image_url && <button className="k-btn-outline" onClick={() => void clearMedia('gear_image')} style={{ color: 'var(--red)' }}>Remove</button>}
        </div>
        <ProgressBar value={mediaPct.gear_image} label="Uploading image" />
      </div>

      {/* COPY */}
      <div className="k-card" style={cardStyle}>
        <h3 className="k-h" style={{ ...h3Style, margin: '0 0 20px' }}>Gear text</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label className="k-label">Kicker (small label above the heading)</label>
            <input className="k-input" value={s.gear_kicker ?? ''} onChange={(e) => setLocal({ gear_kicker: e.target.value })} />
          </div>
          <div>
            <label className="k-label">Heading</label>
            <input className="k-input" value={s.gear_heading ?? ''} onChange={(e) => setLocal({ gear_heading: e.target.value })} />
          </div>
          <div>
            <label className="k-label">Paragraph</label>
            <textarea className="k-input" value={s.gear_body ?? ''} onChange={(e) => setLocal({ gear_body: e.target.value })} style={{ height: 110, resize: 'vertical' }} />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <button className="k-btn-grad" onClick={() => void saveWith({ gear_kicker: s.gear_kicker, gear_heading: s.gear_heading, gear_body: s.gear_body })} disabled={busy}>
              {busy ? 'Saving…' : 'Save gear text'}
            </button>
            {savedTag}
          </div>
        </div>
      </div>

      {/* EQUIPMENT PILLS */}
      <div className="k-card" style={cardStyle}>
        <h3 className="k-h" style={{ ...h3Style, margin: '0 0 6px' }}>Equipment list</h3>
        <p className="k-label" style={{ margin: '0 0 16px' }}>The pills shown beside the text. Keep each one short.</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {items.map((it, i) => (
            <div key={i} style={{ display: 'flex', gap: 10 }}>
              <input className="k-input" placeholder="Cinema Cameras" value={it} onChange={(e) => setLocal({ gear_items: items.map((x, j) => (j === i ? e.target.value : x)) })} />
              <button className="k-btn-outline" onClick={() => setLocal({ gear_items: items.filter((_, j) => j !== i) })} style={{ color: 'var(--red)' }}>✕</button>
            </div>
          ))}
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginTop: 4 }}>
            <button className="k-btn-outline" onClick={() => setLocal({ gear_items: [...items, ''] })} disabled={items.length >= 12}>+ Add item</button>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginTop: 10 }}>
            <button className="k-btn-grad" onClick={() => void saveWith({ gear_items: items })} disabled={busy}>{busy ? 'Saving…' : 'Save equipment list'}</button>
            {savedTag}
          </div>
        </div>
      </div>
    </div>
  );
}
