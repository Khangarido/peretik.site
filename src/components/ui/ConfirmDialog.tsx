'use client'

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'

interface Props {
  open: boolean
  title?: string
  description?: string
  confirmLabel?: string
  cancelLabel?: string
  onConfirm: () => void
  onCancel: () => void
  danger?: boolean
}

export function ConfirmDialog({
  open,
  title = 'Та итгэлтэй байна уу?',
  description,
  confirmLabel = 'Тийм',
  cancelLabel = 'Болих',
  onConfirm,
  onCancel,
  danger = true,
}: Props) {
  return (
    <AlertDialog open={open} onOpenChange={(open: boolean) => !open && onCancel()}>
      <AlertDialogContent className="bg-[#111] border border-white/10 text-white max-w-sm" onOpenAutoFocus={(e) => e.preventDefault()}>
        <AlertDialogHeader>
          <AlertDialogTitle className="font-heading text-xl text-white">{title}</AlertDialogTitle>
          {description && (
            <AlertDialogDescription className="text-zinc-500 text-sm">{description}</AlertDialogDescription>
          )}
        </AlertDialogHeader>
        <AlertDialogFooter className="gap-2">
          <AlertDialogCancel
            onClick={onCancel}
            className="bg-transparent border-white/10 text-zinc-300 hover:text-white hover:bg-white/[0.05]"
          >
            {cancelLabel}
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            className={danger
              ? 'bg-red-500/80 hover:bg-red-500 text-white font-semibold border-0'
              : 'bg-[#CA8A04] hover:bg-[#D97706] text-black font-semibold border-0'
            }
          >
            {confirmLabel}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
