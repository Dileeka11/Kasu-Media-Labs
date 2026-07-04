import { useEffect, useState } from 'react';
import { api, errorMessage } from '../api';
import type { Settings as SettingsData } from '../types';
import { Toggle, ErrorBox } from '../components/ui';
import { FONT_OPTIONS, applyFont, fontStack } from '../font';

const prefMeta: { key: keyof Pick<SettingsData, 'email_on_inquiries' | 'auto_publish' | 'show_drafts'>; t: string; d: string }[] = [
  { key: 'email_on_inquiries', t: 'Email me on new inquiries', d: 'Get notified the moment a lead comes in' },
  { key: 'auto_publish', t: 'Auto-publish scheduled projects', d: 'Release projects at their scheduled time' },
  { key: 'show_drafts', t: 'Show drafts on public site', d: 'Preview unpublished work publicly' },
];

export default function Settings() {
  const [settings, setSettings] = useState<SettingsData | null>(null);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    void api.get<SettingsData>('/settings').then((res) => {
      setSettings(res.data);
      applyFont(res.data.font);
    });
  }, []);

  if (!settings) return <div style={{ padding: 40, color: 'var(--ink-3)' }}>Loading…</div>;

  // Save only the fields that changed, so one control can never be blocked by
  // an unrelated field being temporarily invalid.
  const save = async (patch: Partial<SettingsData>) => {
    setSettings((cur) => (cur ? { ...cur, ...patch } : cur));
    setError('');
    setSaved(false);
    try {
      await api.put('/settings', patch);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err) {
      setError(errorMessage(err));
    }
  };

  const changeFont = (font: string) => {
    applyFont(font); // live preview across admin panel + public site
    void save({ font });
  };

  const saveProfile = async () => {
    setBusy(true);
    await save({ studio_name: settings.studio_name, contact_email: settings.contact_email });
    setBusy(false);
  };

  return (
    <div style={{ maxWidth: 640, display: 'flex', flexDirection: 'column', gap: 16 }}>
      {error && <ErrorBox>{error}</ErrorBox>}
      <div className="k-card" style={{ padding: 26 }}>
        <h3 className="k-h" style={{ fontWeight: 600, fontSize: 17, margin: '0 0 20px' }}>Studio profile</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label className="k-label">Studio name</label>
            <input
              className="k-input"
              value={settings.studio_name}
              onChange={(e) => setSettings({ ...settings, studio_name: e.target.value })}
            />
          </div>
          <div>
            <label className="k-label">Contact email</label>
            <input
              className="k-input"
              type="email"
              value={settings.contact_email}
              onChange={(e) => setSettings({ ...settings, contact_email: e.target.value })}
            />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <button className="k-btn-grad" onClick={() => void saveProfile()} disabled={busy}>
              {busy ? 'Saving…' : 'Save changes'}
            </button>
            {saved && (
              <span style={{ fontFamily: "'Space Mono', monospace", fontSize: 12, color: 'var(--green)', fontWeight: 700 }}>✓ Saved</span>
            )}
          </div>
        </div>
      </div>
      <div className="k-card" style={{ padding: 26 }}>
        <h3 className="k-h" style={{ fontWeight: 600, fontSize: 17, margin: '0 0 6px' }}>Appearance</h3>
        <div style={{ fontSize: 13, color: 'var(--ink-3)', marginBottom: 20 }}>
          Choose the font for the admin panel and public website. Changes apply instantly.
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <label className="k-label">Panel font</label>
          <select className="k-input" value={settings.font} onChange={(e) => changeFont(e.target.value)}>
            {FONT_OPTIONS.map((f) => (
              <option key={f.name} value={f.name}>
                {f.name}
              </option>
            ))}
          </select>
          <div
            style={{
              marginTop: 14,
              padding: '18px 20px',
              border: '1px solid var(--border)',
              borderRadius: 8,
              background: 'var(--bg)',
              fontFamily: fontStack(settings.font),
            }}
          >
            <div style={{ fontSize: 22, fontWeight: 700, marginBottom: 4 }}>The quick brown fox</div>
            <div style={{ fontSize: 14, color: 'var(--ink-2)' }}>
              1234567890 — jumps over the lazy dog. Preview of “{settings.font}”.
            </div>
          </div>
        </div>
      </div>
      <div className="k-card" style={{ padding: 26 }}>
        <h3 className="k-h" style={{ fontWeight: 600, fontSize: 17, margin: '0 0 6px' }}>Preferences</h3>
        {prefMeta.map((p) => (
          <div
            key={p.key}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '15px 0',
              borderBottom: '1px solid rgba(23,21,58,.07)',
            }}
          >
            <div>
              <div style={{ fontSize: 14.5, fontWeight: 700 }}>{p.t}</div>
              <div style={{ fontSize: 13, color: 'var(--ink-3)' }}>{p.d}</div>
            </div>
            <Toggle on={settings[p.key]} onChange={(v) => void save({ [p.key]: v })} />
          </div>
        ))}
      </div>
    </div>
  );
}
