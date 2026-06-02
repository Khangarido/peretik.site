'use client'

import { useLangStore } from '@/lib/store/langStore'
import { cn } from '@/lib/utils'

interface HeatCell {
  hour: number
  day: number
  value: number
}

interface Props {
  data: HeatCell[]
}

const DAYS_MN = ['Да', 'Мя', 'Лх', 'Пү', 'Ба', 'Бя', 'Ня']
const DAYS_EN = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
const HOURS = Array.from({ length: 24 }, (_, i) => i)

function getColor(value: number, max: number): string {
  if (max === 0) return 'rgba(255,255,255,0.02)'
  const intensity = value / max
  return `rgba(202,138,4,${(intensity * 0.8 + 0.05).toFixed(2)})`
}

export function DemandHeatmap({ data }: Props) {
  const { t, lang } = useLangStore()
  const days = lang === 'mn' ? DAYS_MN : DAYS_EN

  const matrix = Array.from({ length: 7 }, (_, day) =>
    Array.from({ length: 24 }, (_, hour) => {
      const cell = data.find((d) => d.day === day && d.hour === hour)
      return cell?.value ?? 0
    })
  )

  const max = Math.max(...data.map((d) => d.value), 1)

  return (
    <div className="p-5 bg-[#0D0D0D] rounded border border-white/[0.06]">
      <h3 className="text-sm font-semibold text-zinc-300 uppercase tracking-widest mb-5">
        {t.admin.demand_heatmap}
      </h3>

      <div className="overflow-x-auto">
        <div className="min-w-[600px]">
          {/* Hour labels */}
          <div className="flex ml-8 mb-1">
            {HOURS.filter((h) => h % 4 === 0).map((h) => (
              <div
                key={h}
                className="text-[9px] text-zinc-600"
                style={{ width: `${100 / 24 * 4}%`, textAlign: 'left' }}
              >
                {h}:00
              </div>
            ))}
          </div>

          {/* Grid */}
          {matrix.map((row, day) => (
            <div key={day} className="flex items-center gap-1 mb-0.5">
              <span className="text-[10px] text-zinc-600 w-7 flex-shrink-0">{days[day]}</span>
              <div className="flex flex-1 gap-[1px]">
                {row.map((val, hour) => (
                  <div
                    key={hour}
                    className="flex-1 h-4 rounded-[1px]"
                    style={{ background: getColor(val, max) }}
                    title={`${days[day]} ${hour}:00 — ${val} views`}
                  />
                ))}
              </div>
            </div>
          ))}

          {/* Legend */}
          <div className="flex items-center gap-2 mt-3 justify-end">
            <span className="text-[9px] text-zinc-600">Бага</span>
            {[0.05, 0.25, 0.5, 0.75, 1].map((v) => (
              <div
                key={v}
                className="w-4 h-3 rounded-[1px]"
                style={{ background: `rgba(202,138,4,${v})` }}
              />
            ))}
            <span className="text-[9px] text-zinc-600">Их</span>
          </div>
        </div>
      </div>
    </div>
  )
}
