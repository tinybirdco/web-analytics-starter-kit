'use client'

import { FormEvent, useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/Dialog'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Select } from '@/components/ui/Select'
import { Link } from '@/components/ui/Link'
import { Text } from '@/components/ui/Text'
import { Loader } from '@/components/ui/Loader'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/Tabs'
import { SignJWT } from 'jose'

type AuthMode = 'signin' | 'token'

const regionMap: Record<string, string> = {
  'gcp-europe-west2': 'https://api.europe-west2.gcp.tinybird.co',
  eu_shared: 'https://api.tinybird.co',
  us_east: 'https://api.us-east.tinybird.co',
  'gcp-northamerica-northeast2':
    'https://api.northamerica-northeast2.gcp.tinybird.co',
  'us-east-aws': 'https://api.us-east.aws.tinybird.co',
  'aws-us-west-2': 'https://api.us-west-2.aws.tinybird.co',
  'aws-eu-central-1': 'https://api.eu-central-1.aws.tinybird.co',
  'aws-eu-west-1': 'https://api.eu-west-1.aws.tinybird.co',
  localhost: 'http://127.0.0.1:8001',
  local: 'http://localhost:7181',
}

const regionValues = Object.values(regionMap)

const extractHostFromToken = (token: string): string | undefined => {
  try {
    const payload = token.split('.')[1]
    if (!payload) return undefined
    const base64 =
      payload.replace(/-/g, '+').replace(/_/g, '/') +
      '==='.slice((payload.length + 3) % 4)
    const json = atob(base64)
    const data = JSON.parse(json)
    return data.host
  } catch {
    return undefined
  }
}

export const extractWorkspaceIdFromToken = (
  token: string
): string | undefined => {
  try {
    const payload = token.split('.')[1]
    if (!payload) return undefined
    const base64 =
      payload.replace(/-/g, '+').replace(/_/g, '/') +
      '==='.slice((payload.length + 3) % 4)
    const json = atob(base64)
    const data = JSON.parse(json)
    return data.u
  } catch {
    return undefined
  }
}

export async function createJwt(
  token: string,
  tenant_id: string
): Promise<string> {
  const expiration_time = Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60
  const workspace_id = extractWorkspaceIdFromToken(token)
  const resources = [
    'domains',
    'top_sources',
    'top_devices',
    'kpis',
    'top_locations',
    'top_browsers',
    'top_pages',
    'trend',
    'domain',
    'current_visitors',
    'web_vitals_current',
    'web_vitals_routes',
    'web_vitals_distribution',
    'web_vitals_events',
    'web_vitals_timeseries',
    'analytics_hits',
    'actions',
  ]

  const datasources_resources = [
    'analytics_events',
    'tenant_actions_mv',
    'tenant_domains_mv',
  ]

  const filter = tenant_id ? `tenant_id = '${tenant_id}'` : ''
  const fixed_params = tenant_id ? { tenant_id } : {}
  const datasources_scopes = datasources_resources.map(resource => ({
    type: 'DATASOURCES:READ',
    resource,
    filter,
  }))

  const payload = {
    workspace_id: workspace_id,
    name: 'frontend_jwt',
    exp: expiration_time,
    scopes: [
      ...resources.map(resource => ({
        type: 'PIPES:READ',
        resource,
        fixed_params,
      })),
      ...datasources_scopes,
    ],
  }
  const key = new TextEncoder().encode(token)
  return await new SignJWT(payload as any)
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime(expiration_time)
    .sign(key)
}

interface AuthDialogProps {
  isLoading?: boolean
  defaultMode?: AuthMode
}

export default function AuthDialog({
  isLoading: isCheckingAuth,
  defaultMode = 'signin',
}: AuthDialogProps) {
  const [mode, setMode] = useState<AuthMode>(defaultMode)

  // Sign in state
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [signInError, setSignInError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Token state
  const [hostUrl, setHostUrl] = useState(regionValues[0])
  const [hostName, setHostName] = useState('')
  const [tenantId, setTenantId] = useState('')
  const [tokenHasHost, setTokenHasHost] = useState(true)

  async function handleSignIn(e: React.FormEvent) {
    e.preventDefault()
    setSignInError('')
    setIsSubmitting(true)

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      })

      if (response.ok) {
        window.location.reload()
      } else {
        const data = await response.json()
        setSignInError(data.error || 'Invalid credentials')
        setIsSubmitting(false)
      }
    } catch {
      setSignInError('An error occurred. Please try again.')
      setIsSubmitting(false)
    }
  }

  const handleTokenChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const token = e.target.value
    const hostKey = extractHostFromToken(token)

    if (hostKey) {
      setTokenHasHost(true)
      if (regionMap[hostKey]) {
        setHostUrl(regionMap[hostKey])
        setHostName('')
      } else {
        setHostUrl('other')
        setHostName(hostKey)
      }
    } else {
      setTokenHasHost(false)
      setHostUrl(regionValues[0])
      setHostName('')
    }
  }

  const handleTokenSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const form = event.currentTarget
    const formData = new FormData(form)
    const token = formData.get('token') as string
    const host = hostUrl === 'other' ? hostName : hostUrl
    const tenant_id = formData.get('tenant_id') as string

    if (!token || (hostUrl === 'other' && !hostName)) return

    // Fetch workspace info using the admin token before creating scoped JWT
    let workspaceName: string | undefined
    try {
      const workspaceUrl = new URL('/v1/workspace', host)
      const response = await fetch(workspaceUrl.toString(), {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (response.ok) {
        const data = await response.json()
        workspaceName = data.name
      }
    } catch {
      // Workspace fetch failed, continue without it
    }

    const jwt = await createJwt(token, tenant_id || '')

    // Navigate to URL with token params (including workspace name)
    const url = new URL(window.location.href)
    url.searchParams.set('token', jwt)
    url.searchParams.set('host', host)
    if (tenant_id) url.searchParams.set('tenant_id', tenant_id)
    if (workspaceName) url.searchParams.set('workspace', workspaceName)
    window.location.href = url.toString()
  }

  const hostOptions = [
    ...regionValues.map(value => ({
      value,
      label: value,
    })),
    { value: 'other', label: 'Other' },
  ]

  if (isCheckingAuth) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/75 backdrop-blur-[3px]">
        <Loader />
      </div>
    )
  }

  return (
    <Dialog open={true}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Access Dashboard</DialogTitle>
          <DialogDescription>
            Sign in with your credentials or use a Tinybird token directly.
          </DialogDescription>
        </DialogHeader>

        <Tabs value={mode} onValueChange={value => setMode(value as AuthMode)}>
          <TabsList>
            <TabsTrigger value="signin">Sign in</TabsTrigger>
            <TabsTrigger value="token">Tinybird Token</TabsTrigger>
          </TabsList>

          <TabsContent value="signin">
            <form
              onSubmit={handleSignIn}
              className="space-y-6"
              autoComplete="off"
            >
              <div className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="dashboard-username">
                    <Text variant="captionsemibold" color="default">
                      Username
                    </Text>
                  </label>
                  <Input
                    id="dashboard-username"
                    name="dashboard-username"
                    type="text"
                    value={username}
                    onChange={e => setUsername(e.target.value)}
                    placeholder="Enter username"
                    required
                    autoComplete="off"
                    autoFocus
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="dashboard-password">
                    <Text variant="captionsemibold" color="default">
                      Password
                    </Text>
                  </label>
                  <Input
                    id="dashboard-password"
                    name="dashboard-password"
                    type="password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="Enter password"
                    required
                    autoComplete="new-password"
                  />
                  {!!signInError && (
                    <Text variant="body" as="p" color="error">
                      {signInError}
                    </Text>
                  )}
                </div>
              </div>
              <div className="w-full flex justify-end">
                <Button
                  type="submit"
                  size="large"
                  isLoading={isSubmitting}
                  disabled={!username || !password}
                >
                  Sign in
                </Button>
              </div>
            </form>
          </TabsContent>
          <TabsContent value="token">
            <form onSubmit={handleTokenSubmit} className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <label>
                    <Text variant="captionsemibold" color="default">
                      Token
                    </Text>
                  </label>
                  <Input
                    name="token"
                    required={true}
                    placeholder="Paste your workspace admin token"
                    onChange={handleTokenChange}
                  />
                  <Link
                    href="https://cloud.tinybird.co/tokens"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block text-sm"
                  >
                    Get your admin token
                  </Link>
                </div>

                {!tokenHasHost && (
                  <>
                    <div className="space-y-2">
                      <label>
                        <Text variant="captionsemibold" color="default">
                          Host
                        </Text>
                      </label>
                      <Select
                        options={hostOptions}
                        value={hostUrl}
                        onValueChange={setHostUrl}
                        width="full"
                      />
                    </div>

                    {hostUrl === 'other' && (
                      <div className="space-y-2">
                        <label>
                          <Text variant="captionsemibold" color="default">
                            Host name
                          </Text>
                        </label>
                        <Input
                          name="hostName"
                          placeholder="Host name"
                          value={hostName}
                          onChange={e => setHostName(e.target.value)}
                        />
                      </div>
                    )}
                  </>
                )}

                <div className="space-y-2">
                  <label>
                    <Text variant="captionsemibold" color="default">
                      Tenant ID (optional)
                    </Text>
                  </label>
                  <Input
                    name="tenant_id"
                    placeholder="Leave empty for default tenant"
                    value={tenantId}
                    onChange={e => setTenantId(e.target.value)}
                  />
                </div>
              </div>
              <div className="w-full flex justify-end">
                <Button type="submit" size="large">
                  View dashboard
                </Button>
              </div>
            </form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
