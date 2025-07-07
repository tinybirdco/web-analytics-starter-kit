'use client'

import { FormEvent, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { SelectBox, SelectBoxItem, TextInput, Button } from '@tremor/react'

const regionMap: Record<string, string> = {
  "gcp-europe-west2": "https://api.europe-west2.gcp.tinybird.co",
  "eu_shared": "https://api.tinybird.co",
  "us_east": "https://api.us-east.tinybird.co",
  "gcp-northamerica-northeast2": "https://api.northamerica-northeast2.gcp.tinybird.co",
  "us-east-aws": "https://api.us-east.aws.tinybird.co",
  "aws-us-west-2": "https://api.us-west-2.aws.tinybird.co",
  "aws-eu-central-1": "https://api.eu-central-1.aws.tinybird.co",
  "aws-eu-west-1": "https://api.eu-west-1.aws.tinybird.co",
  "localhost": "http://127.0.0.1:8001",
  "local": "http://localhost:7181"
}

const regionValues = Object.values(regionMap)

export default function CredentialsForm() {
  const router = useRouter()
  const [hostUrl, setHostUrl] = useState(regionValues[0])
  const [hostName, setHostName] = useState('')

  // Helper to decode JWT and extract host key
  const extractHostFromToken = (token: string): string | undefined => {
    try {
      const payload = token.split('.')[1]
      if (!payload) return undefined
      const base64 = payload.replace(/-/g, '+').replace(/_/g, '/') + '==='.slice((payload.length + 3) % 4)
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
    const credentials = Object.fromEntries(formData) as Record<string, string>
    const { token } = credentials
    let host = hostUrl === 'other' ? hostName : hostUrl
    if (!token || (hostUrl === 'other' && !hostName)) return
    const params = new URLSearchParams({ token, host })
    router.push(`?${params.toString()}`)
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col justify-between h-full"
      aria-labelledby="credentials-title"
    >
      <div className="space-y-10">
        <div className="space-y-1">
          <label className="block text-sm font-normal text-neutral-64">
            Token
          </label>
          <TextInput
            name="token"
            placeholder="Paste your 'dashboard' token"
            onChange={handleTokenChange}
          />
          <a
            href="https://cloud.tinybird.co/tokens"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-secondaryLight underline mt-1 inline-block"
          >
            Get your dashboard token
          </a>
        </div>
        <div className="flex items-end gap-10">
          <div className="flex-1">
            <label className="block text-sm font-normal text-neutral-64 mb-1">
              Host
            </label>
            <SelectBox value={hostUrl} onValueChange={value => setHostUrl(value)}>
              {[
                ...regionValues.map((value) => (
                  <SelectBoxItem key={value} text={value} value={value} />
                )),
                <SelectBoxItem key="other" text="Other" value="other" />
              ]}
            </SelectBox>
          </div>
          <div className="flex-1">
            {hostUrl === 'other' && (
              <>
                <label className="block text-sm font-normal text-neutral-64 mb-1">
                  Host name
                </label>
                <TextInput name="hostName" placeholder="Host name" value={hostName} onChange={handleHostNameChange} />
              </>
            )}
          </div>
        </div>
        <div className="flex justify-end">
          <Button type="submit" color="emerald">
            View dashboard
          </Button>
        </div>
      </div>
    </form>
  )
}
