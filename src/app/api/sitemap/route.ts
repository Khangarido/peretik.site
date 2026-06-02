import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export const revalidate = 86400 // 24 hours

const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://peretik.site'

function url(path: string, priority: string, changefreq: string): string {
  return `
  <url>
    <loc>${SITE}${path}</loc>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`
}

export async function GET() {
  const supabase = await createClient()

  const { data: products } = await supabase
    .from('products')
    .select('slug, updated_at')
    .eq('status', 'active')
    .order('updated_at', { ascending: false })

  const staticUrls = [
    url('/', '1.0', 'daily'),
    url('/shop', '0.9', 'daily'),
  ].join('')

  const productUrls = (products ?? [])
    .map((p) => {
      const lastmod = p.updated_at ? `\n    <lastmod>${p.updated_at.slice(0, 10)}</lastmod>` : ''
      return `
  <url>
    <loc>${SITE}/shop/${p.slug}</loc>${lastmod}
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`
    })
    .join('')

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${staticUrls}${productUrls}
</urlset>`

  return new NextResponse(xml, {
    status: 200,
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=3600',
    },
  })
}
