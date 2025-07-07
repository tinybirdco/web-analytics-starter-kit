import type { Metadata } from 'next'
import AnalyticsProvider from '../components/Provider'
import '../styles/globals.css'
import { Suspense } from 'react'

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
    <html lang="en">
      <Suspense>
        <body>
          <AnalyticsProvider>{children}</AnalyticsProvider>
        </body>
      </Suspense>
    </html>
  )
}
