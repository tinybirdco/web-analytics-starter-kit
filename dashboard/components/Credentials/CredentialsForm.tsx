import { FormEvent, useState } from 'react'
import { useRouter } from 'next/router'
import { SelectBox, SelectBoxItem, TextInput, Button } from '@tremor/react'

import { HostType } from '../../lib/types/credentials'
import { OptionType } from '../../lib/types/options'

const hostOptions: OptionType<HostType>[] = [
  { text: HostType.eu_shared, value: HostType.eu_shared },
  { text: HostType.us_east, value: HostType.us_east },
  { text: HostType.aws_us_east, value: HostType.aws_us_east },
  { text: HostType.aws_us_west_2, value: HostType.aws_us_west_2 },
  { text: HostType.aws_eu_central_1, value: HostType.aws_eu_central_1 },
  { text: HostType.aws_eu_west_1, value: HostType.aws_eu_west_1 },
  { text: HostType.gcp_europe_west2, value: HostType.gcp_europe_west2 },
  { text: HostType.gcp_europe_west3, value: HostType.gcp_europe_west3 },
  { text: HostType.gcp_us_east4, value: HostType.gcp_us_east4 },
  { text: HostType.gcp_northamerica_northeast2, value: HostType.gcp_northamerica_northeast2 },
  { text: HostType.other, value: HostType.other },
]

export default function CredentialsForm() {
  const router = useRouter()
  const [hostType, setHostType] = useState<HostType>(hostOptions[0].value)
  const [hostName, setHostName] = useState('')

  // Helper to decode JWT and extract host
  const extractHostFromToken = (token: string): string | undefined => {
    try {
      const payload = token.split('.')[1]
      if (!payload) return undefined
      // Add padding if needed
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
    const host = extractHostFromToken(token)
    if (host) {
      const found = hostOptions.find(opt => opt.value === host)
      if (found) {
        setHostType(host as HostType)
        setHostName('')
      } else {
        setHostType(HostType.other)
        setHostName(host)
      }
    } else {
      setHostType(HostType.other)
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
    let host = hostType === HostType.other ? hostName : hostType
    if (!token || (hostType === HostType.other && !hostName)) return
    const params = new URLSearchParams({ token, host })
    router.push({ pathname: router.pathname, search: params.toString() })
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
            placeholder="p.eyJ3kdsfk2395IjogImMzZTMwNDIxLTYwNzctNGZhMS1iMjY1LWQwM2JhZDIzZGRlOCIsICJpZCI6ICIwYmUzNTgzNi0zODAyLTQwMmUtOTUxZi0zOWFm"
            onChange={handleTokenChange}
          />
          <p className="text-xs text-secondaryLight">
            Copy the token named dashboard generated with your web-analytics
            project.
          </p>
        </div>
        <div className="flex items-end gap-10">
          <div className="flex-1">
            <label className="block text-sm font-normal text-neutral-64 mb-1">
              Host
            </label>
            <SelectBox
              value={hostType}
              onValueChange={value => setHostType(value as HostType)}
            >
              {hostOptions.map(({ text, value }) => (
                <SelectBoxItem key={value} text={text} value={value} />
              ))}
            </SelectBox>
          </div>
          <div className="flex-1">
            {hostType === HostType.other && (
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
