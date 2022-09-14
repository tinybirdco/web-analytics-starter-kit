/* eslint-disable @next/next/no-img-element */
import CurrentVisitors from './CurrentVisitors'
import DateFilter from './DateFilter'
import useDomain from '../lib/hooks/use-domain'

export default function Header() {
  const { domain, logo, handleLogoError } = useDomain()

  return (
    <header className="flex justify-between">
      <div className="flex flex-col gap-2 md:flex-row md:gap-10">
        <h1 className="flex items-center gap-2 min-w-max">
          <img
            src={logo}
            alt=""
            width={16}
            height={16}
            onError={handleLogoError}
            loading="lazy"
          />
          <span className="text-lg leading-6">{domain}</span>
        </h1>
        <CurrentVisitors />
      </div>
      <DateFilter />
    </header>
  )
}
