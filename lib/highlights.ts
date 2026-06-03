import type { Version } from "./bible";

// ── Color palette ──────────────────────────────────────────────────────────────
export const HL_COLORS = {
  yellow: {
    swatch: "#FBBF24",
    bg:     "rgba(251, 191, 36, 0.28)",
    bgDark: "rgba(251, 191, 36, 0.18)",
  },
  green: {
    swatch: "#34D399",
    bg:     "rgba(52, 211, 153, 0.22)",
    bgDark: "rgba(52, 211, 153, 0.15)",
  },
  blue: {
    swatch: "#60A5FA",
    bg:     "rgba(96, 165, 250, 0.22)",
    bgDark: "rgba(96, 165, 250, 0.15)",
  },
  pink: {
    swatch: "#F472B6",
    bg:     "rgba(244, 114, 182, 0.22)",
    bgDark: "rgba(244, 114, 182, 0.15)",
  },
  purple: {
    swatch: "#A78BFA",
    bg:     "rgba(167, 139, 250, 0.22)",
    bgDark: "rgba(167, 139, 250, 0.15)",
  },
} as const;

export type HlColor = keyof typeof HL_COLORS;
export const HL_COLOR_KEYS = Object.keys(HL_COLORS) as HlColor[];

// ── Storage ────────────────────────────────────────────────────────────────────
// Key per pasal: "alkitab:hl:TB-yohanes-3" → { "15": "yellow", "16": "green" }
type HlMap = Record<number, HlColor>;

function key(version: Version, slug: string, chapter: number) {
  return `alkitab:hl:${version}-${slug}-${chapter}`;
}

export function loadHighlights(version: Version, slug: string, chapter: number): HlMap {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(key(version, slug, chapter));
    return raw ? (JSON.parse(raw) as HlMap) : {};
  } catch { return {}; }
}

function save(version: Version, slug: string, chapter: number, map: HlMap) {
  if (Object.keys(map).length === 0) {
    localStorage.removeItem(key(version, slug, chapter));
  } else {
    localStorage.setItem(key(version, slug, chapter), JSON.stringify(map));
  }
}

/** Set warna highlight pada satu ayat */
export function setHighlight(
  version: Version, slug: string, chapter: number,
  verseIdx: number, color: HlColor
): HlMap {
  const map = loadHighlights(version, slug, chapter);
  map[verseIdx] = color;
  save(version, slug, chapter, map);
  return { ...map };
}

/** Hapus highlight dari satu ayat */
export function removeHighlight(
  version: Version, slug: string, chapter: number,
  verseIdx: number
): HlMap {
  const map = loadHighlights(version, slug, chapter);
  delete map[verseIdx];
  save(version, slug, chapter, map);
  return { ...map };
}

/** Toggle: kalau warna sama → hapus, beda / belum ada → set */
export function toggleHighlight(
  version: Version, slug: string, chapter: number,
  verseIdx: number, color: HlColor
): HlMap {
  const map = loadHighlights(version, slug, chapter);
  if (map[verseIdx] === color) {
    delete map[verseIdx];
  } else {
    map[verseIdx] = color;
  }
  save(version, slug, chapter, map);
  return { ...map };
}
