import { useEffect, useState } from 'react';
import { api } from '../api';
import type { DashboardData } from '../types';
import { fmtViews, relTimeShort } from '../components/ui';

export default function Dashboard() {
  const [data, setData] = useState<DashboardData | null>(null);

  const load = () => {
    void api.get<DashboardData>('/dashboard').then((res) => setData(res.data));
  };

  useEffect(() => {
    load();
    window.addEventListener('kml:projects-changed', load);
    return () => window.removeEventListener('kml:projects-changed', load);
  }, []);

  if (!data) return <div style={{ padding: 40, color: 'var(--ink-3)' }}>Loading…</div>;

  const stats = [
    { label: 'Total Projects', value: String(data.total_projects), delta: `+${data.projects_this_month} this month` },
    { label: 'Total Views', value: fmtViews(data.total_views), delta: `${data.views_delta >= 0 ? '+' : ''}${data.views_delta}%` },
    { label: 'New Inquiries', value: String(data.new_inquiries), delta: `${data.unread_inquiries} unread` },
    { label: 'Published', value: String(data.published), delta: `${data.drafts} drafts` },
  ];

  const max = Math.max(...data.chart_bars, 1);

  return (
    <>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16, marginBottom: 22 }}>
        {stats.map((s) => (
          <div key={s.label} className="k-card" style={{ padding: 22 }}>
            <div className="k-mono" style={{ marginBottom: 14 }}>{s.label}</div>
            <div style={{ fontFamily: "'Space Grotesk'", fontWeight: 700, fontSize: 36, lineHeight: 1, letterSpacing: -1, marginBottom: 10 }}>
              {s.value}
            </div>
            <div style={{ fontSize: 12.5, color: 'var(--ink-2)' }}>{s.delta}</div>
          </div>
        ))}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: 16 }}>
        <div className="k-card" style={{ padding: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 22 }}>
            <h3 className="k-h" style={{ fontWeight: 600, fontSize: 17 }}>Views — last 30 days</h3>
            <span
              style={{
                fontFamily: "'Space Mono', monospace",
                fontSize: 12,
                color: data.views_delta >= 0 ? 'var(--green)' : 'var(--red)',
                fontWeight: 700,
              }}
            >
              {data.views_delta >= 0 ? '▲' : '▼'} {Math.abs(data.views_delta)}%
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 7, height: 180, borderBottom: '1px solid var(--border)' }}>
            {data.chart_bars.map((b, i) => (
              <div
                key={i}
                title={fmtViews(b)}
                style={{
                  flex: 1,
                  height: `${Math.round((b / max) * 96)}%`,
                  background: 'linear-gradient(180deg,#8354C9,#2B39B8)',
                  borderRadius: '4px 4px 0 0',
                }}
              />
            ))}
          </div>
        </div>
        <div className="k-card" style={{ padding: 24 }}>
          <h3 className="k-h" style={{ fontWeight: 600, fontSize: 17, margin: '0 0 20px' }}>Recent activity</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 17 }}>
            {data.activity.map((a) => (
              <div key={a.id} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                <span
                  style={{
                    width: 9,
                    height: 9,
                    background: 'var(--grad-av)',
                    clipPath: 'polygon(50% 0,100% 50%,50% 100%,0 50%)',
                    marginTop: 5,
                    flex: 'none',
                  }}
                />
                <div style={{ lineHeight: 1.4 }}>
                  <div style={{ fontSize: 14, color: 'var(--ink)' }}>{a.title}</div>
                  <div style={{ fontSize: 12, color: 'var(--ink-3)' }}>
                    {relTimeShort(a.created_at)}
                    {a.meta ? ` · ${a.meta}` : ''}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
