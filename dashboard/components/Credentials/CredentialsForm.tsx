import { FormEvent, useState } from 'react'
import { useRouter } from 'next/router'

import Input from '../Input'
import Button from '../Button'
import Select from '../Select'
import { HostType } from '../../lib/types/credentials'
import { OptionType } from '../../lib/types/options'

const hostOptions: OptionType<HostType>[] = [
  { label: HostType.Eu, value: HostType.Eu },
  { label: HostType.Us, value: HostType.Us },
  { label: 'Other', value: HostType.Other },
]
export default function CredentialsForm() {
  const router = useRouter()
  const [hostType, setHostType] = useState<HostType>(hostOptions[0].value)

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const form = event.currentTarget
    const formData = new FormData(form)
    const credentials = Object.fromEntries(formData) as Record<string, string>
    const { token, hostName } = credentials
    if (!token || (hostType === HostType.Other && !hostName)) return
    const host = hostType === HostType.Other ? hostName : hostType
    const params = new URLSearchParams({ token, host })
    router.push({ pathname: router.pathname, search: params.toString() })
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col justify-between h-full"
    >
      <div className="space-y-10">
        <Input
          label="Token"
          id="token"
          name="token"
          helperMessage="Copy the token named dashboard generated with your web-analytics project."
          placeholder="p.eyJ3kdsfk2395IjogImMzZTMwNDIxLTYwNzctNGZhMS1iMjY1LWQwM2JhZDIzZGRlOCIsICJpZCI6ICIwYmUzNTgzNi0zODAyLTQwMmUtOTUxZi0zOWFm"
        />
        <div className="flex items-end gap-10">
          <div className="flex-1">
            <Select
              label="Host"
              id="hostType"
              value={hostType}
              options={hostOptions}
              onChange={setHostType}
            />
          </div>
          <div className="flex-1">
            {hostType === HostType.Other && (
              <Input
                id="hostName"
                name="hostName"
                placeholder="Host name"
                label="Host name"
                isSrLabel
              />
            )}
          </div>
        </div>
        <div className="flex justify-end">
          <Button type="submit">View dashboard</Button>
        </div>
      </div>
    </form>
  )
}
