import type { BatchCategory } from '../types';

const config: Record<BatchCategory, { label: string; color: string; emoji: string }> = {
  beer:     { label: 'Beer',     color: '#f59e0b', emoji: '🍺' },
  wine:     { label: 'Wine',     color: '#8b5cf6', emoji: '🍷' },
  mead:     { label: 'Mead',     color: '#d97706', emoji: '🍯' },
  spirits:  { label: 'Spirits',  color: '#ef4444', emoji: '🥃' },
  cider:    { label: 'Cider',    color: '#10b981', emoji: '🍎' },
  kombucha: { label: 'Kombucha', color: '#06b6d4', emoji: '🫙' },
  other:    { label: 'Other',    color: '#6b7280', emoji: '🍶' },
};

export function CategoryBadge({ category }: { category: BatchCategory }) {
  const c = config[category];
  return (
    <span className="badge" style={{ backgroundColor: c.color + '22', color: c.color, border: `1px solid ${c.color}44` }}>
      {c.emoji} {c.label}
    </span>
  );
}

export function categoryEmoji(category: BatchCategory) {
  return config[category].emoji;
}
