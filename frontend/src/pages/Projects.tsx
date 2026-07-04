import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { Plus, Search, Pencil, Trash2 } from 'lucide-react';
import { api, errorMessage } from '../api';
import type { Project, Client } from '../types';
import { Modal, ConfirmDialog, StatusBadge, money, formatDate } from '../components/ui';

const empty = { client_id: '', name: '', type: 'video_production', status: 'planning', budget: '', deadline: '', description: '' };

const projectTypes = [
  ['video_production', 'Video Production'],
  ['graphic_design', 'Graphic Design'],
  ['web_development', 'Web Development'],
  ['social_media', 'Social Media'],
  ['branding', 'Branding'],
  ['photography', 'Photography'],
  ['other', 'Other'],
] as const;

const typeLabel = (t: string) => projectTypes.find(([v]) => v === t)?.[1] ?? t;

export default function Projects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [editing, setEditing] = useState<Project | null>(null);
  const [creating, setCreating] = useState(false);
  const [deleting, setDeleting] = useState<Project | null>(null);
  const [form, setForm] = useState<Record<string, string>>(empty);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const load = () => {
    void Promise.all([api.get<Project[]>('/projects'), api.get<Client[]>('/clients')]).then(([p, c]) => {
      setProjects(p.data);
      setClients(c.data);
      setLoading(false);
    });
  };
  useEffect(load, []);

  const filtered = useMemo(
    () =>
      projects.filter((p) => {
        if (statusFilter !== 'all' && p.status !== statusFilter) return false;
        const q = search.toLowerCase();
        return !q || p.name.toLowerCase().includes(q) || p.client?.name.toLowerCase().includes(q) || typeLabel(p.type).toLowerCase().includes(q);
      }),
    [projects, search, statusFilter]
  );

  const openCreate = () => {
    setForm(empty);
    setError('');
    setCreating(true);
  };

  const openEdit = (p: Project) => {
    setForm({
      client_id: String(p.client_id),
      name: p.name,
      type: p.type,
      status: p.status,
      budget: String(p.budget ?? ''),
      deadline: p.deadline ?? '',
      description: p.description ?? '',
    });
    setError('');
    setEditing(p);
  };

  const close = () => {
    setCreating(false);
    setEditing(null);
  };

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    const payload = { ...form, budget: form.budget || '0', deadline: form.deadline || null };
    try {
      if (editing) await api.put(`/projects/${editing.id}`, payload);
      else await api.post('/projects', payload);
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
      await api.delete(`/projects/${deleting.id}`);
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
            <input placeholder="Search projects…" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="all">All statuses</option>
            <option value="planning">Planning</option>
            <option value="in_progress">In progress</option>
            <option value="review">Review</option>
            <option value="completed">Completed</option>
            <option value="on_hold">On hold</option>
          </select>
        </div>
        <button className="btn btn-primary" onClick={openCreate}>
          <Plus size={15} /> New Project
        </button>
      </div>
      {loading ? (
        <div className="page-loading">Loading…</div>
      ) : (
        <table className="data-table">
          <thead>
            <tr>
              <th>Project</th>
              <th>Client</th>
              <th>Type</th>
              <th>Budget</th>
              <th>Deadline</th>
              <th>Status</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr>
                <td colSpan={7}>
                  <div className="empty-state">No projects found.</div>
                </td>
              </tr>
            )}
            {filtered.map((p) => (
              <tr key={p.id}>
                <td>
                  <div className="cell-main">{p.name}</div>
                </td>
                <td>{p.client?.name ?? '—'}</td>
                <td>{typeLabel(p.type)}</td>
                <td>{money(p.budget)}</td>
                <td>{formatDate(p.deadline)}</td>
                <td>
                  <StatusBadge value={p.status} />
                </td>
                <td>
                  <div className="row-actions">
                    <button className="icon-btn" onClick={() => openEdit(p)} title="Edit">
                      <Pencil size={14} />
                    </button>
                    <button className="icon-btn danger" onClick={() => setDeleting(p)} title="Delete">
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
          title={editing ? 'Edit Project' : 'New Project'}
          onClose={close}
          footer={
            <>
              <button className="btn btn-secondary" onClick={close}>
                Cancel
              </button>
              <button className="btn btn-primary" form="project-form" disabled={busy}>
                {busy ? 'Saving…' : 'Save Project'}
              </button>
            </>
          }
        >
          {error && <div className="form-error">{error}</div>}
          <form id="project-form" onSubmit={(e) => void submit(e)} className="form-grid">
            <div className="field full">
              <label>Project Name *</label>
              <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            </div>
            <div className="field">
              <label>Client *</label>
              <select value={form.client_id} onChange={(e) => setForm({ ...form, client_id: e.target.value })} required>
                <option value="">Select client…</option>
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="field">
              <label>Type</label>
              <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
                {projectTypes.map(([v, l]) => (
                  <option key={v} value={v}>
                    {l}
                  </option>
                ))}
              </select>
            </div>
            <div className="field">
              <label>Status</label>
              <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                <option value="planning">Planning</option>
                <option value="in_progress">In progress</option>
                <option value="review">Review</option>
                <option value="completed">Completed</option>
                <option value="on_hold">On hold</option>
              </select>
            </div>
            <div className="field">
              <label>Budget (Rs.)</label>
              <input type="number" min="0" step="0.01" value={form.budget} onChange={(e) => setForm({ ...form, budget: e.target.value })} />
            </div>
            <div className="field">
              <label>Deadline</label>
              <input type="date" value={form.deadline} onChange={(e) => setForm({ ...form, deadline: e.target.value })} />
            </div>
            <div className="field full">
              <label>Description</label>
              <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </div>
          </form>
        </Modal>
      )}

      {deleting && (
        <ConfirmDialog
          title="Delete project"
          message={`Delete "${deleting.name}"? This cannot be undone.`}
          onConfirm={() => void doDelete()}
          onCancel={() => setDeleting(null)}
          busy={busy}
        />
      )}
    </div>
  );
}
