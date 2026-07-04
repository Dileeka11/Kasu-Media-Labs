import { useEffect, useMemo, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { api, errorMessage } from '../api';
import type { Category } from '../types';
import type { LayoutCtx } from '../components/Layout';
import { Modal, ErrorBox } from '../components/ui';

export default function Categories() {
  const { search } = useOutletContext<LayoutCtx>();
  const [categories, setCategories] = useState<Category[]>([]);
  const [editing, setEditing] = useState<Category | null>(null);
  const [creating, setCreating] = useState(false);
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const load = () => {
    void api.get<Category[]>('/categories').then((res) => setCategories(res.data));
  };
  useEffect(load, []);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return categories.filter((c) => !q || c.name.toLowerCase().includes(q) || c.slug.includes(q));
  }, [categories, search]);

  const openCreate = () => {
    setName('');
    setError('');
    setCreating(true);
  };

  const openEdit = (c: Category) => {
    setName(c.name);
    setError('');
    setEditing(c);
  };

  const close = () => {
    setCreating(false);
    setEditing(null);
  };

  const save = async () => {
    setBusy(true);
    setError('');
    try {
      if (editing) await api.put(`/categories/${editing.id}`, { name });
      else await api.post('/categories', { name });
      close();
      load();
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  const doDelete = async () => {
    if (!editing) return;
    setBusy(true);
    setError('');
    try {
      await api.delete(`/categories/${editing.id}`);
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
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16 }}>
        {filtered.map((c) => (
          <div key={c.id} className="k-card" style={{ padding: 22, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontFamily: 'var(--ui-font)', fontWeight: 600, fontSize: 18, marginBottom: 5 }}>{c.name}</div>
              <div style={{ fontFamily: 'var(--ui-font)', fontSize: 12, color: 'var(--ink-3)' }}>
                /{c.slug} · {c.projects_count ?? 0} projects
              </div>
            </div>
            <button className="k-icon-btn" style={{ width: 32, height: 32 }} onClick={() => openEdit(c)} title="Edit">
              ✎
            </button>
          </div>
        ))}
        <div
          onClick={openCreate}
          style={{
            border: '1.5px dashed rgba(23,21,58,.28)',
            borderRadius: 6,
            padding: 22,
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
          <span style={{ fontSize: 18 }}>+</span>Add category
        </div>
      </div>

      {(creating || editing) && (
        <Modal
          title={editing ? 'Edit Category' : 'Add Category'}
          onClose={close}
          width={440}
          footer={
            <>
              {editing && (
                <button
                  className="k-btn-outline"
                  style={{ marginRight: 'auto', color: 'var(--red)', borderColor: 'rgba(194,74,110,.4)' }}
                  onClick={() => void doDelete()}
                  disabled={busy}
                >
                  Delete
                </button>
              )}
              <button className="k-btn-outline" onClick={close}>
                Cancel
              </button>
              <button className="k-btn-grad" onClick={() => void save()} disabled={busy || !name.trim()}>
                {busy ? 'Saving…' : 'Save'}
              </button>
            </>
          }
        >
          {error && <ErrorBox>{error}</ErrorBox>}
          <div>
            <label className="k-label">Category name</label>
            <input
              className="k-input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && void save()}
              placeholder="e.g. Commercials"
              autoFocus
            />
          </div>
        </Modal>
      )}
    </>
  );
}
