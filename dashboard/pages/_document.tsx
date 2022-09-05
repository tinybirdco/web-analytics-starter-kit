import { Html, Head, Main, NextScript } from 'next/document'
import Script from 'next/script'

export default function Document() {
  return (
    <Html>
      <Head />
      <body>
        <Main />
        <NextScript />
        {process.env.NODE_ENV === 'production' && (
          <Script
            src="https://unpkg.com/@tinybirdco/flock.js"
            data-token={process.env.NEXT_PUBLIC_TINYBIRD_TRACKER_TOKEN}
            strategy="beforeInteractive"
          />
        )}
      </body>
    </Html>
  )
}
