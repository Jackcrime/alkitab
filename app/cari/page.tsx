"use client"

import { useState, useRef, useCallback, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Search, X, ArrowRight, BookOpen, Clock } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { SettingsPanel } from "@/components/SettingsPanel"
import { VERSIONS, searchBible, highlightQuery, isOldTestament, type SearchResult, type Version } from "@/lib/bible"
import { parseReference, refToUrl } from "@/lib/reference-parser"
import { addSearchHistory, getSearchHistory, removeSearchHistory } from "@/lib/storage"
import { cn } from "@/lib/utils"

type Section = "ALL" | "PL" | "PB"

export default function SearchPage() {
  const [query,    setQuery]    = useState("")
  const [version,  setVersion]  = useState<Version>("TB")
  const [section,  setSection]  = useState<Section>("ALL")
  const [results,  setResults]  = useState<SearchResult[]>([])
  const [loading,  setLoading]  = useState(false)
  const [progress, setProgress] = useState<{ loaded: number; total: number } | null>(null)
  const [searched, setSearched] = useState(false)
  const [history,  setHistory]  = useState<string[]>([])
  const debounceRef             = useRef<ReturnType<typeof setTimeout> | null>(null)
  const router                  = useRouter()
  const parsedRef               = parseReference(query)

  useEffect(() => { setHistory(getSearchHistory()) }, [])

  const doSearch = useCallback(async (q: string, v: Version) => {
    if (q.trim().length < 2) { setResults([]); setSearched(false); return }
    setLoading(true); setResults([]); setSearched(true)
    setProgress({ loaded: 0, total: 66 })
    addSearchHistory(q); setHistory(getSearchHistory())
    const found = await searchBible(v, q, (loaded, total) => setProgress({ loaded, total }))
    setResults(found); setLoading(false); setProgress(null)
  }, [])

  function handleInput(e: React.ChangeEvent<HTMLInputElement>) {
    const q = e.target.value; setQuery(q)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    if (parseReference(q)) { setResults([]); setSearched(false); setLoading(false); return }
    debounceRef.current = setTimeout(() => doSearch(q, version), 500)
  }

  function handleVersion(v: Version) {
    setVersion(v)
    if (!parseReference(query) && query.trim().length >= 2) doSearch(query, v)
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && parsedRef) router.push(refToUrl(parsedRef, version))
  }

  function clearQuery() { setQuery(""); setResults([]); setSearched(false); setLoading(false) }
  function removeHist(h: string) { removeSearchHistory(h); setHistory(getSearchHistory()) }
  function clearAllHist() { localStorage.removeItem("alkitab:searchhist"); setHistory([]) }

  // Filter results by PL/PB section
  const filteredResults = results.filter(r => {
    if (section === "ALL") return true
    if (section === "PL")  return isOldTestament(r.bnumber)
    return !isOldTestament(r.bnumber)
  })

  const plCount  = results.filter(r => isOldTestament(r.bnumber)).length
  const pbCount  = results.filter(r => !isOldTestament(r.bnumber)).length

  return (
    <div className="min-h-dvh bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background border-b border-border px-4 pt-3.5 pb-3">
        <div className="flex items-center justify-between mb-3">
          <p className="font-semibold text-base text-foreground">Cari</p>
          <SettingsPanel />
        </div>

        {/* Search input */}
        <div className="relative mb-2.5">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            value={query}
            onChange={handleInput}
            onKeyDown={handleKeyDown}
            placeholder="Teks atau referensi (Yoh 3:16)..."
            className="pl-9 pr-9 h-9 bg-muted/40"
            autoFocus
          />
          {query && (
            <button onClick={clearQuery} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {/* Version + PL/PB tabs */}
        <div className="flex gap-1.5 flex-wrap">
          {/* Version */}
          {VERSIONS.map(v => (
            <button key={v.code} onClick={() => handleVersion(v.code)}
              className={cn(
                "px-3 py-1 rounded-md text-xs font-semibold border transition-all",
                version === v.code
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-transparent text-muted-foreground border-border hover:bg-muted"
              )}>
              {v.label}
            </button>
          ))}

          {/* Divider */}
          <div className="w-px bg-border self-stretch mx-0.5" />

          {/* PL/PB section filter — only visible when there are results */}
          {(["ALL", "PL", "PB"] as Section[]).map(s => (
            <button key={s} onClick={() => setSection(s)}
              className={cn(
                "px-2.5 py-1 rounded-md text-xs font-semibold border transition-all",
                section === s
                  ? "bg-secondary text-secondary-foreground border-secondary"
                  : "bg-transparent text-muted-foreground border-border hover:bg-muted"
              )}>
              {s === "ALL"
                ? `Semua${results.length > 0 ? ` (${results.length})` : ""}`
                : s === "PL"
                ? `PL${plCount > 0 ? ` (${plCount})` : ""}`
                : `PB${pbCount > 0 ? ` (${pbCount})` : ""}`}
            </button>
          ))}
        </div>
      </header>

      <main className="pb-8">
        {/* Reference detected */}
        {parsedRef && (
          <div className="px-4 py-4">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-2">Langsung ke</p>
            <Link href={refToUrl(parsedRef, version)}>
              <div className="flex items-center gap-3 p-3.5 rounded-xl bg-accent border border-primary/20 hover:bg-muted/50 transition-colors cursor-pointer">
                <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <BookOpen className="h-4 w-4 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-foreground">
                    {parsedRef.bookName} {parsedRef.chapter}{parsedRef.verse ? `:${parsedRef.verse}` : ""}
                  </p>
                  <p className="text-[11px] text-muted-foreground">
                    {version} · {parsedRef.verse ? `Ayat ${parsedRef.verse}` : "Semua ayat"} · Enter atau klik
                  </p>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground shrink-0" />
              </div>
            </Link>
          </div>
        )}

        {/* Progress */}
        {loading && progress && (
          <div className="px-4 py-2 flex items-center gap-3">
            <div className="flex-1 h-0.5 rounded-full bg-muted overflow-hidden">
              <div className="h-full bg-primary rounded-full transition-all duration-150"
                style={{ width: `${(progress.loaded / progress.total) * 100}%` }} />
            </div>
            <span className="text-[10px] text-muted-foreground tabular-nums shrink-0">
              {progress.loaded}/{progress.total}
            </span>
          </div>
        )}

        {/* Loading skeleton */}
        {loading && !progress && (
          <div className="px-4 py-3 space-y-3">
            {Array.from({length:4}).map((_,i) => <Skeleton key={i} className="h-14 w-full rounded-lg" />)}
          </div>
        )}

        {/* Search history */}
        {!loading && !searched && !parsedRef && history.length > 0 && (
          <div className="px-4 pt-4">
            <div className="flex items-center justify-between mb-2.5">
              <div className="flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Riwayat</p>
              </div>
              <Button variant="ghost" size="sm" className="h-6 text-xs text-muted-foreground px-2"
                onClick={clearAllHist}>Hapus semua</Button>
            </div>
            <div className="space-y-1.5">
              {history.map(h => (
                <div key={h} className="flex items-center gap-2">
                  <button onClick={() => { setQuery(h); if (!parseReference(h)) doSearch(h, version) }}
                    className="flex-1 text-left text-sm px-3 py-2 rounded-lg bg-muted/40 border border-border hover:bg-muted transition-colors text-foreground">
                    {h}
                  </button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground shrink-0"
                    onClick={() => removeHist(h)}>
                    <X className="h-3.5 w-3.5" />
                  </Button>
                </div>
              ))}
            </div>
            <Separator className="mt-4" />
          </div>
        )}

        {/* Placeholder */}
        {!loading && !searched && !parsedRef && history.length === 0 && (
          <div className="px-4 pt-8">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-3">Contoh referensi</p>
            <div className="flex flex-wrap gap-2">
              {["Yoh 3:16","Kej 1","Mazmur 23","1 Kor 13:4","Rm 8:28"].map(ex => (
                <Badge key={ex} variant="secondary"
                  className="cursor-pointer hover:bg-muted text-xs py-1 px-2.5"
                  onClick={() => setQuery(ex)}>
                  {ex}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* No results */}
        {!loading && searched && filteredResults.length === 0 && !parsedRef && (
          <div className="flex flex-col items-center gap-1.5 py-20">
            <p className="text-sm text-muted-foreground">
              {results.length > 0 ? `Tidak ada di ${section}` : "Tidak ditemukan"}
            </p>
            <p className="text-xs text-muted-foreground/60">
              {results.length > 0 ? `${results.length} hasil di bagian lain` : "Coba kata lain"}
            </p>
          </div>
        )}

        {/* Result count */}
        {!loading && filteredResults.length > 0 && (
          <div className="px-4 py-2">
            <p className="text-[11px] text-muted-foreground">
              {filteredResults.length} hasil untuk &ldquo;{query}&rdquo;
              {section !== "ALL" && ` · ${section}`}
            </p>
          </div>
        )}

        {/* Results */}
        {filteredResults.map((r, idx) => (
          <div key={idx}>
            <Link href={`/${version}/${r.bookSlug}/${r.chapter}#v${r.verse}`}
              className="block px-4 py-3 hover:bg-muted/40 transition-colors">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[11px] font-semibold text-muted-foreground">
                  {r.bookName} {r.chapter}:{r.verse}
                </span>
                <Badge variant="outline" className="text-[9px] py-0 h-4">{version}</Badge>
                <Badge variant="outline" className={cn(
                  "text-[9px] py-0 h-4",
                  isOldTestament(r.bnumber) ? "border-amber-500/40 text-amber-600 dark:text-amber-400" : "border-blue-500/40 text-blue-600 dark:text-blue-400"
                )}>
                  {isOldTestament(r.bnumber) ? "PL" : "PB"}
                </Badge>
              </div>
              <p className="text-sm font-serif leading-relaxed text-foreground"
                dangerouslySetInnerHTML={{ __html: highlightQuery(r.text, query) }} />
            </Link>
            {idx < filteredResults.length - 1 && <Separator />}
          </div>
        ))}
      </main>

    </div>
  )
}
