// ── Types ──────────────────────────────────────────────────────────────────────

export type Version = "TB" | "BIS" | "TL";

export const VERSIONS: { code: Version; label: string; desc: string }[] = [
  { code: "TB",  label: "TB",  desc: "Terjemahan Baru" },
  { code: "BIS", label: "BIS", desc: "Bahasa Indonesia Sehari-hari" },
  { code: "TL",  label: "TL",  desc: "Terjemahan Lama" },
];

export const VERSION_CODES: Version[] = ["TB", "BIS", "TL"];

export interface BookMeta {
  bnumber:  number;
  name:     string;
  slug:     string;
  file:     string;
  chapters: number;
}

export interface BookData {
  bnumber:  number;
  name:     string;
  chapters: string[][]; // chapters[0] = pasal 1, chapters[0][0] = ayat 1
}

// Perjanjian Lama: kitab 1–39, Perjanjian Baru: 40–66
export function isOldTestament(bnumber: number) { return bnumber <= 39; }

// ── Fetchers ───────────────────────────────────────────────────────────────────

const BASE = "/bible";

/** Ambil daftar semua kitab untuk satu versi */
export async function getBookIndex(version: Version): Promise<BookMeta[]> {
  const res = await fetch(`${BASE}/${version}/index.json`, { cache: "force-cache" });
  if (!res.ok) throw new Error(`Gagal mengambil index ${version}`);
  return res.json();
}

/** Ambil data lengkap satu kitab (semua pasal & ayat) */
export async function getBook(version: Version, slug: string): Promise<BookData> {
  // Cari file name dari index
  const index = await getBookIndex(version);
  const meta  = index.find(b => b.slug === slug);
  if (!meta) throw new Error(`Kitab tidak ditemukan: ${slug}`);

  const res = await fetch(`${BASE}/${version}/${meta.file}`, { cache: "force-cache" });
  if (!res.ok) throw new Error(`Gagal mengambil kitab ${slug}`);
  return res.json();
}

/** Ambil teks satu pasal */
export async function getChapter(
  version: Version,
  slug: string,
  chapter: number
): Promise<{ verses: string[]; bookName: string; totalChapters: number }> {
  const [book, index] = await Promise.all([
    getBook(version, slug),
    getBookIndex(version),
  ]);
  const meta = index.find(b => b.slug === slug)!;
  return {
    verses:        book.chapters[chapter - 1] ?? [],
    bookName:      book.name,
    totalChapters: meta.chapters,
  };
}

// ── Search ─────────────────────────────────────────────────────────────────────

export interface SearchResult {
  bookName:  string;
  bookSlug:  string;
  bnumber:   number;  // 1-39 = PL, 40-66 = PB
  chapter:   number;
  verse:     number;
  text:      string;
}

/**
 * Cari teks di seluruh Alkitab (satu versi).
 * Memuat semua kitab secara paralel — akan di-cache browser setelahnya.
 * onProgress(loaded, total) dipanggil tiap kitab selesai dimuat.
 */
export async function searchBible(
  version: Version,
  query:   string,
  onProgress?: (loaded: number, total: number) => void,
): Promise<SearchResult[]> {
  const q = query.trim().toLowerCase();
  if (q.length < 2) return [];

  const index = await getBookIndex(version);
  const total  = index.length;
  let   loaded = 0;
  const results: SearchResult[] = [];

  await Promise.all(
    index.map(async (meta) => {
      const res  = await fetch(`${BASE}/${version}/${meta.file}`, { cache: "force-cache" });
      const book: BookData = await res.json();

      for (let ci = 0; ci < book.chapters.length; ci++) {
        const chapter = book.chapters[ci];
        for (let vi = 0; vi < chapter.length; vi++) {
          if (chapter[vi].toLowerCase().includes(q)) {
            results.push({
              bookName: meta.name,
              bookSlug: meta.slug,
              bnumber:  meta.bnumber,
              chapter:  ci + 1,
              verse:    vi + 1,
              text:     chapter[vi],
            });
          }
        }
      }

      loaded++;
      onProgress?.(loaded, total);
    })
  );

  // Urutkan PL → PB → pasal → ayat
  results.sort((a, b) => {
    const am = index.find(x => x.slug === a.bookSlug)!;
    const bm = index.find(x => x.slug === b.bookSlug)!;
    if (am.bnumber !== bm.bnumber) return am.bnumber - bm.bnumber;
    if (a.chapter  !== b.chapter)  return a.chapter  - b.chapter;
    return a.verse - b.verse;
  });

  return results;
}

// ── Highlight query dalam teks ─────────────────────────────────────────────────

export function highlightQuery(text: string, query: string): string {
  if (!query) return text;
  const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return text.replace(new RegExp(`(${escaped})`, "gi"), "<mark>$1</mark>");
}
