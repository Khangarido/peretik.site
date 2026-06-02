import { TrendingUp, TrendingDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { LucideIcon } from 'lucide-react'

interface Props {
  title: string
  value: string | number
  change?: number
  icon: LucideIcon
  accent?: boolean
}

export function StatsCard({ title, value, change, icon: Icon, accent }: Props) {
  const isPositive = (change ?? 0) >= 0

  return (
    <div className={cn(
      'p-5 rounded border transition-colors',
      accent
        ? 'bg-[#CA8A04]/5 border-[#CA8A04]/20'
        : 'bg-[#0D0D0D] border-white/[0.06] hover:border-white/10'
    )}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs text-zinc-500 uppercase tracking-widest">{title}</p>
          <p className={cn(
            'text-2xl font-bold mt-2 font-heading',
            accent ? 'text-[#CA8A04]' : 'text-white'
          )}>
            {value}
          </p>
        </div>
        <div className={cn(
          'p-2.5 rounded',
          accent ? 'bg-[#CA8A04]/10' : 'bg-white/[0.04]'
        )}>
          <Icon size={18} className={accent ? 'text-[#CA8A04]' : 'text-zinc-400'} />
        </div>
      </div>

      {change !== undefined && (
        <div className={cn(
          'flex items-center gap-1 mt-3 text-xs',
          isPositive ? 'text-green-400' : 'text-red-400'
        )}>
          {isPositive ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
          <span>{Math.abs(change)}% сүүлийн 30 хоног</span>
        </div>
      )}
    </div>
  )
}
