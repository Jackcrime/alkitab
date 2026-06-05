"use client"
import { useState, useEffect } from "react"
import { useTheme } from "next-themes"
import {
  Settings, Sun, Moon, Monitor,
  Copy, Share2, Columns2, Check, X,
} from "lucide-react"
import Link from "next/link"
import { Button }    from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { cn }        from "@/lib/utils"

const SIZES = [
  { key: "sm", label: "A", cls: "text-xs"   },
  { key: "md", label: "A", cls: "text-sm"   },
  { key: "lg", label: "A", cls: "text-base" },
  { key: "xl", label: "A", cls: "text-lg"   },
]

const THEMES = [
  { key: "light",  Icon: Sun,     label: "Terang"  },
  { key: "dark",   Icon: Moon,    label: "Gelap"   },
  { key: "system", Icon: Monitor, label: "Sistem"  },
]

export interface ChapterActions {
  copied:      boolean
  compareHref: string
  onCopy:      () => void
  onShare:     () => void
}

interface Props {
  chapter?: ChapterActions
}

export function SettingsPanel({ chapter }: Props) {
  const [open,     setOpen]    = useState(false)
  const [fontSize, setFontSize] = useState("md")
  const { theme, setTheme }   = useTheme()

  useEffect(() => {
    setFontSize(localStorage.getItem("fontSize") ?? "md")
  }, [])

  function applyFontSize(key: string) {
    setFontSize(key)
    localStorage.setItem("fontSize", key)
    document.documentElement.setAttribute("data-font-size", key)
  }

  return (
    <>
      {/* Trigger */}
      <Button
        variant="ghost" size="icon"
        className="h-8 w-8 text-muted-foreground shrink-0"
        onClick={() => setOpen(true)}
      >
        <Settings className="h-4 w-4" />
      </Button>

      {/* Sidebar */}
      {open && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-50 bg-black/20 backdrop-blur-[1px]"
            onClick={() => setOpen(false)}
          />

          {/* Panel */}
          <div className="fixed right-0 top-0 bottom-0 z-50 w-72 bg-background border-l border-border flex flex-col shadow-2xl">

            {/* Header */}
            <div className="flex items-center justify-between px-4 py-4 border-b border-border shrink-0">
              <p className="font-semibold text-sm text-foreground">Pengaturan</p>
              <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground"
                onClick={() => setOpen(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Scrollable body */}
            <div className="flex-1 overflow-y-auto">
              <div className="px-4 py-4 space-y-5">

                {/* Chapter actions */}
                {chapter && (
                  <>
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-2">
                        Aksi Pasal
                      </p>
                      <div className="flex flex-col gap-0.5">
                        <button
                          onClick={() => { chapter.onCopy(); setOpen(false) }}
                          className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm text-foreground hover:bg-muted transition-colors text-left">
                          {chapter.copied
                            ? <Check className="h-3.5 w-3.5 text-green-500 shrink-0" />
                            : <Copy  className="h-3.5 w-3.5 text-muted-foreground shrink-0" />}
                          {chapter.copied ? "Tersalin!" : "Salin Pasal"}
                        </button>
                        <button
                          onClick={() => { chapter.onShare(); setOpen(false) }}
                          className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm text-foreground hover:bg-muted transition-colors text-left">
                          <Share2  className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                          Bagikan Pasal
                        </button>
                        <Link
                          href={chapter.compareHref}
                          onClick={() => setOpen(false)}
                          className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm text-foreground hover:bg-muted transition-colors">
                          <Columns2 className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                          Bandingkan Versi
                        </Link>
                      </div>
                    </div>
                    <Separator />
                  </>
                )}

                {/* Font size */}
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-2.5">
                    Ukuran Teks
                  </p>
                  <div className="flex gap-1.5">
                    {SIZES.map(s => (
                      <button key={s.key} onClick={() => applyFontSize(s.key)}
                        className={cn(
                          "flex-1 py-2.5 rounded-xl font-serif border transition-all text-center",
                          s.cls,
                          fontSize === s.key
                            ? "bg-primary text-primary-foreground border-primary shadow-sm"
                            : "bg-muted/40 text-muted-foreground border-border hover:bg-muted"
                        )}>
                        {s.label}
                      </button>
                    ))}
                  </div>
                </div>

                <Separator />

                {/* Theme */}
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-2.5">
                    Tampilan
                  </p>
                  <div className="flex gap-1.5">
                    {THEMES.map(({ key, Icon, label }) => (
                      <button key={key} onClick={() => setTheme(key)}
                        className={cn(
                          "flex-1 flex flex-col items-center gap-1.5 py-3 rounded-xl text-[10px] border transition-all",
                          theme === key
                            ? "bg-primary text-primary-foreground border-primary shadow-sm"
                            : "bg-muted/40 text-muted-foreground border-border hover:bg-muted"
                        )}>
                        <Icon className="h-3.5 w-3.5" />
                        {label}
                      </button>
                    ))}
                  </div>
                </div>

              </div>
            </div>

            {/* Footer / App info */}
            <div className="border-t border-border px-4 py-4 shrink-0">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                  <span className="text-primary font-extrabold text-[11px] tracking-tight">AK</span>
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">Alkitab GKPB</p>
                  <p className="text-[10px] text-muted-foreground">Versi 1.0.0</p>
                </div>
              </div>
              <p className="text-[10px] text-muted-foreground/50 text-center leading-relaxed">
                TB · BIS · TL<br/>Gereja Kristen Protestan di Bali
              </p>
            </div>

          </div>
        </>
      )}
    </>
  )
}
