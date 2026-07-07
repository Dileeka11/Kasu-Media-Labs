import { useEffect, useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { api, errorMessage } from '../api';
import type { Settings as SettingsData } from '../types';
import { ErrorBox } from '../components/ui';
import { applyFont } from '../font';
import { useIsMobile } from '../useMediaQuery';

export default function Settings() {
  const isMobile = useIsMobile();
  const { pathname } = useLocation();
  const navigate = useNavigate();

  const [settings, setSettings] = useState<SettingsData | null>(null);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);
  const [busy, setBusy] = useState(false);

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

  const setLocal = (patch: Partial<SettingsData>) => setSettings((c) => (c ? { ...c, ...patch } : c));

  const tabs = [
    { path: '/admin/settings', label: 'Profile & General', exact: true },
    { path: '/admin/settings/media', label: 'Brand & Media' },
    { path: '/admin/settings/hero', label: 'Hero & Ticker' },
    { path: '/admin/settings/socials', label: 'Social Links' },
    { path: '/admin/settings/marketing', label: 'Marketing & Proof' },
  ];

  const getTabStyle = (isActive: boolean) => ({
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    padding: '12px 16px',
    cursor: 'pointer',
    fontSize: 13.5,
    textAlign: 'left' as const,
    border: 'none',
    fontFamily: 'var(--ui-font)',
    borderRadius: isMobile ? '8px 8px 0 0' : '0 8px 8px 0',
    whiteSpace: 'nowrap' as const,
    transition: 'all 0.2s ease',
    ...(isActive
      ? {
          color: 'var(--ink)',
          background: '#fff',
          boxShadow: isMobile
            ? 'inset 0 -3px 0 var(--purple), 0 1px 4px rgba(23, 21, 58, 0.08)'
            : 'inset 3px 0 0 var(--purple), 0 1px 4px rgba(23, 21, 58, 0.08)',
          fontWeight: '700',
        }
      : {
          color: 'var(--ink-2)',
          background: 'transparent',
          fontWeight: '600',
        }),
  });

  const contextValue = {
    settings,
    saved,
    busy,
    mediaPct,
    clientPct,
    save,
    saveWith,
    uploadMedia,
    clearMedia,
    uploadClientLogo,
    changeFont,
    setLocal,
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 940 }}>
      {error && <ErrorBox>{error}</ErrorBox>}

      <div
        style={{
          display: 'flex',
          flexDirection: isMobile ? 'column' : 'row',
          gap: isMobile ? 20 : 32,
          alignItems: 'flex-start',
        }}
      >
        {/* SETTINGS SIDEBAR NAV */}
        <div
          style={{
            width: isMobile ? '100%' : 220,
            display: 'flex',
            flexDirection: isMobile ? 'row' : 'column',
            gap: 4,
            flexShrink: 0,
            overflowX: isMobile ? 'auto' : 'visible',
            paddingBottom: isMobile ? 8 : 0,
            borderBottom: isMobile ? '1px solid var(--border)' : 'none',
            WebkitOverflowScrolling: 'touch',
          }}
          className="kadmin-scroll"
        >
          {tabs.map((tab) => {
            const isActive = tab.exact ? pathname === tab.path : pathname.startsWith(tab.path);
            return (
              <button
                key={tab.path}
                style={getTabStyle(isActive)}
                onClick={() => navigate(tab.path)}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* ACTIVE SUBPAGE */}
        <div style={{ flex: 1, width: '100%', maxWidth: 680 }}>
          <Outlet context={contextValue} />
        </div>
      </div>
    </div>
  );
}
