import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { getResend, FROM } from '@/lib/resend/client'
import { ShippingUpdate } from '@/lib/resend/templates/ShippingUpdate'

export async function POST(req: NextRequest) {
  try {
    const { order_id, lang } = await req.json()

    if (!order_id) {
      return NextResponse.json({ error: 'Missing order_id' }, { status: 400 })
    }

    const supabase = await createAdminClient()

    const { data: order, error } = await supabase
      .from('orders')
      .select('*, user:users(email, full_name)')
      .eq('id', order_id)
      .single()

    if (error || !order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    const tracking = order.tracking_code ?? order.tracking_number ?? ''
    const userEmail = (order.user as { email: string } | null)?.email

    if (!userEmail) {
      return NextResponse.json({ error: 'No user email' }, { status: 400 })
    }

    const resend = getResend()

    const { error: emailError } = await resend.emails.send({
      from: FROM,
      to: [userEmail],
      subject: lang === 'mn' ? 'Таны захиалга илгээгдлээ!' : 'Your order has shipped!',
      react: ShippingUpdate({ order, tracking_code: tracking, lang: lang ?? 'mn' }),
    })

    if (emailError) {
      return NextResponse.json({ error: emailError.message }, { status: 500 })
    }

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[email/shipping-update]', err)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
