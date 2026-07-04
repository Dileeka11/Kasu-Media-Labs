import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { Plus, Search, Pencil, Trash2 } from 'lucide-react';
import { api, errorMessage } from '../api';
import type { Lead } from '../types';
import { Modal, ConfirmDialog, StatusBadge, formatDate } from '../components/ui';

const empty = { name: '', email: '', phone: '', source: 'website', service_interest: '', status: 'new', message: '' };

export default function Leads() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [editing, setEditing] = useState<Lead | null>(null);
  const [creating, setCreating] = useState(false);
  const [deleting, setDeleting] = useState<Lead | null>(null);
  const [form, setForm] = useState<Record<string, string>>(empty);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const load = () => {
    void api.get<Lead[]>('/leads').then((res) => {
      setLeads(res.data);
      setLoading(false);
    });
  };
  useEffect(load, []);

  const filtered = useMemo(
    () =>
      leads.filter((l) => {
        if (statusFilter !== 'all' && l.status !== statusFilter) return false;
        const q = search.toLowerCase();
        return !q || [l.name, l.email, l.source, l.service_interest].some((v) => v?.toLowerCase().includes(q));
      }),
    [leads, search, statusFilter]
  );

  const openCreate = () => {
    setForm(empty);
    setError('');
    setCreating(true);
  };

  const openEdit = (l: Lead) => {
    setForm({
      name: l.name,
      email: l.email,
      phone: l.phone ?? '',
      source: l.source,
      service_interest: l.service_interest ?? '',
      status: l.status,
      message: l.message ?? '',
    });
    setError('');
    setEditing(l);
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
      if (editing) await api.put(`/leads/${editing.id}`, form);
      else await api.post('/leads', form);
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
      await api.delete(`/leads/${deleting.id}`);
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
            <input placeholder="Search leads…" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="all">All statuses</option>
            <option value="new">New</option>
            <option value="contacted">Contacted</option>
            <option value="qualified">Qualified</option>
            <option value="converted">Converted</option>
            <option value="lost">Lost</option>
          </select>
        </div>
        <button className="btn btn-primary" onClick={openCreate}>
          <Plus size={15} /> Add Lead
        </button>
      </div>
      {loading ? (
        <div className="page-loading">Loading…</div>
      ) : (
        <table className="data-table">
          <thead>
            <tr>
              <th>Lead</th>
              <th>Contact</th>
              <th>Source</th>
              <th>Interested In</th>
              <th>Received</th>
              <th>Status</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr>
                <td colSpan={7}>
                  <div className="empty-state">No leads found.</div>
                </td>
              </tr>
            )}
            {filtered.map((l) => (
              <tr key={l.id}>
                <td>
                  <div className="cell-main">{l.name}</div>
                </td>
                <td>
                  <div>{l.email}</div>
                  <div className="cell-sub">{l.phone || '—'}</div>
                </td>
                <td style={{ textTransform: 'capitalize' }}>{l.source.replace(/_/g, ' ')}</td>
                <td>{l.service_interest || '—'}</td>
                <td>{formatDate(l.created_at)}</td>
                <td>
                  <StatusBadge value={l.status} />
                </td>
                <td>
                  <div className="row-actions">
                    <button className="icon-btn" onClick={() => openEdit(l)} title="Edit">
                      <Pencil size={14} />
                    </button>
                    <button className="icon-btn danger" onClick={() => setDeleting(l)} title="Delete">
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
          title={editing ? 'Edit Lead' : 'Add Lead'}
          onClose={close}
          footer={
            <>
              <button className="btn btn-secondary" onClick={close}>
                Cancel
              </button>
              <button className="btn btn-primary" form="lead-form" disabled={busy}>
                {busy ? 'Saving…' : 'Save Lead'}
              </button>
            </>
          }
        >
          {error && <div className="form-error">{error}</div>}
          <form id="lead-form" onSubmit={(e) => void submit(e)} className="form-grid">
            <div className="field">
              <label>Name *</label>
              <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
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
              <label>Source</label>
              <select value={form.source} onChange={(e) => setForm({ ...form, source: e.target.value })}>
                <option value="website">Website</option>
                <option value="social_media">Social media</option>
                <option value="referral">Referral</option>
                <option value="whatsapp">WhatsApp</option>
                <option value="phone">Phone</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div className="field">
              <label>Interested Service</label>
              <input value={form.service_interest} onChange={(e) => setForm({ ...form, service_interest: e.target.value })} placeholder="e.g. Video Production" />
            </div>
            <div className="field">
              <label>Status</label>
              <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                <option value="new">New</option>
                <option value="contacted">Contacted</option>
                <option value="qualified">Qualified</option>
                <option value="converted">Converted</option>
                <option value="lost">Lost</option>
              </select>
            </div>
            <div className="field full">
              <label>Message / Notes</label>
              <textarea value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} />
            </div>
          </form>
        </Modal>
      )}

      {deleting && (
        <ConfirmDialog
          title="Delete lead"
          message={`Delete lead "${deleting.name}"?`}
          onConfirm={() => void doDelete()}
          onCancel={() => setDeleting(null)}
          busy={busy}
        />
      )}
    </div>
  );
}
