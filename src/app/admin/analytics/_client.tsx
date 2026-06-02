'use client'

import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts'
import type { ProductAnalyticsRow } from '@/lib/supabase/queries'

const GOLD = '#CA8A04'
const WHITE = '#E4E4E7'
const GRID = 'rgba(255,255,255,0.05)'

const DEVICE_COLORS = ['#CA8A04', '#6366F1', '#10B981']

function formatDuration(s: number) {
  if (s < 60) return `${s}с`
  return `${Math.floor(s / 60)}м ${s % 60}с`
}

function DurationTooltip({ active, payload, label }: { active?: boolean; payload?: { value: number }[]; label?: string }) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-[#1A1A1A] border border-white/10 rounded px-3 py-2 text-xs">
      <p className="text-zinc-400 mb-1 truncate max-w-[160px]">{label}</p>
      <p className="text-[#CA8A04] font-bold">{formatDuration(payload[0].value)}</p>
    </div>
  )
}

function ViewTooltip({ active, payload, label }: { active?: boolean; payload?: { value: number; name: string }[]; label?: string }) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-[#1A1A1A] border border-white/10 rounded px-3 py-2 text-xs space-y-1">
      <p className="text-zinc-400">{label}</p>
      {payload.map((p) => (
        <p key={p.name} className="font-medium" style={{ color: p.name === 'views' ? GOLD : WHITE }}>
          {p.name}: {p.value}
        </p>
      ))}
    </div>
  )
}

interface Props {
  productAnalytics: ProductAnalyticsRow[]
  wishlistDemand: { product_id: string; product_name: string; wishlist_count: number; view_count: number; ratio: string }[]
  deviceBreakdown: { device: string; count: number; pct: string }[]
  statCards: { label: string; value: string }[]
  dailyActivity: { date: string; views: number; cart: number }[]
}

export function AnalyticsClient({ productAnalytics, wishlistDemand, deviceBreakdown, statCards, dailyActivity }: Props) {
  return (
    <div className="space-y-8">
      {/* ── ROW 1: Product Engagement ─────────────────────────────────────── */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* View count bar chart */}
        <div className="bg-[#0D0D0D] rounded border border-white/[0.06] p-5">
          <h3 className="font-heading text-base text-white mb-5">Хамгийн их үзсэн бүтээгдэхүүн</h3>
          {productAnalytics.length === 0 ? (
            <p className="text-zinc-600 text-sm py-8 text-center">Өгөгдөл байхгүй</p>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={productAnalytics} layout="vertical" margin={{ top: 0, right: 16, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={GRID} horizontal={false} />
                <XAxis type="number" tick={{ fill: '#52525B', fontSize: 10 }} tickLine={false} axisLine={false} />
                <YAxis
                  type="category"
                  dataKey="product_name"
                  tick={{ fill: '#71717A', fontSize: 10 }}
                  tickLine={false}
                  axisLine={false}
                  width={110}
                  tickFormatter={(v) => v.length > 14 ? v.slice(0, 13) + '…' : v}
                />
                <Tooltip
                  contentStyle={{ background: '#1A1A1A', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 6, fontSize: 11 }}
                />
                <Bar dataKey="view_count" fill={GOLD} radius={[0, 3, 3, 0]} maxBarSize={16} name="Үзсэн" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Avg duration bar chart */}
        <div className="bg-[#0D0D0D] rounded border border-white/[0.06] p-5">
          <h3 className="font-heading text-base text-white mb-5">Дундаж үзсэн хугацаа (секунд)</h3>
          {productAnalytics.length === 0 ? (
            <p className="text-zinc-600 text-sm py-8 text-center">Өгөгдөл байхгүй</p>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={productAnalytics} layout="vertical" margin={{ top: 0, right: 16, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={GRID} horizontal={false} />
                <XAxis type="number" tick={{ fill: '#52525B', fontSize: 10 }} tickLine={false} axisLine={false} />
                <YAxis
                  type="category"
                  dataKey="product_name"
                  tick={{ fill: '#71717A', fontSize: 10 }}
                  tickLine={false}
                  axisLine={false}
                  width={110}
                  tickFormatter={(v) => v.length > 14 ? v.slice(0, 13) + '…' : v}
                />
                <Tooltip content={<DurationTooltip />} />
                <Bar dataKey="avg_duration" fill="#6366F1" radius={[0, 3, 3, 0]} maxBarSize={16} name="Хугацаа" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* ── ROW 2: Demand Signals ─────────────────────────────────────────── */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Wishlist ranked list */}
        <div className="xl:col-span-2 bg-[#0D0D0D] rounded border border-white/[0.06] p-5">
          <h3 className="font-heading text-base text-white mb-5">Wishlist-ээр хамгийн их нэмсэн</h3>
          {wishlistDemand.length === 0 ? (
            <p className="text-zinc-600 text-sm py-8 text-center">Өгөгдөл байхгүй</p>
          ) : (
            <div className="space-y-2">
              {wishlistDemand.map((item, idx) => (
                <div key={item.product_id} className="flex items-center gap-4 py-2.5 border-b border-white/[0.04] last:border-0">
                  <span className="text-[#CA8A04] font-heading text-lg font-bold w-6 text-center flex-shrink-0">
                    {idx + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white truncate">{item.product_name}</p>
                    <p className="text-xs text-zinc-600">{item.view_count} үзсэн</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-sm font-bold text-white">{item.wishlist_count}</p>
                    <p className="text-[10px] text-zinc-600">{item.ratio}% conv</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Device pie chart */}
        <div className="bg-[#0D0D0D] rounded border border-white/[0.06] p-5">
          <h3 className="font-heading text-base text-white mb-5">Төхөөрөмжийн хуваарилалт</h3>
          {deviceBreakdown.length === 0 ? (
            <p className="text-zinc-600 text-sm py-8 text-center">Өгөгдөл байхгүй</p>
          ) : (
            <>
              <ResponsiveContainer width="100%" height={160}>
                <PieChart>
                  <Pie data={deviceBreakdown} dataKey="count" nameKey="device" cx="50%" cy="50%" outerRadius={70} paddingAngle={3}>
                    {deviceBreakdown.map((entry, i) => (
                      <Cell key={entry.device} fill={DEVICE_COLORS[i % DEVICE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(v, n) => [`${v} (${deviceBreakdown.find((d) => d.device === n)?.pct ?? 0}%)`, n]}
                    contentStyle={{ background: '#1A1A1A', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 6, fontSize: 11 }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-1.5 mt-2">
                {deviceBreakdown.map((d, i) => (
                  <div key={d.device} className="flex items-center justify-between text-xs text-zinc-500">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full" style={{ background: DEVICE_COLORS[i % DEVICE_COLORS.length] }} />
                      <span className="capitalize">{d.device}</span>
                    </div>
                    <span className="text-zinc-400">{d.pct}%</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* ── ROW 3: User Behavior ──────────────────────────────────────────── */}
      {/* Stats cards */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {statCards.map((card) => (
          <div key={card.label} className="bg-[#0D0D0D] rounded border border-white/[0.06] p-5">
            <p className="font-heading text-2xl font-bold text-white">{card.value}</p>
            <p className="text-xs text-zinc-600 mt-1 tracking-wide">{card.label}</p>
          </div>
        ))}
      </div>

      {/* Daily activity line chart */}
      <div className="bg-[#0D0D0D] rounded border border-white/[0.06] p-5">
        <h3 className="font-heading text-base text-white mb-5">Өдөр тутмын хандалт (30 хоног)</h3>
        <ResponsiveContainer width="100%" height={240}>
          <LineChart data={dailyActivity} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={GRID} />
            <XAxis
              dataKey="date"
              tick={{ fill: '#52525B', fontSize: 10 }}
              tickFormatter={(d) => d.slice(5)}
              tickLine={false}
              axisLine={false}
              interval={4}
            />
            <YAxis tick={{ fill: '#52525B', fontSize: 10 }} tickLine={false} axisLine={false} width={28} />
            <Tooltip content={<ViewTooltip />} />
            <Legend wrapperStyle={{ fontSize: 11, color: '#71717A' }} />
            <Line type="monotone" dataKey="views" stroke={GOLD} strokeWidth={2} dot={false} activeDot={{ r: 4 }} name="views" />
            <Line type="monotone" dataKey="cart" stroke={WHITE} strokeWidth={1.5} dot={false} strokeDasharray="4 2" activeDot={{ r: 3 }} name="cart_add" />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
