import { Link } from 'react-router-dom';
import { useData } from '../store/DataContext';
import { CategoryBadge } from '../components/CategoryBadge';
import { StatusBadge } from '../components/StatusBadge';
import type { BatchStatus } from '../types';

function calcAbv(og?: number, fg?: number) {
  if (!og || !fg) return undefined;
  return ((og - fg) * 131.25).toFixed(1);
}

const statusOrder: BatchStatus[] = ['fermenting', 'conditioning', 'ready', 'planning', 'finished', 'failed'];

export function Dashboard() {
  const { data, settings, error } = useData();
  const batches = data.batches;

  const active = batches.filter(b => ['planning', 'fermenting', 'conditioning', 'ready'].includes(b.status));
  const byStatus = Object.fromEntries(
    statusOrder.map(s => [s, batches.filter(b => b.status === s).length])
  );

  return (
    <div className="page">
      {!settings && (
        <div className="banner banner-warning">
          No Gist connected — data won't sync. <Link to="/settings">Connect in Settings →</Link>
        </div>
      )}
      {error && <div className="banner banner-error">{error}</div>}

      <h1>Dashboard</h1>

      <div className="stat-grid">
        <div className="stat-card">
          <div className="stat-value">{batches.length}</div>
          <div className="stat-label">Total Batches</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{active.length}</div>
          <div className="stat-label">Active</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{byStatus.ready}</div>
          <div className="stat-label">Ready to Drink</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{byStatus.finished}</div>
          <div className="stat-label">Finished</div>
        </div>
      </div>

      <div className="section-header">
        <h2>Active Batches</h2>
        <Link to="/new" className="btn btn-primary">+ New Batch</Link>
      </div>

      {active.length === 0 ? (
        <div className="empty">
          <p>No active batches yet.</p>
          <Link to="/new" className="btn btn-primary">Start your first batch</Link>
        </div>
      ) : (
        <div className="batch-grid">
          {active.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()).map(batch => (
            <Link to={`/batches/${batch.id}`} key={batch.id} className="batch-card">
              <div className="batch-card-header">
                <span className="batch-name">{batch.name}</span>
                <StatusBadge status={batch.status} />
              </div>
              <div className="batch-card-meta">
                <CategoryBadge category={batch.category} />
                <span className="meta-item">{batch.volume} {batch.volumeUnit}</span>
                {calcAbv(batch.originalGravity, batch.finalGravity) && (
                  <span className="meta-item">{calcAbv(batch.originalGravity, batch.finalGravity)}% ABV</span>
                )}
              </div>
              <div className="batch-card-date">Started {new Date(batch.startDate).toLocaleDateString()}</div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
