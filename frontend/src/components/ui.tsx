import { X } from 'lucide-react';
import type { ReactNode } from 'react';

export function Modal({
  title,
  onClose,
  children,
  footer,
  wide,
}: {
  title: string;
  onClose: () => void;
  children: ReactNode;
  footer?: ReactNode;
  wide?: boolean;
}) {
  return (
    <div className="modal-overlay" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className={wide ? 'modal wide' : 'modal'}>
        <div className="modal-header">
          <div className="modal-title">{title}</div>
          <button className="icon-btn" onClick={onClose} aria-label="Close">
            <X size={16} />
          </button>
        </div>
        <div className="modal-body">{children}</div>
        {footer && <div className="modal-footer">{footer}</div>}
      </div>
    </div>
  );
}

const badgeColors: Record<string, string> = {
  active: 'green',
  inactive: 'gray',
  planning: 'blue',
  in_progress: 'violet',
  review: 'amber',
  completed: 'green',
  on_hold: 'gray',
  draft: 'gray',
  sent: 'blue',
  paid: 'green',
  overdue: 'red',
  new: 'blue',
  contacted: 'violet',
  qualified: 'amber',
  converted: 'green',
  lost: 'red',
  admin: 'violet',
  manager: 'blue',
  staff: 'gray',
};

export function StatusBadge({ value }: { value: string }) {
  return <span className={`badge ${badgeColors[value] ?? 'gray'}`}>{value.replace(/_/g, ' ')}</span>;
}

export function ConfirmDialog({
  title,
  message,
  onConfirm,
  onCancel,
  busy,
}: {
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  busy?: boolean;
}) {
  return (
    <Modal
      title={title}
      onClose={onCancel}
      footer={
        <>
          <button className="btn btn-secondary" onClick={onCancel}>
            Cancel
          </button>
          <button className="btn btn-danger" onClick={onConfirm} disabled={busy}>
            {busy ? 'Deleting…' : 'Delete'}
          </button>
        </>
      }
    >
      <p style={{ color: 'var(--text-2)' }}>{message}</p>
    </Modal>
  );
}

export function money(n: number | string): string {
  const v = typeof n === 'string' ? parseFloat(n) : n;
  return 'Rs. ' + (isNaN(v) ? '0.00' : v.toLocaleString('en-LK', { minimumFractionDigits: 2, maximumFractionDigits: 2 }));
}

export function formatDate(d: string | null | undefined): string {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}
