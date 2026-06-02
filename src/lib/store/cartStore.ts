'use client'

import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { CartItem, Product, ProductImage, Variant } from '@/types'
import { variantPrice } from '@/types'

// ── Type for a local (un-persisted) cart item before DB sync ─────────────────
export type LocalCartItem = CartItem

interface CartStore {
  items: LocalCartItem[]
  isOpen: boolean
  couponCode: string
  couponDiscount: number

  // Actions
  addItem: (variant: Variant & { product: Product & { images: ProductImage[] } }, qty?: number) => void
  removeItem: (variantId: string) => void
  updateQty: (variantId: string, qty: number) => void
  clearCart: () => void
  toggleCart: () => void
  openCart: () => void
  closeCart: () => void
  setCoupon: (code: string, discount: number) => void
  removeCoupon: () => void

  // Derived
  getTotal: () => number
  getSubtotal: () => number
  getCount: () => number
}

function makeLocalItem(
  variant: Variant & { product: Product & { images: ProductImage[] } },
  qty: number
): LocalCartItem {
  return {
    id: `local-${variant.id}`,
    user_id: null,
    session_id: getSessionId(),
    variant_id: variant.id,
    quantity: qty,
    variant,
  }
}

function getSessionId(): string {
  if (typeof window === 'undefined') return ''
  const key = 'peretik_session_id'
  let sid = sessionStorage.getItem(key)
  if (!sid) {
    sid = crypto.randomUUID()
    sessionStorage.setItem(key, sid)
  }
  return sid
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,
      couponCode: '',
      couponDiscount: 0,

      setCoupon(code, discount) {
        set({ couponCode: code, couponDiscount: discount })
      },

      removeCoupon() {
        set({ couponCode: '', couponDiscount: 0 })
      },

      addItem(variant, qty = 1) {
        set((state) => {
          const existing = state.items.find((i) => i.variant_id === variant.id)
          if (existing) {
            return {
              items: state.items.map((i) =>
                i.variant_id === variant.id
                  ? { ...i, quantity: i.quantity + qty }
                  : i
              ),
            }
          }
          return { items: [...state.items, makeLocalItem(variant, qty)] }
        })
      },

      removeItem(variantId) {
        set((state) => ({
          items: state.items.filter((i) => i.variant_id !== variantId),
        }))
      },

      updateQty(variantId, qty) {
        if (qty < 1) {
          get().removeItem(variantId)
          return
        }
        set((state) => ({
          items: state.items.map((i) =>
            i.variant_id === variantId ? { ...i, quantity: qty } : i
          ),
        }))
      },

      clearCart() {
        set({ items: [] })
      },

      toggleCart() {
        set((s) => ({ isOpen: !s.isOpen }))
      },

      openCart() {
        set({ isOpen: true })
      },

      closeCart() {
        set({ isOpen: false })
      },

      getSubtotal() {
        return get().items.reduce((sum, item) => {
          const price = variantPrice(item.variant, item.variant.product)
          return sum + price * item.quantity
        }, 0)
      },

      getTotal() {
        const subtotal = get().getSubtotal()
        return Math.max(0, subtotal - get().couponDiscount)
      },

      getCount() {
        return get().items.reduce((sum, item) => sum + item.quantity, 0)
      },
    }),
    {
      name: 'peretik-cart',
      storage: createJSONStorage(() =>
        typeof window !== 'undefined' ? localStorage : {
          getItem: () => null,
          setItem: () => {},
          removeItem: () => {},
        }
      ),
      partialize: (state) => ({ items: state.items, couponCode: state.couponCode, couponDiscount: state.couponDiscount }),
    }
  )
)
