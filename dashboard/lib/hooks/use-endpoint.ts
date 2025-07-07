import useSWR from 'swr'
import { queryPipe, getConfig } from '../api'
import { useSearchParams } from 'next/navigation'

export function useEndpoint<T>(
  pipeName: string,
  params: Record<string, string | number | boolean> = {}
) {
  const searchParams = useSearchParams()

  let mergedParams = { ...params }
  if (searchParams) {
    const date_from = searchParams.get('date_from')
    const date_to = searchParams.get('date_to')
    if (date_from && !('date_from' in params)) mergedParams.date_from = date_from
    if (date_to && !('date_to' in params)) mergedParams.date_to = date_to
  }

  const fetcher = async () => {
    const { data } = await queryPipe<T>(pipeName, mergedParams)
    return data
  }

  const { data, error, isLoading, mutate } = useSWR(
    [pipeName, mergedParams],
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    }
  )

  return {
    data,
    error,
    isLoading,
    mutate,
  }
}
