'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import type { WishlistItem } from '@/types'

export function useWishlist(userId?: string) {
  const supabase = createClient()
  const queryClient = useQueryClient()

  const { data: wishlist = [], isLoading } = useQuery<WishlistItem[]>({
    queryKey: ['wishlist', userId],
    queryFn: async () => {
      if (!userId) return []
      const { data } = await supabase
        .from('wishlist_items')
        .select('*, product:products(*)')
        .eq('user_id', userId)
      return data ?? []
    },
    enabled: !!userId,
  })

  const addMutation = useMutation({
    mutationFn: async (productId: string) => {
      if (!userId) throw new Error('Not authenticated')
      await supabase.from('wishlist_items').insert({ user_id: userId, product_id: productId })
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['wishlist', userId] }),
  })

  const removeMutation = useMutation({
    mutationFn: async (productId: string) => {
      if (!userId) throw new Error('Not authenticated')
      await supabase
        .from('wishlist_items')
        .delete()
        .eq('user_id', userId)
        .eq('product_id', productId)
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['wishlist', userId] }),
  })

  const isInWishlist = (productId: string) =>
    wishlist.some((item) => item.product_id === productId)

  const toggle = (productId: string) => {
    if (isInWishlist(productId)) {
      removeMutation.mutate(productId)
    } else {
      addMutation.mutate(productId)
    }
  }

  return { wishlist, isLoading, isInWishlist, toggle, addMutation, removeMutation }
}
