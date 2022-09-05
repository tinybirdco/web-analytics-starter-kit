import Image from 'next/image'
import { GetServerSideProps } from 'next'
import Header from '../components/Header'
import Footer from '../components/Footer'
import Widgets from '../components/Widgets'
import Credentials from '../components/Credentials'
import useAuth from '../lib/hooks/use-auth'
import Meta from '../components/Meta'
import ErrorModal from '../components/ErrorModal'

export default function DashboardPage({ host }: { host: string }) {
  const { isAuthenticated, isTokenValid } = useAuth()

  return (
    <>
      <Meta host={host} />
      <div className="bg-body min-h-screen py-5 px-5 sm:px-10 text-sm leading-5 text-secondary">
        <div className="max-w-7xl mx-auto">
          <div className="space-y-6 sm:space-y-10">
            <Image src="/icon.png" alt="Logo" width={24} height={24} />
            {isAuthenticated && isTokenValid && <Header />}
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

export const getServerSideProps: GetServerSideProps = async ({ req }) => {
  const { host } = req.headers
  if (!host) {
    return {
      props: {
        host: '',
      },
    }
  }
  const protocol = /^localhost(:\d+)?$/.test(host) ? 'http' : 'https'
  return {
    props: { host: `${protocol}://${host}` },
  }
}
