import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { product_id, session_id, duration_seconds, event_type, device_type, metadata } = body

    if (!event_type || !session_id) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    const user_id = user?.id ?? null

    const now = new Date().toISOString()

    // Insert into product_views for 'view' events
    if (event_type === 'view' && product_id) {
      await supabase.from('product_views').insert({
        product_id,
        user_id,
        session_id,
        duration_seconds: duration_seconds ?? 0,
        device_type: device_type ?? 'unknown',
        created_at: now,
      })
    }

    // Insert into page_events for all events
    await supabase.from('page_events').insert({
      type: event_type,
      product_id: product_id ?? null,
      user_id,
      session_id,
      metadata: metadata ?? null,
      created_at: now,
    })

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[analytics/track]', err)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
