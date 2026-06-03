"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, BookOpen, Search, Bookmark } from "lucide-react"
import { cn } from "@/lib/utils"
import { useHideOnScroll } from "@/lib/hooks/useHideOnScroll"

const TABS = [
  { href: "/",         label: "Beranda",  Icon: Home     },
  { href: "/TB",       label: "Alkitab",  Icon: BookOpen },
  { href: "/cari",     label: "Cari",     Icon: Search   },
  { href: "/bookmark", label: "Bookmark", Icon: Bookmark },
]

export function BottomNav() {
  const path   = usePathname()
  const hidden = useHideOnScroll()

  function isActive(href: string) {
    if (href === "/")   return path === "/"
    if (href === "/TB") return /^\/(TB|BIS|TL)(\/|$)/.test(path) && !path.startsWith("/compare")
    return path.startsWith(href)
  }

  return (
    <nav className={cn(
      "ui-bottomnav fixed bottom-0 inset-x-0 z-50",
      "flex items-center justify-around",
      "bg-background border-t border-border",
      "h-[calc(var(--nav-h)+env(safe-area-inset-bottom,0px))]",
      "pb-[env(safe-area-inset-bottom,0px)]",
      hidden && "hidden"
    )}>
      {TABS.map(({ href, label, Icon }) => {
        const active = isActive(href)
        return (
          <Link key={href} href={href}
            className={cn(
              "flex flex-col items-center gap-1 px-6 py-2 transition-colors",
              active ? "text-primary" : "text-muted-foreground hover:text-foreground"
            )}>
            <Icon size={20} strokeWidth={active ? 2.5 : 1.75} />
            <span className={cn("text-[10px]", active ? "font-semibold" : "font-normal")}>
              {label}
            </span>
          </Link>
        )
      })}
    </nav>
  )
}
