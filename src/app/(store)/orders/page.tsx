import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ShoppingBag } from 'lucide-react'
import { OrdersClient } from './_client'
import type { Order } from '@/types'

export const metadata = { title: 'Миний захиалгууд — Peretik' }

export default async function OrdersPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login?redirectTo=/orders')

  const { data: orders } = await supabase
    .from('orders')
    .select('*, items:order_items(*)')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  return (
    <div className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 py-12">
      <div className="mb-10">
        <p className="text-[10px] text-zinc-600 tracking-[0.4em] uppercase mb-1.5">Миний</p>
        <h1 className="font-heading text-4xl font-bold text-white">Захиалгууд</h1>
      </div>

      {(!orders || orders.length === 0) ? (
        <div className="flex flex-col items-center justify-center py-20 gap-5 text-center">
          <div className="w-16 h-16 rounded-full bg-[#0D0D0D] border border-white/[0.06] flex items-center justify-center">
            <ShoppingBag size={24} strokeWidth={1} className="text-zinc-600" />
          </div>
          <p className="font-heading text-2xl text-zinc-500">Захиалга байхгүй байна</p>
          <Link href="/shop" className="text-sm text-[#CA8A04] hover:underline">
            Дэлгүүрт очих →
          </Link>
        </div>
      ) : (
        <OrdersClient orders={orders as Order[]} />
      )}
    </div>
  )
}
