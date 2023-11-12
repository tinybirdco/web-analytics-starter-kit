import { useState, useEffect } from 'react'
import useSWR from 'swr'
import { querySQL } from '../api'
import { DomainData, DomainQueryData } from '../types/domain'

const FALLBACK_LOGO = '/fallback-logo.png';

interface DomainResponse {
  domain: string | null;
  logo: string;
}

export default function useDomain() {
  const [clientDomain, setClientDomain] = useState<string | null>(null);
  const [logo, setLogo] = useState(FALLBACK_LOGO);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const domainFromParam = params.get('client_id');
    setClientDomain(domainFromParam);
    if (domainFromParam) {
      setLogo(`https://${domainFromParam}/favicon.ico`);
    }
  }, []);

  const { data } = useSWR(clientDomain ? null : 'domain', clientDomain ? null : getDomain, {
    onSuccess: ({ logo }:DomainResponse ) => {
      if (!clientDomain) {
        setLogo(logo);
      }
    },
  });

  const handleLogoError = () => {
    setLogo(FALLBACK_LOGO);
  };

  return {
    domain: data?.domain ?? clientDomain ?? 'domain.com',
    logo,
    handleLogoError,
  };
}

async function getDomain(): Promise<DomainData> {
  // Guess the instrumented domain, and exclude other domains like development or staging.
  //  - Try to get the domain with most hits from the last hour.
  //  - Fallback to 'some' domain.
  // Best balance between data accuracy and performance I can get.
  const { data } = await querySQL<DomainQueryData>(`
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
  `)
  const domain = data[0]['domain'];
  const logo = domain
    ? `https://${domain}/favicon.ico`
    : FALLBACK_LOGO

  return {
    domain,
    logo: domain ? `https://${domain}/favicon.ico` : FALLBACK_LOGO,
  }
}
