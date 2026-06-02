import Link from 'next/link'
import { cn } from '@/lib/utils'

interface Props {
  title: string
  description?: string
  actionLabel?: string
  actionHref?: string
  icon?: React.ReactNode
  className?: string
}

export function EmptyState({ title, description, actionLabel, actionHref, icon, className }: Props) {
  return (
    <div className={cn('flex flex-col items-center justify-center py-20 gap-5 text-center', className)}>
      {icon && (
        <div className="w-16 h-16 rounded-full bg-[#0D0D0D] border border-white/[0.06] flex items-center justify-center text-zinc-600">
          {icon}
        </div>
      )}
      <div className="space-y-2">
        <p className="font-heading text-2xl text-zinc-500">{title}</p>
        {description && <p className="text-sm text-zinc-700 max-w-sm">{description}</p>}
      </div>
      {actionLabel && actionHref && (
        <Link
          href={actionHref}
          className="text-sm text-[#CA8A04] hover:underline underline-offset-4"
        >
          {actionLabel} →
        </Link>
      )}
    </div>
  )
}
