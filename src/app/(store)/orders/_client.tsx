'use client'

import { useState } from 'react'
import { ChevronDown, ChevronUp, Package } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { formatPrice, formatDate, getOrderStatusBg } from '@/lib/utils'
import { useLangStore } from '@/lib/store/langStore'
import { cn } from '@/lib/utils'
import type { Order, OrderStatus } from '@/types'

const STATUS_LABELS: Record<OrderStatus, string> = {
  pending: 'Хүлээгдэж буй',
  paid: 'Төлсөн',
  processing: 'Боловсруулж байна',
  shipped: 'Илгээгдсэн',
  delivered: 'Хүргэгдсэн',
  cancelled: 'Цуцлагдсан',
}

interface Props {
  orders: Order[]
}

export function OrdersClient({ orders }: Props) {
  const { lang } = useLangStore()
  const [expanded, setExpanded] = useState<string | null>(null)

  return (
    <div className="space-y-3">
      {orders.map((order) => {
        const isOpen = expanded === order.id
        const itemCount = order.items?.length ?? 0

        return (
          <div
            key={order.id}
            className="bg-[#0D0D0D] rounded border border-white/[0.06] overflow-hidden transition-all"
          >
            {/* Summary row */}
            <button
              onClick={() => setExpanded(isOpen ? null : order.id)}
              className="w-full flex flex-wrap items-center gap-3 sm:gap-0 p-4 sm:p-5 text-left hover:bg-white/[0.02] transition-colors"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="text-xs font-mono text-zinc-500">
                    #{order.id.slice(0, 8).toUpperCase()}
                  </p>
                  <span className="text-zinc-700">·</span>
                  <p className="text-xs text-zinc-600">{formatDate(order.created_at, lang)}</p>
                </div>
                <p className="text-xs text-zinc-500 mt-0.5">
                  {itemCount} {itemCount === 1 ? 'бараа' : 'бараа'}
                </p>
              </div>

              <div className="flex items-center gap-3 ml-auto">
                <Badge className={cn('text-xs border', getOrderStatusBg(order.status))}>
                  {STATUS_LABELS[order.status]}
                </Badge>
                <span className="font-bold text-[#CA8A04]">{formatPrice(order.total)}</span>
                {isOpen ? <ChevronUp size={15} className="text-zinc-500" /> : <ChevronDown size={15} className="text-zinc-500" />}
              </div>
            </button>

            {/* Expanded detail */}
            {isOpen && (
              <div className="border-t border-white/[0.06] px-5 py-4 space-y-4">
                {/* Order items */}
                {order.items && order.items.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-[10px] text-zinc-600 uppercase tracking-widest">Бараанууд</p>
                    {order.items.map((item) => (
                      <div key={item.id} className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <Package size={13} className="text-zinc-600 flex-shrink-0" />
                          <span className="text-zinc-300">
                            {item.product_name || 'Бараа'}
                          </span>
                          {item.variant_info && (
                            <span className="text-xs text-zinc-600">({item.variant_info})</span>
                          )}
                          <span className="text-zinc-600">×{item.quantity}</span>
                        </div>
                        <span className="text-zinc-300">{formatPrice(item.price * item.quantity)}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Tracking */}
                {(order.tracking_code ?? order.tracking_number) && (
                  <div className="p-3 bg-[#111] rounded border border-white/[0.05]">
                    <p className="text-[10px] text-zinc-600 uppercase tracking-widest mb-1.5">Хяналтын код</p>
                    <p className="text-sm font-mono text-[#CA8A04] font-semibold">
                      {order.tracking_code ?? order.tracking_number}
                    </p>
                  </div>
                )}

                {/* Total breakdown */}
                <div className="flex justify-between text-sm border-t border-white/[0.05] pt-3">
                  <span className="text-zinc-500">Нийт дүн</span>
                  <span className="font-bold text-white">{formatPrice(order.total)}</span>
                </div>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
