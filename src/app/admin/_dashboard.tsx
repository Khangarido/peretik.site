'use client'

import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts'
import type { DailyRevenueRow, OrderStatusBreakdownRow } from '@/lib/supabase/queries'
import { formatPrice } from '@/lib/utils'

const GOLD = '#CA8A04'
const DARK_BG = '#111'
const GRID = 'rgba(255,255,255,0.05)'

const STATUS_COLORS: Record<string, string> = {
  pending: '#A1A1AA',
  paid: '#3B82F6',
  processing: '#F59E0B',
  shipped: '#8B5CF6',
  delivered: '#10B981',
  cancelled: '#EF4444',
}

interface Props {
  dailyRevenue: DailyRevenueRow[]
  topProducts: { name: string; qty: number }[]
  statusBreakdown: OrderStatusBreakdownRow[]
}

function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: {value: number}[]; label?: string }) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-[#1A1A1A] border border-white/10 rounded px-3 py-2 text-xs">
      <p className="text-zinc-400 mb-1">{label}</p>
      <p className="text-[#CA8A04] font-bold">{formatPrice(payload[0].value)}</p>
    </div>
  )
}

function BarTooltip({ active, payload, label }: { active?: boolean; payload?: {value: number}[]; label?: string }) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-[#1A1A1A] border border-white/10 rounded px-3 py-2 text-xs">
      <p className="text-zinc-400 mb-1 truncate max-w-[150px]">{label}</p>
      <p className="text-white font-bold">{payload[0].value} ширхэг</p>
    </div>
  )
}

export function AdminDashboardClient({ dailyRevenue, topProducts, statusBreakdown }: Props) {
  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
      {/* Line chart — daily revenue */}
      <div className="xl:col-span-2 bg-[#0D0D0D] rounded border border-white/[0.06] p-5">
        <h3 className="font-heading text-base text-white mb-5">Өдөр тутмын орлого (30 хоног)</h3>
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={dailyRevenue} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={GRID} />
            <XAxis
              dataKey="date"
              tick={{ fill: '#52525B', fontSize: 10 }}
              tickFormatter={(d) => d.slice(5)}
              tickLine={false}
              axisLine={false}
              interval={4}
            />
            <YAxis
              tick={{ fill: '#52525B', fontSize: 10 }}
              tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
              tickLine={false}
              axisLine={false}
              width={36}
            />
            <Tooltip content={<CustomTooltip />} />
            <Line
              type="monotone"
              dataKey="revenue"
              stroke={GOLD}
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4, fill: GOLD }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Pie chart — order status */}
      <div className="bg-[#0D0D0D] rounded border border-white/[0.06] p-5">
        <h3 className="font-heading text-base text-white mb-5">Захиалгын төлөв</h3>
        <ResponsiveContainer width="100%" height={180}>
          <PieChart>
            <Pie
              data={statusBreakdown}
              dataKey="count"
              nameKey="status"
              cx="50%"
              cy="50%"
              innerRadius={50}
              outerRadius={80}
              paddingAngle={3}
            >
              {statusBreakdown.map((entry) => (
                <Cell key={entry.status} fill={STATUS_COLORS[entry.status] ?? '#71717A'} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value, name) => [value, name]}
              contentStyle={{ background: '#1A1A1A', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 6, fontSize: 11 }}
              labelStyle={{ color: '#A1A1AA' }}
            />
          </PieChart>
        </ResponsiveContainer>
        <div className="grid grid-cols-2 gap-1 mt-2">
          {statusBreakdown.map((s) => (
            <div key={s.status} className="flex items-center gap-1.5 text-[10px] text-zinc-500">
              <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: STATUS_COLORS[s.status] ?? '#71717A' }} />
              <span className="capitalize truncate">{s.status}</span>
              <span className="text-zinc-400 ml-auto">{s.count}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Bar chart — top products */}
      {topProducts.length > 0 && (
        <div className="xl:col-span-3 bg-[#0D0D0D] rounded border border-white/[0.06] p-5">
          <h3 className="font-heading text-base text-white mb-5">Топ 10 бүтээгдэхүүн (борлогдсон тоо)</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={topProducts} layout="vertical" margin={{ top: 0, right: 16, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={GRID} horizontal={false} />
              <XAxis type="number" tick={{ fill: '#52525B', fontSize: 10 }} tickLine={false} axisLine={false} />
              <YAxis
                type="category"
                dataKey="name"
                tick={{ fill: '#71717A', fontSize: 10 }}
                tickLine={false}
                axisLine={false}
                width={120}
                tickFormatter={(v) => v.length > 16 ? v.slice(0, 15) + '…' : v}
              />
              <Tooltip content={<BarTooltip />} />
              <Bar dataKey="qty" fill={GOLD} radius={[0, 3, 3, 0]} maxBarSize={18} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  )
}
