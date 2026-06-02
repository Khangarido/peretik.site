'use client'

import { useState } from 'react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import type { OrderStatus } from '@/types'

const statuses: OrderStatus[] = ['pending', 'paid', 'processing', 'shipped', 'delivered', 'cancelled']
const statusLabels: Record<OrderStatus, string> = {
  pending: 'Хүлээгдэж буй',
  paid: 'Төлсөн',
  processing: 'Боловсруулж буй',
  shipped: 'Илгээсэн',
  delivered: 'Хүргэгдсэн',
  cancelled: 'Цуцлагдсан',
}

interface Props {
  orderId: string
  currentStatus: OrderStatus
}

export function OrderStatusSelect({ orderId, currentStatus }: Props) {
  const [status, setStatus] = useState(currentStatus)
  const router = useRouter()

  const handleChange = async (val: string) => {
    const supabase = createClient()
    const { error } = await supabase
      .from('orders')
      .update({ status: val })
      .eq('id', orderId)

    if (error) {
      toast.error('Алдаа гарлаа')
    } else {
      setStatus(val as OrderStatus)
      router.refresh()
    }
  }

  return (
    <Select value={status} onValueChange={handleChange}>
      <SelectTrigger className="h-7 text-xs bg-transparent border-white/10 text-white w-36">
        <SelectValue />
      </SelectTrigger>
      <SelectContent className="bg-[#111] border-white/10 text-white text-xs">
        {statuses.map((s) => (
          <SelectItem key={s} value={s} className="text-xs">
            {statusLabels[s]}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
