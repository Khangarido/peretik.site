import { createHmac } from 'crypto'

const BYL_API_URL = 'https://api.byl.mn'
const BYL_API_KEY = process.env.BYL_API_KEY ?? ''
const BYL_WEBHOOK_SECRET = process.env.BYL_WEBHOOK_SECRET ?? ''

export interface BylCreatePaymentParams {
  orderId: string
  amount: number
  description: string
  callbackUrl: string
  returnUrl?: string
}

export interface BylPaymentResult {
  payment_url: string
  payment_id: string
}

/**
 * Create a BYL.mn payment session.
 * Returns a redirect URL and a payment_id for tracking.
 */
export async function createPayment(
  params: BylCreatePaymentParams
): Promise<BylPaymentResult> {
  const res = await fetch(`${BYL_API_URL}/v1/payments`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${BYL_API_KEY}`,
    },
    body: JSON.stringify({
      reference: params.orderId,
      amount: params.amount,
      description: params.description,
      callback_url: params.callbackUrl,
      return_url: params.returnUrl ?? params.callbackUrl,
    }),
  })

  if (!res.ok) {
    const body = await res.text()
    throw new Error(`BYL payment error ${res.status}: ${body}`)
  }

  const data = await res.json()

  return {
    payment_url: data.payment_url ?? data.url,
    payment_id: data.payment_id ?? data.id,
  }
}

/**
 * Verify an incoming BYL webhook HMAC-SHA256 signature.
 * The signature header is typically 'x-byl-signature'.
 */
export function verifyWebhookSignature(payload: string, signature: string): boolean {
  if (!BYL_WEBHOOK_SECRET) return false
  try {
    const expected = createHmac('sha256', BYL_WEBHOOK_SECRET).update(payload).digest('hex')
    return expected === signature
  } catch {
    return false
  }
}

/**
 * @deprecated Use verifyWebhookSignature instead.
 */
export async function verifyBylWebhook(payload: string, signature: string): Promise<boolean> {
  return verifyWebhookSignature(payload, signature)
}

/**
 * @deprecated Use createPayment instead.
 */
export async function createBylPayment(params: {
  amount: number
  orderId: string
  description: string
  callbackUrl: string
  returnUrl: string
}): Promise<{ payment_url: string; payment_id: string }> {
  return createPayment(params)
}
