'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Loader2, Check, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { useCart } from '@/lib/hooks/useCart'
import { useAuth } from '@/lib/hooks/useAuth'
import { useLangStore } from '@/lib/store/langStore'
import { formatPrice } from '@/lib/utils'
import { variantPrice } from '@/types'
import { toast } from 'sonner'

const shippingSchema = z.object({
  full_name: z.string().min(2, 'Нэр оруулна уу'),
  phone: z.string().min(8, 'Утасны дугаар оруулна уу'),
  city: z.string().min(1, 'Хот оруулна уу'),
  district: z.string().min(1, 'Дүүрэг оруулна уу'),
  address: z.string().min(5, 'Хаяг оруулна уу'),
  zip: z.string().optional(),
})
type ShippingData = z.infer<typeof shippingSchema>

const STEPS = ['Хүргэлтийн мэдээлэл', 'Захиалга шалгах', 'Төлбөр']

export default function CheckoutPage() {
  const { lang } = useLangStore()
  const { user, profile } = useAuth()
  const { items, subtotal, total, couponCode, couponDiscount, clearCart } = useCart()
  const router = useRouter()
  const [step, setStep] = useState(0)
  const [shipping, setShipping] = useState<ShippingData | null>(null)
  const [paying, setPaying] = useState(false)

  const { register, handleSubmit, formState: { errors } } = useForm<ShippingData>({
    resolver: zodResolver(shippingSchema) as import('react-hook-form').Resolver<ShippingData>,
    defaultValues: {
      full_name: profile?.full_name ?? '',
      phone: profile?.phone ?? '',
      city: 'Улаанбаатар',
      district: '',
      address: '',
      zip: '',
    },
  })

  useEffect(() => {
    if (items.length === 0 && step === 0) router.replace('/cart')
  }, [items.length, step, router])

  if (!user) {
    router.replace('/login?redirectTo=/checkout')
    return null
  }

  const onShippingSubmit = (data: ShippingData) => {
    setShipping(data)
    setStep(1)
  }

  const onPayment = async () => {
    if (!shipping) return
    setPaying(true)
    setStep(2)

    try {
      const payload = {
        items: items.map((item) => ({
          variant_id: item.variant_id,
          quantity: item.quantity,
          price: variantPrice(item.variant, item.variant.product),
          product_name: item.variant.product.name_mn,
          variant_info: `${item.variant.size} / ${item.variant.color}`,
        })),
        shipping,
        coupon_id: couponCode || null,
        total,
      }

      const res = await fetch('/api/payments/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const data = await res.json()

      if (!res.ok || data.error) {
        toast.error(data.error ?? 'Алдаа гарлаа')
        setPaying(false)
        setStep(1)
        return
      }

      clearCart()
      // Redirect to BYL payment
      if (typeof window !== 'undefined') {
        window.location.href = data.payment_url
      }
    } catch (err) {
      toast.error('Алдаа гарлаа')
      setPaying(false)
      setStep(1)
    }
  }

  return (
    <div className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 py-12">
      {/* Progress bar */}
      <div className="mb-10">
        <div className="flex items-center gap-2 mb-6">
          {STEPS.map((s, i) => (
            <div key={i} className="flex items-center gap-2 flex-1">
              <div className={`flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold flex-shrink-0 transition-all ${
                i < step ? 'bg-[#CA8A04] text-black' :
                i === step ? 'bg-[#CA8A04]/20 text-[#CA8A04] border border-[#CA8A04]/40' :
                'bg-[#111] text-zinc-600 border border-white/[0.06]'
              }`}>
                {i < step ? <Check size={13} /> : i + 1}
              </div>
              <span className={`text-xs tracking-wide hidden sm:block ${i === step ? 'text-white' : 'text-zinc-600'}`}>
                {s}
              </span>
              {i < STEPS.length - 1 && (
                <div className={`flex-1 h-px ${i < step ? 'bg-[#CA8A04]/40' : 'bg-white/[0.06]'}`} />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* ── STEP 0: SHIPPING ─────────────────────────────────────────────────── */}
      {step === 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          <form onSubmit={handleSubmit(onShippingSubmit)} className="lg:col-span-3 space-y-5">
            <h2 className="font-heading text-2xl text-white font-bold">Хүргэлтийн мэдээлэл</h2>

            <div className="p-6 bg-[#0D0D0D] rounded border border-white/[0.06] space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-[10px] text-zinc-500 uppercase tracking-widest">Нэр</Label>
                  <Input {...register('full_name')} className="mt-1.5 bg-black border-white/10 text-white focus:border-[#CA8A04]/40" />
                  {errors.full_name && <p className="text-xs text-red-400 mt-1">{errors.full_name.message}</p>}
                </div>
                <div>
                  <Label className="text-[10px] text-zinc-500 uppercase tracking-widest">Утас</Label>
                  <Input {...register('phone')} type="tel" className="mt-1.5 bg-black border-white/10 text-white focus:border-[#CA8A04]/40" />
                  {errors.phone && <p className="text-xs text-red-400 mt-1">{errors.phone.message}</p>}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-[10px] text-zinc-500 uppercase tracking-widest">Хот</Label>
                  <Input {...register('city')} className="mt-1.5 bg-black border-white/10 text-white focus:border-[#CA8A04]/40" />
                  {errors.city && <p className="text-xs text-red-400 mt-1">{errors.city.message}</p>}
                </div>
                <div>
                  <Label className="text-[10px] text-zinc-500 uppercase tracking-widest">Дүүрэг</Label>
                  <Input {...register('district')} className="mt-1.5 bg-black border-white/10 text-white focus:border-[#CA8A04]/40" />
                  {errors.district && <p className="text-xs text-red-400 mt-1">{errors.district.message}</p>}
                </div>
              </div>
              <div>
                <Label className="text-[10px] text-zinc-500 uppercase tracking-widest">Хаяг</Label>
                <Input {...register('address')} className="mt-1.5 bg-black border-white/10 text-white focus:border-[#CA8A04]/40" />
                {errors.address && <p className="text-xs text-red-400 mt-1">{errors.address.message}</p>}
              </div>
              <div>
                <Label className="text-[10px] text-zinc-500 uppercase tracking-widest">Шуудангийн индекс (заавал биш)</Label>
                <Input {...register('zip')} className="mt-1.5 bg-black border-white/10 text-white focus:border-[#CA8A04]/40" />
              </div>
            </div>

            <Button type="submit" className="w-full h-12 bg-[#CA8A04] hover:bg-[#D97706] text-black font-bold tracking-wide">
              Үргэлжлүүлэх <ChevronRight size={15} className="ml-1" />
            </Button>
          </form>

          {/* Mini order summary */}
          <div className="lg:col-span-2">
            <div className="p-5 bg-[#0D0D0D] rounded border border-white/[0.06] space-y-3 sticky top-24">
              <h3 className="font-heading text-base text-white">Захиалгын дүн</h3>
              <Separator className="bg-white/[0.06]" />
              {items.map((item) => (
                <div key={item.variant_id} className="flex justify-between text-sm">
                  <span className="text-zinc-400 truncate max-w-[180px]">
                    {item.variant.product.name_mn} ×{item.quantity}
                  </span>
                  <span className="text-white ml-2">{formatPrice(variantPrice(item.variant, item.variant.product) * item.quantity)}</span>
                </div>
              ))}
              <Separator className="bg-white/[0.06]" />
              <div className="flex justify-between font-bold">
                <span className="text-zinc-300">Нийт</span>
                <span className="text-[#CA8A04]">{formatPrice(total)}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── STEP 1: REVIEW ───────────────────────────────────────────────────── */}
      {step === 1 && shipping && (
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          <div className="lg:col-span-3 space-y-5">
            <h2 className="font-heading text-2xl text-white font-bold">Захиалга шалгах</h2>

            {/* Items */}
            <div className="p-5 bg-[#0D0D0D] rounded border border-white/[0.06] space-y-4">
              <h3 className="text-xs text-zinc-500 uppercase tracking-widest">Бараанууд</h3>
              {items.map((item) => {
                const p = item.variant.product
                const img = p.images?.[0]?.url
                const price = variantPrice(item.variant, p)
                return (
                  <div key={item.variant_id} className="flex gap-3 items-center">
                    <div className="w-12 h-12 bg-[#111] rounded overflow-hidden flex-shrink-0">
                      {img && <Image src={img} alt={p.name_mn} width={48} height={48} className="w-full h-full object-cover" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-white truncate">{p.name_mn}</p>
                      <p className="text-xs text-zinc-500">{item.variant.size} · {item.variant.color}</p>
                    </div>
                    <p className="text-sm font-medium text-[#CA8A04]">{formatPrice(price * item.quantity)}</p>
                  </div>
                )
              })}
            </div>

            {/* Shipping address */}
            <div className="p-5 bg-[#0D0D0D] rounded border border-white/[0.06]">
              <h3 className="text-xs text-zinc-500 uppercase tracking-widest mb-3">Хүргэлтийн хаяг</h3>
              <p className="text-sm text-white font-medium">{shipping.full_name}</p>
              <p className="text-sm text-zinc-400">{shipping.phone}</p>
              <p className="text-sm text-zinc-400">{shipping.city}, {shipping.district}</p>
              <p className="text-sm text-zinc-400">{shipping.address}</p>
              <button onClick={() => setStep(0)} className="text-xs text-[#CA8A04] hover:underline mt-2">Засах</button>
            </div>

            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setStep(0)} className="border-white/10 text-zinc-300 hover:text-white">
                ← Буцах
              </Button>
              <Button onClick={onPayment} className="flex-1 h-12 bg-[#CA8A04] hover:bg-[#D97706] text-black font-bold tracking-wide">
                Төлбөр хийх
              </Button>
            </div>
          </div>

          {/* Summary */}
          <div className="lg:col-span-2">
            <div className="p-5 bg-[#0D0D0D] rounded border border-white/[0.06] space-y-3 sticky top-24">
              <h3 className="font-heading text-base text-white">Дүн</h3>
              <Separator className="bg-white/[0.06]" />
              <div className="flex justify-between text-sm text-zinc-400">
                <span>Дэд нийт</span><span>{formatPrice(subtotal)}</span>
              </div>
              {couponDiscount > 0 && (
                <div className="flex justify-between text-sm text-green-400">
                  <span>Хөнгөлөлт ({couponCode})</span><span>−{formatPrice(couponDiscount)}</span>
                </div>
              )}
              <Separator className="bg-white/[0.06]" />
              <div className="flex justify-between font-bold text-base">
                <span className="text-white">Нийт төлөх</span>
                <span className="text-[#CA8A04]">{formatPrice(total)}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── STEP 2: PAYMENT REDIRECT ─────────────────────────────────────────── */}
      {step === 2 && (
        <div className="flex flex-col items-center justify-center py-20 gap-6">
          <Loader2 size={40} className="animate-spin text-[#CA8A04]" />
          <div className="text-center">
            <p className="font-heading text-2xl text-white mb-2">Төлбөрийн хуудас руу шилжиж байна...</p>
            <p className="text-sm text-zinc-500">byl.mn-р дамжуулан төлбөр хийж байна</p>
          </div>
        </div>
      )}
    </div>
  )
}
