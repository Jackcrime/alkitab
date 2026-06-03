"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useTheme } from "next-themes"
import { ChevronRight, BookOpen, Sun, Moon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Separator } from "@/components/ui/separator"
import { SettingsPanel } from "@/components/SettingsPanel"
import { BottomNav } from "@/components/BottomNav"
import { getDailyVerse } from "@/lib/daily-verse"
import { getLastRead, type LastRead } from "@/lib/storage"
import type { Version } from "@/lib/bible"

const QUICK_LINKS = [
  { label:"Mazmur",   slug:"mazmur",   ch:1, version:"TB" as Version },
  { label:"Yohanes",  slug:"yohanes",  ch:1, version:"TB" as Version },
  { label:"Roma",     slug:"roma",     ch:1, version:"TB" as Version },
  { label:"Kejadian", slug:"kejadian", ch:1, version:"TB" as Version },
  { label:"Matius",   slug:"matius",   ch:1, version:"TB" as Version },
  { label:"Amsal",    slug:"amsal",    ch:1, version:"TB" as Version },
  { label:"Efesus",   slug:"efesus",   ch:1, version:"TB" as Version },
  { label:"Wahyu",    slug:"wahyu",    ch:1, version:"TB" as Version },
]

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-2.5">
      {children}
    </p>
  )
}

export default function HomePage() {
  const verse                  = getDailyVerse()
  const [lastRead, setLast]    = useState<LastRead | null>(null)
  const [mounted,  setMounted] = useState(false)
  const { theme, setTheme }    = useTheme()

  useEffect(() => { setMounted(true); setLast(getLastRead()) }, [])

  const today = new Intl.DateTimeFormat("id-ID", {
    weekday:"long", day:"numeric", month:"long", year:"numeric"
  }).format(new Date())

  return (
    <div className="min-h-dvh bg-background">

      {/* Header */}
      <header className="flex items-center justify-between px-4 py-3.5 border-b border-border sticky top-0 z-40 bg-background">
        <div>
          <p className="font-semibold text-base text-foreground leading-tight">Alkitab GKPB</p>
          <p className="text-[11px] text-muted-foreground">{today}</p>
        </div>
        <div className="flex items-center gap-1">
          {mounted && (
            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
              {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>
          )}
          <SettingsPanel />
        </div>
      </header>

      <main className="px-4 pt-5 pb-24 flex flex-col gap-6">

        {/* Ayat Harian */}
        <section>
          <SectionLabel>Ayat Hari Ini</SectionLabel>
          <Link href={`/${verse.version}/${verse.slug}/${verse.chapter}#v${verse.verse}`}>
            <Card className="border-l-4 border-l-primary bg-accent hover:bg-muted/50 transition-colors cursor-pointer">
              <CardContent className="pt-4 pb-3">
                <p className="font-serif text-base italic leading-relaxed text-foreground mb-3 font-light">
                  &ldquo;{verse.text}&rdquo;
                </p>
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-primary">— {verse.ref}</p>
                  <ChevronRight className="h-4 w-4 text-primary" />
                </div>
              </CardContent>
            </Card>
          </Link>
        </section>

        {/* Continue Reading */}
        {lastRead && (
          <section>
            <SectionLabel>Lanjut Baca</SectionLabel>
            <Link href={`/${lastRead.version}/${lastRead.slug}/${lastRead.chapter}`}>
              <Card className="hover:bg-muted/30 transition-colors cursor-pointer">
                <CardContent className="pt-4 pb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-accent flex items-center justify-center shrink-0">
                      <BookOpen className="h-4.5 w-4.5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm text-foreground">
                        {lastRead.bookName} {lastRead.chapter}
                      </p>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <Badge variant="accent" className="text-[10px] py-0">
                          {lastRead.version}
                        </Badge>
                        <span className="text-[11px] text-muted-foreground">terakhir dibaca</span>
                      </div>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          </section>
        )}

        {/* Quick Links */}
        <section>
          <SectionLabel>Kitab Populer</SectionLabel>
          <div className="grid grid-cols-4 gap-2">
            {QUICK_LINKS.map(q => (
              <Link key={q.slug} href={`/${q.version}/${q.slug}/${q.ch}`}>
                <Card className="hover:bg-muted/30 transition-colors cursor-pointer">
                  <CardContent className="p-0 flex items-center justify-center py-3">
                    <p className="text-xs font-semibold text-primary">{q.label}</p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </section>

      </main>

      <BottomNav />
    </div>
  )
}
