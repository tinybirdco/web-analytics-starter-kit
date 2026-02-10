import useSWR from 'swr'
import { queryPipe } from '../api'
import { useSearchParams } from 'next/navigation'
import { useLogin } from './use-login'

export function useEndpoint<T>(
  pipeName: string,
  params: Record<string, string | number | boolean> = {}
) {
  const searchParams = useSearchParams()
  const { isLoggedIn, isLoading: isAuthLoading } = useLogin()

  let mergedParams = { ...params }
  if (searchParams) {
    const date_from = searchParams.get('date_from')
    const date_to = searchParams.get('date_to')
    const domain = searchParams.get('domain')
    if (date_from && !('date_from' in params)) mergedParams.date_from = date_from
    if (date_to && !('date_to' in params)) mergedParams.date_to = date_to
    if (domain && domain !== 'ALL' && !('domain' in params)) mergedParams.domain = domain
  }

  const fetcher = async () => {
    const { data } = await queryPipe<T>(pipeName, mergedParams)
    return data
  }

  // Don't fetch if not logged in (SWR skips fetch when key is null)
  const shouldFetch = isLoggedIn && !isAuthLoading

  const { data, error, isLoading, mutate } = useSWR(
    shouldFetch ? [pipeName, mergedParams] : null,
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    }
  )

  return {
    data,
    error,
    isLoading: isAuthLoading || isLoading,
    mutate,
  }
}
