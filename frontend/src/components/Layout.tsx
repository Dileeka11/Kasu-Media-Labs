import { useCallback, useEffect, useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { api } from '../api';
import { useAuth } from '../AuthContext';
import type { Inquiry, Project, Settings } from '../types';
import { KLogo, initials } from './ui';
import { ProjectModal } from './ProjectModal';
import { applyFont } from '../font';

const nav = [
  { to: '/admin', label: 'Dashboard', g: '▦' },
  { to: '/admin/projects', label: 'Projects', g: '▶' },
  { to: '/admin/categories', label: 'Categories', g: '❏' },
  { to: '/admin/inquiries', label: 'Inquiries', g: '✉' },
  { to: '/admin/users', label: 'Users & Roles', g: '◍' },
  { to: '/admin/settings', label: 'Settings', g: '⚙' },
];

const titles: Record<string, string> = {
  '/admin': 'Dashboard',
  '/admin/projects': 'Projects',
  '/admin/categories': 'Categories & Tags',
  '/admin/inquiries': 'Inquiries',
  '/admin/users': 'Users & Roles',
  '/admin/settings': 'Settings',
};

export interface LayoutCtx {
  search: string;
  refreshBadge: () => void;
  openEditProject: (p: Project) => void;
}

export default function Layout() {
  const { user, logout } = useAuth();
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [unread, setUnread] = useState(0);
  const [modalProject, setModalProject] = useState<Project | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const refreshBadge = useCallback(() => {
    void api.get<Inquiry[]>('/inquiries').then((res) => setUnread(res.data.filter((q) => q.unread).length));
  }, []);

  useEffect(refreshBadge, [refreshBadge]);
  useEffect(() => setSearch(''), [pathname]);

  // Apply the studio's saved font across the panel on load.
  useEffect(() => {
    void api.get<Settings>('/settings').then((res) => applyFont(res.data.font));
  }, []);

  const openEditProject = useCallback((p: Project) => {
    setModalProject(p);
    setModalOpen(true);
  }, []);

  const ctx: LayoutCtx = { search, refreshBadge, openEditProject };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg)' }}>
      {/* SIDEBAR */}
      <aside
        style={{
          width: 258,
          flex: 'none',
          borderRight: '1px solid var(--border)',
          padding: '26px 14px 26px 0',
          display: 'flex',
          flexDirection: 'column',
          position: 'sticky',
          top: 0,
          height: '100vh',
          background: 'var(--sidebar)',
        }}
      >
        <a
          href="/"
          title="Back to live site"
          style={{ display: 'flex', alignItems: 'center', gap: 11, padding: '0 0 26px 22px', textDecoration: 'none', color: 'inherit' }}
        >
          <KLogo gradient size={26} />
          <div style={{ lineHeight: 1 }}>
            <div style={{ fontFamily: "'Space Grotesk'", fontWeight: 700, fontSize: 17 }}>kml</div>
            <div style={{ fontSize: 8, letterSpacing: 3, color: 'var(--ink-2)', textTransform: 'uppercase' }}>Admin</div>
          </div>
        </a>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4, flex: 1, paddingLeft: 8 }}>
          {nav.map((n) => (
            <button
              key={n.to}
              className={`k-nav-btn${pathname === n.to ? ' active' : ''}`}
              onClick={() => void navigate(n.to)}
            >
              <span style={{ width: 20, textAlign: 'center', fontSize: 15 }}>{n.g}</span>
              <span style={{ flex: 1 }}>{n.label}</span>
              {n.to === '/admin/inquiries' && unread > 0 && (
                <span
                  style={{
                    minWidth: 20,
                    height: 20,
                    padding: '0 6px',
                    display: 'grid',
                    placeItems: 'center',
                    borderRadius: 100,
                    background: '#E86FA6',
                    color: '#fff',
                    fontSize: 11,
                    fontWeight: 800,
                  }}
                >
                  {unread}
                </span>
              )}
            </button>
          ))}
        </div>
        <div style={{ padding: '14px 12px 0 22px', borderTop: '1px solid rgba(23,21,58,.1)', display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: '50%',
                background: 'var(--grad-av)',
                display: 'grid',
                placeItems: 'center',
                fontSize: 13,
                fontWeight: 800,
                color: '#fff',
              }}
            >
              {user ? initials(user.name) : ''}
            </div>
            <div style={{ flex: 1, lineHeight: 1.3 }}>
              <div style={{ fontSize: 14, fontWeight: 700 }}>{user?.name}</div>
              <div style={{ fontSize: 12, color: 'var(--ink-3)', textTransform: 'capitalize' }}>{user?.role}</div>
            </div>
          </div>
          <button
            onClick={() => void logout()}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: '10px 12px',
              background: 'transparent',
              border: '1px solid rgba(23,21,58,.16)',
              borderRadius: 8,
              color: 'var(--ink-2)',
              fontFamily: "'Space Mono', monospace",
              fontSize: 11.5,
              letterSpacing: 1,
              textTransform: 'uppercase',
            }}
          >
            ⎋ Sign out
          </button>
        </div>
      </aside>

      {/* MAIN */}
      <main style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
        <header
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 20,
            padding: '20px 34px',
            borderBottom: '1px solid var(--border)',
            position: 'sticky',
            top: 0,
            background: 'rgba(245,244,250,.92)',
            backdropFilter: 'blur(12px)',
            zIndex: 20,
          }}
        >
          <div>
            <div className="k-mono" style={{ marginBottom: 4 }}>KML Production / CMS</div>
            <h1 className="k-h" style={{ fontSize: 25, letterSpacing: -0.5 }}>{titles[pathname] ?? 'Dashboard'}</h1>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 9,
                width: 230,
                padding: '11px 14px',
                background: '#fff',
                border: '1px solid rgba(23,21,58,.14)',
                color: 'var(--ink-3)',
                fontSize: 13.5,
                borderRadius: 4,
              }}
            >
              <span>⌕</span>
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search…"
                style={{ border: 'none', outline: 'none', background: 'transparent', flex: 1, fontSize: 13.5, color: 'var(--ink)', padding: 0 }}
              />
            </div>
            <button
              className="k-btn-grad"
              style={{ padding: '12px 18px' }}
              onClick={() => {
                setModalProject(null);
                setModalOpen(true);
              }}
            >
              <span style={{ fontSize: 15, lineHeight: 1 }}>+</span>New Project
            </button>
          </div>
        </header>

        <div style={{ padding: '32px 34px', flex: 1 }}>
          <Outlet context={ctx} />
        </div>
      </main>

      {modalOpen && (
        <ProjectModal
          project={modalProject}
          onClose={() => setModalOpen(false)}
          onSaved={() => window.dispatchEvent(new Event('kml:projects-changed'))}
        />
      )}
    </div>
  );
}
