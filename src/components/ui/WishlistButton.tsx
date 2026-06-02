'use client'

import { Heart } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useWishlistStore } from '@/lib/store/wishlistStore'
import { useAuth } from '@/lib/hooks/useAuth'

interface Props {
  productId: string
  className?: string
  size?: number
}

export function WishlistButton({ productId, className, size = 16 }: Props) {
  const { user } = useAuth()
  const { isWishlisted, toggle } = useWishlistStore()
  const wishlisted = isWishlisted(productId)

  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (!user) return
    await toggle(productId, user.id)
  }

  if (!user) return null

  return (
    <button
      onClick={handleClick}
      aria-label={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
      className={cn(
        'flex items-center justify-center rounded-full transition-all duration-200',
        wishlisted
          ? 'text-[#CA8A04]'
          : 'text-white/60 hover:text-white',
        className
      )}
    >
      <Heart
        size={size}
        className={cn(
          'transition-all duration-200',
          wishlisted && 'fill-[#CA8A04]'
        )}
      />
    </button>
  )
}
