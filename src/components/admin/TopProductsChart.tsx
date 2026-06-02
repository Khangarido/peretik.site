'use client'

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts'
import { useLangStore } from '@/lib/store/langStore'

interface Product {
  name: string
  total_sold: number
  revenue: number
}

interface Props {
  data: Product[]
}

function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: { value: number; name: string }[]; label?: string }) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-[#111] border border-white/[0.08] rounded px-3 py-2 text-xs space-y-1">
      <p className="text-zinc-300 font-medium">{label}</p>
      {payload.map((p) => (
        <p key={p.name} className="text-[#CA8A04]">
          {p.name === 'revenue' ? `${p.value.toLocaleString()}₮` : `${p.value} ширхэг`}
        </p>
      ))}
    </div>
  )
}

export function TopProductsChart({ data }: Props) {
  const { t } = useLangStore()

  return (
    <div className="p-5 bg-[#0D0D0D] rounded border border-white/[0.06]">
      <h3 className="text-sm font-semibold text-zinc-300 uppercase tracking-widest mb-5">
        {t.admin.top_products}
      </h3>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
          <XAxis
            dataKey="name"
            tick={{ fontSize: 9, fill: '#71717A' }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 10, fill: '#71717A' }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="total_sold" radius={[3, 3, 0, 0]}>
            {data.map((_, i) => (
              <Cell key={i} fill={i === 0 ? '#CA8A04' : `rgba(202,138,4,${0.4 - i * 0.06})`} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
