'use client'

import { cn } from '@/lib/utils'

type BadgeVariant = 'presale' | 'featured' | 'out-of-stock' | 'new'

interface Props {
  variant: BadgeVariant
  className?: string
}

const styles: Record<BadgeVariant, string> = {
  presale: 'bg-[#CA8A04] text-black border-transparent',
  featured: 'bg-white text-black border-transparent',
  'out-of-stock': 'bg-red-600/90 text-white border-transparent',
  new: 'bg-transparent text-white border-white/30',
}

const labels: Record<BadgeVariant, string> = {
  presale: 'PRE-SALE',
  featured: 'FEATURED',
  'out-of-stock': 'SOLD OUT',
  new: 'NEW',
}

export function PBadge({ variant, className }: Props) {
  return (
    <span
      className={cn(
        'inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold tracking-[0.12em] border uppercase select-none',
        styles[variant],
        className
      )}
    >
      {labels[variant]}
    </span>
  )
}
