'use client'

import { useState } from 'react'
import { X, Save, Package } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { formatPrice, formatDate, getOrderStatusBg, cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import type { Order, OrderStatus } from '@/types'

const STATUSES: OrderStatus[] = ['pending', 'paid', 'processing', 'shipped', 'delivered', 'cancelled']

interface Props {
  orders: Order[]
  statusLabels: Record<OrderStatus, string>
}

export function AdminOrdersClient({ orders, statusLabels }: Props) {
  const router = useRouter()
  const [selected, setSelected] = useState<Order | null>(null)
  const [newStatus, setNewStatus] = useState<OrderStatus>('pending')
  const [trackingCode, setTrackingCode] = useState('')
  const [saving, setSaving] = useState(false)

  const openDetail = (order: Order) => {
    setSelected(order)
    setNewStatus(order.status)
    setTrackingCode(order.tracking_code ?? '')
  }

  const saveChanges = async () => {
    if (!selected) return
    setSaving(true)
    const supabase = createClient()

    const update: Record<string, unknown> = { status: newStatus }
    if (newStatus === 'shipped' && trackingCode) {
      update.tracking_code = trackingCode
    }

    const { error } = await supabase
      .from('orders')
      .update(update)
      .eq('id', selected.id)

    if (error) {
      toast.error('Хадгалах амжилтгүй')
    } else {
      toast.success('Хадгалагдлаа')

      // Send shipping email if status changed to shipped
      if (newStatus === 'shipped' && selected.status !== 'shipped') {
        fetch('/api/email/shipping-update', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ order_id: selected.id, lang: 'mn' }),
        }).catch(() => {})
      }

      router.refresh()
      setSelected(null)
    }
    setSaving(false)
  }

  return (
    <div className="flex gap-6">
      {/* Table */}
      <div className={cn('bg-[#0D0D0D] rounded border border-white/[0.06] overflow-x-auto transition-all', selected ? 'flex-1 min-w-0' : 'w-full')}>
        <table className="w-full text-sm min-w-[600px]">
          <thead>
            <tr className="border-b border-white/[0.06]">
              {['ID', 'Хэрэглэгч', 'Барааны тоо', 'Дүн', 'Төлөв', 'Огноо'].map((h) => (
                <th key={h} className="px-4 py-3 text-left text-[10px] text-zinc-600 uppercase tracking-widest font-medium">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => {
              const userObj = order.user as { email: string; full_name: string | null } | null
              const isSelected = selected?.id === order.id
              return (
                <tr
                  key={order.id}
                  onClick={() => openDetail(order)}
                  className={cn(
                    'border-b border-white/[0.03] cursor-pointer transition-colors',
                    isSelected ? 'bg-[#CA8A04]/5' : 'hover:bg-white/[0.02]'
                  )}
                >
                  <td className="px-4 py-3 font-mono text-xs text-zinc-500">#{order.id.slice(0, 8).toUpperCase()}</td>
                  <td className="px-4 py-3">
                    <p className="text-zinc-300 text-xs truncate max-w-[140px]">{userObj?.email ?? '—'}</p>
                    {userObj?.full_name && <p className="text-zinc-600 text-[10px] truncate">{userObj.full_name}</p>}
                  </td>
                  <td className="px-4 py-3 text-zinc-400 text-center">{order.items?.length ?? 0}</td>
                  <td className="px-4 py-3 text-[#CA8A04] font-semibold">{formatPrice(order.total)}</td>
                  <td className="px-4 py-3">
                    <Badge className={cn('text-[10px] border', getOrderStatusBg(order.status))}>
                      {statusLabels[order.status]}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-xs text-zinc-600">{formatDate(order.created_at, 'mn')}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
        {orders.length === 0 && (
          <div className="py-16 text-center text-zinc-600">Захиалга байхгүй байна</div>
        )}
      </div>

      {/* Detail panel */}
      {selected && (
        <div className="w-80 flex-shrink-0 bg-[#0D0D0D] rounded border border-white/[0.06] p-5 space-y-5 h-fit sticky top-6">
          <div className="flex items-center justify-between">
            <h3 className="font-heading text-base text-white">#{selected.id.slice(0, 8).toUpperCase()}</h3>
            <button onClick={() => setSelected(null)} className="text-zinc-600 hover:text-white transition-colors">
              <X size={16} />
            </button>
          </div>

          {/* Items */}
          <div className="space-y-2">
            <p className="text-[10px] text-zinc-600 uppercase tracking-widest">Бараанууд</p>
            {selected.items?.map((item) => (
              <div key={item.id} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5">
                  <Package size={11} className="text-zinc-600" />
                  <span className="text-zinc-300 truncate max-w-[140px]">{item.product_name}</span>
                  <span className="text-zinc-600">×{item.quantity}</span>
                </div>
                <span className="text-zinc-400">{formatPrice(item.price * item.quantity)}</span>
              </div>
            ))}
            <div className="flex justify-between text-sm font-semibold border-t border-white/[0.05] pt-2 mt-1">
              <span className="text-zinc-400">Нийт</span>
              <span className="text-[#CA8A04]">{formatPrice(selected.total)}</span>
            </div>
          </div>

          {/* Status update */}
          <div className="space-y-2">
            <p className="text-[10px] text-zinc-600 uppercase tracking-widest">Төлөв шинэчлэх</p>
            <select
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value as OrderStatus)}
              className="w-full bg-black border border-white/10 rounded px-3 py-2 text-sm text-white focus:border-[#CA8A04]/40 focus:outline-none"
            >
              {STATUSES.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          {/* Tracking code (show when shipped) */}
          {newStatus === 'shipped' && (
            <div>
              <p className="text-[10px] text-zinc-600 uppercase tracking-widest mb-2">Хяналтын код</p>
              <Input
                value={trackingCode}
                onChange={(e) => setTrackingCode(e.target.value)}
                placeholder="Tracking code"
                className="bg-black border-white/10 text-white text-sm focus:border-[#CA8A04]/40"
              />
            </div>
          )}

          <Button
            onClick={saveChanges}
            disabled={saving}
            className="w-full bg-[#CA8A04] hover:bg-[#D97706] text-black font-bold"
          >
            <Save size={13} className="mr-2" />
            {saving ? '...' : 'Хадгалах'}
          </Button>
        </div>
      )}
    </div>
  )
}
