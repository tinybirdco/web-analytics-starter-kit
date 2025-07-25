export type ClientResponse<T> = {
  data: T
  meta?: Array<{
    name: string
    type: string
  }>
  rows?: number
  statistics?: {
    elapsed: number
    rows_read: number
    bytes_read: number
  }
  error?: string
}

export type PipeParams<T> = Record<string, string | number | boolean>

export type QueryPipe<T> = ClientResponse<T>

export type QuerySQL<T> = ClientResponse<T>

export class QueryError extends Error {
  constructor(
    message: string,
    public status: number
  ) {
    super(message)
    this.name = 'QueryError'
  }
} 