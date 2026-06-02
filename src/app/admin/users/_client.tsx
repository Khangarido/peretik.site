'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { X, TrendingUp, ShoppingBag, Clock } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { formatPrice, formatDate, cn } from '@/lib/utils'
import type { User } from '@/types'
import { createClient } from '@/lib/supabase/client'

type EnrichedUser = User & {
  order_count: number
  total_spent: number
  last_order_at: string | null
}

interface Props {
  users: EnrichedUser[]
  defaultSearch?: string
}

function UserDetailPanel({
  user,
  onClose,
}: {
  user: EnrichedUser
  onClose: () => void
}) {
  const [orders, setOrders] = useState<{ id: string; total: number; status: string; created_at: string }[]>([])
  const [viewData, setViewData] = useState<{ name: string; views: number }[]>([])
  const [totalDuration, setTotalDuration] = useState(0)
  const [loading, setLoading] = useState(false)
  const [loaded, setLoaded] = useState(false)

  const loadDetails = async () => {
    if (loaded) return
    setLoading(true)
    const supabase = createClient()

    const [ordersRes, viewsRes] = await Promise.all([
      supabase.from('orders').select('id, total, status, created_at').eq('user_id', user.id).order('created_at', { ascending: false }).limit(5),
      supabase.from('product_views').select('duration_seconds, product:products(name_mn)').eq('user_id', user.id),
    ])

    setOrders(ordersRes.data ?? [])

    // Aggregate top viewed products
    const map = new Map<string, number>()
    let dur = 0
    for (const row of viewsRes.data ?? []) {
      const productRaw = row.product as unknown
      const productObj = Array.isArray(productRaw) ? productRaw[0] : productRaw
      const name = (productObj as { name_mn?: string } | null)?.name_mn ?? 'Тодорхойгүй'
      map.set(name, (map.get(name) ?? 0) + 1)
      dur += row.duration_seconds ?? 0
    }
    setViewData(Array.from(map.entries()).sort((a, b) => b[1] - a[1]).slice(0, 3).map(([name, views]) => ({ name, views })))
    setTotalDuration(dur)
    setLoaded(true)
    setLoading(false)
  }

  // Load on mount
  useState(() => { loadDetails() })

  const avgOrder = user.order_count > 0 ? user.total_spent / user.order_count : 0

  function formatDur(s: number) {
    if (s < 60) return `${s}с`
    const m = Math.floor(s / 60)
    return `${m}м ${s % 60}с`
  }

  return (
    <div className="w-72 flex-shrink-0 bg-[#0D0D0D] rounded border border-white/[0.06] overflow-y-auto max-h-[80vh] sticky top-6">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.06]">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-[#111] border border-white/10 overflow-hidden flex items-center justify-center font-heading text-base text-zinc-500">
            {user.avatar_url ? (
              <Image src={user.avatar_url} alt="" width={36} height={36} className="object-cover" />
            ) : (
              (user.full_name ?? user.email)[0]?.toUpperCase()
            )}
          </div>
          <div>
            <p className="text-sm text-white font-medium">{user.full_name ?? '—'}</p>
            <p className="text-[10px] text-zinc-600 truncate max-w-[140px]">{user.email}</p>
          </div>
        </div>
        <button onClick={onClose} className="text-zinc-600 hover:text-white transition-colors">
          <X size={15} />
        </button>
      </div>

      <div className="p-4 space-y-5">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-2">
          {[
            { label: 'Захиалга', value: user.order_count, icon: ShoppingBag },
            { label: 'Зарцуулсан', value: formatPrice(user.total_spent), icon: TrendingUp },
            { label: 'Дундаж', value: formatPrice(Math.round(avgOrder)), icon: ShoppingBag },
          ].map((s) => (
            <div key={s.label} className="bg-black/40 rounded p-2.5 text-center">
              <p className="text-xs font-bold text-white truncate">{s.value}</p>
              <p className="text-[9px] text-zinc-600 mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Top viewed products */}
        {viewData.length > 0 && (
          <div>
            <p className="text-[10px] text-zinc-600 uppercase tracking-widest mb-2">Хамгийн их үзсэн</p>
            {viewData.map((v) => (
              <div key={v.name} className="flex justify-between text-xs py-1.5 border-b border-white/[0.04]">
                <span className="text-zinc-400 truncate max-w-[160px]">{v.name}</span>
                <span className="text-[#CA8A04] ml-2">{v.views}×</span>
              </div>
            ))}
          </div>
        )}

        {/* Total view duration */}
        <div className="flex items-center gap-2 text-sm">
          <Clock size={13} className="text-zinc-600" />
          <span className="text-zinc-500">Нийт зарцуулсан хугацаа:</span>
          <span className="text-white font-medium">{formatDur(totalDuration)}</span>
        </div>

        {/* Recent orders */}
        {orders.length > 0 && (
          <div>
            <p className="text-[10px] text-zinc-600 uppercase tracking-widest mb-2">Сүүлийн захиалгууд</p>
            {orders.map((o) => (
              <div key={o.id} className="flex justify-between items-center text-xs py-2 border-b border-white/[0.04]">
                <span className="font-mono text-zinc-500">#{o.id.slice(0, 8).toUpperCase()}</span>
                <span className="text-[#CA8A04]">{formatPrice(o.total)}</span>
                <Badge className="text-[9px] capitalize">{o.status}</Badge>
              </div>
            ))}
          </div>
        )}

        {loading && <p className="text-center text-zinc-600 text-xs py-4">Уншиж байна...</p>}
      </div>
    </div>
  )
}

export function AdminUsersClient({ users, defaultSearch }: Props) {
  const router = useRouter()
  const [, startTransition] = useTransition()
  const [search, setSearch] = useState(defaultSearch ?? '')
  const [selected, setSelected] = useState<EnrichedUser | null>(null)

  const doSearch = (e: React.FormEvent) => {
    e.preventDefault()
    startTransition(() => {
      router.push(search ? `/admin/users?q=${encodeURIComponent(search)}` : '/admin/users')
    })
  }

  const ROLE_STYLE = {
    admin: 'bg-[#CA8A04]/10 text-[#CA8A04] border-[#CA8A04]/20',
    customer: 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20',
  }

  return (
    <div className="space-y-5">
      <form onSubmit={doSearch} className="flex gap-3 max-w-sm">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Нэр, и-мэйл хайх..."
          className="flex-1 bg-[#0D0D0D] border border-white/10 rounded px-3 py-2 text-sm text-white placeholder-zinc-700 focus:border-[#CA8A04]/40 focus:outline-none"
        />
        <Button type="submit" variant="outline" size="sm" className="border-white/10 text-zinc-300 hover:text-white">
          Хайх
        </Button>
      </form>

      <div className="flex gap-6">
        <div className={cn('bg-[#0D0D0D] rounded border border-white/[0.06] overflow-x-auto transition-all', selected ? 'flex-1 min-w-0' : 'w-full')}>
          <table className="w-full text-sm min-w-[700px]">
            <thead>
              <tr className="border-b border-white/[0.06]">
                {['Хэрэглэгч', 'Эрх', 'Захиалга', 'Зарцуулсан', 'Сүүлийн захиалга', 'Нэгдсэн'].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-[10px] text-zinc-600 uppercase tracking-widest font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr
                  key={u.id}
                  onClick={() => setSelected(selected?.id === u.id ? null : u)}
                  className={cn(
                    'border-b border-white/[0.03] cursor-pointer transition-colors',
                    selected?.id === u.id ? 'bg-[#CA8A04]/5' : 'hover:bg-white/[0.02]'
                  )}
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-[#111] border border-white/10 overflow-hidden flex items-center justify-center font-heading text-sm text-zinc-600 flex-shrink-0">
                        {u.avatar_url ? (
                          <Image src={u.avatar_url} alt="" width={32} height={32} className="object-cover" />
                        ) : (
                          (u.full_name ?? u.email)[0]?.toUpperCase()
                        )}
                      </div>
                      <div>
                        <p className="text-white text-xs font-medium">{u.full_name ?? '—'}</p>
                        <p className="text-zinc-600 text-[10px] truncate max-w-[160px]">{u.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <Badge className={cn('text-[10px] border', ROLE_STYLE[u.role ?? 'customer'] ?? '')}>
                      {u.role}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-zinc-400 text-center">{u.order_count}</td>
                  <td className="px-4 py-3 text-[#CA8A04] font-semibold">{formatPrice(u.total_spent)}</td>
                  <td className="px-4 py-3 text-xs text-zinc-600">
                    {u.last_order_at ? formatDate(u.last_order_at, 'mn') : '—'}
                  </td>
                  <td className="px-4 py-3 text-xs text-zinc-600">{formatDate(u.created_at ?? '', 'mn')}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {users.length === 0 && <div className="py-16 text-center text-zinc-600">Хэрэглэгч олдсонгүй</div>}
        </div>

        {selected && <UserDetailPanel user={selected} onClose={() => setSelected(null)} />}
      </div>
    </div>
  )
}
