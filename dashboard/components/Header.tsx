import Image from 'next/image'
import CurrentVisitors from './CurrentVisitors'
import DateSelector from './DateSelector'
import useDomain from '../lib/hooks/use-domain'

export default function Header() {
  const { domain, logo, handleLogoError } = useDomain()

  return (
    <header className="flex justify-between">
      <div className="flex flex-col gap-2 md:flex-row md:gap-10">
        <h1 className="flex items-center gap-2">
          <Image
            src={logo}
            alt=""
            width={16}
            height={16}
            onError={handleLogoError}
          />
          <span className="text-lg leading-6">{domain}</span>
        </h1>
        <CurrentVisitors />
      </div>
      <div className="min-w-[165px]">
        <DateSelector />
      </div>
    </header>
  )
}
