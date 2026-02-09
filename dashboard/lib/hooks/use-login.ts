'use client'

import useSWR from 'swr'

const fetcher = (url: string) => fetch(url).then(res => res.json())

export function useLogin() {
  const { data, error, isLoading } = useSWR('/api/auth/status', fetcher, {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
  })

  return {
    isLoggedIn: data?.authenticated ?? false,
    isLoading,
    error,
  }
}
