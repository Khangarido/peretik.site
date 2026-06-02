import * as React from 'react'
import { Html, Head, Body, Container, Section, Text, Heading, Hr, Link, Preview, Font } from '@react-email/components'

interface Props {
  reset_url: string
  lang: 'mn' | 'en'
}

const copy = {
  mn: {
    preview: 'Peretik нууц үг сэргээх холбоос',
    title: 'Нууц үг сэргээх',
    body: 'Та нууц үг сэргээхийг хүсэлтээ илгээлээ. Доорх товчийг дарж нууц үгээ шинэчлэнэ үү. Хэрэв та энэ хүсэлтийг өөрөө явуулаагүй бол энэ имэйлийг үл тоомсорлоорой.',
    cta: 'Нууц үг сэргээх',
    expiry: 'Энэ холбоос 24 цагийн дараа хүчингүй болно.',
    footer: 'Энэ имэйлийг Peretik илгээсэн.',
  },
  en: {
    preview: 'Reset your Peretik password',
    title: 'Password Reset',
    body: 'You requested a password reset. Click the button below to set a new password. If you didn\'t request this, you can safely ignore this email.',
    cta: 'Reset Password',
    expiry: 'This link expires in 24 hours.',
    footer: 'This email was sent by Peretik.',
  },
}

export function PasswordReset({ reset_url, lang }: Props) {
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
            <Text style={{ color: '#71717A', fontSize: '14px', lineHeight: '22px', margin: '0 0 32px' }}>{t.body}</Text>
            <Section style={{ textAlign: 'center', margin: '0 0 24px' }}>
              <Link href={reset_url} style={{ backgroundColor: '#CA8A04', color: '#000000', padding: '14px 36px', borderRadius: '4px', fontWeight: 600, fontSize: '13px', textDecoration: 'none', display: 'inline-block' }}>{t.cta}</Link>
            </Section>
            <Text style={{ color: '#52525B', fontSize: '12px', textAlign: 'center', margin: '0 0 24px' }}>{t.expiry}</Text>
            <Hr style={{ borderColor: 'rgba(255,255,255,0.08)', margin: '0 0 16px' }} />
            <Text style={{ color: '#3F3F46', fontSize: '11px', textAlign: 'center' }}>{t.footer}</Text>
          </Section>
        </Container>
      </Body>
    </Html>
  )
}
