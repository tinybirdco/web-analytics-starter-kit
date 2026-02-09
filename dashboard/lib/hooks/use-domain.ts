import { useState } from 'react'
import useSWR from 'swr'
import { queryPipe } from '../api'
import { useLogin } from './use-login'

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
  const { isLoggedIn, isLoading: isAuthLoading } = useLogin()

  // Don't fetch if not logged in
  const shouldFetch = isLoggedIn && !isAuthLoading

  const { data } = useSWR(shouldFetch ? 'domain' : null, getDomain, {
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
