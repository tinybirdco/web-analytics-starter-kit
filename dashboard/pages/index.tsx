/* eslint-disable @next/next/no-img-element */
import Script from 'next/script'
import Header from '../components/Header'
import Footer from '../components/Footer'
import Widgets from '../components/Widgets'
import Credentials from '../components/Credentials'
import useAuth from '../lib/hooks/use-auth'
import Meta from '../components/Meta'
import ErrorModal from '../components/ErrorModal'

export default function DashboardPage() {
  const { isAuthenticated, isTokenValid } = useAuth()

  return (
    <>
      {process.env.NODE_ENV === 'production' && (
        <Script
          defer
          src="https://unpkg.com/@tinybirdco/flock.js"
          data-token={process.env.NEXT_PUBLIC_TINYBIRD_TRACKER_TOKEN}
        />
      )}
      <Meta />
      <div className="bg-body min-h-screen py-5 px-5 sm:px-10 text-sm leading-5 text-secondary">
        <div className="max-w-7xl mx-auto">
          <div className="space-y-6 sm:space-y-10">
            {isAuthenticated && isTokenValid && (
              <>
                <img src="/icon.png" alt="" width={24} height={24} />
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
