import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient, createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  const sessionClient = await createClient()
  const { data: { user } } = await sessionClient.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const admin = await createAdminClient()
  const { data: profile } = await admin.from('users').select('role').eq('id', user.id).single()
  if (profile?.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const formData = await request.formData()
  const file = formData.get('file')
  const slug = formData.get('slug')
  if (!(file instanceof File) || typeof slug !== 'string') return NextResponse.json({ error: 'Image and product name are required' }, { status: 400 })

  const extension = file.name.split('.').pop()?.toLowerCase() ?? 'jpg'
  const path = `products/${slug}/${crypto.randomUUID()}.${extension}`
  const { error } = await admin.storage.from('product-images').upload(path, file, { cacheControl: '3600', upsert: false })
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })

  const { data } = admin.storage.from('product-images').getPublicUrl(path)
  return NextResponse.json({ url: data.publicUrl })
}
