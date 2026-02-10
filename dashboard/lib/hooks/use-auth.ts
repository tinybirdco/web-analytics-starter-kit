'use client'

import useSWR from 'swr'
import { useAnalytics } from '../../components/Provider'

const fetcher = (url: string) => fetch(url).then(res => res.json())

export default function useAuth() {
  const { data, isLoading } = useSWR('/api/config', fetcher, {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
  })

  const { error } = useAnalytics()
  const isTokenValid = !error || ![401, 403].includes(error.status ?? 0)
  const isAuthenticated = data?.configured ?? false
  const missingVars = data?.missing ?? []

  return { isAuthenticated, isTokenValid, isLoading, missingVars }
}
