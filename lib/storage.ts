import type { Version } from "./bible";

// ── Continue Reading ─────────────────────────────────────────────────────────

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

// ── Search History ────────────────────────────────────────────────────────────

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

// ── Reading Progress ──────────────────────────────────────────────────────────
//
// Key menyertakan tahun → otomatis reset tiap 1 Januari tanpa cron apapun.
// Misal: "alkitab:read:2025", "alkitab:read:2026", dst.
// Tahun lama dibersihkan lewat cleanupOldReadYears().

function currentYear() {
  return new Date().getFullYear();
}

function readKey(year = currentYear()) {
  return `alkitab:read:${year}`;
}

const STREAK_KEY = "alkitab:streak";

export interface StreakData {
  count:   number;
  lastDay: string; // YYYY-MM-DD
}

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

export function markChapterRead(version: string, slug: string, chapter: number): void {
  if (typeof window === "undefined") return;
  const set = getReadSet();
  const key = `${version}:${slug}:${chapter}`;
  if (set.has(key)) return; // already marked, skip streak update
  set.add(key);
  localStorage.setItem(readKey(), JSON.stringify([...set]));

  // Update streak
  const today     = todayStr();
  const yesterday = new Date(Date.now() - 86_400_000).toISOString().slice(0, 10);
  const streak    = getStreak();
  if (streak.lastDay !== today) {
    localStorage.setItem(STREAK_KEY, JSON.stringify({
      count:   streak.lastDay === yesterday ? streak.count + 1 : 1,
      lastDay: today,
    }));
  }
}

export function unmarkChapterRead(version: string, slug: string, chapter: number): void {
  if (typeof window === "undefined") return;
  const set = getReadSet();
  set.delete(`${version}:${slug}:${chapter}`);
  localStorage.setItem(readKey(), JSON.stringify([...set]));
}

export function isChapterRead(version: string, slug: string, chapter: number): boolean {
  return getReadSet().has(`${version}:${slug}:${chapter}`);
}

export function getReadSet(year = currentYear()): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = localStorage.getItem(readKey(year));
    return new Set(raw ? (JSON.parse(raw) as string[]) : []);
  } catch { return new Set(); }
}

export function getReadCountByVersion(version: string): number {
  const prefix = `${version}:`;
  let count = 0;
  for (const key of getReadSet()) {
    if (key.startsWith(prefix)) count++;
  }
  return count;
}

/** Hapus data progress dari tahun-tahun sebelumnya */
export function cleanupOldReadYears(): void {
  if (typeof window === "undefined") return;
  const current = `alkitab:read:${currentYear()}`;
  Object.keys(localStorage)
    .filter(k => k.startsWith("alkitab:read:") && k !== current)
    .forEach(k => localStorage.removeItem(k));
}

export function getStreak(): StreakData {
  if (typeof window === "undefined") return { count: 0, lastDay: "" };
  try {
    const raw = localStorage.getItem(STREAK_KEY);
    return raw ? (JSON.parse(raw) as StreakData) : { count: 0, lastDay: "" };
  } catch { return { count: 0, lastDay: "" }; }
}

// Streak aktif jika terakhir baca hari ini atau kemarin
export function isStreakActive(): boolean {
  const { lastDay } = getStreak();
  if (!lastDay) return false;
  const today     = todayStr();
  const yesterday = new Date(Date.now() - 86_400_000).toISOString().slice(0, 10);
  return lastDay === today || lastDay === yesterday;
}

// ── Focus Mode ────────────────────────────────────────────────────────────────

const FOCUS_KEY = "alkitab:focusmode";

export function getFocusMode(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(FOCUS_KEY) === "1";
}

export function setFocusMode(enabled: boolean): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(FOCUS_KEY, enabled ? "1" : "0");
  window.dispatchEvent(new CustomEvent("alkitab:focusmode", { detail: { enabled } }));
}