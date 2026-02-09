'use client'

import useSWR from 'swr'
import { useCallback } from 'react'

const fetcher = (url: string) => fetch(url).then(res => res.json())

export function useLogin() {
  const { data, error, isLoading, mutate } = useSWR('/api/auth', fetcher, {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
  })

  const logout = useCallback(async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    mutate({ authenticated: false }, false)
  }, [mutate])

  return {
    isLoggedIn: data?.authenticated ?? false,
    isLoading,
    error,
    logout,
  }
}
