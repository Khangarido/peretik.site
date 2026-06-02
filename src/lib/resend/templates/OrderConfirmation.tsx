import * as React from 'react'
import {
  Html, Head, Body, Container, Section, Text, Heading,
  Hr, Link, Preview, Row, Column, Font,
} from '@react-email/components'
import type { Order, OrderItem } from '@/types'

interface Props {
  order: Order
  items: OrderItem[]
  lang: 'mn' | 'en'
}

const copy = {
  mn: {
    preview: (id: string) => `Таны захиалга #${id} баталгаажлаа`,
    title: 'Захиалга баталгаажлаа',
    subtitle: (id: string) => `Захиалгын дугаар: #${id.slice(0, 8).toUpperCase()}`,
    itemsTitle: 'Захиалсан бараа',
    product: 'Бараа',
    qty: 'Тоо',
    price: 'Үнэ',
    total: 'Нийт дүн',
    status: 'Төлөв',
    cta: 'Захиалга харах',
    footer: 'Энэ имэйлийг Peretik илгээсэн.',
  },
  en: {
    preview: (id: string) => `Your order #${id} is confirmed`,
    title: 'Order Confirmed',
    subtitle: (id: string) => `Order #${id.slice(0, 8).toUpperCase()}`,
    itemsTitle: 'Order Items',
    product: 'Product',
    qty: 'Qty',
    price: 'Price',
    total: 'Total',
    status: 'Status',
    cta: 'View Order',
    footer: 'This email was sent by Peretik.',
  },
}

export function OrderConfirmation({ order, items, lang }: Props) {
  const t = copy[lang]
  return (
    <Html lang={lang}>
      <Head><Font fontFamily="Georgia" fallbackFontFamily="serif" /></Head>
      <Preview>{t.preview(order.id)}</Preview>
      <Body style={body}>
        <Container style={container}>
          <Section style={header}>
            <Heading style={logo}>PERETIK</Heading>
          </Section>
          <Section style={content}>
            <Heading as="h2" style={h2}>{t.title}</Heading>
            <Text style={subtitle}>{t.subtitle(order.id)}</Text>

            {/* Items table */}
            <Section style={tableWrap}>
              <Row style={tableHeader}>
                <Column style={colProduct}><Text style={thText}>{t.product}</Text></Column>
                <Column style={colQty}><Text style={thText}>{t.qty}</Text></Column>
                <Column style={colPrice}><Text style={thText}>{t.price}</Text></Column>
              </Row>
              {items.map((item) => (
                <Row key={item.id} style={tableRow}>
                  <Column style={colProduct}>
                    <Text style={tdText}>{item.product_name}</Text>
                    <Text style={variantText}>{item.variant_info}</Text>
                  </Column>
                  <Column style={colQty}><Text style={tdText}>{item.quantity}</Text></Column>
                  <Column style={colPrice}><Text style={tdText}>{(item.price * item.quantity).toLocaleString()}₮</Text></Column>
                </Row>
              ))}
            </Section>

            <Hr style={hr} />
            <Row>
              <Column><Text style={totalLabel}>{t.total}</Text></Column>
              <Column><Text style={totalValue}>{order.total.toLocaleString()}₮</Text></Column>
            </Row>

            <Section style={ctaSection}>
              <Link href={`https://peretik.site/orders`} style={ctaBtn}>{t.cta}</Link>
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
const container: React.CSSProperties = { maxWidth: '600px', margin: '0 auto', backgroundColor: '#0D0D0D', borderRadius: '8px', overflow: 'hidden' }
const header: React.CSSProperties = { backgroundColor: '#000', padding: '32px 40px 24px', borderBottom: '1px solid rgba(255,255,255,0.08)' }
const logo: React.CSSProperties = { color: '#CA8A04', fontFamily: 'Georgia, serif', fontSize: '28px', letterSpacing: '0.15em', margin: 0 }
const content: React.CSSProperties = { padding: '40px' }
const h2: React.CSSProperties = { color: '#FFFFFF', fontFamily: 'Georgia, serif', fontSize: '22px', fontWeight: 400, margin: '0 0 4px' }
const subtitle: React.CSSProperties = { color: '#71717A', fontSize: '12px', letterSpacing: '0.1em', margin: '0 0 24px' }
const tableWrap: React.CSSProperties = { border: '1px solid rgba(255,255,255,0.08)', borderRadius: '6px', overflow: 'hidden' }
const tableHeader: React.CSSProperties = { backgroundColor: '#111111', borderBottom: '1px solid rgba(255,255,255,0.08)' }
const tableRow: React.CSSProperties = { borderBottom: '1px solid rgba(255,255,255,0.05)' }
const thText: React.CSSProperties = { color: '#71717A', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.1em', margin: '10px 12px' }
const tdText: React.CSSProperties = { color: '#FFFFFF', fontSize: '13px', margin: '10px 12px 4px' }
const variantText: React.CSSProperties = { color: '#71717A', fontSize: '11px', margin: '0 12px 10px' }
const colProduct: React.CSSProperties = { width: '60%' }
const colQty: React.CSSProperties = { width: '15%' }
const colPrice: React.CSSProperties = { width: '25%' }
const hr: React.CSSProperties = { borderColor: 'rgba(255,255,255,0.08)', margin: '24px 0' }
const totalLabel: React.CSSProperties = { color: '#71717A', fontSize: '13px', margin: 0 }
const totalValue: React.CSSProperties = { color: '#CA8A04', fontSize: '18px', fontWeight: 700, margin: 0, textAlign: 'right' as const }
const ctaSection: React.CSSProperties = { textAlign: 'center', margin: '32px 0' }
const ctaBtn: React.CSSProperties = { backgroundColor: '#CA8A04', color: '#000000', padding: '14px 36px', borderRadius: '4px', fontWeight: 600, fontSize: '13px', textDecoration: 'none', display: 'inline-block' }
const footer: React.CSSProperties = { color: '#3F3F46', fontSize: '11px', textAlign: 'center' }
