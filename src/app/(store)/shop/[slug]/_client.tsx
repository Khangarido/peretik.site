'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ShoppingBag, Zap, Heart, Share2, ChevronDown, ChevronUp, Check } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { VariantSelector } from '@/components/product/VariantSelector'
import { CountdownTimer } from '@/components/ui/CountdownTimer'
import { PBadge } from '@/components/ui/PBadge'
import { useCartStore } from '@/lib/store/cartStore'
import { useWishlistStore } from '@/lib/store/wishlistStore'
import { useLangStore } from '@/lib/store/langStore'
import { useProductAnalytics } from '@/hooks/useAnalytics'
import { formatPrice, cn } from '@/lib/utils'
import type { Product, ProductImage, Variant, Category } from '@/types'

interface Props {
  product: Product & { images: ProductImage[]; variants: Variant[]; category?: Category }
  variants: Variant[]
  userId?: string
}

export function ProductDetailClient({ product, variants, userId }: Props) {
  const { lang, t } = useLangStore()
  const router = useRouter()
  const addItem = useCartStore((s) => s.addItem)
  const openCart = useCartStore((s) => s.openCart)
  const { isWishlisted, toggle } = useWishlistStore()

  // Analytics tracking — fires on mount/unmount/visibility change
  useProductAnalytics({ productId: product.id })

  const wishlisted = isWishlisted(product.id)

  const [selectedVariant, setSelectedVariant] = useState<Variant | null>(
    variants.find((v) => v.stock > 0) ?? variants[0] ?? null
  )
  const [qty, setQty] = useState(1)
  const [activeImage, setActiveImage] = useState(0)
  const [descOpen, setDescOpen] = useState(false)
  const [copied, setCopied] = useState(false)
  const [shareUrl, setShareUrl] = useState('')

  const images = product.images ?? []
  const name = lang === 'mn' ? product.name_mn : product.name_en
  const description = lang === 'mn' ? product.description_mn : product.description_en
  const hasPresale = product.is_presale && product.presale_price != null
  const price = hasPresale ? product.presale_price! : product.price
  const maxQty = selectedVariant?.stock ?? 0

  const handleVariantSelect = (v: Variant) => {
    setSelectedVariant(v)
    setQty(1)
  }

  const buildCartVariant = () => ({
    ...selectedVariant!,
    product: { ...product, images: product.images ?? [] },
  })

  const handleAddToCart = () => {
    if (!selectedVariant) {
      toast.error(lang === 'mn' ? 'Хэмжээ сонгоно уу' : 'Please select a size')
      return
    }
    addItem(buildCartVariant(), qty)
    openCart()
    toast.success(lang === 'mn' ? 'Сагсанд нэмэгдлээ' : 'Added to cart', { description: name })
  }

  const handleBuyNow = () => {
    if (!selectedVariant) {
      toast.error(lang === 'mn' ? 'Хэмжээ сонгоно уу' : 'Please select a size')
      return
    }
    addItem(buildCartVariant(), qty)
    router.push('/checkout')
  }

  const handleWishlist = async () => {
    if (!userId) {
      toast.error(lang === 'mn' ? 'Нэвтэрнэ үү' : 'Please log in')
      return
    }
    await toggle(product.id, userId)
    toast.success(wishlisted
      ? (lang === 'mn' ? 'Хүслийн жагсаалтаас хасагдлаа' : 'Removed from wishlist')
      : (lang === 'mn' ? 'Хүслийн жагсаалтад нэмэгдлээ' : 'Added to wishlist')
    )
  }

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setShareUrl(window.location.href)
    }
  }, [])

  const handleShare = async () => {
    try {
      if (navigator.share && shareUrl) {
        await navigator.share({ title: name, url: shareUrl })
      } else if (shareUrl) {
        await navigator.clipboard.writeText(shareUrl)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      }
    } catch { /* user cancelled */ }
  }

  return (
    <div className="space-y-6">
      {/* Image gallery — rendered inside client component */}
      <div className="space-y-3 lg:hidden">
        {images.length > 0 && (
          <>
            <div className="relative aspect-[3/4] rounded overflow-hidden bg-[#0D0D0D] border border-white/[0.05]">
              <Image
                src={images[activeImage].url}
                alt={name}
                fill
                className="object-cover"
                priority
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
              <div className="absolute top-3 left-3 flex flex-col gap-1.5">
                {hasPresale && <PBadge variant="presale" />}
                {product.is_featured && !hasPresale && <PBadge variant="featured" />}
              </div>
            </div>
            {images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-1">
                {images.map((img, i) => (
                  <button
                    key={img.id}
                    onClick={() => setActiveImage(i)}
                    className={cn(
                      'relative w-16 h-16 flex-shrink-0 rounded overflow-hidden border transition-all',
                      i === activeImage ? 'border-[#CA8A04]' : 'border-white/10 hover:border-white/30'
                    )}
                  >
                    <Image src={img.url} alt="" fill className="object-cover" sizes="64px" />
                  </button>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* Desktop image gallery */}
      <div className="hidden lg:block space-y-3">
        {images.length > 0 && (
          <>
            <div className="relative aspect-[3/4] rounded overflow-hidden bg-[#0D0D0D] border border-white/[0.05]">
              <Image
                src={images[activeImage].url}
                alt={name}
                fill
                className="object-cover"
                priority
                sizes="50vw"
              />
              <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
                {hasPresale && <PBadge variant="presale" />}
                {product.is_featured && !hasPresale && <PBadge variant="featured" />}
              </div>
            </div>
            {images.length > 1 && (
              <div className="flex gap-2">
                {images.map((img, i) => (
                  <button
                    key={img.id}
                    onClick={() => setActiveImage(i)}
                    className={cn(
                      'relative w-16 h-16 flex-shrink-0 rounded overflow-hidden border transition-all',
                      i === activeImage ? 'border-[#CA8A04]' : 'border-white/10 hover:border-white/30'
                    )}
                  >
                    <Image src={img.url} alt="" fill className="object-cover" sizes="64px" />
                  </button>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* ── RIGHT PANEL ── */}
      <div className="space-y-5 lg:pt-1">
        {/* Category */}
        {product.category && (
          <Link
            href={`/shop?category=${product.category_id}`}
            className="text-xs text-zinc-500 tracking-widest uppercase hover:text-[#CA8A04] transition-colors"
          >
            {lang === 'mn' ? product.category.name_mn : product.category.name_en}
          </Link>
        )}

        {/* Name */}
        <h1 className="font-heading text-3xl sm:text-4xl font-bold text-white leading-tight">
          {name}
        </h1>

        {/* Price */}
        <div className="flex items-baseline gap-3">
          <span className={cn('text-3xl font-bold', hasPresale ? 'text-[#CA8A04]' : 'text-white')}>
            {formatPrice(price)}
          </span>
          {hasPresale && (
            <span className="text-lg text-zinc-600 line-through">{formatPrice(product.price)}</span>
          )}
        </div>

        {/* Presale countdown */}
        {hasPresale && product.presale_end_at && (
          <div>
            <p className="text-[10px] text-zinc-600 uppercase tracking-widest mb-2">Дуусах хүртэл</p>
            <CountdownTimer endsAt={product.presale_end_at} lang={lang} />
          </div>
        )}

        {/* Short description */}
        {description && (
          <p className="text-sm text-zinc-400 leading-relaxed line-clamp-3">{description}</p>
        )}

        {/* Variant selector */}
        {variants.length > 0 && (
          <VariantSelector
            variants={variants}
            selectedVariantId={selectedVariant?.id ?? null}
            onSelect={handleVariantSelect}
          />
        )}

        {/* Qty selector */}
        {selectedVariant && selectedVariant.stock > 0 && (
          <div>
            <p className="text-[10px] font-bold tracking-[0.3em] uppercase text-zinc-500 mb-2.5">
              {lang === 'mn' ? 'Тоо' : 'Quantity'}
            </p>
            <div className="flex items-center gap-0 border border-white/10 rounded w-fit">
              <button
                onClick={() => setQty((q) => Math.max(1, q - 1))}
                className="w-9 h-9 flex items-center justify-center text-zinc-400 hover:text-white hover:bg-white/5 transition-all rounded-l"
              >
                −
              </button>
              <span className="w-10 text-center text-sm tabular-nums">{qty}</span>
              <button
                onClick={() => setQty((q) => Math.min(maxQty, q + 1))}
                disabled={qty >= maxQty}
                className="w-9 h-9 flex items-center justify-center text-zinc-400 hover:text-white hover:bg-white/5 transition-all rounded-r disabled:opacity-30"
              >
                +
              </button>
            </div>
          </div>
        )}

        {/* CTA buttons */}
        <div className="flex flex-col sm:flex-row gap-3 pt-1">
          <Button
            variant="outline"
            onClick={handleAddToCart}
            disabled={!selectedVariant || selectedVariant.stock === 0}
            className="flex-1 h-12 border-[#CA8A04]/50 text-[#CA8A04] hover:bg-[#CA8A04]/5 hover:border-[#CA8A04] disabled:opacity-30 tracking-wide font-semibold"
          >
            <ShoppingBag size={16} className="mr-2" />
            САГСАНД НЭМЭХ
          </Button>
          <Button
            onClick={handleBuyNow}
            disabled={!selectedVariant || selectedVariant.stock === 0}
            className="flex-1 h-12 bg-[#CA8A04] hover:bg-[#D97706] text-black font-bold disabled:opacity-30 tracking-wide"
          >
            <Zap size={15} className="mr-2" />
            ШУУД ЗАХИАЛАХ
          </Button>
        </div>

        {/* Wishlist + Share row */}
        <div className="flex items-center gap-4 pt-1">
          <button
            onClick={handleWishlist}
            className={cn(
              'flex items-center gap-2 text-sm transition-colors',
              wishlisted ? 'text-[#CA8A04]' : 'text-zinc-500 hover:text-white'
            )}
          >
            <Heart size={15} className={wishlisted ? 'fill-[#CA8A04]' : ''} />
            {wishlisted
              ? (lang === 'mn' ? 'Хадгалагдсан' : 'Saved')
              : (lang === 'mn' ? 'Хадгалах' : 'Save')}
          </button>
          <button
            onClick={handleShare}
            className="flex items-center gap-2 text-sm text-zinc-500 hover:text-white transition-colors"
          >
            {copied ? <Check size={15} className="text-green-400" /> : <Share2 size={15} />}
            {copied
              ? (lang === 'mn' ? 'Хуулагдлаа!' : 'Copied!')
              : (lang === 'mn' ? 'Хуваалцах' : 'Share')}
          </button>
        </div>

        {/* SKU */}
        {selectedVariant?.sku && (
          <p className="text-xs text-zinc-700 font-mono">SKU: {selectedVariant.sku}</p>
        )}

        {/* Description accordion */}
        {description && (
          <div className="border-t border-white/[0.06] pt-4">
            <button
              onClick={() => setDescOpen((o) => !o)}
              className="flex items-center justify-between w-full text-sm text-zinc-300 hover:text-white transition-colors font-medium"
            >
              <span>{lang === 'mn' ? 'Дэлгэрэнгүй мэдээлэл' : 'Description'}</span>
              {descOpen ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
            </button>
            {descOpen && (
              <p className="mt-3 text-sm text-zinc-500 leading-relaxed">{description}</p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
