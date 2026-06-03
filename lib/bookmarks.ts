import type { Version } from "./bible";

export interface Bookmark {
  id:       string;   // "{version}-{slug}-{chapter}"
  version:  Version;
  slug:     string;
  bookName: string;
  chapter:  number;
  savedAt:  number;   // Date.now()
}

const KEY = "alkitab:bookmarks";

function load(): Bookmark[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? "[]") as Bookmark[];
  } catch {
    return [];
  }
}

function save(bms: Bookmark[]) {
  localStorage.setItem(KEY, JSON.stringify(bms));
}

export function getBookmarks(): Bookmark[] {
  return load().sort((a, b) => b.savedAt - a.savedAt);
}

export function makeId(version: Version, slug: string, chapter: number) {
  return `${version}-${slug}-${chapter}`;
}

export function isBookmarked(version: Version, slug: string, chapter: number): boolean {
  return load().some(b => b.id === makeId(version, slug, chapter));
}

export function addBookmark(bm: Omit<Bookmark, "id" | "savedAt">) {
  const bms = load();
  const id  = makeId(bm.version, bm.slug, bm.chapter);
  if (bms.some(b => b.id === id)) return; // already exists
  bms.push({ ...bm, id, savedAt: Date.now() });
  save(bms);
}

export function removeBookmark(version: Version, slug: string, chapter: number) {
  const id = makeId(version, slug, chapter);
  save(load().filter(b => b.id !== id));
}

export function toggleBookmark(bm: Omit<Bookmark, "id" | "savedAt">): boolean {
  if (isBookmarked(bm.version, bm.slug, bm.chapter)) {
    removeBookmark(bm.version, bm.slug, bm.chapter);
    return false;
  } else {
    addBookmark(bm);
    return true;
  }
}
