import { useState } from 'react';
import { useData } from '../store/DataContext';
import { validateToken } from '../store/gist';
import { CheckCircle, XCircle } from 'lucide-react';

export function SettingsPage() {
  const { settings, connect, disconnect } = useData();
  const [token, setToken] = useState(settings?.token ?? '');
  const [gistId, setGistId] = useState(settings?.gistId ?? '');
  const [validating, setValidating] = useState(false);
  const [result, setResult] = useState<'ok' | 'fail' | null>(null);
  const [err, setErr] = useState('');

  const handleConnect = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    setValidating(true);
    setResult(null);
    setErr('');
    try {
      const valid = await validateToken(token);
      if (!valid) { setResult('fail'); setErr('Token is invalid or lacks gist scope.'); return; }
      await connect({ token, gistId: gistId || undefined });
      setResult('ok');
    } catch (e) {
      setResult('fail');
      setErr(e instanceof Error ? e.message : 'Connection failed');
    } finally {
      setValidating(false);
    }
  };

  return (
    <div className="page page-narrow">
      <h1>Settings</h1>

      <section className="detail-section">
        <h2>GitHub Gist Sync</h2>
        <p className="muted">
          Your data is saved to a private GitHub Gist. You need a Personal Access Token (PAT) with <code>gist</code> scope.
          <br />
          Create one at <strong>GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)</strong>.
        </p>

        {settings && (
          <div className="banner banner-success">
            <CheckCircle size={16} /> Connected · Gist ID: <code>{settings.gistId ?? 'will be created on first save'}</code>
          </div>
        )}

        <form className="form" onSubmit={handleConnect}>
          <div className="form-row">
            <label>Personal Access Token</label>
            <input
              type="password"
              className="input"
              value={token}
              onChange={e => setToken(e.target.value)}
              placeholder="ghp_..."
              autoComplete="off"
            />
          </div>
          <div className="form-row">
            <label>Existing Gist ID <span className="muted">(optional — leave blank to create a new one)</span></label>
            <input
              className="input"
              value={gistId}
              onChange={e => setGistId(e.target.value)}
              placeholder="abc123def456..."
            />
          </div>

          {result === 'ok' && (
            <div className="banner banner-success"><CheckCircle size={16} /> Connected successfully!</div>
          )}
          {result === 'fail' && (
            <div className="banner banner-error"><XCircle size={16} /> {err}</div>
          )}

          <div className="form-actions">
            {settings && (
              <button type="button" className="btn btn-danger" onClick={disconnect}>Disconnect</button>
            )}
            <button type="submit" className="btn btn-primary" disabled={validating || !token}>
              {validating ? 'Connecting...' : settings ? 'Update Connection' : 'Connect'}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
