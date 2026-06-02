'use client'

import Image from 'next/image'
import Link from 'next/link'
import { ShoppingBag, X, Plus, Minus, Trash2, ArrowRight } from 'lucide-react'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { useCart } from '@/lib/hooks/useCart'
import { useLangStore } from '@/lib/store/langStore'
import { formatPrice } from '@/lib/utils'
import { variantPrice } from '@/types'

export function CartDrawer() {
  const { lang, t } = useLangStore()
  const { items, totalItems, subtotal, total, couponDiscount, removeItem, updateQuantity } = useCart()

  return (
    <Sheet>
      <SheetTrigger asChild>
        <button
          aria-label="Open cart"
          className="relative p-2 text-zinc-400 hover:text-white transition-colors"
        >
          <ShoppingBag size={20} />
          {totalItems > 0 && (
            <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] bg-[#CA8A04] text-black text-[10px] font-bold rounded-full flex items-center justify-center px-1 leading-none">
              {totalItems > 99 ? '99+' : totalItems}
            </span>
          )}
        </button>
      </SheetTrigger>

      <SheetContent
        side="right"
        className="w-full sm:max-w-[420px] bg-[#0D0D0D] border-l border-white/[0.08] flex flex-col p-0 gap-0"
      >
        {/* Header */}
        <SheetHeader className="px-6 py-5 border-b border-white/[0.08] flex-row items-center justify-between">
          <SheetTitle className="font-heading text-xl text-white tracking-wide">
            {t.cart.title}
            {totalItems > 0 && (
              <span className="ml-2 text-sm text-zinc-500 font-normal font-sans">({totalItems})</span>
            )}
          </SheetTitle>
        </SheetHeader>

        {items.length === 0 ? (
          /* Empty state */
          <div className="flex-1 flex flex-col items-center justify-center gap-5 px-6 text-center">
            <div className="w-16 h-16 rounded-full bg-[#111] flex items-center justify-center">
              <ShoppingBag size={28} strokeWidth={1} className="text-zinc-600" />
            </div>
            <div>
              <p className="font-heading text-xl text-zinc-300">Сагс хоосон байна</p>
              <p className="text-sm text-zinc-600 mt-1">
                {lang === 'mn' ? 'Бүтээгдэхүүн нэмэхийн тулд дэлгүүрт орно уу' : 'Add items from the shop'}
              </p>
            </div>
            <SheetTrigger asChild>
              <Link href="/shop">
                <Button
                  variant="outline"
                  className="border-white/20 text-white hover:bg-white/5 hover:border-white/40 mt-2"
                >
                  {t.cart.continue_shopping}
                  <ArrowRight size={14} className="ml-2" />
                </Button>
              </Link>
            </SheetTrigger>
          </div>
        ) : (
          <>
            {/* Items list */}
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-5">
              {items.map((item) => {
                const product = item.variant.product
                const image = product.images?.[0]?.url
                const price = variantPrice(item.variant, product)

                return (
                  <div key={item.variant_id} className="flex gap-3 group">
                    {/* Image */}
                    <div className="w-[68px] h-[68px] rounded bg-[#111] overflow-hidden flex-shrink-0 border border-white/[0.06]">
                      {image ? (
                        <Image
                          src={image}
                          alt={lang === 'mn' ? product.name_mn : product.name_en}
                          width={68}
                          height={68}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <span className="text-[9px] text-zinc-700 font-heading">PERETIK</span>
                        </div>
                      )}
                    </div>

                    {/* Details */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white truncate leading-tight">
                        {lang === 'mn' ? product.name_mn : product.name_en}
                      </p>
                      <p className="text-xs text-zinc-500 mt-0.5">
                        {item.variant.size} · {item.variant.color}
                      </p>
                      <p className="text-sm font-semibold text-[#CA8A04] mt-1.5">
                        {formatPrice(price * item.quantity)}
                      </p>
                    </div>

                    {/* Controls */}
                    <div className="flex flex-col items-end justify-between">
                      <button
                        onClick={() => removeItem(item.variant_id)}
                        className="text-zinc-700 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
                        aria-label="Remove item"
                      >
                        <Trash2 size={13} />
                      </button>
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => updateQuantity(item.variant_id, item.quantity - 1)}
                          className="w-6 h-6 border border-white/10 rounded flex items-center justify-center text-zinc-400 hover:text-white hover:border-white/30 transition-all"
                        >
                          <Minus size={10} />
                        </button>
                        <span className="text-sm w-5 text-center tabular-nums">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.variant_id, item.quantity + 1)}
                          className="w-6 h-6 border border-white/10 rounded flex items-center justify-center text-zinc-400 hover:text-white hover:border-white/30 transition-all"
                        >
                          <Plus size={10} />
                        </button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Footer summary */}
            <div className="px-6 py-5 border-t border-white/[0.08] space-y-3 bg-black/40">
              <div className="flex justify-between text-sm text-zinc-400">
                <span>{t.cart.subtotal}</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
              {couponDiscount > 0 && (
                <div className="flex justify-between text-sm text-green-400">
                  <span>{t.cart.discount}</span>
                  <span>−{formatPrice(couponDiscount)}</span>
                </div>
              )}
              <Separator className="bg-white/[0.08]" />
              <div className="flex justify-between font-semibold text-base">
                <span className="text-white">{t.cart.total}</span>
                <span className="text-[#CA8A04]">{formatPrice(total)}</span>
              </div>
              <SheetTrigger asChild>
                <Link href="/checkout" className="block mt-2">
                  <Button className="w-full h-12 bg-[#CA8A04] hover:bg-[#D97706] text-black font-bold tracking-wide text-sm">
                    {t.cart.checkout} <ArrowRight size={14} className="ml-2" />
                  </Button>
                </Link>
              </SheetTrigger>
              <SheetTrigger asChild>
                <Link href="/cart" className="block text-center text-xs text-zinc-600 hover:text-zinc-400 transition-colors py-1">
                  {lang === 'mn' ? 'Дэлгэрэнгүй харах' : 'View full cart'}
                </Link>
              </SheetTrigger>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  )
}
