import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import type { Coupon, OrderStatus } from '@/types'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatPrice(amount: number, currency = '₮'): string {
  return `${amount.toLocaleString('mn-MN')}${currency}`
}

export function formatDate(dateString: string, lang: 'mn' | 'en' = 'mn'): string {
  const date = new Date(dateString)
  return date.toLocaleDateString(lang === 'mn' ? 'mn-MN' : 'en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

/** Alias for slugify — creates a URL-safe slug from any text. */
export const generateSlug = slugify

export function getOrderStatusColor(status: OrderStatus): string {
  const colors: Record<OrderStatus, string> = {
    pending: 'text-yellow-500',
    paid: 'text-blue-500',
    processing: 'text-sky-400',
    shipped: 'text-purple-500',
    delivered: 'text-green-500',
    cancelled: 'text-red-500',
  }
  return colors[status]
}

export function getOrderStatusBg(status: OrderStatus): string {
  const colors: Record<OrderStatus, string> = {
    pending: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
    paid: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
    processing: 'bg-sky-400/10 text-sky-400 border-sky-400/20',
    shipped: 'bg-purple-500/10 text-purple-500 border-purple-500/20',
    delivered: 'bg-green-500/10 text-green-500 border-green-500/20',
    cancelled: 'bg-red-500/10 text-red-500 border-red-500/20',
  }
  return colors[status]
}

export function truncate(text: string, length: number): string {
  if (text.length <= length) return text
  return text.slice(0, length) + '...'
}

export function generateSessionId(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36)
}

export function getDeviceType(): string {
  if (typeof window === 'undefined') return 'unknown'
  const ua = navigator.userAgent
  if (/tablet|ipad|playbook|silk/i.test(ua)) return 'tablet'
  if (/mobile|iphone|ipod|android|blackberry|opera|mini|windows\sce|palm|smartphone|iemobile/i.test(ua)) return 'mobile'
  return 'desktop'
}

/**
 * Calculate discounted price after applying a coupon.
 * Returns the final price (never below 0).
 */
export function calculateDiscount(price: number, coupon: Coupon): number {
  if (!coupon.is_active) return price
  if (coupon.expires_at && new Date(coupon.expires_at) < new Date()) return price
  if (coupon.usage_limit !== null && coupon.used_count >= coupon.usage_limit) return price

  const discount =
    coupon.discount_type === 'percent'
      ? Math.floor(price * (coupon.value / 100))
      : coupon.value

  return Math.max(0, price - discount)
}
