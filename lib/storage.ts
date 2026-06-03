import type { Version } from "./bible";

// ── Continue Reading ───────────────────────────────────────────────────────────

export interface LastRead {
  version:  Version;
  slug:     string;
  bookName: string;
  chapter:  number;
  readAt:   number;
}

const LAST_READ_KEY = "alkitab:lastread";

export function saveLastRead(data: Omit<LastRead, "readAt">) {
  if (typeof window === "undefined") return;
  localStorage.setItem(LAST_READ_KEY, JSON.stringify({ ...data, readAt: Date.now() }));
}

export function getLastRead(): LastRead | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(LAST_READ_KEY);
    return raw ? (JSON.parse(raw) as LastRead) : null;
  } catch { return null; }
}

// ── Search History ─────────────────────────────────────────────────────────────

const SEARCH_HIST_KEY = "alkitab:searchhist";
const MAX_HISTORY     = 8;

export function addSearchHistory(query: string) {
  if (typeof window === "undefined" || !query.trim()) return;
  const list = getSearchHistory().filter(q => q !== query.trim());
  list.unshift(query.trim());
  localStorage.setItem(SEARCH_HIST_KEY, JSON.stringify(list.slice(0, MAX_HISTORY)));
}

export function getSearchHistory(): string[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(SEARCH_HIST_KEY) ?? "[]") as string[];
  } catch { return []; }
}

export function removeSearchHistory(query: string) {
  const list = getSearchHistory().filter(q => q !== query);
  localStorage.setItem(SEARCH_HIST_KEY, JSON.stringify(list));
}

export function clearSearchHistory() {
  localStorage.removeItem(SEARCH_HIST_KEY);
}
