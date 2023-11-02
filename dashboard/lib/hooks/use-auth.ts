import { useRouter } from 'next/router'
import { useAnalytics } from '../../components/Provider'
import config from '../config'

export default function useAuth() {
  const router = useRouter()

  let token, host
  if (config.host && config.authToken) {
    token = config.authToken
    host = config.host
  } else {
    const { token: tokenParam, host: hostParam } = router.query
    token = typeof tokenParam === 'string' ? tokenParam : undefined
    host = typeof hostParam === 'string' ? hostParam : undefined
  }

  const { error } = useAnalytics()
  const isTokenValid = !error || ![401, 403].includes(error.status ?? 0)
  const isAuthenticated = !!token && !!host
  return { isAuthenticated, token, host, isTokenValid }
}
