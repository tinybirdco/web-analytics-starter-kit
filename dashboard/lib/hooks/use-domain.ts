import { useState } from 'react'
import useSWR from 'swr'
import { queryPipe } from '../api'

const FALLBACK_LOGO = '/fallback-logo.png'

async function getDomain(): Promise<{ domain: string; logo: string }> {
  const { data } = await queryPipe<{ domain: string }[]>('domain')
  const domain = data?.[0]?.domain
  const logo = domain ? `https://${domain}/favicon.ico` : FALLBACK_LOGO

  return {
    domain: domain || 'domain.com',
    logo,
  }
}

export default function useDomain() {
  const [logo, setLogo] = useState(FALLBACK_LOGO)

  const { data } = useSWR('domain', getDomain, {
    onSuccess: ({ logo }) => setLogo(logo),
  })

  const handleLogoError = () => {
    setLogo(FALLBACK_LOGO)
  }

  return {
    domain: data?.domain ?? 'domain.com',
    logo,
    handleLogoError,
  }
}
