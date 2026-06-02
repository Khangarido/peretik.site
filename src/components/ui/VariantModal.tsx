'use client'

import { useState } from 'react'
import { X, ShoppingBag } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { VariantSelector } from '@/components/product/VariantSelector'
import { useCart } from '@/lib/hooks/useCart'
import { useLangStore } from '@/lib/store/langStore'
import { variantPrice } from '@/types'
import { formatPrice } from '@/lib/utils'
import { toast } from 'sonner'
import type { Product, ProductImage, Variant } from '@/types'

type FullProduct = Product & { images: ProductImage[]; variants: Variant[] }

interface Props {
  product: FullProduct
  onClose: () => void
}

export function VariantModal({ product, onClose }: Props) {
  const { lang } = useLangStore()
  const { addItem } = useCart()
  const [selectedVariant, setSelectedVariant] = useState<Variant | null>(null)
  const [quantity, setQuantity] = useState(1)

  const price = selectedVariant ? variantPrice(selectedVariant, product) : product.price

  const handleAddToCart = () => {
    if (!selectedVariant) {
      toast.error(lang === 'mn' ? 'Вариант сонгоно уу' : 'Please select a variant')
      return
    }
    addItem(selectedVariant as Variant & { product: Product & { images: ProductImage[] } }, quantity)
    toast.success(lang === 'mn' ? 'Сагсанд нэмэгдлээ' : 'Added to cart')
    onClose()
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/70 z-50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-md mx-4">
        <div className="bg-[#0D0D0D] border border-white/[0.08] rounded-lg overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.06]">
            <h2 className="font-heading text-lg font-bold text-white">
              {lang === 'mn' ? product.name_mn : product.name_en}
            </h2>
            <button
              onClick={onClose}
              className="text-zinc-600 hover:text-white transition-colors"
            >
              <X size={18} />
            </button>
          </div>

          {/* Body */}
          <div className="p-5 space-y-5">
            <VariantSelector
              variants={product.variants}
              onSelect={setSelectedVariant}
              selectedVariantId={selectedVariant?.id ?? null}
            />

            {/* Quantity */}
            <div>
              <p className="text-[10px] text-zinc-600 uppercase tracking-widest mb-2">
                {lang === 'mn' ? 'Тоо' : 'Quantity'}
              </p>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-8 h-8 rounded border border-white/10 text-zinc-300 hover:border-[#CA8A04]/40 hover:text-[#CA8A04] transition-all flex items-center justify-center text-lg"
                >
                  −
                </button>
                <span className="w-8 text-center text-white font-medium">{quantity}</span>
                <button
                  onClick={() => setQuantity(Math.min(selectedVariant?.stock ?? 10, quantity + 1))}
                  disabled={!selectedVariant || quantity >= (selectedVariant?.stock ?? 10)}
                  className="w-8 h-8 rounded border border-white/10 text-zinc-300 hover:border-[#CA8A04]/40 hover:text-[#CA8A04] transition-all flex items-center justify-center text-lg disabled:opacity-30"
                >
                  +
                </button>
                {selectedVariant && (selectedVariant?.stock ?? 0) <= 5 && (
                  <span className="text-xs text-amber-500">{selectedVariant.stock} үлдсэн</span>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-[#CA8A04] font-bold text-xl">{formatPrice(price * quantity)}</span>
            </div>

            <Button
              onClick={handleAddToCart}
              disabled={!selectedVariant}
              className="w-full h-11 bg-[#CA8A04] hover:bg-[#D97706] text-black font-bold tracking-wide disabled:opacity-40"
            >
              <ShoppingBag size={15} className="mr-2" />
              {lang === 'mn' ? 'Сагсанд нэмэх' : 'Add to Cart'}
            </Button>
          </div>
        </div>
      </div>
    </>
  )
}
