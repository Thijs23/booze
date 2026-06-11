import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import type { AppData, Batch, GistSettings } from '../types';
import { getSettings, saveSettings, loadFromGist, saveToGist } from './gist';

interface DataContextType {
  data: AppData;
  settings: GistSettings | null;
  loading: boolean;
  syncing: boolean;
  error: string | null;
  connect: (settings: GistSettings) => Promise<void>;
  disconnect: () => void;
  addBatch: (batch: Batch) => Promise<void>;
  updateBatch: (batch: Batch) => Promise<void>;
  deleteBatch: (id: string) => Promise<void>;
  sync: () => Promise<void>;
}

const DataContext = createContext<DataContextType | null>(null);

export function DataProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState<AppData>({ batches: [], version: 1 });
  const [settings, setSettings] = useState<GistSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const persist = useCallback(async (newData: AppData, currentSettings: GistSettings | null) => {
    setData(newData);
    if (!currentSettings) return;
    setSyncing(true);
    setError(null);
    try {
      const gistId = await saveToGist(currentSettings, newData);
      if (!currentSettings.gistId) {
        const updated = { ...currentSettings, gistId };
        setSettings(updated);
        saveSettings(updated);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Sync failed');
    } finally {
      setSyncing(false);
    }
  }, []);

  useEffect(() => {
    const stored = getSettings();
    if (!stored) { setLoading(false); return; }
    setSettings(stored);
    loadFromGist(stored)
      .then(d => setData(d))
      .catch(e => setError(e instanceof Error ? e.message : 'Load failed'))
      .finally(() => setLoading(false));
  }, []);

  const connect = async (s: GistSettings) => {
    setSyncing(true);
    setError(null);
    try {
      let loaded: AppData = { batches: [], version: 1 };
      if (s.gistId) loaded = await loadFromGist(s);
      saveSettings(s);
      setSettings(s);
      setData(loaded);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Connection failed');
      throw e;
    } finally {
      setSyncing(false);
    }
  };

  const disconnect = () => {
    localStorage.removeItem('booze_gist_settings');
    setSettings(null);
    setData({ batches: [], version: 1 });
  };

  const addBatch = (batch: Batch) => {
    const newData = { ...data, batches: [...data.batches, batch] };
    return persist(newData, settings);
  };

  const updateBatch = (batch: Batch) => {
    const newData = { ...data, batches: data.batches.map(b => b.id === batch.id ? batch : b) };
    return persist(newData, settings);
  };

  const deleteBatch = (id: string) => {
    const newData = { ...data, batches: data.batches.filter(b => b.id !== id) };
    return persist(newData, settings);
  };

  const sync = async () => {
    if (!settings) return;
    setSyncing(true);
    setError(null);
    try {
      const fresh = await loadFromGist(settings);
      setData(fresh);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Sync failed');
    } finally {
      setSyncing(false);
    }
  };

  return (
    <DataContext.Provider value={{ data, settings, loading, syncing, error, connect, disconnect, addBatch, updateBatch, deleteBatch, sync }}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error('useData must be used within DataProvider');
  return ctx;
}
