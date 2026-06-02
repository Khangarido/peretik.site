import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  try {
    const { code, subtotal } = await req.json()

    if (!code || typeof subtotal !== 'number') {
      return NextResponse.json({ valid: false, error: 'Missing code or subtotal' }, { status: 400 })
    }

    const supabase = await createAdminClient()

    const { data: coupon, error } = await supabase
      .from('coupons')
      .select('*')
      .eq('code', String(code).toUpperCase().trim())
      .eq('is_active', true)
      .single()

    if (error || !coupon) {
      return NextResponse.json({ valid: false, error: 'Купон олдсонгүй' })
    }

    // Check expiry
    if (coupon.expires_at && new Date(coupon.expires_at) < new Date()) {
      return NextResponse.json({ valid: false, error: 'Купоны хугацаа дууссан' })
    }

    // Check usage limit
    if (coupon.usage_limit !== null && coupon.used_count >= coupon.usage_limit) {
      return NextResponse.json({ valid: false, error: 'Купон ашиглагдсан хязгаарт хүрсэн' })
    }

    const discount_amount =
      coupon.discount_type === 'percent'
        ? Math.floor(subtotal * (coupon.value / 100))
        : Math.min(coupon.value, subtotal)

    const final_total = Math.max(0, subtotal - discount_amount)

    return NextResponse.json({
      valid: true,
      code: coupon.code,
      discount_type: coupon.discount_type,
      value: coupon.value,
      discount_amount,
      final_total,
    })
  } catch (err) {
    console.error('[coupons/validate]', err)
    return NextResponse.json({ valid: false, error: 'Server error' }, { status: 500 })
  }
}
