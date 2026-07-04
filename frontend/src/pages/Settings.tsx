import { useState, type FormEvent } from 'react';
import { api, errorMessage } from '../api';
import { useAuth } from '../AuthContext';

export default function Settings() {
  const { user } = useAuth();
  const [profile, setProfile] = useState({ name: user?.name ?? '', email: user?.email ?? '' });
  const [pw, setPw] = useState({ current_password: '', password: '', password_confirmation: '' });
  const [profileMsg, setProfileMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [pwMsg, setPwMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [busy, setBusy] = useState(false);

  const saveProfile = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setProfileMsg(null);
    try {
      await api.put('/profile', profile);
      setProfileMsg({ ok: true, text: 'Profile updated. Refresh to see changes everywhere.' });
    } catch (err) {
      setProfileMsg({ ok: false, text: errorMessage(err) });
    } finally {
      setBusy(false);
    }
  };

  const savePassword = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setPwMsg(null);
    try {
      await api.put('/profile/password', pw);
      setPwMsg({ ok: true, text: 'Password changed successfully.' });
      setPw({ current_password: '', password: '', password_confirmation: '' });
    } catch (err) {
      setPwMsg({ ok: false, text: errorMessage(err) });
    } finally {
      setBusy(false);
    }
  };

  const msgStyle = (ok: boolean) => ({
    background: ok ? 'var(--success-soft)' : 'var(--danger-soft)',
    color: ok ? 'var(--success)' : 'var(--danger)',
    borderRadius: 9,
    padding: '10px 14px',
    fontSize: 13,
    marginBottom: 14,
  });

  return (
    <div className="settings-grid">
      <div className="card panel">
        <div className="panel-title">Profile</div>
        {profileMsg && <div style={msgStyle(profileMsg.ok)}>{profileMsg.text}</div>}
        <form onSubmit={(e) => void saveProfile(e)}>
          <div className="field" style={{ marginBottom: 14 }}>
            <label>Name</label>
            <input value={profile.name} onChange={(e) => setProfile({ ...profile, name: e.target.value })} required />
          </div>
          <div className="field" style={{ marginBottom: 18 }}>
            <label>Email</label>
            <input type="email" value={profile.email} onChange={(e) => setProfile({ ...profile, email: e.target.value })} required />
          </div>
          <button className="btn btn-primary" disabled={busy}>
            Save Profile
          </button>
        </form>
      </div>

      <div className="card panel">
        <div className="panel-title">Change Password</div>
        {pwMsg && <div style={msgStyle(pwMsg.ok)}>{pwMsg.text}</div>}
        <form onSubmit={(e) => void savePassword(e)}>
          <div className="field" style={{ marginBottom: 14 }}>
            <label>Current Password</label>
            <input type="password" value={pw.current_password} onChange={(e) => setPw({ ...pw, current_password: e.target.value })} required />
          </div>
          <div className="field" style={{ marginBottom: 14 }}>
            <label>New Password</label>
            <input type="password" value={pw.password} onChange={(e) => setPw({ ...pw, password: e.target.value })} required minLength={8} />
          </div>
          <div className="field" style={{ marginBottom: 18 }}>
            <label>Confirm New Password</label>
            <input type="password" value={pw.password_confirmation} onChange={(e) => setPw({ ...pw, password_confirmation: e.target.value })} required minLength={8} />
          </div>
          <button className="btn btn-primary" disabled={busy}>
            Change Password
          </button>
        </form>
      </div>
    </div>
  );
}
