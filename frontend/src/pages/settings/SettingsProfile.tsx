import { useOutletContext } from 'react-router-dom';
import type { Settings as SettingsData } from '../../types';
import { Toggle } from '../../components/ui';
import { FONT_OPTIONS, fontStack } from '../../font';

interface SettingsContext {
  settings: SettingsData;
  saved: boolean;
  busy: boolean;
  save: (patch: Partial<SettingsData>) => Promise<void>;
  saveWith: (patch: Partial<SettingsData>) => Promise<void>;
  setLocal: (patch: Partial<SettingsData>) => void;
  changeFont: (font: string) => void;
}

const prefMeta: { key: keyof Pick<SettingsData, 'email_on_inquiries' | 'auto_publish' | 'show_drafts'>; t: string; d: string }[] = [
  { key: 'email_on_inquiries', t: 'Email me on new inquiries', d: 'Get notified the moment a lead comes in' },
  { key: 'auto_publish', t: 'Auto-publish scheduled projects', d: 'Release projects at their scheduled time' },
  { key: 'show_drafts', t: 'Show drafts on public site', d: 'Preview unpublished work publicly' },
];

const cardStyle = { padding: 26 } as const;
const h3Style = { fontWeight: 600, fontSize: 17, margin: '0 0 6px' } as const;

export default function SettingsProfile() {
  const { settings: s, saved, busy, save, saveWith, setLocal, changeFont } = useOutletContext<SettingsContext>();

  const savedTag = saved && (
    <span style={{ fontFamily: 'var(--ui-font)', fontSize: 12, color: 'var(--green)', fontWeight: 700 }}>✓ Saved</span>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* STUDIO PROFILE */}
      <div className="k-card" style={cardStyle}>
        <h3 className="k-h" style={{ ...h3Style, margin: '0 0 20px' }}>Studio profile</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label className="k-label">Studio name</label>
            <input className="k-input" value={s.studio_name} onChange={(e) => setLocal({ studio_name: e.target.value })} />
          </div>
          <div>
            <label className="k-label">Contact email</label>
            <input className="k-input" type="email" value={s.contact_email} onChange={(e) => setLocal({ contact_email: e.target.value })} />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <button className="k-btn-grad" onClick={() => void saveWith({ studio_name: s.studio_name, contact_email: s.contact_email })} disabled={busy}>
              {busy ? 'Saving…' : 'Save changes'}
            </button>
            {savedTag}
          </div>
        </div>
      </div>

      {/* CONTACT DETAILS */}
      <div className="k-card" style={cardStyle}>
        <h3 className="k-h" style={{ ...h3Style, margin: '0 0 20px' }}>Contact details</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label className="k-label">Phone</label>
            <input className="k-input" value={s.phone ?? ''} onChange={(e) => setLocal({ phone: e.target.value })} />
          </div>
          <div>
            <label className="k-label">Studio address</label>
            <input className="k-input" value={s.address ?? ''} onChange={(e) => setLocal({ address: e.target.value })} />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <button className="k-btn-grad" onClick={() => void saveWith({ phone: s.phone, address: s.address })} disabled={busy}>
              {busy ? 'Saving…' : 'Save contact'}
            </button>
            {savedTag}
          </div>
        </div>
      </div>

      {/* APPEARANCE */}
      <div className="k-card" style={cardStyle}>
        <h3 className="k-h" style={h3Style}>Appearance</h3>
        <div style={{ fontSize: 13, color: 'var(--ink-3)', marginBottom: 20 }}>
          Choose the font for the admin panel and public website. Changes apply instantly.
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <label className="k-label">Panel font</label>
          <select className="k-input" value={s.font} onChange={(e) => changeFont(e.target.value)}>
            {FONT_OPTIONS.map((f) => (
              <option key={f.name} value={f.name}>{f.name}</option>
            ))}
          </select>
          <div style={{ marginTop: 14, padding: '18px 20px', border: '1px solid var(--border)', borderRadius: 8, background: 'var(--bg)', fontFamily: fontStack(s.font) }}>
            <div style={{ fontSize: 22, fontWeight: 700, marginBottom: 4 }}>The quick brown fox</div>
            <div style={{ fontSize: 14, color: 'var(--ink-2)' }}>1234567890 — jumps over the lazy dog. Preview of “{s.font}”.</div>
          </div>
        </div>
      </div>

      {/* PREFERENCES */}
      <div className="k-card" style={cardStyle}>
        <h3 className="k-h" style={h3Style}>Preferences</h3>
        {prefMeta.map((p) => (
          <div key={p.key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '15px 0', borderBottom: '1px solid rgba(23,21,58,.07)' }}>
            <div>
              <div style={{ fontSize: 14.5, fontWeight: 700 }}>{p.t}</div>
              <div style={{ fontSize: 13, color: 'var(--ink-3)' }}>{p.d}</div>
            </div>
            <Toggle on={s[p.key]} onChange={(v) => void save({ [p.key]: v })} />
          </div>
        ))}
      </div>
    </div>
  );
}
