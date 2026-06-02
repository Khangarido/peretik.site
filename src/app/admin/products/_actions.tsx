'use client'

import { useState } from 'react'
import { Star, Tag, Trash2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'

interface Props {
  productId: string
  field: 'is_featured' | 'is_presale' | 'delete'
  value: boolean
  type: 'star' | 'badge' | 'delete'
}

export function ProductAdminActions({ productId, field, value, type }: Props) {
  const [current, setCurrent] = useState(value)
  const [loading, setLoading] = useState(false)
  const [confirm, setConfirm] = useState(false)
  const router = useRouter()

  const toggle = async () => {
    setLoading(true)
    const supabase = createClient()
    const { error } = await supabase
      .from('products')
      .update({ [field]: !current })
      .eq('id', productId)
    if (error) {
      toast.error('Алдаа гарлаа')
    } else {
      setCurrent(!current)
    }
    setLoading(false)
  }

  const deleteProduct = async () => {
    if (!confirm) { setConfirm(true); return }
    setLoading(true)
    const supabase = createClient()
    await supabase.from('products').delete().eq('id', productId)
    toast.success('Бүтээгдэхүүн устгагдлаа')
    router.refresh()
    setLoading(false)
    setConfirm(false)
  }

  if (type === 'delete') {
    return (
      <button
        onClick={deleteProduct}
        disabled={loading}
        className={cn(
          'p-1.5 transition-colors rounded hover:bg-red-400/5',
          confirm ? 'text-red-400' : 'text-zinc-600 hover:text-red-400'
        )}
        title={confirm ? 'Дахин дарж баталгаажуулна уу' : 'Устгах'}
      >
        <Trash2 size={13} />
      </button>
    )
  }

  if (type === 'star') {
    return (
      <button onClick={toggle} disabled={loading} title="Featured toggle">
        <Star
          size={16}
          className={cn(
            'transition-colors',
            current ? 'fill-[#CA8A04] text-[#CA8A04]' : 'text-zinc-700 hover:text-zinc-400'
          )}
        />
      </button>
    )
  }

  return (
    <button onClick={toggle} disabled={loading}>
      <Tag
        size={14}
        className={cn(
          'transition-colors',
          current ? 'text-[#CA8A04]' : 'text-zinc-700 hover:text-zinc-400'
        )}
      />
    </button>
  )
}
