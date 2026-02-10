'use client'

import useSWR from 'swr'
import { useSearchParams } from 'next/navigation'
import { useCallback } from 'react'

export interface StoredCredentials {
  token: string
  host: string
  tenantId?: string
}

export function getStoredCredentials(): StoredCredentials | null {
  if (typeof window === 'undefined') return null
  try {
    const searchParams = new URLSearchParams(window.location.search)
    const token = searchParams.get('token')
    const host = searchParams.get('host')
    if (token && host) {
      return {
        token,
        host,
        tenantId: searchParams.get('tenant_id') || undefined,
      }
    }
    return null
  } catch {
    return null
  }
}

function createFetcher(token: string | null, host: string | null) {
  return (url: string) => {
    const headers: HeadersInit = {}
    if (token && host) {
      headers['X-Tinybird-Token'] = token
      headers['X-Tinybird-Host'] = host
    }
    return fetch(url, { headers }).then(res => res.json())
  }
}

export function useLogin() {
  const searchParams = useSearchParams()

  // Check URL params for token auth
  const token = searchParams?.get('token')
  const host = searchParams?.get('host')
  const hasTokenAuth = !!token && !!host

  // Create fetcher with token/host to pass as headers
  const fetcher = createFetcher(token, host)

  // Check server session auth
  const { data, error, isLoading: isSessionLoading, mutate } = useSWR(
    '/api/auth',
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    }
  )

  const logout = useCallback(async () => {
    // Clear URL params
    const url = new URL(window.location.href)
    url.searchParams.delete('token')
    url.searchParams.delete('host')
    url.searchParams.delete('tenant_id')

    // Also logout from server session if authenticated
    if (data?.authenticated) {
      await fetch('/api/auth/logout', { method: 'POST' })
      mutate({ authenticated: false }, false)
    }

    // Navigate to URL without token params
    window.location.href = url.toString()
  }, [data?.authenticated, mutate])

  const isSessionAuth = data?.authenticated ?? false

  return {
    isLoggedIn: isSessionAuth || hasTokenAuth,
    isSessionAuth,
    isTokenAuth: hasTokenAuth,
    isLoading: isSessionLoading,
    error,
    logout,
  }
}
