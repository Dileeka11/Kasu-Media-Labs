import { useEffect, useMemo, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { api } from '../api';
import type { Inquiry } from '../types';
import type { LayoutCtx } from '../components/Layout';
import { initials, relTimeShort } from '../components/ui';

export default function Inquiries() {
  const { search, refreshBadge } = useOutletContext<LayoutCtx>();
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);

  const load = () => {
    void api.get<Inquiry[]>('/inquiries').then((res) => setInquiries(res.data));
  };
  useEffect(load, []);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return inquiries.filter(
      (i) => !q || [i.name, i.company, i.type, i.message].some((v) => v?.toLowerCase().includes(q))
    );
  }, [inquiries, search]);

  const reply = async (q: Inquiry) => {
    if (q.unread) {
      await api.put(`/inquiries/${q.id}`, { unread: false });
      load();
      refreshBadge();
    }
    window.location.href = `mailto:${q.email}?subject=${encodeURIComponent('Re: ' + (q.type ?? 'Your inquiry') + ' — KML Production')}`;
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {filtered.length === 0 && (
        <div style={{ padding: '40px 22px', textAlign: 'center', color: 'var(--ink-3)', fontSize: 13.5 }}>No inquiries found.</div>
      )}
      {filtered.map((q) => (
        <div key={q.id} className="k-card" style={{ padding: '20px 22px', display: 'flex', gap: 16, alignItems: 'center' }}>
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: '50%',
              background: 'var(--grad-av)',
              display: 'grid',
              placeItems: 'center',
              fontWeight: 800,
              fontSize: 14,
              color: '#fff',
              flex: 'none',
            }}
          >
            {initials(q.name)}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
              <span style={{ fontWeight: 800, fontSize: 15 }}>{q.name}</span>
              <span style={{ fontSize: 13, color: 'var(--ink-3)' }}>{q.company}</span>
              {q.unread && <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#E86FA6' }} />}
            </div>
            <div style={{ fontSize: 13.5, color: 'var(--ink-2)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {q.message}
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 20, flex: 'none' }}>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--ink)' }}>{q.type}</div>
              <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 11.5, color: 'var(--ink-3)' }}>{q.budget}</div>
            </div>
            <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 11.5, color: 'var(--ink-3)', width: 56, textAlign: 'right' }}>
              {relTimeShort(q.created_at)}
            </div>
            <button
              onClick={() => void reply(q)}
              style={{
                padding: '10px 16px',
                background: '#fff',
                border: '1px solid #17153A',
                color: '#17153A',
                fontFamily: "'Space Mono', monospace",
                fontSize: 11.5,
                letterSpacing: 1,
                textTransform: 'uppercase',
                borderRadius: 4,
              }}
            >
              Reply
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
