import { Link, useLocation } from 'react-router-dom';
import { FlaskConical, LayoutDashboard, PlusCircle, Settings, RefreshCw } from 'lucide-react';
import { useData } from '../store/DataContext';

export function Navbar() {
  const { pathname } = useLocation();
  const { syncing, sync, settings } = useData();

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <FlaskConical size={22} />
        <span>Booze Tracker</span>
      </div>
      <div className="navbar-links">
        <Link to="/" className={pathname === '/' ? 'active' : ''}>
          <LayoutDashboard size={16} /> Dashboard
        </Link>
        <Link to="/batches" className={pathname.startsWith('/batches') ? 'active' : ''}>
          <FlaskConical size={16} /> Batches
        </Link>
        <Link to="/new" className={pathname === '/new' ? 'active' : ''}>
          <PlusCircle size={16} /> New Batch
        </Link>
        <Link to="/settings" className={pathname === '/settings' ? 'active' : ''}>
          <Settings size={16} /> Settings
        </Link>
      </div>
      <div className="navbar-actions">
        {settings && (
          <button className="icon-btn" onClick={sync} disabled={syncing} title="Sync with Gist">
            <RefreshCw size={16} className={syncing ? 'spin' : ''} />
          </button>
        )}
      </div>
    </nav>
  );
}
