import { NextRequest, NextResponse } from 'next/server'
import { resend, FROM } from '@/lib/resend/client'
import { OrderConfirmation } from '@/lib/resend/templates/OrderConfirmation'
import { createAdminClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  try {
    const { order_id, email, lang } = await req.json()

    if (!order_id || !email) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const supabase = await createAdminClient()

    // Fetch order
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('*')
      .eq('id', order_id)
      .single()

    if (orderError || !order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    // Fetch order items
    const { data: items, error: itemsError } = await supabase
      .from('order_items')
      .select('*')
      .eq('order_id', order_id)

    if (itemsError) {
      return NextResponse.json({ error: 'Failed to fetch order items' }, { status: 500 })
    }

    const { error } = await resend.emails.send({
      from: FROM,
      to: [email],
      subject: lang === 'mn' ? `Захиалга #${order_id.slice(0, 8).toUpperCase()} баталгаажлаа` : `Order #${order_id.slice(0, 8).toUpperCase()} Confirmed`,
      react: OrderConfirmation({ order, items: items ?? [], lang: lang ?? 'mn' }),
    })

    if (error) {
      console.error('[email/order-confirm]', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[email/order-confirm]', err)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
