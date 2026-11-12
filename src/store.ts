// Súkromné údaje používateľa. Všetko zostáva iba v tomto prehliadači (localStorage);
// nič sa neodosiela na žiadny server.
import { useSyncExternalStore } from 'react';

const KEY = 'cesta-k-jasliam:v1';

export interface Note {
  text: string;
  updatedAt: string;
}

export interface AppData {
  v: 1;
  done: Record<string, string>; // "2026-5" → dátum označenia
  notes: Record<string, Note>;
  saved: { key: string; text: string }[];
  settings: { short: boolean; fontScale: number; prayerTime: string };
}

export const emptyData = (): AppData => ({
  v: 1,
  done: {},
  notes: {},
  saved: [],
  settings: { short: false, fontScale: 1, prayerTime: '07:00' },
});

/** Zo vstupu (uložené dáta alebo importovaná záloha) urobí platné dáta; neznáme polia zahodí. */
export function sanitize(raw: unknown): AppData {
  const base = emptyData();
  if (!raw || typeof raw !== 'object') return base;
  const r = raw as Record<string, unknown>;
  const isKey = (k: string) => /^\d{4}-\d{1,2}$/.test(k);
  if (r.done && typeof r.done === 'object') {
    for (const [k, v] of Object.entries(r.done as object)) if (isKey(k) && typeof v === 'string') base.done[k] = v.slice(0, 40);
  }
  if (r.notes && typeof r.notes === 'object') {
    for (const [k, v] of Object.entries(r.notes as object)) {
      const n = v as Partial<Note> | null;
      if (isKey(k) && n && typeof n.text === 'string' && n.text.trim()) {
        base.notes[k] = { text: n.text.slice(0, 20_000), updatedAt: typeof n.updatedAt === 'string' ? n.updatedAt.slice(0, 40) : '' };
      }
    }
  }
  if (Array.isArray(r.saved)) {
    for (const s of r.saved as unknown[]) {
      const x = s as { key?: unknown; text?: unknown } | null;
      if (x && typeof x.key === 'string' && isKey(x.key) && typeof x.text === 'string') base.saved.push({ key: x.key, text: x.text.slice(0, 600) });
    }
  }
  if (r.settings && typeof r.settings === 'object') {
    const s = r.settings as Record<string, unknown>;
    if (typeof s.short === 'boolean') base.settings.short = s.short;
    if (typeof s.fontScale === 'number' && s.fontScale >= 0.85 && s.fontScale <= 1.5) base.settings.fontScale = s.fontScale;
    if (typeof s.prayerTime === 'string' && /^([01]\d|2[0-3]):[0-5]\d$/.test(s.prayerTime)) base.settings.prayerTime = s.prayerTime;
  }
  return base;
}

function read(): AppData {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? sanitize(JSON.parse(raw)) : emptyData();
  } catch {
    return emptyData();
  }
}

let state: AppData = typeof localStorage === 'undefined' ? emptyData() : read();
let storageOk = true;
const listeners = new Set<() => void>();

function commit(next: AppData) {
  state = next;
  try {
    localStorage.setItem(KEY, JSON.stringify(next));
    storageOk = true;
  } catch {
    storageOk = false; // napr. súkromný režim alebo plné úložisko
  }
  listeners.forEach((l) => l());
}

if (typeof window !== 'undefined') {
  window.addEventListener('storage', (e) => {
    if (e.key === KEY) {
      state = read();
      listeners.forEach((l) => l());
    }
  });
}

export const keyOf = (year: number, day: number) => `${year}-${day}`;
export const getData = () => state;
export const isStorageOk = () => storageOk;

export function useData(): AppData {
  return useSyncExternalStore(
    (cb) => {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
    () => state,
  );
}

export const actions = {
  toggleDone(key: string) {
    const done = { ...state.done };
    if (done[key]) delete done[key];
    else done[key] = new Date().toISOString();
    commit({ ...state, done });
  },
  setNote(key: string, text: string) {
    const notes = { ...state.notes };
    if (text.trim()) notes[key] = { text, updatedAt: new Date().toISOString() };
    else delete notes[key];
    commit({ ...state, notes });
  },
  toggleSaved(key: string, text: string) {
    const exists = state.saved.some((s) => s.key === key && s.text === text);
    commit({ ...state, saved: exists ? state.saved.filter((s) => !(s.key === key && s.text === text)) : [...state.saved, { key, text }] });
  },
  setSettings(patch: Partial<AppData['settings']>) {
    commit({ ...state, settings: { ...state.settings, ...patch } });
  },
  replaceAll(data: AppData) {
    commit(data);
  },
  clearAll() {
    commit(emptyData());
  },
};
