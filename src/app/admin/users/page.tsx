import { createClient } from '@/lib/supabase/server'
import { AdminUsersClient } from './_client'

export const metadata = { title: 'Admin — Хэрэглэгчид' }

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>
}) {
  const { q } = await searchParams
  const supabase = await createClient()

  let query = supabase
    .from('users')
    .select('*')
    .order('created_at', { ascending: false })

  if (q) {
    query = query.or(`email.ilike.%${q}%,full_name.ilike.%${q}%`)
  }

  const { data: users } = await query

  // Fetch order totals per user
  const { data: orderRows } = await supabase
    .from('orders')
    .select('user_id, total, created_at')
    .in('status', ['paid', 'delivered'])

  const orderMap = new Map<string, { count: number; spent: number; lastDate: string }>()
  for (const row of orderRows ?? []) {
    const existing = orderMap.get(row.user_id)
    if (existing) {
      existing.count++
      existing.spent += row.total ?? 0
      if (row.created_at > existing.lastDate) existing.lastDate = row.created_at
    } else {
      orderMap.set(row.user_id, { count: 1, spent: row.total ?? 0, lastDate: row.created_at })
    }
  }

  const enrichedUsers = (users ?? []).map((u) => ({
    ...u,
    order_count: orderMap.get(u.id)?.count ?? 0,
    total_spent: orderMap.get(u.id)?.spent ?? 0,
    last_order_at: orderMap.get(u.id)?.lastDate ?? null,
  }))

  return (
    <div className="space-y-6">
      <div>
        <p className="text-[10px] text-zinc-600 tracking-[0.4em] uppercase mb-1">Admin</p>
        <h1 className="font-heading text-3xl font-bold text-white">Хэрэглэгчид</h1>
      </div>
      <AdminUsersClient users={enrichedUsers} defaultSearch={q ?? ''} />
    </div>
  )
}
