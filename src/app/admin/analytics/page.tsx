import { createClient } from '@/lib/supabase/server'
import { getProductAnalytics, getWishlistDemand } from '@/lib/supabase/queries'
import { formatPrice } from '@/lib/utils'
import { AnalyticsClient } from './_client'

export const metadata = { title: 'Admin — Analytics' }
export const revalidate = 300

function formatDuration(seconds: number): string {
  if (seconds < 60) return `${seconds}с`
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}м ${s}с`
}

export default async function AdminAnalyticsPage() {
  const supabase = await createClient()

  // Raw views data
  const { data: rawViews } = await supabase
    .from('product_views')
    .select('session_id, duration_seconds, created_at, product_id, event_type')

  const views = rawViews ?? []

  // Product analytics (top 10 by views + avg duration)
  const productAnalytics = await getProductAnalytics(supabase)

  // Wishlist demand (top 10)
  const wishlistDemand = await getWishlistDemand(supabase)

  // Merge wishlist ratio with view data
  const viewMap = new Map(productAnalytics.map((p) => [p.product_id, p.view_count]))
  const wishlistWithRatio = wishlistDemand.map((w) => ({
    ...w,
    view_count: viewMap.get(w.product_id) ?? 0,
    ratio: viewMap.get(w.product_id)
      ? ((w.wishlist_count / (viewMap.get(w.product_id) ?? 1)) * 100).toFixed(1)
      : '—',
  }))

  // Device type breakdown
  const deviceMap = new Map<string, number>()
  for (const v of views) {
    const d = 'desktop' // product_views may not have device_type yet, default desktop
    deviceMap.set(d, (deviceMap.get(d) ?? 0) + 1)
  }
  const deviceBreakdown = Array.from(deviceMap.entries()).map(([device, count]) => ({
    device,
    count,
    pct: views.length > 0 ? ((count / views.length) * 100).toFixed(0) : '0',
  }))

  // Stats cards
  const totalSessions = new Set(views.map((v) => v.session_id)).size
  const avgDuration = views.length
    ? Math.round(views.reduce((s, v) => s + (v.duration_seconds ?? 0), 0) / views.length)
    : 0

  const bouncedViews = views.filter((v) => (v.duration_seconds ?? 0) < 10).length
  const bounceRate = views.length ? ((bouncedViews / views.length) * 100).toFixed(1) : '0'

  // Most active hour
  const hourMap = new Map<number, number>()
  for (const v of views) {
    const h = new Date(v.created_at).getHours()
    hourMap.set(h, (hourMap.get(h) ?? 0) + 1)
  }
  const mostActiveHour = Array.from(hourMap.entries()).sort((a, b) => b[1] - a[1])[0]?.[0] ?? 0
  const mostActiveHourLabel = `${mostActiveHour.toString().padStart(2, '0')}:00–${(mostActiveHour + 1).toString().padStart(2, '0')}:00`

  // Daily views (last 30 days) — views + cart_add events
  const since30 = new Date()
  since30.setDate(since30.getDate() - 30)
  const recentViews = views.filter((v) => new Date(v.created_at) >= since30)

  const dailyMap = new Map<string, { views: number; cart: number }>()
  for (let i = 0; i < 30; i++) {
    const d = new Date()
    d.setDate(d.getDate() - (29 - i))
    dailyMap.set(d.toISOString().slice(0, 10), { views: 0, cart: 0 })
  }
  for (const v of recentViews) {
    const key = v.created_at.slice(0, 10)
    const existing = dailyMap.get(key)
    if (existing) {
      if (v.event_type === 'cart_add') existing.cart++
      else existing.views++
    }
  }
  const dailyActivity = Array.from(dailyMap.entries()).map(([date, v]) => ({
    date,
    views: v.views,
    cart: v.cart,
  }))

  const statCards = [
    { label: 'Дундаж үзсэн хугацаа', value: formatDuration(avgDuration) },
    { label: 'Нийт session', value: totalSessions.toLocaleString() },
    { label: 'Хамгийн идэвхтэй цаг', value: mostActiveHourLabel },
    { label: 'Bounce rate', value: `${bounceRate}%` },
  ]

  return (
    <div className="space-y-8">
      <div>
        <p className="text-[10px] text-zinc-600 tracking-[0.4em] uppercase mb-1">Admin</p>
        <h1 className="font-heading text-3xl font-bold text-white">Analytics</h1>
      </div>

      <AnalyticsClient
        productAnalytics={productAnalytics}
        wishlistDemand={wishlistWithRatio}
        deviceBreakdown={deviceBreakdown}
        statCards={statCards}
        dailyActivity={dailyActivity}
      />
    </div>
  )
}
