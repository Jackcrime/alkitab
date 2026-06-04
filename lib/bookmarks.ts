import type { Version } from "./bible";

export interface Bookmark {
  id:       string;   // "{version}-{slug}-{chapter}-{verse}"
  version:  Version;
  slug:     string;
  bookName: string;
  chapter:  number;
  verse:    number;   // 1-based verse number
  savedAt:  number;
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

function makeId(version: Version, slug: string, chapter: number, verse: number) {
  return `${version}-${slug}-${chapter}-${verse}`;
}

export function getBookmarks(): Bookmark[] {
  return load().sort((a, b) => b.savedAt - a.savedAt);
}

/** Returns set of 1-based verse numbers that are bookmarked in this chapter */
export function getChapterBookmarks(
  version: Version,
  slug: string,
  chapter: number,
): Set<number> {
  return new Set(
    load()
      .filter(b => b.version === version && b.slug === slug && b.chapter === chapter)
      .map(b => b.verse),
  );
}

export function isVerseBookmarked(
  version: Version,
  slug: string,
  chapter: number,
  verse: number,
): boolean {
  return load().some(b => b.id === makeId(version, slug, chapter, verse));
}

/** Toggle bookmark for a verse. Returns true if now bookmarked. */
export function toggleVerseBookmark(
  params: Omit<Bookmark, "id" | "savedAt">,
): boolean {
  const id      = makeId(params.version, params.slug, params.chapter, params.verse);
  const current = load();
  const exists  = current.some(b => b.id === id);
  if (exists) {
    save(current.filter(b => b.id !== id));
    return false;
  } else {
    save([...current, { ...params, id, savedAt: Date.now() }]);
    return true;
  }
}

export function removeBookmark(
  version: Version,
  slug: string,
  chapter: number,
  verse: number,
) {
  save(load().filter(b => b.id !== makeId(version, slug, chapter, verse)));
}
