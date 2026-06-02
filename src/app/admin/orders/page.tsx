import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { formatPrice, formatDate, getOrderStatusBg } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import type { Order, OrderStatus } from '@/types'
import { AdminOrdersClient } from './_client'

export const metadata = { title: 'Admin — Захиалгууд' }

const STATUSES: OrderStatus[] = ['pending', 'paid', 'processing', 'shipped', 'delivered', 'cancelled']
const STATUS_LABELS: Record<OrderStatus, string> = {
  pending: 'Хүлээгдэж буй',
  paid: 'Төлсөн',
  processing: 'Боловсруулж байна',
  shipped: 'Илгээгдсэн',
  delivered: 'Хүргэгдсэн',
  cancelled: 'Цуцлагдсан',
}

interface Props {
  searchParams: Promise<{ status?: string }>
}

export default async function AdminOrdersPage({ searchParams }: Props) {
  const { status } = await searchParams
  const supabase = await createClient()

  let query = supabase
    .from('orders')
    .select('*, user:users(email, full_name), items:order_items(id, product_name, quantity, price)')
    .order('created_at', { ascending: false })
    .limit(100)

  if (status && STATUSES.includes(status as OrderStatus)) {
    query = query.eq('status', status)
  }

  const { data: orders } = await query

  return (
    <div className="space-y-6">
      <div>
        <p className="text-[10px] text-zinc-600 tracking-[0.4em] uppercase mb-1">Admin</p>
        <h1 className="font-heading text-3xl font-bold text-white">Захиалгууд</h1>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1 border-b border-white/[0.06] flex-wrap">
        <Link
          href="/admin/orders"
          className={`px-4 py-2.5 text-xs font-medium border-b-2 -mb-px transition-colors ${!status ? 'border-[#CA8A04] text-white' : 'border-transparent text-zinc-500 hover:text-zinc-300'}`}
        >
          Бүгд
        </Link>
        {STATUSES.map((s) => (
          <Link
            key={s}
            href={`/admin/orders?status=${s}`}
            className={`px-4 py-2.5 text-xs font-medium border-b-2 -mb-px transition-colors ${status === s ? 'border-[#CA8A04] text-white' : 'border-transparent text-zinc-500 hover:text-zinc-300'}`}
          >
            {STATUS_LABELS[s]}
          </Link>
        ))}
      </div>

      <AdminOrdersClient orders={(orders ?? []) as Order[]} statusLabels={STATUS_LABELS} />
    </div>
  )
}
