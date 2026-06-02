import { NextRequest, NextResponse } from 'next/server'
import { resend, FROM } from '@/lib/resend/client'
import { WelcomeMail } from '@/lib/resend/templates/WelcomeMail'

export async function POST(req: NextRequest) {
  try {
    const { email, full_name, lang } = await req.json()

    if (!email || !full_name) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const { error } = await resend.emails.send({
      from: FROM,
      to: [email],
      subject: lang === 'mn' ? 'Peretik-д тавтай морилно уу!' : 'Welcome to Peretik!',
      react: WelcomeMail({ full_name, lang: lang ?? 'mn' }),
    })

    if (error) {
      console.error('[email/welcome]', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[email/welcome]', err)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
