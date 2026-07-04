import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { Plus, Search, Pencil, Trash2 } from 'lucide-react';
import { api, errorMessage } from '../api';
import type { Client } from '../types';
import { Modal, ConfirmDialog, StatusBadge } from '../components/ui';

const empty = { name: '', company: '', email: '', phone: '', status: 'active', notes: '' };

export default function Clients() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [editing, setEditing] = useState<Client | null>(null);
  const [creating, setCreating] = useState(false);
  const [deleting, setDeleting] = useState<Client | null>(null);
  const [form, setForm] = useState<Record<string, string>>(empty);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const load = () => {
    void api.get<Client[]>('/clients').then((res) => {
      setClients(res.data);
      setLoading(false);
    });
  };
  useEffect(load, []);

  const filtered = useMemo(
    () =>
      clients.filter((c) => {
        if (statusFilter !== 'all' && c.status !== statusFilter) return false;
        const q = search.toLowerCase();
        return !q || [c.name, c.company, c.email, c.phone].some((v) => v?.toLowerCase().includes(q));
      }),
    [clients, search, statusFilter]
  );

  const openCreate = () => {
    setForm(empty);
    setError('');
    setCreating(true);
  };

  const openEdit = (c: Client) => {
    setForm({ name: c.name, company: c.company ?? '', email: c.email, phone: c.phone ?? '', status: c.status, notes: c.notes ?? '' });
    setError('');
    setEditing(c);
  };

  const close = () => {
    setCreating(false);
    setEditing(null);
  };

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      if (editing) await api.put(`/clients/${editing.id}`, form);
      else await api.post('/clients', form);
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
      await api.delete(`/clients/${deleting.id}`);
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
        <div className="filters">
          <div className="search-box">
            <Search size={15} />
            <input placeholder="Search clients…" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="all">All statuses</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
        <button className="btn btn-primary" onClick={openCreate}>
          <Plus size={15} /> Add Client
        </button>
      </div>
      {loading ? (
        <div className="page-loading">Loading…</div>
      ) : (
        <table className="data-table">
          <thead>
            <tr>
              <th>Client</th>
              <th>Contact</th>
              <th>Projects</th>
              <th>Status</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr>
                <td colSpan={5}>
                  <div className="empty-state">No clients found.</div>
                </td>
              </tr>
            )}
            {filtered.map((c) => (
              <tr key={c.id}>
                <td>
                  <div className="cell-main">{c.name}</div>
                  <div className="cell-sub">{c.company || '—'}</div>
                </td>
                <td>
                  <div>{c.email}</div>
                  <div className="cell-sub">{c.phone || '—'}</div>
                </td>
                <td>{c.projects_count ?? 0}</td>
                <td>
                  <StatusBadge value={c.status} />
                </td>
                <td>
                  <div className="row-actions">
                    <button className="icon-btn" onClick={() => openEdit(c)} title="Edit">
                      <Pencil size={14} />
                    </button>
                    <button className="icon-btn danger" onClick={() => setDeleting(c)} title="Delete">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {(creating || editing) && (
        <Modal
          title={editing ? 'Edit Client' : 'Add Client'}
          onClose={close}
          footer={
            <>
              <button className="btn btn-secondary" onClick={close}>
                Cancel
              </button>
              <button className="btn btn-primary" form="client-form" disabled={busy}>
                {busy ? 'Saving…' : 'Save Client'}
              </button>
            </>
          }
        >
          {error && <div className="form-error">{error}</div>}
          <form id="client-form" onSubmit={(e) => void submit(e)} className="form-grid">
            <div className="field">
              <label>Name *</label>
              <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            </div>
            <div className="field">
              <label>Company</label>
              <input value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} />
            </div>
            <div className="field">
              <label>Email *</label>
              <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
            </div>
            <div className="field">
              <label>Phone</label>
              <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            </div>
            <div className="field">
              <label>Status</label>
              <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
            <div className="field full">
              <label>Notes</label>
              <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
            </div>
          </form>
        </Modal>
      )}

      {deleting && (
        <ConfirmDialog
          title="Delete client"
          message={`Delete "${deleting.name}"? Their projects and invoices will also be removed.`}
          onConfirm={() => void doDelete()}
          onCancel={() => setDeleting(null)}
          busy={busy}
        />
      )}
    </div>
  );
}
