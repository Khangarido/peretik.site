import Link from 'next/link'
import { XCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'

export const metadata = { title: 'Төлбөр цуцлагдлаа — Peretik' }

export default function CheckoutCancelPage() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center py-24 px-4 text-center gap-6">
      <div className="w-20 h-20 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center">
        <XCircle size={36} className="text-red-400" />
      </div>
      <div>
        <p className="text-[10px] tracking-[0.4em] text-red-400 uppercase mb-3">Цуцлагдлаа</p>
        <h1 className="font-heading text-4xl font-bold text-white mb-3">Төлбөр цуцлагдлаа</h1>
        <p className="text-zinc-500 text-sm max-w-sm mx-auto">
          Таны төлбөр амжилтгүй болсон эсвэл цуцалсан байна. Дахин оролдож болно.
        </p>
      </div>
      <div className="flex flex-col sm:flex-row gap-3 mt-2">
        <Link href="/checkout">
          <Button className="h-11 bg-[#CA8A04] hover:bg-[#D97706] text-black font-bold px-8">
            Дахин оролдох
          </Button>
        </Link>
        <Link href="/cart">
          <Button variant="outline" className="h-11 border-white/10 text-zinc-300 hover:text-white px-8">
            Сагс руу буцах
          </Button>
        </Link>
      </div>
    </div>
  )
}
