import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { ProductForm } from '../../_form'
import type { Product } from '@/types'

export const metadata = { title: 'Admin — Edit Product' }

interface Props {
  params: Promise<{ id: string }>
}

export default async function EditProductPage({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('products')
    .select('*, images:product_images(*), variants(*)')
    .eq('id', id)
    .single()

  if (error || !data) notFound()

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <p className="text-xs text-zinc-500 tracking-[0.4em] uppercase mb-1">Admin / Products</p>
        <h1 className="font-heading text-3xl font-bold text-white">Бүтээгдэхүүн засах</h1>
      </div>
      <ProductForm product={data as Product} />
    </div>
  )
}
