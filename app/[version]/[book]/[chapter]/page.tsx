"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  ChevronLeft, ChevronRight, Bookmark, BookmarkCheck,
  Copy, Share2, Check, X, Columns2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Separator } from "@/components/ui/separator"
import {
  DropdownMenu, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { BottomNav }        from "@/components/BottomNav"
import { VersionSwitcher }  from "@/components/VersionSwitcher"
import { SettingsPanel }    from "@/components/SettingsPanel"
import { ShareDropdownContent } from "@/components/ShareDropdown"
import { getChapter, getBookIndex, type Version, type BookMeta } from "@/lib/bible"
import { toggleBookmark, isBookmarked }                   from "@/lib/bookmarks"
import { loadHighlights, toggleHighlight, HL_COLORS, HL_COLOR_KEYS, type HlColor } from "@/lib/highlights"
import { shareNative, versePayload, chapterPayload, copyPayload, type SharePayload } from "@/lib/share"
import { saveLastRead } from "@/lib/storage"
import { useHideOnScroll } from "@/lib/hooks/useHideOnScroll"
import { cn } from "@/lib/utils"

export default function ChapterPage({ params }: { params: { version: string; book: string; chapter: string } }) {
  const version = params.version.toUpperCase() as Version
  const slug    = params.book
  const chapter = parseInt(params.chapter, 10)
  const router  = useRouter()
  const hideUI  = useHideOnScroll()
  const touchStartX = useRef(0)
  const touchStartY = useRef(0)

  const [verses,        setVerses]        = useState<string[]>([])
  const [bookName,      setBookName]      = useState("")
  const [bookIndex,     setBookIndex]     = useState<BookMeta[]>([])
  const [loading,       setLoading]       = useState(true)
  const [bookmarked,    setBookmarked]    = useState(false)
  const [selected,      setSelected]      = useState<number | null>(null)
  const [flashVerse,    setFlashVerse]    = useState<number | null>(null)
  const [highlights,    setHighlights]    = useState<Record<number, HlColor>>({})
  const [copied,        setCopied]        = useState(false)
  const [sharePayload,  setSharePayload]  = useState<SharePayload | null>(null)

  useEffect(() => {
    setLoading(true); setVerses([]); setSelected(null); setFlashVerse(null); setSharePayload(null)

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

  // Cross-book navigation
  const currentMeta = bookIndex.find(b => b.slug === slug)
  const bookPos     = bookIndex.findIndex(b => b.slug === slug)
  const isFirstCh   = chapter === 1
  const isLastCh    = currentMeta ? chapter >= currentMeta.chapters : false
  const prevBook    = bookPos > 0 ? bookIndex[bookPos - 1] : null
  const nextBook    = bookPos >= 0 && bookPos < bookIndex.length - 1 ? bookIndex[bookPos + 1] : null
  const prevUrl     = isFirstCh ? (prevBook ? `/${version}/${prevBook.slug}/${prevBook.chapters}` : null) : `/${version}/${slug}/${chapter - 1}`
  const nextUrl     = isLastCh  ? (nextBook ? `/${version}/${nextBook.slug}/1` : null) : `/${version}/${slug}/${chapter + 1}`
  const prevLabel   = isFirstCh && prevBook ? `${prevBook.name} ${prevBook.chapters}` : String(chapter - 1)
  const nextLabel   = isLastCh  && nextBook ? `${nextBook.name} 1` : String(chapter + 1)

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
      onTouchStart={e => { touchStartX.current = e.changedTouches[0].clientX; touchStartY.current = e.changedTouches[0].clientY }}
      onTouchEnd={e => {
        const dx = e.changedTouches[0].clientX - touchStartX.current
        const dy = e.changedTouches[0].clientY - touchStartY.current
        if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 55) {
          if (dx < 0 && nextUrl) router.push(nextUrl)
          else if (dx > 0 && prevUrl) router.push(prevUrl)
        }
      }}
    >
      {/* Header */}
      <header className={cn("ui-header sticky top-0 z-40 flex items-center gap-1.5 px-2 py-2 bg-background border-b border-border", hideUI && "hidden")}>
        <Button variant="ghost" size="icon" className="h-8 w-8 -ml-0.5 text-muted-foreground shrink-0"
          onClick={() => router.push(`/${version}/${slug}`)}>
          <ChevronLeft className="h-5 w-5" />
        </Button>

        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm text-foreground truncate leading-tight">{bookName || slug}</p>
          <p className="text-[10px] text-muted-foreground">
            Pasal {chapter}{!loading && ` · ${verses.length} ayat`}
          </p>
        </div>

        <div className="flex items-center gap-0.5 shrink-0">
          {/* Copy */}
          <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground" onClick={() => handleCopy()} title="Salin pasal">
            {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
          </Button>

          {/* Share */}
          <DropdownMenu open={!!sharePayload && selected === null} onOpenChange={o => !o && setSharePayload(null)}>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground" onClick={() => handleShare()} title="Bagikan">
                <Share2 className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            {sharePayload && selected === null && (
              <ShareDropdownContent payload={sharePayload} onClose={() => setSharePayload(null)} onCopied={showCopied} />
            )}
          </DropdownMenu>

          {/* Bookmark */}
          <Button variant="ghost" size="icon" className={cn("h-8 w-8", bookmarked ? "text-primary" : "text-muted-foreground")}
            onClick={handleBookmark} title={bookmarked ? "Hapus bookmark" : "Bookmark"}>
            {bookmarked ? <BookmarkCheck className="h-4 w-4" fill="currentColor" /> : <Bookmark className="h-4 w-4" />}
          </Button>

          {/* Compare */}
          <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground" asChild title="Bandingkan versi">
            <Link href={`/compare/${slug}/${chapter}`}><Columns2 className="h-4 w-4" /></Link>
          </Button>

          <VersionSwitcher current={version} slug={slug} chapter={chapter} />
          <SettingsPanel />
        </div>
      </header>

      {/* Verse list */}
      <main className="flex-1 px-5 pt-6 pb-8 max-w-[660px] mx-auto w-full">
        {loading ? (
          <div className="space-y-4">
            {Array.from({length:6}).map((_,i) => (
              <div key={i} className="flex gap-3">
                <Skeleton className="h-4 w-5 shrink-0 mt-0.5" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-4/5" />
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
              const hlClass = hlColor ? `hl-${hlColor}` : ""

              return (
                <div key={i} id={`v${i + 1}`}
                  onClick={() => setSelected(isSel ? null : i)}
                  className={cn(
                    "flex gap-3 px-1.5 py-1 pb-3 rounded-md cursor-pointer transition-colors",
                    isFlash  && "bg-yellow-200/40 dark:bg-yellow-900/20",
                    isSel    && "bg-primary/8",
                    !isFlash && !isSel && hlColor && hlClass,
                    !isFlash && !isSel && !hlColor && "hover:bg-muted/50",
                  )}>
                  {/* Verse number */}
                  <span className="text-primary/50 text-[0.6rem] font-bold font-sans w-5 text-right shrink-0 pt-1 leading-none">
                    {i + 1}
                  </span>
                  {/* Verse text */}
                  <span className="verse-serif text-foreground">
                    {text}
                  </span>
                </div>
              )
            })}
          </div>
        )}
      </main>

      {/* Verse action bar */}
      {selected !== null && (
        <div className="fixed bottom-[calc(var(--nav-h)+8px)] inset-x-3 z-50 flex items-center justify-between gap-2 px-3 py-2.5 bg-background border border-border rounded-2xl shadow-xl">
          <span className="text-xs text-muted-foreground truncate max-w-[90px]">
            {bookName} {chapter}:{selected + 1}
          </span>

          <div className="flex items-center gap-1.5">
            {/* Color swatches */}
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

      {/* Prev / Next */}
      <div className="flex items-center justify-between px-4 py-3 mb-14 border-t border-border">
        {prevUrl ? (
          <Button variant="outline" size="sm" className="gap-1 max-w-[45%] h-8" asChild>
            <Link href={prevUrl}><ChevronLeft className="h-3.5 w-3.5 shrink-0" /><span className="truncate">{prevLabel}</span></Link>
          </Button>
        ) : <div />}

        <Button variant="ghost" size="sm" className="text-muted-foreground text-xs" asChild>
          <Link href={`/${version}/${slug}`}>{bookName}</Link>
        </Button>

        {nextUrl ? (
          <Button variant="outline" size="sm" className="gap-1 max-w-[45%] h-8" asChild>
            <Link href={nextUrl}><span className="truncate">{nextLabel}</span><ChevronRight className="h-3.5 w-3.5 shrink-0" /></Link>
          </Button>
        ) : <div />}
      </div>

      <BottomNav />
    </div>
  )
}
