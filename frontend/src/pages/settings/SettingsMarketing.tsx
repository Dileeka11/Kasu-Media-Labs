import { useOutletContext } from 'react-router-dom';
import type { Settings as SettingsData, Stat, ClientItem, Testimonial } from '../../types';
import { ProgressBar } from '../../components/ui';
import { useIsMobile } from '../../useMediaQuery';

interface SettingsContext {
  settings: SettingsData;
  saved: boolean;
  busy: boolean;
  clientPct: Record<number, number>;
  saveWith: (patch: Partial<SettingsData>) => Promise<void>;
  uploadClientLogo: (index: number, file: File) => Promise<void>;
  setLocal: (patch: Partial<SettingsData>) => void;
}

const cardStyle = { padding: 26 } as const;
const h3Style = { fontWeight: 600, fontSize: 17, margin: '0 0 6px' } as const;

export default function SettingsMarketing() {
  const { settings: s, saved, busy, clientPct, saveWith, uploadClientLogo, setLocal } = useOutletContext<SettingsContext>();
  const isMobile = useIsMobile();

  const stats = s.stats ?? [];
  const clients = s.clients ?? [];
  const testimonials = s.testimonials ?? [];

  const savedTag = saved && (
    <span style={{ fontFamily: 'var(--ui-font)', fontSize: 12, color: 'var(--green)', fontWeight: 700 }}>✓ Saved</span>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
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
              <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 10 }}>
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
    </div>
  );
}
