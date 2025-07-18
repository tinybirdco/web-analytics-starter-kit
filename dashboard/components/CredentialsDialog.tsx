import { FormEvent, useState } from 'react'
import { Dialog, DialogContent, DialogTitle } from './ui/Dialog'
import { Input } from './ui/Input'
import { Button } from './ui/Button'
import { Select } from './ui/Select'
import { Link } from './ui/Link'
import { SignJWT } from 'jose'

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

// Helper to decode JWT and extract host key
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

// Helper to decode JWT and extract workspace id (u attribute)
export const extractWorkspaceIdFromToken = (token: string): string | undefined => {
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

// Create JWT function in TypeScript (browser-safe)
export async function createJwt(token: string, tenant_id: string): Promise<string> {
  const expiration_time = Math.floor(Date.now() / 1000) + 3 * 60 * 60 // 3 hours from now
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
    'analytics_hits',
    'domain',
    'current_visitors',
    'web_vitals_current',
    'web_vitals_routes',
    'web_vitals_distribution',
    'web_vitals_events',
  ]

  const datasources_resources = ['analytics_events', 'analytics_pages_mv', 'analytics_sessions_mv', 'analytics_sources_mv', 'tenant_actions_mv', 'tenant_domains_mv']

  const datasources_scopes = datasources_resources.map(resource => ({
    type: 'DATASOURCES:READ',
    resource,
    filter: `tenant_id = '${tenant_id}'`
  }))

  const payload = {
    workspace_id: workspace_id,
    name: 'frontend_jwt',
    exp: expiration_time,
    scopes: [...resources.map(resource => ({
      type: 'PIPES:READ',
      resource,
      fixed_params: {
        tenant_id: tenant_id,
      },
    })), ...datasources_scopes],
  }
  const key = new TextEncoder().encode(token)
  return await new SignJWT(payload as any)
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime(expiration_time)
    .sign(key)
}

export default function CredentialsDialog() {
  const [hostUrl, setHostUrl] = useState(regionValues[0])
  const [hostName, setHostName] = useState('')
  const [tenantId, setTenantId] = useState('')

  const handleTokenChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const token = e.target.value
    const hostKey = extractHostFromToken(token)
    if (hostKey && regionMap[hostKey]) {
      setHostUrl(regionMap[hostKey])
      setHostName('')
    } else if (hostKey) {
      setHostUrl('other')
      setHostName(hostKey)
    } else {
      setHostUrl('other')
      setHostName('')
    }
  }

  const handleHostNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setHostName(e.target.value)
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const form = event.currentTarget
    const formData = new FormData(form)
    const token = formData.get('token') as string
    const host = hostUrl === 'other' ? hostName : hostUrl
    const tenant_id = formData.get('tenant_id') as string
    
    if (!token || (hostUrl === 'other' && !hostName)) return
    
    let jwt = token
    jwt = await createJwt(token, tenant_id || '')
    
    const url = new URL(window.location.href)
    url.searchParams.set('token', jwt)
    url.searchParams.set('host', host)
    if (tenant_id) url.searchParams.set('tenant_id', tenant_id)
    window.location.href = url.toString()
  }

  const hostOptions = [
    ...regionValues.map(value => ({
      value,
      label: value,
    })),
    { value: 'other', label: 'Other' },
  ]

  return (
    <Dialog open={true}>
      <DialogContent>
        <DialogTitle>Add your credentials</DialogTitle>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label>Token</label>
            <Input
              name="token"
              placeholder="Paste your 'dashboard' token"
              onChange={handleTokenChange}
            />
            <Link
              href="https://cloud.tinybird.co/tokens"
              target="_blank"
              rel="noopener noreferrer"
            >
              Get your dashboard token
            </Link>
          </div>

          <div className="space-y-1">
            <label>Host</label>
            <Select
              options={hostOptions}
              value={hostUrl}
              onValueChange={setHostUrl}
              width="full"
            />
          </div>

          {hostUrl === 'other' && (
            <div className="space-y-1">
              <label>Host name</label>
              <Input
                name="hostName"
                placeholder="Host name"
                value={hostName}
                onChange={handleHostNameChange}
              />
            </div>
          )}

          <div className="space-y-1">
            <label>Tenant ID</label>
            <Input
              name="tenant_id"
              placeholder="Leave empty for default tenant"
              value={tenantId}
              onChange={e => setTenantId(e.target.value)}
            />
          </div>

          <Button type="submit" size="large">
            View dashboard
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
