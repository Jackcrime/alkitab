"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ChevronLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { VersionSwitcher } from "@/components/VersionSwitcher"
import { SettingsPanel } from "@/components/SettingsPanel"
import { getBookIndex, type BookMeta, type Version } from "@/lib/bible"
import { cn } from "@/lib/utils"
import Link from "next/link"

export default function ChapterListPage({ params }: { params: { version: string; book: string } }) {
  const version = params.version.toUpperCase() as Version
  const slug    = params.book
  const router  = useRouter()

  const [meta,    setMeta]    = useState<BookMeta | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getBookIndex(version)
      .then(idx => setMeta(idx.find(b => b.slug === slug) ?? null))
      .finally(() => setLoading(false))
  }, [version, slug])

  const count = meta?.chapters ?? 0

  return (
    <div className="min-h-dvh bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 flex items-center gap-2 px-3 py-2.5 bg-background border-b border-border">
        <Button variant="ghost" size="icon" className="h-8 w-8 -ml-1 text-muted-foreground"
          onClick={() => router.back()}>
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm text-foreground truncate">{meta?.name ?? slug}</p>
          <p className="text-[11px] text-muted-foreground">{count} pasal</p>
        </div>
        <div className="flex items-center gap-1.5">
          <VersionSwitcher current={version} slug={slug} />
          <SettingsPanel />
        </div>
      </header>

      <main className="p-4 pb-8">
        {loading ? (
          <div className="grid grid-cols-5 sm:grid-cols-8 gap-2">
            {Array.from({length:20}).map((_,i) => (
              <Skeleton key={i} className="aspect-square rounded-lg" />
            ))}
          </div>
        ) : (
          /* Compact square grid — not too wide */
          <div className="grid gap-1.5"
            style={{ gridTemplateColumns:"repeat(auto-fill, minmax(44px, 1fr))", maxWidth:"380px" }}>
            {Array.from({ length: count }, (_, i) => i + 1).map(ch => (
              <Link key={ch} href={`/${version}/${slug}/${ch}`}
                className={cn(
                  "aspect-square flex items-center justify-center rounded-lg",
                  "text-sm font-medium transition-colors",
                  "bg-muted/40 border border-border text-foreground",
                  "hover:bg-accent hover:text-accent-foreground hover:border-primary/30"
                )}>
                {ch}
              </Link>
            ))}
          </div>
        )}
      </main>

    </div>
  )
}
