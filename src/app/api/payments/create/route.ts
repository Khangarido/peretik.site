import { NextRequest, NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import { createPayment } from '@/lib/byl/client'
import { variantPrice } from '@/types'

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { items, shipping, coupon_id, total } = body

    if (!items?.length || !shipping || !total) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const admin = await createAdminClient()

    // 1. Create order
    const { data: order, error: orderError } = await admin
      .from('orders')
      .insert({
        user_id: user.id,
        status: 'pending',
        total,
        coupon_id: coupon_id ?? null,
        shipping_info: shipping,
      })
      .select()
      .single()

    if (orderError || !order) {
      return NextResponse.json({ error: orderError?.message ?? 'Order creation failed' }, { status: 500 })
    }

    // 2. Insert order items
    const orderItems = items.map((item: {
      variant_id: string
      quantity: number
      price: number
      product_name: string
      variant_info: string
    }) => ({
      order_id: order.id,
      variant_id: item.variant_id,
      quantity: item.quantity,
      price: item.price,
      product_name: item.product_name,
      variant_info: item.variant_info,
    }))

    await admin.from('order_items').insert(orderItems)

    // 3. Decrement stock for each variant (best-effort via RPC)
    for (const item of items) {
      try {
        await admin.rpc('decrement_variant_stock', {
          variant_id: item.variant_id,
          qty: item.quantity,
        })
      } catch { /* RPC may not exist yet */ }
    }

    // 4. Initiate BYL payment
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://peretik.site'

    const payment = await createPayment({
      orderId: order.id,
      amount: total,
      description: `Peretik захиалга #${order.id.slice(0, 8).toUpperCase()}`,
      callbackUrl: `${siteUrl}/checkout/success?order_id=${order.id}`,
      returnUrl: `${siteUrl}/checkout/cancel?order_id=${order.id}`,
    })

    // 5. Save payment ID
    await admin
      .from('orders')
      .update({ byl_payment_id: payment.payment_id })
      .eq('id', order.id)

    return NextResponse.json({
      order_id: order.id,
      payment_url: payment.payment_url,
    })
  } catch (err) {
    console.error('[payments/create]', err)
    // If BYL fails, still return order_id so user can retry
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
