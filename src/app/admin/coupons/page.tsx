import { createClient } from '@/lib/supabase/server'
import { CouponsClient } from './_client'
import type { Coupon } from '@/types'

export const metadata = { title: 'Admin — Купонууд' }

export default async function AdminCouponsPage() {
  const supabase = await createClient()

  const { data: coupons } = await supabase
    .from('coupons')
    .select('*')
    .order('created_at', { ascending: false })

  // Fetch usage counts per coupon
  const { data: usageRows } = await supabase
    .from('orders')
    .select('coupon_id')
    .not('coupon_id', 'is', null)

  const usageMap = new Map<string, number>()
  for (const row of usageRows ?? []) {
    if (row.coupon_id) usageMap.set(row.coupon_id, (usageMap.get(row.coupon_id) ?? 0) + 1)
  }

  const couponsWithUsage = (coupons ?? []).map((c) => ({
    ...c,
    used_count: usageMap.get(c.id) ?? 0,
  }))

  return (
    <div className="space-y-6">
      <div>
        <p className="text-[10px] text-zinc-600 tracking-[0.4em] uppercase mb-1">Admin</p>
        <h1 className="font-heading text-3xl font-bold text-white">Купонууд</h1>
      </div>
      <CouponsClient coupons={couponsWithUsage as (Coupon & { used_count: number })[]} />
    </div>
  )
}
