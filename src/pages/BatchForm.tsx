import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useData } from '../store/DataContext';
import type { Batch, BatchCategory, BatchStatus, Ingredient } from '../types';
import { Trash2, Plus } from 'lucide-react';

function uid() {
  return Math.random().toString(36).slice(2, 10);
}

export function BatchForm() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { data, addBatch, updateBatch } = useData();
  const existing = id ? data.batches.find(b => b.id === id) : undefined;

  const [name, setName] = useState(existing?.name ?? '');
  const [category, setCategory] = useState<BatchCategory>(existing?.category ?? 'beer');
  const [status, setStatus] = useState<BatchStatus>(existing?.status ?? 'planning');
  const [startDate, setStartDate] = useState(existing?.startDate ?? new Date().toISOString().slice(0, 10));
  const [targetDate, setTargetDate] = useState(existing?.targetDate ?? '');
  const [volume, setVolume] = useState(String(existing?.volume ?? '20'));
  const [volumeUnit, setVolumeUnit] = useState<'L' | 'gal'>(existing?.volumeUnit ?? 'L');
  const [og, setOg] = useState(String(existing?.originalGravity ?? ''));
  const [fg, setFg] = useState(String(existing?.finalGravity ?? ''));
  const [notes, setNotes] = useState(existing?.notes ?? '');
  const [recipe, setRecipe] = useState(existing?.recipe ?? '');
  const [ingredients, setIngredients] = useState<Ingredient[]>(existing?.ingredients ?? []);
  const [saving, setSaving] = useState(false);

  const addIngredient = () => setIngredients(prev => [...prev, { name: '', amount: '', unit: '' }]);
  const removeIngredient = (i: number) => setIngredients(prev => prev.filter((_, idx) => idx !== i));
  const updateIngredient = (i: number, field: keyof Ingredient, value: string) =>
    setIngredients(prev => prev.map((ing, idx) => idx === i ? { ...ing, [field]: value } : ing));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const now = new Date().toISOString();
    const batch: Batch = {
      id: existing?.id ?? uid(),
      name,
      category,
      status,
      startDate,
      targetDate: targetDate || undefined,
      volume: parseFloat(volume),
      volumeUnit,
      originalGravity: og ? parseFloat(og) : undefined,
      finalGravity: fg ? parseFloat(fg) : undefined,
      notes,
      recipe,
      ingredients,
      gravityReadings: existing?.gravityReadings ?? [],
      tastingNotes: existing?.tastingNotes ?? [],
      createdAt: existing?.createdAt ?? now,
      updatedAt: now,
    };
    try {
      if (existing) await updateBatch(batch);
      else await addBatch(batch);
      navigate(`/batches/${batch.id}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="page page-narrow">
      <h1>{existing ? 'Edit Batch' : 'New Batch'}</h1>
      <form className="form" onSubmit={handleSubmit}>
        <div className="form-row">
          <label>Name *</label>
          <input className="input" required value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Summer IPA" />
        </div>
        <div className="form-row two-col">
          <div>
            <label>Category</label>
            <select className="select" value={category} onChange={e => setCategory(e.target.value as BatchCategory)}>
              <option value="beer">🍺 Beer</option>
              <option value="wine">🍷 Wine</option>
              <option value="mead">🍯 Mead</option>
              <option value="spirits">🥃 Spirits</option>
              <option value="cider">🍎 Cider</option>
              <option value="kombucha">🫙 Kombucha</option>
              <option value="other">🍶 Other</option>
            </select>
          </div>
          <div>
            <label>Status</label>
            <select className="select" value={status} onChange={e => setStatus(e.target.value as BatchStatus)}>
              <option value="planning">Planning</option>
              <option value="fermenting">Fermenting</option>
              <option value="conditioning">Conditioning</option>
              <option value="ready">Ready</option>
              <option value="finished">Finished</option>
              <option value="failed">Failed</option>
            </select>
          </div>
        </div>
        <div className="form-row two-col">
          <div>
            <label>Start Date</label>
            <input type="date" className="input" value={startDate} onChange={e => setStartDate(e.target.value)} />
          </div>
          <div>
            <label>Target Date</label>
            <input type="date" className="input" value={targetDate} onChange={e => setTargetDate(e.target.value)} />
          </div>
        </div>
        <div className="form-row two-col">
          <div>
            <label>Volume</label>
            <div className="input-group">
              <input type="number" className="input" value={volume} onChange={e => setVolume(e.target.value)} min="0" step="0.1" />
              <select className="select select-unit" value={volumeUnit} onChange={e => setVolumeUnit(e.target.value as 'L' | 'gal')}>
                <option value="L">L</option>
                <option value="gal">gal</option>
              </select>
            </div>
          </div>
          <div>
            <label>Original Gravity (OG)</label>
            <input type="number" className="input" value={og} onChange={e => setOg(e.target.value)} step="0.001" min="1" placeholder="1.050" />
          </div>
        </div>
        <div className="form-row two-col">
          <div>
            <label>Final Gravity (FG)</label>
            <input type="number" className="input" value={fg} onChange={e => setFg(e.target.value)} step="0.001" min="1" placeholder="1.010" />
          </div>
          <div>
            <label>Estimated ABV</label>
            <div className="input-readonly">
              {og && fg ? `${((parseFloat(og) - parseFloat(fg)) * 131.25).toFixed(1)}%` : '—'}
            </div>
          </div>
        </div>

        <div className="form-row">
          <div className="section-header">
            <label>Ingredients</label>
            <button type="button" className="btn btn-sm" onClick={addIngredient}><Plus size={14} /> Add</button>
          </div>
          {ingredients.map((ing, i) => (
            <div key={i} className="ingredient-row">
              <input className="input" placeholder="Name" value={ing.name} onChange={e => updateIngredient(i, 'name', e.target.value)} />
              <input className="input input-sm" placeholder="Amount" value={ing.amount} onChange={e => updateIngredient(i, 'amount', e.target.value)} />
              <input className="input input-sm" placeholder="Unit" value={ing.unit} onChange={e => updateIngredient(i, 'unit', e.target.value)} />
              <button type="button" className="icon-btn danger" onClick={() => removeIngredient(i)}><Trash2 size={14} /></button>
            </div>
          ))}
        </div>

        <div className="form-row">
          <label>Recipe / Process Notes</label>
          <textarea className="textarea" value={recipe} onChange={e => setRecipe(e.target.value)} rows={4} placeholder="Describe your recipe or process..." />
        </div>
        <div className="form-row">
          <label>General Notes</label>
          <textarea className="textarea" value={notes} onChange={e => setNotes(e.target.value)} rows={3} placeholder="Observations, issues, ideas..." />
        </div>

        <div className="form-actions">
          <button type="button" className="btn" onClick={() => navigate(-1)}>Cancel</button>
          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? 'Saving...' : existing ? 'Save Changes' : 'Create Batch'}
          </button>
        </div>
      </form>
    </div>
  );
}
