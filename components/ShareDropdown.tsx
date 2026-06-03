"use client"
import { Copy, MessageCircle, Send, Twitter } from "lucide-react"
import {
  DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { type SharePayload, waLink, tgLink, xLink, copyPayload } from "@/lib/share"

interface Props { payload: SharePayload; onClose: () => void; onCopied: () => void }

export function ShareDropdownContent({ payload, onClose, onCopied }: Props) {
  async function handleCopy() {
    await copyPayload(payload)
    onCopied(); onClose()
  }

  return (
    <DropdownMenuContent align="end" className="w-48">
      <DropdownMenuLabel>Bagikan ke</DropdownMenuLabel>
      <DropdownMenuSeparator />
      <DropdownMenuItem onClick={handleCopy} className="cursor-pointer">
        <Copy className="mr-2 h-4 w-4" /> Salin teks
      </DropdownMenuItem>
      <DropdownMenuItem asChild>
        <a href={waLink(`${payload.text}\n${payload.url}`)} target="_blank" rel="noopener noreferrer" onClick={onClose} className="cursor-pointer">
          <MessageCircle className="mr-2 h-4 w-4" /> WhatsApp
        </a>
      </DropdownMenuItem>
      <DropdownMenuItem asChild>
        <a href={tgLink(payload.text, payload.url)} target="_blank" rel="noopener noreferrer" onClick={onClose} className="cursor-pointer">
          <Send className="mr-2 h-4 w-4" /> Telegram
        </a>
      </DropdownMenuItem>
      <DropdownMenuItem asChild>
        <a href={xLink(payload.text, payload.url)} target="_blank" rel="noopener noreferrer" onClick={onClose} className="cursor-pointer">
          <Twitter className="mr-2 h-4 w-4" /> X / Twitter
        </a>
      </DropdownMenuItem>
    </DropdownMenuContent>
  )
}
