'use client'

import { useAnalytics } from '../../components/Provider'
import config from '../config'

export default function useAuth() {
  const token = config.authToken
  const host = config.host

  const { error } = useAnalytics()
  const isTokenValid = !error || ![401, 403].includes(error.status ?? 0)
  const isAuthenticated = !!token && !!host

  return { isAuthenticated, token, host, isTokenValid }
}
