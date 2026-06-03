"use client"
import { useRouter } from "next/navigation"
import { ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { VERSIONS, type Version } from "@/lib/bible"

interface Props { current: Version; slug?: string; chapter?: number }

export function VersionSwitcher({ current, slug, chapter }: Props) {
  const router = useRouter()

  function switchTo(v: Version) {
    if (slug && chapter) router.push(`/${v}/${slug}/${chapter}`)
    else if (slug)        router.push(`/${v}/${slug}`)
    else                  router.push(`/${v}`)
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="h-8 gap-1 px-2.5 font-semibold text-primary border-primary/30 bg-accent">
          {current}
          <ChevronDown className="h-3 w-3" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-52">
        <DropdownMenuLabel>Pilih Versi</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {VERSIONS.map(v => (
          <DropdownMenuItem key={v.code} onClick={() => switchTo(v.code)}
            className="flex items-center justify-between cursor-pointer">
            <div className="flex items-center gap-2">
              <Badge variant={v.code === current ? "default" : "outline"} className="w-10 justify-center text-[10px]">
                {v.code}
              </Badge>
              <span className="text-xs text-muted-foreground">{v.desc}</span>
            </div>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
