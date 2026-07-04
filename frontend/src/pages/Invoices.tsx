import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { Plus, Search, Pencil, Trash2 } from 'lucide-react';
import { api, errorMessage } from '../api';
import type { Invoice, InvoiceItem, Client } from '../types';
import { Modal, ConfirmDialog, StatusBadge, money, formatDate } from '../components/ui';

const emptyItem = (): InvoiceItem => ({ description: '', quantity: 1, unit_price: 0 });

interface InvoiceForm {
  client_id: string;
  issue_date: string;
  due_date: string;
  status: string;
  items: InvoiceItem[];
}

const today = () => new Date().toISOString().slice(0, 10);

const emptyForm = (): InvoiceForm => ({
  client_id: '',
  issue_date: today(),
  due_date: today(),
  status: 'draft',
  items: [emptyItem()],
});

export default function Invoices() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [editing, setEditing] = useState<Invoice | null>(null);
  const [creating, setCreating] = useState(false);
  const [deleting, setDeleting] = useState<Invoice | null>(null);
  const [form, setForm] = useState<InvoiceForm>(emptyForm());
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const load = () => {
    void Promise.all([api.get<Invoice[]>('/invoices'), api.get<Client[]>('/clients')]).then(([i, c]) => {
      setInvoices(i.data);
      setClients(c.data);
      setLoading(false);
    });
  };
  useEffect(load, []);

  const filtered = useMemo(
    () =>
      invoices.filter((inv) => {
        if (statusFilter !== 'all' && inv.status !== statusFilter) return false;
        const q = search.toLowerCase();
        return !q || inv.invoice_number.toLowerCase().includes(q) || inv.client?.name.toLowerCase().includes(q);
      }),
    [invoices, search, statusFilter]
  );

  const total = form.items.reduce((sum, it) => sum + (Number(it.quantity) || 0) * (Number(it.unit_price) || 0), 0);

  const openCreate = () => {
    setForm(emptyForm());
    setError('');
    setCreating(true);
  };

  const openEdit = (inv: Invoice) => {
    setForm({
      client_id: String(inv.client_id),
      issue_date: inv.issue_date,
      due_date: inv.due_date,
      status: inv.status,
      items: inv.items?.length ? inv.items.map((it) => ({ description: it.description, quantity: it.quantity, unit_price: it.unit_price })) : [emptyItem()],
    });
    setError('');
    setEditing(inv);
  };

  const close = () => {
    setCreating(false);
    setEditing(null);
  };

  const setItem = (idx: number, patch: Partial<InvoiceItem>) => {
    setForm((f) => ({ ...f, items: f.items.map((it, i) => (i === idx ? { ...it, ...patch } : it)) }));
  };

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      if (editing) await api.put(`/invoices/${editing.id}`, form);
      else await api.post('/invoices', form);
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
      await api.delete(`/invoices/${deleting.id}`);
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
            <input placeholder="Search invoices…" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="all">All statuses</option>
            <option value="draft">Draft</option>
            <option value="sent">Sent</option>
            <option value="paid">Paid</option>
            <option value="overdue">Overdue</option>
          </select>
        </div>
        <button className="btn btn-primary" onClick={openCreate}>
          <Plus size={15} /> New Invoice
        </button>
      </div>
      {loading ? (
        <div className="page-loading">Loading…</div>
      ) : (
        <table className="data-table">
          <thead>
            <tr>
              <th>Invoice #</th>
              <th>Client</th>
              <th>Issued</th>
              <th>Due</th>
              <th>Total</th>
              <th>Status</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr>
                <td colSpan={7}>
                  <div className="empty-state">No invoices found.</div>
                </td>
              </tr>
            )}
            {filtered.map((inv) => (
              <tr key={inv.id}>
                <td>
                  <div className="cell-main">{inv.invoice_number}</div>
                </td>
                <td>{inv.client?.name ?? '—'}</td>
                <td>{formatDate(inv.issue_date)}</td>
                <td>{formatDate(inv.due_date)}</td>
                <td className="cell-main">{money(inv.total)}</td>
                <td>
                  <StatusBadge value={inv.status} />
                </td>
                <td>
                  <div className="row-actions">
                    <button className="icon-btn" onClick={() => openEdit(inv)} title="Edit">
                      <Pencil size={14} />
                    </button>
                    <button className="icon-btn danger" onClick={() => setDeleting(inv)} title="Delete">
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
          wide
          title={editing ? `Edit ${editing.invoice_number}` : 'New Invoice'}
          onClose={close}
          footer={
            <>
              <button className="btn btn-secondary" onClick={close}>
                Cancel
              </button>
              <button className="btn btn-primary" form="invoice-form" disabled={busy}>
                {busy ? 'Saving…' : 'Save Invoice'}
              </button>
            </>
          }
        >
          {error && <div className="form-error">{error}</div>}
          <form id="invoice-form" onSubmit={(e) => void submit(e)}>
            <div className="form-grid" style={{ marginBottom: 16 }}>
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
                <label>Status</label>
                <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                  <option value="draft">Draft</option>
                  <option value="sent">Sent</option>
                  <option value="paid">Paid</option>
                  <option value="overdue">Overdue</option>
                </select>
              </div>
              <div className="field">
                <label>Issue Date *</label>
                <input type="date" value={form.issue_date} onChange={(e) => setForm({ ...form, issue_date: e.target.value })} required />
              </div>
              <div className="field">
                <label>Due Date *</label>
                <input type="date" value={form.due_date} onChange={(e) => setForm({ ...form, due_date: e.target.value })} required />
              </div>
            </div>

            <div className="field">
              <label>Line Items</label>
            </div>
            <table className="invoice-items-table">
              <thead>
                <tr>
                  <th style={{ width: '50%' }}>Description</th>
                  <th>Qty</th>
                  <th>Unit Price</th>
                  <th>Amount</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {form.items.map((it, idx) => (
                  <tr key={idx}>
                    <td>
                      <div className="field">
                        <input value={it.description} onChange={(e) => setItem(idx, { description: e.target.value })} placeholder="Service or item…" required />
                      </div>
                    </td>
                    <td>
                      <div className="field">
                        <input type="number" min="1" style={{ width: 70 }} value={it.quantity} onChange={(e) => setItem(idx, { quantity: Number(e.target.value) })} required />
                      </div>
                    </td>
                    <td>
                      <div className="field">
                        <input type="number" min="0" step="0.01" style={{ width: 120 }} value={it.unit_price} onChange={(e) => setItem(idx, { unit_price: Number(e.target.value) })} required />
                      </div>
                    </td>
                    <td style={{ fontWeight: 600, whiteSpace: 'nowrap' }}>{money((Number(it.quantity) || 0) * (Number(it.unit_price) || 0))}</td>
                    <td>
                      {form.items.length > 1 && (
                        <button type="button" className="icon-btn danger" onClick={() => setForm((f) => ({ ...f, items: f.items.filter((_, i) => i !== idx) }))}>
                          <Trash2 size={13} />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <button type="button" className="btn btn-secondary" style={{ marginTop: 10 }} onClick={() => setForm((f) => ({ ...f, items: [...f.items, emptyItem()] }))}>
              <Plus size={14} /> Add line
            </button>
            <div className="invoice-total-row">
              <span>Total</span>
              <span>{money(total)}</span>
            </div>
          </form>
        </Modal>
      )}

      {deleting && (
        <ConfirmDialog
          title="Delete invoice"
          message={`Delete invoice ${deleting.invoice_number}?`}
          onConfirm={() => void doDelete()}
          onCancel={() => setDeleting(null)}
          busy={busy}
        />
      )}
    </div>
  );
}
