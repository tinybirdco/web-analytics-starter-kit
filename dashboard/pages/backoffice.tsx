
/* eslint-disable @next/next/no-img-element */
import Script from 'next/script'
import Header from '../components/Header'
import Footer from '../components/Footer'
import Widgets from '../components/Widgets'
import Credentials from '../components/Credentials'
import useAuth from '../lib/hooks/use-auth'
import Meta from '../components/Meta'
import ErrorModal from '../components/ErrorModal'


function LinkList({ links }) {
  const { token } = useAuth()
  return (
    <ul>
      {links.map((link, index) => (
        <li key={index}>
          <a href={"/company_website?client_id=" + link +"&seed=" + (index+100) + "&token=" + token  } target="_blank" rel="noopener noreferrer">
            {link}
          </a>
          <a href={"/?client_id=" + link  + "&token=" + token + "&host=https://ui.tinybird.co"  } target="_blank" rel="noopener noreferrer">
            · backoffice
          </a>
        </li>
      ))}
    </ul>
  );
}


const company_names = [
  "Velocity Racing Dynamics",
  "TurboCharge Motorsports",
  "NitroShift Innovations",
  "RapidRide Racing",
  "ApexSpeed Solutions",
  "Dragster Dynamics",
  "TrackTorch Technologies",
  "RaceLine Innovators",
  "Adrenaline AutoWorks",
  "FusionSpeed Racing"
];

function HomePage() {
  return (
    <div>
      <h1>Links</h1>
      <LinkList links={company_names} />
    </div>
  );
}


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
              {isAuthenticated && isTokenValid && <HomePage/>}
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
