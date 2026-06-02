'use client'

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { useLangStore } from '@/lib/store/langStore'

interface DataPoint {
  date: string
  revenue: number
}

interface Props {
  data: DataPoint[]
}

function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: { value: number }[]; label?: string }) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-[#111] border border-white/[0.08] rounded px-3 py-2 text-xs">
      <p className="text-zinc-400">{label}</p>
      <p className="text-[#CA8A04] font-semibold">{payload[0].value.toLocaleString()}₮</p>
    </div>
  )
}

export function RevenueChart({ data }: Props) {
  const { t } = useLangStore()

  return (
    <div className="p-5 bg-[#0D0D0D] rounded border border-white/[0.06]">
      <h3 className="text-sm font-semibold text-zinc-300 uppercase tracking-widest mb-5">
        {t.admin.revenue_chart}
      </h3>
      <ResponsiveContainer width="100%" height={220}>
        <AreaChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
          <defs>
            <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#CA8A04" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#CA8A04" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 10, fill: '#71717A' }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 10, fill: '#71717A' }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
          />
          <Tooltip content={<CustomTooltip />} />
          <Area
            type="monotone"
            dataKey="revenue"
            stroke="#CA8A04"
            strokeWidth={2}
            fill="url(#revenueGrad)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
