import type { Metadata, Viewport } from 'next'
import { site } from '@/config/site'
import SmoothScroll from '@/components/ui/SmoothScroll'
import Cursor from '@/components/ui/Cursor'
import './globals.css'

export const metadata: Metadata = {
  title: `${site.firstName} — ${site.eyebrow.split(' / ')[0]} / ${site.eyebrow.split(' / ')[1]} ${site.year}`,
  description: site.intro.paragraphs[0],
  openGraph: {
    title: `${site.firstName} — Portfolio ${site.year}`,
    description: site.intro.paragraphs[0],
    type: 'website',
  },
}

export const viewport: Viewport = {
  themeColor: '#f3f1eb',
  colorScheme: 'light',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link
          rel="preload"
          href="/fonts/archivo-latin.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
      </head>
      <body>
        <SmoothScroll />
        <Cursor />
        <a
          href="#intro"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:bg-ink focus:px-4 focus:py-2 focus:text-paper"
        >
          Skip to content
        </a>
        {children}
      </body>
    </html>
  )
}
