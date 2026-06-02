/**
 * Typed Supabase query functions for Peretik.
 * Server-safe: pass in a supabase client rather than creating one internally,
 * so the same functions work in Server Components, Route Handlers, and client hooks.
 */
import type { SupabaseClient } from '@supabase/supabase-js'
import type {
  Product,
  ProductImage,
  Variant,
  Order,
  OrderItem,
  OrderStatus,
  CartItem,
  WishlistItem,
  Coupon,
  Category,
  User,
  ProductView,
  PageEvent,
} from '@/types'

// ── Input types ───────────────────────────────────────────────────────────────

export interface ProductFilters {
  category?: string
  size?: string
  color?: string
  sex?: string
  status?: string
}

export interface CreateOrderInput {
  user_id: string
  total: number
  coupon_id?: string | null
  shipping_address?: Record<string, string>
  items: {
    variant_id: string
    quantity: number
    price: number
    product_name: string
    variant_info: string
  }[]
}

export interface ProductAnalyticsRow {
  product_id: string
  product_name: string
  view_count: number
  avg_duration: number
}

export interface DailyRevenueRow {
  date: string
  revenue: number
  order_count: number
}

export interface OrderStatusBreakdownRow {
  status: OrderStatus
  count: number
}

// ── Products ──────────────────────────────────────────────────────────────────

export async function getProducts(
  supabase: SupabaseClient,
  filters: ProductFilters = {}
): Promise<Product[]> {
  let query = supabase
    .from('products')
    .select('*, images:product_images(*), variants(*), category:categories(*)')
    .order('created_at', { ascending: false })

  if (filters.status) {
    query = query.eq('status', filters.status)
  } else {
    query = query.eq('status', 'active')
  }

  if (filters.category) query = query.eq('category_id', filters.category)

  const { data, error } = await query
  if (error) throw error

  let products = (data ?? []) as Product[]

  // Variant-level filters (size, color, sex) applied in JS
  if (filters.size || filters.color || filters.sex) {
    products = products.filter((p) =>
      (p.variants ?? []).some(
        (v) =>
          (!filters.size || v.size === filters.size) &&
          (!filters.color || v.color === filters.color) &&
          (!filters.sex || v.sex === filters.sex)
      )
    )
  }

  return products
}

export async function getProductBySlug(
  supabase: SupabaseClient,
  slug: string
): Promise<Product | null> {
  const { data, error } = await supabase
    .from('products')
    .select('*, images:product_images(*), variants(*), category:categories(*)')
    .eq('slug', slug)
    .single()

  if (error || !data) return null
  return data as Product
}

export async function getFeaturedProducts(supabase: SupabaseClient): Promise<Product[]> {
  const { data, error } = await supabase
    .from('products')
    .select('*, images:product_images(*), variants(*)')
    .eq('is_featured', true)
    .eq('status', 'active')
    .order('created_at', { ascending: false })
    .limit(6)

  if (error) throw error
  return (data ?? []) as Product[]
}

export async function getPresaleProducts(supabase: SupabaseClient): Promise<Product[]> {
  const { data, error } = await supabase
    .from('products')
    .select('*, images:product_images(*), variants(*)')
    .eq('is_presale', true)
    .eq('status', 'active')
    .order('presale_end_at', { ascending: true })

  if (error) throw error
  return (data ?? []) as Product[]
}

// ── Orders ────────────────────────────────────────────────────────────────────

export async function getUserOrders(
  supabase: SupabaseClient,
  userId: string
): Promise<Order[]> {
  const { data, error } = await supabase
    .from('orders')
    .select('*, items:order_items(*)')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return (data ?? []) as Order[]
}

export async function getOrderById(
  supabase: SupabaseClient,
  orderId: string
): Promise<Order | null> {
  const { data, error } = await supabase
    .from('orders')
    .select(`
      *,
      items:order_items(
        *,
        variant:variants(*, product:products(*, images:product_images(*)))
      ),
      user:users(id, email, full_name)
    `)
    .eq('id', orderId)
    .single()

  if (error || !data) return null
  return data as Order
}

export async function createOrder(
  supabase: SupabaseClient,
  input: CreateOrderInput
): Promise<Order> {
  // Insert order
  const { data: order, error: orderError } = await supabase
    .from('orders')
    .insert({
      user_id: input.user_id,
      status: 'pending' as OrderStatus,
      total: input.total,
      coupon_id: input.coupon_id ?? null,
    })
    .select()
    .single()

  if (orderError || !order) throw orderError ?? new Error('Failed to create order')

  // Insert order items
  const orderItems = input.items.map((item) => ({
    order_id: order.id,
    variant_id: item.variant_id,
    quantity: item.quantity,
    price: item.price,
    product_name: item.product_name,
    variant_info: item.variant_info,
  }))

  const { error: itemsError } = await supabase.from('order_items').insert(orderItems)
  if (itemsError) throw itemsError

  // Decrement variant stock
  for (const item of input.items) {
    await supabase.rpc('decrement_variant_stock', {
      variant_id: item.variant_id,
      qty: item.quantity,
    })
  }

  return order as Order
}

// ── Cart ──────────────────────────────────────────────────────────────────────

export async function getCartItems(
  supabase: SupabaseClient,
  userId?: string,
  sessionId?: string
): Promise<CartItem[]> {
  if (!userId && !sessionId) return []

  let query = supabase
    .from('cart_items')
    .select('*, variant:variants(*, product:products(*, images:product_images(*)))')

  if (userId) {
    query = query.eq('user_id', userId)
  } else if (sessionId) {
    query = query.eq('session_id', sessionId)
  }

  const { data, error } = await query
  if (error) throw error
  return (data ?? []) as CartItem[]
}

export async function syncGuestCart(
  supabase: SupabaseClient,
  sessionId: string,
  userId: string
): Promise<void> {
  // Move all guest cart items to the authenticated user
  const { error } = await supabase
    .from('cart_items')
    .update({ user_id: userId, session_id: null })
    .eq('session_id', sessionId)
    .is('user_id', null)

  if (error) throw error
}

// ── Wishlist ──────────────────────────────────────────────────────────────────

export async function getWishlist(
  supabase: SupabaseClient,
  userId: string
): Promise<WishlistItem[]> {
  const { data, error } = await supabase
    .from('wishlist_items')
    .select('*, product:products(*, images:product_images(*), variants(*))')
    .eq('user_id', userId)
    .order('id', { ascending: false })

  if (error) throw error
  return (data ?? []) as WishlistItem[]
}

export async function toggleWishlist(
  supabase: SupabaseClient,
  userId: string,
  productId: string
): Promise<'added' | 'removed'> {
  const { data: existing } = await supabase
    .from('wishlist_items')
    .select('id')
    .eq('user_id', userId)
    .eq('product_id', productId)
    .single()

  if (existing) {
    await supabase.from('wishlist_items').delete().eq('id', existing.id)
    return 'removed'
  }

  await supabase.from('wishlist_items').insert({ user_id: userId, product_id: productId })
  return 'added'
}

// ── Analytics ─────────────────────────────────────────────────────────────────

export async function getProductAnalytics(
  supabase: SupabaseClient
): Promise<ProductAnalyticsRow[]> {
  const { data, error } = await supabase
    .from('product_views')
    .select('product_id, duration_seconds, product:products(name_mn)')

  if (error) throw error

  // Aggregate in JS
  const map = new Map<string, { name: string; count: number; totalDuration: number }>()

  for (const row of data ?? []) {
    const existing = map.get(row.product_id)
    const productRaw = row.product as unknown
    const productObj = Array.isArray(productRaw) ? productRaw[0] : productRaw
    const name = (productObj as { name_mn?: string } | null)?.name_mn ?? row.product_id
    if (existing) {
      existing.count++
      existing.totalDuration += row.duration_seconds ?? 0
    } else {
      map.set(row.product_id, { name, count: 1, totalDuration: row.duration_seconds ?? 0 })
    }
  }

  return Array.from(map.entries())
    .map(([product_id, v]) => ({
      product_id,
      product_name: v.name,
      view_count: v.count,
      avg_duration: v.count > 0 ? Math.round(v.totalDuration / v.count) : 0,
    }))
    .sort((a, b) => b.view_count - a.view_count)
    .slice(0, 10)
}

export async function getWishlistDemand(
  supabase: SupabaseClient
): Promise<{ product_id: string; product_name: string; wishlist_count: number }[]> {
  const { data, error } = await supabase
    .from('wishlist_items')
    .select('product_id, product:products(name_mn)')

  if (error) throw error

  const map = new Map<string, { name: string; count: number }>()
  for (const row of data ?? []) {
    const productRaw = row.product as unknown
    const productObj = Array.isArray(productRaw) ? productRaw[0] : productRaw
    const name = (productObj as { name_mn?: string } | null)?.name_mn ?? row.product_id
    const existing = map.get(row.product_id)
    if (existing) {
      existing.count++
    } else {
      map.set(row.product_id, { name, count: 1 })
    }
  }

  return Array.from(map.entries())
    .map(([product_id, v]) => ({
      product_id,
      product_name: v.name,
      wishlist_count: v.count,
    }))
    .sort((a, b) => b.wishlist_count - a.wishlist_count)
    .slice(0, 10)
}

export async function getDailyRevenue(
  supabase: SupabaseClient,
  days: number
): Promise<DailyRevenueRow[]> {
  const since = new Date()
  since.setDate(since.getDate() - days)

  const { data, error } = await supabase
    .from('orders')
    .select('total, created_at')
    .eq('status', 'paid')
    .gte('created_at', since.toISOString())
    .order('created_at', { ascending: true })

  if (error) throw error

  // Group by date
  const map = new Map<string, { revenue: number; order_count: number }>()

  // Seed all days with 0
  for (let i = 0; i < days; i++) {
    const d = new Date()
    d.setDate(d.getDate() - (days - 1 - i))
    const key = d.toISOString().slice(0, 10)
    map.set(key, { revenue: 0, order_count: 0 })
  }

  for (const row of data ?? []) {
    const key = row.created_at.slice(0, 10)
    const existing = map.get(key)
    if (existing) {
      existing.revenue += row.total ?? 0
      existing.order_count++
    }
  }

  return Array.from(map.entries()).map(([date, v]) => ({
    date,
    revenue: v.revenue,
    order_count: v.order_count,
  }))
}

export async function getOrderStatusBreakdown(
  supabase: SupabaseClient
): Promise<OrderStatusBreakdownRow[]> {
  const { data, error } = await supabase
    .from('orders')
    .select('status')

  if (error) throw error

  const map = new Map<string, number>()
  for (const row of data ?? []) {
    map.set(row.status, (map.get(row.status) ?? 0) + 1)
  }

  return Array.from(map.entries()).map(([status, count]) => ({
    status: status as OrderStatus,
    count,
  }))
}

// ── Admin ─────────────────────────────────────────────────────────────────────

export interface AdminOrderFilters {
  status?: OrderStatus
}

export async function getAllOrders(
  supabase: SupabaseClient,
  filters: AdminOrderFilters = {}
): Promise<Order[]> {
  let query = supabase
    .from('orders')
    .select(`
      *,
      items:order_items(*),
      user:users(id, email, full_name)
    `)
    .order('created_at', { ascending: false })

  if (filters.status) query = query.eq('status', filters.status)

  const { data, error } = await query
  if (error) throw error
  return (data ?? []) as Order[]
}

export async function updateOrderStatus(
  supabase: SupabaseClient,
  orderId: string,
  status: OrderStatus,
  trackingCode?: string
): Promise<void> {
  const update: Record<string, unknown> = { status }
  if (trackingCode !== undefined) update.tracking_code = trackingCode

  const { error } = await supabase.from('orders').update(update).eq('id', orderId)
  if (error) throw error
}

export async function getAllUsers(
  supabase: SupabaseClient
): Promise<(User & { order_count: number })[]> {
  const { data: users, error } = await supabase
    .from('users')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) throw error

  // Fetch order counts per user
  const { data: orderCounts } = await supabase
    .from('orders')
    .select('user_id')

  const countMap = new Map<string, number>()
  for (const row of orderCounts ?? []) {
    countMap.set(row.user_id, (countMap.get(row.user_id) ?? 0) + 1)
  }

  return (users ?? []).map((u) => ({
    ...u,
    order_count: countMap.get(u.id) ?? 0,
  }))
}

export async function promoteToAdmin(
  supabase: SupabaseClient,
  email: string
): Promise<void> {
  const { data: user, error: findError } = await supabase
    .from('users')
    .select('id')
    .eq('email', email)
    .single()

  if (findError || !user) throw new Error(`User not found: ${email}`)

  const { error } = await supabase.from('users').update({ role: 'admin' }).eq('id', user.id)
  if (error) throw error
}

// ── Coupon helpers ────────────────────────────────────────────────────────────

export async function getCouponByCode(
  supabase: SupabaseClient,
  code: string
): Promise<Coupon | null> {
  const { data, error } = await supabase
    .from('coupons')
    .select('*')
    .eq('code', code.toUpperCase())
    .eq('is_active', true)
    .single()

  if (error || !data) return null

  // Check expiry
  if (data.expires_at && new Date(data.expires_at) < new Date()) return null
  // Check usage limit
  if (data.usage_limit !== null && data.used_count >= data.usage_limit) return null

  return data as Coupon
}

export async function incrementCouponUsage(
  supabase: SupabaseClient,
  couponId: string
): Promise<void> {
  await supabase.rpc('increment_coupon_usage', { coupon_id: couponId })
}
