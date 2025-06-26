import { useState } from 'react'
import useSWR from 'swr'
import { querySQL, queryPipe, getConfig } from '../api'
import { DomainData, DomainQueryData } from '../types/domain'

async function getDomain(): Promise<DomainData> {
  const { token } = getConfig();
  let data;
  if (token && token.startsWith('p.ey')) {
    // Use SQL for 'dashboard' tokens
    ({ data } = await querySQL<DomainQueryData>(`
      with (
        SELECT nullif(domainWithoutWWW(href),'') as domain
        FROM analytics_hits
        where timestamp >= now() - interval 1 hour
        group by domain
        order by count(1) desc
        limit 1
      ) as top_domain,
      (
        SELECT domainWithoutWWW(href)
        FROM analytics_hits
        where href not like '%localhost%'
        limit 1
      ) as some_domain
      select coalesce(top_domain, some_domain) as domain format JSON
    `));
  } else {
    // Use pipe for non-dashboard tokens
    ({ data } = await queryPipe<DomainQueryData>('domain'));
  }
  const domain = data[0]['domain'];
  const logo = domain
    ? `https://${domain}/favicon.ico`
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
