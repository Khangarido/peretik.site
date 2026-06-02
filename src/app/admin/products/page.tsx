import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import Image from 'next/image'
import { Plus, Pencil } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { formatPrice } from '@/lib/utils'
import type { Product } from '@/types'
import { ProductAdminActions } from './_actions'

export const metadata = { title: 'Admin — Бүтээгдэхүүн' }

interface Props {
  searchParams: Promise<{ q?: string; page?: string }>
}

const PAGE_SIZE = 20

export default async function AdminProductsPage({ searchParams }: Props) {
  const { q, page } = await searchParams
  const currentPage = Math.max(1, Number(page) || 1)
  const supabase = await createClient()

  let query = supabase
    .from('products')
    .select('*, images:product_images(*)', { count: 'exact' })
    .order('created_at', { ascending: false })

  if (q) {
    query = query.ilike('name_mn', `%${q}%`)
  }

  const from = (currentPage - 1) * PAGE_SIZE
  query = query.range(from, from + PAGE_SIZE - 1)

  const { data: products, count } = await query
  const totalPages = Math.ceil((count ?? 0) / PAGE_SIZE)

  const STATUS_COLORS: Record<string, string> = {
    active: 'bg-green-500/10 text-green-400 border-green-500/20',
    draft: 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20',
    archived: 'bg-red-500/10 text-red-400 border-red-500/20',
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-[10px] text-zinc-600 tracking-[0.4em] uppercase mb-1">Admin</p>
          <h1 className="font-heading text-3xl font-bold text-white">Бүтээгдэхүүн</h1>
        </div>
        <Link href="/admin/products/new">
          <Button className="bg-[#CA8A04] hover:bg-[#D97706] text-black font-bold">
            <Plus size={14} className="mr-1.5" /> Нэмэх
          </Button>
        </Link>
      </div>

      {/* Search */}
      <form method="get" action="/admin/products">
        <div className="flex gap-3 max-w-sm">
          <input
            name="q"
            defaultValue={q}
            placeholder="Нэрээр хайх..."
            className="flex-1 bg-[#0D0D0D] border border-white/10 rounded px-3 py-2 text-sm text-white placeholder-zinc-700 focus:border-[#CA8A04]/40 focus:outline-none"
          />
          <Button type="submit" variant="outline" size="sm" className="border-white/10 text-zinc-300 hover:text-white">
            Хайх
          </Button>
          {q && (
            <Link href="/admin/products">
              <Button variant="ghost" size="sm" className="text-zinc-500 hover:text-white">✕</Button>
            </Link>
          )}
        </div>
      </form>

      <div className="bg-[#0D0D0D] rounded border border-white/[0.06] overflow-x-auto">
        <table className="w-full text-sm min-w-[700px]">
          <thead>
            <tr className="border-b border-white/[0.06]">
              {['Бүтээгдэхүүн', 'Үнэ', 'Төлөв', 'Онцлох', 'Pre-Sale', 'Нийт нөөц', 'Үйлдэл'].map((h) => (
                <th key={h} className="px-4 py-3 text-left text-[10px] text-zinc-600 uppercase tracking-widest font-medium">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {(products ?? []).map((product: Product & { images?: { url: string }[] }) => {
              const img = product.images?.[0]?.url
              const totalStock = (product as unknown as { variants?: { stock: number }[] }).variants
                ?.reduce((s: number, v: { stock: number }) => s + v.stock, 0) ?? '—'

              return (
                <tr key={product.id} className="border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded bg-[#111] overflow-hidden flex-shrink-0">
                        {img ? (
                          <Image src={img} alt={product.name_mn} width={40} height={40} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-[8px] text-zinc-700">IMG</div>
                        )}
                      </div>
                      <div>
                        <p className="text-white font-medium truncate max-w-[180px]">{product.name_mn}</p>
                        <p className="text-xs text-zinc-600 truncate max-w-[180px]">{product.name_en}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-[#CA8A04] font-semibold">{formatPrice(product.price)}</td>
                  <td className="px-4 py-3">
                    <Badge className={`text-[10px] border ${STATUS_COLORS[product.status] ?? ''}`}>
                      {product.status}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <ProductAdminActions
                      productId={product.id}
                      field="is_featured"
                      value={product.is_featured}
                      type="star"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <ProductAdminActions
                      productId={product.id}
                      field="is_presale"
                      value={product.is_presale}
                      type="badge"
                    />
                  </td>
                  <td className="px-4 py-3 text-zinc-400 text-center">{totalStock}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Link href={`/admin/products/${product.id}/edit`}>
                        <button className="p-1.5 text-zinc-500 hover:text-white transition-colors rounded hover:bg-white/5">
                          <Pencil size={13} />
                        </button>
                      </Link>
                      <ProductAdminActions productId={product.id} field="delete" value={false} type="delete" />
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
        {(!products || products.length === 0) && (
          <div className="py-16 text-center text-zinc-600">Бүтээгдэхүүн олдсонгүй</div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex gap-2 justify-center">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <Link key={p} href={`/admin/products?page=${p}${q ? `&q=${q}` : ''}`}>
              <Button
                variant={p === currentPage ? 'default' : 'outline'}
                size="sm"
                className={p === currentPage ? 'bg-[#CA8A04] text-black hover:bg-[#D97706]' : 'border-white/10 text-zinc-400 hover:text-white'}
              >
                {p}
              </Button>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
