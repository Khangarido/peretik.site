'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'
import { useLangStore } from '@/lib/store/langStore'
import type { Variant, VariantSex } from '@/types'

const SIZE_ORDER: string[] = ['XS', 'S', 'M', 'L', 'XL', 'XXL']

const SEX_LABELS: Record<VariantSex, { mn: string; en: string }> = {
  male: { mn: 'Эрэгтэй', en: 'Male' },
  female: { mn: 'Эмэгтэй', en: 'Female' },
  unisex: { mn: 'Унисекс', en: 'Unisex' },
}

interface Props {
  variants: Variant[]
  onSelect: (variant: Variant) => void
  selectedVariantId?: string | null
}

export function VariantSelector({ variants, onSelect, selectedVariantId }: Props) {
  const { t, lang } = useLangStore()

  // Derive available sex options from variants
  const availableSexes = [...new Set(variants.map((v) => v.sex))] as VariantSex[]
  const hasMultipleSexes = availableSexes.length > 1
  const [activeSex, setActiveSex] = useState<VariantSex>(availableSexes[0])

  // Filter variants by active sex
  const filteredVariants = hasMultipleSexes
    ? variants.filter((v) => v.sex === activeSex)
    : variants

  const sizes = SIZE_ORDER.filter((s) => filteredVariants.some((v) => v.size === s))
  const colors = [...new Set(filteredVariants.map((v) => v.color))]

  const selectedVariant = variants.find((v) => v.id === selectedVariantId) ?? null
  const selectedSize = selectedVariant?.size ?? null
  const selectedColor = selectedVariant?.color ?? null

  const handleSizeSelect = (size: string) => {
    const match = filteredVariants.find(
      (v) => v.size === size && v.stock > 0 && (!selectedColor || v.color === selectedColor)
    ) ?? filteredVariants.find((v) => v.size === size && v.stock > 0)
    if (match) onSelect(match)
  }

  const handleColorSelect = (color: string) => {
    const match = filteredVariants.find(
      (v) => v.color === color && v.stock > 0 && (!selectedSize || v.size === selectedSize)
    ) ?? filteredVariants.find((v) => v.color === color && v.stock > 0)
    if (match) onSelect(match)
  }

  const handleSexChange = (sex: VariantSex) => {
    setActiveSex(sex)
    // Auto-select first available variant in this sex
    const first = variants.find((v) => v.sex === sex && v.stock > 0)
    if (first) onSelect(first)
  }

  const isSizeOOS = (size: string) => {
    return !filteredVariants.some(
      (v) => v.size === size && v.stock > 0 && (!selectedColor || v.color === selectedColor)
    )
  }

  const isColorOOS = (color: string) => {
    return !filteredVariants.some(
      (v) => v.color === color && v.stock > 0
    )
  }

  const LOW_STOCK_THRESHOLD = 5

  return (
    <div className="space-y-5">
      {/* Sex tabs */}
      {hasMultipleSexes && (
        <div>
          <p className="text-xs text-zinc-500 uppercase tracking-widest mb-2.5">
            {lang === 'mn' ? 'Хүйс' : 'Gender'}
          </p>
          <div className="flex gap-1 bg-[#0D0D0D] rounded p-0.5 w-fit border border-white/[0.06]">
            {availableSexes.map((sex) => (
              <button
                key={sex}
                onClick={() => handleSexChange(sex)}
                className={cn(
                  'px-4 py-1.5 text-xs font-medium rounded transition-all',
                  activeSex === sex
                    ? 'bg-[#CA8A04] text-black'
                    : 'text-zinc-500 hover:text-white'
                )}
              >
                {SEX_LABELS[sex][lang]}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Color swatches */}
      {colors.length > 1 && (
        <div>
          <p className="text-xs text-zinc-500 uppercase tracking-widest mb-2.5">{t.shop.color}</p>
          <div className="flex flex-wrap gap-2">
            {colors.map((color) => {
              const oos = isColorOOS(color)
              return (
                <button
                  key={color}
                  onClick={() => !oos && handleColorSelect(color)}
                  disabled={oos}
                  title={color}
                  className={cn(
                    'px-3 py-1.5 text-xs border rounded transition-all duration-150',
                    selectedColor === color
                      ? 'border-[#CA8A04] text-[#CA8A04] bg-[#CA8A04]/5 font-medium'
                      : 'border-white/10 text-zinc-400 hover:border-white/30 hover:text-white',
                    oos && 'opacity-25 cursor-not-allowed line-through'
                  )}
                >
                  {color}
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* Size buttons */}
      {sizes.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-2.5">
            <p className="text-xs text-zinc-500 uppercase tracking-widest">{t.shop.size}</p>
            {selectedVariant && selectedVariant.stock > 0 && selectedVariant.stock < LOW_STOCK_THRESHOLD && (
              <p className="text-xs text-amber-400 font-medium">
                {lang === 'mn'
                  ? `Зөвхөн ${selectedVariant.stock} үлдсэн!`
                  : `Only ${selectedVariant.stock} left!`}
              </p>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            {sizes.map((size) => {
              const oos = isSizeOOS(size)
              return (
                <button
                  key={size}
                  onClick={() => !oos && handleSizeSelect(size)}
                  disabled={oos}
                  className={cn(
                    'relative w-11 h-11 text-xs border rounded font-medium transition-all duration-150',
                    selectedSize === size
                      ? 'border-[#CA8A04] text-[#CA8A04] bg-[#CA8A04]/5'
                      : 'border-white/10 text-zinc-400 hover:border-white/30 hover:text-white',
                    oos && 'opacity-25 cursor-not-allowed'
                  )}
                >
                  {size}
                  {oos && (
                    <span className="absolute inset-0 flex items-center justify-center">
                      <span className="w-full h-px bg-white/20 rotate-45 absolute" />
                    </span>
                  )}
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* Stock status */}
      {selectedVariant && (
        <p className={cn(
          'text-xs font-medium tracking-wide',
          selectedVariant.stock === 0
            ? 'text-red-500'
            : selectedVariant.stock < LOW_STOCK_THRESHOLD
              ? 'text-amber-400'
              : 'text-green-400'
        )}>
          {selectedVariant.stock === 0
            ? t.shop.out_of_stock
            : selectedVariant.stock < LOW_STOCK_THRESHOLD
              ? (lang === 'mn' ? `⚠ Зөвхөн ${selectedVariant.stock} ширхэг үлдсэн` : `⚠ Only ${selectedVariant.stock} remaining`)
              : t.shop.in_stock}
        </p>
      )}
    </div>
  )
}
