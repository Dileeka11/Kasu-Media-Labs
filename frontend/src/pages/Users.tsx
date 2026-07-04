import { useEffect, useMemo, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { api, errorMessage } from '../api';
import { useAuth } from '../AuthContext';
import type { Role, User } from '../types';
import type { LayoutCtx } from '../components/Layout';
import { Modal, ErrorBox, RolePill, roleColors, initials, relTime } from '../components/ui';

const cols = '2fr 1fr 1fr .7fr';
const emptyForm = { name: '', email: '', role: 'viewer' as Role, password: '' };

export default function Users() {
  const { search } = useOutletContext<LayoutCtx>();
  const { user: me } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [editing, setEditing] = useState<User | null>(null);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const load = () => {
    void api.get<User[]>('/users').then((res) => setUsers(res.data));
  };
  useEffect(load, []);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return users.filter((u) => !q || u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q) || u.role.includes(q));
  }, [users, search]);

  const openCreate = () => {
    setForm(emptyForm);
    setError('');
    setCreating(true);
  };

  const openEdit = (u: User) => {
    setForm({ name: u.name, email: u.email, role: u.role, password: '' });
    setError('');
    setEditing(u);
  };

  const close = () => {
    setCreating(false);
    setEditing(null);
  };

  const save = async () => {
    setBusy(true);
    setError('');
    const payload: Record<string, string> = { name: form.name, email: form.email, role: form.role };
    if (form.password) payload.password = form.password;
    try {
      if (editing) await api.put(`/users/${editing.id}`, payload);
      else await api.post('/users', payload);
      close();
      load();
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  const remove = async () => {
    if (!editing) return;
    setBusy(true);
    setError('');
    try {
      await api.delete(`/users/${editing.id}`);
      close();
      load();
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <div className="k-card" style={{ overflow: 'hidden' }}>
        <div
          className="k-mono"
          style={{ display: 'grid', gridTemplateColumns: cols, gap: 16, padding: '14px 22px', borderBottom: '1px solid var(--border)' }}
        >
          <div>Member</div>
          <div>Role</div>
          <div>Last active</div>
          <div style={{ textAlign: 'right' }}>Actions</div>
        </div>
        {filtered.map((u) => (
          <div
            key={u.id}
            style={{
              display: 'grid',
              gridTemplateColumns: cols,
              gap: 16,
              padding: '15px 22px',
              borderBottom: '1px solid rgba(23,21,58,.07)',
              alignItems: 'center',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 13 }}>
              <div
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: '50%',
                  background: roleColors[u.role],
                  display: 'grid',
                  placeItems: 'center',
                  fontWeight: 800,
                  fontSize: 13,
                  color: '#fff',
                }}
              >
                {initials(u.name)}
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: 14.5 }}>{u.name}</div>
                <div style={{ fontSize: 12.5, color: 'var(--ink-3)' }}>{u.email}</div>
              </div>
            </div>
            <div>
              <RolePill role={u.role} />
            </div>
            <div style={{ fontSize: 13.5, color: 'var(--ink-2)' }}>{u.id === me?.id ? 'Online now' : relTime(u.last_active_at)}</div>
            <div style={{ textAlign: 'right' }}>
              <button className="k-icon-btn" onClick={() => openEdit(u)} title="Manage">
                ⋯
              </button>
            </div>
          </div>
        ))}
      </div>

      <div
        onClick={openCreate}
        style={{
          marginTop: 16,
          border: '1.5px dashed rgba(23,21,58,.28)',
          borderRadius: 6,
          padding: 18,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 9,
          color: 'var(--ink-2)',
          cursor: 'pointer',
          fontWeight: 700,
          fontSize: 14.5,
        }}
      >
        <span style={{ fontSize: 18 }}>+</span>Invite member
      </div>

      {(creating || editing) && (
        <Modal
          title={editing ? 'Manage Member' : 'Invite Member'}
          onClose={close}
          width={460}
          footer={
            <>
              {editing && editing.id !== me?.id && (
                <button
                  className="k-btn-outline"
                  style={{ marginRight: 'auto', color: 'var(--red)', borderColor: 'rgba(194,74,110,.4)' }}
                  onClick={() => void remove()}
                  disabled={busy}
                >
                  Remove
                </button>
              )}
              <button className="k-btn-outline" onClick={close}>
                Cancel
              </button>
              <button className="k-btn-grad" onClick={() => void save()} disabled={busy}>
                {busy ? 'Saving…' : editing ? 'Save' : 'Invite'}
              </button>
            </>
          }
        >
          {error && <ErrorBox>{error}</ErrorBox>}
          <div>
            <label className="k-label">Name</label>
            <input className="k-input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </div>
          <div>
            <label className="k-label">Email</label>
            <input className="k-input" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <div>
              <label className="k-label">Role</label>
              <select className="k-input" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value as Role })}>
                <option value="owner">Owner</option>
                <option value="editor">Editor</option>
                <option value="producer">Producer</option>
                <option value="viewer">Viewer</option>
              </select>
            </div>
            <div>
              <label className="k-label">{editing ? 'New password' : 'Password'}</label>
              <input
                className="k-input"
                type="password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                placeholder={editing ? 'Keep current' : '••••••'}
              />
            </div>
          </div>
        </Modal>
      )}
    </>
  );
}
