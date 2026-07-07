import { useOutletContext } from 'react-router-dom';
import type { Settings as SettingsData } from '../../types';
import { FONT_OPTIONS, fontStack } from '../../font';

interface SettingsContext {
  settings: SettingsData;
  saved: boolean;
  busy: boolean;
  saveWith: (patch: Partial<SettingsData>) => Promise<void>;
  setLocal: (patch: Partial<SettingsData>) => void;
}

const cardStyle = { padding: 26 } as const;
const h3Style = { fontWeight: 600, fontSize: 17, margin: '0 0 6px' } as const;

export default function SettingsHero() {
  const { settings: s, saved, busy, saveWith, setLocal } = useOutletContext<SettingsContext>();
  const ticker = s.ticker_items ?? [];

  const savedTag = saved && (
    <span style={{ fontFamily: 'var(--ui-font)', fontSize: 12, color: 'var(--green)', fontWeight: 700 }}>✓ Saved</span>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* HERO COPY */}
      <div className="k-card" style={cardStyle}>
        <h3 className="k-h" style={{ ...h3Style, margin: '0 0 20px' }}>Hero section</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label className="k-label">Kicker (small pill text)</label>
            <input className="k-input" value={s.hero_kicker ?? ''} onChange={(e) => setLocal({ hero_kicker: e.target.value })} />
          </div>
          <div>
            <label className="k-label">Headline</label>
            <input className="k-input" value={s.hero_headline ?? ''} onChange={(e) => setLocal({ hero_headline: e.target.value })} />
          </div>
          <div>
            <label className="k-label">Sub-headline</label>
            <textarea className="k-input" value={s.hero_subheadline ?? ''} onChange={(e) => setLocal({ hero_subheadline: e.target.value })} style={{ height: 76, resize: 'vertical' }} />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <button className="k-btn-grad" onClick={() => void saveWith({ hero_kicker: s.hero_kicker, hero_headline: s.hero_headline, hero_subheadline: s.hero_subheadline })} disabled={busy}>
              {busy ? 'Saving…' : 'Save hero'}
            </button>
            {savedTag}
          </div>
        </div>
      </div>

      {/* TICKER */}
      <div className="k-card" style={cardStyle}>
        <h3 className="k-h" style={{ ...h3Style, margin: '0 0 6px' }}>Ticker (scrolling services strip)</h3>
        <p className="k-label" style={{ margin: '0 0 16px' }}>The words that scroll below the hero. Keep each one short.</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {ticker.map((t, i) => (
            <div key={i} style={{ display: 'flex', gap: 10 }}>
              <input className="k-input" placeholder="Commercials" value={t} onChange={(e) => setLocal({ ticker_items: ticker.map((x, j) => (j === i ? e.target.value : x)) })} />
              <button className="k-btn-outline" onClick={() => setLocal({ ticker_items: ticker.filter((_, j) => j !== i) })} style={{ color: 'var(--red)' }}>✕</button>
            </div>
          ))}
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginTop: 4 }}>
            <button className="k-btn-outline" onClick={() => setLocal({ ticker_items: [...ticker, ''] })} disabled={ticker.length >= 20}>+ Add item</button>
          </div>

          <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 8 }}>
            <label className="k-label">Ticker Font</label>
            <select className="k-input" value={s.ticker_font ?? ''} onChange={(e) => setLocal({ ticker_font: e.target.value || null })}>
              <option value="">Default (Global Site Font)</option>
              {FONT_OPTIONS.map((f) => (
                <option key={f.name} value={f.name}>{f.name}</option>
              ))}
            </select>
            <div style={{ marginTop: 10, padding: '14px 16px', border: '1px solid var(--border)', borderRadius: 8, background: 'var(--bg)', fontFamily: fontStack(s.ticker_font || s.font), fontSize: 18, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1 }}>
              Preview: Commercials ✦ Corporate Films ✦ Product Videos
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginTop: 10 }}>
            <button className="k-btn-grad" onClick={() => void saveWith({ ticker_items: ticker, ticker_font: s.ticker_font })} disabled={busy}>{busy ? 'Saving…' : 'Save ticker settings'}</button>
            {savedTag}
          </div>
        </div>
      </div>
    </div>
  );
}
