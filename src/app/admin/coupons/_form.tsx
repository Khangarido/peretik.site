'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import type { Resolver } from 'react-hook-form'

const schema = z.object({
  code: z.string().min(3),
  discount_type: z.enum(['percent', 'fixed']),
  value: z.preprocess((v) => Number(v), z.number().positive()),
  usage_limit: z.preprocess((v) => (v ? Number(v) : undefined), z.number().optional()),
  expires_at: z.string().optional(),
})
type FormData = z.infer<typeof schema>

export function CouponForm() {
  const [saving, setSaving] = useState(false)
  const router = useRouter()

  const { register, handleSubmit, setValue, watch, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema) as Resolver<FormData>,
    defaultValues: { discount_type: 'percent' },
  })

  const onSubmit = async (data: FormData) => {
    setSaving(true)
    const supabase = createClient()
    const { error } = await supabase.from('coupons').insert({
      ...data,
      code: data.code.toUpperCase(),
      used_count: 0,
    })
    if (error) {
      toast.error(error.message)
    } else {
      toast.success('Купон нэмэгдлээ')
      reset()
      router.refresh()
    }
    setSaving(false)
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="p-5 bg-[#0D0D0D] rounded border border-white/[0.06] space-y-4">
      <h3 className="font-heading text-base font-semibold text-zinc-300 uppercase tracking-widest">
        Шинэ купон
      </h3>

      <div>
        <Label className="text-xs text-zinc-500 uppercase tracking-widest">Код</Label>
        <Input
          {...register('code')}
          placeholder="SAVE20"
          className="mt-1.5 bg-black border-white/10 text-white font-mono uppercase focus:border-[#CA8A04]/50"
        />
        {errors.code && <p className="text-xs text-red-400 mt-1">{errors.code.message}</p>}
      </div>

      <div>
        <Label className="text-xs text-zinc-500 uppercase tracking-widest">Төрөл</Label>
        <Select
          defaultValue="percent"
          onValueChange={(v) => setValue('discount_type', v as 'percent' | 'fixed')}
        >
          <SelectTrigger className="mt-1.5 bg-black border-white/10 text-white">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-[#111] border-white/10 text-white">
            <SelectItem value="percent">Хувиар (%)</SelectItem>
            <SelectItem value="fixed">Тогтмол (₮)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label className="text-xs text-zinc-500 uppercase tracking-widest">
          Утга ({watch('discount_type') === 'percent' ? '%' : '₮'})
        </Label>
        <Input
          {...register('value')}
          type="number"
          className="mt-1.5 bg-black border-white/10 text-white focus:border-[#CA8A04]/50"
        />
      </div>

      <div>
        <Label className="text-xs text-zinc-500 uppercase tracking-widest">Хэрэглэх хязгаар</Label>
        <Input
          {...register('usage_limit')}
          type="number"
          placeholder="Хязгааргүй"
          className="mt-1.5 bg-black border-white/10 text-white focus:border-[#CA8A04]/50"
        />
      </div>

      <div>
        <Label className="text-xs text-zinc-500 uppercase tracking-widest">Дуусах огноо</Label>
        <Input
          {...register('expires_at')}
          type="datetime-local"
          className="mt-1.5 bg-black border-white/10 text-white focus:border-[#CA8A04]/50"
        />
      </div>

      <Button
        type="submit"
        disabled={saving}
        className="w-full bg-[#CA8A04] hover:bg-[#D97706] text-black font-semibold disabled:opacity-50"
      >
        {saving ? '...' : 'Нэмэх'}
      </Button>
    </form>
  )
}
