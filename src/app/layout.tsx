import type { Metadata } from 'next'
import { Cormorant_Garamond, Montserrat } from 'next/font/google'
import './globals.css'
import { Providers } from './providers'

const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  style: ['normal', 'italic'],
  variable: '--font-heading',
  display: 'swap',
  preload: true,
})

const montserrat = Montserrat({
  subsets: ['latin', 'latin-ext'],
  weight: ['300', '400', '500', '600', '700', '800'],
  variable: '--font-body',
  display: 'swap',
  preload: true,
})

export const metadata: Metadata = {
  title: {
    default: 'Peretik',
    template: '%s | Peretik',
  },
  description: 'Mongolian Streetwear Brand',
  metadataBase: new URL('https://peretik.site'),
  openGraph: {
    title: 'Peretik',
    description: 'Mongolian Streetwear Brand',
    url: 'https://peretik.site',
    siteName: 'Peretik',
    locale: 'mn_MN',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Peretik',
    description: 'Mongolian Streetwear Brand',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="mn" className={`h-full ${cormorant.variable} ${montserrat.variable}`} suppressHydrationWarning>
      <body className="min-h-full bg-black text-white antialiased font-body">
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
