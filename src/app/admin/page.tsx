import { createClient } from '@/lib/supabase/server'
import { getDailyRevenue, getOrderStatusBreakdown } from '@/lib/supabase/queries'
import { formatPrice } from '@/lib/utils'
import { DollarSign, ShoppingBag, Users, Package } from 'lucide-react'
import { AdminDashboardClient } from './_dashboard'
import Link from 'next/link'
import { formatDate } from '@/lib/utils'

export const metadata = { title: 'Admin Dashboard — Peretik' }
export const revalidate = 120

export default async function AdminDashboard() {
  const supabase = await createClient()

  const now = new Date()
  const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
  const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString()
  const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0).toISOString()

  const [
    revenueAll, revenueLastMonth,
    ordersAll, ordersLastMonth,
    usersAll, usersLastMonth,
    productsRes,
    recentOrders,
    topProductsRes,
  ] = await Promise.all([
    supabase.from('orders').select('total').in('status', ['paid', 'delivered']),
    supabase.from('orders').select('total').in('status', ['paid', 'delivered']).lt('created_at', thisMonthStart).gte('created_at', lastMonthStart),
    supabase.from('orders').select('id', { count: 'exact', head: true }),
    supabase.from('orders').select('id', { count: 'exact', head: true }).lt('created_at', thisMonthStart).gte('created_at', lastMonthStart),
    supabase.from('users').select('id', { count: 'exact', head: true }).eq('role', 'customer'),
    supabase.from('users').select('id', { count: 'exact', head: true }).eq('role', 'customer').lt('created_at', thisMonthStart).gte('created_at', lastMonthStart),
    supabase.from('products').select('id', { count: 'exact', head: true }).eq('status', 'active'),
    supabase.from('orders').select('*, user:users(email, full_name)').order('created_at', { ascending: false }).limit(10),
    supabase.from('order_items').select('product_name, quantity'),
  ])

  const totalRevenue = (revenueAll.data ?? []).reduce((s, o) => s + (o.total ?? 0), 0)
  const lastMonthRevenue = (revenueLastMonth.data ?? []).reduce((s, o) => s + (o.total ?? 0), 0)

  const totalOrders = ordersAll.count ?? 0
  const totalUsers = usersAll.count ?? 0
  const totalProducts = productsRes.count ?? 0

  const revenuePct = lastMonthRevenue > 0 ? Math.round(((totalRevenue - lastMonthRevenue) / lastMonthRevenue) * 100) : null

  // Daily revenue (30 days)
  const dailyRevenue = await getDailyRevenue(supabase, 30)

  // Order status breakdown
  const statusBreakdown = await getOrderStatusBreakdown(supabase)

  // Top products by sold quantity
  const productSales = new Map<string, number>()
  for (const row of topProductsRes.data ?? []) {
    productSales.set(row.product_name, (productSales.get(row.product_name) ?? 0) + row.quantity)
  }
  const topProducts = Array.from(productSales.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([name, qty]) => ({ name, qty }))

  const stats = [
    { title: 'Нийт орлого', value: formatPrice(totalRevenue), icon: DollarSign, pct: revenuePct, accent: true },
    { title: 'Нийт захиалга', value: totalOrders.toLocaleString(), icon: ShoppingBag },
    { title: 'Нийт хэрэглэгч', value: totalUsers.toLocaleString(), icon: Users },
    { title: 'Нийт бүтээгдэхүүн', value: totalProducts.toLocaleString(), icon: Package },
  ]

  return (
    <div className="space-y-8">
      <div>
        <p className="text-[10px] text-zinc-600 tracking-[0.4em] uppercase mb-1">Admin</p>
        <h1 className="font-heading text-3xl font-bold text-white">Dashboard</h1>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div key={stat.title} className="bg-[#0D0D0D] rounded border border-white/[0.06] p-5">
            <div className="flex items-start justify-between mb-4">
              <div className={`p-2 rounded ${stat.accent ? 'bg-[#CA8A04]/10' : 'bg-white/[0.04]'}`}>
                <stat.icon size={18} className={stat.accent ? 'text-[#CA8A04]' : 'text-zinc-500'} />
              </div>
              {stat.pct !== null && stat.pct !== undefined && (
                <span className={`text-xs font-medium ${stat.pct >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {stat.pct >= 0 ? '+' : ''}{stat.pct}%
                </span>
              )}
            </div>
            <p className="font-heading text-2xl font-bold text-white">{stat.value}</p>
            <p className="text-xs text-zinc-600 mt-1 tracking-wide">{stat.title}</p>
          </div>
        ))}
      </div>

      {/* Charts */}
      <AdminDashboardClient
        dailyRevenue={dailyRevenue}
        topProducts={topProducts}
        statusBreakdown={statusBreakdown}
      />

      {/* Recent orders */}
      <div className="bg-[#0D0D0D] rounded border border-white/[0.06] overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.06]">
          <h2 className="font-heading text-base text-white font-semibold">Сүүлийн захиалгууд</h2>
          <Link href="/admin/orders" className="text-xs text-zinc-500 hover:text-white transition-colors">
            Бүгдийг харах →
          </Link>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/[0.04]">
              {['ID', 'Хэрэглэгч', 'Дүн', 'Төлөв', 'Огноо'].map((h) => (
                <th key={h} className="px-4 py-3 text-left text-[10px] text-zinc-600 uppercase tracking-widest font-medium">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {(recentOrders.data ?? []).map((order) => {
              const userObj = order.user as { email: string; full_name: string | null } | null
              return (
                <tr key={order.id} className="border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors">
                  <td className="px-4 py-3 font-mono text-xs text-zinc-500">#{order.id.slice(0, 8).toUpperCase()}</td>
                  <td className="px-4 py-3 text-zinc-300 truncate max-w-[150px]">{userObj?.email ?? '—'}</td>
                  <td className="px-4 py-3 text-[#CA8A04] font-semibold">{formatPrice(order.total)}</td>
                  <td className="px-4 py-3">
                    <span className="text-xs text-zinc-500 capitalize">{order.status}</span>
                  </td>
                  <td className="px-4 py-3 text-xs text-zinc-600">{formatDate(order.created_at, 'mn')}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
