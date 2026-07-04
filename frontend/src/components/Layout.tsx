import { NavLink, Outlet, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  FolderKanban,
  Wrench,
  FileText,
  Inbox,
  UserCog,
  Settings,
  LogOut,
} from 'lucide-react';
import { useAuth } from '../AuthContext';

const nav = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, section: 'Overview' },
  { to: '/clients', label: 'Clients', icon: Users, section: 'Manage' },
  { to: '/projects', label: 'Projects', icon: FolderKanban, section: 'Manage' },
  { to: '/services', label: 'Services', icon: Wrench, section: 'Manage' },
  { to: '/invoices', label: 'Invoices', icon: FileText, section: 'Finance' },
  { to: '/leads', label: 'Leads', icon: Inbox, section: 'Growth' },
  { to: '/team', label: 'Team', icon: UserCog, section: 'Admin' },
  { to: '/settings', label: 'Settings', icon: Settings, section: 'Admin' },
];

const titles: Record<string, string> = {
  '/': 'Dashboard',
  '/clients': 'Clients',
  '/projects': 'Projects',
  '/services': 'Services',
  '/invoices': 'Invoices',
  '/leads': 'Leads',
  '/team': 'Team',
  '/settings': 'Settings',
};

export default function Layout() {
  const { user, logout } = useAuth();
  const { pathname } = useLocation();

  let lastSection = '';

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="sidebar-brand">
          <div className="brand-logo">KML</div>
          <div>
            <div className="brand-name">Kasu Media Labs</div>
            <div className="brand-sub">Admin Panel</div>
          </div>
        </div>
        <nav className="sidebar-nav">
          {nav.map((item) => {
            const header = item.section !== lastSection ? <div className="sidebar-section">{item.section}</div> : null;
            lastSection = item.section;
            const Icon = item.icon;
            return (
              <div key={item.to}>
                {header}
                <NavLink to={item.to} end={item.to === '/'} className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}>
                  <Icon size={17} />
                  {item.label}
                </NavLink>
              </div>
            );
          })}
        </nav>
        <div className="sidebar-footer">
          <div className="user-chip">
            <div className="user-avatar">{user?.name?.charAt(0).toUpperCase()}</div>
            <div style={{ flex: 1 }}>
              <div className="user-chip-name">{user?.name}</div>
              <div className="user-chip-role">{user?.role}</div>
            </div>
            <button className="icon-btn" title="Sign out" onClick={() => void logout()} style={{ background: 'transparent', borderColor: '#2b2e55', color: '#9297ad' }}>
              <LogOut size={15} />
            </button>
          </div>
        </div>
      </aside>
      <div className="main">
        <header className="topbar">
          <div className="topbar-title">{titles[pathname] ?? 'KML Admin'}</div>
          <div className="topbar-actions">
            <span style={{ color: 'var(--text-3)', fontSize: 13 }}>
              {new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
            </span>
          </div>
        </header>
        <main className="content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
