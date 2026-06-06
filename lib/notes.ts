import { openDB, type DBSchema } from "idb"
import type { Version } from "./bible"

interface AlkitabDB extends DBSchema {
  notes: {
    key:     string
    value:   Note
    indexes: { "by-chapter": [string, string, number] }
  }
}

export interface Note {
  id:        string   // "{version}-{slug}-{chapter}-{verse}"
  version:   Version
  slug:      string
  bookName:  string
  chapter:   number
  verse:     number
  text:      string
  updatedAt: number
}

function makeId(v: string, s: string, ch: number, vs: number) {
  return `${v}-${s}-${ch}-${vs}`
}

async function db() {
  return openDB<AlkitabDB>("alkitab-gkpb", 1, {
    upgrade(db) {
      const store = db.createObjectStore("notes", { keyPath: "id" })
      store.createIndex("by-chapter", ["version", "slug", "chapter"])
    },
  })
}

export async function getNote(
  version: Version, slug: string, chapter: number, verse: number,
): Promise<Note | undefined> {
  return (await db()).get("notes", makeId(version, slug, chapter, verse))
}

export async function saveNote(
  note: Omit<Note, "id" | "updatedAt">,
): Promise<void> {
  await (await db()).put("notes", {
    ...note,
    id: makeId(note.version, note.slug, note.chapter, note.verse),
    updatedAt: Date.now(),
  })
}

export async function deleteNote(
  version: Version, slug: string, chapter: number, verse: number,
): Promise<void> {
  await (await db()).delete("notes", makeId(version, slug, chapter, verse))
}

export async function getChapterNoteVerses(
  version: Version, slug: string, chapter: number,
): Promise<Set<number>> {
  const d     = await db()
  const notes = await d.getAllFromIndex("notes", "by-chapter", [version, slug, chapter])
  return new Set(notes.map(n => n.verse))
}

export async function getAllNotes(): Promise<Note[]> {
  return (await db()).getAll("notes")
}
