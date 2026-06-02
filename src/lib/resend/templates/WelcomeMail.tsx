import * as React from 'react'
import {
  Html, Head, Body, Container, Section, Text, Heading,
  Hr, Link, Preview, Font,
} from '@react-email/components'

interface Props {
  full_name: string
  lang: 'mn' | 'en'
}

const copy = {
  mn: {
    preview: 'Peretik-д тавтай морилно уу!',
    greeting: (name: string) => `Сайн байна уу, ${name}!`,
    body: 'Peretik-д бүртгүүлсэнд баярлалаа. Монголын streetwear-ийн тансаг брэнд рүү тавтай морилно уу.',
    cta: 'Дэлгүүрлэх',
    footer: 'Энэ имэйлийг Peretik илгээсэн.',
  },
  en: {
    preview: 'Welcome to Peretik!',
    greeting: (name: string) => `Hello, ${name}!`,
    body: 'Thank you for joining Peretik — Mongolia\'s premier luxury streetwear brand. We\'re excited to have you.',
    cta: 'Shop Now',
    footer: 'This email was sent by Peretik.',
  },
}

export function WelcomeMail({ full_name, lang }: Props) {
  const t = copy[lang]
  return (
    <Html lang={lang}>
      <Head>
        <Font fontFamily="Georgia" fallbackFontFamily="serif" />
      </Head>
      <Preview>{t.preview}</Preview>
      <Body style={body}>
        <Container style={container}>
          <Section style={header}>
            <Heading style={logo}>PERETIK</Heading>
          </Section>
          <Section style={content}>
            <Heading as="h2" style={h2}>{t.greeting(full_name)}</Heading>
            <Text style={text}>{t.body}</Text>
            <Section style={ctaSection}>
              <Link href="https://peretik.site/shop" style={ctaBtn}>{t.cta}</Link>
            </Section>
            <Hr style={hr} />
            <Text style={footer}>{t.footer}</Text>
          </Section>
        </Container>
      </Body>
    </Html>
  )
}

const body: React.CSSProperties = { backgroundColor: '#000000', fontFamily: 'Montserrat, sans-serif' }
const container: React.CSSProperties = { maxWidth: '560px', margin: '0 auto', backgroundColor: '#0D0D0D', borderRadius: '8px', overflow: 'hidden' }
const header: React.CSSProperties = { backgroundColor: '#000', padding: '32px 40px 24px', borderBottom: '1px solid rgba(255,255,255,0.08)' }
const logo: React.CSSProperties = { color: '#CA8A04', fontFamily: 'Georgia, serif', fontSize: '28px', letterSpacing: '0.15em', margin: 0 }
const content: React.CSSProperties = { padding: '40px' }
const h2: React.CSSProperties = { color: '#FFFFFF', fontFamily: 'Georgia, serif', fontSize: '22px', fontWeight: 400, margin: '0 0 16px' }
const text: React.CSSProperties = { color: '#71717A', fontSize: '14px', lineHeight: '22px', margin: '0 0 24px' }
const ctaSection: React.CSSProperties = { textAlign: 'center', margin: '32px 0' }
const ctaBtn: React.CSSProperties = { backgroundColor: '#CA8A04', color: '#000000', padding: '14px 36px', borderRadius: '4px', fontFamily: 'Montserrat, sans-serif', fontWeight: 600, fontSize: '13px', letterSpacing: '0.1em', textDecoration: 'none', display: 'inline-block' }
const hr: React.CSSProperties = { borderColor: 'rgba(255,255,255,0.08)', margin: '32px 0 16px' }
const footer: React.CSSProperties = { color: '#3F3F46', fontSize: '11px', textAlign: 'center' }
