import type { BatchStatus } from '../types';

const config: Record<BatchStatus, { label: string; color: string }> = {
  planning:     { label: 'Planning',     color: '#6b7280' },
  fermenting:   { label: 'Fermenting',   color: '#f59e0b' },
  conditioning: { label: 'Conditioning', color: '#3b82f6' },
  ready:        { label: 'Ready',        color: '#10b981' },
  finished:     { label: 'Finished',     color: '#8b5cf6' },
  failed:       { label: 'Failed',       color: '#ef4444' },
};

export function StatusBadge({ status }: { status: BatchStatus }) {
  const c = config[status];
  return (
    <span className="badge" style={{ backgroundColor: c.color + '22', color: c.color, border: `1px solid ${c.color}44` }}>
      {c.label}
    </span>
  );
}
