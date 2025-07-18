'use client'

import { useSearchParams } from 'next/navigation'
import { useAnalytics } from '../../components/Provider'
import config from '../config'

export default function useAuth() {
  const searchParams = useSearchParams()

  let token, host
  if (config.host && config.authToken) {
    token = config.authToken
    host = config.host
  } else {
    token = searchParams?.get('token') || undefined
    host = searchParams?.get('host') || undefined
  }

  const { error } = useAnalytics()
  const isTokenValid = !error || ![401, 403].includes(error.status ?? 0)
  const isAuthenticated = !!token && !!host
  return { isAuthenticated, token, host, isTokenValid }
}
