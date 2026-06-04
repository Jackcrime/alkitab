"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Bookmark, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { SettingsPanel } from "@/components/SettingsPanel"
import { getBookmarks, removeBookmark, type Bookmark as BM } from "@/lib/bookmarks"

export default function BookmarkPage() {
  const [bookmarks, setBookmarks] = useState<BM[]>([])
  useEffect(() => setBookmarks(getBookmarks()), [])

  function remove(bm: BM) {
    removeBookmark(bm.version, bm.slug, bm.chapter)
    setBookmarks(prev => prev.filter(b => b.id !== bm.id))
  }

  const fmt = (ts: number) =>
    new Intl.DateTimeFormat("id-ID", { day:"numeric", month:"short", year:"numeric" }).format(new Date(ts))

  return (
    <div className="min-h-dvh bg-background">
      <header className="sticky top-0 z-40 flex items-center justify-between px-4 py-3.5 bg-background border-b border-border">
        <p className="font-semibold text-base text-foreground">Bookmark</p>
        <SettingsPanel />
      </header>

      <main className="pb-8">
        {bookmarks.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-24">
            <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center">
              <Bookmark className="h-6 w-6 text-muted-foreground" />
            </div>
            <p className="text-sm font-medium text-foreground">Belum ada bookmark</p>
            <p className="text-xs text-muted-foreground text-center max-w-[200px]">
              Tap ikon bookmark saat membaca untuk menyimpan pasal
            </p>
          </div>
        ) : (
          <>
            <div className="px-4 py-2.5">
              <p className="text-[11px] text-muted-foreground">{bookmarks.length} tersimpan</p>
            </div>
            <div>
              {bookmarks.map((bm, idx) => (
                <div key={bm.id}>
                  <div className="flex items-center gap-3 px-4 py-3 hover:bg-muted/30 transition-colors">
                    <Link href={`/${bm.version}/${bm.slug}/${bm.chapter}`} className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-foreground">
                        {bm.bookName} {bm.chapter}
                      </p>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <Badge variant="outline" className="text-[9px] py-0 h-4">{bm.version}</Badge>
                        <span className="text-[10px] text-muted-foreground">{fmt(bm.savedAt)}</span>
                      </div>
                    </Link>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive shrink-0"
                      onClick={() => remove(bm)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  {idx < bookmarks.length - 1 && <Separator />}
                </div>
              ))}
            </div>
          </>
        )}
      </main>
    </div>
  )
}
