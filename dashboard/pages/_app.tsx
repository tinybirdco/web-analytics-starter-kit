import type { AppProps } from 'next/app'
import AnalyticsProvider from '../components/Provider'
import '../styles/globals.css'

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <AnalyticsProvider>
      <Component {...pageProps} />
    </AnalyticsProvider>
  )
}

export default MyApp
