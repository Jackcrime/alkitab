"use client"

import { useState, useEffect, useMemo } from "react"
import { useRouter }   from "next/navigation"
import { X, ChevronLeft, Search } from "lucide-react"
import { Button }      from "@/components/ui/button"
import { Input }       from "@/components/ui/input"
import { Badge }       from "@/components/ui/badge"
import { Separator }   from "@/components/ui/separator"
import { cn }          from "@/lib/utils"
import { getBookIndex, isOldTestament, type BookMeta, type Version } from "@/lib/bible"
import { getAbbr }     from "@/lib/book-abbr"

interface Props {
  open:          boolean
  onClose:       () => void
  version:       Version
  currentSlug:   string
  currentChapter:number
}

type Step = "book" | "chapter"

export function BookChapterPicker({ open, onClose, version, currentSlug, currentChapter }: Props) {
  const router = useRouter()

  const [books,      setBooks]     = useState<BookMeta[]>([])
  const [step,       setStep]      = useState<Step>("book")
  const [picked,     setPicked]    = useState<BookMeta | null>(null)
  const [tab,        setTab]       = useState<"PL" | "PB">("PL")
  const [filter,     setFilter]    = useState("")

  // Load books on open
  useEffect(() => {
    if (!open) return
    setStep("book")
    setPicked(null)
    setFilter("")
    getBookIndex(version).then(setBooks)
    // Open on the right tab for current book
    const cur = books.find(b => b.slug === currentSlug)
    if (cur) setTab(isOldTestament(cur.bnumber) ? "PL" : "PB")
  }, [open, version])

  const filtered = useMemo(() => {
    const q = filter.toLowerCase()
    return books.filter(b => {
      const inTab = tab === "PL" ? isOldTestament(b.bnumber) : !isOldTestament(b.bnumber)
      if (!inTab) return false
      if (!q) return true
      return b.name.toLowerCase().includes(q) || getAbbr(b.slug).toLowerCase().includes(q)
    })
  }, [books, tab, filter])

  function selectBook(book: BookMeta) {
    setPicked(book)
    setFilter("")
    setStep("chapter")
  }

  function selectChapter(ch: number) {
    router.push(`/${version}/${picked!.slug}/${ch}`)
    onClose()
  }

  if (!open) return null

  return (
    /* Full-screen overlay */
    <div className="fixed inset-0 z-[60] bg-background flex flex-col">

      {/* ── Book step ─────────────────────────────────────────────────────── */}
      {step === "book" && (
        <>
          {/* Header */}
          <div className="flex items-center gap-2 px-3 py-3 border-b border-border shrink-0">
            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
            <p className="font-semibold text-sm flex-1 text-foreground">Pilih Kitab</p>
            <Badge variant="outline" className="text-[10px]">{version}</Badge>
          </div>

          {/* Search */}
          <div className="px-3 py-2.5 border-b border-border shrink-0">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                value={filter}
                onChange={e => setFilter(e.target.value)}
                placeholder="Cari kitab..."
                className="pl-8 h-8 text-sm bg-muted/40"
                autoFocus
              />
            </div>
          </div>

          {/* PL / PB tabs */}
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

          {/* Book list */}
          <div className="flex-1 overflow-y-auto">
            {filtered.length === 0 ? (
              <p className="text-center text-sm text-muted-foreground py-12">Tidak ditemukan</p>
            ) : filtered.map((book, idx) => (
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
                {idx < filtered.length - 1 && <Separator />}
              </div>
            ))}
          </div>
        </>
      )}

      {/* ── Chapter step ───────────────────────────────────────────────────── */}
      {step === "chapter" && picked && (
        <>
          {/* Header */}
          <div className="flex items-center gap-2 px-3 py-3 border-b border-border shrink-0">
            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground"
              onClick={() => setStep("book")}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div className="flex-1">
              <p className="font-semibold text-sm text-foreground">{picked.name}</p>
              <p className="text-[10px] text-muted-foreground">{picked.chapters} pasal · {version}</p>
            </div>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Chapter grid */}
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
