import { FormEvent, useState } from 'react'
import { Dialog, DialogContent, DialogTitle } from './ui/Dialog'
import { Input } from './ui/Input'
import { Button } from './ui/Button'
import { Select } from './ui/Select'
import { Link } from './ui/Link'

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

export default function CredentialsDialog() {
  const [hostUrl, setHostUrl] = useState(regionValues[0])
  const [hostName, setHostName] = useState('')

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

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const form = event.currentTarget
    const formData = new FormData(form)
    const token = formData.get('token') as string
    const host = hostUrl === 'other' ? hostName : hostUrl
    
    if (!token || (hostUrl === 'other' && !hostName)) return
    
    const url = new URL(window.location.href)
    url.searchParams.set('token', token)
    url.searchParams.set('host', host)
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

          <Button type="submit" size="large">
            View dashboard
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
