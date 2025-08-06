import useSWR from 'swr'
import { queryPipe } from '../api'

export type Domain = {
  domain: string
  first_seen: string
  last_seen: string
  total_hits: number
}

export function useDomains(tenant_id: string = '') {
  const fetcher = async () => {
    const params = tenant_id ? { tenant_id } : {}
    const { data } = await queryPipe<Domain[]>('domains', params)
    return data
  }

  const { data, error, isLoading } = useSWR(['domains', tenant_id], fetcher, {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
  })

  return {
    domains: data,
    error,
    isLoading,
  }
} 