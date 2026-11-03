export const SESSION_COOKIE_NAME = 'dashboard_session'
export const SESSION_MAX_AGE = 60 * 60 * 24 * 7 // 7 days

export interface DashboardCredentials {
  username: string
  password: string
}

const encoder = new TextEncoder()
const decoder = new TextDecoder()

export function getDashboardCredentials(): DashboardCredentials | null {
  const password = process.env.DASHBOARD_PASSWORD
  if (!password) {
    return null
  }
  return { username: process.env.DASHBOARD_USERNAME || 'admin', password }
}

function toBase64Url(bytes: Uint8Array): string {
  let binary = ''
  bytes.forEach(byte => {
    binary += String.fromCharCode(byte)
  })
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

function fromBase64Url(value: string): Uint8Array {
  const base64 =
    value.replace(/-/g, '+').replace(/_/g, '/') +
    '==='.slice((value.length + 3) % 4)
  return Uint8Array.from(atob(base64), char => char.charCodeAt(0))
}

function getSigningKey(credentials: DashboardCredentials): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    'raw',
    encoder.encode(`${credentials.username}:${credentials.password}`),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign', 'verify']
  )
}

export async function createSessionToken(
  credentials: DashboardCredentials
): Promise<string> {
  const payload = toBase64Url(
    encoder.encode(
      JSON.stringify({
        username: credentials.username,
        exp: Date.now() + SESSION_MAX_AGE * 1000,
      })
    )
  )
  const key = await getSigningKey(credentials)
  const signature = await crypto.subtle.sign(
    'HMAC',
    key,
    encoder.encode(payload)
  )
  return `${payload}.${toBase64Url(new Uint8Array(signature))}`
}

export async function verifySessionToken(
  sessionToken: string | undefined
): Promise<boolean> {
  const credentials = getDashboardCredentials()
  if (!credentials || !sessionToken) {
    return false
  }

  const [payload, signature, ...rest] = sessionToken.split('.')
  if (!payload || !signature || rest.length > 0) {
    return false
  }

  try {
    const key = await getSigningKey(credentials)
    const isValidSignature = await crypto.subtle.verify(
      'HMAC',
      key,
      fromBase64Url(signature),
      encoder.encode(payload)
    )
    if (!isValidSignature) {
      return false
    }

    const { username, exp } = JSON.parse(decoder.decode(fromBase64Url(payload)))
    return (
      username === credentials.username &&
      typeof exp === 'number' &&
      exp > Date.now()
    )
  } catch {
    return false
  }
}
