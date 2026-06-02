import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { ProductGrid } from '@/components/product/ProductGrid'
import { ProductDetailClient } from './_client'
import type { Product, ProductImage, Variant } from '@/types'

interface Props { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props) {
  const { slug } = await params
  const supabase = await createClient()
  const { data } = await supabase
    .from('products')
    .select('name_mn, name_en, description_mn, images:product_images(url, sort_order)')
    .eq('slug', slug)
    .single()

  const images = (data?.images as { url: string; sort_order: number }[] | null)
    ?.sort((a, b) => a.sort_order - b.sort_order) ?? []

  return {
    title: data?.name_mn ?? data?.name_en ?? 'Бүтээгдэхүүн',
    description: data?.description_mn ?? 'Peretik — Mongolian Streetwear',
    openGraph: {
      title: data?.name_mn ?? 'Peretik',
      description: data?.description_mn ?? '',
      images: images[0]?.url ? [{ url: images[0].url }] : [],
    },
  }
}

export default async function ProductDetailPage({ params }: Props) {
  const { slug } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: product } = await supabase
    .from('products')
    .select('*, images:product_images(*), variants(*), category:categories(*)')
    .eq('slug', slug)
    .single()

  if (!product) notFound()

  const images: ProductImage[] = (product.images ?? []).sort(
    (a: ProductImage, b: ProductImage) => a.sort_order - b.sort_order
  )
  const variants: Variant[] = product.variants ?? []

  // Related products — same category, different slug, limit 4
  const { data: related } = product.category_id
    ? await supabase
        .from('products')
        .select('*, images:product_images(*), variants(*)')
        .eq('category_id', product.category_id)
        .eq('status', 'active')
        .neq('slug', slug)
        .limit(4)
    : { data: [] }

  const fullProduct = { ...product, images } as Product & {
    images: ProductImage[]
    variants: Variant[]
    category?: import('@/types').Category
  }

  return (
    <div className="flex-1">
      {/* Breadcrumb */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-8 pb-4">
        <nav className="flex items-center gap-1.5 text-xs text-zinc-600">
          <Link href="/" className="hover:text-zinc-300 transition-colors">Нүүр</Link>
          <span>/</span>
          <Link href="/shop" className="hover:text-zinc-300 transition-colors">Дэлгүүр</Link>
          {product.category && (
            <>
              <span>/</span>
              <Link
                href={`/shop?category=${product.category_id}`}
                className="hover:text-zinc-300 transition-colors capitalize"
              >
                {product.category.name_mn}
              </Link>
            </>
          )}
          <span>/</span>
          <span className="text-zinc-400 truncate max-w-[200px]">{product.name_mn}</span>
        </nav>
      </div>

      {/* Main content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 xl:gap-16">
          {/* Left — Image gallery (server-rendered shell, client JS for switching) */}
          <div className="space-y-3">
            {images.length > 0 ? (
              <>
                <div
                  id="main-image-wrap"
                  className="aspect-[3/4] relative rounded overflow-hidden bg-[#0D0D0D] border border-white/[0.05]"
                >
                  {/* Main image rendered by client component */}
                </div>
                {/* Thumbnails rendered by client component */}
              </>
            ) : (
              <div className="aspect-[3/4] bg-[#0D0D0D] rounded border border-white/[0.05] flex items-center justify-center">
                <span className="font-heading text-5xl text-zinc-800 tracking-[0.2em]">PERETIK</span>
              </div>
            )}
          </div>

          {/* Right — Product detail client */}
          <ProductDetailClient
            product={fullProduct}
            variants={variants}
            userId={user?.id}
          />
        </div>

        {/* Related products */}
        {related && related.length > 0 && (
          <section className="mt-20 pt-12 border-t border-white/[0.06]">
            <h2 className="font-heading text-2xl font-bold text-white mb-8">Төстэй бүтээгдэхүүн</h2>
            <ProductGrid
              products={related as (Product & { images: ProductImage[]; variants: Variant[] })[]}
            />
          </section>
        )}
      </div>
    </div>
  )
}
