export type Node = {
  id: string
  name: string
  sql: string | null
  dependencies: string[] | null
  params: Parameter[] | null
  node_type:
    | 'standard'
    | 'materialized'
    | 'endpoint'
    | 'copy'
    | 'sink'
    | 'stream'
    | 'timeseries'
  updated_at: string
  created_at: string
  description: string | null
  materialized?: string | null
  tags?: Record<string, string | number | boolean | null>
}

export type ParameterValue = string | number | null

export type Parameter = {
  name: string
  description?: string
  required?: boolean
  type?: string
  default?: ParameterValue
  inheritedPipes?: Pipe[]
  nodes?: string[]
  defaults?: string[]
}

export type Pipe = {
  id: string
  name: string
  description: string | null
  type: 'endpoint' | 'copy' | 'materialized' | 'sink' | 'stream' | 'default'
  created_at: string
  updated_at: string
  nodes?: Node[] | null
  copy_mode?: 'append' | 'replace'
  copy_node?: string
  copy_target_datasource?: string
  schedule?: {
    cron: string | null
    status: 'shutdown' | 'running'
  }
  endpoint?: string | null
  content?: string | null
}

export type QueryData = Record<string, unknown>[]
