import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './AuthContext';
import Layout from './components/Layout';
import Site from './pages/Site';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Projects from './pages/Projects';
import Categories from './pages/Categories';
import Inquiries from './pages/Inquiries';
import Users from './pages/Users';
import Settings from './pages/Settings';

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
          <Route path="/" element={<Site />} />
          <Route path="/admin/login" element={<Login />} />
          <Route element={<Protected />}>
            <Route path="/admin" element={<Dashboard />} />
            <Route path="/admin/projects" element={<Projects />} />
            <Route path="/admin/categories" element={<Categories />} />
            <Route path="/admin/inquiries" element={<Inquiries />} />
            <Route path="/admin/users" element={<Users />} />
            <Route path="/admin/settings" element={<Settings />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
