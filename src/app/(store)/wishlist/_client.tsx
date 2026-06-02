'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Heart, ShoppingBag } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { WishlistButton } from '@/components/ui/WishlistButton'
import { VariantModal } from '@/components/ui/VariantModal'
import { formatPrice } from '@/lib/utils'
import { useLangStore } from '@/lib/store/langStore'
import { variantPrice } from '@/types'
import type { Product, ProductImage, Variant } from '@/types'

type FullProduct = Product & { images: ProductImage[]; variants: Variant[] }

interface Props {
  products: FullProduct[]
}

export function WishlistClient({ products }: Props) {
  const { lang } = useLangStore()
  const [modalProduct, setModalProduct] = useState<FullProduct | null>(null)

  return (
    <>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {products.map((product) => {
          const img = product.images?.[0]?.url
          const firstVariant = product.variants?.[0]
          const price = firstVariant ? variantPrice(firstVariant, product) : product.price
          const name = lang === 'mn' ? product.name_mn : product.name_en
          const inStock = product.variants?.some((v) => v.stock > 0)

          return (
            <div key={product.id} className="group relative bg-[#0D0D0D] rounded border border-white/[0.06] overflow-hidden">
              {/* Image */}
              <Link href={`/shop/${product.slug}`}>
                <div className="aspect-[3/4] bg-[#111] overflow-hidden relative">
                  {img ? (
                    <Image
                      src={img}
                      alt={name}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-zinc-800">
                      <Heart size={32} strokeWidth={1} />
                    </div>
                  )}

                  {/* Hover overlay */}
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <span className="text-xs text-zinc-300 border border-white/20 px-3 py-1.5 rounded">
                      {lang === 'mn' ? 'Дэлгэрэнгүй' : 'View'}
                    </span>
                  </div>
                </div>
              </Link>

              {/* Wishlist remove button */}
              <div className="absolute top-3 right-3">
                <WishlistButton productId={product.id} />
              </div>

              {/* Info */}
              <div className="p-3 space-y-3">
                <div>
                  <p className="text-sm text-white font-medium truncate">{name}</p>
                  <p className="text-sm text-[#CA8A04] font-semibold mt-0.5">{formatPrice(price)}</p>
                </div>

                <Button
                  onClick={() => setModalProduct(product)}
                  disabled={!inStock}
                  size="sm"
                  className="w-full bg-[#CA8A04]/10 hover:bg-[#CA8A04]/20 text-[#CA8A04] border border-[#CA8A04]/20 hover:border-[#CA8A04]/40 font-medium text-xs disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <ShoppingBag size={12} className="mr-1.5" />
                  {inStock
                    ? (lang === 'mn' ? 'Сагсанд нэмэх' : 'Add to Cart')
                    : (lang === 'mn' ? 'Дууссан' : 'Out of stock')}
                </Button>
              </div>
            </div>
          )
        })}
      </div>

      {modalProduct && (
        <VariantModal
          product={modalProduct}
          onClose={() => setModalProduct(null)}
        />
      )}
    </>
  )
}
