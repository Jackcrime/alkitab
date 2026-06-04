"use client"
import { useState, useEffect } from "react"
import { useTheme } from "next-themes"
import {
  Settings, Sun, Moon, Monitor,
  Copy, Share2, Bookmark, BookmarkCheck, Columns2, Check,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuLabel,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import Link from "next/link"
import { cn } from "@/lib/utils"

const SIZES = [
  { key: "sm", label: "A", cls: "text-xs"  },
  { key: "md", label: "A", cls: "text-sm"  },
  { key: "lg", label: "A", cls: "text-base"},
  { key: "xl", label: "A", cls: "text-lg"  },
] as const

const THEMES = [
  { key: "light",  Icon: Sun,     label: "Terang" },
  { key: "dark",   Icon: Moon,    label: "Gelap"  },
  { key: "system", Icon: Monitor, label: "Sistem" },
] as const

export interface ChapterActions {
  bookmarked:   boolean
  copied:       boolean
  compareHref:  string
  onBookmark:   () => void
  onCopy:       () => void
  onShare:      () => void
}

interface Props {
  chapter?: ChapterActions
}

export function SettingsPanel({ chapter }: Props) {
  const [fontSize, setFs] = useState("md")
  const { theme, setTheme } = useTheme()

  useEffect(() => { setFs(localStorage.getItem("fontSize") ?? "md") }, [])

  function applyFs(key: string) {
    setFs(key)
    localStorage.setItem("fontSize", key)
    document.documentElement.setAttribute("data-font-size", key)
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground">
          <Settings className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56 p-3">

        {/* ── Chapter actions (only on reader) ───────────────────────── */}
        {chapter && (
          <>
            <DropdownMenuLabel className="px-0 pb-2">Aksi Pasal</DropdownMenuLabel>
            <div className="flex flex-col gap-1 mb-3">
              <button
                onClick={chapter.onCopy}
                className="flex items-center gap-2.5 w-full px-2.5 py-2 rounded-md text-sm text-foreground hover:bg-muted transition-colors text-left"
              >
                {chapter.copied
                  ? <Check className="h-3.5 w-3.5 text-green-500 shrink-0" />
                  : <Copy className="h-3.5 w-3.5 text-muted-foreground shrink-0" />}
                Salin Pasal
              </button>
              <button
                onClick={chapter.onShare}
                className="flex items-center gap-2.5 w-full px-2.5 py-2 rounded-md text-sm text-foreground hover:bg-muted transition-colors text-left"
              >
                <Share2 className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                Bagikan
              </button>
              <button
                onClick={chapter.onBookmark}
                className="flex items-center gap-2.5 w-full px-2.5 py-2 rounded-md text-sm text-foreground hover:bg-muted transition-colors text-left"
              >
                {chapter.bookmarked
                  ? <BookmarkCheck className="h-3.5 w-3.5 text-primary shrink-0" fill="currentColor" />
                  : <Bookmark className="h-3.5 w-3.5 text-muted-foreground shrink-0" />}
                {chapter.bookmarked ? "Hapus Bookmark" : "Bookmark Pasal"}
              </button>
              <Link
                href={chapter.compareHref}
                className="flex items-center gap-2.5 w-full px-2.5 py-2 rounded-md text-sm text-foreground hover:bg-muted transition-colors"
              >
                <Columns2 className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                Bandingkan Versi
              </Link>
            </div>
            <DropdownMenuSeparator className="-mx-3 mb-2" />
          </>
        )}

        {/* ── Font size ───────────────────────────────────────────────── */}
        <DropdownMenuLabel className="px-0 pb-2">Ukuran Teks</DropdownMenuLabel>
        <div className="flex gap-1.5 mb-3">
          {SIZES.map(s => (
            <button key={s.key} onClick={() => applyFs(s.key)}
              className={cn(
                "flex-1 py-1.5 rounded-md font-serif transition-colors border text-center",
                s.cls,
                fontSize === s.key
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-background text-muted-foreground border-border hover:bg-muted"
              )}>
              {s.label}
            </button>
          ))}
        </div>
        <DropdownMenuSeparator className="-mx-3 mb-2" />

        {/* ── Theme ───────────────────────────────────────────────────── */}
        <DropdownMenuLabel className="px-0 pb-2">Tampilan</DropdownMenuLabel>
        <div className="flex gap-1.5">
          {THEMES.map(({ key, Icon, label }) => (
            <button key={key} onClick={() => setTheme(key)}
              className={cn(
                "flex-1 flex flex-col items-center gap-1 py-2 rounded-md text-[10px] transition-colors border",
                theme === key
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-background text-muted-foreground border-border hover:bg-muted"
              )}>
              <Icon className="h-3.5 w-3.5" />
              {label}
            </button>
          ))}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
