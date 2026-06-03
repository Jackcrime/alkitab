import type { Version } from "./bible";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://alkitab.gkpb.id";

// ── Platform share links ───────────────────────────────────────────────────────

export function waLink(text: string) {
  return `https://wa.me/?text=${encodeURIComponent(text)}`;
}
export function tgLink(text: string, url: string) {
  return `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`;
}
export function xLink(text: string, url: string) {
  return `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
}

// ── Payload builders ───────────────────────────────────────────────────────────

export interface SharePayload {
  title: string;
  text:  string;   // plain text (untuk WA, copy, dll.)
  url:   string;
}

export function versePayload({
  version, bookName, chapter, verse, text, slug,
}: {
  version: Version; bookName: string; chapter: number;
  verse: number; text: string; slug: string;
}): SharePayload {
  const ref = `${bookName} ${chapter}:${verse} (${version})`;
  const url = `${APP_URL}/${version}/${slug}/${chapter}#v${verse}`;
  return {
    title: ref,
    text:  `"${text}"\n— ${ref}`,
    url,
  };
}

export function chapterPayload({
  version, bookName, chapter, slug,
}: {
  version: Version; bookName: string; chapter: number; slug: string;
}): SharePayload {
  const ref = `${bookName} ${chapter} (${version})`;
  const url = `${APP_URL}/${version}/${slug}/${chapter}`;
  return {
    title: ref,
    text:  `Baca ${ref}`,
    url,
  };
}

// ── Core share function ────────────────────────────────────────────────────────

/**
 * Universal share:
 * - Mobile   → Web Share API (native sheet: WA, TG, IG, SMS, Notes, dll.)
 * - Desktop  → returns false → tampilkan ShareDropdown
 */
export async function shareNative(payload: SharePayload): Promise<boolean> {
  if (!navigator.share) return false;
  try {
    await navigator.share({ title: payload.title, text: payload.text, url: payload.url });
    return true;
  } catch (e: any) {
    // User dismissed atau error
    if (e?.name !== "AbortError") console.warn("[share]", e);
    return false;
  }
}

export async function copyPayload(payload: SharePayload): Promise<void> {
  await navigator.clipboard.writeText(`${payload.text}\n${payload.url}`);
}
