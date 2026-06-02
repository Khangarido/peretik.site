import * as React from 'react'
import { Html, Head, Body, Container, Section, Text, Heading, Hr, Link, Preview, Font } from '@react-email/components'
import type { Product } from '@/types'

interface Props {
  product: Product
  presale_price: number
  lang: 'mn' | 'en'
}

const copy = {
  mn: {
    preview: (name: string) => `${name}-н урьдчилсан захиалга эхэллээ!`,
    title: 'Урьдчилсан захиалга эхэллээ',
    body: (name: string) => `"${name}" бараанд урьдчилсан захиалга нээгдлээ. Хязгаарлагдмал тоо хэмжээ байгаа тул яаравчлаарай.`,
    priceLabel: 'Урьдчилсан захиалгын үнэ',
    cta: 'Одоо захиалах',
    footer: 'Энэ имэйлийг Peretik илгээсэн.',
  },
  en: {
    preview: (name: string) => `Pre-sale for ${name} is now live!`,
    title: 'Pre-Sale Now Live',
    body: (name: string) => `The pre-sale for "${name}" has just launched. Limited quantities available — secure yours now.`,
    priceLabel: 'Pre-Sale Price',
    cta: 'Pre-Order Now',
    footer: 'This email was sent by Peretik.',
  },
}

export function PresaleLive({ product, presale_price, lang }: Props) {
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
            <Text style={{ color: '#CA8A04', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.3em', margin: '0 0 12px' }}>PRE-SALE</Text>
            <Heading as="h2" style={{ color: '#FFFFFF', fontFamily: 'Georgia, serif', fontSize: '26px', fontWeight: 400, margin: '0 0 16px' }}>{name}</Heading>
            <Text style={{ color: '#71717A', fontSize: '14px', lineHeight: '22px', margin: '0 0 24px' }}>{t.body(name)}</Text>
            <Section style={{ backgroundColor: '#111', border: '1px solid rgba(202,138,4,0.3)', borderRadius: '6px', padding: '20px 24px', margin: '0 0 32px' }}>
              <Text style={{ color: '#71717A', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.1em', margin: '0 0 8px' }}>{t.priceLabel}</Text>
              <Text style={{ color: '#CA8A04', fontSize: '28px', fontWeight: 700, margin: 0 }}>{presale_price.toLocaleString()}₮</Text>
            </Section>
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
