'use client'

import { useDomains } from '@/lib/hooks/use-domains'
import useDomain from '@/lib/hooks/use-domain'
import {
  SelectContent,
  SelectItem,
  SelectRoot,
  SelectTrigger,
  SelectValue
} from './Select'
import { useSearchParams, useRouter } from 'next/navigation'
import { Text } from './Text'

export function DomainSelect({ className, style }: { className?: string, style?: React.CSSProperties }) {
  const { domains, isLoading } = useDomains()
  const { domain: fallbackDomain } = useDomain()
  const searchParams = useSearchParams()
  const router = useRouter()
  const domain = searchParams.get('domain') || 'ALL'

  let options = [
    { value: 'ALL', label: 'All domains' },
    ...(domains?.filter(d => d.domain !== '').map(d => ({ value: d.domain, label: d.domain })) ?? [])
  ]

  const handleChange = (newDomain: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (newDomain === 'ALL') {
      params.delete('domain')
    } else {
      params.set('domain', newDomain)
    }
    router.replace(`?${params.toString()}`)
  }

  if (isLoading) {
    return <span className="block text-xs font-medium text-[var(--text-02-color)] mb-1">Loading domains...</span>
  }
  if (
    (!domains || domains.length === 0)
    || (domains && domains.length === 1 && domains[0].domain === '')
  ) {
    if (fallbackDomain && fallbackDomain !== 'domain.com') {
      return <Text variant="displaymedium" className="tracking-tight">
        <span className="ml-2 text-[var(--text-02-color)]">
          https://{fallbackDomain}
        </span>
      </Text>
    }
  }
  if (options.length === 1) {
    return <span className="block text-xs font-medium text-[var(--text-02-color)] mb-1">No domains found</span>
  }

  return (
    <SelectRoot value={domain} onValueChange={handleChange}>
      <SelectTrigger className={className} style={{ minWidth: 220, ...style }}>
        <SelectValue placeholder="Select domain" />
      </SelectTrigger>
      <SelectContent sideOffset={8}>
        {options.map(option => (
          <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
        ))}
      </SelectContent>
    </SelectRoot>
  )
} 