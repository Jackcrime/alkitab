"use client"

import { useState, useEffect, useMemo, useRef, useCallback } from "react"
import { useRouter } from "next/navigation"
import { X, ChevronLeft, Search, ArrowRight, BookOpen } from "lucide-react"
import { Button }    from "@/components/ui/button"
import { Input }     from "@/components/ui/input"
import { Badge }     from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Skeleton }  from "@/components/ui/skeleton"
import { cn }        from "@/lib/utils"
import {
  getBookIndex, searchBible, highlightQuery, isOldTestament,
  VERSIONS, type BookMeta, type Version, type SearchResult,
} from "@/lib/bible"
import { getAbbr }             from "@/lib/book-abbr"
import { parseReference, refToUrl } from "@/lib/reference-parser"

interface Props {
  open:           boolean
  onClose:        () => void
  version:        Version
  currentSlug:    string
  currentChapter: number
}

type Step    = "book" | "chapter"
type Section = "ALL" | "PL" | "PB"

export function BookChapterPicker({ open, onClose, version, currentSlug, currentChapter }: Props) {
  const router = useRouter()

  const [books,          setBooks]         = useState<BookMeta[]>([])
  const [step,           setStep]          = useState<Step>("book")
  const [picked,         setPicked]        = useState<BookMeta | null>(null)
  const [tab,            setTab]           = useState<"PL" | "PB">("PL")
  const [filter,         setFilter]        = useState("")
  const [activeVersion,  setActiveVersion] = useState<Version>(version)

  // Text search state
  const [searchResults,  setSearchResults] = useState<SearchResult[]>([])
  const [searching,      setSearching]     = useState(false)
  const [progress,       setProgress]      = useState<{ l: number; t: number } | null>(null)
  const [section,        setSection]       = useState<Section>("ALL")
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const parsedRef     = parseReference(filter)
  const isTextSearch  = !parsedRef && filter.trim().length >= 2

  // ── Load books on open ────────────────────────────────────────────────────
  useEffect(() => {
    if (!open) return
    setStep("book"); setPicked(null); setFilter("")
    setSearchResults([]); setSearching(false); setSection("ALL")
    setActiveVersion(version)
    getBookIndex(version).then(idx => {
      setBooks(idx)
      // Fix: use `idx` (resolved), not stale `books` state
      const cur = idx.find(b => b.slug === currentSlug)
      if (cur) setTab(isOldTestament(cur.bnumber) ? "PL" : "PB")
    })
  }, [open, version])

  // Reload books when version is switched inside picker
  useEffect(() => {
    if (!open) return
    getBookIndex(activeVersion).then(setBooks)
  }, [activeVersion])

  // ── Debounced text search ─────────────────────────────────────────────────
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    if (!isTextSearch) { setSearchResults([]); setSearching(false); return }
    setSearching(true)
    debounceRef.current = setTimeout(async () => {
      setProgress({ l: 0, t: 66 })
      const res = await searchBible(activeVersion, filter.trim(), (l, t) => setProgress({ l, t }))
      setSearchResults(res)
      setSearching(false)
      setProgress(null)
    }, 400)
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current) }
  }, [filter, isTextSearch, activeVersion])

  // ── Book list (non-search mode) ───────────────────────────────────────────
  const filteredBooks = useMemo(() => {
    const q = filter.toLowerCase().trim()
    return books.filter(b => {
      const inTab = tab === "PL" ? isOldTestament(b.bnumber) : !isOldTestament(b.bnumber)
      if (!inTab) return false
      if (!q) return true
      return b.name.toLowerCase().includes(q) || getAbbr(b.slug).toLowerCase().includes(q)
    })
  }, [books, tab, filter])

  // ── Filtered search results ───────────────────────────────────────────────
  const displayedResults = useMemo(() => {
    if (section === "ALL") return searchResults
    if (section === "PL")  return searchResults.filter(r => isOldTestament(r.bnumber))
    return searchResults.filter(r => !isOldTestament(r.bnumber))
  }, [searchResults, section])

  const plCount = searchResults.filter(r => isOldTestament(r.bnumber)).length
  const pbCount = searchResults.filter(r => !isOldTestament(r.bnumber)).length

  // ── Navigation ────────────────────────────────────────────────────────────
  function selectBook(book: BookMeta) { setPicked(book); setFilter(""); setStep("chapter") }

  function selectChapter(ch: number) {
    router.push(`/${activeVersion}/${picked!.slug}/${ch}`)
    onClose()
  }

  function navigateRef() {
    if (!parsedRef) return
    router.push(refToUrl(parsedRef, activeVersion))
    onClose()
  }

  function navigateResult(r: SearchResult) {
    router.push(`/${activeVersion}/${r.bookSlug}/${r.chapter}#v${r.verse}`)
    onClose()
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-[60] bg-background flex flex-col">

      {/* ── Book step ─────────────────────────────────────────────────────── */}
      {step === "book" && (
        <>
          {/* Header */}
          <div className="flex items-center gap-2 px-3 pt-3 pb-2.5 border-b border-border shrink-0">
            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground shrink-0" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
            <p className="font-semibold text-sm flex-1 text-foreground">Pilih Kitab</p>
            {/* Version chips */}
            <div className="flex gap-1 shrink-0">
              {VERSIONS.map(v => (
                <button key={v.code}
                  onClick={() => setActiveVersion(v.code)}
                  className={cn(
                    "px-2.5 py-0.5 rounded-lg text-[11px] font-bold border transition-all",
                    activeVersion === v.code
                      ? "bg-primary text-primary-foreground border-primary"
                      : "text-muted-foreground border-border hover:bg-muted"
                  )}>
                  {v.code}
                </button>
              ))}
            </div>
          </div>

          {/* Search bar */}
          <div className="px-3 pt-2.5 pb-2 shrink-0">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                value={filter}
                onChange={e => { setFilter(e.target.value); setSection("ALL") }}
                onKeyDown={e => { if (e.key === "Enter" && parsedRef) navigateRef() }}
                placeholder="Cari kitab, teks ayat, atau Yoh 3:16..."
                className="pl-8 pr-8 h-9 text-sm bg-muted/40 border-border"
                autoFocus
              />
              {filter && (
                <button onClick={() => { setFilter(""); setSearchResults([]) }}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Reference quick-nav */}
          {parsedRef && (
            <div className="px-3 pb-2 shrink-0">
              <button onClick={navigateRef}
                className="w-full flex items-center gap-3 p-3 rounded-xl bg-accent border border-primary/20 hover:bg-muted/60 transition-colors text-left">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <BookOpen className="h-3.5 w-3.5 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-foreground">
                    {parsedRef.bookName} {parsedRef.chapter}{parsedRef.verse ? `:${parsedRef.verse}` : ""}
                  </p>
                  <p className="text-[10px] text-muted-foreground">
                    {activeVersion} · {parsedRef.verse ? `Ayat ${parsedRef.verse}` : "Semua ayat"} · Enter atau klik
                  </p>
                </div>
                <ArrowRight className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
              </button>
            </div>
          )}

          {/* PL/PB tabs — only when browsing books (no text search) */}
          {!isTextSearch && !parsedRef && (
            <div className="flex border-b border-border shrink-0">
              {(["PL","PB"] as const).map(t => (
                <button key={t} onClick={() => setTab(t)}
                  className={cn(
                    "flex-1 py-2.5 text-sm font-medium border-b-2 transition-colors",
                    tab === t
                      ? "border-primary text-primary"
                      : "border-transparent text-muted-foreground hover:text-foreground"
                  )}>
                  {t === "PL" ? "Perjanjian Lama" : "Perjanjian Baru"}
                </button>
              ))}
            </div>
          )}

          {/* PL/PB filter chips — only when text search has results */}
          {isTextSearch && !searching && searchResults.length > 0 && (
            <div className="flex gap-1.5 px-3 pb-2 border-b border-border shrink-0">
              {(["ALL","PL","PB"] as Section[]).map(s => (
                <button key={s} onClick={() => setSection(s)}
                  className={cn(
                    "px-2.5 py-1 rounded-lg text-[11px] font-semibold border transition-all",
                    section === s
                      ? "bg-secondary text-secondary-foreground border-secondary"
                      : "text-muted-foreground border-border hover:bg-muted"
                  )}>
                  {s === "ALL" ? `Semua (${searchResults.length})`
                   : s === "PL" ? `PL (${plCount})`
                   : `PB (${pbCount})`}
                </button>
              ))}
            </div>
          )}

          {/* ── Scrollable content ─────────────────────────────────────────── */}
          <div className="flex-1 overflow-y-auto">

            {/* TEXT SEARCH RESULTS */}
            {isTextSearch && (
              <>
                {/* Progress bar */}
                {searching && progress && (
                  <div className="px-4 py-2 flex items-center gap-3">
                    <div className="flex-1 h-0.5 rounded-full bg-muted overflow-hidden">
                      <div className="h-full bg-primary rounded-full transition-all duration-100"
                        style={{ width: `${(progress.l / progress.t) * 100}%` }} />
                    </div>
                    <span className="text-[10px] text-muted-foreground tabular-nums shrink-0">
                      {progress.l}/{progress.t}
                    </span>
                  </div>
                )}
                {/* Empty state */}
                {!searching && displayedResults.length === 0 && (
                  <div className="flex flex-col items-center gap-1.5 py-16">
                    <p className="text-sm text-muted-foreground">
                      {searchResults.length > 0
                        ? `Tidak ada hasil di ${section}`
                        : "Tidak ditemukan"}
                    </p>
                    {searchResults.length > 0 && section !== "ALL" && (
                      <p className="text-xs text-muted-foreground/60">{searchResults.length} hasil di bagian lain</p>
                    )}
                  </div>
                )}
                {/* Result count */}
                {!searching && displayedResults.length > 0 && (
                  <div className="px-4 py-2">
                    <p className="text-[11px] text-muted-foreground">
                      {displayedResults.length} hasil untuk &ldquo;{filter.trim()}&rdquo;
                    </p>
                  </div>
                )}
                {/* Results */}
                {displayedResults.map((r, idx) => (
                  <div key={idx}>
                    <button onClick={() => navigateResult(r)}
                      className="w-full text-left px-4 py-3 hover:bg-muted/40 transition-colors">
                      <div className="flex items-center gap-1.5 mb-1">
                        <span className="text-[11px] font-semibold text-muted-foreground">
                          {r.bookName} {r.chapter}:{r.verse}
                        </span>
                        <Badge variant="outline" className="text-[9px] py-0 h-4">{activeVersion}</Badge>
                        <Badge variant="outline" className={cn(
                          "text-[9px] py-0 h-4",
                          isOldTestament(r.bnumber)
                            ? "border-amber-500/40 text-amber-600 dark:text-amber-400"
                            : "border-blue-500/40 text-blue-600 dark:text-blue-400"
                        )}>
                          {isOldTestament(r.bnumber) ? "PL" : "PB"}
                        </Badge>
                      </div>
                      <p className="text-sm font-serif leading-relaxed text-foreground"
                        dangerouslySetInnerHTML={{ __html: highlightQuery(r.text, filter.trim()) }} />
                    </button>
                    {idx < displayedResults.length - 1 && <Separator />}
                  </div>
                ))}
              </>
            )}

            {/* BOOK LIST */}
            {!isTextSearch && !parsedRef && (
              <>
                {filteredBooks.length === 0 ? (
                  <p className="text-center text-sm text-muted-foreground py-12">Tidak ditemukan</p>
                ) : filteredBooks.map((book, idx) => (
                  <div key={book.bnumber}>
                    <button
                      onClick={() => selectBook(book)}
                      className={cn(
                        "w-full flex items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-muted/40",
                        book.slug === currentSlug && "bg-accent"
                      )}>
                      <span className="text-[10px] text-muted-foreground w-5 text-right shrink-0 tabular-nums">
                        {book.bnumber}
                      </span>
                      <Badge
                        variant={book.slug === currentSlug ? "default" : "accent"}
                        className="text-[10px] w-9 justify-center py-0.5 shrink-0">
                        {getAbbr(book.slug)}
                      </Badge>
                      <span className="flex-1 text-sm font-medium text-foreground">{book.name}</span>
                      <span className="text-xs text-muted-foreground">{book.chapters} psl</span>
                    </button>
                    {idx < filteredBooks.length - 1 && <Separator />}
                  </div>
                ))}
              </>
            )}
          </div>
        </>
      )}

      {/* ── Chapter step ───────────────────────────────────────────────────── */}
      {step === "chapter" && picked && (
        <>
          <div className="flex items-center gap-2 px-3 py-3 border-b border-border shrink-0">
            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground"
              onClick={() => setStep("book")}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div className="flex-1">
              <p className="font-semibold text-sm text-foreground">{picked.name}</p>
              <p className="text-[10px] text-muted-foreground">{picked.chapters} pasal · {activeVersion}</p>
            </div>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex-1 overflow-y-auto p-4">
            <div className="grid gap-2"
              style={{ gridTemplateColumns: "repeat(auto-fill, minmax(52px, 1fr))" }}>
              {Array.from({ length: picked.chapters }, (_, i) => i + 1).map(ch => (
                <button key={ch} onClick={() => selectChapter(ch)}
                  className={cn(
                    "aspect-square flex items-center justify-center rounded-xl text-sm font-medium transition-colors border",
                    picked.slug === currentSlug && ch === currentChapter
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-muted/40 border-border text-foreground hover:bg-accent hover:text-accent-foreground hover:border-primary/30"
                  )}>
                  {ch}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
