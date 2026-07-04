import { useEffect, useRef, useState } from 'react';
import { api, errorMessage } from '../api';
import type { Category, Project } from '../types';
import { Modal, ErrorBox } from './ui';

export function ProjectModal({ project, onClose, onSaved }: { project: Project | null; onClose: () => void; onSaved: () => void }) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [title, setTitle] = useState(project?.title ?? '');
  const [categoryId, setCategoryId] = useState(project ? String(project.category_id) : '');
  const [client, setClient] = useState(project?.client ?? '');
  const [videoUrl, setVideoUrl] = useState(project?.video_url ?? '');
  const [duration, setDuration] = useState(project?.duration ?? '');
  const [status, setStatus] = useState(project?.status ?? 'published');
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(project?.thumbnail_url ?? null);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null);

  useEffect(() => {
    void api.get<Category[]>('/categories').then((res) => {
      setCategories(res.data);
      if (!project && res.data.length) setCategoryId((prev) => prev || String(res.data[0].id));
    });
  }, [project]);

  const pick = (f: File | undefined | null) => {
    if (!f || !f.type.startsWith('image/')) return;
    setFile(f);
    setPreview(URL.createObjectURL(f));
  };

  const save = async () => {
    setBusy(true);
    setError('');
    const form = new FormData();
    form.append('title', title);
    form.append('category_id', categoryId);
    form.append('client', client);
    form.append('video_url', videoUrl);
    form.append('duration', duration);
    form.append('status', status);
    if (file) form.append('thumbnail', file);
    if (project) form.append('_method', 'PUT');
    try {
      await api.post(project ? `/projects/${project.id}` : '/projects', form);
      onSaved();
      onClose();
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal
      title={project ? 'Edit Project' : 'New Project'}
      onClose={onClose}
      footer={
        <>
          <button className="k-btn-outline" onClick={onClose}>
            Cancel
          </button>
          <button className="k-btn-grad" style={{ padding: '12px 24px' }} onClick={() => void save()} disabled={busy}>
            {busy ? 'Saving…' : project ? 'Save Changes' : 'Publish Project'}
          </button>
        </>
      }
    >
      {error && <ErrorBox>{error}</ErrorBox>}
      <div>
        <label className="k-label" style={{ marginBottom: 9 }}>Cover / Thumbnail</label>
        <div
          onClick={() => fileInput.current?.click()}
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragOver(false);
            pick(e.dataTransfer.files?.[0]);
          }}
          style={{
            width: '100%',
            height: 190,
            borderRadius: 6,
            background: preview ? `#ECEAF4 url(${preview}) center/cover no-repeat` : '#ECEAF4',
            border: dragOver ? '1.5px dashed #8354C9' : '1.5px dashed rgba(23,21,58,.2)',
            display: 'grid',
            placeItems: 'center',
            cursor: 'pointer',
            overflow: 'hidden',
          }}
        >
          {!preview && (
            <span className="k-mono" style={{ letterSpacing: 1, textAlign: 'center', padding: '0 20px' }}>
              Drag &amp; drop image or video poster · or click to browse
            </span>
          )}
        </div>
        <input ref={fileInput} type="file" accept="image/*" hidden onChange={(e) => pick(e.target.files?.[0])} />
      </div>
      <div>
        <label className="k-label">Title</label>
        <input className="k-input" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Aether — Brand Film" />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
        <div>
          <label className="k-label">Category</label>
          <select className="k-input" value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="k-label">Client</label>
          <input className="k-input" value={client} onChange={(e) => setClient(e.target.value)} placeholder="Client name" />
        </div>
      </div>
      <div>
        <label className="k-label">Video URL</label>
        <input className="k-input" value={videoUrl} onChange={(e) => setVideoUrl(e.target.value)} placeholder="https://vimeo.com/…" />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
        <div>
          <label className="k-label">Duration</label>
          <input className="k-input" value={duration} onChange={(e) => setDuration(e.target.value)} placeholder="e.g. 2:14" />
        </div>
        <div>
          <label className="k-label">Status</label>
          <select className="k-input" value={status} onChange={(e) => setStatus(e.target.value as typeof status)}>
            <option value="published">Published</option>
            <option value="draft">Draft</option>
            <option value="review">Review</option>
          </select>
        </div>
      </div>
    </Modal>
  );
}
