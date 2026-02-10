'use client'

import useSWR from 'swr'
import { useCallback, useEffect, useState } from 'react'

const STORAGE_KEY = 'tinybird_credentials'

export interface WorkspaceInfo {
  name: string
  id?: string
}

export interface StoredCredentials {
  token: string
  host: string
  tenantId?: string
  workspace?: WorkspaceInfo
}

export function getStoredCredentials(): StoredCredentials | null {
  if (typeof window === 'undefined') return null
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (!stored) return null
    return JSON.parse(stored)
  } catch {
    return null
  }
}

export function setStoredCredentials(credentials: StoredCredentials): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(credentials))
}

export function clearStoredCredentials(): void {
  localStorage.removeItem(STORAGE_KEY)
}

const fetcher = (url: string) => fetch(url).then(res => res.json())

export function useLogin() {
  const [hasTokenAuth, setHasTokenAuth] = useState(false)
  const [isTokenChecked, setIsTokenChecked] = useState(false)

  // Check for localStorage token on mount
  useEffect(() => {
    const credentials = getStoredCredentials()
    setHasTokenAuth(!!credentials?.token && !!credentials?.host)
    setIsTokenChecked(true)
  }, [])

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
    // Clear localStorage credentials
    clearStoredCredentials()
    setHasTokenAuth(false)

    // Also logout from server session if authenticated
    if (data?.authenticated) {
      await fetch('/api/auth/logout', { method: 'POST' })
      mutate({ authenticated: false }, false)
    }

    // Force reload to show login dialog
    window.location.reload()
  }, [data?.authenticated, mutate])

  const isSessionAuth = data?.authenticated ?? false
  const isLoading = isSessionLoading || !isTokenChecked

  return {
    isLoggedIn: isSessionAuth || hasTokenAuth,
    isSessionAuth,
    isTokenAuth: hasTokenAuth,
    isLoading,
    error,
    logout,
  }
}
