import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Heart } from 'lucide-react'
import { EmptyState } from '@/components/ui/EmptyState'
import { WishlistClient } from './_client'
import type { Product, ProductImage, Variant } from '@/types'

export const metadata = { title: 'Wishlist — Peretik' }

export default async function WishlistPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login?redirectTo=/wishlist')

  const { data: wishlist } = await supabase
    .from('wishlist_items')
    .select('product_id, product:products(*, images:product_images(*), variants(*))')
    .eq('user_id', user.id)

  type FullProduct = Product & { images: ProductImage[]; variants: Variant[] }
  const products = (wishlist ?? [])
    .map((w) => w.product)
    .filter(Boolean) as unknown as FullProduct[]

  return (
    <div className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 py-12">
      <div className="mb-10">
        <p className="text-[10px] text-zinc-600 tracking-[0.4em] uppercase mb-1.5">Миний</p>
        <h1 className="font-heading text-4xl font-bold text-white">
          Wishlist
          <span className="text-xl text-zinc-600 font-sans font-normal ml-3">({products.length})</span>
        </h1>
      </div>

      {products.length === 0 ? (
        <EmptyState
          icon={<Heart size={24} strokeWidth={1} />}
          title="Таны wishlist хоосон байна"
          description="Дуртай бүтээгдэхүүнүүдээ wishlist-д нэм"
          actionLabel="Дэлгүүр үзэх"
          actionHref="/shop"
        />
      ) : (
        <WishlistClient products={products} />
      )}
    </div>
  )
}
