'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Trash2, Plus, Minus, Tag, ArrowRight, ShoppingBag, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { useCart } from '@/lib/hooks/useCart'
import { useLangStore } from '@/lib/store/langStore'
import { formatPrice } from '@/lib/utils'
import { variantPrice } from '@/types'
import { toast } from 'sonner'

export default function CartPage() {
  const { lang } = useLangStore()
  const {
    items, subtotal, total, couponCode, couponDiscount,
    updateQuantity, removeItem, setCoupon, removeCoupon,
  } = useCart()

  const [couponInput, setCouponInput] = useState('')
  const [applying, setApplying] = useState(false)
  const [couponError, setCouponError] = useState('')

  const hasOOS = items.some((item) => item.variant.stock === 0)

  const applyCoupon = async () => {
    if (!couponInput.trim()) return
    setApplying(true)
    setCouponError('')
    try {
      const res = await fetch('/api/coupons/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: couponInput.trim(), subtotal }),
      })
      const data = await res.json()
      if (data.valid) {
        setCoupon(data.code, data.discount_amount)
        toast.success(
          lang === 'mn'
            ? `Купон хэрэглэгдлээ: −${formatPrice(data.discount_amount)}`
            : `Coupon applied: −${formatPrice(data.discount_amount)}`
        )
        setCouponInput('')
      } else {
        setCouponError(data.error ?? (lang === 'mn' ? 'Буруу купон' : 'Invalid coupon'))
      }
    } catch {
      setCouponError(lang === 'mn' ? 'Алдаа гарлаа' : 'Something went wrong')
    }
    setApplying(false)
  }

  // Empty state
  if (items.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-6 py-24 px-4 text-center">
        <div className="w-20 h-20 rounded-full bg-[#0D0D0D] border border-white/[0.06] flex items-center justify-center">
          <ShoppingBag size={32} strokeWidth={1} className="text-zinc-600" />
        </div>
        <div>
          <p className="font-heading text-3xl text-white mb-2">Таны сагс хоосон байна</p>
          <p className="text-sm text-zinc-500">Бүтээгдэхүүн нэмэхийн тулд дэлгүүр рүү очно уу</p>
        </div>
        <Link href="/shop">
          <Button className="h-11 bg-[#CA8A04] hover:bg-[#D97706] text-black font-bold px-8 tracking-wide">
            Дэлгүүр рүү буцах <ArrowRight size={14} className="ml-2" />
          </Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="flex-1 max-w-6xl mx-auto px-4 sm:px-6 py-12">
      <h1 className="font-heading text-4xl font-bold text-white mb-10">
        {lang === 'mn' ? 'Таны сагс' : 'Your Cart'}
        <span className="ml-3 text-xl text-zinc-500 font-sans font-normal">({items.length})</span>
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* ── ITEMS LIST ──────────────────────────────────────────────────── */}
        <div className="lg:col-span-2 space-y-3">
          {items.map((item) => {
            const product = item.variant.product
            const image = product.images?.[0]?.url
            const price = variantPrice(item.variant, product)
            const isOOS = item.variant.stock === 0

            return (
              <div
                key={item.variant_id}
                className={`flex gap-4 p-4 bg-[#0D0D0D] rounded border transition-colors ${isOOS ? 'border-red-500/20' : 'border-white/[0.06]'}`}
              >
                {/* Image */}
                <Link href={`/shop/${product.slug}`} className="flex-shrink-0">
                  <div className="w-20 h-20 bg-[#111] rounded overflow-hidden border border-white/[0.05]">
                    {image ? (
                      <Image
                        src={image}
                        alt={lang === 'mn' ? product.name_mn : product.name_en}
                        width={80}
                        height={80}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <span className="text-[9px] text-zinc-700 font-heading">PERETIK</span>
                      </div>
                    )}
                  </div>
                </Link>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <Link
                    href={`/shop/${product.slug}`}
                    className="font-medium text-white hover:text-[#CA8A04] transition-colors text-sm leading-tight block truncate"
                  >
                    {lang === 'mn' ? product.name_mn : product.name_en}
                  </Link>
                  <p className="text-xs text-zinc-500 mt-1">
                    {item.variant.size} · {item.variant.color} · {item.variant.sex}
                  </p>
                  {isOOS && (
                    <span className="inline-block mt-1 text-[10px] bg-red-500/10 border border-red-500/20 text-red-400 px-2 py-0.5 rounded-full">
                      {lang === 'mn' ? 'Нөөц дууссан' : 'Out of stock'}
                    </span>
                  )}
                  <p className="text-sm font-bold text-[#CA8A04] mt-2">{formatPrice(price)}</p>
                </div>

                {/* Controls */}
                <div className="flex flex-col items-end justify-between gap-2">
                  <button
                    onClick={() => removeItem(item.variant_id)}
                    className="text-zinc-600 hover:text-red-400 transition-colors"
                    aria-label="Remove"
                  >
                    <Trash2 size={14} />
                  </button>
                  <div className="flex items-center gap-1 border border-white/10 rounded">
                    <button
                      onClick={() => updateQuantity(item.variant_id, item.quantity - 1)}
                      className="w-7 h-7 flex items-center justify-center text-zinc-500 hover:text-white transition-colors"
                    >
                      <Minus size={10} />
                    </button>
                    <span className="w-7 text-center text-sm tabular-nums">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.variant_id, item.quantity + 1)}
                      disabled={item.quantity >= item.variant.stock}
                      className="w-7 h-7 flex items-center justify-center text-zinc-500 hover:text-white transition-colors disabled:opacity-30"
                    >
                      <Plus size={10} />
                    </button>
                  </div>
                  <p className="text-xs text-zinc-600">{formatPrice(price * item.quantity)}</p>
                </div>
              </div>
            )
          })}

          <Link
            href="/shop"
            className="flex items-center gap-1.5 text-xs text-zinc-600 hover:text-zinc-300 transition-colors mt-2"
          >
            ← {lang === 'mn' ? 'Дэлгүүрлэлт үргэлжлүүлэх' : 'Continue Shopping'}
          </Link>
        </div>

        {/* ── ORDER SUMMARY ────────────────────────────────────────────────── */}
        <div className="lg:sticky lg:top-24 h-fit">
          <div className="bg-[#0D0D0D] rounded border border-white/[0.06] p-5 space-y-4">
            <h2 className="font-heading text-lg font-semibold text-white">
              {lang === 'mn' ? 'Захиалгын дүн' : 'Order Summary'}
            </h2>

            {/* Coupon input */}
            <div>
              <p className="flex items-center gap-1.5 text-[10px] text-zinc-500 uppercase tracking-widest mb-2">
                <Tag size={10} />
                {lang === 'mn' ? 'Купон' : 'Coupon'}
              </p>
              {couponCode ? (
                <div className="flex items-center justify-between bg-[#CA8A04]/5 border border-[#CA8A04]/20 rounded px-3 py-2">
                  <span className="text-sm font-mono text-[#CA8A04] font-semibold">{couponCode}</span>
                  <button
                    onClick={() => { removeCoupon(); setCouponError('') }}
                    className="text-zinc-500 hover:text-red-400 transition-colors"
                  >
                    <X size={13} />
                  </button>
                </div>
              ) : (
                <div className="space-y-1.5">
                  <div className="flex gap-2">
                    <Input
                      value={couponInput}
                      onChange={(e) => { setCouponInput(e.target.value.toUpperCase()); setCouponError('') }}
                      onKeyDown={(e) => e.key === 'Enter' && applyCoupon()}
                      placeholder="КУПОН КОД"
                      className="bg-black border-white/10 text-white text-xs font-mono h-9 uppercase placeholder:text-zinc-700 focus:border-[#CA8A04]/40"
                    />
                    <Button
                      onClick={applyCoupon}
                      disabled={applying || !couponInput}
                      size="sm"
                      variant="outline"
                      className="border-white/10 text-white text-xs h-9 hover:bg-white/5 flex-shrink-0 px-3"
                    >
                      {applying ? '...' : (lang === 'mn' ? 'Хэрэглэх' : 'Apply')}
                    </Button>
                  </div>
                  {couponError && (
                    <p className="text-xs text-red-400">{couponError}</p>
                  )}
                </div>
              )}
            </div>

            <Separator className="bg-white/[0.07]" />

            {/* Totals */}
            <div className="space-y-2.5 text-sm">
              <div className="flex justify-between text-zinc-400">
                <span>{lang === 'mn' ? 'Нийт дүн' : 'Subtotal'}</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
              {couponDiscount > 0 && (
                <div className="flex justify-between text-green-400 font-medium">
                  <span className="flex items-center gap-1">
                    <Tag size={11} />
                    {lang === 'mn' ? 'Хөнгөлөлт' : 'Discount'}
                  </span>
                  <span>−{formatPrice(couponDiscount)}</span>
                </div>
              )}
            </div>

            <Separator className="bg-white/[0.07]" />

            <div className="flex justify-between items-baseline">
              <span className="font-semibold text-white">{lang === 'mn' ? 'Төлөх дүн' : 'Total'}</span>
              <span className="font-heading text-2xl font-bold text-[#CA8A04]">{formatPrice(total)}</span>
            </div>

            {hasOOS && (
              <p className="text-xs text-red-400 bg-red-500/5 border border-red-500/10 rounded px-3 py-2">
                {lang === 'mn'
                  ? 'Нөөцгүй бүтээгдэхүүн байна. Захиалга хийхийн өмнө устгана уу.'
                  : 'Some items are out of stock. Please remove them before checkout.'}
              </p>
            )}

            <Link href="/checkout" className="block">
              <Button
                disabled={hasOOS}
                className="w-full h-12 bg-[#CA8A04] hover:bg-[#D97706] text-black font-bold tracking-wide text-sm disabled:opacity-40 disabled:cursor-not-allowed"
              >
                ТӨЛБӨР ХИЙХ <ArrowRight size={14} className="ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
