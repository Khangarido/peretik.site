import * as React from 'react'
import { Html, Head, Body, Container, Section, Text, Heading, Hr, Link, Preview, Font } from '@react-email/components'
import type { Product } from '@/types'

interface Props {
  product: Product
  lang: 'mn' | 'en'
}

const copy = {
  mn: {
    preview: (name: string) => `${name} дахин нөөцтэй боллоо!`,
    title: 'Хүслийн жагсаалтын бараа нөөцтэй боллоо',
    body: (name: string) => `Та хүслийн жагсаалтдаа нэмсэн "${name}" бараа дахин нөөцтэй боллоо. Хурдан аваарай!`,
    cta: 'Одоо авах',
    footer: 'Энэ имэйлийг Peretik илгээсэн.',
  },
  en: {
    preview: (name: string) => `${name} is back in stock!`,
    title: 'Your Wishlisted Item Is Back',
    body: (name: string) => `Good news — "${name}" from your wishlist is back in stock. Grab it before it sells out again!`,
    cta: 'Shop Now',
    footer: 'This email was sent by Peretik.',
  },
}

export function Restock({ product, lang }: Props) {
  const t = copy[lang]
  const name = lang === 'mn' ? product.name_mn : product.name_en
  return (
    <Html lang={lang}>
      <Head><Font fontFamily="Georgia" fallbackFontFamily="serif" /></Head>
      <Preview>{t.preview(name)}</Preview>
      <Body style={{ backgroundColor: '#000000', fontFamily: 'Montserrat, sans-serif' }}>
        <Container style={{ maxWidth: '560px', margin: '0 auto', backgroundColor: '#0D0D0D', borderRadius: '8px', overflow: 'hidden' }}>
          <Section style={{ backgroundColor: '#000', padding: '32px 40px 24px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
            <Heading style={{ color: '#CA8A04', fontFamily: 'Georgia, serif', fontSize: '28px', letterSpacing: '0.15em', margin: 0 }}>PERETIK</Heading>
          </Section>
          <Section style={{ padding: '40px' }}>
            <Heading as="h2" style={{ color: '#FFFFFF', fontFamily: 'Georgia, serif', fontSize: '22px', fontWeight: 400, margin: '0 0 16px' }}>{t.title}</Heading>
            <Text style={{ color: '#71717A', fontSize: '14px', lineHeight: '22px', margin: '0 0 32px' }}>{t.body(name)}</Text>
            <Section style={{ textAlign: 'center', margin: '0 0 32px' }}>
              <Link href={`https://peretik.site/shop/${product.slug}`} style={{ backgroundColor: '#CA8A04', color: '#000000', padding: '14px 36px', borderRadius: '4px', fontWeight: 600, fontSize: '13px', textDecoration: 'none', display: 'inline-block' }}>{t.cta}</Link>
            </Section>
            <Hr style={{ borderColor: 'rgba(255,255,255,0.08)', margin: '0 0 16px' }} />
            <Text style={{ color: '#3F3F46', fontSize: '11px', textAlign: 'center' }}>{t.footer}</Text>
          </Section>
        </Container>
      </Body>
    </Html>
  )
}
