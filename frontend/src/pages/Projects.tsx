import { useEffect, useMemo, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { api, errorMessage } from '../api';
import type { Project } from '../types';
import type { LayoutCtx } from '../components/Layout';
import { StatusPill, Modal, fmtViews, fmtDate } from '../components/ui';

const cols = '2.4fr 1.2fr 1fr .9fr 1fr .7fr';

export default function Projects() {
  const { search, openEditProject } = useOutletContext<LayoutCtx>();
  const [projects, setProjects] = useState<Project[]>([]);
  const [deleting, setDeleting] = useState<Project | null>(null);
  const [busy, setBusy] = useState(false);

  const load = () => {
    void api.get<Project[]>('/projects').then((res) => setProjects(res.data));
  };

  useEffect(() => {
    load();
    window.addEventListener('kml:projects-changed', load);
    return () => window.removeEventListener('kml:projects-changed', load);
  }, []);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return projects.filter(
      (p) => !q || p.title.toLowerCase().includes(q) || p.category?.name.toLowerCase().includes(q) || p.client?.toLowerCase().includes(q)
    );
  }, [projects, search]);

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
    <div className="k-card" style={{ overflow: 'hidden' }}>
      <div
        className="k-mono"
        style={{ display: 'grid', gridTemplateColumns: cols, gap: 16, padding: '14px 22px', borderBottom: '1px solid var(--border)' }}
      >
        <div>Project</div>
        <div>Category</div>
        <div>Status</div>
        <div>Views</div>
        <div>Date</div>
        <div style={{ textAlign: 'right' }}>Actions</div>
      </div>
      {filtered.length === 0 && (
        <div style={{ padding: '40px 22px', textAlign: 'center', color: 'var(--ink-3)', fontSize: 13.5 }}>No projects found.</div>
      )}
      {filtered.map((p) => (
        <div
          key={p.id}
          style={{
            display: 'grid',
            gridTemplateColumns: cols,
            gap: 16,
            padding: '15px 22px',
            borderBottom: '1px solid rgba(23,21,58,.07)',
            alignItems: 'center',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 13, minWidth: 0 }}>
            <div
              style={{
                width: 56,
                height: 36,
                background: p.thumbnail_url ? `#ECEAF4 url(${p.thumbnail_url}) center/cover no-repeat` : '#ECEAF4',
                border: '1px solid rgba(23,21,58,.1)',
                flex: 'none',
                display: 'grid',
                placeItems: 'center',
                color: '#8354C9',
                fontSize: 12,
                borderRadius: 3,
              }}
            >
              {!p.thumbnail_url && '▶'}
            </div>
            <span style={{ fontWeight: 700, fontSize: 14.5, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {p.title}
            </span>
          </div>
          <div style={{ fontSize: 13.5, color: 'var(--ink-2)' }}>{p.category?.name ?? '—'}</div>
          <div>
            <StatusPill status={p.status} />
          </div>
          <div style={{ fontSize: 13.5, color: 'var(--ink-2)' }}>{fmtViews(p.views)}</div>
          <div style={{ fontSize: 13.5, color: 'var(--ink-3)' }}>{fmtDate(p.published_at)}</div>
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
            <button className="k-icon-btn" title="Edit" onClick={() => openEditProject(p)}>
              ✎
            </button>
            <button className="k-icon-btn" title="Delete" style={{ color: 'var(--red)' }} onClick={() => setDeleting(p)}>
              🗑
            </button>
          </div>
        </div>
      ))}

      {deleting && (
        <Modal
          title="Delete Project"
          onClose={() => setDeleting(null)}
          footer={
            <>
              <button className="k-btn-outline" onClick={() => setDeleting(null)}>
                Cancel
              </button>
              <button
                className="k-btn-grad"
                style={{ background: '#C24A6E' }}
                onClick={() => void doDelete()}
                disabled={busy}
              >
                {busy ? 'Deleting…' : 'Delete'}
              </button>
            </>
          }
        >
          <p style={{ margin: 0, color: 'var(--ink-2)', fontSize: 14 }}>
            Delete “{deleting.title}”? This will also remove its thumbnail. This cannot be undone.
          </p>
        </Modal>
      )}
    </div>
  );
}
