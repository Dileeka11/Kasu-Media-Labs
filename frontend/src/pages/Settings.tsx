import { useEffect, useRef, useState } from 'react';
import { api, errorMessage } from '../api';
import type { Settings as SettingsData, Stat, ClientItem, Testimonial } from '../types';
import { Toggle, ErrorBox, ProgressBar } from '../components/ui';
import { FONT_OPTIONS, applyFont, fontStack } from '../font';

const prefMeta: { key: keyof Pick<SettingsData, 'email_on_inquiries' | 'auto_publish' | 'show_drafts'>; t: string; d: string }[] = [
  { key: 'email_on_inquiries', t: 'Email me on new inquiries', d: 'Get notified the moment a lead comes in' },
  { key: 'auto_publish', t: 'Auto-publish scheduled projects', d: 'Release projects at their scheduled time' },
  { key: 'show_drafts', t: 'Show drafts on public site', d: 'Preview unpublished work publicly' },
];

const socialMeta: { key: 'instagram' | 'youtube' | 'vimeo' | 'linkedin'; label: string; ph: string }[] = [
  { key: 'instagram', label: 'Instagram', ph: 'https://instagram.com/…' },
  { key: 'youtube', label: 'YouTube', ph: 'https://youtube.com/@…' },
  { key: 'vimeo', label: 'Vimeo', ph: 'https://vimeo.com/…' },
  { key: 'linkedin', label: 'LinkedIn', ph: 'https://linkedin.com/company/…' },
];

const cardStyle = { padding: 26 } as const;
const h3Style = { fontWeight: 600, fontSize: 17, margin: '0 0 6px' } as const;

export default function Settings() {
  const [settings, setSettings] = useState<SettingsData | null>(null);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);
  const [busy, setBusy] = useState(false);
  const logoInput = useRef<HTMLInputElement>(null);
  const videoInput = useRef<HTMLInputElement>(null);
  // Live upload progress (0–100). `mediaPct` keys on the media field; `clientPct`
  // keys on the client row index. A key is present only while that upload runs.
  const [mediaPct, setMediaPct] = useState<Partial<Record<'logo' | 'hero_video', number>>>({});
  const [clientPct, setClientPct] = useState<Record<number, number>>({});

  useEffect(() => {
    void api.get<SettingsData>('/settings').then((res) => {
      setSettings(res.data);
      applyFont(res.data.font);
    });
  }, []);

  if (!settings) return <div style={{ padding: 40, color: 'var(--ink-3)' }}>Loading…</div>;
  const s = settings;

  const flashSaved = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  // Save only the fields that changed, so one control can never be blocked by
  // an unrelated field being temporarily invalid.
  const save = async (patch: Partial<SettingsData>) => {
    setSettings((cur) => (cur ? { ...cur, ...patch } : cur));
    setError('');
    setSaved(false);
    try {
      await api.put('/settings', patch);
      flashSaved();
    } catch (err) {
      setError(errorMessage(err));
    }
  };

  const saveWith = async (patch: Partial<SettingsData>) => {
    setBusy(true);
    await save(patch);
    setBusy(false);
  };

  const uploadMedia = async (field: 'logo' | 'hero_video', file: File) => {
    const fd = new FormData();
    fd.append(field, file);
    setError('');
    setMediaPct((p) => ({ ...p, [field]: 0 }));
    try {
      const res = await api.post<SettingsData>('/settings/media', fd, {
        onUploadProgress: (e) =>
          setMediaPct((p) => ({ ...p, [field]: e.total ? (e.loaded / e.total) * 100 : (p[field] ?? 0) })),
      });
      setSettings(res.data);
      flashSaved();
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setMediaPct(({ [field]: _drop, ...rest }) => rest);
    }
  };

  const clearMedia = async (field: 'logo' | 'hero_video') => {
    setError('');
    try {
      const res = await api.post<SettingsData>('/settings/media/clear', { field });
      setSettings(res.data);
      flashSaved();
    } catch (err) {
      setError(errorMessage(err));
    }
  };

  // Upload a brand logo for one client row. Returns the stored URL, which we
  // write onto that client item; the old file (if any) is cleaned up server-side.
  const uploadClientLogo = async (index: number, file: File) => {
    const list = s.clients ?? [];
    const fd = new FormData();
    fd.append('logo', file);
    if (list[index]?.logo) fd.append('old', list[index].logo!);
    setError('');
    setClientPct((p) => ({ ...p, [index]: 0 }));
    try {
      const res = await api.post<{ url: string }>('/settings/client-logo', fd, {
        onUploadProgress: (e) =>
          setClientPct((p) => ({ ...p, [index]: e.total ? (e.loaded / e.total) * 100 : (p[index] ?? 0) })),
      });
      // Persist immediately so the logo sticks on reload — the upload endpoint
      // only stores the file, the URL still has to be saved onto the client row.
      const next = list.map((x, j) => (j === index ? { ...x, logo: res.data.url } : x));
      await save({ clients: next });
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setClientPct(({ [index]: _drop, ...rest }) => rest);
    }
  };

  const changeFont = (font: string) => {
    applyFont(font);
    void save({ font });
  };

  const savedTag = saved && (
    <span style={{ fontFamily: 'var(--ui-font)', fontSize: 12, color: 'var(--green)', fontWeight: 700 }}>✓ Saved</span>
  );

  // ---- list helpers -------------------------------------------------------
  const stats = s.stats ?? [];
  const clients = s.clients ?? [];
  const testimonials = s.testimonials ?? [];

  const setLocal = (patch: Partial<SettingsData>) => setSettings((c) => (c ? { ...c, ...patch } : c));

  return (
    <div style={{ maxWidth: 680, display: 'flex', flexDirection: 'column', gap: 16 }}>
      {error && <ErrorBox>{error}</ErrorBox>}

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

      {/* CONTACT */}
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

      {/* STATS */}
      <div className="k-card" style={cardStyle}>
        <h3 className="k-h" style={h3Style}>Stats</h3>
        <div style={{ fontSize: 13, color: 'var(--ink-3)', marginBottom: 18 }}>The numbers shown in the About section (e.g. 250+ Projects delivered).</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {stats.map((st, i) => (
            <div key={i} style={{ display: 'grid', gridTemplateColumns: '120px 1fr auto', gap: 10, alignItems: 'center' }}>
              <input className="k-input" placeholder="250+" value={st.value} onChange={(e) => setLocal({ stats: stats.map((x, j) => (j === i ? { ...x, value: e.target.value } : x)) })} />
              <input className="k-input" placeholder="Projects delivered" value={st.label} onChange={(e) => setLocal({ stats: stats.map((x, j) => (j === i ? { ...x, label: e.target.value } : x)) })} />
              <button className="k-btn-outline" onClick={() => setLocal({ stats: stats.filter((_, j) => j !== i) })} style={{ color: 'var(--red)' }}>✕</button>
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 16 }}>
          <button className="k-btn-outline" onClick={() => setLocal({ stats: [...stats, { value: '', label: '' } as Stat] })} disabled={stats.length >= 6}>+ Add stat</button>
          <button className="k-btn-grad" onClick={() => void saveWith({ stats })} disabled={busy}>{busy ? 'Saving…' : 'Save stats'}</button>
          {savedTag}
        </div>
      </div>

      {/* CLIENTS */}
      <div className="k-card" style={cardStyle}>
        <h3 className="k-h" style={h3Style}>Clients</h3>
        <div style={{ fontSize: 13, color: 'var(--ink-3)', marginBottom: 18 }}>Upload a brand logo for each client — it shows in the “Trusted by” slider. If no logo is uploaded, the name is shown as text instead. PNG with a transparent background works best.</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
          {clients.map((c, i) => (
            <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: 8, width: 200, border: '1px solid var(--border)', borderRadius: 8, padding: 12 }}>
              <label
                style={{
                  height: 64,
                  borderRadius: 6,
                  border: '1px dashed var(--border-strong)',
                  background: c.logo ? 'var(--bg)' : 'transparent',
                  display: 'grid',
                  placeItems: 'center',
                  cursor: 'pointer',
                  overflow: 'hidden',
                  position: 'relative',
                }}
                title={c.logo ? 'Replace logo' : 'Upload logo'}
              >
                {c.logo ? (
                  <img src={c.logo} alt={c.name || 'logo'} style={{ maxWidth: '90%', maxHeight: 48, objectFit: 'contain' }} />
                ) : (
                  <span className="k-mono" style={{ fontSize: 10 }}>Upload logo</span>
                )}
                <input type="file" accept="image/*" hidden onChange={(e) => e.target.files?.[0] && void uploadClientLogo(i, e.target.files[0])} />
              </label>
              <ProgressBar value={clientPct[i]} />
              <input className="k-input" placeholder="Client name" value={c.name} onChange={(e) => setLocal({ clients: clients.map((x, j) => (j === i ? { ...x, name: e.target.value } : x)) })} />
              <div style={{ display: 'flex', gap: 8 }}>
                {c.logo && (
                  <button className="k-btn-outline" onClick={() => setLocal({ clients: clients.map((x, j) => (j === i ? { ...x, logo: null } : x)) })} style={{ flex: 1, padding: '6px 8px', fontSize: 11 }}>
                    Remove logo
                  </button>
                )}
                <button className="k-btn-outline" onClick={() => setLocal({ clients: clients.filter((_, j) => j !== i) })} style={{ color: 'var(--red)', padding: '6px 10px', fontSize: 11 }}>
                  ✕ Delete
                </button>
              </div>
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 16 }}>
          <button className="k-btn-outline" onClick={() => setLocal({ clients: [...clients, { name: '' } as ClientItem] })} disabled={clients.length >= 40}>+ Add client</button>
          <button className="k-btn-grad" onClick={() => void saveWith({ clients })} disabled={busy}>{busy ? 'Saving…' : 'Save clients'}</button>
          {savedTag}
        </div>
      </div>

      {/* TESTIMONIALS */}
      <div className="k-card" style={cardStyle}>
        <h3 className="k-h" style={h3Style}>Testimonials</h3>
        <div style={{ fontSize: 13, color: 'var(--ink-3)', marginBottom: 18 }}>Client quotes shown in the testimonials section.</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          {testimonials.map((t, i) => (
            <div key={i} style={{ border: '1px solid var(--border)', borderRadius: 8, padding: 16, position: 'relative' }}>
              <button className="k-btn-outline" onClick={() => setLocal({ testimonials: testimonials.filter((_, j) => j !== i) })} style={{ position: 'absolute', top: 10, right: 10, color: 'var(--red)', padding: '0 10px' }}>✕</button>
              <label className="k-label">Quote</label>
              <textarea className="k-input" value={t.quote} onChange={(e) => setLocal({ testimonials: testimonials.map((x, j) => (j === i ? { ...x, quote: e.target.value } : x)) })} style={{ height: 64, resize: 'vertical', marginBottom: 12 }} />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div>
                  <label className="k-label">Author</label>
                  <input className="k-input" value={t.author} onChange={(e) => setLocal({ testimonials: testimonials.map((x, j) => (j === i ? { ...x, author: e.target.value } : x)) })} />
                </div>
                <div>
                  <label className="k-label">Role / company</label>
                  <input className="k-input" value={t.role} onChange={(e) => setLocal({ testimonials: testimonials.map((x, j) => (j === i ? { ...x, role: e.target.value } : x)) })} />
                </div>
              </div>
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 16 }}>
          <button className="k-btn-outline" onClick={() => setLocal({ testimonials: [...testimonials, { quote: '', author: '', role: '' } as Testimonial] })} disabled={testimonials.length >= 20}>+ Add testimonial</button>
          <button className="k-btn-grad" onClick={() => void saveWith({ testimonials })} disabled={busy}>{busy ? 'Saving…' : 'Save testimonials'}</button>
          {savedTag}
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
