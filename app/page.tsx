"use client"
import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { getLastRead } from "@/lib/storage"

export default function Home() {
  const router = useRouter()
  useEffect(() => {
    const last = getLastRead()
    if (last) router.replace(`/${last.version}/${last.slug}/${last.chapter}`)
    else       router.replace("/TB")
  }, [])
  // Blank while redirecting
  return <div className="min-h-dvh bg-background" />
}
