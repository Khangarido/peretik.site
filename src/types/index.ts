export type UserRole = 'admin' | 'customer'
export type UserLang = 'mn' | 'en'

export interface User {
  id: string
  email: string
  full_name: string | null
  role: UserRole
  lang: UserLang
  avatar_url: string | null
  phone: string | null
  created_at: string
}

export interface Category {
  id: string
  name_mn: string
  name_en: string
  slug: string
  parent_id: string | null
}

export type ProductStatus = 'active' | 'draft' | 'archived'
export type VariantSize = 'XS' | 'S' | 'M' | 'L' | 'XL' | 'XXL'
export type VariantSex = 'male' | 'female' | 'unisex'

export interface Product {
  id: string
  name_mn: string
  name_en: string
  description_mn: string | null
  description_en: string | null
  price: number
  presale_price: number | null
  presale_end_at: string | null
  is_featured: boolean
  is_presale: boolean
  status: ProductStatus
  category_id: string | null
  slug: string
  created_at: string
  // joined
  images?: ProductImage[]
  variants?: Variant[]
  category?: Category
}

export interface ProductImage {
  id: string
  product_id: string
  url: string
  sort_order: number
}

export interface Variant {
  id: string
  product_id: string
  size: VariantSize
  color: string
  sex: VariantSex
  stock: number
  sku: string
  price_override: number | null
}

export type OrderStatus =
  | 'pending'
  | 'paid'
  | 'processing'
  | 'shipped'
  | 'delivered'
  | 'cancelled'

export interface Order {
  id: string
  user_id: string
  status: OrderStatus
  total: number
  coupon_id: string | null
  byl_payment_id: string | null
  tracking_code: string | null
  /** @alias tracking_code — kept for backwards compat */
  tracking_number?: string | null
  created_at: string
  // joined
  items?: OrderItem[]
  user?: Pick<User, 'id' | 'email' | 'full_name'>
}

export interface OrderItem {
  id: string
  order_id: string
  variant_id: string
  quantity: number
  price: number
  product_name: string
  variant_info: string
  // joined (optional)
  variant?: Variant & { product?: Product }
}

export interface CartItem {
  id: string
  user_id: string | null
  session_id: string | null
  variant_id: string
  quantity: number
  variant: Variant & {
    product: Product & { images: ProductImage[] }
  }
}

export interface WishlistItem {
  id: string
  user_id: string
  product_id: string
  product: Product & { images: ProductImage[]; variants: Variant[] }
}

export type DiscountType = 'percent' | 'fixed'

export interface Coupon {
  id: string
  code: string
  discount_type: DiscountType
  value: number
  expires_at: string | null
  usage_limit: number | null
  used_count: number
  is_active: boolean
}

export interface ProductView {
  id: string
  product_id: string
  user_id: string | null
  session_id: string | null
  duration_seconds: number
  device_type: string
  created_at: string
}

export type PageEventType = 'view' | 'click' | 'wishlist' | 'cart_add'

export interface PageEvent {
  id: string
  type: PageEventType
  product_id: string | null
  user_id: string | null
  session_id: string | null
  metadata: Record<string, unknown> | null
  created_at: string
}

// ── Derived helpers ────────────────────────────────────────────────────────────

export function variantPrice(variant: Variant, product: Product): number {
  return variant.price_override ?? (product.is_presale && product.presale_price != null ? product.presale_price : product.price)
}

export function productDisplayName(product: Product, lang: UserLang): string {
  return lang === 'mn' ? product.name_mn : product.name_en
}

export function productDescription(product: Product, lang: UserLang): string {
  return (lang === 'mn' ? product.description_mn : product.description_en) ?? ''
}
