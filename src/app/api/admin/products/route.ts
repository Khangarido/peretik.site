import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient, createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  const sessionClient = await createClient()
  const { data: { user } } = await sessionClient.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const admin = await createAdminClient()
  const { data: profile } = await admin.from('users').select('role').eq('id', user.id).single()
  if (profile?.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { product, variants, images } = await request.json()
  let slug = product.slug as string
  let suffix = 2
  while (true) {
    const { data: existing } = await admin.from('products').select('id').eq('slug', slug).maybeSingle()
    if (!existing) break
    slug = `${product.slug}-${suffix++}`
  }

  const { data: created, error } = await admin.from('products').insert({ ...product, slug }).select('id').single()
  if (error || !created) return NextResponse.json({ error: error?.message ?? 'Unable to create product' }, { status: 400 })

  if (images.length) await admin.from('product_images').insert(images.map((url: string, sort_order: number) => ({ product_id: created.id, url, sort_order })))
  if (variants.length) await admin.from('variants').insert(variants.map((variant: Record<string, unknown>) => ({ ...variant, product_id: created.id })))

  return NextResponse.json({ id: created.id })
}
