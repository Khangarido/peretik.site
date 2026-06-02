import Link from 'next/link'
import { ArrowRight, ChevronDown } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { getFeaturedProducts, getPresaleProducts } from '@/lib/supabase/queries'
import { ProductGrid } from '@/components/product/ProductGrid'
import { CountdownTimer } from '@/components/ui/CountdownTimer'
import type { Product, ProductImage, Variant } from '@/types'

export const revalidate = 60 // ISR: revalidate every 60s

export default async function HomePage() {
  const supabase = await createClient()

  const [featured, presale] = await Promise.all([
    getFeaturedProducts(supabase),
    getPresaleProducts(supabase),
  ])

  // Fetch latest 6 for New Arrivals
  const { data: newArrivals } = await supabase
    .from('products')
    .select('*, images:product_images(*), variants(*)')
    .eq('status', 'active')
    .order('created_at', { ascending: false })
    .limit(6)

  // First presale end date for countdown
  const firstPresaleEnd = presale[0]?.presale_end_at ?? null

  type FullProduct = Product & { images: ProductImage[]; variants: Variant[] }

  return (
    <div className="flex-1">

      {/* ── HERO ──────────────────────────────────────────────────────────── */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Background layers */}
        <div className="absolute inset-0 bg-black" />
        <div
          className="absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage:
              'radial-gradient(ellipse 80% 60% at 50% 40%, #CA8A04 0%, transparent 70%)',
          }}
        />
        {/* Subtle grid texture */}
        <div
          className="absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage:
              'linear-gradient(rgba(255,255,255,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.3) 1px, transparent 1px)',
            backgroundSize: '60px 60px',
          }}
        />

        {/* Hero content */}
        <div className="relative z-10 text-center px-4 max-w-5xl mx-auto select-none">
          <p className="text-[11px] tracking-[0.6em] text-[#CA8A04] uppercase mb-8 font-medium">
            Mongolian Streetwear
          </p>
          <h1 className="font-heading text-[clamp(4rem,18vw,14rem)] font-bold leading-none tracking-tight text-white mb-8">
            PERETIK
          </h1>
          <p className="text-sm sm:text-base text-zinc-400 tracking-[0.25em] uppercase mb-12 max-w-sm mx-auto">
            Тансаг. Зориг. Монгол.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              href="/shop"
              className="inline-flex items-center gap-2.5 bg-[#CA8A04] hover:bg-[#D97706] text-black font-bold px-9 py-3.5 rounded transition-all duration-200 tracking-[0.12em] text-sm uppercase hover:gap-3.5"
            >
              COLLECTION ҮЗЭХ <ArrowRight size={15} />
            </Link>
            <Link
              href="/shop?presale=true"
              className="inline-flex items-center gap-2.5 border border-white/20 hover:border-[#CA8A04]/60 hover:text-[#CA8A04] text-white px-9 py-3.5 rounded transition-all duration-200 text-sm tracking-[0.12em] uppercase"
            >
              PRESALE
            </Link>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 opacity-40">
          <span className="text-[9px] tracking-[0.3em] uppercase text-zinc-500">Scroll</span>
          <ChevronDown size={16} className="text-zinc-500 animate-bounce" />
        </div>
      </section>

      {/* ── MARQUEE ───────────────────────────────────────────────────────── */}
      <div className="border-y border-white/[0.05] py-3.5 overflow-hidden bg-[#0A0A0A]">
        <div className="flex animate-marquee whitespace-nowrap">
          {Array.from({ length: 8 }).map((_, i) => (
            <span key={i} className="mx-10 text-[10px] tracking-[0.5em] text-zinc-700 uppercase font-medium">
              PERETIK · MONGOLIAN STREETWEAR · LUXURY · ТАНСАГ · NEW DROP
            </span>
          ))}
        </div>
      </div>

      {/* ── FEATURED DROP ─────────────────────────────────────────────────── */}
      {featured.length > 0 && (
        <section className="py-24 px-4 sm:px-6 max-w-7xl mx-auto">
          <div className="flex items-end justify-between mb-12">
            <div>
              <p className="text-[10px] tracking-[0.4em] text-zinc-500 uppercase mb-3">Collection</p>
              <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-bold text-white leading-none">
                ОНЦЛОХ<br />БҮТЭЭГДЭХҮҮН
              </h2>
            </div>
            <Link
              href="/shop"
              className="text-xs text-zinc-500 hover:text-white tracking-[0.2em] uppercase flex items-center gap-1.5 transition-colors hidden sm:flex"
            >
              Бүгдийг харах <ArrowRight size={12} />
            </Link>
          </div>
          <ProductGrid products={featured as FullProduct[]} />
          <div className="mt-8 text-center sm:hidden">
            <Link href="/shop" className="text-xs text-zinc-500 hover:text-white tracking-widest uppercase inline-flex items-center gap-1.5 transition-colors">
              Бүгдийг харах <ArrowRight size={12} />
            </Link>
          </div>
        </section>
      )}

      {/* ── PRESALE BANNER ────────────────────────────────────────────────── */}
      {presale.length > 0 && (
        <section className="mx-4 sm:mx-6 my-4 rounded-xl border border-[#CA8A04]/25 bg-[#0A0A0A] overflow-hidden">
          <div className="max-w-7xl mx-auto px-8 sm:px-12 py-14 flex flex-col sm:flex-row items-center justify-between gap-8">
            <div>
              <p className="text-[10px] tracking-[0.5em] text-[#CA8A04] uppercase mb-3 font-medium">
                Limited Drop
              </p>
              <h2 className="font-heading text-3xl sm:text-4xl font-bold text-white mb-2">
                PRE-SALE НЭЭГДЛЭЭ
              </h2>
              <p className="text-sm text-zinc-500 mb-6 max-w-xs">
                Хязгаарлагдмал тоогоор урьдчилсан захиалга нээгдлээ. Яаравчлаарай!
              </p>
              <Link
                href="/shop?presale=true"
                className="inline-flex items-center gap-2 bg-[#CA8A04] hover:bg-[#D97706] text-black font-bold px-7 py-3 rounded transition-colors text-sm tracking-[0.1em] uppercase"
              >
                ЗАХИАЛАХ <ArrowRight size={14} />
              </Link>
            </div>
            {firstPresaleEnd && (
              <div className="flex-shrink-0">
                <p className="text-[10px] tracking-[0.3em] uppercase text-zinc-600 mb-3 text-center">
                  Дуусах хүртэл
                </p>
                <CountdownTimer endsAt={firstPresaleEnd} lang="mn" />
              </div>
            )}
          </div>
        </section>
      )}

      {/* ── NEW ARRIVALS ──────────────────────────────────────────────────── */}
      {newArrivals && newArrivals.length > 0 && (
        <section className="py-24 px-4 sm:px-6 max-w-7xl mx-auto">
          <div className="flex items-end justify-between mb-12">
            <div>
              <p className="text-[10px] tracking-[0.4em] text-zinc-500 uppercase mb-3">Latest</p>
              <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-bold text-white leading-none">
                ШИН ИРЭЛТ
              </h2>
            </div>
            <Link
              href="/shop?sort=newest"
              className="text-xs text-zinc-500 hover:text-white tracking-[0.2em] uppercase flex items-center gap-1.5 transition-colors hidden sm:flex"
            >
              Бүгдийг харах <ArrowRight size={12} />
            </Link>
          </div>
          <ProductGrid products={newArrivals as FullProduct[]} />
        </section>
      )}

      {/* ── BRAND STATEMENT ───────────────────────────────────────────────── */}
      <section className="relative min-h-[70vh] flex items-center justify-center overflow-hidden bg-black border-y border-white/[0.05]">
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: 'radial-gradient(ellipse 60% 50% at 50% 50%, #CA8A04 0%, transparent 70%)',
          }}
        />
        <div className="relative z-10 text-center px-6 max-w-4xl mx-auto">
          <p className="text-[10px] tracking-[0.6em] text-[#CA8A04] uppercase mb-8">Brand Statement</p>
          <blockquote className="font-heading text-[clamp(2rem,6vw,5rem)] font-bold text-white leading-[1.1] mb-8">
            "Монгол залуусын өмсгөл"
          </blockquote>
          <p className="text-sm sm:text-base text-zinc-500 max-w-md mx-auto leading-relaxed">
            Peretik бол Монголын гудамжны соёл, уламжлал хийгээд орчин үеийн тансаг байдлыг нэгтгэсэн streetwear брэнд. Бид зөвхөн хувцас биш, таны дуу хоолойг дамжуулна.
          </p>
          <Link
            href="/shop"
            className="inline-flex items-center gap-2 mt-10 text-xs text-[#CA8A04] hover:text-white border border-[#CA8A04]/30 hover:border-white/30 px-8 py-3 rounded transition-all uppercase tracking-[0.2em]"
          >
            Дэлгүүрлэх <ArrowRight size={13} />
          </Link>
        </div>
      </section>

    </div>
  )
}
