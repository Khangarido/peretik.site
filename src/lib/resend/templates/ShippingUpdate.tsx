import * as React from 'react'
import { Html, Head, Body, Container, Section, Text, Heading, Hr, Link, Preview, Font } from '@react-email/components'
import type { Order } from '@/types'

interface Props {
  order: Order
  tracking_code: string
  lang: 'mn' | 'en'
}

const copy = {
  mn: {
    preview: 'Таны захиалга илгээгдлээ!',
    title: 'Захиалга илгээгдлээ',
    body: 'Таны захиалга илгээгдлээ. Доорх хяналтын кодоор илгээлтээ хянаарай.',
    trackingLabel: 'Хяналтын код',
    cta: 'Захиалга харах',
    footer: 'Энэ имэйлийг Peretik илгээсэн.',
  },
  en: {
    preview: 'Your order has shipped!',
    title: 'Your Order Has Shipped',
    body: 'Great news — your order is on its way. Use the tracking code below to follow your shipment.',
    trackingLabel: 'Tracking Code',
    cta: 'View Order',
    footer: 'This email was sent by Peretik.',
  },
}

export function ShippingUpdate({ order, tracking_code, lang }: Props) {
  const t = copy[lang]
  return (
    <Html lang={lang}>
      <Head><Font fontFamily="Georgia" fallbackFontFamily="serif" /></Head>
      <Preview>{t.preview}</Preview>
      <Body style={{ backgroundColor: '#000000', fontFamily: 'Montserrat, sans-serif' }}>
        <Container style={{ maxWidth: '560px', margin: '0 auto', backgroundColor: '#0D0D0D', borderRadius: '8px', overflow: 'hidden' }}>
          <Section style={{ backgroundColor: '#000', padding: '32px 40px 24px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
            <Heading style={{ color: '#CA8A04', fontFamily: 'Georgia, serif', fontSize: '28px', letterSpacing: '0.15em', margin: 0 }}>PERETIK</Heading>
          </Section>
          <Section style={{ padding: '40px' }}>
            <Heading as="h2" style={{ color: '#FFFFFF', fontFamily: 'Georgia, serif', fontSize: '22px', fontWeight: 400, margin: '0 0 16px' }}>{t.title}</Heading>
            <Text style={{ color: '#71717A', fontSize: '14px', lineHeight: '22px', margin: '0 0 24px' }}>{t.body}</Text>
            <Section style={{ backgroundColor: '#111', border: '1px solid rgba(202,138,4,0.3)', borderRadius: '6px', padding: '20px 24px', margin: '0 0 24px' }}>
              <Text style={{ color: '#71717A', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.1em', margin: '0 0 8px' }}>{t.trackingLabel}</Text>
              <Text style={{ color: '#CA8A04', fontSize: '20px', fontFamily: 'monospace', fontWeight: 700, margin: 0 }}>{tracking_code}</Text>
            </Section>
            <Section style={{ textAlign: 'center', margin: '32px 0' }}>
              <Link href={`https://peretik.site/orders`} style={{ backgroundColor: '#CA8A04', color: '#000000', padding: '14px 36px', borderRadius: '4px', fontWeight: 600, fontSize: '13px', textDecoration: 'none', display: 'inline-block' }}>{t.cta}</Link>
            </Section>
            <Hr style={{ borderColor: 'rgba(255,255,255,0.08)', margin: '24px 0 16px' }} />
            <Text style={{ color: '#3F3F46', fontSize: '11px', textAlign: 'center' }}>{t.footer}</Text>
          </Section>
        </Container>
      </Body>
    </Html>
  )
}
