'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Copy, Trash2, RefreshCw, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { createClient } from '@/lib/supabase/client'
import { formatDate, cn } from '@/lib/utils'
import { toast } from 'sonner'
import type { Coupon } from '@/types'

function randomCode() {
  return Math.random().toString(36).substring(2, 10).toUpperCase()
}

interface Props {
  coupons: (Coupon & { used_count: number })[]
}

export function CouponsClient({ coupons: initialCoupons }: Props) {
  const router = useRouter()
  const [, startTransition] = useTransition()

  // Form state
  const [code, setCode] = useState(randomCode())
  const [type, setType] = useState<'percent' | 'fixed'>('percent')
  const [value, setValue] = useState('')
  const [expiresAt, setExpiresAt] = useState('')
  const [usageLimit, setUsageLimit] = useState('')
  const [creating, setCreating] = useState(false)

  // Table state
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [copiedId, setCopiedId] = useState<string | null>(null)

  const createCoupon = async () => {
    if (!code.trim() || !value) {
      toast.error('Код болон утга оруулна уу')
      return
    }
    setCreating(true)
    const supabase = createClient()
    const { error } = await supabase.from('coupons').insert({
      code: code.trim().toUpperCase(),
      discount_type: type,
      value: Number(value),
      expires_at: expiresAt || null,
      usage_limit: usageLimit ? Number(usageLimit) : null,
      is_active: true,
      used_count: 0,
    })
    if (error) {
      toast.error(error.message)
    } else {
      toast.success('Купон үүслээ')
      setCode(randomCode())
      setValue('')
      setExpiresAt('')
      setUsageLimit('')
      startTransition(() => router.refresh())
    }
    setCreating(false)
  }

  const toggleActive = async (id: string, current: boolean) => {
    const supabase = createClient()
    await supabase.from('coupons').update({ is_active: !current }).eq('id', id)
    startTransition(() => router.refresh())
  }

  const deleteCoupon = async (id: string) => {
    const supabase = createClient()
    await supabase.from('coupons').delete().eq('id', id)
    toast.success('Купон устгагдлаа')
    setDeleteId(null)
    startTransition(() => router.refresh())
  }

  const copy = (text: string, id: string) => {
    navigator.clipboard.writeText(text)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  const isExpired = (expires: string | null) =>
    !!expires && new Date(expires) < new Date()

  return (
    <div className="space-y-6">
      {/* Create form */}
      <div className="p-6 bg-[#0D0D0D] rounded border border-white/[0.06] space-y-5">
        <h2 className="text-[10px] text-zinc-600 uppercase tracking-[0.3em]">Шинэ купон үүсгэх</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Code */}
          <div>
            <Label className="text-[10px] text-zinc-500 uppercase tracking-widest">Код</Label>
            <div className="flex gap-1.5 mt-1.5">
              <Input
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                className="flex-1 bg-black border-white/10 text-white font-mono text-sm focus:border-[#CA8A04]/40"
              />
              <button
                type="button"
                onClick={() => setCode(randomCode())}
                className="p-2 text-zinc-600 hover:text-white bg-[#111] border border-white/10 rounded transition-colors"
                title="Санамсаргүй код"
              >
                <RefreshCw size={13} />
              </button>
            </div>
          </div>

          {/* Type */}
          <div>
            <Label className="text-[10px] text-zinc-500 uppercase tracking-widest">Хэлбэр</Label>
            <div className="flex gap-2 mt-1.5">
              {(['percent', 'fixed'] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setType(t)}
                  className={cn(
                    'flex-1 py-2 text-xs border rounded transition-all',
                    type === t
                      ? 'border-[#CA8A04] text-[#CA8A04] bg-[#CA8A04]/5 font-medium'
                      : 'border-white/10 text-zinc-500 hover:text-white hover:border-white/20'
                  )}
                >
                  {t === 'percent' ? '% Хувь' : '₮ Тогтмол'}
                </button>
              ))}
            </div>
          </div>

          {/* Value */}
          <div>
            <Label className="text-[10px] text-zinc-500 uppercase tracking-widest">
              Утга {type === 'percent' ? '(%)' : '(₮)'}
            </Label>
            <Input
              type="number"
              min={0}
              max={type === 'percent' ? 100 : undefined}
              value={value}
              onChange={(e) => setValue(e.target.value)}
              className="mt-1.5 bg-black border-white/10 text-white focus:border-[#CA8A04]/40"
            />
          </div>

          {/* Expires */}
          <div>
            <Label className="text-[10px] text-zinc-500 uppercase tracking-widest">Дуусах огноо (заавал биш)</Label>
            <Input
              type="date"
              value={expiresAt}
              onChange={(e) => setExpiresAt(e.target.value)}
              className="mt-1.5 bg-black border-white/10 text-white focus:border-[#CA8A04]/40"
            />
          </div>
        </div>

        <div className="flex items-end gap-4">
          <div className="w-48">
            <Label className="text-[10px] text-zinc-500 uppercase tracking-widest">Ашиглах лимит (заавал биш)</Label>
            <Input
              type="number"
              min={1}
              value={usageLimit}
              onChange={(e) => setUsageLimit(e.target.value)}
              placeholder="Хязгааргүй"
              className="mt-1.5 bg-black border-white/10 text-white focus:border-[#CA8A04]/40"
            />
          </div>
          <Button
            onClick={createCoupon}
            disabled={creating}
            className="bg-[#CA8A04] hover:bg-[#D97706] text-black font-bold h-9 disabled:opacity-50"
          >
            {creating ? '...' : 'Үүсгэх'}
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-[#0D0D0D] rounded border border-white/[0.06] overflow-x-auto">
        <table className="w-full text-sm min-w-[600px]">
          <thead>
            <tr className="border-b border-white/[0.06]">
              {['Код', 'Хэлбэр / Утга', 'Ашиглалт', 'Дуусах огноо', 'Төлөв', 'Үйлдэл'].map((h) => (
                <th key={h} className="px-4 py-3 text-left text-[10px] text-zinc-600 uppercase tracking-widest font-medium">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {initialCoupons.map((coupon) => {
              const expired = isExpired(coupon.expires_at)
              return (
                <tr key={coupon.id} className="border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors">
                  <td className="px-4 py-3">
                    <button
                      onClick={() => copy(coupon.code, coupon.id)}
                      className="flex items-center gap-2 font-mono text-sm text-white hover:text-[#CA8A04] transition-colors group"
                      title="Хуулах"
                    >
                      {coupon.code}
                      {copiedId === coupon.id ? (
                        <Check size={12} className="text-green-400" />
                      ) : (
                        <Copy size={11} className="text-zinc-700 group-hover:text-[#CA8A04] opacity-0 group-hover:opacity-100 transition-all" />
                      )}
                    </button>
                  </td>
                  <td className="px-4 py-3 text-zinc-300">
                    {coupon.discount_type === 'percent' ? `${coupon.value}%` : `${coupon.value.toLocaleString()}₮`}
                  </td>
                  <td className="px-4 py-3 text-zinc-400 text-xs">
                    {coupon.used_count} / {coupon.usage_limit != null ? coupon.usage_limit : '∞'}
                  </td>
                  <td className="px-4 py-3 text-xs">
                    {coupon.expires_at ? (
                      <span className={expired ? 'text-red-400' : 'text-zinc-400'}>
                        {formatDate(coupon.expires_at, 'mn')}
                        {expired && ' (Дууссан)'}
                      </span>
                    ) : (
                      <span className="text-zinc-600">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => toggleActive(coupon.id, coupon.is_active)}
                      className={cn(
                        'relative w-9 h-5 rounded-full transition-colors',
                        coupon.is_active ? 'bg-[#CA8A04]' : 'bg-zinc-800'
                      )}
                    >
                      <div className={cn(
                        'absolute top-0.5 w-4 h-4 bg-white rounded-full transition-transform shadow-sm',
                        coupon.is_active ? 'translate-x-4' : 'translate-x-0.5'
                      )} />
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => setDeleteId(coupon.id)}
                      className="text-zinc-600 hover:text-red-400 transition-colors p-1.5 rounded hover:bg-red-400/5"
                    >
                      <Trash2 size={13} />
                    </button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
        {initialCoupons.length === 0 && (
          <div className="py-16 text-center text-zinc-600">Купон байхгүй байна</div>
        )}
      </div>

      <ConfirmDialog
        open={!!deleteId}
        title="Купон устгах уу?"
        description="Энэ үйлдлийг буцаах боломжгүй."
        confirmLabel="Устгах"
        onConfirm={() => deleteId && deleteCoupon(deleteId)}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  )
}
