'use client'

import { useEffect, useState } from 'react'
import { useLangStore } from '@/lib/store/langStore'

interface Props {
  endsAt: string
}

export function PresaleCountdown({ endsAt }: Props) {
  const { t } = useLangStore()
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 })

  useEffect(() => {
    const calc = () => {
      const diff = new Date(endsAt).getTime() - Date.now()
      if (diff <= 0) return
      setTimeLeft({
        days: Math.floor(diff / 86400000),
        hours: Math.floor((diff % 86400000) / 3600000),
        minutes: Math.floor((diff % 3600000) / 60000),
        seconds: Math.floor((diff % 60000) / 1000),
      })
    }
    calc()
    const id = setInterval(calc, 1000)
    return () => clearInterval(id)
  }, [endsAt])

  const pad = (n: number) => String(n).padStart(2, '0')

  return (
    <div className="flex items-center gap-3">
      <span className="text-xs text-zinc-500 uppercase tracking-widest">{t.product.presale_ends}</span>
      <div className="flex gap-2">
        {[
          { value: timeLeft.days, label: t.product.days },
          { value: timeLeft.hours, label: t.product.hours },
          { value: timeLeft.minutes, label: t.product.minutes },
          { value: timeLeft.seconds, label: t.product.seconds },
        ].map(({ value, label }) => (
          <div key={label} className="text-center">
            <div className="bg-[#111] border border-white/[0.08] rounded px-2 py-1 font-mono text-sm font-bold text-[#CA8A04] min-w-[2rem]">
              {pad(value)}
            </div>
            <div className="text-[9px] text-zinc-600 mt-0.5">{label}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
