import type { Metadata } from 'next'
import AnalyticsProvider from '../components/Provider'
import '../styles/globals.css'
import { Suspense } from 'react'
import { Inter } from 'next/font/google'
import localFont from 'next/font/local'

const sans = Inter({
  variable: '--font-family-sans',
  subsets: ['latin'],
  fallback: ['system-ui']
})

const mono = localFont({
  variable: '--font-family-iawriter',
  src: '../assets/fonts/iawritermonos-regular.woff2',
  display: 'swap'
})

export const metadata: Metadata = {
  title: 'Tinybird Analytics Dashboard',
  description:
    'Create in-product analytics or internal dashboards in minutes with Tinybird Charts',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${sans.variable} ${mono.variable}`}>
      <Suspense>
        <body>
          <AnalyticsProvider>{children}</AnalyticsProvider>
        </body>
      </Suspense>
    </html>
  )
}
