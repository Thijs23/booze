import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useData } from '../store/DataContext';
import { CategoryBadge } from '../components/CategoryBadge';
import { StatusBadge } from '../components/StatusBadge';
import { Pencil, Trash2, Plus } from 'lucide-react';
import type { GravityReading, TastingNote } from '../types';

function uid() { return Math.random().toString(36).slice(2, 10); }

export function BatchDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data, updateBatch, deleteBatch } = useData();
  const batch = data.batches.find(b => b.id === id);

  const [showGravityForm, setShowGravityForm] = useState(false);
  const [showTastingForm, setShowTastingForm] = useState(false);
  const [gravDate, setGravDate] = useState(new Date().toISOString().slice(0, 10));
  const [gravValue, setGravValue] = useState('');
  const [gravNotes, setGravNotes] = useState('');

  const [tastDate, setTastDate] = useState(new Date().toISOString().slice(0, 10));
  const [tastRating, setTastRating] = useState('3');
  const [tastAroma, setTastAroma] = useState('');
  const [tastFlavor, setTastFlavor] = useState('');
  const [tastFinish, setTastFinish] = useState('');
  const [tastOverall, setTastOverall] = useState('');

  if (!batch) return <div className="page"><p>Batch not found. <Link to="/batches">Back</Link></p></div>;

  const abv = batch.originalGravity && batch.finalGravity
    ? ((batch.originalGravity - batch.finalGravity) * 131.25).toFixed(1)
    : null;

  const handleDelete = async () => {
    if (!confirm(`Delete "${batch.name}"? This cannot be undone.`)) return;
    await deleteBatch(batch.id);
    navigate('/batches');
  };

  const addGravityReading = async () => {
    if (!gravValue) return;
    const reading: GravityReading = { id: uid(), date: gravDate, gravity: parseFloat(gravValue), notes: gravNotes || undefined };
    await updateBatch({ ...batch, gravityReadings: [...batch.gravityReadings, reading], updatedAt: new Date().toISOString() });
    setShowGravityForm(false);
    setGravValue('');
    setGravNotes('');
  };

  const deleteGravityReading = async (rid: string) => {
    await updateBatch({ ...batch, gravityReadings: batch.gravityReadings.filter(r => r.id !== rid), updatedAt: new Date().toISOString() });
  };

  const addTastingNote = async () => {
    const note: TastingNote = { id: uid(), date: tastDate, rating: parseInt(tastRating), aroma: tastAroma, flavor: tastFlavor, finish: tastFinish, overall: tastOverall };
    await updateBatch({ ...batch, tastingNotes: [...batch.tastingNotes, note], updatedAt: new Date().toISOString() });
    setShowTastingForm(false);
    setTastAroma(''); setTastFlavor(''); setTastFinish(''); setTastOverall('');
  };

  const deleteTastingNote = async (nid: string) => {
    await updateBatch({ ...batch, tastingNotes: batch.tastingNotes.filter(n => n.id !== nid), updatedAt: new Date().toISOString() });
  };

  return (
    <div className="page">
      <div className="detail-header">
        <div>
          <div className="detail-badges">
            <CategoryBadge category={batch.category} />
            <StatusBadge status={batch.status} />
          </div>
          <h1>{batch.name}</h1>
          <div className="detail-meta">
            {batch.volume} {batch.volumeUnit}
            {batch.originalGravity && <> · OG {batch.originalGravity}</>}
            {batch.finalGravity && <> · FG {batch.finalGravity}</>}
            {abv && <> · {abv}% ABV</>}
            <> · Started {new Date(batch.startDate).toLocaleDateString()}</>
          </div>
        </div>
        <div className="detail-actions">
          <Link to={`/batches/${batch.id}/edit`} className="btn"><Pencil size={14} /> Edit</Link>
          <button className="btn btn-danger" onClick={handleDelete}><Trash2 size={14} /> Delete</button>
        </div>
      </div>

      {batch.ingredients.length > 0 && (
        <section className="detail-section">
          <h2>Ingredients</h2>
          <ul className="ingredient-list">
            {batch.ingredients.map((ing, i) => (
              <li key={i}>{ing.amount} {ing.unit} {ing.name}</li>
            ))}
          </ul>
        </section>
      )}

      {batch.recipe && (
        <section className="detail-section">
          <h2>Recipe / Process</h2>
          <pre className="pre">{batch.recipe}</pre>
        </section>
      )}

      {batch.notes && (
        <section className="detail-section">
          <h2>Notes</h2>
          <p>{batch.notes}</p>
        </section>
      )}

      <section className="detail-section">
        <div className="section-header">
          <h2>Gravity Readings</h2>
          <button className="btn btn-sm" onClick={() => setShowGravityForm(v => !v)}><Plus size={14} /> Add</button>
        </div>
        {showGravityForm && (
          <div className="inline-form">
            <input type="date" className="input" value={gravDate} onChange={e => setGravDate(e.target.value)} />
            <input type="number" className="input" placeholder="Gravity (e.g. 1.020)" step="0.001" value={gravValue} onChange={e => setGravValue(e.target.value)} />
            <input className="input" placeholder="Notes" value={gravNotes} onChange={e => setGravNotes(e.target.value)} />
            <button className="btn btn-primary btn-sm" onClick={addGravityReading}>Save</button>
            <button className="btn btn-sm" onClick={() => setShowGravityForm(false)}>Cancel</button>
          </div>
        )}
        {batch.gravityReadings.length === 0 ? <p className="muted">No readings yet.</p> : (
          <table className="table">
            <thead><tr><th>Date</th><th>Gravity</th><th>Notes</th><th></th></tr></thead>
            <tbody>
              {[...batch.gravityReadings].sort((a, b) => a.date.localeCompare(b.date)).map(r => (
                <tr key={r.id}>
                  <td>{new Date(r.date).toLocaleDateString()}</td>
                  <td>{r.gravity}</td>
                  <td>{r.notes ?? '—'}</td>
                  <td><button className="icon-btn danger" onClick={() => deleteGravityReading(r.id)}><Trash2 size={13} /></button></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      <section className="detail-section">
        <div className="section-header">
          <h2>Tasting Notes</h2>
          <button className="btn btn-sm" onClick={() => setShowTastingForm(v => !v)}><Plus size={14} /> Add</button>
        </div>
        {showTastingForm && (
          <div className="inline-form column">
            <div className="two-col">
              <input type="date" className="input" value={tastDate} onChange={e => setTastDate(e.target.value)} />
              <select className="select" value={tastRating} onChange={e => setTastRating(e.target.value)}>
                {[1,2,3,4,5].map(n => <option key={n} value={n}>{n} / 5</option>)}
              </select>
            </div>
            <input className="input" placeholder="Aroma" value={tastAroma} onChange={e => setTastAroma(e.target.value)} />
            <input className="input" placeholder="Flavor" value={tastFlavor} onChange={e => setTastFlavor(e.target.value)} />
            <input className="input" placeholder="Finish" value={tastFinish} onChange={e => setTastFinish(e.target.value)} />
            <textarea className="textarea" rows={2} placeholder="Overall impressions" value={tastOverall} onChange={e => setTastOverall(e.target.value)} />
            <div className="form-actions">
              <button className="btn btn-primary btn-sm" onClick={addTastingNote}>Save</button>
              <button className="btn btn-sm" onClick={() => setShowTastingForm(false)}>Cancel</button>
            </div>
          </div>
        )}
        {batch.tastingNotes.length === 0 ? <p className="muted">No tasting notes yet.</p> : (
          <div className="tasting-list">
            {[...batch.tastingNotes].sort((a, b) => b.date.localeCompare(a.date)).map(n => (
              <div key={n.id} className="tasting-card">
                <div className="tasting-header">
                  <span>{new Date(n.date).toLocaleDateString()}</span>
                  <span className="tasting-rating">{'★'.repeat(n.rating)}{'☆'.repeat(5 - n.rating)}</span>
                  <button className="icon-btn danger" onClick={() => deleteTastingNote(n.id)}><Trash2 size={13} /></button>
                </div>
                {n.aroma && <p><strong>Aroma:</strong> {n.aroma}</p>}
                {n.flavor && <p><strong>Flavor:</strong> {n.flavor}</p>}
                {n.finish && <p><strong>Finish:</strong> {n.finish}</p>}
                {n.overall && <p><strong>Overall:</strong> {n.overall}</p>}
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
