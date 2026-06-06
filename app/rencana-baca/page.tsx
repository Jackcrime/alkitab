"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { ChevronLeft, Flame, BookOpen, CheckCircle2, Circle } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { getReadSet, getReadCountByVersion, getStreak, isStreakActive } from "@/lib/storage"
import { getBookIndex, type BookMeta } from "@/lib/bible"
import { cn } from "@/lib/utils"

const VERSION = "TB"

// PL = bnumber 1-39, PB = 40-66
const PL_TOTAL = 929
const PB_TOTAL = 260

interface BookProgress {
  meta:     BookMeta
  read:     number
  total:    number
}

export default function RencanaBacaPage() {
  const [loading,    setLoading]    = useState(true)
  const [books,      setBooks]      = useState<BookProgress[]>([])
  const [readCount,  setReadCount]  = useState(0)
  const [streak,     setStreak]     = useState({ count: 0, active: false })
  const [tab,        setTab]        = useState<"pl" | "pb">("pb")

  useEffect(() => {
    getBookIndex(VERSION).then(index => {
      const readSet = getReadSet()
      const prefix  = `${VERSION}:`

      const bookList: BookProgress[] = index.map(meta => {
        let read = 0
        for (let c = 1; c <= meta.chapters; c++) {
          if (readSet.has(`${prefix}${meta.slug}:${c}`)) read++
        }
        return { meta, read, total: meta.chapters }
      })

      setBooks(bookList)
      setReadCount(getReadCountByVersion(VERSION))
      const s = getStreak()
      setStreak({ count: s.count, active: isStreakActive() })
      setLoading(false)
    })
  }, [])

  const plBooks = books.filter(b => b.meta.bnumber <= 39)
  const pbBooks = books.filter(b => b.meta.bnumber > 39)

  const plRead  = plBooks.reduce((s, b) => s + b.read, 0)
  const pbRead  = pbBooks.reduce((s, b) => s + b.read, 0)

  const plPct   = Math.round((plRead  / PL_TOTAL) * 100)
  const pbPct   = Math.round((pbRead  / PB_TOTAL) * 100)
  const allPct  = Math.round((readCount / 1189)   * 100)

  const displayBooks = tab === "pl" ? plBooks : pbBooks

  return (
    <div className="min-h-dvh bg-background flex flex-col">

      {/* Header */}
      <header className="sticky top-0 z-40 flex items-center gap-2 px-3 py-3 bg-background border-b border-border">
        <Link href="/"
          className="h-9 w-9 flex items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors shrink-0">
          <ChevronLeft className="h-5 w-5" />
        </Link>
        <div className="flex-1">
          <p className="font-semibold text-sm text-foreground">Rencana Baca</p>
          <p className="text-[10px] text-muted-foreground">Alkitab Terjemahan Baru</p>
        </div>
      </header>

      <main className="flex-1 px-4 pt-5 pb-24 max-w-[600px] mx-auto w-full space-y-5">

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-3">

          {/* Overall */}
          <div className="col-span-2 bg-card border border-border rounded-2xl px-4 py-3.5 flex items-center gap-3">
            <div className="flex-1 min-w-0">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-1">
                Total Dibaca
              </p>
              {loading
                ? <Skeleton className="h-7 w-20" />
                : <p className="text-2xl font-bold text-foreground leading-none">
                    {readCount}
                    <span className="text-sm font-normal text-muted-foreground ml-1">/ 1189</span>
                  </p>
              }
              <div className="mt-2 h-1.5 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary rounded-full transition-all duration-700"
                  style={{ width: loading ? "0%" : `${allPct}%` }}
                />
              </div>
              <p className="text-[10px] text-muted-foreground mt-1">{allPct}% selesai</p>
            </div>
            <BookOpen className="h-8 w-8 text-primary/20 shrink-0" />
          </div>

          {/* Streak */}
          <div className="bg-card border border-border rounded-2xl px-3 py-3.5 flex flex-col items-center justify-center gap-1">
            <Flame className={cn(
              "h-6 w-6 transition-colors",
              streak.active ? "text-orange-400" : "text-muted-foreground/30"
            )} />
            {loading
              ? <Skeleton className="h-6 w-8" />
              : <p className={cn(
                  "text-xl font-bold leading-none",
                  streak.active ? "text-orange-400" : "text-muted-foreground/40"
                )}>
                  {streak.count}
                </p>
            }
            <p className="text-[10px] text-muted-foreground text-center leading-tight">hari berturut</p>
          </div>
        </div>

        {/* PL / PB progress */}
        <div className="grid grid-cols-2 gap-3">
          {[
            { key: "pl" as const, label: "Perjanjian Lama", read: plRead, total: PL_TOTAL, pct: plPct },
            { key: "pb" as const, label: "Perjanjian Baru", read: pbRead, total: PB_TOTAL, pct: pbPct },
          ].map(({ key, label, read, total, pct }) => (
            <button key={key} onClick={() => setTab(key)}
              className={cn(
                "text-left bg-card border rounded-2xl px-4 py-3.5 transition-all",
                tab === key ? "border-primary shadow-sm" : "border-border hover:border-primary/40"
              )}>
              <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-1.5">
                {label}
              </p>
              {loading
                ? <Skeleton className="h-5 w-16" />
                : <p className="text-base font-bold text-foreground leading-none">
                    {read}<span className="text-xs font-normal text-muted-foreground ml-1">/ {total}</span>
                  </p>
              }
              <div className="mt-2 h-1 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary rounded-full transition-all duration-700"
                  style={{ width: loading ? "0%" : `${pct}%` }}
                />
              </div>
              <p className="text-[10px] text-muted-foreground mt-1">{pct}%</p>
            </button>
          ))}
        </div>

        {/* Book list */}
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-3">
            {tab === "pl" ? "Perjanjian Lama" : "Perjanjian Baru"} — per kitab
          </p>

          {loading ? (
            <div className="space-y-2">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-14 w-full rounded-xl" />
              ))}
            </div>
          ) : (
            <div className="space-y-1.5">
              {displayBooks.map(({ meta, read, total }) => {
                const done = read === total
                const pct  = Math.round((read / total) * 100)
                return (
                  <Link
                    key={meta.slug}
                    href={`/${VERSION}/${meta.slug}/1`}
                    className="flex items-center gap-3 px-3.5 py-3 rounded-xl bg-card border border-border hover:border-primary/40 transition-colors"
                  >
                    {done
                      ? <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
                      : <Circle className={cn(
                          "h-4 w-4 shrink-0",
                          read > 0 ? "text-primary/40" : "text-muted-foreground/20"
                        )} />
                    }
                    <div className="flex-1 min-w-0">
                      <p className={cn(
                        "text-sm font-medium truncate",
                        done ? "text-foreground" : "text-foreground"
                      )}>
                        {meta.name}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="flex-1 h-1 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full bg-primary rounded-full"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <span className="text-[10px] text-muted-foreground shrink-0">
                          {read}/{total}
                        </span>
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>
          )}
        </div>

      </main>
    </div>
  )
}