import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Providers } from '@/components/providers'
import { Navigation } from '@/components/navigation'
import { LayoutWithAds } from '@/components/layout-with-ads'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
      title: 'Workomadic - Remote Work Spots Directory',
  description: 'Find the best remote work spots in NYC, Austin, and beyond. Discover cafes, coworking spaces, and more with detailed reviews and amenities.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>
          <Navigation />
          <LayoutWithAds>
            {children}
          </LayoutWithAds>
        </Providers>
      </body>
    </html>
  )
}
