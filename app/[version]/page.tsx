"use client"

import { useState, useEffect, useMemo } from "react"
import Link from "next/link"
import { ChevronRight } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import { Separator } from "@/components/ui/separator"
import { VersionSwitcher } from "@/components/VersionSwitcher"
import { SettingsPanel } from "@/components/SettingsPanel"
import { getBookIndex, isOldTestament, type BookMeta, type Version } from "@/lib/bible"
import { getAbbr } from "@/lib/book-abbr"
import { cn } from "@/lib/utils"

export default function BookListPage({ params }: { params: { version: string } }) {
  const version = params.version.toUpperCase() as Version
  const [books,   setBooks]   = useState<BookMeta[]>([])
  const [loading, setLoading] = useState(true)
  const [filter,  setFilter]  = useState("")

  useEffect(() => {
    setLoading(true)
    getBookIndex(version).then(setBooks).finally(() => setLoading(false))
  }, [version])

  const pl = useMemo(() => {
    const q = filter.toLowerCase()
    return books
      .filter(b => isOldTestament(b.bnumber))
      .filter(b => !q || b.name.toLowerCase().includes(q) || getAbbr(b.slug).toLowerCase().includes(q))
  }, [books, filter])

  const pb = useMemo(() => {
    const q = filter.toLowerCase()
    return books
      .filter(b => !isOldTestament(b.bnumber))
      .filter(b => !q || b.name.toLowerCase().includes(q) || getAbbr(b.slug).toLowerCase().includes(q))
  }, [books, filter])

  const vDesc = version === "TB" ? "Terjemahan Baru"
    : version === "BIS" ? "Bahasa Indonesia Sehari-hari"
    : "Terjemahan Lama"

  return (
    <div className="min-h-dvh bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background border-b border-border px-4 pt-3.5 pb-0">
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="font-semibold text-base text-foreground leading-tight">Alkitab</p>
            <p className="text-[11px] text-muted-foreground">{vDesc}</p>
          </div>
          <div className="flex items-center gap-1.5">
            <VersionSwitcher current={version} />
            <SettingsPanel />
          </div>
        </div>

        {!loading && (
          <Input
            value={filter}
            onChange={e => setFilter(e.target.value)}
            placeholder="Cari kitab..."
            className="mb-3 h-8 text-sm bg-muted/40 border-border"
          />
        )}

        {/* PL / PB tabs */}
        {!loading && (
          <Tabs defaultValue="PL">
            <TabsList className="w-full rounded-none bg-transparent border-b-0 h-auto p-0 gap-0">
              <TabsTrigger value="PL"
                className="flex-1 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none pb-2.5 text-sm font-medium">
                Perjanjian Lama
                <Badge variant="secondary" className="ml-1.5 text-[10px] py-0 h-4">{pl.length}</Badge>
              </TabsTrigger>
              <TabsTrigger value="PB"
                className="flex-1 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none pb-2.5 text-sm font-medium">
                Perjanjian Baru
                <Badge variant="secondary" className="ml-1.5 text-[10px] py-0 h-4">{pb.length}</Badge>
              </TabsTrigger>
            </TabsList>

            {/* ── Book lists (inside Tabs so tabs work, but rendered below header) */}
            <div className="pb-8">
              <TabsContent value="PL" className="mt-0">
                <BookList books={pl} version={version} />
              </TabsContent>
              <TabsContent value="PB" className="mt-0">
                <BookList books={pb} version={version} />
              </TabsContent>
            </div>
          </Tabs>
        )}

        {loading && (
          <div className="py-6 px-0 space-y-3">
            {Array.from({length:8}).map((_,i) => (
              <Skeleton key={i} className="h-11 w-full rounded-lg" />
            ))}
          </div>
        )}
      </header>

    </div>
  )
}

function BookList({ books, version }: { books: BookMeta[]; version: Version }) {
  if (books.length === 0)
    return <p className="text-center text-sm text-muted-foreground py-16">Kitab tidak ditemukan</p>

  return (
    <div>
      {books.map((book, idx) => (
        <div key={book.bnumber}>
          <Link href={`/${version}/${book.slug}`}
            className="flex items-center gap-3 px-4 py-3 hover:bg-muted/40 transition-colors group">
            <span className="text-[10px] text-muted-foreground w-5 text-right shrink-0 tabular-nums">
              {book.bnumber}
            </span>
            <Badge variant="accent" className="text-[10px] w-9 justify-center shrink-0 py-0.5">
              {getAbbr(book.slug)}
            </Badge>
            <span className="flex-1 text-sm font-medium text-foreground">{book.name}</span>
            <span className="text-xs text-muted-foreground shrink-0">{book.chapters} psl</span>
            <ChevronRight className="h-3.5 w-3.5 text-muted-foreground shrink-0 group-hover:text-foreground transition-colors" />
          </Link>
          {idx < books.length - 1 && <Separator />}
        </div>
      ))}
    </div>
  )
}
