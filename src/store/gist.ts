import type { AppData, GistSettings } from '../types';

const GIST_FILENAME = 'booze-tracker.json';
const SETTINGS_KEY = 'booze_gist_settings';

export function getSettings(): GistSettings | null {
  const raw = localStorage.getItem(SETTINGS_KEY);
  return raw ? JSON.parse(raw) : null;
}

export function saveSettings(settings: GistSettings) {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}

export function clearSettings() {
  localStorage.removeItem(SETTINGS_KEY);
}

async function headers(token: string) {
  return {
    Authorization: `Bearer ${token}`,
    Accept: 'application/vnd.github+json',
    'Content-Type': 'application/json',
  };
}

export async function loadFromGist(settings: GistSettings): Promise<AppData> {
  if (!settings.gistId) return { batches: [], version: 1 };
  const res = await fetch(`https://api.github.com/gists/${settings.gistId}`, {
    headers: await headers(settings.token),
  });
  if (!res.ok) throw new Error(`Gist fetch failed: ${res.status}`);
  const gist = await res.json();
  const content = gist.files[GIST_FILENAME]?.content;
  if (!content) return { batches: [], version: 1 };
  return JSON.parse(content);
}

export async function saveToGist(settings: GistSettings, data: AppData): Promise<string> {
  const body = {
    description: 'Booze Tracker data',
    public: false,
    files: { [GIST_FILENAME]: { content: JSON.stringify(data, null, 2) } },
  };

  if (settings.gistId) {
    const res = await fetch(`https://api.github.com/gists/${settings.gistId}`, {
      method: 'PATCH',
      headers: await headers(settings.token),
      body: JSON.stringify(body),
    });
    if (!res.ok) throw new Error(`Gist update failed: ${res.status}`);
    return settings.gistId;
  } else {
    const res = await fetch('https://api.github.com/gists', {
      method: 'POST',
      headers: await headers(settings.token),
      body: JSON.stringify(body),
    });
    if (!res.ok) throw new Error(`Gist create failed: ${res.status}`);
    const gist = await res.json();
    return gist.id as string;
  }
}

export async function validateToken(token: string): Promise<boolean> {
  const res = await fetch('https://api.github.com/user', {
    headers: await headers(token),
  });
  return res.ok;
}
