"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { useRouter } from "next/navigation"
import {
  ChevronDown, ChevronLeft, ChevronRight,
  Copy, Share2, X, MessageCircle, Send, Twitter,
  Bookmark, BookmarkCheck, Trash2, Check,
} from "lucide-react"
import Link      from "next/link"
import { Button }   from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Separator} from "@/components/ui/separator"
import { Badge }    from "@/components/ui/badge"
import { SettingsPanel }   from "@/components/SettingsPanel"
import { BookChapterPicker }  from "@/components/BookChapterPicker"
import { getChapter, getBookIndex, VERSIONS, type Version, type BookMeta } from "@/lib/bible"
import {
  getChapterBookmarks, getBookmarks, toggleVerseBookmark, removeBookmark,
  type Bookmark as BM,
} from "@/lib/bookmarks"
import {
  loadHighlights, toggleHighlight, HL_COLORS, HL_COLOR_KEYS, type HlColor,
} from "@/lib/highlights"
import {
  shareNative, versePayload, chapterPayload, copyPayload,
  waLink, tgLink, xLink, type SharePayload,
} from "@/lib/share"
import { saveLastRead } from "@/lib/storage"
import { cn } from "@/lib/utils"

export default function ChapterPage({ params }: {
  params: { version: string; book: string; chapter: string }
}) {
  const version = params.version.toUpperCase() as Version
  const slug    = params.book
  const chapter = parseInt(params.chapter, 10)
  const router  = useRouter()

  // swipe
  const touchStartX = useRef(0)
  const touchStartY = useRef(0)
  // click-outside for floating buttons
  const floatingRef = useRef<HTMLDivElement>(null)

  // ── State ────────────────────────────────────────────────────────────────
  const [verses,       setVerses]      = useState<string[]>([])
  const [bookName,     setBookName]    = useState("")
  const [bookIndex,    setBookIndex]   = useState<BookMeta[]>([])
  const [loading,      setLoading]     = useState(true)
  const [flashVerse,   setFlashVerse]  = useState<number | null>(null)
  const [highlights,   setHighlights]  = useState<Record<number, HlColor>>({})
  const [copied,       setCopied]      = useState(false)
  const [sharePayload, setSharePayload] = useState<SharePayload | null>(null)
  const [pickerOpen,   setPickerOpen]  = useState(false)

  // Multi-select
  const [selected,     setSelected]    = useState<Set<number>>(new Set())

  // Verse bookmarks
  const [bkVerses,     setBkVerses]    = useState<Set<number>>(new Set())

  // Floating panel states
  const [versionOpen,  setVersionOpen] = useState(false)
  const [bookmarkOpen, setBookmarkOpen] = useState(false)
  const [allBookmarks, setAllBookmarks] = useState<BM[]>([])

  // ── Load chapter ────────────────────────────────────────────────────────
  useEffect(() => {
    setLoading(true); setVerses([]); setSelected(new Set())
    setFlashVerse(null); setSharePayload(null)
    setVersionOpen(false); setBookmarkOpen(false)

    Promise.all([getChapter(version, slug, chapter), getBookIndex(version)])
      .then(([{ verses, bookName }, index]) => {
        setVerses(verses); setBookName(bookName); setBookIndex(index)
        setBkVerses(getChapterBookmarks(version, slug, chapter))
        setHighlights(loadHighlights(version, slug, chapter))
        saveLastRead({ version, slug, bookName, chapter })

        const hash = window.location.hash
        if (hash.startsWith("#v")) {
          const vNum = parseInt(hash.slice(2))
          if (!isNaN(vNum) && vNum >= 1) {
            setFlashVerse(vNum - 1)
            setTimeout(() => document.getElementById(`v${vNum}`)?.scrollIntoView({ behavior:"smooth", block:"center" }), 400)
            setTimeout(() => setFlashVerse(null), 2800)
          }
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [version, slug, chapter])

  // ── Click-outside for floating popups ───────────────────────────────────
  useEffect(() => {
    if (!versionOpen && !bookmarkOpen) return
    function onPointerDown(e: PointerEvent) {
      if (!floatingRef.current?.contains(e.target as Node)) {
        setVersionOpen(false); setBookmarkOpen(false)
      }
    }
    document.addEventListener("pointerdown", onPointerDown, true)
    return () => document.removeEventListener("pointerdown", onPointerDown, true)
  }, [versionOpen, bookmarkOpen])

  // ── Navigation ───────────────────────────────────────────────────────────
  const curMeta  = bookIndex.find(b => b.slug === slug)
  const bookPos  = bookIndex.findIndex(b => b.slug === slug)
  const isFirst  = chapter === 1
  const isLast   = curMeta ? chapter >= curMeta.chapters : false
  const prevBook = bookPos > 0 ? bookIndex[bookPos - 1] : null
  const nextBook = bookPos >= 0 && bookPos < bookIndex.length - 1 ? bookIndex[bookPos + 1] : null

  const prevUrl = isFirst ? (prevBook ? `/${version}/${prevBook.slug}/${prevBook.chapters}` : null) : `/${version}/${slug}/${chapter - 1}`
  const nextUrl = isLast  ? (nextBook ? `/${version}/${nextBook.slug}/1` : null) : `/${version}/${slug}/${chapter + 1}`

  // ── Helpers ─────────────────────────────────────────────────────────────
  const showCopied = () => { setCopied(true); setTimeout(() => setCopied(false), 2000) }

  const toggleVerse = (i: number) => {
    setSelected(prev => {
      const next = new Set(prev)
      if (next.has(i)) next.delete(i)
      else next.add(i)
      return next
    })
  }

  const clearSelection = () => setSelected(new Set())

  // ── Multi-select derived ─────────────────────────────────────────────────
  const sortedSel = Array.from(selected).sort((a, b) => a - b)

  const allSameColor: HlColor | null = selected.size > 0
    ? (HL_COLOR_KEYS.find(c => sortedSel.every(i => highlights[i] === c)) ?? null)
    : null

  const allSelectedBk: boolean = selected.size > 0
    ? sortedSel.every(i => bkVerses.has(i + 1))
    : false

  // ── Actions ─────────────────────────────────────────────────────────────
  const handleHighlight = (color: HlColor) => {
    for (const idx of selected) toggleHighlight(version, slug, chapter, idx, color)
    setHighlights(loadHighlights(version, slug, chapter))
    clearSelection()
  }

  const handleVerseBookmarks = () => {
    if (allSelectedBk) {
      for (const idx of selected) removeBookmark(version, slug, chapter, idx + 1)
    } else {
      for (const idx of selected) {
        if (!bkVerses.has(idx + 1))
          toggleVerseBookmark({ version, slug, bookName, chapter, verse: idx + 1 })
      }
    }
    setBkVerses(getChapterBookmarks(version, slug, chapter))
    clearSelection()
  }

  const handleCopySelected = async () => {
    const text = sortedSel.map(i => `${i + 1} ${verses[i]}`).join("\n")
    await navigator.clipboard.writeText(`${bookName} ${chapter} (${version})\n\n${text}`)
    showCopied(); clearSelection()
  }

  const handleShareSelected = async () => {
    const text = sortedSel.map(i => `${i + 1} ${verses[i]}`).join("\n")
    const vRange = sortedSel.length > 1
      ? `${sortedSel[0]+1}–${sortedSel[sortedSel.length-1]+1}`
      : `${sortedSel[0]+1}`
    const payload: SharePayload = {
      title: `${bookName} ${chapter}:${vRange}`,
      text:  `${bookName} ${chapter}:${vRange} (${version})\n\n${text}`,
      url:   `${typeof window !== "undefined" ? window.location.origin : ""}/${version}/${slug}/${chapter}#v${sortedSel[0]+1}`,
    }
    const ok = await shareNative(payload)
    if (!ok) setSharePayload(payload)
    clearSelection()
  }

  const handleChapterShare = async () => {
    const payload = chapterPayload({ version, bookName, chapter, slug })
    const ok = await shareNative(payload)
    if (!ok) setSharePayload(payload)
  }

  const handleChapterCopy = async () => {
    const text = verses.map((v, i) => `${i + 1} ${v}`).join("\n")
    await navigator.clipboard.writeText(`${bookName} ${chapter} (${version})\n\n${text}`)
    showCopied()
  }

  const handleRemoveBk = (bm: BM) => {
    removeBookmark(bm.version, bm.slug, bm.chapter, bm.verse)
    setAllBookmarks(prev => prev.filter(b => b.id !== bm.id))
    if (bm.version === version && bm.slug === slug && bm.chapter === chapter)
      setBkVerses(getChapterBookmarks(version, slug, chapter))
  }

  const fmtDate = (ts: number) =>
    new Intl.DateTimeFormat("id-ID", { day:"numeric", month:"short" }).format(new Date(ts))

  const openBookmarkPopup = () => {
    setAllBookmarks(getBookmarks())
    setBookmarkOpen(v => !v)
    setVersionOpen(false)
  }

  // ── Render ───────────────────────────────────────────────────────────────
  return (
    <div
      className="min-h-dvh flex flex-col bg-background"
      onTouchStart={e => {
        touchStartX.current = e.changedTouches[0].clientX
        touchStartY.current = e.changedTouches[0].clientY
      }}
      onTouchEnd={e => {
        const dx = e.changedTouches[0].clientX - touchStartX.current
        const dy = e.changedTouches[0].clientY - touchStartY.current
        if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 55) {
          if (dx < 0 && nextUrl) router.push(nextUrl)
          else if (dx > 0 && prevUrl) router.push(prevUrl)
        }
      }}
    >
      {/* ── Header ─────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-40 flex items-center gap-1 px-1 py-2 bg-background border-b border-border">
        {prevUrl
          ? <Link href={prevUrl} className="h-9 w-9 flex items-center justify-center shrink-0 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors">
              <ChevronLeft className="h-5 w-5" />
            </Link>
          : <div className="h-9 w-9 shrink-0" />}

        <button onClick={() => setPickerOpen(true)}
          className="flex-1 flex flex-col items-center justify-center py-1 rounded-lg hover:bg-muted/40 transition-colors min-w-0">
          <span className="font-semibold text-sm text-foreground truncate leading-tight flex items-center gap-1">
            {loading ? "Memuat..." : `${bookName} ${chapter}`}
            <ChevronDown className="h-3 w-3 text-muted-foreground shrink-0" />
          </span>
          <span className="text-[10px] text-muted-foreground leading-tight">
            {!loading && `${verses.length} ayat`}
          </span>
        </button>

        {nextUrl
          ? <Link href={nextUrl} className="h-9 w-9 flex items-center justify-center shrink-0 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors">
              <ChevronRight className="h-5 w-5" />
            </Link>
          : <div className="h-9 w-9 shrink-0" />}

        <SettingsPanel chapter={{
          copied:      copied,
          compareHref: `/compare/${slug}/${chapter}`,
          onCopy:      handleChapterCopy,
          onShare:     handleChapterShare,
        }} />
      </header>

      {/* ── Verse list ─────────────────────────────────────────────────── */}
      <main className="flex-1 px-5 pt-6 pb-36 max-w-[660px] mx-auto w-full">
        {loading ? (
          <div className="space-y-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="flex gap-3">
                <Skeleton className="h-4 w-5 shrink-0 mt-0.5" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className={cn("h-4", i % 3 === 0 ? "w-4/5" : "w-3/4")} />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-0.5">
            {verses.map((text, i) => {
              const hlColor     = highlights[i] as HlColor | undefined
              const isFlash     = flashVerse === i
              const isSel       = selected.has(i)
              const isBookmarked = bkVerses.has(i + 1)
              return (
                <div key={i} id={`v${i + 1}`}
                  onClick={() => toggleVerse(i)}
                  className={cn(
                    "flex gap-3 px-1.5 py-1 pb-3 rounded-md cursor-pointer transition-colors select-none",
                    isFlash    && "bg-yellow-200/40 dark:bg-yellow-900/20",
                    isSel      && "bg-primary/8",
                    !isFlash && !isSel && hlColor && `hl-${hlColor}`,
                    !isFlash && !isSel && !hlColor && "hover:bg-muted/50",
                  )}>
                  <span className={cn(
                    "relative text-[0.6rem] font-bold font-sans w-5 text-right shrink-0 pt-1 leading-none",
                    isSel ? "text-primary" : "text-primary/50"
                  )}>
                    {isSel ? <Check className="h-2.5 w-2.5 ml-auto" /> : i + 1}
                    {isBookmarked && !isSel && (
                      <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-primary" />
                    )}
                  </span>
                  <span className="verse-serif text-foreground">{text}</span>
                </div>
              )
            })}
          </div>
        )}
      </main>

      {/* ── Multi-select action bar ─────────────────────────────────────── */}
      {selected.size > 0 && (
        <div className="fixed bottom-0 inset-x-0 z-40 bg-background/96 backdrop-blur-sm border-t border-border">
          <div className="flex items-center gap-2 px-3 py-3 max-w-[660px] mx-auto">
            {/* Count */}
            <span className="text-xs font-medium text-muted-foreground shrink-0 min-w-[52px]">
              {selected.size} dipilih
            </span>

            {/* Highlight colors */}
            <div className="flex items-center gap-1.5 shrink-0">
              {HL_COLOR_KEYS.map(color => (
                <button key={color}
                  onClick={() => handleHighlight(color)}
                  title={color}
                  className={cn(
                    "w-5 h-5 rounded-full border-2 transition-all active:scale-110",
                    allSameColor === color ? "border-foreground scale-110" : "border-transparent"
                  )}
                  style={{ background: HL_COLORS[color].swatch }}
                />
              ))}
            </div>

            <Separator orientation="vertical" className="h-5 mx-0.5 shrink-0" />

            {/* Bookmark */}
            <button onClick={handleVerseBookmarks}
              className="h-8 w-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors shrink-0">
              {allSelectedBk
                ? <BookmarkCheck className="h-4 w-4 text-primary" fill="currentColor" />
                : <Bookmark className="h-4 w-4" />}
            </button>

            {/* Copy */}
            <button onClick={handleCopySelected}
              className="h-8 px-2.5 rounded-lg flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground hover:bg-muted transition-colors shrink-0">
              <Copy className="h-3.5 w-3.5" /> Salin
            </button>

            {/* Share */}
            <button onClick={handleShareSelected}
              className="h-8 px-2.5 rounded-lg flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground hover:bg-muted transition-colors shrink-0">
              <Share2 className="h-3.5 w-3.5" />
            </button>

            {/* Cancel (right-aligned) */}
            <button onClick={clearSelection}
              className="ml-auto h-8 w-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors shrink-0">
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* ── Floating bottom-left: Version + Bookmark ────────────────────── */}
      <div
        ref={floatingRef}
        className="fixed left-4 z-30 flex items-end gap-2"
        style={{
          bottom: selected.size > 0 ? "68px" : "24px",
          transition: "bottom 0.2s ease-out",
        }}
      >
        {/* ── Version button ──────────────────────────────────────────── */}
        <div className="relative">
          {versionOpen && (
            <div className="absolute bottom-[calc(100%+8px)] left-0 bg-popover border border-border rounded-2xl shadow-2xl shadow-black/10 overflow-hidden min-w-[200px] z-50">
              <div className="px-3 py-2.5 border-b border-border">
                <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Versi</p>
              </div>
              {VERSIONS.map(v => (
                <button key={v.code}
                  onClick={() => { router.push(`/${v.code}/${slug}/${chapter}`); setVersionOpen(false) }}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-2.5 text-left hover:bg-muted transition-colors",
                    version === v.code ? "bg-primary/5" : ""
                  )}>
                  <span className={cn("text-sm font-bold w-8 shrink-0", version === v.code ? "text-primary" : "text-foreground")}>
                    {v.code}
                  </span>
                  <span className="text-xs text-muted-foreground flex-1">{v.desc}</span>
                  {version === v.code && <Check className="h-3.5 w-3.5 text-primary shrink-0" />}
                </button>
              ))}
            </div>
          )}
          <button
            onClick={() => { setVersionOpen(v => !v); setBookmarkOpen(false) }}
            className={cn(
              "h-10 px-4 rounded-2xl border shadow-lg shadow-black/10 text-sm font-bold transition-all active:scale-95",
              versionOpen
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-card text-foreground border-border hover:border-primary/40"
            )}>
            {version}
          </button>
        </div>

        {/* ── Bookmark button ─────────────────────────────────────────── */}
        <div className="relative">
          {bookmarkOpen && (
            <div className="absolute bottom-[calc(100%+8px)] left-0 bg-popover border border-border rounded-2xl shadow-2xl shadow-black/10 overflow-hidden z-50"
              style={{ width: "260px", maxHeight: "280px" }}>
              <div className="flex items-center justify-between px-3 py-2.5 border-b border-border shrink-0">
                <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Bookmark</p>
                {allBookmarks.length > 0 && (
                  <span className="text-[10px] text-muted-foreground">{allBookmarks.length} ayat</span>
                )}
              </div>
              <div className="overflow-y-auto" style={{ maxHeight: "224px" }}>
                {allBookmarks.length === 0 ? (
                  <div className="flex flex-col items-center gap-2 py-8 px-4">
                    <Bookmark className="h-6 w-6 text-muted-foreground/30" />
                    <p className="text-xs text-muted-foreground text-center leading-relaxed">
                      Belum ada bookmark.<br/>Pilih ayat → tap ikon bookmark.
                    </p>
                  </div>
                ) : allBookmarks.map((bm, idx) => (
                  <div key={bm.id}>
                    <div className="flex items-center">
                      <Link
                        href={`/${bm.version}/${bm.slug}/${bm.chapter}#v${bm.verse}`}
                        onClick={() => setBookmarkOpen(false)}
                        className="flex-1 px-3 py-2.5 hover:bg-muted transition-colors min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">
                          {bm.bookName} {bm.chapter}:{bm.verse}
                        </p>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <Badge variant="outline" className="text-[9px] py-0 h-4">{bm.version}</Badge>
                          <span className="text-[10px] text-muted-foreground">{fmtDate(bm.savedAt)}</span>
                        </div>
                      </Link>
                      <button onClick={() => handleRemoveBk(bm)}
                        className="px-2.5 py-3 text-muted-foreground hover:text-destructive transition-colors shrink-0">
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                    {idx < allBookmarks.length - 1 && <Separator />}
                  </div>
                ))}
              </div>
            </div>
          )}
          <button
            onClick={openBookmarkPopup}
            className={cn(
              "h-10 w-10 rounded-2xl border shadow-lg shadow-black/10 flex items-center justify-center transition-all active:scale-95 relative",
              bookmarkOpen
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-card text-foreground border-border hover:border-primary/40"
            )}>
            <Bookmark className={cn("h-4 w-4", bkVerses.size > 0 && !bookmarkOpen ? "fill-current text-primary" : "")} />
            {bkVerses.size > 0 && !bookmarkOpen && (
              <span className="absolute top-0 right-0 w-2.5 h-2.5 rounded-full bg-primary border-2 border-background" />
            )}
          </button>
        </div>
      </div>

      {/* ── Share panel (chapter-level) ─────────────────────────────────── */}
      {sharePayload && selected.size === 0 && (
        <>
          <div className="fixed inset-0 z-50 bg-black/30" onClick={() => setSharePayload(null)} />
          <div className="fixed bottom-0 inset-x-0 z-50 bg-background rounded-t-2xl border-t border-border shadow-2xl pb-[env(safe-area-inset-bottom,0px)]">
            <div className="flex items-center justify-between px-4 pt-4 pb-3">
              <p className="font-semibold text-sm text-foreground">Bagikan ke</p>
              <button onClick={() => setSharePayload(null)}
                className="h-7 w-7 rounded-full bg-muted flex items-center justify-center text-muted-foreground">
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
            <Separator />
            <div className="flex flex-col py-1">
              <button onClick={async () => { await copyPayload(sharePayload); showCopied(); setSharePayload(null) }}
                className="flex items-center gap-3 px-4 py-3 hover:bg-muted/50 transition-colors text-sm">
                <Copy className="h-4 w-4 text-muted-foreground shrink-0" /> Salin teks
              </button>
              <a href={waLink(`${sharePayload.text}\n${sharePayload.url}`)} target="_blank" rel="noopener noreferrer"
                onClick={() => setSharePayload(null)}
                className="flex items-center gap-3 px-4 py-3 hover:bg-muted/50 transition-colors text-sm">
                <MessageCircle className="h-4 w-4 text-muted-foreground shrink-0" /> WhatsApp
              </a>
              <a href={tgLink(sharePayload.text, sharePayload.url)} target="_blank" rel="noopener noreferrer"
                onClick={() => setSharePayload(null)}
                className="flex items-center gap-3 px-4 py-3 hover:bg-muted/50 transition-colors text-sm">
                <Send className="h-4 w-4 text-muted-foreground shrink-0" /> Telegram
              </a>
              <a href={xLink(sharePayload.text, sharePayload.url)} target="_blank" rel="noopener noreferrer"
                onClick={() => setSharePayload(null)}
                className="flex items-center gap-3 px-4 py-3 hover:bg-muted/50 transition-colors text-sm">
                <Twitter className="h-4 w-4 text-muted-foreground shrink-0" /> X / Twitter
              </a>
            </div>
          </div>
        </>
      )}

      {/* ── Book + Chapter Picker ────────────────────────────────────────── */}
      <BookChapterPicker
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        version={version}
        currentSlug={slug}
        currentChapter={chapter}
      />
    </div>
  )
}
