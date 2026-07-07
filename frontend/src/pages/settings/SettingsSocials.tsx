import { useOutletContext } from 'react-router-dom';
import type { Settings as SettingsData } from '../../types';

interface SettingsContext {
  settings: SettingsData;
  saved: boolean;
  busy: boolean;
  saveWith: (patch: Partial<SettingsData>) => Promise<void>;
  setLocal: (patch: Partial<SettingsData>) => void;
}

const socialMeta: { key: 'instagram' | 'youtube' | 'vimeo' | 'linkedin'; label: string; ph: string }[] = [
  { key: 'instagram', label: 'Instagram', ph: 'https://instagram.com/…' },
  { key: 'youtube', label: 'YouTube', ph: 'https://youtube.com/@…' },
  { key: 'vimeo', label: 'Vimeo', ph: 'https://vimeo.com/…' },
  { key: 'linkedin', label: 'LinkedIn', ph: 'https://linkedin.com/company/…' },
];

const cardStyle = { padding: 26 } as const;
const h3Style = { fontWeight: 600, fontSize: 17, margin: '0 0 6px' } as const;

export default function SettingsSocials() {
  const { settings: s, saved, busy, saveWith, setLocal } = useOutletContext<SettingsContext>();

  const savedTag = saved && (
    <span style={{ fontFamily: 'var(--ui-font)', fontSize: 12, color: 'var(--green)', fontWeight: 700 }}>✓ Saved</span>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* SOCIALS */}
      <div className="k-card" style={cardStyle}>
        <h3 className="k-h" style={{ ...h3Style, margin: '0 0 20px' }}>Social links</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {socialMeta.map((m) => (
            <div key={m.key}>
              <label className="k-label">{m.label}</label>
              <input
                className="k-input"
                placeholder={m.ph}
                value={s.socials?.[m.key] ?? ''}
                onChange={(e) => setLocal({ socials: { ...(s.socials ?? {}), [m.key]: e.target.value } })}
              />
            </div>
          ))}
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <button className="k-btn-grad" onClick={() => void saveWith({ socials: s.socials })} disabled={busy}>
              {busy ? 'Saving…' : 'Save links'}
            </button>
            {savedTag}
          </div>
        </div>
      </div>
    </div>
  );
}
