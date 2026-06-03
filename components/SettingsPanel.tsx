"use client"
import { useState, useEffect } from "react"
import { useTheme } from "next-themes"
import { Settings, Sun, Moon, Monitor } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuLabel,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
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

export function SettingsPanel() {
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
