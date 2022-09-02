import { useState } from 'react'
import useSWR from 'swr'
import { querySQL } from '../api'
import { DomainData, DomainQueryData } from '../types/domain'

async function getDomain(): Promise<DomainData> {
  const { data } = await querySQL<DomainQueryData>(
    'SELECT href FROM analytics_hits ORDER BY timestamp DESC LIMIT 1 FORMAT JSON'
  )
  const results =
    /^(?:https?:\/\/)?(?:[^@\n]+@)?(?:www\.)?([^:\/\n\?\=]+)/g.exec(
      data[0]['href']
    )
  const domain = results?.length ? results[1] : null
  const logo = domain
    ? `https://s2.googleusercontent.com/s2/favicons?domain=${domain}`
    : FALLBACK_LOGO

  return {
    domain,
    logo,
  }
}

const FALLBACK_LOGO = '/fallback-logo.png'

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
