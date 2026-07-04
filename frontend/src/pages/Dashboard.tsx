import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Banknote, FolderKanban, Users, Inbox, Clock } from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { api } from '../api';
import type { DashboardStats } from '../types';
import { StatusBadge, money, formatDate } from '../components/ui';

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);

  useEffect(() => {
    void api.get<DashboardStats>('/dashboard').then((res) => setStats(res.data));
  }, []);

  if (!stats) return <div className="page-loading">Loading dashboard…</div>;

  const cards = [
    { label: 'Revenue (paid)', value: money(stats.revenue), hint: 'All-time collected', icon: Banknote, bg: 'var(--success-soft)', color: 'var(--success)' },
    { label: 'Outstanding', value: money(stats.outstanding), hint: 'Sent + overdue invoices', icon: Clock, bg: 'var(--warning-soft)', color: 'var(--warning)' },
    { label: 'Active Projects', value: String(stats.active_projects), hint: 'In progress or review', icon: FolderKanban, bg: 'var(--primary-soft)', color: 'var(--primary)' },
    { label: 'Clients', value: String(stats.total_clients), hint: 'Total registered', icon: Users, bg: 'var(--info-soft)', color: 'var(--info)' },
    { label: 'New Leads', value: String(stats.new_leads), hint: 'Awaiting contact', icon: Inbox, bg: 'var(--danger-soft)', color: 'var(--danger)' },
  ];

  return (
    <>
      <div className="stat-grid">
        {cards.map((c) => {
          const Icon = c.icon;
          return (
            <div className="card stat-card" key={c.label}>
              <div>
                <div className="stat-label">{c.label}</div>
                <div className="stat-value">{c.value}</div>
                <div className="stat-hint">{c.hint}</div>
              </div>
              <div className="stat-icon" style={{ background: c.bg, color: c.color }}>
                <Icon size={20} />
              </div>
            </div>
          );
        })}
      </div>

      <div className="card panel" style={{ marginBottom: 18 }}>
        <div className="panel-title">Revenue — last 6 months</div>
        <div style={{ height: 260 }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={stats.monthly_revenue} margin={{ top: 5, right: 10, left: 10, bottom: 0 }}>
              <defs>
                <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#5b5bf0" stopOpacity={0.25} />
                  <stop offset="100%" stopColor="#5b5bf0" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#eceef5" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#9297ad' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: '#9297ad' }} axisLine={false} tickLine={false} tickFormatter={(v: number) => (v >= 1000 ? `${v / 1000}k` : String(v))} />
              <Tooltip formatter={(v) => money(Number(v))} />
              <Area type="monotone" dataKey="revenue" stroke="#5b5bf0" strokeWidth={2.5} fill="url(#rev)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="dash-grid">
        <div className="card panel">
          <div className="panel-title">Recent Projects</div>
          {stats.recent_projects.length === 0 && <div className="empty-state">No projects yet.</div>}
          {stats.recent_projects.map((p) => (
            <div className="list-row" key={p.id}>
              <div>
                <div className="cell-main">{p.name}</div>
                <div className="cell-sub">
                  {p.client?.name ?? '—'} · due {formatDate(p.deadline)}
                </div>
              </div>
              <StatusBadge value={p.status} />
            </div>
          ))}
          <div style={{ marginTop: 14 }}>
            <Link to="/projects" style={{ color: 'var(--primary)', fontWeight: 600, fontSize: 13, textDecoration: 'none' }}>
              View all projects →
            </Link>
          </div>
        </div>
        <div className="card panel">
          <div className="panel-title">Latest Leads</div>
          {stats.recent_leads.length === 0 && <div className="empty-state">No leads yet.</div>}
          {stats.recent_leads.map((l) => (
            <div className="list-row" key={l.id}>
              <div>
                <div className="cell-main">{l.name}</div>
                <div className="cell-sub">{l.service_interest ?? l.source}</div>
              </div>
              <StatusBadge value={l.status} />
            </div>
          ))}
          <div style={{ marginTop: 14 }}>
            <Link to="/leads" style={{ color: 'var(--primary)', fontWeight: 600, fontSize: 13, textDecoration: 'none' }}>
              View all leads →
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
