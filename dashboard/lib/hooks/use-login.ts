'use client'

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

export function useLogin() {
  const searchParams = useSearchParams()
  const hasTokenAuth =
    !!searchParams?.get('token') && !!searchParams?.get('host')

  const logout = useCallback(() => {
    const url = new URL(window.location.href)
    for (const param of ['token', 'host', 'tenant_id', 'workspace']) {
      url.searchParams.delete(param)
    }
    window.location.href = url.toString()
  }, [])

  // Credential availability is synchronous; data hooks still consume isLoading.
  return { isLoggedIn: hasTokenAuth, isLoading: false, logout }
}
