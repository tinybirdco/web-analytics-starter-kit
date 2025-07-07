'use client'

import { useSearchParams, useRouter } from 'next/navigation'

export default function useParams<T extends string>({
  key,
  defaultValue,
  values,
}: {
  key: string
  defaultValue?: T
  values: T[]
}): [T, (param: T) => void] {
  const searchParams = useSearchParams()
  const router = useRouter()
  const param = searchParams?.get(key) as T
  const value =
    typeof param === 'string' && values.includes(param)
      ? param
      : defaultValue ?? values[0]

  const setParam = (param: T) => {
    const newSearchParams = new URLSearchParams(searchParams?.toString() || '')
    newSearchParams.set(key, param)
    router.push(`?${newSearchParams?.toString() || ''}`, { scroll: false })
  }

  return [value, setParam]
}
