/* eslint-disable @next/next/no-img-element */
import Script from 'next/script'
import Header from '../components/Header'
import Footer from '../components/Footer'
import Widgets from '../components/Widgets'
import Credentials from '../components/Credentials'
import useAuth from '../lib/hooks/use-auth'
import Meta from '../components/Meta'
import ErrorModal from '../components/ErrorModal'
import config from '../lib/config'

export default function DashboardPage() {
  const { isAuthenticated, isTokenValid } = useAuth()

  return (
    <>
      {process.env.NODE_ENV === 'production' && (
        <Script
          defer
          src="https://unpkg.com/@tinybirdco/flock.js"
          data-token={config.trackerToken}
        />
      )}
      <Meta />
      {/* <div className="h-12 bg-primary text-sm leading-5 text-secondary flex items-center justify-center gap-2">
        📊{' '}
        <div>
          <span className="font-semibold">Tinybird Charts</span>: Create
          in-product analytics or internal dashboards in minutes.{' '}
          <a
            href="https://www.tinybird.co/docs/publish/charts"
            className="underline"
          >
            Learn more
          </a>
        </div>
      </div> */}
      <div className="min-h-screen px-5 py-5 text-sm leading-5 bg-body sm:px-10 text-secondary">
        <div className="mx-auto max-w-7xl">
          <div className="space-y-6 sm:space-y-10">
            {isAuthenticated && isTokenValid && (
              <>
                <img src="/icon.svg" alt="" width={24} height={24} />
                <Header />
              </>
            )}
            <main>
              {isAuthenticated && !isTokenValid && <ErrorModal />}
              {isAuthenticated && isTokenValid && <Widgets />}
              {!isAuthenticated && <Credentials />}
            </main>
          </div>
          {isAuthenticated && (
            <div className="mt-20">
              <Footer />
            </div>
          )}
        </div>
      </div>
    </>
  )
}
