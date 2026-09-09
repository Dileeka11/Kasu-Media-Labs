import { useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import { errorMessage } from '../api';
import { KLogo, ErrorBox } from '../components/ui';
import { useIsMobile } from '../useMediaQuery';

export default function Login() {
  const isMobile = useIsMobile();
  const { user, login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  if (user) return <Navigate to="/admin" replace />;

  const signIn = async () => {
    if (!email.trim() || !password) {
      setError('Enter your email and password to continue.');
      return;
    }
    setBusy(true);
    setError('');
    try {
      await login(email, password);
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'grid',
        placeItems: 'center',
        padding: isMobile ? 16 : 32,
        background:
          'radial-gradient(1200px 600px at 15% 10%,rgba(131,84,201,.16),transparent 60%),radial-gradient(900px 500px at 90% 90%,rgba(43,57,184,.14),transparent 55%),#F5F4FA',
      }}
    >
      <div
        style={{
          width: 'min(940px,100%)',
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
          background: '#fff',
          border: '1px solid var(--border)',
          borderRadius: 6,
          overflow: 'hidden',
          boxShadow: '0 30px 90px rgba(23,21,58,.16)',
        }}
      >
        {/* brand panel */}
        <div
          style={{
            position: 'relative',
            padding: isMobile ? '32px 26px' : '48px 40px',
            background: 'var(--grad-steep)',
            color: '#fff',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            gap: isMobile ? 24 : 0,
            minHeight: isMobile ? 0 : 520,
          }}
        >
          <div
            style={{
              position: 'absolute',
              top: -60,
              right: -60,
              width: 220,
              height: 220,
              borderRadius: '50%',
              background: 'rgba(255,255,255,.12)',
              animation: 'kadfloat 6s ease-in-out infinite',
            }}
          />
          <div style={{ display: 'flex', alignItems: 'center', gap: 11, position: 'relative' }}>
            <KLogo size={28} />
            <div style={{ lineHeight: 1 }}>
              <div style={{ fontFamily: 'var(--ui-font)', fontWeight: 700, fontSize: 19 }}>kml</div>
              <div style={{ fontSize: 8, letterSpacing: 3, opacity: 0.85, textTransform: 'uppercase' }}>Production</div>
            </div>
          </div>
          <div style={{ position: 'relative' }}>
            <div className="k-mono" style={{ fontSize: 11.5, letterSpacing: 2, color: '#fff', opacity: 0.85, marginBottom: 18 }}>
              Content Management
            </div>
            <h1 className="k-h" style={{ fontSize: isMobile ? 28 : 38, lineHeight: 1.02, letterSpacing: -1.4 }}>Manage every frame of your studio.</h1>
            <p style={{ fontSize: 15, lineHeight: 1.6, opacity: 0.9, margin: '20px 0 0', maxWidth: 320 }}>
              Upload projects, films and virtual tours, respond to inquiries, and publish to the live site.
            </p>
          </div>
          <div className="k-mono" style={{ position: 'relative', letterSpacing: 1.5, color: '#fff', opacity: 0.75 }}>
            ● Secure admin — v2.6
          </div>
        </div>

        {/* form panel */}
        <div style={{ padding: isMobile ? '32px 24px' : '48px 44px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <h2 className="k-h" style={{ fontSize: 26, letterSpacing: -0.6, marginBottom: 6 }}>Sign in</h2>
          <p style={{ fontSize: 14, color: 'var(--ink-2)', margin: '0 0 30px' }}>Welcome back. Enter your credentials to continue.</p>

          <label className="k-label" style={{ marginBottom: 9 }}>Email</label>
          <input
            className="k-input"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setError('');
            }}
            placeholder="you@kmlproduction.com"
            style={{ padding: '13px 15px', fontSize: 14.5, marginBottom: 20, borderColor: 'rgba(23,21,58,.16)' }}
          />

          <label className="k-label" style={{ marginBottom: 9 }}>Password</label>
          <div style={{ position: 'relative', marginBottom: 14 }}>
            <input
              className="k-input"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError('');
              }}
              onKeyDown={(e) => e.key === 'Enter' && void signIn()}
              placeholder="••••••••"
              style={{ padding: '13px 46px 13px 15px', fontSize: 14.5, borderColor: 'rgba(23,21,58,.16)', width: '100%', boxSizing: 'border-box', marginBottom: 0 }}
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              title={showPassword ? 'Hide password' : 'Show password'}
              style={{
                position: 'absolute',
                right: 13,
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: 4,
                display: 'flex',
                alignItems: 'center',
                color: 'var(--ink-3)',
                opacity: 0.6,
                transition: 'opacity .15s',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.opacity = '1')}
              onMouseLeave={(e) => (e.currentTarget.style.opacity = '0.6')}
            >
              {showPassword ? (
                /* Eye-off icon */
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                  <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                  <line x1="1" y1="1" x2="23" y2="23" />
                </svg>
              ) : (
                /* Eye icon */
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
              )}
            </button>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 26 }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--ink-2)', cursor: 'pointer' }}>
              <input type="checkbox" style={{ accentColor: '#8354C9', width: 15, height: 15 }} /> Remember me
            </label>
            <a href="#" style={{ fontSize: 13, color: '#8354C9', textDecoration: 'none', fontWeight: 600 }}>
              Forgot password?
            </a>
          </div>

          {error && <ErrorBox style={{ marginBottom: 16 }}>{error}</ErrorBox>}

          <button
            onClick={() => void signIn()}
            disabled={busy}
            className="k-btn-grad"
            style={{ padding: 15, fontSize: 13, letterSpacing: 1.5 }}
          >
            {busy ? 'Signing in…' : 'Sign in →'}
          </button>

          <div
            style={{
              marginTop: 22,
              padding: '12px 14px',
              background: 'var(--bg)',
              border: '1px dashed rgba(23,21,58,.2)',
              borderRadius: 4,
              fontFamily: 'var(--ui-font)',
              fontSize: 11.5,
              color: 'var(--ink-3)',
              lineHeight: 1.6,
            }}
          >
            DEMO — email: <span style={{ color: 'var(--ink)' }}>admin@kml</span> · password: <span style={{ color: 'var(--ink)' }}>kml</span>
          </div>

          <Link
            to="/"
            className="k-mono"
            style={{ marginTop: 20, textAlign: 'center', fontSize: 11.5, letterSpacing: 1, textDecoration: 'none' }}
          >
            ← Back to website
          </Link>
        </div>
      </div>
    </div>
  );
}
