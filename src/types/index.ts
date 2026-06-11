export type BatchCategory = 'beer' | 'wine' | 'mead' | 'spirits' | 'cider' | 'kombucha' | 'other';
export type BatchStatus = 'planning' | 'fermenting' | 'conditioning' | 'ready' | 'finished' | 'failed';

export interface GravityReading {
  id: string;
  date: string;
  gravity: number;
  notes?: string;
}

export interface TastingNote {
  id: string;
  date: string;
  rating: number; // 1-5
  aroma: string;
  flavor: string;
  finish: string;
  overall: string;
}

export interface Ingredient {
  name: string;
  amount: string;
  unit: string;
}

export interface Batch {
  id: string;
  name: string;
  category: BatchCategory;
  status: BatchStatus;
  startDate: string;
  targetDate?: string;
  endDate?: string;
  volume: number;
  volumeUnit: 'L' | 'gal';
  originalGravity?: number;
  finalGravity?: number;
  abv?: number;
  ingredients: Ingredient[];
  gravityReadings: GravityReading[];
  tastingNotes: TastingNote[];
  notes: string;
  recipe?: string;
  imageUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AppData {
  batches: Batch[];
  version: number;
}

export interface GistSettings {
  token: string;
  gistId?: string;
}
