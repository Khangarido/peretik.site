'use client'

import Link from 'next/link'
import Image from 'next/image'
import { ShoppingBag } from 'lucide-react'
import { cn, formatPrice } from '@/lib/utils'
import { useLangStore } from '@/lib/store/langStore'
import { useCartStore } from '@/lib/store/cartStore'
import { PBadge } from '@/components/ui/PBadge'
import { WishlistButton } from '@/components/ui/WishlistButton'
import { variantPrice } from '@/types'
import type { Product, ProductImage, Variant } from '@/types'

interface Props {
  product: Product & { images: ProductImage[]; variants: Variant[] }
}

export function ProductCard({ product }: Props) {
  const { lang } = useLangStore()
  const addItem = useCartStore((s) => s.addItem)
  const openCart = useCartStore((s) => s.openCart)

  const name = lang === 'mn' ? product.name_mn : product.name_en
  const image = product.images?.[0]?.url
  const allVariants = product.variants ?? []
  const isOOS = allVariants.length > 0 && allVariants.every((v) => v.stock === 0)
  const defaultVariant = allVariants.find((v) => v.stock > 0) ?? allVariants[0]

  const displayPrice = product.is_presale && product.presale_price != null
    ? product.presale_price
    : product.price

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (!defaultVariant || isOOS) return
    addItem({ ...defaultVariant, product: { ...product, images: product.images } })
    openCart()
  }

  return (
    <div className="group relative cursor-pointer">
      <Link href={`/shop/${product.slug}`} className="block">
        {/* Image container */}
        <div className="relative aspect-[3/4] bg-[#0D0D0D] rounded overflow-hidden border border-white/[0.05]">
          {image ? (
            <Image
              src={image}
              alt={name}
              fill
              className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <span className="font-heading text-2xl text-zinc-800 tracking-[0.2em]">PERETIK</span>
            </div>
          )}

          {/* Dark overlay on hover */}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-400" />

          {/* Badges — top left */}
          <div className="absolute top-2 left-2 flex flex-col gap-1.5 z-10">
            {isOOS && <PBadge variant="out-of-stock" />}
            {!isOOS && product.is_presale && <PBadge variant="presale" />}
            {!isOOS && product.is_featured && !product.is_presale && <PBadge variant="featured" />}
          </div>

          {/* Wishlist button — top right */}
          <div className="absolute top-2 right-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <WishlistButton
              productId={product.id}
              size={16}
              className="w-8 h-8 bg-black/60 backdrop-blur-sm rounded-full hover:bg-black/80"
            />
          </div>

          {/* Quick add to cart — slides up from bottom */}
          {!isOOS && (
            <div className="absolute bottom-0 inset-x-0 z-10 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out">
              <button
                onClick={handleQuickAdd}
                className="w-full py-3 bg-[#CA8A04] hover:bg-[#D97706] text-black text-xs font-bold tracking-[0.15em] uppercase flex items-center justify-center gap-2 transition-colors"
              >
                <ShoppingBag size={13} />
                {lang === 'mn' ? 'Сагсанд нэмэх' : 'Add to Cart'}
              </button>
            </div>
          )}
        </div>

        {/* Info */}
        <div className="mt-3 space-y-1 px-0.5">
          <p className="text-sm font-medium text-zinc-200 truncate group-hover:text-white transition-colors leading-tight">
            {name}
          </p>
          <div className="flex items-center gap-2">
            {product.is_presale && product.presale_price != null ? (
              <>
                <span className="text-sm font-bold text-[#CA8A04]">
                  {formatPrice(displayPrice)}
                </span>
                <span className="text-xs text-zinc-600 line-through">
                  {formatPrice(product.price)}
                </span>
              </>
            ) : (
              <span className={cn('text-sm font-semibold', isOOS ? 'text-zinc-600' : 'text-white')}>
                {formatPrice(product.price)}
              </span>
            )}
          </div>
        </div>
      </Link>
    </div>
  )
}
