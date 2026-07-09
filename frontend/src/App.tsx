import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './AuthContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Projects from './pages/Projects';
import Categories from './pages/Categories';
import Inquiries from './pages/Inquiries';
import Users from './pages/Users';
import Settings from './pages/Settings';
import SettingsProfile from './pages/settings/SettingsProfile';
import SettingsMedia from './pages/settings/SettingsMedia';
import SettingsHero from './pages/settings/SettingsHero';
import SettingsSocials from './pages/settings/SettingsSocials';
import SettingsMarketing from './pages/settings/SettingsMarketing';

function Protected() {
  const { user, loading } = useAuth();
  if (loading) return <div style={{ padding: 40, color: 'var(--ink-3)' }}>Loading…</div>;
  if (!user) return <Navigate to="/admin/login" replace />;
  return <Layout />;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public website (/, /work) now lives in the separate Next.js app in
              ../web. This Vite app is the admin panel only. */}
          <Route path="/admin/login" element={<Login />} />
          <Route element={<Protected />}>
            <Route path="/admin" element={<Dashboard />} />
            <Route path="/admin/projects" element={<Projects />} />
            <Route path="/admin/categories" element={<Categories />} />
            <Route path="/admin/inquiries" element={<Inquiries />} />
            <Route path="/admin/users" element={<Users />} />
            <Route path="/admin/settings" element={<Settings />}>
              <Route index element={<SettingsProfile />} />
              <Route path="media" element={<SettingsMedia />} />
              <Route path="hero" element={<SettingsHero />} />
              <Route path="socials" element={<SettingsSocials />} />
              <Route path="marketing" element={<SettingsMarketing />} />
            </Route>
          </Route>
          <Route path="*" element={<Navigate to="/admin" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
