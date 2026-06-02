import Link from 'next/link'
import { ChevronRight, X, SlidersHorizontal } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { ProductGrid } from '@/components/product/ProductGrid'
import type { Product, ProductImage, Variant, Category } from '@/types'

const PAGE_SIZE = 12
const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL'] as const
const SEX_OPTIONS = [
  { value: '', label: 'Бүгд' },
  { value: 'male', label: 'Эрэгтэй' },
  { value: 'female', label: 'Эмэгтэй' },
  { value: 'unisex', label: 'Unisex' },
]
const SORT_OPTIONS = [
  { value: 'newest', label: 'Шинэ эхлээд' },
  { value: 'price_asc', label: 'Үнэ: бага → их' },
  { value: 'price_desc', label: 'Үнэ: их → бага' },
]

interface SearchParams {
  category?: string
  sex?: string
  sizes?: string          // comma-separated: "S,M,L"
  color?: string
  min_price?: string
  max_price?: string
  sort?: string
  presale?: string
  page?: string
}
interface Props { searchParams: Promise<SearchParams> }

type FullProduct = Product & { images: ProductImage[]; variants: Variant[] }

export default async function ShopPage({ searchParams }: Props) {
  const params = await searchParams
  const {
    category, sex, sizes: sizesParam, color,
    min_price, max_price, sort, presale, page,
  } = params

  const currentPage = Math.max(1, Number(page) || 1)
  const selectedSizes = sizesParam ? sizesParam.split(',').filter(Boolean) : []

  const supabase = await createClient()

  // ── Fetch filter data ──────────────────────────────────────────────────────
  const [catRes, colorRes] = await Promise.all([
    supabase.from('categories').select('*').order('name_mn'),
    supabase.from('variants').select('color').not('color', 'is', null),
  ])

  const categories = (catRes.data ?? []) as Category[]
  const parentCats = categories.filter((c) => !c.parent_id)
  const childCats = categories.filter((c) => c.parent_id)
  const distinctColors = [...new Set((colorRes.data ?? []).map((r) => r.color).filter(Boolean))]

  // ── Fetch products ─────────────────────────────────────────────────────────
  let query = supabase
    .from('products')
    .select('*, images:product_images(*), variants(*)', { count: 'exact' })
    .eq('status', 'active')

  if (category) query = query.eq('category_id', category)
  if (presale === 'true') query = query.eq('is_presale', true)
  if (min_price) query = query.gte('price', Number(min_price))
  if (max_price) query = query.lte('price', Number(max_price))

  switch (sort) {
    case 'price_asc': query = query.order('price', { ascending: true }); break
    case 'price_desc': query = query.order('price', { ascending: false }); break
    default: query = query.order('created_at', { ascending: false })
  }

  const from = (currentPage - 1) * PAGE_SIZE
  query = query.range(from, from + PAGE_SIZE - 1)

  const { data: rawProducts, count } = await query
  let products = (rawProducts ?? []) as FullProduct[]

  // Variant-level filters (JS post-filter)
  if (selectedSizes.length > 0 || sex || color) {
    products = products.filter((p) =>
      (p.variants ?? []).some((v) =>
        (!selectedSizes.length || selectedSizes.includes(v.size)) &&
        (!sex || v.sex === sex) &&
        (!color || v.color === color)
      )
    )
  }

  const totalPages = Math.ceil((count ?? 0) / PAGE_SIZE)
  const hasFilters = !!(category || sex || selectedSizes.length || color || min_price || max_price || presale)

  // Helper to build URLs with merged params
  function url(overrides: Partial<SearchParams & { page: string }>) {
    const merged: Record<string, string> = {}
    for (const [k, v] of Object.entries({ ...params, page: '1', ...overrides })) {
      if (v !== undefined && v !== '' && v !== null) merged[k] = String(v)
    }
    const qs = new URLSearchParams(merged).toString()
    return qs ? `/shop?${qs}` : '/shop'
  }

  return (
    <div className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 py-10">
      {/* Page header */}
      <div className="mb-8">
        <p className="text-[10px] text-zinc-600 tracking-[0.4em] uppercase mb-1.5">Collection</p>
        <h1 className="font-heading text-4xl sm:text-5xl font-bold text-white">Дэлгүүр</h1>
      </div>

      <div className="flex gap-10">
        {/* ── SIDEBAR ─────────────────────────────────────────────────────── */}
        <aside className="hidden lg:block w-56 flex-shrink-0">
          <form method="get" action="/shop" className="space-y-7">
            {/* Preserve sort */}
            {sort && <input type="hidden" name="sort" value={sort} />}

            {/* Category */}
            <div>
              <p className="text-[10px] font-bold tracking-[0.3em] uppercase text-zinc-500 mb-3">Ангилал</p>
              <ul className="space-y-1">
                <li>
                  <Link href={url({ category: undefined })}
                    className={`block text-sm py-0.5 transition-colors ${!category ? 'text-white font-medium' : 'text-zinc-500 hover:text-white'}`}>
                    Бүгд
                  </Link>
                </li>
                {parentCats.map((cat) => (
                  <li key={cat.id}>
                    <Link href={url({ category: cat.id })}
                      className={`block text-sm py-0.5 transition-colors ${category === cat.id ? 'text-[#CA8A04] font-medium' : 'text-zinc-400 hover:text-white'}`}>
                      {cat.name_mn}
                    </Link>
                    {childCats.filter((c) => c.parent_id === cat.id).map((child) => (
                      <Link key={child.id} href={url({ category: child.id })}
                        className={`flex items-center gap-1 ml-3 text-xs py-0.5 transition-colors ${category === child.id ? 'text-[#CA8A04]' : 'text-zinc-600 hover:text-zinc-300'}`}>
                        <ChevronRight size={10} /> {child.name_mn}
                      </Link>
                    ))}
                  </li>
                ))}
              </ul>
            </div>

            {/* Sex */}
            <div>
              <p className="text-[10px] font-bold tracking-[0.3em] uppercase text-zinc-500 mb-3">Хүйс</p>
              <div className="space-y-1.5">
                {SEX_OPTIONS.map((opt) => (
                  <label key={opt.value} className="flex items-center gap-2.5 cursor-pointer group">
                    <input
                      type="radio"
                      name="sex"
                      value={opt.value}
                      defaultChecked={sex === opt.value || (!sex && opt.value === '')}
                      className="accent-[#CA8A04] w-3.5 h-3.5"
                    />
                    <span className="text-sm text-zinc-400 group-hover:text-white transition-colors">
                      {opt.label}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Size */}
            <div>
              <p className="text-[10px] font-bold tracking-[0.3em] uppercase text-zinc-500 mb-3">Хэмжээ</p>
              <div className="flex flex-wrap gap-1.5">
                {SIZES.map((s) => (
                  <label key={s} className="cursor-pointer">
                    <input
                      type="checkbox"
                      name="sizes"
                      value={s}
                      defaultChecked={selectedSizes.includes(s)}
                      className="sr-only peer"
                    />
                    <span className="peer-checked:border-[#CA8A04] peer-checked:text-[#CA8A04] border border-white/10 text-zinc-500 text-xs px-2.5 py-1 rounded transition-all hover:border-white/30 hover:text-white select-none">
                      {s}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Color */}
            {distinctColors.length > 0 && (
              <div>
                <p className="text-[10px] font-bold tracking-[0.3em] uppercase text-zinc-500 mb-3">Өнгө</p>
                <div className="space-y-1">
                  <label className="flex items-center gap-2.5 cursor-pointer group">
                    <input type="radio" name="color" value="" defaultChecked={!color}
                      className="accent-[#CA8A04] w-3.5 h-3.5" />
                    <span className="text-sm text-zinc-400 group-hover:text-white transition-colors">Бүгд</span>
                  </label>
                  {distinctColors.map((c) => (
                    <label key={c} className="flex items-center gap-2.5 cursor-pointer group">
                      <input type="radio" name="color" value={c} defaultChecked={color === c}
                        className="accent-[#CA8A04] w-3.5 h-3.5" />
                      <span className="text-sm text-zinc-400 group-hover:text-white transition-colors capitalize">{c}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Price range */}
            <div>
              <p className="text-[10px] font-bold tracking-[0.3em] uppercase text-zinc-500 mb-3">Үнийн хязгаар</p>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  name="min_price"
                  defaultValue={min_price}
                  placeholder="Мин"
                  min={0}
                  className="w-full bg-[#0D0D0D] border border-white/10 rounded px-2.5 py-1.5 text-xs text-white placeholder-zinc-700 focus:border-[#CA8A04]/40 focus:outline-none"
                />
                <span className="text-zinc-700 text-xs">—</span>
                <input
                  type="number"
                  name="max_price"
                  defaultValue={max_price}
                  placeholder="Макс"
                  min={0}
                  className="w-full bg-[#0D0D0D] border border-white/10 rounded px-2.5 py-1.5 text-xs text-white placeholder-zinc-700 focus:border-[#CA8A04]/40 focus:outline-none"
                />
              </div>
            </div>

            <div className="space-y-2 pt-1">
              <button type="submit"
                className="w-full bg-[#CA8A04] hover:bg-[#D97706] text-black text-xs font-bold py-2 rounded transition-colors tracking-widest uppercase">
                Хэрэглэх
              </button>
              {hasFilters && (
                <Link href="/shop"
                  className="flex items-center justify-center gap-1 w-full border border-white/10 hover:border-white/30 text-zinc-500 hover:text-white text-xs py-2 rounded transition-colors">
                  <X size={11} /> Арилгах
                </Link>
              )}
            </div>
          </form>
        </aside>

        {/* ── MAIN CONTENT ──────────────────────────────────────────────── */}
        <div className="flex-1 min-w-0">
          {/* Sort bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
            <div className="flex items-center gap-3">
              <p className="text-sm text-zinc-500">
                <span className="text-white font-medium">{count ?? 0}</span> бүтээгдэхүүн
              </p>
              {presale === 'true' && (
                <Link href={url({ presale: undefined })}
                  className="flex items-center gap-1 text-xs bg-[#CA8A04]/10 border border-[#CA8A04]/20 text-[#CA8A04] px-2.5 py-1 rounded-full hover:bg-[#CA8A04]/20 transition-colors">
                  PRE-SALE <X size={10} />
                </Link>
              )}
              {/* Mobile filter icon */}
              <button className="lg:hidden flex items-center gap-1.5 border border-white/10 text-zinc-400 text-xs px-3 py-1.5 rounded hover:border-white/30 hover:text-white transition-colors">
                <SlidersHorizontal size={12} /> Шүүлтүүр
              </button>
            </div>
            {/* Sort select */}
            <div className="flex items-center gap-2 text-sm">
              {SORT_OPTIONS.map((opt) => (
                <Link key={opt.value} href={url({ sort: opt.value })}
                  className={`text-xs px-3 py-1.5 rounded transition-colors ${sort === opt.value || (!sort && opt.value === 'newest') ? 'bg-white/5 text-white border border-white/10' : 'text-zinc-500 hover:text-white'}`}>
                  {opt.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Products */}
          {products.length === 0 ? (
            <div className="py-24 text-center space-y-4">
              <p className="font-heading text-3xl text-zinc-700">Бүтээгдэхүүн олдсонгүй</p>
              <p className="text-sm text-zinc-600">Шүүлтүүрийг өөрчилж үзнэ үү</p>
              {hasFilters && (
                <Link href="/shop"
                  className="inline-flex items-center gap-1.5 text-sm text-[#CA8A04] hover:underline mt-2">
                  <X size={13} /> Бүх шүүлтүүрийг арилгах
                </Link>
              )}
            </div>
          ) : (
            <ProductGrid products={products} />
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-12">
              {currentPage > 1 && (
                <Link href={url({ page: String(currentPage - 1) })}
                  className="px-4 py-2 border border-white/10 text-zinc-400 hover:text-white hover:border-white/30 rounded text-sm transition-colors">
                  ← Өмнөх
                </Link>
              )}
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter((p) => Math.abs(p - currentPage) <= 2)
                .map((p) => (
                  <Link key={p} href={url({ page: String(p) })}
                    className={`w-9 h-9 flex items-center justify-center rounded text-sm transition-colors ${p === currentPage ? 'bg-[#CA8A04] text-black font-bold' : 'border border-white/10 text-zinc-400 hover:text-white hover:border-white/30'}`}>
                    {p}
                  </Link>
                ))}
              {currentPage < totalPages && (
                <Link href={url({ page: String(currentPage + 1) })}
                  className="px-4 py-2 border border-white/10 text-zinc-400 hover:text-white hover:border-white/30 rounded text-sm transition-colors">
                  Дараах →
                </Link>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
