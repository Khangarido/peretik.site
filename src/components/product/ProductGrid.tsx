'use client'

import { ProductCard } from './ProductCard'
import type { Product, ProductImage, Variant } from '@/types'

interface Props {
  products: (Product & { images: ProductImage[]; variants: Variant[] })[]
  loading?: boolean
}

function ProductSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="aspect-[3/4] bg-[#111] rounded border border-white/[0.04]" />
      <div className="mt-3 space-y-2">
        <div className="h-3 bg-[#111] rounded w-3/4" />
        <div className="h-3 bg-[#111] rounded w-1/3" />
      </div>
    </div>
  )
}

export function ProductGrid({ products, loading = false }: Props) {
  if (loading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 sm:gap-6">
        {Array.from({ length: 3 }).map((_, i) => (
          <ProductSkeleton key={i} />
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 sm:gap-6">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  )
}
