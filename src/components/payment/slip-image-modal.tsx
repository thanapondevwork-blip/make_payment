'use client'

import { useState } from 'react'
import { ImageIcon, ZoomIn, ZoomOut } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'

interface SlipImageModalProps {
  imageUrl: string
  label?: string
}

export function SlipImageModal({ imageUrl, label }: SlipImageModalProps) {
  const [zoomed, setZoomed] = useState(false)

  return (
    <Dialog onOpenChange={() => setZoomed(false)}>
      <DialogTrigger className="inline-flex items-center gap-1.5 text-xs text-cyan-400 hover:text-cyan-300 hover:underline">
        <ImageIcon className="size-3" />
        ดูรูปสลิป
      </DialogTrigger>

      <DialogContent className="max-w-sm p-0 overflow-hidden">
        <DialogHeader className="px-4 pt-4 pb-0">
          <DialogTitle className="text-sm truncate pr-6">
            {label ?? 'รูปสลิปการโอนเงิน'}
          </DialogTitle>
        </DialogHeader>

        {/* Image */}
        <div
          className="overflow-auto cursor-zoom-in px-4 py-3"
          style={{ maxHeight: '70vh' }}
          onClick={() => setZoomed((z) => !z)}
        >
          <img
            src={imageUrl}
            alt="slip"
            className={`rounded-lg mx-auto transition-all duration-200 ${
              zoomed ? 'w-full' : 'max-h-[55vh] object-contain'
            }`}
          />
        </div>

        {/* Zoom hint */}
        <div className="flex items-center justify-center gap-1.5 px-4 pb-4">
          {zoomed ? (
            <ZoomOut className="size-3 text-muted-foreground" />
          ) : (
            <ZoomIn className="size-3 text-muted-foreground" />
          )}
          <span className="text-xs text-muted-foreground">
            {zoomed ? 'คลิกที่รูปเพื่อย่อ' : 'คลิกที่รูปเพื่อขยาย'}
          </span>
        </div>
      </DialogContent>
    </Dialog>
  )
}
