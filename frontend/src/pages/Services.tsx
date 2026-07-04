import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { Plus, Search, Pencil, Trash2 } from 'lucide-react';
import { api, errorMessage } from '../api';
import type { Service } from '../types';
import { Modal, ConfirmDialog, StatusBadge, money } from '../components/ui';

const empty = { name: '', category: 'Video', price: '', unit: 'per project', active: '1' };

export default function Services() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [editing, setEditing] = useState<Service | null>(null);
  const [creating, setCreating] = useState(false);
  const [deleting, setDeleting] = useState<Service | null>(null);
  const [form, setForm] = useState<Record<string, string>>(empty);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const load = () => {
    void api.get<Service[]>('/services').then((res) => {
      setServices(res.data);
      setLoading(false);
    });
  };
  useEffect(load, []);

  const filtered = useMemo(
    () =>
      services.filter((s) => {
        const q = search.toLowerCase();
        return !q || s.name.toLowerCase().includes(q) || s.category.toLowerCase().includes(q);
      }),
    [services, search]
  );

  const openCreate = () => {
    setForm(empty);
    setError('');
    setCreating(true);
  };

  const openEdit = (s: Service) => {
    setForm({ name: s.name, category: s.category, price: String(s.price), unit: s.unit, active: s.active ? '1' : '0' });
    setError('');
    setEditing(s);
  };

  const close = () => {
    setCreating(false);
    setEditing(null);
  };

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    const payload = { ...form, active: form.active === '1' };
    try {
      if (editing) await api.put(`/services/${editing.id}`, payload);
      else await api.post('/services', payload);
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
      await api.delete(`/services/${deleting.id}`);
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
          <input placeholder="Search services…" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <button className="btn btn-primary" onClick={openCreate}>
          <Plus size={15} /> Add Service
        </button>
      </div>
      {loading ? (
        <div className="page-loading">Loading…</div>
      ) : (
        <table className="data-table">
          <thead>
            <tr>
              <th>Service</th>
              <th>Category</th>
              <th>Price</th>
              <th>Unit</th>
              <th>Status</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr>
                <td colSpan={6}>
                  <div className="empty-state">No services found.</div>
                </td>
              </tr>
            )}
            {filtered.map((s) => (
              <tr key={s.id}>
                <td>
                  <div className="cell-main">{s.name}</div>
                </td>
                <td>{s.category}</td>
                <td>{money(s.price)}</td>
                <td>{s.unit}</td>
                <td>
                  <StatusBadge value={s.active ? 'active' : 'inactive'} />
                </td>
                <td>
                  <div className="row-actions">
                    <button className="icon-btn" onClick={() => openEdit(s)} title="Edit">
                      <Pencil size={14} />
                    </button>
                    <button className="icon-btn danger" onClick={() => setDeleting(s)} title="Delete">
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
          title={editing ? 'Edit Service' : 'Add Service'}
          onClose={close}
          footer={
            <>
              <button className="btn btn-secondary" onClick={close}>
                Cancel
              </button>
              <button className="btn btn-primary" form="service-form" disabled={busy}>
                {busy ? 'Saving…' : 'Save Service'}
              </button>
            </>
          }
        >
          {error && <div className="form-error">{error}</div>}
          <form id="service-form" onSubmit={(e) => void submit(e)} className="form-grid">
            <div className="field full">
              <label>Service Name *</label>
              <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            </div>
            <div className="field">
              <label>Category</label>
              <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                <option>Video</option>
                <option>Design</option>
                <option>Web</option>
                <option>Marketing</option>
                <option>Photography</option>
                <option>Other</option>
              </select>
            </div>
            <div className="field">
              <label>Price (Rs.) *</label>
              <input type="number" min="0" step="0.01" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} required />
            </div>
            <div className="field">
              <label>Unit</label>
              <select value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })}>
                <option>per project</option>
                <option>per hour</option>
                <option>per day</option>
                <option>per month</option>
                <option>per item</option>
              </select>
            </div>
            <div className="field">
              <label>Status</label>
              <select value={form.active} onChange={(e) => setForm({ ...form, active: e.target.value })}>
                <option value="1">Active</option>
                <option value="0">Inactive</option>
              </select>
            </div>
          </form>
        </Modal>
      )}

      {deleting && (
        <ConfirmDialog
          title="Delete service"
          message={`Delete "${deleting.name}"?`}
          onConfirm={() => void doDelete()}
          onCancel={() => setDeleting(null)}
          busy={busy}
        />
      )}
    </div>
  );
}
