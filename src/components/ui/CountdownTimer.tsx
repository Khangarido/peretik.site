'use client'

import { useEffect, useState } from 'react'

interface Props {
  endsAt: string
  lang?: 'mn' | 'en'
}

interface TimeLeft {
  days: number
  hours: number
  minutes: number
  seconds: number
  expired: boolean
}

function calcTimeLeft(endsAt: string): TimeLeft {
  const diff = new Date(endsAt).getTime() - Date.now()
  if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0, expired: true }
  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / (1000 * 60)) % 60),
    seconds: Math.floor((diff / 1000) % 60),
    expired: false,
  }
}

const units = {
  mn: ['Өдөр', 'Цаг', 'Мин', 'Сек'],
  en: ['Days', 'Hours', 'Min', 'Sec'],
}

export function CountdownTimer({ endsAt, lang = 'mn' }: Props) {
  const [time, setTime] = useState<TimeLeft>(() => calcTimeLeft(endsAt))

  useEffect(() => {
    const id = setInterval(() => setTime(calcTimeLeft(endsAt)), 1000)
    return () => clearInterval(id)
  }, [endsAt])

  if (time.expired) return null

  const segments = [time.days, time.hours, time.minutes, time.seconds]
  const labels = units[lang]

  return (
    <div className="flex items-center gap-3">
      {segments.map((val, i) => (
        <div key={i} className="flex flex-col items-center">
          <div className="w-14 h-14 bg-[#111] border border-white/[0.08] rounded flex items-center justify-center">
            <span className="font-heading text-2xl font-bold text-[#CA8A04] tabular-nums leading-none">
              {String(val).padStart(2, '0')}
            </span>
          </div>
          <span className="text-[9px] text-zinc-600 tracking-widest uppercase mt-1.5">
            {labels[i]}
          </span>
        </div>
      ))}
    </div>
  )
}
