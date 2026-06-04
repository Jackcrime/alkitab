"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import {
  ChevronDown, ChevronLeft, ChevronRight,
  Copy, Share2, X, MessageCircle, Send, Twitter,
} from "lucide-react"
import Link from "next/link"
import { Button }        from "@/components/ui/button"
import { Skeleton }      from "@/components/ui/skeleton"
import { Separator }     from "@/components/ui/separator"
import {
  DropdownMenu, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { VersionSwitcher }       from "@/components/VersionSwitcher"
import { SettingsPanel }         from "@/components/SettingsPanel"
import { ShareDropdownContent }  from "@/components/ShareDropdown"
import { BookChapterPicker }     from "@/components/BookChapterPicker"
import { getChapter, getBookIndex, type Version, type BookMeta } from "@/lib/bible"
import { toggleBookmark, isBookmarked }                          from "@/lib/bookmarks"
import { loadHighlights, toggleHighlight, HL_COLORS, HL_COLOR_KEYS, type HlColor } from "@/lib/highlights"
import { shareNative, versePayload, chapterPayload, copyPayload, waLink, tgLink, xLink, type SharePayload } from "@/lib/share"
import { saveLastRead }          from "@/lib/storage"
import { cn }                    from "@/lib/utils"

export default function ChapterPage({ params }: { params: { version: string; book: string; chapter: string } }) {
  const version = params.version.toUpperCase() as Version
  const slug    = params.book
  const chapter = parseInt(params.chapter, 10)
  const router  = useRouter()

  // swipe
  const touchStartX = useRef(0)
  const touchStartY = useRef(0)

  const [verses,       setVerses]      = useState<string[]>([])
  const [bookName,     setBookName]    = useState("")
  const [bookIndex,    setBookIndex]   = useState<BookMeta[]>([])
  const [loading,      setLoading]     = useState(true)
  const [bookmarked,   setBookmarked]  = useState(false)
  const [selected,     setSelected]    = useState<number | null>(null)
  const [flashVerse,   setFlashVerse]  = useState<number | null>(null)
  const [highlights,   setHighlights]  = useState<Record<number, HlColor>>({})
  const [copied,       setCopied]      = useState(false)
  const [sharePayload, setSharePayload]= useState<SharePayload | null>(null)
  const [pickerOpen,   setPickerOpen]  = useState(false)

  // ── Load ────────────────────────────────────────────────────────────────────
  useEffect(() => {
    setLoading(true); setVerses([]); setSelected(null)
    setFlashVerse(null); setSharePayload(null)

    Promise.all([getChapter(version, slug, chapter), getBookIndex(version)])
      .then(([{ verses, bookName }, index]) => {
        setVerses(verses); setBookName(bookName); setBookIndex(index)
        setBookmarked(isBookmarked(version, slug, chapter))
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

  // ── Cross-book nav ──────────────────────────────────────────────────────────
  const curMeta  = bookIndex.find(b => b.slug === slug)
  const bookPos  = bookIndex.findIndex(b => b.slug === slug)
  const isFirst  = chapter === 1
  const isLast   = curMeta ? chapter >= curMeta.chapters : false
  const prevBook = bookPos > 0 ? bookIndex[bookPos - 1] : null
  const nextBook = bookPos >= 0 && bookPos < bookIndex.length - 1 ? bookIndex[bookPos + 1] : null

  const prevUrl = isFirst ? (prevBook ? `/${version}/${prevBook.slug}/${prevBook.chapters}` : null) : `/${version}/${slug}/${chapter - 1}`
  const nextUrl = isLast  ? (nextBook ? `/${version}/${nextBook.slug}/1` : null) : `/${version}/${slug}/${chapter + 1}`

  // ── Actions ─────────────────────────────────────────────────────────────────
  const showCopied = () => { setCopied(true); setTimeout(() => setCopied(false), 2000) }
  const handleBookmark = () => setBookmarked(toggleBookmark({ version, slug, bookName, chapter }))

  const handleHighlight = (idx: number, color: HlColor) => {
    setHighlights(toggleHighlight(version, slug, chapter, idx, color))
    setSelected(null)
  }

  const handleShare = async (idx?: number) => {
    const payload = idx !== undefined
      ? versePayload({ version, bookName, chapter, verse: idx + 1, text: verses[idx], slug })
      : chapterPayload({ version, bookName, chapter, slug })
    const ok = await shareNative(payload)
    if (!ok) setSharePayload(payload)
    if (idx !== undefined) setSelected(null)
  }

  const handleCopy = async (idx?: number) => {
    if (idx !== undefined) {
      await copyPayload(versePayload({ version, bookName, chapter, verse: idx + 1, text: verses[idx], slug }))
      setSelected(null)
    } else {
      const text = verses.map((v, i) => `${i + 1} ${v}`).join("\n")
      await navigator.clipboard.writeText(`${bookName} ${chapter} (${version})\n\n${text}`)
    }
    showCopied()
  }

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
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-40 flex items-center gap-1 px-1 py-2 bg-background border-b border-border">

        {/* Prev chapter */}
        {prevUrl ? (
          <Link href={prevUrl}
            className="h-9 w-9 flex items-center justify-center shrink-0 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors">
            <ChevronLeft className="h-5 w-5" />
          </Link>
        ) : (
          <div className="h-9 w-9 shrink-0" />
        )}

        {/* Centered title — tappable → opens BookChapterPicker */}
        <button
          onClick={() => setPickerOpen(true)}
          className="flex-1 flex flex-col items-center justify-center py-1 rounded-lg hover:bg-muted/40 transition-colors min-w-0"
        >
          <span className="font-semibold text-sm text-foreground truncate leading-tight flex items-center gap-1">
            {loading ? "Memuat..." : `${bookName} ${chapter}`}
            <ChevronDown className="h-3 w-3 text-muted-foreground shrink-0" />
          </span>
          <span className="text-[10px] text-muted-foreground leading-tight">
            {!loading && `${verses.length} ayat · ${version}`}
          </span>
        </button>

        {/* Next chapter */}
        {nextUrl ? (
          <Link href={nextUrl}
            className="h-9 w-9 flex items-center justify-center shrink-0 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors">
            <ChevronRight className="h-5 w-5" />
          </Link>
        ) : (
          <div className="h-9 w-9 shrink-0" />
        )}

        {/* Version + Settings */}
        <div className="flex items-center gap-0.5 shrink-0">
          <VersionSwitcher current={version} slug={slug} chapter={chapter} />
          <SettingsPanel chapter={{
            bookmarked,
            copied,
            compareHref: `/compare/${slug}/${chapter}`,
            onBookmark:  handleBookmark,
            onCopy:      () => handleCopy(),
            onShare:     () => handleShare(),
          }} />
        </div>
      </header>

      {/* ── Verse list ─────────────────────────────────────────────────────── */}
      <main className="flex-1 px-5 pt-6 pb-16 max-w-[660px] mx-auto w-full">
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
              const hlColor = highlights[i] as HlColor | undefined
              const isFlash = flashVerse === i
              const isSel   = selected === i
              return (
                <div key={i} id={`v${i + 1}`}
                  onClick={() => setSelected(isSel ? null : i)}
                  className={cn(
                    "flex gap-3 px-1.5 py-1 pb-3 rounded-md cursor-pointer transition-colors",
                    isFlash   && "bg-yellow-200/40 dark:bg-yellow-900/20",
                    isSel     && "bg-primary/8",
                    !isFlash && !isSel && hlColor && `hl-${hlColor}`,
                    !isFlash && !isSel && !hlColor && "hover:bg-muted/50",
                  )}>
                  <span className="text-primary/50 text-[0.6rem] font-bold font-sans w-5 text-right shrink-0 pt-1 leading-none select-none">
                    {i + 1}
                  </span>
                  <span className="verse-serif text-foreground">{text}</span>
                </div>
              )
            })}
          </div>
        )}
      </main>

      {/* ── Verse action bar ───────────────────────────────────────────────── */}
      {selected !== null && (
        <div className="fixed bottom-6 inset-x-3 z-50 flex items-center justify-between gap-2 px-3 py-2.5 bg-background border border-border rounded-2xl shadow-xl">
          <span className="text-xs text-muted-foreground truncate max-w-[90px]">
            {bookName} {chapter}:{selected + 1}
          </span>
          <div className="flex items-center gap-1.5">
            {HL_COLOR_KEYS.map(color => (
              <button key={color}
                onClick={() => handleHighlight(selected, color)}
                className={cn(
                  "w-4 h-4 rounded-full border-2 transition-all",
                  highlights[selected] === color ? "border-foreground scale-110" : "border-transparent"
                )}
                style={{ background: HL_COLORS[color].swatch }}
              />
            ))}
            <Separator orientation="vertical" className="h-4 mx-1" />
            <Button variant="ghost" size="sm" className="h-7 px-2 text-xs gap-1"
              onClick={() => handleCopy(selected)}>
              <Copy className="h-3 w-3" /> Salin
            </Button>
            <DropdownMenu open={!!sharePayload && selected !== null} onOpenChange={o => !o && setSharePayload(null)}>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-7 px-2 text-xs gap-1"
                  onClick={() => handleShare(selected)}>
                  <Share2 className="h-3 w-3" /> Bagikan
                </Button>
              </DropdownMenuTrigger>
              {sharePayload && selected !== null && (
                <ShareDropdownContent payload={sharePayload} onClose={() => setSharePayload(null)} onCopied={showCopied} />
              )}
            </DropdownMenu>
            <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground"
              onClick={() => setSelected(null)}>
              <X className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      )}

      {/* ── Chapter-level share panel (fallback when native share unavailable) */}
      {sharePayload && selected === null && (
        <>
          {/* backdrop */}
          <div
            className="fixed inset-0 z-50 bg-black/30"
            onClick={() => setSharePayload(null)}
          />
          {/* sheet */}
          <div className="fixed bottom-0 inset-x-0 z-50 bg-background rounded-t-2xl border-t border-border shadow-2xl pb-[env(safe-area-inset-bottom,0px)]">
            <div className="flex items-center justify-between px-4 pt-4 pb-3">
              <p className="font-semibold text-sm text-foreground">Bagikan ke</p>
              <button onClick={() => setSharePayload(null)}
                className="h-7 w-7 rounded-full bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors">
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
            <Separator />
            <div className="flex flex-col py-1">
              <button
                onClick={async () => { await copyPayload(sharePayload); showCopied(); setSharePayload(null) }}
                className="flex items-center gap-3 px-4 py-3 hover:bg-muted/50 transition-colors text-left text-sm"
              >
                <Copy className="h-4 w-4 text-muted-foreground shrink-0" />
                Salin teks
              </button>
              <a href={waLink(`${sharePayload.text}\n${sharePayload.url}`)} target="_blank" rel="noopener noreferrer"
                onClick={() => setSharePayload(null)}
                className="flex items-center gap-3 px-4 py-3 hover:bg-muted/50 transition-colors text-sm">
                <MessageCircle className="h-4 w-4 text-muted-foreground shrink-0" />
                WhatsApp
              </a>
              <a href={tgLink(sharePayload.text, sharePayload.url)} target="_blank" rel="noopener noreferrer"
                onClick={() => setSharePayload(null)}
                className="flex items-center gap-3 px-4 py-3 hover:bg-muted/50 transition-colors text-sm">
                <Send className="h-4 w-4 text-muted-foreground shrink-0" />
                Telegram
              </a>
              <a href={xLink(sharePayload.text, sharePayload.url)} target="_blank" rel="noopener noreferrer"
                onClick={() => setSharePayload(null)}
                className="flex items-center gap-3 px-4 py-3 hover:bg-muted/50 transition-colors text-sm">
                <Twitter className="h-4 w-4 text-muted-foreground shrink-0" />
                X / Twitter
              </a>
            </div>
          </div>
        </>
      )}

      {/* ── Book + Chapter Picker ─────────────────────────────────────────── */}
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
