import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useData } from '../store/DataContext';
import { CategoryBadge } from '../components/CategoryBadge';
import { StatusBadge } from '../components/StatusBadge';
import type { BatchCategory, BatchStatus } from '../types';

export function BatchList() {
  const { data } = useData();
  const [search, setSearch] = useState('');
  const [filterCat, setFilterCat] = useState<BatchCategory | 'all'>('all');
  const [filterStatus, setFilterStatus] = useState<BatchStatus | 'all'>('all');

  const batches = data.batches.filter(b => {
    if (filterCat !== 'all' && b.category !== filterCat) return false;
    if (filterStatus !== 'all' && b.status !== filterStatus) return false;
    if (search && !b.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  }).sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());

  return (
    <div className="page">
      <div className="section-header">
        <h1>All Batches</h1>
        <Link to="/new" className="btn btn-primary">+ New Batch</Link>
      </div>

      <div className="filter-bar">
        <input
          className="input"
          placeholder="Search batches..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <select className="select" value={filterCat} onChange={e => setFilterCat(e.target.value as BatchCategory | 'all')}>
          <option value="all">All categories</option>
          <option value="beer">Beer</option>
          <option value="wine">Wine</option>
          <option value="mead">Mead</option>
          <option value="spirits">Spirits</option>
          <option value="cider">Cider</option>
          <option value="kombucha">Kombucha</option>
          <option value="other">Other</option>
        </select>
        <select className="select" value={filterStatus} onChange={e => setFilterStatus(e.target.value as BatchStatus | 'all')}>
          <option value="all">All statuses</option>
          <option value="planning">Planning</option>
          <option value="fermenting">Fermenting</option>
          <option value="conditioning">Conditioning</option>
          <option value="ready">Ready</option>
          <option value="finished">Finished</option>
          <option value="failed">Failed</option>
        </select>
      </div>

      {batches.length === 0 ? (
        <div className="empty">No batches found.</div>
      ) : (
        <table className="table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Category</th>
              <th>Status</th>
              <th>Volume</th>
              <th>Started</th>
              <th>ABV</th>
            </tr>
          </thead>
          <tbody>
            {batches.map(b => (
              <tr key={b.id}>
                <td><Link to={`/batches/${b.id}`} className="link">{b.name}</Link></td>
                <td><CategoryBadge category={b.category} /></td>
                <td><StatusBadge status={b.status} /></td>
                <td>{b.volume} {b.volumeUnit}</td>
                <td>{new Date(b.startDate).toLocaleDateString()}</td>
                <td>
                  {b.originalGravity && b.finalGravity
                    ? `${((b.originalGravity - b.finalGravity) * 131.25).toFixed(1)}%`
                    : b.originalGravity ? `OG ${b.originalGravity}` : '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
