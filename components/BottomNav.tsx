"use client"

import Link               from "next/link"
import { usePathname }    from "next/navigation"
import { Home, BookOpen, Search, Bookmark, ChevronLeft, ChevronRight } from "lucide-react"
import { cn }             from "@/lib/utils"

interface Props {
  prevUrl?:   string | null
  nextUrl?:   string | null
  prevLabel?: string
  nextLabel?: string
}

const TABS = [
  { href: "/",         label: "Beranda",  Icon: Home     },
  { href: "/TB",       label: "Alkitab",  Icon: BookOpen },
  { href: "/cari",     label: "Cari",     Icon: Search   },
  { href: "/bookmark", label: "Bookmark", Icon: Bookmark },
]

export function BottomNav({ prevUrl, nextUrl, prevLabel, nextLabel }: Props) {
  const path       = usePathname()
  const hasChapNav = prevUrl !== undefined || nextUrl !== undefined

  function isActive(href: string) {
    if (href === "/")   return path === "/"
    if (href === "/TB") return /^\/(TB|BIS|TL)(\/|$)/.test(path) && !path.startsWith("/compare")
    return path.startsWith(href)
  }

  return (
    <nav className={cn(
      "fixed bottom-0 inset-x-0 z-50 flex items-stretch",
      "bg-background border-t border-border",
      "h-[calc(var(--nav-h)+env(safe-area-inset-bottom,0px))]",
      "pb-[env(safe-area-inset-bottom,0px)]",
    )}>

      {/* Prev chapter arrow — only on reader */}
      {hasChapNav && (
        prevUrl ? (
          <Link href={prevUrl}
            className="flex flex-col items-center justify-center px-3 min-w-[52px] text-muted-foreground hover:text-foreground hover:bg-muted/40 transition-colors">
            <ChevronLeft className="h-5 w-5" />
            <span className="text-[9px] font-medium mt-0.5 max-w-[44px] truncate text-center leading-tight">
              {prevLabel}
            </span>
          </Link>
        ) : (
          <div className="min-w-[52px] px-3" />
        )
      )}

      {/* Main tabs */}
      <div className="flex flex-1 items-center justify-around">
        {TABS.map(({ href, label, Icon }) => {
          const active = isActive(href)
          return (
            <Link key={href} href={href}
              className={cn(
                "flex flex-col items-center justify-center gap-1 px-3 h-full transition-colors",
                active ? "text-primary" : "text-muted-foreground hover:text-foreground"
              )}>
              <Icon size={20} strokeWidth={active ? 2.5 : 1.75} />
              <span className={cn("text-[10px]", active ? "font-semibold" : "font-normal")}>
                {label}
              </span>
            </Link>
          )
        })}
      </div>

      {/* Next chapter arrow — only on reader */}
      {hasChapNav && (
        nextUrl ? (
          <Link href={nextUrl}
            className="flex flex-col items-center justify-center px-3 min-w-[52px] text-muted-foreground hover:text-foreground hover:bg-muted/40 transition-colors">
            <ChevronRight className="h-5 w-5" />
            <span className="text-[9px] font-medium mt-0.5 max-w-[44px] truncate text-center leading-tight">
              {nextLabel}
            </span>
          </Link>
        ) : (
          <div className="min-w-[52px] px-3" />
        )
      )}
    </nav>
  )
}
