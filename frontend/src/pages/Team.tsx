import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { Plus, Search, Pencil, Trash2 } from 'lucide-react';
import { api, errorMessage } from '../api';
import { useAuth } from '../AuthContext';
import type { User } from '../types';
import { Modal, ConfirmDialog, StatusBadge, formatDate } from '../components/ui';

const empty = { name: '', email: '', role: 'staff', password: '' };

export default function Team() {
  const { user: me } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [editing, setEditing] = useState<User | null>(null);
  const [creating, setCreating] = useState(false);
  const [deleting, setDeleting] = useState<User | null>(null);
  const [form, setForm] = useState<Record<string, string>>(empty);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const load = () => {
    void api.get<User[]>('/users').then((res) => {
      setUsers(res.data);
      setLoading(false);
    });
  };
  useEffect(load, []);

  const filtered = useMemo(
    () =>
      users.filter((u) => {
        const q = search.toLowerCase();
        return !q || u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q);
      }),
    [users, search]
  );

  const openCreate = () => {
    setForm(empty);
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

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    const payload: Record<string, string> = { name: form.name, email: form.email, role: form.role };
    if (form.password) payload.password = form.password;
    try {
      if (editing) await api.put(`/users/${editing.id}`, payload);
      else await api.post('/users', { ...payload, password: form.password });
      close();
      load();
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  const doDelete = async () => {
    if (!deleting) return;
    setBusy(true);
    try {
      await api.delete(`/users/${deleting.id}`);
      setDeleting(null);
      load();
    } catch (err) {
      alert(errorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="card table-card">
      <div className="table-toolbar">
        <div className="search-box">
          <Search size={15} />
          <input placeholder="Search team…" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <button className="btn btn-primary" onClick={openCreate}>
          <Plus size={15} /> Add Member
        </button>
      </div>
      {loading ? (
        <div className="page-loading">Loading…</div>
      ) : (
        <table className="data-table">
          <thead>
            <tr>
              <th>Member</th>
              <th>Email</th>
              <th>Role</th>
              <th>Joined</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((u) => (
              <tr key={u.id}>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div className="user-avatar" style={{ width: 30, height: 30, fontSize: 12 }}>
                      {u.name.charAt(0).toUpperCase()}
                    </div>
                    <span className="cell-main">
                      {u.name}
                      {u.id === me?.id && <span style={{ color: 'var(--text-3)', fontWeight: 400 }}> (you)</span>}
                    </span>
                  </div>
                </td>
                <td>{u.email}</td>
                <td>
                  <StatusBadge value={u.role} />
                </td>
                <td>{formatDate(u.created_at)}</td>
                <td>
                  <div className="row-actions">
                    <button className="icon-btn" onClick={() => openEdit(u)} title="Edit">
                      <Pencil size={14} />
                    </button>
                    {u.id !== me?.id && (
                      <button className="icon-btn danger" onClick={() => setDeleting(u)} title="Delete">
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {(creating || editing) && (
        <Modal
          title={editing ? 'Edit Member' : 'Add Member'}
          onClose={close}
          footer={
            <>
              <button className="btn btn-secondary" onClick={close}>
                Cancel
              </button>
              <button className="btn btn-primary" form="user-form" disabled={busy}>
                {busy ? 'Saving…' : 'Save Member'}
              </button>
            </>
          }
        >
          {error && <div className="form-error">{error}</div>}
          <form id="user-form" onSubmit={(e) => void submit(e)} className="form-grid">
            <div className="field">
              <label>Name *</label>
              <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            </div>
            <div className="field">
              <label>Email *</label>
              <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
            </div>
            <div className="field">
              <label>Role</label>
              <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
                <option value="admin">Admin</option>
                <option value="manager">Manager</option>
                <option value="staff">Staff</option>
              </select>
            </div>
            <div className="field">
              <label>{editing ? 'New Password (blank = keep)' : 'Password *'}</label>
              <input
                type="password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                required={!editing}
                minLength={8}
                placeholder={editing ? '••••••••' : 'Min 8 characters'}
              />
            </div>
          </form>
        </Modal>
      )}

      {deleting && (
        <ConfirmDialog
          title="Remove member"
          message={`Remove "${deleting.name}" from the team?`}
          onConfirm={() => void doDelete()}
          onCancel={() => setDeleting(null)}
          busy={busy}
        />
      )}
    </div>
  );
}
