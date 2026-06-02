import { NextRequest, NextResponse } from 'next/server'
import { createHmac } from 'crypto'
import { createAdminClient } from '@/lib/supabase/server'

function verifySignature(rawBody: string, signature: string, secret: string): boolean {
  try {
    const expected = createHmac('sha256', secret).update(rawBody).digest('hex')
    return expected === signature
  } catch {
    return false
  }
}

export async function POST(req: NextRequest) {
  const rawBody = await req.text()
  const signature = req.headers.get('x-byl-signature') ?? ''
  const secret = process.env.BYL_WEBHOOK_SECRET ?? ''

  if (secret && !verifySignature(rawBody, signature, secret)) {
    console.warn('[byl webhook] Invalid signature')
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
  }

  let payload: Record<string, unknown>
  try {
    payload = JSON.parse(rawBody)
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const orderId = payload.order_id as string | undefined
  const status = payload.status as string | undefined // 'success' | 'failed' | 'cancelled'
  const bylPaymentId = payload.payment_id as string | undefined

  if (!orderId) {
    return NextResponse.json({ error: 'Missing order_id' }, { status: 400 })
  }

  const supabase = await createAdminClient()

  const isSuccess = status === 'success' || status === 'paid'
  const newStatus = isSuccess ? 'paid' : 'cancelled'

  const { data: order, error: fetchError } = await supabase
    .from('orders')
    .select('*, users(email, lang)')
    .eq('id', orderId)
    .single()

  if (fetchError || !order) {
    console.error('[byl webhook] Order not found', orderId)
    return NextResponse.json({ error: 'Order not found' }, { status: 404 })
  }

  // Update order status and byl payment id
  const { error: updateError } = await supabase
    .from('orders')
    .update({
      status: newStatus,
      ...(bylPaymentId ? { byl_payment_id: bylPaymentId } : {}),
    })
    .eq('id', orderId)

  if (updateError) {
    console.error('[byl webhook] Failed to update order', updateError)
    return NextResponse.json({ error: 'Update failed' }, { status: 500 })
  }

  // Send confirmation email on success
  if (isSuccess) {
    try {
      const userEmail = (order.users as { email: string; lang: string } | null)?.email
      const userLang = (order.users as { email: string; lang: string } | null)?.lang ?? 'mn'
      if (userEmail) {
        await fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/email/order-confirm`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ order_id: orderId, email: userEmail, lang: userLang }),
        })
      }
    } catch (emailErr) {
      console.error('[byl webhook] Failed to send confirmation email', emailErr)
      // Non-fatal — order is already updated
    }
  }

  return NextResponse.json({ ok: true })
}
