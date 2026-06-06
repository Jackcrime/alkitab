"use client"
import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { getLastRead } from "@/lib/storage"

export default function SearchPage() {
  const router = useRouter()
  useEffect(() => {
    const last = getLastRead()
    if (last) router.replace(`/${last.version}/${last.slug}/${last.chapter}`)
    else       router.replace("/TB/kejadian/1")
  }, [router])
  return null
}
