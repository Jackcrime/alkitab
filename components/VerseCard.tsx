"use client"

import { useRef, useState } from "react"
import { toPng }            from "html-to-image"
import { Download, Share2, X } from "lucide-react"
import { cn } from "@/lib/utils"

const THEMES = [
  { id: "gold",     bg: "from-amber-400 via-orange-500 to-rose-500",       text: "text-white"      },
  { id: "ocean",    bg: "from-blue-500 via-blue-600 to-indigo-700",        text: "text-white"      },
  { id: "forest",   bg: "from-emerald-500 via-teal-600 to-cyan-700",       text: "text-white"      },
  { id: "lavender", bg: "from-purple-500 via-violet-600 to-indigo-700",    text: "text-white"      },
  { id: "sunset",   bg: "from-rose-400 via-pink-500 to-fuchsia-600",       text: "text-white"      },
  { id: "midnight", bg: "from-slate-700 via-slate-800 to-zinc-900",        text: "text-white"      },
  { id: "cream",    bg: "from-amber-50 via-orange-50 to-yellow-100",       text: "text-slate-800"  },
  { id: "sage",     bg: "from-stone-50 via-green-50 to-emerald-100",       text: "text-slate-800"  },
]

// Swatch colors for the theme picker buttons
const SWATCHES: Record<string, string> = {
  gold: "linear-gradient(135deg,#fbbf24,#f97316,#f43f5e)",
  ocean: "linear-gradient(135deg,#3b82f6,#4f46e5)",
  forest: "linear-gradient(135deg,#10b981,#0891b2)",
  lavender: "linear-gradient(135deg,#a855f7,#4f46e5)",
  sunset: "linear-gradient(135deg,#fb7185,#e879f9)",
  midnight: "linear-gradient(135deg,#334155,#18181b)",
  cream: "linear-gradient(135deg,#fef9c3,#fef3c7)",
  sage: "linear-gradient(135deg,#f5f5f4,#d1fae5)",
}

interface Props {
  verse:    number
  text:     string
  bookName: string
  chapter:  number
  version:  string
  onClose:  () => void
}

export function VerseCard({ verse, text, bookName, chapter, version, onClose }: Props) {
  const [theme,   setTheme]   = useState(THEMES[0])
  const [loading, setLoading] = useState(false)
  const cardRef               = useRef<HTMLDivElement>(null)

  async function capture() {
    if (!cardRef.current) return null
    return toPng(cardRef.current, { pixelRatio: 3, cacheBust: true })
  }

  async function handleDownload() {
    setLoading(true)
    try {
      const url = await capture()
      if (!url) return
      const a = document.createElement("a")
      a.href = url
      a.download = `${bookName}-${chapter}-${verse}.png`
      a.click()
    } finally { setLoading(false) }
  }

  async function handleShare() {
    setLoading(true)
    try {
      const url = await capture()
      if (!url) return
      const blob = await (await fetch(url)).blob()
      const file = new File([blob], `${bookName}-${chapter}-${verse}.png`, { type: "image/png" })
      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file], title: `${bookName} ${chapter}:${verse}` })
      } else {
        // fallback: download
        const a = document.createElement("a")
        a.href = url; a.download = file.name; a.click()
      }
    } finally { setLoading(false) }
  }

  return (
    <>
      <div className="fixed inset-0 z-[70] bg-black/70 backdrop-blur-md" onClick={onClose} />

      <div
        className="fixed inset-x-5 z-[70]"
        style={{ top: "50%", transform: "translateY(-50%)" }}
        onClick={e => e.stopPropagation()}
      >
        {/* ── Card preview ───────────────────────────────────────────────── */}
        <div
          ref={cardRef}
          className={cn(
            "bg-gradient-to-br rounded-3xl p-8 flex flex-col gap-4 w-full",
            theme.bg, theme.text,
          )}
          style={{ aspectRatio: "4/5" }}
        >
          <span className="font-serif text-5xl leading-none opacity-20">&ldquo;</span>

          <p className="font-serif text-lg leading-relaxed flex-1 flex items-center">
            {text}
          </p>

          <div className="flex items-end justify-between">
            <div>
              <p className="font-semibold text-base opacity-90">
                {bookName} {chapter}:{verse}
              </p>
              <p className="text-xs opacity-60 mt-0.5">{version}</p>
            </div>
            <p className="text-[10px] opacity-30 font-medium tracking-wide">
              Alkitab GKPB
            </p>
          </div>
        </div>

        {/* ── Theme picker ───────────────────────────────────────────────── */}
        <div className="flex gap-2 justify-center mt-4">
          {THEMES.map(t => (
            <button
              key={t.id}
              onClick={() => setTheme(t)}
              className={cn(
                "w-7 h-7 rounded-full border-2 transition-all",
                theme.id === t.id ? "border-white scale-125" : "border-white/30 opacity-60",
              )}
              style={{ background: SWATCHES[t.id] }}
            />
          ))}
        </div>

        {/* ── Actions ────────────────────────────────────────────────────── */}
        <div className="flex gap-2 mt-4">
          <button
            onClick={onClose}
            className="h-11 w-11 shrink-0 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center text-white backdrop-blur-sm"
          >
            <X className="h-4 w-4" />
          </button>

          <button
            onClick={handleDownload}
            disabled={loading}
            className="flex-1 h-11 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center gap-2 text-white text-sm font-medium backdrop-blur-sm disabled:opacity-50"
          >
            <Download className="h-4 w-4" />
            Unduh
          </button>

          <button
            onClick={handleShare}
            disabled={loading}
            className="flex-1 h-11 rounded-2xl bg-white text-slate-900 flex items-center justify-center gap-2 text-sm font-bold disabled:opacity-50"
          >
            <Share2 className="h-4 w-4" />
            Bagikan
          </button>
        </div>
      </div>
    </>
  )
}
