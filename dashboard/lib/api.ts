import fetch from 'cross-fetch'
import { PipeParams, QueryPipe, QuerySQL, QueryError } from './types/api'

export async function queryPipe<T>(
  name: string,
  params: Partial<PipeParams<T>> = {}
): Promise<QueryPipe<T>> {
  const searchParams = new URLSearchParams()
  Object.entries(params).forEach(([key, value]) => {
    if (!value) return
    searchParams.set(key, value as string)
  })

  const response = await fetch(`/api/endpoints/${name}?${searchParams}`)
  const data = await response.json()

  if (!response.ok) {
    throw new QueryError(data?.error ?? 'Something went wrong', response.status)
  }

  return data
}

export async function querySQL<T>(sql: string): Promise<QuerySQL<T>> {
  const response = await fetch('/api/sql', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ sql }),
  })

  const data = await response.json()

  if (!response.ok) {
    throw new QueryError(data?.error ?? 'Something went wrong', response.status)
  }

  return data
}
