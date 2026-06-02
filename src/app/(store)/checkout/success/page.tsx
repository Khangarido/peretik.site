import Link from 'next/link'
import { CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface Props {
  searchParams: Promise<{ order_id?: string }>
}

export const metadata = { title: 'Захиалга амжилттай — Peretik' }

export default async function CheckoutSuccessPage({ searchParams }: Props) {
  const { order_id } = await searchParams
  const shortId = order_id ? order_id.slice(0, 8).toUpperCase() : ''

  return (
    <div className="flex-1 flex flex-col items-center justify-center py-24 px-4 text-center gap-6">
      <div className="w-20 h-20 rounded-full bg-green-500/10 border border-green-500/20 flex items-center justify-center">
        <CheckCircle2 size={36} className="text-green-400" />
      </div>
      <div>
        <p className="text-[10px] tracking-[0.4em] text-[#CA8A04] uppercase mb-3">Амжилттай</p>
        <h1 className="font-heading text-4xl font-bold text-white mb-3">Захиалга амжилттай!</h1>
        {shortId && (
          <p className="text-zinc-400 text-sm">
            Захиалгын дугаар:{' '}
            <span className="font-mono text-white font-semibold">#{shortId}</span>
          </p>
        )}
        <p className="text-zinc-500 text-sm mt-2 max-w-sm mx-auto">
          Таны захиалга хүлээн авагдлаа. Захиалгын дэлгэрэнгүйг и-мэйлийн хайрцагнаасаа шалгана уу.
        </p>
      </div>
      <div className="flex flex-col sm:flex-row gap-3 mt-2">
        <Link href="/orders">
          <Button className="h-11 bg-[#CA8A04] hover:bg-[#D97706] text-black font-bold px-8">
            Захиалгуудаа харах
          </Button>
        </Link>
        <Link href="/shop">
          <Button variant="outline" className="h-11 border-white/10 text-zinc-300 hover:text-white px-8">
            Дэлгүүр рүү буцах
          </Button>
        </Link>
      </div>
    </div>
  )
}
