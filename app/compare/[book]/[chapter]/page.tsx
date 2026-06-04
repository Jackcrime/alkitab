"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ChevronLeft, ChevronRight } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { getChapter, VERSIONS, type Version } from "@/lib/bible"
import { cn } from "@/lib/utils"

const PAIRS: [Version, Version][] = [["TB","BIS"],["TB","TL"],["BIS","TL"]]

export default function ComparePage({ params }: { params: { book: string; chapter: string } }) {
  const slug    = params.book
  const chapter = parseInt(params.chapter, 10)
  const router  = useRouter()

  const [pair,     setPair]  = useState<[Version, Version]>(["TB","BIS"])
  const [verses1,  setV1]    = useState<string[]>([])
  const [verses2,  setV2]    = useState<string[]>([])
  const [bookName, setName]  = useState("")
  const [totalCh,  setTotal] = useState(1)
  const [loading,  setLoad]  = useState(true)

  useEffect(() => {
    setLoad(true)
    Promise.all([getChapter(pair[0],slug,chapter), getChapter(pair[1],slug,chapter)])
      .then(([a,b]) => { setV1(a.verses); setV2(b.verses); setName(a.bookName); setTotal(a.totalChapters) })
      .finally(() => setLoad(false))
  }, [pair, slug, chapter])

  const maxLen  = Math.max(verses1.length, verses2.length)
  const hasPrev = chapter > 1
  const hasNext = chapter < totalCh

  return (
    <div className="min-h-dvh bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background border-b border-border px-3 py-2.5">
        <div className="flex items-center gap-2 mb-2.5">
          <Button variant="ghost" size="icon" className="h-8 w-8 -ml-1 text-muted-foreground shrink-0"
            onClick={() => router.push(`/${pair[0]}/${slug}/${chapter}`)}>
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-sm text-foreground truncate">{bookName || slug} {chapter}</p>
            <p className="text-[10px] text-muted-foreground">Perbandingan versi</p>
          </div>
        </div>

        {/* Pair selector */}
        <div className="flex gap-1.5">
          {PAIRS.map(([v1,v2]) => {
            const active = pair[0]===v1 && pair[1]===v2
            return (
              <button key={`${v1}+${v2}`} onClick={() => setPair([v1,v2])}
                className={cn(
                  "px-3 py-1 rounded-md text-xs font-semibold border transition-all",
                  active
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-transparent text-muted-foreground border-border hover:bg-muted"
                )}>
                {v1} vs {v2}
              </button>
            )
          })}
        </div>
      </header>

      {/* Verses */}
      <main className="pb-8">
        {loading ? (
          <div className="px-4 py-4 space-y-4">
            {Array.from({length:5}).map((_,i)=>(
              <div key={i} className="grid grid-cols-2 gap-3">
                <Skeleton className="h-16 rounded-lg" />
                <Skeleton className="h-16 rounded-lg" />
              </div>
            ))}
          </div>
        ) : (
          Array.from({ length: maxLen }, (_, i) => (
            <div key={i}>
              <div className="flex gap-3 px-4 py-3">
                <span className="text-primary/50 text-[0.6rem] font-bold w-5 text-right shrink-0 pt-0.5">{i+1}</span>
                <div className="flex-1 grid grid-cols-2 gap-3">
                  <div>
                    <Badge variant="accent" className="text-[9px] py-0 h-4 mb-1.5">{pair[0]}</Badge>
                    <p className="text-[0.8125rem] font-serif leading-relaxed text-foreground font-light">
                      {verses1[i] ?? "—"}
                    </p>
                  </div>
                  <div className="border-l border-border pl-3">
                    <Badge variant="secondary" className="text-[9px] py-0 h-4 mb-1.5">{pair[1]}</Badge>
                    <p className="text-[0.8125rem] font-serif leading-relaxed text-foreground font-light">
                      {verses2[i] ?? "—"}
                    </p>
                  </div>
                </div>
              </div>
              {i < maxLen - 1 && <Separator />}
            </div>
          ))
        )}

        {/* Prev/Next */}
        <div className="flex items-center justify-between px-4 py-3 border-t border-border">
          {hasPrev ? (
            <Button variant="outline" size="sm" className="gap-1 h-8" asChild>
              <Link href={`/compare/${slug}/${chapter-1}`}><ChevronLeft className="h-3.5 w-3.5"/>{chapter-1}</Link>
            </Button>
          ) : <div />}
          <span className="text-xs text-muted-foreground">{bookName}</span>
          {hasNext ? (
            <Button variant="outline" size="sm" className="gap-1 h-8" asChild>
              <Link href={`/compare/${slug}/${chapter+1}`}>{chapter+1}<ChevronRight className="h-3.5 w-3.5"/></Link>
            </Button>
          ) : <div />}
        </div>
      </main>

    </div>
  )
}
