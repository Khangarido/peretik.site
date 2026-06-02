'use client'

import { create } from 'zustand'
import { createClient } from '@/lib/supabase/client'
import type { WishlistItem } from '@/types'

interface WishlistStore {
  items: WishlistItem[]
  loading: boolean

  // Fetch wishlist from Supabase for the authenticated user
  sync: (userId: string) => Promise<void>

  // Add a product to the wishlist (DB + local state)
  addItem: (productId: string, userId: string) => Promise<void>

  // Remove a product from the wishlist (DB + local state)
  removeItem: (productId: string, userId: string) => Promise<void>

  // Optimistic toggle — adds if not present, removes if present
  toggle: (productId: string, userId: string) => Promise<void>

  // Pure local check — no async needed
  isWishlisted: (productId: string) => boolean

  // Clear local state on logout
  clear: () => void
}

export const useWishlistStore = create<WishlistStore>((set, get) => ({
  items: [],
  loading: false,

  async sync(userId) {
    set({ loading: true })
    const supabase = createClient()
    const { data, error } = await supabase
      .from('wishlist_items')
      .select(`
        id,
        user_id,
        product_id,
        product:products (
          *,
          images:product_images ( * ),
          variants ( * )
        )
      `)
      .eq('user_id', userId)

    if (!error && data) {
      set({ items: data as unknown as WishlistItem[] })
    }
    set({ loading: false })
  },

  async addItem(productId, userId) {
    const supabase = createClient()

    // Optimistic update — fetch the product for local state
    const { data: product } = await supabase
      .from('products')
      .select('*, images:product_images(*), variants(*)')
      .eq('id', productId)
      .single()

    if (!product) return

    const optimistic: WishlistItem = {
      id: `optimistic-${productId}`,
      user_id: userId,
      product_id: productId,
      product: product as WishlistItem['product'],
    }

    set((s) => ({ items: [...s.items, optimistic] }))

    const { data, error } = await supabase
      .from('wishlist_items')
      .insert({ user_id: userId, product_id: productId })
      .select('id')
      .single()

    if (error) {
      // Roll back on failure
      set((s) => ({ items: s.items.filter((i) => i.product_id !== productId) }))
    } else if (data) {
      // Replace optimistic id with real id
      set((s) => ({
        items: s.items.map((i) =>
          i.product_id === productId ? { ...i, id: data.id } : i
        ),
      }))
    }
  },

  async removeItem(productId, userId) {
    const previous = get().items

    // Optimistic update
    set((s) => ({ items: s.items.filter((i) => i.product_id !== productId) }))

    const supabase = createClient()
    const { error } = await supabase
      .from('wishlist_items')
      .delete()
      .eq('user_id', userId)
      .eq('product_id', productId)

    if (error) {
      // Roll back on failure
      set({ items: previous })
    }
  },

  async toggle(productId, userId) {
    if (get().isWishlisted(productId)) {
      await get().removeItem(productId, userId)
    } else {
      await get().addItem(productId, userId)
    }
  },

  isWishlisted(productId) {
    return get().items.some((i) => i.product_id === productId)
  },

  clear() {
    set({ items: [] })
  },
}))
