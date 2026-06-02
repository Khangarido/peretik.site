'use client'

import { useState } from 'react'
import { Trash2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

export function DeleteProductButton({ productId }: { productId: string }) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleDelete = async () => {
    if (!confirm('Энэ бүтээгдэхүүнийг устгах уу?')) return
    setLoading(true)
    const supabase = createClient()
    const { error } = await supabase.from('products').delete().eq('id', productId)
    if (error) {
      toast.error('Устгахад алдаа гарлаа')
    } else {
      toast.success('Устгагдлаа')
      router.refresh()
    }
    setLoading(false)
  }

  return (
    <button
      onClick={handleDelete}
      disabled={loading}
      className="p-1.5 text-zinc-600 hover:text-red-400 transition-colors disabled:opacity-40"
    >
      <Trash2 size={13} />
    </button>
  )
}
